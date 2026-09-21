'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertArtifactPrivacy } = require('../lib/outcome-graph-source-bound');
const {
  GOVERNANCE_IDS,
  adapterFor,
  collectGovernanceSources,
} = require('../lib/outcome-graph-governance');

async function evaluate(routineId) {
  const sources = await collectGovernanceSources({
    routineId,
    capturedAt: '2026-08-24T23:59:00.000Z',
  });
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
    expectedArtifacts: artifacts,
    expectedRecords: records,
    freshSources: sources,
    planSources: sources,
  });
  assert.equal(assertions.every((assertion) => typeof assertion.passed === 'boolean'), true);
  assert.equal(assertions.every((assertion) => assertion.passed === true), true);
  for (const artifact of Object.values(artifacts)) {
    assert.deepEqual(assertArtifactPrivacy(artifact), []);
  }
  return { sources, items, records, artifacts };
}

test('governance catalog exposes only the six remaining bounded routines', () => {
  assert.deepEqual(GOVERNANCE_IDS, ['D26', 'M02', 'M03', 'M04', 'M05', 'E11']);
});

test('D26 produces one reversible proposal for the existing High Craft note', async () => {
  const result = await evaluate('D26');
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].duplicate_search.existing_destination_found, true);
  assert.equal(result.records[0].duplicate_search.new_canonical_note_needed, false);
  assert.equal(result.records[0].lesson.graph_ready_is_not_production_ready, true);
  assert.equal(result.records[0].lesson.rendered_checker_findings_feed_next_attempt, true);
  assert.equal(result.records[0].lesson.deployment_remained_closed, true);
  assert.equal(result.sources.source_manifest.some((source) =>
    source.locator.includes('Perfect outcome graph engineering.md')), false);
  const proposal = result.artifacts['outcome-graph-knowledge-proposal.md'];
  assert.match(proposal, /canonical_write_attempted: false/);
  assert.match(proposal, /Do not create a second canonical concept page/);
});

test('M02 evaluates all 21 agents while preserving authority and unresolved risks', async () => {
  const result = await evaluate('M02');
  const scorecard = result.artifacts['agent-evaluation-scorecard.json'];
  assert.equal(result.records.length, 21);
  assert.equal(scorecard.summary.agents, 21);
  assert.ok(scorecard.summary.revise > 0);
  assert.ok(scorecard.summary.command_center_name_collisions >= 1);
  assert.equal(scorecard.summary.permission_changes, 0);
  assert.equal(scorecard.summary.deletions, 0);
  assert.equal(result.sources.evidence_index.some((sample) => GOVERNANCE_IDS.includes(sample.routine_id)), false);
  assert.equal(result.records.every((record) => ['retain', 'revise', 'retire'].includes(record.disposition)), true);
});

test('M03 keeps all ten schedule costs pending instead of inventing zero', async () => {
  const result = await evaluate('M03');
  const report = result.artifacts['automation-value-cost-report.json'];
  const inventory = result.artifacts['schedule-inventory.json'];
  assert.equal(result.records.length, 10);
  assert.equal(inventory.schedules.length, 10);
  assert.equal(report.summary.invented_zero_costs, 0);
  assert.equal(report.summary.costs_pending_validation, 10);
  assert.equal(result.records.every((record) => record.cost.amount === null), true);
  const scheduledEvidence = new Set(result.sources.registry.routines
    .filter((routine) => routine.schedule_card && routine.routine_id !== 'M03')
    .map((routine) => routine.routine_id));
  assert.equal(result.sources.evidence_index.every((sample) => scheduledEvidence.has(sample.routine_id)), true);
  assert.equal(inventory.schedule_changes, 0);
  assert.equal(inventory.subscription_changes, 0);
  assert.equal(inventory.billing_changes, 0);
});

test('M04 maps or quarantines all six surfaces for every canonical client using hash-only identity evidence', async () => {
  const result = await evaluate('M04');
  const audit = result.artifacts['client-separation-audit.json'];
  const quarantine = result.artifacts['quarantine-proposals.json'];
  assert.equal(audit.summary.canonical_clients, result.sources.clients.length);
  assert.equal(result.records.length, audit.summary.canonical_clients * 6);
  assert.equal(new Set(result.records.map((record) => record.surface)).size, 6);
  assert.equal(result.records.every((record) =>
    ['mapped_exactly_one_client', 'quarantine_proposed'].includes(record.mapping_state)), true);
  assert.equal(audit.overlap_groups.every((group) => /^[a-f0-9]{64}$/.test(group.value_sha256)), true);
  assert.equal(quarantine.proposals.length, audit.summary.quarantined);
  assert.equal(quarantine.applied_moves, 0);
  assert.equal(quarantine.provider_mutations, 0);
});

test('M05 exposes the missing visual authority and repaired Windows preflight without overwriting docs', async () => {
  const result = await evaluate('M05');
  const proposals = result.artifacts['documentation-refresh-proposal.json'];
  const conflicts = result.artifacts['authority-conflict-map.json'];
  assert.equal(result.records.length, 4);
  assert.ok(conflicts.conflicts.some((conflict) => conflict.rule_id === 'missing-visual-direction-output'));
  const preflight = result.records.find((record) => record.id === 'windows-design-preflight-regression');
  assert.equal(preflight.current_state, 'repaired_needs_regression_contract');
  assert.equal(proposals.applied_updates, 0);
  assert.equal(conflicts.generated_sidecar_changes, 0);
  assert.equal(conflicts.silent_overwrites, 0);

  const namespacedRecords = result.records.map((record) => ({
    ...record,
    id: `M05:${record.id}`,
  }));
  const namespacedArtifacts = adapterFor('M05').reduce(namespacedRecords, result.sources, {
    routine_id: 'M05',
    captured_at: result.sources.captured_at,
    source_set_sha256: result.sources.source_set_sha256,
  });
  const namespaceAssertions = adapterFor('M05').terminalAssertions({
    actualArtifacts: namespacedArtifacts,
    expectedArtifacts: namespacedArtifacts,
    expectedRecords: namespacedRecords,
    freshSources: result.sources,
    planSources: result.sources,
  });
  assert.equal(namespaceAssertions.every((assertion) => assertion.passed === true), true);
});

test('E11 proposes the unique checker-to-maker feedback edge with positive and negative canaries', async () => {
  const result = await evaluate('E11');
  const definition = result.artifacts['routine-definition.json'];
  const canary = result.artifacts['synthetic-canary-receipt.json'];
  const ledger = result.artifacts['manifest-ledger-proposal.json'];
  assert.equal(result.records.length, 1);
  assert.equal(definition.overlap_analysis.duplicate, false);
  assert.match(definition.overlap_analysis.unique_delta, /feedback edge/);
  assert.equal(canary.positive_and_negative_cases_pass, true);
  assert.equal(canary.production_ready, false);
  assert.equal(ledger.state, 'proposal_only');
  assert.equal(ledger.registry_mutated, false);
  assert.equal(ledger.scheduler_mutated, false);
  assert.equal(ledger.permissions_expanded, false);
});
