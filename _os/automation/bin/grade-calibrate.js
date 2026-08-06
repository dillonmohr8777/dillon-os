#!/usr/bin/env node
'use strict';

/**
 * Run the grader against its anchors and say whether the weights still work.
 * Run this after every weight change and before trusting any batch.
 *
 *   node _os/automation/bin/grade-calibrate.js            # offline fixtures only, CI safe
 *   node _os/automation/bin/grade-calibrate.js --live      # also hit the real anchor URLs
 *   node _os/automation/bin/grade-calibrate.js --live --with-overrides
 *   node _os/automation/bin/grade-calibrate.js --json
 *
 * Exit code 0 means calibrated, 4 means the anchors disagree with the grader.
 */

const { runOfflineCalibration, runLiveCalibration, anchorsFromOverrides, CALIBRATION } = require('../lib/grader/calibrate');
const { repoPath, readJson, writeJson, todayISO, nowISO } = require('../lib/fsutil');
const { writeRunState } = require('../lib/registry');

function parseArgs(argv) {
  const out = { live: false, withOverrides: false, json: false };
  for (const a of argv) {
    if (a === '--live') out.live = true;
    else if (a === '--with-overrides') out.withOverrides = true;
    else if (a === '--json') out.json = true;
  }
  return out;
}

const tick = (ok) => (ok ? 'pass' : 'FAIL');

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const doc = readJson(CALIBRATION, { anchors: [], gates: {} });
  const gates = doc.gates || {};

  const offline = runOfflineCalibration();
  const lines = [];
  lines.push('');
  lines.push(`  GRADER CALIBRATION   weights ${offline.weightsVersion}   ${todayISO()}`);
  lines.push(`  ${'═'.repeat(72)}`);
  lines.push('');
  lines.push('  OFFLINE ANCHORS (fixtures, deterministic)');
  lines.push('  RESULT  ID                    EXPECT      ACTUAL      SCORE  CRAFT  NOTE');
  for (const r of offline.rows) {
    const note = r.capped ? `capped from ${r.raw_score}` : r.in_range === false ? `outside ${r.expect_score_range.join('-')}` : '';
    lines.push(
      `  ${tick(r.pass).padEnd(7)} ${r.id.padEnd(21)} ${String(r.expect_band).padEnd(11)} ${String(r.actual_band).padEnd(11)} ${String(r.score).padStart(5)}  ${String(r.craft_ratio).padStart(5)}  ${note}`
    );
  }
  lines.push('');
  lines.push(`  Exact band match: ${offline.exact}/${offline.total}  (required ${Math.round((gates.offline_exact_band_required ?? 1) * 100)}%)`);

  let live = null;
  if (args.live) {
    const extra = args.withOverrides ? anchorsFromOverrides() : [];
    const anchors = [...(doc.anchors || []), ...extra];
    live = await runLiveCalibration({ anchors });
    lines.push('');
    lines.push('  LIVE ANCHORS (real URLs, network)');
    lines.push('  RESULT  ID                    EXPECT           ACTUAL           SCORE  STATE');
    for (const r of live.rows) {
      const expect = r.expect_lane ? `lane:${r.expect_lane}` : `band:${r.expect_band}`;
      const actual = r.expect_lane ? `lane:${r.actual_lane}` : `band:${r.actual_band}`;
      const label = r.unreadable ? 'skip' : tick(r.pass);
      lines.push(`  ${label.padEnd(7)} ${r.id.padEnd(21)} ${expect.padEnd(16)} ${actual.padEnd(16)} ${String(r.score ?? '--').padStart(5)}  ${r.state}`);
    }
    const agreement = live.readable ? live.passed / live.readable : null;
    lines.push('');
    lines.push(
      `  Lane agreement: ${live.passed}/${live.readable} readable  (required ${Math.round((gates.live_lane_agreement_min ?? 0.8) * 100)}%)` +
        (live.unreadable ? `, ${live.unreadable} unreadable and skipped` : '')
    );
    if (live.unreadable) {
      lines.push('  Unreadable anchors are a coverage gap, not a calibration failure. Run with a');
      lines.push('  render pass on a machine with direct egress to close them.');
    }
    live.agreement = agreement;
  }

  const offlineOk = offline.exactRate >= (gates.offline_exact_band_required ?? 1);
  const liveOk = !live || live.readable === 0 || live.agreement >= (gates.live_lane_agreement_min ?? 0.8);
  const ok = offlineOk && liveOk;

  lines.push('');
  lines.push(`  VERDICT: ${ok ? 'CALIBRATED' : 'OUT OF CALIBRATION'}`);
  if (!ok) {
    lines.push('');
    lines.push('  Disagreements to resolve (fix the weights, or fix the anchor if the anchor is wrong):');
    for (const r of [...offline.failures, ...((live && live.failures) || [])]) {
      lines.push(`    ${r.id}: expected ${r.expect_lane || r.expect_band}, got ${r.actual_lane || r.actual_band}${r.score != null ? ` (score ${r.score})` : ''}`);
      if (r.why) lines.push(`      anchor rationale: ${r.why}`);
    }
  }
  lines.push('');

  const summary = {
    automation_id: 'grader-calibration',
    started_at: nowISO(),
    status: ok ? 'ok' : 'fail',
    dry_run: false,
    weights_version: offline.weightsVersion,
    offline: { total: offline.total, exact: offline.exact, exact_rate: offline.exactRate, rows: offline.rows },
    live: live ? { total: live.total, readable: live.readable, passed: live.passed, unreadable: live.unreadable, agreement: live.agreement, rows: live.rows } : null,
  };
  writeRunState('grader-calibration', summary);
  writeJson(repoPath('12_Brain/state/grader-calibration-last.json'), summary);

  if (args.json) console.log(JSON.stringify(summary, null, 2));
  else console.log(lines.join('\n'));

  process.exit(ok ? 0 : 4);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
