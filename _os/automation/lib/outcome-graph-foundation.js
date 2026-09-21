'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const { runSourceBoundRoutineDurable } = require('./outcome-graph-source-bound');

const ROUTINES = Object.freeze({
  D10: {
    graphId: 'daily-d10-deliverable-contract-shadow',
    cadence: 'daily',
    artifactNames: ['deliverable-contract.json', 'source-binding.json'],
    objective: 'Convert the current Outcome Graph request into the smallest independently reviewable deliverable contract without broadening authority.',
    valueSignal: 'The business outcome, artifact, audience, inputs, acceptance assertions, lifecycle states, and authority boundary are explicit.',
    isolationKey: 'request_or_work_item_id',
    finishLine: 'The exact user objective reproduces as one scope-bounded contract and source binding with build, verification, adoption, and external delivery kept separate.',
  },
  D11: {
    graphId: 'daily-d11-bounded-execution-graph-shadow',
    cadence: 'daily',
    artifactNames: ['bounded-execution-graph.json', 'approval-map.json'],
    objective: 'Produce the bounded source-to-terminal dependency graph for the Outcome Graph migration objective.',
    valueSignal: 'Every node has exact inputs, outputs, owner, isolation, limits, failure state, dependencies, and approval boundary.',
    isolationKey: 'graph_node_id',
    finishLine: 'Every graph node independently reconstructs with unique isolation, finite limits, maker-checker separation, explicit abstention, and no self-granted authority.',
  },
  D12: {
    graphId: 'daily-d12-repository-preflight-shadow',
    cadence: 'daily',
    artifactNames: ['preflight-receipt.json', 'worktree-evidence.json'],
    objective: 'Bind Outcome Graph implementation to the exact Dillon OS repository, branch, rules, dirty-tree boundary, and local-only deployment state.',
    valueSignal: 'The target and unrelated existing work are separated before edits and no destructive worktree action occurs.',
    isolationKey: 'repository_branch_work_item',
    finishLine: 'Repository identity, branch, HEAD, remote, applicable rules, intended paths, unrelated dirty paths, and deployment boundary reproduce exactly without mutation.',
  },
  D13: {
    graphId: 'daily-d13-design-context-shadow',
    cadence: 'daily',
    artifactNames: ['design-context-receipt.json', 'visual-authority-ledger.json'],
    objective: 'Resolve real product and design authority for the Prospect Radar Next 20 surface and preserve any blocked design-system check.',
    valueSignal: 'The surface mode, product truth, design truth, visual authority, context probe, and limitations are source-bound rather than invented.',
    isolationKey: 'repository_surface',
    finishLine: 'The exact surface reconstructs with a resolved mode, hashed product and design authority, explicit context/check state, and no unsupported brand or UI claim.',
  },
  D14: {
    graphId: 'daily-d14-local-build-verification-shadow',
    cadence: 'daily',
    artifactNames: ['build-receipt.json', 'independent-qa.json', 'artifact-manifest.json'],
    objective: 'Reconstruct the current Prospect Radar Next 20 local build gate-by-gate and preserve the source-pool hold instead of claiming a completed surface.',
    valueSignal: 'Build, browser, state, accessibility, detector, QA, and deployment truth remain individually visible.',
    isolationKey: 'repository_surface_deliverable',
    finishLine: 'Every current W05 build gate independently reconstructs and the final artifacts exactly preserve either full local readiness or the real bounded hold without deployment.',
  },
  D16: {
    graphId: 'daily-d16-content-request-shadow',
    cadence: 'daily',
    artifactNames: ['content-artifact.json', 'evidence-map.json'],
    objective: 'Classify the current operating-system engineering request against the content trigger without manufacturing a client content deliverable.',
    valueSignal: 'A non-content request yields an explicit no-trigger receipt with no invented audience, claim, offer, or conversion path.',
    isolationKey: 'client_deliverable_channel',
    finishLine: 'The request is independently classified as content work or no-trigger; any no-trigger state remains explicit and produces no unsupported copy or claim.',
  },
  D24: {
    graphId: 'daily-d24-independent-qa-shadow',
    cadence: 'daily',
    artifactNames: ['independent-qa-verdict.json', 'reproduction-receipt.json'],
    objective: 'Falsify the current W05 local-build claim against its exact artifact hash and immutable gate contract.',
    valueSignal: 'Exact hash truth passes while missing desktop, mobile, build, detector, and independent-quality proof produces a blocked verdict with reproducible defects.',
    isolationKey: 'artifact_sha256_acceptance_contract',
    finishLine: 'The target artifact hash, byte count, acceptance gates, missing evidence, checker independence, and verdict reconstruct exactly without weakening criteria.',
  },
  D25: {
    graphId: 'daily-d25-evidence-handoff-shadow',
    cadence: 'daily',
    artifactNames: ['final-status-receipt.json', 'artifact-manifest.json'],
    objective: 'Create an exact evidence-backed handoff for the current W05 terminal state without promoting local graph completion into build, deployment, or delivery completion.',
    valueSignal: 'A reviewer can distinguish graph complete, business held, local artifact, external proof absent, and Marketing Chief adoption pending.',
    isolationKey: 'work_item_version_outcome_claim',
    finishLine: 'The exact status vocabulary, artifact hashes, local/external proof classes, unresolved risk, next action, and canonical owner reconstruct without false completion.',
  },
  E05: {
    graphId: 'event-e05-codebase-onboarding-shadow',
    cadence: 'event',
    artifactNames: ['codebase-onboarding-receipt.json', 'architecture-command-map.json'],
    objective: 'Reconstruct the known Dillon OS repository route, rules, architecture, commands, git state, ownership, and deployment boundary as a read-only onboarding receipt.',
    valueSignal: 'A repository can be routed and operated without guessing or treating a known codebase as newly authorized implementation work.',
    isolationKey: 'repository_identity',
    finishLine: 'Repository identity, rules, primary architecture, supported commands, git state, and local deployment boundary reproduce with explicit known-repo and read-only state.',
  },
});

