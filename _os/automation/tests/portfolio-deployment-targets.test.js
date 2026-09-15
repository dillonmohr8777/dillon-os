'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const targets = JSON.parse(fs.readFileSync(path.join(repoRoot, 'System', 'outcome-graph', 'web-design', 'portfolio-deployment-targets-2026-08-24.json'), 'utf8'));

test('portfolio variants bind to two exact existing Netlify sites', () => {
  assert.equal(targets.state, 'exact_existing_targets_verified');
  assert.equal(targets.targets.length, 2);
  assert.deepEqual(targets.targets.map((row) => row.variant), ['hrchitect', 'general']);
  assert.deepEqual(targets.targets.map((row) => row.site_name), ['dillon-mohr-portfolio', 'dillon-mohr-for-you']);
  assert.equal(new Set(targets.targets.map((row) => row.site_id)).size, 2);
  assert.equal(new Set(targets.targets.map((row) => row.canonical_url)).size, 2);
  assert.equal(targets.authority.deployment_attempted, false);
  assert.equal(targets.authority.new_site_creation_authorized, false);
  assert.equal(targets.privacy.contains_secret, false);
});
