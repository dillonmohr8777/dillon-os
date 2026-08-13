'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parseFrontmatter, serializeFrontmatter, validateClientFrontmatter, repairDefaults } = require('../lib/frontmatter');
const { scoreProspect } = require('../lib/scorer');
const { fromMapsIntake } = require('../lib/adapters/maps-prospect');
const { fromIndeedIntake } = require('../lib/adapters/indeed-signal');
const { analyzeHtml, runSentinel } = require('../lib/sentinel');
const { repoPath } = require('../lib/fsutil');

test('frontmatter parse + validate complete note', () => {
  const text = fs.readFileSync(repoPath('_os/automation/fixtures/clients/Fixture Client One.md'), 'utf8');
  const { data, hasFence } = parseFrontmatter(text);
  assert.equal(hasFence, true);
  const v = validateClientFrontmatter(data);
  assert.equal(v.ok, true);
  assert.deepEqual(v.missing, []);
});

test('frontmatter missing keys on bare note', () => {
  const text = fs.readFileSync(repoPath('_os/automation/fixtures/clients/Fixture Client Two.md'), 'utf8');
  const { data, hasFence } = parseFrontmatter(text);
  assert.equal(hasFence, false);
  const v = validateClientFrontmatter(data);
  assert.equal(v.ok, false);
  assert.ok(v.missing.includes('status'));
  assert.ok(v.missing.includes('due'));
});

test('repairDefaults never invents a due date', () => {
  const { data, applied } = repairDefaults({}, { today: '2026-07-29' });
  assert.equal(data.due, 'none');
  assert.equal(data.status, 'active');
  assert.equal(data.last_touched, '2026-07-29');
  assert.ok(applied.includes('due=none'));
  const roundTrip = parseFrontmatter(serializeFrontmatter(data, '# Body\n'));
  assert.equal(roundTrip.data.due, 'none');
});

test('maps intake normalizes sheet-like rows', () => {
  const doc = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/prospects/sample-intake.json'), 'utf8'));
  const rows = fromMapsIntake(doc);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].source, 'maps');
  assert.ok(rows[0].prospect_id);
});

test('indeed adapter feeds shared schema', () => {
  const doc = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/prospects/indeed-signals.json'), 'utf8'));
  const rows = fromIndeedIntake(doc);
  assert.equal(rows[0].source, 'indeed');
  assert.equal(rows[0].hiring_signal.role, 'Digital Marketing Manager');
  assert.ok(rows[0].prospect_id.startsWith('indeed:'));
});

test('scorer ranks decayed high-review site above healthy low-decay site', () => {
  const weakHarvest = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/harvest/old-town-plumbing.json'), 'utf8'));
  const strongHarvest = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/harvest/standard-tap.json'), 'utf8'));

  const weak = scoreProspect(
    {
      prospect_id: 'weak',
      business_name: 'Old Town Plumbing',
      website: 'http://oldtownplumbing.example',
      vertical: 'plumbing',
      review_count: 85,
      rating: 4.8,
      ad_presence: true,
      source: 'maps',
    },
    { harvest: weakHarvest }
  );

  const strongSite = scoreProspect(
    {
      prospect_id: 'strong',
      business_name: 'Standard Tap',
      website: 'https://standardtap.com',
      vertical: 'restaurant',
      review_count: 1200,
      rating: 4.6,
      source: 'maps',
    },
    { harvest: strongHarvest }
  );

  assert.ok(weak.score >= 60, `expected weak outdated site to score high, got ${weak.score}`);
  assert.equal(weak.status, 'queued_build');
  assert.ok(strongSite.score > 0);
  // Decayed target should outrank a healthy modern site for outreach value when reviews are strong
  assert.ok(weak.score > strongSite.score, `${weak.score} !> ${strongSite.score}`);
});

test('scorer suppresses existing client domains', () => {
  const result = scoreProspect(
    {
      prospect_id: 'x',
      business_name: 'Bar Crawl USA',
      website: 'https://barcrawlusa.com',
      source: 'maps',
    },
    { suppressDomains: new Set(['barcrawlusa.com']) }
  );
  assert.equal(result.suppress, true);
  assert.equal(result.status, 'suppressed');
  assert.equal(result.score, 0);
});