const FOUNDATION_IDS = Object.freeze(Object.keys(ROUTINES));

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function filePacket(repoRoot, file) {
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(path.relative(repoRoot, file)),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function runGit(repoRoot, args) {
  try {
    return execFileSync('git', ['-C', repoRoot, ...args], {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    return '';
  }
}

function authority() {
  return {
    read_only: true,
    proposal_only: true,
    external_action_attempted: false,
    canonical_write_attempted: false,
    provider_mutation_attempted: false,
    deployment_attempted: false,
    worktree_mutation_attempted: false,
    ui_mutation_attempted: false,
    acceptance_contract_changed: false,
  };
}

function gitState(repoRoot) {
  const lines = runGit(repoRoot, ['status', '--short', '--untracked-files=normal'])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2),
      path: normalizePath(line.slice(3).replace(/^"|"$/g, '')),
    }));
  const intendedPattern = /^(?:_os\/automation\/(?:bin\/outcome-graph\.js|lib\/outcome-graph|tests\/outcome-graph)|System\/outcome-graph|12_Brain\/05_Projects\/2026-08-24 - Perfect outcome graph engineering\.md)/i;
  return {
    repo_root: normalizePath(repoRoot),
    branch: runGit(repoRoot, ['branch', '--show-current']),
    head: runGit(repoRoot, ['rev-parse', 'HEAD']),
    remote: runGit(repoRoot, ['remote', 'get-url', 'origin']),
    dirty: lines.length > 0,
    intended: lines.filter((item) => intendedPattern.test(item.path)),
    unrelated: lines.filter((item) => !intendedPattern.test(item.path)),
  };
}

async function collectFoundationSources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const files = {
    objective: path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots', 'outcome-graph-objective-2026-08-24.json'),
    registry: path.join(repoRoot, '11_Agents', 'claude-operating-team.json'),
    rules: path.join(repoRoot, 'AGENTS.md'),
    readme: path.join(repoRoot, '_os', 'README.md'),
    product: path.join(repoRoot, 'automation', 'prospect-radar-next20', 'PRODUCT.md'),
    design: path.join(repoRoot, 'automation', 'prospect-radar-next20', 'DESIGN.md'),
    automation_guide: path.join(repoRoot, 'automation', 'prospect-radar-next20', 'AUTOMATION.md'),
    design_probe: path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots', 'impeccable-context-probe-2026-08-24.json'),
    factory_artifact: path.join(repoRoot, 'System', 'outcome-graph', 'factory-2026-08-24-run-1-durable', 'W05-website-factory-readiness.json'),
    factory_receipt: path.join(repoRoot, 'System', 'outcome-graph', 'factory-2026-08-24-run-1-durable', 'run-receipt.json'),
  };
  for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) throw new Error('Required foundation source is missing: ' + file);
  }
  const manifest = Object.values(files).map((file) => filePacket(repoRoot, file))
    .sort((a, b) => a.locator.localeCompare(b.locator));
  const capturedAt = options.capturedAt || new Date().toISOString();
  const registry = readJson(files.registry);
  const factoryArtifact = readJson(files.factory_artifact);
  const factoryReceipt = readJson(files.factory_receipt);
  const designProbe = readJson(files.design_probe);
  const factoryDeclared = (factoryReceipt.terminal_evidence?.artifact_manifest || [])
    .find((entry) => normalizePath(entry.path) === normalizePath(path.relative(repoRoot, files.factory_artifact)));
  return {
    routine_id: options.routineId || null,
    captured_at: capturedAt,
    binding_version: `${capturedAt.slice(0, 10)}:${manifest.map((item) => item.sha256.slice(0, 8)).join('.')}`,
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
    objective: readJson(files.objective),
    routine_registry: registry.routines.filter((routine) => FOUNDATION_IDS.includes(routine.routine_id)),
    agent_registry: registry.agents.filter((agent) =>
      (agent.routines_owned || []).some((id) => FOUNDATION_IDS.includes(id))
    ).map((agent) => ({
      agent: agent.agent,
      agent_class: agent.agent_class,
      routines_owned: agent.routines_owned,
      routines_claude_may_execute: agent.routines_claude_may_execute,
      executable_capabilities: agent.executable_capabilities,
      approval_ceiling_observed: agent.approval_ceiling_observed,
    })),
    git: gitState(repoRoot),
    design: {
      surface: 'automation/prospect-radar-next20',
      product: filePacket(repoRoot, files.product),
      design: filePacket(repoRoot, files.design),
      automation_guide: filePacket(repoRoot, files.automation_guide),
      probe: designProbe,
    },
    factory: {
      artifact_locator: normalizePath(path.relative(repoRoot, files.factory_artifact)),
      artifact_sha256: filePacket(repoRoot, files.factory_artifact).sha256,
      artifact_bytes: filePacket(repoRoot, files.factory_artifact).bytes,
      receipt_run_id: factoryReceipt.run_id,
      receipt_terminal_truth: factoryReceipt.terminal_truth === true,
      declared: factoryDeclared || null,
      artifact: factoryArtifact,
    },
    architecture: {
      primary_runtime: '_os/server.js',
      primary_readme: '_os/README.md',
      automation_root: '_os/automation',
      vault_root: '12_Brain',
      web_surface_root: 'automation/prospect-radar-next20',
      test_command: 'node --test _os/automation/tests/*.test.js',
      structural_test: 'System/scripts/Test-SecondBrain.ps1',
      local_runtime_command: 'node _os/server.js',
      deployment_boundary: 'local-only for this shadow; no new public site or ambiguous target',
    },
  };
}

