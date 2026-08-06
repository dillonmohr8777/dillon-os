#!/usr/bin/env node
'use strict';

/**
 * Prospect discovery — Stage 1 of the outreach engine, automated.
 *
 *   node _os/automation/bin/discover-prospects.js --market PHL --target 500
 *
 * Pulls real local businesses with real website URLs from OpenStreetMap for a
 * market, drops chains / social-only listings / anyone we have already built for
 * or sold to, and writes a candidates file that bin/grade-sites.js consumes
 * directly.
 *
 * Options
 *   --market <CODE>      market preset: PHL, PGH, ERI, ALN, HBG, LAN, RDG, SCR, YRK, SCE
 *   --areas <a,b,c>      override the preset's OSM area names
 *   --bbox <s,w,n,e>     use a bounding box instead of named areas
 *   --groups <a,b>       vertical groups (default: all, priority-ordered)
 *   --target <n>         stop once n candidates are collected (default 500)
 *   --exclude <file>     JSON of already-built prospects (default: the Philly 100)
 *   --out <file>         output path (default 12_Brain/state/candidates/<market>-<date>.json)
 *   --mix <g:n,g:n>      per-vertical-group caps, e.g. "home-services:170,medical:150,legal:100".
 *                        Without it you get whatever the source is richest in (restaurants).
 *   --dry-run            query and report counts, write nothing
 *
 * Coverage note: OSM only carries a `website` tag for businesses somebody has
 * mapped. It skews toward city centres and under-represents suburban trades.
 * It is a strong free first source, not a census — pair it with Mac's Maps pull
 * when volume matters.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, todayISO, nowISO } = require('../lib/fsutil');
const {
  buildQuery, runOverpass, toCandidates, VERTICAL_GROUPS, normalizeDomain, sanitizeForGit,
} = require('../lib/discovery');
const { buildSuppressSets } = require('../lib/clients');
const { writeRunState } = require('../lib/registry');

const AUTOMATION_ID = 'discover-prospects';

/**
 * Market presets. Area names are OSM administrative boundaries; counties carry
 * admin_level 6, municipalities 8. Philadelphia is both a city and a county.
 * Mirrors the geography ladder in Market Roster.md.
 */
const MARKETS = {
  PHL: {
    label: 'Philadelphia + collar counties',
    areas: [
      { name: 'Philadelphia', adminLevel: 8, state: 'Pennsylvania' },
      { name: 'Montgomery County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Delaware County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Bucks County', adminLevel: 6, state: 'Pennsylvania' },
      { name: 'Chester County', adminLevel: 6, state: 'Pennsylvania' },
    ],
  },
  PGH: { label: 'Pittsburgh', areas: [{ name: 'Pittsburgh', adminLevel: 8 }, { name: 'Allegheny County', adminLevel: 6, state: 'Pennsylvania' }] },
  ERI: { label: 'Erie', areas: [{ name: 'Erie', adminLevel: 8 }, { name: 'Erie County', adminLevel: 6, state: 'Pennsylvania' }] },
  ALN: { label: 'Lehigh Valley', areas: [{ name: 'Allentown', adminLevel: 8 }, { name: 'Bethlehem', adminLevel: 8 }, { name: 'Easton', adminLevel: 8 }, { name: 'Lehigh County', adminLevel: 6, state: 'Pennsylvania' }] },
  HBG: { label: 'Harrisburg', areas: [{ name: 'Harrisburg', adminLevel: 8 }, { name: 'Dauphin County', adminLevel: 6, state: 'Pennsylvania' }] },
  LAN: { label: 'Lancaster', areas: [{ name: 'Lancaster', adminLevel: 8 }, { name: 'Lancaster County', adminLevel: 6, state: 'Pennsylvania' }] },
  RDG: { label: 'Reading', areas: [{ name: 'Reading', adminLevel: 8 }, { name: 'Berks County', adminLevel: 6, state: 'Pennsylvania' }] },
  SCR: { label: 'Scranton / Wilkes-Barre', areas: [{ name: 'Scranton', adminLevel: 8 }, { name: 'Wilkes-Barre', adminLevel: 8 }, { name: 'Lackawanna County', adminLevel: 6, state: 'Pennsylvania' }] },
  YRK: { label: 'York', areas: [{ name: 'York', adminLevel: 8 }, { name: 'York County', adminLevel: 6, state: 'Pennsylvania' }] },
  SCE: { label: 'State College', areas: [{ name: 'State College', adminLevel: 8 }, { name: 'Centre County', adminLevel: 6, state: 'Pennsylvania' }] },
};

