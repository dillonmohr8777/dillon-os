import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_REPORT_MODES = new Set(['standup', 'eod', 'both']);
const BLOCKING_STATES = new Set(['BLOCKED', 'FAILED_QA', 'WAITING_APPROVAL']);
const BOARD_ACTIVE_STATES = new Set([
  'INBOX',
  'TRIAGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'READY_FOR_REVIEW',
  'FAILED_QA',
  'BLOCKED',
  'WAITING_APPROVAL'
]);
const INTERNAL_EXTERNAL_ACTION_KEYS = [
  'messages_sent',
  'replies',
  'meetings_booked',
  'proposals_sent',
  'closed_won',
  'active_clients',
  'verified_new_revenue_usd',
  'new_hires_or_purchases'
];

export const DEFAULT_REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..'
);

export const OFFICE_SOURCE_PATHS = Object.freeze({
  crew: '11_Agents/IMMOHRTAL Business Crew/CREW.json',
  board: '11_Agents/IMMOHRTAL Business Crew/DAY-1-COMMAND-BOARD.md',
  scorecard: 'automation/immohrtal-agency/ops/DAY-1-SCORECARD.json',
  generator: 'automation/immohrtal-agency/ops/lib/office-report.mjs',
  cli: 'automation/immohrtal-agency/ops/run-office-report.mjs',
  wrapper: 'automation/immohrtal-agency/ops/Run-ImmohrtalOfficeDaily.ps1',
  scheduleManifest: 'automation/immohrtal-agency/ops/office-daily.manifest.json'
});

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  const input = Buffer.isBuffer(value) ? value : String(value);
  return crypto.createHash('sha256').update(input).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readText(filePath));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function toLocator(repoRoot, filePath) {
  const relative = path.relative(repoRoot, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative.replaceAll('\\', '/')
    : path.resolve(filePath).replaceAll('\\', '/');
}

function sourceEvidence(repoRoot, filePath, kind) {
  const bytes = fs.readFileSync(filePath);
  return {
    locator: toLocator(repoRoot, filePath),
    kind,
    bytes: bytes.length,
    sha256: sha256(bytes)
  };
}

function stripOuterCode(value) {
  const trimmed = String(value || '').trim();
  const withoutOuterCode = /^`[^`]*`$/.test(trimmed) ? trimmed.slice(1, -1) : trimmed;
  return withoutOuterCode.replace(/`([^`]+)`/g, '$1');
}

function parseBoardField(section, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = section.match(new RegExp('^- `' + escaped + '`:\\s*(.+)$', 'm'));
  return match ? stripOuterCode(match[1]) : null;
}

export function parseCommandBoard(markdown, requiredFields) {
  const headingPattern = /^### ([A-Z][A-Z0-9-]+)\s*$/gm;
  const headings = [...markdown.matchAll(headingPattern)];
  const items = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const sectionStart = heading.index + heading[0].length;
    const sectionEnd = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);
    const item = Object.fromEntries(requiredFields.map((field) => [field, parseBoardField(section, field)]));
    if (!item.item_id) continue;
    assert(item.item_id === heading[1], `Board heading ${heading[1]} does not match item_id ${item.item_id}.`);
    const missing = requiredFields.filter((field) => !item[field]);
    assert(missing.length === 0, `Board item ${item.item_id} is missing required fields: ${missing.join(', ')}.`);
    items.push(item);
  }

  assert(items.length > 0, 'The command board contains no parseable work items.');
  const ids = items.map((item) => item.item_id);
  assert(new Set(ids).size === ids.length, 'The command board contains duplicate item IDs.');
  return items;
}

