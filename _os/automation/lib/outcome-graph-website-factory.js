'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { parseCsv } = require('./direct-mail');
const { sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph, writeJsonAtomic } = require('./outcome-graph-state');
const {
  validateWebsiteQualityEvidence,
} = require('../../../_templates/site-factory/workflow/contract');

const FINAL_NAMES = ['W05-website-factory-readiness.json'];
const TARGET_COUNT = 20;
const SOURCE_MAX_AGE_SECONDS = 26 * 60 * 60;
const GATE_IDS = [
  'freshness',
  'source-pool',
  'selection',
  'build-browser-qa',
  'generated-assets',
  'impeccable-detector',
  'independent-quality',
  'authority-boundary',
];
const SUCCESS_FILES = [
  'PREFLIGHT-EVIDENCE.json',
  'SELECTION-EVIDENCE.json',
  'SOURCE-STATUS.json',
  'BUILD-RECEIPT.json',
  'batch.json',
  'batch-summary.json',
  'index.html',
  'manifest.csv',
  'prospects.csv',
  'GENERATED-STOCK-RECEIPT.json',
  'IMPECCABLE-DETECTOR.json',
  'FINAL-AUDIT.json',
  'QUALITY-GATE.json',
];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
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

function sourcePacket(file, locator, includeText = false) {
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(locator),
    sha256: sha256(bytes),
    bytes: bytes.length,
    physical_path: file,
    ...(includeText ? { text: bytes.toString('utf8').replace(/^\uFEFF/, '') } : {}),
  };
}

function buildManifest(packets) {
  return packets
    .map((packet) => ({
      locator: packet.locator,
      sha256: packet.sha256,
      bytes: packet.bytes,
    }))
    .sort((a, b) => a.locator.localeCompare(b.locator));
}

function insideRoot(candidate, root, label) {
  const absolute = path.resolve(candidate);
  const resolvedRoot = path.resolve(root);
  if (absolute !== resolvedRoot && !absolute.startsWith(resolvedRoot + path.sep)) {
    throw new Error(label + ' escapes the Dillon OS repository.');
  }
  return absolute;
}

function firstExisting(candidates) {
  return candidates.find((file) => file && fs.existsSync(file)) || null;
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function rejectionCategory(reason) {
  const value = String(reason || '').toLowerCase();
  if (/fetch failed|http 5\d\d/.test(value)) return 'source-unreachable';
  if (/http 403/.test(value)) return 'source-forbidden';
  if (/http 404/.test(value)) return 'source-not-found';
  if (/http 429/.test(value)) return 'source-rate-limited';
  if (/logo/.test(value)) return 'exact-logo-unavailable';
  if (/generated-stock|approved.*board|board.*approved/.test(value)) {
    return 'approved-image-board-unavailable';
  }
  if (/visual reference/.test(value)) return 'first-party-reference-unavailable';
  return 'other-source-gate';
}

function countBy(values) {
  return values.reduce((out, value) => {
    out[value] = (out[value] || 0) + 1;
    return out;
  }, {});
}

function uniqueCount(values) {
  return new Set(values.filter((value) => String(value || '').trim())).size;
}

function latestLegacyW05(repoRoot, packets) {
  const queueRoot = path.join(repoRoot, '12_Brain', 'queue');
  if (!fs.existsSync(queueRoot)) return null;
  const files = fs.readdirSync(queueRoot)
    .filter((name) => /^claude-loop-\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
    .sort()
    .reverse();
  for (const name of files) {
    const file = path.join(queueRoot, name);
    const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter(Boolean).reverse();
    for (const line of lines) {
      try {
        const receipt = JSON.parse(line);
        if (receipt.routine_id !== 'W05') continue;
        packets.push(sourcePacket(file, normalizePath(path.relative(repoRoot, file))));
        const declaredArtifacts = Array.isArray(receipt.receipt?.artifact_paths)
          ? receipt.receipt.artifact_paths
          : [];
        return {
          observed: true,
          source_locator: normalizePath(path.relative(repoRoot, file)),
          run_id: receipt.run_id || null,
          outcome: receipt.outcome || null,
          claimed_independent_verification: receipt.independent_verified === true,
          declared_artifact_count: declaredArtifacts.length,
          declared_artifacts_present: declaredArtifacts.filter((locator) =>
            fs.existsSync(path.join(repoRoot, locator))
          ).length,
        };
      } catch {
        // Ignore unrelated malformed lines and continue to older receipts.
      }
    }
  }
  return null;
}

function loadOptionalJson({ candidates, locator, packets }) {
  const file = firstExisting(candidates);
  if (!file) return { file: null, packet: null, value: null };
  const packet = sourcePacket(file, locator, true);
  packets.push(packet);
  return { file, packet, value: JSON.parse(packet.text) };
}

function loadOptionalFile({ candidates, locator, packets, includeText = false }) {
  const file = firstExisting(candidates);
  if (!file) return { file: null, packet: null };
  const packet = sourcePacket(file, locator, includeText);
  packets.push(packet);
  return { file, packet };
}

function aggregatePreflight(value) {
  const ready = Array.isArray(value?.ready) ? value.ready : [];
  const rejected = Array.isArray(value?.rejected) ? value.rejected : [];
  return {
    candidate_pool: finiteNumber(value?.candidatePool),
    ready_count: ready.length,
    rejected_count: rejected.length,
    ready_unique_identity_count: uniqueCount(ready.map((item) => item.domain)),
    ready_unique_slug_count: uniqueCount(ready.map((item) => item.slug)),
    rejection_categories: countBy(rejected.map((item) => rejectionCategory(item.reason))),
  };
}

function aggregateSelection(value) {
  const selection = Array.isArray(value?.selection) ? value.selection : [];
  return {
    count: selection.length,
    unique_identity_count: uniqueCount(selection.map((item) => item.domain)),
    unique_slug_count: uniqueCount(selection.map((item) => item.slug)),
    transparent_logo_count: selection.filter((item) => item.logoTransparent === true).length,
    prior_artifacts_scanned: finiteNumber(value?.priorEvidence?.filesScanned),
    prior_identities_excluded: finiteNumber(value?.priorEvidence?.completedDomains),
    slugs: selection.map((item) => item.slug).filter((slug) =>
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || ''))
    ),
  };
}

