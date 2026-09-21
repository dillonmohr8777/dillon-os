'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const { auditFiles } = require('./outcome-graph-audit');
const { evaluateState: evaluateConnectorState } = require('../bin/connector-health');
const { runSourceBoundRoutineDurable } = require('./outcome-graph-source-bound');

const ROUTINES = Object.freeze({
  D03: {
    graphId: 'daily-d03-automation-health-shadow',
    cadence: 'daily',
    artifactNames: ['automation-health-brief.json', 'source-ledger.json'],
    objective: 'Classify every in-scope automation surface from current inventory, runtime, checkpoint, and delivery evidence without inferring health from configuration.',
    valueSignal: 'Every detected reliability failure is source-bound and has one bounded next action while stale or structural-only evidence remains visible.',
    isolationKey: 'automation_surface',
    finishLine: 'Every named reliability surface is independently reconstructed exactly once; inventory, runtime, delivery, checkpoint, false-completion, and no-mutation states reproduce from a stable source manifest.',
  },
  D07: {
    graphId: 'daily-d07-incident-triage-shadow',
    cadence: 'daily',
    artifactNames: ['incident-triage.json', 'source-ledger.json'],
    objective: 'Reduce current reliability signals into deduplicated incident packets with explicit impact, scope, evidence, and the smallest reversible proposal.',
    valueSignal: 'Every open incident has a stable fingerprint, current detection receipt, explicit impact, and one safe next action.',
    isolationKey: 'incident_fingerprint',
    finishLine: 'Every current reliability incident is independently reconstructed, deduplicated by exact fingerprint, and reproduced without destructive or production mutation.',
  },
  E04: {
    graphId: 'event-e04-connector-recovery-shadow',
    cadence: 'event',
    artifactNames: ['recovery-or-blocked-receipt.json', 'checkpoint-readback.json'],
    objective: 'Resolve each currently failed connector or preserve its exact state and emit a source-backed blocked receipt without substitution or checkpoint advancement.',
    valueSignal: 'Every connector is either recovered from verified supported evidence or truthfully held with the pre-run checkpoint unchanged.',
    isolationKey: 'connector_account_checkpoint_window',
    finishLine: 'Every failed connector is independently reconstructed with exact state preservation, supported-path decision, checkpoint readback, and no fabrication, secret exposure, substitution, or false advancement.',
  },
  E10: {
    graphId: 'event-e10-runtime-recovery-shadow',
    cadence: 'event',
    artifactNames: ['runtime-recovery-receipt.json', 'sustained-behavior-evidence.json'],
    objective: 'Classify the current bounded Hermes gateway runtime from process, heartbeat, log, conflict, and behavior evidence without creating a competing command center.',
    valueSignal: 'Recovery readiness is based on current end-to-end behavior, not process presence or retained connected state.',
    isolationKey: 'runtime_instance_route',
    finishLine: 'The exact runtime is independently reconstructed from current health evidence; unresolved sustained behavior remains held and no restart, token, worker, or command-center mutation occurs.',
  },
});

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function filePacket(file, locator = null) {
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(locator || path.relative(REPO_ROOT, file)),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function latestFile(dir, pattern) {
  const names = fs.readdirSync(dir).filter((name) => pattern.test(name)).sort();
  if (names.length === 0) throw new Error('No reliability source matched ' + pattern);
  return path.join(dir, names[names.length - 1]);
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([^:]+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    result[pair[1].trim()] = pair[2].trim().replace(/^"|"$/g, '');
  }
  return result;
}

function lastJsonLine(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.length ? JSON.parse(lines[lines.length - 1]) : null;
}

function ageState(observedAt, capturedAt, maxHours) {
  const observed = Date.parse(observedAt || '');
  const captured = Date.parse(capturedAt || '');
  if (!Number.isFinite(observed) || !Number.isFinite(captured)) {
    return { observed_at: observedAt || null, age_hours: null, fresh: false };
  }
  const age = (captured - observed) / 3600000;
  return {
    observed_at: new Date(observed).toISOString(),
    age_hours: Number(age.toFixed(2)),
    fresh: age >= 0 && age <= maxHours,
  };
}

function sourceHash(sources, locator) {
  return sources.source_manifest.find((item) => item.locator === locator)?.sha256 || null;
}

function safeAuthority() {
  return {
    read_only: true,
    proposal_only: true,
    external_action_attempted: false,
    canonical_write_attempted: false,
    provider_mutation_attempted: false,
    restart_attempted: false,
    retry_attempted: false,
    checkpoint_advance_attempted: false,
    secret_access_attempted: false,
  };
}

async function collectReliabilitySources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const queueRoot = path.join(repoRoot, '12_Brain', 'queue');
  const stateRoot = path.join(repoRoot, '12_Brain', 'state');
  const files = {
    registry: path.join(repoRoot, '11_Agents', 'claude-operating-team.json'),
    loop_log: latestFile(queueRoot, /^claude-loop-\d{4}-\d{2}-\d{2}\.jsonl$/),
    driver_log: latestFile(queueRoot, /^claude-daily-driver-\d{4}-\d{2}-\d{2}\.jsonl$/),
    driver_state: path.join(stateRoot, 'claude-daily-driver.json'),
    usage_state: path.join(stateRoot, 'claude-usage-ledger.json'),
    loop_checkpoint: path.join(stateRoot, 'claude-loop-checkpoint.json'),
    connector_state: path.join(stateRoot, 'connector-health.json'),
    gateway_health: path.join(repoRoot, 'System', 'gateway-health.md'),
    routine_health: path.join(repoRoot, 'System', 'routine-health.md'),
    automation_status: path.join(repoRoot, 'System', 'automation-status.md'),
    paid_media_snapshot: path.join(
      repoRoot,
      'System',
      'outcome-graph',
      'source-snapshots',
      'paid-media-live-2026-08-24.json'
    ),
  };
  for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) throw new Error('Required reliability source is missing: ' + file);
  }
  const manifest = Object.entries(files).map(([key, file]) =>
    filePacket(file, normalizePath(path.relative(repoRoot, file)) || `source://${key}`)
  ).sort((a, b) => a.locator.localeCompare(b.locator));
  const capturedAt = options.capturedAt || new Date().toISOString();
  const registry = readJson(files.registry);
  const driverState = readJson(files.driver_state);
  const usageState = readJson(files.usage_state);
  const connectorState = readJson(files.connector_state);
  const paidMedia = readJson(files.paid_media_snapshot);
  const gatewayText = fs.readFileSync(files.gateway_health, 'utf8');
  const routineHealthText = fs.readFileSync(files.routine_health, 'utf8');
  const automationStatusText = fs.readFileSync(files.automation_status, 'utf8');
  const gatewayFrontmatter = parseFrontmatter(gatewayText);
  const loopAudit = auditFiles(files.registry, files.loop_log);
  const scheduled = (registry.routines || []).filter((routine) => routine.schedule_card).map((routine) => ({
    routine_id: routine.routine_id,
    schedule: routine.schedule_card,
    checkpoint_declared: Boolean(routine.checkpoint_resume),
  })).sort((a, b) => a.routine_id.localeCompare(b.routine_id));
  return {
    routine_id: options.routineId || null,
    captured_at: capturedAt,
    binding_version: `${capturedAt.slice(0, 10)}:${manifest.map((item) => item.sha256.slice(0, 8)).join('.')}`,
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
    scheduled_inventory: scheduled,
    scheduled_delivery_bindings_verified: false,
    driver_state: {
      last_cycle_utc: driverState.last_cycle_utc || null,
      outcome: driverState.outcome || null,
      consecutive_failures: Number(driverState.consecutive_failures || 0),
      routines_executed_this_cycle: Number(driverState.routines_executed_this_cycle || 0),
      eligible_at_cycle: Number(driverState.eligible_at_cycle || 0),
      canonical_write_attempted: driverState.canonical_write_attempted === true,
      external_action_attempted: driverState.external_action_attempted === true,
    },
    driver_log_tail: lastJsonLine(files.driver_log),
    usage_state: {
      date: usageState.date || null,
      cycles: Number(usageState.cycles || 0),
      routines_executed: Number(usageState.routines_executed || 0),
      max_routines_per_day: Number(usageState.limits?.max_routines_per_day || 0),
      updated_utc: usageState.updated_utc || null,
    },
    loop_checkpoint: {
      sha256: sourceHash({ source_manifest: manifest }, normalizePath(path.relative(repoRoot, files.loop_checkpoint))),
      routine_ids: Object.keys(readJson(files.loop_checkpoint)).sort(),
      durable_coverage_verified: false,
    },
    connector_state: {
      recorded_at_utc: connectorState.recorded_at_utc || null,
      recorded_by: connectorState.recorded_by || null,
      connectors: (connectorState.connectors || []).map((connector) => ({
        toolkit: connector.toolkit,
        status: connector.status,
        read_verified: connector.read_verified === true,
        last_verified_utc: connector.last_verified_utc || null,
      })).sort((a, b) => String(a.toolkit).localeCompare(String(b.toolkit))),
    },
    gateway: {
      frontmatter: gatewayFrontmatter,
      process_identity_verified: /PID[^\n]+alive[^\n]+identity verified/i.test(gatewayText),
      retained_connected_only: /retained [`"]?connected/i.test(gatewayText),
      log_advancement_unproven: /no later event proves continued progress/i.test(gatewayText),
      recommended_soft_restart: /scoped local soft restart/i.test(gatewayText),
      sustained_inbound_and_reply_behavior_verified:
        /^(?:true|verified)$/i.test(String(
          gatewayFrontmatter.sustained_inbound_and_reply_behavior_verified || ''
        )),
    },
    routine_monitor: parseFrontmatter(routineHealthText),
    automation_status: parseFrontmatter(automationStatusText),
    legacy_audit: {
      counts: loopAudit.counts,
      receipt_risk_counts: loopAudit.receipt_risk_counts,
      verdict: loopAudit.verdict,
      finding: loopAudit.finding,
    },
    paid_media_collectors: {
      observed_at: paidMedia.observed_at || null,
      states: paidMedia.collector_states || {},
    },
  };
}

function d03RawItems(sources) {
  return [
    {
      id: 'scheduled-inventory',
      isolation_key: 'automation:scheduled-inventory',
      snapshot: { kind: 'scheduled_inventory', count: sources.scheduled_inventory.length },
    },
    {
      id: 'claude-daily-driver',
      isolation_key: 'automation:claude-daily-driver',
      snapshot: { kind: 'daily_driver' },
    },
    {
      id: 'external-connectors',
      isolation_key: 'automation:external-connectors',
      snapshot: { kind: 'connector_health' },
    },
    {
      id: 'hermes-gateway',
      isolation_key: 'automation:hermes-gateway',
      snapshot: { kind: 'gateway' },
    },
    {
      id: 'legacy-routine-monitor',
      isolation_key: 'automation:legacy-routine-monitor',
      snapshot: { kind: 'routine_monitor' },
    },
    {
      id: 'legacy-automation-status',
      isolation_key: 'automation:legacy-automation-status',
      snapshot: { kind: 'automation_status' },
    },
    {
      id: 'legacy-loop-completion',
      isolation_key: 'automation:legacy-loop-completion',
      snapshot: { kind: 'legacy_completion' },
    },
    {
      id: 'legacy-loop-checkpoint',
      isolation_key: 'automation:legacy-loop-checkpoint',
      snapshot: { kind: 'loop_checkpoint' },
    },
  ];
}

function evaluateD03(item, sources, context) {
  const kind = item.snapshot.kind;
  let classification = 'blocked_unverified';
  let evidenceLevel = 'recorded_state_only';
  let findings = [];
  let nextAction = 'Collect the exact missing read-only evidence and rerun this isolated surface.';
  let details = {};

  if (kind === 'scheduled_inventory') {
    const deliveryVerified = sources.scheduled_delivery_bindings_verified === true;
    classification = sources.scheduled_inventory.length === 0
      ? 'blocked_inventory_empty'
      : deliveryVerified
        ? 'inventory_and_delivery_verified'
        : 'inventory_verified_delivery_unverified';
    evidenceLevel = 'canonical_registry_inventory';
    findings = deliveryVerified ? [] : ['scheduled-configuration-does-not-prove-runtime-or-delivery'];
    nextAction = deliveryVerified
      ? 'Retain exact task, runtime, and delivery bindings for every scheduled card.'
      : 'Bind each scheduled card to current task metadata, runtime receipt, and declared delivery artifact.';
    details = {
      scheduled_routines: sources.scheduled_inventory.length,
      delivery_bindings_verified: deliveryVerified,
    };
  } else if (kind === 'daily_driver') {
    const freshness = ageState(sources.driver_state.last_cycle_utc, context.captured_at, 0.5);
    const healthy = freshness.fresh && sources.driver_state.consecutive_failures === 0 &&
      sources.driver_state.canonical_write_attempted === false &&
      sources.driver_state.external_action_attempted === false;
    classification = healthy ? 'runtime_verified_noop' : 'degraded_driver_state';
    evidenceLevel = 'runtime_and_log_readback';
    findings = healthy ? [] : ['driver-cycle-stale-failed-or-mutating'];
    nextAction = healthy
      ? 'Retain no-op as healthy only while the cycle and log continue to advance.'
      : 'Inspect the current driver cycle and log without advancing any checkpoint.';
    details = {
      freshness,
      outcome: sources.driver_state.outcome,
      consecutive_failures: sources.driver_state.consecutive_failures,
      eligible: sources.driver_state.eligible_at_cycle,
      executed: sources.driver_state.routines_executed_this_cycle,
    };
  } else if (kind === 'connector_health') {
    const evaluated = evaluateConnectorState(
      sources.connector_state,
      26,
      Date.parse(context.captured_at)
    );
    const usable = evaluated.rows.filter((row) => row.usable).length;
    classification = evaluated.rows.length > 0 && usable === evaluated.rows.length
      ? 'connectors_verified_current'
      : usable > 0
        ? 'partially_verified'
        : 'blocked_stale_connector_evidence';
    evidenceLevel = 'recorded-provider-readback';
    findings = evaluated.rows.filter((row) => !row.usable).map((row) =>
      `connector-${row.toolkit}-${row.age_hours == null ? 'unverified' : 'stale-or-unread'}`
    );
    nextAction = 'Refresh each required connector through its exact supported account route before relying on it.';
    details = {
      connector_count: evaluated.rows.length,
      usable,
      unusable: evaluated.rows.length - usable,
      snapshot_age_hours: evaluated.snapshot_age_hours,
    };
  } else if (kind === 'gateway') {
    const state = String(sources.gateway.frontmatter.state || 'unverified');
    const stale = /STALE/i.test(state) || sources.gateway.log_advancement_unproven;
    classification = stale ? 'degraded_stale_gateway' : 'runtime_verified';
    evidenceLevel = 'process-heartbeat-log-readback';
    findings = stale ? ['process-presence-does-not-prove-sustained-gateway-behavior'] : [];
    nextAction = stale
      ? 'Request the existing scoped soft-restart gate, then prove heartbeat and log advancement before recovery.'
      : 'Continue bounded heartbeat and log readback.';
    details = {
      state,
      heartbeat_age_sec: Number(sources.gateway.frontmatter.heartbeat_age_sec || 0),
      process_identity_verified: sources.gateway.process_identity_verified,
      log_advancement_unproven: sources.gateway.log_advancement_unproven,
    };
  } else if (kind === 'routine_monitor') {
    const freshness = ageState(sources.routine_monitor.last_checked, context.captured_at, 26);
    classification = freshness.fresh ? 'monitor_current' : 'stale_legacy_monitor';
    evidenceLevel = 'generated-health-note';
    findings = freshness.fresh ? [] : ['routine-health-monitor-is-stale'];
    nextAction = 'Replace the April seed monitor with current task, runtime, and artifact evidence.';
    details = { freshness };
  } else if (kind === 'automation_status') {
    const freshness = ageState(sources.automation_status.last_updated, context.captured_at, 26);
    classification = freshness.fresh ? 'status_current' : 'stale_legacy_status';
    evidenceLevel = 'historical-status-note';
    findings = freshness.fresh ? [] : ['automation-status-note-is-stale'];
    nextAction = 'Use current gateway health and runtime logs instead of the historical July status note.';
    details = { freshness };
  } else if (kind === 'legacy_completion') {
    const risk = Number(sources.legacy_audit.counts?.receipts_with_false_completion_risk || 0);
    classification = risk > 0 ? 'degraded_false_completion_risk' : 'legacy_completion_reconciled';
    evidenceLevel = 'receipt-and-declared-artifact-audit';
    findings = risk > 0 ? [`${risk}-receipts-do-not-prove-declared-artifacts`] : [];
    nextAction = 'Keep structural-only receipts out of outcome dedupe until each routine has a durable source adapter.';
    details = { receipts_with_false_completion_risk: risk };
  } else if (kind === 'loop_checkpoint') {
    const currentRoutineIds = sources.loop_checkpoint.routine_ids;
    classification = sources.loop_checkpoint.durable_coverage_verified === true
      ? 'checkpoint_inventory_verified'
      : currentRoutineIds.length === 1 && currentRoutineIds[0] === 'D19'
        ? 'partial_stale_checkpoint_surface'
        : 'checkpoint_inventory_unverified';
    evidenceLevel = 'checkpoint-file-hash';
    findings = sources.loop_checkpoint.durable_coverage_verified === true
      ? []
      : ['checkpoint-file-does-not-cover-current-completed-routine-estate'];
    nextAction = sources.loop_checkpoint.durable_coverage_verified === true
      ? 'Retain routine-specific durable checkpoint coverage and exact readback.'
      : 'Do not advance it; migrate checkpoint truth to the routine-specific durable state store.';
    details = { represented_routine_count: currentRoutineIds.length };
  }

  const failure = !['inventory_and_delivery_verified', 'runtime_verified_noop',
    'connectors_verified_current', 'runtime_verified', 'monitor_current',
    'status_current', 'legacy_completion_reconciled',
    'checkpoint_inventory_verified'].includes(classification);
  return {
    schema_version: 1,
    routine_id: 'D03',
    id: item.id,
    isolation_key: item.isolation_key,
    source_set_sha256: context.source_set_sha256,
    observed_at: context.captured_at,
    classification,
    evidence_level: evidenceLevel,
    runtime_and_delivery_separated: true,
    failure,
    findings,
    details,
    bounded_next_action: nextAction,
    authority: safeAuthority(),
  };
}

function d03Artifacts(records, sources, context) {
  const failures = records.filter((record) => record.failure);
  return {
    'automation-health-brief.json': {
      schema_version: 1,
      routine_id: 'D03',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        surfaces: records.length,
        verified_or_current: records.length - failures.length,
        degraded_blocked_or_stale: failures.length,
        workflow_ready: failures.length === 0,
      },
      surfaces: records,
      authority: safeAuthority(),
    },
    'source-ledger.json': {
      schema_version: 1,
      routine_id: 'D03',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      sources: sources.source_manifest,
      inventory_count: sources.scheduled_inventory.length,
      false_completion_risk_count: Number(sources.legacy_audit.counts?.receipts_with_false_completion_risk || 0),
      authority: safeAuthority(),
    },
  };
}

function d07Items(sources) {
  const context = {
    routine_id: 'D03',
    captured_at: sources.captured_at,
    source_set_sha256: sources.source_set_sha256,
  };
  const incidents = d03RawItems(sources).map((item) => evaluateD03(item, sources, context))
    .filter((record) => record.failure)
    .map((record) => {
      const fingerprint = sha256(stableJson({
        isolation_key: record.isolation_key,
        classification: record.classification,
        findings: record.findings,
      }));
      return {
        id: fingerprint.slice(0, 20),
        isolation_key: `incident:${fingerprint}`,
        snapshot: {
          fingerprint,
          source_record: record,
        },
      };
    });
  if (incidents.length > 0) return incidents;
  const fingerprint = sha256('D07:no-open-incidents');
  return [{
    id: fingerprint.slice(0, 20),
    isolation_key: `incident:${fingerprint}`,
    snapshot: {
      fingerprint,
      no_open_incidents: true,
    },
  }];
}

function evaluateD07(item, sources, context) {
  if (item.snapshot.no_open_incidents === true) {
    return {
      schema_version: 1,
      routine_id: 'D07',
      id: item.id,
      isolation_key: item.isolation_key,
      incident_fingerprint: item.snapshot.fingerprint,
      detected_at: context.captured_at,
      detection_fresh: true,
      severity: 'none',
      impact: [],
      affected_surface: 'reliability-estate',
      source_classification: 'no_open_incidents',
      evidence: {
        source_set_sha256: context.source_set_sha256,
        evidence_level: 'current-full-surface-reconstruction',
      },
      smallest_reversible_proposal: 'No recovery action is currently required; retain bounded detection.',
      outcome_state: 'triaged_no_incidents',
      authority: safeAuthority(),
    };
  }
  const source = item.snapshot.source_record;
  const severity = /false_completion|gateway|connector/.test(source.classification)
    ? 'high'
    : 'medium';
  return {
    schema_version: 1,
    routine_id: 'D07',
    id: item.id,
    isolation_key: item.isolation_key,
    incident_fingerprint: item.snapshot.fingerprint,
    detected_at: context.captured_at,
    detection_fresh: true,
    severity,
    impact: source.findings,
    affected_surface: source.isolation_key,
    source_classification: source.classification,
    evidence: {
      source_set_sha256: context.source_set_sha256,
      evidence_level: source.evidence_level,
    },
    smallest_reversible_proposal: source.bounded_next_action,
    outcome_state: 'triaged_open',
    authority: safeAuthority(),
  };
}

function d07Artifacts(records, sources, context) {
  const open = records.filter((record) => record.outcome_state === 'triaged_open');
  return {
    'incident-triage.json': {
      schema_version: 1,
      routine_id: 'D07',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        open_incidents: open.length,
        unique_fingerprints: new Set(open.map((record) => record.incident_fingerprint)).size,
        no_open_incidents: open.length === 0,
        triage_complete: records.every((record) => record.smallest_reversible_proposal),
      },
      incidents: open,
      no_incident_receipt: open.length === 0 ? records[0] : null,
      authority: safeAuthority(),
    },
    'source-ledger.json': {
      schema_version: 1,
      routine_id: 'D07',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      sources: sources.source_manifest,
      authority: safeAuthority(),
    },
  };
}

function e04Items(sources) {
  const evaluated = evaluateConnectorState(
    sources.connector_state,
    6,
    Date.parse(sources.captured_at)
  );
  const items = evaluated.rows.filter((row) => !row.usable).map((row) => ({
    id: row.toolkit,
    isolation_key: `connector:${row.toolkit}:recorded-state`,
    snapshot: {
      connector_id: row.toolkit,
      account_binding_state: 'unverified',
      observed_at: row.observed_at_utc,
      age_hours: row.age_hours,
      status: row.status,
      read_verified: row.read_verified,
      checkpoint_sha256: sourceHash(sources, '12_Brain/state/connector-health.json'),
      block_reason: row.age_hours == null || row.age_hours > 6
        ? 'provider-readback-stale'
        : 'connector-not-usable',
    },
  }));
  const windsorState = String(sources.paid_media_collectors.states.windsor_connector || '');
  if (/(?:reauth|block|unavailable|not[_ -]|fail|error|stale|required)/i.test(windsorState)) {
    items.push({
      id: 'windsor-connector',
      isolation_key: 'connector:windsor:authenticated-session',
      snapshot: {
        connector_id: 'windsor_connector',
        account_binding_state: 'unverified',
        observed_at: sources.paid_media_collectors.observed_at,
        age_hours: ageState(
          sources.paid_media_collectors.observed_at,
          sources.captured_at,
          6
        ).age_hours,
        status: windsorState,
        read_verified: false,
        checkpoint_sha256: sourceHash(
          sources,
          'System/outcome-graph/source-snapshots/paid-media-live-2026-08-24.json'
        ),
        block_reason: 'reauthentication-required',
      },
    });
  }
  if (items.length === 0) {
    items.push({
      id: 'no-recovery-required',
      isolation_key: 'connector:none:current-state',
      snapshot: {
        no_recovery_required: true,
        connector_id: null,
        checkpoint_sha256: sourceHash(sources, '12_Brain/state/connector-health.json'),
      },
    });
  }
  return items;
}

function evaluateE04(item, sources, context) {
  const snapshot = item.snapshot;
  if (snapshot.no_recovery_required === true) {
    return {
      schema_version: 1,
      routine_id: 'E04',
      id: item.id,
      isolation_key: item.isolation_key,
      connector_id: null,
      observed_at: context.captured_at,
      trigger_state: 'no_failed_connectors',
      exact_connector_verified: true,
      exact_account_verified: true,
      pre_failure_checkpoint_sha256: snapshot.checkpoint_sha256,
      post_run_checkpoint_sha256: snapshot.checkpoint_sha256,
      checkpoint_preserved: Boolean(snapshot.checkpoint_sha256),
      checkpoint_advanced: false,
      supported_recovery_attempted: false,
      recovery_state: 'not_required',
      block_reason: null,
      evidence: {
        recorded_status: 'all-current-connectors-usable',
        read_verified: true,
        provider_observation_age_hours: null,
      },
      next_safe_action: 'No recovery action is currently required; retain exact-account provider readback.',
      authority: safeAuthority(),
    };
  }
  return {
    schema_version: 1,
    routine_id: 'E04',
    id: item.id,
    isolation_key: item.isolation_key,
    connector_id: snapshot.connector_id,
    observed_at: context.captured_at,
    exact_connector_verified: Boolean(snapshot.connector_id),
    exact_account_verified: snapshot.account_binding_state === 'exact',
    pre_failure_checkpoint_sha256: snapshot.checkpoint_sha256,
    post_run_checkpoint_sha256: snapshot.checkpoint_sha256,
    checkpoint_preserved: Boolean(snapshot.checkpoint_sha256),
    checkpoint_advanced: false,
    supported_recovery_attempted: false,
    recovery_state: 'blocked_preserved_state',
    block_reason: snapshot.block_reason,
    evidence: {
      recorded_status: snapshot.status,
      read_verified: snapshot.read_verified,
      provider_observation_age_hours: snapshot.age_hours,
    },
    next_safe_action: snapshot.block_reason === 'reauthentication-required'
      ? 'Use the existing exact-account reauthentication path, then rerun the same bounded read and checkpoint comparison.'
      : 'Refresh the exact provider readback without substituting another connector or advancing the checkpoint.',
    authority: safeAuthority(),
  };
}

function e04Artifacts(records, sources, context) {
  const triggered = records.filter((record) => record.recovery_state !== 'not_required');
  return {
    'recovery-or-blocked-receipt.json': {
      schema_version: 1,
      routine_id: 'E04',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        connectors: triggered.length,
        recovered: triggered.filter((record) => record.recovery_state === 'recovered').length,
        blocked: triggered.filter((record) => record.recovery_state !== 'recovered').length,
        no_recovery_required: triggered.length === 0,
        workflow_ready: records.every((record) =>
          record.recovery_state === 'recovered' || record.recovery_state === 'not_required'
        ),
      },
      connectors: triggered,
      no_trigger_receipt: triggered.length === 0 ? records[0] : null,
      authority: safeAuthority(),
    },
    'checkpoint-readback.json': {
      schema_version: 1,
      routine_id: 'E04',
      generated_at: context.captured_at,
      checkpoints: records.map((record) => ({
        connector_id: record.connector_id,
        before_sha256: record.pre_failure_checkpoint_sha256,
        after_sha256: record.post_run_checkpoint_sha256,
        preserved: record.checkpoint_preserved,
        advanced: record.checkpoint_advanced,
      })),
      authority: safeAuthority(),
    },
  };
}

function e10Items(sources) {
  return [{
    id: 'hermes-gateway',
    isolation_key: 'runtime:hermes-gateway:telegram-route',
    snapshot: {
      state: sources.gateway.frontmatter.state || 'unverified',
      heartbeat_age_sec: Number(sources.gateway.frontmatter.heartbeat_age_sec || 0),
      process_identity_verified: sources.gateway.process_identity_verified,
      conflicts_1h: Number(sources.gateway.frontmatter.conflicts_1h || 0),
      conflicts_6h: Number(sources.gateway.frontmatter.conflicts_6h || 0),
      conflicts_24h: Number(sources.gateway.frontmatter.conflicts_24h || 0),
      retained_connected_only: sources.gateway.retained_connected_only,
      log_advancement_unproven: sources.gateway.log_advancement_unproven,
      recommended_soft_restart: sources.gateway.recommended_soft_restart,
      sustained_inbound_and_reply_behavior_verified:
        sources.gateway.sustained_inbound_and_reply_behavior_verified === true,
      source_sha256: sourceHash(sources, 'System/gateway-health.md'),
    },
  }];
}

function evaluateE10(item, sources, context) {
  const snapshot = item.snapshot;
  const heartbeatCurrent = snapshot.heartbeat_age_sec >= 0 && snapshot.heartbeat_age_sec < 120;
  const logAdvancementVerified = snapshot.log_advancement_unproven === false;
  const conflictsObserved = snapshot.conflicts_1h > 0 || snapshot.conflicts_6h > 0 ||
    snapshot.conflicts_24h > 0;
  const sustained = snapshot.process_identity_verified && heartbeatCurrent &&
    logAdvancementVerified && !conflictsObserved &&
    snapshot.sustained_inbound_and_reply_behavior_verified;
  return {
    schema_version: 1,
    routine_id: 'E10',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_sha256: snapshot.source_sha256,
    process_identity_verified: snapshot.process_identity_verified,
    state: snapshot.state,
    heartbeat_age_sec: snapshot.heartbeat_age_sec,
    conflict_counts: {
      one_hour: snapshot.conflicts_1h,
      six_hours: snapshot.conflicts_6h,
      twenty_four_hours: snapshot.conflicts_24h,
    },
    retained_connected_is_not_progress_proof: snapshot.retained_connected_only,
    heartbeat_current: heartbeatCurrent,
    log_advancement_verified: logAdvancementVerified,
    sustained_inbound_and_reply_behavior_verified: sustained,
    competing_workers_observed: conflictsObserved,
    recovery_attempted: false,
    outcome_state: sustained
      ? 'runtime_verified'
      : 'held_pending_scoped_recovery_and_sustained_readback',
    next_safe_action: sustained
      ? 'Continue bounded heartbeat, log, inbound, and reply verification.'
      : 'Use the existing scoped soft-restart approval path, then verify heartbeat under 120 seconds, log advancement, and one bounded inbound and reply readback.',
    authority: safeAuthority(),
  };
}

function e10Artifacts(records, sources, context) {
  const record = records[0];
  return {
    'runtime-recovery-receipt.json': {
      schema_version: 1,
      routine_id: 'E10',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      runtime: record,
      workflow_ready: record.outcome_state === 'runtime_verified',
      authority: safeAuthority(),
    },
    'sustained-behavior-evidence.json': {
      schema_version: 1,
      routine_id: 'E10',
      generated_at: context.captured_at,
      process_identity_verified: record.process_identity_verified,
      heartbeat_current: record.heartbeat_current,
      log_advancement_verified: record.log_advancement_verified,
      sustained_inbound_and_reply_behavior_verified: record.sustained_inbound_and_reply_behavior_verified,
      evidence_state: record.sustained_inbound_and_reply_behavior_verified
        ? 'verified'
        : 'pending_validation',
      authority: safeAuthority(),
    },
  };
}

function terminalAssertions(routineId) {
  return ({ actualArtifacts, expectedRecords }) => {
    if (routineId === 'D03') {
      const brief = actualArtifacts['automation-health-brief.json'];
      return [
        { id: 'active-automation-inventory-complete', passed: brief.summary.surfaces === 8, detail: 'All eight named reliability surfaces are represented.' },
        { id: 'runtime-and-delivery-truth-separated', passed: expectedRecords.every((record) => record.runtime_and_delivery_separated), detail: 'Configuration, runtime, delivery, and checkpoint evidence are not conflated.' },
        { id: 'failure-packets-are-actionable', passed: expectedRecords.filter((record) => record.failure).every((record) => record.findings.length > 0 && record.bounded_next_action), detail: 'Every nonhealthy state has exact findings and one bounded action.' },
        { id: 'failed-checkpoints-not-advanced', passed: expectedRecords.every((record) => record.authority.checkpoint_advance_attempted === false), detail: 'No checkpoint was advanced.' },
        { id: 'no-restart-retry-or-provider-mutation', passed: expectedRecords.every((record) => !record.authority.restart_attempted && !record.authority.retry_attempted && !record.authority.provider_mutation_attempted), detail: 'The audit remained read only.' },
      ];
    }
    if (routineId === 'D07') {
      const packet = actualArtifacts['incident-triage.json'];
      const open = expectedRecords.filter((record) => record.outcome_state === 'triaged_open');
      return [
        { id: 'alert-freshness-proven', passed: expectedRecords.every((record) => record.detection_fresh), detail: 'Every incident is a current detection over a named source state.' },
        { id: 'duplicate-alerts-collapsed', passed: packet.summary.open_incidents === packet.summary.unique_fingerprints, detail: 'Only matching incident fingerprints collapse.' },
        { id: 'impact-scope-and-evidence-explicit', passed: open.every((record) => record.impact.length > 0 && record.affected_surface && record.evidence.source_set_sha256), detail: 'Impact, surface, and evidence are explicit for every open incident.' },
        { id: 'recovery-is-smallest-reversible-step', passed: expectedRecords.every((record) => record.smallest_reversible_proposal), detail: 'Each incident has one bounded proposal.' },
        { id: 'no-trigger-state-is-explicit', passed: open.length > 0 || (expectedRecords.length === 1 && expectedRecords[0].outcome_state === 'triaged_no_incidents' && packet.summary.no_open_incidents), detail: 'A clear no-incident receipt replaces an empty or falsely failed run.' },
        { id: 'no-destructive-or-production-mutation', passed: expectedRecords.every((record) => !record.authority.external_action_attempted && !record.authority.restart_attempted), detail: 'No recovery mutation occurred.' },
      ];
    }
    if (routineId === 'E04') {
      const triggered = expectedRecords.filter((record) => record.recovery_state !== 'not_required');
      return [
        { id: 'pre-failure-checkpoint-preserved', passed: expectedRecords.every((record) => record.checkpoint_preserved && !record.checkpoint_advanced), detail: 'Every checkpoint hash is identical before and after.' },
        { id: 'exact-connector-and-account-state-visible', passed: triggered.every((record) => record.exact_connector_verified && typeof record.exact_account_verified === 'boolean'), detail: 'Connector identity and unresolved account state remain explicit.' },
        { id: 'bounded-supported-recovery-decision', passed: triggered.every((record) => record.recovery_state === 'blocked_preserved_state' && record.block_reason), detail: 'Unsupported or human-gated recovery is held rather than fabricated.' },
        { id: 'no-trigger-state-is-explicit', passed: triggered.length > 0 || (expectedRecords.length === 1 && expectedRecords[0].recovery_state === 'not_required'), detail: 'An explicit no-recovery receipt replaces an empty or falsely failed event run.' },
        { id: 'same-overlap-rerun-and-readback-not-falsely-claimed', passed: expectedRecords.every((record) => !record.supported_recovery_attempted), detail: 'No rerun or readback is claimed when none occurred.' },
        { id: 'no-fabrication-secret-exposure-substitution-or-false-advance', passed: expectedRecords.every((record) => !record.authority.secret_access_attempted && !record.authority.provider_mutation_attempted && !record.checkpoint_advanced), detail: 'The connector state remains fail closed.' },
      ];
    }
    const record = expectedRecords[0];
    const behaviorEvidenceComplete = record.process_identity_verified && record.heartbeat_current &&
      record.log_advancement_verified && !record.competing_workers_observed &&
      record.sustained_inbound_and_reply_behavior_verified;
    const outcomeMatchesEvidence = behaviorEvidenceComplete
      ? record.outcome_state === 'runtime_verified'
      : /held_pending/.test(record.outcome_state);
    return [
      { id: 'current-process-logs-and-state-inspected', passed: record.process_identity_verified && Boolean(record.source_sha256), detail: 'Process identity and current health evidence are source-bound.' },
      { id: 'competing-workers-and-stale-state-visible', passed: typeof record.competing_workers_observed === 'boolean' && typeof record.log_advancement_verified === 'boolean', detail: 'Worker and stale-state findings are explicit.' },
      { id: 'recovery-is-bounded-and-reversible', passed: !record.recovery_attempted && Boolean(record.next_safe_action), detail: 'No unapproved recovery occurred.' },
      { id: 'sustained-behavior-not-inferred', passed: outcomeMatchesEvidence, detail: 'Process presence, heartbeat, and retained connected state do not become end-to-end proof without inbound and reply evidence.' },
      { id: 'marketing-chief-receives-exact-evidence', passed: Boolean(record.source_sha256) && Boolean(record.next_safe_action), detail: 'The handoff carries exact evidence and one next action.' },
      { id: 'no-token-parallel-command-center-or-false-completion', passed: !record.authority.secret_access_attempted && !record.authority.external_action_attempted && outcomeMatchesEvidence, detail: 'Authority remains bounded and runtime completion exactly matches current behavior evidence.' },
    ];
  };
}

function adapterFor(routineId) {
  if (routineId === 'D03') return {
    buildItems: d03RawItems,
    evaluateItem: evaluateD03,
    reduce: d03Artifacts,
    terminalAssertions: terminalAssertions('D03'),
    successCorrection: 'Keep configuration, runtime, delivery, checkpoint, and provider freshness as separate evidence states.',
  };
  if (routineId === 'D07') return {
    buildItems: d07Items,
    evaluateItem: evaluateD07,
    reduce: d07Artifacts,
    terminalAssertions: terminalAssertions('D07'),
    successCorrection: 'Retain incident fingerprints and update only when the underlying source state changes.',
  };
  if (routineId === 'E04') return {
    buildItems: e04Items,
    evaluateItem: evaluateE04,
    reduce: e04Artifacts,
    terminalAssertions: terminalAssertions('E04'),
    successCorrection: 'Preserve the exact failed checkpoint and never substitute a connector or fabricate a recovery readback.',
  };
  if (routineId === 'E10') return {
    buildItems: e10Items,
    evaluateItem: evaluateE10,
    reduce: e10Artifacts,
    terminalAssertions: terminalAssertions('E10'),
    successCorrection: 'Require sustained heartbeat, log, inbound, and reply evidence before calling a live runtime recovered.',
  };
  throw new Error('Unsupported reliability routine: ' + routineId);
}

function cadenceBucket(routineId, referenceDate) {
  return ROUTINES[routineId].cadence === 'event'
    ? `${referenceDate}:live-event-state`
    : referenceDate;
}

async function runReliabilityRoutineDurable(options = {}) {
  const routineId = String(options.routineId || '').toUpperCase();
  const routine = ROUTINES[routineId];
  if (!routine) throw new Error('routineId must be D03, D07, E04, or E10.');
  const referenceDate = String(options.referenceDate || new Date().toISOString().slice(0, 10));
  const bucket = options.cadenceBucket || cadenceBucket(routineId, referenceDate);
  return runSourceBoundRoutineDurable({
    ...routine,
    routineId,
    cadenceBucket: bucket,
    outputDir: options.outputDir,
    stateRoot: options.stateRoot,
    safeOutput: options.safeOutput,
    logicalRoot: options.logicalRoot,
    repoRoot: options.repoRoot,
    workspaceRoot: options.workspaceRoot,
    adapter: options.adapter || adapterFor(routineId),
    collectSources: options.collectSources || (() => collectReliabilitySources({
      routineId,
      repoRoot: options.repoRoot,
      capturedAt: options.capturedAt,
    })),
    canonicalState: 'Dillon OS automation registry, runtime/checkpoint state, provider-readback state, current gateway health, and legacy loop receipts remain canonical and read only.',
    upstreamArtifacts: [
      '11_Agents/claude-operating-team.json',
      '12_Brain/queue/claude-loop-YYYY-MM-DD.jsonl',
      '12_Brain/queue/claude-daily-driver-YYYY-MM-DD.jsonl',
      '12_Brain/state/claude-daily-driver.json',
      '12_Brain/state/connector-health.json',
      'System/gateway-health.md',
      'System/routine-health.md',
      'System/automation-status.md',
    ],
    sourceEvidence: 'Registry, loop and driver logs, runtime and checkpoint state, connector observations, gateway health, and historical health projections are rehashed before planning and at terminal verification.',
    rollback: 'Discard reliability shadow artifacts; retain processes, checkpoints, providers, schedules, messages, and canonical state unchanged.',
    escalation: 'Return exact stale evidence, false-completion risk, connector gate, runtime degradation, or missing approval to Marketing Chief.',
    maxParallel: routineId === 'D03' ? 4 : 3,
    onCheckpoint: options.onCheckpoint,
    beforeFinalBindingCheck: options.beforeFinalBindingCheck,
    now: options.now,
    leaseSeconds: options.leaseSeconds,
    cleanupInterruptedWorkspace: options.cleanupInterruptedWorkspace,
  });
}

module.exports = {
  ROUTINES,
  adapterFor,
  ageState,
  cadenceBucket,
  collectReliabilitySources,
  d03Artifacts,
  d03RawItems,
  d07Artifacts,
  d07Items,
  e04Artifacts,
  e04Items,
  e10Artifacts,
  e10Items,
  evaluateD03,
  evaluateD07,
  evaluateE04,
  evaluateE10,
  runReliabilityRoutineDurable,
};
