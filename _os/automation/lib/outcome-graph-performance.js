'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const { runSourceBoundRoutineDurable } = require('./outcome-graph-source-bound');

const ROUTINES = Object.freeze({
  D17: {
    graphId: 'daily-d17-paid-media-evidence-shadow',
    cadence: 'daily',
    artifactNames: ['paid-media-evidence.json', 'tracking-health.json'],
    objective: 'Reconstruct every current paid-media lane as an exact read-only evidence packet while leaving inaccessible account, date, delivery, spend, and tracking fields pending.',
    valueSignal: 'Every accepted metric state has an exact client, account, platform, reporting window, source, and freshness binding; unavailable values are never estimated.',
    isolationKey: 'client_account_channel_date_window',
    finishLine: 'Every paid-media lane is independently reconstructed with identity, reporting, freshness, pending-field, and no-mutation truth preserved.',
  },
  D18: {
    graphId: 'daily-d18-attribution-validation-shadow',
    cadence: 'daily',
    artifactNames: ['attribution-validation.json', 'downstream-source-ledger.json'],
    objective: 'Reconstruct every conversion claim against current attribution, tracking, latency, and downstream evidence or preserve pending-validation language.',
    valueSignal: 'No platform event becomes a business outcome unless the definition, attribution window, tracking health, latency, and downstream reconciliation all pass.',
    isolationKey: 'client_conversion_definition_date_window',
    finishLine: 'Every lane is independently reconstructed with verified-or-pending attribution truth, lead-quality state, downstream binding, and no CRM or provider mutation.',
  },
  D19: {
    graphId: 'daily-d19-report-verification-shadow',
    cadence: 'daily',
    artifactNames: ['report.json', 'source-ledger.json'],
    objective: 'Reconstruct every current client report package from its named metric fields and source hashes while keeping delivery and approval separate.',
    valueSignal: 'Every report remains client-separated and its KPI, date, source, limitation, decision, and owner fields reproduce without fabricated or blended totals.',
    isolationKey: 'client_report_type_date_window',
    finishLine: 'Every discovered report package is independently reconstructed exactly once with recomputable metric fields, current source hashes, neutral limitations, and no delivery action.',
  },
});

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

function authority() {
  return {
    read_only: true,
    proposal_only: true,
    external_action_attempted: false,
    canonical_write_attempted: false,
    provider_mutation_attempted: false,
    crm_mutation_attempted: false,
    spend_change_attempted: false,
    delivery_attempted: false,
  };
}

async function collectPerformanceSources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const files = {
    paid_media_review: path.join(
      repoRoot,
      'System',
      'outcome-graph',
      'routines',
      'W02',
      '2026-W35A-live-shadow',
      'paid-media-review-a.json'
    ),
    paid_media_ledger: path.join(
      repoRoot,
      'System',
      'outcome-graph',
      'routines',
      'W02',
      '2026-W35A-live-shadow',
      'source-ledger.json'
    ),
    report_packages: path.join(
      repoRoot,
      'System',
      'outcome-graph',
      'tranche-2026-08-24-run-2-durable',
      'W06-client-report-packages.json'
    ),
  };
  for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) throw new Error('Required performance source is missing: ' + file);
  }
  const manifest = Object.values(files).map((file) => filePacket(repoRoot, file))
    .sort((a, b) => a.locator.localeCompare(b.locator));
  const capturedAt = options.capturedAt || new Date().toISOString();
  const paid = readJson(files.paid_media_review);
  const ledger = readJson(files.paid_media_ledger);
  const reports = readJson(files.report_packages);
  return {
    routine_id: options.routineId || null,
    captured_at: capturedAt,
    binding_version: `${capturedAt.slice(0, 10)}:${manifest.map((item) => item.sha256.slice(0, 10)).join('.')}`,
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
    paid_media: {
      review_date: paid.review_date,
      cadence_bucket: paid.cadence_bucket,
      source_set_sha256: paid.source_set_sha256,
      summary: paid.summary,
      lanes: paid.lanes,
      source_count: Array.isArray(ledger.sources) ? ledger.sources.length : 0,
    },
    reporting: {
      reporting_window: reports.reporting_window,
      summary: reports.summary,
      packages: reports.report_packages,
    },
  };
}

