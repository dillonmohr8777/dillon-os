'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath } = require('../lib/fsutil');
const {
  runHeartbeat,
  canonicalResult,
  renderManifest,
  collectLiveInput,
  isPathLikeOutput,
  extractCommandPath,
  exitCodeFor,
} = require('../lib/heartbeat');
const { stripComments, scanEntry, classifyModule } = require('../lib/heartbeat-scan');

const FIXTURES = repoPath('_os/automation/fixtures/heartbeat');
const BIN = repoPath('_os/automation/bin/heartbeat.js');
const SCHEMA = JSON.parse(fs.readFileSync(repoPath('12_Brain/schemas/heartbeat-finding.json'), 'utf8'));

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, `${name}.json`), 'utf8'));
}

function codes(result, severity) {
  return result.findings
    .filter((finding) => !severity || finding.severity === severity)
    .map((finding) => finding.code);
}

function byCode(result, code) {
  return result.findings.filter((finding) => finding.code === code);
}

test('clean fixture is ok with no findings and exit 0', () => {
  const result = runHeartbeat(loadFixture('clean'));
  assert.equal(result.status, 'ok');
  assert.equal(result.counts.critical, 0);
  assert.equal(result.counts.advisory, 0);
  assert.equal(result.findings.length, 0);
  assert.equal(exitCodeFor(result), 0);
});

test('expired claim is critical while a near-due one only warns', () => {
  const result = runHeartbeat(loadFixture('stale-evidence'));
  assert.equal(result.status, 'fail');
  assert.equal(exitCodeFor(result), 2);
  const expired = byCode(result, 'expired-evidence');
  const near = byCode(result, 'near-expiry');
  assert.equal(expired.length, 1);
  assert.equal(expired[0].severity, 'critical');
  assert.match(expired[0].subject, /stale-playbook/);
  assert.equal(near.length, 1);
  assert.equal(near[0].severity, 'warn');
  assert.equal(near[0].lane, 'advisory');
});

test('shadow duplicates stay nonblocking', () => {
  const result = runHeartbeat(loadFixture('duplicate-definitions'));
  assert.equal(result.status, 'advisory');
  assert.equal(exitCodeFor(result), 0);
  const shadows = byCode(result, 'shadow-duplicate');
  assert.equal(shadows.length, 1);
  assert.equal(shadows[0].severity, 'info');
  assert.equal(result.counts.critical, 0);
});

test('PAUSED unregistered routine is not flagged while an ACTIVE one is', () => {
  const result = runHeartbeat(loadFixture('missing-registration'));
  const missing = byCode(result, 'missing-registration');
  assert.equal(missing.length, 1);
  assert.equal(missing[0].subject, 'orphan-active');
  assert.equal(missing[0].severity, 'critical');
  assert.ok(!missing.some((finding) => finding.subject === 'orphan-paused'));
  assert.ok(!result.findings.some((finding) => /orphan-paused/.test(finding.subject)));
});

test('honestly-declared tier-2 deploy stays silent', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  assert.ok(!result.findings.some((finding) => finding.subject === 'honest-deploy.js'));
  assert.ok(!result.findings.some((finding) => finding.subject === 'honest-deploy'));
});

test('unregistered git push is a live critical and names the binary in next_action', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  const hits = byCode(result, 'unregistered-external-action');
  const morning = hits.find((finding) => finding.subject === 'radar-morning.ps1');
  assert.ok(morning, `expected radar-morning.ps1 in ${hits.map((f) => f.subject).join(',')}`);
  assert.equal(morning.severity, 'critical');
  assert.equal(morning.live, true);
  assert.equal(morning.registered, false);
  assert.match(result.next_action, /radar-morning\.ps1/);
  assert.doesNotMatch(result.next_action, /Register \*\*it\*\*|Register it\b/i);
  assert.equal(morning.id, 'external_action:unregistered-external-radar-morning-ps1');
});

