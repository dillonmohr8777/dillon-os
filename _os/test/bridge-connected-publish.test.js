/**
 * Guards for the Bridge unified-review Netlify publish.
 * Run: node --test _os/test/bridge-connected-publish.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  SITE_NAME,
  EXPECTED_HOST,
  REQUIRED_ROUTES,
  collectFiles,
  validateStaging,
  htmlTag,
} = require('../automation/bin/bridge-connected-publish');

function sampleIndex({ theme = 'network', chip = 'Modern Network', host = true, robots = true } = {}) {
  const script = host
    ? `(function(){try{var h=location.hostname;if(h==="${EXPECTED_HOST}"){document.documentElement.setAttribute("data-theme","network");}}catch(e){}})();`
    : '';
  const meta = robots ? '<meta name="robots" content="noindex, nofollow"/>' : '';
  return `<!doctype html><html lang="en" data-theme="${theme}"><head>${meta}<script>${script}</script></head><body><span class="status-chip">Provisional preview · ${chip}</span></body></html>`;
}

function fixtureMap(overrides = {}) {
  const files = new Map([
    ['/index.html', Buffer.from(sampleIndex())],
    ['/community/index.html', Buffer.from(sampleIndex())],
    ['/create/index.html', Buffer.from(sampleIndex())],
    ['/my-profile/index.html', Buffer.from(sampleIndex())],
    ['/explore/index.html', Buffer.from(sampleIndex())],
    [
      '/_redirects',
      Buffer.from('/studio /create 301\n/business /my-profile 301\n/signal /explore 301\n'),
    ],
  ]);
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null) files.delete(k);
    else files.set(k, Buffer.isBuffer(v) ? v : Buffer.from(String(v)));
  }
  return files;
}

describe('bridge connected purple publish guards', () => {
  it('pins the existing unified review site, not a new one', () => {
    const published = require('../automation/bin/bridge-connected-publish');
    assert.equal(SITE_NAME, 'bridge-connected-signal');
    assert.equal(EXPECTED_HOST, 'bridge-connected-signal.netlify.app');
    assert.equal(typeof published.purgeSiteCache, 'function');
    assert.deepEqual(REQUIRED_ROUTES, [
      '/index.html',
      '/community/index.html',
      '/create/index.html',
      '/my-profile/index.html',
      '/explore/index.html',
    ]);
  });

  it('accepts a network-locked five-route staging folder', () => {
    const summary = validateStaging(fixtureMap());
    assert.equal(summary.html, 5);
    assert.ok(summary.files >= 6);
  });

  it('reads html theme from the html tag only', () => {
    const tag = htmlTag(sampleIndex({ theme: 'network' }));
    assert.match(tag, /data-theme="network"/);
    assert.doesNotMatch(tag, /data-theme="current"/);
  });

  it('refuses Trusted Current on the home html tag', () => {
    assert.throws(
      () => validateStaging(fixtureMap({ '/index.html': sampleIndex({ theme: 'current', chip: 'Trusted Current' }) })),
      /Trusted Current|data-theme="network"/,
    );
  });

  it('refuses a missing Create route or studio redirect', () => {
    assert.throws(() => validateStaging(fixtureMap({ '/create/index.html': null })), /missing \/create\/index.html/);
    assert.throws(
      () => validateStaging(fixtureMap({ '/_redirects': '/signal /explore 301\n' })),
      /missing redirect \/studio \/create/,
    );
  });

  it('refuses when an API origin is set in the environment', () => {
    const prev = process.env.NEXT_PUBLIC_BRIDGE_API_BASE;
    process.env.NEXT_PUBLIC_BRIDGE_API_BASE = 'https://example.invalid';
    try {
      assert.throws(() => validateStaging(fixtureMap()), /NEXT_PUBLIC_BRIDGE_API_BASE/);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_BRIDGE_API_BASE;
      else process.env.NEXT_PUBLIC_BRIDGE_API_BASE = prev;
    }
  });

  it('collects static files and skips junk, refusing a .next tree', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-staging-'));
    fs.writeFileSync(path.join(dir, 'index.html'), sampleIndex());
    fs.writeFileSync(path.join(dir, '.DS_Store'), 'nope');
    const files = collectFiles(dir);
    assert.equal(files.has('/index.html'), true);
    assert.equal(files.has('/.DS_Store'), false);
    fs.mkdirSync(path.join(dir, '.next'));
    fs.writeFileSync(path.join(dir, '.next', 'trace'), 'x');
    assert.throws(() => collectFiles(dir), /\.next/);
  });
});
