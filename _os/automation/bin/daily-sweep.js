#!/usr/bin/env node
/**
 * daily-sweep.js — the orchestrator's daily evidence sweep.
 *
 * Reads local evidence only. No network, no model, no secrets, no external
 * action. Emits one machine-readable state file and one human status note.
 *
 * The point of this script is NOT that it collects; three other things already
 * collect. The point is that when it does not run, or when a collector goes
 * quiet, THAT IS THE HEADLINE. Three Gmail labels sat at zero for weeks
 * because a silent collector reads exactly like a quiet day.
 *
 *   node _os/automation/bin/daily-sweep.js [--json] [--selftest]
 *
 * Exit codes:  0 clean | 2 gaps or silent sensors found | 1 the sweep broke
 *
 * Cross-platform on purpose: this runs on Windows today and on the Mac mini
 * after the move. Platform-specific bits are isolated in machineHealth().
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const CANONICAL = process.env.CLIENT_OPS_ROOT ||
  (process.platform === 'win32'
    ? 'C:/Users/dillo/Documents/Codex/projects/client-operations'
    : path.join(os.homedir(), 'Documents/Codex/projects/client-operations'));

const STATE_FILE = path.join(VAULT, '12_Brain/state/daily-sweep.json');
const STATUS_NOTE = path.join(VAULT, 'System/sweep-status.md');
const CADENCE_DIR = path.join(VAULT, '_os/automation/cadence');
const LEDGER = path.join(CADENCE_DIR, 'run-ledger.jsonl');
const HISTORY_DAYS = 30;

const now = new Date();
const TODAY = ymd(now);

// ---------------------------------------------------------------- utilities

function ymd(d) { return d.toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
function ageHours(mtimeMs) { return (Date.now() - mtimeMs) / 3600000; }

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); }
  catch { return fallback; }
}
function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}
function statOf(p) {
  try { return fs.statSync(p); } catch { return null; }
}
function git(repo, args) {
  try {
    return execFileSync('git', ['-C', repo, ...args],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 }).trim();
  } catch { return null; }
}

/** A claim the sweep is willing to make, and where it got it. */
function claim(value, sourceRef, note) {
  return note ? { value, source_ref: sourceRef, note } : { value, source_ref: sourceRef };
}

// ---------------------------------------------------------------- collectors

/**
 * Artifacts the orchestrator treats as daily. Each one carries its own
 * staleness budget in hours; past that it is reported stale, never "fine".
 */
const WATCHED = [
  { id: 'daily-brief', path: 'Daily-Briefs/%DATE%.md', dated: true, budget_h: 26,
    owner: 'Codex cron daily-communications-brain (07:00 local)' },
  { id: 'communications-brain', path: '12_Brain/state/daily-communications-brain.json', budget_h: 26,
    owner: 'Codex cron daily-communications-brain' },
  { id: 'claude-daily-driver', path: '12_Brain/state/claude-daily-driver.json', budget_h: 2,
    owner: 'Task Scheduler Claude-Autonomous-Daily-Driver (PT15M)' },
  { id: 'claude-loop', path: '12_Brain/state/claude-loop.json', budget_h: 26,
    owner: 'claude-loop.js via the daily driver' },
  { id: 'immohrtal-plan', path: 'Daily-Briefs/plan-%DATE%.md', dated: true, budget_h: 26,
    owner: 'Task Scheduler Immohrtal-Crew' },
  { id: 'frontmatter-validate', path: '12_Brain/state/frontmatter-validate.json', budget_h: 168,
    owner: 'frontmatter-validate.js, on demand + pre-pulse' },
  { id: 'approval-queue', path: 'System/approval-queue.md', budget_h: 72,
    owner: 'every session that gates an external action' },
  { id: 'umbrella-run', path: '12_Brain/state/umbrella-latest.json', budget_h: 26,
    owner: 'umbrella-run.js (morning/midday/nightly slices)' },
];

function freshness() {
  return WATCHED.map((w) => {
    const rel = w.dated ? w.path.replace('%DATE%', TODAY) : w.path;
    const abs = path.join(VAULT, rel);
    const st = statOf(abs);
    if (!st) {
      return { id: w.id, path: rel, owner: w.owner, state: 'missing', age_hours: null,
               budget_hours: w.budget_h };
    }
    const age = ageHours(st.mtimeMs);
    return {
      id: w.id, path: rel, owner: w.owner,
      state: age > w.budget_h ? 'stale' : 'fresh',
      age_hours: Number(age.toFixed(1)),
      budget_hours: w.budget_h,
    };
  });
}

