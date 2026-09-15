'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { REPO_ROOT } = require('./fsutil');
const { runOutcomeGraph, sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph, writeJsonAtomic } = require('./outcome-graph-state');
const { completedWeekWindow } = require('./outcome-graph-weekly-tranche');

const FINAL_NAMES = [
  'W01-weekly-operating-slate.json',
  'W07-unsent-draft-queue.json',
];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function filePacket(file, locator, includeText = false) {
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(locator),
    sha256: sha256(bytes),
    bytes: bytes.length,
    physical_path: file,
    ...(includeText ? { text: bytes.toString('utf8').replace(/^\uFEFF/, '') } : {}),
  };
}

function fileEvidence(file, logicalPath, resumable = false) {
  const bytes = fs.readFileSync(file);
  return {
    path: normalizePath(logicalPath),
    sha256: sha256(bytes),
    bytes: bytes.length,
    ...(resumable ? { resume_locator: file } : {}),
  };
}

function clientOperationsDefault() {
  return path.join(os.homedir(), 'Documents', 'Codex', 'projects', 'client-operations');
}

function buildManifest(packets) {
  return packets.map((packet) => ({
    locator: packet.locator,
    sha256: packet.sha256,
    bytes: packet.bytes,
  })).sort((a, b) => a.locator.localeCompare(b.locator));
}

function latestTrancheW10(repoRoot) {
  const root = path.join(repoRoot, 'System', 'outcome-graph');
  const candidates = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^tranche-.*-durable$/i.test(entry.name))
    .map((entry) => path.join(root, entry.name, 'W10-executive-weekly-review.json'))
    .filter((file) => fs.existsSync(file))
    .sort();
  if (candidates.length === 0) throw new Error('No durable W10 tranche artifact is available.');
  return candidates[candidates.length - 1];
}

function latestDriveListSnapshot(repoRoot) {
  const root = path.join(repoRoot, 'System', 'outcome-graph', 'source-snapshots');
  if (!fs.existsSync(root)) return null;
  const candidates = fs.readdirSync(root)
    .filter((name) => /^google-drive-list-state-\d{4}-\d{2}-\d{2}\.json$/i.test(name))
    .sort();
  return candidates.length > 0 ? path.join(root, candidates[candidates.length - 1]) : null;
}

function summarizeRankingProbe(result) {
  const stderr = String(result.stderr || '');
  const stdout = String(result.stdout || '');
  const routeMismatch = stderr.match(
    /Inactive or quarantined client is portfolio-eligible:\s*([^\s\r\n]+)/i
  );
  const summary = {
    passed: result.status === 0,
    exit_code: Number.isInteger(result.status) ? result.status : null,
    signal: result.signal || null,
    timed_out: result.error?.code === 'ETIMEDOUT',
    failure_kind: result.status === 0
      ? null
      : routeMismatch
        ? 'inactive_or_quarantined_client_portfolio_eligible'
        : 'ranking_probe_failed',
    client_id: routeMismatch ? routeMismatch[1] : null,
    stdout_sha256: sha256(stdout),
    stderr_sha256: sha256(stderr),
  };
  summary.probe_sha256 = sha256(stableJson(summary));
  return summary;
}

function runRankingProbe(clientOperationsRoot, asOf) {
  const script = path.join(clientOperationsRoot, 'scripts', 'Get-NextActions.ps1');
  const result = spawnSync('pwsh', [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-File',
    script,
    '-Format',
    'Json',
    '-AsOf',
    asOf,
  ], {
    cwd: clientOperationsRoot,
    encoding: 'utf8',
    timeout: 30000,
    windowsHide: true,
  });
  return summarizeRankingProbe(result);
}

function safeQueueItem(item) {
  return {
    id: item.id,
    version: item.version,
    dedupe_key: item.dedupeKey || null,
    client_id: item.clientId || null,
    title: item.title,
    status: item.status,
    lane: item.lane || null,
    priority: item.priority || null,
    owner: item.owner || null,
    next_action: item.nextAction || null,
    due_at: item.dueAt || null,
    review_at: item.reviewAt || null,
    updated_at: item.updatedAt || null,
    routing: item.routing || null,
    evidence: {
      as_of: item.evidence?.asOf || null,
      freshness: item.evidence?.freshness || null,
      ref_count: Array.isArray(item.evidence?.refs) ? item.evidence.refs.length : 0,
    },
    execution: item.execution || null,
    approval: item.approval || null,
    definition_of_done_count: Array.isArray(item.definitionOfDone)
      ? item.definitionOfDone.length
      : 0,
  };
}

function dateFresh(value, asOf, maxDays = 14) {
  const time = Date.parse(value);
  const current = Date.parse(asOf);
  return Number.isFinite(time) && Number.isFinite(current) &&
    time <= current && current - time <= maxDays * 86400000;
}

