'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  adapterFor,
  d17Artifacts,
  d18Artifacts,
  d19Artifacts,
  d19Items,
  evaluateD17,
  evaluateD18,
  evaluateD19,
  laneItems,
} = require('../lib/outcome-graph-performance');

function fixtureSources() {
  const manifest = [{ locator: 'fixture/source.json', sha256: 'a'.repeat(64), bytes: 100 }];
  return {
    captured_at: '2026-08-24T15:00:00.000Z',
    binding_version: 'fixture-v1',
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
    paid_media: {
      review_date: '2026-08-24',
      cadence_bucket: '2026-W35A',
      source_set_sha256: 'b'.repeat(64),
      source_count: 2,
      summary: { lanes: 1 },
      lanes: [{
        lane_id: 'google-ads--fixture-client',
        client_id: 'fixture-client',
        platform: 'google-ads',
        route_binding: { ready: true },
        account_binding: {
          state: 'unverified',
          exact: false,
          provider_account_sha256: null,
        },
        source_freshness: {
          fresh: true,
          age_hours: 0.5,
          observed_at: '2026-08-24T14:30:00.000Z',
        },
        d17: {
          passed: false,
          checks: {
            session_account: 'blocked',
            delivery_pacing: 'pending',
            conversion_tracking_dedup: 'pending',
          },
          reporting_window_explicit: false,
        },
        d18: {
          passed: false,
          conversion_definition_present: false,
          attribution_window_present: false,
          latency_state: 'unverified',
          tracking_health: 'unverified',
          downstream_source_bound: false,
          downstream_reconciled: false,
        },
        platform_claims: [{
          metric: 'form_leads',
          value: 3,
          definition_label: 'Platform-reported form leads',
          source_of_truth: false,
          downstream_reconciled: false,
        }],
        findings: ['d18-attribution-and-downstream-pending-validation'],
      }],
    },
    reporting: {
      reporting_window: '2026-08-17 through 2026-08-23',
      summary: { discovered: 1, passed: 1 },
      packages: [{
        client_id: 'fixture-client',
        client_status: 'active',
        reporting_window: '2026-08-17 through 2026-08-23',
        prepared: '2026-08-24',
        evidence_mode: 'read-only',
        metrics: [['Visits', '100'], ['Qualified leads', '4']],
        checks: [{ id: 'metric-values-render-from-source-ledger', passed: true }],
        passed: true,
        source_ledger: [{
          locator: 'fixture/report.json',
          sha256: 'c'.repeat(64),
          bytes: 200,
        }],
        delivery_readiness: { state: 'pending_exact_route_and_approval' },
        validation_fingerprint: 'd'.repeat(64),
      }],
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

test('D17 keeps inaccessible delivery fields pending and never estimates them', () => {
  const sources = fixtureSources();
  const items = laneItems(sources);
  const records = items.map((item) => evaluateD17(item, sources, context('D17', sources)));
  assert.equal(records[0].outcome_state, 'held_pending_exact_evidence');
  assert.equal(records[0].spend_state, 'pending_not_estimated');
  assert.equal(records[0].pending_fields.length, 5);
  assert.equal(records[0].pending_fields.every((field) => field.estimated === false), true);
  const artifacts = d17Artifacts(records, sources, context('D17', sources));
  assert.equal(artifacts['paid-media-evidence.json'].summary.evidence_ready, 0);
  assert.equal(artifacts['tracking-health.json'].unavailable_fields_are_pending_not_estimated, true);
  const assertions = adapterFor('D17').terminalAssertions({
    actualArtifacts: artifacts,
    expectedRecords: records,
  });
  assert.equal(assertions.every((assertion) => assertion.passed === true), true);
});

test('D18 preserves neutral pending-validation language and rejects platform claims as truth', () => {
  const sources = fixtureSources();
  const records = laneItems(sources).map((item) =>
    evaluateD18(item, sources, context('D18', sources))
  );
  assert.equal(records[0].outcome_state, 'pending_validation');
  assert.equal(records[0].client_language, 'Conversion reporting is pending validation');
  assert.equal(records[0].platform_claims[0].source_of_truth, false);
  assert.equal(records[0].lead_quality_state, 'pending_validation');
  const artifacts = d18Artifacts(records, sources, context('D18', sources));
  assert.equal(artifacts['attribution-validation.json'].summary.pending_validation, 1);
  const assertions = adapterFor('D18').terminalAssertions({
    actualArtifacts: artifacts,
    expectedRecords: records,
  });
  assert.equal(assertions.every((assertion) => assertion.passed === true), true);
});

test('D19 recomputes retained report fields and keeps local proof separate from delivery', () => {
  const sources = fixtureSources();
  const records = d19Items(sources).map((item) =>
    evaluateD19(item, sources, context('D19', sources))
  );
  assert.equal(records[0].kpi_fields_recomputed, true);
  assert.equal(records[0].outcome_state, 'verified_local_report_unsent');
  assert.equal(records[0].delivery_state, 'pending_exact_route_and_approval');
  assert.equal(records[0].authority.delivery_attempted, false);
  const artifacts = d19Artifacts(records, sources, context('D19', sources));
  assert.equal(artifacts['report.json'].summary.verified_local, 1);
  assert.equal(artifacts['report.json'].summary.pending_external_delivery, 1);
  const assertions = adapterFor('D19').terminalAssertions({
    actualArtifacts: artifacts,
    expectedRecords: records,
  });
  assert.equal(assertions.every((assertion) => assertion.passed === true), true);
});
