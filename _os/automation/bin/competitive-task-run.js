#!/usr/bin/env node
'use strict';

/**
 * Competitive-task umbrella orchestrator CLI.
 *
 * Runs deterministic command lanes in parallel per phase. Agent lanes are
 * deferred to the Cursor orchestrator session (skills + subagents).
 *
 *   node _os/automation/bin/competitive-task-run.js [--dry-run]
 *       [--phase intel] [--refresh-predictions] [--no-brief]
 *
 * Exit 0 = ran (some lanes may be blocked/deferred). Exit 1 = workflow load fail.
 */

const path = require('path');
const { repoPath, todayISO } = require('../lib/fsutil');
const { writeRunState } = require('../lib/registry');
const { runWorkflow, writeReceipt, loadWorkflow } = require('../lib/umbrella-workflow');

function hasFlag(name) {
  return process.argv.includes(name);
}

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function applyEnvDefaults(wf) {
  const home = process.env.HOME || '';
  const repo = repoPath();
  if (!process.env.DILLON_CLIENT_OPERATIONS_ROOT && wf.env) {
    const raw = wf.env.DILLON_CLIENT_OPERATIONS_ROOT || '';
    process.env.DILLON_CLIENT_OPERATIONS_ROOT = raw
      .replace('${HOME}', home)
      .replace('${REPO}', repo);
  }
  if (!process.env.DILLON_REPORT_SOURCE_ROOTS && wf.env) {
    const raw = wf.env.DILLON_REPORT_SOURCE_ROOTS || '';
    process.env.DILLON_REPORT_SOURCE_ROOTS = raw
      .replace('${HOME}', home)
      .replace('${REPO}', repo);
  }
}

async function main() {
  const dryRun = hasFlag('--dry-run');
  const phase = argValue('--phase');
  const flags = new Set();
  if (hasFlag('--refresh-predictions')) flags.add('refresh-predictions');

  let wf;
  try {
    wf = loadWorkflow();
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  }
  applyEnvDefaults(wf);

  const receipt = await runWorkflow({
    dryRun,
    phase,
    flags,
    runId: `CTO-${todayISO()}-${Date.now()}`,
  });

  if (!dryRun) {
    writeReceipt(receipt, { writeBriefSkeleton: !hasFlag('--no-brief') });
    writeRunState('competitive-task-orchestrator', {
      run_id: receipt.run_id,
      started_at: receipt.started_at,
      finished_at: receipt.finished_at,
      status: receipt.status,
      summary: receipt.summary,
      dry_run: false,
    });
  }

  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exit(receipt.summary.failed > 0 ? 2 : 0);
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
