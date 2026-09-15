'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { runOutcomeGraph, sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph, writeJsonAtomic } = require('./outcome-graph-state');

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function readArtifact(file, name) {
  return name.endsWith('.json') ? readJson(file) : fs.readFileSync(file, 'utf8');
}

function writeTextAtomic(file, value) {
  if (typeof value !== 'string') throw new Error('Markdown routine artifacts must be strings.');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  fs.writeFileSync(temporary, value, 'utf8');
  fs.renameSync(temporary, file);
}

function writeArtifactAtomic(file, name, value) {
  if (name.endsWith('.json')) writeJsonAtomic(file, value);
  else if (name.endsWith('.md')) writeTextAtomic(file, value);
  else throw new Error('Source-bound routine artifacts must be JSON or Markdown.');
}

function safeItemId(value) {
  return sha256(String(value)).slice(0, 20);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function fileEvidence(file, logicalPath, includeResume = false) {
  const bytes = fs.readFileSync(file);
  return {
    path: normalizePath(logicalPath),
    sha256: sha256(bytes),
    bytes: bytes.length,
    ...(includeResume ? { resume_locator: path.resolve(file) } : {}),
  };
}

function assertSourcePacket(sources) {
  if (!sources || typeof sources !== 'object') throw new Error('Source packet is required.');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(String(sources.captured_at || '')) ||
      !Number.isFinite(Date.parse(sources.captured_at))) {
    throw new Error('Source packet captured_at is invalid.');
  }
  if (!/^[a-f0-9]{64}$/.test(String(sources.source_set_sha256 || ''))) {
    throw new Error('Source packet source_set_sha256 is invalid.');
  }
  if (!Array.isArray(sources.source_manifest) || sources.source_manifest.length === 0) {
    throw new Error('Source packet needs a nonempty source manifest.');
  }
  for (const source of sources.source_manifest) {
    if (!source.locator || !/^[a-f0-9]{64}$/.test(String(source.sha256 || '')) ||
        !Number.isInteger(source.bytes) || source.bytes < 0) {
      throw new Error('Source packet has an invalid source-manifest entry.');
    }
  }
  return sources;
}

function assertSafeRoutineOutput(candidate, routineId, repoRoot = REPO_ROOT) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(repoRoot);
  if (!absolute.startsWith(root + path.sep)) {
    throw new Error('Source-bound routine output must remain inside the Dillon OS repository.');
  }
  const relative = normalizePath(path.relative(root, absolute));
  const expected = String(routineId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pattern = new RegExp(
    `^System/outcome-graph/routines/${expected}/\\d{4}-\\d{2}(?:-\\d{2})?(?:-[a-z0-9-]+)?$`,
    'i'
  );
  if (!pattern.test(relative)) {
    throw new Error(
      `Routine ${expected} output must use System/outcome-graph/routines/${expected}/YYYY-MM[-DD][-slug].`
    );
  }
  return absolute;
}

function assertArtifactPrivacy(value) {
  const serialized = stableJson(value);
  const findings = [];
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized)) {
    findings.push('direct-email-present');
  }
  if (/(?:act|customer_id|account_id)=\d+/i.test(serialized)) {
    findings.push('raw-provider-account-parameter-present');
  }
  if (/"(?:password|access_token|refresh_token|cookie|secret_ref)"\s*:/i.test(serialized)) {
    findings.push('secret-bearing-field-present');
  }
  if (/resume_locator/i.test(serialized)) findings.push('resume-locator-present');
  return findings;
}

function artifactAttestsNoExternalAction(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value.authority?.external_action_attempted === false;
  }
  return typeof value === 'string' &&
    /(?:^|\n)external_action_attempted:\s*false\s*(?:\n|$)/i.test(value) &&
    /(?:^|\n)canonical_write_attempted:\s*false\s*(?:\n|$)/i.test(value);
}