test('token-blocked unregistered deploy is critical but ranks below the live pusher', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  const hits = byCode(result, 'unregistered-external-action');
  const morning = hits.find((finding) => finding.subject === 'radar-morning.ps1');
  const arch = hits.find((finding) => finding.subject === 'arch-deploy.js');
  assert.ok(morning);
  assert.ok(arch);
  assert.equal(arch.token_blocked, true);
  assert.equal(arch.live, false);
  assert.ok(morning.priority > arch.priority, `${morning.priority} !> ${arch.priority}`);
  assert.equal(result.findings[0].subject, 'radar-morning.ps1');
});

test('POST is an advisory classification, not a mutation', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  const outbound = byCode(result, 'unclassified-outbound');
  assert.ok(outbound.some((finding) => finding.subject === 'read-search.js'));
  assert.equal(outbound[0].severity, 'info');
  assert.ok(!result.findings.some(
    (finding) => finding.subject === 'read-search.js' && finding.severity === 'critical',
  ));
});

test('a sibling that only shares the HTTP helper does not inherit another module POST', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  assert.ok(!result.findings.some((finding) => finding.subject === 'sibling-read.js'));
  const readSearch = result.capabilities['_os/automation/bin/read-search.js'];
  const sibling = result.capabilities['_os/automation/bin/sibling-read.js'];
  assert.ok(readSearch.unclassified_outbound.length >= 1);
  assert.equal(sibling.unclassified_outbound.length, 0);
  assert.equal(sibling.external_action, false);
});

test('blocked registry entries are not chased for missing command files', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  assert.ok(!result.findings.some((finding) => finding.code === 'missing-command'));
  assert.ok(!result.findings.some((finding) => finding.subject === 'blocked-build'));
});

test('prose declared outputs are not missing-output findings', () => {
  assert.equal(isPathLikeOutput('structured doctor result'), false);
  assert.equal(isPathLikeOutput('ephemeral cited documentation context'), false);
  assert.equal(isPathLikeOutput('12_Brain/state/pulse.json'), true);
  const result = runHeartbeat(loadFixture('duplicate-definitions'));
  assert.ok(!result.findings.some((finding) => finding.code === 'missing-output'));
});

test('home path in evidence is redacted', () => {
  const input = loadFixture('stale-evidence');
  input.evidence[0].evidence = 'ran from C:\\Users\\ExampleUser\\codex-wt\\note.md';
  const result = runHeartbeat(input);
  const expired = byCode(result, 'expired-evidence')[0];
  assert.match(expired.evidence, /\[redacted:private_abs_win\]/);
  assert.doesNotMatch(expired.evidence, /C:\\Users\\ExampleUser/);
  assert.doesNotMatch(JSON.stringify(result.findings), /C:\\\\Users\\\\ExampleUser/);
});

test('two runs are byte-identical and reversing input order does not change finding order', () => {
  const fixture = loadFixture('unregistered-external-action');
  const a = canonicalResult(runHeartbeat(fixture));
  const b = canonicalResult(runHeartbeat(fixture));
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  const reversed = {
    ...fixture,
    commands: [...fixture.commands].reverse(),
    definitions: [...(fixture.definitions || [])].reverse(),
    evidence: [...fixture.evidence].reverse(),
  };
  const c = canonicalResult(runHeartbeat(reversed));
  assert.deepEqual(c.findings.map((finding) => finding.id), a.findings.map((finding) => finding.id));
});

test('comments mentioning deploy or git push do not classify a read-only module', () => {
  const source = [
    '// this deploys to production and will git push',
    '/* never POST real user data */',
    'module.exports = { ok: true };',
    '',
  ].join('\n');
  const stripped = stripComments(source, 'js');
  assert.doesNotMatch(stripped, /git push/);
  assert.doesNotMatch(stripped, /deploys to production/);
  const facts = classifyModule(source, '_os/automation/bin/docs-only.js');
  assert.deepEqual(facts, []);
});

