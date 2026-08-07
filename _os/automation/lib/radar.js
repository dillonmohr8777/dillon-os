'use strict';

/**
 * The prospect radar — a persistent registry of every business we have ever
 * looked at, with the full grade history for each one.
 *
 * Why a registry rather than a list. A one-shot graded CSV is stale the day
 * after it is written: a decayed site gets redesigned and stops being a target,
 * a good site rots and becomes one, a domain lapses. Momentum builds a hundred
 * sites at a time, so the question is never "who is bad today" but "who is bad
 * today that we have not already pitched, and who changed since last time."
 *
 * That means three things this file provides and a flat list cannot:
 *
 *  1. **History.** Every grade is appended, never overwritten, so a site's
 *     trajectory is visible. A business whose score dropped 20 points since
 *     March is a better call than one that has always been mediocre.
 *  2. **Recheck scheduling.** Each verdict earns its own re-audit cadence, so
 *     the daily job re-grades what is most likely to have changed instead of
 *     sweeping everything.
 *  3. **Lifecycle state.** built / mailed / client / excluded is what stops a
 *     business being pitched twice, which is the one mistake that costs
 *     credibility rather than just money.
 *
 * Keyed by registrable domain, because that is the only identifier stable across
 * discovery sources (OSM node IDs are not, business names certainly are not).
 */

const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, todayISO } = require('./fsutil');
const { sanitizeForGit } = require('./discovery');

const REGISTRY_PATH = '12_Brain/state/radar/registry.json';

/**
 * Days until a graded prospect is worth auditing again, by verdict.
 *
 * `verify` is deliberately short: those rows are blocked on a render, not on the
 * passage of time, so they should come back around as soon as a Tier 1 pass is
 * possible. Everything else is paced by how fast that verdict tends to go stale
 * — a rebuild target that quietly hires an agency is the expensive surprise, so
 * it is rechecked well before a prospect we already decided to leave alone.
 */
const RECHECK_DAYS = {
  verify: 7,
  rebuild: 45,
  enrich: 14,
  polish: 90,
  ads_seo: 120,
  nurture: 150,
  suppress: 365,
};

/**
 * Geography weight. Momentum 360 is a Philadelphia agency: local proof carries
 * the cold open, Sean can shoot photography in the city, and drive-time meetings
 * are possible in the collar counties. A Pittsburgh prospect with an identical
 * site is genuinely worth less to this pipeline, and the ranking should say so
 * rather than pretending the state is uniform.
 */
const GEO_WEIGHT = {
  'Philadelphia': 1,
  'Delaware County': 0.92,
  'Montgomery County': 0.92,
  'Bucks County': 0.88,
  'Chester County': 0.88,
};
const GEO_WEIGHT_DEFAULT_PA = 0.62;
const GEO_WEIGHT_PHL_MARKET = 0.9;

function geoWeight(row) {
  if (row.area && GEO_WEIGHT[row.area] != null) return GEO_WEIGHT[row.area];
  if (row.county && GEO_WEIGHT[row.county] != null) return GEO_WEIGHT[row.county];
  if (String(row.city || '').toLowerCase() === 'philadelphia') return 1;
  if (String(row.market || '').toUpperCase() === 'PHL') return GEO_WEIGHT_PHL_MARKET;
  return GEO_WEIGHT_DEFAULT_PA;
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso, toIso) {
  const a = new Date(`${fromIso}T00:00:00Z`).getTime();
  const b = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function load(file = REGISTRY_PATH) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  const doc = readJson(abs, null);
  if (!doc) {
    return {
      _readme:
        'Prospect radar. Every business ever discovered, with full grade history. ' +
        'Keyed by registrable domain. Nothing here is outbound-ready; a human approves every send.',
      created: todayISO(),
      updated: todayISO(),
      prospects: {},
    };
  }
  if (!doc.prospects) doc.prospects = {};
  return doc;
}

function save(registry, file = REGISTRY_PATH) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  ensureDir(path.dirname(abs));
  registry.updated = todayISO();
  registry.count = Object.keys(registry.prospects).length;
  // Sanitize on the way out, not only on the way in, so a row added by an older
  // build or an ad-hoc script cannot leak address or phone detail into Git.
  const safe = {
    ...registry,
    prospects: Object.fromEntries(
      Object.entries(registry.prospects).map(([k, v]) => [k, sanitizeForGit(v)])
    ),
  };
  writeJson(abs, safe, { compact: true });
  return abs;
}

