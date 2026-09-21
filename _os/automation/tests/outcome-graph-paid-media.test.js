'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  evaluatePaidMediaLane,
  runPaidMediaPassDurable,
} = require('../lib/outcome-graph-paid-media');

const ACCOUNT_HASH = sha256('fixture-provider-account');
const DOWNSTREAM_HASH = sha256('fixture-downstream-source');

function checks(platform, complete) {
  const state = complete ? 'verified' : 'pending';
  return {
    session_account: { status: 'verified' },
    delivery_pacing: { status: state },
    conversion_tracking_dedup: { status: state },
    landing_page_health: { status: state },
    change_history: { status: state },
    budget_recommendation: { status: state },
    readback_freshness: { status: complete ? 'verified' : 'partial' },
    [platform === 'google-ads' ? 'search-terms-and-negatives' : 'creative-fatigue-and-placements']:
      { status: state },
  };
}

function fixtureLane(options = {}) {
  const platform = options.platform || 'meta-ads';
  const complete = options.complete === true;
  const observedAt = options.observedAt || '2026-08-24T13:00:00.000Z';
  const comparison = options.comparison || null;
  return {
    lane_id: 'meta-ads--fixture-client',
    client_id: 'fixture-client',
    platform,
    expected_delivery_state: 'active',
    historical_state_as_of: '2026-07-16',
    config: {
      lane_id: 'meta-ads--fixture-client',
      client_id: 'fixture-client',
      platform,
      config_locator: 'client-operations/clients/fixture-client/paid-media/config.json',
      config_sha256: 'a'.repeat(64),
      account_reference_sha256: 'b'.repeat(64),
      config_client_matches: true,
      planning_enabled: true,
      registry_route_count: 1,
      registry_route_active: true,
      access_binding: {
        state: 'resolved_authorized_read_only',
        matched_system_sha256: 'c'.repeat(64),
        findings: [],
      },
    },
    manifest: {
      routeState: { reviewEligibility: 'ready-for-read-only-review' },
      blockers: [],
      checks: [],
    },
    live: {
      lane_id: 'meta-ads--fixture-client',
      client_id: 'fixture-client',
      platform,
      observed_at: observedAt,
      account_binding_state: 'exact',
      provider_account_sha256: ACCOUNT_HASH,
      reporting_window: {
        start: '2026-08-17',
        end: '2026-08-23',
        timezone: 'America/New_York',
      },
      checks: checks(platform, complete),
      attribution: complete ? {
        status: 'verified',
        conversion_definition: 'Qualified booked appointment',
        attribution_window: '7-day click, 1-day view',
        latency_state: 'accounted',
        tracking_health: 'healthy',
        downstream_source_sha256: DOWNSTREAM_HASH,
        downstream_reconciled: true,
      } : {
        status: 'pending_validation',
        conversion_definition: null,
        attribution_window: null,
        latency_state: 'unverified',
        tracking_health: 'unverified',
        downstream_source_sha256: null,
        downstream_reconciled: false,
      },
      platform_claims: [{
        metric: 'form_leads',
        value: 24,
        definition_label: 'Platform-reported form leads',
        downstream_reconciled: complete,
      }],
      unpublished_draft_count: 1,
      proposals: complete ? [{
        hypothesis: 'One bounded evidence-backed test can improve qualified appointment efficiency.',
        metric: 'Qualified booked appointment rate',
        owner: 'Codex acting as Marketing Chief',
        approval_state: 'proposal_only_pending_exact_approval',
        next_review_state: 'Review after one complete attribution window',
      }] : [],
      ...(comparison ? { comparison } : {}),
    },
  };
}

