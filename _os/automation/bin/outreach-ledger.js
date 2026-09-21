#!/usr/bin/env node
'use strict';

/**
 * Stage 8 of the outreach engine: Learn. Reads every batch's prospects.csv and reports the
 * funnel that actually happened, sliced by market and vertical, so Stage 2 scoring has
 * evidence instead of intuition.
 *
 *   node _os/automation/bin/outreach-ledger.js [--json] [--selftest]
 *
 * Reports only what the CSVs contain. A stage with no data reports as "not measured", never
 * as zero conversion - the two mean different things and conflating them is how a working
 * channel gets killed. Rates are omitted entirely when the denominator is 0.
 *
 * Activation columns are optional and read if present, so the direct-mail lane (mailed_on,
 * scanned) and the email lane (emailed_on, replied, bounced) both land in one ledger.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir, writeJson, nowISO } = require('../lib/fsutil');

const BATCHES = '02_Campaigns/AI Site Builder Outreach Engine/batches';

/** Minimal RFC4180 parser: handles quoted fields and embedded commas/newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1)
    .filter((r) => r.some((v) => v.trim() !== ''))
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}

const truthy = (v) => v !== '' && !/^(hold|no|false|0|pending|n\/a)$/i.test(v);

/** Count a stage only when the column exists in the batch; else null = not measured. */
function tally(rows, column, predicate = truthy) {
  if (!rows.length || !(column in rows[0])) return null;
  return rows.filter((r) => predicate(r[column] || '')).length;
}

function funnel(rows) {
  return {
    built: rows.length,
    qa_ready: tally(rows, 'qa_ready', (v) => /^ready$/i.test(v)),
    approved: tally(rows, 'approved_by'),
    mailed: tally(rows, 'mailed_on'),
    emailed: tally(rows, 'emailed_on'),
    bounced: tally(rows, 'bounced'),
    scanned: tally(rows, 'scanned'),
    replied: tally(rows, 'replied'),
    call_booked: tally(rows, 'call_booked'),
  };
}

/** Rate only when the denominator is a real positive number. Nulls propagate. */
function rate(num, den) {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return null;
  return Number(((num / den) * 100).toFixed(1));
}

function sumFunnels(list) {
  const keys = Object.keys(funnel([]));
  const out = {};
  for (const k of keys) {
    const vals = list.map((f) => f[k]).filter((v) => Number.isFinite(v));
    out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  }
  return out;
}

function sliceBy(rows, column) {
  const groups = {};
  for (const r of rows) {
    const key = (r[column] || '').trim() || '(unspecified)';
    (groups[key] = groups[key] || []).push(r);
  }
  return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, funnel(v)]));
}

function collect() {
  const dir = repoPath(BATCHES);
  if (!fs.existsSync(dir)) return { batches: [], rows: [] };
  const batches = [];
  const rows = [];
  for (const id of fs.readdirSync(dir).sort()) {
    const csv = path.join(dir, id, 'prospects.csv');
    if (!fs.existsSync(csv)) continue;
    const parsed = parseCsv(fs.readFileSync(csv, 'utf8'));
    batches.push({ batch_id: id, funnel: funnel(parsed) });
    rows.push(...parsed);
  }
  return { batches, rows };
}

function build() {
  const { batches, rows } = collect();
  const totals = sumFunnels(batches.map((b) => b.funnel));
  const reached = Number.isFinite(totals.emailed) || Number.isFinite(totals.mailed)
    ? (totals.emailed || 0) + (totals.mailed || 0)
    : null;
  return {
    generated_at: nowISO(),
    batches_with_data: batches.length,
    prospects_built: totals.built || 0,
    totals,
    reached,
    rates: {
      qa_pass_pct: rate(totals.qa_ready, totals.built),
      approved_of_ready_pct: rate(totals.approved, totals.qa_ready),
      activated_of_approved_pct: rate(reached, totals.approved),
      reply_of_emailed_pct: rate(totals.replied, totals.emailed),
      bounce_of_emailed_pct: rate(totals.bounced, totals.emailed),
      call_of_reached_pct: rate(totals.call_booked, reached),
    },
    by_market: sliceBy(rows, 'market'),
    by_vertical: sliceBy(rows, 'vertical'),
    batches,
  };
}

const show = (v) => (v === null ? 'not measured' : String(v));
const pct = (v) => (v === null ? 'n/a' : `${v}%`);
const reach = (f) => show(f.emailed === null ? f.mailed : f.emailed);

function bottleneckOf(l) {
  if (l.totals.approved === null || l.totals.approved === 0) {
    return 'Stage 6 approval. Nothing has been approved, so no downstream number can exist yet.';
  }
  if (l.reached === 0) return 'Stage 7 activation. Prospects are approved but nothing has gone out.';
  if (l.totals.replied === null) {
    return 'Stage 8 measurement. Outreach has gone out but replies are not being recorded.';
  }
  return 'None. The funnel has data at every stage.';
}

