'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { readJson, repoPath } = require('./fsutil');

// Calibration multipliers never push a tier below these floors; the tiers are
// evidence classes, and hindcast misses lower confidence without erasing them.
const TIER_CALIBRATION_FLOOR = Object.freeze({
  'owner-verified-recurrence': 0.75,
  'historical-cadence': 0.6,
});

const CLOSED_STATUSES = new Set([
  'done',
  'complete',
  'completed',
  'cancelled',
  'canceled',
  'archived',
]);

const STATUS_CONFIDENCE = Object.freeze({
  verification: 0.9,
  needs_approval: 0.86,
  ready: 0.9,
  in_progress: 0.92,
  active: 0.88,
  queued: 0.82,
  blocked: 0.68,
  deferred: 0.35,
});

const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function isoDay(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${value}`);
  return parsed.toISOString().slice(0, 10);
}

function dayDate(value) {
  return new Date(`${isoDay(value)}T00:00:00.000Z`);
}

function addDays(value, days) {
  return new Date(dayDate(value).getTime() + days * DAY_MS);
}

function diffDays(from, to) {
  return Math.round((dayDate(to).getTime() - dayDate(from).getTime()) / DAY_MS);
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function confidenceLabel(value) {
  if (value >= 0.9) return 'confirmed-pattern';
  if (value >= 0.75) return 'likely';
  if (value >= 0.5) return 'watch';
  return 'weak-signal';
}

function loadCatalog(file = repoPath('_os', 'automation', 'config', 'work-package-profiles.json')) {
  const catalog = readJson(file);
  if (!catalog || catalog.schema_version !== 1 || !Array.isArray(catalog.profiles)) {
    throw new Error(`Invalid work-package catalog: ${file}`);
  }
  const ids = new Set();
  for (const profile of catalog.profiles) {
    if (!profile.id || ids.has(profile.id)) throw new Error(`Duplicate or missing profile id: ${profile.id}`);
    ids.add(profile.id);
    if (!Array.isArray(profile.signals) || profile.signals.length === 0) {
      throw new Error(`Profile ${profile.id} has no signals`);
    }
  }
  for (const recurrence of catalog.recurrences || []) {
    if (!ids.has(recurrence.profile_id)) {
      throw new Error(`Recurrence ${recurrence.id} references unknown profile ${recurrence.profile_id}`);
    }
  }
  return catalog;
}

function classifyWork(text, clientId, catalog) {
  const normalized = normalizeText(text);
  const scored = [];
  for (const profile of catalog.profiles) {
    if (Array.isArray(profile.client_ids)
      && profile.client_ids.length > 0
      && !profile.client_ids.includes(clientId)) continue;

    let score = 0;
    const matches = [];
    for (const signal of profile.signals) {
      const term = normalizeText(signal.term);
      if (term && ` ${normalized} `.includes(` ${term} `)) {
        const weight = Number(signal.weight) || 1;
        score += weight;
        matches.push({ term: signal.term, weight });
      }
    }
    if (Array.isArray(profile.client_ids) && profile.client_ids.includes(clientId) && score > 0) {
      score += 3;
      matches.push({ term: `client:${clientId}`, weight: 3 });
    }
    if (score > 0) scored.push({ profile, score, matches });
  }
  scored.sort((a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id));
  if (!scored.length || scored[0].score < 3) {
    return {
      primary: null,
      secondary: [],
      score: 0,
      matches: [],
    };
  }
  const primary = scored[0];
  const secondary = scored
    .slice(1)
    .filter((entry) => entry.score >= Math.max(4, primary.score * 0.65))
    .slice(0, 2)
    .map((entry) => ({
      profile_id: entry.profile.id,
      label: entry.profile.label,
      score: entry.score,
      matches: entry.matches,
    }));
  return {
    primary: primary.profile,
    secondary,
    score: primary.score,
    matches: primary.matches,
  };
}

function parseDatedDirectory(name) {
  const match = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(name);
  if (!match) return null;
  const parsed = dayDate(match[1]);
  return {
    date: isoDay(parsed),
    slug: match[2],
  };
}

function discoverDeliverableEvents(clientOpsRoot, catalog, { asOf, historyDays = 90 } = {}) {
  if (!clientOpsRoot) return [];
  const clientsRoot = path.join(clientOpsRoot, 'clients');
  if (!fs.existsSync(clientsRoot)) return [];
  const end = dayDate(asOf || new Date());
  const start = addDays(end, -(historyDays - 1));
  const events = [];

  for (const clientEntry of fs.readdirSync(clientsRoot, { withFileTypes: true })) {
    if (!clientEntry.isDirectory()) continue;
    const deliverablesRoot = path.join(clientsRoot, clientEntry.name, 'deliverables');
    if (!fs.existsSync(deliverablesRoot)) continue;
    for (const entry of fs.readdirSync(deliverablesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dated = parseDatedDirectory(entry.name);
      if (!dated) continue;
      const eventDate = dayDate(dated.date);
      if (eventDate < start || eventDate > end) continue;
      const text = normalizeText(`${clientEntry.name} ${dated.slug}`);
      const classification = classifyWork(text, clientEntry.name, catalog);
      events.push({
        event_id: `${clientEntry.name}:${entry.name}`,
        date: dated.date,
        client_id: clientEntry.name,
        title: dated.slug.replace(/-/g, ' '),
        work_package_id: classification.primary?.id || 'unclassified',
        work_package_label: classification.primary?.label || 'Unclassified work package',
        secondary: classification.secondary,
        classifier_score: classification.score,
        classifier_matches: classification.matches,
        source_ref: `client-operations://clients/${clientEntry.name}/deliverables/${entry.name}`,
      });
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.event_id.localeCompare(b.event_id));
}

function loadWorkItems(clientOpsRoot) {
  if (!clientOpsRoot) return { items: [], source: null, available: false };
  const file = path.join(clientOpsRoot, 'queue', 'work-items.json');
  const queue = readJson(file, null);
  if (!queue) return { items: [], source: file, available: false };
  const items = Array.isArray(queue) ? queue : queue.workItems;
  return {
    items: Array.isArray(items) ? items : [],
    source: file,
    available: true,
  };
}