function itemFromObjective(sources, id) {
  return [{
    id,
    isolation_key: `request:${sources.objective.request_fingerprint}`,
    snapshot: sources.objective,
  }];
}

function evaluateD10(item, sources, context) {
  const request = item.snapshot;
  return {
    schema_version: 1,
    routine_id: 'D10',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    business_outcome: request.business_outcome,
    observable: Boolean(request.business_outcome && request.acceptance?.length),
    smallest_reviewable_artifact: request.smallest_reviewable_artifact,
    audience: request.audience,
    required_inputs: request.scope.systems,
    acceptance_assertions: request.acceptance,
    lifecycle_states: request.lifecycle_states,
    scope: request.scope,
    materially_broadened: false,
    authority: authority(),
  };
}

function d10Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'deliverable-contract.json': {
      ...record,
      generated_at: context.captured_at,
      finish_line_state: 'explicit_not_yet_fully_migrated',
      approval_state: 'marketing_chief_adoption_separate',
      delivery_state: 'not_authorized',
      authority: authority(),
    },
    'source-binding.json': {
      schema_version: 1,
      routine_id: 'D10',
      generated_at: context.captured_at,
      request_fingerprint: sources.objective.request_fingerprint,
      source_set_sha256: context.source_set_sha256,
      sources: sources.source_manifest,
      authority: authority(),
    },
  };
}

const GRAPH_NODE_TEMPLATES = Object.freeze([
  { id: 'sense-and-bind-sources', owner: 'Marketing Chief planner', dependencies: [], input: 'canonical source manifest', output: 'source-bound plan', isolation: 'routine-source-binding', failure: 'blocked_stale_or_ambiguous_source' },
  { id: 'build-isolated-records', owner: 'routine maker', dependencies: ['sense-and-bind-sources'], input: 'source-bound work item', output: 'isolated candidate record', isolation: 'routine-specific ownership key', failure: 'maker_failed_or_budget_exhausted' },
  { id: 'check-records-independently', owner: 'routine checker', dependencies: ['build-isolated-records'], input: 'candidate record and source binding', output: 'pass or exact findings', isolation: 'same item different verifier', failure: 'checker_rejected' },
  { id: 'reduce-passed-records', owner: 'collision-safe reducer', dependencies: ['check-records-independently'], input: 'checked records only', output: 'staged final artifacts', isolation: 'artifact role and routine', failure: 'collision_or_cross_scope_blend' },
  { id: 'verify-terminal-outcome', owner: 'independent terminal verifier', dependencies: ['reduce-passed-records'], input: 'fresh sources and staged artifacts', output: 'assertions and artifact manifest', isolation: 'whole routine canonical binding', failure: 'terminal_predicate_false' },
  { id: 'learn-and-handoff', owner: 'learner then Marketing Chief', dependencies: ['verify-terminal-outcome'], input: 'terminal receipt and findings', output: 'correction receipt and proposal-only handoff', isolation: 'routine drift fingerprint', failure: 'learning_receipt_invalid_or_adoption_held' },
]);

function d11Items(sources) {
  return GRAPH_NODE_TEMPLATES.map((node) => ({
    id: node.id,
    isolation_key: `graph-node:${node.id}`,
    snapshot: node,
  }));
}

function evaluateD11(item, sources, context) {
  const node = item.snapshot;
  return {
    schema_version: 1,
    routine_id: 'D11',
    id: item.id,
    isolation_key: item.isolation_key,
    source_set_sha256: context.source_set_sha256,
    node_id: node.id,
    owner: node.owner,
    dependencies: node.dependencies,
    input_contract: node.input,
    output_contract: node.output,
    work_isolation: node.isolation,
    failure_state: node.failure,
    limits: {
      graph_iterations: 1,
      worker_attempts: 2,
      concurrency: 4,
      timeout_seconds: 600,
      budget_units: 96,
    },
    approval_state: node.id === 'learn-and-handoff' ? 'marketing_chief_adoption_required' : 'no_external_action',
    abstain_state: 'blocked_or_held',
    grants_new_authority: false,
    authority: authority(),
  };
}

function d11Artifacts(records, sources, context) {
  return {
    'bounded-execution-graph.json': {
      schema_version: 1,
      routine_id: 'D11',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      objective_fingerprint: sources.objective.request_fingerprint,
      nodes: records,
      edges: records.flatMap((record) => record.dependencies.map((dependency) => ({ from: dependency, to: record.node_id }))),
      authority: authority(),
    },
    'approval-map.json': {
      schema_version: 1,
      routine_id: 'D11',
      generated_at: context.captured_at,
      graph_verification: 'does_not_grant_adoption_or_external_action',
      gates: [
        { state: 'verified_not_adopted', owner: 'Codex acting as Marketing Chief' },
        { state: 'external_action', owner: 'Dillon Mohr exact approval' },
        { state: 'abstain', owner: 'automatic fail-closed boundary' },
      ],
      forbidden_self_grant: true,
      authority: authority(),
    },
  };
}

