#!/usr/bin/env node
'use strict';

/**
 * The daily radar sweep. One command, run every morning.
 *
 *   node _os/automation/bin/radar-refresh.js
 *
 * Four things happen, in this order:
 *
 *   1. **Expand.** Discover new businesses in the rotation's next market and add
 *      them to the registry. Philadelphia and its collar counties come up far
 *      more often than the rest of Pennsylvania — this is Momentum 360's home
 *      market and local proof is what carries a cold open.
 *   2. **Grade the new arrivals.** Tier 0, so a couple of hundred rows is a few
 *      minutes and no browser.
 *   3. **Re-audit what went stale.** Every verdict carries its own recheck
 *      cadence. This is the part a one-shot CSV cannot do: a decayed site that
 *      quietly hired an agency stops being a target, and a good site that rotted
 *      becomes one. Momentum builds a hundred at a time, so the queue has to
 *      stay true rather than be rebuilt from scratch.
 *   4. **Publish.** Rewrite the dashboard, the CSV, and a dated digest.
 *
 * Options
 *   --discover <n>     new candidates to look for (default 200, 0 to skip)
 *   --recheck <n>      stale prospects to re-audit (default 120, 0 to skip)
 *   --market <CODE>    force a market instead of using the rotation
 *   --concurrency <n>  parallel fetches (default 12)
 *   --max-tier <0|1>   deepest audit tier (default 0; 1 needs a working browser)
 *   --dry-run          do everything except write
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, todayISO, nowISO, slugify } = require('../lib/fsutil');
const radar = require('../lib/radar');
const { renderDashboard } = require('../lib/radar-dashboard');
const { gradeSite, mergeAudits } = require('../lib/site-grader');
const { auditTier0, auditTier1 } = require('../lib/site-audit');
const { routeOpportunity, shouldEscalate } = require('../lib/opportunity');
const { buildQuery, runOverpass, toCandidates, VERTICAL_GROUPS, normalizeDomain } = require('../lib/discovery');
const { buildSuppressSets } = require('../lib/clients');
const { writeRunState } = require('../lib/registry');

const AUTOMATION_ID = 'radar-refresh';
const DASHBOARD_PATH = 'Daily-Briefs/prospect-radar.html';
const CSV_PATH = '12_Brain/state/radar/build-queue.csv';

/**
 * Market rotation, Philadelphia-weighted.
 *
 * Momentum 360 is a Philadelphia agency: we can shoot our own photography there,
 * name local proof, and drive to a meeting. So the city and its collar counties
 * occupy five of seven slots and the rest of Pennsylvania fills the other two.
 * Rotating by day-of-year rather than at random keeps coverage even and makes any
 * given morning's run reproducible.
 */
const ROTATION = [
  { market: 'PHL', areas: [{ name: 'Philadelphia', adminLevel: 8, state: 'Pennsylvania' }] },
  { market: 'PHL', areas: [{ name: 'Montgomery County', adminLevel: 6, state: 'Pennsylvania' }] },
  { market: 'PHL', areas: [{ name: 'Delaware County', adminLevel: 6, state: 'Pennsylvania' }] },
  { market: 'PHL', areas: [{ name: 'Bucks County', adminLevel: 6, state: 'Pennsylvania' }] },
  { market: 'PHL', areas: [{ name: 'Chester County', adminLevel: 6, state: 'Pennsylvania' }] },
  { market: 'PGH', areas: [{ name: 'Allegheny County', adminLevel: 6, state: 'Pennsylvania' }] },
  { market: 'PA', areas: [
      { name: 'Lehigh County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Erie County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Lancaster County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Dauphin County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Berks County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'York County', adminLevel: 6, state: 'Pennsylvania' },
    ] },
];

/** Vertical priority for discovery — high-fit groups first. */
const GROUP_ORDER = ['home-services', 'medical', 'legal', 'industrial', 'spa-wellness', 'auto', 'retail', 'food'];

function parseArgs(argv) {
  const o = { discover: 200, recheck: 120, market: null, concurrency: 12, maxTier: 0, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--discover') o.discover = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a === '--recheck') o.recheck = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a === '--market') o.market = String(argv[++i] || '').toUpperCase();
    else if (a === '--concurrency') o.concurrency = Math.max(1, parseInt(argv[++i], 10) || 12);
    else if (a === '--max-tier') o.maxTier = parseInt(argv[++i], 10) || 0;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

function dayOfYear(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000);
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        try {
          out[i] = await fn(items[i], i);
        } catch (err) {
          out[i] = { __error: String(err?.message || err) };
        }
      }
    })
  );
  return out;
}

