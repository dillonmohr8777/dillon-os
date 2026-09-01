#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { repoPath, ensureDir, readJson, writeJson, nowISO, todayISO } = require('../lib/fsutil');
const { loadRegistry, writeRunState } = require('../lib/registry');

const WORKFLOW_ID = 'competitive-task-orchestrator';

function loadProfile() {
  return readJson(repoPath('_os/automation/profiles/competitive-task-orchestrator.json'));
}

function parseArgs(argv) {
  const flags = {
    agentMode: argv.includes('--agent-mode'),
    preflight: argv.includes('--preflight'),
    plan: argv.includes('--plan') || argv.includes('--agent-mode'),
    date: todayISO(),
  };
  const dateIdx = argv.indexOf('--date');
  if (dateIdx >= 0 && argv[dateIdx + 1]) flags.date = argv[dateIdx + 1];
  return flags;
}

function runNodeScript(scriptRel, args = []) {
  const script = repoPath(scriptRel);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: repoPath(),
      env: process.env,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      resolve({
        script: scriptRel,
        ok: code === 0,
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

async function runPreflights(profile) {
  const jobs = [];
  for (const lane of profile.lanes) {
    if (!lane.preflight || !lane.preflight.length) continue;
    for (const pf of lane.preflight) {
      jobs.push(
        runNodeScript(pf.script, pf.args || []).then((result) => ({
          lane: lane.id,
          ...result,
        }))
      );
    }
  }
  return Promise.all(jobs);
}

function activeDayGatedLanes(profile, date) {
  const day = new Date(`${date}T12:00:00`).getUTCDay();
  return profile.lanes
    .filter((lane) => {
      if (!lane.day_gated) return true;
      const keys = lane.day_gated[String(day)] || [];
      return keys.length > 0;
    })
    .map((lane) => lane.id);
}

function generateApprovalBoard(profile, date, lanes) {
  const lines = [
    `# Approval board — Competitive Task Orchestrator (${date})`,
    '',
    'One umbrella run. Parallel scout lanes. Consolidator synthesizes the operator brief.',
    '',
    `Contract: ${profile.contract}`,
    '',
    '## Lane status',
    '',
    '| Lane | Agent | Skills | Status |',
    '| --- | --- | --- | --- |',
  ];
  for (const lane of lanes) {
    const agent = lane.agent ? path.basename(lane.agent, '.md') : 'cli';
    lines.push(
      `| ${lane.label} | ${agent} | ${(lane.skills || []).join(', ') || '—'} | ${lane.status} |`
    );
  }
  lines.push('', '## P0 stack (max 5)', '', '_Populated by memory-consolidator._', '');
  lines.push('## Tier 1 batch (one approval executes all)', '', '_Reversible tweaks only._', '');
  lines.push('## Tier 2 queue (Dillon only)', '', '_Outbound, deploy, spend — never auto._', '');
  lines.push('', '## Blockers', '', '- ', '');
  return lines.join('\n');
}

function scaffoldRun(profile, date) {
  const runDir = repoPath('automation-runs', WORKFLOW_ID, date);
  ensureDir(runDir);

  const dayGatedActive = activeDayGatedLanes(profile, date);
  const lanes = profile.lanes.map((lane) => ({
    id: lane.id,
    label: lane.label,
    agent: lane.agent || null,
    status: lane.day_gated && !dayGatedActive.includes(lane.id) ? 'skipped-day-gate' : 'pending',
    tier_default: lane.tier_default,
    parallel_group: lane.parallel_group || 'scout',
    skills: lane.skills || [],
    outputs: lane.outputs || [],
    worker: null,
  }));

  const runState = {
    workflow_id: WORKFLOW_ID,
    run_id: `${WORKFLOW_ID}-${date}`,
    date,
    started_at: nowISO(),
    finished_at: null,
    status: 'running',
    commander: 'competitive-task-orchestrator',
    contract: profile.contract,
    lanes,
    day_gated_active: dayGatedActive,
    gates: loadRegistry().gates,
    tier_policy: profile.tier_policy,
    parallel_lane_cap: profile.parallel_lane_cap,
    artifacts: {
      run_dir: runDir,
      approval_board: path.join(runDir, 'approval-board.md'),
      tier1_batch: path.join(runDir, 'tier1-batch.json'),
      tier2_queue: path.join(runDir, 'tier2-queue.json'),
      evidence_log: path.join(runDir, 'evidence-log.md'),
      lane_results: path.join(runDir, 'lane-results.json'),
    },
  };

  writeJson(path.join(runDir, 'run-state.json'), runState);
  fs.writeFileSync(path.join(runDir, 'approval-board.md'), generateApprovalBoard(profile, date, lanes));

  writeJson(path.join(runDir, 'tier1-batch.json'), {
    date,
    items: [],
    note: 'Tier-1 reversible tweaks batched here after scout lanes complete.',
  });

  writeJson(path.join(runDir, 'tier2-queue.json'), {
    date,
    items: [],
    note: 'Tier-2 outbound/deploy/spend — prepared only, never auto-executed.',
  });

  fs.writeFileSync(
    path.join(runDir, 'evidence-log.md'),
    `# Evidence log — ${date}\n\n| time | lane | fact | source |\n| --- | --- | --- | --- |\n`
  );

  writeJson(path.join(runDir, 'lane-results.json'), { date, lanes: {} });

  return { runDir, runState };
}

function agentModeInstructions(profile, date, runDir, preflightResults) {
  const scoutLanes = profile.lanes.filter(
    (l) => l.parallel_group === 'scout' && (!l.day_gated || activeDayGatedLanes(profile, date).includes(l.id))
  );
  const commandLane = profile.lanes.find((l) => l.parallel_group === 'command');

  return {
    workflow: WORKFLOW_ID,
    date,
    run_dir: runDir,
    skill: '.claude/skills/competitive-task-orchestrator/SKILL.md',
    prompt: 'System/competitive-task-orchestrator-prompt.md',
    parallel_lane_cap: profile.parallel_lane_cap,
    scout_lanes: scoutLanes.map((l) => ({
      id: l.id,
      label: l.label,
      agent: l.agent,
      skills: l.skills || [],
      outputs: l.outputs || [],
    })),
    command_lane: commandLane
      ? {
          id: commandLane.id,
          agent: commandLane.agent,
          skills: commandLane.skills,
          runs_after: 'scout',
        }
      : null,
    instructions: [
      'Read System/competitive-task-orchestrator-prompt.md and follow it exactly.',
      'Run: node _os/automation/bin/competitive-task-orchestrator.js --preflight',
      `Execute scout lanes in parallel (max ${profile.parallel_lane_cap} concurrent subagents).`,
      'Invoke memory-consolidator LAST with all scout summaries.',
      'Write Daily-Briefs/competitive-task-today.md and update System/routine-health.md.',
      'Never post Slack, send email, deploy, or spend.',
    ],
    preflight: preflightResults,
    gates: loadRegistry().gates,
  };
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const profile = loadProfile();
  const { runDir, runState } = scaffoldRun(profile, flags.date);

  let preflightResults = [];
  if (flags.preflight || flags.plan || flags.agentMode) {
    preflightResults = await runPreflights(profile);
    writeJson(path.join(runDir, 'preflight-results.json'), {
      date: flags.date,
      results: preflightResults,
    });
  }

  if (flags.agentMode) {
    console.log(
      JSON.stringify(agentModeInstructions(profile, flags.date, runDir, preflightResults), null, 2)
    );
    return;
  }

  const stateFile = writeRunState(WORKFLOW_ID, {
    automation_id: WORKFLOW_ID,
    started_at: runState.started_at,
    status: 'ok',
    dry_run: true,
    summary: `Scaffolded ${runDir}`,
    counts: {
      lanes: profile.lanes.length,
      preflight_jobs: preflightResults.length,
      preflight_ok: preflightResults.filter((r) => r.ok).length,
    },
    artifact_paths: [runDir],
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        run_dir: runDir,
        state: stateFile,
        preflight: preflightResults,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