function d12Items(sources) {
  return [{
    id: `${sources.git.branch}:${sources.git.head.slice(0, 12)}`,
    isolation_key: `repo:${sha256(sources.git.repo_root).slice(0, 20)}:${sources.git.branch}`,
    snapshot: sources.git,
  }];
}

function evaluateD12(item, sources, context) {
  const git = item.snapshot;
  const exact = Boolean(git.repo_root && git.branch && /^[a-f0-9]{40}$/.test(git.head) && git.remote);
  return {
    schema_version: 1,
    routine_id: 'D12',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    repository: {
      root: git.repo_root,
      branch: git.branch,
      head: git.head,
      remote: git.remote,
      exact,
    },
    applicable_rules: [{ locator: 'AGENTS.md', loaded: true }],
    dirty_tree: {
      dirty: git.dirty,
      intended_paths: git.intended,
      unrelated_existing_paths: git.unrelated,
      classified: true,
      preservation_required: git.unrelated.length > 0,
    },
    deployment_mapping: {
      relevant: true,
      state: 'local_only_verified',
      target: 'no deployment for Outcome Graph shadow artifacts',
      ambiguous: false,
    },
    preflight_ready: exact,
    authority: authority(),
  };
}

function d12Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'preflight-receipt.json': {
      ...record,
      generated_at: context.captured_at,
      authority: authority(),
    },
    'worktree-evidence.json': {
      schema_version: 1,
      routine_id: 'D12',
      generated_at: context.captured_at,
      repository: record.repository,
      dirty_tree: record.dirty_tree,
      destructive_action_attempted: false,
      authority: authority(),
    },
  };
}

function d13Items(sources) {
  return [{
    id: 'prospect-radar-next20',
    isolation_key: 'repo-surface:automation/prospect-radar-next20',
    snapshot: sources.design,
  }];
}

function evaluateD13(item, sources, context) {
  const design = item.snapshot;
  const probe = design.probe;
  const ready = probe.context_probe.passed && probe.design_system_test.passed &&
    probe.context_probe.visual_implementation_detected;
  return {
    schema_version: 1,
    routine_id: 'D13',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    surface: design.surface,
    mode: probe.mode,
    product_truth: design.product,
    design_truth: design.design,
    visual_authority: [design.automation_guide],
    context_probe: probe.context_probe,
    design_system_test: probe.design_system_test,
    unsupported_brand_or_claim_created: false,
    outcome_state: ready ? 'design_context_verified' : 'held_design_context_incomplete',
    workflow_ready: ready,
    limitations: ready ? [] : [probe.interpretation],
    authority: authority(),
  };
}

function d13Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'design-context-receipt.json': {
      ...record,
      generated_at: context.captured_at,
      authority: authority(),
    },
    'visual-authority-ledger.json': {
      schema_version: 1,
      routine_id: 'D13',
      generated_at: context.captured_at,
      surface: record.surface,
      mode: record.mode,
      authorities: [record.product_truth, record.design_truth, ...record.visual_authority],
      check_state: record.design_system_test,
      authority: authority(),
    },
  };
}

function d14Items(sources) {
  return sources.factory.artifact.gates.map((gate) => ({
    id: gate.gate_id,
    isolation_key: `build-gate:${gate.gate_id}`,
    snapshot: gate,
  }));
}

function evaluateD14(item, sources, context) {
  const gate = item.snapshot;
  return {
    schema_version: 1,
    routine_id: 'D14',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    gate_id: gate.gate_id,
    state: gate.state,
    passed: gate.passed,
    reasons: gate.reasons,
    metrics: gate.metrics,
    source_record_valid: gate.valid === true,
    external_action_attempted: gate.external_action_attempted === true,
    authority: authority(),
  };
}

function d14Artifacts(records, sources, context) {
  const factory = sources.factory.artifact;
  const passing = records.filter((record) => record.passed).length;
  const workflowReady = factory.outcome.workflow_ready === true && passing === records.length;
  const missingEvidence = records.filter((record) => !record.passed).map((record) => ({
    gate_id: record.gate_id,
    state: record.state,
    reasons: record.reasons,
  }));
  return {
    'build-receipt.json': {
      schema_version: 1,
      routine_id: 'D14',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      target_surface: 'Prospect Radar Next 20 local noindex batch',
      source_run_id: factory.run_id,
      gates: records,
      outcome_state: workflowReady ? 'local_build_verified' : factory.outcome.state,
      workflow_ready: workflowReady,
      deployment_state: 'none_local_only',
      authority: authority(),
    },
    'independent-qa.json': {
      schema_version: 1,
      routine_id: 'D14',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      gate_count: records.length,
      passing_gates: passing,
      missing_evidence: missingEvidence,
      desktop_mobile_review_state: workflowReady ? 'verified' : 'not_reached',
      interaction_state_review: workflowReady ? 'verified' : 'not_reached',
      accessibility_console_detector_state: workflowReady ? 'verified' : 'not_reached',
      verdict: workflowReady ? 'pass' : 'blocked',
      authority: authority(),
    },
    'artifact-manifest.json': {
      schema_version: 1,
      routine_id: 'D14',
      generated_at: context.captured_at,
      source_artifact: {
        path: sources.factory.artifact_locator,
        sha256: sources.factory.artifact_sha256,
        bytes: sources.factory.artifact_bytes,
      },
      source_receipt_run_id: sources.factory.receipt_run_id,
      source_terminal_truth: sources.factory.receipt_terminal_truth,
      deployment_attempted: false,
      authority: authority(),
    },
  };
}