/** Audit + grade + route one prospect. */
async function gradeOne(p, ctx) {
  let audit = { tier: 0, url: p.website };
  const trail = [];
  try {
    audit = mergeAudits(audit, await auditTier0(p.website, { checkHttpRedirect: false }));
    if (audit.fetchInconclusive) {
      const retry = await auditTier0(p.website, { checkHttpRedirect: false, timeoutMs: 30000 });
      if (!retry.fetchInconclusive) {
        audit = mergeAudits(audit, retry);
        delete audit.fetchInconclusive;
      }
    }
  } catch (err) {
    audit = mergeAudits(audit, { tier: 0, fetchInconclusive: true, error: String(err?.message || err) });
  }

  let grade = gradeSite(audit, { currentYear: ctx.currentYear });
  let route = routeOpportunity(
    { ...p, outreach_readiness: p.phone ? 'phone' : '' },
    { grade, suppressDomains: ctx.suppressDomains, suppressIds: ctx.suppressIds }
  );

  if (ctx.maxTier >= 1 && route.verdict !== 'suppress' && shouldEscalate(route, { tier: 0 }).escalate) {
    try {
      const t1 = await auditTier1(p.website, { timeoutMs: 35000 });
      if (!t1.tier1Failed) {
        audit = mergeAudits(audit, t1);
        grade = gradeSite(audit, { currentYear: ctx.currentYear });
        route = routeOpportunity(
          { ...p, outreach_readiness: p.phone ? 'phone' : '' },
          { grade, suppressDomains: ctx.suppressDomains, suppressIds: ctx.suppressIds }
        );
        trail.push('tier1: rendered');
      } else {
        trail.push(`tier1: render failed (${t1.tier1Error})`);
      }
    } catch (err) {
      trail.push(`tier1: unavailable (${String(err?.message || err).slice(0, 60)})`);
    }
  }

  return {
    site_quality_score: grade.score,
    site_quality_band: grade.band,
    confidence: grade.confidence,
    provisional: grade.provisional,
    tier_reached: audit.tier,
    verdict: route.verdict,
    offer: route.offer,
    opportunity_score: route.opportunity_score,
    next_action: route.next_action,
    headline: grade.headline,
    findings: grade.findings,
    hard_faults: grade.hard_faults || [],
    trail,
  };
}

function toCsv(rows) {
  // No phone column: this CSV is committed. Contact detail lives in Mac's sheet
  // and in 12_Brain/private/, never here.
  const cols = ['priority_score', 'business_name', 'website', 'vertical', 'city', 'area', 'has_phone',
    'site_quality', 'band', 'verdict', 'trend', 'last_graded', 'next_recheck', 'worst_fault'];
  const escCsv = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const line = (p) => cols.map((c) => {
    if (c === 'site_quality') return escCsv(p.current?.sqs);
    if (c === 'band') return escCsv(p.current?.band);
    if (c === 'verdict') return escCsv(p.current?.verdict);
    if (c === 'worst_fault') return escCsv((p.top_faults || [])[0] || '');
    return escCsv(p[c]);
  }).join(',');
  return [cols.join(','), ...rows.map(line)].join('\n') + '\n';
}

