'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sha256, validateContract, runOutcomeGraph } = require('../lib/outcome-graph');
const { createCanaryHarness, runCanary } = require('../lib/outcome-graph-canary');
const { auditLegacy } = require('../lib/outcome-graph-audit');
const { runWeeklyShadow } = require('../lib/outcome-graph-weekly-shadow');

test('contract requires an executable finish line and stopping conditions', () => {
  const harness = createCanaryHarness();
  try {
    const broken = structuredClone(harness.contract);
    delete broken.objective;
    delete broken.finish_line.predicate;
    delete broken.stopping.max_worker_attempts;
    const result = validateContract(broken);
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes('objective is required'));
    assert.ok(result.errors.includes('finish_line.predicate is required'));
    assert.ok(result.errors.includes('stopping.max_worker_attempts must be a positive integer'));
  } finally {
    harness.cleanup();
  }
});

test('contract enforces independent maker, checker, and terminal verifier', () => {
  const harness = createCanaryHarness();
  try {
    const broken = structuredClone(harness.contract);
    broken.adapters.checker = broken.adapters.maker;
    broken.adapters.terminal_verifier = broken.adapters.maker;
    const result = validateContract(broken);
    assert.equal(result.ok, false);
    assert.match(result.errors.join(' '), /maker and checker/);
    assert.match(result.errors.join(' '), /maker and terminal_verifier/);
  } finally {
    harness.cleanup();
  }
});

test('runtime rejects two adapter names backed by the same checker function', async () => {
  const harness = createCanaryHarness();
  try {
    harness.adapters['canary-test-reviewer'] = harness.adapters['canary-test-writer'];
    const result = await runOutcomeGraph(harness.contract, { adapters: harness.adapters });
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.blocked_by, 'non_independent_checker');
  } finally {
    harness.cleanup();
  }
});

test('canary fans out isolated loops, retries a checker failure, merges, and proves the goal', async () => {
  const result = await runCanary();
  assert.equal(result.outcome, 'complete');
  assert.equal(result.terminal_truth, true);
  assert.equal(result.graph_iterations.length, 1);
  assert.equal(result.graph_iterations[0].workers.length, 2);
  const multiply = result.graph_iterations[0].workers.find((worker) => worker.item_id === 'multiply');
  assert.equal(multiply.attempts.length, 2);
  assert.equal(multiply.attempts[0].passed, false);
  assert.equal(multiply.attempts[1].passed, true);
  assert.equal(result.terminal_evidence.passed, true);
  assert.equal(result.terminal_evidence.artifact_manifest.length, 2);
  assert.match(result.learning_evidence.ledger_receipt.entry_sha256, /^[a-f0-9]{64}$/);
  assert.match(result.drift_fingerprint, /^[a-f0-9]{64}$/);
});

test('stale source evidence blocks before any adapter runs', async () => {
  const harness = createCanaryHarness({ checkedAt: new Date('2020-01-01T00:00:00Z') });
  try {
    const result = await runOutcomeGraph(harness.contract, {
      adapters: harness.adapters,
      now: () => new Date('2026-08-24T12:00:00Z'),
    });
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.blocked_by, 'stale_source');
    assert.equal(result.invocation_log.length, 0);
  } finally {
    harness.cleanup();
  }
});

test('failed workers cannot reach reducer or terminal verification', async () => {
  const harness = createCanaryHarness();
  let reducerCalls = 0;
  let verifierCalls = 0;
  try {
    harness.contract.stopping.max_graph_iterations = 1;
    harness.contract.stopping.max_worker_attempts = 1;
    harness.adapters['canary-test-reviewer'] = async ({ item }) => ({
      evidence: 'Forced independent failure for ' + item.id + '.',
      passed: false,
      findings: ['forced checker finding'],
    });
    const originalReducer = harness.adapters['canary-artifact-merger'];
    harness.adapters['canary-artifact-merger'] = async (payload) => {
      reducerCalls += 1;
      return originalReducer(payload);
    };
    const originalVerifier = harness.adapters['canary-independent-validator'];
    harness.adapters['canary-independent-validator'] = async (payload) => {
      verifierCalls += 1;
      return originalVerifier(payload);
    };
    const result = await runOutcomeGraph(harness.contract, { adapters: harness.adapters });
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.blocked_by, 'worker_attempts_exhausted');
    assert.equal(reducerCalls, 0);
    assert.equal(verifierCalls, 0);
  } finally {
    harness.cleanup();
  }
});

test('terminal verifier cannot declare completion without passing assertions and artifact hashes', async () => {
  const harness = createCanaryHarness();
  try {
    harness.contract.stopping.max_graph_iterations = 1;
    harness.adapters['canary-independent-validator'] = async () => ({
      evidence: 'A dishonest pass declaration without acceptance evidence.',
      passed: true,
      assertions: [{ id: 'goal', passed: false, detail: 'Goal is still false.' }],
      artifact_manifest: [],
    });
    const result = await runOutcomeGraph(harness.contract, { adapters: harness.adapters });
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.blocked_by, 'terminal_predicate_false');
    assert.equal(result.terminal_truth, false);
    assert.ok(result.terminal_findings.some((finding) => /Goal is still false/.test(finding)));
    assert.ok(result.terminal_findings.some((finding) => /no artifact manifest/.test(finding)));
  } finally {
    harness.cleanup();
  }
});

