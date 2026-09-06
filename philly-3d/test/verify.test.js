'use strict';
// tools/verify.py re-derives every claim the README and docs make, from the
// files that actually ship. Running it here means a data change that
// contradicts the documentation fails the test suite rather than sitting in the
// repo until somebody reads the prose again.
const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const TOOLS = path.join(__dirname, '..', 'tools');
const DATA = path.join(__dirname, '..', 'data');

test('the shipped data still matches everything claimed about it', () => {
  const py = spawnSync('python3', ['verify.py'],
    { cwd: TOOLS, encoding: 'utf8', timeout: 120000 });
  if (py.error && py.error.code === 'ENOENT') {
    // No python here. The manifest check below still runs.
    return;
  }
  assert.strictEqual(py.status, 0,
    `verify.py failed:\n${py.stdout}\n${py.stderr}`);
  const passed = (py.stdout.match(/^ok /gm) || []).length;
  assert.ok(passed >= 30, `only ${passed} checks ran`);
  assert.ok(!/^FAIL/m.test(py.stdout), py.stdout);
});

test('the manifest covers every file that ships', () => {
  const man = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json'), 'utf8'));
  const shipped = fs.readdirSync(DATA)
    .filter((f) => f !== 'manifest.json' && /\.(bin|json)$/.test(f));
  assert.ok(shipped.length >= 7, `only ${shipped.length} artifacts`);
  for (const f of shipped) {
    const rec = man.artifacts[f];
    assert.ok(rec, `${f} ships but is not in the manifest`);
    assert.ok(/^[0-9a-f]{64}$/.test(rec.sha256), `${f} has no checksum`);
    assert.strictEqual(rec.bytes, fs.statSync(path.join(DATA, f)).size,
      `${f} is not the size the manifest records`);
  }
});