function digest(summary, run) {
  const q = (summary.build_queue || []).slice(0, 15);
  const L = [];
  L.push('---');
  L.push('tags: [brief, radar, prospects]');
  L.push(`date: ${summary.generated}`);
  L.push(`tracked: ${summary.total}`);
  L.push(`build_queue: ${summary.build_queue_size}`);
  L.push('---');
  L.push('');
  L.push(`# Prospect Radar — ${summary.generated}`);
  L.push('');
  L.push(`Tracking **${summary.total}** businesses. Found ${run.discovered_new} new today, re-audited ${run.regraded}.`);
  L.push(`**${summary.build_queue_size}** qualify for a rebuild right now; ${(summary.needs_render || []).length} are blocked on a render pass.`);
  L.push('');
  L.push(`Dashboard: \`${DASHBOARD_PATH}\` · queue CSV: \`${CSV_PATH}\``);
  L.push('');
  L.push('## Top suggestions');
  L.push('');
  if (!q.length) {
    L.push('_Nothing qualifies for a rebuild right now._');
  } else {
    L.push('| Priority | Business | Vertical | Where | Their site | Worst fault |');
    L.push('|---:|---|---|---|---:|---|');
    for (const p of q) {
      L.push(`| ${p.priority_score} | [${p.business_name}](${p.website}) | ${p.vertical || ''} | ${p.city || p.area || ''} | ${p.current?.sqs ?? '—'} | ${(p.top_faults || [])[0] || ''} |`);
    }
  }
  L.push('');
  if ((summary.movers || []).length) {
    L.push('## Moved since last audit');
    L.push('');
    for (const p of summary.movers.slice(0, 8)) {
      L.push(`- **${p.business_name}** ${p.trend_delta > 0 ? '+' : ''}${p.trend_delta} → ${p.current?.sqs} (${p.trend})`);
    }
    L.push('');
  }
  L.push('## Sell traffic, not a rebuild');
  L.push('');
  const t = (summary.traffic_queue || []).slice(0, 10);
  if (!t.length) {
    L.push('_None confirmed — needs a render pass to certify a site as good._');
  } else {
    for (const p of t) L.push(`- **${p.business_name}** — site ${p.current?.sqs}, ${p.offer || 'ads / local SEO'}`);
  }
  L.push('');
  L.push('> Nothing here is outbound-ready. A human approves every send.');
  L.push('');
  return L.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const today = todayISO();
  const registry = radar.load();
  const { suppressIds, suppressDomains } = buildSuppressSets(repoPath('01_Clients'));

  // Never re-pitch a business from the completed 100.
  const built = readJson(repoPath('_os/automation/fixtures/prospects/philly-100-completed.json'), null);
  const excludeDomains = new Set(suppressDomains);
  if (built) {
    for (const r of built.prospects || []) {
      const d = r.domain || normalizeDomain(r.website);
      if (d) excludeDomains.add(d);
    }
  }
  for (const [domain, p] of Object.entries(registry.prospects)) {
    if (p.lifecycle === 'client' || p.lifecycle === 'excluded') excludeDomains.add(domain);
  }

  const run = { discovered_raw: 0, discovered_new: 0, regraded: 0, errors: [] };
  const slot = args.market
    ? ROTATION.find((r) => r.market === args.market) || ROTATION[0]
    : ROTATION[dayOfYear(today) % ROTATION.length];
  const areaLabel = slot.areas.map((a) => a.name).join(', ');

  process.stderr.write(`radar refresh ${today} · rotation slot: ${slot.market} (${areaLabel})\n`);

  // --- 1. Expand -----------------------------------------------------------
  if (args.discover > 0) {
    const fresh = new Map();
    for (const area of slot.areas) {
      if (fresh.size >= args.discover) break;
      const query = buildQuery(area, GROUP_ORDER);
      process.stderr.write(`  discovering ${area.name} … `);
      const res = await runOverpass(query);
      if (!res.ok) {
        process.stderr.write(`FAILED (${res.error.slice(0, 90)})\n`);
        run.errors.push(`discover ${area.name}: ${res.error}`);
        continue;
      }
      const { candidates, stats } = toCandidates(res.elements, { excludeDomains, market: slot.market });
      run.discovered_raw += stats.raw;
      let added = 0;
      for (const c of candidates) {
        if (fresh.size >= args.discover) break;
        if (registry.prospects[c.domain] || fresh.has(c.domain)) continue;
        fresh.set(c.domain, { ...c, area: area.name });
        added += 1;
      }
      process.stderr.write(`${stats.raw} raw → ${added} new\n`);
    }
    const upserted = radar.upsertDiscovered(registry, [...fresh.values()], { today });
    run.discovered_new = upserted.added;
    process.stderr.write(`  added ${upserted.added} to the registry\n`);
  }

  // --- 2 & 3. Grade new arrivals and re-audit what went stale --------------
  const toGrade = radar.dueForRecheck(registry, { limit: args.recheck + run.discovered_new, today });
  if (toGrade.length) {
    process.stderr.write(`  grading ${toGrade.length} (new + due for re-audit)\n`);
    const ctx = { suppressIds, suppressDomains, maxTier: args.maxTier, currentYear: new Date().getUTCFullYear() };
    let done = 0;
    const results = await mapLimit(toGrade, args.concurrency, async (p) => {
      const r = await gradeOne(p, ctx);
      done += 1;
      if (done % 25 === 0) process.stderr.write(`    ${done}/${toGrade.length}\n`);
      return { domain: p.domain, r };
    });
    for (const item of results) {
      if (!item || item.__error || !item.r) continue;
      radar.recordGrade(registry, item.domain, item.r, { today });
      const p = registry.prospects[item.domain];
      if (p && p.lifecycle === 'new') {
        // `queued_build` means "a human may draft a brief for this". A rebuild
        // verdict earns it only when the audit found a fault it can actually
        // prove — a missing viewport tag, a dead domain, a table layout. A
        // verdict assembled from soft score pressure alone stays `graded` and
        // waits for a render, because the whole point of this grader is to not
        // pitch a redesign on a hunch.
        const proven = (item.r.hard_faults || []).length > 0;
        p.lifecycle = item.r.verdict === 'rebuild' && proven ? 'queued_build' : 'graded';
        if (item.r.verdict === 'rebuild' && !proven) {
          p.next_action = 'Rebuild verdict rests on soft signals only — render before briefing';
        }
      }
      run.regraded += 1;
    }
  }

  // --- 4. Publish ----------------------------------------------------------
  const summary = radar.summarize(registry, { today });

  if (args.dryRun) {
    console.log(JSON.stringify({ status: 'ok', dry_run: true, run, counts: summary.by_verdict }, null, 2));
    return;
  }

  radar.save(registry);
  const dashFile = repoPath(DASHBOARD_PATH);
  ensureDir(path.dirname(dashFile));
  fs.writeFileSync(dashFile, renderDashboard(summary));

  const csvFile = repoPath(CSV_PATH);
  ensureDir(path.dirname(csvFile));
  fs.writeFileSync(csvFile, toCsv(summary.build_queue));

  const digestFile = repoPath(path.join('Daily-Briefs', `radar-${today}.md`));
  fs.writeFileSync(digestFile, digest(summary, run));

  const state = {
    automation_id: AUTOMATION_ID,
    started_at: nowISO(),
    status: run.errors.length && !run.discovered_new && !run.regraded ? 'error' : 'ok',
    date: today,
    rotation_slot: `${slot.market}: ${areaLabel}`,
    run,
    tracked: summary.total,
    build_queue_size: summary.build_queue_size,
    needs_render: (summary.needs_render || []).length,
    mean_site_quality: summary.mean_site_quality,
    by_verdict: summary.by_verdict,
    errors: run.errors,
  };
  writeRunState(AUTOMATION_ID, state);
  writeJson(repoPath('12_Brain/state/radar-last.json'), state);

  console.log(
    JSON.stringify(
      {
        status: state.status,
        date: today,
        rotation: state.rotation_slot,
        discovered_new: run.discovered_new,
        regraded: run.regraded,
        tracked: summary.total,
        build_queue: summary.build_queue_size,
        needs_render: state.needs_render,
        by_verdict: summary.by_verdict,
        dashboard: DASHBOARD_PATH,
        digest: `Daily-Briefs/radar-${today}.md`,
        errors: run.errors,
      },
      null,
      2
    )
  );
  if (state.status === 'error') process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