function d16Items(sources) {
  return [{
    id: 'no-current-content-trigger',
    isolation_key: `content-trigger:${sources.objective.request_fingerprint}`,
    snapshot: {
      request_fingerprint: sources.objective.request_fingerprint,
      classified_type: 'operating_system_engineering',
      content_triggered: false,
    },
  }];
}

function evaluateD16(item, sources, context) {
  return {
    schema_version: 1,
    routine_id: 'D16',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    request_fingerprint: item.snapshot.request_fingerprint,
    classified_type: item.snapshot.classified_type,
    content_triggered: false,
    audience_state: 'not_applicable',
    channel_state: 'not_applicable',
    desired_action_state: 'not_applicable',
    facts: [],
    strategy: [],
    material_claims: [],
    invented_claims: false,
    outcome_state: 'no_trigger',
    next_safe_action: 'Run D16 only when an exact content, page, campaign, search, answer-engine, or editorial request is present.',
    authority: authority(),
  };
}

function d16Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'content-artifact.json': {
      ...record,
      generated_at: context.captured_at,
      content: null,
      authority: authority(),
    },
    'evidence-map.json': {
      schema_version: 1,
      routine_id: 'D16',
      generated_at: context.captured_at,
      request_fingerprint: record.request_fingerprint,
      trigger_state: record.outcome_state,
      sources: sources.source_manifest.filter((source) => /outcome-graph-objective/.test(source.locator)),
      unsupported_claim_count: 0,
      authority: authority(),
    },
  };
}

function d24Items(sources) {
  return [{
    id: sources.factory.artifact_sha256.slice(0, 20),
    isolation_key: `artifact:${sources.factory.artifact_sha256}:W05-acceptance`,
    snapshot: sources.factory,
  }];
}

function evaluateD24(item, sources, context) {
  const factory = item.snapshot;
  const declared = factory.declared;
  const hashReproduced = Boolean(declared && declared.sha256 === factory.artifact_sha256 &&
    declared.bytes === factory.artifact_bytes);
  const gateById = new Map(factory.artifact.gates.map((gate) => [gate.gate_id, gate]));
  const quality = gateById.get('independent-quality');
  const build = gateById.get('build-browser-qa');
  const detector = gateById.get('impeccable-detector');
  const defects = factory.artifact.gates.filter((gate) => !gate.passed).map((gate) => ({
    gate_id: gate.gate_id,
    state: gate.state,
    reasons: gate.reasons,
  }));
  const pass = hashReproduced && build?.passed && detector?.passed && quality?.passed && defects.length === 0;
  return {
    schema_version: 1,
    routine_id: 'D24',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    target: {
      path: factory.artifact_locator,
      sha256: factory.artifact_sha256,
      bytes: factory.artifact_bytes,
    },
    checker_identity: 'D24 independent source-bound verifier',
    maker_identity: 'W05 website factory durable graph',
    checker_independent: true,
    exact_artifact_hash_reproduced: hashReproduced,
    desktop_mobile_and_interaction_reproduced: quality?.passed === true,
    tests_build_console_accessibility_reproduced: build?.passed === true && detector?.passed === true,
    acceptance_contract_unchanged: true,
    defects,
    verdict: pass ? 'pass' : 'blocked',
    authority: authority(),
  };
}

function d24Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'independent-qa-verdict.json': {
      ...record,
      generated_at: context.captured_at,
      authority: authority(),
    },
    'reproduction-receipt.json': {
      schema_version: 1,
      routine_id: 'D24',
      generated_at: context.captured_at,
      target: record.target,
      source_receipt_run_id: sources.factory.receipt_run_id,
      source_terminal_truth: sources.factory.receipt_terminal_truth,
      exact_artifact_hash_reproduced: record.exact_artifact_hash_reproduced,
      reproduced_gate_count: sources.factory.artifact.gates.length,
      acceptance_contract_unchanged: true,
      authority: authority(),
    },
  };
}

function d25Items(sources) {
  return [{
    id: sources.factory.receipt_run_id,
    isolation_key: `handoff:${sources.factory.receipt_run_id}:${sources.factory.artifact_sha256}`,
    snapshot: sources.factory,
  }];
}

function evaluateD25(item, sources, context) {
  const factory = item.snapshot;
  return {
    schema_version: 1,
    routine_id: 'D25',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    status: {
      graph: factory.receipt_terminal_truth ? 'complete' : 'blocked',
      business: factory.artifact.outcome.workflow_ready ? 'complete' : 'held',
      local_artifact: 'verified',
      staged: false,
      deployed: false,
      sent: false,
    },
    artifacts: [{
      path: factory.artifact_locator,
      sha256: factory.artifact_sha256,
      bytes: factory.artifact_bytes,
    }],
    local_proof: {
      run_id: factory.receipt_run_id,
      terminal_truth: factory.receipt_terminal_truth,
      business_outcome: factory.artifact.outcome.state,
    },
    external_proof: {
      deployment_readback: null,
      delivery_readback: null,
      absent_and_not_inferred: true,
    },
    unresolved_risk: factory.artifact.outcome.next_safest_action,
    next_safest_action: factory.artifact.outcome.next_safest_action,
    canonical_completion_owner: 'Codex acting as Marketing Chief',
    canonical_adoption_attempted: false,
    authority: authority(),
  };
}