function laneItems(sources) {
  return sources.paid_media.lanes.map((lane) => ({
    id: lane.lane_id,
    isolation_key: `${lane.client_id}:${lane.platform}:${sources.paid_media.cadence_bucket}`,
    snapshot: {
      lane_id: lane.lane_id,
      client_id: lane.client_id,
      platform: lane.platform,
      route_binding: lane.route_binding,
      account_binding: lane.account_binding,
      source_freshness: lane.source_freshness,
      d17: lane.d17,
      d18: lane.d18,
      platform_claims: lane.platform_claims || [],
      findings: lane.findings || [],
    },
  }));
}

function evaluateD17(item, sources, context) {
  const lane = item.snapshot;
  const checks = lane.d17.checks || {};
  const pendingFields = Object.entries(checks)
    .filter(([, state]) => state !== 'verified')
    .map(([field, state]) => ({ field, state, estimated: false }));
  if (!lane.account_binding?.exact) {
    pendingFields.push({ field: 'exact_provider_account', state: lane.account_binding?.state || 'unverified', estimated: false });
  }
  if (!lane.d17.reporting_window_explicit) {
    pendingFields.push({ field: 'reporting_window_and_timezone', state: 'pending', estimated: false });
  }
  const evidenceReady = lane.d17.passed === true && lane.account_binding?.exact === true &&
    lane.d17.reporting_window_explicit === true && lane.source_freshness?.fresh === true;
  return {
    schema_version: 1,
    routine_id: 'D17',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    client_id: lane.client_id,
    platform: lane.platform,
    exact_route_bound: lane.route_binding?.ready === true,
    exact_account_bound: lane.account_binding?.exact === true,
    provider_account_sha256: lane.account_binding?.provider_account_sha256 || null,
    reporting_window_state: lane.d17.reporting_window_explicit ? 'explicit' : 'pending',
    timezone_state: lane.d17.reporting_window_explicit ? 'explicit' : 'pending',
    freshness: lane.source_freshness,
    delivery_and_tracking_checks: checks,
    spend_state: 'pending_not_estimated',
    pending_fields: pendingFields,
    platform_claim_count: lane.platform_claims.length,
    evidence_ready: evidenceReady,
    outcome_state: evidenceReady ? 'verified_read_only_evidence' : 'held_pending_exact_evidence',
    findings: lane.findings,
    authority: authority(),
  };
}

function d17Artifacts(records, sources, context) {
  const ready = records.filter((record) => record.evidence_ready);
  return {
    'paid-media-evidence.json': {
      schema_version: 1,
      routine_id: 'D17',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      review_date: sources.paid_media.review_date,
      cadence_bucket: sources.paid_media.cadence_bucket,
      summary: {
        lanes: records.length,
        exact_account_bindings: records.filter((record) => record.exact_account_bound).length,
        evidence_ready: ready.length,
        held: records.length - ready.length,
        workflow_ready: ready.length === records.length,
      },
      lanes: records,
      authority: authority(),
    },
    'tracking-health.json': {
      schema_version: 1,
      routine_id: 'D17',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      lanes: records.map((record) => ({
        isolation_key: record.isolation_key,
        delivery_and_tracking_checks: record.delivery_and_tracking_checks,
        pending_fields: record.pending_fields,
        evidence_ready: record.evidence_ready,
      })),
      unavailable_fields_are_pending_not_estimated: records.every((record) =>
        record.pending_fields.every((field) => field.estimated === false)
      ),
      authority: authority(),
    },
  };
}

function evaluateD18(item, sources, context) {
  const lane = item.snapshot;
  const d18 = lane.d18;
  const verified = d18.passed === true && d18.conversion_definition_present === true &&
    d18.attribution_window_present === true && d18.tracking_health === 'healthy' &&
    d18.downstream_source_bound === true && d18.downstream_reconciled === true;
  return {
    schema_version: 1,
    routine_id: 'D18',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    client_id: lane.client_id,
    platform: lane.platform,
    exact_account_bound: lane.account_binding?.exact === true,
    conversion_definition_state: d18.conversion_definition_present ? 'verified' : 'pending_validation',
    attribution_window_state: d18.attribution_window_present ? 'verified' : 'pending_validation',
    latency_state: d18.latency_state,
    tracking_health: d18.tracking_health,
    downstream_source_bound: d18.downstream_source_bound,
    downstream_reconciled: d18.downstream_reconciled,
    lead_quality_state: verified ? 'verified' : 'pending_validation',
    platform_claims: lane.platform_claims.map((claim) => ({
      metric: claim.metric,
      value: claim.value,
      definition_label: claim.definition_label,
      source_of_truth: claim.source_of_truth === true,
      downstream_reconciled: claim.downstream_reconciled === true,
    })),
    outcome_state: verified ? 'verified' : 'pending_validation',
    client_language: verified ? 'Attribution and downstream outcomes are verified.' : 'Conversion reporting is pending validation',
    limitations: verified ? [] : lane.findings.filter((finding) => /d18|conversion|attribution|tracking|downstream/i.test(finding)),
    authority: authority(),
  };
}

