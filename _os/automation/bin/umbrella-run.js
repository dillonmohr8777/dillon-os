#!/usr/bin/env node
/**
 * umbrella-run.js — one orchestrator, parallel deterministic lanes, one ledger.
 *
 *   node _os/automation/bin/umbrella-run.js --slice morning|midday|nightly [--dry-run]
 *
 * Model/agent work is declared in _os/automation/umbrella/manifest.json agent_lanes;
 * this script runs only local evidence collection and ranking. Exit 0 when the slice
 * finished; 2 when any required lane failed; 1 on crash.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const MANIFEST = path.join(VAULT, '_os/automation/umbrella/manifest.json');
const STATE_PATH = path.join(VAULT, '12_Brain/state/umbrella-latest.json');
const LEDGER_PATH = path.join(VAULT, '_os/automation/cadence/run-ledger.jsonl');

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function argValue(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const SLICE = argValue('--slice', 'midday');
const DRY_RUN = process.argv.includes('--dry-run');
const TODAY = ymd();

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}

function expandDate(p) {
  return p.replace(/%DATE%/g, TODAY);
}

function statMtime(rel) {
  const abs = path.join(VAULT, rel);
  try {
    return fs.statSync(abs).mtimeMs;
  } catch {
    return null;
  }
}

function runScript(lane, def) {
  const cmd = def.command.map((part) => expandDate(part));
  const cwd = VAULT;
  const env = { ...process.env };
  if (def.env) {
    for (const key of def.env) {
      if (!env[key] && key === 'DILLON_CLIENT_OPERATIONS_ROOT') {
        const candidates = [
          path.join(os.homedir(), 'Documents/Codex/projects/client-operations'),
          '/home/user/client-operations-canonical',
        ];
        const found = candidates.find((c) =>
          fs.existsSync(path.join(c, 'registry', 'clients.json')));
        if (found) env[key] = found;
      }
    }
  }
  if (DRY_RUN) {
    return { status: 'dry-run', note: cmd.join(' ') };
  }
  const result = spawnSync(cmd[0], cmd.slice(1), {
    cwd,
    env,
    encoding: 'utf8',
    timeout: 120000,
  });
  const codes = def.accept_exit_codes || [0];
  const ok = codes.includes(result.status);
  return {
    status: ok ? 'ok' : 'failed',
    exit_code: result.status,
    stderr_tail: (result.stderr || '').slice(-500),
    stdout_tail: (result.stdout || '').slice(-500),
  };
}

function checkArtifacts(def) {
  const missing = [];
  const stale = [];
  const budgetHours = def.max_age_hours || 30;
  for (const rel of def.paths) {
    const expanded = expandDate(rel);
    const mtime = statMtime(expanded);
    if (mtime === null) {
      if (!def.optional) missing.push(expanded);
      continue;
    }
    const ageH = (Date.now() - mtime) / 3600000;
    if (ageH > budgetHours) stale.push({ path: expanded, age_hours: Math.round(ageH) });
  }
  if (missing.length) {
    return { status: 'failed', missing, stale };
  }
  if (stale.length && !def.optional) {
    return { status: 'warn', missing: [], stale };
  }
  return { status: 'ok', missing: [], stale };
}

function parseApprovalQueue() {
  const text = fs.readFileSync(path.join(VAULT, 'System/approval-queue.md'), 'utf8');
  const open = [];
  for (const line of text.split('\n')) {
    if (line.match(/^- \[ \]/)) open.push(line.replace(/^- \[ \]\s*/, '').slice(0, 200));
  }
  return { open_count: open.length, sample: open.slice(0, 8) };
}

function competitiveTaskRollup() {
  const tasks = [];
  const planPath = path.join(VAULT, `Daily-Briefs/plan-${TODAY}.md`);
  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, 'utf8');
    const oneThing = plan.match(/## The one thing\n+([\s\S]*?)(?=\n## )/);
    if (oneThing) {
      tasks.push({
        rank: 1,
        source: `Daily-Briefs/plan-${TODAY}.md`,
        title: 'Plan one-thing',
        detail: oneThing[1].trim().split('\n').slice(0, 6).join(' '),
      });
    }
  }
  const inboxGlob = path.join(VAULT, `Daily-Briefs/inbox-brief-${TODAY}.md`);
  if (fs.existsSync(inboxGlob)) {
    const inbox = fs.readFileSync(inboxGlob, 'utf8');
    const commitments = inbox.match(/^- \[ \].*$/gm) || [];
    commitments.slice(0, 5).forEach((line, i) => {
      tasks.push({
        rank: tasks.length + 1,
        source: `Daily-Briefs/inbox-brief-${TODAY}.md`,
        title: 'Inbox commitment',
        detail: line.replace(/^- \[ \]\s*/, ''),
      });
    });
  }
  const queue = parseApprovalQueue();
  queue.sample.slice(0, 3).forEach((line) => {
    tasks.push({
      rank: tasks.length + 1,
      source: 'System/approval-queue.md',
      title: 'Approval queue (open)',
      detail: line,
    });
  });
  return {
    status: tasks.length ? 'ok' : 'warn',
    competitive_tasks: tasks,
    note: tasks.length ? '' : 'No dated plan/inbox brief; run morning slice or /plan-today',
  };
}

function approvalSurface() {
  const q = parseApprovalQueue();
  return { status: 'ok', ...q };
}

