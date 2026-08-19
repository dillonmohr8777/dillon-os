/**
 * Guards for restoring the original Connected Industry Prototype Suite.
 * Run: node --test _os/test/bridge-connected-suite-restore.test.js
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
  REQUIRED_3D_ASSETS,
  collectFiles,
  attachCompatibilityRedirects,
  validateSuite,
} = require('../automation/bin/bridge-connected-suite-restore');

function sampleHome() {
  return `<!doctype html><html lang="en"><head><meta name="robots" content="noindex, nofollow"><title>Bridge | Connected Industry Prototype Suite</title></head><body><a href="/signal">Explore the network</a></body></html>`;
}

function sampleSignal() {
  return `<!doctype html><html lang="en"><head><meta name="robots" content="noindex, nofollow"><title>Bridge Explore</title></head><body>
    <div class="pulse-live-map" id="signalLiveMap"></div>
    <img src="/assets/bridge-midatlantic-3d-v1.webp" alt="corridor">
    <button data-render-label="Virginia render"></button>
    <button data-render-label="Maryland render"></button>
    <button data-render-label="New Jersey render"></button>
    <button data-render-label="Massachusetts render"></button>
  </body></html>`;
}

function fixtureMap(overrides = {}) {
  const files = new Map([
    ['/index.html', Buffer.from(sampleHome())],
    ['/community/index.html', Buffer.from(sampleHome())],
    ['/studio/index.html', Buffer.from(sampleHome())],
    ['/business/index.html', Buffer.from(sampleHome())],
    ['/signal/index.html', Buffer.from(sampleSignal())],
    ['/styles.css', Buffer.from(':root { --purple: #4b0082; }')],
    ['/app.js', Buffer.from('console.log("suite");')],
  ]);
  for (const asset of REQUIRED_3D_ASSETS) {
    files.set(asset, Buffer.from('webp'));
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null) files.delete(k);
    else files.set(k, Buffer.isBuffer(v) ? v : Buffer.from(String(v)));
  }
  return files;
}

describe('bridge original suite restore guards', () => {
  it('pins the existing unified review site, not a new one', () => {
    assert.equal(SITE_NAME, 'bridge-connected-signal');
    assert.equal(EXPECTED_HOST, 'bridge-connected-signal.netlify.app');
    assert.deepEqual(REQUIRED_ROUTES, [
      '/index.html',
      '/community/index.html',
      '/studio/index.html',
      '/business/index.html',
      '/signal/index.html',
    ]);
  });

  it('accepts the original five-route suite with 3D assets', () => {
    const summary = validateSuite(fixtureMap());
    assert.equal(summary.html, 5);
    assert.ok(summary.files >= 12);
  });

  it('refuses the Next.js Modern Network restyle', () => {
    assert.throws(
      () =>
        validateSuite(
          fixtureMap({
            '/index.html':
              '<!doctype html><html data-theme="network"><head><meta name="robots" content="noindex"><title>Bridge</title></head><body><span>Modern Network</span></body></html>',
            '/create/index.html': Buffer.from('nope'),
          }),
        ),
      /Next\.js restyle|Modern Network|network restyle/,
    );
  });

  it('refuses Trusted Current', () => {
    assert.throws(
      () =>
        validateSuite(
          fixtureMap({
            '/index.html':
              '<!doctype html><html data-theme="current"><head><meta name="robots" content="noindex"><title>Bridge | Connected Industry Prototype Suite</title></head><body><a href="/signal">x</a>Trusted Current</body></html>',
          }),
        ),
      /Trusted Current/,
    );
  });

  it('refuses a missing 3D theater or corridor render', () => {
    assert.throws(
      () => validateSuite(fixtureMap({ '/assets/bridge-midatlantic-3d-v1.webp': null })),
      /missing 3D asset/,
    );
    assert.throws(
      () =>
        validateSuite(
          fixtureMap({
            '/signal/index.html':
              '<!doctype html><html><head><meta name="robots" content="noindex"></head><body>no theater</body></html>',
          }),
        ),
      /3D map theater|corridor 3D/,
    );
  });

  it('refuses when an API origin is set in the environment', () => {
    const prev = process.env.NEXT_PUBLIC_BRIDGE_API_BASE;
    process.env.NEXT_PUBLIC_BRIDGE_API_BASE = 'https://example.invalid';
    try {
      assert.throws(() => validateSuite(fixtureMap()), /NEXT_PUBLIC_BRIDGE_API_BASE/);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_BRIDGE_API_BASE;
      else process.env.NEXT_PUBLIC_BRIDGE_API_BASE = prev;
    }
  });

  it('attaches compatibility redirects from Next.js route names', () => {
    const files = attachCompatibilityRedirects(new Map());
    const text = files.get('/_redirects').toString('utf8');
    assert.match(text, /\/create \/studio 301/);
    assert.match(text, /\/my-profile \/business 301/);
    assert.match(text, /\/explore \/signal 301/);
  });

  it('collects static files and skips junk, refusing a .next tree', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-suite-'));
    fs.writeFileSync(path.join(dir, 'index.html'), sampleHome());
    fs.writeFileSync(path.join(dir, '.DS_Store'), 'nope');
    const files = collectFiles(dir);
    assert.equal(files.has('/index.html'), true);
    assert.equal(files.has('/.DS_Store'), false);
    fs.mkdirSync(path.join(dir, '.next'));
    fs.writeFileSync(path.join(dir, '.next', 'trace'), 'x');
    assert.throws(() => collectFiles(dir), /\.next/);
  });
});
