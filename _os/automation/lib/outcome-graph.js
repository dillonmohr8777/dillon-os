'use strict';

const crypto = require('node:crypto');

class OutcomeGraphFault extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OutcomeGraphFault';
    this.code = code;
  }
}

class OutcomeGraphInterruption extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OutcomeGraphInterruption';
    this.code = code;
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = canonicalize(value[key]);
      return out;
    }, {});
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(canonicalize(value));
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function validateContract(contract) {
  const errors = [];
  if (contract?.schema_version !== 1) errors.push('schema_version must be 1');
  if (!nonEmpty(contract?.graph_id)) errors.push('graph_id is required');
  if (!nonEmpty(contract?.objective)) errors.push('objective is required');
  if (!nonEmpty(contract?.value_signal)) errors.push('value_signal is required');
  if (!Array.isArray(contract?.constraints) ||
      contract.constraints.length === 0 ||
      contract.constraints.some((item) => !nonEmpty(item))) {
    errors.push('constraints must contain at least one boundary');
  }
  if (!Array.isArray(contract?.upstream_artifacts) ||
      contract.upstream_artifacts.length === 0 ||
      contract.upstream_artifacts.some((item) => !nonEmpty(item))) {
    errors.push('upstream_artifacts must contain at least one source locator');
  }

  for (const key of ['root', 'isolation_key', 'data_class']) {
    if (!nonEmpty(contract?.scope?.[key])) errors.push('scope.' + key + ' is required');
  }

  if (!nonEmpty(contract?.source_freshness?.checked_at)) {
    errors.push('source_freshness.checked_at is required');
  } else if (!Number.isFinite(Date.parse(contract.source_freshness.checked_at))) {
    errors.push('source_freshness.checked_at must be an ISO date-time');
  }
  if (!positiveInteger(contract?.source_freshness?.max_age_seconds)) {
    errors.push('source_freshness.max_age_seconds must be a positive integer');
  }
  if (!nonEmpty(contract?.source_freshness?.evidence)) {
    errors.push('source_freshness.evidence is required');
  }

  if (!nonEmpty(contract?.finish_line?.predicate)) {
    errors.push('finish_line.predicate is required');
  }
  if (!Array.isArray(contract?.finish_line?.required_artifacts) ||
      contract.finish_line.required_artifacts.length === 0 ||
      contract.finish_line.required_artifacts.some((item) => !nonEmpty(item))) {
    errors.push('finish_line.required_artifacts must contain at least one path or pattern');
  }

  for (const key of [
    'max_graph_iterations',
    'max_worker_attempts',
    'timeout_seconds',
    'max_parallel',
    'budget_units',
  ]) {
    if (!positiveInteger(contract?.stopping?.[key])) {
      errors.push('stopping.' + key + ' must be a positive integer');
    }
  }

  const adapterKeys = ['planner', 'maker', 'checker', 'reducer', 'terminal_verifier', 'learner'];
  for (const key of adapterKeys) {
    if (!nonEmpty(contract?.adapters?.[key])) errors.push('adapters.' + key + ' is required');
  }
  if (contract?.adapters?.maker === contract?.adapters?.checker) {
    errors.push('maker and checker adapters must be different');
  }
  if (contract?.adapters?.maker === contract?.adapters?.terminal_verifier) {
    errors.push('maker and terminal_verifier adapters must be different');
  }
  if (contract?.adapters?.reducer === contract?.adapters?.terminal_verifier) {
    errors.push('reducer and terminal_verifier adapters must be different');
  }

  if (typeof contract?.approval?.external_actions !== 'boolean') {
    errors.push('approval.external_actions must be boolean');
  }
  if (!Array.isArray(contract?.approval?.required_before)) {
    errors.push('approval.required_before must be an array');
  }
  if (contract?.approval?.external_actions === true &&
      !contract?.approval?.required_before?.includes('external_action')) {
    errors.push('external actions require an external_action approval gate');
  }

  for (const key of [
    'orchestrator',
    'canonical_state',
    'dedupe_key',
    'checkpoint',
    'rollback',
    'escalation',
  ]) {
    if (!nonEmpty(contract?.governance?.[key])) errors.push('governance.' + key + ' is required');
  }
  for (const key of ['allowed_actions', 'forbidden_actions']) {
    if (!Array.isArray(contract?.governance?.[key]) ||
        contract.governance[key].length === 0 ||
        contract.governance[key].some((item) => !nonEmpty(item))) {
      errors.push('governance.' + key + ' must contain at least one action');
    }
  }

  if (!Array.isArray(contract?.learning?.fingerprint_inputs) ||
      contract.learning.fingerprint_inputs.length === 0) {
    errors.push('learning.fingerprint_inputs must contain at least one input');
  }
  if (!nonEmpty(contract?.learning?.corrections_ledger)) {
    errors.push('learning.corrections_ledger is required');
  }

  return { ok: errors.length === 0, errors };
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function patternRegex(pattern) {
  const normalized = normalizePath(pattern);
  let source = '';
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    if (char === '*' && normalized[index + 1] === '*') {
      source += '.*';
      index += 1;
    } else if (char === '*') {
      source += '[^/]*';
    } else {
      source += char.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp('^' + source + '$');
}

function validateArtifactManifest(manifest, requiredPatterns) {
  const errors = [];
  if (!Array.isArray(manifest) || manifest.length === 0) {
    return { ok: false, errors: ['terminal verifier returned no artifact manifest'] };
  }
  const paths = new Set();
  for (const artifact of manifest) {
    const artifactPath = normalizePath(artifact?.path);
    if (!artifactPath) errors.push('artifact manifest contains an empty path');
    if (paths.has(artifactPath)) errors.push('artifact manifest contains duplicate path ' + artifactPath);
    paths.add(artifactPath);
    if (!/^[a-f0-9]{64}$/i.test(String(artifact?.sha256 || ''))) {
      errors.push('artifact ' + artifactPath + ' is missing a sha256');
    }
    if (!Number.isInteger(artifact?.bytes) || artifact.bytes < 0) {
      errors.push('artifact ' + artifactPath + ' has invalid byte count');
    }
  }
  for (const pattern of requiredPatterns) {
    const regex = patternRegex(pattern);
    if (![...paths].some((artifactPath) => regex.test(artifactPath))) {
      errors.push('required artifact pattern was not evidenced: ' + pattern);
    }
  }
  return { ok: errors.length === 0, errors };
}

function assertEvidence(result, adapterName) {
  if (!result || typeof result !== 'object') {
    throw new OutcomeGraphFault('invalid_adapter_result', adapterName + ' returned no object');
  }
  if (!nonEmpty(result.evidence)) {
    throw new OutcomeGraphFault('missing_evidence', adapterName + ' returned no evidence');
  }
  return result;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function consume() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  const count = Math.min(limit, Math.max(items.length, 1));
  await Promise.all(Array.from({ length: count }, consume));
  return results;
}

function makeRunId(contract, startedAt) {
  const nonce = crypto.randomBytes(4).toString('hex');
  return 'OG-' + startedAt.slice(0, 10).replace(/-/g, '') + '-' +
    sha256(contract.graph_id + '|' + startedAt + '|' + nonce).slice(0, 10).toUpperCase();
}

async function runOutcomeGraph(contract, options = {}) {
  const validation = validateContract(contract);
  if (!validation.ok) {
    throw new OutcomeGraphFault('invalid_contract', validation.errors.join('; '));
  }

  const clock = typeof options.now === 'function' ? options.now : () => new Date();
  const started = options.startedAt ? new Date(options.startedAt) : clock();
  if (!Number.isFinite(started.getTime())) {
    throw new OutcomeGraphFault('invalid_started_at', 'startedAt must be an ISO date-time');
  }
  const startedAt = started.toISOString();
  const runId = nonEmpty(options.runId) ? options.runId : makeRunId(contract, startedAt);
  const deadlineMs = started.getTime() + contract.stopping.timeout_seconds * 1000;
  const handlers = options.adapters || {};
  const resumeState = options.resumeState && typeof options.resumeState === 'object'
    ? options.resumeState
    : null;
  const invocationLog = Array.isArray(resumeState?.invocation_log)
    ? structuredClone(resumeState.invocation_log)
    : [];
  const graphIterations = Array.isArray(resumeState?.graph_iterations)
    ? structuredClone(resumeState.graph_iterations)
    : [];
  const seenIsolationIds = new Set();
  const verifiedWorkerState = new Map(Object.entries(resumeState?.verified_workers || {}));
  let budgetUsed = Number.isInteger(resumeState?.budget_used) ? resumeState.budget_used : 0;
  let activeGraphAttempt = positiveInteger(resumeState?.graph_attempt)
    ? resumeState.graph_attempt
    : 1;
  let activePlanSignature = nonEmpty(resumeState?.plan_signature)
    ? resumeState.plan_signature
    : null;
  let previousTerminalFindings = Array.isArray(resumeState?.previous_terminal_findings)
    ? [...resumeState.previous_terminal_findings]
    : [];
  let progressStage = nonEmpty(resumeState?.stage) ? resumeState.stage : 'started';
  let progressChain = Promise.resolve();

  function engineSnapshot() {
    return {
      stage: progressStage,
      graph_attempt: activeGraphAttempt,
      plan_signature: activePlanSignature,
      verified_workers: Object.fromEntries(verifiedWorkerState),
      budget_used: budgetUsed,
      previous_terminal_findings: previousTerminalFindings,
      graph_iterations: graphIterations,
      invocation_log: invocationLog,
    };
  }

  async function emitProgress(event, details = {}) {
    if (typeof options.onProgress !== 'function') return;
    progressChain = progressChain.then(async () => {
      progressStage = event;
      await options.onProgress({
        event,
        run_id: runId,
        started_at: startedAt,
        ...details,
        engine: engineSnapshot(),
      });
    });
    await progressChain;
  }

  function handoff(stepId, item = null) {
    return {
      workflow_id: runId,
      step_id: String(stepId),
      task: item?.task || item?.id || String(stepId),
      constraints: [...contract.constraints],
      upstream_artifacts: [...contract.upstream_artifacts],
      budget_units_remaining: Math.max(0, contract.stopping.budget_units - budgetUsed),
      timeout_seconds: Math.max(0, Math.ceil((deadlineMs - clock().getTime()) / 1000)),
    };
  }

  function baseResult() {
    return {
      run_id: runId,
      graph_id: contract.graph_id,
      objective: contract.objective,
      value_signal: contract.value_signal,
      contract_sha256: sha256(stableJson(contract)),
      started_at: startedAt,
      source_evidence: contract.source_freshness.evidence,
      finish_line: contract.finish_line.predicate,
      governance: {
        orchestrator: contract.governance.orchestrator,
        canonical_state: contract.governance.canonical_state,
        dedupe_key: contract.governance.dedupe_key,
        checkpoint: contract.governance.checkpoint,
        rollback: contract.governance.rollback,
        escalation: contract.governance.escalation,
      },
      graph_iterations: graphIterations,
      invocation_log: invocationLog,
      budget: {
        limit_units: contract.stopping.budget_units,
        used_units: budgetUsed,
      },
    };
  }

  async function invoke(adapterName, payload) {
    const handler = handlers[adapterName];
    if (typeof handler !== 'function') {
      throw new OutcomeGraphFault('missing_adapter', 'No handler registered for ' + adapterName);
    }
    if (budgetUsed >= contract.stopping.budget_units) {
      throw new OutcomeGraphFault('budget_exhausted', 'Outcome graph exhausted its budget');
    }
    const remainingMs = deadlineMs - clock().getTime();
    if (remainingMs <= 0) {
      throw new OutcomeGraphFault('timeout', 'Outcome graph reached its timeout');
    }
    budgetUsed += 1;
    const invokedAt = clock().toISOString();
    let timer;
    try {
      const result = await Promise.race([
        Promise.resolve().then(() => handler(payload)),
        new Promise((resolve, reject) => {
          timer = setTimeout(
            () => reject(new OutcomeGraphFault('timeout', adapterName + ' timed out')),
            remainingMs
          );
        }),
      ]);
      invocationLog.push({
        adapter: adapterName,
        invoked_at: invokedAt,
        status: 'returned',
      });
      return assertEvidence(result, adapterName);
    } catch (error) {
      invocationLog.push({
        adapter: adapterName,
        invoked_at: invokedAt,
        status: 'failed',
        code: error.code || 'adapter_error',
        error: error.message,
      });
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function learn(payload) {
    const learned = await invoke(contract.adapters.learner, payload);
    if (!learned.ledger_receipt ||
        learned.ledger_receipt.locator !== contract.learning.corrections_ledger ||
        !/^[a-f0-9]{64}$/i.test(String(learned.ledger_receipt.entry_sha256 || ''))) {
      throw new OutcomeGraphFault(
        'invalid_learning_receipt',
        'Learner did not return a matching correction-ledger locator and entry hash'
      );
    }
    return {
      evidence: learned.evidence,
      corrections: Array.isArray(learned.corrections) ? learned.corrections : [],
      ledger: contract.learning.corrections_ledger,
      ledger_receipt: learned.ledger_receipt,
    };
  }

  function finish(outcome, extra = {}) {
    const finishedAt = clock().toISOString();
    return {
      ...baseResult(),
      outcome,
      terminal_truth: outcome === 'complete' || outcome === 'awaiting_approval',
      finished_at: finishedAt,
      elapsed_seconds: Math.max(0, (Date.parse(finishedAt) - Date.parse(startedAt)) / 1000),
      ...extra,
      budget: {
        limit_units: contract.stopping.budget_units,
        used_units: budgetUsed,
      },
    };
  }

  const sourceAgeSeconds = (started.getTime() - Date.parse(contract.source_freshness.checked_at)) / 1000;
  if (sourceAgeSeconds < -300 || sourceAgeSeconds > contract.source_freshness.max_age_seconds) {
    return finish('blocked', {
      blocked_by: 'stale_source',
      reason: 'Source evidence is outside the declared freshness window.',
      source_age_seconds: Math.round(sourceAgeSeconds),
    });
  }

  try {
    const makerHandler = handlers[contract.adapters.maker];
    const checkerHandler = handlers[contract.adapters.checker];
    const reducerHandler = handlers[contract.adapters.reducer];
    const terminalHandler = handlers[contract.adapters.terminal_verifier];
    if (typeof makerHandler === 'function' && makerHandler === checkerHandler) {
      throw new OutcomeGraphFault('non_independent_checker', 'Maker and checker share one runtime handler');
    }
    if (typeof makerHandler === 'function' && makerHandler === terminalHandler) {
      throw new OutcomeGraphFault(
        'non_independent_terminal_verifier',
        'Maker and terminal verifier share one runtime handler'
      );
    }
    if (typeof reducerHandler === 'function' && reducerHandler === terminalHandler) {
      throw new OutcomeGraphFault(
        'non_independent_terminal_verifier',
        'Reducer and terminal verifier share one runtime handler'
      );
    }

    for (
      let graphAttempt = activeGraphAttempt;
      graphAttempt <= contract.stopping.max_graph_iterations;
      graphAttempt += 1
    ) {
      activeGraphAttempt = graphAttempt;
      let iteration = graphIterations.find((candidate) => candidate.iteration === graphAttempt);
      if (!iteration) {
        iteration = {
          iteration: graphAttempt,
          status: 'running',
          planner: null,
          workers: [],
          reduction: null,
          terminal_verification: null,
          learning: null,
        };
        graphIterations.push(iteration);
      } else {
        iteration.status = 'running';
      }

      const plan = await invoke(contract.adapters.planner, {
        ...handoff('planner'),
        contract,
        graph_attempt: graphAttempt,
        previous_terminal_findings: previousTerminalFindings,
      });
      if (!Array.isArray(plan.items) || plan.items.length === 0) {
        throw new OutcomeGraphFault('empty_plan', 'Planner returned no work items');
      }
      const itemIds = new Set();
      const isolationKeys = new Set();
      for (const item of plan.items) {
        if (!nonEmpty(item?.id) || !nonEmpty(item?.isolation_key) || !nonEmpty(item?.input_fingerprint)) {
          throw new OutcomeGraphFault(
            'invalid_plan_item',
            'Every plan item requires id, isolation_key, and input_fingerprint'
          );
        }
        if (itemIds.has(item.id)) {
          throw new OutcomeGraphFault('duplicate_plan_item', 'Duplicate plan item ' + item.id);
        }
        if (isolationKeys.has(item.isolation_key)) {
          throw new OutcomeGraphFault(
            'duplicate_isolation_key',
            'Duplicate plan isolation key ' + item.isolation_key
          );
        }
        if (!/^[a-f0-9]{64}$/i.test(item.input_fingerprint)) {
          throw new OutcomeGraphFault(
            'invalid_input_fingerprint',
            'Plan item ' + item.id + ' does not carry a SHA-256 input fingerprint'
          );
        }
        itemIds.add(item.id);
        isolationKeys.add(item.isolation_key);
      }
      const planSignature = sha256(stableJson(plan.items.map((item) => ({
        id: item.id,
        isolation_key: item.isolation_key,
        input_fingerprint: item.input_fingerprint,
        task: nonEmpty(item.task) ? item.task : null,
      }))));
      if (activePlanSignature && activePlanSignature !== planSignature) {
        throw new OutcomeGraphFault(
          'resume_plan_drift',
          'The resumed planner output does not match the checkpointed plan signature'
        );
      }
      activePlanSignature = planSignature;
      for (const itemId of verifiedWorkerState.keys()) {
        if (!itemIds.has(itemId)) verifiedWorkerState.delete(itemId);
      }
      iteration.planner = {
        evidence: plan.evidence,
        item_count: plan.items.length,
        plan_signature: planSignature,
        items: plan.items.map((item) => ({
          id: item.id,
          isolation_key: item.isolation_key,
          input_fingerprint: item.input_fingerprint,
          task: nonEmpty(item.task) ? item.task : null,
        })),
      };
      await emitProgress('planned', { graph_attempt: graphAttempt });

      const workerResults = await mapLimit(
        plan.items,
        contract.stopping.max_parallel,
        async (item) => {
          const checkpointed = verifiedWorkerState.get(item.id);
          if (checkpointed && checkpointed.input_fingerprint === item.input_fingerprint) {
            let reusable = false;
            if (typeof options.verifyResumedWorker === 'function') {
              const verification = await options.verifyResumedWorker({
                ...handoff(item.id, item),
                contract,
                item,
                graph_attempt: graphAttempt,
                worker_result: checkpointed.worker_result,
              });
              reusable = verification === true || verification?.ok === true;
            }
            if (reusable) {
              seenIsolationIds.add(checkpointed.worker_result.isolation_id);
              invocationLog.push({
                adapter: 'resume-verified-worker',
                item_id: item.id,
                invoked_at: clock().toISOString(),
                status: 'reused',
              });
              return {
                ...checkpointed.worker_result,
                resumed: true,
              };
            }
            verifiedWorkerState.delete(item.id);
            await emitProgress('resume_rejected', {
              graph_attempt: graphAttempt,
              item_id: item.id,
              reason: 'Persisted worker evidence did not revalidate.',
            });
          }

          const attempts = [];
          let previousFindings = [];
          for (let attempt = 1; attempt <= contract.stopping.max_worker_attempts; attempt += 1) {
            const maker = await invoke(contract.adapters.maker, {
              ...handoff(item.id, item),
              contract,
              item,
              graph_attempt: graphAttempt,
              attempt,
              previous_findings: previousFindings,
            });
            if (!nonEmpty(maker.isolation_id)) {
              throw new OutcomeGraphFault('missing_isolation', 'Maker returned no isolation_id for ' + item.id);
            }
            if (seenIsolationIds.has(maker.isolation_id)) {
              throw new OutcomeGraphFault(
                'isolation_collision',
                'Maker reused isolation_id ' + maker.isolation_id
              );
            }
            seenIsolationIds.add(maker.isolation_id);
            if (!Array.isArray(maker.artifacts) || maker.artifacts.length === 0) {
              throw new OutcomeGraphFault('missing_worker_artifact', 'Maker returned no artifact for ' + item.id);
            }
            const makerManifest = validateArtifactManifest(maker.artifacts, []);
            if (!makerManifest.ok) {
              throw new OutcomeGraphFault(
                'invalid_worker_artifact',
                'Maker artifact evidence is invalid for ' + item.id + ': ' + makerManifest.errors.join('; ')
              );
            }

            const checker = await invoke(contract.adapters.checker, {
              ...handoff(item.id + ':checker', item),
              contract,
              item,
              graph_attempt: graphAttempt,
              attempt,
              maker_result: maker,
            });
            if (typeof checker.passed !== 'boolean' || !Array.isArray(checker.findings)) {
              throw new OutcomeGraphFault(
                'invalid_checker_result',
                'Checker requires boolean passed and findings array'
              );
            }
            attempts.push({
              attempt,
              isolation_id: maker.isolation_id,
              maker_evidence: maker.evidence,
              artifacts: maker.artifacts,
              checker_evidence: checker.evidence,
              passed: checker.passed,
              findings: checker.findings,
            });
            if (checker.passed) {
              const verifiedWorker = {
                item_id: item.id,
                input_fingerprint: item.input_fingerprint,
                status: 'verified',
                attempts,
                final_artifacts: maker.artifacts,
                isolation_id: maker.isolation_id,
              };
              verifiedWorkerState.set(item.id, {
                input_fingerprint: item.input_fingerprint,
                worker_result: verifiedWorker,
              });
              await emitProgress('worker_verified', {
                graph_attempt: graphAttempt,
                item_id: item.id,
              });
              return verifiedWorker;
            }
            previousFindings = checker.findings;
          }
          return {
            item_id: item.id,
            status: 'failed',
            attempts,
            final_artifacts: [],
            isolation_id: null,
          };
        }
      );
      iteration.workers = workerResults;
      await emitProgress('workers_verified', { graph_attempt: graphAttempt });

      const failedWorkers = workerResults.filter((worker) => worker.status !== 'verified');
      if (failedWorkers.length > 0) {
        iteration.status = 'worker_failed';
        iteration.learning = await learn({
          ...handoff('learner:worker-failed'),
          contract,
          outcome: 'worker_failed',
          graph_attempt: graphAttempt,
          worker_results: workerResults,
        });
        await emitProgress('learned', {
          graph_attempt: graphAttempt,
          learned_outcome: 'worker_failed',
        });
        if (graphAttempt === contract.stopping.max_graph_iterations) {
          return finish('blocked', {
            blocked_by: 'worker_attempts_exhausted',
            reason: 'One or more isolated worker loops did not pass independent checking.',
          });
        }
        activeGraphAttempt = graphAttempt + 1;
        activePlanSignature = null;
        verifiedWorkerState.clear();
        await emitProgress('iteration_retry', { graph_attempt: activeGraphAttempt });
        continue;
      }

      const reduction = await invoke(contract.adapters.reducer, {
        ...handoff('reducer'),
        contract,
        plan,
        worker_results: workerResults,
      });
      if (!Array.isArray(reduction.artifacts) || reduction.artifacts.length === 0) {
        throw new OutcomeGraphFault('empty_reduction', 'Reducer returned no artifacts');
      }
      const reductionManifest = validateArtifactManifest(reduction.artifacts, []);
      if (!reductionManifest.ok) {
        throw new OutcomeGraphFault(
          'invalid_reduction',
          'Reducer artifact evidence is invalid: ' + reductionManifest.errors.join('; ')
        );
      }
      iteration.reduction = {
        evidence: reduction.evidence,
        artifacts: reduction.artifacts,
      };
      await emitProgress('reduced', { graph_attempt: graphAttempt });

      const terminal = await invoke(contract.adapters.terminal_verifier, {
        ...handoff('terminal-verifier'),
        contract,
        plan,
        worker_results: workerResults,
        reduction,
      });
      if (typeof terminal.passed !== 'boolean' || !Array.isArray(terminal.assertions)) {
        throw new OutcomeGraphFault(
          'invalid_terminal_result',
          'Terminal verifier requires boolean passed and assertions array'
        );
      }
      const failedAssertions = terminal.assertions.filter((assertion) => assertion?.passed !== true);
      const manifestValidation = validateArtifactManifest(
        terminal.artifact_manifest,
        contract.finish_line.required_artifacts
      );
      const terminalPassed = terminal.passed && failedAssertions.length === 0 && manifestValidation.ok;
      const terminalFindings = [
        ...failedAssertions.map((assertion) => String(assertion.detail || assertion.id || 'assertion failed')),
        ...manifestValidation.errors,
      ];
      iteration.terminal_verification = {
        evidence: terminal.evidence,
        declared_pass: terminal.passed,
        passed: terminalPassed,
        assertions: terminal.assertions,
        artifact_manifest: terminal.artifact_manifest || [],
        manifest_errors: manifestValidation.errors,
      };
      await emitProgress('terminal_verified', {
        graph_attempt: graphAttempt,
        passed: terminalPassed,
      });

      if (!terminalPassed) {
        iteration.status = 'terminal_failed';
        previousTerminalFindings = terminalFindings;
        iteration.learning = await learn({
          ...handoff('learner:terminal-failed'),
          contract,
          outcome: 'terminal_failed',
          graph_attempt: graphAttempt,
          findings: terminalFindings,
          terminal_verification: iteration.terminal_verification,
        });
        await emitProgress('learned', {
          graph_attempt: graphAttempt,
          learned_outcome: 'terminal_failed',
        });
        if (graphAttempt === contract.stopping.max_graph_iterations) {
          return finish('blocked', {
            blocked_by: 'terminal_predicate_false',
            reason: 'The independent terminal verifier did not prove the finish line.',
            terminal_findings: terminalFindings,
          });
        }
        activeGraphAttempt = graphAttempt + 1;
        activePlanSignature = null;
        verifiedWorkerState.clear();
        await emitProgress('iteration_retry', { graph_attempt: activeGraphAttempt });
        continue;
      }

      iteration.learning = await learn({
        ...handoff('learner:terminal-true'),
        contract,
        outcome: 'terminal_true',
        graph_attempt: graphAttempt,
        terminal_verification: iteration.terminal_verification,
      });
      await emitProgress('learned', {
        graph_attempt: graphAttempt,
        learned_outcome: 'terminal_true',
      });
      iteration.status = 'verified';
      const driftFingerprint = sha256(stableJson({
        inputs: contract.learning.fingerprint_inputs,
        source: contract.source_freshness.evidence,
        artifacts: terminal.artifact_manifest,
        assertions: terminal.assertions,
      }));
      const approvalRequired = contract.approval.external_actions ||
        contract.approval.required_before.includes('adopt');
      const result = finish(approvalRequired ? 'awaiting_approval' : 'complete', {
        blocked_by: approvalRequired ? 'approval_required' : null,
        reason: approvalRequired
          ? 'Finish line is proven; the declared human approval gate remains closed.'
          : 'Finish line is proven by an independent terminal verifier.',
        terminal_evidence: iteration.terminal_verification,
        learning_evidence: iteration.learning,
        drift_fingerprint: driftFingerprint,
      });
      await emitProgress('finished', {
        graph_attempt: graphAttempt,
        outcome: result.outcome,
      });
      return result;
    }
  } catch (error) {
    if (error instanceof OutcomeGraphInterruption) throw error;
    const result = finish('blocked', {
      blocked_by: error.code || 'runtime_error',
      reason: error.message,
    });
    await emitProgress('blocked', {
      graph_attempt: activeGraphAttempt,
      blocked_by: result.blocked_by,
    });
    return result;
  }

  return finish('blocked', {
    blocked_by: 'iteration_limit',
    reason: 'Outcome graph stopped without proving its finish line.',
  });
}

module.exports = {
  OutcomeGraphFault,
  OutcomeGraphInterruption,
  sha256,
  stableJson,
  validateContract,
  validateArtifactManifest,
  runOutcomeGraph,
};
