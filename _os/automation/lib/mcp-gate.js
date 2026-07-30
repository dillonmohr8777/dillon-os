'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  repoPath,
  ensureDir,
  writeJson,
  nowISO,
  slugify,
} = require('./fsutil');
const { enqueue } = require('./registry');

const REQUIRED_TESTS = [
  'source_review',
  'inspector',
  'permission_review',
  'prompt_injection',
  'overlap_review',
];

function validateCandidate(candidate) {
  const errors = [];
  for (const key of ['id', 'name', 'source_url', 'maintainer', 'license', 'transport', 'overlap', 'rollback']) {
    if (!String(candidate?.[key] || '').trim()) errors.push(`${key} is required`);
  }
  for (const key of ['tools', 'permissions', 'network_destinations', 'secret_requirements']) {
    if (!Array.isArray(candidate?.[key])) errors.push(`${key} must be an array`);
  }
  if (!candidate?.tests || typeof candidate.tests !== 'object') errors.push('tests object is required');
  for (const test of REQUIRED_TESTS) {
    const status = candidate?.tests?.[test]?.status;
    if (!['pass', 'fail', 'pending'].includes(status)) errors.push(`tests.${test}.status must be pass, fail, or pending`);
  }
  return { ok: errors.length === 0, errors };
}

function riskFindings(candidate) {
  const findings = [];
  const permissions = (candidate.permissions || []).map((item) => String(item).toLowerCase());
  const destinations = candidate.network_destinations || [];
  const secrets = candidate.secret_requirements || [];
  if (permissions.some((permission) => permission.includes('*') || permission.includes('all files') || permission.includes('full access'))) {
    findings.push({ severity: 'critical', code: 'broad-permission', detail: 'Candidate requests wildcard or full-access permissions.' });
  }
  if (destinations.some((destination) => !String(destination).startsWith('https://'))) {
    findings.push({ severity: 'high', code: 'non-https-destination', detail: 'A network destination is not HTTPS.' });
  }
  if (String(candidate.license).toLowerCase() === 'unknown') {
    findings.push({ severity: 'high', code: 'unknown-license', detail: 'License is unknown.' });
  }
  if (secrets.length) {
    findings.push({ severity: 'medium', code: 'secret-scope', detail: `Candidate requires ${secrets.length} secret or OAuth scope(s).` });
  }
  if (!candidate.maintenance?.last_release && !candidate.maintenance?.last_commit) {
    findings.push({ severity: 'medium', code: 'maintenance-unknown', detail: 'Maintenance freshness is not recorded.' });
  }
  return findings;
}

function evaluateCandidate(candidate) {
  const validation = validateCandidate(candidate);
  if (!validation.ok) {
    return {
      verdict: 'reject',
      accepted: false,
      errors: validation.errors,
      findings: [],
      pending_tests: REQUIRED_TESTS,
      failed_tests: [],
    };
  }
  const findings = riskFindings(candidate);
  const failedTests = REQUIRED_TESTS.filter((test) => candidate.tests[test].status === 'fail');
  const pendingTests = REQUIRED_TESTS.filter((test) => candidate.tests[test].status === 'pending');
  const critical = findings.some((finding) => finding.severity === 'critical');
  const verdict = failedTests.length || critical ? 'reject' : pendingTests.length ? 'sandbox-only' : 'accept';
  return {
    verdict,
    accepted: verdict === 'accept',
    errors: [],
    findings,
    pending_tests: pendingTests,
    failed_tests: failedTests,
  };
}

function inspectorCommand(candidate, options = {}) {
  const packageName = '@modelcontextprotocol/inspector@1.0.0';
  const args = ['-y', packageName, '--cli'];
  if (options.config) {
    args.push('--config', path.resolve(options.config));
    if (!options.server) throw new Error('--server is required with --config');
    args.push('--server', options.server);
  } else if (candidate.remote_url) {
    args.push(candidate.remote_url, '--transport', 'http');
  } else {
    throw new Error('Candidate needs remote_url, or pass --config and --server');
  }
  args.push('--method', 'tools/list');
  const npxCli = process.platform === 'win32'
    ? path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js')
    : null;
  return {
    command: npxCli && fs.existsSync(npxCli) ? process.execPath : 'npx',
    args: npxCli && fs.existsSync(npxCli) ? [npxCli, ...args] : args,
    package: packageName,
  };
}

