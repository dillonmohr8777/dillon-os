'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph, writeJsonAtomic } = require('./outcome-graph-state');

const ROUTINES = Object.freeze({
  W02: Object.freeze({
    pass: 'A',
    graph_id: 'weekly-w02-paid-media-pass-a-shadow',
    review_name: 'paid-media-review-a.json',
    ledger_name: 'source-ledger.json',
    objective: 'Classify the first weekly paid-media review for every exact client-account-channel lane from current delivery and downstream attribution evidence without mutating any provider, CRM, delivery surface, or canonical queue.',
  }),
  W03: Object.freeze({
    pass: 'B',
    graph_id: 'weekly-w03-paid-media-pass-b-shadow',
    review_name: 'paid-media-review-b.json',
    ledger_name: 'pass-a-comparison-ledger.json',
    objective: 'Compare a fresh second paid-media observation with the exact pass-A artifact while separating measured change from attribution latency, reporting delay, and unresolved downstream evidence.',
  }),
});

const CHECK_IDS = Object.freeze([
  'session_account',
  'delivery_pacing',
  'conversion_tracking_dedup',
  'landing_page_health',
  'change_history',
  'budget_recommendation',
  'readback_freshness',
]);

const CHECK_STATES = new Set(['verified', 'partial', 'pending', 'blocked']);
const TREND_STATES = new Set(['changed', 'unchanged', 'latency_or_reporting_delay', 'inconclusive']);

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function filePacket(file, locator) {
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(locator),
    sha256: sha256(bytes),
    bytes: bytes.length,
    physical_path: file,
  };
}

function publicPacket(packet) {
  return {
    locator: packet.locator,
    sha256: packet.sha256,
    bytes: packet.bytes,
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

function safeItemId(value) {
  return sha256(String(value)).slice(0, 20);
}

function clientOperationsDefault() {
  return path.join(os.homedir(), 'Documents', 'Codex', 'projects', 'client-operations');
}

function accessRegistryDefault() {
  return path.join(os.homedir(), 'AppData', 'Local', 'Codex', 'AccessBroker', 'registry.json');
}

function platformKey(platform) {
  return String(platform).replace(/-/g, '_');
}

function normalizeService(value) {
  const normalized = String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'googleads') return 'google-ads';
  if (normalized === 'metaads' || normalized === 'facebookads') return 'meta-ads';
  return String(value || '').toLowerCase();
}

function validSha(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function isoWeek(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateText || ''))) {
    throw new Error('Paid-media review date must use YYYY-MM-DD.');
  }
  const date = new Date(dateText + 'T12:00:00.000Z');
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function cadenceBucket(routineId, reviewDate) {
  const routine = ROUTINES[routineId];
  if (!routine) throw new Error('Unsupported paid-media routine: ' + routineId);
  return `${isoWeek(reviewDate)}${routine.pass}`;
}

function channelCheckId(platform) {
  return platform === 'google-ads'
    ? 'search-terms-and-negatives'
    : 'creative-fatigue-and-placements';
}

function parseAccountReference(accountRef) {
  const match = /^access-broker:([^/]+)\/([^/]+)$/.exec(String(accountRef || ''));
  if (!match) return null;
  return { client_id: match[1], logical_system_id: match[2] };
}

function readCapabilities(system) {
  return Array.isArray(system?.allowed_capabilities)
    ? system.allowed_capabilities.map(String).sort()
    : [];
}

function resolveAccessBinding({ clientId, platform, accountRef, accessRegistry }) {
  const parsed = parseAccountReference(accountRef);
  const clients = Array.isArray(accessRegistry?.clients) ? accessRegistry.clients : [];
  const clientMatches = clients.filter((client) => String(client.id) === String(clientId));
  const findings = [];
  if (!parsed) findings.push('opaque-account-reference-invalid');
  if (parsed && parsed.client_id !== clientId) findings.push('opaque-account-reference-client-mismatch');
  if (clientMatches.length !== 1) findings.push('access-registry-client-not-exactly-one');

  const systems = clientMatches.length === 1 && Array.isArray(clientMatches[0].systems)
    ? clientMatches[0].systems
    : [];
  const platformSystems = systems.filter((system) =>
    normalizeService(system.service) === platform && String(system.environment || '') === 'production'
  );
  const logical = parsed?.logical_system_id || '';
  const logicalMatches = platformSystems.filter((system) => {
    const id = String(system.id || '');
    return id === logical || id.startsWith(logical + '-');
  });
  if (logicalMatches.length !== 1) findings.push(
    logicalMatches.length === 0 ? 'access-system-not-resolved' : 'access-system-ambiguous'
  );
  const matched = logicalMatches.length === 1 ? logicalMatches[0] : null;
  const capabilities = readCapabilities(matched);
  const hasMetadataRead = capabilities.includes('account.metadata.read');
  const hasInsightsRead = capabilities.includes(
    platform === 'google-ads' ? 'googleads.insights.read' : 'metaads.insights.read'
  );
  if (matched && !hasMetadataRead) findings.push('access-registry-account-read-capability-missing');
  if (matched && !hasInsightsRead) findings.push('access-registry-insights-read-capability-missing');

  return {
    state: findings.length === 0 ? 'resolved_authorized_read_only' : 'blocked_or_incomplete',
    client_route_count: clientMatches.length,
    platform_system_count: platformSystems.length,
    logical_match_count: logicalMatches.length,
    account_reference_sha256: sha256(String(accountRef || '')),
    matched_system_sha256: matched ? sha256(String(matched.id || '')) : null,
    environment: matched ? String(matched.environment || '') : null,
    metadata_read_allowed: hasMetadataRead,
    insights_read_allowed: hasInsightsRead,
    last_verified_at: matched?.last_verified_at || null,
    findings: unique(findings).sort(),
  };
}