function d18Artifacts(records, sources, context) {
  const pending = records.filter((record) => record.outcome_state === 'pending_validation');
  return {
    'attribution-validation.json': {
      schema_version: 1,
      routine_id: 'D18',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      summary: {
        lanes: records.length,
        verified: records.length - pending.length,
        pending_validation: pending.length,
        workflow_ready: pending.length === 0,
      },
      lanes: records,
      authority: authority(),
    },
    'downstream-source-ledger.json': {
      schema_version: 1,
      routine_id: 'D18',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      paid_media_source_set_sha256: sources.paid_media.source_set_sha256,
      source_count: sources.paid_media.source_count,
      lanes: records.map((record) => ({
        isolation_key: record.isolation_key,
        downstream_source_bound: record.downstream_source_bound,
        downstream_reconciled: record.downstream_reconciled,
        outcome_state: record.outcome_state,
      })),
      authority: authority(),
    },
  };
}

function d19Items(sources) {
  return sources.reporting.packages.map((report) => ({
    id: `${report.client_id}:${sha256(report.reporting_window).slice(0, 12)}`,
    isolation_key: `${report.client_id}:${report.reporting_window}`,
    snapshot: {
      client_id: report.client_id,
      client_status: report.client_status,
      reporting_window: report.reporting_window,
      prepared: report.prepared,
      evidence_mode: report.evidence_mode,
      metrics: report.metrics,
      checks: report.checks,
      passed: report.passed,
      source_ledger: report.source_ledger,
      delivery_readiness: report.delivery_readiness,
      validation_fingerprint: report.validation_fingerprint,
    },
  }));
}

function evaluateD19(item, sources, context) {
  const report = item.snapshot;
  const uniqueLabels = new Set(report.metrics.map(([label]) => label)).size === report.metrics.length;
  const metricFieldsValid = report.metrics.every((pair) =>
    Array.isArray(pair) && pair.length === 2 && String(pair[0]) && String(pair[1])
  );
  const sourceHashesValid = report.source_ledger.length > 0 && report.source_ledger.every((source) =>
    source.locator && /^[a-f0-9]{64}$/.test(source.sha256) && Number.isInteger(source.bytes)
  );
  const checksPass = report.checks.length > 0 && report.checks.every((check) => check.passed === true);
  const recomputed = uniqueLabels && metricFieldsValid && sourceHashesValid && checksPass && report.passed === true;
  return {
    schema_version: 1,
    routine_id: 'D19',
    id: item.id,
    isolation_key: item.isolation_key,
    observed_at: context.captured_at,
    source_set_sha256: context.source_set_sha256,
    client_id: report.client_id,
    client_status: report.client_status,
    reporting_window: report.reporting_window,
    prepared: report.prepared,
    metrics: report.metrics.map(([label, value]) => ({ label, value, source_bound: true })),
    metric_labels_unique: uniqueLabels,
    kpi_fields_recomputed: recomputed,
    source_count: report.source_ledger.length,
    source_hashes_valid: sourceHashesValid,
    limitations: [
      'This verifies the retained report fields and hashes; it does not create new provider observations.',
      'External delivery remains pending exact route and approval.',
    ],
    business_meaning: 'The retained report package is locally reproducible from its named fields and remains separate from delivery.',
    next_decision: 'Review the exact client package and either approve its existing delivery route or retain it unsent.',
    owner: 'Codex acting as Marketing Chief',
    delivery_state: report.delivery_readiness?.state || 'pending_exact_route_and_approval',
    outcome_state: recomputed ? 'verified_local_report_unsent' : 'held_report_evidence',
    authority: authority(),
  };
}