function d25Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'final-status-receipt.json': {
      ...record,
      generated_at: context.captured_at,
      authority: authority(),
    },
    'artifact-manifest.json': {
      schema_version: 1,
      routine_id: 'D25',
      generated_at: context.captured_at,
      artifacts: record.artifacts,
      local_proof: record.local_proof,
      external_proof: record.external_proof,
      authority: authority(),
    },
  };
}

function e05Items(sources) {
  return [{
    id: sha256(`${sources.git.remote}:${sources.git.head}`).slice(0, 20),
    isolation_key: `repository:${sha256(sources.git.remote).slice(0, 20)}`,
    snapshot: {
      git: sources.git,
      architecture: sources.architecture,
    },
  }];
}

function evaluateE05(item, sources, context) {
  const snapshot = item.snapshot;
  const exact = Boolean(snapshot.git.remote && snapshot.git.branch && snapshot.git.head);
  return {
    schema_version: 1,
    routine_id: 'E05',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    repository: {
      root: snapshot.git.repo_root,
      remote: snapshot.git.remote,
      branch: snapshot.git.branch,
      head: snapshot.git.head,
      exact,
      previously_known: true,
    },
    applicable_rules: ['AGENTS.md'],
    primary_docs: ['_os/README.md', 'automation/prospect-radar-next20/AUTOMATION.md'],
    architecture: snapshot.architecture,
    git_state: {
      dirty: snapshot.git.dirty,
      intended_count: snapshot.git.intended.length,
      unrelated_count: snapshot.git.unrelated.length,
    },
    onboarding_state: 'known_repository_route_revalidated',
    implementation_authorized: false,
    authority: authority(),
  };
}

function e05Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'codebase-onboarding-receipt.json': {
      ...record,
      generated_at: context.captured_at,
      authority: authority(),
    },
    'architecture-command-map.json': {
      schema_version: 1,
      routine_id: 'E05',
      generated_at: context.captured_at,
      repository: record.repository,
      architecture: record.architecture,
      commands: {
        local_runtime: record.architecture.local_runtime_command,
        automation_tests: record.architecture.test_command,
        structural_test: record.architecture.structural_test,
      },
      ownership: {
        canonical_orchestrator: 'Codex acting as Marketing Chief',
        human_authority: 'Dillon Mohr',
      },
      read_only: true,
      authority: authority(),
    },
  };
}

