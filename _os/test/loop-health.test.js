/**
 * Deterministic tests for the HUD's Loop Health and Connectors panels.
 * Run: node --test _os/test/loop-health.test.js
 *
 * Fixture vaults are built in a temp dir so the assertions never depend on
 * what the real automations last wrote.
 */
const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  getLoopHealth,
  getConnectorHealth,
  newestStamp,
  loopBand,
  LOOP_BANDS,
  buildState,
} = require('../vault-state');

const VAULT = path.resolve(__dirname, '..', '..');
const NOW = Date.parse('2026-09-01T20:00:00Z');
const H = 3.6e6;
const iso = (hoursAgo) => new Date(NOW - hoursAgo * H).toISOString();

function fixtureVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hud-loops-'));
  const state = path.join(root, '12_Brain', 'state');
  fs.mkdirSync(path.join(root, '12_Brain', 'registry'), { recursive: true });
  fs.mkdirSync(state, { recursive: true });
  const write = (rel, data, prefix = '') =>
    fs.writeFileSync(path.join(root, rel), prefix + JSON.stringify(data, null, 2));

  write('12_Brain/registry/automations.json', {
    automations: [
      { id: 'alpha', name: 'Alpha sweep', cadence: 'daily', status: 'implemented', outputs: ['12_Brain/state/alpha.json'] },
      { id: 'beta', name: 'Beta grader', cadence: 'weekly', status: 'implemented',
        outputs: ['12_Brain/state/beta-last.json', '12_Brain/state/beta.json'] },
      { id: 'gamma', name: 'Gamma gate', cadence: 'on demand', status: 'gated' },
    ],
  });
  write('12_Brain/state/alpha.json', { written_at: iso(1), status: 'ok' });
  write('12_Brain/state/beta-last.json', { started_at: iso(24 * 10) });
  write('12_Brain/state/beta.json', { written_at: iso(24 * 9) });
  write('12_Brain/state/loose.json', { D19: { updated: iso(24 * 3), stage: 'learn' } });
  // PowerShell 5.1 writes a BOM; the reader must tolerate it.
  write('12_Brain/state/bom.json', { recorded_at_utc: iso(2) }, '﻿');
  write('12_Brain/state/connector-health.json', {
    recorded_by: 'fixture',
    recorded_at_utc: iso(1),
    connectors: [
      { toolkit: 'slack', status: 'active', read_verified: true, last_verified_utc: iso(1), note: 'live' },
      { toolkit: 'googleads', status: 'active', read_verified: false, last_verified_utc: iso(1) },
      { toolkit: 'meta_ads', status: 'active', read_verified: true, last_verified_utc: iso(24 * 14) },
      { toolkit: 'openai_api_key', status: 'missing', read_verified: false, last_verified_utc: iso(1) },
    ],
  });
  return root;
}

describe('loop health primitives', () => {
  it('newestStamp reads the newest known key, one level deep if needed', () => {
    assert.equal(newestStamp(null), null);
    assert.equal(newestStamp({ nope: 'x' }), null);
    assert.equal(newestStamp({ started_at: iso(5), written_at: iso(1) }), NOW - 1 * H);
    assert.equal(newestStamp({ D19: { updated: iso(3) }, W04: { updated: iso(2) } }), NOW - 2 * H);
  });

  it('loopBand uses the shared thresholds', () => {
    assert.equal(loopBand(null), 'unknown');
    assert.equal(loopBand(0), 'fresh');
    assert.equal(loopBand(LOOP_BANDS.FRESH_H), 'fresh');
    assert.equal(loopBand(LOOP_BANDS.FRESH_H + 0.1), 'stale');
    assert.equal(loopBand(LOOP_BANDS.STALE_H), 'stale');
    assert.equal(loopBand(LOOP_BANDS.STALE_H + 0.1), 'dead');
  });
});

describe('getLoopHealth on a fixture vault', () => {
  const root = fixtureVault();
  after(() => fs.rmSync(root, { recursive: true, force: true }));
  const L = getLoopHealth(root, NOW);
  const by = Object.fromEntries(L.rows.map((r) => [r.id, r]));

  it('joins registry entries to their state files and lists loose files once', () => {
    assert.deepEqual(Object.keys(by).sort(), ['alpha', 'beta', 'bom', 'gamma', 'loose']);
    assert.equal(L.total, 5);
    assert.equal(by.alpha.registered, true);
    assert.equal(by.loose.registered, false);
    assert.equal(by.loose.registryStatus, 'unregistered');
    assert.equal('beta-last' in by, false, 'second output must be claimed, not listed as unregistered');
  });

  it('ages come from the written stamp, newest output wins', () => {
    assert.equal(by.alpha.ageHours, 1);
    assert.equal(by.alpha.band, 'fresh');
    assert.equal(by.beta.ageHours, 24 * 9);
    assert.equal(by.beta.band, 'dead');
    assert.equal(by.loose.ageHours, 24 * 3);
    assert.equal(by.loose.band, 'stale');
    assert.equal(by.bom.band, 'fresh', 'BOM-prefixed state must still parse');
    assert.equal(by.gamma.lastRun, null);
    assert.equal(by.gamma.band, 'unknown');
  });

  it('sorts worst first and counts every band', () => {
    assert.deepEqual(L.rows.map((r) => r.band), ['dead', 'stale', 'unknown', 'fresh', 'fresh']);
    assert.deepEqual(L.counts, { fresh: 2, stale: 1, dead: 1, unknown: 1 });
    assert.equal(L.worst, 'dead');
  });

  it('connector rows are usable only when active, read-verified, and within 48h', () => {
    const C = getConnectorHealth(root, NOW);
    const byTk = Object.fromEntries(C.rows.map((r) => [r.toolkit, r]));
    assert.equal(C.total, 4);
    assert.equal(C.usable, 1);
    assert.equal(byTk.slack.usable, true);
    assert.equal(byTk.googleads.usable, false, 'not read-verified');
    assert.equal(byTk.meta_ads.usable, false, 'observed too long ago');
    assert.equal(byTk.openai_api_key.usable, false);
    assert.equal(C.rows[0].toolkit, 'slack', 'usable connectors sort first');
    assert.equal(C.recordedBy, 'fixture');
  });

  it('an empty vault degrades to unknown, not a crash', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'hud-empty-'));
    try {
      const E = getLoopHealth(empty, NOW);
      assert.equal(E.total, 0);
      assert.equal(E.worst, 'unknown');
      const EC = getConnectorHealth(empty, NOW);
      assert.equal(EC.total, 0);
      assert.equal(EC.recordedAt, null);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('getLoopHealth on the real vault', () => {
  it('buildState carries loops and connectors for the HUD', () => {
    const state = buildState(VAULT);
    assert.ok(state.loops.total >= 20, `expected the registry plus state files, got ${state.loops.total}`);
    for (const r of state.loops.rows) {
      assert.ok(['fresh', 'stale', 'dead', 'unknown'].includes(r.band), r.id);
      assert.ok(r.ageHours == null || r.ageHours >= 0, `${r.id} has a negative age`);
    }
    const ids = state.loops.rows.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length, 'every loop appears once');
    assert.ok(state.connectors.total >= 1);
    assert.ok(state.connectors.recordedAt);
  });
});
