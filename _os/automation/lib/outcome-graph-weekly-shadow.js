'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { REPO_ROOT } = require('./fsutil');
const { runOutcomeGraph, sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph } = require('./outcome-graph-state');
const { auditFiles } = require('./outcome-graph-audit');

const execFileAsync = promisify(execFile);

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function repoRelative(file) {
  return normalizePath(path.relative(REPO_ROOT, file));
}

function fileEvidence(file, logicalPath) {
  const bytes = fs.readFileSync(file);
  return {
    path: normalizePath(logicalPath),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function runPowerShellJson(script) {
  const { stdout } = await execFileAsync('pwsh.exe', [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-File',
    script,
    '-VaultRoot',
    REPO_ROOT,
    '-Json',
  ], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 120000,
    windowsHide: true,
  });
  return JSON.parse(stdout.replace(/^﻿/, '').trim());
}

function latestLoopReceipt() {
  const dir = path.join(REPO_ROOT, '12_Brain', 'queue');
  const files = fs.readdirSync(dir)
    .filter((name) => /^claude-loop-\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
    .sort();
  if (files.length === 0) throw new Error('No Claude loop receipt log is available for W09.');
  return path.join(dir, files[files.length - 1]);
}

async function collectW09() {
  const registryFile = path.join(REPO_ROOT, '11_Agents', 'claude-operating-team.json');
  const receiptFile = latestLoopReceipt();
  const [operatingTeam, dailyDriver] = await Promise.all([
    runPowerShellJson(
      path.join(REPO_ROOT, 'System', 'scripts', 'Test-ClaudeOperatingTeam.ps1')
    ),
    runPowerShellJson(
      path.join(REPO_ROOT, 'System', 'scripts', 'Test-ClaudeDailyDriver.ps1')
    ),
  ]);
  return {
    captured_at: new Date().toISOString(),
    operating_team: operatingTeam,
    daily_driver: dailyDriver,
    legacy_outcome_audit: auditFiles(registryFile, receiptFile),
  };
}

async function collectW11() {
  const [structuralTest, graphMeasurement] = await Promise.all([
    runPowerShellJson(
      path.join(REPO_ROOT, 'System', 'scripts', 'Test-SecondBrain.ps1')
    ),
    runPowerShellJson(
      path.join(REPO_ROOT, 'System', 'scripts', 'Measure-SecondBrainGraph.ps1')
    ),
  ]);
  return {
    captured_at: new Date().toISOString(),
    structural_test: structuralTest,
    graph_measurement: graphMeasurement,
  };
}

function w09Fingerprint(snapshot) {
  return sha256(stableJson({
    registry_sha256: snapshot.legacy_outcome_audit.sources.registry_sha256,
    receipt_sha256: snapshot.legacy_outcome_audit.sources.receipt_sha256,
    operating_team: {
      overall: snapshot.operating_team.overall,
      passed: snapshot.operating_team.passed,
      total: snapshot.operating_team.total,
    },
    daily_driver: {
      overall: snapshot.daily_driver.overall,
      passed: snapshot.daily_driver.passed,
      total: snapshot.daily_driver.total,
    },
  }));
}

function w11Fingerprint(snapshot) {
  return sha256(stableJson({
    structural: snapshot.structural_test.summary,
    graph: {
      nodes: snapshot.graph_measurement.nodes,
      edges: snapshot.graph_measurement.edges,
      components: snapshot.graph_measurement.components,
      largest_component_coverage: snapshot.graph_measurement.largestComponentCoverage,
      orphans: snapshot.graph_measurement.orphans,
      unresolved_links: snapshot.graph_measurement.unresolvedLinkOccurrences,
    },
  }));
}

function compareW09(artifact, fresh) {
  const findings = [];
  if (artifact.routine_id !== 'W09') findings.push('Artifact routine_id is not W09.');
  if (artifact.snapshot?.operating_team?.overall !== 'pass') {
    findings.push('Operating-team validation did not pass.');
  }
  if (artifact.snapshot?.daily_driver?.overall !== 'pass') {
    findings.push('Daily-driver validation did not pass.');
  }
  if (artifact.snapshot?.legacy_outcome_audit?.verdict !== 'migration_required') {
    findings.push('Legacy false-completion migration risk was hidden or changed.');
  }
  if (artifact.snapshot?.legacy_outcome_audit?.counts?.receipts_with_false_completion_risk < 1) {
    findings.push('No false-completion-risk receipt was evidenced.');
  }
  if (artifact.snapshot?.legacy_outcome_audit?.sources?.registry_sha256 !==
      fresh.legacy_outcome_audit.sources.registry_sha256) {
    findings.push('Operating-team registry changed after the artifact was built.');
  }
  if (artifact.snapshot?.legacy_outcome_audit?.sources?.receipt_sha256 !==
      fresh.legacy_outcome_audit.sources.receipt_sha256) {
    findings.push('Claude loop receipt log changed after the artifact was built.');
  }
  return findings;
}

function compareW11(artifact, fresh) {
  const findings = [];
  const structural = artifact.snapshot?.structural_test;
  const graph = artifact.snapshot?.graph_measurement;
  if (artifact.routine_id !== 'W11') findings.push('Artifact routine_id is not W11.');
  if (structural?.summary?.errorCount !== 0) findings.push('Second-brain structural errors are nonzero.');
  if (graph?.components !== 1) findings.push('Knowledge graph has more than one component.');
  if (graph?.orphans !== 0) findings.push('Knowledge graph has orphan notes.');
  if (graph?.largestComponentCoverage !== 100) {
    findings.push('Knowledge graph largest-component coverage is below 100 percent.');
  }
  if (graph?.nodes !== fresh.graph_measurement.nodes ||
      graph?.edges !== fresh.graph_measurement.edges ||
      graph?.components !== fresh.graph_measurement.components ||
      graph?.orphans !== fresh.graph_measurement.orphans) {
    findings.push('Knowledge graph changed after the artifact was built.');
  }
  if (fresh.structural_test.summary.errorCount !== 0) {
    findings.push('Fresh independent structural test has errors.');
  }
  return findings;
}

function assertSafeRepoOutputDir(candidate, options = {}) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(REPO_ROOT);
  if (!absolute.startsWith(root + path.sep)) {
    throw new Error('Weekly shadow output must remain inside the Dillon OS repository.');
  }
  const relative = repoRelative(absolute);
  if (!/^System\/outcome-graph\/shadow-\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?$/i.test(relative)) {
    throw new Error('Weekly shadow output must use System/outcome-graph/shadow-YYYY-MM-DD[-slug].');
  }
  if (options.requireEmpty !== false &&
      fs.existsSync(absolute) &&
      fs.readdirSync(absolute).length > 0) {
    throw new Error('Weekly shadow output directory is not empty: ' + relative);
  }
  return absolute;
}

function createWeeklyShadowHarness(options) {
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = options.logicalRoot || repoRelative(outputDir);
  const collectReliability = options.collectW09 || collectW09;
  const collectGraph = options.collectW11 || collectW11;
  const tempRoot = options.workspaceRoot
    ? path.resolve(options.workspaceRoot)
    : fs.mkdtempSync(path.join(os.tmpdir(), 'outcome-graph-weekly-'));
  fs.mkdirSync(tempRoot, { recursive: true });
  const workspaces = new Map();
  const correctionsFile = path.join(tempRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;
  const checkedAt = new Date().toISOString();

  function logicalArtifact(name) {
    return normalizePath(path.join(logicalRoot, name));
  }

  const contract = {
    schema_version: 1,
    graph_id: 'weekly-w09-w11-shadow',
    objective: 'Produce current, independently reproducible W09 automation-reliability and W11 knowledge-graph-health evidence without changing live operations.',
    value_signal: 'Both weekly verification artifacts reproduce from live sources and preserve detected false-completion risk.',
    constraints: [
      'Read-only access to live scheduler, receipt, and vault sources.',
      'Writes are limited to the named shadow output directory.',
      'No canonical queue or scheduler mutation.',
      'No external action.',
    ],
    upstream_artifacts: [
      '11_Agents/claude-operating-team.json',
      '12_Brain/queue/claude-loop-YYYY-MM-DD.jsonl',
      'System/scripts/Test-ClaudeOperatingTeam.ps1',
      'System/scripts/Test-ClaudeDailyDriver.ps1',
      'System/scripts/Test-SecondBrain.ps1',
      'System/scripts/Measure-SecondBrainGraph.ps1',
    ],
    scope: {
      root: repoRelative(REPO_ROOT) || '.',
      isolation_key: 'routine_id',
      data_class: 'internal-redacted',
    },
    source_freshness: {
      checked_at: checkedAt,
      max_age_seconds: 300,
      evidence: 'Live registry, current Claude loop receipt log, deterministic scheduler tests, and current vault graph checks.',
    },
    finish_line: {
      predicate: 'W09 and W11 each have an isolated checked evidence artifact whose live source fingerprints and outcome-specific assertions reproduce at terminal verification.',
      required_artifacts: [
        logicalArtifact('W09-automation-reliability.json'),
        logicalArtifact('W11-knowledge-graph-health.json'),
      ],
    },
    stopping: {
      max_graph_iterations: 2,
      max_worker_attempts: 2,
      timeout_seconds: 240,
      max_parallel: 2,
      budget_units: 30,
    },
    adapters: {
      planner: 'weekly-shadow-planner',
      maker: 'weekly-shadow-evidence-maker',
      checker: 'weekly-shadow-independent-checker',
      reducer: 'weekly-shadow-reducer',
      terminal_verifier: 'weekly-shadow-terminal-verifier',
      learner: 'weekly-shadow-correction-ledger',
    },
    approval: {
      external_actions: false,
      required_before: [],
    },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: 'client-operations remains the sole canonical queue; this run is shadow evidence only',
      dedupe_key: 'internal:weekly-w09-w11-shadow:' + logicalRoot,
      checkpoint: logicalArtifact('run-receipt.json'),
      rollback: 'Discard the isolated and staged shadow artifacts; live scheduler and queue state are unchanged.',
      escalation: 'Return blocked to Marketing Chief with exact stale-source, checker, or terminal findings.',
      allowed_actions: [
        'read_files',
        'run_local_test',
        'aggregate_counts',
        'write_shadow_artifact',
        'hash_artifacts',
      ],
      forbidden_actions: [
        'canonical_queue_write',
        'scheduler_write',
        'send',
        'post',
        'publish',
        'deploy',
        'spend',
        'account_change',
      ],
    },
    learning: {
      fingerprint_inputs: [
        'operating-team-registry',
        'claude-loop-receipts',
        'scheduler-tests',
        'vault-structural-tests',
        'knowledge-graph-measurement',
      ],
      corrections_ledger: logicalArtifact('corrections.jsonl'),
    },
  };

  const adapters = {
    'weekly-shadow-planner': async () => {
      const [w09, w11] = await Promise.all([
        collectReliability(),
        collectGraph(),
      ]);
      return {
        evidence: 'Collected current W09 and W11 source packets before fan-out.',
        items: [
          {
            id: 'W09',
            isolation_key: 'routine:W09',
            input_fingerprint: w09Fingerprint(w09),
            snapshot: w09,
          },
          {
            id: 'W11',
            isolation_key: 'routine:W11',
            input_fingerprint: w11Fingerprint(w11),
            snapshot: w11,
          },
        ],
      };
    },

    'weekly-shadow-evidence-maker': async ({
      item,
      graph_attempt: graphAttempt,
      attempt,
      previous_findings: previousFindings,
    }) => {
      const isolationId = item.id + '-graph-' + graphAttempt + '-attempt-' + attempt;
      const isolatedRoot = path.join(tempRoot, 'isolated', isolationId);
      const name = item.id === 'W09'
        ? 'W09-automation-reliability.json'
        : 'W11-knowledge-graph-health.json';
      const artifactFile = path.join(isolatedRoot, name);
      const artifact = {
        schema_version: 1,
        routine_id: item.id,
        generated_at: new Date().toISOString(),
        objective: item.id === 'W09'
          ? 'Truthfully audit automation reliability, including false-completion risk.'
          : 'Prove current vault structure and knowledge-graph connectivity.',
        source_fingerprint: item.input_fingerprint,
        revised_from_checker_findings: previousFindings,
        snapshot: item.snapshot,
      };
      writeJson(artifactFile, artifact);
      workspaces.set(isolationId, isolatedRoot);
      return {
        evidence: 'Built the ' + item.id + ' evidence artifact in isolated workspace ' + isolationId + '.',
        isolation_id: isolationId,
        artifacts: [{
          ...fileEvidence(artifactFile, logicalArtifact(name)),
          ...(options.resumable === true ? { resume_locator: artifactFile } : {}),
        }],
      };
    },

    'weekly-shadow-independent-checker': async ({ item, maker_result: makerResult }) => {
      const name = item.id === 'W09'
        ? 'W09-automation-reliability.json'
        : 'W11-knowledge-graph-health.json';
      const artifactFile = makerResult.artifacts?.[0]?.resume_locator ||
        path.join(workspaces.get(makerResult.isolation_id), name);
      const artifact = readJson(artifactFile);
      const fresh = await (item.id === 'W09' ? collectReliability() : collectGraph());
      const findings = item.id === 'W09'
        ? compareW09(artifact, fresh)
        : compareW11(artifact, fresh);
      return {
        evidence: 'Re-ran live ' + item.id + ' sources and compared outcome-specific assertions.',
        passed: findings.length === 0,
        findings,
      };
    },

    'weekly-shadow-reducer': async ({ worker_results: workerResults }) => {
      const stagingRoot = fs.mkdtempSync(path.join(tempRoot, 'staged-'));
      const artifacts = [];
      for (const worker of workerResults) {
        const name = worker.item_id === 'W09'
          ? 'W09-automation-reliability.json'
          : 'W11-knowledge-graph-health.json';
        const source = worker.final_artifacts?.[0]?.resume_locator ||
          path.join(workspaces.get(worker.isolation_id), name);
        const target = path.join(stagingRoot, name);
        fs.copyFileSync(source, target);
        artifacts.push(fileEvidence(target, logicalArtifact(name)));
      }
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: 'Merged the two checked routine artifacts into a collision-free staging directory.',
        artifacts,
        staging_root: stagingRoot,
      };
    },

    'weekly-shadow-terminal-verifier': async ({ reduction }) => {
      const w09File = path.join(reduction.staging_root, 'W09-automation-reliability.json');
      const w11File = path.join(reduction.staging_root, 'W11-knowledge-graph-health.json');
      const w09 = readJson(w09File);
      const w11 = readJson(w11File);
      const [freshW09, freshW11] = await Promise.all([
        collectReliability(),
        collectGraph(),
      ]);
      const w09Findings = compareW09(w09, freshW09);
      const w11Findings = compareW11(w11, freshW11);
      return {
        evidence: 'Terminal verifier independently repeated both live source checks after reduction.',
        passed: w09Findings.length === 0 && w11Findings.length === 0,
        assertions: [
          {
            id: 'W09-reproduces-current-reliability-state',
            passed: w09Findings.length === 0,
            detail: w09Findings.length ? w09Findings.join(' ') :
              'W09 structural passes and false-completion migration risk both remain visible.',
          },
          {
            id: 'W11-proves-connected-vault-graph',
            passed: w11Findings.length === 0,
            detail: w11Findings.length ? w11Findings.join(' ') :
              'W11 has zero structural errors, one component, full coverage, and zero orphans.',
          },
        ],
        artifact_manifest: [
          fileEvidence(w09File, logicalArtifact('W09-automation-reliability.json')),
          fileEvidence(w11File, logicalArtifact('W11-knowledge-graph-health.json')),
        ],
      };
    },

    'weekly-shadow-correction-ledger': async ({ outcome, graph_attempt: graphAttempt, findings }) => {
      const entry = {
        recorded_at: new Date().toISOString(),
        graph_id: contract.graph_id,
        graph_attempt: graphAttempt,
        outcome,
        findings: Array.isArray(findings) ? findings : [],
        correction: outcome === 'terminal_true'
          ? 'Keep W09 false-completion risk visible while migrating W09 and W11 to outcome-specific terminal predicates.'
          : 'Re-plan from fresh sources and route exact findings into isolated artifact revision.',
      };
      const serialized = JSON.stringify(entry);
      fs.appendFileSync(correctionsFile, serialized + '\n', 'utf8');
      return {
        evidence: 'Appended one hashed correction entry for graph outcome ' + outcome + '.',
        corrections: [entry.correction],
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
    tempRoot,
    outputDir,
    getVerifiedStagingRoot: () => verifiedStagingRoot,
    correctionsFile,
    commitVerifiedArtifacts() {
      if (!verifiedStagingRoot) {
        throw new Error('No terminal-verified weekly staging directory is available to commit.');
      }
      fs.mkdirSync(outputDir, { recursive: true });
      for (const name of ['W09-automation-reliability.json', 'W11-knowledge-graph-health.json']) {
        fs.copyFileSync(
          path.join(verifiedStagingRoot, name),
          path.join(outputDir, name)
        );
      }
      if (fs.existsSync(correctionsFile)) {
        fs.copyFileSync(correctionsFile, path.join(outputDir, 'corrections.jsonl'));
      }
    },
    cleanup() {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    },
  };
}

async function runWeeklyShadow(options) {
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafeRepoOutputDir(options.outputDir);
  if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length > 0) {
    throw new Error('Weekly shadow output directory is not empty.');
  }
  const harness = createWeeklyShadowHarness({
    ...options,
    outputDir,
  });
  try {
    const result = await runOutcomeGraph(harness.contract, { adapters: harness.adapters });
    fs.mkdirSync(outputDir, { recursive: true });
    if (result.terminal_truth && harness.getVerifiedStagingRoot()) {
      for (const name of ['W09-automation-reliability.json', 'W11-knowledge-graph-health.json']) {
        fs.copyFileSync(
          path.join(harness.getVerifiedStagingRoot(), name),
          path.join(outputDir, name)
        );
      }
    }
    if (fs.existsSync(harness.correctionsFile)) {
      fs.copyFileSync(harness.correctionsFile, path.join(outputDir, 'corrections.jsonl'));
    }
    return result;
  } finally {
    harness.cleanup();
  }
}

async function collectWeeklyCanonicalBinding(collectReliability = collectW09, collectGraph = collectW11) {
  const [w09, w11] = await Promise.all([
    collectReliability(),
    collectGraph(),
  ]);
  const w09Hash = w09Fingerprint(w09);
  const w11Hash = w11Fingerprint(w11);
  return {
    locator: 'dillon-os://weekly/W09-W11-source-set',
    version: [
      w09.legacy_outcome_audit.sources.registry_sha256.slice(0, 12),
      w09.legacy_outcome_audit.sources.receipt_sha256.slice(0, 12),
      w11.graph_measurement.nodes,
      w11.graph_measurement.edges,
    ].join(':'),
    sha256: sha256(stableJson({ W09: w09Hash, W11: w11Hash })),
    captured_at: new Date().toISOString(),
  };
}

function verifyWeeklyResumedWorker({ item, worker_result: workerResult }) {
  if (workerResult?.status !== 'verified' ||
      workerResult?.item_id !== item.id ||
      workerResult?.input_fingerprint !== item.input_fingerprint) {
    return false;
  }
  const artifacts = workerResult.final_artifacts;
  if (!Array.isArray(artifacts) || artifacts.length !== 1) return false;
  const artifact = artifacts[0];
  if (!artifact.resume_locator || !fs.existsSync(artifact.resume_locator)) return false;
  const bytes = fs.readFileSync(artifact.resume_locator);
  if (sha256(bytes) !== artifact.sha256 || bytes.length !== artifact.bytes) return false;
  const body = JSON.parse(bytes.toString('utf8').replace(/^﻿/, ''));
  return body.routine_id === item.id && body.source_fingerprint === item.input_fingerprint;
}

function verifyWeeklyCompletedResult(result, outputDir) {
  const manifest = result.terminal_evidence?.artifact_manifest;
  if (!Array.isArray(manifest) || manifest.length !== 2) return false;
  return manifest.every((artifact) => {
    const file = path.join(outputDir, path.basename(artifact.path));
    if (!fs.existsSync(file)) return false;
    const bytes = fs.readFileSync(file);
    return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
  });
}

async function runWeeklyShadowDurable(options) {
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafeRepoOutputDir(options.outputDir, { requireEmpty: false });
  const stateRoot = path.resolve(options.stateRoot || path.join(
    REPO_ROOT,
    '12_Brain',
    'state',
    'outcome-graph'
  ));
  const logicalRoot = options.logicalRoot || repoRelative(outputDir);
  const collectReliability = options.collectW09 || collectW09;
  const collectGraph = options.collectW11 || collectW11;
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    sha256(logicalRoot).slice(0, 24)
  );
  const harness = createWeeklyShadowHarness({
    ...options,
    outputDir,
    logicalRoot,
    workspaceRoot,
    resumable: true,
    collectW09: collectReliability,
    collectW11: collectGraph,
  });
  let settled = false;
  try {
    const result = await runDurableOutcomeGraph(harness.contract, {
      stateRoot,
      adapters: harness.adapters,
      readCanonicalBinding: options.readCanonicalBinding || (() =>
        collectWeeklyCanonicalBinding(collectReliability, collectGraph)),
      verifyResumedWorker: options.verifyResumedWorker || verifyWeeklyResumedWorker,
      verifyCompletedResult: (prior) => verifyWeeklyCompletedResult(prior, outputDir),
      onCheckpoint: options.onCheckpoint,
      beforeFinalBindingCheck: async (provisional, context) => {
        harness.commitVerifiedArtifacts();
        if (typeof options.beforeFinalBindingCheck === 'function') {
          await options.beforeFinalBindingCheck(provisional, context);
        }
      },
      leaseSeconds: options.leaseSeconds,
      now: options.now,
    });
    settled = true;
    return result;
  } finally {
    if (settled || options.cleanupInterruptedWorkspace === true) harness.cleanup();
  }
}

module.exports = {
  runPowerShellJson,
  collectW09,
  collectW11,
  collectWeeklyCanonicalBinding,
  compareW09,
  compareW11,
  assertSafeRepoOutputDir,
  createWeeklyShadowHarness,
  runWeeklyShadow,
  runWeeklyShadowDurable,
  verifyWeeklyCompletedResult,
  verifyWeeklyResumedWorker,
};