function extractMarkdownSection(markdown, heading) {
  const marker = `## ${heading}`;
  const markerIndex = markdown.indexOf(marker);
  if (markerIndex < 0) return null;
  const sectionStart = markerIndex + marker.length;
  const remaining = markdown.slice(sectionStart).replace(/^\r?\n/, '');
  const nextHeading = remaining.search(/^## /m);
  const section = nextHeading >= 0 ? remaining.slice(0, nextHeading) : remaining;
  return section
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
}

function validateCrew(crew) {
  assert(crew.business === 'IMMOHRTAL Marketing Solutions', 'Crew business identity is not canonical.');
  assert(crew.operating_environment === 'Codex', 'Crew operating environment must remain Codex.');
  assert(crew.external_runtime === false, 'Crew file must not grant an external runtime.');
  assert(crew.gmail_in_scope === false, 'Crew file must keep Gmail out of scope.');
  assert(Array.isArray(crew.roster) && crew.roster.length === 5, 'The internal crew must contain exactly five subordinate seats.');

  const roleIds = crew.roster.map((role) => role.role_id);
  assert(new Set(roleIds).size === roleIds.length, 'The internal crew contains duplicate role IDs.');
  const titles = crew.roster.map((role) => role.title);
  assert(new Set(titles).size === titles.length, 'The internal crew contains duplicate role titles.');

  const reserved = new Set(crew.public_character_separation?.reserved_public_characters || []);
  for (const role of crew.roster) {
    assert(!reserved.has(role.title), `Internal seat ${role.title} conflicts with a reserved public character.`);
    assert(['maker', 'checker'].includes(role.kind), `Internal seat ${role.role_id} has an invalid kind.`);
    assert(role.reports_to === 'Codex Marketing Chief', `Internal seat ${role.role_id} has an unexpected reporting line.`);
  }
  assert(crew.roster.filter((role) => role.kind === 'checker').length === 1, 'Exactly one internal seat must be the independent checker.');

  assert(crew.communications_policy?.email_drafts_allowed === false, 'Provider-side email drafts must remain disabled.');
  assert(crew.communications_policy?.outbound_message_copy_allowed === false, 'Outbound message copy must remain disabled in this office lane.');
  assert(crew.communications_policy?.automatic_replies_active === false, 'Automatic replies must remain disabled.');

  const prohibited = new Set(crew.authority?.prohibited_without_separate_exact_authority || []);
  for (const required of [
    'send or post any message',
    'publish or deploy',
    'spend or purchase',
    'hire or contract',
    'mutate a CRM or client account',
    'start a scheduled or external runtime'
  ]) {
    assert(prohibited.has(required), `Crew authority is missing the required prohibition: ${required}.`);
  }

  const requiredFields = crew.board?.required_fields || [];
  assert(requiredFields.length === 13, 'The board contract must contain exactly 13 required fields.');
  assert(new Set(requiredFields).size === requiredFields.length, 'The board contract contains duplicate required fields.');
}

function validateBoard(items, crew) {
  const roleIds = new Set(crew.roster.map((role) => role.role_id));
  const states = new Set([...(crew.board.primary_states || []), ...(crew.board.exception_states || [])]);
  for (const item of items) {
    assert(roleIds.has(item.owner_role_id) || item.owner_role_id === 'codex_marketing_chief', `Board item ${item.item_id} has an unknown owner ${item.owner_role_id}.`);
    assert(states.has(item.status), `Board item ${item.item_id} has an invalid status ${item.status}.`);
    assert(item.checker_role_id === 'none' || roleIds.has(item.checker_role_id), `Board item ${item.item_id} has an unknown checker ${item.checker_role_id}.`);
    assert(!Number.isNaN(Date.parse(item.updated_at)), `Board item ${item.item_id} has an invalid updated_at value.`);
  }
}

function validateScorecard(scorecard, crew) {
  assert(scorecard.company?.name === crew.business, 'Scorecard and crew business identities do not match.');
  assert(scorecard.company?.orchestrator === crew.orchestrator, 'Scorecard and crew orchestrators do not match.');
  assert(scorecard.organizational_separation?.internal_subordinate_seat_count === crew.roster.length, 'Scorecard seat count does not match the crew roster.');
  assert(scorecard.scope?.external_actions === false, 'Scorecard must keep external actions disabled.');
  assert(scorecard.scope?.provider_side_message_drafts === false, 'Scorecard must keep provider-side drafts disabled.');
  assert(scorecard.scope?.messages_or_posts === false, 'Scorecard must keep messages and posts disabled.');
  assert(scorecard.scope?.publishing_or_deployment === false, 'Scorecard must keep publishing and deployment disabled.');
  assert(scorecard.scope?.spend_or_purchase === false, 'Scorecard must keep spend and purchases disabled.');
  assert(scorecard.scope?.crm_or_account_mutation === false, 'Scorecard must keep CRM and account mutation disabled.');
  assert(scorecard.scope?.scheduled_or_external_runtime === false, 'Scorecard must keep scheduled and external runtime disabled.');
  assert(scorecard.legal_posture?.roles_are_legal_employees === false, 'Internal seats must not be represented as legal employees.');
  assert(scorecard.legal_posture?.roles_can_bind_company === false, 'Internal seats must not be able to bind the company.');
}

function findLatestAgencyReceipt(repoRoot) {
  const runsRoot = path.join(repoRoot, 'automation', 'immohrtal-agency', 'runs');
  if (!fs.existsSync(runsRoot)) return null;
  const receipts = [];
  for (const entry of fs.readdirSync(runsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const receiptPath = path.join(runsRoot, entry.name, 'run-receipt.json');
    if (!fs.existsSync(receiptPath)) continue;
    try {
      const receipt = readJson(receiptPath, `Agency receipt ${entry.name}`);
      receipts.push({ receiptPath, receipt, observed: Date.parse(receipt.as_of || '') || fs.statSync(receiptPath).mtimeMs });
    } catch {
      // A malformed run is not selected as current evidence. The office report
      // still exposes that no usable receipt was found instead of guessing.
    }
  }
  return receipts.sort((left, right) => right.observed - left.observed)[0] || null;
}

function statusCounts(items, allowedStates) {
  const counts = Object.fromEntries(allowedStates.map((state) => [state, 0]));
  for (const item of items) counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}

function deriveRoleWorkState(assignments) {
  const states = new Set(assignments.map((item) => item.status));
  if (!assignments.length) return 'IDLE_WITH_REASON';
  if (states.has('FAILED_QA')) return 'FAILED_QA';
  if (states.has('BLOCKED')) return 'HAS_BLOCKED_WORK';
  if (states.has('WAITING_APPROVAL')) return 'WAITING_APPROVAL';
  if (states.has('IN_PROGRESS')) return 'IN_PROGRESS_RECORDED';
  if (states.has('READY_FOR_REVIEW')) return 'READY_FOR_REVIEW';
  if (states.has('ASSIGNED')) return 'ASSIGNED';
  if (states.has('TRIAGED') || states.has('INBOX')) return 'NOT_YET_ASSIGNED';
  if ([...states].every((state) => state === 'DONE' || state === 'VERIFIED')) return 'VERIFIED_OR_DONE';
  if ([...states].every((state) => state === 'DEFERRED' || state === 'CANCELLED')) return 'DEFERRED_OR_CANCELLED';
  return 'MIXED_RECORDED_STATE';
}

function buildRosterState(crew, items) {
  return crew.roster.map((role) => {
    const assignments = items.filter((item) => item.owner_role_id === role.role_id);
    return {
      role_id: role.role_id,
      title: role.title,
      kind: role.kind,
      reports_to: role.reports_to,
      coverage: role.coverage,
      work_state: deriveRoleWorkState(assignments),
      board_assignments: assignments.map((item) => ({
        item_id: item.item_id,
        status: item.status,
        due_at: item.due_at,
        blocker: item.blocker,
        next_action: item.next_action
      })),
      runtime_state: 'NOT_OBSERVED',
      online_claim: false,
      runtime_truth: 'Board state records work control and provides no active process or agent heartbeat evidence.'
    };
  });
}

function buildCommercialTruth(scorecard) {
  const outcomes = scorecard.kpis?.workflow_outcomes || {};
  const current = scorecard.current_evidence || {};
  const values = Object.fromEntries(INTERNAL_EXTERNAL_ACTION_KEYS.map((key) => [key, Number(outcomes[key] ?? current[key] ?? 0)]));
  return {
    prepared_candidate_records: Number(current.prepared_candidate_records ?? 0),
    legacy_prepared_candidate_records_excluded: Number(current.legacy_prepared_candidate_records_excluded ?? 0),
    authorized_company_source_rows: Number(current.authorized_company_source_rows ?? 0),
    researched_today: Number(current.researched_today ?? 0),
    identity_confirmed_today: Number(current.identity_confirmed_today ?? 0),
    identity_blocked_today: Number(current.identity_blocked_today ?? 0),
    qualified_today: Number(current.qualified_today ?? 0),
    priority_draft_only_rows: Number(current.priority_draft_only_rows ?? 0),
    gmail_drafts_created: Number(current.gmail_drafts_created ?? 0),
    gmail_drafts_directly_read_back: Number(current.gmail_drafts_directly_read_back ?? 0),
    gmail_drafts_compliance_blocked: Number(current.gmail_drafts_compliance_blocked ?? 0),
    owner_status_updates_sent: Number(current.owner_status_updates_sent ?? 0),
    ...values,
    truth_note: current.truth_note || 'Preparation counts do not prove commercial outcomes.'
  };
}

function buildAgencyEvidence(repoRoot, selected, scorecard) {
  if (!selected) {
    return {
      available: false,
      truth_state: 'unknown',
      does_not_prove: 'No usable agency run receipt was found. This does not mean the agency crew is running or idle.'
    };
  }
  const receipt = selected.receipt;
  const excludedLegacySource = scorecard.current_evidence?.source_run_status === 'historical_complete_excluded_source'
    && receipt.run_id === scorecard.current_evidence?.source_run_id;
  return {
    available: true,
    locator: toLocator(repoRoot, selected.receiptPath),
    run_id: receipt.run_id || null,
    as_of: receipt.as_of || null,
    status: receipt.status || 'unknown',
    mode: receipt.mode || 'unknown',
    counts: receipt.counts || {},
    evidence: receipt.evidence || {},
    approval: receipt.approval || {},
    external_actions: receipt.external_actions || {},
    source_authority_state: excludedLegacySource ? 'legacy_excluded_source' : 'not_reconciled_by_office_report',
    truth_state: excludedLegacySource
      ? 'confirmed_historical_legacy_excluded_source'
      : receipt.status === 'complete' ? 'confirmed_historical_run_receipt' : 'provisional_run_receipt',
    does_not_prove: excludedLegacySource
      ? 'This historical receipt used an excluded source. It proves only that the old local run completed; it contributes zero active pipeline records and does not prove the five internal office seats are online.'
      : 'This prospect-preparation receipt does not prove the five internal office seats are online or continuously running.'
  };
}

function externalScopeExceptions(commercialTruth, agencyEvidence) {
  const exceptions = [];
  const nonzeroCommercial = INTERNAL_EXTERNAL_ACTION_KEYS
    .filter((key) => Number(commercialTruth[key] || 0) !== 0)
    .map((key) => ({ key, value: commercialTruth[key] }));
  if (nonzeroCommercial.length) {
    exceptions.push({
      code: 'NONZERO_WORKFLOW_OUTCOME_REQUIRES_RECONCILIATION',
      severity: 'stop_and_verify',
      details: nonzeroCommercial,
      next_action: 'Codex Marketing Chief verifies the exact source and authority before any board advancement.'
    });
  }
  const nonzeroAgencyActions = Object.entries(agencyEvidence.external_actions || {})
    .filter(([, value]) => Number(value || 0) !== 0)
    .map(([key, value]) => ({ key, value }));
  if (nonzeroAgencyActions.length) {
    exceptions.push({
      code: 'AGENCY_RECEIPT_RECORDS_EXTERNAL_ACTION',
      severity: 'stop_and_verify',
      details: nonzeroAgencyActions,
      next_action: 'Stop the office loop and reconcile the action receipt with exact approval evidence.'
    });
  }
  return exceptions;
}

function deriveDateEt(asOf) {
  const parsed = new Date(asOf);
  assert(!Number.isNaN(parsed.valueOf()), `Invalid --as-of timestamp: ${asOf}.`);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(parsed);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function buildOfficeSnapshot(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPO_ROOT);
  const mode = options.mode || 'both';
  assert(ALLOWED_REPORT_MODES.has(mode), `Invalid report mode ${mode}.`);
  const asOf = options.asOf || new Date().toISOString();
  const dateEt = deriveDateEt(asOf);

  const crewPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.crew.split('/'));
  const boardPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.board.split('/'));
  const scorecardPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.scorecard.split('/'));
  const generatorPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.generator.split('/'));
  const cliPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.cli.split('/'));
  const wrapperPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.wrapper.split('/'));
  const scheduleManifestPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.scheduleManifest.split('/'));
  for (const [label, filePath] of Object.entries({
    crew: crewPath,
    board: boardPath,
    scorecard: scorecardPath,
    generator: generatorPath,
    cli: cliPath,
    wrapper: wrapperPath,
    scheduleManifest: scheduleManifestPath
  })) {
    assert(fs.existsSync(filePath), `Required office ${label} source is missing: ${toLocator(repoRoot, filePath)}.`);
  }

  const crew = readJson(crewPath, 'Crew roster');
  const boardMarkdown = readText(boardPath);
  const scorecard = readJson(scorecardPath, 'Day 1 scorecard');
  validateCrew(crew);
  const items = parseCommandBoard(boardMarkdown, crew.board.required_fields);
  validateBoard(items, crew);
  validateScorecard(scorecard, crew);

  let selectedAgencyReceipt = null;
  if (options.agencyReceiptPath) {
    const receiptPath = path.resolve(options.agencyReceiptPath);
    assert(fs.existsSync(receiptPath), `Explicit agency receipt is missing: ${receiptPath}.`);
    selectedAgencyReceipt = { receiptPath, receipt: readJson(receiptPath, 'Agency run receipt') };
  } else if (options.includeLatestAgencyReceipt !== false) {
    selectedAgencyReceipt = findLatestAgencyReceipt(repoRoot);
  }

  const allStates = [...crew.board.primary_states, ...crew.board.exception_states];
  const counts = statusCounts(items, allStates);
  const blockingItems = items
    .filter((item) => BLOCKING_STATES.has(item.status))
    .map((item) => ({
      item_id: item.item_id,
      owner_role_id: item.owner_role_id,
      status: item.status,
      blocker: item.blocker,
      next_action: item.next_action
    }));
  const roster = buildRosterState(crew, items);
  const commercialTruth = buildCommercialTruth(scorecard);
  const agencyEvidence = buildAgencyEvidence(repoRoot, selectedAgencyReceipt, scorecard);
  const scopeExceptions = externalScopeExceptions(commercialTruth, agencyEvidence);
  const activeItems = items.filter((item) => BOARD_ACTIVE_STATES.has(item.status));
  const lifecycleState = scopeExceptions.length
    ? 'BLOCKED_SCOPE_RECONCILIATION_REQUIRED'
    : blockingItems.length
      ? 'CONFIGURED_WITH_RECORDED_BLOCKERS'
      : 'CONFIGURED';

  const evidence = [
    sourceEvidence(repoRoot, crewPath, 'machine_readable_roster'),
    sourceEvidence(repoRoot, boardPath, 'command_board'),
    sourceEvidence(repoRoot, scorecardPath, 'machine_readable_scorecard'),
    sourceEvidence(repoRoot, generatorPath, 'report_generator'),
    sourceEvidence(repoRoot, cliPath, 'report_cli'),
    sourceEvidence(repoRoot, wrapperPath, 'powershell_entrypoint'),
    sourceEvidence(repoRoot, scheduleManifestPath, 'manifest_only_schedule_contract')
  ];
  if (selectedAgencyReceipt) evidence.push(sourceEvidence(repoRoot, selectedAgencyReceipt.receiptPath, 'agency_run_receipt'));

  const objective = extractMarkdownSection(boardMarkdown, 'Day 1 objective') || 'Use the current command board objective.';
  const completedItems = items
    .filter((item) => item.status === 'VERIFIED' || item.status === 'DONE')
    .map((item) => ({ item_id: item.item_id, status: item.status, artifact_locator: item.artifact_locator }));
  const qaItems = items
    .filter((item) => item.owner_role_id === 'quality_risk_auditor')
    .map((item) => ({ item_id: item.item_id, status: item.status, blocker: item.blocker }));
  const codexHeartbeat = scorecard.office_reporting?.codex_heartbeat || {};

  const snapshot = {
    schema_version: '1.0.0',
    report_type: 'immohrtal_office_daily_state',
    workflow_id: crew.workflow_id,
    business: crew.business,
    owner: crew.owner,
    orchestrator: crew.orchestrator,
    as_of: asOf,
    date_et: dateEt,
    timezone: 'America/New_York',
    report_mode: mode,
    dry_run: true,
    office_lifecycle: {
      build_state: 'BUILT',
      configuration_state: 'CONFIGURED',
      current_state: lifecycleState,
      current_invocation_state: 'COMPLETED_LOCAL_DRY_RUN',
      background_runtime_state: 'NOT_VERIFIED_RUNNING',
      schedule_state: 'NOT_INSTALLED_OR_CHANGED_BY_THIS_RUNNER',
      codex_heartbeat_state: String(codexHeartbeat.status || 'unknown').toUpperCase(),
      codex_heartbeat_id: codexHeartbeat.id || null,
      codex_heartbeat_cadence: codexHeartbeat.cadence || null,
      codex_heartbeat_verified_at: codexHeartbeat.verified_at || null,
      codex_heartbeat_truth: codexHeartbeat.truth_rule || 'No separate Codex heartbeat evidence was supplied.',
      truth: 'This receipt proves one local report invocation. It does not prove persistent agents, a background service, or a scheduled task.'
    },
    roster,
    responsibility_authority: {
      internal_allowed: crew.authority.internally_allowed,
      prohibited_without_separate_exact_authority: crew.authority.prohibited_without_separate_exact_authority,
      legal_employee_claim: false,
      company_binding_authority: false,
      external_runtime_authority: false
    },
    board: {
      total_items: items.length,
      active_items: activeItems.length,
      status_counts: counts,
      blocking_items: blockingItems,
      completed_or_verified_items: completedItems
    },
    standup: {
      included: mode === 'standup' || mode === 'both',
      objective,
      required_truth: [
        'offer and segment or unknown',
        'source observation times',
        'assigned work and exact ownership',
        'blocked work and approvals',
        'capacity',
        'commercial zero baseline'
      ],
      assignments: roster.map((role) => ({
        role_id: role.role_id,
        work_state: role.work_state,
        item_ids: role.board_assignments.map((item) => item.item_id),
        runtime_state: role.runtime_state
      })),
      blockers: blockingItems,
      commercial_truth: commercialTruth
    },
    end_of_day: {
      included: mode === 'eod' || mode === 'both',
      board_status_counts: counts,
      completed_or_verified_items: completedItems,
      quality_receipts: qaItems,
      commercial_truth: commercialTruth,
      blockers: blockingItems,
      next_actions: blockingItems.map((item) => ({ owner_role_id: item.owner_role_id, item_id: item.item_id, next_action: item.next_action })),
      process_correction: blockingItems.length
        ? 'Resolve exact blockers and collect required evidence before stage advancement.'
        : 'No blocker-derived process correction was generated.'
    },
    agency_run_evidence: agencyEvidence,
    exceptions: scopeExceptions,
    external_actions_performed_by_report_loop: {
      messages_or_posts: 0,
      provider_side_drafts: 0,
      calendar_writes: 0,
      crm_or_account_writes: 0,
      publishing_or_deployment: 0,
      spend_or_purchase: 0,
      schedule_changes: 0,
      credential_accesses: 0
    },
    privacy: {
      raw_communications_included: false,
      secrets_included: false,
      contact_rows_included: false,
      evidence_is_aggregate_or_locator_only: true
    },
    source_evidence: evidence
  };

  snapshot.input_fingerprint = sha256(canonicalJson({
    as_of: snapshot.as_of,
    report_mode: snapshot.report_mode,
    source_evidence: snapshot.source_evidence,
    workflow_id: snapshot.workflow_id
  }));
  return snapshot;
}

