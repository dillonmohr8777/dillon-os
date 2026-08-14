/**
 * Cloud Agent install/start contract for Dillon OS.
 * Run: node --test _os/test/cloud-agent-env.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');
const INSTALL = path.join(VAULT, '_os/dev/bin/cloud-agent-install.sh');

describe('Cloud Agent install script', () => {
  it('exists and is a non-interactive bash installer', () => {
    const text = fs.readFileSync(INSTALL, 'utf8');
    assert.match(text, /^#!/);
    assert.match(text, /set -euo pipefail/);
    assert.doesNotMatch(text, /\bnpm install -g\b/);
    assert.doesNotMatch(text, /\bnode _os\/server\.js\b/);
    assert.doesNotMatch(text, /\bnpm run dev\b/);
  });

  it('syncs the two site apps and Prospect Radar V2', () => {
    const text = fs.readFileSync(INSTALL, 'utf8');
    assert.match(text, /immohrtal-site/);
    assert.match(text, /01_Clients\/Shadow HVAC\/website/);
    assert.match(text, /_os\/radar-engine/);
    assert.match(text, /npm ci/);
  });
});

describe('Cloud Agent docs', () => {
  it('AGENTS.md points at the install script and HUD start', () => {
    const text = fs.readFileSync(path.join(VAULT, 'AGENTS.md'), 'utf8');
    assert.match(text, /_os\/dev\/bin\/cloud-agent-install\.sh/);
    assert.match(text, /node _os\/server\.js/);
    assert.match(text, /_os\/radar-engine/);
  });

  it('INDEX lists the Cursor Cloud Environment entity', () => {
    const text = fs.readFileSync(path.join(VAULT, '12_Brain/INDEX.md'), 'utf8');
    assert.match(text, /Cursor Cloud Environment/);
  });
});