function aggregateBatchSummary(value) {
  const results = Array.isArray(value?.results) ? value.results : [];
  return {
    target_count: finiteNumber(value?.targetCount),
    brief_count: finiteNumber(value?.briefCount),
    qa_ready_count: finiteNumber(value?.qaReadyCount),
    result_count: results.length,
    browser_pass_count: results.filter((item) =>
      item.qa === 'PASS' && item.visualQa === 'ran' && item.qaReady === 'ready'
    ).length,
    mail_ready_always_hold: value?.mailReadyAlwaysHold === true,
    ok: value?.ok === true,
  };
}

function aggregateFinalAudit(value) {
  const checks = Array.isArray(value?.checks) ? value.checks : [];
  const failures = Array.isArray(value?.failures) ? value.failures : [];
  return {
    status: value?.status || null,
    check_count: checks.length,
    passing_checks: checks.filter((item) => item.pass === true).length,
    failure_count: failures.length,
    selected_count: finiteNumber(value?.selection?.count),
    qa_ready_count: finiteNumber(value?.build?.qaReady),
    mail_ready: value?.build?.mailReady || null,
    deployment: value?.build?.deployment || null,
  };
}

function verifyRecording(qualityGate, packets) {
  const recording = qualityGate?.demo_recording;
  if (!recording || typeof recording !== 'object' || !recording.path) {
    return { present: false, hash_matches: false, bytes_match: false };
  }
  const file = path.resolve(String(recording.path));
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return { present: false, hash_matches: false, bytes_match: false };
  }
  const packet = sourcePacket(
    file,
    'recording://sha256/' + String(recording.sha256 || '').toLowerCase()
  );
  packets.push(packet);
  return {
    present: true,
    hash_matches: packet.sha256 === String(recording.sha256 || '').toLowerCase(),
    bytes_match: packet.bytes === Number(recording.bytes),
  };
}

function aggregateQualityGate(value, recording) {
  const validation = validateWebsiteQualityEvidence(value);
  return {
    present: Boolean(value),
    schema_valid: validation.ok,
    validation_error_count: validation.errors.length,
    qa_ready: value?.qa_ready || 'hold',
    maker_checker_distinct: Boolean(
      value?.independent_review?.maker_id &&
      value?.independent_review?.checker_id &&
      value.independent_review.maker_id !== value.independent_review.checker_id
    ),
    recording_present: recording.present,
    recording_hash_matches: recording.hash_matches,
    recording_bytes_match: recording.bytes_match,
    demo_reviewed: value?.independent_review?.demo_reviewed === true,
    checker_verdict: value?.independent_review?.verdict || null,
    visual_verdict: value?.independent_review?.visual_review?.verdict || null,
    required_viewports_present: ['desktop', 'mobile'].every((viewport) =>
      value?.independent_review?.visual_review?.viewports?.includes(viewport)
    ),
  };
}

