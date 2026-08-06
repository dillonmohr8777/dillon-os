#!/usr/bin/env node
'use strict';

/**
 * Grade a whole list and split it into outreach lanes. This is the "List >
 * Grader" stage: a large list in, a ranked outreach set out, and an explicit
 * hands-off set that never gets contacted.
 *
 *   node _os/automation/bin/grade-list.js --from 08_Prospects/philly-100/roster.json
 *   node _os/automation/bin/grade-list.js --from roster.json --take 25 --render
 *   node _os/automation/bin/grade-list.js --from roster.json --resume    # reuse cached grades
 *
 * Accepts a JSON array, a { prospects: [...] } wrapper, or a CSV with a
 * business_name and website column.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, todayISO, nowISO, slugify } = require('../lib/fsutil');
const { gradeList, PASS } = require('../lib/grader');
const { buildSuppressSets } = require('../lib/clients');
const { writeRunState, enqueue } = require('../lib/registry');

const CACHE = repoPath('_os/automation/state/grader-cache.json');
const OVERRIDES = repoPath('12_Brain/state/grader-overrides.json');

function parseArgs(argv) {
  const out = {
    from: null,
    out: null,
    take: null,
    maxPass: PASS.STATIC,
    concurrency: 4,
    resume: false,
    json: false,
    writeNotes: false,
    clientsRoot: repoPath('01_Clients'),
    label: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from') out.from = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--take') out.take = Number(argv[++i]);
    else if (a === '--max-pass') out.maxPass = Number(argv[++i]);
    else if (a === '--render') out.maxPass = PASS.RENDER;
    else if (a === '--concurrency') out.concurrency = Math.max(1, Math.min(8, Number(argv[++i])));
    else if (a === '--resume') out.resume = true;
    else if (a === '--json') out.json = true;
    else if (a === '--notes') out.writeNotes = true;
    else if (a === '--clients-root') out.clientsRoot = argv[++i];
    else if (a === '--label') out.label = argv[++i];
  }
  return out;
}

function parseCsv(text) {
  const rows = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return rows;
  const split = (line) => {
    const cells = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quoted) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') quoted = false;
        else cur += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
    cells.push(cur);
    return cells.map((s) => s.trim());
  };
  const header = split(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
  for (const line of lines.slice(1)) {
    const cells = split(line);
    const row = {};
    header.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function normalizeTargets(doc) {
  const rows = Array.isArray(doc) ? doc : Array.isArray(doc.prospects) ? doc.prospects : [];
  return rows.map((r, i) => ({
    prospect_id: r.prospect_id || r.id || `row-${i + 1}`,
    business_name: r.business_name || r.business || r.name || null,
    slug: r.slug || slugify(r.business_name || r.business || r.name || `row-${i + 1}`),
    batch: r.batch || null,
    vertical: r.vertical || r.category || '',
    market: r.market || '',
    website: r.website || r.site || r.url || r.website_other || null,
    candidate_urls: r.candidate_urls || [],
    evidence_urls: r.evidence_urls || [],
    review_count: r.review_count != null && r.review_count !== '' ? Number(r.review_count) : null,
    rating: r.rating != null && r.rating !== '' ? Number(r.rating) : null,
    ad_presence: r.ad_presence === true || r.ad_presence === 'true' || undefined,
    multi_location: r.multi_location === true || r.multi_location === 'true' || undefined,
    has_phone: r.has_phone === true || Boolean(r.phone) || Boolean(r.number),
    public_email_count: Number(r.public_email_count || 0) || (r.email ? 1 : 0),
    hiring_signal: r.hiring_signal || null,
  }));
}

const LANE_ORDER = ['build', 'rebuild', 'refresh', 'enrich', 'adjacent', 'hands_off', 'park', 'manual', 'suppressed'];

function summarize(results) {
  const byLane = {};
  for (const lane of LANE_ORDER) byLane[lane] = [];
  for (const r of results) (byLane[r.lane] = byLane[r.lane] || []).push(r);
  return byLane;
}

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(file, results) {
  const header = [
    'prospect_id', 'business_name', 'batch', 'vertical', 'url_graded', 'state',
    'signal', 'band', 'confidence', 'viability', 'lane', 'priority',
    'pitch_website', 'outreach_eligible', 'why', 'top_gap_1', 'top_gap_2', 'top_gap_3', 'graded_at', 'expires',
  ];
  const lines = [header.join(',')];
  for (const r of results) {
    const gaps = (r.signal?.top_gaps || []).map((g) => `${g.label}: ${g.evidence}`);
    lines.push(
      [
        r.prospect_id, r.business_name, r.batch, r.vertical, r.url_graded, r.state,
        r.signal?.score ?? '', r.signal?.band ?? '', r.signal?.confidence ?? '', r.viability.score,
        r.lane, r.priority, r.pitch_website, r.outreach_eligible, r.why,
        gaps[0] || '', gaps[1] || '', gaps[2] || '', r.graded_at, r.expires,
      ].map(csvEscape).join(',')
    );
  }
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function report(byLane, results, meta) {
  const L = [];
  const n = results.length;
  L.push('');
  L.push(`  GRADED ${n} PROSPECTS   weights ${meta.weightsVersion}   ${meta.label || todayISO()}`);
  L.push(`  ${'═'.repeat(64)}`);
  L.push('');
  L.push('  LANE                              COUNT   SHARE   PITCH A WEBSITE?');
  for (const lane of LANE_ORDER) {
    const rows = byLane[lane] || [];
    if (!rows.length) continue;
    const pitch = rows[0].pitch_website === true ? 'yes' : rows[0].pitch_website === false ? 'no' : 'unknown';
    L.push(`  ${rows[0].lane_label.padEnd(34)}${String(rows.length).padStart(4)}   ${String(Math.round((rows.length / n) * 100)).padStart(4)}%   ${pitch}`);
  }
  const eligible = results.filter((r) => r.outreach_eligible);
  L.push('');
  L.push(`  Outreach eligible: ${eligible.length} of ${n}. Held back: ${n - eligible.length}.`);

  const held = [...(byLane.hands_off || []), ...(byLane.adjacent || [])].sort((a, b) => (b.signal?.score || 0) - (a.signal?.score || 0));
  if (held.length) {
    L.push('');
    L.push('  DO NOT PITCH A WEBSITE — their site is already good enough');
    L.push(`  ${'─'.repeat(64)}`);
    for (const r of held.slice(0, 30)) {
      L.push(`  ${String(r.signal?.score ?? '--').padStart(3)}  ${(r.business_name || r.slug).slice(0, 40).padEnd(42)}${r.lane}`);
    }
    if (held.length > 30) L.push(`  … and ${held.length - 30} more`);
  }

  const queue = eligible.sort((a, b) => b.priority - a.priority);
  if (queue.length) {
    L.push('');
    L.push(`  OUTREACH QUEUE, ranked${meta.take ? ` (top ${meta.take} shown)` : ''}`);
    L.push(`  ${'─'.repeat(72)}`);
    L.push('  PRI  SIG  VIA  LANE      BUSINESS                                  LEAD WITH');
    for (const r of queue.slice(0, meta.take || 40)) {
      const gap = r.signal?.top_gaps?.[0] ? r.signal.top_gaps[0].evidence : r.state_reason || '';
      L.push(
        `  ${String(r.priority).padStart(3)}  ${String(r.signal?.score ?? '--').padStart(3)}  ${String(r.viability.score).padStart(3)}  ${r.lane.padEnd(9)} ${(r.business_name || r.slug).slice(0, 40).padEnd(41)} ${gap.slice(0, 44)}`
      );
    }
  }

  const manual = byLane.manual || [];
  if (manual.length) {
    L.push('');
    L.push('  NEEDS A HUMAN — the grader refused to guess');
    L.push(`  ${'─'.repeat(64)}`);
    for (const r of manual) L.push(`  ${(r.business_name || r.slug).slice(0, 40).padEnd(42)}${r.why}`);
  }
  L.push('');
  return L.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.from) {
    console.error('Usage: node grade-list.js --from <roster.json|roster.csv> [--take 25] [--render] [--resume] [--out <dir>] [--notes] [--json]');
    process.exit(1);
  }

  const absFrom = path.isAbsolute(args.from) ? args.from : repoPath(args.from);
  if (!fs.existsSync(absFrom)) {
    console.error(`No such file: ${absFrom}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(absFrom, 'utf8');
  const doc = absFrom.endsWith('.csv') ? parseCsv(raw) : JSON.parse(raw);
  const targets = normalizeTargets(doc);
  if (!targets.length) {
    console.error('No prospect rows found in the input.');
    process.exit(1);
  }

  const { suppressIds, suppressDomains } = buildSuppressSets(args.clientsRoot);
  const overrides = readJson(OVERRIDES, { overrides: {} }).overrides || {};
  const cache = args.resume ? readJson(CACHE, { entries: {} }).entries || {} : {};

  const started = nowISO();
  let done = 0;
  const fresh = [];
  const withOverrides = await gradeList(targets, {
    maxPass: args.maxPass,
    concurrency: args.concurrency,
    suppressIds,
    suppressDomains,
    overrides,
    onResult: (r) => {
      done++;
      if (!args.json) process.stderr.write(`\r  grading ${done}/${targets.length}  ${(r.business_name || r.slug || '').slice(0, 34).padEnd(34)}`);
    },
  });
  if (!args.json) process.stderr.write('\r' + ' '.repeat(60) + '\r');

  for (const r of withOverrides) {
    cache[r.prospect_id] = { fingerprint: r.fingerprint, graded_at: r.graded_at, signal: r.signal?.score ?? null, lane: r.lane, expires: r.expires };
    fresh.push(r);
    if (r.outreach_eligible) {
      enqueue('site-grader', 'enqueue_outreach_candidate', {
        prospect_id: r.prospect_id,
        business_name: r.business_name,
        lane: r.lane,
        signal: r.signal?.score ?? null,
        viability: r.viability.score,
        priority: r.priority,
        url: r.url_graded,
      });
    }
  }
  writeJson(CACHE, { updated: nowISO(), weights_version: withOverrides[0]?.weights_version, entries: cache });

  const byLane = summarize(withOverrides);
  const outDir = args.out ? (path.isAbsolute(args.out) ? args.out : repoPath(args.out)) : path.dirname(absFrom);
  const stem = path.basename(absFrom).replace(/\.(json|csv)$/i, '');
  writeJson(path.join(outDir, `${stem}-graded.json`), {
    graded_at: todayISO(),
    started_at: started,
    weights_version: withOverrides[0]?.weights_version,
    source: path.relative(repoPath('.'), absFrom),
    max_pass: args.maxPass,
    counts: Object.fromEntries(LANE_ORDER.map((l) => [l, (byLane[l] || []).length])),
    results: withOverrides,
  });
  writeCsv(path.join(outDir, `${stem}-graded.csv`), withOverrides);

  const summary = {
    automation_id: 'site-grader',
    started_at: started,
    status: 'ok',
    dry_run: false,
    source: path.relative(repoPath('.'), absFrom),
    weights_version: withOverrides[0]?.weights_version,
    counts: {
      total: withOverrides.length,
      ...Object.fromEntries(LANE_ORDER.map((l) => [l, (byLane[l] || []).length])),
      outreach_eligible: withOverrides.filter((r) => r.outreach_eligible).length,
    },
    outreach_queue: withOverrides
      .filter((r) => r.outreach_eligible)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, args.take || 25)
      .map((r) => ({ prospect_id: r.prospect_id, business_name: r.business_name, lane: r.lane, signal: r.signal?.score ?? null, viability: r.viability.score, priority: r.priority })),
    do_not_pitch: withOverrides
      .filter((r) => r.pitch_website === false && r.lane !== 'suppressed' && r.lane !== 'park')
      .map((r) => ({ prospect_id: r.prospect_id, business_name: r.business_name, signal: r.signal?.score ?? null, lane: r.lane, reason: r.why })),
  };
  writeRunState('site-grader', summary);

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(report(byLane, withOverrides, { weightsVersion: summary.weights_version, take: args.take, label: args.label }));
    console.log(`  Wrote ${path.relative(repoPath('.'), path.join(outDir, `${stem}-graded.json`))} and .csv`);
    console.log(`  Run state: 12_Brain/state/site-grader.json`);
    console.log('');
  }
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
