'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  adapterFor,
  d03Artifacts,
  d03RawItems,
  d07Artifacts,
  d07Items,
  e04Artifacts,
  e04Items,
  e10Artifacts,
  e10Items,
  evaluateD03,
  evaluateD07,
  evaluateE04,
  evaluateE10,
} = require('../lib/outcome-graph-reliability');

function fixtureSources({ healthy = false, inboundReplyVerified = false, conflicts = 0 } = {}) {
  const capturedAt = '2026-08-24T15:00:00.000Z';
  const connectorObservedAt = healthy
    ? '2026-08-24T14:00:00.000Z'
    : '2026-08-18T19:25:22.000Z';
  const manifest = [
    { locator: '11_Agents/claude-operating-team.json', sha256: '1'.repeat(64), bytes: 100 },
    { locator: '12_Brain/state/connector-health.json', sha256: '2'.repeat(64), bytes: 200 },
    { locator: 'System/gateway-health.md', sha256: '3'.repeat(64), bytes: 300 },
    {
      locator: 'System/outcome-graph/source-snapshots/paid-media-live-2026-08-24.json',
      sha256: '4'.repeat(64),
      bytes: 400,
    },
  ];
  return {
    routine_id: null,
    captured_at: capturedAt,
    binding_version: 'fixture-v1',
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
    scheduled_inventory: [{ routine_id: 'D01', schedule: 'fixture', checkpoint_declared: true }],
    scheduled_delivery_bindings_verified: healthy,
    driver_state: {
      last_cycle_utc: '2026-08-24T14:50:00.000Z',
      outcome: 'noop',
      consecutive_failures: 0,
      routines_executed_this_cycle: 0,
      eligible_at_cycle: 0,
      canonical_write_attempted: false,
      external_action_attempted: false,
    },
    driver_log_tail: { outcome: 'noop' },
    usage_state: {
      date: '2026-08-24',
      cycles: 1,
      routines_executed: 0,
      max_routines_per_day: 10,
      updated_utc: '2026-08-24T14:50:00.000Z',
    },
    loop_checkpoint: {
      sha256: '5'.repeat(64),
      routine_ids: healthy ? ['D01', 'D02'] : ['D19'],
      durable_coverage_verified: healthy,
    },
    connector_state: {
      recorded_at_utc: connectorObservedAt,
      recorded_by: 'fixture',
      connectors: [{
        toolkit: 'fixture-connector',
        status: 'active',
        read_verified: true,
        last_verified_utc: connectorObservedAt,
      }],
    },
    gateway: {
      frontmatter: {
        state: healthy ? 'HEALTHY' : 'STALE-WARN',
        heartbeat_age_sec: healthy ? 30 : 7200,
        conflicts_1h: conflicts,
        conflicts_6h: conflicts,
        conflicts_24h: conflicts,
      },
      process_identity_verified: true,
      retained_connected_only: true,
      log_advancement_unproven: !healthy,
      recommended_soft_restart: !healthy,
      sustained_inbound_and_reply_behavior_verified: inboundReplyVerified,
    },
    routine_monitor: {
      last_checked: healthy ? '2026-08-24T14:30:00.000Z' : '2026-04-15T10:00:00.000Z',
    },
    automation_status: {
      last_updated: healthy ? '2026-08-24T14:30:00.000Z' : '2026-07-12T10:00:00.000Z',
    },
    legacy_audit: {
      counts: { receipts_with_false_completion_risk: healthy ? 0 : 2 },
      receipt_risk_counts: {},
      verdict: healthy ? 'verified' : 'false-completion-risk',
      finding: healthy ? null : 'fixture-risk',
    },
    paid_media_collectors: {
      observed_at: connectorObservedAt,
      states: {},
    },
  };
}

function context(routineId, sources) {
  return {
    routine_id: routineId,
    captured_at: sources.captured_at,
    source_set_sha256: sources.source_set_sha256,
  };
}

function recordsFor(items, evaluate, routineId, sources) {
  return items.map((item) => evaluate(item, sources, context(routineId, sources)));
}

test('D03 separates scheduled inventory from delivery and preserves current connector freshness', () => {
  const stale = fixtureSources();
  const staleRecords = recordsFor(d03RawItems(stale), evaluateD03, 'D03', stale);
  const scheduled = staleRecords.find((record) => record.id === 'scheduled-inventory');
  const connectors = staleRecords.find((record) => record.id === 'external-connectors');
  assert.equal(scheduled.classification, 'inventory_verified_delivery_unverified');
  assert.equal(scheduled.details.delivery_bindings_verified, false);
  assert.equal(connectors.classification, 'blocked_stale_connector_evidence');
  assert.equal(connectors.details.usable, 0);
  const staleArtifacts = d03Artifacts(staleRecords, stale, context('D03', stale));
  assert.equal(staleArtifacts['automation-health-brief.json'].summary.workflow_ready, false);

  const healthy = fixtureSources({ healthy: true });
  const healthyRecords = recordsFor(d03RawItems(healthy), evaluateD03, 'D03', healthy);
  assert.equal(
    healthyRecords.find((record) => record.id === 'scheduled-inventory').classification,
    'inventory_and_delivery_verified'
  );
  assert.equal(
    healthyRecords.find((record) => record.id === 'external-connectors').classification,
    'connectors_verified_current'
  );
  assert.equal(healthyRecords.every((record) => record.failure === false), true);
});