/** Which of the last N days produced a dated daily brief, and which did not. */
function datedArtifactGaps(pattern, days = 14) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = ymd(new Date(now.getTime() - i * 86400000));
    const abs = path.join(VAULT, pattern.replace('%DATE%', d));
    out.push({ date: d, present: !!statOf(abs) });
  }
  return out;
}

function clientState() {
  const reg = readJson(path.join(CANONICAL, 'registry/clients.json'));
  const idx = readText(path.join(VAULT, '01_Clients/Client Index.md'));
  const vaultDirs = (() => {
    try {
      return fs.readdirSync(path.join(VAULT, '01_Clients'), { withFileTypes: true })
        .filter((e) => e.isDirectory()).map((e) => e.name);
    } catch { return []; }
  })();

  const registryClients = Array.isArray(reg) ? reg : (reg && reg.clients) || null;
  const activeInRegistry = registryClients
    ? registryClients.filter((c) => String(c.status || '').toLowerCase() === 'active').length
    : null;

  return {
    registry_present: !!registryClients,
    registry_total: claim(registryClients ? registryClients.length : null,
      'client-operations/registry/clients.json'),
    registry_active: claim(activeInRegistry, 'client-operations/registry/clients.json',
      activeInRegistry === null ? 'no status field found; not inferred' : undefined),
    vault_client_dirs: claim(vaultDirs.length, '01_Clients/'),
    client_index_present: claim(!!idx, '01_Clients/Client Index.md'),
    // The registry wins on disagreement (CLAUDE.md). We report the delta, we do
    // not resolve it, and we never average two counts into a third number.
    roster_disagreement: (registryClients && vaultDirs.length &&
      registryClients.length !== vaultDirs.length)
      ? `registry ${registryClients.length} vs ${vaultDirs.length} vault directories`
      : null,
  };
}

/** What shipped: commits in the last 24h across the estate's git roots. */
function shipped(repos) {
  const since = '24 hours ago';
  const rows = [];
  for (const repo of repos) {
    const log = git(repo, ['log', '--since', since, '--pretty=%h|%an|%s']);
    if (log === null) continue;
    const lines = log ? log.split('\n').filter(Boolean) : [];
    if (lines.length) {
      rows.push({
        repo: path.basename(repo),
        path: repo,
        commits: lines.length,
        subjects: lines.slice(0, 5).map((l) => l.split('|').slice(2).join('|')),
      });
    }
  }
  return rows;
}

/** Uncommitted or unpushed work — the stuff a machine failure actually loses. */
function atRisk(repos) {
  const rows = [];
  for (const repo of repos) {
    const dirty = git(repo, ['status', '--porcelain']);
    if (dirty === null) continue;
    const dirtyCount = dirty ? dirty.split('\n').filter(Boolean).length : 0;
    const remote = git(repo, ['remote', 'get-url', 'origin']);
    const ahead = git(repo, ['rev-list', '--count', '@{u}..HEAD']);
    const unpushed = ahead === null ? null : Number(ahead);
    if (dirtyCount > 0 || !remote || unpushed === null || unpushed > 0) {
      rows.push({
        repo: path.basename(repo),
        path: repo,
        dirty_files: dirtyCount,
        has_remote: !!remote,
        unpushed_commits: unpushed,
        risk: !remote ? 'NO REMOTE — a disk loss or a machine move loses this entirely'
          : unpushed === null ? 'branch has no upstream — nothing is pushing it'
          : unpushed > 0 ? `${unpushed} commit(s) exist only on this machine`
          : `${dirtyCount} uncommitted file(s)`,
      });
    }
  }
  return rows.sort((a, b) => (b.dirty_files + (b.unpushed_commits || 0)) -
                             (a.dirty_files + (a.unpushed_commits || 0)));
}

