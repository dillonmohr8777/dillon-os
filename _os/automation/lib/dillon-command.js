'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath, ensureDir, readJson, writeJson, nowISO, todayISO, walkMarkdown } = require('./fsutil');

const PROFILE_PATH = repoPath('_os/automation/profiles/dillon-command.json');

function loadProfile() {
  return readJson(PROFILE_PATH);
}

function runDirFor(date = todayISO()) {
  return repoPath('automation-runs/dillon-command', date);
}

function initRun(date = todayISO()) {
  const profile = loadProfile();
  const dir = runDirFor(date);
  ensureDir(dir);

  const lanes = profile.lanes.map((lane) => ({
    id: lane.id,
    label: lane.label,
    tier: lane.tier,
    skills: lane.skills || [],
    commands: lane.commands || [],
    depends_on: lane.depends_on || [],
    blocked_without: lane.blocked_without || [],
    status: 'pending',
    started_at: null,
    finished_at: null,
    artifacts: [],
    notes: [],
  }));

  const state = {
    automation_id: profile.id,
    run_id: `${profile.id}-${date}`,
    date,
    started_at: nowISO(),
    finished_at: null,
    status: 'running',
    lanes,
    profile_version: profile.version,
  };

  writeJson(path.join(dir, 'run-state.json'), state);
  writeLaneManifest(dir, profile, date);
  return { dir, state };
}

