#!/usr/bin/env node
/**
 * Dillon OS kanban — a read-only board over the vault's own state files.
 *
 *   node _os/kanban/server.js            serve on http://127.0.0.1:4717
 *   node _os/kanban/server.js --port N   pick a port
 *   node _os/kanban/server.js --json     print the board JSON once and exit
 *   node _os/kanban/server.js --selftest parser assertions against fixtures + the live queue
 *
 * The vault's files ARE the database. This process never writes anything
 * under the vault; it reads five sources and joins them:
 *
 *   System/approval-queue.md                      -> awaiting  (approval cards)
 *   _os/automation/cadence/{daily,weekly,monthly}.yaml -> scheduled (job cards)
 *   _os/automation/cadence/run-ledger.jsonl       -> done / failed (run cards)
 *   12_Brain/registry/automations.json + 12_Brain/state/<id>.json -> self-reports (automation cards)
 *   Windows Task Scheduler, root path only        -> scheduled / running / failed (task cards)
 *   12_Brain/state/daily-sweep.json               -> failed (the sweep's own stale/missing/lying verdicts)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const VAULT = path.resolve(__dirname, '..', '..');
const R = (...p) => path.join(VAULT, ...p);
const QUEUE = R('System', 'approval-queue.md');
const CADENCE_DIR = R('_os', 'automation', 'cadence');
const LEDGER = path.join(CADENCE_DIR, 'run-ledger.jsonl');
const STATE_DIR = R('12_Brain', 'state');
const REGISTRY = R('12_Brain', 'registry', 'automations.json');
const SWEEP = path.join(STATE_DIR, 'daily-sweep.json');

// Staleness rules already live in the vault; do not re-derive them here.
const { staleAfterHours } = require('../automation/bin/queue-status.js');

const DAY = 86400000;
// Normalise CRLF: the queue is edited on Windows and JS `.` never matches `\r`, so `(.*)$` would miss every line.
const readText = (p) => { try { return fs.readFileSync(p, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n'); } catch { return null; } };
const readJson = (p) => { try { return JSON.parse(readText(p)); } catch { return null; } };
const mtime = (p) => { try { return fs.statSync(p).mtime.toISOString(); } catch { return null; } };
const hoursAgo = (iso) => { const t = Date.parse(iso); return Number.isFinite(t) ? (Date.now() - t) / 3.6e6 : null; };

// ------------------------------------------------------------ approval queue

/**
 * One card per `- [ ]` line. Two line shapes coexist in the file:
 *   - [ ] 2026-07-12 - Kimberly James Bridal - Approve ... - Risk: low
 *   - [ ] 2026-09-07 -- [Security / Tock credential] -- Approve ... -- Source: X -- Evidence: "..." -- Risk: high
 * plus optional prefix annotations before the bracket ("RE-SCOPE BEFORE ACTIONING, flagged ...").
 * Indented lines that follow an item are its continuation notes (— VERIFIED ..., -- RE-PROBED ..., wrapped prose).
 */