test('D07 incident fingerprints ignore unrelated source-set churn and emit an explicit no-trigger receipt', () => {
  const stale = fixtureSources();
  const first = d07Items(stale);
  const changedManifestOnly = structuredClone(stale);
  changedManifestOnly.source_set_sha256 = 'f'.repeat(64);
  const second = d07Items(changedManifestOnly);
  assert.deepEqual(
    first.map((item) => item.snapshot.fingerprint).sort(),
    second.map((item) => item.snapshot.fingerprint).sort()
  );

  const healthy = fixtureSources({ healthy: true });
  const items = d07Items(healthy);
  assert.equal(items.length, 1);
  assert.equal(items[0].snapshot.no_open_incidents, true);
  const records = recordsFor(items, evaluateD07, 'D07', healthy);
  const artifacts = d07Artifacts(records, healthy, context('D07', healthy));
  assert.equal(artifacts['incident-triage.json'].summary.open_incidents, 0);
  assert.equal(artifacts['incident-triage.json'].summary.no_open_incidents, true);
  assert.equal(artifacts['incident-triage.json'].incidents.length, 0);
  assert.equal(
    artifacts['incident-triage.json'].no_incident_receipt.outcome_state,
    'triaged_no_incidents'
  );
});

test('E04 preserves failed checkpoints and handles a current no-recovery state explicitly', () => {
  const stale = fixtureSources();
  const staleItems = e04Items(stale);
  assert.equal(staleItems.length, 1);
  const staleRecords = recordsFor(staleItems, evaluateE04, 'E04', stale);
  assert.equal(staleRecords[0].recovery_state, 'blocked_preserved_state');
  assert.equal(staleRecords[0].checkpoint_preserved, true);
  assert.equal(staleRecords[0].checkpoint_advanced, false);
  assert.equal(staleRecords[0].supported_recovery_attempted, false);

  const healthy = fixtureSources({ healthy: true });
  const healthyItems = e04Items(healthy);
  assert.equal(healthyItems.length, 1);
  assert.equal(healthyItems[0].snapshot.no_recovery_required, true);
  const healthyRecords = recordsFor(healthyItems, evaluateE04, 'E04', healthy);
  const artifacts = e04Artifacts(healthyRecords, healthy, context('E04', healthy));
  assert.equal(healthyRecords[0].recovery_state, 'not_required');
  assert.equal(artifacts['recovery-or-blocked-receipt.json'].summary.connectors, 0);
  assert.equal(artifacts['recovery-or-blocked-receipt.json'].summary.no_recovery_required, true);
  assert.equal(artifacts['recovery-or-blocked-receipt.json'].summary.workflow_ready, true);
});

test('E10 requires explicit inbound and reply proof and does not infer it from a live process', () => {
  const processOnly = fixtureSources({ healthy: true, inboundReplyVerified: false });
  const held = recordsFor(e10Items(processOnly), evaluateE10, 'E10', processOnly)[0];
  assert.equal(held.process_identity_verified, true);
  assert.equal(held.heartbeat_current, true);
  assert.equal(held.log_advancement_verified, true);
  assert.equal(held.sustained_inbound_and_reply_behavior_verified, false);
  assert.match(held.outcome_state, /held_pending/);
  const heldArtifacts = e10Artifacts([held], processOnly, context('E10', processOnly));
  const heldAssertions = adapterFor('E10').terminalAssertions({
    actualArtifacts: heldArtifacts,
    expectedRecords: [held],
  });
  assert.equal(heldAssertions.every((assertion) => typeof assertion.passed === 'boolean'), true);
  assert.equal(heldAssertions.every((assertion) => assertion.passed), true);

  const proven = fixtureSources({ healthy: true, inboundReplyVerified: true });
  const verified = recordsFor(e10Items(proven), evaluateE10, 'E10', proven)[0];
  assert.equal(verified.sustained_inbound_and_reply_behavior_verified, true);
  assert.equal(verified.outcome_state, 'runtime_verified');
  const verifiedArtifacts = e10Artifacts([verified], proven, context('E10', proven));
  const assertions = adapterFor('E10').terminalAssertions({
    actualArtifacts: verifiedArtifacts,
    expectedRecords: [verified],
  });
  assert.equal(assertions.every((assertion) => assertion.passed), true);

  const conflicted = fixtureSources({
    healthy: true,
    inboundReplyVerified: true,
    conflicts: 1,
  });
  const conflictRecord = recordsFor(e10Items(conflicted), evaluateE10, 'E10', conflicted)[0];
  assert.equal(conflictRecord.competing_workers_observed, true);
  assert.match(conflictRecord.outcome_state, /held_pending/);
});
