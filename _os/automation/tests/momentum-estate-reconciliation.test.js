'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildMomentumEstate } = require('../lib/momentum-estate-reconciliation');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const currentPath = path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots', 'momentum-current-238-rows-2026-08-24.json');
const aliasesPath = path.join(repoRoot, 'System', 'outcome-graph', 'web-design', 'momentum-identity-aliases-2026-08-24.json');
const inventoryPath = 'C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-08-12-ai-tech-news-batch-registry\\site-inventory.csv';

function build() {
  return buildMomentumEstate({
    currentSnapshotText: fs.readFileSync(currentPath, 'utf8'),
    predecessorCsvText: fs.readFileSync(inventoryPath, 'utf8'),
    aliasDecisionText: fs.readFileSync(aliasesPath, 'utf8'),
  });
}

test('all 238 current page records resolve to 236 stable businesses', () => {
  const result = build();
  assert.equal(result.state, 'identity_reconciled');
  assert.equal(result.counts.current_page_records, 238);
  assert.equal(result.counts.stable_page_ids, 238);
  assert.equal(result.counts.distinct_businesses, 236);
  assert.equal(result.counts.predecessor_slugs, 245);
  assert.equal(result.counts.predecessor_slugs_in_current_projection, 236);
  assert.equal(result.counts.predecessor_only_slugs, 9);
  assert.deepEqual(result.counts.classifications, { retain: 133, repair: 87, exclude: 18 });
  assert.deepEqual(result.counts.match_methods, {
    concept_url_slug: 219,
    exact_normalized_name: 12,
    bounded_alias_decision: 7,
  });
  assert.equal(new Set(result.records.map((row) => row.page_id)).size, 238);
  assert.equal(new Set(result.records.map((row) => row.business_id)).size, 236);
});

test('the two-row delta is explained by two versioned pages for two businesses', () => {
  const result = build();
  assert.deepEqual(
    result.duplicate_businesses.map((row) => row.predecessor_slug),
    ['johnnys-pizza', 'thr-insurance']
  );
  for (const business of result.duplicate_businesses) {
    assert.equal(business.page_count, 2);
    assert.deepEqual(business.pages.map((row) => row.state).sort(), ['cleared_to_show', 'hold_for_repair']);
  }
});

test('identity output is deterministic and remains non-authorizing', () => {
  const first = build();
  const second = build();
  assert.deepEqual(first.records, second.records);
  assert.equal(first.authority.identity_reconciliation_complete, true);
  assert.equal(first.authority.site_mutation_authorized, false);
  assert.equal(first.authority.deployment_authorized, false);
  assert.equal(first.authority.external_contact_authorized, false);
  assert.equal(first.records.filter((row) => row.classification === 'exclude' && row.build_eligible_now).length, 0);
});
