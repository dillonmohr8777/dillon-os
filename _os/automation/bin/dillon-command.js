#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  loadProfile,
  initRun,
  loadRunState,
  runDeterministicLane,
  synthesizeBoard,
  agentPrompt,
  runDirFor,
} = require('../lib/dillon-command');
const { todayISO, repoPath } = require('../lib/fsutil');

function usage() {
  console.log(`Dillon Command Center — unified parallel workflow

Usage:
  node _os/automation/bin/dillon-command.js --init [--date YYYY-MM-DD]
  node _os/automation/bin/dillon-command.js --lane <id> [--date YYYY-MM-DD]
  node _os/automation/bin/dillon-command.js --all-deterministic [--date YYYY-MM-DD]
  node _os/automation/bin/dillon-command.js --synthesize [--date YYYY-MM-DD]
  node _os/automation/bin/dillon-command.js --status [--date YYYY-MM-DD]
  node _os/automation/bin/dillon-command.js --agent-mode [--date YYYY-MM-DD]
  node _os/automation/bin/dillon-command.js --lanes
`);
}

function parseDate(argv) {
  const idx = argv.indexOf('--date');
  return idx >= 0 && argv[idx + 1] ? argv[idx + 1] : todayISO();
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) {
    usage();
    return;
  }

  const date = parseDate(argv);

  if (argv.includes('--lanes')) {
    const profile = loadProfile();
    console.log(JSON.stringify(profile.lanes.map((l) => ({ id: l.id, label: l.label, skills: l.skills })), null, 2));
    return;
  }

  if (argv.includes('--agent-mode')) {
    console.log(agentPrompt(date));
    return;
  }

  if (argv.includes('--init')) {
    const { dir, state } = initRun(date);
    console.log(
      JSON.stringify(
        {
          ok: true,
          date,
          run_dir: path.relative(repoPath(), dir),
          lanes: state.lanes.map((l) => l.id),
          manifest: path.join(path.relative(repoPath(), dir), 'lane-manifest.md'),
        },
        null,
        2
      )
    );
    return;
  }

  if (argv.includes('--status')) {
    const state = loadRunState(date);
    if (!state) {
      console.log(JSON.stringify({ ok: false, error: 'no run state; pass --init first', date }, null, 2));
      process.exitCode = 1;
      return;
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          date,
          run_dir: path.relative(repoPath(), runDirFor(date)),
          status: state.status,
          lanes: state.lanes.map((l) => ({ id: l.id, status: l.status, artifacts: l.artifacts })),
        },
        null,
        2
      )
    );
    return;
  }

  if (argv.includes('--lane')) {
    const idx = argv.indexOf('--lane');
    const laneId = argv[idx + 1];
    if (!laneId) throw new Error('--lane requires an id');
    const result = runDeterministicLane(laneId, date);
    console.log(JSON.stringify({ ok: true, lane: result.lane.id, status: result.lane.status, commands: result.commandResults }, null, 2));
    return;
  }

  if (argv.includes('--all-deterministic')) {
    const profile = loadProfile();
    initRun(date);
    const results = [];
    for (const lane of profile.lanes) {
      if (lane.commands?.length) {
        results.push(runDeterministicLane(lane.id, date));
      }
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          date,
          lanes_run: results.map((r) => ({ id: r.lane.id, status: r.lane.status })),
        },
        null,
        2
      )
    );
    return;
  }

  if (argv.includes('--synthesize')) {
    const { boardPath, state } = synthesizeBoard(date);
    console.log(
      JSON.stringify(
        {
          ok: true,
          date,
          board: path.relative(repoPath(), boardPath),
          status: state.status,
          p0: state.lanes.filter((l) => l.status === 'error').length,
        },
        null,
        2
      )
    );
    return;
  }

  usage();
  process.exitCode = 1;
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exitCode = 1;
}