test('indeed marketing hire gets hiring component points', () => {
  const harvest = JSON.parse(fs.readFileSync(repoPath('_os/automation/fixtures/harvest/harbor-hvac.json'), 'utf8'));
  const result = scoreProspect(
    {
      prospect_id: 'indeed:ind-1001',
      business_name: 'Harbor HVAC Co',
      website: 'https://harborhvac.example',
      source: 'indeed',
      vertical: 'hvac',
      review_count: 42,
      hiring_signal: { role: 'Digital Marketing Manager', source: 'indeed' },
    },
    { harvest }
  );
  assert.ok(result.components.hiring >= 10);
  assert.ok(result.score >= 60);
});

test('sentinel fixtures: healthy passes, broken form fails', async () => {
  const run = await runSentinel(
    [
      {
        id: 'fixture-healthy',
        name: 'Healthy',
        url: 'fixture://healthy',
        fixture: '_os/automation/fixtures/sites/healthy/index.html',
      },
      {
        id: 'fixture-broken-form',
        name: 'Broken',
        url: 'fixture://broken-form',
        fixture: '_os/automation/fixtures/sites/broken-form/index.html',
        form_endpoint: '/api/dossier-leads',
      },
    ],
    { live: false }
  );
  assert.equal(run.results[0].status, 'pass');
  assert.equal(run.results[1].status, 'fail');
  assert.equal(run.status, 'fail');
});

test('analyzeHtml detects missing viewport on broken fixture', () => {
  const html = fs.readFileSync(repoPath('_os/automation/fixtures/sites/broken-form/index.html'), 'utf8');
  const analyzed = analyzeHtml(html, { form_endpoint: '/api/dossier-leads' });
  const viewport = analyzed.checks.find((c) => c.id === 'viewport');
  assert.equal(viewport.ok, false);
});

const {
  loadProfile,
  createRun,
  buildApprovalBoard,
  renderAgentPrompt,
  scanCompetitiveSignals,
} = require('../lib/dillon-command');

test('dillon-command profile has eight parallel lanes + commander', () => {
  const profile = loadProfile();
  assert.equal(profile.id, 'dillon-command');
  assert.equal(profile.lanes.length, 8);
  const parallel = profile.lanes.filter((l) => l.parallel !== false);
  assert.equal(parallel.length, 7);
  const commander = profile.lanes.find((l) => l.id === 'command');
  assert.ok(commander);
  assert.deepEqual(commander.depends_on, ['comms', 'clients', 'websites', 'ads']);
});

test('dillon-command createRun writes run-state with pending lanes', () => {
  const day = '2099-01-01';
  const state = createRun({ day, mode: 'test' });
  assert.equal(state.run_id, `dillon-command-${day}`);
  assert.equal(state.lanes.length, 8);
  assert.equal(state.counts.pending, 8);
  const file = repoPath('automation-runs/dillon-command', day, 'run-state.json');
  assert.equal(fs.existsSync(file), true);
  fs.rmSync(repoPath('automation-runs/dillon-command', day), { recursive: true, force: true });
});

test('dillon-command approval board includes lane table', () => {
  const profile = loadProfile();
  const state = {
    day: '2099-01-02',
    run_id: 'dillon-command-2099-01-02',
    mode: 'test',
    lanes: profile.lanes.map((l) => ({ id: l.id, agent: l.agent, status: 'ok', artifacts: [] })),
  };
  const board = buildApprovalBoard(state, profile, [{ source: 'slack', file: '00_Inbox/slack/test.md', priority: 'urgent' }]);
  assert.match(board, /Approval Board/);
  assert.match(board, /comms/);
  assert.match(board, /urgent/);
});

test('dillon-command agent prompt references all lanes', () => {
  const profile = loadProfile();
  const prompt = renderAgentPrompt(profile, '2099-01-03');
  for (const lane of profile.lanes.filter((l) => l.parallel !== false)) {
    assert.match(prompt, new RegExp(`Lane ${lane.id}`));
  }
  assert.match(prompt, /Hard rules/);
});

test('dillon-command scans open slack requests', () => {
  const { signals } = scanCompetitiveSignals();
  assert.ok(Array.isArray(signals));
  assert.ok(signals.length >= 1, 'expected at least one status:new slack note in fixtures');
});
