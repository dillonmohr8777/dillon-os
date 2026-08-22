#!/usr/bin/env node
'use strict';

const path = require('path');
const { runDillonCommand, loadProfile, buildApprovalBoard } = require('../lib/dillon-command');
const { readJson, repoPath } = require('../lib/fsutil');

function usage() {
  console.error(`Usage:
  node _os/automation/bin/dillon-command.js run [--date YYYY-MM-DD] [--no-dashboard]
  node _os/automation/bin/dillon-command.js plan
  node _os/automation/bin/dillon-command.js board [--date YYYY-MM-DD] [--print-board]
`);
  process.exit(2);
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === '--help' || cmd === '-h') usage();

  if (cmd === 'plan') {
    const profile = loadProfile();
    console.log(JSON.stringify({ profile, lanes: profile.lanes.map((l) => l.id) }, null, 2));
    return;
  }

  const dateArg = process.argv.includes('--date')
    ? process.argv[process.argv.indexOf('--date') + 1]
    : null;

  if (cmd === 'board') {
    const date = dateArg || new Date().toISOString().slice(0, 10);
    const boardFile = repoPath('automation-runs/dillon-command', date, 'approval-board.md');
    const stateFile = repoPath('automation-runs/dillon-command', date, 'run-state.json');
    if (process.argv.includes('--print-board')) {
      const fs = require('fs');
      if (fs.existsSync(boardFile)) {
        console.log(fs.readFileSync(boardFile, 'utf8'));
        return;
      }
    }
    const state = readJson(stateFile);
    console.log(JSON.stringify({ date, state, boardFile: path.relative(repoPath(), boardFile) }, null, 2));
    return;
  }

  if (cmd === 'run') {
    const result = await runDillonCommand({
      date: dateArg,
      updateDashboard: !process.argv.includes('--no-dashboard'),
    });
    if (process.argv.includes('--print-board')) {
      const fs = require('fs');
      const board = repoPath(result.artifacts.runDir, 'approval-board.md');
      if (fs.existsSync(board)) console.log('\n' + fs.readFileSync(board, 'utf8'));
    } else {
      console.log(JSON.stringify(result.runState, null, 2));
    }
    return;
  }

  usage();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
