'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { SITE_NAME, assertSafeNetlifySite, FORBIDDEN_EXACT } = require('../deploy');
const { isRetryableUpload } = require('../../../_os/automation/lib/netlify');

test('unslop Netlify deploy pins the batch hub and refuses client sites', () => {
  assert.equal(SITE_NAME, 'radar-unslop-20260819');
  assert.equal(assertSafeNetlifySite(SITE_NAME), true);
  assert.throws(() => assertSafeNetlifySite('omega-landscaping-landing-page'));
  assert.throws(() => assertSafeNetlifySite('momentum-prospect-radar-next20-2026-08-11'));
  assert.throws(() => assertSafeNetlifySite('shadow-heating-website'));
  assert.throws(() => assertSafeNetlifySite('momentum-workshop-pilot'));
  assert.ok(FORBIDDEN_EXACT.has('momentum-prospect-radar-next20-2026-08-11'));
});

test('Netlify file uploads retry rate limits and dropped sockets', () => {
  assert.equal(isRetryableUpload({ ok: true, status: 200 }), false);
  assert.equal(isRetryableUpload({ ok: false, status: 404 }), false);
  assert.equal(isRetryableUpload({ ok: false, status: 429 }), true);
  assert.equal(isRetryableUpload({ ok: false, status: 0, error: 'ECONNRESET' }), true);
  assert.equal(isRetryableUpload({ ok: false, status: 502 }), true);
});