function markdown(l) {
  const marketRows = Object.entries(l.by_market)
    .map(([k, f]) => `| ${k} | ${f.built} | ${show(f.approved)} | ${reach(f)} | ${show(f.call_booked)} |`)
    .join('\n');
  const verticalRows = Object.entries(l.by_vertical)
    .map(([k, f]) => `| ${k} | ${f.built} | ${show(f.approved)} | ${reach(f)} | ${show(f.call_booked)} |`)
    .join('\n');
  const batchRows = l.batches
    .map((b) => `| ${b.batch_id} | ${b.funnel.built} | ${show(b.funnel.qa_ready)} | ${show(b.funnel.approved)} | ${reach(b.funnel)} |`)
    .join('\n');

  return [
    '# Outreach ledger',
    '',
    `Generated: ${l.generated_at}`,
    '',
    'Stage 8 of [[Pipeline Spec]]. Counts come from each batch prospects.csv. "not measured"',
    'means the column does not exist yet, which is different from zero.',
    '',
    '## Funnel',
    '',
    '| Stage | Count |',
    '|---|---|',
    `| Sites built | ${l.prospects_built} |`,
    `| QA ready | ${show(l.totals.qa_ready)} |`,
    `| Approved | ${show(l.totals.approved)} |`,
    `| Mailed | ${show(l.totals.mailed)} |`,
    `| Emailed | ${show(l.totals.emailed)} |`,
    `| Bounced | ${show(l.totals.bounced)} |`,
    `| Scanned | ${show(l.totals.scanned)} |`,
    `| Replied | ${show(l.totals.replied)} |`,
    `| Calls booked | ${show(l.totals.call_booked)} |`,
    '',
    '## Rates',
    '',
    '| Rate | Value |',
    '|---|---|',
    `| QA pass of built | ${pct(l.rates.qa_pass_pct)} |`,
    `| Approved of QA ready | ${pct(l.rates.approved_of_ready_pct)} |`,
    `| Activated of approved | ${pct(l.rates.activated_of_approved_pct)} |`,
    `| Reply of emailed | ${pct(l.rates.reply_of_emailed_pct)} |`,
    `| Bounce of emailed | ${pct(l.rates.bounce_of_emailed_pct)} |`,
    `| Call of reached | ${pct(l.rates.call_of_reached_pct)} |`,
    '',
    `**Current bottleneck:** ${bottleneckOf(l)}`,
    '',
    '## By market',
    '',
    '| Market | Built | Approved | Reached | Calls |',
    '|---|---|---|---|---|',
    marketRows,
    '',
    '## By vertical',
    '',
    '| Vertical | Built | Approved | Reached | Calls |',
    '|---|---|---|---|---|',
    verticalRows,
    '',
    '## Batches',
    '',
    '| Batch | Built | QA ready | Approved | Reached |',
    '|---|---|---|---|---|',
    batchRows,
    '',
  ].join('\n');
}

function selftest() {
  const assert = require('assert');
  const csv = 'prospect_id,business,market,vertical,qa_ready,approved_by,emailed_on,replied,call_booked\n'
    + 'P1,"Acme, Inc.",Erie,hvac,ready,mac,2026-09-01,yes,yes\n'
    + 'P2,Beta Co,Erie,hvac,ready,mac,2026-09-01,,\n'
    + 'P3,Gamma,Philadelphia,legal,hold,,,,\n';
  const rows = parseCsv(csv);
  assert.strictEqual(rows.length, 3, 'three data rows');
  assert.strictEqual(rows[0].business, 'Acme, Inc.', 'quoted comma survives');
  const f = funnel(rows);
  assert.strictEqual(f.built, 3);
  assert.strictEqual(f.qa_ready, 2, 'only ready counts');
  assert.strictEqual(f.approved, 2, 'blank approver is not approved');
  assert.strictEqual(f.emailed, 2);
  assert.strictEqual(f.replied, 1);
  assert.strictEqual(f.mailed, null, 'absent column is not measured, not zero');
  assert.strictEqual(rate(1, 2), 50);
  assert.strictEqual(rate(1, 0), null, 'no rate without a denominator');
  assert.strictEqual(rate(5, null), null);
  const held = parseCsv('prospect_id,mail_ready\nP1,hold\nP2,2026-09-01\n');
  assert.strictEqual(tally(held, 'mail_ready'), 1, 'hold does not count as activated');
  assert.strictEqual(sumFunnels([{ qa_ready: null }, { qa_ready: 3 }]).qa_ready, 3);
  assert.strictEqual(sumFunnels([{ qa_ready: null }, { qa_ready: null }]).qa_ready, null);
  console.log('outreach-ledger selftest: ok');
}

function main() {
  if (process.argv.includes('--selftest')) return selftest();
  const ledger = build();
  writeJson(repoPath('12_Brain/state/outreach-ledger.json'), ledger);
  const md = repoPath('Daily-Briefs/outreach-ledger.md');
  ensureDir(path.dirname(md));
  fs.writeFileSync(md, markdown(ledger), 'utf8');
  const summary = {
    status: 'ok',
    batches: ledger.batches_with_data,
    built: ledger.prospects_built,
    reached: ledger.reached,
    bottleneck: bottleneckOf(ledger),
    state: '12_Brain/state/outreach-ledger.json',
    report: 'Daily-Briefs/outreach-ledger.md',
  };
  console.log(JSON.stringify(process.argv.includes('--json') ? ledger : summary, null, 2));
  return undefined;
}

if (require.main === module) main();
module.exports = { parseCsv, funnel, rate, sumFunnels, tally };
