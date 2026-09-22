/**
 * umbrella-run.js contract tests (no subprocess).
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');
const MANIFEST = path.join(VAULT, '_os/automation/umbrella/manifest.json');
const RUNNER = path.join(VAULT, '_os/automation/bin/umbrella-run.js');

describe('umbrella manifest', () => {
  it('exists and lists three cloud slices plus local-continuous', () => {
    const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    assert.equal(m.version, 1);
    assert.ok(m.slices.morning);
    assert.ok(m.slices.midday);
    assert.ok(m.slices.nightly);
    assert.ok(m.slices['local-continuous']);
  });

  it('every slice lane resolves in lanes map', () => {
    const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    for (const [name, slice] of Object.entries(m.slices)) {
      for (const laneId of slice.lanes) {
        assert.ok(m.lanes[laneId], `${name} references missing lane ${laneId}`);
      }
    }
  });
});

describe('umbrella-run.js', () => {
  it('is present and executable as node script', () => {
    const src = fs.readFileSync(RUNNER, 'utf8');
    assert.match(src, /competitiveTaskRollup/);
    assert.match(src, /umbrella-latest\.json/);
  });
});
