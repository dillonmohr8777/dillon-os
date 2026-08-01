'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('node:child_process');
const {
  REPO_ROOT,
  buildResearchPrompt,
  buildXaiProfile,
  createCreativeManifest,
  renderEvidenceMarkdown,
  resolveRepoPath,
  scanFreshness,
  validateCreativeManifest,
  validateEvidencePacket,
  validateWatchlist,
  writeCreativeManifest,
  writeEvidenceMarkdown,
} = require('../lib/marketing-os');

const FIXTURES = path.join(REPO_ROOT, '_os/automation/fixtures/marketing-os');

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

test('watchlist requires opaque client scope and bounded inputs', () => {
  const valid = validateWatchlist(fixture('watchlist.json'));
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.value.x_handles, ['@hvacinsider', '@energystar']);

  const invalid = fixture('watchlist.json');
  invalid.client_id = 'Client Name';
  invalid.x_handles = ['@Same', 'same'];
  invalid.search_budgets.max_x_search_calls = 21;
  const checked = validateWatchlist(invalid);
  assert.equal(checked.ok, false);
  assert.ok(checked.errors.some((error) => error.includes('opaque')));
  assert.ok(checked.errors.includes('x_handles must not contain duplicates'));
  assert.ok(checked.errors.some((error) => error.includes('1-20')));
});

test('watchlist enforces handle and keyword cardinality', () => {
  const noHandles = fixture('watchlist.json');
  noHandles.x_handles = [];
  assert.equal(validateWatchlist(noHandles).ok, false);
  const tooMany = fixture('watchlist.json');
  tooMany.narrative_keywords = Array.from({ length: 31 }, (_, index) => `term ${index}`);
  assert.equal(validateWatchlist(tooMany).ok, false);
});

test('research prompt contains evidence, ranking, packet, and safety requirements', () => {
  const prompt = buildResearchPrompt(fixture('watchlist.json'));
  assert.match(prompt, /engagement and freshness/i);
  assert.match(prompt, /URL, publication date, observed engagement or other metric/i);
  assert.match(prompt, /authoritative-web verification/i);
  assert.match(prompt, /verified, partial, unverified, disputed/);
  assert.match(prompt, /content_brief/);
  assert.match(prompt, /schema_suggestions only when extractability\.exists is true/);
  assert.match(prompt, /sales_bullets/);
  assert.match(prompt, /client_alert/);
  assert.match(prompt, /Do not publish, send, deploy, update a CRM/);
  assert.match(prompt, /at most 8 X searches and 3 web searches/);
});

test('watchlist compiles to a bounded xAI client packet profile', () => {
  const profile = buildXaiProfile(fixture('watchlist.json'));
  assert.equal(profile.prompt_contract, 'client-marketing-packet-v1');
  assert.equal(profile.client_watchlist.client_id, 'cl_87a6c6799c6cefd6');
  assert.deepEqual(profile.allowed_x_handles, ['hvacinsider', 'energystar']);
  assert.equal(profile.max_x_search_calls, 8);
  assert.equal(profile.max_web_search_calls, 3);
});

test('evidence packet validates and renders deterministic draft Markdown', () => {
  const packet = fixture('evidence-packet.json');
  assert.equal(validateEvidencePacket(packet, packet.client_id).ok, true);
  const first = renderEvidenceMarkdown(packet, packet.client_id);
  const second = renderEvidenceMarkdown(packet, packet.client_id);
  assert.equal(first, second);
  assert.match(first, /Draft evidence only/);
  assert.match(first, /1\. claim-heat-pump-interest — partial/);
  assert.match(first, /Freshness date: 2026-07-30/);
  assert.match(first, /https:\/\/www\.energystar\.gov/);
});

test('evidence validation fails closed on missing sources', () => {
  const packet = fixture('evidence-packet.json');
  packet.claims[0].sources = [];
  const checked = validateEvidencePacket(packet, packet.client_id);
  assert.equal(checked.ok, false);
  assert.ok(checked.errors.includes('claims[0].sources must contain at least one source'));
});

test('evidence validation rejects expected-client mismatch and nested cross-client IDs', () => {
  const packet = fixture('evidence-packet.json');
  assert.equal(validateEvidencePacket(packet, 'cl_other_9876').ok, false);
  packet.client_alert.related_client_ids = [packet.client_id, 'cl_other_9876'];
  const checked = validateEvidencePacket(packet, packet.client_id);
  assert.equal(checked.ok, false);
  assert.ok(checked.errors.some((error) => error.includes('cross-client ID')));
});

test('evidence validation rejects external-action fields and schema overreach', () => {
  const packet = fixture('evidence-packet.json');
  packet.crm_action = { operation: 'create-lead' };
  packet.sales_bullets.push('Send this to the CRM now.');
  packet.extractability.exists = false;
  const checked = validateEvidencePacket(packet, packet.client_id);
  assert.equal(checked.ok, false);
  assert.ok(checked.errors.some((error) => error.includes('external action field')));
  assert.ok(checked.errors.some((error) => error.includes('external action intent')));
  assert.ok(checked.errors.includes('schema_suggestions require extractability.exists=true'));
});