function workItemText(item) {
  return [
    item.title,
    item.requestedOutcome,
    item.nextAction,
    item.execution?.actionClass,
    ...(item.definitionOfDone || []),
  ].filter(Boolean).join(' ');
}

function candidateId(parts) {
  return normalizeText(parts.join(' ')).replace(/ /g, '-').slice(0, 140);
}

function profileById(catalog, id) {
  return catalog.profiles.find((profile) => profile.id === id) || null;
}

function buildHandoff(candidate) {
  return {
    workflow_id: 'predictive-work-planner-v1',
    step_id: `prepare-${candidate.work_package_id}`,
    task: `Prepare the reviewable ${candidate.work_package_label} package for ${candidate.client_id || 'the resolved portfolio route'}.`,
    constraints: [
      'Resolve the exact client, account, source, repository, and destination before writing state.',
      'Treat predictions as evidence, not as authorization or proof that a request exists.',
      'No send, publish, spend, account change, or canonical queue mutation from this handoff.',
      'Stop on cross-client ambiguity, missing primary evidence, or a human-only authentication gate.',
    ],
    upstream_artifacts: [...candidate.source_refs],
    preparation_contract: candidate.preparation_contract,
    budget_tokens: 12000,
    timeout_seconds: 1800,
  };
}

function makeCandidate({
  id,
  profile,
  clientId,
  clients,
  title,
  state,
  confidence,
  evidenceTier,
  window,
  reason,
  sourceRefs,
  secondary = [],
  blockers = [],
  confirmedRequest = false,
  confirmedDeadline = false,
}) {
  const candidate = {
    candidate_id: id,
    client_id: clientId,
    clients: clients?.length ? [...clients] : undefined,
    title,
    work_package_id: profile?.id || 'unclassified',
    work_package_label: profile?.label || 'Unclassified work package',
    secondary_work_packages: secondary,
    state,
    // A candidate is always a prediction. Only a canonical queue row is a
    // confirmed request, and only its recorded dueAt is a confirmed deadline.
    claim_type: 'prediction',
    confirmed_request: confirmedRequest,
    confirmed_deadline: confirmedDeadline,
    confidence: +clamp(confidence, 0, 1).toFixed(2),
    confidence_label: confidenceLabel(confidence),
    evidence_tier: evidenceTier,
    predicted_window: window,
    reason,
    source_refs: unique(sourceRefs),
    artifact_manifest: profile ? [...profile.artifact_manifest] : [],
    prepare_now: profile ? [...profile.prepare_now] : [],
    human_gates: unique([...(profile?.human_gates || []), ...blockers]),
    preparation_contract: profile?.preparation_contract || null,
    calibration: null,
  };
  candidate.handoff = buildHandoff(candidate);
  return candidate;
}

function workItemConfidence(item, asOf) {
  const status = normalizeText(item.status).replace(/ /g, '_');
  let value = STATUS_CONFIDENCE[status] ?? 0.72;
  const updated = item.updatedAt || item.createdAt || item.source?.observedAt;
  if (updated && !Number.isNaN(Date.parse(updated))) {
    const age = Math.max(0, diffDays(updated, asOf));
    value -= Math.min(0.25, Math.floor(age / 30) * 0.06);
  } else {
    value -= 0.08;
  }
  return clamp(value, 0.2, 0.95);
}

function workItemAgeDays(item, asOf) {
  const updated = item.updatedAt || item.createdAt || item.source?.observedAt;
  if (!updated || Number.isNaN(Date.parse(updated))) return null;
  return Math.max(0, diffDays(updated, asOf));
}

function candidateFromWorkItem(item, catalog, asOf) {
  const status = normalizeText(item.status).replace(/ /g, '_');
  if (CLOSED_STATUSES.has(status)) return null;
  const classification = classifyWork(workItemText(item), item.clientId, catalog);
  const profile = classification.primary;
  if (!profile) return null;
  const due = item.dueAt && !Number.isNaN(Date.parse(item.dueAt)) ? isoDay(item.dueAt) : null;
  const futureDue = due && due >= isoDay(asOf);
  const age = workItemAgeDays(item, asOf);
  const staleLimit = status === 'blocked' || status === 'deferred'
    ? 21
    : status === 'verification' || status === 'needs_approval'
      ? 35
      : 60;
  if (!futureDue && age !== null && age > staleLimit) return null;
  let basis = 'open-queue-item';
  let start = futureDue ? due : null;
  let end = futureDue ? due : null;
  if (due && !futureDue) {
    basis = `past-due-${status || 'open'}`;
  } else if (!due) {
    if (status === 'blocked') basis = 'when-gate-clears';
    else if (status === 'deferred') basis = 'deferred-no-date';
    else if (status === 'needs_approval') basis = 'needs-approval';
    else if (status === 'verification') basis = 'verification-needed';
    else basis = 'active-no-date';
  }
  const blockers = [];
  if (status === 'blocked') blockers.push(`Canonical work item ${item.id} is blocked; do not treat the predicted package as ready to execute.`);
  if (status === 'needs_approval') blockers.push(`Canonical work item ${item.id} still requires its recorded approval.`);
  if (status === 'deferred') blockers.push(`Canonical work item ${item.id} is deferred and must not be pulled forward by prediction alone.`);
  if (!profile) blockers.push('The current catalog cannot confidently classify this item; route it before preparing assets.');

  return makeCandidate({
    id: candidateId(['queue', item.id || item.title]),
    profile,
    clientId: item.clientId || null,
    title: item.title || 'Untitled canonical work item',
    state: status || 'open',
    confidence: workItemConfidence(item, asOf),
    evidenceTier: 'canonical-queue',
    window: { start, end, basis },
    reason: item.nextAction || item.requestedOutcome || `Open canonical work item in state ${status || 'unknown'}.`,
    sourceRefs: unique([
      item.source?.locator,
      item.id ? `client-operations://queue/work-items.json#${item.id}` : null,
      ...(item.evidence?.refs || []),
    ]),
    secondary: classification.secondary,
    blockers,
    confirmedRequest: true,
    confirmedDeadline: Boolean(futureDue),
  });
}

