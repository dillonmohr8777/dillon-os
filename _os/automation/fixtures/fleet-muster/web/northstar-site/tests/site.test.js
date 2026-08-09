'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

test('page contains the four required product sections and synthetic boundary', () => {
  for (const section of ['value-proposition', 'efficiency-proof', 'installation-process', 'local-call-to-action']) {
    assert.match(html, new RegExp(`data-section="${section}"`));
  }
  assert.match(html, /synthetic local acceptance fixture/i);
  assert.doesNotMatch(html, /Blue Ember|undisputed market leader|guaranteed savings/i);
});

test('noindex and zero-network constraints are explicit', () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/);
  assert.doesNotMatch(html, /https?:\/\//i);
  assert.doesNotMatch(html, /<form[^>]+action=/i);
  assert.match(script, /event\.preventDefault\(\)/);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
});

test('seeded accessibility and mobile overflow defects are remediated', () => {
  assert.match(html, /<label for="postal-code">/);
  assert.match(html, /id="postal-code"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /min-width:\s*0/);
  assert.match(css, /@media \(max-width: 520px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@font-face/);
  assert.ok(fs.existsSync(path.join(root, 'fonts', 'Barlow-Regular.ttf')));
  assert.ok(fs.existsSync(path.join(root, 'fonts', 'OFL.txt')));
});

test('dependency-free build emits a hash manifest', () => {
  const build = spawnSync(process.execPath, ['scripts/build.js'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(build.status, 0, build.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist', 'build-manifest.json'), 'utf8'));
  assert.equal(manifest.synthetic, true);
  assert.equal(manifest.externalRequests, 0);
  assert.equal(manifest.artifacts.length, 6);
  assert.ok(manifest.artifacts.every((artifact) => /^[a-f0-9]{64}$/.test(artifact.sha256)));
});
