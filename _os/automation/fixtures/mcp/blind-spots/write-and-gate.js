'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { CANDIDATES } = require('./candidates');

const dir = __dirname;
const gate = path.resolve(__dirname, '../../../bin/mcp-gate.js');

function writeFixtures() {
  for (const candidate of CANDIDATES) {
    const { inspect, ...rest } = candidate;
    rest.maintenance = rest.maintenance || {
      last_release: 'Official docs fetched 2026-08-16',
      review_cadence: 'quarterly',
    };
    const file = path.join(dir, `${candidate.id}.json`);
    fs.writeFileSync(file, JSON.stringify(rest, null, 2) + '\n');
  }
}

function runGate() {
  const results = [];
  for (const candidate of CANDIDATES) {
    const file = path.join(dir, `${candidate.id}.json`);
    const args = [gate, '--from', file];
    if (candidate.inspect) args.push('--inspect', '--timeout-ms', '120000');
    const proc = spawnSync(process.execPath, args, {
      encoding: 'utf8',
      timeout: 180000,
    });
    let parsed = null;
    try {
      parsed = JSON.parse(proc.stdout);
    } catch {
      parsed = { parse_error: true, stdout: proc.stdout.slice(0, 500), stderr: proc.stderr.slice(0, 500) };
    }
    const verdict = parsed.evaluation?.verdict || (parsed.parse_error ? 'parse_error' : 'unknown');
    results.push({
      id: candidate.id,
      inspect: Boolean(candidate.inspect),
      status: proc.status,
      verdict,
      accepted: parsed.evaluation?.accepted,
      pending: parsed.evaluation?.pending_tests,
      failed: parsed.evaluation?.failed_tests,
      inspector_ok: parsed.inspector ? parsed.inspector.ok : null,
    });
    console.log(JSON.stringify(results[results.length - 1]));
  }
  return results;
}

writeFixtures();
if (process.argv.includes('--gate')) {
  const results = runGate();
  const bad = results.filter((row) => row.verdict === 'reject' || row.verdict === 'parse_error' || row.verdict === 'unknown');
  fs.writeFileSync('/tmp/mcp-blind-spot-gate-summary.json', JSON.stringify(results, null, 2) + '\n');
  if (bad.length) {
    console.error('reject', bad);
    process.exit(1);
  }
}