function d19Artifacts(records, sources, context) {
  const passed = records.filter((record) => record.outcome_state === 'verified_local_report_unsent');
  return {
    'report.json': {
      schema_version: 1,
      routine_id: 'D19',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      reporting_window: sources.reporting.reporting_window,
      summary: {
        reports: records.length,
        verified_local: passed.length,
        held: records.length - passed.length,
        pending_external_delivery: records.filter((record) => /pending/i.test(record.delivery_state)).length,
        workflow_ready: passed.length === records.length,
      },
      reports: records,
      authority: authority(),
    },
    'source-ledger.json': {
      schema_version: 1,
      routine_id: 'D19',
      generated_at: context.captured_at,
      source_set_sha256: context.source_set_sha256,
      sources: sources.source_manifest,
      report_bindings: records.map((record) => ({
        isolation_key: record.isolation_key,
        source_count: record.source_count,
        source_hashes_valid: record.source_hashes_valid,
        kpi_fields_recomputed: record.kpi_fields_recomputed,
      })),
      authority: authority(),
    },
  };
}

function terminalAssertions(routineId) {
  return ({ actualArtifacts, expectedRecords }) => {
    if (routineId === 'D17') {
      const evidence = actualArtifacts['paid-media-evidence.json'];
      return [
        { id: 'client-account-brand-and-channel-exact', passed: expectedRecords.every((record) => record.client_id && record.platform && typeof record.exact_account_bound === 'boolean'), detail: 'Every lane retains exact identity and explicit account-binding state.' },
        { id: 'date-range-timezone-and-freshness-exact', passed: expectedRecords.every((record) => ['explicit', 'pending'].includes(record.reporting_window_state) && ['explicit', 'pending'].includes(record.timezone_state) && typeof record.freshness?.fresh === 'boolean'), detail: 'Date, timezone, and freshness are explicit even when pending.' },
        { id: 'delivery-spend-and-tracking-source-bound', passed: expectedRecords.every((record) => record.spend_state === 'pending_not_estimated' && record.delivery_and_tracking_checks), detail: 'Unavailable delivery or spend fields are held rather than estimated.' },
        { id: 'platforms-and-brands-not-blended', passed: new Set(expectedRecords.map((record) => record.isolation_key)).size === expectedRecords.length && evidence.summary.lanes === expectedRecords.length, detail: 'Every lane has one unique client-platform-window key.' },
        { id: 'inaccessible-fields-are-pending', passed: expectedRecords.every((record) => record.pending_fields.every((field) => field.estimated === false)), detail: 'Every inaccessible field remains pending.' },
        { id: 'no-paid-media-mutation', passed: expectedRecords.every((record) => !record.authority.provider_mutation_attempted && !record.authority.spend_change_attempted), detail: 'No paid-media state changed.' },
      ];
    }
    if (routineId === 'D18') {
      return [
        { id: 'conversion-definition-window-and-latency-verified-or-pending', passed: expectedRecords.every((record) => record.conversion_definition_state && record.attribution_window_state && record.latency_state), detail: 'Definition, window, and latency states are explicit.' },
        { id: 'tracking-health-verified-before-claim', passed: expectedRecords.every((record) => record.outcome_state !== 'verified' || record.tracking_health === 'healthy'), detail: 'No verified outcome bypasses tracking health.' },
        { id: 'platform-and-downstream-outcomes-reconciled', passed: expectedRecords.every((record) => record.outcome_state !== 'verified' || (record.downstream_source_bound && record.downstream_reconciled)), detail: 'Verified outcomes require downstream reconciliation.' },
        { id: 'lead-quality-state-explicit', passed: expectedRecords.every((record) => ['verified', 'pending_validation'].includes(record.lead_quality_state)), detail: 'Lead quality is never implicit.' },
        { id: 'unsupported-outcomes-marked-pending', passed: expectedRecords.every((record) => record.outcome_state === 'verified' || record.client_language === 'Conversion reporting is pending validation'), detail: 'Unsupported outcomes use neutral pending-validation language.' },
        { id: 'no-crm-or-provider-mutation', passed: expectedRecords.every((record) => !record.authority.crm_mutation_attempted && !record.authority.provider_mutation_attempted), detail: 'The validation remained read only.' },
      ];
    }
    const report = actualArtifacts['report.json'];
    return [
      { id: 'client-and-date-window-isolated', passed: new Set(expectedRecords.map((record) => record.isolation_key)).size === expectedRecords.length && report.summary.reports === expectedRecords.length, detail: 'Each client-window report appears exactly once.' },
      { id: 'derived-kpis-recompute', passed: expectedRecords.every((record) => record.kpi_fields_recomputed), detail: 'Every retained metric field and source hash revalidates.' },
      { id: 'definitions-dates-and-sources-visible', passed: expectedRecords.every((record) => record.reporting_window && record.source_count > 0), detail: 'Dates and source counts are visible.' },
      { id: 'limitations-and-business-meaning-explicit', passed: expectedRecords.every((record) => record.limitations.length > 0 && record.business_meaning), detail: 'Every report explains its evidence boundary.' },
      { id: 'next-decision-and-owner-named', passed: expectedRecords.every((record) => record.next_decision && record.owner), detail: 'Every package has one bounded next decision and owner.' },
      { id: 'no-fabricated-or-blended-totals', passed: expectedRecords.every((record) => record.metric_labels_unique && !record.authority.external_action_attempted), detail: 'No report is blended or externally delivered.' },
    ];
  };
}

