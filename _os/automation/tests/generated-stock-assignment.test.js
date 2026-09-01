'use strict';

/**
 * Guards the generated-stock assignment contract for the Prospect Radar daily
 * builder (automation/prospect-radar-next20).
 *
 * Two rules, and they pull in opposite directions:
 *   1. Never guess a board for an unknown vertical. Imagery that misrepresents a
 *      real business is worse than no imagery.
 *   2. One unknown vertical must not discard the rest of the batch. On
 *      2026-08-18 a single "advertising agency" prospect threw away 19 finished,
 *      QA-passed sites.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { resolveGeneratedStockAssignment } = require(
  path.join(__dirname, '../../../automation/prospect-radar-next20/generated-stock-categories.js'),
);

test('a known vertical resolves to an approved board', () => {
  const [board] = resolveGeneratedStockAssignment({
    slug: 'germantown-dental', name: 'Germantown Dental Group', category: 'dentist',
  });
  assert.equal(board, 'germantown-dental-group');
});

test('advertising agency resolves to the approved board', () => {
  const [board] = resolveGeneratedStockAssignment({
    slug: 'digital-marketing-service-pro-west-chester-pa',
    name: 'Digital Marketing Service Pro West Chester PA',
    category: 'advertising agency',
  });
  assert.equal(board, 'category-advertising-agency');
});

test('smart-signs resolves to the signage board', () => {
  const [board] = resolveGeneratedStockAssignment({
    slug: 'smart-signs', name: 'Smart Signs', category: 'signage',
  });
  assert.equal(board, 'category-signage');
});

test('an unknown vertical refuses rather than guessing', () => {
  assert.throws(
    () => resolveGeneratedStockAssignment({
      slug: 'lasting-impressions', name: 'Lasting Impressions', category: 'unknown-vertical',
    }),
    /No relevant generated-stock category is approved/,
  );
});

// The batch-level contract: collect refusals, keep the resolvable sites.
function partitionBatch(sites) {
  const assigned = {};
  const unassigned = [];
  for (const s of sites) {
    try { assigned[s.slug] = resolveGeneratedStockAssignment(s); }
    catch (err) { unassigned.push({ slug: s.slug, reason: err.message }); }
  }
  return { assigned, unassigned };
}

test('one unapproved vertical does not sink the batch', () => {
  const batch = [
    { slug: 'a-pizza', category: 'pizzeria' },
    { slug: 'b-dental', category: 'dental' },
    { slug: 'c-observatory', category: 'observatory' },
  ];
  const { assigned, unassigned } = partitionBatch(batch);
  assert.equal(Object.keys(assigned).length, 2, 'resolvable sites must survive');
  assert.equal(unassigned.length, 1);
  assert.equal(unassigned[0].slug, 'c-observatory');
  // Expected asset count follows the assigned sites, not the batch size.
  assert.equal(Object.keys(assigned).length * 4, 8);
});

test('a batch with nothing resolvable still fails loudly', () => {
  const { assigned, unassigned } = partitionBatch([{ slug: 'x', category: 'observatory' }]);
  assert.equal(Object.keys(assigned).length, 0);
  assert.equal(unassigned.length, 1);
});
