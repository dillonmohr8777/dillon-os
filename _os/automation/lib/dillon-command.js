'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, ensureDir, todayISO, nowISO } = require('./fsutil');
const { writeRunState } = require('./registry');

const PROFILE_PATH = repoPath('_os/automation/profiles/dillon-command.json');

function loadProfile() {
  return readJson(PROFILE_PATH);
}

function runDir(day = todayISO()) {
  return repoPath('automation-runs/dillon-command', day);
}

function loadRunState(day = todayISO()) {
  const file = path.join(runDir(day), 'run-state.json');
  return readJson(file, null);
}

function createRun({ day = todayISO(), mode = 'agent' } = {}) {
  const profile = loadProfile();
  const dir = runDir(day);
  ensureDir(dir);

  const lanes = profile.lanes.map((lane) => ({
    id: lane.id,
    agent: lane.agent,
    skills: lane.skills || [],
    cli: lane.cli || null,
    tier: lane.tier,
    parallel: lane.parallel !== false,
    depends_on: lane.depends_on || [],
    status: 'pending',
    started_at: null,
    finished_at: null,
    artifacts: [],
    blockers: [],
  }));

  const state = {
    automation_id: profile.id,
    run_id: `${profile.id}-${day}`,
    day,
    mode,
    started_at: nowISO(),
    finished_at: null,
    status: 'running',
    targets: profile.targets,
    lanes,
    counts: {
      total: lanes.length,
      pending: lanes.length,
      running: 0,
      ok: 0,
      warn: 0,
      error: 0,
      skipped: 0,
    },
  };

  writeJson(path.join(dir, 'run-state.json'), state);
  return state;
}

function updateLane(day, laneId, patch) {
  const file = path.join(runDir(day), 'run-state.json');
  const state = readJson(file);
  if (!state) throw new Error(`No run state for ${day}`);

  const idx = state.lanes.findIndex((l) => l.id === laneId);
  if (idx === -1) throw new Error(`Unknown lane: ${laneId}`);

  state.lanes[idx] = { ...state.lanes[idx], ...patch };
  recalcCounts(state);
  writeJson(file, state);
  return state;
}

function recalcCounts(state) {
  const c = { total: state.lanes.length, pending: 0, running: 0, ok: 0, warn: 0, error: 0, skipped: 0 };
  for (const lane of state.lanes) {
    const s = lane.status || 'pending';
    if (c[s] !== undefined) c[s] += 1;
    else c.pending += 1;
  }
  state.counts = c;
}

function finishRun(day, { status = 'ok', summary = '' } = {}) {
  const file = path.join(runDir(day), 'run-state.json');
  const state = readJson(file);
  if (!state) throw new Error(`No run state for ${day}`);

  state.finished_at = nowISO();
  state.status = status;
  state.summary = summary;
  recalcCounts(state);
  writeJson(file, state);

  writeRunState('dillon-command', {
    status,
    summary,
    run_id: state.run_id,
    counts: state.counts,
    artifact_paths: [
      `automation-runs/dillon-command/${day}/run-state.json`,
      `automation-runs/dillon-command/${day}/approval-board.md`,
    ],
  });

  return state;
}

function scanCompetitiveSignals() {
  const signals = [];
  const inboxDir = repoPath('00_Inbox/slack');
  if (fs.existsSync(inboxDir)) {
    for (const f of fs.readdirSync(inboxDir).filter((n) => n.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(inboxDir, f), 'utf8');
      const statusMatch = text.match(/^status:\s*(\S+)/m);
      const priorityMatch = text.match(/^priority:\s*(\S+)/m);
      if (statusMatch && statusMatch[1] === 'new') {
        signals.push({
          source: 'slack-intake',
          file: `00_Inbox/slack/${f}`,
          priority: priorityMatch ? priorityMatch[1] : 'normal',
        });
      }
    }
  }

  const briefDir = repoPath('Daily-Briefs');
  const today = todayISO();
  const hasAmReport = fs.existsSync(path.join(briefDir, `am-report-${today}.md`));
  const hasPulse = fs.existsSync(path.join(briefDir, 'pulse-today.md'));

  return { signals, hasAmReport, hasPulse, openSlackRequests: signals.length };
}

function rankSignals(signals, profile) {
  const order = { urgent: 0, high: 1, normal: 2, low: 3 };
  return [...signals].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
}

