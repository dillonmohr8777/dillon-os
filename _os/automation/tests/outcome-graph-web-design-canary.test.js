'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  collectWebDesignCanarySources,
  makeWebDesignCanary,
} = require('../lib/outcome-graph-web-design-canary');

test('web-design canary binds stable authority while keeping production and deployment closed', () => {
  const first = collectWebDesignCanarySources({ asOf: '2026-08-24T20:00:00.000Z' });
  const second = collectWebDesignCanarySources({ asOf: '2026-08-24T21:00:00.000Z' });
  assert.equal(first.source_set_sha256, second.source_set_sha256);
  assert.equal(first.surfaces.length, 1);
  assert.equal(first.surfaces[0].mode, 'Experience');
  assert.equal(first.surfaces[0].production_intent, false);
  assert.equal(first.surfaces[0].deployment.authorized, false);
  assert.ok(first.surfaces[0].authority.length >= 4);
});

test('web-design canary maker turns exact critique into a materially different isolated candidate', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'web-design-canary-maker-'));
  try {
    const firstRoot = path.join(root, 'first');
    const secondRoot = path.join(root, 'second');
    const first = await makeWebDesignCanary({
      attempt: 1,
      previous_findings: [],
      attempt_root: firstRoot,
    });
    const second = await makeWebDesignCanary({
      attempt: 2,
      previous_findings: [{ id: 'mobile-horizontal-overflow' }],
      attempt_root: secondRoot,
    });
    const draft = fs.readFileSync(path.join(first.build_root, 'index.html'), 'utf8');
    const repaired = fs.readFileSync(path.join(second.build_root, 'index.html'), 'utf8');
    assert.match(draft, /data-design-state="draft"/);
    assert.match(repaired, /data-design-state="resolved"/);
    assert.match(repaired, /prefers-reduced-motion/);
    assert.match(repaired, /Proof before promotion/);
    assert.match(repaired, /Synthetic local canary/);
    assert.doesNotMatch(repaired, /https?:\/\//i);
    assert.notEqual(draft, repaired);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
