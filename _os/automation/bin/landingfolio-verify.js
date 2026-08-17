#!/usr/bin/env node
'use strict';

/**
 * Completes the Inspector check for the LandingFolio MCP candidate.
 *
 * The endpoint is token-gated, so `mcp-gate.js --inspect` cannot probe it from the
 * candidate record alone (candidates are forbidden from carrying credentials). This
 * wrapper resolves LANDINGFOLIO_TOKEN into a short-lived config outside the repo,
 * hands that config to the pinned Inspector, and deletes it again.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { writeMcpReview } = require('../lib/mcp-gate');
const { repoPath } = require('../lib/fsutil');
const { scanText } = require('../../public-safety');

const CANDIDATE = '_os/automation/fixtures/mcp/landingfolio-candidate.json';
const REVIEW_DIR = '12_Brain/07_Reviews/MCP';
const SERVER_NAME = 'landingfolio';

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function readToken() {
  const token = String(process.env.LANDINGFOLIO_TOKEN || '').trim();
  if (!token) {
    throw new Error(
      'LANDINGFOLIO_TOKEN is not set. Mint a free token at https://www.landingfolio.com/mcp, '
      + 'export it in your environment, then re-run. The token is never written to this repository.',
    );
  }
  return token;
}

/**
 * Confirm the credential before the Inspector runs.
 *
 * A rejected token makes `tools/list` fail, which the gate would record as a failed
 * Inspector check and therefore a REJECT verdict. That would read as a security
 * finding when it is only a bad credential, so fail here instead.
 */
async function preflight(candidate, token) {
  const response = await fetch(candidate.remote_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'dillon-os-mcp-gate', version: '1.0' },
      },
    }),
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  if (response.status === 401 || response.status === 403 || /"code"\s*:\s*-32001/.test(body)) {
    throw new Error(
      `LANDINGFOLIO_TOKEN was rejected by ${candidate.remote_url} (HTTP ${response.status}). `
      + 'Check the token in your LandingFolio dashboard and re-run. No review was written.',
    );
  }
  if (!response.ok) {
    throw new Error(`${candidate.remote_url} returned HTTP ${response.status}. No review was written.`);
  }
}

function writeResolvedConfig(candidate, token) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dillon-mcp-'));
  const file = path.join(dir, 'inspector-config.json');
  const config = {
    mcpServers: {
      [SERVER_NAME]: {
        type: 'streamable-http',
        url: candidate.remote_url,
        headers: { Authorization: `Bearer ${token}` },
      },
    },
  };
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  return { dir, file };
}

/** The review is written into the public 12_Brain tree, so it must survive the public-safety scan. */
function auditArtifacts(artifacts, token) {
  const problems = [];
  for (const rel of Object.values(artifacts)) {
    const text = fs.readFileSync(repoPath(rel), 'utf8');
    if (text.includes(token)) problems.push(`${rel} contains the raw token`);
    for (const hit of scanText(text)) {
      problems.push(`${rel} trips public-safety rule ${hit.id} (${hit.count})`);
    }
  }
  return problems;
}

function snapshotReviews() {
  const dir = repoPath(REVIEW_DIR);
  const before = new Map();
  if (!fs.existsSync(dir)) return before;
  for (const name of fs.readdirSync(dir)) {
    before.set(name, fs.readFileSync(path.join(dir, name)));
  }
  return before;
}

/** Never leave an unpublishable review sitting in the working tree. */
function restoreReviews(before) {
  const dir = repoPath(REVIEW_DIR);
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (!before.has(name)) fs.rmSync(abs, { force: true });
    else fs.writeFileSync(abs, before.get(name));
  }
}

async function main() {
  const token = readToken();
  const candidate = JSON.parse(fs.readFileSync(repoPath(CANDIDATE), 'utf8'));
  await preflight(candidate, token);
  const priorReviews = snapshotReviews();
  const resolved = writeResolvedConfig(candidate, token);
  let result;
  try {
    result = writeMcpReview(candidate, {
      inspect: true,
      config: resolved.file,
      server: SERVER_NAME,
      timeout_ms: Number(argValue('--timeout-ms') || 120000),
    });
  } finally {
    fs.rmSync(resolved.dir, { recursive: true, force: true });
  }

  const problems = auditArtifacts(result.artifacts, token);
  if (problems.length) restoreReviews(priorReviews);
  console.log(JSON.stringify({
    verdict: result.evaluation.verdict,
    pending_tests: result.evaluation.pending_tests,
    failed_tests: result.evaluation.failed_tests,
    findings: result.evaluation.findings,
    inspector_ok: Boolean(result.inspector && result.inspector.ok),
    artifacts: problems.length ? 'rolled back' : result.artifacts,
    public_safety: problems.length ? problems : 'clean',
  }, null, 2));

  if (problems.length) {
    console.error('Inspector output was not safe for a public repository; the review was rolled back and nothing was written.');
    process.exitCode = 1;
    return;
  }
  if (!result.evaluation.accepted) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