test('evidence validation rejects imperative spend, auth, email, and HubSpot actions', () => {
  for (const instruction of [
    'Spend $500 on this campaign.',
    'Authenticate to HubSpot.',
    'Email the client now.',
    'Sync this lead to HubSpot.',
    'Recommendation: Spend $500 on this campaign.',
    'Immediately authenticate to HubSpot.',
    'You should email the client.',
    'Have HubSpot sync this lead.',
  ]) {
    const packet = fixture('evidence-packet.json');
    packet.sales_bullets = [instruction];
    const checked = validateEvidencePacket(packet, packet.client_id);
    assert.equal(checked.ok, false, instruction);
    assert.ok(checked.errors.some((error) => error.includes('external action intent')), instruction);
  }
});

test('verified claims require authoritative sources', () => {
  const packet = fixture('evidence-packet.json');
  packet.claims[0].verification_status = 'verified';
  packet.claims[0].sources = packet.claims[0].sources.filter((source) => source.source_type === 'x');
  const checked = validateEvidencePacket(packet, packet.client_id);
  assert.ok(checked.errors.includes('claims[0] cannot be verified without an authoritative source'));
});

test('claim ranking and freshness are mandatory', () => {
  const packet = fixture('evidence-packet.json');
  delete packet.claims[0].rank;
  packet.claims[0].freshness_date = 'not-a-date';
  const checked = validateEvidencePacket(packet, packet.client_id);
  assert.ok(checked.errors.includes('claims[0].rank must be a unique positive integer'));
  assert.ok(checked.errors.includes('claims[0].freshness_date must be YYYY-MM-DD'));
});