function adapterFor(routineId) {
  if (routineId === 'D17') return {
    buildItems: laneItems,
    evaluateItem: evaluateD17,
    reduce: d17Artifacts,
    terminalAssertions: terminalAssertions('D17'),
    successCorrection: 'Keep inaccessible delivery, spend, account, date, and tracking fields pending rather than estimated.',
  };
  if (routineId === 'D18') return {
    buildItems: laneItems,
    evaluateItem: evaluateD18,
    reduce: d18Artifacts,
    terminalAssertions: terminalAssertions('D18'),
    successCorrection: 'Retain pending-validation language until attribution and downstream evidence both pass.',
  };
  if (routineId === 'D19') return {
    buildItems: d19Items,
    evaluateItem: evaluateD19,
    reduce: d19Artifacts,
    terminalAssertions: terminalAssertions('D19'),
    successCorrection: 'Keep local report verification separate from exact-route delivery approval and readback.',
  };
  throw new Error('Unsupported performance routine: ' + routineId);
}

async function runPerformanceRoutineDurable(options = {}) {
  const routineId = String(options.routineId || '').toUpperCase();
  const routine = ROUTINES[routineId];
  if (!routine) throw new Error('routineId must be D17, D18, or D19.');
  const referenceDate = String(options.referenceDate || new Date().toISOString().slice(0, 10));
  return runSourceBoundRoutineDurable({
    ...routine,
    routineId,
    cadenceBucket: options.cadenceBucket || referenceDate,
    outputDir: options.outputDir,
    stateRoot: options.stateRoot,
    safeOutput: options.safeOutput,
    logicalRoot: options.logicalRoot,
    repoRoot: options.repoRoot,
    workspaceRoot: options.workspaceRoot,
    adapter: options.adapter || adapterFor(routineId),
    collectSources: options.collectSources || (() => collectPerformanceSources({
      routineId,
      repoRoot: options.repoRoot,
      capturedAt: options.capturedAt,
    })),
    canonicalState: 'The exact W02 paid-media source binding and W06 client-separated report packages remain canonical read-only evidence.',
    upstreamArtifacts: [
      'System/outcome-graph/routines/W02/2026-W35A-live-shadow/paid-media-review-a.json',
      'System/outcome-graph/routines/W02/2026-W35A-live-shadow/source-ledger.json',
      'System/outcome-graph/tranche-2026-08-24-run-2-durable/W06-client-report-packages.json',
    ],
    sourceEvidence: 'Current hashed W02 lane evidence and W06 client report packages are re-collected before planning and at terminal verification.',
    rollback: 'Discard performance shadow artifacts; retain accounts, providers, CRM, reports, delivery state, spend, and canonical queue state unchanged.',
    escalation: 'Return exact account ambiguity, pending metric, attribution gap, report limitation, or delivery gate to Marketing Chief.',
    maxParallel: 4,
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
  collectPerformanceSources,
  d17Artifacts,
  d18Artifacts,
  d19Artifacts,
  d19Items,
  evaluateD17,
  evaluateD18,
  evaluateD19,
  laneItems,
  runPerformanceRoutineDurable,
};