function parseApprovalQueue(text) {
  const items = [];
  let section = '';
  let cur = null;
  text.split('\n').forEach((raw, i) => {
    const h = raw.match(/^##\s+(.*)/);
    if (h) { section = h[1].trim(); cur = null; return; }
    const m = raw.match(/^- \[( |x)\]\s*(?:(\d{4}-\d{2}-\d{2})\s*-{1,2}\s*)?(.*)$/);
    if (m) { cur = parseApprovalItem(m, i + 1, section); items.push(cur); return; }
    if (cur && /^\s{2,}\S/.test(raw)) { cur.notes.push(raw.trim()); return; }
    if (/^\S/.test(raw)) cur = null; // any other top-level line ends the item
  });
  return items;
}

function parseApprovalItem([, box, date, body], line, section) {
  const it = {
    type: 'approval', id: `aq-${line}`, line, section, date: date || null, done: box === 'x',
    risk: null, category: null, client: null, prefix: null, title: '', source: null, evidence: null,
    notes: [], raw: body,
  };
  let b = body;
  const risk = b.match(/\s-{1,2}\s*Risk:\s*(\w+)\s*$/i);
  if (risk) { it.risk = risk[1].toLowerCase().replace(/^med$/, 'medium'); b = b.slice(0, risk.index); }
  const ev = b.match(/\s--\s*Evidence:\s*([\s\S]*)$/);
  if (ev) { it.evidence = ev[1].trim(); b = b.slice(0, ev.index); }
  const src = b.match(/\s--\s*Source:\s*([\s\S]*)$/);
  if (src) { it.source = src[1].trim(); b = b.slice(0, src.index); }
  const cat = b.match(/\[([^\]]+)\]/);
  if (cat) {
    it.category = cat[1].trim();
    const before = b.slice(0, cat.index).replace(/\s*-{1,2}\s*$/, '').trim();
    if (before) it.prefix = before;
    it.title = b.slice(cat.index + cat[0].length).replace(/^\s*-{1,2}\s*/, '').trim();
  } else {
    const parts = b.split(/\s-\s/);
    it.client = parts[0].trim();
    it.title = parts.slice(1).join(' - ').trim() || it.client;
  }
  it.ageDays = it.date ? Math.floor((Date.now() - Date.parse(it.date)) / DAY) : null;
  it.rotting = !it.done && it.ageDays !== null && it.ageDays > 14; // same rule as the approval-queue-diff job
  it.column = it.done ? 'done' : 'awaiting';
  return it;
}

// ------------------------------------------------------- cadence manifests