/** Waiting on a human: the approval queue, counted by risk label. */
function waitingOnHuman() {
  const p = path.join(VAULT, 'System/approval-queue.md');
  const text = readText(p);
  if (!text) return { present: false, source_ref: 'System/approval-queue.md' };
  const lines = text.split('\n');
  const openMatches = text.match(/^\s*[-*]?\s*\[\s\]/gm) || [];
  const byRisk = {};
  for (const m of text.match(/risk\s*[:=]\s*(high|medium|med|low)/gi) || []) {
    const k = m.split(/[:=]/)[1].trim().toLowerCase().replace('med', 'medium');
    byRisk[k] = (byRisk[k] || 0) + 1;
  }
  return {
    present: true,
    source_ref: 'System/approval-queue.md',
    lines: lines.length,
    open_checkboxes: openMatches.length,
    risk_mentions: byRisk,
    last_modified: new Date(statOf(p).mtimeMs).toISOString(),
    note: 'An item in the queue is a request, never a permission.',
  };
}

/** Overdue: vault frontmatter `due:` dates in the past on notes not marked done. */
function overdue(limit = 40) {
  const roots = ['01_Clients', '02_Campaigns', '12_Brain/05_Projects'];
  const hits = [];
  const walk = (dir, depth) => {
    if (depth > 4 || hits.length >= limit) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (hits.length >= limit) return;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full, depth + 1); continue; }
      if (!e.name.endsWith('.md')) continue;
      const head = (readText(full) || '').slice(0, 1200);
      const due = head.match(/^due\s*:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
      if (!due) continue;
      const status = (head.match(/^status\s*:\s*(\S+)/m) || [])[1] || '';
      if (/^(done|complete|completed|closed|shipped|archived)$/i.test(status)) continue;
      if (due[1] < TODAY) {
        hits.push({
          note: path.relative(VAULT, full).replace(/\\/g, '/'),
          due: due[1],
          days_overdue: daysBetween(due[1], TODAY),
          status: status || 'unset',
        });
      }
    }
  };
  for (const r of roots) walk(path.join(VAULT, r), 0);
  return hits.sort((a, b) => b.days_overdue - a.days_overdue);
}

/**
 * Machine health. This machine has a diagnosed power-supply fault, so a
 * scheduled run on it WILL miss days. Boot count is the evidence, not a mood.
 */
function machineHealth() {
  const base = {
    platform: `${os.platform()} ${os.release()}`,
    hostname: os.hostname(),
    uptime_hours: Number((os.uptime() / 3600).toFixed(1)),
    total_memory_gb: Number((os.totalmem() / 1073741824).toFixed(1)),
    free_memory_gb: Number((os.freemem() / 1073741824).toFixed(1)),
  };
  try {
    if (process.platform === 'win32') {
      // Event 6008 = the previous shutdown was unexpected. This is the fault signal.
      const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
        "(Get-WinEvent -FilterHashtable @{LogName='System';Id=6008;StartTime=(Get-Date).AddDays(-30)} " +
        '-ErrorAction SilentlyContinue | Measure-Object).Count'],
        { encoding: 'utf8', timeout: 30000 }).trim();
      base.unclean_shutdowns_30d = Number(out);
      base.unclean_shutdowns_source = 'Windows System event log, Id 6008';
    } else {
      const out = execFileSync('/usr/sbin/system_profiler',
        ['SPPowerDataType'], { encoding: 'utf8', timeout: 30000 });
      base.power_source = /AC Power|Battery/.test(out) ? 'reported' : 'unknown';
      base.unclean_shutdowns_30d = null;
      base.unclean_shutdowns_source =
        'not collected on macOS; `log show --predicate "eventMessage contains \\"previous shutdown cause\\""` is the equivalent';
    }
  } catch {
    base.unclean_shutdowns_30d = null;
    base.unclean_shutdowns_source = 'probe failed; not inferred';
  }
  return base;
}

/**
 * The cadence layer (added 2026-09-14) owns scheduling: three tasks read the
 * manifests and append to one ledger. This sweep runs as the first daily job in
 * that manifest, so it is also the layer's deterministic ABSENT detector — it
 * answers "did the driver run at all" in code, not in a prompt, because a
 * prompt-driven heartbeat cannot report on a day the driver never started.
 */