function inspectSites(batchDir, slugs, repoRoot, packets) {
  const uniqueSlugs = [...new Set(slugs)];
  let indexCount = 0;
  let noindexCount = 0;
  for (const slug of uniqueSlugs) {
    const file = path.join(batchDir, 'sites', slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const logicalId = sha256(slug).slice(0, 16);
    const packet = sourcePacket(file, `site://w05/${logicalId}/index.html`, true);
    packets.push(packet);
    indexCount += 1;
    if (/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']/i.test(packet.text)) {
      noindexCount += 1;
    }
  }
  const siteRoot = path.join(batchDir, 'sites');
  const directoryCount = fs.existsSync(siteRoot)
    ? fs.readdirSync(siteRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length
    : 0;
  return { directory_count: directoryCount, index_count: indexCount, noindex_count: noindexCount };
}

function inspectProspects(packet) {
  if (!packet) return { rows: 0, qa_ready: 0, mail_hold: 0, mail_ready_other: 0 };
  const rows = parseCsv(packet.text);
  return {
    rows: rows.length,
    qa_ready: rows.filter((row) => row.qa_ready === 'ready').length,
    mail_hold: rows.filter((row) => row.mail_ready === 'hold').length,
    mail_ready_other: rows.filter((row) => row.mail_ready !== 'hold').length,
  };
}

async function collectWebsiteFactorySources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const asOf = new Date(options.asOf || new Date());
  if (!Number.isFinite(asOf.getTime())) throw new Error('asOf is invalid');
  const stateFile = path.resolve(options.stateFile || path.join(
    repoRoot,
    'automation',
    'prospect-radar-next20',
    'latest-daily-state.json'
  ));
  if (!fs.existsSync(stateFile)) throw new Error('W05 current automation state is missing.');
  const packets = [];
  const statePacket = sourcePacket(
    stateFile,
    'automation/prospect-radar-next20/latest-daily-state.json',
    true
  );
  packets.push(statePacket);
  const state = JSON.parse(statePacket.text);
  const runId = String(state.run_id || '');
  if (!/^\d{8}-\d{6}$/.test(runId)) throw new Error('W05 current state has an invalid run_id.');
  const defaultBatchDir = path.join(
    repoRoot,
    '02_Campaigns',
    'AI Site Builder Outreach Engine',
    'batches',
    'radar-next20-' + runId
  );
  const batchDir = insideRoot(options.batchDir || state.batch_dir || defaultBatchDir, repoRoot, 'W05 batch');
  const runDir = insideRoot(options.runDir || path.join(
    repoRoot,
    'automation',
    'prospect-radar-next20',
    'runs',
    runId
  ), repoRoot, 'W05 run');
  const logicalBatch = `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-${runId}`;
  const logicalRun = `automation/prospect-radar-next20/runs/${runId}`;

  const json = {};
  const jsonSpecs = [
    ['preflight', 'PREFLIGHT-EVIDENCE.json', [path.join(batchDir, 'PREFLIGHT-EVIDENCE.json'), path.join(runDir, 'PREFLIGHT-EVIDENCE.json')]],
    ['selection', 'SELECTION-EVIDENCE.json', [path.join(batchDir, 'SELECTION-EVIDENCE.json'), path.join(runDir, 'SELECTION-EVIDENCE.json')]],
    ['sourceStatus', 'SOURCE-STATUS.json', [path.join(batchDir, 'SOURCE-STATUS.json'), path.join(runDir, 'SOURCE-STATUS.json')]],
    ['buildReceipt', 'BUILD-RECEIPT.json', [path.join(batchDir, 'BUILD-RECEIPT.json'), path.join(runDir, 'BUILD-RECEIPT.json')]],
    ['batch', 'batch.json', [path.join(batchDir, 'batch.json')]],
    ['batchSummary', 'batch-summary.json', [path.join(batchDir, 'batch-summary.json')]],
    ['generatedStock', 'GENERATED-STOCK-RECEIPT.json', [path.join(batchDir, 'GENERATED-STOCK-RECEIPT.json'), path.join(runDir, 'GENERATED-STOCK-RECEIPT.json')]],
    ['detector', 'IMPECCABLE-DETECTOR.json', [path.join(runDir, 'IMPECCABLE-DETECTOR.json'), path.join(batchDir, 'IMPECCABLE-DETECTOR.json')]],
    ['finalAudit', 'FINAL-AUDIT.json', [path.join(batchDir, 'FINAL-AUDIT.json'), path.join(runDir, 'FINAL-AUDIT.json')]],
    ['qualityGate', 'QUALITY-GATE.json', [path.join(batchDir, 'QUALITY-GATE.json'), path.join(runDir, 'QUALITY-GATE.json')]],
    ['blockedSelection', 'BLOCKED-RECEIPT.json', [path.join(batchDir, 'BLOCKED-RECEIPT.json'), path.join(runDir, 'BLOCKED-RECEIPT.json')]],
    ['blockedDaily', 'BLOCKED-DAILY-RECEIPT.json', [path.join(runDir, 'BLOCKED-DAILY-RECEIPT.json')]],
  ];
  for (const [key, name, candidates] of jsonSpecs) {
    json[key] = loadOptionalJson({
      candidates,
      locator: (candidates[0].startsWith(batchDir) ? logicalBatch : logicalRun) + '/' + name,
      packets,
    });
  }

  const files = {};
  for (const name of ['index.html', 'manifest.csv', 'prospects.csv']) {
    files[name] = loadOptionalFile({
      candidates: [path.join(batchDir, name)],
      locator: logicalBatch + '/' + name,
      packets,
      includeText: name === 'prospects.csv',
    });
  }
  const recording = verifyRecording(json.qualityGate.value, packets);
  const preflight = aggregatePreflight(json.preflight.value);
  const selection = aggregateSelection(json.selection.value);
  const summary = aggregateBatchSummary(json.batchSummary.value);
  const finalAudit = aggregateFinalAudit(json.finalAudit.value);
  const qualityGate = aggregateQualityGate(json.qualityGate.value, recording);
  const sites = inspectSites(batchDir, selection.slugs, repoRoot, packets);
  const prospects = inspectProspects(files['prospects.csv'].packet);
  const detector = Array.isArray(json.detector.value)
    ? { present: true, finding_count: json.detector.value.length, passed: json.detector.value.length === 0 }
    : { present: false, finding_count: 0, passed: false };
  const stock = {
    present: Boolean(json.generatedStock.value),
    site_count: finiteNumber(json.generatedStock.value?.siteCount),
    image_count: finiteNumber(json.generatedStock.value?.imageCount),
    unassigned_count: finiteNumber(json.generatedStock.value?.unassignedCount),
  };
  const build = {
    present: Boolean(json.buildReceipt.value),
    status: json.buildReceipt.value?.status || null,
    selected_count: finiteNumber(json.buildReceipt.value?.selected),
    qa_ready_count: finiteNumber(json.buildReceipt.value?.qaReady),
    summary_hash_matches: Boolean(
      json.buildReceipt.value?.batchSummarySha256 &&
      json.batchSummary.packet?.sha256 === String(json.buildReceipt.value.batchSummarySha256).toLowerCase()
    ),
  };
  const updatedAt = new Date(state.updated_at);
  const sourceAgeSeconds = Number.isFinite(updatedAt.getTime())
    ? Math.max(0, Math.floor((asOf.getTime() - updatedAt.getTime()) / 1000))
    : null;
  const inventory = Object.fromEntries(SUCCESS_FILES.map((name) => {
    if (name === 'IMPECCABLE-DETECTOR.json') return [name, detector.present];
    if (name === 'GENERATED-STOCK-RECEIPT.json') return [name, stock.present];
    if (name === 'QUALITY-GATE.json') return [name, qualityGate.present];
    if (name === 'PREFLIGHT-EVIDENCE.json') return [name, Boolean(json.preflight.value)];
    if (name === 'SELECTION-EVIDENCE.json') return [name, Boolean(json.selection.value)];
    if (name === 'SOURCE-STATUS.json') return [name, Boolean(json.sourceStatus.value)];
    if (name === 'BUILD-RECEIPT.json') return [name, build.present];
    if (name === 'batch.json') return [name, Boolean(json.batch.value)];
    if (name === 'batch-summary.json') return [name, Boolean(json.batchSummary.value)];
    if (name === 'FINAL-AUDIT.json') return [name, Boolean(json.finalAudit.value)];
    return [name, Boolean(files[name]?.file)];
  }));
  const legacy = latestLegacyW05(repoRoot, packets);
  const manifest = buildManifest(packets);
  return {
    captured_at: asOf.toISOString(),
    repo_root: repoRoot,
    run_id: runId,
    operational_state: {
      status: state.status || null,
      updated_at: Number.isFinite(updatedAt.getTime()) ? updatedAt.toISOString() : null,
      source_age_seconds: sourceAgeSeconds,
      source_fresh: sourceAgeSeconds !== null && sourceAgeSeconds <= SOURCE_MAX_AGE_SECONDS,
      mail_ready: state.mail_ready || null,
      local_only_claimed: /local-only/i.test(String(state.delivery || '')),
      no_external_delivery_claimed: /no outreach.*publish.*deploy.*crm.*queue write/i.test(String(state.delivery || '')),
    },
    preflight,
    selection,
    build,
    summary,
    final_audit: finalAudit,
    stock,
    detector,
    quality_gate: qualityGate,
    sites,
    prospects,
    inventory: {
      expected: SUCCESS_FILES,
      present: Object.entries(inventory).filter(([, present]) => present).map(([name]) => name),
      missing: Object.entries(inventory).filter(([, present]) => !present).map(([name]) => name),
    },
    blocked_receipts: {
      selection: json.blockedSelection.value?.status || null,
      daily: json.blockedDaily.value?.status || null,
    },
    legacy_completion_claim: legacy,
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
  };
}

function freshnessPass(snapshot) {
  return snapshot.operational_state.source_fresh === true;
}

function sourcePoolPass(snapshot) {
  return freshnessPass(snapshot) &&
    snapshot.preflight.ready_count >= TARGET_COUNT &&
    snapshot.preflight.ready_unique_identity_count >= TARGET_COUNT &&
    snapshot.preflight.ready_unique_slug_count >= TARGET_COUNT;
}

function selectionPass(snapshot) {
  return sourcePoolPass(snapshot) &&
    snapshot.selection.count === TARGET_COUNT &&
    snapshot.selection.unique_identity_count === TARGET_COUNT &&
    snapshot.selection.unique_slug_count === TARGET_COUNT &&
    snapshot.selection.transparent_logo_count === TARGET_COUNT &&
    snapshot.selection.prior_artifacts_scanned >= 1;
}

function buildPass(snapshot) {
  return selectionPass(snapshot) &&
    snapshot.build.present &&
    snapshot.build.status === 'built-and-browser-qa-passed' &&
    snapshot.build.selected_count === TARGET_COUNT &&
    snapshot.build.qa_ready_count === TARGET_COUNT &&
    snapshot.build.summary_hash_matches &&
    snapshot.summary.target_count === TARGET_COUNT &&
    snapshot.summary.brief_count === TARGET_COUNT &&
    snapshot.summary.qa_ready_count === TARGET_COUNT &&
    snapshot.summary.result_count === TARGET_COUNT &&
    snapshot.summary.browser_pass_count === TARGET_COUNT &&
    snapshot.summary.mail_ready_always_hold &&
    snapshot.summary.ok &&
    snapshot.sites.directory_count === TARGET_COUNT &&
    snapshot.sites.index_count === TARGET_COUNT &&
    snapshot.sites.noindex_count === TARGET_COUNT &&
    snapshot.final_audit.status === 'PASS' &&
    snapshot.final_audit.failure_count === 0 &&
    snapshot.final_audit.check_count > 0 &&
    snapshot.final_audit.passing_checks === snapshot.final_audit.check_count &&
    snapshot.final_audit.selected_count === TARGET_COUNT &&
    snapshot.final_audit.qa_ready_count === TARGET_COUNT &&
    snapshot.final_audit.mail_ready === 'hold';
}

function assetPass(snapshot) {
  return buildPass(snapshot) &&
    snapshot.stock.present &&
    snapshot.stock.site_count === TARGET_COUNT &&
    snapshot.stock.image_count === TARGET_COUNT * 4 &&
    snapshot.stock.unassigned_count === 0;
}

function detectorPass(snapshot) {
  return buildPass(snapshot) && snapshot.detector.present && snapshot.detector.passed;
}

function qualityPass(snapshot) {
  return assetPass(snapshot) && detectorPass(snapshot) &&
    snapshot.quality_gate.present &&
    snapshot.quality_gate.schema_valid &&
    snapshot.quality_gate.qa_ready === 'ready' &&
    snapshot.quality_gate.maker_checker_distinct &&
    snapshot.quality_gate.recording_present &&
    snapshot.quality_gate.recording_hash_matches &&
    snapshot.quality_gate.recording_bytes_match &&
    snapshot.quality_gate.demo_reviewed &&
    snapshot.quality_gate.checker_verdict === 'pass' &&
    snapshot.quality_gate.visual_verdict === 'pass' &&
    snapshot.quality_gate.required_viewports_present;
}

function authorityPass(snapshot) {
  return buildPass(snapshot) &&
    snapshot.prospects.rows === TARGET_COUNT &&
    snapshot.prospects.qa_ready === TARGET_COUNT &&
    snapshot.prospects.mail_hold === TARGET_COUNT &&
    snapshot.prospects.mail_ready_other === 0 &&
    snapshot.operational_state.mail_ready === 'hold' &&
    snapshot.operational_state.local_only_claimed &&
    snapshot.operational_state.no_external_delivery_claimed;
}

function held(gateId, metrics, reasons, state = 'hold') {
  return {
    schema_version: 1,
    routine_id: 'W05',
    gate_id: gateId,
    state,
    passed: false,
    reasons,
    metrics,
    valid: true,
    external_action_attempted: false,
  };
}

function passed(gateId, metrics) {
  return {
    schema_version: 1,
    routine_id: 'W05',
    gate_id: gateId,
    state: 'pass',
    passed: true,
    reasons: [],
    metrics,
    valid: true,
    external_action_attempted: false,
  };
}

function evaluateFactoryGate(gateId, snapshot) {
  if (gateId === 'freshness') {
    const metrics = {
      source_age_seconds: snapshot.operational_state.source_age_seconds,
      max_age_seconds: SOURCE_MAX_AGE_SECONDS,
    };
    return freshnessPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['current-automation-state-is-stale-or-undated']);
  }
  if (gateId === 'source-pool') {
    const metrics = {
      target: TARGET_COUNT,
      candidate_pool: snapshot.preflight.candidate_pool,
      ready: snapshot.preflight.ready_count,
      rejected: snapshot.preflight.rejected_count,
      unique_ready_identities: snapshot.preflight.ready_unique_identity_count,
      unique_ready_slugs: snapshot.preflight.ready_unique_slug_count,
      rejection_categories: snapshot.preflight.rejection_categories,
    };
    if (!freshnessPass(snapshot)) return held(gateId, metrics, ['freshness-gate-not-met'], 'not_reached');
    return sourcePoolPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, [`source-ready-pool-is-${snapshot.preflight.ready_count}-of-${TARGET_COUNT}`]);
  }
  if (gateId === 'selection') {
    const metrics = {
      target: TARGET_COUNT,
      selected: snapshot.selection.count,
      unique_identities: snapshot.selection.unique_identity_count,
      unique_slugs: snapshot.selection.unique_slug_count,
      exact_transparent_logos: snapshot.selection.transparent_logo_count,
      prior_artifacts_scanned: snapshot.selection.prior_artifacts_scanned,
    };
    if (!sourcePoolPass(snapshot)) return held(gateId, metrics, ['source-pool-gate-not-met'], 'not_reached');
    return selectionPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['exact-selection-contract-not-met']);
  }
  if (gateId === 'build-browser-qa') {
    const metrics = {
      build_receipt_present: snapshot.build.present,
      selected: snapshot.build.selected_count,
      qa_ready: snapshot.build.qa_ready_count,
      summary_hash_matches: snapshot.build.summary_hash_matches,
      briefs: snapshot.summary.brief_count,
      browser_passes: snapshot.summary.browser_pass_count,
      site_directories: snapshot.sites.directory_count,
      noindex_sites: snapshot.sites.noindex_count,
      final_audit_status: snapshot.final_audit.status,
      final_audit_failures: snapshot.final_audit.failure_count,
    };
    if (!selectionPass(snapshot)) return held(gateId, metrics, ['selection-gate-not-met'], 'not_reached');
    return buildPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['build-browser-qa-or-final-audit-contract-not-met']);
  }
  if (gateId === 'generated-assets') {
    const metrics = {
      receipt_present: snapshot.stock.present,
      sites: snapshot.stock.site_count,
      images: snapshot.stock.image_count,
      unassigned_sites: snapshot.stock.unassigned_count,
      expected_images: TARGET_COUNT * 4,
    };
    if (!buildPass(snapshot)) return held(gateId, metrics, ['build-browser-qa-gate-not-met'], 'not_reached');
    return assetPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['generated-asset-contract-not-met']);
  }
  if (gateId === 'impeccable-detector') {
    const metrics = {
      receipt_present: snapshot.detector.present,
      finding_count: snapshot.detector.finding_count,
    };
    if (!buildPass(snapshot)) return held(gateId, metrics, ['build-browser-qa-gate-not-met'], 'not_reached');
    return detectorPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['impeccable-detector-did-not-pass-cleanly']);
  }
  if (gateId === 'independent-quality') {
    const metrics = {
      evidence_present: snapshot.quality_gate.present,
      schema_valid: snapshot.quality_gate.schema_valid,
      validation_error_count: snapshot.quality_gate.validation_error_count,
      qa_ready: snapshot.quality_gate.qa_ready,
      maker_checker_distinct: snapshot.quality_gate.maker_checker_distinct,
      recording_present: snapshot.quality_gate.recording_present,
      recording_hash_matches: snapshot.quality_gate.recording_hash_matches,
      recording_bytes_match: snapshot.quality_gate.recording_bytes_match,
      required_viewports_present: snapshot.quality_gate.required_viewports_present,
    };
    if (!assetPass(snapshot) || !detectorPass(snapshot)) {
      return held(gateId, metrics, ['asset-or-detector-gate-not-met'], 'not_reached');
    }
    return qualityPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['hashed-demo-and-independent-checker-contract-not-met']);
  }
  if (gateId === 'authority-boundary') {
    const metrics = {
      prospect_rows: snapshot.prospects.rows,
      qa_ready_rows: snapshot.prospects.qa_ready,
      mail_hold_rows: snapshot.prospects.mail_hold,
      non_hold_rows: snapshot.prospects.mail_ready_other,
      state_mail_ready: snapshot.operational_state.mail_ready,
      local_only_claimed: snapshot.operational_state.local_only_claimed,
      no_external_delivery_claimed: snapshot.operational_state.no_external_delivery_claimed,
    };
    if (!buildPass(snapshot)) return held(gateId, metrics, ['build-browser-qa-gate-not-met'], 'not_reached');
    return authorityPass(snapshot)
      ? passed(gateId, metrics)
      : held(gateId, metrics, ['local-only-mail-hold-authority-contract-not-met']);
  }
  throw new Error('Unsupported W05 gate ' + gateId);
}

