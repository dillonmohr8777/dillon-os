'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, stableJson } = require('../lib/outcome-graph');
const {
  FINAL_NAMES,
  GATE_IDS,
  SUCCESS_FILES,
  aggregatePreflight,
  rejectionCategory,
  runWebsiteFactoryDurable,
} = require('../lib/outcome-graph-website-factory');

function fixtureSources({ verified = false } = {}) {
  const manifest = [
    { locator: 'fixture/latest-daily-state.json', sha256: '1'.repeat(64), bytes: 200 },
    { locator: 'fixture/PREFLIGHT-EVIDENCE.json', sha256: '2'.repeat(64), bytes: 400 },
    { locator: 'fixture/legacy-W05.jsonl', sha256: '3'.repeat(64), bytes: 300 },
  ];
  const sourceSet = sha256(stableJson(manifest));
  const ready = verified ? 20 : 6;
  const present = verified ? [...SUCCESS_FILES] : ['PREFLIGHT-EVIDENCE.json'];
  return {
    captured_at: '2026-08-24T20:00:00.000Z',
    run_id: '20260824-052002',
    operational_state: {
      status: verified ? 'complete' : 'blocked',
      updated_at: '2026-08-24T09:33:38.000Z',
      source_age_seconds: 3600,
      source_fresh: true,
      mail_ready: 'hold',
      local_only_claimed: true,
      no_external_delivery_claimed: true,
    },
    preflight: {
      candidate_pool: 73,
      ready_count: ready,
      rejected_count: 73 - ready,
      ready_unique_identity_count: ready,
      ready_unique_slug_count: ready,
      rejection_categories: verified ? {} : {
        'source-unreachable': 40,
        'exact-logo-unavailable': 20,
        'approved-image-board-unavailable': 7,
      },
    },
    selection: {
      count: verified ? 20 : 0,
      unique_identity_count: verified ? 20 : 0,
      unique_slug_count: verified ? 20 : 0,
      transparent_logo_count: verified ? 20 : 0,
      prior_artifacts_scanned: verified ? 4 : 0,
      prior_identities_excluded: verified ? 238 : 0,
      slugs: [],
    },
    build: {
      present: verified,
      status: verified ? 'built-and-browser-qa-passed' : null,
      selected_count: verified ? 20 : 0,
      qa_ready_count: verified ? 20 : 0,
      summary_hash_matches: verified,
    },
    summary: {
      target_count: verified ? 20 : 0,
      brief_count: verified ? 20 : 0,
      qa_ready_count: verified ? 20 : 0,
      result_count: verified ? 20 : 0,
      browser_pass_count: verified ? 20 : 0,
      mail_ready_always_hold: verified,
      ok: verified,
    },
    final_audit: {
      status: verified ? 'PASS' : null,
      check_count: verified ? 220 : 0,
      passing_checks: verified ? 220 : 0,
      failure_count: 0,
      selected_count: verified ? 20 : 0,
      qa_ready_count: verified ? 20 : 0,
      mail_ready: verified ? 'hold' : null,
      deployment: verified ? 'none; local private noindex batch' : null,
    },
    stock: {
      present: verified,
      site_count: verified ? 20 : 0,
      image_count: verified ? 80 : 0,
      unassigned_count: 0,
    },
    detector: {
      present: verified,
      finding_count: 0,
      passed: verified,
    },
    quality_gate: {
      present: verified,
      schema_valid: verified,
      validation_error_count: verified ? 0 : 2,
      qa_ready: verified ? 'ready' : 'hold',
      maker_checker_distinct: verified,
      recording_present: verified,
      recording_hash_matches: verified,
      recording_bytes_match: verified,
      demo_reviewed: verified,
      checker_verdict: verified ? 'pass' : null,
      visual_verdict: verified ? 'pass' : null,
      required_viewports_present: verified,
    },
    sites: {
      directory_count: verified ? 20 : 0,
      index_count: verified ? 20 : 0,
      noindex_count: verified ? 20 : 0,
    },
    prospects: {
      rows: verified ? 20 : 0,
      qa_ready: verified ? 20 : 0,
      mail_hold: verified ? 20 : 0,
      mail_ready_other: 0,
    },
    inventory: {
      expected: [...SUCCESS_FILES],
      present,
      missing: SUCCESS_FILES.filter((name) => !present.includes(name)),
    },
    blocked_receipts: {
      selection: verified ? null : 'blocked-selection',
      daily: verified ? null : 'blocked',
    },
    legacy_completion_claim: verified ? null : {
      observed: true,
      source_locator: 'fixture/legacy-W05.jsonl',
      run_id: 'LOOP-FIXTURE',
      outcome: 'complete',
      claimed_independent_verification: true,
      declared_artifact_count: 2,
      declared_artifacts_present: 1,
    },
    source_manifest: manifest,
    source_set_sha256: sourceSet,
  };
}