function fixtureSources(routineId, lane, options = {}) {
  const sourceManifest = [
    { locator: 'fixture/roster.json', sha256: 'd'.repeat(64), bytes: 100 },
    { locator: 'fixture/live.json', sha256: 'e'.repeat(64), bytes: 200 },
    ...(options.passA ? [{
      locator: options.passA.locator,
      sha256: options.passA.sha256,
      bytes: options.passA.bytes,
    }] : []),
  ].sort((a, b) => a.locator.localeCompare(b.locator));
  return {
    routine_id: routineId,
    pass: routineId === 'W02' ? 'A' : 'B',
    review_date: '2026-08-24',
    cadence_bucket: routineId === 'W02' ? '2026-W35A' : '2026-W35B',
    captured_at: options.capturedAt || '2026-08-24T14:00:00.000Z',
    review_window: {
      start: '2026-08-24T00:00:00-04:00',
      endExclusive: '2026-08-25T00:00:00-04:00',
    },
    manifest_diagnostics: {
      declared_status: 'ready-for-read-only-review',
      lane_count: 1,
      non_verified_check_count: options.manifestPending ? 8 : 0,
      false_ready_detected: options.manifestPending === true,
      interpretation: 'Manifest readiness authorizes evidence collection only; it is not an outcome-complete paid-media review.',
    },
    live_snapshot: {
      locator: 'fixture/live.json',
      sha256: 'e'.repeat(64),
      observed_at: lane.live.observed_at,
      collector_states: { fixture: 'read_only' },
    },
    lanes: [lane],
    config_records: [lane.config],
    pass_a: options.passA || null,
    source_manifest: sourceManifest,
    source_set_sha256: sha256(stableJson(sourceManifest)),
  };
}