function buildItems(adapter, sources, routineId) {
  const raw = adapter.buildItems(sources);
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(`Routine ${routineId} source adapter produced no work items.`);
  }
  const ids = raw.map((item) => String(item.id || ''));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Routine ${routineId} work-item IDs must be nonempty and unique.`);
  }
  return raw.map((item) => ({
    ...item,
    id: `${routineId}:${item.id}`,
    routine_id: routineId,
    source_set_sha256: sources.source_set_sha256,
    evaluation_captured_at: sources.captured_at,
    input_fingerprint: sha256(stableJson({
      routine_id: routineId,
      item,
      source_set_sha256: sources.source_set_sha256,
      evaluation_captured_at: sources.captured_at,
    })),
  }));
}

function verifyResumedSourceBoundWorker({ item, worker_result: workerResult }) {
  if (workerResult?.status !== 'verified' || workerResult?.item_id !== item.id ||
      workerResult?.input_fingerprint !== item.input_fingerprint) return false;
  const artifacts = workerResult.final_artifacts;
  if (!Array.isArray(artifacts) || artifacts.length !== 1) return false;
  const artifact = artifacts[0];
  if (!artifact.resume_locator || !fs.existsSync(artifact.resume_locator)) return false;
  const bytes = fs.readFileSync(artifact.resume_locator);
  return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
}

function verifyCompletedSourceBound(result, outputDir, artifactNames, artifactOutputs = {}) {
  const manifest = result.terminal_evidence?.artifact_manifest;
  if (!Array.isArray(manifest) || manifest.length !== artifactNames.length) return false;
  return artifactNames.every((name) => {
    const configured = artifactOutputs[name];
    const declared = configured
      ? manifest.find((artifact) =>
        normalizePath(artifact.path) === normalizePath(configured.logicalPath)
      )
      : manifest.find((artifact) => path.basename(artifact.path) === name);
    const file = path.resolve(configured?.file || path.join(outputDir, name));
    if (!declared || !fs.existsSync(file)) return false;
    const bytes = fs.readFileSync(file);
    return sha256(bytes) === declared.sha256 && bytes.length === declared.bytes;
  });
}

function createSourceBoundRoutineHarness(options) {
  const routineId = String(options.routineId || '').toUpperCase();
  const adapter = options.adapter;
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = normalizePath(options.logicalRoot);
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const artifactNames = options.artifactNames.slice();
  const artifactOutputs = Object.fromEntries(artifactNames.map((name) => {
    const configured = options.artifactOutputs?.[name];
    return [name, {
      file: path.resolve(configured?.file || path.join(outputDir, name)),
      logicalPath: normalizePath(configured?.logicalPath || path.join(logicalRoot, name)),
    }];
  }));
  const collectSources = options.collectSources;
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const correctionsFile = path.join(workspaceRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;
  let activePlanSources = null;

  if (!adapter || typeof adapter.buildItems !== 'function' ||
      typeof adapter.evaluateItem !== 'function' || typeof adapter.reduce !== 'function') {
    throw new Error(`Routine ${routineId} adapter is incomplete.`);
  }
  if (artifactNames.length === 0 || new Set(artifactNames).size !== artifactNames.length ||
      artifactNames.some((name) => path.basename(name) !== name || !/\.(?:json|md)$/i.test(name))) {
    throw new Error(`Routine ${routineId} artifact names must be unique JSON or Markdown basenames.`);
  }

  function logicalArtifact(name) {
    return artifactOutputs[name]?.logicalPath || normalizePath(path.join(logicalRoot, name));
  }

  const prefix = `source-bound-${routineId.toLowerCase()}`;
  const contract = {
    schema_version: 1,
    graph_id: options.graphId || `${routineId.toLowerCase()}-source-bound-shadow`,
    objective: options.objective,
    value_signal: options.valueSignal,
    constraints: options.constraints || [
      'Read only from the named canonical and runtime sources.',
      'Persist redacted hashes, aggregate states, and bounded proposals only.',
      'Treat a truthful hold or no-trigger state as distinct from business readiness.',
      'Write only noncanonical shadow artifacts and durable execution state.',
      'Perform no external action, canonical queue write, provider mutation, restart, retry, or secret access.',
    ],
    upstream_artifacts: options.upstreamArtifacts,
    scope: {
      root: options.scopeRoot || 'dillon-os plus explicitly named read-only local state',
      isolation_key: options.isolationKey,
      data_class: 'internal-redacted',
    },
    source_freshness: {
      checked_at: new Date().toISOString(),
      max_age_seconds: Number(options.maxAgeSeconds || 300),
      evidence: options.sourceEvidence,
    },
    finish_line: {
      predicate: options.finishLine,
      required_artifacts: artifactNames.map(logicalArtifact),
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: 2,
      timeout_seconds: Number(options.timeoutSeconds || 600),
      max_parallel: Number(options.maxParallel || 4),
      budget_units: Number(options.budgetUnits || 96),
    },
    adapters: {
      planner: `${prefix}-planner`,
      maker: `${prefix}-maker`,
      checker: `${prefix}-checker`,
      reducer: `${prefix}-reducer`,
      terminal_verifier: `${prefix}-terminal-verifier`,
      learner: `${prefix}-learner`,
    },
    approval: { external_actions: false, required_before: [] },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: options.canonicalState,
      dedupe_key: `${routineId}:${options.cadenceBucket}:source-bound-shadow`,
      checkpoint: logicalArtifact('run-receipt.json'),
      rollback: options.rollback || 'Discard shadow artifacts and retain canonical sources unchanged.',
      escalation: options.escalation || 'Return the exact stale, missing, ambiguous, unsafe, or unverified evidence to Marketing Chief.',
      allowed_actions: ['read_files', 'run_read_only_probe', 'hash_sources', 'write_shadow_artifact', 'recompute_state'],
      forbidden_actions: unique([
        'canonical_queue_write', 'send', 'post', 'publish', 'schedule', 'deploy',
        'spend', 'account_change', 'provider_mutation', 'restart', 'retry',
        'checkpoint_advance', 'secret_access', ...(options.forbiddenActions || []),
      ]),
    },
    learning: {
      fingerprint_inputs: ['source-manifest', 'work-item-fingerprints', 'terminal-assertions', 'artifact-hashes'],
      corrections_ledger: logicalArtifact('corrections.jsonl'),
    },
  };

  function context(sources, capturedAt) {
    return {
      routine_id: routineId,
      cadence_bucket: options.cadenceBucket,
      captured_at: capturedAt || sources.captured_at,
      source_set_sha256: sources.source_set_sha256,
    };
  }

  async function collectChecked() {
    return assertSourcePacket(await collectSources());
  }

  const adapters = {
    [`${prefix}-planner`]: async () => {
      const sources = await collectChecked();
      activePlanSources = sources;
      const items = buildItems(adapter, sources, routineId);
      return {
        evidence: `Collected ${items.length} isolated ${routineId} item(s) from source set ${sources.source_set_sha256}.`,
        source_set_sha256: sources.source_set_sha256,
        sources,
        items,
      };
    },

    [`${prefix}-maker`]: async ({ workflow_id: workflowId, item, attempt }) => {
      const sources = await collectChecked();
      if (sources.source_set_sha256 !== item.source_set_sha256 && item.source_set_sha256) {
        throw new Error(`Routine ${routineId} source set changed after planning.`);
      }
      const record = adapter.evaluateItem(item, sources, context(
        sources,
        item.evaluation_captured_at
      ));
      const isolatedRoot = path.join(workspaceRoot, 'isolated', safeItemId(item.id));
      const artifactFile = path.join(isolatedRoot, 'record.json');
      writeJsonAtomic(artifactFile, record);
      return {
        evidence: `Built one privacy-safe ${routineId} record for ${item.id}.`,
        isolation_id: `${workflowId}:${safeItemId(item.id)}:attempt:${attempt}`,
        artifacts: [fileEvidence(
          artifactFile,
          normalizePath(path.join(logicalRoot, 'workers', safeItemId(item.id) + '.json')),
          true
        )],
      };
    },

    [`${prefix}-checker`]: async ({ item, maker_result: makerResult }) => {
      const artifact = makerResult.artifacts[0];
      const bytes = fs.readFileSync(artifact.resume_locator);
      const hashPassed = sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
      const actual = hashPassed ? JSON.parse(bytes.toString('utf8')) : null;
      const sources = await collectChecked();
      const expected = adapter.evaluateItem(item, sources, context(
        sources,
        item.evaluation_captured_at
      ));
      const exactPassed = hashPassed && stableJson(actual) === stableJson(expected);
      return {
        evidence: `Independently reconstructed ${item.id} from the same source-bound contract.`,
        passed: Boolean(exactPassed),
        findings: exactPassed ? [] : ['Worker record did not reproduce exactly from current source evidence.'],
      };
    },

    [`${prefix}-reducer`]: async ({ plan, worker_results: workers }) => {
      const records = workers.map((worker) => readJson(worker.final_artifacts[0].resume_locator))
        .sort((a, b) => String(a.isolation_key || a.id).localeCompare(String(b.isolation_key || b.id)));
      const artifacts = adapter.reduce(records, plan.sources, context(
        plan.sources,
        plan.sources.captured_at
      ));
      const names = Object.keys(artifacts).sort();
      if (stableJson(names) !== stableJson(artifactNames.slice().sort())) {
        throw new Error(`Routine ${routineId} reducer returned the wrong artifact set.`);
      }
      const stagingRoot = path.join(workspaceRoot, 'staged');
      fs.mkdirSync(stagingRoot, { recursive: true });
      for (const name of artifactNames) {
        writeArtifactAtomic(path.join(stagingRoot, name), name, artifacts[name]);
      }
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: `Reduced all checked ${routineId} records without blending isolation keys.`,
        artifacts: artifactNames.map((name) =>
          fileEvidence(path.join(stagingRoot, name), logicalArtifact(name))
        ),
        staging_root: stagingRoot,
      };
    },

    [`${prefix}-terminal-verifier`]: async ({ plan, reduction }) => {
      const fresh = await collectChecked();
      const freshItems = buildItems(adapter, { ...fresh, captured_at: plan.sources.captured_at }, routineId);
      const expectedRecords = freshItems.map((item) => adapter.evaluateItem(
        item,
        fresh,
        context(fresh, plan.sources.captured_at)
      )).sort((a, b) => String(a.isolation_key || a.id).localeCompare(String(b.isolation_key || b.id)));
      const actualArtifacts = Object.fromEntries(artifactNames.map((name) => [
        name,
        readArtifact(path.join(reduction.staging_root, name), name),
      ]));
      const expectedArtifacts = adapter.reduce(
        expectedRecords,
        { ...fresh, captured_at: plan.sources.captured_at },
        context(fresh, plan.sources.captured_at)
      );
      const customAssertions = typeof adapter.terminalAssertions === 'function'
        ? adapter.terminalAssertions({
          actualArtifacts,
          expectedArtifacts,
          expectedRecords,
          freshSources: fresh,
          planSources: plan.sources,
        })
        : [];
      const assertions = [
        {
          id: 'source-manifest-stable',
          passed: fresh.source_set_sha256 === plan.source_set_sha256,
          detail: 'Every named source remains hash-bound at terminal verification.',
        },
        {
          id: 'every-isolated-item-reconstructed-exactly-once',
          passed: expectedRecords.length === freshItems.length &&
            new Set(expectedRecords.map((record) => record.isolation_key)).size === expectedRecords.length,
          detail: 'Every in-scope item has one collision-resistant reconstructed record.',
        },
        {
          id: 'reducer-output-reproduces-exactly',
          passed: stableJson(actualArtifacts) === stableJson(expectedArtifacts),
          detail: 'Final artifacts reproduce exactly from current sources and the frozen evaluation clock.',
        },
        ...customAssertions,
        {
          id: 'privacy-and-no-mutation-boundary',
          passed: assertArtifactPrivacy(actualArtifacts).length === 0 &&
            artifactNames.every((name) => artifactAttestsNoExternalAction(actualArtifacts[name])),
          detail: 'Final artifacts are redacted and attest no external, canonical, provider, restart, or checkpoint mutation.',
        },
      ];
      return {
        evidence: `Recollected and independently verified all ${routineId} sources, records, negative states, and artifact hashes.`,
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: artifactNames.map((name) =>
          fileEvidence(path.join(reduction.staging_root, name), logicalArtifact(name))
        ),
      };
    },

    [`${prefix}-learner`]: async ({ outcome, terminal_verification: terminal }) => {
      if (!activePlanSources || !terminal || !Array.isArray(terminal.assertions)) {
        throw new Error(`Routine ${routineId} learner is missing its verified plan or terminal receipt.`);
      }
      const corrections = outcome === 'terminal_true' && terminal.passed === true
        ? [adapter.successCorrection || `Retain ${routineId} source bindings and negative states until named evidence revalidates.`]
        : [adapter.failureCorrection || `Repair only the exact ${routineId} source, isolation, reducer, privacy, or assertion mismatch.`];
      const entry = {
        schema_version: 1,
        routine_id: routineId,
        recorded_at: new Date().toISOString(),
        source_set_sha256: activePlanSources.source_set_sha256,
        terminal_assertions: terminal.assertions.map((assertion) => ({
          id: assertion.id,
          passed: assertion.passed,
        })),
        corrections,
      };
      const serialized = JSON.stringify(entry) + '\n';
      fs.mkdirSync(path.dirname(correctionsFile), { recursive: true });
      fs.appendFileSync(correctionsFile, serialized, 'utf8');
      return {
        evidence: `Appended one hashed ${routineId} correction entry.`,
        corrections,
        ledger: contract.learning.corrections_ledger,
        ledger_receipt: {
          locator: contract.learning.corrections_ledger,
          entry_sha256: sha256(serialized),
        },
      };
    },
  };

  return {
    contract,
    adapters,
    workspaceRoot,
    commitVerifiedArtifacts() {
      if (!verifiedStagingRoot) throw new Error(`No terminal-verified ${routineId} artifacts are staged.`);
      fs.mkdirSync(outputDir, { recursive: true });
      for (const name of artifactNames) {
        fs.mkdirSync(path.dirname(artifactOutputs[name].file), { recursive: true });
        fs.copyFileSync(path.join(verifiedStagingRoot, name), artifactOutputs[name].file);
      }
      if (fs.existsSync(correctionsFile)) {
        fs.copyFileSync(correctionsFile, path.join(outputDir, 'corrections.jsonl'));
      }
    },
    cleanup() {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    },
  };
}

async function runSourceBoundRoutineDurable(options = {}) {
  const routineId = String(options.routineId || '').toUpperCase();
  if (!routineId) throw new Error('routineId is required.');
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafeRoutineOutput(options.outputDir, routineId, repoRoot);
  const stateRoot = path.resolve(options.stateRoot || path.join(
    repoRoot,
    '12_Brain',
    'state',
    'outcome-graph'
  ));
  const logicalRoot = options.logicalRoot || normalizePath(path.relative(repoRoot, outputDir));
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    `source-bound-${routineId.toLowerCase()}-${sha256(logicalRoot).slice(0, 20)}`
  );
  const collectSources = options.collectSources;
  const harness = createSourceBoundRoutineHarness({
    ...options,
    routineId,
    outputDir,
    logicalRoot,
    workspaceRoot,
    collectSources,
  });
  const readCanonicalBinding = async () => {
    const sources = assertSourcePacket(await collectSources());
    return {
      locator: `dillon-os://routine/${routineId}/${options.cadenceBucket}`,
      version: String(sources.binding_version || options.cadenceBucket),
      sha256: sources.source_set_sha256,
      captured_at: sources.captured_at,
    };
  };
  let settled = false;
  try {
    const result = await runDurableOutcomeGraph(harness.contract, {
      stateRoot,
      adapters: harness.adapters,
      readCanonicalBinding,
      verifyResumedWorker: verifyResumedSourceBoundWorker,
      verifyCompletedResult: (prior) => verifyCompletedSourceBound(
        prior,
        outputDir,
        options.artifactNames,
        options.artifactOutputs
      ),
      onCheckpoint: options.onCheckpoint,
      beforeFinalBindingCheck: async (provisional, context) => {
        harness.commitVerifiedArtifacts();
        if (typeof options.beforeFinalBindingCheck === 'function') {
          await options.beforeFinalBindingCheck(provisional, context);
        }
      },
      now: options.now,
      leaseSeconds: options.leaseSeconds,
    });
    settled = true;
    return result;
  } finally {
    if (settled || options.cleanupInterruptedWorkspace === true) harness.cleanup();
  }
}

module.exports = {
  assertArtifactPrivacy,
  artifactAttestsNoExternalAction,
  assertSafeRoutineOutput,
  assertSourcePacket,
  createSourceBoundRoutineHarness,
  fileEvidence,
  runSourceBoundRoutineDurable,
  verifyCompletedSourceBound,
  verifyResumedSourceBoundWorker,
};