function cadence() {
  const ledgerText = readText(LEDGER);
  const rows = (ledgerText || '').split('\n').filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);

  const daysSeen = new Set(rows.map((r) => String(r.ts).slice(0, 10)));
  const firstDay = rows.length ? [...daysSeen].sort()[0] : TODAY;

  const absent = [];
  for (let t = Date.parse(firstDay); t <= now.getTime(); t += 86400000) {
    const d = ymd(new Date(t));
    if (!daysSeen.has(d)) absent.push(d);
  }

  // A ledger that names an artifact which is not on disk is worse than no ledger.
  const lying = rows.filter((r) => r.status === 'ok' && r.artifact &&
    !statOf(path.join(VAULT, r.artifact))).map((r) => ({ job: r.job, artifact: r.artifact, ts: r.ts }));

  const manifests = ['daily', 'weekly', 'monthly'].map((c) => {
    const text = readText(path.join(CADENCE_DIR, `${c}.yaml`));
    const ids = text ? (text.match(/^\s*-\s*id:\s*(\S+)/gm) || []).map((m) => m.split(':')[1].trim()) : [];
    const disabled = text ? (text.match(/^\s*enabled:\s*false/gm) || []).length : 0;
    return { cadence: c, present: !!text, jobs: ids.length, disabled };
  });

  return {
    ledger_present: !!ledgerText,
    ledger_rows: rows.length,
    first_ledger_day: rows.length ? firstDay : null,
    days_with_no_ledger_entry: absent,
    ledger_claims_missing_artifacts: lying,
    manifests,
    // Verified 2026-09-14: the driver README describes three scheduled tasks and
    // none of them exist yet. Until one does, every cadence run is hand-started.
    scheduler: schedulerFor('cadence'),
  };
}

/** Is anything on this machine actually scheduled to start the given job? */
function schedulerFor(kind) {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
        `(Get-ScheduledTask | Where-Object { $_.TaskName -match '${kind}' } | ` +
        'Select-Object -ExpandProperty TaskName) -join ","'],
        { encoding: 'utf8', timeout: 30000 }).trim();
      return { mechanism: 'Windows Task Scheduler', registered: out ? out.split(',') : [] };
    }
    const out = execFileSync('launchctl', ['list'], { encoding: 'utf8', timeout: 20000 });
    const hits = out.split('\n').filter((l) => l.toLowerCase().includes(kind))
      .map((l) => l.trim().split(/\s+/).pop());
    return { mechanism: 'launchd', registered: hits };
  } catch {
    return { mechanism: process.platform === 'win32' ? 'Windows Task Scheduler' : 'launchd',
             registered: null, note: 'probe failed; not inferred' };
  }
}

/** One ledger for the whole cadence layer. This sweep appends to it like any job. */
function appendLedger(state) {
  if (!fs.existsSync(CADENCE_DIR)) return false;
  const line = JSON.stringify({
    ts: now.toISOString(),
    cadence: 'daily',
    job: 'daily-sweep',
    status: state.exit_code === 1 ? 'failed' : 'ok',
    artifact: 'System/sweep-status.md',
    commit: null,
    note: state.verdict === 'clean' ? '' : state.verdict,
  });
  fs.appendFileSync(LEDGER, line + '\n', 'utf8');
  return true;
}

// -------------------------------------------------------- gap + silence logic

/**
 * Fill the run history. Every calendar day between the previous run and today
 * that has no record becomes an explicit MISSED row. A gap is a written fact,
 * not an absence someone has to notice.
 */
