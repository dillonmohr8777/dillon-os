import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLiveOfficeDashboard } from './live-office-dashboard.mjs';

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

const FLOOR_STATIONS = Object.freeze([
  { station_id: 'control', label: 'Control', short_label: 'CTRL', x: 50, y: 49, purpose: 'Dispatch, ownership, and operating control' },
  { station_id: 'research', label: 'Research', short_label: 'RSCH', x: 18, y: 24, purpose: 'Identity, source, and market evidence' },
  { station_id: 'revenue', label: 'Revenue', short_label: 'REV', x: 82, y: 24, purpose: 'Qualification, pipeline, and commercial movement' },
  { station_id: 'delivery', label: 'Delivery', short_label: 'DLV', x: 18, y: 76, purpose: 'Offer systems and client-ready fulfillment' },
  { station_id: 'qa', label: 'Quality', short_label: 'QA', x: 82, y: 76, purpose: 'Independent review and risk control' },
  { station_id: 'blocker', label: 'Blocker dock', short_label: 'HOLD', x: 50, y: 18, purpose: 'Exact evidence, authority, or compliance holds' },
  { station_id: 'evidence', label: 'Evidence', short_label: 'PROOF', x: 50, y: 82, purpose: 'Verified receipts and completed artifacts' }
]);

const ROLE_HOME_STATIONS = Object.freeze({
  operations_finance_controller: 'control',
  demand_intelligence_lead: 'research',
  revenue_pipeline_manager: 'revenue',
  delivery_client_success_lead: 'delivery',
  quality_risk_auditor: 'qa'
});

const FLOOR_STATUS_PRIORITY = Object.freeze({
  FAILED_QA: 0,
  BLOCKED: 1,
  WAITING_APPROVAL: 2,
  READY_FOR_REVIEW: 3,
  IN_PROGRESS: 4,
  ASSIGNED: 5,
  TRIAGED: 6,
  INBOX: 7,
  VERIFIED: 8,
  DONE: 9,
  DEFERRED: 10,
  CANCELLED: 11
});

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
  liveDashboard: 'automation/immohrtal-agency/ops/lib/live-office-dashboard.mjs',
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

function dominantFloorAssignment(assignments) {
  return [...assignments].sort((left, right) => {
    const priorityDifference = (FLOOR_STATUS_PRIORITY[left.status] ?? 99) - (FLOOR_STATUS_PRIORITY[right.status] ?? 99);
    if (priorityDifference !== 0) return priorityDifference;
    return Date.parse(right.updated_at) - Date.parse(left.updated_at);
  })[0] || null;
}

function floorStationFor(roleId, assignment) {
  if (!assignment) return ROLE_HOME_STATIONS[roleId] || 'control';
  if (BLOCKING_STATES.has(assignment.status)) return 'blocker';
  if (assignment.status === 'READY_FOR_REVIEW') return 'qa';
  if (assignment.status === 'VERIFIED' || assignment.status === 'DONE') return 'evidence';
  if (assignment.status === 'INBOX' || assignment.status === 'TRIAGED' || assignment.status === 'ASSIGNED') return 'control';
  return ROLE_HOME_STATIONS[roleId] || 'control';
}