function assertLiveSnapshot(snapshot) {
  if (Number(snapshot?.schema_version) !== 1) throw new Error('Unsupported paid-media live snapshot schema.');
  if (!validIso(snapshot.observed_at)) throw new Error('Paid-media live snapshot observed_at is invalid.');
  if (snapshot.timezone !== 'America/New_York') throw new Error('Paid-media live snapshot must use America/New_York.');
  if (snapshot.privacy !== 'redacted' || snapshot.contains_secrets !== false ||
      snapshot.contains_direct_identifiers !== false || snapshot.contains_raw_communications !== false) {
    throw new Error('Paid-media live snapshot privacy attestation failed.');
  }
  if (snapshot.provider_mutation_attempted !== false ||
      snapshot.canonical_queue_mutation_attempted !== false ||
      snapshot.external_action_attempted !== false) {
    throw new Error('Paid-media live snapshot reports a prohibited action.');
  }
  const lanes = Array.isArray(snapshot.lanes) ? snapshot.lanes : [];
  const ids = lanes.map((lane) => String(lane.lane_id || ''));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error('Paid-media live snapshot lane IDs must be non-empty and unique.');
  }
  const serialized = JSON.stringify(snapshot);
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized) ||
      /(?:act|customer_id|account_id)=\d+/i.test(serialized) ||
      /secret_ref|password|access_token|refresh_token|cookie/i.test(serialized)) {
    throw new Error('Paid-media live snapshot contains a prohibited direct identifier or secret field.');
  }
  for (const lane of lanes) {
    if (lane.platform && !['google-ads', 'meta-ads'].includes(lane.platform)) {
      throw new Error('Paid-media snapshot has an unsupported platform.');
    }
    if (lane.provider_account_sha256 != null && !validSha(lane.provider_account_sha256)) {
      throw new Error('Paid-media snapshot provider account hash is invalid.');
    }
    const candidates = Array.isArray(lane.candidate_account_sha256s)
      ? lane.candidate_account_sha256s
      : [];
    if (candidates.some((value) => !validSha(value))) {
      throw new Error('Paid-media snapshot candidate account hash is invalid.');
    }
    const checks = lane.checks && typeof lane.checks === 'object' ? lane.checks : {};
    for (const [id, check] of Object.entries(checks)) {
      if (!CHECK_STATES.has(String(check?.status || ''))) {
        throw new Error(`Paid-media snapshot check ${id} has an invalid status.`);
      }
    }
  }
  return snapshot;
}

function manifestDiagnostics(manifest) {
  const lanes = Array.isArray(manifest?.lanes) ? manifest.lanes : [];
  const pending = lanes.reduce((sum, lane) => sum + (Array.isArray(lane.checks)
    ? lane.checks.filter((check) => String(check.status) !== 'verified').length
    : 0), 0);
  return {
    declared_status: manifest?.status || null,
    lane_count: lanes.length,
    non_verified_check_count: pending,
    false_ready_detected: manifest?.status === 'ready-for-read-only-review' && pending > 0,
    interpretation: 'Manifest readiness authorizes evidence collection only; it is not an outcome-complete paid-media review.',
  };
}

function sourceManifestHash(items) {
  return sha256(stableJson(items.map((item) => ({
    locator: item.locator,
    sha256: item.sha256,
    bytes: item.bytes,
  })).sort((a, b) => a.locator.localeCompare(b.locator))));
}