function reconcileHistory(prevHistory, status) {
  const byDate = new Map((prevHistory || []).map((r) => [r.date, r]));
  const dates = [...byDate.keys()].sort();
  const earliest = dates.length ? dates[0] : TODAY;
  const start = new Date(Math.max(
    Date.parse(earliest),
    now.getTime() - (HISTORY_DAYS - 1) * 86400000));

  for (let t = start.getTime(); t <= now.getTime(); t += 86400000) {
    const d = ymd(new Date(t));
    if (!byDate.has(d)) byDate.set(d, { date: d, status: 'MISSED' });
  }
  byDate.set(TODAY, { date: TODAY, status, ran_at: now.toISOString() });

  return [...byDate.values()]
    .filter((r) => daysBetween(r.date, TODAY) < HISTORY_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * The Gmail-label failure mode, generalised: a counter that used to be
 * non-zero and is now zero is SUSPECT, not healthy. Never report a dead
 * sensor as a quiet day.
 */
function silentSensors(prev, current) {
  const counters = {
    shipped_repos: current.shipped.length,
    at_risk_repos: current.at_risk.length,
    overdue_notes: current.overdue.length,
    approval_open_checkboxes: current.waiting_on_human.open_checkboxes || 0,
    fresh_artifacts: current.freshness.filter((f) => f.state === 'fresh').length,
  };
  const prevCounters = (prev && prev.counters) || {};
  const suspect = [];
  for (const [k, v] of Object.entries(counters)) {
    const before = prevCounters[k];
    if (v === 0 && typeof before === 'number' && before > 0) {
      suspect.push({
        counter: k, previous: before, current: 0,
        verdict: 'SUSPECT-SILENT — was non-zero, is now zero. Verify the collector before believing the zero.',
      });
    }
  }
  return { counters, suspect };
}

// ------------------------------------------------------------------ rendering

function renderNote(s) {
  const L = [];
  const gaps = s.run_history.filter((r) => r.status === 'MISSED');
  const stale = s.freshness.filter((f) => f.state !== 'fresh');
  const missedBriefs = s.daily_brief_days.filter((d) => !d.present).length;
  const headline = s.exit_code === 0
    ? 'CLEAN — swept today, every daily artifact fresh, no gaps, no silent sensors.'
    : 'ATTENTION — ' + [
        gaps.length ? `${gaps.length} missed sweep day(s)` : null,
        stale.length ? `${stale.length} stale or missing daily artifact(s)` : null,
        missedBriefs ? `${missedBriefs} of 14 daily briefs never produced` : null,
        s.cadence.days_with_no_ledger_entry.length
          ? `${s.cadence.days_with_no_ledger_entry.length} day(s) with no cadence ledger entry at all` : null,
        s.cadence.ledger_claims_missing_artifacts.length
          ? `${s.cadence.ledger_claims_missing_artifacts.length} ledger entr(ies) naming an artifact that is not on disk` : null,
        (Array.isArray(s.cadence.scheduler.registered) && s.cadence.scheduler.registered.length === 0)
          ? 'the cadence driver has NO scheduled task — every run so far was hand-started' : null,
        s.silent.suspect.length ? `${s.silent.suspect.length} suspect-silent counter(s)` : null,
      ].filter(Boolean).join('; ') + '.';

  L.push('---');
  L.push('note_type: status');
  L.push('status: active');
  L.push(`date: ${s.date}`);
  L.push(`updated: ${s.date}`);
  L.push(`generated_at: ${s.generated_at}`);
  L.push(`generated_by: _os/automation/bin/daily-sweep.js`);
  L.push(`days_since_previous_sweep: ${s.days_since_previous_sweep === null ? 'never-run-before' : s.days_since_previous_sweep}`);
  L.push('tags:');
  L.push('  - status');
  L.push('  - automation');
  L.push('  - daily');
  L.push('source_refs:');
  for (const r of s.source_refs) L.push(`  - ${r}`);
  L.push('---');
  L.push('');
  L.push('# Sweep status');
  L.push('');
  L.push(`**${headline}**`);
  L.push('');
  L.push(`Swept \`${s.generated_at}\`. Previous sweep: ${s.previous_run || 'none recorded'}.`);
  L.push('');
  L.push('This file is written by the sweep and by nothing else. If the date in');
  L.push('the frontmatter above is not today, the sweep did not run today — that');
  L.push('is the first thing to fix, before trusting anything below it.');
  L.push('');

  L.push('## Sweep run history (last 30 days)');
  L.push('');
  const missed = s.run_history.filter((r) => r.status === 'MISSED').map((r) => r.date);
  L.push(`Ran: **${s.run_history.filter((r) => r.status !== 'MISSED').length}** of ${s.run_history.length} days.`);
  L.push('');
  if (missed.length) {
    L.push(`**MISSED: ${missed.join(', ')}**`);
  } else {
    L.push('No missed days on record.');
  }
  L.push('');
  L.push('This machine has a diagnosed power-supply fault — 14 unclean power-offs');
  L.push('in 30 days as of the 2026-09-09 diagnosis. A scheduled run on it will');
  L.push('miss days. Missed days above are expected; missed days that are never');
  L.push('written down are the actual failure.');
  L.push('');

  L.push('## Daily artifact freshness');
  L.push('');
  L.push('| Artifact | State | Age (h) | Budget (h) | Produced by |');
  L.push('| --- | --- | --- | --- | --- |');
  for (const f of s.freshness) {
    const mark = f.state === 'fresh' ? 'fresh' : `**${f.state}**`;
    L.push(`| \`${f.path}\` | ${mark} | ${f.age_hours ?? '—'} | ${f.budget_hours} | ${f.owner} |`);
  }
  L.push('');

  L.push('## Daily brief delivery, last 14 days');
  L.push('');
  const brief = s.daily_brief_days;
  L.push(brief.map((d) => `${d.date} ${d.present ? 'yes' : '**NO**'}`).join(' · '));
  L.push('');
  L.push(`Delivered **${brief.length - missedBriefs} of ${brief.length}** days.`);
  L.push('');

  L.push('## Cadence layer');
  L.push('');
  const c = s.cadence;
  L.push('Scheduling is owned by `_os/automation/cadence/`. This sweep is a job in');
  L.push('its `daily.yaml` manifest and writes to its ledger — one ledger, not two.');
  L.push('');
  const reg = c.scheduler.registered;
  if (Array.isArray(reg) && reg.length === 0) {
    L.push(`- **No ${c.scheduler.mechanism} entry matches "cadence".** The driver`);
    L.push('  README describes three scheduled tasks. None are registered. Every');
    L.push('  cadence run to date was started by hand, which means the layer built to');
    L.push('  detect silence is itself silent when nobody starts it. Register it:');
    L.push('  see `System/sweep-install.md`.');
  } else if (Array.isArray(reg)) {
    L.push(`- ${c.scheduler.mechanism} entries: ${reg.map((r) => `\`${r}\``).join(', ')}.`);
  } else {
    L.push(`- Scheduler probe failed; state not inferred.`);
  }
  L.push(`- Ledger rows: **${c.ledger_rows}**, first entry ${c.first_ledger_day || 'none'}.`);
  if (c.days_with_no_ledger_entry.length) {
    L.push(`- **Days with NO ledger entry at all: ${c.days_with_no_ledger_entry.join(', ')}.**`);
    L.push('  Absent is louder than failed: it means the driver never started.');
  } else {
    L.push('- Every day since the first ledger entry has at least one row.');
  }
  if (c.ledger_claims_missing_artifacts.length) {
    for (const x of c.ledger_claims_missing_artifacts) {
      L.push(`- **Ledger lies:** job \`${x.job}\` claims \`${x.artifact}\`, which is not on disk.`);
    }
  }
  for (const m of c.manifests) {
    L.push(`- \`${m.cadence}.yaml\`: ${m.present ? `${m.jobs} job(s), ${m.disabled} disabled` : '**missing**'}.`);
  }
  L.push('');

  L.push('## Silent-sensor check');
  L.push('');
  if (s.silent.suspect.length === 0) {
    L.push('No counter dropped from non-zero to zero since the previous sweep.');
  } else {
    for (const x of s.silent.suspect) {
      L.push(`- **${x.counter}**: was ${x.previous}, now 0. ${x.verdict}`);
    }
  }
  L.push('');
  L.push('Counters this run: ' +
    Object.entries(s.silent.counters).map(([k, v]) => `${k}=${v}`).join(', ') + '.');
  L.push('');

  L.push('## Client state');
  L.push('');
  L.push(`- Registry clients: **${s.clients.registry_total.value ?? 'unreadable'}** (\`${s.clients.registry_total.source_ref}\`)`);
  L.push(`- Registry active: **${s.clients.registry_active.value ?? 'not derivable'}**`);
  L.push(`- Vault client directories: **${s.clients.vault_client_dirs.value}** (\`01_Clients/\`)`);
  if (s.clients.roster_disagreement) {
    L.push(`- **Roster disagreement:** ${s.clients.roster_disagreement}. The registry wins; this sweep reports the delta and does not resolve it.`);
  }
  L.push('');

  L.push('## What shipped in the last 24 hours');
  L.push('');
  if (!s.shipped.length) {
    L.push('No commits in the last 24 hours across the scanned roots. A zero here');
    L.push('means no commits were found, not that no work happened.');
  } else {
    for (const r of s.shipped) {
      L.push(`- **${r.repo}** — ${r.commits} commit(s): ${r.subjects.join('; ')}`);
    }
  }
  L.push('');

  L.push('## Work that would not survive this machine');
  L.push('');
  if (!s.at_risk.length) {
    L.push('Every scanned repo is clean, pushed, and has a remote.');
  } else {
    for (const r of s.at_risk.slice(0, 20)) {
      L.push(`- **${r.repo}** — ${r.risk}`);
    }
    if (s.at_risk.length > 20) L.push(`- …and ${s.at_risk.length - 20} more, see the state file.`);
  }
  L.push('');

  L.push('## Overdue');
  L.push('');
  if (!s.overdue.length) {
    L.push('No note under `01_Clients/`, `02_Campaigns/` or `12_Brain/05_Projects/`');
    L.push('carries a past `due:` date with an unfinished status. Most notes carry');
    L.push('no `due:` at all, so this is a floor, not a full picture.');
  } else {
    for (const o of s.overdue.slice(0, 15)) {
      L.push(`- \`${o.note}\` — due ${o.due}, **${o.days_overdue} days** overdue (status: ${o.status})`);
    }
  }
  L.push('');

  L.push('## Waiting on a human');
  L.push('');
  const w = s.waiting_on_human;
  if (!w.present) {
    L.push('`System/approval-queue.md` is **missing**.');
  } else {
    L.push(`- Queue: ${w.lines} lines, last modified ${w.last_modified}.`);
    L.push(`- Open checkboxes: **${w.open_checkboxes}**.`);
    const risks = Object.entries(w.risk_mentions || {});
    if (risks.length) L.push(`- Risk labels present: ${risks.map(([k, v]) => `${k}=${v}`).join(', ')}.`);
    L.push(`- ${w.note}`);
  }
  L.push('');

  L.push('## Machine health');
  L.push('');
  const m = s.machine;
  L.push(`- ${m.platform}, host \`${m.hostname}\`.`);
  L.push(`- Uptime **${m.uptime_hours} h**. Memory ${m.free_memory_gb} GB free of ${m.total_memory_gb} GB.`);
  L.push(`- Unclean shutdowns in 30 days: **${m.unclean_shutdowns_30d ?? 'not measured'}** (${m.unclean_shutdowns_source}).`);
  L.push('');

  L.push('---');
  L.push('');
  L.push('Read-only sweep. It sends nothing, publishes nothing, spends nothing,');
  L.push('touches no credential, and writes no canonical client state.');
  L.push('');
  return L.join('\n');
}

