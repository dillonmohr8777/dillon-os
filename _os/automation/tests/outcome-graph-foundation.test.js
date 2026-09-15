'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  adapterFor,
  collectFoundationSources,
} = require('../lib/outcome-graph-foundation');

function evaluate(routineId, sources) {
  const adapter = adapterFor(routineId);
  const context = {
    routine_id: routineId,
    captured_at: sources.captured_at,
    source_set_sha256: sources.source_set_sha256,
  };
  const items = adapter.buildItems(sources);
  const records = items.map((item) => adapter.evaluateItem(item, sources, context));
  const artifacts = adapter.reduce(records, sources, context);
  const assertions = adapter.terminalAssertions({
    actualArtifacts: artifacts,
    expectedRecords: records,
  });
  assert.equal(assertions.every((assertion) => typeof assertion.passed === 'boolean'), true);
  assert.equal(assertions.every((assertion) => assertion.passed === true), true);
  return { items, records, artifacts };
}

test('D10 and D11 turn the exact request into a bounded contract and dependency graph', async () => {
  const sources = await collectFoundationSources({ capturedAt: '2026-08-24T23:50:00.000Z' });
  const d10 = evaluate('D10', sources);
  assert.equal(d10.records.length, 1);
  assert.equal(d10.records[0].observable, true);
  assert.equal(d10.records[0].materially_broadened, false);
  assert.ok(d10.records[0].lifecycle_states.includes('adopted_by_marketing_chief'));

  const d11 = evaluate('D11', sources);
  assert.equal(d11.records.length, 6);
  assert.equal(new Set(d11.records.map((record) => record.work_isolation)).size, 6);
  assert.equal(d11.records.every((record) => record.grants_new_authority === false), true);
  assert.equal(d11.artifacts['approval-map.json'].forbidden_self_grant, true);
});

test('D12 binds the exact dirty worktree while D13 truthfully holds incomplete design context', async () => {
  const sources = await collectFoundationSources({ capturedAt: '2026-08-24T23:50:00.000Z' });
  const d12 = evaluate('D12', sources);
  assert.equal(d12.records[0].repository.exact, true);
  assert.equal(d12.records[0].dirty_tree.classified, true);
  assert.equal(d12.records[0].deployment_mapping.state, 'local_only_verified');
  assert.equal(d12.records[0].authority.worktree_mutation_attempted, false);

  const d13 = evaluate('D13', sources);
  assert.equal(d13.records[0].mode, 'Persuade');
  assert.equal(d13.records[0].context_probe.passed, true);
  assert.equal(d13.records[0].design_system_test.passed, true);
  assert.equal(d13.records[0].design_system_test.gate, 'no-ui-implementation');
  assert.equal(d13.records[0].design_system_test.design_is_seed, true);
  assert.equal(d13.records[0].context_probe.surface_brief_present, false);
  assert.equal(d13.records[0].context_probe.visual_implementation_detected, false);
  assert.equal(d13.records[0].workflow_ready, false);
  assert.equal(d13.records[0].outcome_state, 'held_design_context_incomplete');
});

test('foundation negative states remain distinct from graph completion and external authority', async () => {
  const sources = await collectFoundationSources({ capturedAt: '2026-08-24T23:50:00.000Z' });

  const d14 = evaluate('D14', sources);
  assert.equal(d14.records.length, 8);
  assert.equal(d14.artifacts['build-receipt.json'].workflow_ready, false);
  assert.equal(d14.artifacts['independent-qa.json'].verdict, 'blocked');
  assert.equal(d14.artifacts['build-receipt.json'].authority.deployment_attempted, false);

  const d16 = evaluate('D16', sources);
  assert.equal(d16.records[0].outcome_state, 'no_trigger');
  assert.equal(d16.artifacts['content-artifact.json'].content, null);
  assert.equal(d16.records[0].material_claims.length, 0);

  const d24 = evaluate('D24', sources);
  assert.equal(d24.records[0].exact_artifact_hash_reproduced, true);
  assert.equal(d24.records[0].verdict, 'blocked');
  assert.ok(d24.records[0].defects.length > 0);

  const d25 = evaluate('D25', sources);
  assert.equal(d25.records[0].status.graph, 'complete');
  assert.equal(d25.records[0].status.business, 'held');
  assert.equal(d25.records[0].status.deployed, false);
  assert.equal(d25.records[0].status.sent, false);
  assert.equal(d25.records[0].canonical_adoption_attempted, false);

  const e05 = evaluate('E05', sources);
  assert.equal(e05.records[0].onboarding_state, 'known_repository_route_revalidated');
  assert.equal(e05.records[0].implementation_authorized, false);
});