test('approval remains a separate state after the finish line is proven', async () => {
  const harness = createCanaryHarness();
  try {
    harness.contract.approval.required_before = ['adopt'];
    const result = await runOutcomeGraph(harness.contract, { adapters: harness.adapters });
    assert.equal(result.outcome, 'awaiting_approval');
    assert.equal(result.terminal_truth, true);
    assert.equal(result.blocked_by, 'approval_required');
    assert.equal(result.terminal_evidence.passed, true);
  } finally {
    harness.cleanup();
  }
});

test('budget exhaustion blocks instead of synthesizing success', async () => {
  const harness = createCanaryHarness();
  try {
    harness.contract.stopping.budget_units = 1;
    const result = await runOutcomeGraph(harness.contract, { adapters: harness.adapters });
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.blocked_by, 'budget_exhausted');
    assert.equal(result.terminal_truth, false);
  } finally {
    harness.cleanup();
  }
});

test('legacy audit identifies structural completion evidence as migration risk', () => {
  const registry = {
    routines: [{
      routine_id: 'D19',
      name: 'Build report',
      cadence: 'daily',
      claude_may_execute: true,
      claude_role: 'maker',
      artifact: 'Report artifact and source ledger',
      value_signal: 'KPIs recompute from source fields',
      checkpoint_resume: '12_Brain/state/report-brain-ingest.json',
    }],
  };
  const receipts = [{
    run_id: 'LOOP-1',
    routine_id: 'D19',
    outcome: 'complete',
    independent_verified: true,
    receipt: {
      artifact_paths: [
        '12_Brain/queue/claude-loop-2026-08-24.jsonl',
        '12_Brain/state/report-brain-ingest.json',
      ],
      checks: 'gates 8/8; stages ok 9/9; blocked 0',
    },
  }];
  const audit = auditLegacy({
    registry,
    receipts,
    auditedAt: '2026-08-24T12:00:00Z',
  });
  assert.equal(audit.verdict, 'migration_required');
  assert.equal(audit.counts.routines_executable, 1);
  assert.equal(audit.counts.receipts_with_false_completion_risk, 1);
  assert.equal(audit.contract_gap_counts.terminal_predicate, 1);
  assert.equal(audit.receipt_risk_counts.only_loop_log_and_checkpoint_evidenced, 1);
  assert.equal(audit.receipt_risk_counts.independent_verification_is_structural_only, 1);
});

test('weekly shadow persists checked W09, W11, and correction artifacts only after terminal truth', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-shadow-test-'));
  const outputDir = path.join(tempRoot, 'output');
  const fakeW09 = () => ({
    captured_at: '2026-08-24T12:00:00Z',
    operating_team: { overall: 'pass', passed: 33, total: 33 },
    daily_driver: { overall: 'pass', passed: 42, total: 42 },
    legacy_outcome_audit: {
      verdict: 'migration_required',
      counts: { receipts_with_false_completion_risk: 24 },
      sources: {
        registry_sha256: 'a'.repeat(64),
        receipt_sha256: 'b'.repeat(64),
      },
    },
  });
  const fakeW11 = () => ({
    captured_at: '2026-08-24T12:00:00Z',
    structural_test: {
      status: 'warning',
      summary: {
        errorCount: 0,
        warningCount: 35,
        graphNodes: 688,
        graphEdges: 1816,
      },
    },
    graph_measurement: {
      nodes: 688,
      edges: 1816,
      components: 1,
      largestComponentCoverage: 100,
      orphans: 0,
      unresolvedLinkOccurrences: 73,
    },
  });
  try {
    const result = await runWeeklyShadow({
      outputDir,
      logicalRoot: 'fixture-shadow',
      safeOutput: false,
      collectW09: fakeW09,
      collectW11: fakeW11,
    });
    assert.equal(result.outcome, 'complete');
    assert.equal(result.terminal_truth, true);
    assert.equal(fs.existsSync(path.join(outputDir, 'W09-automation-reliability.json')), true);
    assert.equal(fs.existsSync(path.join(outputDir, 'W11-knowledge-graph-health.json')), true);
    assert.equal(fs.existsSync(path.join(outputDir, 'corrections.jsonl')), true);
    for (const artifact of result.terminal_evidence.artifact_manifest) {
      const file = path.join(outputDir, path.basename(artifact.path));
      assert.equal(sha256(fs.readFileSync(file)), artifact.sha256);
    }
    const correctionLine = fs.readFileSync(path.join(outputDir, 'corrections.jsonl'), 'utf8').trim();
    assert.equal(
      sha256(correctionLine),
      result.learning_evidence.ledger_receipt.entry_sha256
    );
    assert.match(result.learning_evidence.ledger_receipt.entry_sha256, /^[a-f0-9]{64}$/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
