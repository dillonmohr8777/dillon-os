'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { classifySite, isLive, livenessStale, LIVENESS_RECHECK_DAYS } = require('../lib/site-liveness');

const realPage = (title = 'Acme Plumbing') =>
  `<html><head><title>${title}</title></head><body><header><img src="/logo.png" alt="${title}"></header>` +
  `<p>${'We fix pipes across Bucks County. '.repeat(12)}</p></body></html>`;

test('the observed parked shapes are identified', () => {
  // The exact 114-byte body served by several registry domains.
  const lander = '<!DOCTYPE html><html><head><script>window.onload=function(){window.location.href="/lander"}</script></head></html>';
  assert.equal(classifySite(lander).state, 'parked');
  for (const marker of [
    '<html><body>sedoparking.com</body></html>',
    '<html><body>This domain name is for sale</body></html>',
    '<html><body>Buy this domain</body></html>',
  ]) {
    assert.equal(classifySite(marker + 'x'.repeat(700)).state, 'parked', marker.slice(0, 40));
  }
});

test('placeholder and challenge pages are empty, not live', () => {
  for (const title of ['Just a moment...', '404 Page Not Found', 'Account Suspended', 'Coming Soon',
    'Welcome to nginx!', 'Apache2 Ubuntu Default Page']) {
    const html = `<html><head><title>${title}</title></head><body>${'y'.repeat(900)}</body></html>`;
    assert.equal(classifySite(html).state, 'empty', title);
  }
});

test('a real small-business homepage is live', () => {
  const out = classifySite(realPage());
  assert.equal(out.state, 'live');
  assert.equal(isLive(out), true);
});

test('transport failures are distinguished from parking', () => {
  assert.equal(classifySite('', { status: 0 }).state, 'unreachable');
  assert.equal(classifySite('', { status: 404 }).state, 'error');
  assert.equal(classifySite('', { status: 503 }).state, 'error');
  // These are different verdicts on purpose: a 503 is worth retrying sooner
  // than a domain someone has put up for sale.
  assert.ok(LIVENESS_RECHECK_DAYS.error < LIVENESS_RECHECK_DAYS.parked);
});

test('a tiny body is empty whatever it claims', () => {
  assert.equal(classifySite('<html><body>hi</body></html>').state, 'empty');
  // The 169-byte placeholder shell shape.
  assert.equal(classifySite(`<html><head></head><body>${'z'.repeat(120)}</body></html>`).state, 'empty');
});

test('a large page of pure script with no content is still a shell', () => {
  const html = `<html><head><title>Site</title></head><body><script>${'var a=1;'.repeat(300)}</script></body></html>`;
  assert.equal(classifySite(html).state, 'empty');
});

test('a page carrying imagery but little text is not called empty', () => {
  // Image-led splash pages are poor sites, which is the point of the radar --
  // they are still real businesses and must stay in the pipeline.
  const html = `<html><head><title>Acme</title></head><body>${'<img src="a.jpg">'.repeat(6)}${'q'.repeat(700)}</body></html>`;
  assert.equal(classifySite(html).state, 'live');
});

test('isLive treats an unclassified row as live so nothing is dropped silently', () => {
  assert.equal(isLive(undefined), true);
  assert.equal(isLive({ state: 'live' }), true);
  assert.equal(isLive({ state: 'parked' }), false);
});

test('a not-live URL is re-checked on its own schedule, never written off', () => {
  const parked = { liveness: { state: 'parked', checked: '2026-09-01' } };
  assert.equal(livenessStale(parked, { today: '2026-09-20' }), false, 'still holding');
  assert.equal(livenessStale(parked, { today: '2026-11-15' }), true, 'comes back after the window');
  assert.equal(livenessStale({}, { today: '2026-09-10' }), true, 'never checked means check it');
  // A transient error returns to the queue much sooner than a parked domain.
  const errored = { liveness: { state: 'error', checked: '2026-09-01' } };
  assert.equal(livenessStale(errored, { today: '2026-09-25' }), true);
});