function deriveFactoryState(gates) {
  const byId = Object.fromEntries(gates.map((gate) => [gate.gate_id, gate]));
  if (!byId.freshness?.passed) return 'held_stale_source';
  if (!byId['source-pool']?.passed) return 'held_source_pool';
  if (!byId.selection?.passed) return 'held_selection';
  if (!byId['build-browser-qa']?.passed) return 'held_build_browser_qa';
  if (!byId['generated-assets']?.passed) return 'held_generated_assets';
  if (!byId['impeccable-detector']?.passed) return 'held_impeccable_detector';
  if (!byId['independent-quality']?.passed) return 'held_independent_quality';
  if (!byId['authority-boundary']?.passed) return 'held_authority_boundary';
  return 'verified_local_batch';
}

function nextSafestAction(state) {
  const actions = {
    held_stale_source: 'Run the bounded source discovery preflight and recollect fresh state before selecting or building.',
    held_source_pool: `Repair or expand eligible first-party sources until at least ${TARGET_COUNT} unique source-ready prospects exist; do not build a partial batch.`,
    held_selection: `Select exactly ${TARGET_COUNT} unique prospects with exact logos and prior-batch exclusion evidence.`,
    held_build_browser_qa: `Build and browser-test exactly ${TARGET_COUNT} private noindex sites, then retain the full final-audit receipt.`,
    held_generated_assets: `Resolve every approved category board and retain four relevant generated assets per site without guessing.`,
    held_impeccable_detector: 'Fix every blocking detector finding and retain one clean detector receipt.',
    held_independent_quality: 'Record a hashed walkthrough and obtain a different checker pass across desktop and mobile.',
    held_authority_boundary: 'Restore 20 qa-ready rows while keeping every mail_ready value on hold and retaining the local-only boundary.',
    verified_local_batch: 'Present the verified local batch as an approval package; deployment and outreach remain separate approval-gated actions.',
  };
  return actions[state];
}