test('schema required keys hold on every finding', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  assert.ok(result.findings.length >= 1);
  for (const finding of result.findings) {
    for (const key of SCHEMA.required) {
      assert.ok(finding[key] !== undefined && finding[key] !== null, `missing ${key} on ${finding.id}`);
    }
    assert.ok(['critical', 'warn', 'info'].includes(finding.severity));
    assert.ok(['critical', 'advisory'].includes(finding.lane));
    assert.equal(typeof finding.priority, 'number');
  }
});

test('manifest next action names the subject, not a pronoun', () => {
  const result = runHeartbeat(loadFixture('unregistered-external-action'));
  const md = renderManifest(result);
  assert.match(md, /radar-morning\.ps1/);
  assert.doesNotMatch(md, /Register \*\*it\*\*/);
  assert.match(md, /^# Heartbeat manifest/m);
});

test('extractCommandPath reads node, powershell, and template paths', () => {
  assert.equal(
    extractCommandPath('node _os/automation/bin/frontmatter-validate.js'),
    '_os/automation/bin/frontmatter-validate.js',
  );
  assert.equal(
    extractCommandPath('& _os/dev/bin/dillon-dev.ps1 doctor'),
    '_os/dev/bin/dillon-dev.ps1',
  );
  assert.equal(
    extractCommandPath('node _templates/site-factory/build-batch.js <batch-dir>'),
    '_templates/site-factory/build-batch.js',
  );
});

test('CLI clean fixture exits 0', () => {
  const spawned = spawnSync(
    process.execPath,
    [BIN, '--input', path.join(FIXTURES, 'clean.json'), '--no-write', '--json'],
    { encoding: 'utf8' },
  );
  assert.equal(spawned.status, 0, spawned.stderr);
  const payload = JSON.parse(spawned.stdout);
  assert.equal(payload.status, 'ok');
});

test('CLI unresolved critical exits 2', () => {
  const spawned = spawnSync(
    process.execPath,
    [BIN, '--input', path.join(FIXTURES, 'stale-evidence.json'), '--no-write'],
    { encoding: 'utf8' },
  );
  assert.equal(spawned.status, 2, spawned.stderr);
  assert.match(spawned.stdout, /status fail/);
});

test('CLI advisory-only exits 0', () => {
  const spawned = spawnSync(
    process.execPath,
    [BIN, '--input', path.join(FIXTURES, 'duplicate-definitions.json'), '--no-write'],
    { encoding: 'utf8' },
  );
  assert.equal(spawned.status, 0, spawned.stderr);
});

test('CLI crash on missing input exits 1', () => {
  const spawned = spawnSync(
    process.execPath,
    [BIN, '--input', path.join(FIXTURES, 'does-not-exist.json'), '--no-write'],
    { encoding: 'utf8' },
  );
  assert.equal(spawned.status, 1);
  assert.match(spawned.stderr, /not found/);
});

test('CLI --as-of pins the replay date', () => {
  const spawned = spawnSync(
    process.execPath,
    [
      BIN,
      '--input', path.join(FIXTURES, 'stale-evidence.json'),
      '--as-of', '2026-07-15',
      '--no-write',
      '--json',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(spawned.status, 0, spawned.stderr);
  const payload = JSON.parse(spawned.stdout);
  assert.equal(payload.as_of, '2026-07-15');
  assert.ok(!payload.findings.some((finding) => finding.code === 'expired-evidence'));
});

test('live capability outranks a blocked one when both are unregistered pushers', () => {
  const input = loadFixture('unregistered-external-action');
  const result = runHeartbeat(input);
  const critical = result.findings.filter((finding) => finding.severity === 'critical');
  assert.ok(critical.length >= 2);
  assert.equal(critical[0].subject, 'radar-morning.ps1');
  assert.ok(critical[0].priority > critical[1].priority);
});

test('in-memory scanner does not need a real binary on disk', () => {
  const cap = scanEntry('_os/automation/bin/made-up-push.ps1', {
    sources: {
      '_os/automation/bin/made-up-push.ps1': 'git push origin main\n',
    },
    exists: () => false,
  });
  assert.equal(cap.external_action, true);
  assert.ok(cap.mutations.some((fact) => fact.id === 'git-push'));
});

test('--no-write leaves heartbeat state unwritten when the file is absent', () => {
  const state = repoPath('12_Brain/state/heartbeat.json');
  const existed = fs.existsSync(state);
  const spawned = spawnSync(
    process.execPath,
    [BIN, '--input', path.join(FIXTURES, 'clean.json'), '--no-write', '--json'],
    { encoding: 'utf8' },
  );
  assert.equal(spawned.status, 0);
  if (!existed) assert.equal(fs.existsSync(state), false);
});

test('collectLiveInput sees automation bins and workflows', () => {
  const input = collectLiveInput({ asOf: '2026-08-17', includeWorkflows: true });
  assert.equal(input.as_of, '2026-08-17');
  assert.ok(input.commands.some((command) => command.path.endsWith('radar-morning.ps1')));
  assert.ok(input.commands.some((command) => command.path.endsWith('arch-deploy.js')));
  assert.ok(input.definitions.some((def) => def.id === 'radar-daily'));
  assert.ok(input.registry.automations.length >= 1);
});

test('real radar-morning.ps1 is a live git push; arch-deploy is a Netlify mutation', () => {
  const morning = scanEntry(repoPath('_os/automation/bin/radar-morning.ps1'));
  assert.equal(morning.external_action, true);
  assert.ok(morning.mutations.some((fact) => fact.id === 'git-push'));
  const arch = scanEntry(repoPath('_os/automation/bin/arch-deploy.js'));
  assert.equal(arch.external_action, true);
  assert.ok(arch.mutations.some((fact) => fact.id.startsWith('netlify-')));
  const discover = scanEntry(repoPath('_os/automation/bin/discover-prospects.js'));
  assert.equal(discover.external_action, false);
  assert.ok(discover.unclassified_outbound.length >= 1);
});

test('named sanitizeForGit import does not inherit a sibling POST in the same module', () => {
  const sources = {
    '_os/automation/lib/discovery.js': [
      "function sanitizeForGit(row) { return row; }",
      "async function runOverpass() { return fetch('https://overpass.example', { method: 'POST', body: 'q' }); }",
      'module.exports = { sanitizeForGit, runOverpass };',
      '',
    ].join('\n'),
    '_os/automation/lib/radar.js': "const { sanitizeForGit } = require('./discovery');\nmodule.exports = { load() { return sanitizeForGit({}); } };\n",
    '_os/automation/bin/image-briefs.js': "const radar = require('../lib/radar');\nmodule.exports = radar;\n",
    '_os/automation/bin/discover-prospects.js': "const { runOverpass } = require('../lib/discovery');\nmodule.exports = { runOverpass };\n",
  };
  const opts = { sources, exists: (file) => Object.prototype.hasOwnProperty.call(sources, file.replace(/\\/g, '/')) };
  const briefs = scanEntry('_os/automation/bin/image-briefs.js', opts);
  const discover = scanEntry('_os/automation/bin/discover-prospects.js', opts);
  assert.equal(briefs.unclassified_outbound.length, 0, `briefs leaked ${JSON.stringify(briefs.unclassified_outbound)}`);
  assert.ok(discover.unclassified_outbound.length >= 1);
});

test('dillon-dev.ps1 resolves outside _os/automation/bin', () => {
  assert.equal(
    extractCommandPath('& _os/dev/bin/dillon-dev.ps1 <doctor|verify>'),
    '_os/dev/bin/dillon-dev.ps1',
  );
  const live = collectLiveInput({ asOf: '2026-08-17' });
  assert.equal(live.files['_os/dev/bin/dillon-dev.ps1'], true);
});

test('live estate has no unresolved criticals after registration', () => {
  const result = runHeartbeat(collectLiveInput({ asOf: '2026-08-17' }));
  const critical = result.findings.filter((finding) => finding.severity === 'critical');
  assert.equal(
    critical.length,
    0,
    critical.map((finding) => `${finding.code}:${finding.subject}`).join(', '),
  );
  assert.equal(exitCodeFor(result), 0);
});