function nextRecurrenceDate(anchorDate, cadence, asOf) {
  const interval = cadence === 'weekly' ? 7 : cadence === 'biweekly' ? 14 : null;
  if (interval) {
    let next = dayDate(anchorDate);
    const current = dayDate(asOf);
    while (next < current) next = addDays(next, interval);
    if (next.getTime() === current.getTime() && isoDay(anchorDate) !== isoDay(asOf)) {
      next = addDays(next, interval);
    }
    return next;
  }
  if (cadence === 'monthly') {
    const anchor = dayDate(anchorDate);
    let next = new Date(Date.UTC(
      dayDate(asOf).getUTCFullYear(),
      dayDate(asOf).getUTCMonth(),
      Math.min(anchor.getUTCDate(), 28),
    ));
    if (next < dayDate(asOf)) next = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()));
    return next;
  }
  throw new Error(`Unsupported recurrence cadence: ${cadence}`);
}

function candidatesFromVerifiedRecurrences(catalog, asOf, lookaheadDays, events = []) {
  const current = dayDate(asOf);
  const last = addDays(current, lookaheadDays);
  const candidates = [];
  for (const recurrence of catalog.recurrences || []) {
    const next = nextRecurrenceDate(recurrence.anchor_date, recurrence.cadence, current);
    if (next > last) continue;
    const profile = profileById(catalog, recurrence.profile_id);
    const nextDay = isoDay(next);
    const support = events.filter((event) => event.client_id === recurrence.client_id
      && event.work_package_id === recurrence.profile_id
      && event.date <= isoDay(current)).length;
    const candidate = makeCandidate({
      id: candidateId(['recurrence', recurrence.id, nextDay]),
      profile,
      clientId: recurrence.client_id,
      title: `${profile.label} expected around ${nextDay}`,
      state: 'scheduled-pattern',
      confidence: recurrence.confidence,
      evidenceTier: 'owner-verified-recurrence',
      window: {
        start: nextDay,
        end: isoDay(addDays(next, Math.min(2, lookaheadDays))),
        basis: recurrence.cadence,
      },
      reason: `${recurrence.note || `${recurrence.cadence} owner-verified recurrence.`} ${support} matching dated package${support === 1 ? '' : 's'} observed in the history window.`,
      sourceRefs: recurrence.source_refs || [],
    });
    candidate.history_support = support;
    candidates.push(candidate);
  }
  return candidates;
}

function cadenceLabel(days) {
  if (days >= 6 && days <= 8) return 'weekly';
  if (days >= 12 && days <= 16) return 'biweekly';
  if (days >= 25 && days <= 35) return 'monthly';
  return null;
}