async function collectCommandCommsSources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const clientOperationsRoot = path.resolve(
    options.clientOperationsRoot || clientOperationsDefault()
  );
  const window = options.window || completedWeekWindow(options.referenceDate || new Date());
  const asOf = options.asOf || `${window.prepared}T16:00:00.000Z`;
  const files = {
    queue: path.join(clientOperationsRoot, 'queue', 'work-items.json'),
    registry: path.join(clientOperationsRoot, 'registry', 'clients.json'),
    portfolio: path.join(clientOperationsRoot, 'state', 'portfolio-priorities.json'),
    control: path.join(clientOperationsRoot, 'CONTROL.md'),
    health: path.join(clientOperationsRoot, 'state', 'system-health.json'),
    ranking_script: path.join(clientOperationsRoot, 'scripts', 'Get-NextActions.ps1'),
    projection_script: path.join(clientOperationsRoot, 'scripts', 'Update-MarketingControl.ps1'),
    drafts: path.resolve(options.draftSnapshot || path.join(
      repoRoot,
      'System',
      'outcome-graph',
      'source-snapshots',
      `gmail-drafts-${window.period_start}-to-${window.period_end}.json`
    )),
    w10: path.resolve(options.w10Artifact || latestTrancheW10(repoRoot)),
  };
  const driveListCandidate = options.driveListSnapshot === false
    ? null
    : options.driveListSnapshot || latestDriveListSnapshot(repoRoot);
  const driveListSnapshot = driveListCandidate ? path.resolve(driveListCandidate) : null;
  if (driveListSnapshot && fs.existsSync(driveListSnapshot)) {
    files.drive_lists = driveListSnapshot;
  }
  const packets = Object.fromEntries(Object.entries(files).map(([key, file]) => [
    key,
    filePacket(file, key === 'drafts' || key === 'w10' || key === 'drive_lists'
      ? normalizePath(path.relative(repoRoot, file))
      : normalizePath(path.relative(path.dirname(clientOperationsRoot), file)), true),
  ]));
  const queue = JSON.parse(packets.queue.text);
  const registry = JSON.parse(packets.registry.text);
  const portfolio = JSON.parse(packets.portfolio.text);
  const health = JSON.parse(packets.health.text);
  const drafts = JSON.parse(packets.drafts.text);
  const w10 = JSON.parse(packets.w10.text);
  const driveLists = packets.drive_lists ? JSON.parse(packets.drive_lists.text) : null;
  const controlRevision = Number(
    (packets.control.text.match(/Queue revision:\s*`(\d+)`/i) || [])[1] || NaN
  );
  const rankingProbe = options.rankingProbe
    ? await options.rankingProbe({ clientOperationsRoot, asOf })
    : runRankingProbe(clientOperationsRoot, asOf);
  const packetList = Object.values(packets);
  packetList.push({
    locator: 'runtime://client-operations/Get-NextActions/read-only-probe',
    sha256: rankingProbe.probe_sha256,
    bytes: Buffer.byteLength(stableJson(rankingProbe)),
  });
  const manifest = buildManifest(packetList);
  const unresolvedStatuses = new Set(['done', 'cancelled', 'deferred']);
  return {
    captured_at: new Date().toISOString(),
    as_of: asOf,
    window,
    queue: {
      locator: packets.queue.locator,
      sha256: packets.queue.sha256,
      revision: queue.revision,
      updated_at: queue.updatedAt,
      mode: queue.mode,
      wip_policy: queue.wipPolicy,
      items: (queue.workItems || [])
        .filter((item) => !unresolvedStatuses.has(item.status))
        .map(safeQueueItem)
        .sort((a, b) => a.id.localeCompare(b.id)),
    },
    registry: {
      locator: packets.registry.locator,
      sha256: packets.registry.sha256,
      clients: (registry.clients || []).map((client) => ({
        id: client.id,
        status: client.status,
        display_name: client.displayName,
      })).sort((a, b) => a.id.localeCompare(b.id)),
    },
    portfolio: {
      locator: packets.portfolio.locator,
      sha256: packets.portfolio.sha256,
      generated_at: portfolio.generatedAtUtc,
      entries: (portfolio.entries || []).map((entry) => ({
        client_id: entry.clientId,
        route_status: entry.routeStatus,
        rank: entry.rank,
        tier: entry.tier,
        active_work_eligible: entry.activeWorkEligible,
      })).sort((a, b) => a.client_id.localeCompare(b.client_id)),
    },
    control: {
      locator: packets.control.locator,
      sha256: packets.control.sha256,
      queue_revision: Number.isFinite(controlRevision) ? controlRevision : null,
    },
    system_health: {
      locator: packets.health.locator,
      sha256: packets.health.sha256,
      as_of: health.asOf,
      overall: health.overall,
      reported_queue_revision: health.queue?.revision || null,
      warning_count: Array.isArray(health.warnings) ? health.warnings.length : 0,
    },
    ranking_probe: rankingProbe,
    drafts: {
      locator: packets.drafts.locator,
      sha256: packets.drafts.sha256,
      source_set_sha256: drafts.source_set_sha256,
      signature_contract_sha256: drafts.signature_contract_sha256,
      connector_receipt: drafts.connector_receipt,
      privacy: drafts.privacy,
      authority: drafts.authority,
      items: drafts.items || [],
    },
    drive_lists: driveLists ? {
      locator: packets.drive_lists.locator,
      sha256: packets.drive_lists.sha256,
      captured_at: driveLists.captured_at,
      privacy: driveLists.privacy,
      authority: driveLists.authority,
      aggregate_outcome: driveLists.aggregate_outcome,
      workflows: driveLists.workflows || {},
    } : null,
    context: {
      w10: {
        locator: packets.w10.locator,
        sha256: packets.w10.sha256,
        proposal_only: w10.proposal_only,
        canonical_write_attempted: w10.canonical_write_attempted,
        external_action_attempted: w10.external_action_attempted,
        ranked_proposals: Array.isArray(w10.ranked_decision_proposals)
          ? w10.ranked_decision_proposals.length
          : 0,
      },
    },
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
  };
}

