'use strict';

/**
 * generated_at is the one timestamp contract for automation state
 * (12_Brain/schemas/automation-run.json). Writers that go through
 * registry.writeRunState get it stamped; these are the writers that manage their
 * own state file and have to set it themselves, right before they write.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { evaluateState } = require('../bin/connector-health');

const LIB = path.resolve(__dirname, '../lib');

const SELF_MANAGED = [
  { file: 'intelligence.js', state: 'grok-intelligence-ingest.json' },
  { file: 'communications.js', state: 'daily-communications-brain.json' },
  { file: 'reports.js', state: 'report-brain-ingest.json' },
  { file: 'aeo-trust.js', state: 'aeo-trust-gate.json' },
];

for (const { file, state } of SELF_MANAGED) {
  test(`${file} stamps generated_at on ${state} before writing it`, () => {
    const src = fs.readFileSync(path.join(LIB, file), 'utf8');
    assert.ok(src.includes(`12_Brain/state/${state}`), 'still writes the expected state file');
    // The stamp must sit on the same write path as the state file: either assigned onto the
    // state object before writeJson, or spread into the object handed to writeJson.
    const assigned = /state\.generated_at = state\.updated_at;[\s\S]{0,200}?writeJson\(/.test(src);
    const spread = /writeJson\(stateFile, \{[^\n]*generated_at:/.test(src);
    assert.ok(assigned || spread, `${file} writes state without generated_at`);
  });
}

test('connector-health reads generated_at and falls back to recorded_at_utc', () => {
  const now = Date.parse('2026-09-02T12:00:00Z');
  const base = { connectors: [{ toolkit: 'x', status: 'active', read_verified: true, last_verified_utc: '2026-09-02T11:00:00Z' }] };
  const withContract = evaluateState({ ...base, generated_at: '2026-09-02T10:00:00Z', recorded_at_utc: '2026-09-01T00:00:00Z' }, 48, now);
  assert.equal(withContract.generated_at, '2026-09-02T10:00:00Z');
  assert.equal(withContract.snapshot_age_hours, 2);
  const legacy = evaluateState({ ...base, recorded_at_utc: '2026-09-02T06:00:00Z' }, 48, now);
  assert.equal(legacy.generated_at, '2026-09-02T06:00:00Z');
  assert.equal(legacy.snapshot_age_hours, 6);
  const none = evaluateState(base, 48, now);
  assert.equal(none.generated_at, null);
  assert.equal(none.snapshot_age_hours, null);
});