function publicSnapshot(snapshot) {
  return {
    run_id: snapshot.run_id,
    operational_state: snapshot.operational_state,
    preflight: snapshot.preflight,
    selection: {
      count: snapshot.selection.count,
      unique_identity_count: snapshot.selection.unique_identity_count,
      unique_slug_count: snapshot.selection.unique_slug_count,
      transparent_logo_count: snapshot.selection.transparent_logo_count,
      prior_artifacts_scanned: snapshot.selection.prior_artifacts_scanned,
      prior_identities_excluded: snapshot.selection.prior_identities_excluded,
    },
    inventory: snapshot.inventory,
    blocked_receipts: snapshot.blocked_receipts,
    legacy_completion_claim: snapshot.legacy_completion_claim,
    source_manifest: snapshot.source_manifest,
    source_set_sha256: snapshot.source_set_sha256,
  };
}

function safeItemId(value) {
  return sha256(String(value)).slice(0, 20);
}

function createWebsiteFactoryHarness(options) {
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = options.logicalRoot;
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const sourceCollector = options.collectSources;
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const correctionsFile = path.join(workspaceRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;
  const checkedAt = new Date().toISOString();

  function logicalArtifact(name) {
    return normalizePath(path.join(logicalRoot, name));
  }

  const contract = {
    schema_version: 1,
    graph_id: 'weekly-w05-website-factory-shadow',
    objective: `Certify one current W05 run only when a fresh eligible pool and exactly ${TARGET_COUNT} isolated local noindex sites pass selection, build, browser, asset, detector, independent checker, and mail-hold gates; otherwise emit the exact held state.`,
    value_signal: 'A structural loop receipt can never substitute for a source-ready, independently reviewed local website batch.',
    constraints: [
      'Read the live Prospect Radar Next 20 state and batch evidence without mutation.',
      'Do not expose prospect identities, URLs, contact fields, or raw source evidence in shadow artifacts.',
      'Do not build a partial batch when the fresh source-ready pool is below 20.',
      'Keep every site private and noindex and every mail_ready value on hold.',
      'No send, outreach, publish, deploy, CRM write, spend, canonical queue write, or account change.',
    ],
    upstream_artifacts: [
      'automation/prospect-radar-next20/latest-daily-state.json',
      'automation/prospect-radar-next20/runs/<run-id>/*RECEIPT.json',
      '02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-<run-id>/*',
      '12_Brain/queue/claude-loop-YYYY-MM-DD.jsonl',
    ],
    scope: {
      root: 'dillon-os Prospect Radar Next 20 local workflow',
      isolation_key: 'W05:run_id:gate_id',
      data_class: 'internal-redacted-prospect-aggregate',
    },
    source_freshness: {
      checked_at: checkedAt,
      max_age_seconds: SOURCE_MAX_AGE_SECONDS,
      evidence: 'The live state, current batch/run receipts, and latest legacy W05 claim are hashed at planning and recollected at terminal verification.',
    },
    finish_line: {
      predicate: 'Every W05 gate is independently reconstructed from the same fresh source set, the final artifact truthfully reports verified_local_batch or one exact held state, prospect data remains redacted, and no external or canonical action occurs.',
      required_artifacts: FINAL_NAMES.map(logicalArtifact),
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: 2,
      timeout_seconds: 300,
      max_parallel: 4,
      budget_units: 80,
    },
    adapters: {
      planner: 'w05-factory-planner',
      maker: 'w05-gate-maker',
      checker: 'w05-independent-gate-checker',
      reducer: 'w05-factory-reducer',
      terminal_verifier: 'w05-factory-terminal-verifier',
      learner: 'w05-factory-correction-ledger',
    },
    approval: {
      external_actions: false,
      required_before: [],
    },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: 'automation/prospect-radar-next20/latest-daily-state.json is operational truth; client-operations canonical queue remains untouched',
      dedupe_key: 'internal:W05:current-run:factory-verification',
      checkpoint: logicalArtifact('run-receipt.json'),
      rollback: 'Discard the shadow artifact and retain the prior W05 operational and batch state; no prospect, queue, deployment, or outreach state changes.',
      escalation: 'Return the exact source, selection, build, asset, detector, checker, or authority hold to Marketing Chief.',
      allowed_actions: [
        'read_files',
        'aggregate_redacted_counts',
        'hash_artifacts',
        'verify_local_receipts',
        'write_shadow_artifact',
      ],
      forbidden_actions: [
        'canonical_queue_write',
        'send',
        'outreach',
        'publish',
        'deploy',
        'crm_write',
        'spend',
        'account_change',
      ],
    },
    learning: {
      fingerprint_inputs: [
        'current-run-id-and-state-hash',
        'preflight-and-selection-hashes',
        'build-browser-asset-detector-and-checker-hashes',
        'mail-hold-and-noindex-assertions',
        'legacy-completion-claim-hash',
        'terminal-assertions',
      ],
      corrections_ledger: logicalArtifact('corrections.jsonl'),
    },
  };

  const adapters = {
    'w05-factory-planner': async () => {
      const sources = await sourceCollector();
      const items = GATE_IDS.map((gateId) => ({
        id: 'W05:' + sources.run_id + ':' + gateId,
        routine_id: 'W05',
        gate_id: gateId,
        task: 'Reconstruct the current W05 ' + gateId + ' gate from retained evidence.',
        isolation_key: 'W05:' + sources.run_id + ':' + gateId,
        input_fingerprint: sha256(stableJson({ gate_id: gateId, source_set: sources.source_set_sha256 })),
        snapshot: sources,
      }));
      return {
        evidence: `Collected ${items.length} isolated W05 gates for run ${sources.run_id} from source set ${sources.source_set_sha256}.`,
        source_set_sha256: sources.source_set_sha256,
        sources,
        items,
      };
    },

    'w05-gate-maker': async ({ workflow_id: workflowId, item, attempt }) => {
      const isolatedRoot = path.join(workspaceRoot, 'isolated', safeItemId(item.id));
      const artifactFile = path.join(isolatedRoot, 'gate.json');
      const record = evaluateFactoryGate(item.gate_id, item.snapshot);
      writeJsonAtomic(artifactFile, record);
      return {
        evidence: 'Built one redacted W05 ' + item.gate_id + ' record.',
        isolation_id: `${workflowId}:${safeItemId(item.id)}:attempt:${attempt}`,
        artifacts: [fileEvidence(
          artifactFile,
          normalizePath(path.join(logicalRoot, 'workers', safeItemId(item.id) + '.json')),
          true
        )],
      };
    },

    'w05-independent-gate-checker': async ({ item, maker_result: makerResult }) => {
      const artifact = makerResult.artifacts[0];
      const bytes = fs.readFileSync(artifact.resume_locator);
      const hashPassed = sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
      const actual = hashPassed ? JSON.parse(bytes.toString('utf8')) : null;
      const expected = evaluateFactoryGate(item.gate_id, item.snapshot);
      const exactPassed = hashPassed && stableJson(actual) === stableJson(expected);
      const findings = [];
      if (!hashPassed) findings.push('Gate artifact hash or byte count changed.');
      if (!exactPassed) findings.push('Gate record does not exactly reproduce from the retained source snapshot.');
      return {
        evidence: 'Independently reconstructed and compared the W05 ' + item.gate_id + ' gate.',
        passed: findings.length === 0,
        findings,
      };
    },

    'w05-factory-reducer': async ({ plan, worker_results: workers }) => {
      const gates = workers
        .map((worker) => readJson(worker.final_artifacts[0].resume_locator))
        .sort((a, b) => GATE_IDS.indexOf(a.gate_id) - GATE_IDS.indexOf(b.gate_id));
      const state = deriveFactoryState(gates);
      const legacyClaim = plan.sources.legacy_completion_claim;
      const document = {
        schema_version: 1,
        routine_id: 'W05',
        run_id: plan.sources.run_id,
        objective: `Prove exactly ${TARGET_COUNT} fresh, eligible, isolated, local noindex sites through the real W05 finish line or retain one explicit hold.`,
        source_snapshot: publicSnapshot(plan.sources),
        gates,
        outcome: {
          state,
          workflow_ready: state === 'verified_local_batch',
          legacy_false_completion_detected: Boolean(
            legacyClaim?.outcome === 'complete' && state !== 'verified_local_batch'
          ),
          old_loop_claimed_complete: legacyClaim?.outcome === 'complete',
          actual_operational_status: plan.sources.operational_state.status,
          passing_gates: gates.filter((gate) => gate.passed).length,
          total_gates: gates.length,
          next_safest_action: nextSafestAction(state),
        },
        approval: {
          state: 'mail_ready_hold',
          verified_local_batch_is_not_delivery_approval: true,
          external_action_authorized: false,
        },
        authority: {
          canonical_queue_write_attempted: false,
          external_action_attempted: false,
          deployment_attempted: false,
          outreach_attempted: false,
        },
        correction_fingerprint: sha256(stableJson({
          source_set: plan.sources.source_set_sha256,
          state,
          gates: gates.map((gate) => ({ id: gate.gate_id, state: gate.state, reasons: gate.reasons })),
        })),
      };
      const stagingRoot = path.join(workspaceRoot, 'staged');
      fs.mkdirSync(stagingRoot, { recursive: true });
      const file = path.join(stagingRoot, FINAL_NAMES[0]);
      writeJsonAtomic(file, document);
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: `Reduced ${gates.length} independently checked W05 gates into truthful state ${state}.`,
        artifacts: [fileEvidence(file, logicalArtifact(FINAL_NAMES[0]))],
        staging_root: stagingRoot,
      };
    },

    'w05-factory-terminal-verifier': async ({ plan, reduction }) => {
      const fresh = await sourceCollector();
      const document = readJson(path.join(reduction.staging_root, FINAL_NAMES[0]));
      const expectedGates = GATE_IDS.map((gateId) => evaluateFactoryGate(gateId, fresh));
      const expectedState = deriveFactoryState(expectedGates);
      const serialized = JSON.stringify(document);
      const sourceStable = fresh.source_set_sha256 === plan.source_set_sha256;
      const gatesExact = stableJson(document.gates) === stableJson(expectedGates);
      const outcomeTruthful = document.outcome.state === expectedState &&
        document.outcome.workflow_ready === (expectedState === 'verified_local_batch') &&
        document.outcome.legacy_false_completion_detected === Boolean(
          fresh.legacy_completion_claim?.outcome === 'complete' &&
          expectedState !== 'verified_local_batch'
        );
      const authorityHeld = document.approval.state === 'mail_ready_hold' &&
        document.approval.external_action_authorized === false &&
        document.authority.canonical_queue_write_attempted === false &&
        document.authority.external_action_attempted === false &&
        document.authority.deployment_attempted === false &&
        document.authority.outreach_attempted === false;
      const privacyPassed = !/@|https?:\/\//i.test(serialized) &&
        !/"(?:business_name|website|address|phone|domain|slug)"\s*:/i.test(serialized);
      const assertions = [
        {
          id: 'source-manifest-stable',
          passed: sourceStable,
          detail: sourceStable ? 'The entire W05 source set is unchanged since planning.' : 'W05 source state changed during verification.',
        },
        {
          id: 'all-gates-exactly-reproduced',
          passed: gatesExact,
          detail: gatesExact ? 'All eight W05 gates exactly reproduce from retained evidence.' : 'One or more W05 gates do not reproduce.',
        },
        {
          id: 'completion-or-hold-is-truthful',
          passed: outcomeTruthful,
          detail: outcomeTruthful ? `The artifact truthfully reports ${expectedState}.` : 'The aggregate W05 state overclaims or misclassifies the evidence.',
        },
        {
          id: 'approval-and-authority-remain-separate',
          passed: authorityHeld,
          detail: 'mail_ready remains hold and no queue, outreach, deployment, or external action is authorized or attempted.',
        },
        {
          id: 'prospect-data-redacted',
          passed: privacyPassed,
          detail: 'The final artifact contains aggregate counts and hashes only, with no prospect identifiers, URLs, or contact fields.',
        },
      ];
      return {
        evidence: 'Recollected the W05 state and independently verified source stability, all gate semantics, truthful outcome classification, authority, privacy, and final hash.',
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: [fileEvidence(
          path.join(reduction.staging_root, FINAL_NAMES[0]),
          logicalArtifact(FINAL_NAMES[0])
        )],
      };
    },

    'w05-factory-correction-ledger': async ({ outcome }) => {
      const entry = {
        recorded_at: new Date().toISOString(),
        graph_id: contract.graph_id,
        outcome,
        correction: outcome === 'terminal_true'
          ? 'Never accept W05 completion from radar freshness or generic stage checks; preserve the exact source, selection, build, asset, detector, independent checker, and mail-hold gate state.'
          : 'Recollect the changed W05 source set and repair only the exact gate whose artifact or assertion failed.',
      };
      const serialized = JSON.stringify(entry);
      fs.appendFileSync(correctionsFile, serialized + '\n', 'utf8');
      return {
        evidence: 'Appended one hashed W05 correction entry.',
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
      if (!verifiedStagingRoot) throw new Error('No terminal-verified W05 artifact is staged.');
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
    throw new Error('W05 factory output must remain inside the Dillon OS repository.');
  }
  const relative = normalizePath(path.relative(root, absolute));
  if (!/^System\/outcome-graph\/factory-\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?$/i.test(relative)) {
    throw new Error('W05 factory output must use System/outcome-graph/factory-YYYY-MM-DD[-slug].');
  }
  return absolute;
}

async function runWebsiteFactoryDurable(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
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
  const collectSources = options.collectSources || (() => collectWebsiteFactorySources({
    repoRoot,
    asOf: options.asOf,
    stateFile: options.stateFile,
    batchDir: options.batchDir,
    runDir: options.runDir,
  }));
  const initialSources = await collectSources();
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    'website-factory-' + sha256(logicalRoot).slice(0, 20)
  );
  const harness = createWebsiteFactoryHarness({
    outputDir,
    logicalRoot,
    workspaceRoot,
    collectSources,
  });
  const readCanonicalBinding = async () => {
    const sources = await collectSources();
    return {
      locator: 'dillon-os://automation/prospect-radar-next20/' + sources.run_id,
      version: `${sources.run_id}:${sources.operational_state.status}:${sources.preflight.ready_count}:${sources.inventory.present.length}`,
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
  GATE_IDS,
  SOURCE_MAX_AGE_SECONDS,
  SUCCESS_FILES,
  TARGET_COUNT,
  aggregatePreflight,
  assertSafeOutput,
  collectWebsiteFactorySources,
  createWebsiteFactoryHarness,
  deriveFactoryState,
  evaluateFactoryGate,
  rejectionCategory,
  runWebsiteFactoryDurable,
  verifyCompletedResult,
  verifyResumedWorker,
};