async function collectPaidMediaSources(options = {}) {
  const routineId = String(options.routineId || 'W02').toUpperCase();
  if (!ROUTINES[routineId]) throw new Error('routineId must be W02 or W03.');
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const clientOperationsRoot = path.resolve(options.clientOperationsRoot || clientOperationsDefault());
  const accessRegistryPath = path.resolve(options.accessRegistryPath || accessRegistryDefault());
  const reviewDate = String(options.reviewDate || new Date().toISOString().slice(0, 10));
  const liveEvidenceFile = path.resolve(options.liveEvidenceFile || path.join(
    repoRoot,
    'System',
    'outcome-graph',
    'source-snapshots',
    `paid-media-live-${reviewDate}.json`
  ));
  const rosterFile = path.join(clientOperationsRoot, 'registry', 'paid-media-roster.json');
  const registryFile = path.join(clientOperationsRoot, 'registry', 'clients.json');
  const reviewFile = path.join(clientOperationsRoot, 'state', 'paid-media', `daily-review-${reviewDate}.json`);
  for (const required of [rosterFile, registryFile, reviewFile, accessRegistryPath, liveEvidenceFile]) {
    if (!fs.existsSync(required)) throw new Error('Required paid-media source is missing: ' + required);
  }

  const rosterPacket = filePacket(rosterFile, 'client-operations/registry/paid-media-roster.json');
  const registryPacket = filePacket(registryFile, 'client-operations/registry/clients.json');
  const reviewPacket = filePacket(
    reviewFile,
    `client-operations/state/paid-media/daily-review-${reviewDate}.json`
  );
  const livePacket = filePacket(
    liveEvidenceFile,
    normalizePath(path.relative(repoRoot, liveEvidenceFile))
  );
  const roster = readJson(rosterFile);
  const clientRegistry = readJson(registryFile);
  const reviewManifest = readJson(reviewFile);
  const accessRegistry = readJson(accessRegistryPath);
  const liveSnapshot = assertLiveSnapshot(readJson(liveEvidenceFile));
  const lanes = Array.isArray(roster.lanes) ? roster.lanes.slice().sort((a, b) =>
    Number(a.order) - Number(b.order) || String(a.laneId).localeCompare(String(b.laneId))
  ) : [];
  if (lanes.length !== 7 || lanes.some((lane) => lane.active !== true)) {
    throw new Error('Canonical paid-media roster must contain seven active lanes.');
  }
  if (reviewManifest.reviewDate !== reviewDate || reviewManifest.timezone !== 'America/New_York') {
    throw new Error('Paid-media daily manifest date or timezone does not match the requested review.');
  }
  const registryClients = Array.isArray(clientRegistry.clients) ? clientRegistry.clients : [];
  const manifestByLane = new Map((reviewManifest.lanes || []).map((lane) => [lane.laneId, lane]));
  const liveByLane = new Map((liveSnapshot.lanes || []).map((lane) => [lane.lane_id, lane]));
  const sourcePackets = [rosterPacket, registryPacket, reviewPacket, livePacket];
  const configRecords = [];
  const laneRecords = [];

  for (const lane of lanes) {
    const configFile = path.resolve(clientOperationsRoot, String(lane.configPath || ''));
    if (!configFile.startsWith(path.join(clientOperationsRoot, 'clients') + path.sep) ||
        !fs.existsSync(configFile)) {
      throw new Error('Paid-media config is missing or outside the client boundary: ' + lane.laneId);
    }
    const configLocator = normalizePath(path.relative(clientOperationsRoot, configFile));
    const configPacket = filePacket(configFile, 'client-operations/' + configLocator);
    sourcePackets.push(configPacket);
    const config = readJson(configFile);
    const platformConfig = config?.platforms?.[platformKey(lane.platform)] || null;
    const accountRef = String(platformConfig?.exactAccountRef || '');
    const registryMatches = registryClients.filter((client) => client.id === lane.clientId);
    const accessBinding = resolveAccessBinding({
      clientId: lane.clientId,
      platform: lane.platform,
      accountRef,
      accessRegistry,
    });
    const configRecord = {
      lane_id: lane.laneId,
      client_id: lane.clientId,
      platform: lane.platform,
      config_locator: configPacket.locator,
      config_sha256: configPacket.sha256,
      account_reference_sha256: accessBinding.account_reference_sha256,
      config_client_matches: config?.clientId === lane.clientId,
      planning_enabled: platformConfig?.enabledForPlanning === true,
      registry_route_count: registryMatches.length,
      registry_route_active: registryMatches.length === 1 && registryMatches[0].status === 'active',
      access_binding: accessBinding,
    };
    configRecords.push(configRecord);
    laneRecords.push({
      lane_id: lane.laneId,
      client_id: lane.clientId,
      platform: lane.platform,
      expected_delivery_state: lane.expectedDeliveryState || null,
      historical_state_as_of: lane.currentStateAsOf || null,
      config: configRecord,
      manifest: manifestByLane.get(lane.laneId) || null,
      live: liveByLane.get(lane.laneId) || null,
    });
  }

  const accessProjection = configRecords.map((record) => ({
    lane_id: record.lane_id,
    account_reference_sha256: record.account_reference_sha256,
    access_binding: record.access_binding,
  }));
  const accessText = stableJson(accessProjection);
  sourcePackets.push({
    locator: 'access-broker/registry.json#paid-media-redacted-projection',
    sha256: sha256(accessText),
    bytes: Buffer.byteLength(accessText),
    physical_path: accessRegistryPath,
  });

  let passA = null;
  if (routineId === 'W03') {
    if (!options.passAArtifact) throw new Error('W03 requires passAArtifact.');
    const passAFile = path.resolve(options.passAArtifact);
    if (!fs.existsSync(passAFile)) throw new Error('W03 pass-A artifact is missing.');
    const passAPacket = filePacket(
      passAFile,
      normalizePath(path.relative(repoRoot, passAFile))
    );
    const artifact = readJson(passAFile);
    if (artifact.routine_id !== 'W02' || artifact.pass !== 'A' || !Array.isArray(artifact.lanes)) {
      throw new Error('W03 pass-A artifact is not a W02 review packet.');
    }
    sourcePackets.push(passAPacket);
    passA = {
      locator: passAPacket.locator,
      sha256: passAPacket.sha256,
      bytes: passAPacket.bytes,
      artifact,
      by_lane: new Map(artifact.lanes.map((record) => [record.lane_id, record])),
    };
  }

  const publicManifest = sourcePackets.map(publicPacket).sort((a, b) =>
    a.locator.localeCompare(b.locator)
  );
  return {
    routine_id: routineId,
    pass: ROUTINES[routineId].pass,
    review_date: reviewDate,
    cadence_bucket: cadenceBucket(routineId, reviewDate),
    captured_at: options.capturedAt || new Date().toISOString(),
    review_window: reviewManifest.reviewWindow,
    manifest_diagnostics: manifestDiagnostics(reviewManifest),
    live_snapshot: {
      locator: livePacket.locator,
      sha256: livePacket.sha256,
      observed_at: liveSnapshot.observed_at,
      collector_states: liveSnapshot.collector_states || {},
    },
    lanes: laneRecords,
    config_records: configRecords,
    pass_a: passA,
    source_manifest: publicManifest,
    source_set_sha256: sourceManifestHash(publicManifest),
  };
}

function checkState(live, id) {
  const state = String(live?.checks?.[id]?.status || 'pending');
  return CHECK_STATES.has(state) ? state : 'pending';
}

function snapshotFreshness(live, capturedAt, maxAgeHours = 96) {
  const observed = Date.parse(live?.observed_at || '');
  const captured = Date.parse(capturedAt || '');
  if (!Number.isFinite(observed) || !Number.isFinite(captured)) {
    return { fresh: false, age_hours: null, observed_at: live?.observed_at || null };
  }
  const ageHours = (captured - observed) / 3600000;
  return {
    fresh: ageHours >= -0.1 && ageHours <= maxAgeHours,
    age_hours: Number(ageHours.toFixed(3)),
    observed_at: live.observed_at,
  };
}

function validReportWindow(live) {
  const window = live?.reporting_window;
  return Boolean(
    window && /^\d{4}-\d{2}-\d{2}$/.test(String(window.start || '')) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(window.end || '')) &&
    window.start <= window.end && window.timezone === 'America/New_York'
  );
}

function validAttribution(attribution) {
  return Boolean(
    attribution?.status === 'verified' &&
    typeof attribution.conversion_definition === 'string' && attribution.conversion_definition.trim() &&
    typeof attribution.attribution_window === 'string' && attribution.attribution_window.trim() &&
    ['accounted', 'complete'].includes(attribution.latency_state) &&
    attribution.tracking_health === 'healthy' &&
    validSha(attribution.downstream_source_sha256) &&
    attribution.downstream_reconciled === true
  );
}

function validProposal(proposal) {
  return Boolean(
    proposal && typeof proposal.hypothesis === 'string' && proposal.hypothesis.trim() &&
    typeof proposal.metric === 'string' && proposal.metric.trim() &&
    typeof proposal.owner === 'string' && proposal.owner.trim() &&
    proposal.approval_state === 'proposal_only_pending_exact_approval' &&
    typeof proposal.next_review_state === 'string' && proposal.next_review_state.trim()
  );
}

