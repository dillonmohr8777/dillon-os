'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { readJson, repoPath } = require('./fsutil');

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
    confidence: +clamp(confidence, 0, 1).toFixed(2),
    confidence_label: confidenceLabel(confidence),
    evidence_tier: evidenceTier,
    predicted_window: window,
    reason,
    source_refs: unique(sourceRefs),
    artifact_manifest: profile ? [...profile.artifact_manifest] : [],
    prepare_now: profile ? [...profile.prepare_now] : [],
    human_gates: unique([...(profile?.human_gates || []), ...blockers]),
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

function candidatesFromVerifiedRecurrences(catalog, asOf, lookaheadDays) {
  const current = dayDate(asOf);
  const last = addDays(current, lookaheadDays);
  const candidates = [];
  for (const recurrence of catalog.recurrences || []) {
    const next = nextRecurrenceDate(recurrence.anchor_date, recurrence.cadence, current);
    if (next > last) continue;
    const profile = profileById(catalog, recurrence.profile_id);
    const nextDay = isoDay(next);
    candidates.push(makeCandidate({
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
      reason: recurrence.note || `${recurrence.cadence} owner-verified recurrence.`,
      sourceRefs: recurrence.source_refs || [],
    }));
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
  const verifiedCandidates = candidatesFromVerifiedRecurrences(catalog, asOfDay, lookaheadDays);
  const historicalCandidates = candidatesFromHistory(events, catalog, asOfDay, lookaheadDays);
  let candidates = consolidatePortfolioBatches(
    [...verifiedCandidates, ...queueCandidates, ...historicalCandidates],
    catalog,
  );
  const deduped = new Map();
  for (const candidate of candidates.sort(candidateSort)) {
    const key = `${candidate.client_id}|${candidate.work_package_id}|${candidate.predicted_window.start || candidate.state}`;
    const existing = deduped.get(key);
    if (!existing || candidate.confidence > existing.confidence) deduped.set(key, candidate);
  }
  candidates = [...deduped.values()].sort(candidateSort).slice(0, maxCandidates);
  const workloadSeries = buildWorkloadSeries(events, catalog, { asOf: asOfDay, historyDays });
  const forecastRequest = buildForecastRequest(workloadSeries, { generatedAt: generated, horizon: 14 });

  const unclassified = events.filter((event) => event.work_package_id === 'unclassified');
  const activeItems = workItems.items.filter((item) => !CLOSED_STATUSES.has(normalizeText(item.status).replace(/ /g, '_')));
  const staleQueueItemsExcluded = Math.max(0, activeItems.length - queueCandidates.length);
  return {
    schema_version: 1,
    generated_at: generated,
    as_of: asOfDay,
    lookahead_days: lookaheadDays,
    authority: 'planning-evidence-only',
    pattern: 'router-plus-evaluator',
    sources: {
      client_operations_root_available: Boolean(clientOpsRoot && fs.existsSync(clientOpsRoot)),
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
      !workItems.available ? 'The canonical client-operations queue was unavailable.' : null,
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

function renderMarkdown(prediction) {
  const latestChronos = prediction.chronos_shadow.latest_receipt;
  const totalEvaluation = latestChronos?.holdout?.evaluations?.find((row) => row.series_id === 'work-packages-total');
  const totalForecast = latestChronos?.forecast?.summary?.find((row) => row.series_id === 'work-packages-total');
  const lines = [
    '---',
    'tags: [brief, predictive-work, forecasting]',
    `date: ${prediction.as_of}`,
    `lookahead_days: ${prediction.lookahead_days}`,
    `authority: ${prediction.authority}`,
    '---',
    '',
    `# Predictive work brief — ${prediction.as_of}`,
    '',
    `Evidence window: ${prediction.sources.history_start} through ${prediction.sources.history_end}. `
      + `${prediction.sources.deliverable_events_scanned} dated work packages and `
      + `${prediction.sources.active_queue_items_scanned} active canonical queue items were scanned.`,
    '',
    '## What is likely to come next',
    '',
    'For verified recurrences and historical cadence, confidence estimates recurrence strength. For canonical queue rows, it estimates source and work-package classification confidence; the recorded state still controls whether work may proceed.',
    '',
    '| Window | Confidence | Client or lane | Expected deliverable | Evidence |',
    '| --- | --- | --- | --- | --- |',
  ];
  if (!prediction.candidates.length) {
    lines.push('| — | — | — | No evidence-backed upcoming package found | Sources may be unavailable or too sparse |');
  } else {
    for (const candidate of prediction.candidates) {
      const clients = candidate.clients?.length
        ? `${candidate.client_id} (${candidate.clients.length} routes)`
        : (candidate.client_id || 'unresolved');
      lines.push(`| ${windowLabel(candidate.predicted_window)} | ${(candidate.confidence * 100).toFixed(0)}% ${candidate.confidence_label} | ${clients} | ${candidate.work_package_label} | ${candidate.evidence_tier}: ${candidate.reason.replace(/\|/g, '\\|')} |`);
    }
  }

  lines.push('', '## Prepare now', '');
  for (const candidate of prediction.candidates.slice(0, 8)) {
    lines.push(`### ${candidate.work_package_label} — ${candidate.client_id || 'unresolved'}`, '');
    lines.push(`Signal: **${candidate.confidence_label} (${(candidate.confidence * 100).toFixed(0)}%)**. ${candidate.reason}`, '');
    for (const action of candidate.prepare_now.slice(0, 3)) lines.push(`- ${action}`);
    if (candidate.human_gates.length) {
      lines.push('', `Gate: ${candidate.human_gates.join(' ')}`);
    }
    lines.push('');
  }

  lines.push(
    '## Chronos workload shadow',
    '',
    `Status: **${prediction.chronos_shadow.status}**. ${prediction.chronos_shadow.reason}`,
    '',
  );
  if (latestChronos) {
    lines.push(`Latest decision: **${latestChronos.decision}**. Planner-consumption gate: **${latestChronos.gates?.planner_consumption ? 'PASS' : 'FAIL'}**.`, '');
    if (totalEvaluation) {
      lines.push(`Fourteen-day holdout WAPE: Chronos ${totalEvaluation.chronos.wape ?? 'n/a'}%, persistence ${totalEvaluation.persistence.wape ?? 'n/a'}%, trailing-seven-day mean ${totalEvaluation.trailing_seven_day_mean.wape ?? 'n/a'}%. P10-p90 coverage ${(totalEvaluation.p10_p90_coverage * 100).toFixed(1)}%.`, '');
    }
    if (totalForecast) {
      lines.push(`Next-${totalForecast.horizon}-day total-workload shadow: point ${totalForecast.point_total}, p10 ${totalForecast.p10_total}, p50 ${totalForecast.p50_total}, p90 ${totalForecast.p90_total}.`, '');
    }
  }
  lines.push(
    'Chronos forecasts numeric arrival counts and ranges. The deterministic evidence router predicts the actual deliverable and preparation contract. Sparse per-type series remain withheld from Chronos. The daily plan may show the total band, but it may not reorder work until the evaluator gate passes.',
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
  addDays,
  buildForecastRequest,
  buildPrediction,
  buildWorkloadSeries,
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