// ponytail: not a YAML parser. Reads exactly the flat shape cadence/README.md
// documents (`- id:` items, 4-space `key: value`, `key: |` block scalars).
// Swap for js-yaml the day a manifest needs nesting.
function parseManifest(text, cadence) {
  const jobs = [];
  let cur = null;
  let block = null;
  for (const raw of text.split('\n')) {
    if (/^\s*#/.test(raw) || !raw.trim()) continue;
    const item = raw.match(/^\s*-\s+id:\s*(\S+)/);
    if (item) { cur = { id: item[1], cadence }; jobs.push(cur); block = null; continue; }
    if (!cur) continue;
    const kv = raw.match(/^\s{4}(\w+):\s*(.*)$/);
    if (kv) {
      const [, k, v] = kv;
      if (v === '|' || v === '>') { block = k; cur[k] = ''; } else { block = null; cur[k] = v.trim(); }
      continue;
    }
    if (block) cur[block] += raw.trim() + ' ';
  }
  for (const j of jobs) {
    j.enabled = String(j.enabled) !== 'false';
    for (const k of ['accept', 'prompt']) if (j[k]) j[k] = j[k].trim();
  }
  return jobs;
}

function loadManifests() {
  return ['daily', 'weekly', 'monthly'].flatMap((c) => {
    const t = readText(path.join(CADENCE_DIR, `${c}.yaml`));
    return t ? parseManifest(t, c) : [];
  });
}

// ------------------------------------------------------------------ ledger

function readLedger() {
  return (readText(LEDGER) || '').split('\n').filter(Boolean).map((l, i) => {
    try { return { ...JSON.parse(l), _line: i + 1 }; }
    catch { return { _line: i + 1, ts: null, cadence: null, job: '__unparseable__', status: 'failed', artifact: null, note: l.slice(0, 160) }; }
  });
}

/** Done/failed cards: one per (job, day), so the hourly daily-sweep rows collapse to one card a day. */
function runCards(rows, days) {
  const cutoff = Date.now() - days * DAY;
  const groups = new Map();
  for (const r of rows) {
    const t = Date.parse(r.ts);
    if (!(t >= cutoff)) continue;
    const day = String(r.ts).slice(0, 10);
    const key = `${r.job}|${day}`;
    const g = groups.get(key) || { type: 'run', id: `run-${key}`, job: r.job, day, cadence: r.cadence, runs: 0, statuses: {}, latest: null };
    g.runs++;
    g.statuses[r.status] = (g.statuses[r.status] || 0) + 1;
    if (!g.latest || t > Date.parse(g.latest.ts)) g.latest = r;
    groups.set(key, g);
  }
  return [...groups.values()].map((g) => {
    const a = g.latest.artifact;
    g.artifactMissing = g.latest.status === 'ok' && !!a && !fs.existsSync(R(a));
    g.column = g.latest.status === 'failed' || g.artifactMissing || g.statuses.failed ? 'failed' : 'done';
    g.flag = g.artifactMissing ? `ledger names ${a} but it is not on disk`
      : g.statuses.failed ? `${g.statuses.failed} failed run(s) this day` : null;
    return g;
  }).sort((a, b) => Date.parse(b.latest.ts) - Date.parse(a.latest.ts));
}

/** Scheduled cards: each manifest job, with its latest ledger row and the Task Scheduler entry that drives its cadence. */
function jobCards(manifests, rows, tasks) {
  const latest = {};
  for (const r of rows) {
    if (!r.ts) continue;
    if (!latest[r.job] || Date.parse(r.ts) > Date.parse(latest[r.job].ts)) latest[r.job] = r;
  }
  const budgetDays = { daily: 1, weekly: 7, monthly: 31 };
  return manifests.map((j) => {
    const last = latest[j.id] || null;
    const task = tasks.find((t) => t.name.toLowerCase() === `cadence-${j.cadence}`) || null;
    const ageDays = last ? (Date.now() - Date.parse(last.ts)) / DAY : null;
    let column = 'scheduled';
    let flag = null;
    if (!j.enabled) flag = 'disabled in manifest';
    else if (last && last.status === 'failed') { column = 'failed'; flag = `last run failed: ${last.note || 'no note'}`; }
    else if (last && ageDays > budgetDays[j.cadence] * 1.5) { column = 'failed'; flag = `no ledger row in ${ageDays.toFixed(1)} days for a ${j.cadence} job`; }
    else if (!last) flag = 'never in the ledger';
    return {
      type: 'job', id: `job-${j.cadence}-${j.id}`, ...j, last, ageDays, column, flag,
      driver: task ? { name: task.name, state: task.state, next: task.next, neverFired: task.neverFired, missed: task.missed } : null,
    };
  });
}

// ------------------------------------------------------------- automations

function automationCards() {
  const reg = readJson(REGISTRY) || { automations: [], gates: {} };
  const cards = [];
  for (const a of reg.automations) {
    if (a.status === 'deprecated') continue;
    const file = path.join(STATE_DIR, `${a.id}.json`);
    const state = readJson(file);
    const periodic = /daily|weekly|monthly|hourly/i.test(String(a.cadence));
    if (!state) {
      if (periodic && /implemented|active/.test(a.status)) {
        cards.push({ type: 'automation', id: `auto-${a.id}`, automation: a, state: null, column: 'scheduled', flag: 'no self-report on disk', stateFile: null });
      }
      continue;
    }
    const stamp = state.generated_at || state.written_at || state.finished_at || state.started_at || state.updated_utc || mtime(file);
    const age = hoursAgo(stamp);
    const budget = staleAfterHours(a);
    const running = 'finished_at' in state && state.finished_at === null && age !== null && age < 24;
    const status = String(state.status || state.outcome || '').toLowerCase();
    let column = 'done';
    let flag = null;
    if (running) column = 'running';
    else if (/error|fail/.test(status)) { column = 'failed'; flag = `self-reported ${status}`; }
    else if (budget !== null && age !== null && age > budget) { column = 'failed'; flag = `stale: ${age.toFixed(1)} h old, budget ${budget} h`; }
    else if (/warn/.test(status)) flag = 'self-reported warn';
    cards.push({
      type: 'automation', id: `auto-${a.id}`, automation: a, column, flag,
      stateFile: path.relative(VAULT, file).replace(/\\/g, '/'),
      state: { status: state.status ?? state.outcome ?? null, stamp, ageHours: age === null ? null : Number(age.toFixed(1)), budgetHours: budget,
        summary: state.summary || state.verdict || state.note || null, counts: state.counts || state.run || null,
        errors: (state.run && state.run.errors) || state.errors || null },
    });
  }
  return { cards, gates: reg.gates || {} };
}

// ---------------------------------------------------------- task scheduler

// Only root-path tasks (\) are user-registered; \Microsoft\* is OS noise.
const PS_TASKS = "Get-ScheduledTask -TaskPath '\\' | ForEach-Object { $i = $_ | Get-ScheduledTaskInfo; " +
  "[pscustomobject]@{ name=$_.TaskName; state=[string]$_.State; desc=$_.Description; " +
  "last=$i.LastRunTime.ToString('o'); result=$i.LastTaskResult; " +
  "next=$(if ($i.NextRunTime) { $i.NextRunTime.ToString('o') } else { $null }); missed=$i.NumberOfMissedRuns } } | ConvertTo-Json -Compress";

const RESULT_CODES = {
  0: ['ok', 'ok'], 1: ['failed', 'exit 1'], 2: ['warn', 'exit 2 (a script reporting bad news, e.g. daily-sweep)'],
  267008: ['info', 'ready, not yet run'], 267009: ['info', 'currently running'], 267010: ['info', 'disabled'],
  267011: ['info', 'never run'], 267012: ['info', 'no more scheduled runs'], 267014: ['warn', 'terminated by user'],
  267015: ['failed', 'no valid triggers'], 2147750687: ['failed', 'already running'], 2147943645: ['failed', 'user not logged on'],
  2147946720: ['failed', 'operator or administrator refused the request'],
};
function decodeResult(code) {
  if (code in RESULT_CODES) return RESULT_CODES[code];
  if (code > 0 && code < 256) return ['warn', `exit ${code}`];
  return ['failed', `0x${(code >>> 0).toString(16).toUpperCase()}`];
}

let taskCache = { at: 0, tasks: [], probe: null };
function scheduledTasks(ttlMs = 60000) {
  if (process.platform !== 'win32') return { tasks: [], probe: { ok: false, error: 'Task Scheduler probe is Windows-only' } };
  if (Date.now() - taskCache.at < ttlMs) return taskCache;
  const t0 = Date.now();
  try {
    const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', PS_TASKS], { encoding: 'utf8', timeout: 45000 });
    const raw = JSON.parse(out);
    const tasks = (Array.isArray(raw) ? raw : [raw]).map((t) => {
      const neverFired = !t.last || t.last.startsWith('1999-');
      const [verdict, resultText] = decodeResult(Number(t.result));
      const disabled = t.state === 'Disabled';
      let column = 'scheduled';
      let flag = null;
      if (t.state === 'Running') column = 'running';
      else if (disabled) flag = 'disabled';
      else if (verdict === 'failed') { column = 'failed'; flag = `last result ${resultText}`; }
      else if (t.missed > 0) { column = 'failed'; flag = `${t.missed} missed run(s)`; }
      else if (neverFired) flag = 'registered, never fired';
      else if (verdict === 'warn') flag = `last result ${resultText}`;
      return { type: 'task', id: `task-${t.name}`, name: t.name, desc: t.desc || null, state: t.state, disabled, last: neverFired ? null : t.last,
        result: Number(t.result), resultText, verdict, next: t.next, missed: t.missed, neverFired, column, flag };
    });
    taskCache = { at: Date.now(), tasks, probe: { ok: true, elapsedMs: Date.now() - t0, count: tasks.length } };
  } catch (e) {
    taskCache = { at: Date.now(), tasks: [], probe: { ok: false, elapsedMs: Date.now() - t0, error: String(e.message || e).slice(0, 300) } };
  }
  return taskCache;
}

// ------------------------------------------------------------- sweep verdicts

/** The sweep already decided what is stale, missing, absent or lying. Surface those, do not recompute them. */
function sweepCards() {
  const s = readJson(SWEEP);
  if (!s) return [{ type: 'sweep', id: 'sweep-missing', title: 'daily-sweep.json is missing', detail: 'node _os/automation/bin/daily-sweep.js has never written state', column: 'failed' }];
  const cards = [];
  const add = (id, title, detail) => cards.push({ type: 'sweep', id: `sweep-${id}`, title, detail, column: 'failed', sweptAt: s.generated_at });
  for (const f of s.freshness || []) if (f.state !== 'fresh') add(`fresh-${f.id}`, `${f.state}: ${f.path}`, `${f.age_hours ?? 'no'} h old, budget ${f.budget_hours} h. Owner: ${f.owner}`);
  for (const d of (s.cadence && s.cadence.days_with_no_ledger_entry) || []) add(`absent-${d}`, `no cadence ledger entry on ${d}`, 'the driver never ran that day');
  for (const l of (s.cadence && s.cadence.ledger_claims_missing_artifacts) || []) add(`lying-${l.job}-${l.ts}`, `ledger lies: ${l.job}`, `${l.artifact} claimed at ${l.ts} is not on disk`);
  for (const r of (s.run_history || []).filter((x) => x.status === 'MISSED').slice(-7)) add(`missed-${r.date}`, `sweep MISSED ${r.date}`, 'no sweep ran that day');
  for (const x of (s.silent && s.silent.suspect) || []) add(`silent-${x.counter}`, `suspect-silent counter: ${x.counter}`, `${x.previous} -> 0. ${x.verdict}`);
  const reg = s.cadence && s.cadence.scheduler && s.cadence.scheduler.registered;
  if (Array.isArray(reg) && reg.length === 0) add('unscheduled', 'cadence driver has no scheduled task', 'every run so far was hand-started');
  return cards;
}

// -------------------------------------------------------------------- board

const RISK_ORDER = { high: 0, medium: 1, low: 2 };

function board({ probeTasks = true, runDays = 3 } = {}) {
  const queueText = readText(QUEUE) || '';
  const approvals = parseApprovalQueue(queueText).filter((a) => !a.done)
    .sort((a, b) => (RISK_ORDER[a.risk] ?? 3) - (RISK_ORDER[b.risk] ?? 3) || String(a.date).localeCompare(String(b.date)));
  const ledger = readLedger();
  const { tasks, probe } = probeTasks ? scheduledTasks() : { tasks: [], probe: { ok: false, skipped: true } };
  const manifests = loadManifests();
  const jobs = jobCards(manifests, ledger, tasks);
  const runs = runCards(ledger, runDays);
  const { cards: autos, gates } = automationCards();
  const sweeps = sweepCards();
  const all = [...jobs, ...tasks.sort((a, b) => String(a.next || '9').localeCompare(String(b.next || '9'))), ...autos, ...sweeps, ...runs, ...approvals];
  const columns = { scheduled: [], running: [], failed: [], awaiting: [], done: [] };
  for (const c of all) (columns[c.column] || columns.failed).push(c);
  return {
    generated_at: new Date().toISOString(),
    vault: VAULT,
    sources: {
      'System/approval-queue.md': mtime(QUEUE),
      '_os/automation/cadence/run-ledger.jsonl': mtime(LEDGER),
      '12_Brain/registry/automations.json': mtime(REGISTRY),
      '12_Brain/state/daily-sweep.json': mtime(SWEEP),
      'Task Scheduler': probe,
    },
    counts: Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, v.length])),
    approvals: { open: approvals.length, rotting: approvals.filter((a) => a.rotting).length,
      byRisk: approvals.reduce((m, a) => { m[a.risk || 'unlabelled'] = (m[a.risk || 'unlabelled'] || 0) + 1; return m; }, {}) },
    gates,
    columns,
  };
}