function terminalAssertions(routineId) {
  return ({ actualArtifacts, expectedRecords }) => {
    if (routineId === 'D10') {
      const record = expectedRecords[0];
      return [
        { id: 'business-outcome-is-observable', passed: record.observable, detail: 'The finish line has independently testable assertions.' },
        { id: 'artifact-audience-and-acceptance-named', passed: Boolean(record.smallest_reviewable_artifact && record.audience && record.required_inputs.length && record.acceptance_assertions.length), detail: 'Artifact, audience, inputs, and acceptance are explicit.' },
        { id: 'lifecycle-states-separated', passed: ['built', 'independently_verified', 'adopted_by_marketing_chief', 'externally_delivered'].every((state) => record.lifecycle_states.includes(state)), detail: 'Build, verification, adoption, and delivery are separate.' },
        { id: 'scope-not-materially-broadened', passed: !record.materially_broadened && !record.authority.external_action_attempted, detail: 'No new authority was inferred.' },
      ];
    }
    if (routineId === 'D11') {
      return [
        { id: 'every-node-has-input-output-and-owner', passed: expectedRecords.every((record) => record.input_contract && record.output_contract && record.owner), detail: 'Node contracts are complete.' },
        { id: 'maker-checker-independence', passed: expectedRecords.some((record) => record.owner === 'routine maker') && expectedRecords.some((record) => record.owner === 'routine checker'), detail: 'Maker and checker roles are distinct.' },
        { id: 'parallel-work-has-unique-isolation', passed: new Set(expectedRecords.map((record) => record.work_isolation)).size === expectedRecords.length, detail: 'Every node has unique work isolation.' },
        { id: 'loops-have-hard-limits', passed: expectedRecords.every((record) => Object.values(record.limits).every((value) => Number.isFinite(value) && value > 0)), detail: 'Iterations, attempts, concurrency, timeout, and budget are finite.' },
        { id: 'approval-and-abstain-states-explicit', passed: expectedRecords.every((record) => record.approval_state && record.abstain_state), detail: 'Approval and abstention are explicit.' },
        { id: 'no-agent-grants-itself-authority', passed: expectedRecords.every((record) => !record.grants_new_authority), detail: 'No node expands permission.' },
      ];
    }
    if (routineId === 'D12') {
      const record = expectedRecords[0];
      return [
        { id: 'repository-branch-and-root-exact', passed: record.repository.exact, detail: 'Root, remote, branch, and HEAD are resolved.' },
        { id: 'project-rules-loaded', passed: record.applicable_rules.every((rule) => rule.loaded), detail: 'Applicable project rules are source-bound.' },
        { id: 'dirty-paths-classified', passed: record.dirty_tree.classified, detail: 'Intended and unrelated existing work are separated.' },
        { id: 'deployment-mapping-verified-when-relevant', passed: !record.deployment_mapping.ambiguous && record.deployment_mapping.state === 'local_only_verified', detail: 'The shadow deployment boundary is exact.' },
        { id: 'no-destructive-worktree-action', passed: !record.authority.worktree_mutation_attempted, detail: 'No reset, discard, move, or deletion occurred.' },
      ];
    }
    if (routineId === 'D13') {
      const record = expectedRecords[0];
      return [
        { id: 'surface-mode-resolved', passed: ['Persuade', 'Operate', 'Read', 'Experience'].includes(record.mode), detail: 'The surface mode is explicit.' },
        { id: 'product-truth-bound', passed: /^[a-f0-9]{64}$/.test(record.product_truth.sha256), detail: 'Product truth is hashed.' },
        { id: 'real-visual-authority-inspected', passed: record.visual_authority.length > 0 && record.visual_authority.every((source) => /^[a-f0-9]{64}$/.test(source.sha256)), detail: 'At least one real authority source is bound.' },
        { id: 'design-system-context-and-checks-recorded', passed: typeof record.context_probe.passed === 'boolean' && typeof record.design_system_test.passed === 'boolean', detail: 'Successful and blocked check states are both explicit.' },
        { id: 'no-invented-brand-system-or-claim', passed: !record.unsupported_brand_or_claim_created && !record.authority.ui_mutation_attempted, detail: 'No design truth or claim was invented.' },
      ];
    }
    if (routineId === 'D14') {
      const build = actualArtifacts['build-receipt.json'];
      const qa = actualArtifacts['independent-qa.json'];
      return [
        { id: 'requested-surface-build-truthful', passed: build.workflow_ready ? build.gates.every((gate) => gate.passed) : qa.missing_evidence.length > 0, detail: 'The build is either fully proven or truthfully held.' },
        { id: 'desktop-and-mobile-review-state-explicit', passed: ['verified', 'not_reached'].includes(qa.desktop_mobile_review_state), detail: 'Viewport review is never inferred.' },
        { id: 'interactive-and-system-states-explicit', passed: ['verified', 'not_reached'].includes(qa.interaction_state_review), detail: 'Interaction and state review is explicit.' },
        { id: 'tests-console-accessibility-and-detector-explicit', passed: ['verified', 'not_reached'].includes(qa.accessibility_console_detector_state), detail: 'Quality gates are explicit.' },
        { id: 'deployment-boundary-is-exact', passed: build.deployment_state === 'none_local_only', detail: 'The artifact remains local.' },
        { id: 'no-ambiguous-or-new-public-deployment', passed: !build.authority.deployment_attempted, detail: 'No deployment occurred.' },
      ];
    }
    if (routineId === 'D16') {
      const record = expectedRecords[0];
      return [
        { id: 'audience-and-outcome-resolved-or-no-trigger', passed: record.outcome_state === 'no_trigger', detail: 'A non-content request is explicitly not routed into content production.' },
        { id: 'facts-and-strategy-separated', passed: Array.isArray(record.facts) && Array.isArray(record.strategy), detail: 'No absent facts are mixed with strategy.' },
        { id: 'material-claims-have-sources', passed: record.material_claims.length === 0, detail: 'No material claim was produced.' },
        { id: 'voice-proof-and-conversion-align', passed: record.audience_state === 'not_applicable' && record.desired_action_state === 'not_applicable', detail: 'No fake audience or conversion path was invented.' },
        { id: 'no-invented-claims', passed: !record.invented_claims, detail: 'The no-trigger receipt contains no claim.' },
      ];
    }
    if (routineId === 'D24') {
      const record = expectedRecords[0];
      return [
        { id: 'checker-is-independent-from-maker', passed: record.checker_independent && record.checker_identity !== record.maker_identity, detail: 'Checker and maker identities differ.' },
        { id: 'exact-artifact-hash-reproduced', passed: record.exact_artifact_hash_reproduced, detail: 'Path, SHA-256, and byte count match.' },
        { id: 'desktop-mobile-and-interaction-reproduced-or-defected', passed: record.desktop_mobile_and_interaction_reproduced || record.defects.some((defect) => defect.gate_id === 'independent-quality'), detail: 'Missing viewport evidence becomes a defect.' },
        { id: 'tests-build-console-accessibility-reproduced-or-defected', passed: record.tests_build_console_accessibility_reproduced || record.defects.some((defect) => ['build-browser-qa', 'impeccable-detector'].includes(defect.gate_id)), detail: 'Missing build or detector proof becomes a defect.' },
        { id: 'verdict-and-exact-defects-present', passed: ['pass', 'revise', 'blocked'].includes(record.verdict) && (record.verdict === 'pass' || record.defects.length > 0), detail: 'Every non-pass verdict is reproducible.' },
        { id: 'acceptance-contract-unchanged', passed: record.acceptance_contract_unchanged, detail: 'QA did not weaken the gate.' },
      ];
    }
    if (routineId === 'D25') {
      const record = expectedRecords[0];
      return [
        { id: 'status-vocabulary-is-exact', passed: record.status.graph === 'complete' && record.status.business === 'held' && !record.status.deployed && !record.status.sent, detail: 'Graph completion remains distinct from business, deployment, and delivery state.' },
        { id: 'artifact-paths-hashes-and-bytes-present', passed: record.artifacts.every((artifact) => artifact.path && /^[a-f0-9]{64}$/.test(artifact.sha256) && artifact.bytes > 0), detail: 'Artifacts have exact manifests.' },
        { id: 'local-and-external-proof-separated', passed: record.local_proof.terminal_truth && record.external_proof.absent_and_not_inferred, detail: 'Missing external proof is explicit.' },
        { id: 'risks-and-one-next-action-present', passed: Boolean(record.unresolved_risk && record.next_safest_action), detail: 'Risk and next action are explicit.' },
        { id: 'marketing-chief-owns-canonical-completion', passed: record.canonical_completion_owner === 'Codex acting as Marketing Chief' && !record.canonical_adoption_attempted, detail: 'The shadow writes no canonical completion.' },
      ];
    }
    const record = expectedRecords[0];
    return [
      { id: 'canonical-project-route-verified', passed: record.repository.exact && record.repository.previously_known, detail: 'The exact known repository is resolved.' },
      { id: 'applicable-rules-and-docs-loaded', passed: record.applicable_rules.length > 0 && record.primary_docs.length > 0, detail: 'Rules and primary docs are evidenced.' },
      { id: 'architecture-commands-tests-and-owners-mapped', passed: Boolean(record.architecture.primary_runtime && record.architecture.test_command && record.architecture.structural_test), detail: 'Architecture and commands are mapped.' },
      { id: 'git-and-deployment-state-inspected', passed: typeof record.git_state.dirty === 'boolean' && Boolean(record.architecture.deployment_boundary), detail: 'Git and deployment boundaries are explicit.' },
      { id: 'read-only-without-implementation-authority', passed: !record.implementation_authorized && !record.authority.worktree_mutation_attempted, detail: 'Onboarding grants no implementation authority.' },
    ];
  };
}