function evaluatePaidMediaLane(item, context = {}) {
  const live = item.live || null;
  const findings = [];
  const manifest = item.manifest;
  const config = item.config;
  const freshness = snapshotFreshness(live, context.captured_at, context.max_age_hours || 96);
  const accountExact = live?.account_binding_state === 'exact' && validSha(live.provider_account_sha256);
  const routeReady = config.config_client_matches && config.planning_enabled &&
    config.registry_route_count === 1 && config.registry_route_active &&
    manifest?.routeState?.reviewEligibility === 'ready-for-read-only-review' &&
    Array.isArray(manifest?.blockers) && manifest.blockers.length === 0;
  const accessReady = config.access_binding.state === 'resolved_authorized_read_only';
  const reportWindowReady = validReportWindow(live);
  const d17CheckIds = [
    'session_account',
    'delivery_pacing',
    'landing_page_health',
    channelCheckId(item.platform),
    'change_history',
    'readback_freshness',
  ];
  const d17Checks = Object.fromEntries(d17CheckIds.map((id) => [id, checkState(live, id)]));
  const d17Passed = routeReady && accessReady && accountExact && freshness.fresh &&
    reportWindowReady && Object.values(d17Checks).every((state) => state === 'verified');
  const attribution = live?.attribution || {};
  const d18Passed = d17Passed && checkState(live, 'conversion_tracking_dedup') === 'verified' &&
    validAttribution(attribution);

  if (!live) findings.push('live-lane-evidence-missing');
  if (!routeReady) findings.push('canonical-route-or-config-not-ready');
  if (!accessReady) findings.push(...config.access_binding.findings);
  if (!accountExact) findings.push(
    live?.account_binding_state === 'ambiguous' ? 'exact-provider-account-ambiguous' : 'exact-provider-account-unverified'
  );
  if (!freshness.fresh) findings.push('live-readback-stale-or-invalid');
  if (!reportWindowReady) findings.push('reporting-window-or-timezone-missing');
  for (const [id, state] of Object.entries(d17Checks)) {
    if (state !== 'verified') findings.push(`d17-${id}-${state}`);
  }
  if (checkState(live, 'conversion_tracking_dedup') !== 'verified') {
    findings.push('d18-conversion-tracking-and-dedup-not-verified');
  }
  if (!validAttribution(attribution)) findings.push('d18-attribution-and-downstream-pending-validation');

  const proposals = Array.isArray(live?.proposals) ? live.proposals : [];
  if (proposals.some((proposal) => !validProposal(proposal))) {
    findings.push('proposal-contract-incomplete');
  }
  const providerClaims = Array.isArray(live?.platform_claims)
    ? live.platform_claims.map((claim) => ({
      metric: String(claim.metric || ''),
      value: Number.isFinite(Number(claim.value)) ? Number(claim.value) : null,
      definition_label: String(claim.definition_label || ''),
      source_of_truth: false,
      downstream_reconciled: claim.downstream_reconciled === true,
    }))
    : [];
  const reviewReady = d17Passed && d18Passed && proposals.every(validProposal);
  const record = {
    schema_version: 1,
    routine_id: context.routine_id,
    pass: ROUTINES[context.routine_id].pass,
    lane_id: item.lane_id,
    client_id: item.client_id,
    platform: item.platform,
    isolation_key: `${context.routine_id}:${item.client_id}:${item.platform}:${context.cadence_bucket}`,
    review_window: live?.reporting_window || null,
    expected_delivery_state: item.expected_delivery_state,
    historical_state_as_of: item.historical_state_as_of,
    route_binding: {
      ready: routeReady,
      config_sha256: config.config_sha256,
      account_reference_sha256: config.account_reference_sha256,
      access_state: config.access_binding.state,
      access_system_sha256: config.access_binding.matched_system_sha256,
    },
    account_binding: {
      state: live?.account_binding_state || 'unverified',
      exact: accountExact,
      provider_account_sha256: accountExact ? live.provider_account_sha256 : null,
      candidate_account_sha256s: Array.isArray(live?.candidate_account_sha256s)
        ? live.candidate_account_sha256s.slice().sort()
        : [],
    },
    source_freshness: freshness,
    d17: {
      passed: d17Passed,
      checks: d17Checks,
      reporting_window_explicit: reportWindowReady,
      provider_mutation_attempted: false,
    },
    d18: {
      passed: d18Passed,
      conversion_tracking_status: checkState(live, 'conversion_tracking_dedup'),
      attribution_status: d18Passed ? 'verified' : 'pending_validation',
      conversion_definition_present: Boolean(attribution.conversion_definition),
      attribution_window_present: Boolean(attribution.attribution_window),
      latency_state: attribution.latency_state || 'unverified',
      tracking_health: attribution.tracking_health || 'unverified',
      downstream_source_bound: validSha(attribution.downstream_source_sha256),
      downstream_reconciled: attribution.downstream_reconciled === true,
      client_language: d18Passed ? 'Verified downstream outcome reporting is source-bound.' : 'Conversion reporting is pending validation',
    },
    platform_claims: providerClaims,
    provider_drafts: {
      observed: Number.isInteger(live?.unpublished_draft_count),
      count: Number.isInteger(live?.unpublished_draft_count) ? live.unpublished_draft_count : null,
      mutation_attempted: false,
    },
    proposals,
    review_ready: reviewReady,
    outcome_state: reviewReady ? 'review_ready_proposal_only' : 'held_pending_evidence',
    findings: unique(findings).sort(),
    authority: {
      proposal_only: true,
      external_action_attempted: false,
      provider_mutation_attempted: false,
      crm_mutation_attempted: false,
      canonical_write_attempted: false,
    },
  };

  if (context.routine_id === 'W03') {
    const baseline = context.pass_a_by_lane?.get(item.lane_id) || null;
    const declaredBaseline = live?.comparison?.baseline_artifact_sha256 || null;
    const baselineHashMatches = validSha(context.pass_a_sha256) && declaredBaseline === context.pass_a_sha256;
    const scopeRevalidated = Boolean(
      baseline && baseline.client_id === record.client_id && baseline.platform === record.platform &&
      baseline.route_binding?.account_reference_sha256 === record.route_binding.account_reference_sha256 &&
      baseline.account_binding?.provider_account_sha256 === record.account_binding.provider_account_sha256
    );
    const baselineObserved = Date.parse(baseline?.source_freshness?.observed_at || '');
    const currentObserved = Date.parse(record.source_freshness.observed_at || '');
    const distinctObservation = Number.isFinite(baselineObserved) && Number.isFinite(currentObserved) &&
      currentObserved > baselineObserved;
    const declaredTrend = String(live?.comparison?.classification || '');
    let trendState = 'inconclusive';
    if (!baselineHashMatches || !scopeRevalidated) trendState = 'baseline_binding_invalid';
    else if (!distinctObservation) trendState = 'held_no_distinct_observation';
    else if (!d17Passed || !d18Passed) trendState = 'pending_validation';
    else if (TREND_STATES.has(declaredTrend)) trendState = declaredTrend;
    const priorTest = live?.comparison?.prior_test || null;
    const testDecisionValid = priorTest == null || Boolean(
      typeof priorTest.hypothesis === 'string' && priorTest.hypothesis.trim() &&
      typeof priorTest.metric === 'string' && priorTest.metric.trim() &&
      ['close', 'continue', 'hold'].includes(priorTest.decision) &&
      Array.isArray(priorTest.evidence_sha256s) && priorTest.evidence_sha256s.length > 0 &&
      priorTest.evidence_sha256s.every(validSha)
    );
    record.pass_a_binding = {
      artifact_sha256: context.pass_a_sha256 || null,
      declared_hash_matches: baselineHashMatches,
      scope_revalidated: scopeRevalidated,
      distinct_observation: distinctObservation,
    };
    record.trend = {
      state: trendState,
      latency_accounted: ['accounted', 'complete'].includes(record.d18.latency_state),
      downstream_reconciled: record.d18.downstream_reconciled,
      prior_test_decision_valid: testDecisionValid,
    };
    if (!baselineHashMatches) record.findings.push('pass-a-artifact-hash-not-declared-or-mismatched');
    if (!scopeRevalidated) record.findings.push('pass-a-scope-or-account-binding-changed');
    if (!distinctObservation) record.findings.push('second-observation-not-later-than-pass-a');
    if (!testDecisionValid) record.findings.push('predeclared-test-decision-contract-invalid');
    record.findings = unique(record.findings).sort();
    record.review_ready = record.review_ready && baselineHashMatches && scopeRevalidated &&
      distinctObservation && testDecisionValid && TREND_STATES.has(trendState);
    record.outcome_state = record.review_ready
      ? 'comparison_ready_proposal_only'
      : 'held_pending_comparison_evidence';
  }

  return record;
}