function evaluateQueueItem(item, registryClients, asOf) {
  const client = registryClients.find((candidate) => candidate.id === item.client_id);
  const routeFresh = dateFresh(item.routing?.verifiedAt, asOf);
  const evidenceFresh = item.evidence?.freshness === 'current' &&
    dateFresh(item.evidence?.as_of, asOf);
  const dueTime = Date.parse(item.due_at);
  const asOfTime = Date.parse(asOf);
  const deadlineState = !item.due_at
    ? 'no_evidenced_deadline'
    : !Number.isFinite(dueTime)
      ? 'invalid_deadline'
      : dueTime < asOfTime
        ? 'overdue'
        : 'scheduled';
  const checks = {
    registry_record_present: Boolean(client),
    registry_status_active: client?.status === 'active',
    queue_route_resolved: item.routing?.status === 'resolved',
    queue_route_matches_registry: Boolean(client) && item.routing?.registryStatus === client.status,
    route_verified_within_14_days: routeFresh,
    evidence_current_within_14_days: evidenceFresh,
    evidence_references_present: Number(item.evidence?.ref_count || 0) > 0,
    owner_present: Boolean(String(item.owner || '').trim()),
    next_action_present: Boolean(String(item.next_action || '').trim()),
    finish_line_present: Number(item.definition_of_done_count || 0) > 0,
    deadline_evidenced: deadlineState === 'scheduled' || deadlineState === 'overdue',
  };
  return {
    schema_version: 1,
    routine_id: 'W01',
    record_kind: 'queue_item',
    work_item_id: item.id,
    expected_work_item_version: item.version,
    client_id: item.client_id,
    title: item.title,
    status: item.status,
    priority: item.priority,
    owner: item.owner,
    next_action: item.next_action,
    deadline: { value: item.due_at, state: deadlineState },
    approval: item.approval,
    checks,
    ready: Object.values(checks).every(Boolean),
    proposed_transition: null,
    canonical_write_attempted: false,
    external_action_attempted: false,
  };
}

function evaluatePortfolio(item, registryClients) {
  const entries = item.entries;
  const entryMap = new Map(entries.map((entry) => [entry.client_id, entry]));
  const findings = [];
  const ranks = new Set();
  for (const client of registryClients) {
    const entry = entryMap.get(client.id);
    if (!entry) {
      findings.push({ code: 'missing_portfolio_entry', client_id: client.id });
      continue;
    }
    if (client.status === 'active') {
      if (entry.route_status !== 'resolved' || entry.active_work_eligible !== true ||
          entry.tier === 'excluded' || !Number.isInteger(entry.rank)) {
        findings.push({ code: 'active_client_not_portfolio_eligible', client_id: client.id });
      } else if (ranks.has(entry.rank)) {
        findings.push({ code: 'duplicate_active_rank', client_id: client.id });
      } else {
        ranks.add(entry.rank);
      }
    } else if (entry.active_work_eligible !== false || entry.tier !== 'excluded' ||
               entry.rank !== null) {
      findings.push({ code: 'inactive_client_portfolio_eligible', client_id: client.id });
    }
  }
  for (const entry of entries) {
    if (!registryClients.some((client) => client.id === entry.client_id)) {
      findings.push({ code: 'unknown_portfolio_client', client_id: entry.client_id });
    }
  }
  return {
    schema_version: 1,
    routine_id: 'W01',
    record_kind: 'portfolio_integrity',
    registry_clients: registryClients.length,
    portfolio_entries: entries.length,
    findings,
    ready: findings.length === 0,
    canonical_write_attempted: false,
    external_action_attempted: false,
  };
}

function evaluateControl(item) {
  const checks = {
    projection_revision_matches_queue: item.control.queue_revision === item.queue_revision,
    system_health_revision_matches_queue:
      item.system_health.reported_queue_revision === item.queue_revision,
    ranking_probe_passed: item.ranking_probe.passed === true,
    w10_remains_proposal_only: item.w10.proposal_only === true &&
      item.w10.canonical_write_attempted === false &&
      item.w10.external_action_attempted === false,
  };
  return {
    schema_version: 1,
    routine_id: 'W01',
    record_kind: 'control_integrity',
    queue_revision: item.queue_revision,
    control_revision: item.control.queue_revision,
    health_revision: item.system_health.reported_queue_revision,
    ranking_probe: item.ranking_probe,
    checks,
    ready: Object.values(checks).every(Boolean),
    canonical_write_attempted: false,
    external_action_attempted: false,
  };
}

function normalizeDraftRoute(route, registryClients) {
  let candidates = [...new Set(route?.candidates || [])].sort();
  if (candidates.length > 1 && candidates.includes('momentum-360')) {
    const withoutAgency = candidates.filter((candidate) => candidate !== 'momentum-360');
    if (withoutAgency.length > 0) candidates = withoutAgency;
  }
  const resolved = candidates.length === 1
    ? registryClients.find((client) => client.id === candidates[0])
    : null;
  const status = candidates.length === 0
    ? 'unresolved'
    : candidates.length > 1
      ? 'ambiguous'
      : !resolved
        ? 'unresolved'
        : resolved.status === 'active'
          ? 'resolved_active'
          : 'resolved_inactive';
  return { status, candidates };
}

