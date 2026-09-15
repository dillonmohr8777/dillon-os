'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  OutcomeGraphInterruption,
  sha256,
  stableJson,
} = require('./outcome-graph');
const {
  runDurableOutcomeGraph,
  writeJsonAtomic,
} = require('./outcome-graph-state');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function artifactEvidence(file, logicalPath, resumable = false) {
  const bytes = fs.readFileSync(file);
  return {
    path: logicalPath.replace(/\\/g, '/'),
    sha256: sha256(bytes),
    bytes: bytes.length,
    ...(resumable ? { resume_locator: file } : {}),
  };
}

function verifyArtifact(artifact) {
  if (!artifact || typeof artifact.resume_locator !== 'string') return false;
  if (!fs.existsSync(artifact.resume_locator)) return false;
  const bytes = fs.readFileSync(artifact.resume_locator);
  return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
}

function createDurableCanaryHarness(options = {}) {
  const ownsRoot = !options.root;
  const root = options.root
    ? path.resolve(options.root)
    : fs.mkdtempSync(path.join(os.tmpdir(), 'outcome-graph-durable-canary-'));
  const canonicalFile = path.join(root, 'canonical.json');
  const stateRoot = path.join(root, 'state');
  const artifactRoot = path.join(root, 'artifacts');
  const correctionsFile = path.join(root, 'corrections.jsonl');
  fs.mkdirSync(root, { recursive: true });
  if (!fs.existsSync(canonicalFile)) {
    writeJsonAtomic(canonicalFile, {
      version: 1,
      items: [
        { id: 'alpha', value: 2 },
        { id: 'beta', value: 3 },
      ],
    });
  }

  const counts = {
    planner: 0,
    maker: { alpha: 0, beta: 0 },
    checker: { alpha: 0, beta: 0 },
    reducer: 0,
    terminal: 0,
    learner: 0,
  };
  const checkedAt = (options.checkedAt || new Date()).toISOString();

  const contract = {
    schema_version: 1,
    graph_id: 'durable-crash-replay-canary',
    objective: 'Produce a checked doubled-value artifact for every canonical canary item.',
    value_signal: 'Interrupted work resumes without redoing valid checked nodes or accepting corrupt ones.',
    constraints: [
      'Synthetic local workspace only.',
      'No network or external actions.',
      'Canonical input is read-only during a run.',
    ],
    upstream_artifacts: ['synthetic://canonical.json'],
    scope: {
      root: 'synthetic-durable-canary',
      isolation_key: 'canonical-item-id',
      data_class: 'synthetic',
    },
    source_freshness: {
      checked_at: checkedAt,
      max_age_seconds: 300,
      evidence: 'The synthetic canonical file is hashed before lease acquisition.',
    },
    finish_line: {
      predicate: 'Every canonical item has one independently checked result whose doubled value and hash revalidate.',
      required_artifacts: ['results/alpha.json', 'results/beta.json'],
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: 2,
      timeout_seconds: 60,
      max_parallel: 1,
      budget_units: 30,
    },
    adapters: {
      planner: 'durable-canary-planner',
      maker: 'durable-canary-maker',
      checker: 'durable-canary-checker',
      reducer: 'durable-canary-reducer',
      terminal_verifier: 'durable-canary-terminal-verifier',
      learner: 'durable-canary-learner',
    },
    approval: {
      external_actions: false,
      required_before: [],
    },
    governance: {
      orchestrator: 'Codex durable outcome-graph canary',
      canonical_state: 'synthetic://canonical.json',
      dedupe_key: 'synthetic:durable-crash-replay:v1',
      checkpoint: 'synthetic-state://runs/<run-id>/checkpoint.json',
      rollback: 'Delete synthetic canary artifacts and retain the canonical input.',
      escalation: 'Fail closed with the exact lease, binding, plan, or artifact finding.',
      allowed_actions: [
        'read_synthetic_canonical_state',
        'write_synthetic_artifact',
        'hash_artifact',
        'write_noncanonical_checkpoint',
      ],
      forbidden_actions: [
        'network',
        'external_action',
        'canonical_write',
      ],
    },
    learning: {
      fingerprint_inputs: [
        'canonical-binding',
        'plan-signature',
        'worker-artifact-hashes',
        'terminal-assertions',
      ],
      corrections_ledger: 'synthetic://durable-canary-corrections',
    },
  };

  const adapters = {
    'durable-canary-planner': async () => {
      counts.planner += 1;
      const canonical = readJson(canonicalFile);
      return {
        evidence: 'Enumerated the exact versioned canonical canary item set.',
        items: canonical.items.map((item) => ({
          ...item,
          task: 'Double the canonical value for ' + item.id + '.',
          isolation_key: 'canonical-item:' + item.id,
          input_fingerprint: sha256(stableJson(item)),
        })),
      };
    },

    'durable-canary-maker': async ({ workflow_id: workflowId, item, attempt }) => {
      counts.maker[item.id] += 1;
      const runRoot = path.join(artifactRoot, workflowId, 'workers');
      const artifactFile = path.join(runRoot, item.id + '.json');
      writeJsonAtomic(artifactFile, {
        item_id: item.id,
        input_fingerprint: item.input_fingerprint,
        value: item.value,
        doubled: item.value * 2,
      });
      return {
        evidence: 'Persisted the isolated doubled-value artifact for ' + item.id + '.',
        isolation_id: workflowId + ':' + item.id + ':attempt:' + attempt,
        artifacts: [artifactEvidence(artifactFile, 'workers/' + item.id + '.json', true)],
      };
    },

    'durable-canary-checker': async ({ item, maker_result: makerResult }) => {
      counts.checker[item.id] += 1;
      const artifact = makerResult.artifacts[0];
      const hashPassed = verifyArtifact(artifact);
      const body = hashPassed ? readJson(artifact.resume_locator) : null;
      const valuePassed = body?.item_id === item.id &&
        body?.input_fingerprint === item.input_fingerprint &&
        body?.doubled === item.value * 2;
      const findings = [];
      if (!hashPassed) findings.push('Worker artifact hash or byte count did not revalidate.');
      if (!valuePassed) findings.push('Worker artifact value does not match the canonical item.');
      return {
        evidence: 'Independently rehashed and recomputed the worker result for ' + item.id + '.',
        passed: findings.length === 0,
        findings,
      };
    },

    'durable-canary-reducer': async ({ workflow_id: workflowId, worker_results: workers }) => {
      counts.reducer += 1;
      const resultRoot = path.join(artifactRoot, workflowId, 'results');
      fs.mkdirSync(resultRoot, { recursive: true });
      const artifacts = [];
      for (const worker of workers) {
        const source = worker.final_artifacts[0].resume_locator;
        const target = path.join(resultRoot, worker.item_id + '.json');
        fs.copyFileSync(source, target);
        artifacts.push(artifactEvidence(target, 'results/' + worker.item_id + '.json', true));
      }
      return {
        evidence: 'Merged only independently checked worker artifacts into the durable result set.',
        artifacts,
        result_root: resultRoot,
      };
    },

    'durable-canary-terminal-verifier': async ({ reduction }) => {
      counts.terminal += 1;
      const canonical = readJson(canonicalFile);
      const assertions = canonical.items.map((item) => {
        const file = path.join(reduction.result_root, item.id + '.json');
        const exists = fs.existsSync(file);
        const body = exists ? readJson(file) : null;
        return {
          id: 'result-' + item.id,
          passed: exists && body.doubled === item.value * 2,
          detail: exists && body.doubled === item.value * 2
            ? item.id + ' revalidated against the current canonical value.'
            : item.id + ' is missing or does not recompute.',
        };
      });
      const manifest = canonical.items.map((item) =>
        artifactEvidence(
          path.join(reduction.result_root, item.id + '.json'),
          'results/' + item.id + '.json',
          true
        )
      );
      return {
        evidence: 'Terminal verification reread canonical input and recomputed every durable result.',
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: manifest,
      };
    },

    'durable-canary-learner': async ({ outcome }) => {
      counts.learner += 1;
      const entry = JSON.stringify({
        outcome,
        correction: outcome === 'terminal_true'
          ? 'Reuse only independently revalidated worker checkpoints.'
          : 'Discard uncertain worker state and rerun inside the bounded loop.',
      });
      fs.appendFileSync(correctionsFile, entry + '\n', 'utf8');
      return {
        evidence: 'Recorded the durable canary outcome in the synthetic correction ledger.',
        corrections: [JSON.parse(entry).correction],
        ledger_receipt: {
          locator: contract.learning.corrections_ledger,
          entry_sha256: sha256(entry),
        },
      };
    },
  };

  const readCanonicalBinding = async () => {
    const bytes = fs.readFileSync(canonicalFile);
    const canonical = JSON.parse(bytes.toString('utf8'));
    return {
      locator: 'synthetic://canonical.json',
      version: canonical.version,
      sha256: sha256(bytes),
      captured_at: new Date().toISOString(),
    };
  };

  const verifyResumedWorker = async ({ item, worker_result: workerResult }) => {
    if (workerResult.item_id !== item.id ||
        workerResult.input_fingerprint !== item.input_fingerprint ||
        workerResult.status !== 'verified') {
      return false;
    }
    return workerResult.final_artifacts.length > 0 &&
      workerResult.final_artifacts.every(verifyArtifact);
  };

  const verifyCompletedResult = async (result) => {
    const manifest = result.terminal_evidence?.artifact_manifest;
    return Array.isArray(manifest) && manifest.length === 2 && manifest.every((artifact) => {
      const file = path.join(artifactRoot, result.run_id, artifact.path);
      if (!fs.existsSync(file)) return false;
      const bytes = fs.readFileSync(file);
      return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
    });
  };

  function durableOptions(overrides = {}) {
    return {
      stateRoot,
      adapters,
      readCanonicalBinding,
      verifyResumedWorker,
      verifyCompletedResult,
      ...overrides,
    };
  }

  return {
    root,
    stateRoot,
    artifactRoot,
    canonicalFile,
    contract,
    adapters,
    counts,
    durableOptions,
    readCanonicalBinding,
    verifyResumedWorker,
    verifyCompletedResult,
    mutateCanonical(mutator) {
      const canonical = readJson(canonicalFile);
      const next = mutator(structuredClone(canonical)) || canonical;
      writeJsonAtomic(canonicalFile, next);
    },
    cleanup() {
      if (ownsRoot || options.cleanupRoot === true) {
        fs.rmSync(root, { recursive: true, force: true });
      }
    },
  };
}