function candidatesFromHistory(events, catalog, asOf, lookaheadDays) {
  const groups = new Map();
  for (const event of events) {
    if (event.work_package_id === 'unclassified') continue;
    let subtype = 'general';
    if (event.work_package_id === 'branded-client-report') {
      const title = normalizeText(event.title);
      if (title.includes('monthly')) subtype = 'monthly';
      else if (title.includes('weekly')) subtype = 'weekly';
    }
    const key = `${event.client_id}|${event.work_package_id}|${subtype}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(event);
  }
  const current = dayDate(asOf);
  const lastVisible = addDays(current, lookaheadDays);
  const explicit = new Set((catalog.recurrences || []).map((row) => `${row.client_id}|${row.profile_id}`));
  const candidates = [];

  for (const [key, group] of groups) {
    const [clientId, profileId, subtype] = key.split('|');
    if (explicit.has(`${clientId}|${profileId}`)) continue;
    const dates = unique(group.map((row) => row.date)).sort();
    if (dates.length < 2) continue;
    if (dates.length < 3 && profileId !== 'branded-client-report') continue;
    const intervals = dates.slice(1).map((date, index) => diffDays(dates[index], date));
    const center = median(intervals);
    const cadence = cadenceLabel(center);
    if (!cadence) continue;
    const deviations = intervals.map((value) => Math.abs(value - center));
    const dispersion = median(deviations) || 0;
    if (dispersion > Math.max(3, center * 0.25)) continue;
    let next = addDays(dates[dates.length - 1], Math.round(center));
    while (next < current) next = addDays(next, Math.round(center));
    if (next > lastVisible) continue;
    const profile = profileById(catalog, profileId);
    const confidence = clamp(
      0.45 + Math.min(0.22, dates.length * 0.055) + (dispersion <= 1 ? 0.08 : 0),
      0,
      0.82,
    );
    const nextDay = isoDay(next);
    candidates.push(makeCandidate({
      id: candidateId(['history', clientId, profileId, nextDay]),
      profile,
      clientId,
      title: `${profile.label} historical cadence watch`,
      state: 'cadence-watch',
      confidence,
      evidenceTier: 'historical-cadence',
      window: { start: nextDay, end: isoDay(addDays(next, 2)), basis: cadence },
      reason: `${dates.length} dated ${subtype === 'general' ? '' : `${subtype} `}packages imply a ${cadence} median interval of ${center} days; prediction is not a request or deadline.`,
      sourceRefs: group.slice(-6).map((row) => row.source_ref),
    }));
  }
  return candidates;
}

function consolidatePortfolioBatches(candidates, catalog) {
  const reportCandidates = candidates
    .filter((candidate) => candidate.evidence_tier === 'historical-cadence'
      && candidate.work_package_id === 'branded-client-report'
      && candidate.predicted_window.start)
    .sort((a, b) => a.predicted_window.start.localeCompare(b.predicted_window.start));
  const groups = [];
  for (const candidate of reportCandidates) {
    const current = groups[groups.length - 1];
    if (!current || diffDays(current[current.length - 1].predicted_window.start, candidate.predicted_window.start) > 2) {
      groups.push([candidate]);
    } else {
      current.push(candidate);
    }
  }
  const consumed = new Set();
  const batches = [];
  for (const group of groups) {
    if (group.length < 3) continue;
    group.forEach((candidate) => consumed.add(candidate.candidate_id));
    const profile = profileById(catalog, 'branded-client-report');
    const clients = group.map((candidate) => candidate.client_id).sort();
    const confidence = group.reduce((sum, candidate) => sum + candidate.confidence, 0) / group.length;
    const start = group[0].predicted_window.start;
    const end = group[group.length - 1].predicted_window.end;
    batches.push(makeCandidate({
      id: candidateId(['portfolio-batch', 'branded-client-report', start, end]),
      profile,
      clientId: 'portfolio/multiple',
      clients,
      title: `Branded client report batch watch (${clients.length} routes)`,
      state: 'cadence-watch',
      confidence,
      evidenceTier: 'historical-cadence',
      window: { start, end, basis: 'portfolio-batch' },
      reason: `${clients.length} client routes share the same historical report window. This is a preparation signal, not a confirmed reporting deadline.`,
      sourceRefs: unique(group.flatMap((candidate) => candidate.source_refs)).slice(0, 30),
    }));
  }
  return [...candidates.filter((candidate) => !consumed.has(candidate.candidate_id)), ...batches];
}

function dateRange(start, end) {
  const days = [];
  let cursor = dayDate(start);
  const last = dayDate(end);
  while (cursor <= last) {
    days.push(isoDay(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function buildWorkloadSeries(events, catalog, { asOf, historyDays = 90 } = {}) {
  const end = isoDay(asOf || new Date());
  const start = isoDay(addDays(end, -(historyDays - 1)));
  const dates = dateRange(start, end);
  const profiles = catalog.profiles.map((profile) => profile.id);
  const counts = new Map(dates.map((date) => [date, { total: 0 }]));
  for (const date of dates) {
    for (const profileId of profiles) counts.get(date)[profileId] = 0;
  }
  for (const event of events) {
    const row = counts.get(event.date);
    if (!row) continue;
    row.total += 1;
    if (Object.hasOwn(row, event.work_package_id)) row[event.work_package_id] += 1;
  }
  const series = [{
    series_id: 'work-packages-total',
    label: 'All dated work packages',
    values: dates.map((date) => counts.get(date).total),
    forecast_eligible: true,
    forecast_eligibility_reason: 'Portfolio total has a complete contiguous daily series.',
  }];
  for (const profile of catalog.profiles) {
    const values = dates.map((date) => counts.get(date)[profile.id]);
    const nonzero = values.filter((value) => value > 0).length;
    if (nonzero < 2) continue;
    series.push({
      series_id: `work-packages-${profile.id}`,
      label: profile.label,
      values,
      nonzero_days: nonzero,
      forecast_eligible: nonzero >= 24 && values.reduce((sum, value) => sum + value, 0) >= 32,
      forecast_eligibility_reason: nonzero >= 24 && values.reduce((sum, value) => sum + value, 0) >= 32
        ? 'Category has at least 24 nonzero days and 32 observed packages.'
        : 'Sparse category remains on deterministic cadence and classification evidence until it has at least 24 nonzero days and 32 observed packages.',
    });
  }
  series.sort((a, b) => {
    if (a.series_id === 'work-packages-total') return -1;
    if (b.series_id === 'work-packages-total') return 1;
    const sumA = a.values.reduce((sum, value) => sum + value, 0);
    const sumB = b.values.reduce((sum, value) => sum + value, 0);
    return sumB - sumA || a.series_id.localeCompare(b.series_id);
  });
  const safeEvents = events.map(({ date, work_package_id: packageId }) => ({ date, work_package_id: packageId }));
  return {
    schema_version: 1,
    frequency: 'day',
    start_date: start,
    end_date: end,
    observations: dates.length,
    event_count: events.length,
    source_fingerprint: fingerprint(safeEvents),
    dates,
    series,
  };
}

function knownFutureCovariates(dates, horizon) {
  const allDates = [...dates];
  let cursor = dayDate(dates[dates.length - 1]);
  for (let index = 0; index < horizon; index += 1) {
    cursor = addDays(cursor, 1);
    allDates.push(isoDay(cursor));
  }
  return [
    {
      series_id: 'is-weekend',
      values: allDates.map((date) => {
        const day = dayDate(date).getUTCDay();
        return day === 0 || day === 6 ? 1 : 0;
      }),
    },
    {
      series_id: 'day-of-week-sin',
      values: allDates.map((date) => Math.sin((2 * Math.PI * dayDate(date).getUTCDay()) / 7)),
    },
    {
      series_id: 'day-of-week-cos',
      values: allDates.map((date) => Math.cos((2 * Math.PI * dayDate(date).getUTCDay()) / 7)),
    },
  ];
}

function buildForecastRequest(workloadSeries, { generatedAt, horizon = 14 } = {}) {
  if (workloadSeries.observations < 32) return null;
  const targets = workloadSeries.series.filter((series) => series.forecast_eligible).slice(0, 8).map((series) => ({
    series_id: series.series_id,
    values: [...series.values],
  }));
  return {
    schema_version: 1,
    request_id: `forecast-dillon-workload-daily-${generatedAt.slice(0, 10)}`,
    as_of: generatedAt,
    cutoff_at: generatedAt,
    source_observed_at: generatedAt,
    max_source_age_hours: 24,
    client_id: 'portfolio/system',
    route_verified: true,
    cadence_verified: true,
    leakage_checked: true,
    series_id: 'dillon-work-package-arrivals-daily',
    frequency: 'day',
    horizon,
    targets,
    past_covariates: [],
    past_future_covariates: knownFutureCovariates(workloadSeries.dates, horizon),
    source_locators: [
      `_os/automation/config/work-package-profiles.json#updated=${workloadSeries.end_date}`,
      `client-operations://deliverables/daily-category-counts#sha256=${workloadSeries.source_fingerprint}`,
    ],
    contains_client_series: false,
    model_id: 'amazon/chronos-2',
    license_lane: 'apache-2.0',
    used_for: 'research',
  };
}