function evaluateDraft(item, registryClients) {
  const route = normalizeDraftRoute(item.client_route, registryClients);
  const checks = {
    ...item.checks,
    exact_active_client_route: route.status === 'resolved_active',
    reply_all_parity: item.thread_context?.kind !== 'reply_thread' ||
      item.thread_context?.reply_all_parity === true,
    approval_state_present: item.approval_state === 'pending_exact_preview_approval',
    no_external_action: item.external_action_attempted === false,
  };
  const findings = Object.entries(checks)
    .filter(([, passed]) => passed !== true)
    .map(([code]) => code);
  return {
    schema_version: 1,
    routine_id: 'W07',
    record_kind: 'draft',
    draft_key: item.draft_key,
    input_fingerprint: item.input_fingerprint,
    client_route: route,
    captured_timestamp: item.captured_timestamp,
    thread_kind: item.thread_context?.kind || 'unknown',
    recipient_counts: item.recipient_counts,
    has_attachment: item.has_attachment === true,
    checks,
    findings,
    ready_for_exact_preview: findings.length === 0,
    approval_state: item.approval_state,
    canonical_write_attempted: false,
    external_action_attempted: false,
  };
}

function evaluateDriveList(item) {
  const workflow = item.workflow;
  const sourceFresh = dateFresh(item.captured_at, item.as_of, 7);
  let checks;
  if (item.workflow_key === 'momentum_concept_outreach') {
    checks = {
      source_snapshot_fresh_within_7_days: sourceFresh,
      folder_private: workflow.folder?.visibility === 'private_owner_only',
      live_state_rows_match_built_pages:
        workflow.partition_checks?.state_rows_match_built_pages === true,
      state_partitions_have_no_normalized_name_overlap:
        workflow.partition_checks?.normalized_name_overlap_call_hold === 0 &&
        workflow.partition_checks?.normalized_name_overlap_call_do_not_pitch === 0 &&
        workflow.partition_checks?.normalized_name_overlap_hold_do_not_pitch === 0,
      canonical_row_identity_present:
        workflow.identity_integrity?.stable_identity_column_present === true,
      declared_distinct_business_count_reconciled:
        workflow.identity_integrity?.unexplained_identity_delta === 0,
      cross_state_exclusivity_provable:
        workflow.identity_integrity?.cross_state_exclusivity_provable === true,
      show_is_not_production_approval:
        workflow.authority?.cleared_to_show_is_not_production_approval === true,
      exact_human_send_approval_required:
        workflow.authority?.human_approval_required_for_every_send === true,
      no_external_action_authorized:
        workflow.authority?.external_action_authorized === false,
    };
  } else if (item.workflow_key === 'franchise_workshop') {
    checks = {
      source_snapshot_fresh_within_7_days: sourceFresh,
      folder_private: workflow.folder?.visibility === 'private',
      full_source_has_720_unique_emails:
        workflow.full_send_ready_projection?.rows === 720 &&
        workflow.full_send_ready_projection?.unique_emails === 720,
      every_full_source_row_has_stable_identity:
        workflow.full_send_ready_projection?.unique_prospect_ids === 720 &&
        workflow.full_send_ready_projection?.missing_prospect_id_rows === 0,
      wave_1_is_exact_projection:
        workflow.projection_checks?.separate_wave_1_exact_projection === true &&
        workflow.projection_checks?.exact_rows_for_shared_ids === 50 &&
        workflow.projection_checks?.shared_id_email_mismatches === 0 &&
        workflow.projection_checks?.shared_id_other_field_mismatches === 0,
      one_current_instruction_source:
        workflow.documentation_checks?.one_unambiguous_current_instruction_source === true,
      every_row_still_not_sent:
        workflow.authority?.all_rows_currently_not_sent === true,
      title_is_not_send_approval:
        workflow.authority?.sheet_title_is_not_send_approval === true,
      exact_human_send_approval_required:
        workflow.authority?.human_copy_and_send_approval_required === true,
      no_agent_send_authorized:
        workflow.authority?.agent_send_authorized === false,
      no_external_action_authorized:
        workflow.authority?.external_action_authorized === false,
    };
  } else {
    checks = { recognized_workflow: false };
  }
  const findings = Object.entries(checks)
    .filter(([, passed]) => passed !== true)
    .map(([code]) => code);
  return {
    schema_version: 1,
    routine_id: 'W07',
    record_kind: 'drive_list_state',
    workflow_key: item.workflow_key,
    source_locator: item.source_locator,
    source_sha256: item.source_sha256,
    checks,
    findings,
    ready_for_draft_generation: findings.length === 0,
    exact_preview_approval_required: true,
    canonical_write_attempted: false,
    external_action_attempted: false,
  };
}

function safeItemId(value) {
  return sha256(String(value)).slice(0, 20);
}