function buildFloorState(roster, sourceStateFingerprint) {
  const targetCounts = new Map();
  const actors = roster.map((role, index) => {
    const dominantAssignment = dominantFloorAssignment(role.board_assignments);
    const targetStationId = floorStationFor(role.role_id, dominantAssignment);
    const stationSlot = targetCounts.get(targetStationId) || 0;
    targetCounts.set(targetStationId, stationSlot + 1);
    return {
      role_id: role.role_id,
      title: role.title,
      work_state: role.work_state,
      home_station_id: ROLE_HOME_STATIONS[role.role_id] || 'control',
      target_station_id: targetStationId,
      station_slot: stationSlot,
      accent_index: index,
      dominant_item_id: dominantAssignment?.item_id || null,
      dominant_item_status: dominantAssignment?.status || null,
      board_updated_at: dominantAssignment?.updated_at || null,
      runtime_state: role.runtime_state,
      online_claim: role.online_claim,
      motion_semantics: 'BOARD_STATE_TRANSITION_OR_LABELED_RECEIPT_REPLAY_ONLY'
    };
  });
  for (const actor of actors) actor.station_occupancy = targetCounts.get(actor.target_station_id) || 1;
  return {
    mode: 'RECORDED_SNAPSHOT',
    source_state_fingerprint: sourceStateFingerprint,
    motion_truth: 'Movement represents a recorded board transition or a labeled receipt replay. It does not prove an agent process is online.',
    stations: FLOOR_STATIONS,
    actors
  };
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
        updated_at: item.updated_at,
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
    authorized_source_populated_rows: Number(current.authorized_source_populated_rows ?? current.authorized_company_source_rows ?? 0),
    authorized_company_source_rows: Number(current.authorized_company_source_rows ?? 0),
    invalid_non_company_source_rows: Number(current.invalid_non_company_source_rows ?? 0),
    researched_today: Number(current.researched_today ?? 0),
    identity_confirmed_today: Number(current.identity_confirmed_today ?? 0),
    identity_provisional_today: Number(current.identity_provisional_today ?? 0),
    identity_blocked_today: Number(current.identity_blocked_today ?? 0),
    remaining_authorized_source_rows: Number(current.remaining_authorized_source_rows ?? 0),
    account_governance_cleared_current_exact_sources: Number(current.account_governance_cleared_current_exact_sources ?? 0),
    account_governance_held_current_exact_sources: Number(current.account_governance_held_current_exact_sources ?? 0),
    account_governance_pending_current_exact_sources: Number(current.account_governance_pending_current_exact_sources ?? 0),
    qualified_today: Number(current.qualified_today ?? 0),
    priority_draft_only_rows: Number(current.priority_draft_only_rows ?? 0),
    gmail_drafts_created: Number(current.gmail_drafts_created ?? 0),
    gmail_drafts_directly_read_back: Number(current.gmail_drafts_directly_read_back ?? 0),
    gmail_drafts_compliance_blocked: Number(current.gmail_drafts_compliance_blocked ?? 0),
    owner_status_updates_sent: Number(current.owner_status_updates_sent ?? 0),
    social_post_ready_cards_created: Number(current.social_post_ready_cards_created ?? 0),
    content_queue_items: Number(current.content_queue_items ?? 0),
    social_posts_published: Number(current.social_posts_published ?? 0),
    hubspot_blueprint_created: Number(current.hubspot_blueprint_created ?? 0),
    hubspot_portal_route_verified: Boolean(current.hubspot_portal_route_verified),
    hubspot_configuration_writes: Number(current.hubspot_configuration_writes ?? 0),
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
  const liveDashboardPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.liveDashboard.split('/'));
  const cliPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.cli.split('/'));
  const wrapperPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.wrapper.split('/'));
  const scheduleManifestPath = path.join(repoRoot, ...OFFICE_SOURCE_PATHS.scheduleManifest.split('/'));
  for (const [label, filePath] of Object.entries({
    crew: crewPath,
    board: boardPath,
    scorecard: scorecardPath,
    generator: generatorPath,
    liveDashboard: liveDashboardPath,
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
    sourceEvidence(repoRoot, liveDashboardPath, 'live_dashboard_renderer'),
    sourceEvidence(repoRoot, cliPath, 'report_cli'),
    sourceEvidence(repoRoot, wrapperPath, 'powershell_entrypoint'),
    sourceEvidence(repoRoot, scheduleManifestPath, 'manifest_only_schedule_contract')
  ];
  if (selectedAgencyReceipt) evidence.push(sourceEvidence(repoRoot, selectedAgencyReceipt.receiptPath, 'agency_run_receipt'));

  const sourceStateFingerprint = sha256(canonicalJson({
    crew: evidence.find((item) => item.kind === 'machine_readable_roster')?.sha256,
    board: evidence.find((item) => item.kind === 'command_board')?.sha256,
    scorecard: evidence.find((item) => item.kind === 'machine_readable_scorecard')?.sha256,
    agency_run_receipt: evidence.find((item) => item.kind === 'agency_run_receipt')?.sha256 || null
  }));
  const floor = buildFloorState(roster, sourceStateFingerprint);

  const objective = extractMarkdownSection(boardMarkdown, 'Day 1 objective') || 'Use the current command board objective.';
  const completedItems = items
    .filter((item) => item.status === 'VERIFIED' || item.status === 'DONE')
    .map((item) => ({ item_id: item.item_id, status: item.status, artifact_locator: item.artifact_locator }));
  const qaItems = items
    .filter((item) => item.owner_role_id === 'quality_risk_auditor')
    .map((item) => ({ item_id: item.item_id, status: item.status, blocker: item.blocker }));
  const codexHeartbeat = scorecard.office_reporting?.codex_heartbeat || {};

  const snapshot = {
    schema_version: '1.2.0',
    report_type: 'immohrtal_office_daily_state',
    workflow_id: crew.workflow_id,
    business: crew.business,
    owner: crew.owner,
    orchestrator: crew.orchestrator,
    as_of: asOf,
    receipt_generated_at: asOf,
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
    floor,
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
    ['Populated source rows', commercial.authorized_source_populated_rows],
    ['Authorized company source rows', commercial.authorized_company_source_rows],
    ['Invalid non-company source rows', commercial.invalid_non_company_source_rows],
    ['Companies researched today', commercial.researched_today],
    ['Current identities confirmed today', commercial.identity_confirmed_today],
    ['Provisional identities today', commercial.identity_provisional_today],
    ['Identities blocked today', commercial.identity_blocked_today],
    ['Authorized company rows remaining', commercial.remaining_authorized_source_rows],
    ['Full account-governance clears', commercial.account_governance_cleared_current_exact_sources],
    ['Full account-governance holds', commercial.account_governance_held_current_exact_sources],
    ['Full account-governance checks pending', commercial.account_governance_pending_current_exact_sources],
    ['Qualified today', commercial.qualified_today],
    ['Priority draft-only rows', commercial.priority_draft_only_rows],
    ['Gmail drafts created', commercial.gmail_drafts_created],
    ['Gmail drafts directly read back', commercial.gmail_drafts_directly_read_back],
    ['Gmail drafts on compliance hold', commercial.gmail_drafts_compliance_blocked],
    ['Post-ready social cards created', commercial.social_post_ready_cards_created],
    ['Content queue items prepared', commercial.content_queue_items],
    ['Social posts published', commercial.social_posts_published],
    ['HubSpot blueprint created', commercial.hubspot_blueprint_created],
    ['HubSpot portal route verified', commercial.hubspot_portal_route_verified ? 'yes' : 'no'],
    ['HubSpot configuration writes', commercial.hubspot_configuration_writes],
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
    'Messages, provider-side drafts, calendar writes, CRM writes, publishing, deployment, spend, purchases, schedule changes, and credential access performed by this report loop: `0`.'
  );
  return `${sections.join('\n')}\n`;
}

export function renderOfficeDashboard(snapshot, options = {}) {
  return renderLiveOfficeDashboard(snapshot, options);
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
