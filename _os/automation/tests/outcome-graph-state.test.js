'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { OutcomeGraphInterruption } = require('../lib/outcome-graph');
const {
  computeDedupeIdentity,
  runDurableOutcomeGraph,
  writeJsonAtomic,
} = require('../lib/outcome-graph-state');
const {
  createDurableCanaryHarness,
  runCrashReplayCanary,
} = require('../lib/outcome-graph-durable-canary');
const { runWeeklyShadowDurable } = require('../lib/outcome-graph-weekly-shadow');

function onlyJsonFile(directory) {
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.json'));
  assert.equal(files.length, 1);
  return path.join(directory, files[0]);
}

async function interruptAfterFirstWorker(harness) {
  return runDurableOutcomeGraph(harness.contract, harness.durableOptions({
    onCheckpoint: async (checkpoint, progress) => {
      if (progress.event === 'worker_verified') {
        throw new OutcomeGraphInterruption(
          'simulated_crash',
          'Test interruption after the first durable worker checkpoint'
        );
      }
    },
  }));
}

test('crash canary resumes the same run, skips the revalidated worker, and dedupes repeats', async () => {
  const result = await runCrashReplayCanary();
  assert.equal(result.outcome, 'complete');
  assert.equal(result.resumed, true);
  assert.equal(result.dedupe_hit, true);
  assert.deepEqual(result.proof, {
    same_run_resumed: true,
    verified_alpha_not_redone: true,
    unfinished_beta_ran_once: true,
    duplicate_trigger_ran_no_adapters: true,
  });
});

test('interrupted run persists an active atomic checkpoint and resumes its exact run id', async () => {
  const harness = createDurableCanaryHarness();
  try {
    await assert.rejects(interruptAfterFirstWorker(harness), (error) => {
      assert.equal(error.code, 'simulated_crash');
      return true;
    });
    const dedupe = JSON.parse(fs.readFileSync(
      onlyJsonFile(path.join(harness.stateRoot, 'dedupe')),
      'utf8'
    ));
    assert.equal(dedupe.status, 'active');
    const checkpointFile = path.join(harness.stateRoot, dedupe.checkpoint.path);
    const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    assert.equal(checkpoint.last_event, 'worker_verified');
    assert.ok(checkpoint.state_revision >= 2);
    assert.match(checkpoint.previous_state_sha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(Object.keys(checkpoint.engine.verified_workers), ['alpha']);

    const resumed = await runDurableOutcomeGraph(harness.contract, harness.durableOptions());
    assert.equal(resumed.outcome, 'complete');
    assert.equal(resumed.run_id, dedupe.run_id);
    assert.equal(resumed.durable_state.resumed, true);
    assert.deepEqual(harness.counts.maker, { alpha: 1, beta: 1 });

    const callsBeforeDedupe = structuredClone(harness.counts);
    const duplicate = await runDurableOutcomeGraph(harness.contract, harness.durableOptions());
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, resumed.run_id);
    assert.deepEqual(harness.counts, callsBeforeDedupe);
  } finally {
    harness.cleanup();
  }
});

test('corrupt resumed worker evidence is rejected and rebuilt', async () => {
  const harness = createDurableCanaryHarness();
  try {
    await assert.rejects(interruptAfterFirstWorker(harness), /first durable worker checkpoint/);
    const dedupe = JSON.parse(fs.readFileSync(
      onlyJsonFile(path.join(harness.stateRoot, 'dedupe')),
      'utf8'
    ));
    const checkpoint = JSON.parse(fs.readFileSync(
      path.join(harness.stateRoot, dedupe.checkpoint.path),
      'utf8'
    ));
    const artifact = checkpoint.engine.verified_workers.alpha.worker_result.final_artifacts[0];
    fs.writeFileSync(artifact.resume_locator, '{"corrupt":true}\n', 'utf8');

    const resumed = await runDurableOutcomeGraph(harness.contract, harness.durableOptions());
    assert.equal(resumed.outcome, 'complete');
    assert.deepEqual(harness.counts.maker, { alpha: 2, beta: 1 });
    assert.ok(resumed.graph_iterations[0].workers.every((worker) => worker.status === 'verified'));
  } finally {
    harness.cleanup();
  }
});