function runInspector(candidate, options = {}) {
  const command = inspectorCommand(candidate, options);
  const result = spawnSync(command.command, command.args, {
    cwd: repoPath(),
    encoding: 'utf8',
    timeout: Number(options.timeout_ms || 120000),
    windowsHide: true,
    env: {
      ...process.env,
      MCP_AUTO_OPEN_ENABLED: 'false',
    },
  });
  const combined = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    package: command.package,
    command_shape: options.config ? 'config tools/list' : 'remote-http tools/list',
    output_excerpt: combined.slice(0, 12000),
    error: result.error ? result.error.message : null,
  };
}

function renderReport(candidate, evaluation, inspector) {
  const tests = REQUIRED_TESTS.map((test) => `- ${candidate.tests[test].status === 'pass' ? 'PASS' : candidate.tests[test].status === 'fail' ? 'FAIL' : 'PENDING'} - **${test}**: ${candidate.tests[test].evidence || 'No evidence recorded.'}`).join('\n');
  const findings = evaluation.findings.length
    ? evaluation.findings.map((finding) => `- **${finding.severity}** ${finding.code}: ${finding.detail}`).join('\n')
    : '- No additional policy findings.';
  return `---
note_type: review
status: ${evaluation.accepted ? 'done' : 'active'}
created: ${nowISO().slice(0, 10)}
updated: ${nowISO().slice(0, 10)}
owner: Dillon Mohr
verification_status: ${evaluation.accepted ? 'verified' : evaluation.verdict === 'reject' ? 'disputed' : 'partial'}
source_refs:
  - "${candidate.source_url}"
tags:
  - brain
  - review
  - mcp
  - security
---

# MCP acceptance - ${candidate.name}

## Verdict

**${evaluation.verdict.toUpperCase()}**

This verdict controls connection eligibility. It does not authorize an account,
secret, installation, or external action.

## Candidate

- ID: ${candidate.id}
- Maintainer: ${candidate.maintainer}
- License: ${candidate.license}
- Transport: ${candidate.transport}
- Source: ${candidate.source_url}
- Remote endpoint: ${candidate.remote_url || 'not supplied'}
- Overlap: ${candidate.overlap}
- Rollback: ${candidate.rollback}

## Declared surface

- Tools: ${(candidate.tools || []).join(', ') || 'none declared'}
- Permissions: ${(candidate.permissions || []).join(', ') || 'none declared'}
- Network destinations: ${(candidate.network_destinations || []).join(', ') || 'none declared'}
- Secret requirements: ${(candidate.secret_requirements || []).join(', ') || 'none'}

## Acceptance tests

${tests}

## Policy findings

${findings}

## Inspector

${inspector
    ? `- Package: ${inspector.package}
- Command shape: ${inspector.command_shape}
- Result: ${inspector.ok ? 'PASS' : 'FAIL'}
- Exit status: ${inspector.status}

\`\`\`text
${inspector.output_excerpt || inspector.error || 'No output'}
\`\`\``
    : 'Inspector was not executed in this policy pass.'}
`;
}

function writeMcpReview(candidate, options = {}) {
  let inspector = null;
  if (options.inspect) {
    inspector = runInspector(candidate, options);
    candidate = JSON.parse(JSON.stringify(candidate));
    candidate.tests.inspector = {
      status: inspector.ok ? 'pass' : 'fail',
      evidence: inspector.ok
        ? `${inspector.package} tools/list completed successfully.`
        : `${inspector.package} tools/list failed: ${inspector.error || inspector.output_excerpt.slice(0, 300)}`,
    };
  }
  const evaluation = evaluateCandidate(candidate);
  const baseName = `${nowISO().slice(0, 10)} - ${slugify(candidate.name || candidate.id || 'candidate')}`;
  const reviewDir = repoPath('12_Brain/07_Reviews/MCP');
  ensureDir(reviewDir);
  const jsonFile = path.join(reviewDir, `${baseName}.json`);
  const mdFile = path.join(reviewDir, `${baseName}.md`);
  writeJson(jsonFile, { candidate, evaluation, inspector, evaluated_at: nowISO() });
  fs.writeFileSync(mdFile, renderReport(candidate, evaluation, inspector), 'utf8');
  enqueue('mcp-acceptance-gate', 'evaluated', {
    candidate_id: candidate.id,
    verdict: evaluation.verdict,
    report: path.relative(repoPath(), mdFile),
  });
  return {
    candidate,
    evaluation,
    inspector,
    artifacts: {
      json: path.relative(repoPath(), jsonFile),
      markdown: path.relative(repoPath(), mdFile),
    },
  };
}

module.exports = {
  REQUIRED_TESTS,
  validateCandidate,
  evaluateCandidate,
  runInspector,
  writeMcpReview,
};