function gitOutput(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 15000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

// Records which client-operations checkout the prediction was read from. A
// dirty or non-main checkout is still usable, but the brief must say so.
function checkoutProvenance(root) {
  if (!root || !fs.existsSync(root)) return { available: false };
  const head = gitOutput(root, ['rev-parse', '--short', 'HEAD']);
  if (!head) return { available: true, git: false };
  const branch = gitOutput(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const porcelain = gitOutput(root, ['status', '--porcelain']);
  const dirtyFiles = porcelain ? porcelain.split(/\r?\n/).filter(Boolean).length : 0;
  const counts = gitOutput(root, ['rev-list', '--left-right', '--count', 'origin/main...HEAD']);
  const [behind, ahead] = counts ? counts.split(/\s+/).map(Number) : [null, null];
  return {
    available: true,
    git: true,
    branch,
    head,
    dirty_files: dirtyFiles,
    ahead_of_origin_main: ahead,
    behind_origin_main: behind,
    canonical_main: branch === 'main' && ahead === 0 && behind === 0 && dirtyFiles === 0,
  };
}

// Re-runs the deterministic predictors from several past origins and checks
// whether a matching dated package actually landed inside each predicted
// window. Produces per-tier and per-profile hit rates that are applied as
// bounded confidence multipliers once a tier has at least three judgements.
function hindcastCalibration(events, catalog, asOf, {
  origins = [7, 14, 21, 28],
  lookaheadDays = 14,
  tolerance = 2,
} = {}) {
  const today = dayDate(asOf);
  const tiers = {};
  const profiles = {};
  const bump = (bucket, key, hit) => {
    if (!bucket[key]) bucket[key] = { predicted: 0, hit: 0 };
    bucket[key].predicted += 1;
    if (hit) bucket[key].hit += 1;
  };
  for (const offset of origins) {
    const pastAsOf = isoDay(addDays(today, -offset));
    const pastEvents = events.filter((event) => event.date <= pastAsOf);
    const predicted = [
      ...candidatesFromVerifiedRecurrences(catalog, pastAsOf, lookaheadDays, pastEvents),
      ...candidatesFromHistory(pastEvents, catalog, pastAsOf, lookaheadDays),
    ];
    for (const candidate of predicted) {
      const { start, end } = candidate.predicted_window;
      if (!start || !end) continue;
      const lastJudgeable = addDays(end, tolerance);
      if (lastJudgeable > today) continue;
      const windowStart = isoDay(addDays(start, -tolerance));
      const windowEnd = isoDay(lastJudgeable);
      const hit = events.some((event) => event.client_id === candidate.client_id
        && event.work_package_id === candidate.work_package_id
        && event.date >= windowStart
        && event.date <= windowEnd);
      bump(tiers, candidate.evidence_tier, hit);
      bump(profiles, candidate.work_package_id, hit);
    }
  }
  const finish = (bucket, floors) => Object.fromEntries(Object.entries(bucket).map(([key, row]) => {
    const hitRate = row.predicted ? +(row.hit / row.predicted).toFixed(3) : null;
    const sufficient = row.predicted >= 3;
    const floor = floors ? (floors[key] ?? 0.5) : 0.5;
    const multiplier = sufficient ? +clamp(0.6 + 0.4 * hitRate, floor, 1).toFixed(3) : 1;
    return [key, { ...row, hit_rate: hitRate, sample_sufficient: sufficient, multiplier }];
  }));
  return {
    basis: 'hindcast',
    origins_days: [...origins],
    lookahead_days: lookaheadDays,
    tolerance_days: tolerance,
    judged_through: isoDay(today),
    tiers: finish(tiers, TIER_CALIBRATION_FLOOR),
    profiles: finish(profiles, null),
  };
}

function applyCalibration(candidates, calibration) {
  for (const candidate of candidates) {
    if (!(candidate.evidence_tier in TIER_CALIBRATION_FLOOR)) continue;
    const row = calibration.tiers[candidate.evidence_tier];
    if (!row) continue;
    const raw = candidate.confidence;
    const adjusted = row.sample_sufficient ? +clamp(raw * row.multiplier, 0, 1).toFixed(2) : raw;
    candidate.calibration = {
      basis: calibration.basis,
      tier: candidate.evidence_tier,
      predicted: row.predicted,
      hit: row.hit,
      hit_rate: row.hit_rate,
      multiplier: row.multiplier,
      applied: row.sample_sufficient,
      raw_confidence: raw,
    };
    candidate.confidence = adjusted;
    candidate.confidence_label = confidenceLabel(adjusted);
  }
  return candidates;
}

const GATED_STATES = new Set(['blocked', 'deferred', 'needs_approval', 'verification']);

function planSummary(candidate) {
  return {
    candidate_id: candidate.candidate_id,
    client_id: candidate.client_id,
    work_package_id: candidate.work_package_id,
    work_package_label: candidate.work_package_label,
    window: candidate.predicted_window,
    confidence: candidate.confidence,
    confidence_label: candidate.confidence_label,
    claim_type: candidate.claim_type,
    confirmed_request: candidate.confirmed_request,
    confirmed_deadline: candidate.confirmed_deadline,
    state: candidate.state,
    evidence_tier: candidate.evidence_tier,
  };
}

// Mechanical inputs for plan-today so the ordering rules are enforced here,
// not re-interpreted from prose by whichever model runs the morning brief.
function buildPlanInputs(candidates, asOf, status) {
  const today = isoDay(asOf);
  const soon = isoDay(addDays(today, 7));
  const hardCommitments = candidates
    .filter((candidate) => candidate.confirmed_deadline
      && candidate.predicted_window.start
      && candidate.predicted_window.start >= today)
    .sort((a, b) => a.predicted_window.start.localeCompare(b.predicted_window.start))
    .map(planSummary);
  const gated = candidates
    .filter((candidate) => candidate.evidence_tier === 'canonical-queue' && GATED_STATES.has(candidate.state))
    .map(planSummary);
  const eligible = status === 'ok'
    ? candidates.filter((candidate) => (candidate.evidence_tier === 'owner-verified-recurrence'
      || candidate.evidence_tier === 'historical-cadence')
      && candidate.confidence >= 0.6
      && candidate.predicted_window.start
      && candidate.predicted_window.start <= soon
      && !GATED_STATES.has(candidate.state))
    : [];
  const predictedPreparation = eligible.slice(0, 2).map((candidate) => ({
    ...planSummary(candidate),
    label: 'predicted preparation',
    budget_minutes: 45,
    first_artifacts: candidate.artifact_manifest.slice(0, 3),
    first_step: candidate.prepare_now[0] || null,
  }));
  let withheldReason = null;
  if (status !== 'ok') withheldReason = 'Prediction status is degraded, so no predicted preparation is offered today.';
  else if (!eligible.length) withheldReason = 'No prediction met the 0.60 confidence and seven-day window rule.';
  return {
    as_of: today,
    rules: [
      'Hard commitments come only from canonical queue rows with a recorded future dueAt.',
      'Predicted preparation is capped at two blocks of 45 minutes, needs confidence 0.60 or higher and a window starting within seven days, and never outranks a hard commitment.',
      'Gated rows (blocked, deferred, needs_approval, verification) belong under Deliberately not doing.',
      'The capacity shadow is context only; software never sets planner_consumption.',
      'Keep the five-task WIP limit; predicted preparation is the first thing cut.',
    ],
    hard_commitments: hardCommitments,
    predicted_preparation: predictedPreparation,
    predicted_preparation_withheld_reason: withheldReason,
    gated,
    wip_limit: 5,
  };
}

function candidateSort(a, b) {
  const dateA = a.predicted_window.start || '9999-12-31';
  const dateB = b.predicted_window.start || '9999-12-31';
  const priority = (candidate) => {
    if (candidate.evidence_tier === 'owner-verified-recurrence') return 0;
    if (candidate.evidence_tier === 'canonical-queue'
      && ['ready', 'in_progress', 'active', 'queued'].includes(candidate.state)) return 1;
    if (candidate.evidence_tier === 'historical-cadence') return 2;
    if (candidate.evidence_tier === 'canonical-queue' && candidate.state === 'verification') return 3;
    if (candidate.evidence_tier === 'canonical-queue' && candidate.state === 'needs_approval') return 4;
    if (candidate.evidence_tier === 'canonical-queue' && candidate.state === 'blocked') return 5;
    if (candidate.evidence_tier === 'canonical-queue' && candidate.state === 'deferred') return 6;
    return 9;
  };
  return priority(a) - priority(b)
    || dateA.localeCompare(dateB)
    || b.confidence - a.confidence
    || a.candidate_id.localeCompare(b.candidate_id);
}

function buildPrediction({
  clientOpsRoot,
  asOf = new Date(),
  generatedAt,
  lookaheadDays = 35,
  historyDays = 90,
  catalog = loadCatalog(),
  maxCandidates = 24,
} = {}) {
  const asOfDay = isoDay(asOf);
  const generated = generatedAt || (
    asOfDay === isoDay(new Date())
      ? new Date().toISOString()
      : `${asOfDay}T12:00:00.000Z`
  );
  const events = discoverDeliverableEvents(clientOpsRoot, catalog, { asOf: asOfDay, historyDays });
  const workItems = loadWorkItems(clientOpsRoot);
  const queueCandidates = workItems.items
    .map((item) => candidateFromWorkItem(item, catalog, asOfDay))
    .filter(Boolean);
  const verifiedCandidates = candidatesFromVerifiedRecurrences(catalog, asOfDay, lookaheadDays, events);
  const historicalCandidates = candidatesFromHistory(events, catalog, asOfDay, lookaheadDays);
  let candidates = consolidatePortfolioBatches(
    [...verifiedCandidates, ...queueCandidates, ...historicalCandidates],
    catalog,
  );
  const calibration = hindcastCalibration(events, catalog, asOfDay);
  applyCalibration(candidates, calibration);
  const deduped = new Map();
  for (const candidate of candidates.sort(candidateSort)) {
    const key = `${candidate.client_id}|${candidate.work_package_id}|${candidate.predicted_window.start || candidate.state}`;
    const existing = deduped.get(key);
    if (!existing || candidate.confidence > existing.confidence) deduped.set(key, candidate);
  }
  candidates = [...deduped.values()].sort(candidateSort).slice(0, maxCandidates);
  const workloadSeries = buildWorkloadSeries(events, catalog, { asOf: asOfDay, historyDays });
  const forecastRequest = buildForecastRequest(workloadSeries, { generatedAt: generated, horizon: 14 });
  const provenance = checkoutProvenance(clientOpsRoot);
  const status = provenance.available && workItems.available ? 'ok' : 'degraded';
  const planInputs = buildPlanInputs(candidates, asOfDay, status);

  const unclassified = events.filter((event) => event.work_package_id === 'unclassified');
  const activeItems = workItems.items.filter((item) => !CLOSED_STATUSES.has(normalizeText(item.status).replace(/ /g, '_')));
  const staleQueueItemsExcluded = Math.max(0, activeItems.length - queueCandidates.length);
  const insufficientTiers = Object.entries(calibration.tiers)
    .filter(([, row]) => !row.sample_sufficient)
    .map(([tier]) => tier);
  return {
    schema_version: 1,
    generated_at: generated,
    as_of: asOfDay,
    status,
    lookahead_days: lookaheadDays,
    authority: 'planning-evidence-only',
    pattern: 'router-plus-evaluator',
    sources: {
      client_operations_root_available: Boolean(clientOpsRoot && fs.existsSync(clientOpsRoot)),
      client_operations_checkout: provenance,
      canonical_queue_available: workItems.available,
      canonical_queue_source: workItems.available ? 'client-operations://queue/work-items.json' : null,
      deliverable_events_scanned: events.length,
      active_queue_items_scanned: activeItems.length,
      queue_candidates_used: queueCandidates.length,
      stale_queue_items_excluded: staleQueueItemsExcluded,
      history_start: workloadSeries.start_date,
      history_end: workloadSeries.end_date,
      source_fingerprint: workloadSeries.source_fingerprint,
    },
    calibration,
    plan_inputs: planInputs,
    candidates,
    workload_series: workloadSeries,
    chronos_shadow: {
      status: forecastRequest ? 'request-ready' : 'insufficient-history',
      authority: 'research-evidence-only',
      planner_consumption_gate: false,
      reason: forecastRequest
        ? 'A routeable workload request is ready, but Chronos remains a shadow challenger until repeated holdouts beat simple baselines and calibration passes.'
        : 'At least 32 contiguous daily observations are required.',
      sparse_series_withheld: workloadSeries.series
        .filter((series) => !series.forecast_eligible)
        .map((series) => ({
          series_id: series.series_id,
          reason: series.forecast_eligibility_reason,
        })),
      request: forecastRequest,
    },
    blind_spots: unique([
      status === 'degraded' ? 'STATUS DEGRADED: canonical client-operations sources were unavailable, so this brief offers no predicted preparation.' : null,
      !workItems.available ? 'The canonical client-operations queue was unavailable.' : null,
      provenance.git && !provenance.canonical_main
        ? `Predictions were read from a client-operations checkout on branch ${provenance.branch} at ${provenance.head} with ${provenance.dirty_files} modified file(s), ${provenance.ahead_of_origin_main ?? '?'} ahead and ${provenance.behind_origin_main ?? '?'} behind origin/main. Canonical main may differ.`
        : null,
      insufficientTiers.length
        ? `Hindcast calibration has fewer than three judged predictions for ${insufficientTiers.join(', ')}; raw confidence is shown unadjusted for those tiers.`
        : null,
      unclassified.length ? `${unclassified.length} of ${events.length} historical deliverable directories were not confidently classified.` : null,
      staleQueueItemsExcluded ? `${staleQueueItemsExcluded} open queue items were excluded from the predictive stack because their evidence was older than the status-specific freshness window.` : null,
      'Folder dates are work-package evidence, not measured effort hours or guaranteed completion dates.',
      'Live Gmail, Slack, calendar, and connector state are not inferred unless already reconciled into the canonical queue or deliverable history.',
      'Predictions do not create work, deadlines, approvals, or external authority.',
    ]),
    forbidden_actions: ['send', 'publish', 'spend', 'account-change', 'canonical-queue-mutation'],
  };
}

function windowLabel(window) {
  if (window.start && window.end && window.start !== window.end) return `${window.start} to ${window.end}`;
  return window.start || window.basis || 'undated';
}

function claimLabel(candidate) {
  if (candidate.confirmed_deadline) return 'confirmed request, recorded due date';
  if (candidate.confirmed_request) return 'confirmed request, undated';
  return 'prediction only';
}

function provenanceLine(sources) {
  const checkout = sources.client_operations_checkout;
  if (!checkout || !checkout.available) return 'Client-operations source: unavailable.';
  if (!checkout.git) return 'Client-operations source: folder present, not a git checkout.';
  const state = checkout.canonical_main
    ? 'clean canonical main'
    : `branch ${checkout.branch} at ${checkout.head}, ${checkout.dirty_files} modified file(s), ${checkout.ahead_of_origin_main ?? '?'} ahead / ${checkout.behind_origin_main ?? '?'} behind origin/main`;
  return `Client-operations source: ${state}.`;
}

function chronosLines(prediction) {
  const receipt = prediction.chronos_shadow.latest_receipt;
  const lines = [
    '## Chronos workload shadow',
    '',
    `Status: **${prediction.chronos_shadow.status}**. ${prediction.chronos_shadow.reason}`,
    '',
  ];
  if (!receipt) return lines;
  lines.push(`Latest decision: **${receipt.decision}**. Planner-consumption gate: **${receipt.gates?.planner_consumption ? 'PASS' : 'FAIL'}**.`, '');
  if (receipt.aggregate) {
    const a = receipt.aggregate;
    const pct = (value) => (value === null || value === undefined ? 'n/a' : `${(value * 100).toFixed(1)}%`);
    lines.push(`Rolling origins: Chronos beat the best deterministic baseline on ${a.chronos_wins_vs_best_baseline} of ${a.origins_scored} scored origins (${a.origins_rejected} rejected). Mean MAE Chronos ${a.mean_chronos_mae ?? 'n/a'} vs best baseline ${a.mean_best_baseline_mae ?? 'n/a'} (${unique(a.best_baseline_methods || []).join(', ') || 'n/a'}). Mean p10-p90 coverage ${pct(a.mean_p10_p90_coverage)} against a free weekday band at ${pct(a.mean_empirical_band_coverage)}.`, '');
  } else {
    const total = receipt.holdout?.evaluations?.find((row) => row.series_id === 'work-packages-total');
    if (total) {
      lines.push(`Single holdout WAPE: Chronos ${total.chronos.wape ?? 'n/a'}%, persistence ${total.persistence.wape ?? 'n/a'}%, trailing-seven-day mean ${total.trailing_seven_day_mean.wape ?? 'n/a'}%. P10-p90 coverage ${(total.p10_p90_coverage * 100).toFixed(1)}%.`, '');
    }
  }
  const band = receipt.forecast?.summary?.find((row) => row.series_id === 'work-packages-total');
  if (band) {
    lines.push(`Next-${band.horizon}-day total-workload shadow: point ${band.point_total}, p10 ${band.p10_total}, p50 ${band.p50_total}, p90 ${band.p90_total}. Capacity context only.`, '');
  } else if (receipt.forecast?.status === 'rejected') {
    lines.push(`Forward forecast was rejected and abstained: ${receipt.forecast.rejected_reasons.join('; ')}`, '');
  }
  return lines;
}

function contractLines(contract) {
  if (!contract) return [];
  const first = (values, count = 2) => (values || []).slice(0, count);
  const lines = [];
  for (const [label, values] of [
    ['Inputs', first(contract.inputs)],
    ['Templates', first(contract.templates)],
    ['Outputs', first(contract.output_formats)],
    ['QA', first(contract.qa)],
  ]) {
    if (values.length) lines.push(`- ${label}: ${values.join('; ')}`);
  }
  return lines;
}

function renderMarkdown(prediction) {
  const plan = prediction.plan_inputs;
  const lines = [
    '---',
    'tags: [brief, predictive-work, forecasting]',
    `date: ${prediction.as_of}`,
    `lookahead_days: ${prediction.lookahead_days}`,
    `authority: ${prediction.authority}`,
    `status: ${prediction.status || 'ok'}`,
    '---',
    '',
    `# Predictive work brief — ${prediction.as_of}`,
    '',
  ];
  if (prediction.status === 'degraded') {
    lines.push('> **STATUS: DEGRADED.** Canonical client-operations sources were unavailable. Nothing below may be used as predicted preparation today.', '');
  }
  lines.push(
    `Evidence window: ${prediction.sources.history_start} through ${prediction.sources.history_end}. `
      + `${prediction.sources.deliverable_events_scanned} dated work packages and `
      + `${prediction.sources.active_queue_items_scanned} active canonical queue items were scanned. `
      + provenanceLine(prediction.sources),
    '',
    'Every row below is a prediction unless its Kind column says otherwise. Only canonical queue rows are confirmed requests, and only a recorded dueAt is a confirmed deadline.',
    '',
    '## What is likely to come next',
    '',
    'For verified recurrences and historical cadence, confidence estimates recurrence strength after hindcast calibration. For canonical queue rows, it estimates source and work-package classification confidence; the recorded state still controls whether work may proceed.',
    '',
    '| Window | Kind | Confidence | Client or lane | Expected deliverable | Evidence |',
    '| --- | --- | --- | --- | --- | --- |',
  );
  if (!prediction.candidates.length) {
    lines.push('| — | — | — | — | No evidence-backed upcoming package found | Sources may be unavailable or too sparse |');
  } else {
    for (const candidate of prediction.candidates) {
      const clients = candidate.clients?.length
        ? `${candidate.client_id} (${candidate.clients.length} routes)`
        : (candidate.client_id || 'unresolved');
      const calibrated = candidate.calibration?.applied
        ? ` (raw ${(candidate.calibration.raw_confidence * 100).toFixed(0)}%, hit-rate ${(candidate.calibration.hit_rate * 100).toFixed(0)}%)`
        : '';
      lines.push(`| ${windowLabel(candidate.predicted_window)} | ${claimLabel(candidate)} | ${(candidate.confidence * 100).toFixed(0)}% ${candidate.confidence_label}${calibrated} | ${clients} | ${candidate.work_package_label} | ${candidate.evidence_tier}: ${candidate.reason.replace(/\|/g, '\\|')} |`);
    }
  }

  if (plan) {
    lines.push('', '## Plan inputs for today', '');
    lines.push(`Hard commitments (recorded due dates): ${plan.hard_commitments.length ? plan.hard_commitments.map((row) => `${row.client_id || 'portfolio'} ${row.work_package_label} due ${row.window.start}`).join('; ') : 'none in the lookahead window'}.`);
    if (plan.predicted_preparation.length) {
      lines.push(`Predicted preparation (max two, ${plan.predicted_preparation[0].budget_minutes} minutes each, after hard commitments): ${plan.predicted_preparation.map((row) => `${row.client_id || 'portfolio'} ${row.work_package_label} from ${row.window.start} at ${(row.confidence * 100).toFixed(0)}%`).join('; ')}.`);
    } else {
      lines.push(`Predicted preparation: none. ${plan.predicted_preparation_withheld_reason || ''}`.trim());
    }
    lines.push(`Gated rows for Deliberately not doing: ${plan.gated.length ? plan.gated.map((row) => `${row.client_id || 'portfolio'} ${row.work_package_label} (${row.state})`).join('; ') : 'none'}.`);
  }

  lines.push('', '## Prepare now', '');
  for (const candidate of prediction.candidates.slice(0, 8)) {
    lines.push(`### ${candidate.work_package_label} — ${candidate.client_id || 'unresolved'}`, '');
    lines.push(`Signal: **${candidate.confidence_label} (${(candidate.confidence * 100).toFixed(0)}%)**, ${claimLabel(candidate)}. ${candidate.reason}`, '');
    for (const action of candidate.prepare_now.slice(0, 3)) lines.push(`- ${action}`);
    const contract = contractLines(candidate.preparation_contract);
    if (contract.length) {
      lines.push('', 'Preparation contract:', ...contract);
    }
    if (candidate.human_gates.length) {
      lines.push('', `Gate: ${candidate.human_gates.join(' ')}`);
    }
    lines.push('');
  }

  if (prediction.calibration) {
    const tierRows = Object.entries(prediction.calibration.tiers);
    lines.push('## Calibration', '');
    if (!tierRows.length) {
      lines.push('No judgeable hindcast predictions yet; confidence is shown unadjusted.', '');
    } else {
      lines.push('| Evidence tier | Judged | Hit | Hit rate | Multiplier | Applied |', '| --- | ---: | ---: | ---: | ---: | --- |');
      for (const [tier, row] of tierRows) {
        lines.push(`| ${tier} | ${row.predicted} | ${row.hit} | ${row.hit_rate === null ? 'n/a' : `${(row.hit_rate * 100).toFixed(0)}%`} | ${row.multiplier} | ${row.sample_sufficient ? 'yes' : 'no, sample under 3'} |`);
      }
      lines.push('', `Hindcast origins ${prediction.calibration.origins_days.join(', ')} days back, ${prediction.calibration.lookahead_days}-day lookahead, ±${prediction.calibration.tolerance_days} days tolerance, judged through ${prediction.calibration.judged_through}.`, '');
    }
  }

  lines.push(...chronosLines(prediction));
  lines.push(
    'Chronos forecasts numeric arrival counts and ranges. The deterministic evidence router predicts the actual deliverable and preparation contract. Sparse per-type series remain withheld from Chronos. The daily plan may show the total band, but it may not reorder work until a human records a promotion after the repeated-holdout gate passes.',
    '',
    '## Blind spots and limits',
    '',
  );
  for (const blindSpot of prediction.blind_spots) lines.push(`- ${blindSpot}`);
  lines.push(
    '',
    '> This brief may prepare reviewable local work. It cannot send, publish, spend, change an account, or mutate the canonical queue.',
    '',
  );
  return lines.join('\n');
}

module.exports = {
  CLOSED_STATUSES,
  TIER_CALIBRATION_FLOOR,
  addDays,
  applyCalibration,
  buildForecastRequest,
  buildPlanInputs,
  buildPrediction,
  buildWorkloadSeries,
  checkoutProvenance,
  hindcastCalibration,
  candidatesFromHistory,
  candidatesFromVerifiedRecurrences,
  classifyWork,
  consolidatePortfolioBatches,
  discoverDeliverableEvents,
  loadCatalog,
  loadWorkItems,
  normalizeText,
  renderMarkdown,
};