// ----------------------------------------------------------------------- main

function gitRoots() {
  const candidates = [];
  const scan = (root) => {
    let entries;
    try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const p = path.join(root, e.name);
      if (fs.existsSync(path.join(p, '.git'))) candidates.push(p);
    }
  };
  const home = os.homedir();
  scan(path.join(home, 'repos'));
  scan(path.join(home, 'Documents/Codex'));
  scan(path.join(home, 'Documents/Codex/projects'));
  if (!candidates.includes(VAULT)) candidates.unshift(VAULT);
  return candidates;
}

function run() {
  const prev = readJson(STATE_FILE);
  const repos = gitRoots();

  const current = {
    freshness: freshness(),
    daily_brief_days: datedArtifactGaps('Daily-Briefs/%DATE%.md', 14),
    clients: clientState(),
    shipped: shipped(repos),
    at_risk: atRisk(repos),
    overdue: overdue(),
    waiting_on_human: waitingOnHuman(),
    machine: machineHealth(),
    cadence: cadence(),
  };

  const silent = silentSensors(prev, current);
  const staleCount = current.freshness.filter((f) => f.state !== 'fresh').length;
  const missedBriefs = current.daily_brief_days.filter((d) => !d.present).length;

  const state = {
    schema: '12_Brain/schemas/daily-sweep.json',
    automation_id: 'daily-sweep',
    version: 1,
    date: TODAY,
    generated_at: now.toISOString(),
    generated_by: '_os/automation/bin/daily-sweep.js',
    previous_run: prev ? prev.generated_at : null,
    days_since_previous_sweep: prev ? daysBetween(prev.date, TODAY) : null,
    repos_scanned: repos.length,
    ...current,
    silent,
    counters: silent.counters,
    source_refs: [
      '12_Brain/registry/automations.json',
      '12_Brain/state/daily-communications-brain.json',
      '12_Brain/state/claude-daily-driver.json',
      '12_Brain/state/claude-loop.json',
      'System/approval-queue.md',
      '01_Clients/Client Index.md',
      'client-operations/registry/clients.json',
      'Daily-Briefs/',
      '_os/automation/cadence/run-ledger.jsonl',
      '_os/automation/cadence/daily.yaml',
      'git log and git status across the scanned roots',
      process.platform === 'win32'
        ? 'Windows System event log, Id 6008'
        : 'macOS system power state',
    ],
  };

  state.run_history = reconcileHistory(prev && prev.run_history, 'ran');
  const gaps = state.run_history.filter((r) => r.status === 'MISSED').length;
  const cadenceAbsent = state.cadence.days_with_no_ledger_entry.length;
  const unscheduled = Array.isArray(state.cadence.scheduler.registered) &&
    state.cadence.scheduler.registered.length === 0;

  state.exit_code =
    (gaps || staleCount || silent.suspect.length || missedBriefs ||
     cadenceAbsent || state.cadence.ledger_claims_missing_artifacts.length || unscheduled)
      ? 2 : 0;
  state.verdict = state.exit_code === 0 ? 'clean'
    : [`sweep-gaps=${gaps}`, `stale=${staleCount}`, `silent=${silent.suspect.length}`,
       `missed-briefs=${missedBriefs}/14`, `cadence-absent=${cadenceAbsent}`,
       unscheduled ? 'cadence-UNSCHEDULED' : null]
      .filter(Boolean).join(' ');

  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
  fs.writeFileSync(STATUS_NOTE, renderNote(state), 'utf8');
  state.ledger_appended = appendLedger(state);
  return state;
}