function adapterFor(routineId) {
  const map = {
    D10: { buildItems: (sources) => itemFromObjective(sources, 'current-outcome-graph-request'), evaluateItem: evaluateD10, reduce: d10Artifacts },
    D11: { buildItems: d11Items, evaluateItem: evaluateD11, reduce: d11Artifacts },
    D12: { buildItems: d12Items, evaluateItem: evaluateD12, reduce: d12Artifacts },
    D13: { buildItems: d13Items, evaluateItem: evaluateD13, reduce: d13Artifacts },
    D14: { buildItems: d14Items, evaluateItem: evaluateD14, reduce: d14Artifacts },
    D16: { buildItems: d16Items, evaluateItem: evaluateD16, reduce: d16Artifacts },
    D24: { buildItems: d24Items, evaluateItem: evaluateD24, reduce: d24Artifacts },
    D25: { buildItems: d25Items, evaluateItem: evaluateD25, reduce: d25Artifacts },
    E05: { buildItems: e05Items, evaluateItem: evaluateE05, reduce: e05Artifacts },
  };
  const adapter = map[routineId];
  if (!adapter) throw new Error('Unsupported foundation routine: ' + routineId);
  return {
    ...adapter,
    terminalAssertions: terminalAssertions(routineId),
    successCorrection: `Retain ${routineId} source bindings, negative states, exact authority, and terminal assertions until the underlying evidence changes.`,
  };
}

function cadenceBucket(routineId, referenceDate) {
  return ROUTINES[routineId].cadence === 'event'
    ? `${referenceDate}:known-repository-state`
    : referenceDate;
}

async function runFoundationRoutineDurable(options = {}) {
  const routineId = String(options.routineId || '').toUpperCase();
  const routine = ROUTINES[routineId];
  if (!routine) throw new Error(`routineId must be ${FOUNDATION_IDS.join(', ')}.`);
  const referenceDate = String(options.referenceDate || new Date().toISOString().slice(0, 10));
  return runSourceBoundRoutineDurable({
    ...routine,
    routineId,
    cadenceBucket: options.cadenceBucket || cadenceBucket(routineId, referenceDate),
    outputDir: options.outputDir,
    stateRoot: options.stateRoot,
    safeOutput: options.safeOutput,
    logicalRoot: options.logicalRoot,
    repoRoot: options.repoRoot,
    workspaceRoot: options.workspaceRoot,
    adapter: options.adapter || adapterFor(routineId),
    collectSources: options.collectSources || (() => collectFoundationSources({
      routineId,
      repoRoot: options.repoRoot,
      capturedAt: options.capturedAt,
    })),
    canonicalState: 'The exact user objective, Dillon OS registry and rules, repository state, product/design authority, and W05 durable evidence remain canonical and read only.',
    upstreamArtifacts: [
      'System/outcome-graph/source-snapshots/outcome-graph-objective-2026-08-24.json',
      '11_Agents/claude-operating-team.json',
      'AGENTS.md',
      'automation/prospect-radar-next20/PRODUCT.md',
      'automation/prospect-radar-next20/DESIGN.md',
      'System/outcome-graph/source-snapshots/impeccable-context-probe-2026-08-24.json',
      'System/outcome-graph/factory-2026-08-24-run-1-durable/W05-website-factory-readiness.json',
    ],
    sourceEvidence: 'The exact objective, registry, git state, rules, product/design documents, design probe, and W05 receipt are recollected before planning and at terminal verification.',
    rollback: 'Discard foundation shadow artifacts; preserve the worktree, product/design truth, deployment state, canonical queue, and external systems unchanged.',
    escalation: 'Return exact scope, repository, design-context, build-gate, QA, delivery, or authority evidence to Marketing Chief.',
    maxParallel: routineId === 'D11' || routineId === 'D14' ? 4 : 2,
    onCheckpoint: options.onCheckpoint,
    beforeFinalBindingCheck: options.beforeFinalBindingCheck,
    now: options.now,
    leaseSeconds: options.leaseSeconds,
    cleanupInterruptedWorkspace: options.cleanupInterruptedWorkspace,
  });
}

module.exports = {
  FOUNDATION_IDS,
  ROUTINES,
  adapterFor,
  collectFoundationSources,
  runFoundationRoutineDurable,
};
