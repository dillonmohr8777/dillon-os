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