function writeLaneManifest(dir, profile, date) {
  const lines = [
    `# Dillon Command Center — lane manifest`,
    ``,
    `Date: ${date}`,
    `Contract: ${profile.contract}`,
    ``,
    `Run eight lanes in parallel. Each lane is Tier 0 (read/draft only).`,
    `Synthesize once all lanes finish, then open one PR.`,
    ``,
  ];

  for (const lane of profile.lanes) {
    lines.push(`## ${lane.id} — ${lane.label}`);
    if (lane.skills?.length) {
      lines.push(`Skills: ${lane.skills.map((s) => `\`/${s}\``).join(', ')}`);
    }
    if (lane.commands?.length) {
      lines.push(`Deterministic: ${lane.commands.map((c) => `\`${c}\``).join(', ')}`);
    }
    if (lane.depends_on?.length) {
      lines.push(`Depends on: ${lane.depends_on.join(', ')}`);
    }
    if (lane.blocked_without?.length) {
      lines.push(`Blocked without MCP: ${lane.blocked_without.join(', ')}`);
    }
    lines.push('');
  }

  fs.writeFileSync(path.join(dir, 'lane-manifest.md'), lines.join('\n'));
}

function loadRunState(date = todayISO()) {
  const file = path.join(runDirFor(date), 'run-state.json');
  return readJson(file);
}

function saveRunState(date, state) {
  writeJson(path.join(runDirFor(date), 'run-state.json'), state);
  return state;
}

function runCommand(command, cwd = repoPath()) {
  const started = Date.now();
  const result = spawnSync(command, {
    shell: true,
    cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    command,
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    duration_ms: Date.now() - started,
  };
}

function runDeterministicLane(laneId, date = todayISO()) {
  const profile = loadProfile();
  const laneDef = profile.lanes.find((l) => l.id === laneId);
  if (!laneDef) throw new Error(`unknown lane: ${laneId}`);

  let state = loadRunState(date);
  if (!state) {
    ({ state } = initRun(date));
  }

  const lane = state.lanes.find((l) => l.id === laneId);
  lane.status = 'running';
  lane.started_at = nowISO();
  saveRunState(date, state);

  const commandResults = [];
  for (const cmd of laneDef.commands || []) {
    commandResults.push(runCommand(cmd));
  }

  lane.status = commandResults.every((r) => r.ok) || commandResults.length === 0 ? 'ok' : 'warn';
  lane.finished_at = nowISO();
  lane.command_results = commandResults;
  lane.artifacts = resolveArtifacts(laneDef, date);
  saveRunState(date, state);

  return { lane, commandResults };
}

function resolveArtifacts(laneDef, date) {
  const found = [];
  for (const pattern of laneDef.artifacts || []) {
    const resolved = pattern.replace(/\{date\}/g, date);
    const full = repoPath(resolved);
    if (resolved.includes('*')) {
      const dir = path.dirname(full);
      const glob = path.basename(full);
      if (fs.existsSync(dir)) {
        const re = new RegExp('^' + glob.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        for (const f of fs.readdirSync(dir)) {
          if (re.test(f)) found.push(path.join(path.dirname(resolved), f));
        }
      }
    } else if (fs.existsSync(full)) {
      found.push(resolved);
    }
  }
  return found;
}

function markLaneAgentComplete(laneId, { status = 'ok', notes = [], artifacts = [] } = {}, date = todayISO()) {
  let state = loadRunState(date);
  if (!state) ({ state } = initRun(date));

  const lane = state.lanes.find((l) => l.id === laneId);
  lane.status = status;
  lane.finished_at = nowISO();
  lane.notes = notes;
  if (artifacts.length) lane.artifacts = artifacts;
  saveRunState(date, state);
  return lane;
}

function collectOpenSlackItems() {
  const slackDir = repoPath('00_Inbox/slack');
  const items = [];
  for (const file of walkMarkdown(slackDir)) {
    const text = fs.readFileSync(file, 'utf8');
    if (/^status:\s*new/m.test(text)) {
      const title = text.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md');
      const priority = text.match(/^priority:\s*(.+)$/m)?.[1] || 'normal';
      const requestedBy = text.match(/^requested_by:\s*(.+)$/m)?.[1] || 'unknown';
      items.push({ file: path.relative(repoPath(), file), title, priority, requestedBy });
    }
  }
  return items;
}

function collectInboxCount() {
  const inbox = repoPath('00_Inbox');
  if (!fs.existsSync(inbox)) return 0;
  return fs.readdirSync(inbox).filter((f) => f.endsWith('.md') && f !== 'Start Here.md').length;
}

function synthesizeBoard(date = todayISO()) {
  const profile = loadProfile();
  let state = loadRunState(date);
  if (!state) ({ state } = initRun(date));

  const slackOpen = collectOpenSlackItems();
  const inboxCount = collectInboxCount();
  const radarPath = repoPath(`Daily-Briefs/radar-${date}.md`);
  const hasRadar = fs.existsSync(radarPath);

  const p0 = [];
  const p1 = [];
  const p2 = [];

  for (const item of slackOpen) {
    const entry = `- **${item.title}** (${item.requestedBy}) — \`${item.file}\``;
    if (item.priority === 'urgent') p0.push(entry);
    else p1.push(entry);
  }

  if (inboxCount > 0) {
    p1.push(`- **Inbox triage** — ${inboxCount} notes in \`00_Inbox/\` need verdicts`);
  }

  if (hasRadar) {
    const radar = fs.readFileSync(radarPath, 'utf8');
    const rebuild = radar.match(/\*\*(\d+)\*\* qualify for a rebuild/)?.[1];
    if (rebuild && Number(rebuild) > 0) {
      p2.push(`- **Outreach queue** — ${rebuild} rebuild candidates in \`Daily-Briefs/radar-${date}.md\``);
    }
  }

  for (const lane of state.lanes) {
    if (lane.status === 'warn' || lane.status === 'error') {
      p1.push(`- **Lane ${lane.id}** — finished ${lane.status}; check run-state`);
    }
    if (lane.blocked_without?.length && lane.status === 'pending') {
      p2.push(`- **Lane ${lane.id}** — blocked without ${lane.blocked_without.join(', ')}`);
    }
  }

  const lines = [
    `# Approval board — ${date}`,
    ``,
    `One push per cycle. Tier 0 scouts complete; Tier 1 batches here; Tier 2 stays gated.`,
    ``,
    `Contract: ${profile.contract}`,
    ``,
    `## P0 — do first`,
    p0.length ? p0.join('\n') : '- None surfaced',
    ``,
    `## P1 — today`,
    p1.length ? p1.join('\n') : '- None surfaced',
    ``,
    `## P2 — queue`,
    p2.length ? p2.join('\n') : '- None surfaced',
    ``,
    `## Lane status`,
    ``,
    `| Lane | Status | Skills |`,
    `|---|---|---|`,
    ...state.lanes.map(
      (l) => `| ${l.id} | ${l.status} | ${(l.skills || []).map((s) => '/' + s).join(', ') || '—'} |`
    ),
    ``,
    `## Operator rules`,
    ...profile.operator_rules.map((r) => `- ${r}`),
    ``,
    `Generated: ${nowISO()}`,
  ];

  const boardPath = path.join(runDirFor(date), 'approval-board.md');
  fs.writeFileSync(boardPath, lines.join('\n'));

  state.finished_at = nowISO();
  state.status = state.lanes.every((l) => l.status === 'ok' || l.status === 'warn' || l.status === 'skipped')
    ? 'ok'
    : 'running';
  state.artifact_paths = [path.relative(repoPath(), boardPath)];
  saveRunState(date, state);

  writeJson(repoPath('12_Brain/state/dillon-command.json'), {
    automation_id: 'dillon-command',
    written_at: nowISO(),
    date,
    status: state.status,
    counts: {
      lanes: state.lanes.length,
      ok: state.lanes.filter((l) => l.status === 'ok').length,
      open_slack: slackOpen.length,
      inbox_notes: inboxCount,
    },
    artifact_paths: state.artifact_paths,
  });

  return { boardPath, state, p0, p1, p2 };
}

function agentPrompt(date = todayISO()) {
  const profile = loadProfile();
  return [
    `# Dillon Command Center — agent mode`,
    ``,
    `Read AGENTS.md, then follow .claude/skills/dillon-command/SKILL.md.`,
    ``,
    `Date: ${date}`,
    `Init: node _os/automation/bin/dillon-command.js --init`,
    ``,
    `Run these ${profile.lanes.length} lanes IN PARALLEL (spawn subagents or parallel tool calls):`,
    ...profile.lanes.map((l) => `- **${l.id}**: ${l.skills.map((s) => '/' + s).join(' + ') || l.commands.join(', ') || 'deterministic only'}`),
    ``,
    `After all lanes finish:`,
    `- node _os/automation/bin/dillon-command.js --synthesize`,
    `- Commit to cursor/dillon-command-${date}`,
    `- Open one PR titled "Dillon Command ${date}"`,
    ``,
    `Hard rules: never send Slack/email, never deploy, never delete vault notes.`,
  ].join('\n');
}

module.exports = {
  loadProfile,
  runDirFor,
  initRun,
  loadRunState,
  saveRunState,
  runDeterministicLane,
  markLaneAgentComplete,
  synthesizeBoard,
  agentPrompt,
  collectOpenSlackItems,
};
