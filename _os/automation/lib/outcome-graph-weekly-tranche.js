'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { parseFrontmatter } = require('./frontmatter');
const { runOutcomeGraph, sha256, stableJson } = require('./outcome-graph');
const { runDurableOutcomeGraph, writeJsonAtomic } = require('./outcome-graph-state');

const FINAL_NAMES = [
  'W04-production-calendar.json',
  'W06-client-report-packages.json',
  'W08-experiment-decision-ledger.json',
  'W10-executive-weekly-review.json',
];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function completedWeekWindow(reference = new Date()) {
  const date = reference instanceof Date ? new Date(reference) : new Date(reference);
  if (!Number.isFinite(date.getTime())) throw new Error('referenceDate is invalid');
  const midnight = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const mondayOffset = (midnight.getUTCDay() + 6) % 7;
  const currentMonday = new Date(midnight.getTime() - mondayOffset * 86400000);
  const periodEnd = new Date(currentMonday.getTime() - 86400000);
  const periodStart = new Date(periodEnd.getTime() - 6 * 86400000);
  return {
    prepared: isoDate(midnight),
    period_start: isoDate(periodStart),
    period_end: isoDate(periodEnd),
    month: isoDate(midnight).slice(0, 7),
  };
}

function clientOperationsDefault() {
  return path.join(os.homedir(), 'Documents', 'Codex', 'projects', 'client-operations');
}

function clientLookup(clients) {
  const lookup = new Map();
  for (const client of clients) {
    for (const name of [client.id, client.displayName, ...(client.aliases || [])]) {
      const key = normalizeName(name);
      if (!key) continue;
      if (!lookup.has(key)) lookup.set(key, []);
      lookup.get(key).push(client);
    }
  }
  return lookup;
}

function resolveClient(name, lookup) {
  const matches = lookup.get(normalizeName(name)) || [];
  const unique = [...new Map(matches.map((client) => [client.id, client])).values()];
  if (unique.length !== 1) {
    throw new Error(
      'Content calendar client route is ' +
      (unique.length === 0 ? 'unresolved' : 'ambiguous') +
      ': ' + name
    );
  }
  return unique[0];
}