function createCommandCommsHarness(options) {
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = options.logicalRoot;
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const sourceCollector = options.collectSources;
  const window = options.window;
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const correctionsFile = path.join(workspaceRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;

  function logicalArtifact(name) {
    return normalizePath(path.join(logicalRoot, name));
  }

  const contract = {
    schema_version: 1,
    graph_id: 'weekly-w01-w07-readiness-shadow',
    objective: 'Reconcile every unresolved canonical work item, completed-week Gmail draft, and current Drive outreach-list state into privacy-safe W01 and W07 readiness artifacts without mutating the queue, lists, or messages.',
    value_signal: 'Every priority, draft, and outreach-list projection is either fully source-bound and ready for its next gate or carries exact machine-readable reasons why it is not.',
    constraints: [
      'Treat client-operations queue and registry as canonical and read-only.',
      'Treat Gmail as draft-only source evidence and persist no raw message, subject, address, or provider ID.',
      'Treat Drive list titles as labels, never as send approval, and persist aggregate redacted state only.',
      'Do not infer a client route, source binding, deadline, approval, or readiness state.',
      'No send, post, schedule, publish, deploy, spend, account change, canonical write, or contact mutation.',
    ],
    upstream_artifacts: [
      'client-operations/queue/work-items.json',
      'client-operations/registry/clients.json',
      'client-operations/state/portfolio-priorities.json',
      'client-operations/CONTROL.md',
      'client-operations/state/system-health.json',
      'System/outcome-graph/source-snapshots/gmail-drafts-<window>.json',
      'System/outcome-graph/source-snapshots/google-drive-list-state-<date>.json',
      'System/outcome-graph/tranche-*-durable/W10-executive-weekly-review.json',
    ],
    scope: {
      root: 'dillon-os plus read-only client-operations and redacted Gmail and Drive snapshots',
      isolation_key: 'W01:work_item_or_integrity_record | W07:redacted_draft_key_or_list_workflow',
      data_class: 'internal-redacted',
    },
    source_freshness: {
      checked_at: new Date().toISOString(),
      max_age_seconds: 300,
      evidence: 'All local sources, redacted Gmail and Drive connector snapshots, and the ranking probe are hashed and recollected at terminal verification.',
    },
    finish_line: {
      predicate: 'Every unresolved queue item, portfolio/control invariant, completed-week draft, and current Drive list workflow is independently reconstructed; aggregate readiness exactly matches the records; privacy and authority checks pass; and both final artifacts are hashed.',
      required_artifacts: FINAL_NAMES.map(logicalArtifact),
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: 2,
      timeout_seconds: 600,
      max_parallel: 4,
      budget_units: 210,
    },
    adapters: {
      planner: 'command-comms-planner',
      maker: 'command-comms-record-maker',
      checker: 'command-comms-independent-checker',
      reducer: 'command-comms-reducer',
      terminal_verifier: 'command-comms-terminal-verifier',
      learner: 'command-comms-correction-ledger',
    },
    approval: { external_actions: false, required_before: [] },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: 'client-operations/queue/work-items.json remains canonical and read-only to this graph',
      dedupe_key: `internal:${window.period_start}:${window.period_end}:W01-W07-readiness`,
      checkpoint: logicalArtifact('run-receipt.json'),
      rollback: 'Discard the readiness artifacts and redacted connector snapshots; Gmail drafts, Drive lists, canonical queue, registry, and external systems are unchanged.',
      escalation: 'Return exact stale-route, stale-evidence, portfolio, projection, list-identity, draft-quality, source-binding, routing, or approval findings to Marketing Chief.',
      allowed_actions: ['read_files', 'read_canonical_queue', 'read_redacted_snapshot', 'run_read_only_probe', 'write_shadow_artifact'],
      forbidden_actions: ['canonical_queue_write', 'send', 'post', 'schedule', 'publish', 'deploy', 'spend', 'account_change', 'contact_mutation'],
    },
    learning: {
      fingerprint_inputs: ['canonical-source-manifest', 'queue-item-versions', 'draft-input-fingerprints', 'drive-list-state-fingerprint', 'readiness-findings', 'terminal-assertions'],
      corrections_ledger: logicalArtifact('corrections.jsonl'),
    },
  };

  function evaluateItem(item) {
    if (item.record_type === 'queue_item') {
      return evaluateQueueItem(
        item.snapshot.item,
        item.snapshot.registry_clients,
        item.snapshot.as_of
      );
    }
    if (item.record_type === 'portfolio') {
      return evaluatePortfolio(item.snapshot, item.snapshot.registry_clients);
    }
    if (item.record_type === 'control') return evaluateControl(item.snapshot);
    if (item.record_type === 'draft') {
      return evaluateDraft(item.snapshot.draft, item.snapshot.registry_clients);
    }
    if (item.record_type === 'drive_list_state') return evaluateDriveList(item.snapshot);
    throw new Error('Unsupported W01/W07 item ' + item.id);
  }

  const adapters = {
    'command-comms-planner': async () => {
      const sources = await sourceCollector();
      const items = [
        ...sources.queue.items.map((snapshot) => ({
          id: 'W01:queue:' + snapshot.id,
          routine_id: 'W01',
          record_type: 'queue_item',
          task: 'Reconcile canonical work item ' + snapshot.id + ' against current route, evidence, owner, deadline, finish line, and approval state.',
          isolation_key: 'W01:queue:' + snapshot.id,
          input_fingerprint: sha256(stableJson({
            item: snapshot,
            registry: sources.registry.clients,
            as_of: sources.as_of,
          })),
          snapshot: {
            item: snapshot,
            registry_clients: sources.registry.clients,
            as_of: sources.as_of,
          },
        })),
        {
          id: 'W01:portfolio-integrity',
          routine_id: 'W01',
          record_type: 'portfolio',
          task: 'Reconcile portfolio eligibility and ranks to the exact current client registry.',
          isolation_key: 'W01:integrity:portfolio',
          input_fingerprint: sha256(stableJson({
            portfolio: sources.portfolio,
            registry: sources.registry.clients,
          })),
          snapshot: {
            entries: sources.portfolio.entries,
            registry_clients: sources.registry.clients,
          },
        },
        {
          id: 'W01:control-integrity',
          routine_id: 'W01',
          record_type: 'control',
          task: 'Verify queue projection revisions, ranking execution, health revision, and proposal-only W10 authority.',
          isolation_key: 'W01:integrity:control',
          input_fingerprint: sha256(stableJson({
            queue_revision: sources.queue.revision,
            control: sources.control,
            health: sources.system_health,
            ranking: sources.ranking_probe,
            w10: sources.context.w10,
          })),
          snapshot: {
            queue_revision: sources.queue.revision,
            control: sources.control,
            system_health: sources.system_health,
            ranking_probe: sources.ranking_probe,
            w10: sources.context.w10,
          },
        },
        ...sources.drafts.items.map((snapshot) => ({
          id: 'W07:' + snapshot.draft_key,
          routine_id: 'W07',
          record_type: 'draft',
          task: 'Reproduce privacy-safe routing, readback, body, signature, source, and approval checks for ' + snapshot.draft_key + '.',
          isolation_key: 'W07:draft:' + snapshot.draft_key,
          input_fingerprint: snapshot.input_fingerprint,
          snapshot: {
            draft: snapshot,
            registry_clients: sources.registry.clients,
          },
        })),
        ...Object.entries(sources.drive_lists?.workflows || {}).map(([workflowKey, workflow]) => ({
          id: 'W07:drive-list:' + workflowKey,
          routine_id: 'W07',
          record_type: 'drive_list_state',
          task: 'Reproduce the privacy-safe identity, projection, instruction, and approval gates for Drive workflow ' + workflowKey + '.',
          isolation_key: 'W07:drive-list:' + workflowKey,
          input_fingerprint: sha256(stableJson({
            source: sources.drive_lists.sha256,
            workflow_key: workflowKey,
            workflow,
          })),
          snapshot: {
            workflow_key: workflowKey,
            workflow,
            captured_at: sources.drive_lists.captured_at,
            as_of: `${sources.window.prepared}T23:59:59.999Z`,
            source_locator: sources.drive_lists.locator,
            source_sha256: sources.drive_lists.sha256,
          },
        })),
      ];
      return {
        evidence: `Collected ${items.length} isolated W01/W07 readiness records from source set ${sources.source_set_sha256}.`,
        source_set_sha256: sources.source_set_sha256,
        sources,
        items,
      };
    },

    'command-comms-record-maker': async ({ workflow_id: workflowId, item, attempt }) => {
      const isolatedRoot = path.join(workspaceRoot, 'isolated', safeItemId(item.id));
      const artifactFile = path.join(isolatedRoot, 'record.json');
      const record = evaluateItem(item);
      writeJsonAtomic(artifactFile, record);
      return {
        evidence: 'Built one privacy-safe source-bound record for ' + item.id + '.',
        isolation_id: workflowId + ':' + safeItemId(item.id) + ':attempt:' + attempt,
        artifacts: [fileEvidence(
          artifactFile,
          normalizePath(path.join(logicalRoot, 'workers', safeItemId(item.id) + '.json')),
          true
        )],
      };
    },

    'command-comms-independent-checker': async ({ item, maker_result: makerResult }) => {
      const artifact = makerResult.artifacts[0];
      const bytes = fs.readFileSync(artifact.resume_locator);
      const hashPassed = sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
      const actual = hashPassed ? JSON.parse(bytes.toString('utf8')) : null;
      const expected = evaluateItem(item);
      const exactPassed = hashPassed && stableJson(actual) === stableJson(expected);
      return {
        evidence: 'Independently reconstructed and compared ' + item.id + '.',
        passed: hashPassed && exactPassed,
        findings: [
          ...(!hashPassed ? ['Worker artifact hash or byte count changed.'] : []),
          ...(!exactPassed ? ['Worker record does not exactly reproduce from the source snapshot.'] : []),
        ],
      };
    },

    'command-comms-reducer': async ({ plan, worker_results: workers }) => {
      const records = workers.map((worker) => readJson(worker.final_artifacts[0].resume_locator));
      const queueRecords = records.filter((record) => record.routine_id === 'W01' && record.record_kind === 'queue_item')
        .sort((a, b) => a.work_item_id.localeCompare(b.work_item_id));
      const integrityRecords = records.filter((record) => record.routine_id === 'W01' && record.record_kind !== 'queue_item')
        .sort((a, b) => a.record_kind.localeCompare(b.record_kind));
      const draftRecords = records.filter((record) =>
        record.routine_id === 'W07' && record.record_kind === 'draft'
      )
        .sort((a, b) => a.draft_key.localeCompare(b.draft_key));
      const driveListRecords = records.filter((record) =>
        record.routine_id === 'W07' && record.record_kind === 'drive_list_state'
      ).sort((a, b) => a.workflow_key.localeCompare(b.workflow_key));
      const w01 = {
        schema_version: 1,
        routine_id: 'W01',
        artifact_type: 'weekly_operating_slate_readiness',
        window: plan.sources.window,
        canonical_binding: {
          locator: plan.sources.queue.locator,
          revision: plan.sources.queue.revision,
          sha256: plan.sources.queue.sha256,
        },
        queue_items: queueRecords,
        integrity_records: integrityRecords,
        summary: {
          unresolved_items: queueRecords.length,
          ready_items: queueRecords.filter((record) => record.ready).length,
          overdue_items: queueRecords.filter((record) => record.deadline.state === 'overdue').length,
          items_without_evidenced_deadline: queueRecords.filter((record) => record.deadline.state === 'no_evidenced_deadline').length,
          stale_routes: queueRecords.filter((record) => !record.checks.route_verified_within_14_days).length,
          stale_evidence: queueRecords.filter((record) => !record.checks.evidence_current_within_14_days).length,
          inactive_or_mismatched_routes: queueRecords.filter((record) =>
            !record.checks.registry_status_active || !record.checks.queue_route_matches_registry
          ).length,
          integrity_records_ready: integrityRecords.filter((record) => record.ready).length,
          integrity_records_total: integrityRecords.length,
        },
        workflow_ready: queueRecords.length > 0 &&
          queueRecords.every((record) => record.ready) &&
          integrityRecords.every((record) => record.ready),
        authority: {
          proposal_only: true,
          marketing_chief_only_canonical_writer: true,
          canonical_write_attempted: false,
          external_action_attempted: false,
        },
      };
      const w07 = {
        schema_version: 1,
        routine_id: 'W07',
        artifact_type: 'unsent_draft_queue_readiness',
        window: plan.sources.window,
        source: {
          locator: plan.sources.drafts.locator,
          sha256: plan.sources.drafts.sha256,
          source_set_sha256: plan.sources.drafts.source_set_sha256,
          connector_receipt: plan.sources.drafts.connector_receipt,
        },
        drafts: draftRecords,
        drive_list_sources: driveListRecords,
        summary: {
          drafts: draftRecords.length,
          ready_for_exact_preview: draftRecords.filter((record) => record.ready_for_exact_preview).length,
          unresolved_routes: draftRecords.filter((record) => record.client_route.status === 'unresolved').length,
          ambiguous_routes: draftRecords.filter((record) => record.client_route.status === 'ambiguous').length,
          inactive_routes: draftRecords.filter((record) => record.client_route.status === 'resolved_inactive').length,
          missing_primary_recipient: draftRecords.filter((record) => !record.checks.primary_recipient_present).length,
          quoted_history_present: draftRecords.filter((record) => !record.checks.quoted_history_absent).length,
          signature_mismatch: draftRecords.filter((record) => !record.checks.canonical_signature_markers).length,
          dash_rule_failed: draftRecords.filter((record) => !record.checks.rendered_dash_absent).length,
          reply_all_mismatch: draftRecords.filter((record) => !record.checks.reply_all_parity).length,
          missing_canonical_source_binding: draftRecords.filter((record) => !record.checks.canonical_source_bound).length,
          drive_list_workflows: driveListRecords.length,
          drive_list_workflows_ready: driveListRecords.filter((record) => record.ready_for_draft_generation).length,
          drive_list_findings: driveListRecords.reduce((sum, record) => sum + record.findings.length, 0),
        },
        workflow_ready: draftRecords.length > 0 &&
          draftRecords.every((record) => record.ready_for_exact_preview) &&
          driveListRecords.every((record) => record.ready_for_draft_generation),
        privacy: plan.sources.drafts.privacy,
        authority: {
          draft_only: true,
          exact_preview_approval_required: true,
          canonical_write_attempted: false,
          external_action_attempted: false,
        },
      };
      const stagingRoot = path.join(workspaceRoot, 'staged');
      fs.mkdirSync(stagingRoot, { recursive: true });
      const documents = new Map([
        ['W01-weekly-operating-slate.json', w01],
        ['W07-unsent-draft-queue.json', w07],
      ]);
      const artifacts = [];
      for (const [name, document] of documents) {
        const file = path.join(stagingRoot, name);
        writeJsonAtomic(file, document);
        artifacts.push(fileEvidence(file, logicalArtifact(name)));
      }
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: 'Reduced every independently checked W01 and W07 record into two privacy-safe readiness artifacts.',
        artifacts,
        staging_root: stagingRoot,
      };
    },

    'command-comms-terminal-verifier': async ({ plan, reduction }) => {
      const fresh = await sourceCollector();
      const w01 = readJson(path.join(reduction.staging_root, FINAL_NAMES[0]));
      const w07 = readJson(path.join(reduction.staging_root, FINAL_NAMES[1]));
      const expectedW01Ready = w01.queue_items.length > 0 &&
        w01.queue_items.every((record) => record.ready) &&
        w01.integrity_records.every((record) => record.ready);
      const expectedW07Ready = w07.drafts.length > 0 &&
        w07.drafts.every((record) => record.ready_for_exact_preview) &&
        w07.drive_list_sources.every((record) => record.ready_for_draft_generation);
      const serialized = stableJson({ w01, w07 });
      const assertions = [
        {
          id: 'source-manifest-stable',
          passed: fresh.source_set_sha256 === plan.source_set_sha256,
          detail: 'Canonical queue, registry, portfolio, projection, health, scripts, W10, Gmail snapshot, and ranking probe remain bound to the planned manifest.',
        },
        {
          id: 'W01-full-reconciliation-coverage',
          passed: w01.queue_items.length === fresh.queue.items.length &&
            w01.integrity_records.length === 2,
          detail: 'Every unresolved queue item plus portfolio and control integrity is represented exactly once.',
        },
        {
          id: 'W07-full-redacted-source-coverage',
          passed: w07.drafts.length === fresh.drafts.items.length &&
            w07.drive_list_sources.length === Object.keys(fresh.drive_lists?.workflows || {}).length &&
            w07.privacy?.redacted === true &&
            w07.privacy?.contains_direct_identifiers === false &&
            w07.privacy?.contains_raw_communications === false,
          detail: 'Every completed-week draft and current Drive list workflow is represented by a redacted fingerprinted record.',
        },
        {
          id: 'readiness-state-is-not-synthesized',
          passed: w01.workflow_ready === expectedW01Ready &&
            w07.workflow_ready === expectedW07Ready,
          detail: 'Aggregate readiness equals the exact conjunction of its checked source records, including negative states.',
        },
        {
          id: 'privacy-and-authority-boundary',
          passed: !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized) &&
            !/draft_id|message_id|thread_id|snippet/i.test(serialized) &&
            w01.authority.canonical_write_attempted === false &&
            w01.authority.external_action_attempted === false &&
            w07.authority.canonical_write_attempted === false &&
            w07.authority.external_action_attempted === false,
          detail: 'No direct email identifier, provider ID, raw communication, canonical write, or external action appears in the final artifacts.',
        },
      ];
      return {
        evidence: 'Recollected the entire manifest and independently verified coverage, truthful negative readiness, privacy, authority, and final hashes.',
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: FINAL_NAMES.map((name) =>
          fileEvidence(path.join(reduction.staging_root, name), logicalArtifact(name))
        ),
      };
    },

    'command-comms-correction-ledger': async ({ outcome }) => {
      const entry = {
        recorded_at: new Date().toISOString(),
        graph_id: contract.graph_id,
        outcome,
        correction: outcome === 'terminal_true'
          ? 'Keep W01 and W07 readiness separate from execution success; preserve every negative route, freshness, source, list identity, projection, body, recipient, signature, and approval finding until its exact source revalidates.'
          : 'Recollect the source set and repair only the exact failed coverage, privacy, authority, or artifact assertion.',
      };
      const serialized = JSON.stringify(entry);
      fs.appendFileSync(correctionsFile, serialized + '\n', 'utf8');
      return {
        evidence: 'Appended one hashed W01/W07 readiness correction entry.',
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
    workspaceRoot,
    commitVerifiedArtifacts() {
      if (!verifiedStagingRoot) throw new Error('No terminal-verified W01/W07 readiness artifacts are staged.');
      fs.mkdirSync(outputDir, { recursive: true });
      for (const name of FINAL_NAMES) {
        fs.copyFileSync(path.join(verifiedStagingRoot, name), path.join(outputDir, name));
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

function verifyResumedWorker({ item, worker_result: workerResult }) {
  if (workerResult?.status !== 'verified' ||
      workerResult?.item_id !== item.id ||
      workerResult?.input_fingerprint !== item.input_fingerprint) return false;
  const artifacts = workerResult.final_artifacts;
  if (!Array.isArray(artifacts) || artifacts.length !== 1) return false;
  const artifact = artifacts[0];
  if (!artifact.resume_locator || !fs.existsSync(artifact.resume_locator)) return false;
  const bytes = fs.readFileSync(artifact.resume_locator);
  return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
}

function verifyCompletedResult(result, outputDir) {
  const manifest = result.terminal_evidence?.artifact_manifest;
  if (!Array.isArray(manifest) || manifest.length !== FINAL_NAMES.length) return false;
  return manifest.every((artifact) => {
    const file = path.join(outputDir, path.basename(artifact.path));
    if (!fs.existsSync(file)) return false;
    const bytes = fs.readFileSync(file);
    return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
  });
}

function assertSafeOutput(candidate, repoRoot = REPO_ROOT) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(repoRoot);
  if (!absolute.startsWith(root + path.sep)) {
    throw new Error('W01/W07 readiness output must remain inside the Dillon OS repository.');
  }
  const relative = normalizePath(path.relative(root, absolute));
  if (!/^System\/outcome-graph\/readiness-\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?$/i.test(relative)) {
    throw new Error('W01/W07 readiness output must use System/outcome-graph/readiness-YYYY-MM-DD[-slug].');
  }
  return absolute;
}

async function runCommandCommsDurable(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const window = options.window || completedWeekWindow(options.referenceDate || new Date());
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafeOutput(options.outputDir, repoRoot);
  const stateRoot = path.resolve(options.stateRoot || path.join(
    repoRoot,
    '12_Brain',
    'state',
    'outcome-graph'
  ));
  const logicalRoot = options.logicalRoot || normalizePath(path.relative(repoRoot, outputDir));
  const collectSources = options.collectSources || (() => collectCommandCommsSources({
    repoRoot,
    clientOperationsRoot: options.clientOperationsRoot,
    referenceDate: options.referenceDate,
    window,
    asOf: options.asOf,
    draftSnapshot: options.draftSnapshot,
    driveListSnapshot: options.driveListSnapshot,
    w10Artifact: options.w10Artifact,
    rankingProbe: options.rankingProbe,
  }));
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    'command-comms-' + sha256(logicalRoot).slice(0, 20)
  );
  const harness = createCommandCommsHarness({
    outputDir,
    logicalRoot,
    workspaceRoot,
    collectSources,
    window,
  });
  const readCanonicalBinding = async () => {
    const sources = await collectSources();
    return {
      locator: 'dillon-os://weekly/W01-W07-readiness-source-set',
      version: `queue-r${sources.queue.revision}:${window.period_start}:${sources.queue.items.length}:${sources.drafts.items.length}:${Object.keys(sources.drive_lists?.workflows || {}).length}`,
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
      verifyResumedWorker,
      verifyCompletedResult: (prior) => verifyCompletedResult(prior, outputDir),
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
  FINAL_NAMES,
  assertSafeOutput,
  collectCommandCommsSources,
  createCommandCommsHarness,
  evaluateControl,
  evaluateDraft,
  evaluateDriveList,
  evaluatePortfolio,
  evaluateQueueItem,
  latestDriveListSnapshot,
  normalizeDraftRoute,
  runCommandCommsDurable,
  runRankingProbe,
  verifyCompletedResult,
  verifyResumedWorker,
};