function buildPlanItems(sources) {
  return sources.lanes.map((snapshot) => ({
    id: `${sources.routine_id}:${snapshot.lane_id}`,
    routine_id: sources.routine_id,
    task: `Classify ${snapshot.lane_id} from exact route, account, delivery, attribution, latency, and downstream evidence.`,
    isolation_key: `${sources.routine_id}:${snapshot.client_id}:${snapshot.platform}:${sources.cadence_bucket}`,
    evaluation_captured_at: sources.captured_at,
    input_fingerprint: sha256(stableJson({
      lane: snapshot,
      source_set_sha256: sources.source_set_sha256,
      pass_a_sha256: sources.pass_a?.sha256 || null,
      evaluation_captured_at: sources.captured_at,
    })),
    snapshot,
  }));
}

function createPaidMediaHarness(options) {
  const routineId = String(options.routineId).toUpperCase();
  const routine = ROUTINES[routineId];
  if (!routine) throw new Error('routineId must be W02 or W03.');
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = normalizePath(options.logicalRoot);
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const sourceCollector = options.collectSources;
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const correctionsFile = path.join(workspaceRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;

  function logicalArtifact(name) {
    return normalizePath(path.join(logicalRoot, name));
  }

  const contract = {
    schema_version: 1,
    graph_id: routine.graph_id,
    objective: routine.objective,
    value_signal: routineId === 'W02'
      ? 'Every recommendation is supported by a current exact-account D17 delivery packet and D18 downstream attribution receipt, or the lane remains held with exact reasons.'
      : 'Every trend statement binds the exact pass-A artifact and distinguishes measured change from latency, reporting delay, or missing downstream evidence.',
    constraints: [
      'Resolve exactly one active canonical client, platform, brand, account locator, and reporting window per lane.',
      'Treat platform-reported results as claims until conversion definition, attribution window, latency, tracking, and downstream outcomes reconcile.',
      'Persist hashes and aggregate states only; no raw account identifiers, emails, contacts, provider URLs, or communications.',
      'Write only shadow artifacts and noncanonical durable state.',
      'No send, post, publish, schedule, deploy, spend, bid, targeting, creative activation, CRM write, account change, or canonical queue mutation.',
    ],
    upstream_artifacts: [
      'client-operations/registry/paid-media-roster.json',
      'client-operations/registry/clients.json',
      'client-operations/clients/*/paid-media/config.json',
      'client-operations/state/paid-media/daily-review-<date>.json',
      'access-broker/registry.json#paid-media-redacted-projection',
      'System/outcome-graph/source-snapshots/paid-media-live-<date>.json',
      ...(routineId === 'W03' ? ['System/outcome-graph/routines/W02/*/paid-media-review-a.json'] : []),
    ],
    scope: {
      root: 'dillon-os plus read-only client-operations, Access Broker metadata, and redacted provider evidence',
      isolation_key: 'client_id:platform:account_reference_sha256:cadence_bucket',
      data_class: 'internal-redacted',
    },
    source_freshness: {
      checked_at: new Date().toISOString(),
      max_age_seconds: 300,
      evidence: 'Roster, registry, configs, daily manifest, sanitized access binding, live provider snapshot, and pass-A artifact when applicable are hashed before planning and recollected at terminal verification.',
    },
    finish_line: {
      predicate: 'Every canonical paid-media lane is independently reconstructed; D17 and D18 gates, negative states, account isolation, pass-A binding when applicable, privacy, and no-mutation authority exactly reproduce from the stable source manifest.',
      required_artifacts: [routine.review_name, routine.ledger_name].map(logicalArtifact),
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: 2,
      timeout_seconds: 600,
      max_parallel: 3,
      budget_units: 96,
    },
    adapters: {
      planner: 'paid-media-source-bound-planner',
      maker: 'paid-media-isolated-record-maker',
      checker: 'paid-media-independent-checker',
      reducer: 'paid-media-review-reducer',
      terminal_verifier: 'paid-media-terminal-verifier',
      learner: 'paid-media-correction-ledger',
    },
    approval: { external_actions: false, required_before: [] },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: 'client-operations remains canonical and read-only; this graph is evidence and readiness only',
      dedupe_key: `${routineId}:${options.cadenceBucket}:paid-media-shadow`,
      checkpoint: logicalArtifact('run-receipt.json'),
      rollback: 'Discard shadow artifacts and retain prior verified evidence; providers, CRM, messages, queue, and campaigns remain unchanged.',
      escalation: 'Return exact account ambiguity, stale evidence, attribution gaps, provider drafts, latency, route mismatch, or unsafe recommendations to Marketing Chief.',
      allowed_actions: ['read_files', 'read_redacted_provider_snapshot', 'hash_sources', 'write_shadow_artifact', 'recompute_readiness'],
      forbidden_actions: ['canonical_queue_write', 'send', 'post', 'publish', 'schedule', 'deploy', 'spend', 'account_change', 'crm_mutation', 'provider_mutation'],
    },
    learning: {
      fingerprint_inputs: ['source-manifest', 'account-reference-hashes', 'provider-account-hashes', 'D17-and-D18-findings', 'pass-A-hash', 'terminal-assertions'],
      corrections_ledger: logicalArtifact('corrections.jsonl'),
    },
  };

  function evaluationContext(sources, capturedAt = sources.captured_at) {
    return {
      routine_id: routineId,
      cadence_bucket: sources.cadence_bucket,
      captured_at: capturedAt,
      max_age_hours: 96,
      pass_a_sha256: sources.pass_a?.sha256 || null,
      pass_a_by_lane: sources.pass_a?.by_lane || null,
    };
  }

  const adapters = {
    'paid-media-source-bound-planner': async () => {
      const sources = await sourceCollector();
      return {
        evidence: `Collected ${sources.lanes.length} isolated ${routineId} paid-media lanes from source set ${sources.source_set_sha256}.`,
        source_set_sha256: sources.source_set_sha256,
        sources,
        items: buildPlanItems(sources),
      };
    },

    'paid-media-isolated-record-maker': async ({ workflow_id: workflowId, item, attempt }) => {
      const isolatedRoot = path.join(workspaceRoot, 'isolated', safeItemId(item.id));
      const artifactFile = path.join(isolatedRoot, 'record.json');
      const sources = await sourceCollector();
      const current = sources.lanes.find((lane) => lane.lane_id === item.snapshot.lane_id);
      if (!current || stableJson(current) !== stableJson(item.snapshot)) {
        throw new Error('Paid-media lane changed after planning: ' + item.snapshot.lane_id);
      }
      const record = evaluatePaidMediaLane(
        item.snapshot,
        evaluationContext(sources, item.evaluation_captured_at)
      );
      writeJsonAtomic(artifactFile, record);
      return {
        evidence: 'Built one privacy-safe D17/D18 record for ' + item.id + '.',
        isolation_id: `${workflowId}:${safeItemId(item.id)}:attempt:${attempt}`,
        artifacts: [fileEvidence(
          artifactFile,
          normalizePath(path.join(logicalRoot, 'workers', safeItemId(item.id) + '.json')),
          true
        )],
      };
    },

    'paid-media-independent-checker': async ({ item, maker_result: makerResult }) => {
      const artifact = makerResult.artifacts[0];
      const bytes = fs.readFileSync(artifact.resume_locator);
      const hashPassed = sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
      const actual = hashPassed ? JSON.parse(bytes.toString('utf8')) : null;
      const sources = await sourceCollector();
      const current = sources.lanes.find((lane) => lane.lane_id === item.snapshot.lane_id);
      const expected = current
        ? evaluatePaidMediaLane(current, evaluationContext(sources, item.evaluation_captured_at))
        : null;
      const exactPassed = hashPassed && expected && stableJson(actual) === stableJson(expected);
      return {
        evidence: 'Independently reconstructed the exact route, account, D17, D18, and comparison state for ' + item.id + '.',
        passed: Boolean(hashPassed && exactPassed),
        findings: [
          ...(!hashPassed ? ['Worker artifact hash or byte count changed.'] : []),
          ...(!exactPassed ? ['Worker record does not reproduce exactly from current source evidence.'] : []),
        ],
      };
    },

    'paid-media-review-reducer': async ({ plan, worker_results: workers }) => {
      const records = workers.map((worker) => readJson(worker.final_artifacts[0].resume_locator))
        .sort((a, b) => a.lane_id.localeCompare(b.lane_id));
      const review = {
        schema_version: 1,
        routine_id: routineId,
        pass: routine.pass,
        cadence_bucket: plan.sources.cadence_bucket,
        review_date: plan.sources.review_date,
        objective: routine.objective,
        source_set_sha256: plan.sources.source_set_sha256,
        manifest_diagnostics: plan.sources.manifest_diagnostics,
        lanes: records,
        summary: {
          lanes: records.length,
          exact_account_bindings: records.filter((record) => record.account_binding.exact).length,
          d17_passed: records.filter((record) => record.d17.passed).length,
          d18_passed: records.filter((record) => record.d18.passed).length,
          review_ready: records.filter((record) => record.review_ready).length,
          held: records.filter((record) => !record.review_ready).length,
          conversion_reporting_pending_validation: records.filter((record) => !record.d18.passed).length,
          unpublished_provider_drafts_observed: records.reduce((sum, record) =>
            sum + (Number.isInteger(record.provider_drafts.count) ? record.provider_drafts.count : 0), 0),
          account_ambiguities: records.filter((record) => record.account_binding.state === 'ambiguous').length,
          proposal_count: records.reduce((sum, record) => sum + record.proposals.length, 0),
        },
        workflow_ready: records.length > 0 && records.every((record) => record.review_ready),
        authority: {
          read_only: true,
          proposal_only: true,
          external_action_attempted: false,
          provider_mutation_attempted: false,
          crm_mutation_attempted: false,
          canonical_write_attempted: false,
        },
      };
      const ledger = routineId === 'W02'
        ? {
          schema_version: 1,
          routine_id: routineId,
          review_date: plan.sources.review_date,
          source_set_sha256: plan.sources.source_set_sha256,
          source_items: plan.sources.source_manifest,
          live_snapshot: plan.sources.live_snapshot,
          config_bindings: plan.sources.config_records.map((record) => ({
            lane_id: record.lane_id,
            client_id: record.client_id,
            platform: record.platform,
            config_locator: record.config_locator,
            config_sha256: record.config_sha256,
            account_reference_sha256: record.account_reference_sha256,
            access_binding: record.access_binding,
          })),
          manifest_diagnostics: plan.sources.manifest_diagnostics,
          authority: review.authority,
        }
        : {
          schema_version: 1,
          routine_id: routineId,
          review_date: plan.sources.review_date,
          source_set_sha256: plan.sources.source_set_sha256,
          pass_a: {
            locator: plan.sources.pass_a.locator,
            sha256: plan.sources.pass_a.sha256,
            bytes: plan.sources.pass_a.bytes,
          },
          comparisons: records.map((record) => ({
            lane_id: record.lane_id,
            client_id: record.client_id,
            platform: record.platform,
            pass_a_binding: record.pass_a_binding,
            trend: record.trend,
            outcome_state: record.outcome_state,
            findings: record.findings,
          })),
          authority: review.authority,
        };
      const stagingRoot = path.join(workspaceRoot, 'staged');
      fs.mkdirSync(stagingRoot, { recursive: true });
      writeJsonAtomic(path.join(stagingRoot, routine.review_name), review);
      writeJsonAtomic(path.join(stagingRoot, routine.ledger_name), ledger);
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: `Reduced all checked ${routineId} lanes into a review and hashed evidence ledger without blending clients or promoting platform claims.`,
        artifacts: [routine.review_name, routine.ledger_name].map((name) =>
          fileEvidence(path.join(stagingRoot, name), logicalArtifact(name))
        ),
        staging_root: stagingRoot,
      };
    },

    'paid-media-terminal-verifier': async ({ plan, reduction }) => {
      const fresh = await sourceCollector();
      const review = readJson(path.join(reduction.staging_root, routine.review_name));
      const ledger = readJson(path.join(reduction.staging_root, routine.ledger_name));
      const context = evaluationContext(fresh, plan.sources.captured_at);
      const expected = fresh.lanes.map((lane) => evaluatePaidMediaLane(lane, context))
        .sort((a, b) => a.lane_id.localeCompare(b.lane_id));
      const expectedReady = expected.length > 0 && expected.every((record) => record.review_ready);
      const serialized = stableJson({ review, ledger });
      const uniqueIsolation = new Set(review.lanes.map((lane) => lane.isolation_key)).size === review.lanes.length;
      const d17d18Faithful = review.lanes.every((record) =>
        record.d17.passed === Boolean(expected.find((item) => item.lane_id === record.lane_id)?.d17.passed) &&
        record.d18.passed === Boolean(expected.find((item) => item.lane_id === record.lane_id)?.d18.passed)
      );
      const passBFaithful = routineId !== 'W03' || review.lanes.every((record) =>
        record.pass_a_binding && record.trend &&
        typeof record.pass_a_binding.declared_hash_matches === 'boolean' &&
        typeof record.pass_a_binding.scope_revalidated === 'boolean' &&
        typeof record.pass_a_binding.distinct_observation === 'boolean'
      );
      const assertions = [
        {
          id: 'source-manifest-stable',
          passed: fresh.source_set_sha256 === plan.source_set_sha256,
          detail: 'Roster, registry, configs, daily manifest, access projection, live snapshot, and pass-A artifact when applicable remain hash-bound.',
        },
        {
          id: 'every-canonical-lane-exactly-once',
          passed: review.lanes.length === fresh.lanes.length &&
            stableJson(review.lanes) === stableJson(expected),
          detail: 'Every canonical client-account-channel lane is independently reconstructed exactly once.',
        },
        {
          id: 'd17-d18-and-negative-readiness-faithful',
          passed: d17d18Faithful && review.workflow_ready === expectedReady &&
            review.summary.review_ready === expected.filter((record) => record.review_ready).length,
          detail: 'D17, D18, pending validation, and aggregate readiness exactly equal their lane evidence, including negative states.',
        },
        {
          id: 'client-account-channel-isolation',
          passed: uniqueIsolation && review.lanes.every((lane) =>
            lane.isolation_key.includes(lane.client_id) && lane.isolation_key.includes(lane.platform)
          ),
          detail: 'No client, brand, platform, account, or reporting lane is blended.',
        },
        {
          id: 'pass-a-and-latency-comparison-faithful',
          passed: passBFaithful,
          detail: routineId === 'W03'
            ? 'Every comparison exposes exact pass-A hash, scope, observation ordering, latency, and downstream state.'
            : 'Pass A has no undeclared comparison dependency.',
        },
        {
          id: 'proposal-contract-and-platform-claim-boundary',
          passed: review.lanes.every((lane) =>
            lane.proposals.every(validProposal) &&
            lane.platform_claims.every((claim) => claim.source_of_truth === false)
          ),
          detail: 'Recommendations remain complete proposals and platform-reported results never become downstream truth.',
        },
        {
          id: 'privacy-and-no-mutation-boundary',
          passed: !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized) &&
            !/(?:act|customer_id|account_id)=\d+/i.test(serialized) &&
            !/secret_ref|password|access_token|refresh_token|cookie/i.test(serialized) &&
            !/access-broker:[^"\s]+/i.test(serialized) &&
            review.authority.external_action_attempted === false &&
            review.authority.provider_mutation_attempted === false &&
            review.authority.crm_mutation_attempted === false &&
            review.authority.canonical_write_attempted === false,
          detail: 'Final artifacts contain hashes and aggregate states only and attest no provider, CRM, delivery, spend, or canonical mutation.',
        },
      ];
      return {
        evidence: `Recollected and independently verified all ${routineId} sources, lane records, negative states, privacy, authority, and artifact hashes.`,
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: [routine.review_name, routine.ledger_name].map((name) =>
          fileEvidence(path.join(reduction.staging_root, name), logicalArtifact(name))
        ),
      };
    },

    'paid-media-correction-ledger': async ({ outcome }) => {
      const correction = outcome === 'terminal_true'
        ? 'Keep manifest eligibility separate from review readiness; retain exact account, D17, D18, latency, downstream, and pass-A findings until their named evidence revalidates.'
        : 'Recollect the changed paid-media source set and repair only the exact route, account, evidence, comparison, privacy, or authority assertion that failed.';
      const entry = {
        recorded_at: new Date().toISOString(),
        graph_id: contract.graph_id,
        routine_id: routineId,
        outcome,
        correction,
      };
      const serialized = JSON.stringify(entry);
      fs.appendFileSync(correctionsFile, serialized + '\n', 'utf8');
      return {
        evidence: `Appended one hashed ${routineId} paid-media correction entry.`,
        corrections: [correction],
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
    correctionsFile,
    commitVerifiedArtifacts() {
      if (!verifiedStagingRoot) throw new Error('No terminal-verified paid-media review is staged.');
      fs.mkdirSync(outputDir, { recursive: true });
      for (const name of [routine.review_name, routine.ledger_name]) {
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

function verifyResumedPaidMediaWorker({ item, worker_result: workerResult }) {
  if (workerResult?.status !== 'verified' || workerResult?.item_id !== item.id ||
      workerResult?.input_fingerprint !== item.input_fingerprint) return false;
  const artifacts = workerResult.final_artifacts;
  if (!Array.isArray(artifacts) || artifacts.length !== 1) return false;
  const artifact = artifacts[0];
  if (!artifact.resume_locator || !fs.existsSync(artifact.resume_locator)) return false;
  const bytes = fs.readFileSync(artifact.resume_locator);
  return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
}

function finalNames(routineId) {
  const routine = ROUTINES[String(routineId).toUpperCase()];
  if (!routine) throw new Error('routineId must be W02 or W03.');
  return [routine.review_name, routine.ledger_name];
}

function verifyCompletedPaidMedia(result, outputDir, routineId) {
  const names = finalNames(routineId);
  const manifest = result.terminal_evidence?.artifact_manifest;
  if (!Array.isArray(manifest) || manifest.length !== names.length) return false;
  return names.every((name) => {
    const declared = manifest.find((artifact) => path.basename(artifact.path) === name);
    const file = path.join(outputDir, name);
    if (!declared || !fs.existsSync(file)) return false;
    const bytes = fs.readFileSync(file);
    return sha256(bytes) === declared.sha256 && bytes.length === declared.bytes;
  });
}

function assertSafePaidMediaOutput(candidate, routineId, repoRoot = REPO_ROOT) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(repoRoot);
  if (!absolute.startsWith(root + path.sep)) {
    throw new Error('Paid-media shadow output must remain inside the Dillon OS repository.');
  }
  const relative = normalizePath(path.relative(root, absolute));
  const expected = String(routineId).toUpperCase();
  const pattern = new RegExp(`^System/outcome-graph/routines/${expected}/\\d{4}-W\\d{2}[AB](?:-[a-z0-9-]+)?$`, 'i');
  if (!pattern.test(relative)) {
    throw new Error(`Paid-media ${expected} output must use System/outcome-graph/routines/${expected}/YYYY-WwwA|B[-slug].`);
  }
  return absolute;
}

async function runPaidMediaPassDurable(options = {}) {
  const routineId = String(options.routineId || 'W02').toUpperCase();
  if (!ROUTINES[routineId]) throw new Error('routineId must be W02 or W03.');
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const reviewDate = String(options.reviewDate || new Date().toISOString().slice(0, 10));
  const bucket = options.cadenceBucket || cadenceBucket(routineId, reviewDate);
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafePaidMediaOutput(options.outputDir, routineId, repoRoot);
  const stateRoot = path.resolve(options.stateRoot || path.join(
    repoRoot,
    '12_Brain',
    'state',
    'outcome-graph'
  ));
  const logicalRoot = options.logicalRoot || normalizePath(path.relative(repoRoot, outputDir));
  const collectSources = options.collectSources || (() => collectPaidMediaSources({
    routineId,
    repoRoot,
    clientOperationsRoot: options.clientOperationsRoot,
    accessRegistryPath: options.accessRegistryPath,
    reviewDate,
    liveEvidenceFile: options.liveEvidenceFile,
    passAArtifact: options.passAArtifact,
    capturedAt: options.capturedAt,
  }));
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    `paid-media-${routineId.toLowerCase()}-${sha256(logicalRoot).slice(0, 20)}`
  );
  const harness = createPaidMediaHarness({
    routineId,
    outputDir,
    logicalRoot,
    workspaceRoot,
    collectSources,
    cadenceBucket: bucket,
  });
  const readCanonicalBinding = async () => {
    const sources = await collectSources();
    return {
      locator: `dillon-os://paid-media/${routineId}/${sources.cadence_bucket}`,
      version: `${sources.review_date}:${sources.lanes.length}:${sources.pass_a?.sha256 || 'no-baseline'}`,
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
      verifyResumedWorker: verifyResumedPaidMediaWorker,
      verifyCompletedResult: (prior) => verifyCompletedPaidMedia(prior, outputDir, routineId),
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
  CHECK_IDS,
  ROUTINES,
  assertLiveSnapshot,
  assertSafePaidMediaOutput,
  cadenceBucket,
  collectPaidMediaSources,
  createPaidMediaHarness,
  evaluatePaidMediaLane,
  finalNames,
  manifestDiagnostics,
  parseAccountReference,
  resolveAccessBinding,
  runPaidMediaPassDurable,
  verifyCompletedPaidMedia,
  verifyResumedPaidMediaWorker,
};