/**
 * Add newly discovered candidates. Existing entries keep their history and
 * lifecycle state — discovery must never clobber what we already know, or a
 * business we mailed last month reappears as a fresh lead.
 *
 * @returns {{added:number, refreshed:number, skipped:number}}
 */
function upsertDiscovered(registry, candidates, { today = todayISO() } = {}) {
  const stats = { added: 0, refreshed: 0, skipped: 0 };
  for (const c of candidates) {
    const domain = c.domain || '';
    if (!domain) {
      stats.skipped += 1;
      continue;
    }
    const existing = registry.prospects[domain];
    if (existing) {
      // Refresh only the facts discovery is authoritative about.
      existing.business_name = existing.business_name || c.business_name;
      existing.has_phone = existing.has_phone || !!c.phone || !!c.has_phone;
      existing.city = existing.city || c.city || '';
      existing.area = existing.area || c.area || '';
      existing.vertical = existing.vertical || c.vertical || '';
      existing.vertical_group = existing.vertical_group || c.vertical_group || '';
      existing.last_seen_in_discovery = today;
      existing.times_discovered = (existing.times_discovered || 1) + 1;
      stats.refreshed += 1;
      continue;
    }
    registry.prospects[domain] = {
      domain,
      business_name: c.business_name || domain,
      website: c.website || `https://${domain}`,
      vertical: c.vertical || '',
      vertical_group: c.vertical_group || '',
      market: c.market || '',
      area: c.area || '',
      city: c.city || '',
      state: c.state || '',
      postcode: c.postcode || '',
      // Presence only — the number itself never enters a tracked file.
      has_phone: !!c.phone || !!c.has_phone,
      source: c.source || 'unknown',
      lifecycle: 'new',
      first_seen: today,
      last_seen_in_discovery: today,
      times_discovered: 1,
      last_graded: null,
      next_recheck: today,
      grades: [],
      current: null,
    };
    stats.added += 1;
  }
  return stats;
}

/**
 * Reduce the grader's dimension breakdown to what the registry needs to keep.
 *
 * `label`, `about` and `weight` are static properties of DIMENSIONS in
 * site-grader.js, so storing them 700 times would be duplicating a constant.
 * `appliedWeight` is derivable from `evidence` (measured → full, partial → half,
 * unknown → nothing). Score and evidence are the only two facts that belong to
 * this particular grade, and `evidence` is the one that must survive: a craft
 * score with `evidence: 'unknown'` is a placeholder, not a measurement, and a UI
 * that shows the number without the label is lying by omission.
 *
 * @returns {object|null} null when the grade carried no breakdown at all
 */
