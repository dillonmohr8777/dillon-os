#!/usr/bin/env node
'use strict';

const { runCycle, loadProfile } = require('../lib/dillon-command');

function hasFlag(name) {
  return process.argv.includes(name);
}

function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

async function main() {
  const command = process.argv[2] || 'run';

  if (command === 'profile') {
    console.log(JSON.stringify(loadProfile(argValue('--from')), null, 2));
    return;
  }

  if (command === 'run') {
    const result = await runCycle({
      dryRun: hasFlag('--dry-run'),
      agentMode: hasFlag('--agent-mode'),
      lane: argValue('--lane'),
      date: argValue('--date'),
      profile: argValue('--from'),
    });
    console.log(JSON.stringify(result.runState, null, 2));
    if (hasFlag('--print-board')) {
      console.log('\n--- approval-board ---\n');
      console.log(result.board);
    }
    return;
  }

  console.error(`Usage:
  node _os/automation/bin/dillon-command.js run [--agent-mode] [--dry-run] [--lane <name>] [--print-board]
  node _os/automation/bin/dillon-command.js profile [--from <profile.json>]`);
  process.exit(2);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