test('W05 preflight aggregation redacts identities and classifies blockers', () => {
  const result = aggregatePreflight({
    candidatePool: 5,
    ready: [
      { domain: 'one.example', slug: 'one' },
      { domain: 'two.example', slug: 'two' },
    ],
    rejected: [
      { reason: 'fetch failed' },
      { reason: 'HTTP 403' },
      { reason: 'exact transparent logo unavailable: source too small' },
    ],
  });
  assert.deepEqual(result, {
    candidate_pool: 5,
    ready_count: 2,
    rejected_count: 3,
    ready_unique_identity_count: 2,
    ready_unique_slug_count: 2,
    rejection_categories: {
      'source-unreachable': 1,
      'source-forbidden': 1,
      'exact-logo-unavailable': 1,
    },
  });
  assert.equal(rejectionCategory('HTTP 429'), 'source-rate-limited');
  assert.equal(
    rejectionCategory('No relevant generated-stock category is approved'),
    'approved-image-board-unavailable'
  );
  assert.doesNotMatch(JSON.stringify(result), /one\.example|two\.example/);
});

test('W05 durable shadow reports a truthful source-pool hold and dedupes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'w05-factory-held-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const template = fixtureSources();
  const collectSources = async () => ({
    ...structuredClone(template),
    captured_at: new Date().toISOString(),
  });
  const options = {
    outputDir,
    stateRoot,
    logicalRoot: 'fixture-w05-held',
    safeOutput: false,
    collectSources,
  };

  try {
    const first = await runWebsiteFactoryDurable(options);
    assert.equal(first.outcome, 'complete');
    assert.equal(first.terminal_truth, true);
    assert.equal(first.deduped, false);
    assert.equal(first.graph_iterations[0].workers.length, GATE_IDS.length);

    const artifact = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[0]), 'utf8'));
    assert.equal(artifact.outcome.state, 'held_source_pool');
    assert.equal(artifact.outcome.workflow_ready, false);
    assert.equal(artifact.outcome.legacy_false_completion_detected, true);
    assert.equal(artifact.outcome.passing_gates, 1);
    assert.equal(artifact.source_snapshot.preflight.ready_count, 6);
    assert.equal(artifact.approval.state, 'mail_ready_hold');
    assert.equal(artifact.authority.external_action_attempted, false);
    assert.doesNotMatch(JSON.stringify(artifact), /https?:\/\/|@/i);
    assert.doesNotMatch(JSON.stringify(artifact), /"(?:business_name|website|address|phone|domain|slug)"\s*:/i);
    assert.doesNotMatch(JSON.stringify(artifact), /resume_locator/i);

    const duplicate = await runWebsiteFactoryDurable(options);
    assert.equal(duplicate.outcome, 'complete');
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, first.run_id);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('W05 durable shadow certifies only a full local batch and keeps approval separate', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'w05-factory-verified-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const template = fixtureSources({ verified: true });
  const collectSources = async () => ({
    ...structuredClone(template),
    captured_at: new Date().toISOString(),
  });

  try {
    const result = await runWebsiteFactoryDurable({
      outputDir,
      stateRoot,
      logicalRoot: 'fixture-w05-verified',
      safeOutput: false,
      collectSources,
    });
    assert.equal(result.outcome, 'complete');
    assert.equal(result.terminal_truth, true);
    const artifact = JSON.parse(fs.readFileSync(path.join(outputDir, FINAL_NAMES[0]), 'utf8'));
    assert.equal(artifact.outcome.state, 'verified_local_batch');
    assert.equal(artifact.outcome.workflow_ready, true);
    assert.equal(artifact.outcome.passing_gates, GATE_IDS.length);
    assert.equal(artifact.approval.external_action_authorized, false);
    assert.equal(artifact.approval.verified_local_batch_is_not_delivery_approval, true);
    assert.ok(artifact.gates.every((gate) => gate.passed));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
