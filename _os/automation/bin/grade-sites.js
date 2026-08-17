#!/usr/bin/env node
'use strict';

/**
 * Iterative prospect website grader.
 *
 *   node _os/automation/bin/grade-sites.js --from <candidates.json> [options]
 *
 * Runs candidates through escalating audit tiers, stopping each one as soon as
 * its verdict is unambiguous. A 300-row market pull typically resolves ~70% at
 * Tier 0 (one HTTP request each, no browser), so only the genuinely undecided
 * candidates cost a render.
 *
 * Options
 *   --from <file>          candidates JSON: array, or {prospects:[...]} , or {candidates:[...]}
 *   --market <CODE>        market code stamped on output (ERI, PGH, ALN, HBG, LAN, ...)
 *   --max-tier <0|1|2>     deepest tier to run (default 1; 2 needs taste input)
 *   --tier <0|1|2>         force every candidate to exactly this tier, no escalation
 *   --concurrency <n>      parallel Tier 0 fetches (default 6)
 *   --limit <n>            only grade the first n candidates
 *   --out <dir>            output dir (default 12_Brain/state/grades/<market>)
 *   --screenshots          save Tier 1 screenshots (gitignored qa-shots dir)
 *   --notes                also write/refresh 08_Prospects/*.md notes
 *   --thresholds <json>    override {rebuildCeiling,polishCeiling,minConfidence,buildFloor}
 *   --dry-run              audit and score, write nothing
 *
 * Candidate fields (only `website` is required; everything else sharpens the route):
 *   business_name, website, vertical, market, phone, review_count, rating,
 *   ad_presence, gbp_claimed, local_rank, location_count, employee_count,
 *   outreach_readiness, email_count, previously_mailed, harvest_path,
 *   taste_score, taste_note, prospect_id
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, nowISO, todayISO, slugify } = require('../lib/fsutil');
const { gradeSite, mergeAudits, DIMENSIONS } = require('../lib/site-grader');
const { auditTier0, auditTier1, auditFromHarvest, applyTaste } = require('../lib/site-audit');
const { routeOpportunity, shouldEscalate } = require('../lib/opportunity');
const { buildSuppressSets } = require('../lib/clients');
const { writeRunState, enqueue } = require('../lib/registry');

const AUTOMATION_ID = 'site-grader';

function parseArgs(argv) {
  const o = {
    from: null, market: 'PA', maxTier: 1, forceTier: null, concurrency: 6,
    limit: null, out: null, screenshots: false, notes: false, thresholds: {}, dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from') o.from = argv[++i];
    else if (a === '--market') o.market = String(argv[++i] || 'PA').toUpperCase();
    else if (a === '--max-tier') o.maxTier = parseInt(argv[++i], 10);
    else if (a === '--tier') o.forceTier = parseInt(argv[++i], 10);
    else if (a === '--concurrency') o.concurrency = Math.max(1, parseInt(argv[++i], 10) || 6);
    else if (a === '--limit') o.limit = parseInt(argv[++i], 10);
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--screenshots') o.screenshots = true;
    else if (a === '--notes') o.notes = true;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--thresholds') o.thresholds = JSON.parse(argv[++i]);
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

function loadCandidates(file) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  const doc = readJson(abs);
  const rows = Array.isArray(doc) ? doc : doc.prospects || doc.candidates || doc.rows || [];
  if (!Array.isArray(rows)) throw new Error('candidates file must be an array or {prospects|candidates|rows:[...]}');
  return rows.map((r, i) => ({
    prospect_id: r.prospect_id || `${slugify(r.business_name || `row-${i + 1}`)}`,
    business_name: r.business_name || r.business || r.name || `Row ${i + 1}`,
    website: r.website || r.site_url || r.url || '',
    ...r,
  }));
}

/** Run `fn` over `items` with a fixed concurrency ceiling, preserving order. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        out[i] = await fn(items[i], i);
      } catch (err) {
        out[i] = { __error: String(err && err.message ? err.message : err) };
      }
    }
  });
  await Promise.all(workers);
  return out;
}

const bar = (n, width = 20) => {
  if (n == null) return '·'.repeat(width);
  const filled = Math.round((n / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};

async function gradeOne(cand, ctx) {
  const started = Date.now();
  const trail = [];
  let audit = { tier: 0, url: cand.website };
  let playwrightMissing = false;
  let renderFailed = false;

  const wantTier = ctx.forceTier != null ? ctx.forceTier : 0;

  // --- Tier 0 -------------------------------------------------------------
  if (cand.website) {
    if (wantTier === 0 || ctx.forceTier == null) {
      try {
        audit = mergeAudits(audit, await auditTier0(cand.website, { checkHttpRedirect: false }));
        trail.push('tier0: fetched');
        // An inconclusive failure (our proxy, a timeout, transient DNS) says
        // nothing about the prospect's site, so give it one more chance with a
        // longer timeout before letting it fall through as ungraded.
        if (audit.fetchInconclusive) {
          trail.push(`tier0: inconclusive (${audit.error}) — retrying once`);
          const retry = await auditTier0(cand.website, { checkHttpRedirect: false, timeoutMs: 30000 });
          if (!retry.fetchInconclusive) {
            audit = mergeAudits(audit, retry);
            delete audit.fetchInconclusive;
            trail.push('tier0: retry succeeded');
          } else {
            trail.push(`tier0: retry also inconclusive (${retry.error})`);
          }
        }
      } catch (err) {
        audit = mergeAudits(audit, { tier: 0, reachable: false, error: String(err.message || err) });
        trail.push(`tier0: failed (${err.message})`);
      }
    }
  } else {
    trail.push('tier0: skipped — no website URL');
  }

  // Free Tier-1-grade evidence if the batch pipeline already harvested them.
  if (cand.harvest_path) {
    const hp = path.isAbsolute(cand.harvest_path) ? cand.harvest_path : repoPath(cand.harvest_path);
    const harvest = readJson(hp, null);
    const fromHarvest = harvest ? auditFromHarvest(harvest, cand.website) : null;
    if (fromHarvest) {
      audit = mergeAudits(audit, fromHarvest);
      trail.push('tier1: reused existing harvest.json (free)');
    }
  }

  let grade = gradeSite(audit, { currentYear: ctx.currentYear });
  let route = routeOpportunity(cand, {
    grade,
    suppressIds: ctx.suppressIds,
    suppressDomains: ctx.suppressDomains,
    thresholds: ctx.thresholds,
  });

  // --- Tier 1: only if the verdict is still in doubt ----------------------
  const wantsRender = ctx.forceTier != null ? ctx.forceTier >= 1 : ctx.maxTier >= 1;
  if (wantsRender && cand.website && route.verdict !== 'suppress' && audit.tier < 1) {
    const decision = ctx.forceTier != null
      ? { escalate: true, reason: `--tier ${ctx.forceTier} forced` }
      : shouldEscalate(route, { tier: 0, thresholds: ctx.thresholds });
    trail.push(`escalate?: ${decision.escalate ? 'yes' : 'no'} — ${decision.reason}`);
    if (decision.escalate) {
      try {
        const shotDir = ctx.screenshots
          ? repoPath(path.join('_templates/site-factory/qa-shots/graded', slugify(cand.business_name)))
          : null;
        const t1 = await auditTier1(cand.website, { screenshotDir: shotDir });
        if (t1.tier1Failed) {
          // Render failed but Tier 0 evidence stands. Record it and keep the
          // Tier 0 grade rather than pretending we learned nothing or, worse,
          // treating the site as unreachable.
          renderFailed = true;
          trail.push(`tier1: render failed, keeping Tier 0 grade (${t1.tier1Error})`);
        } else {
          audit = mergeAudits(audit, t1);
          grade = gradeSite(audit, { currentYear: ctx.currentYear });
          route = routeOpportunity(cand, {
            grade, suppressIds: ctx.suppressIds, suppressDomains: ctx.suppressDomains, thresholds: ctx.thresholds,
          });
          trail.push('tier1: rendered');
        }
      } catch (err) {
        if (err.message === 'PLAYWRIGHT_MISSING') {
          playwrightMissing = true;
          trail.push('tier1: SKIPPED — Playwright not installed');
        } else {
          trail.push(`tier1: failed (${String(err.message).slice(0, 120)})`);
        }
      }
    }
  }

  // --- Tier 2: taste verdict, only if supplied ---------------------------
  const wantTaste = ctx.forceTier != null ? ctx.forceTier >= 2 : ctx.maxTier >= 2;
  if (wantTaste && cand.taste_score != null) {
    audit = applyTaste(audit, cand.taste_score, cand.taste_note);
    grade = gradeSite(audit, { currentYear: ctx.currentYear });
    route = routeOpportunity(cand, {
      grade, suppressIds: ctx.suppressIds, suppressDomains: ctx.suppressDomains, thresholds: ctx.thresholds,
    });
    trail.push(`tier2: taste ${cand.taste_score}/5 applied`);
  } else if (wantTaste && route.verdict === 'rebuild') {
    trail.push('tier2: PENDING — rebuild candidate needs a human taste score before a build slot');
  }

  return {
    prospect_id: cand.prospect_id,
    business_name: cand.business_name,
    website: cand.website,
    vertical: cand.vertical || cand.category || '',
    market: cand.market || ctx.market,
    graded_at: ctx.stamp,
    tier_reached: audit.tier,
    site_quality_score: grade.score,
    site_quality_band: grade.band,
    provisional: grade.provisional,
    capped: grade.capped,
    hard_faults: grade.hard_faults || [],
    confidence: grade.confidence,
    opportunity_score: route.opportunity_score,
    opportunity_confidence: route.opportunity_confidence,
    verdict: route.verdict,
    offer: route.offer,
    next_action: route.next_action,
    dimensions: grade.dimensions,
    unknown_dimensions: grade.unknown,
    headline: grade.headline,
    findings: grade.findings,
    route_reasons: route.reasons,
    components: route.components,
    audit_trail: trail,
    playwright_missing: playwrightMissing,
    render_failed: renderFailed,
    fetch_inconclusive: audit.fetchInconclusive === true,
    dead_domain: audit.reachable === false,
    error_kind: audit.errorKind || null,
    elapsed_ms: Date.now() - started,
    audit,
  };
}

function toCsv(rows) {
  const cols = [
    'prospect_id', 'business_name', 'website', 'vertical', 'market',
    'site_quality_score', 'site_quality_band', 'confidence',
    'opportunity_score', 'verdict', 'offer', 'tier_reached', 'next_action',
  ];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}

function report(rows, meta) {
  const by = (v) => rows.filter((r) => r.verdict === v);
  const rebuild = by('rebuild').sort((a, b) => b.opportunity_score - a.opportunity_score);
  const graded = rows.filter((r) => r.site_quality_score != null);
  const avg = graded.length
    ? Math.round(graded.reduce((s, r) => s + r.site_quality_score, 0) / graded.length)
    : null;

  const L = [];
  L.push('---');
  L.push('tags: [campaign, grader, report]');
  L.push(`market: ${meta.market}`);
  L.push(`graded: ${meta.stamp}`);
  L.push(`candidates: ${rows.length}`);
  L.push('---');
  L.push('');
  L.push(`# Site Grade Report — ${meta.market} — ${meta.stamp}`);
  L.push('');
  L.push(`${rows.length} candidates graded. Mean site quality **${avg == null ? 'n/a' : `${avg}/100`}**.`);
  L.push('');
  L.push('## Routing');
  L.push('');
  L.push('| Verdict | Count | Offer | Consumes a build slot |');
  L.push('|---|---:|---|---|');
  for (const v of ['rebuild', 'verify', 'polish', 'ads_seo', 'nurture', 'enrich', 'suppress']) {
    const g = by(v);
    if (!g.length) continue;
    L.push(`| \`${v}\` | ${g.length} | ${g[0].offer} | ${v === 'rebuild' ? '**yes**' : 'no'} |`);
  }
  L.push('');
  L.push(`**Build slots needed: ${rebuild.length}** of ${rows.length} candidates. ` +
    `The other ${rows.length - rebuild.length} route to a different offer or drop out — ` +
    `that is the waste this grader removes.`);
  L.push('');

  L.push('## Build queue (rebuild, best first)');
  L.push('');
  if (!rebuild.length) {
    L.push('_Nothing qualifies for a rebuild in this pull._');
  } else {
    L.push('| # | Business | Vertical | Site quality | Opportunity | Why |');
    L.push('|---:|---|---|---:|---:|---|');
    rebuild.forEach((r, i) => {
      const why = (r.findings.find((f) => f.delta < 0) || {}).reason || '—';
      L.push(`| ${i + 1} | ${r.business_name} | ${r.vertical} | ${r.site_quality_score} | **${r.opportunity_score}** | ${why} |`);
    });
  }
  L.push('');

  const strong = [...by('ads_seo'), ...by('nurture')]
    .filter((r) => r.site_quality_score != null)
    .sort((a, b) => b.site_quality_score - a.site_quality_score);
  L.push('## Already have a great website — do NOT pitch a rebuild');
  L.push('');
  L.push("This is the list Mac was talking about. Their sites are good; pitching a redesign burns credibility. Sell them traffic instead.");
  L.push('');
  if (!strong.length) {
    L.push('_None in this pull._');
  } else {
    L.push('| Business | Site quality | Band | Route | Pitch |');
    L.push('|---|---:|---|---|---|');
    strong.forEach((r) => {
      L.push(`| ${r.business_name} | ${r.site_quality_score} | ${r.site_quality_band} | \`${r.verdict}\` | ${r.offer} |`);
    });
  }
  L.push('');

  const needs = by('enrich');
  if (needs.length) {
    L.push('## Needs a deeper audit before deciding');
    L.push('');
    needs.forEach((r) => L.push(`- **${r.business_name}** — ${r.next_action}`));
    L.push('');
  }

  L.push('## Score distribution');
  L.push('');
  L.push('```');
  const bands = [['elite 85+', 85, 101], ['strong 70–84', 70, 85], ['dated 50–69', 50, 70], ['decayed 30–49', 30, 50], ['broken 0–29', 0, 30]];
  for (const [label, lo, hi] of bands) {
    const n = graded.filter((r) => r.site_quality_score >= lo && r.site_quality_score < hi).length;
    L.push(`${label.padEnd(14)} ${String(n).padStart(3)}  ${'▇'.repeat(n)}`);
  }
  const ungraded = rows.length - graded.length;
  if (ungraded) L.push(`${'ungraded'.padEnd(14)} ${String(ungraded).padStart(3)}  ${'▁'.repeat(ungraded)}`);
  L.push('```');
  L.push('');

  L.push('## Dimension averages');
  L.push('');
  L.push('| Dimension | Mean | Measured on | What it covers |');
  L.push('|---|---:|---:|---|');
  for (const [key, spec] of Object.entries(DIMENSIONS)) {
    const vals = graded.map((r) => r.dimensions[key]).filter((d) => d && d.evidence !== 'unknown');
    const mean = vals.length ? Math.round(vals.reduce((s, d) => s + d.score, 0) / vals.length) : null;
    L.push(`| ${spec.label} | ${mean == null ? '—' : mean} | ${vals.length}/${graded.length} | ${spec.about} |`);
  }
  L.push('');
  if (rows.some((r) => r.playwright_missing)) {
    L.push('> **Tier 1 was skipped for some candidates — Playwright is not installed.** ' +
      'Scores are Tier 0 only and carry lower confidence. ' +
      'Install with `npm i --no-save playwright && npx playwright install chromium --with-deps`, then re-run.');
    L.push('');
  }
  L.push('## Next');
  L.push('');
  L.push(`1. Take the top ${Math.min(25, rebuild.length)} of the build queue into a batch (\`site-batch\`).`);
  L.push('2. Hand the ads/SEO list to outreach as a different offer — it is not a dead list.');
  L.push('3. After the drop, record outcomes and run `grade-calibrate.js` so the thresholds learn.');
  L.push('');
  return L.join('\n');
}

function prospectNote(r) {
  const dims = Object.entries(r.dimensions)
    .map(([, d]) => `| ${d.label} | ${d.evidence === 'unknown' ? '—' : d.score} | ${d.evidence} | ${d.weight} |`)
    .join('\n');
  return [
    '---',
    `prospect_id: ${JSON.stringify(r.prospect_id)}`,
    `business_name: ${JSON.stringify(r.business_name)}`,
    'source: site-grader',
    `website: ${r.website}`,
    `vertical: ${r.vertical}`,
    `market: ${r.market}`,
    // Only a provable fault promotes a rebuild verdict to `queued_build`; see
    // the note in radar-refresh.js for why soft pressure is not enough.
    `status: ${r.verdict === 'rebuild' && (r.hard_faults || []).length ? 'queued_build' : r.verdict}`,
    `hard_faults: ${JSON.stringify(r.hard_faults || [])}`,
    `site_quality_score: ${r.site_quality_score == null ? 'null' : r.site_quality_score}`,
    `site_quality_band: ${r.site_quality_band}`,
    `opportunity_score: ${r.opportunity_score}`,
    `confidence: ${r.confidence}`,
    `verdict: ${r.verdict}`,
    `offer: ${JSON.stringify(r.offer)}`,
    `tier_reached: ${r.tier_reached}`,
    `last_touched: ${r.graded_at}`,
    `next_action: ${JSON.stringify(r.next_action)}`,
    'tags: [prospect, graded]',
    '---',
    '',
    `# ${r.business_name}`,
    '',
    `**Their site: ${r.site_quality_score == null ? 'ungraded' : `${r.site_quality_score}/100`} (${r.site_quality_band})** · ` +
      `Opportunity **${r.opportunity_score}/100** · Confidence ${Math.round(r.confidence * 100)}% · Tier ${r.tier_reached}`,
    '',
    `> ${r.headline}`,
    '',
    `**Verdict: \`${r.verdict}\` — ${r.offer}**`,
    '',
    r.next_action,
    '',
    '## Site quality by dimension',
    '',
    '| Dimension | Score | Evidence | Weight |',
    '|---|---:|---|---:|',
    dims,
    '',
    '## What the audit found',
    '',
    ...r.findings.slice(0, 14).map((f) => `- ${f.delta > 0 ? '+' : ''}${f.delta} **${f.dimension}** — ${f.reason}`),
    '',
    '## Why this route',
    '',
    ...r.route_reasons.map((x) => `- ${x}`),
    '',
    '## Audit trail',
    '',
    ...r.audit_trail.map((t) => `- ${t}`),
    '',
    '> Nothing here is outbound-ready. Human approval gates every send.',
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.from) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\*ex?/gm, '').replace(/^\s*\* ?/gm, ''));
    process.exit(args.help ? 0 : 1);
  }

  const candidates0 = loadCandidates(args.from);
  const candidates = args.limit ? candidates0.slice(0, args.limit) : candidates0;
  const { suppressIds, suppressDomains } = buildSuppressSets(repoPath('01_Clients'));
  const stamp = todayISO();

  const ctx = {
    market: args.market,
    maxTier: Number.isFinite(args.maxTier) ? args.maxTier : 1,
    forceTier: Number.isFinite(args.forceTier) ? args.forceTier : null,
    screenshots: args.screenshots,
    thresholds: args.thresholds,
    suppressIds,
    suppressDomains,
    stamp,
    currentYear: new Date().getUTCFullYear(),
  };

  process.stderr.write(
    `grading ${candidates.length} candidate(s) · market ${ctx.market} · ` +
    `max tier ${ctx.forceTier != null ? `forced ${ctx.forceTier}` : ctx.maxTier} · concurrency ${args.concurrency}\n`
  );

  const rows = await mapLimit(candidates, args.concurrency, async (cand, i) => {
    const r = await gradeOne(cand, ctx);
    process.stderr.write(
      `[${String(i + 1).padStart(3)}/${candidates.length}] ` +
      `${bar(r.site_quality_score)} ${String(r.site_quality_score ?? '--').padStart(3)} ` +
      `${r.verdict.padEnd(8)} ${r.business_name.slice(0, 42)}\n`
    );
    return r;
  });

  const counts = rows.reduce((acc, r) => {
    acc[r.verdict] = (acc[r.verdict] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    automation_id: AUTOMATION_ID,
    started_at: nowISO(),
    market: ctx.market,
    status: 'ok',
    dry_run: !!args.dryRun,
    source: args.from,
    counts: { total: rows.length, ...counts },
    build_slots_needed: counts.rebuild || 0,
    mean_site_quality: (() => {
      const g = rows.filter((r) => r.site_quality_score != null);
      return g.length ? Math.round(g.reduce((s, r) => s + r.site_quality_score, 0) / g.length) : null;
    })(),
    playwright_missing: rows.some((r) => r.playwright_missing),
    render_failed_count: rows.filter((r) => r.render_failed).length,
    fetch_inconclusive_count: rows.filter((r) => r.fetch_inconclusive).length,
    dead_domains: rows.filter((r) => r.dead_domain).length,
    results: rows.map(({ audit, findings, route_reasons, dimensions, ...keep }) => keep),
  };

  if (args.dryRun) {
    console.log(JSON.stringify({ status: 'ok', dry_run: true, counts: summary.counts }, null, 2));
    return;
  }

  const outDir = args.out
    ? (path.isAbsolute(args.out) ? args.out : repoPath(args.out))
    : repoPath(path.join('12_Brain/state/grades', ctx.market.toLowerCase()));
  ensureDir(outDir);

  // Persist findings and reasons but not the raw audit blobs — those are large,
  // regenerable, and nobody reads them out of a wiki repo.
  // Persist findings and reasons but not the raw audit blobs, and collapse each
  // row's dimension objects to their numbers — the labels and descriptions are
  // static (see DIMENSIONS) and repeating them per row was most of a 3.9MB file.
  writeJson(path.join(outDir, `grades-${stamp}.json`), {
    ...summary,
    dimension_reference: Object.fromEntries(
      Object.entries(DIMENSIONS).map(([k, v]) => [k, { label: v.label, weight: v.weight, about: v.about }])
    ),
    detail: rows.map(({ audit, dimensions, findings, ...keep }) => ({
      ...keep,
      dimensions: Object.fromEntries(
        Object.entries(dimensions || {}).map(([k, d]) => [k, { score: d.score, evidence: d.evidence }])
      ),
      // Findings are already sorted by absolute impact; the tail is noise.
      findings: (findings || []).slice(0, 12),
    })),
  }, { compact: true });
  fs.writeFileSync(path.join(outDir, `grades-${stamp}.csv`), toCsv(rows));
  fs.writeFileSync(path.join(outDir, `report-${stamp}.md`), report(rows, { market: ctx.market, stamp }));
  writeJson(repoPath('12_Brain/state/site-grader-last.json'), summary);

  if (args.notes) {
    const noteDir = repoPath('08_Prospects');
    ensureDir(noteDir);
    for (const r of rows) {
      if (r.verdict === 'suppress') continue;
      const name = `${slugify(r.business_name) || 'prospect'}-graded.md`;
      fs.writeFileSync(path.join(noteDir, name), prospectNote(r));
    }
  }

  for (const r of rows) {
    if (r.verdict === 'rebuild') {
      enqueue(AUTOMATION_ID, 'enqueue_build', {
        prospect_id: r.prospect_id,
        business_name: r.business_name,
        website: r.website,
        market: r.market,
        site_quality_score: r.site_quality_score,
        opportunity_score: r.opportunity_score,
      });
    }
  }

  const stateFile = writeRunState(AUTOMATION_ID, summary);
  console.log(
    JSON.stringify(
      {
        status: 'ok',
        market: ctx.market,
        counts: summary.counts,
        build_slots_needed: summary.build_slots_needed,
        mean_site_quality: summary.mean_site_quality,
        out: path.relative(repoPath('.'), outDir),
        report: path.relative(repoPath('.'), path.join(outDir, `report-${stamp}.md`)),
        state: stateFile,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
