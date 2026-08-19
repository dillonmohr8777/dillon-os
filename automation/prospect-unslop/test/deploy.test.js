'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { SITE_NAME, assertSafeNetlifySite, FORBIDDEN_EXACT } = require('../deploy');

test('unslop Netlify deploy pins the batch hub and refuses client sites', () => {
  assert.equal(SITE_NAME, 'radar-unslop-20260819');
  assert.equal(assertSafeNetlifySite(SITE_NAME), true);
  assert.throws(() => assertSafeNetlifySite('omega-landscaping-landing-page'));
  assert.throws(() => assertSafeNetlifySite('momentum-prospect-radar-next20-2026-08-11'));
  assert.throws(() => assertSafeNetlifySite('shadow-heating-website'));
  assert.throws(() => assertSafeNetlifySite('momentum-workshop-pilot'));
  assert.ok(FORBIDDEN_EXACT.has('momentum-prospect-radar-next20-2026-08-11'));
});
