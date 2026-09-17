#!/usr/bin/env node
/**
 * cadence-watchdog.js — an external check that does not share a power supply
 * with the thing it watches.
 *
 * Cadence-sweep-heartbeat already answers "did yesterday run" every hour, but
 * it runs ON the same Windows box that has 14 unclean power-offs in 30 days.
 * When the machine dies, the watchdog dies with it, silently. This script runs
 * on GitHub Actions instead and reads only what has been PUSHED to origin, so
 * an outage that stops pushes is itself the alarm.
 *
 * Reads registry/ledger only. No model, no network beyond `git log`, no
 * secrets. Exit 0 clean, exit 1 something is due and absent, failed, or the
 * repo itself has gone stale.
 *
 *   node cadence-watchdog.js               human output
 *   node cadence-watchdog.js --json        machine output
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const LEDGER = path.join(VAULT, '_os', 'automation', 'cadence', 'run-ledger.jsonl');
const REGISTRY = path.join(VAULT, '12_Brain', 'registry', 'automations.json');

// A job is late, not absent, until this many hours past its own due window.
// Generous on purpose: this runs every few hours, not every minute, and a
// late-but-coming run should not page anyone.
const GRACE_HOURS = { daily: 20, weekly: 4 * 24, monthly: 4 * 24 };
// If NOTHING has reached origin in this long, the ledger itself cannot be
// trusted, regardless of what it says. This is the check a same-machine
// heartbeat cannot make about itself.
const STALE_REPO_HOURS = 30;

function nyNow() {
  // Cadence times are Eastern; reasoning in UTC would misjudge "is it Monday
  // yet" for hours around midnight.
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

function readLedger() {
  if (!fs.existsSync(LEDGER)) return [];
  return fs
    .readFileSync(LEDGER, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function cadenceJobs() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  return reg.automations.filter(
    (a) => a.enabled && typeof a.cadence === 'string' && /^(daily|weekly|monthly) via .*driver\.md/.test(a.cadence),
  );
}

/** Was `cadence` due at all as of `now`? Mirrors the driver's own rule. */
function isDueToday(cadence, now) {
  const day = now.getDay(); // 0 Sun .. 6 Sat
  if (cadence === 'daily') return day >= 1 && day <= 5; // weekdays
  if (cadence === 'weekly') return day === 1; // Monday
  if (cadence === 'monthly') return now.getDate() === 1;
  return false;
}

/** Hours since the most recent commit reachable from HEAD, i.e. since anything last reached this checkout. */
function hoursSinceLastCommit() {
  const iso = execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: VAULT, encoding: 'utf8' }).trim();
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

function hoursSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

function run() {
  const now = nyNow();
  const jobs = cadenceJobs();
  const ledger = readLedger();
  const repoAgeHours = hoursSinceLastCommit();

  const rows = [];
  for (const job of jobs) {
    const cadence = job.cadence.split(' ')[0]; // "daily" | "weekly" | "monthly"
    if (!isDueToday(cadence, now)) continue;

    const entries = ledger.filter((e) => e.job === job.id).sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const latest = entries[0];

    let state;
    if (!latest) {
      state = 'ABSENT';
    } else {
      const age = hoursSince(latest.ts);
      if (latest.status === 'failed') state = 'FAILED';
      else if (age > GRACE_HOURS[cadence]) state = 'ABSENT'; // last entry is from a prior cycle, not today's
      else if (latest.artifact && !fs.existsSync(path.join(VAULT, latest.artifact))) state = 'FAILED'; // claimed artifact missing on disk
      else state = 'ok';
    }
    rows.push({ id: job.id, cadence, state, lastRun: latest?.ts ?? null, note: latest?.note ?? '' });
  }

  const repoStale = repoAgeHours > STALE_REPO_HOURS;
  const problems = rows.filter((r) => r.state !== 'ok');
  const ok = !repoStale && problems.length === 0;

  return { ok, checkedAt: now.toISOString(), repoAgeHours: Math.round(repoAgeHours * 10) / 10, repoStale, rows, problems };
}

function main() {
  const result = run();
  const asJson = process.argv.includes('--json');

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`cadence-watchdog  checked ${result.checkedAt}`);
    console.log(`repo age          ${result.repoAgeHours}h since last commit reached this checkout (stale past ${STALE_REPO_HOURS}h)`);
    if (result.repoStale) {
      console.log(`  STALE REPO — nothing has reached origin in ${result.repoAgeHours}h. The ledger below cannot be trusted regardless of what it says.`);
    }
    if (!result.rows.length) {
      console.log('no cadence jobs due today');
    } else {
      for (const r of result.rows) {
        const mark = r.state === 'ok' ? 'ok    ' : r.state.padEnd(6);
        console.log(`  ${mark}  ${r.cadence.padEnd(8)} ${r.id.padEnd(24)} last=${r.lastRun ?? 'never'}${r.note ? '  ' + r.note : ''}`);
      }
    }
    console.log(result.ok ? '\nclean' : `\n${result.problems.length} problem(s)` + (result.repoStale ? ' + stale repo' : ''));
  }

  process.exit(result.ok ? 0 : 1);
}

function selftest() {
  const assert = require('assert');
  const nowStr = new Date().toISOString();

  // A Monday-only weekly job is not due on a Tuesday.
  assert.strictEqual(isDueToday('weekly', new Date('2026-09-15T10:00:00')), false); // Tuesday
  assert.strictEqual(isDueToday('weekly', new Date('2026-09-14T10:00:00')), true); // Monday
  assert.strictEqual(isDueToday('daily', new Date('2026-09-13T10:00:00')), false); // Sunday
  assert.strictEqual(isDueToday('monthly', new Date('2026-09-01T10:00:00')), true);
  assert.strictEqual(isDueToday('monthly', new Date('2026-09-02T10:00:00')), false);

  // Recency math: something from right now is not stale.
  assert.ok(hoursSince(nowStr) < 0.01);

  console.log('cadence-watchdog selftest OK');
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) {
    selftest();
  } else {
    main();
  }
}

module.exports = { run, isDueToday, hoursSince };