function markdownTable(headers, rows) {
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
  return [
    `| ${headers.map(escape).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escape).join(' | ')} |`)
  ].join('\n');
}

export function renderOfficeMarkdown(snapshot) {
  const statusRows = [
    ['Office artifacts', snapshot.office_lifecycle.build_state, 'Roster, board, contract, runner, and receipt schema exist'],
    ['Office configuration', snapshot.office_lifecycle.configuration_state, 'Crew, board, and scorecard parsed and passed invariants'],
    ['This invocation', snapshot.office_lifecycle.current_invocation_state, snapshot.as_of],
    ['Background runtime', snapshot.office_lifecycle.background_runtime_state, 'No heartbeat or persistent process receipt supplied'],
    ['Daily Codex heartbeat', snapshot.office_lifecycle.codex_heartbeat_state, `${snapshot.office_lifecycle.codex_heartbeat_id || 'not supplied'} · ${snapshot.office_lifecycle.codex_heartbeat_cadence || 'cadence unknown'}`],
    ['Office manifest', snapshot.office_lifecycle.schedule_state, 'Manifest only; no task installation or change']
  ];
  const rosterRows = snapshot.roster.map((role) => [
    role.title,
    role.kind,
    role.work_state,
    role.runtime_state,
    role.board_assignments.map((item) => `${item.item_id}:${item.status}`).join(', ') || 'none'
  ]);
  const boardRows = Object.entries(snapshot.board.status_counts)
    .filter(([, count]) => count > 0)
    .map(([state, count]) => [state, count]);
  const blockerRows = snapshot.board.blocking_items.length
    ? snapshot.board.blocking_items.map((item) => [item.item_id, item.owner_role_id, item.status, item.blocker, item.next_action])
    : [['none', 'none', 'none', 'No recorded blocking item', 'Continue the verified board flow']];
  const commercial = snapshot.standup.commercial_truth;
  const commercialRows = [
    ['Active prepared candidate records', commercial.prepared_candidate_records],
    ['Legacy prepared records excluded', commercial.legacy_prepared_candidate_records_excluded],
    ['Authorized company source rows', commercial.authorized_company_source_rows],
    ['Companies researched today', commercial.researched_today],
    ['Current identities confirmed today', commercial.identity_confirmed_today],
    ['Identities blocked today', commercial.identity_blocked_today],
    ['Qualified today', commercial.qualified_today],
    ['Priority draft-only rows', commercial.priority_draft_only_rows],
    ['Gmail drafts created', commercial.gmail_drafts_created],
    ['Gmail drafts directly read back', commercial.gmail_drafts_directly_read_back],
    ['Gmail drafts on compliance hold', commercial.gmail_drafts_compliance_blocked],
    ['Prospect messages sent', commercial.messages_sent],
    ['Internal owner status updates sent', commercial.owner_status_updates_sent],
    ['Replies', commercial.replies],
    ['Meetings booked', commercial.meetings_booked],
    ['Proposals sent', commercial.proposals_sent],
    ['Closed won', commercial.closed_won],
    ['Active IMMOHRTAL clients', commercial.active_clients],
    ['Verified new workflow revenue USD', commercial.verified_new_revenue_usd],
    ['New hires or purchases', commercial.new_hires_or_purchases]
  ];
  const evidenceRows = snapshot.source_evidence.map((item) => [item.kind, item.locator, item.sha256]);

  const sections = [
    `# IMMOHRTAL office daily report - ${snapshot.date_et}`,
    '',
    `Report mode: \`${snapshot.report_mode}\`. Truth state: \`${snapshot.office_lifecycle.current_state}\`.`,
    '',
    '> This local dry-run receipt proves one completed report invocation. It does not prove that any seat is online, continuously running, or installed as a scheduled task.',
    '',
    '## Office status',
    '',
    markdownTable(['Surface', 'State', 'Evidence boundary'], statusRows),
    '',
    '## Employee seat roster',
    '',
    'These are internal Codex job seats. They are not legal employees and cannot bind IMMOHRTAL.',
    '',
    markdownTable(['Seat', 'Type', 'Board work state', 'Runtime state', 'Assigned items'], rosterRows),
    '',
    '## Current board',
    '',
    `Total items: ${snapshot.board.total_items}. Active items: ${snapshot.board.active_items}.`,
    '',
    markdownTable(['State', 'Count'], boardRows),
    '',
    '## Exceptions and escalation',
    '',
    markdownTable(['Item', 'Owner', 'State', 'Exact blocker', 'Next action'], blockerRows),
    '',
    '## Commercial truth',
    '',
    markdownTable(['Fact', 'Verified value'], commercialRows),
    '',
    commercial.truth_note,
    ''
  ];

  if (snapshot.standup.included) {
    sections.push(
      '## Daily standup',
      '',
      snapshot.standup.objective,
      '',
      'Each seat reports its exact board items, recorded work state, blocker, next action, and runtime evidence state. `NOT_OBSERVED` must never be rewritten as online or working.',
      ''
    );
  }
  if (snapshot.end_of_day.included) {
    const completed = snapshot.end_of_day.completed_or_verified_items.length
      ? snapshot.end_of_day.completed_or_verified_items.map((item) => `- ${item.item_id}: ${item.status}; ${item.artifact_locator}`).join('\n')
      : '- No item is verified or done.';
    sections.push(
      '## End-of-day closeout',
      '',
      completed,
      '',
      `Process correction: ${snapshot.end_of_day.process_correction}`,
      ''
    );
  }

  sections.push(
    '## Source evidence',
    '',
    markdownTable(['Kind', 'Locator', 'SHA-256'], evidenceRows),
    '',
    '## External-action receipt',
    '',
    'Messages, provider-side drafts, calendar writes, CRM writes, publishing, deployment, spend, purchases, schedule changes, and credential access performed by this report loop: `0`.',
    ''
  );
  return `${sections.join('\n')}\n`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function statusTone(state) {
  if (/BLOCKED|FAILED|ATTENTION|WAITING/.test(state)) return 'attention';
  if (/VERIFIED|DONE|COMPLETE|CONFIGURED/.test(state)) return 'verified';
  if (/READY|ASSIGNED|IN_PROGRESS/.test(state)) return 'active';
  return 'neutral';
}

export function renderOfficeDashboard(snapshot) {
  const rosterRows = snapshot.roster.map((role, index) => {
    const assignmentRows = role.board_assignments.length
      ? role.board_assignments.map((item) => `
          <li class="assignment-row">
            <div class="assignment-id"><strong>${escapeHtml(item.item_id)}</strong><span class="status-chip ${statusTone(item.status)}">${escapeHtml(item.status)}</span></div>
            <div class="assignment-main"><p>${escapeHtml(item.next_action)}</p><dl><div><dt>Due</dt><dd>${escapeHtml(item.due_at)}</dd></div><div><dt>Blocker</dt><dd>${escapeHtml(item.blocker)}</dd></div></dl></div>
          </li>`).join('')
      : '<li class="assignment-empty">No board assignment is recorded. This seat is idle with reason.</li>';
    return `
      <article class="seat-row" aria-labelledby="seat-${escapeHtml(role.role_id)}">
        <header class="seat-identity">
          <span class="seat-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
          <div>
            <h2 id="seat-${escapeHtml(role.role_id)}">${escapeHtml(role.title)}</h2>
            <p>${escapeHtml(role.kind)} · reports to ${escapeHtml(role.reports_to)}</p>
          </div>
        </header>
        <div class="seat-state">
          <span class="status-chip ${statusTone(role.work_state)}">${escapeHtml(role.work_state)}</span>
          <span class="runtime-truth"><b>Runtime</b> ${escapeHtml(role.runtime_state)}</span>
          <p>${escapeHtml(role.runtime_truth)}</p>
        </div>
        <ol class="assignment-list" aria-label="Current assignments">${assignmentRows}</ol>
      </article>`;
  }).join('');

  const lifecycleRows = [
    ['Artifacts', snapshot.office_lifecycle.build_state, 'Roster, board, runner, and receipt contract'],
    ['Configuration', snapshot.office_lifecycle.configuration_state, 'Current sources parsed and validated'],
    ['This invocation', snapshot.office_lifecycle.current_invocation_state, snapshot.as_of],
    ['Background runtime', snapshot.office_lifecycle.background_runtime_state, 'No persistent heartbeat supplied'],
    ['Daily Codex heartbeat', snapshot.office_lifecycle.codex_heartbeat_state, `${snapshot.office_lifecycle.codex_heartbeat_id || 'not supplied'} · ${snapshot.office_lifecycle.codex_heartbeat_cadence || 'cadence unknown'}`],
    ['Office manifest', snapshot.office_lifecycle.schedule_state === 'NOT_INSTALLED_OR_CHANGED_BY_THIS_RUNNER' ? 'NOT_INSTALLED_OR_CHANGED' : snapshot.office_lifecycle.schedule_state, 'No installation or task change']
  ].map(([label, state, detail]) => `
      <li><span>${escapeHtml(label)}</span><strong class="${statusTone(state)}-text">${escapeHtml(state)}</strong><small>${escapeHtml(detail)}</small></li>`).join('');

  const boardBars = Object.entries(snapshot.board.status_counts)
    .filter(([, count]) => count > 0)
    .map(([state, count]) => `
      <div class="board-count"><span>${escapeHtml(state)}</span><strong>${escapeHtml(count)}</strong></div>`).join('');

  const blockerRows = snapshot.board.blocking_items.length
    ? snapshot.board.blocking_items.map((item) => `
      <tr><td><strong>${escapeHtml(item.item_id)}</strong><span>${escapeHtml(item.status)}</span></td><td>${escapeHtml(item.blocker)}</td><td>${escapeHtml(item.next_action)}</td></tr>`).join('')
    : '<tr><td><strong>None</strong></td><td>No recorded blockers.</td><td>Continue the verified board flow.</td></tr>';

  const completedRows = snapshot.end_of_day.completed_or_verified_items.length
    ? snapshot.end_of_day.completed_or_verified_items.map((item) => `
      <li><strong>${escapeHtml(item.item_id)}</strong><span>${escapeHtml(item.status)}</span><p>${escapeHtml(item.artifact_locator)}</p></li>`).join('')
    : '<li><strong>None</strong><span>NO VERIFIED ITEM</span><p>No completed artifact is recorded.</p></li>';

  const commercial = snapshot.end_of_day.commercial_truth;
  const agency = snapshot.agency_run_evidence;
  const legacyAgencyEvidence = agency.source_authority_state === 'legacy_excluded_source';
  const agencyEvidence = agency.available
    ? `<dl class="receipt-ledger">
        <div><dt>Run</dt><dd>${escapeHtml(agency.run_id)}</dd></div>
        <div><dt>Observed</dt><dd>${escapeHtml(agency.as_of)}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(agency.status)}</dd></div>
        <div><dt>${legacyAgencyEvidence ? 'Legacy prepared' : 'Prepared'}</dt><dd>${escapeHtml(agency.counts?.total ?? 'unknown')}</dd></div>
        <div><dt>${legacyAgencyEvidence ? 'Legacy awaiting' : 'Awaiting approval'}</dt><dd>${escapeHtml(agency.counts?.awaiting_approval ?? 'unknown')}</dd></div>
        <div><dt>External actions</dt><dd>${Object.values(agency.external_actions || {}).every((value) => Number(value || 0) === 0) ? '0' : 'VERIFY'}</dd></div>
      </dl>`
    : '<p class="empty-copy">No usable agency run receipt was found.</p>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <meta name="color-scheme" content="dark">
  <title>IMMOHRTAL Office · ${escapeHtml(snapshot.date_et)}</title>
  <style>
    :root{color-scheme:dark;--ink:#020711;--observatory:#07101f;--raised:#0b1729;--paper:#f3f7fb;--platinum:#dce4ed;--muted:#a7bbd1;--cyan:#18c8ff;--mint:#58edb2;--cobalt:#287dff;--attention:#ffc56e;--danger:#ff8d8d;--line:rgba(166,204,240,.22);--line-strong:rgba(181,218,250,.42);--body:"Segoe UI Variable","Segoe UI",Arial,sans-serif;--mono:"Cascadia Mono","SFMono-Regular",Consolas,monospace;--max:1480px}
    *{box-sizing:border-box}html{min-width:320px;background:var(--ink);scroll-behavior:smooth}body{margin:0;background:var(--ink);color:var(--paper);font:400 1rem/1.55 var(--body);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}a{color:inherit}h1,h2,h3,p{margin-top:0}:focus-visible{outline:3px solid var(--mint);outline-offset:4px}.skip-link{position:fixed;z-index:20;top:12px;left:12px;transform:translateY(-160%);padding:10px 14px;border-radius:10px;background:var(--paper);color:var(--ink)}.skip-link:focus{transform:none}
    .shell{width:min(100% - 40px,var(--max));margin:0 auto}.masthead{padding:54px 0 38px;border-bottom:1px solid var(--line)}.masthead-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.7fr);gap:70px;align-items:end}.masthead-grid>*{min-width:0}.brand-lockup{display:flex;align-items:center;gap:14px;margin-bottom:28px;color:var(--muted);font:600 .72rem/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase}.brand-mark{flex:0 0 auto;width:18px;height:18px;border:1px solid var(--cyan);border-radius:50%;box-shadow:inset 0 0 0 4px var(--ink),inset 0 0 0 6px var(--mint)}h1{max-width:16ch;margin-bottom:14px;font-size:clamp(2.25rem,5vw,5rem);font-weight:760;line-height:.98;letter-spacing:-.04em;text-wrap:balance}.masthead-copy{max-width:66ch;margin:0;color:var(--muted);font-size:1.05rem}.truth-plate{align-self:stretch;display:flex;flex-direction:column;justify-content:flex-end;padding:28px;border:1px solid var(--line-strong);border-radius:14px;background:var(--raised);box-shadow:0 24px 64px rgba(0,0,0,.3)}.truth-plate strong{display:block;margin-bottom:8px;color:var(--mint);font:650 .72rem/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase}.truth-plate p{margin:0;color:var(--platinum)}
    .lifecycle{padding:24px 0 70px}.lifecycle-list{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));margin:0;padding:0;border-bottom:1px solid var(--line);list-style:none}.lifecycle-list li{min-width:0;padding:22px 20px 24px 0;border-top:1px solid var(--line)}.lifecycle-list li+li{padding-left:20px;border-left:1px solid var(--line)}.lifecycle-list span,.lifecycle-list small{display:block;color:var(--muted)}.lifecycle-list span{margin-bottom:8px;font-size:.78rem}.lifecycle-list strong{display:block;overflow-wrap:anywhere;font:600 .72rem/1.4 var(--mono)}.lifecycle-list small{margin-top:8px;font-size:.74rem;line-height:1.45}.verified-text{color:var(--mint)!important}.attention-text{color:var(--attention)!important}.active-text{color:var(--cyan)!important}.neutral-text{color:var(--muted)!important}
    .section-head{display:grid;grid-template-columns:minmax(250px,.75fr) minmax(0,1.25fr);gap:70px;align-items:end;margin-bottom:34px}.section-head h2{margin:0;font-size:clamp(1.8rem,3vw,3rem);line-height:1.05;letter-spacing:-.035em}.section-head p{max-width:66ch;margin:0;color:var(--muted)}.roster{padding:52px 0 100px}.seat-row{display:grid;grid-template-columns:minmax(250px,.78fr) minmax(250px,.55fr) minmax(0,1.35fr);gap:38px;padding:34px 0 38px;border-top:1px solid var(--line)}.seat-row:last-child{border-bottom:1px solid var(--line)}.seat-identity{display:flex;gap:18px;align-items:flex-start}.seat-index{padding-top:5px;color:var(--cyan);font:600 .7rem/1 var(--mono)}.seat-identity h2{max-width:18ch;margin-bottom:9px;font-size:1.22rem;line-height:1.2;letter-spacing:-.025em}.seat-identity p{margin:0;color:var(--muted);font-size:.78rem}.seat-state{align-self:start}.seat-state>p{margin:15px 0 0;color:var(--muted);font-size:.78rem;line-height:1.55}.runtime-truth{display:block;margin-top:12px;color:var(--platinum);font-size:.78rem}.runtime-truth b{margin-right:7px;color:var(--muted);font:500 .66rem/1 var(--mono);letter-spacing:.06em;text-transform:uppercase}.status-chip{display:inline-flex;width:max-content;max-width:100%;padding:6px 9px;border:1px solid var(--line-strong);border-radius:999px;font:600 .64rem/1.2 var(--mono);letter-spacing:.04em;overflow-wrap:anywhere}.status-chip.verified{border-color:rgba(88,237,178,.48);color:var(--mint)}.status-chip.active{border-color:rgba(24,200,255,.5);color:var(--cyan)}.status-chip.attention{border-color:rgba(255,197,110,.52);color:var(--attention)}.status-chip.neutral{color:var(--muted)}.assignment-list{margin:0;padding:0;list-style:none}.assignment-row{display:grid;grid-template-columns:145px minmax(0,1fr);gap:22px;padding:0 0 22px}.assignment-row+.assignment-row{padding-top:22px;border-top:1px solid var(--line)}.assignment-id{display:flex;flex-direction:column;align-items:flex-start;gap:10px}.assignment-id strong{font:650 .78rem/1.2 var(--mono)}.assignment-main p{margin:0 0 15px;color:var(--platinum);font-size:.88rem}.assignment-main dl{display:grid;grid-template-columns:minmax(120px,.35fr) minmax(0,1fr);gap:16px;margin:0}.assignment-main dl>div{min-width:0}.assignment-main dt{margin-bottom:5px;color:var(--muted);font:500 .62rem/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase}.assignment-main dd{margin:0;color:var(--muted);font-size:.76rem;line-height:1.5}.assignment-empty{color:var(--muted);font-size:.84rem}
    .control-floor{padding:96px 0;background:var(--observatory);border-block:1px solid var(--line)}.board-grid{display:grid;grid-template-columns:minmax(260px,.62fr) minmax(0,1.38fr);gap:72px;align-items:start}.board-counts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--line)}.board-count{display:flex;align-items:baseline;justify-content:space-between;gap:18px;padding:18px 0;border-bottom:1px solid var(--line)}.board-count:nth-child(odd){padding-right:18px}.board-count:nth-child(even){padding-left:18px;border-left:1px solid var(--line)}.board-count span{color:var(--muted);font:500 .65rem/1.3 var(--mono);overflow-wrap:anywhere}.board-count strong{font-size:1.55rem}.ledger-table{width:100%;border-collapse:collapse}.ledger-table th,.ledger-table td{padding:16px 14px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}.ledger-table th{color:var(--muted);font:500 .64rem/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase}.ledger-table td{color:var(--muted);font-size:.8rem;line-height:1.5}.ledger-table td:first-child{width:120px;color:var(--paper)}.ledger-table td strong,.ledger-table td span{display:block}.ledger-table td span{margin-top:5px;color:var(--attention);font:500 .62rem/1.2 var(--mono)}
    .closeout{padding:100px 0}.closeout-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:80px}.completed-list{margin:28px 0 0;padding:0;border-top:1px solid var(--line);list-style:none}.completed-list li{display:grid;grid-template-columns:90px 130px minmax(0,1fr);gap:18px;padding:18px 0;border-bottom:1px solid var(--line);align-items:start}.completed-list strong{font:650 .74rem/1.4 var(--mono)}.completed-list span{color:var(--mint);font:500 .62rem/1.4 var(--mono)}.completed-list p{margin:0;color:var(--muted);font-size:.8rem;overflow-wrap:anywhere}.receipt-panel{padding:28px;border-radius:14px;background:var(--raised);box-shadow:0 26px 70px rgba(0,0,0,.32)}.receipt-panel h2{margin-bottom:12px;font-size:1.25rem}.receipt-panel>p{color:var(--muted);font-size:.82rem}.receipt-ledger{margin:22px 0 0}.receipt-ledger>div{display:flex;justify-content:space-between;gap:24px;padding:11px 0;border-top:1px solid var(--line)}.receipt-ledger dt{color:var(--muted);font-size:.72rem}.receipt-ledger dd{margin:0;text-align:right;font:600 .7rem/1.35 var(--mono);overflow-wrap:anywhere}.outcome-line{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin-top:70px;border-block:1px solid var(--line)}.outcome-line div{padding:22px 18px}.outcome-line div+div{border-left:1px solid var(--line)}.outcome-line div:nth-child(5n+1){border-left:0}.outcome-line div:nth-child(n+6){border-top:1px solid var(--line)}.outcome-line span{display:block;color:var(--muted);font-size:.7rem}.outcome-line strong{display:block;margin-top:7px;font-size:1.5rem}.footer{padding:32px 0 50px;border-top:1px solid var(--line);color:var(--muted);font-size:.76rem}.footer p{max-width:90ch;margin:0}.empty-copy{color:var(--muted)}
    @media(max-width:1100px){.masthead-grid,.section-head,.board-grid,.closeout-grid{grid-template-columns:1fr;gap:34px}.lifecycle-list{grid-template-columns:repeat(2,minmax(0,1fr))}.lifecycle-list li:nth-child(odd){padding-left:0;border-left:0}.lifecycle-list li:nth-child(even){padding-left:20px;border-left:1px solid var(--line)}.seat-row{grid-template-columns:minmax(230px,.75fr) minmax(0,1.25fr)}.seat-state{grid-column:1}.assignment-list{grid-column:2;grid-row:1/span 2}.outcome-line{grid-template-columns:repeat(2,minmax(0,1fr))}.outcome-line div:nth-child(odd){border-left:0}.outcome-line div:nth-child(n+3){border-top:1px solid var(--line)}}
    @media(max-width:720px){.shell{width:min(100% - 28px,var(--max))}.masthead{padding-top:34px}.masthead-grid{gap:28px}.brand-lockup{align-items:flex-start;flex-wrap:wrap;overflow-wrap:anywhere}.truth-plate{padding:22px}.lifecycle{padding-bottom:48px}.lifecycle-list{display:block}.lifecycle-list li,.lifecycle-list li+li,.lifecycle-list li:nth-child(even){padding:18px 0;border-left:0}.roster{padding:30px 0 72px}.section-head{margin-bottom:20px}.seat-row{display:block;padding:28px 0}.seat-state{margin:22px 0 28px}.assignment-row{grid-template-columns:1fr}.assignment-id{flex-direction:row;align-items:center}.assignment-main dl{grid-template-columns:1fr}.control-floor,.closeout{padding:72px 0}.board-counts{display:block}.board-count,.board-count:nth-child(even),.board-count:nth-child(odd){padding:16px 0;border-left:0}.ledger-wrap{overflow-x:auto}.ledger-table{min-width:720px}.completed-list li{grid-template-columns:72px minmax(0,1fr)}.completed-list p{grid-column:1/-1}.outcome-line{display:block}.outcome-line div,.outcome-line div+div{border-top:1px solid var(--line);border-left:0}.outcome-line div:first-child{border-top:0}}
    @media print{body{background:#fff;color:#111}.masthead,.control-floor{background:#fff}.truth-plate,.receipt-panel{border:1px solid #999;background:#fff;box-shadow:none}.masthead-copy,.section-head p,.seat-identity p,.seat-state>p,.assignment-main dd,.ledger-table td,.completed-list p,.receipt-panel>p,.footer{color:#333}.lifecycle-list,.seat-row,.seat-row:last-child,.control-floor,.completed-list,.completed-list li,.ledger-table th,.ledger-table td,.footer{border-color:#aaa}.status-chip{color:#111!important;border-color:#777}.shell{width:100%}}
  </style>
</head>
<body>
  <!--
  THESIS: A real office is a control ledger of assignments, evidence, and exceptions, not simulated employee motion.
  OWN-WORLD: IMMOHRTAL space ink, gunmetal, platinum, cyan, and mint in a restrained operating surface with station rows and receipt ledgers.
  STORY: Dillon sees what is built, what each seat owns, what is blocked, what evidence exists, and what closed today.
  FIRST VIEWPORT: Office truth and lifecycle states lead, followed by five accountable seat stations; no decorative activity indicator appears.
  FORM: Established IMMOHRTAL control-ledger extension in Operate mode; direction seed not required for this narrow established-world surface.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
  -->
  <a class="skip-link" href="#office-roster">Skip to employee seats</a>
  <header class="masthead">
    <div class="shell masthead-grid">
      <div>
        <div class="brand-lockup"><span class="brand-mark" aria-hidden="true"></span>IMMOHRTAL Marketing Solutions · Internal office</div>
        <h1>Work truth, without theater.</h1>
        <p class="masthead-copy">Five accountable Codex job seats, one command board, and a dated evidence receipt. This private local view reports recorded work only.</p>
      </div>
      <aside class="truth-plate" aria-label="Runtime truth">
        <strong>${escapeHtml(snapshot.office_lifecycle.current_state)}</strong>
        <p>${escapeHtml(snapshot.office_lifecycle.truth)}</p>
      </aside>
    </div>
  </header>
  <main>
    <section class="lifecycle" aria-labelledby="lifecycle-heading">
      <div class="shell">
        <h2 id="lifecycle-heading" hidden>Office lifecycle</h2>
        <ul class="lifecycle-list">${lifecycleRows}</ul>
      </div>
    </section>
    <section class="roster" id="office-roster" aria-labelledby="roster-heading">
      <div class="shell">
        <header class="section-head"><h2 id="roster-heading">The five-seat office</h2><p>Board state and runtime state are separate. A recorded assignment does not prove an agent is online. Each seat remains <strong>NOT_OBSERVED</strong> until a current process receipt exists.</p></header>
        ${rosterRows}
      </div>
    </section>
    <section class="control-floor" aria-labelledby="control-heading">
      <div class="shell">
        <header class="section-head"><h2 id="control-heading">Board and exceptions</h2><p>${escapeHtml(snapshot.board.total_items)} current items. ${escapeHtml(snapshot.board.active_items)} remain active. Exact blockers stay visible until their evidence or authority gate is resolved.</p></header>
        <div class="board-grid">
          <div class="board-counts">${boardBars}</div>
          <div class="ledger-wrap"><table class="ledger-table"><thead><tr><th>Item</th><th>Exact blocker</th><th>Required next action</th></tr></thead><tbody>${blockerRows}</tbody></table></div>
        </div>
      </div>
    </section>
    <section class="closeout" aria-labelledby="closeout-heading">
      <div class="shell">
        <header class="section-head"><h2 id="closeout-heading">Daily closeout</h2><p>${escapeHtml(snapshot.end_of_day.process_correction)}</p></header>
        <div class="closeout-grid">
          <div><h2>Verified or done</h2><ul class="completed-list">${completedRows}</ul></div>
          <aside class="receipt-panel"><h2>Latest agency evidence</h2><p>${escapeHtml(agency.does_not_prove)}</p>${agencyEvidence}</aside>
        </div>
        <div class="outcome-line" aria-label="Daily research and commercial outcomes"><div><span>Companies researched today</span><strong>${escapeHtml(commercial.researched_today)}</strong></div><div><span>Current identities confirmed today</span><strong>${escapeHtml(commercial.identity_confirmed_today)}</strong></div><div><span>Identities blocked today</span><strong>${escapeHtml(commercial.identity_blocked_today)}</strong></div><div><span>Qualified today</span><strong>${escapeHtml(commercial.qualified_today)}</strong></div><div><span>Drafts held</span><strong>${escapeHtml(commercial.gmail_drafts_compliance_blocked)}</strong></div><div><span>Prospect messages sent</span><strong>${escapeHtml(commercial.messages_sent)}</strong></div><div><span>Owner status updates sent</span><strong>${escapeHtml(commercial.owner_status_updates_sent)}</strong></div><div><span>Meetings booked</span><strong>${escapeHtml(commercial.meetings_booked)}</strong></div><div><span>Active IMMOHRTAL clients</span><strong>${escapeHtml(commercial.active_clients)}</strong></div><div><span>Closed won</span><strong>${escapeHtml(commercial.closed_won)}</strong></div><div><span>Verified new revenue</span><strong>$${escapeHtml(commercial.verified_new_revenue_usd)}</strong></div></div>
      </div>
    </section>
  </main>
  <footer class="footer"><div class="shell"><p>Generated ${escapeHtml(snapshot.as_of)} from hashed local roster, command-board, scorecard, and available run-receipt sources. This report invocation changed no messages, drafts, calendar events, CRM records, deployments, purchases, schedules, or credentials.</p></div></footer>
</body>
</html>\n`;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
}

export function writeOfficeRun(snapshot, options = {}) {
  const outputRoot = path.resolve(options.outputRoot || path.join(DEFAULT_REPO_ROOT, 'automation', 'immohrtal-agency', 'ops', 'receipts'));
  const runId = String(options.runId || '').trim();
  assert(/^[A-Za-z0-9][A-Za-z0-9._-]{5,79}$/.test(runId), 'Run ID must be 6 to 80 safe filename characters.');
  const runDir = path.join(outputRoot, snapshot.date_et, runId);
  const receiptPath = path.join(runDir, 'run-receipt.json');

  if (fs.existsSync(receiptPath)) {
    const existing = readJson(receiptPath, 'Existing office run receipt');
    assert(existing.input_fingerprint === snapshot.input_fingerprint, `Run ID collision at ${runDir}. Existing inputs do not match.`);
    const existingArtifacts = {
      office_report_json: path.join(runDir, 'office-report.json'),
      office_report_markdown: path.join(runDir, 'office-report.md'),
      office_dashboard_html: path.join(runDir, 'office-dashboard.html')
    };
    for (const [artifactName, artifactPath] of Object.entries(existingArtifacts)) {
      assert(fs.existsSync(artifactPath), `Reusable run ${runId} is missing ${artifactName}.`);
      const expectedHash = existing.artifact_sha256?.[artifactName];
      assert(/^[a-f0-9]{64}$/.test(expectedHash || ''), `Reusable run ${runId} has no valid hash for ${artifactName}.`);
      assert(sha256(fs.readFileSync(artifactPath)) === expectedHash, `Reusable run ${runId} failed artifact hash verification for ${artifactName}.`);
    }
    return {
      reused: true,
      runDir,
      receiptPath,
      reportJsonPath: path.join(runDir, 'office-report.json'),
      reportMarkdownPath: path.join(runDir, 'office-report.md'),
      dashboardPath: path.join(runDir, 'office-dashboard.html'),
      receipt: existing
    };
  }
  assert(!fs.existsSync(runDir), `Run directory already exists without a reusable receipt: ${runDir}.`);
  fs.mkdirSync(runDir, { recursive: true });

  const reportJsonPath = path.join(runDir, 'office-report.json');
  const reportMarkdownPath = path.join(runDir, 'office-report.md');
  const dashboardPath = path.join(runDir, 'office-dashboard.html');
  const reportJson = `${JSON.stringify(snapshot, null, 2)}\n`;
  const reportMarkdown = renderOfficeMarkdown(snapshot);
  const dashboard = renderOfficeDashboard(snapshot);
  fs.writeFileSync(reportJsonPath, reportJson, { encoding: 'utf8', flag: 'wx' });
  fs.writeFileSync(reportMarkdownPath, reportMarkdown, { encoding: 'utf8', flag: 'wx' });
  fs.writeFileSync(dashboardPath, dashboard, { encoding: 'utf8', flag: 'wx' });

  const receipt = {
    schema_version: '1.0.0',
    receipt_type: 'immohrtal_office_daily_report_run',
    run_id: runId,
    workflow_id: snapshot.workflow_id,
    as_of: snapshot.as_of,
    date_et: snapshot.date_et,
    mode: snapshot.report_mode,
    dry_run: true,
    status: 'complete',
    input_fingerprint: snapshot.input_fingerprint,
    office_lifecycle: snapshot.office_lifecycle,
    source_evidence: snapshot.source_evidence,
    artifacts: {
      office_report_json: 'office-report.json',
      office_report_markdown: 'office-report.md',
      office_dashboard_html: 'office-dashboard.html'
    },
    artifact_sha256: {
      office_report_json: sha256(reportJson),
      office_report_markdown: sha256(reportMarkdown),
      office_dashboard_html: sha256(dashboard)
    },
    board_summary: {
      total_items: snapshot.board.total_items,
      active_items: snapshot.board.active_items,
      blocking_items: snapshot.board.blocking_items.length,
      status_counts: snapshot.board.status_counts
    },
    roster_summary: snapshot.roster.map((role) => ({
      role_id: role.role_id,
      work_state: role.work_state,
      runtime_state: role.runtime_state,
      online_claim: role.online_claim
    })),
    agency_run_evidence: snapshot.agency_run_evidence,
    external_actions_performed: snapshot.external_actions_performed_by_report_loop,
    privacy: snapshot.privacy,
    truth: 'Complete means this local report run wrote and hashed its artifacts. It does not mean the office is background-running or any external action occurred.'
  };
  writeJson(receiptPath, receipt);
  return { reused: false, runDir, receiptPath, reportJsonPath, reportMarkdownPath, dashboardPath, receipt };
}

export function safeDefaultRunId(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}${get('month')}${get('day')}-${get('hour')}${get('minute')}${get('second')}-office`;
}