function selftest() {
  const assert = require('assert');

  // A gap between runs becomes explicit MISSED rows, not an absence.
  const three = ymd(new Date(now.getTime() - 3 * 86400000));
  const h = reconcileHistory([{ date: three, status: 'ran' }], 'ran');
  const missed = h.filter((r) => r.status === 'MISSED').map((r) => r.date);
  assert.strictEqual(missed.length, 2, 'two intervening days must be MISSED');
  assert.ok(h.find((r) => r.date === TODAY && r.status === 'ran'));

  // A first-ever run invents no history.
  assert.strictEqual(reconcileHistory(null, 'ran').length, 1);

  // Non-zero to zero is suspect; zero to zero is not a new alarm.
  const mk = (n) => ({
    shipped: Array(n).fill(0), at_risk: [], overdue: [],
    waiting_on_human: { open_checkboxes: 0 },
    freshness: [{ state: 'fresh' }],
  });
  assert.strictEqual(silentSensors({ counters: { shipped_repos: 4 } }, mk(0))
    .suspect.filter((s) => s.counter === 'shipped_repos').length, 1);
  assert.strictEqual(silentSensors({ counters: { shipped_repos: 0 } }, mk(0))
    .suspect.filter((s) => s.counter === 'shipped_repos').length, 0);
  assert.strictEqual(silentSensors(null, mk(0)).suspect.length, 0,
    'a first run has no baseline and must not cry wolf');

  // Staleness is measured against the budget, not guessed.
  assert.ok(ageHours(Date.now() - 3600000) > 0.9);

  console.log('daily-sweep selftest OK');
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) { selftest(); process.exit(0); }
  try {
    const s = run();
    if (argv.includes('--json')) {
      console.log(JSON.stringify(s, null, 2));
    } else {
      console.log(`daily-sweep ${s.date}: ${s.verdict}`);
      console.log(`  state  ${path.relative(VAULT, STATE_FILE).replace(/\\/g, '/')}`);
      console.log(`  status ${path.relative(VAULT, STATUS_NOTE).replace(/\\/g, '/')}`);
      const missed = s.run_history.filter((r) => r.status === 'MISSED').map((r) => r.date);
      if (missed.length) console.log(`  MISSED DAYS: ${missed.join(', ')}`);
      for (const f of s.freshness.filter((x) => x.state !== 'fresh')) {
        console.log(`  ${f.state.toUpperCase()}: ${f.path} (owner: ${f.owner})`);
      }
      for (const x of s.silent.suspect) console.log(`  SUSPECT-SILENT: ${x.counter} was ${x.previous}, now 0`);
    }
    process.exit(s.exit_code);
  } catch (err) {
    console.error('daily-sweep FAILED:', err && err.stack || err);
    process.exit(1);
  }
}

module.exports = { reconcileHistory, silentSensors, freshness, overdue };
