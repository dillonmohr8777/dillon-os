/**
 * CMO lane contract: balanced default, four earning agents, simulated GEO.
 * Run: node --test _os/test/cmo-lane.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { getSkills } = require('../vault-state');

const VAULT = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(VAULT, '11_Agents/cmo-lane.json');
const SKILL = path.join(VAULT, '.claude/skills/cmo-lane/SKILL.md');
const BOARD = path.join(VAULT, '_os/cmo-lane/public/index.html');
const ENV_EXAMPLE = path.join(VAULT, '_os/cmo-lane/.env.example');
const BIN = path.join(VAULT, '_os/automation/bin/cmo-lane-netlify-deploy.js');

describe('CMO lane contract', () => {
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));

  it('defaults to balanced and refuses quality as the default', () => {
    assert.equal(cfg.default_profile, 'balanced');
    assert.equal(cfg.profiles.balanced.status, 'default');
    assert.equal(cfg.profiles.quality.status, 'do_not_default');
    const env = fs.readFileSync(ENV_EXAMPLE, 'utf8');
    assert.match(env, /^CMO_PROFILE=balanced$/m);
    assert.doesNotMatch(env, /^CMO_PROFILE=quality$/m);
  });

  it('keeps exactly four earning agents', () => {
    assert.deepEqual(cfg.roster.active, [
      'paid-search-analyst',
      'local-seo',
      'attribution-reconciler',
      'seo-technical',
    ]);
    assert.equal(cfg.roster.active.length, 4);
    assert.equal(cfg.roster.content_lanes.policy, 'buy_not_build');
  });

  it('marks GEO simulated and not reportable', () => {
    assert.equal(cfg.geo.status, 'simulated');
    assert.equal(cfg.geo.reportable, false);
    assert.equal(cfg.runtime_present, false);
  });

  it('exposes the Claude skill on the Command Deck', () => {
    assert.equal(fs.existsSync(SKILL), true);
    const names = getSkills(VAULT).map((s) => s.name);
    assert.ok(names.includes('cmo-lane'), 'missing skill cmo-lane');
  });

  it('operator board is noindex and public-safe', () => {
    const html = fs.readFileSync(BOARD, 'utf8');
    assert.match(html, /noindex/);
    assert.match(html, /balanced/);
    assert.match(html, /paid-search-analyst/);
    assert.match(html, /local-seo/);
    assert.match(html, /attribution-reconciler/);
    assert.match(html, /seo-technical/);
    assert.doesNotMatch(html, /sk-[A-Za-z0-9]/);
    assert.doesNotMatch(html, /api[_-]?key\s*[:=]/i);
  });

  it('operator board carries Momentum look, agent portraits, and platform marks', () => {
    const html = fs.readFileSync(BOARD, 'utf8');
    const css = fs.readFileSync(path.join(VAULT, '_os/cmo-lane/public/assets/app.css'), 'utf8');
    const publicDir = path.join(VAULT, '_os/cmo-lane/public');
    assert.match(css, /--navy:\s*#14274e/i);
    assert.match(html, /Google Ads/);
    assert.match(html, /Google Business Profile/);
    assert.match(html, /Search Console/);
    assert.match(html, /Places/);
    assert.match(html, /WordPress/);
    assert.match(html, /DataForSEO/);
    assert.match(html, /Anthropic/);
    assert.match(html, /assets\/agents\/paid-search-analyst\.webp/);
    for (const file of [
      'assets/agents/paid-search-analyst.webp',
      'assets/agents/local-seo.webp',
      'assets/agents/attribution-reconciler.webp',
      'assets/agents/seo-technical.webp',
      'assets/app.css',
      'assets/momentum-360-logo.png',
    ]) {
      assert.equal(fs.existsSync(path.join(publicDir, file)), true, file);
    }
  });

  it('deploy CLI dry-run never creates a site', () => {
    const result = spawnSync(process.execPath, [BIN, '--dry-run'], {
      encoding: 'utf8',
      env: { ...process.env, CMO_LANE_NETLIFY_SITE_ID: '', NETLIFY_AUTH_TOKEN: '' },
    });
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.ok, true);
    assert.equal(payload.dry_run, true);
    assert.equal(payload.never_create_site, true);
    assert.equal(payload.site_id_present, false);
    assert.ok(payload.paths.includes('/index.html'));
  });

  it('publish without a pinned site ID fails closed', () => {
    const result = spawnSync(process.execPath, [BIN, '--publish'], {
      encoding: 'utf8',
      env: { ...process.env, CMO_LANE_NETLIFY_SITE_ID: '', NETLIFY_AUTH_TOKEN: '' },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /CMO_LANE_NETLIFY_SITE_ID/);
    assert.match(result.stderr, /refusing to create/);
  });
});
