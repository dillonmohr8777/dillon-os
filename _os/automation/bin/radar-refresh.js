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
 *   --enrich <n>       Google Places lookups to spend today (default 60, 0 to skip).
 *                      Needs GOOGLE_PLACES_API_KEY; silently skipped without one.
 *                      Every call is billed, so this is a hard daily budget.
 *   --dry-run          do everything except write
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, todayISO, nowISO, slugify } = require('../lib/fsutil');
const radar = require('../lib/radar');
const { planDiscovery, describePlan, DAILY } = require('../lib/coverage-plan');
const { surveyImagery, imageryStale, HOMEPAGE_IMAGE_SLOTS } = require('../lib/imagery');
const { renderDashboard } = require('../lib/radar-dashboard');
const { gradeSite, mergeAudits } = require('../lib/site-grader');
const { auditTier0, auditTier1 } = require('../lib/site-audit');
const { routeOpportunity, shouldEscalate } = require('../lib/opportunity');
const { buildQuery, runOverpass, toCandidates, VERTICAL_GROUPS, normalizeDomain } = require('../lib/discovery');
const places = require('../lib/places');
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
  const o = {
    // Defaults come from lib/coverage-plan DAILY so the scheduled job and a
    // hand-run share one definition of "a day's work".
    discover: DAILY.discover, recheck: 250, market: null, concurrency: 12, maxTier: 0,
    enrich: DAILY.enrich, render: DAILY.render, imagery: DAILY.imagery,
    dryRun: false, regrade: null, force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--discover') o.discover = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a === '--recheck') o.recheck = Math.max(0, parseInt(argv[++i], 10) || 0);
    // Re-audit specific verdicts regardless of their schedule. Needed whenever
    // the audit itself improves: a stored grade's recheck date says nothing
    // about whether the code that produced it was right.
    else if (a === '--regrade') { o.regrade = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean); o.force = true; }
    else if (a === '--force') o.force = true;
    else if (a === '--market') o.market = String(argv[++i] || '').toUpperCase();
    else if (a === '--concurrency') o.concurrency = Math.max(1, parseInt(argv[++i], 10) || 12);
    else if (a === '--max-tier') o.maxTier = parseInt(argv[++i], 10) || 0;
    else if (a === '--enrich') o.enrich = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a === '--render') o.render = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a === '--imagery') o.imagery = Math.max(0, parseInt(argv[++i], 10) || 0);
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

  // Tier 1 is the expensive tier, so it is budgeted rather than unlimited. The
  // budget is consumed in dueForRecheck order — never-graded rows first, then
  // most-overdue, then highest-priority — which means it lands on the biggest
  // blind spots rather than on whichever row happened to be enumerated first.
  const canRender = ctx.renderBudget == null || ctx.renderBudget.left > 0;
  if (canRender && ctx.maxTier >= 1 && route.verdict !== 'suppress' && shouldEscalate(route, { tier: 0 }).escalate) {
    if (ctx.renderBudget) ctx.renderBudget.left -= 1;
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
    // The per-dimension breakdown is what lets the dashboard answer "why is this
    // a 26" instead of just asserting it. radar.recordGrade slims it down before
    // it reaches the registry.
    dimensions: grade.dimensions,
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

  const run = { discovered_raw: 0, discovered_new: 0, regraded: 0, enriched: 0, enrich_no_match: 0, enrich_skipped: 0, errors: [] };
  // Coverage-driven targeting. The old day-of-year rotation was even in *slots*
  // but not in *rows* — Montgomery County yields far more per query than
  // Philadelphia does, which is how the registry ended up 2.2:1 against the
  // priority market with no mechanism to correct itself. --market still forces a
  // single area for a manual run.
  const plan = args.market
    ? (() => {
        const r = ROTATION.find((x) => x.market === args.market) || ROTATION[0];
        return {
          targets: r.areas.map((a) => ({ ...a, market: r.market, groups: GROUP_ORDER.slice(0, 3), cap: args.discover })),
          budget: args.discover, throttled: false, total: Object.keys(registry.prospects).length,
          reason: `forced market ${args.market}`, areaDeficits: [], groupDeficits: [],
        };
      })()
    : planDiscovery(registry, { budget: args.discover });
  const slot = { market: plan.targets[0]?.market || 'PHL', areas: plan.targets };
  const areaLabel = plan.targets.map((a) => a.name).join(', ') || 'none (discovery paused)';

  process.stderr.write(`radar refresh ${today} · ${plan.reason}\n`);
  process.stderr.write(`  plan: ${describePlan(plan)}\n`);
  run.plan = plan.reason;
  run.throttled = plan.throttled;

  // --- 1. Expand -----------------------------------------------------------
  if (plan.budget > 0 && plan.targets.length) {
    const fresh = new Map();
    for (const area of plan.targets) {
      if (fresh.size >= plan.budget) break;
      // Each target carries its own groups (the ones behind target) and its own
      // cap, so a densely-mapped county cannot absorb the whole day's budget —
      // which is precisely how the Montgomery skew accumulated.
      const query = buildQuery(area, area.groups);
      process.stderr.write(`  discovering ${area.name} [${area.groups.join(',')}] cap ${area.cap} … `);
      const res = await runOverpass(query);
      if (!res.ok) {
        process.stderr.write(`FAILED (${res.error.slice(0, 90)})\n`);
        run.errors.push(`discover ${area.name}: ${res.error}`);
        continue;
      }
      const { candidates, stats } = toCandidates(res.elements, { excludeDomains, market: area.market });
      run.discovered_raw += stats.raw;
      let added = 0;
      for (const c of candidates) {
        if (added >= area.cap || fresh.size >= plan.budget) break;
        if (registry.prospects[c.domain] || fresh.has(c.domain)) continue;
        fresh.set(c.domain, { ...c, area: area.name });
        added += 1;
      }
      process.stderr.write(`${stats.raw} raw → ${added} new\n`);
    }
    const upserted = radar.upsertDiscovered(registry, [...fresh.values()], { today });
    run.discovered_new = upserted.added;
    process.stderr.write(`  added ${upserted.added} to the registry\n`);
  } else {
    process.stderr.write(`  discovery skipped: ${plan.reason}\n`);
  }

  // --- 1b. Enrich with ability-to-pay signals ------------------------------
  // Runs before grading so review volume is already on the row when
  // routeOpportunity() scores it — otherwise today's ranking would be a day
  // behind today's data. Budgeted, because every lookup is billed.
  if (args.enrich > 0) {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      process.stderr.write('  enrichment: skipped — GOOGLE_PLACES_API_KEY not set\n');
    } else {
      // Spend the budget where it changes a decision: the current build queue and
      // the rows about to be graded, highest priority first.
      const pending = Object.values(registry.prospects)
        .filter((p) => places.needsEnrichment(p, { today }))
        .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
        .slice(0, args.enrich);

      process.stderr.write(`  enriching ${pending.length} prospect(s) via Google Places\n`);
      let consecutiveFailures = 0;
      for (const p of pending) {
        const result = await places.enrichProspect(p, {});
        places.applyEnrichment(p, result, { today });
        if (result.status === 'ok') run.enriched += 1;
        else if (result.status === 'no_match') run.enrich_no_match += 1;
        else if (result.status === 'skipped') run.enrich_skipped += 1;
        else {
          run.errors.push(`places ${p.domain}: ${result.reason}`);
          consecutiveFailures += 1;
          // A rejected key or exhausted quota fails identically for every
          // remaining row. Stop on an explicitly fatal status, and also after a
          // short run of any failures — pattern-matching the message alone is
          // fragile, since Google answers a bad key with 400 rather than 403.
          if (result.fatal || consecutiveFailures >= 3) {
            process.stderr.write(
              `  enrichment halted after ${consecutiveFailures} failure(s): ${result.reason}\n`
            );
            break;
          }
          continue;
        }
        consecutiveFailures = 0;
      }
      process.stderr.write(
        `  enriched ${run.enriched}, no match ${run.enrich_no_match}, errors ${run.errors.length}\n`
      );
    }
  }

  // --- 2 & 3. Grade new arrivals and re-audit what went stale --------------
  const toGrade = radar.dueForRecheck(registry, {
    limit: args.recheck + run.discovered_new,
    today,
    verdicts: args.regrade,
    force: args.force,
  });
  if (toGrade.length) {
    process.stderr.write(`  grading ${toGrade.length} (new + due for re-audit)\n`);
    const renderBudget = args.maxTier >= 1 ? { left: args.render, spent: 0 } : null;
    const ctx = {
      suppressIds, suppressDomains, maxTier: args.maxTier,
      currentYear: new Date().getUTCFullYear(), renderBudget,
    };
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
    if (renderBudget) {
      run.rendered = args.render - renderBudget.left;
      process.stderr.write(`  tier 1 renders: ${run.rendered} of ${args.render} budgeted\n`);
    }
  }

  // --- 3b. Can we actually build these? ------------------------------------
  // Runs after grading so it only inspects rows that are currently rebuild
  // targets. The deliverable is a four-slot homepage concept, so this answers a
  // question the grader cannot: their site being bad says nothing about whether
  // they own enough photographs to replace it with.
  if (args.imagery > 0) {
    const needCheck = Object.values(registry.prospects)
      .filter((p) => p.current?.verdict === 'rebuild' && p.website)
      .filter((p) => imageryStale(p, { today }))
      .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
      .slice(0, args.imagery);

    if (needCheck.length) {
      process.stderr.write(`  imagery: checking ${needCheck.length} rebuild target(s)\n`);
      const st = await surveyImagery(registry, needCheck, {
        today, concurrency: Math.min(6, args.concurrency), need: HOMEPAGE_IMAGE_SLOTS,
      });
      run.imagery_checked = st.checked;
      run.imagery_buildable = st.buildable;
      process.stderr.write(
        `  imagery: ${st.buildable} buildable now, ${st.partial} partial, ${st.none} with nothing usable\n`
      );
    }
  }

  // --- 4. Publish ----------------------------------------------------------
  const summary = radar.summarize(registry, { today });

  if (args.dryRun) {
    console.log(JSON.stringify({ status: 'ok', dry_run: true, run, counts: summary.by_verdict }, null, 2));
    return;
  }

  radar.save(registry);

  // Build the run record before rendering: the dashboard shows sweep health, and
  // reading it back off disk would show the *previous* sweep — which is exactly
  // the failure mode that let a broken Places key go unnoticed.
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

  // Rendering must never cost the day's grading.
  //
  // The registry was saved a few lines up. If anything below throws — and
  // renderDashboard throws by design when the payload outgrows the page budget —
  // an uncaught error rejects main(), exits non-zero, fails the workflow step,
  // and skips the commit. The ephemeral runner is then destroyed holding the only
  // copy of that sweep's work: 60 discoveries and several hundred re-audits, gone.
  // Worse, it repeats every morning, because tomorrow reloads the same
  // pre-throw registry and hits the same wall.
  //
  // So every artifact is written independently and a failure is recorded rather
  // than thrown. The grading is the expensive part and it is already on disk.
  const artifacts = [
    ['dashboard', () => {
      const f = repoPath(DASHBOARD_PATH);
      ensureDir(path.dirname(f));
      fs.writeFileSync(f, renderDashboard(summary, { run: state }));
    }],
    ['queue csv', () => {
      const f = repoPath(CSV_PATH);
      ensureDir(path.dirname(f));
      // Operator rule: we do not build for sites with no photographs. A row
      // whose imagery was checked and came back empty stays a rebuild target in
      // the registry (their site is still bad), but is held out of the working
      // queue, because a homepage concept with broken-image slots pitches
      // nothing. Unchecked rows stay in: absence of a check is not evidence of
      // absence of photos.
      const buildable = summary.build_queue.filter(
        (p) => !(p.imagery && p.imagery.checked && p.imagery.usable === 0)
      );
      const excluded = summary.build_queue.length - buildable.length;
      if (excluded > 0) process.stderr.write(`  build queue: ${excluded} row(s) held out (no usable photos)\n`);
      fs.writeFileSync(f, toCsv(buildable));
    }],
    ['digest', () => {
      fs.writeFileSync(repoPath(path.join('Daily-Briefs', `radar-${today}.md`)), digest(summary, run));
    }],
  ];
  for (const [name, write] of artifacts) {
    try {
      write();
    } catch (err) {
      const msg = `${name} failed: ${String(err?.message || err).slice(0, 200)}`;
      run.errors.push(msg);
      state.status = 'error';
      process.stderr.write(`  ${msg}\n`);
    }
  }

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
        enriched: run.enriched,
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
