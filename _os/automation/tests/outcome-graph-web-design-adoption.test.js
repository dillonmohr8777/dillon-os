const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const adoptionPath = path.join(
  repoRoot,
  'System',
  'outcome-graph',
  'web-design',
  'production-adoption-2026-08-24.json'
);

function loadAdoption() {
  return JSON.parse(fs.readFileSync(adoptionPath, 'utf8'));
}

test('manual web-design adoption binds the approved 239-site estate without scheduler or delivery authority', () => {
  const adoption = loadAdoption();
  const portfolio = adoption.estate.primary_portfolio;
  const prospects = adoption.estate.momentum_prospect_pages;

  assert.equal(adoption.decision.state, 'adopted_manual_event');
  assert.equal(adoption.decision.routine_id, 'WEB-DESIGN-CLOSED-LOOP');
  assert.equal(adoption.estate.logical_site_records_target, 239);
  assert.equal(portfolio.logical_site_records + prospects.logical_site_records_requested, 239);
  assert.equal(portfolio.build_variants.length, 2);
  assert.equal(portfolio.deployment_targets_state, 'exact_existing_targets_verified');
  assert.equal(adoption.estate.possible_build_routes_target, 240);
  assert.equal(
    prospects.current_states.cleared_to_show +
      prospects.current_states.hold_for_repair +
      prospects.current_states.do_not_pitch,
    238
  );
  assert.equal(prospects.predecessor_unique_slugs, 245);
  assert.equal(prospects.current_state, 'identity_reconciled_logo_candidates_screened_fail_closed');
  assert.equal(prospects.reconciliation_result.stable_page_ids, 238);
  assert.equal(prospects.reconciliation_result.stable_business_ids, 236);
  assert.deepEqual(
    {
      retain: prospects.reconciliation_result.retain,
      repair: prospects.reconciliation_result.repair,
      exclude: prospects.reconciliation_result.exclude,
    },
    { retain: 133, repair: 87, exclude: 18 }
  );
  assert.equal(prospects.reconciliation_result.active_waves, 12);
  assert.equal(prospects.reconciliation_result.terminal_exclusion_waves, 1);
  assert.equal(prospects.reconciliation_result.total_waves, 13);
  assert.equal(prospects.wave_plan_state, 'portfolio_terminal_passed_held_for_exact_logo_source_authority');
  assert.deepEqual(prospects.particle_logo_screen, {
    candidate_extracted: 187,
    visual_screen_pass_pending_source_match: 135,
    rejected: 35,
    manual_source_match_hold: 17,
    held_logo_candidate_missing: 32,
    held_page_fetch: 1,
    exact_logo_verified: 0,
    registry_eligible: 0,
  });
  assert.equal(adoption.execution_contract.prospect_wave_size, 20);
  assert.equal(adoption.execution_contract.max_parallel, 3);
  assert.equal(adoption.execution_contract.maker_checker_must_differ, true);
  assert.equal(adoption.execution_contract.terminal_rerender_required, true);
  assert.equal(adoption.acceptance.engineering_gates.length, 10);
  assert.equal(adoption.authority.scheduler_mutation_authorized, false);
  assert.equal(adoption.authority.canonical_queue_write_authorized, false);
  assert.equal(adoption.authority.external_send_authorized, false);
  assert.equal(adoption.authority.deployment_authorized_by_this_record, false);
});

test('adoption preserves the immutable E11 routine definition binding', () => {
  const adoption = loadAdoption();
  const definition = adoption.decision.routine_definition;
  const definitionPath = path.join(repoRoot, ...definition.locator.split('/'));
  assert.equal(fs.existsSync(definitionPath), true);

  const crypto = require('node:crypto');
  const actual = crypto.createHash('sha256').update(fs.readFileSync(definitionPath)).digest('hex');
  assert.equal(actual, definition.sha256);
});

test('adoption binds the row-level identity reconciliation by hash', () => {
  const adoption = loadAdoption();
  const prospects = adoption.estate.momentum_prospect_pages;
  const crypto = require('node:crypto');
  for (const [locatorKey, hashKey] of [
    ['current_row_snapshot_locator', 'current_row_snapshot_sha256'],
    ['identity_aliases_locator', 'identity_aliases_sha256'],
    ['reconciled_manifest_locator', 'reconciled_manifest_sha256'],
    ['wave_plan_locator', 'wave_plan_sha256'],
    ['particle_logo_candidate_manifest_locator', 'particle_logo_candidate_manifest_sha256'],
    ['particle_logo_review_findings_locator', 'particle_logo_review_findings_sha256'],
  ]) {
    const file = path.join(repoRoot, ...prospects[locatorKey].split('/'));
    assert.equal(fs.existsSync(file), true);
    const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    assert.equal(actual, prospects[hashKey]);
  }
});

test('adoption binds the exact existing portfolio deployment targets by hash', () => {
  const adoption = loadAdoption();
  const portfolio = adoption.estate.primary_portfolio;
  const file = path.join(repoRoot, ...portfolio.deployment_targets_locator.split('/'));
  const crypto = require('node:crypto');
  assert.equal(fs.existsSync(file), true);
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(actual, portfolio.deployment_targets_sha256);

  const receipt = path.join(repoRoot, ...portfolio.terminal_receipt_locator.split('/'));
  assert.equal(fs.existsSync(receipt), true);
  const receiptHash = crypto.createHash('sha256').update(fs.readFileSync(receipt)).digest('hex');
  assert.equal(receiptHash, portfolio.terminal_receipt_sha256);
});
