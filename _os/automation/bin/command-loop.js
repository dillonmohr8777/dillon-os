#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, todayISO, nowISO } = require('../lib/fsutil');
const { writeRunState } = require('../lib/registry');
const {
  AUTOMATION_ID,
  buildPlan,
  writePlan,
  writeBoard,
} = require('../lib/command-loop');

function usage() {
  console.error(`Usage:
  node _os/automation/bin/command-loop.js plan [--date YYYY-MM-DD]
  node _os/automation/bin/command-loop.js board [--date YYYY-MM-DD]
  node _os/automation/bin/command-loop.js finalize [--date YYYY-MM-DD] --status ok|warn|error`);
  process.exit(2);
}

function parseArgs(argv) {
  const cmd = argv[2];
  const dateIdx = argv.indexOf('--date');
  const date = dateIdx >= 0 ? argv[dateIdx + 1] : todayISO();
  const statusIdx = argv.indexOf('--status');
  const status = statusIdx >= 0 ? argv[statusIdx + 1] : 'ok';
  return { cmd, date, status };
}

function main() {
  const { cmd, date, status } = parseArgs(process.argv);
  if (!cmd || !['plan', 'board', 'finalize'].includes(cmd)) usage();

  if (cmd === 'plan') {
    const plan = buildPlan({ date });
    const planFile = writePlan(plan);
    console.log(
      JSON.stringify(
        {
          status: 'planned',
          automation_id: AUTOMATION_ID,
          date,
          plan: planFile,
          blockers: plan.blockers.length,
          lanes: plan.lanes.length,
        },
        null,
        2
      )
    );
    return;
  }

  if (cmd === 'board') {
    const planFile = repoPath('automation-runs', AUTOMATION_ID, date, 'run-plan.json');
    const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
    const { boardFile, prioritiesFile } = writeBoard(plan);
    console.log(
      JSON.stringify(
        {
          status: 'board-ready',
          board: boardFile,
          priorities: prioritiesFile,
          p0: plan.blockers.length,
        },
        null,
        2
      )
    );
    return;
  }

  if (cmd === 'finalize') {
    const runDir = repoPath('automation-runs', AUTOMATION_ID, date);
    const stateFile = writeRunState(AUTOMATION_ID, {
      automation_id: AUTOMATION_ID,
      run_id: `${date}-final`,
      started_at: nowISO(),
      finished_at: nowISO(),
      status,
      date,
      artifact_paths: [
        path.join(runDir, 'run-plan.json'),
        path.join(runDir, 'approval-board.md'),
        repoPath('Daily-Briefs/competitive-task-today.md'),
      ],
    });
    console.log(JSON.stringify({ status, state: stateFile }, null, 2));
  }
}

main();