function learningCarryforward() {
  const proposalsDir = path.join(VAULT, '00_Inbox/Agent-Proposals/Claude');
  let carry = [];
  if (fs.existsSync(proposalsDir)) {
    const files = fs.readdirSync(proposalsDir)
      .filter((f) => f.includes('daily-driver'))
      .sort()
      .slice(-3);
    carry = files.map((f) => `00_Inbox/Agent-Proposals/Claude/${f}`);
  }
  return {
    status: 'ok',
    carryforward_proposals: carry,
    note: 'Merge open daily-learning PR proposals manually; do not open a new PR per night',
  };
}

const BUILTIN = {
  competitiveTaskRollup,
  approvalSurface,
  learningCarryforward,
};

function runLane(laneId, manifest) {
  const def = manifest.lanes[laneId];
  if (!def) return { lane: laneId, status: 'failed', note: 'unknown lane' };
  const started = new Date().toISOString();
  let result;
  if (def.type === 'script') {
    result = runScript(laneId, def);
  } else if (def.type === 'artifact_check') {
    result = checkArtifacts(def);
  } else if (def.type === 'builtin') {
    result = BUILTIN[def.handler]();
  } else {
    result = { status: 'failed', note: `unsupported type ${def.type}` };
  }
  return { lane: laneId, title: def.title, started_at: started, ...result };
}

function appendLedger(entry) {
  if (DRY_RUN) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    cadence: 'umbrella',
    job: entry.lane,
    status: entry.status === 'ok' ? 'ok' : 'failed',
    artifact: STATE_PATH.replace(VAULT + path.sep, '').replace(/\\/g, '/'),
    note: entry.note || entry.status,
  });
  fs.appendFileSync(LEDGER_PATH, line + '\n');
}

function renderMarkdown(manifest, sliceDef, laneResults, agentLanes) {
  const lines = [
    '---',
    `date: ${TODAY}`,
    'type: umbrella-brief',
    `slice: ${SLICE}`,
    '---',
    '',
    `# Umbrella workflow — ${TODAY} (${SLICE})`,
    '',
    manifest.slices[SLICE].label + '.',
    '',
    '## Deterministic lanes',
    '',
    '| Lane | Status | Note |',
    '| --- | --- | --- |',
  ];
  for (const r of laneResults) {
    const note = r.note || r.missing?.join(', ') || r.stale?.map((s) => s.path).join(', ') || '';
    lines.push(`| ${r.title || r.lane} | ${r.status} | ${String(note).replace(/\|/g, '/').slice(0, 120)} |`);
  }
  const rollup = laneResults.find((r) => r.lane === 'competitive-task-rollup');
  if (rollup?.competitive_tasks?.length) {
    lines.push('', '## Competitive tasks (single board)', '');
    rollup.competitive_tasks.forEach((t) => {
      lines.push(`1. **${t.title}** — ${t.detail.slice(0, 160)}`);
      lines.push(`   - source: ${t.source}`);
    });
  }
  lines.push('', '## Parallel agent lanes (model work)', '');
  for (const a of agentLanes) {
    lines.push(`- **${a.agent}**: ${a.when}`);
  }
  lines.push(
    '',
    '## Retire duplicate automations',
    '',
    'Do not open a new pull request for this workflow. Commit artifacts to `main` or update one rolling branch.',
    'See `System/UMBRELLA-WORKFLOW.md` and manifest `deprecated_standalone_automations`.',
    ''
  );
  return lines.join('\n');
}

function main() {
  const manifest = readJson(MANIFEST);
  const sliceDef = manifest.slices[SLICE];
  if (!sliceDef) {
    console.error(`Unknown slice: ${SLICE}`);
    process.exit(1);
  }

  const laneIds = sliceDef.lanes;
  const byGroup = {};
  for (const id of laneIds) {
    const g = manifest.lanes[id]?.parallel_group || 'default';
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(id);
  }

  const laneResults = [];
  for (const group of Object.keys(byGroup)) {
    const ids = byGroup[group];
    const batch = ids.map((id) => runLane(id, manifest));
    laneResults.push(...batch);
    batch.forEach(appendLedger);
  }

  const failed = laneResults.filter((r) => r.status === 'failed');
  const generatedAt = new Date().toISOString();
  const state = {
    automation_id: 'umbrella-run',
    started_at: generatedAt,
    finished_at: generatedAt,
    generated_at: generatedAt,
    status: failed.length ? 'warn' : 'ok',
    dry_run: DRY_RUN,
    slice: SLICE,
    lanes: laneResults,
    agent_lanes: manifest.agent_lanes,
    summary: `${SLICE}: ${laneResults.length} lanes, ${failed.length} failed`,
    artifact_paths: [
      '12_Brain/state/umbrella-latest.json',
      `Daily-Briefs/umbrella-${TODAY}.md`,
    ],
  };

  const briefPath = path.join(VAULT, `Daily-Briefs/umbrella-${TODAY}.md`);
  const brief = renderMarkdown(manifest, sliceDef, laneResults, manifest.agent_lanes);

  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
    fs.writeFileSync(briefPath, brief);
  }

  console.log(JSON.stringify({ slice: SLICE, status: state.status, failed: failed.map((f) => f.lane) }, null, 2));
  process.exit(failed.length ? 2 : 0);
}

main();
