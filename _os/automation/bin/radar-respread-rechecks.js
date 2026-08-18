#!/usr/bin/env node
'use strict';

/**
 * Re-spread the recheck schedule that the seed batch collapsed into cliffs.
 *
 *   node _os/automation/bin/radar-respread-rechecks.js [--dry-run]
 *
 * ## Why
 *
 * 700 prospects were seeded on 2026-08-06 and graded the same morning. Every
 * verdict carries a flat interval (lib/radar.js RECHECK_DAYS), so every `polish`
 * row took the same 90 days and landed on the same date. Measured on
 * 2026-08-18: 333 rows due on 2026-11-04, 214 on 11-05, and nothing at all due
 * between 08-18 and 08-20.
 *
 * A sweep with nothing due re-audits nothing. That is the whole reason the
 * 2026-08-18 brief came out byte-identical to 2026-08-17 — the sweep ran fine
 * and had no work to do. Then in November two mornings would have to carry 547
 * re-audits between them, well past a 45-minute job.
 *
 * `radar.recheckDays()` now spreads every new interval deterministically, which
 * fixes this going forward. This script applies the same spread to the dates
 * already on disk, so the existing cliffs are defused rather than waited out.
 *
 * Re-running is safe: the offset is a pure function of domain and verdict, so a
 * second run computes the same dates and reports zero moves.
 */

const radar = require('../lib/radar');
const { todayISO } = require('../lib/fsutil');

function parseArgs(argv) {
  return { dryRun: argv.includes('--dry-run'), help: argv.includes('--help') || argv.includes('-h') };
}

function histogram(registry) {
  const h = new Map();
  for (const p of Object.values(registry.prospects || {})) {
    if (!p.next_recheck) continue;
    h.set(p.next_recheck, (h.get(p.next_recheck) || 0) + 1);
  }
  return h;
}

function worst(h) {
  let date = null;
  let n = 0;
  for (const [d, c] of h) if (c > n) { n = c; date = d; }
  return { date, n };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(require('fs').readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const today = todayISO();
  const registry = radar.load();
  const before = histogram(registry);
  const wBefore = worst(before);

  let moved = 0;
  for (const [domain, p] of Object.entries(registry.prospects || {})) {
    const verdict = (p.current || {}).verdict;
    // A row that was never graded has no schedule to spread — it is due now by
    // definition, and dueForRecheck already puts those first.
    if (!verdict || !p.last_graded || !p.next_recheck) continue;

    const next = radar.addDays(p.last_graded, radar.recheckDays(verdict, domain));
    if (next === p.next_recheck) continue;
    // Never push a row that is already due back into the future — that would
    // hide work the sweep should be doing today.
    if (p.next_recheck <= today && next > today) continue;
    p.next_recheck = next;
    moved += 1;
  }

  const after = histogram(registry);
  const wAfter = worst(after);

  console.log(`rows moved:            ${moved}`);
  console.log(`worst cohort before:   ${wBefore.n} on ${wBefore.date}`);
  console.log(`worst cohort after:    ${wAfter.n} on ${wAfter.date}`);
  console.log(`distinct dates before: ${before.size}`);
  console.log(`distinct dates after:  ${after.size}`);

  if (args.dryRun) {
    console.log('\n--dry-run: nothing written');
    return;
  }
  radar.save(registry);
  console.log('\nregistry written');
}

main();