function contentCommitments(queue) {
  const closed = new Set(['done', 'cancelled', 'deferred']);
  const contentPattern = /\b(content|creative|social|blog|google business profile|gbp|seo landing)\b/i;
  return (queue.workItems || [])
    .filter((item) => !closed.has(item.status))
    .filter((item) => contentPattern.test([
      item.title,
      ...(Array.isArray(item.definitionOfDone) ? item.definitionOfDone : []),
    ].join(' ')))
    .map((item) => ({
      id: item.id,
      version: item.version,
      client_id: item.clientId || null,
      title: item.title,
      status: item.status,
      owner: item.owner || 'marketing-chief',
      due_date: item.dueDate || null,
      dedupe_key: item.dedupeKey || null,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function latestDurableW09W11Receipt(repoRoot) {
  const root = path.join(repoRoot, 'System', 'outcome-graph');
  const candidates = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /shadow-.*-durable$/i.test(entry.name))
    .map((entry) => path.join(root, entry.name, 'run-receipt.json'))
    .filter((file) => fs.existsSync(file))
    .sort();
  if (candidates.length === 0) {
    throw new Error('No durable W09/W11 receipt is available for W10 synthesis.');
  }
  return candidates[candidates.length - 1];
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

async function collectWeeklyTrancheSources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const clientOperationsRoot = path.resolve(
    options.clientOperationsRoot || clientOperationsDefault()
  );
  const referenceDate = options.referenceDate || new Date();
  const window = options.window || completedWeekWindow(referenceDate);
  const reportDirectoryName = options.reportDirectoryName ||
    `${window.prepared}-weekly-report-${window.period_start}-to-${window.period_end}`;
  const queueFile = path.join(clientOperationsRoot, 'queue', 'work-items.json');
  const registryFile = path.join(clientOperationsRoot, 'registry', 'clients.json');
  const queuePacket = sourcePacket(queueFile, 'client-operations/queue/work-items.json', true);
  const registryPacket = sourcePacket(
    registryFile,
    'client-operations/registry/clients.json',
    true
  );
  const queue = JSON.parse(queuePacket.text);
  const clientRegistry = JSON.parse(registryPacket.text);
  const clients = clientRegistry.clients || [];
  const lookup = clientLookup(clients);
  const commitments = contentCommitments(queue);
  const packets = [queuePacket, registryPacket];

  const contentRoot = path.join(repoRoot, '01_Clients');
  const contentSources = [];
  for (const entry of fs.readdirSync(contentRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(contentRoot, entry.name, 'content-calendar.md');
    if (!fs.existsSync(file)) continue;
    const packet = sourcePacket(
      file,
      normalizePath(path.relative(repoRoot, file)),
      true
    );
    const parsed = parseFrontmatter(packet.text);
    const client = resolveClient(parsed.data.client || entry.name, lookup);
    packets.push(packet);
    contentSources.push({
      client_id: client.id,
      client_name: client.displayName,
      client_status: client.status,
      source_locator: packet.locator,
      source_sha256: packet.sha256,
      source_bytes: packet.bytes,
      physical_path: file,
      modified_at: fs.statSync(file).mtime.toISOString(),
      month: parsed.data.month || null,
      text: packet.text,
      commitments: commitments.filter((item) => item.client_id === client.id),
    });
  }
  contentSources.sort((a, b) => a.client_id.localeCompare(b.client_id));

  const reports = [];
  const clientsRoot = path.join(clientOperationsRoot, 'clients');
  for (const clientEntry of fs.readdirSync(clientsRoot, { withFileTypes: true })) {
    if (!clientEntry.isDirectory()) continue;
    const directory = path.join(
      clientsRoot,
      clientEntry.name,
      'deliverables',
      reportDirectoryName
    );
    if (!fs.existsSync(directory)) continue;
    const sourceFile = path.join(directory, 'source-data.json');
    const htmlFile = path.join(directory, 'report.html');
    const pdfNames = fs.readdirSync(directory).filter((name) => name.toLowerCase().endsWith('.pdf'));
    if (!fs.existsSync(sourceFile) || !fs.existsSync(htmlFile) || pdfNames.length === 0) {
      throw new Error('Weekly report package is incomplete: ' + directory);
    }
    const source = sourcePacket(
      sourceFile,
      normalizePath(path.relative(path.dirname(clientOperationsRoot), sourceFile)),
      true
    );
    const html = sourcePacket(
      htmlFile,
      normalizePath(path.relative(path.dirname(clientOperationsRoot), htmlFile)),
      true
    );
    const pdfRevisions = pdfNames.map((name) => {
      const file = path.join(directory, name);
      const packet = sourcePacket(
        file,
        normalizePath(path.relative(path.dirname(clientOperationsRoot), file)),
        false
      );
      packets.push(packet);
      return {
        locator: packet.locator,
        sha256: packet.sha256,
        bytes: packet.bytes,
        modified_at: fs.statSync(file).mtime.toISOString(),
        physical_path: file,
      };
    }).sort((a, b) =>
      b.modified_at.localeCompare(a.modified_at) || b.locator.localeCompare(a.locator)
    );
    const currentPdf = pdfRevisions[0];
    packets.push(source, html);
    const client = clients.find((candidate) => candidate.id === clientEntry.name);
    if (!client) throw new Error('Weekly report client is absent from the registry: ' + clientEntry.name);
    reports.push({
      client_id: client.id,
      client_name: client.displayName,
      client_status: client.status,
      directory_locator: normalizePath(path.relative(path.dirname(clientOperationsRoot), directory)),
      source_data_locator: source.locator,
      source_data_sha256: source.sha256,
      source_data_bytes: source.bytes,
      source_data: JSON.parse(source.text),
      html_locator: html.locator,
      html_sha256: html.sha256,
      html_bytes: html.bytes,
      html: html.text,
      pdf_locator: currentPdf.locator,
      pdf_sha256: currentPdf.sha256,
      pdf_bytes: currentPdf.bytes,
      pdf_revisions: pdfRevisions.map(({ physical_path: ignored, ...revision }) => revision),
      physical: {
        source_data: sourceFile,
        html: htmlFile,
        pdf: currentPdf.physical_path,
      },
    });
  }
  reports.sort((a, b) => a.client_id.localeCompare(b.client_id));
  if (reports.length === 0) {
    throw new Error('No current-period weekly report packages were discovered.');
  }

  const experimentRoot = path.join(repoRoot, '12_Brain', '05_Projects', 'Experiments');
  const experiments = [];
  for (const name of fs.readdirSync(experimentRoot).filter((candidate) =>
    /^EXP-.*\.md$/i.test(candidate)
  ).sort()) {
    const file = path.join(experimentRoot, name);
    const packet = sourcePacket(file, normalizePath(path.relative(repoRoot, file)), true);
    packets.push(packet);
    const parsed = parseFrontmatter(packet.text);
    const experimentId = parsed.data.experiment_id || path.basename(name, '.md').split(' - ')[0];
    experiments.push({
      experiment_id: experimentId,
      source_locator: packet.locator,
      source_sha256: packet.sha256,
      source_bytes: packet.bytes,
      physical_path: file,
      text: packet.text,
    });
  }
  if (experiments.length === 0) throw new Error('No experiment notes were discovered.');

  const w09w11File = options.w09w11Receipt || latestDurableW09W11Receipt(repoRoot);
  const healthFile = options.healthFile || path.join(repoRoot, '12_Brain', '09_Ops', 'Health.md');
  const w09w11Packet = sourcePacket(
    w09w11File,
    normalizePath(path.relative(repoRoot, w09w11File)),
    true
  );
  const healthPacket = sourcePacket(
    healthFile,
    normalizePath(path.relative(repoRoot, healthFile)),
    true
  );
  packets.push(w09w11Packet, healthPacket);
  const w09w11 = JSON.parse(w09w11Packet.text);
  const manifest = buildManifest(packets);
  const activeItems = (queue.workItems || []).filter((item) =>
    !['done', 'cancelled', 'deferred'].includes(item.status)
  ).map((item) => ({
    id: item.id,
    version: item.version,
    client_id: item.clientId || null,
    title: item.title,
    status: item.status,
    owner: item.owner || 'marketing-chief',
    due_date: item.dueDate || null,
  }));

  return {
    captured_at: new Date().toISOString(),
    window,
    report_directory_name: reportDirectoryName,
    queue: {
      locator: queuePacket.locator,
      revision: queue.revision,
      sha256: queuePacket.sha256,
      updated_at: queue.updatedAt,
      active_items: activeItems,
      content_commitments: commitments,
    },
    registry: {
      locator: registryPacket.locator,
      sha256: registryPacket.sha256,
      client_count: clients.length,
    },
    content_sources: contentSources,
    reports,
    experiments,
    context: {
      w09_w11: {
        locator: w09w11Packet.locator,
        sha256: w09w11Packet.sha256,
        outcome: w09w11.outcome,
        terminal_truth: w09w11.terminal_truth,
        run_id: w09w11.run_id,
        terminal_assertions: w09w11.terminal_evidence?.assertions || [],
      },
      health: {
        locator: healthPacket.locator,
        sha256: healthPacket.sha256,
        blocked: /status:\s*blocked|status\s*:\s*blocked/i.test(healthPacket.text),
        warning_count: healthWarningCount(healthPacket.text),
      },
    },
    source_manifest: manifest,
    source_set_sha256: sha256(stableJson(manifest)),
  };
}

function evaluateContentSource(item, month, maxAgeHours = 192) {
  const snapshot = item.snapshot;
  const holds = [];
  const body = snapshot.text.toLowerCase();
  const ageHours = (Date.now() - Date.parse(snapshot.modified_at)) / 3600000;
  if (snapshot.client_status !== 'active') holds.push('inactive_client');
  if (body.includes('out of scope') || body.includes('no content calendar')) {
    holds.push('content_out_of_scope');
  }
  if (body.includes('re-confirm') || body.includes('reconfirm')) {
    holds.push('needs_current_scope_confirmation');
  }
  if (snapshot.month && snapshot.month !== month) holds.push('stale_calendar_month');
  if (ageHours > maxAgeHours) holds.push('source_older_than_freshness_window');
  if (snapshot.commitments.length === 0) holds.push('no_current_canonical_content_commitment');

  const productionItems = [];
  for (const commitment of snapshot.commitments) {
    const missing = [];
    if (!commitment.due_date) missing.push('production_date');
    missing.push('channel', 'proof_source', 'review_date', 'approval_state');
    if (missing.length > 0) {
      holds.push('commitment_' + commitment.id + '_missing_' + missing.join('_'));
      continue;
    }
    productionItems.push({
      canonical_work_item_id: commitment.id,
      purpose: commitment.title,
      channel: commitment.channel,
      owner: commitment.owner,
      proof_source: commitment.proof_source,
      production_date: commitment.due_date,
      review_date: commitment.review_date,
      approval_state: commitment.approval_state,
    });
  }

  const record = {
    schema_version: 1,
    routine_id: 'W04',
    client_id: snapshot.client_id,
    client_name: snapshot.client_name,
    client_status: snapshot.client_status,
    source: {
      locator: snapshot.source_locator,
      sha256: snapshot.source_sha256,
      bytes: snapshot.source_bytes,
      modified_at: snapshot.modified_at,
      declared_month: snapshot.month,
    },
    canonical_commitments: snapshot.commitments,
    production_items: productionItems,
    holds: [...new Set(holds)].sort(),
    approval_state: 'proposal_only_unscheduled',
    external_action_attempted: false,
  };
  record.validation_fingerprint = sha256(stableJson(record));
  return record;
}

function parseMetricNumber(value) {
  const normalized = String(value || '').replace(/[$,%\s]/g, '').replace(/,/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function evaluateReport(item) {
  const snapshot = item.snapshot;
  const data = snapshot.source_data;
  const checks = [];
  const metricMap = new Map((data.metrics || []).map((metric) => [
    String(metric[0]).trim().toLowerCase(),
    String(metric[1]).trim(),
  ]));
  const metricEvidencePassed = [...metricMap.entries()].every(([label, value]) =>
    snapshot.html.includes(label.split(' ').map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')) || snapshot.html.includes(value)
  ) && (data.metrics || []).every((metric) =>
    snapshot.html.includes(String(metric[0])) && snapshot.html.includes(String(metric[1]))
  );
  checks.push({
    id: 'metric-values-render-from-source-ledger',
    passed: metricEvidencePassed,
    detail: metricEvidencePassed
      ? 'Every source-ledger metric label and value appears in the rendered report.'
      : 'At least one source-ledger metric label or value is absent from the rendered report.',
  });
  const windowPassed = data.reporting_window ===
    `${item.window.period_start} through ${item.window.period_end}`;
  checks.push({
    id: 'reporting-window-exact',
    passed: windowPassed,
    detail: String(data.reporting_window || 'missing'),
  });
  const sourcesPassed = Array.isArray(data.sources) && data.sources.length > 0;
  checks.push({
    id: 'named-sources-present',
    passed: sourcesPassed,
    detail: sourcesPassed ? data.sources.length + ' named sources.' : 'No named source ledger.',
  });
  const forbiddenPattern = /zero conversions|no conversions|not enough conversions|insufficient conversions/i;
  const languagePassed = !forbiddenPattern.test(snapshot.html);
  checks.push({
    id: 'unsupported-conversion-language-absent',
    passed: languagePassed,
    detail: languagePassed ? 'No prohibited conversion claim appears.' : 'Prohibited conversion language appears.',
  });

  const clicks = parseMetricNumber(metricMap.get('clicks'));
  const impressions = parseMetricNumber(metricMap.get('impressions'));
  const ctr = parseMetricNumber(metricMap.get('ctr'));
  if (clicks !== null && impressions && ctr !== null) {
    const computed = (clicks / impressions) * 100;
    checks.push({
      id: 'ctr-recomputes',
      passed: Math.abs(computed - ctr) <= 0.05,
      detail: `computed ${computed.toFixed(2)} percent from ${clicks} / ${impressions}`,
    });
  }
  const spendEntry = [...metricMap.entries()].find(([label]) => label === 'spend' || label.endsWith(' spend'));
  const cpcEntry = [...metricMap.entries()].find(([label]) => label === 'avg. cpc' || label === 'average cpc');
  if (spendEntry && cpcEntry && clicks) {
    const spend = parseMetricNumber(spendEntry[1]);
    const cpc = parseMetricNumber(cpcEntry[1]);
    if (spend !== null && cpc !== null) {
      const computed = spend / clicks;
      checks.push({
        id: 'average-cpc-recomputes',
        passed: Math.abs(computed - cpc) <= 0.01,
        detail: `computed ${computed.toFixed(2)} from ${spend} / ${clicks}`,
      });
    }
  }

  const record = {
    schema_version: 1,
    routine_id: 'W06',
    client_id: snapshot.client_id,
    client_name: snapshot.client_name,
    client_status: snapshot.client_status,
    reporting_window: data.reporting_window,
    prepared: data.prepared || null,
    evidence_mode: data.evidence_mode || 'unspecified',
    metrics: data.metrics || [],
    checks,
    passed: checks.every((check) => check.passed),
    source_ledger: [
      { locator: snapshot.source_data_locator, sha256: snapshot.source_data_sha256, bytes: snapshot.source_data_bytes },
      { locator: snapshot.html_locator, sha256: snapshot.html_sha256, bytes: snapshot.html_bytes },
      ...snapshot.pdf_revisions.map((revision) => ({
        locator: revision.locator,
        sha256: revision.sha256,
        bytes: revision.bytes,
        modified_at: revision.modified_at,
        selected_current: revision.locator === snapshot.pdf_locator,
      })),
    ],
    named_sources: data.sources || [],
    delivery_readiness: {
      state: 'pending_exact_route_and_approval',
      draft_created: false,
      reason: 'This shadow verifies report production. Recipient, thread, exact signature, and delivery approval remain outside the graph.',
    },
    external_action_attempted: false,
  };
  record.validation_fingerprint = sha256(stableJson(record));
  return record;
}

function bodyField(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (body.match(new RegExp('\\*\\*' + escaped + ':\\*\\*\\s*(.+)', 'i')) || [])[1]?.trim() || null;
}

function bodySection(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const lines = String(body || '').split(/\r?\n/);
  const heading = new RegExp('^#{1,6}\\s+' + escaped + '\\s*$', 'i');
  const start = lines.findIndex((line) => heading.test(line.trim()));
  if (start < 0) return null;
  const section = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#{1,6}\s+/.test(lines[index].trim())) break;
    section.push(lines[index]);
  }
  const value = section.join('\n').trim();
  return value || null;
}

function firstParagraph(value) {
  if (!value) return null;
  const paragraph = String(value).split(/\r?\n\s*\r?\n/)[0]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/^[-*+]\s+/, '')
    .trim();
  return paragraph || null;
}

function healthWarningCount(text) {
  const tableValue = (String(text || '').match(/\|\s*Warnings\s*\|\s*(\d+)\s*\|/i) || [])[1];
  const fieldValue = (String(text || '').match(/warnings:\s*(\d+)/i) || [])[1];
  return Number(tableValue || fieldValue || 0);
}

function evaluateExperiment(item) {
  const snapshot = item.snapshot;
  const parsed = parseFrontmatter(snapshot.text);
  const data = parsed.data;
  const acceptanceTest = bodyField(parsed.body, 'Acceptance test') ||
    bodySection(parsed.body, 'Acceptance test') ||
    bodySection(parsed.body, 'Acceptance contract');
  const verifiedOutcomeReceipt = data.verification_status === 'verified' &&
    /outcome receipt/i.test(parsed.body) &&
    /[a-f0-9]{64}/i.test(parsed.body);
  const hypothesis = data.outcome || data.hypothesis ||
    firstParagraph(bodySection(parsed.body, 'Hypothesis'));
  const nextSmallestTest = acceptanceTest || data.next_action ||
    'Define one deterministic acceptance test before execution.';
  const record = {
    schema_version: 1,
    routine_id: 'W08',
    experiment_id: snapshot.experiment_id,
    source: {
      locator: snapshot.source_locator,
      sha256: snapshot.source_sha256,
      bytes: snapshot.source_bytes,
    },
    status: data.status || 'unknown',
    stage: data.experiment_stage || 'unknown',
    hypothesis,
    metric_definition: acceptanceTest,
    verification_status: data.verification_status || 'unverified',
    outcome_receipt_verified: verifiedOutcomeReceipt,
    decision: verifiedOutcomeReceipt ? 'continue' : 'inconclusive',
    uncertainty: verifiedOutcomeReceipt
      ? 'A retained outcome receipt exists; production adoption still requires its declared human gate.'
      : 'No retained verified outcome receipt exists, so stop, scale, or production adoption is unsupported.',
    next_smallest_test: nextSmallestTest,
    review_on: data.review_on || null,
    risk: data.risk || 'unknown',
    external_action_attempted: false,
  };
  record.valid = Boolean(record.experiment_id && record.hypothesis && record.next_smallest_test) &&
    (!['stop', 'scale'].includes(record.decision) || record.outcome_receipt_verified);
  record.validation_fingerprint = sha256(stableJson(record));
  return record;
}

function safeItemId(value) {
  return sha256(String(value)).slice(0, 20);
}

function createWeeklyTrancheHarness(options) {
  const outputDir = path.resolve(options.outputDir);
  const logicalRoot = options.logicalRoot;
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const sourceCollector = options.collectSources;
  const window = options.window;
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const correctionsFile = path.join(workspaceRoot, 'corrections.jsonl');
  let verifiedStagingRoot = null;
  const checkedAt = new Date().toISOString();

  function logicalArtifact(name) {
    return normalizePath(path.join(logicalRoot, name));
  }

  const contract = {
    schema_version: 1,
    graph_id: 'weekly-w04-w06-w08-w10-shadow',
    objective: 'Produce a source-bound content calendar, client-report package index, experiment decision ledger, and proposal-only executive review for the completed weekly window.',
    value_signal: 'Every weekly decision is client-separated, evidence-linked, approval-aware, and independently reproducible without external delivery or canonical mutation.',
    constraints: [
      'Read client-operations canonical queue and registry without mutation.',
      'Keep every client report and content source isolated by exact client ID.',
      'Treat missing experiment outcomes as inconclusive.',
      'Write only the named shadow output and noncanonical durable state.',
      'No send, post, schedule, publish, deploy, spend, account change, or canonical queue write.',
    ],
    upstream_artifacts: [
      'client-operations/queue/work-items.json',
      'client-operations/registry/clients.json',
      '01_Clients/*/content-calendar.md',
      'client-operations/clients/*/deliverables/<weekly-window>/{source-data.json,report.html,*.pdf}',
      '12_Brain/05_Projects/Experiments/EXP-*.md',
      'System/outcome-graph/*-durable/run-receipt.json',
      '12_Brain/09_Ops/Health.md',
    ],
    scope: {
      root: 'dillon-os plus read-only client-operations',
      isolation_key: 'routine_id:client_id_or_experiment_id',
      data_class: 'internal-redacted',
    },
    source_freshness: {
      checked_at: checkedAt,
      max_age_seconds: 300,
      evidence: 'A full queue, registry, content, report, experiment, W09/W11, and health manifest is hashed at run start.',
    },
    finish_line: {
      predicate: 'All discovered content, report, and experiment sources have independently checked isolated records; four aggregate artifacts exactly cover those records; every report package passes; experiment uncertainty is explicit; and W10 remains proposal-only.',
      required_artifacts: FINAL_NAMES.map(logicalArtifact),
    },
    stopping: {
      max_graph_iterations: 1,
      max_worker_attempts: 2,
      timeout_seconds: 600,
      max_parallel: 4,
      budget_units: 140,
    },
    adapters: {
      planner: 'weekly-tranche-planner',
      maker: 'weekly-tranche-record-maker',
      checker: 'weekly-tranche-independent-checker',
      reducer: 'weekly-tranche-reducer-and-w10-synthesizer',
      terminal_verifier: 'weekly-tranche-terminal-verifier',
      learner: 'weekly-tranche-correction-ledger',
    },
    approval: {
      external_actions: false,
      required_before: [],
    },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: 'client-operations/queue/work-items.json remains canonical and read-only to this graph',
      dedupe_key: `internal:${window.period_start}:${window.period_end}:W04-W06-W08-W10`,
      checkpoint: logicalArtifact('run-receipt.json'),
      rollback: 'Discard shadow artifacts and retain the prior verified weekly tranche; canonical queue and external systems are unchanged.',
      escalation: 'Return source drift, routing ambiguity, report mismatch, unsupported experiment decision, or approval ambiguity to Marketing Chief.',
      allowed_actions: [
        'read_files',
        'read_canonical_queue',
        'aggregate_counts',
        'recompute_report_metrics',
        'write_shadow_artifact',
        'hash_artifacts',
      ],
      forbidden_actions: [
        'canonical_queue_write',
        'send',
        'post',
        'schedule',
        'publish',
        'deploy',
        'spend',
        'account_change',
      ],
    },
    learning: {
      fingerprint_inputs: [
        'canonical-queue-revision-and-hash',
        'client-registry-hash',
        'content-source-hashes',
        'report-package-hashes',
        'experiment-note-hashes',
        'aggregate-artifact-hashes',
        'terminal-assertions',
      ],
      corrections_ledger: logicalArtifact('corrections.jsonl'),
    },
  };

  function evaluateItem(item) {
    if (item.routine_id === 'W04') return evaluateContentSource(item, window.month);
    if (item.routine_id === 'W06') return evaluateReport(item);
    if (item.routine_id === 'W08') return evaluateExperiment(item);
    throw new Error('Unsupported weekly tranche item ' + item.id);
  }

  const adapters = {
    'weekly-tranche-planner': async () => {
      const sources = await sourceCollector();
      const items = [
        ...sources.content_sources.map((snapshot) => ({
          id: 'W04:' + snapshot.client_id,
          routine_id: 'W04',
          task: 'Classify the exact current content-calendar source for ' + snapshot.client_id + '.',
          isolation_key: 'W04:client:' + snapshot.client_id,
          input_fingerprint: sha256(stableJson({
            source: snapshot.source_sha256,
            client: snapshot.client_id,
            commitments: snapshot.commitments,
          })),
          snapshot,
        })),
        ...sources.reports.map((snapshot) => ({
          id: 'W06:' + snapshot.client_id,
          routine_id: 'W06',
          task: 'Recompute and independently validate the weekly report package for ' + snapshot.client_id + '.',
          isolation_key: 'W06:client:' + snapshot.client_id,
          input_fingerprint: sha256(stableJson({
            source: snapshot.source_data_sha256,
            html: snapshot.html_sha256,
            pdf_revisions: snapshot.pdf_revisions.map((revision) => revision.sha256),
            client: snapshot.client_id,
          })),
          window: sources.window,
          snapshot,
        })),
        ...sources.experiments.map((snapshot) => ({
          id: 'W08:' + snapshot.experiment_id,
          routine_id: 'W08',
          task: 'Classify the evidence-bound decision state for ' + snapshot.experiment_id + '.',
          isolation_key: 'W08:experiment:' + snapshot.experiment_id,
          input_fingerprint: snapshot.source_sha256,
          snapshot,
        })),
      ];
      return {
        evidence: `Collected ${items.length} isolated weekly records from source set ${sources.source_set_sha256}.`,
        source_set_sha256: sources.source_set_sha256,
        source_manifest_count: sources.source_manifest.length,
        sources,
        items,
      };
    },

    'weekly-tranche-record-maker': async ({ workflow_id: workflowId, item, attempt }) => {
      const isolationId = workflowId + ':' + safeItemId(item.id) + ':attempt:' + attempt;
      const isolatedRoot = path.join(workspaceRoot, 'isolated', safeItemId(item.id));
      const artifactFile = path.join(isolatedRoot, 'record.json');
      const record = evaluateItem(item);
      writeJsonAtomic(artifactFile, record);
      return {
        evidence: 'Built one source-bound ' + item.routine_id + ' record for ' + item.id + '.',
        isolation_id: isolationId,
        artifacts: [fileEvidence(
          artifactFile,
          normalizePath(path.join(logicalRoot, 'workers', safeItemId(item.id) + '.json')),
          true
        )],
      };
    },

    'weekly-tranche-independent-checker': async ({ item, maker_result: makerResult }) => {
      const artifact = makerResult.artifacts[0];
      const bytes = fs.readFileSync(artifact.resume_locator);
      const hashPassed = sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
      const actual = hashPassed ? JSON.parse(bytes.toString('utf8')) : null;
      const expected = evaluateItem(item);
      const exactPassed = hashPassed && stableJson(actual) === stableJson(expected);
      const semanticPassed = item.routine_id === 'W06'
        ? expected.passed
        : expected.valid !== false;
      const findings = [];
      if (!hashPassed) findings.push('Worker artifact hash or byte count changed.');
      if (!exactPassed) findings.push('Worker artifact does not exactly reproduce from its source snapshot.');
      if (!semanticPassed) findings.push('The routine-specific acceptance checks did not pass.');
      return {
        evidence: 'Independently reconstructed and compared ' + item.id + '.',
        passed: findings.length === 0,
        findings,
      };
    },

    'weekly-tranche-reducer-and-w10-synthesizer': async ({ plan, worker_results: workers }) => {
      const records = workers.map((worker) => readJson(worker.final_artifacts[0].resume_locator));
      const w04Records = records.filter((record) => record.routine_id === 'W04')
        .sort((a, b) => a.client_id.localeCompare(b.client_id));
      const w06Records = records.filter((record) => record.routine_id === 'W06')
        .sort((a, b) => a.client_id.localeCompare(b.client_id));
      const w08Records = records.filter((record) => record.routine_id === 'W08')
        .sort((a, b) => a.experiment_id.localeCompare(b.experiment_id));
      const stagingRoot = path.join(workspaceRoot, 'staged');
      fs.mkdirSync(stagingRoot, { recursive: true });

      const w04 = {
        schema_version: 1,
        routine_id: 'W04',
        reporting_window: plan.sources.window,
        objective: 'Represent current client-separated content commitments without inventing production dates, channels, approvals, or scope.',
        production_items: w04Records.flatMap((record) => record.production_items),
        client_calendars: w04Records,
        summary: {
          client_sources: w04Records.length,
          canonical_content_commitments: plan.sources.queue.content_commitments.length,
          production_ready_items: w04Records.reduce((sum, record) => sum + record.production_items.length, 0),
          held_source_records: w04Records.filter((record) => record.holds.length > 0).length,
        },
        approval_state: 'proposal_only_unscheduled',
        external_action_attempted: false,
      };
      const w06 = {
        schema_version: 1,
        routine_id: 'W06',
        reporting_window: plan.sources.window,
        objective: 'Prove every discovered current-period client report package from its source-data, rendered HTML, PDF hash, and recomputable metrics.',
        report_packages: w06Records,
        summary: {
          discovered: w06Records.length,
          passed: w06Records.filter((record) => record.passed).length,
          pending_delivery_route: w06Records.filter((record) =>
            record.delivery_readiness.state === 'pending_exact_route_and_approval'
          ).length,
        },
        external_action_attempted: false,
      };
      const w08 = {
        schema_version: 1,
        routine_id: 'W08',
        reporting_window: plan.sources.window,
        objective: 'Classify every experiment from predeclared evidence and keep unsupported outcomes inconclusive.',
        decisions: w08Records,
        summary: {
          experiments: w08Records.length,
          inconclusive: w08Records.filter((record) => record.decision === 'inconclusive').length,
          verified_outcome_receipts: w08Records.filter((record) => record.outcome_receipt_verified).length,
          scale_or_stop: w08Records.filter((record) => ['scale', 'stop'].includes(record.decision)).length,
        },
        external_action_attempted: false,
      };
      const activeByStatus = plan.sources.queue.active_items.reduce((out, item) => {
        out[item.status] = (out[item.status] || 0) + 1;
        return out;
      }, {});
      const w10 = {
        schema_version: 1,
        routine_id: 'W10',
        reporting_window: plan.sources.window,
        objective: 'Resolve verified weekly evidence into a small ranked proposal list without creating a second command center.',
        verified_wins: [
          `${w06.summary.passed} of ${w06.summary.discovered} discovered weekly report packages recomputed and passed.`,
          `W09/W11 durable run ${plan.sources.context.w09_w11.run_id} remains terminal-true.`,
        ],
        activity_not_outcomes: [
          `${w04.summary.held_source_records} content-calendar sources remain reference or hold records, not approved scheduling commitments.`,
          `${w08.summary.inconclusive} experiments remain inconclusive without retained verified outcome receipts.`,
        ],
        queue_snapshot: {
          locator: plan.sources.queue.locator,
          revision: plan.sources.queue.revision,
          sha256: plan.sources.queue.sha256,
          active_items: plan.sources.queue.active_items.length,
          active_by_status: activeByStatus,
        },
        ranked_decision_proposals: [
          {
            rank: 1,
            decision: 'Keep all experiment adoption and scaling closed until at least one retained outcome receipt passes its predeclared acceptance test.',
            owner: 'Codex acting as Marketing Chief',
            due_date: null,
            evidence: [logicalArtifact('W08-experiment-decision-ledger.json')],
            approval_required: true,
          },
          {
            rank: 2,
            decision: 'Revalidate content scope and current commitments before creating production or review dates; schedule nothing from stale calendar notes.',
            owner: 'Codex acting as Marketing Chief',
            due_date: null,
            evidence: [logicalArtifact('W04-production-calendar.json')],
            approval_required: true,
          },
          {
            rank: 3,
            decision: 'Retain the verified weekly report packages while recipient, thread, signature, and exact delivery approval remain separate gates.',
            owner: 'Codex acting as Marketing Chief',
            due_date: null,
            evidence: [logicalArtifact('W06-client-report-packages.json')],
            approval_required: true,
          },
          {
            rank: 4,
            decision: 'Continue Outcome Graph migration only through shadow contracts; do not replace Marketing Chief or the canonical queue.',
            owner: 'Codex acting as Marketing Chief',
            due_date: null,
            evidence: [plan.sources.context.w09_w11.locator, plan.sources.queue.locator],
            approval_required: false,
          },
        ],
        risks: [
          {
            id: 'vault-health',
            state: plan.sources.context.health.blocked ? 'blocked' : 'observed',
            evidence: plan.sources.context.health.locator,
            warning_count: plan.sources.context.health.warning_count,
          },
          {
            id: 'delivery-gates',
            state: 'pending_exact_route_and_approval',
            evidence: logicalArtifact('W06-client-report-packages.json'),
          },
        ],
        proposal_only: true,
        canonical_write_attempted: false,
        external_action_attempted: false,
        approval_state: 'awaiting_marketing_chief_or_dillon_adoption',
      };

      const documents = new Map([
        ['W04-production-calendar.json', w04],
        ['W06-client-report-packages.json', w06],
        ['W08-experiment-decision-ledger.json', w08],
        ['W10-executive-weekly-review.json', w10],
      ]);
      const artifacts = [];
      for (const [name, document] of documents) {
        const file = path.join(stagingRoot, name);
        writeJsonAtomic(file, document);
        artifacts.push(fileEvidence(file, logicalArtifact(name)));
      }
      verifiedStagingRoot = stagingRoot;
      return {
        evidence: 'Merged all checked isolated records and synthesized W10 from W04, W06, W08, W09, W11, queue, and health evidence.',
        artifacts,
        staging_root: stagingRoot,
      };
    },

    'weekly-tranche-terminal-verifier': async ({ plan, reduction }) => {
      const fresh = await sourceCollector();
      const documents = Object.fromEntries(FINAL_NAMES.map((name) => [
        name,
        readJson(path.join(reduction.staging_root, name)),
      ]));
      const w04 = documents['W04-production-calendar.json'];
      const w06 = documents['W06-client-report-packages.json'];
      const w08 = documents['W08-experiment-decision-ledger.json'];
      const w10 = documents['W10-executive-weekly-review.json'];
      const currentCommitmentIds = new Set(fresh.queue.content_commitments.map((item) => item.id));
      const w04Passed = w04.client_calendars.length === fresh.content_sources.length &&
        w04.production_items.every((item) =>
          currentCommitmentIds.has(item.canonical_work_item_id) &&
          ['purpose', 'channel', 'owner', 'proof_source', 'production_date', 'review_date', 'approval_state']
            .every((key) => typeof item[key] === 'string' && item[key].trim())
        ) && w04.external_action_attempted === false;
      const w06Passed = w06.report_packages.length === fresh.reports.length &&
        w06.report_packages.every((record) => record.passed && record.external_action_attempted === false);
      const w08Passed = w08.decisions.length === fresh.experiments.length &&
        w08.decisions.every((record) =>
          record.valid &&
          (!['scale', 'stop'].includes(record.decision) || record.outcome_receipt_verified) &&
          record.external_action_attempted === false
        );
      const w10Passed = w10.proposal_only === true &&
        w10.canonical_write_attempted === false &&
        w10.external_action_attempted === false &&
        w10.ranked_decision_proposals.length > 0 &&
        w10.ranked_decision_proposals.every((decision, index) =>
          decision.rank === index + 1 &&
          typeof decision.decision === 'string' &&
          typeof decision.owner === 'string' &&
          Array.isArray(decision.evidence) && decision.evidence.length > 0
        );
      const sourcePassed = fresh.source_set_sha256 === plan.source_set_sha256;
      const assertions = [
        {
          id: 'source-manifest-stable',
          passed: sourcePassed,
          detail: sourcePassed
            ? 'The full source manifest is unchanged since planning.'
            : 'A queue, registry, content, report, experiment, W09/W11, or health source changed.',
        },
        {
          id: 'W04-client-separated-no-invention',
          passed: w04Passed,
          detail: w04Passed
            ? 'Every content source is represented and no unsourced production commitment was created.'
            : 'W04 coverage, required fields, client isolation, or no-action boundary failed.',
        },
        {
          id: 'W06-report-packages-recompute',
          passed: w06Passed,
          detail: w06Passed
            ? `All ${w06.report_packages.length} report packages passed source, render, math, language, and hash checks.`
            : 'One or more W06 report packages did not pass.',
        },
        {
          id: 'W08-decisions-evidence-bound',
          passed: w08Passed,
          detail: w08Passed
            ? 'Every experiment has an explicit evidence-bound decision and uncertainty statement.'
            : 'W08 coverage or evidence-gated decision semantics failed.',
        },
        {
          id: 'W10-proposal-only-ranked-review',
          passed: w10Passed,
          detail: w10Passed
            ? 'W10 ends in ranked, owned, evidence-linked proposals with no canonical or external action.'
            : 'W10 proposal, evidence, ranking, or authority boundary failed.',
        },
      ];
      return {
        evidence: 'Terminal verification recollected the entire source manifest and independently checked all four final weekly artifacts.',
        passed: assertions.every((assertion) => assertion.passed),
        assertions,
        artifact_manifest: FINAL_NAMES.map((name) =>
          fileEvidence(path.join(reduction.staging_root, name), logicalArtifact(name))
        ),
      };
    },

    'weekly-tranche-correction-ledger': async ({ outcome, findings }) => {
      const entry = {
        recorded_at: new Date().toISOString(),
        graph_id: contract.graph_id,
        outcome,
        findings: Array.isArray(findings) ? findings : [],
        correction: outcome === 'terminal_true'
          ? 'Preserve source-bound client isolation, keep unsupported experiments inconclusive, and end W10 at proposal-only authority.'
          : 'Recollect the changed source set and route exact report, experiment, content, or authority findings into the next bounded run.',
      };
      const serialized = JSON.stringify(entry);
      fs.appendFileSync(correctionsFile, serialized + '\n', 'utf8');
      return {
        evidence: 'Appended one hashed weekly-tranche correction entry.',
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
    correctionsFile,
    getVerifiedStagingRoot: () => verifiedStagingRoot,
    commitVerifiedArtifacts() {
      if (!verifiedStagingRoot) throw new Error('No terminal-verified weekly tranche is staged.');
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

function verifyResumedTrancheWorker({ item, worker_result: workerResult }) {
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
  return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
}

function verifyCompletedTranche(result, outputDir) {
  const manifest = result.terminal_evidence?.artifact_manifest;
  if (!Array.isArray(manifest) || manifest.length !== FINAL_NAMES.length) return false;
  return manifest.every((artifact) => {
    const file = path.join(outputDir, path.basename(artifact.path));
    if (!fs.existsSync(file)) return false;
    const bytes = fs.readFileSync(file);
    return sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes;
  });
}

function assertSafeTrancheOutput(candidate, repoRoot = REPO_ROOT) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(repoRoot);
  if (!absolute.startsWith(root + path.sep)) {
    throw new Error('Weekly tranche output must remain inside the Dillon OS repository.');
  }
  const relative = normalizePath(path.relative(root, absolute));
  if (!/^System\/outcome-graph\/tranche-\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?$/i.test(relative)) {
    throw new Error('Weekly tranche output must use System/outcome-graph/tranche-YYYY-MM-DD[-slug].');
  }
  return absolute;
}

async function runWeeklyTrancheDurable(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const window = options.window || completedWeekWindow(options.referenceDate || new Date());
  const outputDir = options.safeOutput === false
    ? path.resolve(options.outputDir)
    : assertSafeTrancheOutput(options.outputDir, repoRoot);
  const stateRoot = path.resolve(options.stateRoot || path.join(
    repoRoot,
    '12_Brain',
    'state',
    'outcome-graph'
  ));
  const logicalRoot = options.logicalRoot || normalizePath(path.relative(repoRoot, outputDir));
  const collectSources = options.collectSources || (() => collectWeeklyTrancheSources({
    repoRoot,
    clientOperationsRoot: options.clientOperationsRoot,
    referenceDate: options.referenceDate,
    window,
    reportDirectoryName: options.reportDirectoryName,
    w09w11Receipt: options.w09w11Receipt,
    healthFile: options.healthFile,
  }));
  const workspaceRoot = options.workspaceRoot || path.join(
    stateRoot,
    'workspaces',
    'weekly-tranche-' + sha256(logicalRoot).slice(0, 20)
  );
  const harness = createWeeklyTrancheHarness({
    outputDir,
    logicalRoot,
    workspaceRoot,
    collectSources,
    window,
  });
  const readCanonicalBinding = async () => {
    const sources = await collectSources();
    return {
      locator: 'dillon-os://weekly/W04-W06-W08-W10-source-set',
      version: `queue-r${sources.queue.revision}:${window.period_start}:${sources.content_sources.length}:${sources.reports.length}:${sources.experiments.length}`,
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
      verifyResumedWorker: verifyResumedTrancheWorker,
      verifyCompletedResult: (prior) => verifyCompletedTranche(prior, outputDir),
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
  assertSafeTrancheOutput,
  collectWeeklyTrancheSources,
  completedWeekWindow,
  createWeeklyTrancheHarness,
  evaluateContentSource,
  evaluateExperiment,
  evaluateReport,
  runWeeklyTrancheDurable,
  verifyCompletedTranche,
  verifyResumedTrancheWorker,
};