function parseArgs(argv) {
  const o = { market: 'PHL', areas: null, bbox: null, groups: [], target: 500, exclude: null, out: null, mix: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--market') o.market = String(argv[++i] || 'PHL').toUpperCase();
    else if (a === '--areas') o.areas = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--bbox') o.bbox = String(argv[++i] || '').trim();
    else if (a === '--groups') o.groups = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--target') o.target = parseInt(argv[++i], 10) || 500;
    else if (a === '--exclude') o.exclude = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--mix') o.mix = argv[++i];
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

/** Domains we must never pitch again: already built for, current clients, mailed. */
function buildExclusions(excludeFile) {
  const domains = new Set();
  const notes = [];

  const file = excludeFile || '_os/automation/fixtures/prospects/philly-100-completed.json';
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  const doc = readJson(abs, null);
  if (doc) {
    const rows = Array.isArray(doc) ? doc : doc.prospects || [];
    let n = 0;
    for (const r of rows) {
      const d = r.domain || normalizeDomain(r.website);
      if (d) {
        domains.add(d);
        n += 1;
      }
    }
    notes.push(`${n} domains from ${file}`);
  } else {
    notes.push(`WARNING: exclusion file not found: ${file}`);
  }

  const { suppressDomains } = buildSuppressSets(repoPath('01_Clients'));
  for (const d of suppressDomains) domains.add(d);
  notes.push(`${suppressDomains.size} client domains from 01_Clients/`);

  return { domains, notes };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const preset = MARKETS[args.market];
  if (!preset && !args.areas && !args.bbox) {
    console.error(`Unknown market "${args.market}". Known: ${Object.keys(MARKETS).join(', ')}`);
    console.error('Or pass --areas "Name,Name" / --bbox "s,w,n,e".');
    process.exit(1);
  }

  const areaSpecs = args.bbox
    ? [{ bbox: args.bbox, label: `bbox ${args.bbox}` }]
    : args.areas
      ? args.areas.map((name) => ({ name, adminLevel: 8 }))
      : preset.areas;

  const groups = args.groups.length ? args.groups : Object.keys(VERTICAL_GROUPS);
  const unknownGroups = groups.filter((g) => !VERTICAL_GROUPS[g]);
  if (unknownGroups.length) {
    console.error(`Unknown vertical group(s): ${unknownGroups.join(', ')}`);
    console.error(`Known: ${Object.keys(VERTICAL_GROUPS).join(', ')}`);
    process.exit(1);
  }

  const { domains: excludeDomains, notes: exclusionNotes } = buildExclusions(args.exclude);
  process.stderr.write(`exclusions: ${exclusionNotes.join('; ')}\n`);
  process.stderr.write(
    `market ${args.market}${preset ? ` (${preset.label})` : ''} · ` +
    `${areaSpecs.length} area(s) · ${groups.length} vertical group(s) · target ${args.target}\n`
  );

  const all = new Map();
  const perArea = [];
  const totals = { raw: 0, chain: 0, non_site_domain: 0, excluded_already_done: 0, duplicate_domain: 0 };

  for (const spec of areaSpecs) {
    if (all.size >= args.target) {
      perArea.push({ area: spec.name || spec.label, skipped: 'target already met' });
      continue;
    }
    const label = spec.name || spec.label;
    const query = buildQuery(spec, groups);
    process.stderr.write(`  querying ${label} … `);
    const res = await runOverpass(query);
    if (!res.ok) {
      process.stderr.write(`FAILED (${res.error})\n`);
      perArea.push({ area: label, error: res.error, kept: 0 });
      continue;
    }

    const { candidates, stats } = toCandidates(res.elements, { excludeDomains, market: args.market });
    let added = 0;
    for (const c of candidates) {
      if (all.has(c.domain)) {
        totals.duplicate_domain += 1;
        continue;
      }
      all.set(c.domain, { ...c, area: label });
      added += 1;
    }
    for (const k of Object.keys(totals)) if (stats[k] != null) totals[k] += stats[k];
    perArea.push({ area: label, raw: stats.raw, kept: added, stats });
    process.stderr.write(`${stats.raw} raw → ${added} new (running total ${all.size})\n`);
  }

  // Priority order: high-fit verticals first, then businesses with a phone on
  // record, so a truncated pull keeps the best candidates.
  const ranked = [...all.values()].sort(
    (a, b) => (a.vertical_weight - b.vertical_weight) || (b.phone ? 1 : 0) - (a.phone ? 1 : 0)
  );

  // Without a mix, raw priority order alone hands you whatever the source is
  // richest in — for Philadelphia that is restaurants, which is the exact skew
  // Market Roster.md says to invert. `--mix` caps each vertical group so a batch
  // reflects what Momentum actually sells.
  let candidates;
  if (args.mix) {
    const caps = new Map();
    for (const pair of args.mix.split(',')) {
      const [g, n] = pair.split(':').map((s) => s.trim());
      if (!g) continue;
      if (!VERTICAL_GROUPS[g] && g !== 'other') {
        console.error(`--mix references unknown vertical group "${g}"`);
        process.exit(1);
      }
      caps.set(g, parseInt(n, 10) || 0);
    }
    const taken = new Map();
    candidates = [];
    for (const c of ranked) {
      if (candidates.length >= args.target) break;
      const cap = caps.has(c.vertical_group) ? caps.get(c.vertical_group) : 0;
      const used = taken.get(c.vertical_group) || 0;
      if (used >= cap) continue;
      taken.set(c.vertical_group, used + 1);
      candidates.push(c);
    }
    const shortfalls = [...caps.entries()]
      .map(([g, cap]) => [g, cap, taken.get(g) || 0])
      .filter(([, cap, got]) => got < cap);
    if (shortfalls.length) {
      process.stderr.write(
        `  mix shortfall (source did not have enough): ` +
        shortfalls.map(([g, cap, got]) => `${g} ${got}/${cap}`).join(', ') + '\n'
      );
    }
  } else {
    candidates = ranked.slice(0, args.target);
  }

  const byGroup = candidates.reduce((acc, c) => {
    acc[c.vertical_group] = (acc[c.vertical_group] || 0) + 1;
    return acc;
  }, {});

  // Never report success on an empty pull. If every area query failed, that is
  // an error to surface loudly — a silent zero reads like "this market is dry"
  // when the real cause is a broken query or a rate-limited endpoint.
  const areaErrors = perArea.filter((a) => a.error);
  const allFailed = areaErrors.length > 0 && areaErrors.length === perArea.filter((a) => !a.skipped).length;

  const summary = {
    automation_id: AUTOMATION_ID,
    started_at: nowISO(),
    status: allFailed ? 'error' : candidates.length === 0 ? 'empty' : 'ok',
    errors: areaErrors.map((a) => `${a.area}: ${a.error}`),
    market: args.market,
    market_label: preset ? preset.label : (args.areas || []).join(', ') || args.bbox,
    target: args.target,
    discovered: candidates.length,
    unique_before_target_cut: all.size,
    by_vertical_group: byGroup,
    filtered_out: totals,
    exclusion_domains: excludeDomains.size,
    per_area: perArea,
    dry_run: !!args.dryRun,
  };

  process.stderr.write(
    `\ndiscovered ${candidates.length} candidate(s) · ` +
    `filtered: ${totals.chain} chains, ${totals.non_site_domain} social/directory-only, ` +
    `${totals.excluded_already_done} already built, ${totals.duplicate_domain} duplicate domains\n`
  );

  if (args.dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const outFile = args.out
    ? (path.isAbsolute(args.out) ? args.out : repoPath(args.out))
    : repoPath(path.join('12_Brain/state/candidates', `${args.market.toLowerCase()}-${todayISO()}.json`));
  ensureDir(path.dirname(outFile));
  writeJson(outFile, {
    _readme:
      'Discovered prospect candidates from OpenStreetMap. Nothing here is qualified or ' +
      'outbound-ready — feed it to bin/grade-sites.js, then a human approves any send.',
    ...summary,
    // This file is committed and the repo is public: no street addresses, phone
    // numbers or coordinates. See sanitizeForGit() for why.
    prospects: sanitizeForGit(candidates),
  });

  const stateFile = writeRunState(AUTOMATION_ID, summary);
  console.log(
    JSON.stringify(
      {
        status: summary.status,
        market: args.market,
        discovered: candidates.length,
        by_vertical_group: byGroup,
        errors: summary.errors,
        out: path.relative(repoPath('.'), outFile),
        state: stateFile,
        next: `node _os/automation/bin/grade-sites.js --from ${path.relative(repoPath('.'), outFile)} --market ${args.market}`,
      },
      null,
      2
    )
  );
  if (summary.status === 'error') process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