test('W02 durable shadow exposes false readiness, preserves pending attribution, and dedupes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paid-media-w02-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const template = fixtureSources('W02', fixtureLane({ complete: false }), {
    manifestPending: true,
  });
  let collections = 0;
  const collectSources = async () => {
    collections += 1;
    return template;
  };
  const options = {
    routineId: 'W02',
    reviewDate: '2026-08-24',
    outputDir,
    stateRoot,
    logicalRoot: 'fixture/W02/2026-W35A',
    safeOutput: false,
    collectSources,
  };

  try {
    const first = await runPaidMediaPassDurable(options);
    assert.equal(first.outcome, 'complete');
    assert.equal(first.terminal_truth, true);
    assert.equal(first.deduped, false);
    const review = JSON.parse(fs.readFileSync(path.join(outputDir, 'paid-media-review-a.json'), 'utf8'));
    assert.equal(review.manifest_diagnostics.false_ready_detected, true);
    assert.equal(review.summary.review_ready, 0);
    assert.equal(review.summary.held, 1);
    assert.equal(review.summary.conversion_reporting_pending_validation, 1);
    assert.equal(review.lanes[0].d17.passed, false);
    assert.equal(review.lanes[0].d18.passed, false);
    assert.equal(review.lanes[0].d18.client_language, 'Conversion reporting is pending validation');
    assert.equal(review.lanes[0].platform_claims[0].source_of_truth, false);
    assert.equal(review.lanes[0].authority.provider_mutation_attempted, false);
    const published = fs.readFileSync(path.join(outputDir, 'paid-media-review-a.json'), 'utf8') +
      fs.readFileSync(path.join(outputDir, 'source-ledger.json'), 'utf8');
    assert.doesNotMatch(published, /private@example\.com/i);
    assert.doesNotMatch(published, /access-broker:/i);
    assert.doesNotMatch(published, /resume_locator/i);

    const beforeDuplicate = collections;
    const duplicate = await runPaidMediaPassDurable(options);
    assert.equal(duplicate.outcome, 'complete');
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, first.run_id);
    assert.equal(collections, beforeDuplicate + 2);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('W02 freezes evaluation time so harmless recollection delay cannot break exact proof', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paid-media-w02-clock-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const template = fixtureSources('W02', fixtureLane({ complete: false }), {
    manifestPending: true,
  });
  let collections = 0;
  const collectSources = async () => {
    const capturedAt = new Date(Date.parse('2026-08-24T14:00:00.000Z') + collections * 2000)
      .toISOString();
    collections += 1;
    return { ...template, captured_at: capturedAt };
  };

  try {
    const result = await runPaidMediaPassDurable({
      routineId: 'W02',
      reviewDate: '2026-08-24',
      outputDir,
      stateRoot,
      logicalRoot: 'fixture/W02/2026-W35A-clock',
      safeOutput: false,
      collectSources,
    });
    assert.equal(result.outcome, 'complete');
    assert.equal(result.terminal_truth, true);
    const review = JSON.parse(fs.readFileSync(path.join(outputDir, 'paid-media-review-a.json'), 'utf8'));
    assert.equal(review.lanes[0].source_freshness.age_hours, 1.001);
    assert.ok(collections >= 5);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('W03 binds the exact W02 artifact and rejects a non-distinct observation', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paid-media-w03-test-'));
  const w02Output = path.join(root, 'w02-output');
  const w03Output = path.join(root, 'w03-output');
  const stateRoot = path.join(root, 'state');
  const w02Sources = fixtureSources('W02', fixtureLane({ complete: true }));

  try {
    const passAResult = await runPaidMediaPassDurable({
      routineId: 'W02',
      reviewDate: '2026-08-24',
      outputDir: w02Output,
      stateRoot,
      logicalRoot: 'fixture/W02/2026-W35A',
      safeOutput: false,
      collectSources: async () => w02Sources,
    });
    assert.equal(passAResult.terminal_truth, true);
    const passAFile = path.join(w02Output, 'paid-media-review-a.json');
    const passABytes = fs.readFileSync(passAFile);
    const passAArtifact = JSON.parse(passABytes.toString('utf8'));
    const passA = {
      locator: 'fixture/W02/paid-media-review-a.json',
      sha256: sha256(passABytes),
      bytes: passABytes.length,
      artifact: passAArtifact,
      by_lane: new Map(passAArtifact.lanes.map((record) => [record.lane_id, record])),
    };
    const sameObservationLane = fixtureLane({
      complete: true,
      observedAt: '2026-08-24T13:00:00.000Z',
      comparison: {
        baseline_artifact_sha256: passA.sha256,
        classification: 'changed',
        prior_test: {
          hypothesis: 'The predeclared test improves qualified appointment rate.',
          metric: 'Qualified booked appointment rate',
          decision: 'hold',
          evidence_sha256s: [DOWNSTREAM_HASH],
        },
      },
    });
    const w03Sources = fixtureSources('W03', sameObservationLane, { passA });
    const result = await runPaidMediaPassDurable({
      routineId: 'W03',
      reviewDate: '2026-08-24',
      outputDir: w03Output,
      stateRoot,
      logicalRoot: 'fixture/W03/2026-W35B',
      safeOutput: false,
      collectSources: async () => w03Sources,
    });
    assert.equal(result.outcome, 'complete');
    assert.equal(result.terminal_truth, true);
    const review = JSON.parse(fs.readFileSync(path.join(w03Output, 'paid-media-review-b.json'), 'utf8'));
    assert.equal(review.summary.review_ready, 0);
    assert.equal(review.lanes[0].pass_a_binding.artifact_sha256, passA.sha256);
    assert.equal(review.lanes[0].pass_a_binding.declared_hash_matches, true);
    assert.equal(review.lanes[0].pass_a_binding.scope_revalidated, true);
    assert.equal(review.lanes[0].pass_a_binding.distinct_observation, false);
    assert.equal(review.lanes[0].trend.state, 'held_no_distinct_observation');
    assert.ok(review.lanes[0].findings.includes('second-observation-not-later-than-pass-a'));

    const laterLane = fixtureLane({
      complete: true,
      observedAt: '2026-08-25T13:00:00.000Z',
      comparison: sameObservationLane.live.comparison,
    });
    const readyRecord = evaluatePaidMediaLane(laterLane, {
      routine_id: 'W03',
      cadence_bucket: '2026-W35B',
      captured_at: '2026-08-25T14:00:00.000Z',
      pass_a_sha256: passA.sha256,
      pass_a_by_lane: passA.by_lane,
    });
    assert.equal(readyRecord.pass_a_binding.distinct_observation, true);
    assert.equal(readyRecord.trend.state, 'changed');
    assert.equal(readyRecord.review_ready, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