test('a changed resumed plan blocks instead of inheriting prior verified work', async () => {
  const harness = createDurableCanaryHarness();
  try {
    await assert.rejects(interruptAfterFirstWorker(harness), /first durable worker checkpoint/);
    const originalPlanner = harness.adapters['durable-canary-planner'];
    harness.adapters['durable-canary-planner'] = async (...args) => {
      const plan = await originalPlanner(...args);
      plan.items[0].task += ' Changed without canonical binding.';
      return plan;
    };
    const resumed = await runDurableOutcomeGraph(harness.contract, harness.durableOptions());
    assert.equal(resumed.outcome, 'blocked');
    assert.equal(resumed.blocked_by, 'resume_plan_drift');
    assert.deepEqual(harness.counts.maker, { alpha: 1, beta: 0 });
  } finally {
    harness.cleanup();
  }
});

test('checkpoint compare-and-swap fails closed on an out-of-band state write', async () => {
  const harness = createDurableCanaryHarness();
  let tampered = false;
  try {
    await assert.rejects(
      runDurableOutcomeGraph(harness.contract, harness.durableOptions({
        onCheckpoint: async (checkpoint, progress) => {
          if (!tampered && progress.event === 'planned') {
            tampered = true;
            const file = path.join(
              harness.stateRoot,
              'runs',
              checkpoint.run_id,
              'checkpoint.json'
            );
            const body = JSON.parse(fs.readFileSync(file, 'utf8'));
            body.out_of_band_tamper = true;
            writeJsonAtomic(file, body);
          }
        },
      })),
      (error) => {
        assert.equal(error.code, 'state_revision_conflict');
        return true;
      }
    );
    assert.equal(tampered, true);
    assert.deepEqual(harness.counts.maker, { alpha: 1, beta: 0 });
  } finally {
    harness.cleanup();
  }
});

test('canonical state drift before receipt commit blocks completion', async () => {
  const harness = createDurableCanaryHarness();
  try {
    const result = await runDurableOutcomeGraph(harness.contract, harness.durableOptions({
      beforeFinalBindingCheck: async () => {
        harness.mutateCanonical((canonical) => {
          canonical.version += 1;
          canonical.items[0].value += 10;
          return canonical;
        });
      },
    }));
    assert.equal(result.provisional_outcome, 'complete');
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.terminal_truth, false);
    assert.equal(result.blocked_by, 'canonical_state_drift');
    const dedupe = JSON.parse(fs.readFileSync(
      onlyJsonFile(path.join(harness.stateRoot, 'dedupe')),
      'utf8'
    ));
    assert.equal(dedupe.status, 'blocked');
  } finally {
    harness.cleanup();
  }
});

test('expired lease is recovered but a live lease fails closed', async () => {
  const stale = createDurableCanaryHarness();
  try {
    const binding = await stale.readCanonicalBinding();
    const identity = computeDedupeIdentity(stale.contract, binding);
    const lockDir = path.join(stale.stateRoot, 'leases', identity + '.lock');
    fs.mkdirSync(lockDir, { recursive: true });
    writeJsonAtomic(path.join(lockDir, 'owner.json'), {
      schema_version: 1,
      owner_id: 'dead-owner',
      acquired_at: '2026-08-24T00:00:00.000Z',
      expires_at: '2026-08-24T00:00:01.000Z',
    });
    const result = await runDurableOutcomeGraph(stale.contract, stale.durableOptions());
    assert.equal(result.outcome, 'complete');
  } finally {
    stale.cleanup();
  }

  const live = createDurableCanaryHarness();
  try {
    const binding = await live.readCanonicalBinding();
    const identity = computeDedupeIdentity(live.contract, binding);
    const lockDir = path.join(live.stateRoot, 'leases', identity + '.lock');
    fs.mkdirSync(lockDir, { recursive: true });
    writeJsonAtomic(path.join(lockDir, 'owner.json'), {
      schema_version: 1,
      owner_id: 'live-owner',
      acquired_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60000).toISOString(),
    });
    await assert.rejects(
      runDurableOutcomeGraph(live.contract, live.durableOptions()),
      (error) => {
        assert.equal(error.code, 'dedupe_lease_active');
        return true;
      }
    );
    assert.deepEqual(live.counts.maker, { alpha: 0, beta: 0 });
  } finally {
    live.cleanup();
  }
});

