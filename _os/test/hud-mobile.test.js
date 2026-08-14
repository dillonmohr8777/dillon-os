/**
 * Mobile / hosted HUD checks.
 * Run: node --test _os/test/hud-mobile.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scanText } = require('../public-safety');
const { main: exportHud, SITE } = require('../bin/export-hud');

const VAULT = path.resolve(__dirname, '..', '..');
const PUBLIC = path.join(VAULT, '_os', 'public');

describe('D.I.L.L.O.N. OS phone HUD', () => {
  it('live HUD is a PWA with a stacked phone layout', () => {
    const html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
    assert.match(html, /apple-mobile-web-app-capable/);
    assert.match(html, /viewport-fit=cover/);
    assert.match(html, /manifest\.webmanifest/);
    assert.match(html, /@media \(max-width: 900px\)/);
    assert.match(html, /Drop in inbox/);
    assert.match(html, /phone-ops\.js/);
    assert.match(html, /Unlock writes/);
    assert.match(html, /if \(READONLY\) return/);
    assert.match(html, /serviceWorker\.register/);
    const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.start_url, './');
    assert.ok(fs.existsSync(path.join(PUBLIC, 'icons', 'apple-touch-icon.png')));
    assert.ok(fs.existsSync(path.join(PUBLIC, 'sw.js')));
  });

  it('export writes a noindex readonly snapshot with no PII', () => {
    const summary = exportHud();
    const dist = path.join(VAULT, '_os', 'hud-dist');
    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    const state = JSON.parse(fs.readFileSync(path.join(dist, 'state.json'), 'utf8'));
    assert.match(html, /noindex/);
    assert.match(html, /window\.__HUD__=\{mode:"readonly"/);
    assert.match(html, /Skills queue into the vault/);
    assert.ok(fs.existsSync(path.join(dist, 'phone-ops.js')));
    assert.equal(state.mode, 'readonly');
    assert.deepEqual(state.jobs, []);
    assert.equal(state.outreach.jesse238, 238);
    assert.equal(state.outreach.mailHold, true);
    assert.equal(summary.url, SITE);
    assert.deepEqual(scanText(JSON.stringify(state)), []);
    assert.equal(fs.existsSync(path.join(dist, 'robots.txt')), true);
    const deploy = fs.readFileSync(path.join(VAULT, '_os', 'bin', 'hud-deploy.js'), 'utf8');
    const workflow = fs.readFileSync(path.join(VAULT, '.github/workflows/hud-mobile.yml'), 'utf8');
    assert.match(deploy, /dillon-os-hud/);
    assert.match(workflow, /hud-deploy\.js/);
  });
});

describe('HUD icon writer', () => {
  it('writes PNG signatures', () => {
    const { iconPng } = require('../hud-icons');
    const buf = iconPng(64);
    assert.equal(buf[0], 137);
    assert.equal(buf.toString('ascii', 1, 4), 'PNG');
    assert.ok(buf.length > 80);
  });
});