function slimDimensions(dimensions) {
  if (!dimensions || typeof dimensions !== 'object') return null;
  const out = {};
  for (const [key, d] of Object.entries(dimensions)) {
    if (!d || typeof d !== 'object') continue;
    out[key] = {
      score: Number.isFinite(Number(d.score)) ? Math.round(Number(d.score)) : null,
      evidence: d.evidence || 'unknown',
    };
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Append a grade result. Keeps the last 12 grades per prospect — enough to see a
 * trajectory without letting the registry grow without bound.
 */
function recordGrade(registry, domain, result, { today = todayISO() } = {}) {
  const p = registry.prospects[domain];
  if (!p) return null;

  const entry = {
    date: today,
    tier: result.tier_reached ?? result.tier ?? 0,
    sqs: result.site_quality_score ?? null,
    band: result.site_quality_band || 'ungraded',
    verdict: result.verdict || 'enrich',
    opportunity: result.opportunity_score ?? null,
    confidence: result.confidence ?? null,
    provisional: result.provisional === true,
  };

  const previous = p.current;
  p.grades.push(entry);
  if (p.grades.length > 12) p.grades = p.grades.slice(-12);

  // `current` carries the dimension breakdown; the history entries deliberately
  // do not. Twelve copies of six dimensions per prospect would add roughly 2MB
  // to a tracked registry to answer a question nobody asks ("what was its
  // content score in April"), where the current breakdown answers the one that
  // gets asked every morning: why is this a 26.
  p.current = { ...entry, dimensions: slimDimensions(result.dimensions) };
  p.last_graded = today;
  p.headline = result.headline || p.headline || '';
  p.offer = result.offer || '';
  p.next_action = result.next_action || '';
  p.top_faults = (result.findings || [])
    .filter((f) => f.delta < 0)
    .slice(0, 3)
    .map((f) => f.reason);

  const days = RECHECK_DAYS[entry.verdict] ?? 90;
  p.next_recheck = addDays(today, days);

  // Trend is the single most useful column on the dashboard: a site that got
  // worse is a warmer call than one that has always been bad, and one that got
  // better needs pulling out of the queue before we pitch a redesign to someone
  // who just paid for one.
  if (!previous || previous.sqs == null || entry.sqs == null) {
    p.trend = p.grades.length <= 1 ? 'new' : 'unknown';
    p.trend_delta = null;
  } else {
    const delta = entry.sqs - previous.sqs;
    p.trend_delta = delta;
    p.trend = delta >= 8 ? 'improved' : delta <= -8 ? 'declined' : 'stable';
  }

  p.priority_score = priorityScore(p);
  return p;
}

/**
 * Ranking number the dashboard sorts by. Opportunity, scaled by how much a
 * Philadelphia-area win is worth to this pipeline, with a nudge for sites we can
 * see actively decaying.
 */
function priorityScore(p) {
  const opp = Number(p.current?.opportunity);
  if (!Number.isFinite(opp)) return 0;
  let score = opp * geoWeight(p);
  if (p.trend === 'declined') score += 6;
  if (p.trend === 'improved') score -= 10;
  // A prospect we have already actioned should never outrank a fresh one.
  if (p.lifecycle === 'built' || p.lifecycle === 'mailed') score -= 40;
  if (p.lifecycle === 'client' || p.lifecycle === 'excluded') return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Prospects due for a re-audit, most overdue first. Never-graded rows come
 * first — an ungraded prospect is a blind spot, not a known quantity.
 */
function dueForRecheck(registry, { limit = 200, today = todayISO(), verdicts = null, force = false } = {}) {
  const rows = Object.values(registry.prospects).filter((p) => {
    if (p.lifecycle === 'client' || p.lifecycle === 'excluded') return false;
    if (verdicts && p.current && !verdicts.includes(p.current.verdict)) return false;
    if (!p.last_graded) return true;
    // `force` re-audits regardless of the schedule. The schedule assumes the
    // grade it produced is still worth trusting, which stops being true when the
    // audit itself changes — a new tier becoming available, or a client bug that
    // mis-read a whole class of sites. Both have happened; neither moves a
    // next_recheck date on its own.
    if (force) return true;
    return !p.next_recheck || p.next_recheck <= today;
  });

  rows.sort((a, b) => {
    if (!a.last_graded && b.last_graded) return -1;
    if (a.last_graded && !b.last_graded) return 1;
    // Most overdue first, then highest priority.
    const overdueA = a.next_recheck ? daysBetween(a.next_recheck, today) : 9999;
    const overdueB = b.next_recheck ? daysBetween(b.next_recheck, today) : 9999;
    if (overdueA !== overdueB) return overdueB - overdueA;
    return (b.priority_score || 0) - (a.priority_score || 0);
  });

  return rows.slice(0, limit);
}

/** Mark lifecycle state — the gate that stops a business being pitched twice. */
function setLifecycle(registry, domain, lifecycle, { note = '', today = todayISO() } = {}) {
  const valid = ['new', 'graded', 'queued_build', 'built', 'mailed', 'client', 'excluded'];
  if (!valid.includes(lifecycle)) throw new Error(`invalid lifecycle "${lifecycle}" (${valid.join('|')})`);
  const p = registry.prospects[domain];
  if (!p) return null;
  p.lifecycle = lifecycle;
  p.lifecycle_changed = today;
  if (note) p.lifecycle_note = note;
  p.priority_score = priorityScore(p);
  return p;
}

/** Everything the dashboard and the daily digest need, computed in one pass. */
function summarize(registry, { today = todayISO() } = {}) {
  const all = Object.values(registry.prospects);
  const actionable = all.filter((p) => p.lifecycle !== 'client' && p.lifecycle !== 'excluded');
  const graded = actionable.filter((p) => p.current && p.current.sqs != null);

  const byVerdict = {};
  const byGroup = {};
  const byArea = {};
  const byBand = {};
  for (const p of actionable) {
    const v = p.current?.verdict || 'ungraded';
    byVerdict[v] = (byVerdict[v] || 0) + 1;
    const g = p.vertical_group || 'other';
    byGroup[g] = byGroup[g] || { total: 0, rebuild: 0 };
    byGroup[g].total += 1;
    if (v === 'rebuild') byGroup[g].rebuild += 1;
    const a = p.area || p.market || 'unknown';
    byArea[a] = byArea[a] || { total: 0, rebuild: 0 };
    byArea[a].total += 1;
    if (v === 'rebuild') byArea[a].rebuild += 1;
    if (p.current?.band) byBand[p.current.band] = (byBand[p.current.band] || 0) + 1;
  }

  const buildQueue = actionable
    .filter((p) => p.current?.verdict === 'rebuild')
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  const trafficQueue = actionable
    .filter((p) => p.current?.verdict === 'ads_seo' || p.current?.verdict === 'nurture')
    .sort((a, b) => (b.current?.sqs || 0) - (a.current?.sqs || 0));

  const needsRender = actionable.filter((p) => p.current?.verdict === 'verify');
  const movers = actionable
    .filter((p) => p.trend === 'declined' || p.trend === 'improved')
    .sort((a, b) => Math.abs(b.trend_delta || 0) - Math.abs(a.trend_delta || 0));
  const newToday = all.filter((p) => p.first_seen === today);
  const gradedToday = all.filter((p) => p.last_graded === today);

  return {
    generated: today,
    total: all.length,
    actionable: actionable.length,
    graded: graded.length,
    ungraded: actionable.length - graded.length,
    mean_site_quality: graded.length
      ? Math.round(graded.reduce((s, p) => s + p.current.sqs, 0) / graded.length)
      : null,
    by_verdict: byVerdict,
    by_vertical_group: byGroup,
    by_area: byArea,
    by_band: byBand,
    build_queue_size: buildQueue.length,
    build_queue: buildQueue,
    traffic_queue: trafficQueue,
    needs_render: needsRender,
    movers,
    new_today: newToday.length,
    graded_today: gradedToday.length,
    // The change feed. A dashboard that only shows totals makes yesterday and
    // today look identical — you cannot tell a sweep that found six warm leads
    // from one that found none. These are the events worth a glance each
    // morning, cheap to compute because the grade history is already here.
    today: (() => {
      const events = [];
      for (const p of actionable) {
        if (p.first_seen === today) {
          events.push({
            kind: 'found', domain: p.domain, name: p.business_name, area: p.area,
            verdict: p.current?.verdict || null, sqs: p.current?.sqs ?? null,
            priority: p.priority_score || 0,
          });
        }
        if (p.last_graded !== today || p.grades.length < 2) continue;
        const prev = p.grades[p.grades.length - 2];
        const cur = p.current;
        if (!prev || !cur) continue;
        // A verdict flip is the event that changes what you do about a business,
        // so it outranks a score wobble of the same size.
        if (prev.verdict !== cur.verdict) {
          events.push({
            kind: 'verdict', domain: p.domain, name: p.business_name, area: p.area,
            from: prev.verdict, to: cur.verdict, sqs: cur.sqs ?? null,
            priority: p.priority_score || 0,
          });
        } else if (prev.sqs != null && cur.sqs != null && Math.abs(cur.sqs - prev.sqs) >= 8) {
          events.push({
            kind: 'moved', domain: p.domain, name: p.business_name, area: p.area,
            from: prev.sqs, to: cur.sqs, delta: cur.sqs - prev.sqs,
            priority: p.priority_score || 0,
          });
        }
      }
      const rank = { verdict: 0, moved: 1, found: 2 };
      return events
        .sort((a, b) => (rank[a.kind] - rank[b.kind]) || (b.priority - a.priority))
        .slice(0, 40);
    })(),
    due_now: dueForRecheck(registry, { limit: 100000, today }).length,
    // The dashboard embeds the whole actionable set, not just the queues, so it
    // can be searched and filtered rather than merely read. Callers that persist
    // a summary (radar-last.json) cherry-pick fields and never see this.
    prospects: actionable,
    lifecycle: all.reduce((acc, p) => {
      acc[p.lifecycle] = (acc[p.lifecycle] || 0) + 1;
      return acc;
    }, {}),
  };
}

module.exports = {
  load,
  save,
  upsertDiscovered,
  recordGrade,
  slimDimensions,
  dueForRecheck,
  setLifecycle,
  summarize,
  priorityScore,
  geoWeight,
  addDays,
  daysBetween,
  RECHECK_DAYS,
  GEO_WEIGHT,
  REGISTRY_PATH,
};