// ------------------------------------------------------------------- server

function serve(port) {
  const html = () => readText(path.join(__dirname, 'index.html')) || '<p>index.html missing</p>';
  http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/board') {
      let body;
      try { body = JSON.stringify(board({ probeTasks: url.searchParams.get('tasks') !== '0' })); }
      catch (e) { res.writeHead(500, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ error: String(e.stack || e) })); }
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(body);
    }
    if (url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); return res.end(html()); }
    res.writeHead(404); res.end('not found');
  }).listen(port, '127.0.0.1', () => console.log(`kanban: http://127.0.0.1:${port}  (vault ${VAULT}, read-only)`));
}

// ----------------------------------------------------------------- selftest

function selftest() {
  const assert = require('assert');
  const q = parseApprovalQueue([
    '## Current client actions',
    '- [ ] 2026-07-12 - Kimberly James Bridal - Approve completion update after QA; verify first - Risk: low',
    '  — VERIFIED 2026-09-14, STAYS OPEN: still pending.',
    '## Operating actions',
    '- [ ] 2026-09-07 -- [Security / Tock credential] -- Approve sending the revocation -- Source: 12_Brain/07_Reviews/x -- Evidence: "drafted 2026-09-02 and never sent" -- Risk: high',
    '- [ ] 2026-09-08 -- RE-SCOPE BEFORE ACTIONING, flagged 2026-09-09: would create a second campaign. -- [Onsite Concrete / Google Ads] -- Approve publish of draft 10207039555 -- Source: 01_Clients/Onsite Concrete/Agent Memory.md -- Evidence: "human security confirmation" -- Risk: high',
    '- [x] 2026-09-01 -- [Done thing] -- closed -- Risk: med',
    '- D11 deck: not a checkbox, must be ignored',
  ].join('\n'));
  assert.strictEqual(q.length, 4);
  assert.deepStrictEqual([q[0].client, q[0].risk, q[0].section, q[0].notes.length], ['Kimberly James Bridal', 'low', 'Current client actions', 1]);
  assert.strictEqual(q[0].title, 'Approve completion update after QA; verify first');
  assert.deepStrictEqual([q[1].category, q[1].risk, q[1].source, q[1].evidence], ['Security / Tock credential', 'high', '12_Brain/07_Reviews/x', '"drafted 2026-09-02 and never sent"']);
  assert.strictEqual(q[1].title, 'Approve sending the revocation');
  assert.strictEqual(q[2].prefix, 'RE-SCOPE BEFORE ACTIONING, flagged 2026-09-09: would create a second campaign.');
  assert.strictEqual(q[2].category, 'Onsite Concrete / Google Ads');
  assert.deepStrictEqual([q[3].done, q[3].risk, q[3].column], [true, 'medium', 'done']);

  const m = parseManifest(['version: 1', 'cadence: daily', 'jobs:', '  # comment', '  - id: heartbeat', '    title: Did yesterday actually happen',
    '    enabled: true', '    outputs: 12_Brain/07_Reviews/Cadence', '    accept: |', '      A dated file exists.', '      Absent is loudest.',
    '    prompt: |', '      Read the ledger.', '  - id: second', '    title: Second', '    enabled: false', '    client: omega-landscaping', '    outputs: x'].join('\n'), 'daily');
  assert.strictEqual(m.length, 2);
  assert.deepStrictEqual([m[0].id, m[0].enabled, m[0].accept, m[0].prompt], ['heartbeat', true, 'A dated file exists. Absent is loudest.', 'Read the ledger.']);
  assert.deepStrictEqual([m[1].enabled, m[1].client], [false, 'omega-landscaping']);

  // Live file: every open checkbox line in the real queue must become exactly one card.
  const live = readText(QUEUE) || '';
  const expected = (live.match(/^- \[ \]/gm) || []).length;
  const got = parseApprovalQueue(live).filter((a) => !a.done).length;
  assert.strictEqual(got, expected, `live queue: parsed ${got} open items, file has ${expected} open checkbox lines`);
  const unlabelled = parseApprovalQueue(live).filter((a) => !a.done && !a.risk).length;

  const liveManifests = loadManifests();
  assert.ok(liveManifests.length >= 8, `expected >= 8 manifest jobs, got ${liveManifests.length}`);
  assert.ok(liveManifests.every((j) => j.id && j.title && j.outputs && j.accept), 'every live manifest job has id/title/outputs/accept');

  const b = board({ probeTasks: false });
  assert.strictEqual(b.approvals.open, expected);
  console.log(`selftest ok: ${expected} open approvals (${unlabelled} without a Risk label), ${liveManifests.length} manifest jobs, ` +
    `${b.counts.done} done, ${b.counts.failed} failed/stale, ${b.counts.scheduled} scheduled (tasks probe skipped)`);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) selftest();
  else if (argv.includes('--json')) console.log(JSON.stringify(board({ probeTasks: !argv.includes('--no-tasks') }), null, 2));
  else serve(Number(argv[argv.indexOf('--port') + 1]) || 4717);
}

module.exports = { parseApprovalQueue, parseManifest, board };