async function runCrashReplayCanary(options = {}) {
  const harness = createDurableCanaryHarness(options);
  let interruptedRunId = null;
  try {
    try {
      await runDurableOutcomeGraph(harness.contract, harness.durableOptions({
        onCheckpoint: async (checkpoint, progress) => {
          if (progress.event === 'worker_verified') {
            interruptedRunId = checkpoint.run_id;
            throw new OutcomeGraphInterruption(
              'simulated_crash',
              'Canary stopped immediately after its first durable worker checkpoint'
            );
          }
        },
      }));
    } catch (error) {
      if (error?.code !== 'simulated_crash') throw error;
    }
    const resumed = await runDurableOutcomeGraph(
      harness.contract,
      harness.durableOptions()
    );
    const deduped = await runDurableOutcomeGraph(
      harness.contract,
      harness.durableOptions()
    );
    return {
      schema_version: 1,
      interrupted_run_id: interruptedRunId,
      resumed_run_id: resumed.run_id,
      outcome: resumed.outcome,
      resumed: resumed.durable_state.resumed,
      dedupe_hit: deduped.deduped,
      worker_calls: harness.counts.maker,
      proof: {
        same_run_resumed: interruptedRunId === resumed.run_id,
        verified_alpha_not_redone: harness.counts.maker.alpha === 1,
        unfinished_beta_ran_once: harness.counts.maker.beta === 1,
        duplicate_trigger_ran_no_adapters: harness.counts.planner === 2,
      },
    };
  } finally {
    if (!options.preserve) harness.cleanup();
  }
}

module.exports = {
  artifactEvidence,
  createDurableCanaryHarness,
  runCrashReplayCanary,
  verifyArtifact,
};