test('durable W09 and W11 shadow dedupes only while committed artifacts revalidate', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-durable-state-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const fakeW09 = async () => ({
    captured_at: new Date().toISOString(),
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
  const fakeW11 = async () => ({
    captured_at: new Date().toISOString(),
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
  const options = {
    outputDir,
    stateRoot,
    logicalRoot: 'fixture-durable-shadow',
    safeOutput: false,
    collectW09: fakeW09,
    collectW11: fakeW11,
  };
  try {
    const first = await runWeeklyShadowDurable(options);
    assert.equal(first.outcome, 'complete');
    assert.equal(first.deduped, false);
    assert.equal(first.durable_state.resumed, false);

    const duplicate = await runWeeklyShadowDurable(options);
    assert.equal(duplicate.outcome, 'complete');
    assert.equal(duplicate.deduped, true);
    assert.equal(duplicate.run_id, first.run_id);

    fs.writeFileSync(
      path.join(outputDir, 'W09-automation-reliability.json'),
      '{"corrupt":true}\n',
      'utf8'
    );
    const repaired = await runWeeklyShadowDurable(options);
    assert.equal(repaired.outcome, 'complete');
    assert.equal(repaired.deduped, false);
    assert.notEqual(repaired.run_id, first.run_id);
    const repairedW09 = JSON.parse(fs.readFileSync(
      path.join(outputDir, 'W09-automation-reliability.json'),
      'utf8'
    ));
    assert.equal(repairedW09.routine_id, 'W09');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('durable W09 and W11 shadow resumes despite volatile capture timestamps', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-durable-resume-test-'));
  const outputDir = path.join(root, 'output');
  const stateRoot = path.join(root, 'state');
  const fakeW09 = async () => ({
    captured_at: new Date().toISOString(),
    operating_team: { overall: 'pass', passed: 33, total: 33 },
    daily_driver: { overall: 'pass', passed: 42, total: 42 },
    legacy_outcome_audit: {
      verdict: 'migration_required',
      counts: { receipts_with_false_completion_risk: 24 },
      sources: {
        registry_sha256: 'c'.repeat(64),
        receipt_sha256: 'd'.repeat(64),
      },
    },
  });
  const fakeW11 = async () => ({
    captured_at: new Date().toISOString(),
    structural_test: {
      status: 'warning',
      summary: { errorCount: 0, warningCount: 35, graphNodes: 688, graphEdges: 1816 },
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
  const options = {
    outputDir,
    stateRoot,
    logicalRoot: 'fixture-durable-resume-shadow',
    safeOutput: false,
    collectW09: fakeW09,
    collectW11: fakeW11,
  };
  let interrupted = false;
  try {
    await assert.rejects(
      runWeeklyShadowDurable({
        ...options,
        onCheckpoint: async (checkpoint, progress) => {
          if (!interrupted && progress.event === 'worker_verified') {
            interrupted = true;
            throw new OutcomeGraphInterruption(
              'simulated_weekly_crash',
              'Weekly test interruption after a checked worker checkpoint'
            );
          }
        },
      }),
      (error) => {
        assert.equal(error.code, 'simulated_weekly_crash');
        return true;
      }
    );
    const active = JSON.parse(fs.readFileSync(
      onlyJsonFile(path.join(stateRoot, 'dedupe')),
      'utf8'
    ));
    assert.equal(active.status, 'active');
    const resumed = await runWeeklyShadowDurable(options);
    assert.equal(resumed.outcome, 'complete');
    assert.equal(resumed.run_id, active.run_id);
    assert.equal(resumed.durable_state.resumed, true);
    assert.equal(
      fs.existsSync(path.join(outputDir, 'W11-knowledge-graph-health.json')),
      true
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
