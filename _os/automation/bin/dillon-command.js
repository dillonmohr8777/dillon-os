#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  loadProfile,
  createRun,
  loadRunState,
  finishRun,
  scanCompetitiveSignals,
  buildApprovalBoard,
  renderAgentPrompt,
  writeApprovalBoard,
  runDir,
} = require('../lib/dillon-command');
const { todayISO } = require('../lib/fsutil');

function usage() {
  console.log(`Dillon Command Center — umbrella parallel-agent workflow

Usage:
  node _os/automation/bin/dillon-command.js --plan          Print lane topology
  node _os/automation/bin/dillon-command.js --agent-mode    Print cloud-agent prompt
  node _os/automation/bin/dillon-command.js --init          Create today's run-state
  node _os/automation/bin/dillon-command.js --board         Write approval-board.md
  node _os/automation/bin/dillon-command.js --finalize      Mark run complete
  node _os/automation/bin/dillon-command.js --status        Show last run state
`);
}

function cmdPlan() {
  const profile = loadProfile();
  console.log(JSON.stringify({ id: profile.id, lanes: profile.lanes.map((l) => ({
    id: l.id,
    agent: l.agent,
    skills: l.skills,
    codex_lane: l.codex_lane,
    parallel: l.parallel !== false,
  })) }, null, 2));
}

function cmdAgentMode() {
  const profile = loadProfile();
  const day = todayISO();
  console.log(renderAgentPrompt(profile, day));
}

function cmdInit() {
  const day = todayISO();
  const state = createRun({ day, mode: process.argv.includes('--dry-run') ? 'dry-run' : 'agent' });
  console.log(JSON.stringify({ ok: true, run_id: state.run_id, dir: runDir(day) }, null, 2));
}

function cmdBoard() {
  const profile = loadProfile();
  const day = todayISO();
  let state = loadRunState(day);
  if (!state) state = createRun({ day, mode: 'agent' });

  const { signals } = scanCompetitiveSignals();
  const board = buildApprovalBoard(state, profile, signals);
  const file = writeApprovalBoard(day, board);
  console.log(JSON.stringify({ ok: true, file, open_slack: signals.length }, null, 2));
}

function cmdFinalize() {
  const day = todayISO();
  const state = loadRunState(day);
  if (!state) {
    console.error(JSON.stringify({ ok: false, error: 'no run state — run --init first' }));
    process.exitCode = 1;
    return;
  }
  const finished = finishRun(day, { status: 'ok', summary: 'Command cycle complete' });
  console.log(JSON.stringify({ ok: true, run_id: finished.run_id, counts: finished.counts }, null, 2));
}

function cmdStatus() {
  const day = todayISO();
  const state = loadRunState(day);
  const { signals, hasAmReport, hasPulse } = scanCompetitiveSignals();
  console.log(
    JSON.stringify(
      {
        day,
        run: state,
        competitive: { open_slack: signals.length, has_am_report: hasAmReport, has_pulse: hasPulse },
      },
      null,
      2
    )
  );
}

function main() {
  const arg = process.argv.find((a) => a.startsWith('--')) || '--help';
  switch (arg) {
    case '--plan':
      return cmdPlan();
    case '--agent-mode':
      return cmdAgentMode();
    case '--init':
      return cmdInit();
    case '--board':
      return cmdBoard();
    case '--finalize':
      return cmdFinalize();
    case '--status':
      return cmdStatus();
  default:
      usage();
  }
}

main();