function buildApprovalBoard(state, profile, signals) {
  const ranked = rankSignals(signals, profile);
  const lines = [
    `# Approval Board — ${state.day}`,
    '',
    `**Run:** ${state.run_id} · **Mode:** ${state.mode}`,
    '',
    '## Targets',
    '',
    ...profile.targets.map((t) => `- ${t}`),
    '',
    '## Lane status',
    '',
    '| Lane | Agent | Status | Artifacts |',
    '| --- | --- | --- | --- |',
  ];

  for (const lane of state.lanes) {
    const arts = (lane.artifacts || []).join(', ') || '—';
    lines.push(`| ${lane.id} | ${lane.agent} | ${lane.status} | ${arts} |`);
  }

  lines.push('', '## P0 queue (open Slack + inbox)', '');
  if (!ranked.length) {
    lines.push('_No open Slack requests with status:new._');
  } else {
    for (const s of ranked.slice(0, 8)) {
      lines.push(`- **${s.priority}** — [[${s.file}]]`);
    }
  }

  lines.push('', '## Tier 1 batch (approve once to execute)', '');
  lines.push('_Prepared by lane scouts. Commander fills after synthesis._');
  lines.push('');
  lines.push('## Tier 2 queue (Dillon executes live)', '');
  lines.push('_Sends, deploys, spend changes, credentials — never autonomous._');
  lines.push('');

  const tier2 = state.lanes
    .flatMap((l) => (l.blockers || []).map((b) => ({ lane: l.id, blocker: b })))
    .filter(Boolean);
  if (tier2.length) {
    for (const t of tier2) {
      lines.push(`- [${t.lane}] ${t.blocker}`);
    }
  } else {
    lines.push('_None flagged this cycle._');
  }

  return lines.join('\n') + '\n';
}

function renderAgentPrompt(profile, day = todayISO()) {
  const parallelLanes = profile.lanes.filter((l) => l.parallel !== false);
  const commander = profile.lanes.find((l) => l.id === 'command');

  const laneBlocks = parallelLanes
    .map((lane) => {
      const skillList = (lane.skills || []).map((s) => `\`/${s}\``).join(', ');
      const cliLine = lane.cli ? `\n   - CLI: \`${lane.cli}\`` : '';
      const trigger = lane.trigger ? `\n   - Trigger: ${lane.trigger}` : '';
      return `### Lane ${lane.id} — ${lane.agent} (Codex ${lane.codex_lane || '?'})
- Skills: ${skillList || 'none'}${cliLine}${trigger}
- Outputs: ${(lane.outputs || []).join(', ')}
- Tier ${lane.tier} · parallel`;
    })
    .join('\n\n');

  const commanderSkills = (commander.skills || []).map((s) => `\`/${s}\``).join(', ');

  return `# Dillon Command Center — ${day}

You are the **commander** (Master Agent). Run one umbrella cycle with **${parallelLanes.length} parallel lane agents**, then synthesize.

## Read first
1. \`AGENTS.md\` and \`11_Agents/Master Agent.md\`
2. \`11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md\` (approval tiers)
3. \`_os/automation/profiles/dillon-command.json\` (lane contract)
4. Initialize run: \`node _os/automation/bin/dillon-command.js --init\`

## Phase 1 — Parallel scouts (Tier 0, all at once)

Launch **one subagent per lane** below. Each lane agent follows its skill(s) exactly. Read/draft only.

${laneBlocks}

**Intelligence lane:** skip \`/research-sweep\` unless research is stale (>7d) or a trigger fired.

## Phase 2 — Commander synthesis (sequential)

After all scouts return:
1. Run ${commanderSkills} to produce today's briefing and plan.
2. Build \`automation-runs/dillon-command/${day}/approval-board.md\` — one ranked board, ≤8 client cards.
3. Update \`Dashboard.md\` \`## Today\` with top 3 priorities.
4. Run \`node _os/automation/bin/dillon-command.js --finalize\`

## Hard rules
${profile.hard_rules.map((r) => `- ${r}`).join('\n')}

## P0 tie-break
${profile.p0_tiebreak.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Deliverable
Commit to \`cursor/dillon-command-${day}\` and open one PR: **Dillon Command ${day}** — approval board + AM report.
`;
}

function writeApprovalBoard(day, content) {
  const file = path.join(runDir(day), 'approval-board.md');
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
  return file;
}

module.exports = {
  loadProfile,
  runDir,
  loadRunState,
  createRun,
  updateLane,
  finishRun,
  scanCompetitiveSignals,
  buildApprovalBoard,
  renderAgentPrompt,
  writeApprovalBoard,
};