test('packet writer allows repo-local Markdown and blocks path escape', () => {
  const packet = fixture('evidence-packet.json');
  const temp = fs.mkdtempSync(path.join(REPO_ROOT, '.marketing-os-test-'));
  try {
    const output = path.join(temp, 'packet.md');
    const written = writeEvidenceMarkdown(packet, packet.client_id, output);
    assert.equal(fs.existsSync(output), true);
    assert.ok(written.bytes > 0);
    assert.throws(
      () => writeEvidenceMarkdown(packet, packet.client_id, path.join(REPO_ROOT, '..', 'escaped.md')),
      /escapes repository/,
    );
    assert.throws(
      () => writeEvidenceMarkdown(packet, packet.client_id, '..\\escaped.md'),
      /escapes repository/,
    );
    assert.throws(
      () => writeEvidenceMarkdown(packet, packet.client_id, '12_Brain/raw/forbidden.md'),
      /read-only/,
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('repo path resolution rejects a symlink escape', () => {
  const temp = fs.mkdtempSync(path.join(REPO_ROOT, '.marketing-os-link-test-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'marketing-os-outside-'));
  try {
    fs.symlinkSync(outside, path.join(temp, 'outside'));
    assert.throws(() => resolveRepoPath(path.join(temp, 'outside', 'packet.md')), /outside repository/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

test('creative manifest locks existing assets and keeps human approval pending', () => {
  const input = fixture('creative-input.json');
  const manifest = createCreativeManifest(input);
  assert.match(manifest.canonical_logo.sha256, /^[a-f0-9]{64}$/);
  assert.match(manifest.video.first_frame.sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.fidelity_claim, 'Reference-locked; pixel fidelity is not claimed.');
  const checked = validateCreativeManifest(manifest, input.client_id);
  assert.equal(checked.ok, true);
  assert.equal(checked.value.launch_ready, false);
});

test('creative manifest requires distinct style runs and matching first-frame lock', () => {
  const input = fixture('creative-input.json');
  const manifest = createCreativeManifest(input);
  manifest.style_runs[1].style = manifest.style_runs[0].style;
  manifest.video.first_frame.sha256 = '0'.repeat(64);
  const checked = validateCreativeManifest(manifest, input.client_id);
  assert.equal(checked.ok, false);
  assert.ok(checked.errors.some((error) => error.includes('style must be distinct')));
  assert.ok(checked.errors.some((error) => error.includes('first_frame')));
});

test('creative manifest rejects fidelity claims and foreign client scope', () => {
  const input = fixture('creative-input.json');
  const manifest = createCreativeManifest(input);
  manifest.fidelity_claim = 'Pixel-perfect reproduction guaranteed.';
  manifest.related_client_id = 'cl_other_9876';
  const checked = validateCreativeManifest(manifest, input.client_id);
  assert.ok(checked.errors.some((error) => error.includes('disclaim pixel fidelity')));
  assert.ok(checked.errors.some((error) => error.includes('cross-client ID')));
});

test('creative writer emits only a repo-local JSON manifest', () => {
  const input = fixture('creative-input.json');
  const manifest = createCreativeManifest(input);
  const temp = fs.mkdtempSync(path.join(REPO_ROOT, '.marketing-os-creative-test-'));
  try {
    const output = path.join(temp, 'manifest.json');
    writeCreativeManifest(manifest, input.client_id, output);
    const written = JSON.parse(fs.readFileSync(output, 'utf8'));
    assert.equal(written.launch_ready, false);
    assert.throws(
      () => writeCreativeManifest(manifest, input.client_id, '..\\creative.json'),
      /escapes repository/,
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('freshness scan queues deterministically from experiment dates', () => {
  const config = fixture('freshness.json');
  const first = scanFreshness(config);
  const second = scanFreshness(config);
  assert.deepEqual(first, second);
  assert.deepEqual(first.queue.map((page) => page.page_id), ['heat-pump-guide']);
  assert.equal(first.cadence_label, 'experiment-not-citation-fact');
  assert.match(first.disclaimer, /not a fact established by citations/);
  assert.ok(first.pages.every((page) => page.basis === 'configured cadence experiment'));
  assert.equal(first.external_actions, false);
});

test('freshness scan rejects invalid dates and unbounded cadence', () => {
  const config = fixture('freshness.json');
  config.pages[0].configured_review_date = '2026-02-30';
  config.pages[1].cadence_days = 366;
  assert.throws(() => scanFreshness(config), /Invalid freshness config/);
});

test('CLI exposes all local-only subcommands', () => {
  const cli = path.join(REPO_ROOT, '_os/automation/bin/marketing-os.js');
  const watchlist = spawnSync(process.execPath, [cli, 'watchlist', '--from', path.join(FIXTURES, 'watchlist.json')], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  assert.equal(watchlist.status, 0, watchlist.stderr);
  const watchResult = JSON.parse(watchlist.stdout);
  assert.equal(watchResult.dry_run, true);
  assert.equal(watchResult.external_calls, 0);

  const freshness = spawnSync(process.execPath, [cli, 'freshness', '--from', path.join(FIXTURES, 'freshness.json')], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  assert.equal(freshness.status, 0, freshness.stderr);
  const freshnessResult = JSON.parse(freshness.stdout);
  assert.equal(freshnessResult.status, 'dry-run');
  assert.equal(freshnessResult.result.external_actions, false);

  const packet = spawnSync(process.execPath, [
    cli, 'packet', '--from', path.join(FIXTURES, 'evidence-packet.json'),
    '--client-id', 'cl_87a6c6799c6cefd6', '--out', 'packet.md', '--dry-run',
  ], { cwd: REPO_ROOT, encoding: 'utf8' });
  assert.equal(packet.status, 0, packet.stderr);
  assert.equal(JSON.parse(packet.stdout).status, 'dry-run');

  const creative = spawnSync(process.execPath, [
    cli, 'creative', '--from', path.join(FIXTURES, 'creative-input.json'),
    '--client-id', 'cl_87a6c6799c6cefd6', '--dry-run',
  ], { cwd: REPO_ROOT, encoding: 'utf8' });
  assert.equal(creative.status, 0, creative.stderr);
  const creativeResult = JSON.parse(creative.stdout);
  assert.equal(creativeResult.status, 'dry-run');
  assert.equal(creativeResult.manifest.launch_ready, false);
});

test('CLI entry points reject input paths outside the repository', () => {
  const marketingCli = path.join(REPO_ROOT, '_os/automation/bin/marketing-os.js');
  const marketing = spawnSync(process.execPath, [
    marketingCli, 'watchlist', '--from', '/etc/hosts',
  ], { cwd: REPO_ROOT, encoding: 'utf8' });
  assert.equal(marketing.status, 2);
  assert.match(marketing.stderr, /escapes repository/);

  const xaiCli = path.join(REPO_ROOT, '_os/automation/bin/xai-research.js');
  const xai = spawnSync(process.execPath, [
    xaiCli, '--profile', '/etc/hosts', '--dry-run',
  ], { cwd: REPO_ROOT, encoding: 'utf8' });
  assert.equal(xai.status, 1);
  assert.match(xai.stderr, /escapes repository/);
});

test('new JSON fixtures and schemas are valid JSON', () => {
  const files = [
    ...fs.readdirSync(FIXTURES)
      .filter((name) => name.endsWith('.json'))
      .map((name) => path.join(FIXTURES, name)),
    ...fs.readdirSync(path.join(REPO_ROOT, '12_Brain/schemas'))
      .filter((name) => name.startsWith('marketing-'))
      .map((name) => path.join(REPO_ROOT, '12_Brain/schemas', name)),
  ];
  files.forEach((file) => assert.doesNotThrow(() => JSON.parse(fs.readFileSync(file, 'utf8')), file));
});
