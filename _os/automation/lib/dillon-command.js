'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  repoPath,
  readJson,
  writeJson,
  appendJsonl,
  walkMarkdown,
  todayISO,
  nowISO,
  slugify,
  REPO_ROOT,
} = require('./fsutil');

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, unknown: 4 };

function loadProfile(profilePath) {
  const file = profilePath || repoPath('_os/automation/profiles/dillon-command.json');
  return readJson(file);
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    fm[key] = val;
  }
  return fm;
}

function listSlackInbox() {
  const dir = repoPath('00_Inbox/slack');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const full = path.join(dir, f);
      const text = fs.readFileSync(full, 'utf8');
      const fm = parseFrontmatter(text);
      const stat = fs.statSync(full);
      let ageDays = Math.floor((Date.now() - stat.mtimeMs) / 86400000);
      if (fm.source_as_of) {
        const parsed = Date.parse(fm.source_as_of);
        if (!Number.isNaN(parsed)) {
          ageDays = Math.floor((Date.now() - parsed) / 86400000);
        }
      }
      return {
        file: path.relative(REPO_ROOT, full).replace(/\\/g, '/'),
        title: (text.match(/^# (.+)$/m) || [])[1] || f,
        status: fm.status || 'unknown',
        priority: fm.priority || 'unknown',
        client: fm.client || 'unknown',
        source_as_of: fm.source_as_of || null,
        age_days: ageDays,
      };
    });
}

function scanApprovalQueue() {
  const file = repoPath('System/approval-queue.md');
  if (!fs.existsSync(file)) return { total: 0, items: [], by_risk: {} };
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const items = [];
  for (const line of lines) {
    if (!line.startsWith('- [ ]')) continue;
    const riskMatch = line.match(/Risk:\s*(low|medium|med|high)/i);
    const risk = riskMatch ? riskMatch[1].toLowerCase().replace('med', 'medium') : 'unknown';
    const clientMatch = line.match(/\]\s*-\s*\[[^\]]+\]\s*-\s*\[([^\]]+)\]/);
    const client = clientMatch ? clientMatch[1].split('/')[0].trim() : 'unknown';
    items.push({ line: line.slice(0, 220), risk, client });
  }
  const byRisk = items.reduce((acc, item) => {
    acc[item.risk] = (acc[item.risk] || 0) + 1;
    return acc;
  }, {});
  return { total: items.length, items, by_risk: byRisk };
}

function scanClientPulse() {
  const clientsDir = repoPath('01_Clients');
  const now = Date.now();
  const clients = [];
  if (!fs.existsSync(clientsDir)) return clients;
  for (const ent of fs.readdirSync(clientsDir, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name.startsWith('.')) continue;
    const dir = path.join(clientsDir, ent.name);
    const mdFiles = walkMarkdown(dir);
    let latest = 0;
    for (const f of mdFiles) {
      latest = Math.max(latest, fs.statSync(f).mtimeMs);
    }
    const ageDays = latest ? Math.floor((now - latest) / 86400000) : 999;
    let state = 'stalled';
    if (ageDays < 2) state = 'moving';
    else if (ageDays <= 7) state = 'watch';
    clients.push({ client: ent.name, age_days: ageDays, state, files: mdFiles.length });
  }
  return clients.sort((a, b) => a.age_days - b.age_days);
}

function readRadarSummary() {
  const globDir = repoPath('Daily-Briefs');
  const files = fs
    .readdirSync(globDir)
    .filter((f) => f.startsWith('radar-') && f.endsWith('.md'))
    .sort()
    .reverse();
  if (!files.length) return null;
  const latest = path.join(globDir, files[0]);
  const text = fs.readFileSync(latest, 'utf8');
  const tracked = (text.match(/Tracking \*\*(\d+)\*\*/) || [])[1];
  const buildQueue = (text.match(/\*\*(\d+)\*\* qualify/) || [])[1];
  return {
    file: path.relative(REPO_ROOT, latest).replace(/\\/g, '/'),
    tracked: tracked ? Number(tracked) : null,
    build_queue: buildQueue ? Number(buildQueue) : null,
  };
}

function readStateSnapshot(id) {
  return readJson(repoPath('12_Brain/state', `${id}.json`));
}

function runCommand(spec, { dryRun = false } = {}) {
  return new Promise((resolve) => {
    if (dryRun) {
      resolve({ id: spec.id, state: 'dry_run', cmd: [spec.cmd, ...(spec.args || [])].join(' ') });
      return;
    }
    const timeout = spec.timeout_ms || 120000;
    const child = spawn(spec.cmd, spec.args || [], {
      cwd: REPO_ROOT,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ id: spec.id, state: 'timeout', stdout: stdout.slice(0, 4000), stderr: stderr.slice(0, 2000) });
    }, timeout);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        id: spec.id,
        state: code === 0 ? 'ok' : 'failed',
        exit_code: code,
        stdout: stdout.slice(0, 4000),
        stderr: stderr.slice(0, 2000),
      });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ id: spec.id, state: 'error', error: err.message });
    });
  });
}

async function collectLane(laneId, profile, options = {}) {
  const lane = profile.lanes[laneId];
  const started = nowISO();
  const receipt = {
    lane: laneId,
    agent: lane.agent,
    started_at: started,
    collectors: {},
    commands: [],
    tasks: [],
    blockers: [],
  };

  if (laneId === 'comms') {
    const slack = listSlackInbox();
    const open = slack.filter((s) => s.status === 'new' || s.status === 'open');
    receipt.collectors.slack_inbox = { total: slack.length, open: open.length, items: open };
    receipt.tasks = open
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.age_days - a.age_days)
      .slice(0, 10)
      .map((item) => ({
        title: item.title,
        client: item.client,
        priority: item.priority,
        age_days: item.age_days,
        file: item.file,
        tier: 2,
      }));
    const commState = readStateSnapshot('daily-communications-brain');
    receipt.collectors.communication_state = commState
      ? { status: commState.status, written_at: commState.written_at }
      : { status: 'missing' };
  }

  if (laneId === 'clients') {
    const pulse = scanClientPulse();
    receipt.collectors.client_pulse = {
      moving: pulse.filter((c) => c.state === 'moving').length,
      watch: pulse.filter((c) => c.state === 'watch').length,
      stalled: pulse.filter((c) => c.state === 'stalled').length,
      clients: pulse.slice(0, 20),
    };
    const approvals = scanApprovalQueue();
    receipt.collectors.approval_client_items = approvals.items
      .filter((i) => !/Hermes Gateway|System|Credential|Netlify Capacity|Agent Infrastructure/i.test(i.line))
      .slice(0, 15);
    receipt.tasks = pulse
      .filter((c) => c.state === 'stalled')
      .slice(0, 5)
      .map((c) => ({
        title: `Touch stalled client: ${c.client}`,
        client: c.client,
        age_days: c.age_days,
        tier: 0,
      }));
  }

  if (laneId === 'intelligence') {
    receipt.collectors.grok_state = readStateSnapshot('grok-intelligence-ingest');
    receipt.collectors.craft_brief_state = readStateSnapshot('agent-craft-brief');
    const researchDir = repoPath('12_Brain/06_Research');
    const researchFiles = fs.existsSync(researchDir)
      ? fs.readdirSync(researchDir).filter((f) => f.endsWith('.md'))
      : [];
    receipt.collectors.research_freshness = { count: researchFiles.length, latest: researchFiles.sort().reverse()[0] || null };
  }

  if (laneId === 'websites') {
    receipt.collectors.site_health_state = readStateSnapshot('site-health-sentinel');
    receipt.collectors.radar_summary = readRadarSummary();
    const lpQueue = repoPath('02_Campaigns/Landing Page Build Queue.md');
    receipt.collectors.landing_page_queue = fs.existsSync(lpQueue)
      ? { file: '02_Campaigns/Landing Page Build Queue.md', exists: true }
      : { exists: false };
    for (const cmd of lane.commands || []) {
      receipt.commands.push(await runCommand(cmd, options));
    }
  }

  if (laneId === 'outreach') {
    receipt.collectors.radar_summary = readRadarSummary();
    const csv = repoPath('12_Brain/state/radar/build-queue.csv');
    receipt.collectors.radar_build_queue = fs.existsSync(csv)
      ? { file: '12_Brain/state/radar/build-queue.csv', rows: fs.readFileSync(csv, 'utf8').split('\n').length - 1 }
      : { file: null, rows: 0 };
  }

  if (laneId === 'ads') {
    const approvals = scanApprovalQueue();
    const adsItems = approvals.items.filter((i) =>
      /ads|campaign|meta|google ads|billing|disapprov|spend|lsa|pmax|conversion/i.test(i.line)
    );
    receipt.collectors.approval_ads_items = adsItems.slice(0, 12);
    receipt.tasks = adsItems.slice(0, 5).map((item) => ({
      title: item.line.replace(/^- \[ \]\s*/, '').slice(0, 120),
      client: item.client,
      risk: item.risk,
      tier: item.risk === 'high' ? 2 : 1,
    }));
  }

  if (laneId === 'reporting') {
    receipt.collectors.report_ingest_state = readStateSnapshot('report-brain-ingest');
    const reportsDir = repoPath('Daily-Briefs/reports');
    receipt.collectors.pending_reports = fs.existsSync(reportsDir)
      ? fs.readdirSync(reportsDir).filter((f) => f.endsWith('.html')).slice(-5)
      : [];
  }

  receipt.finished_at = nowISO();
  receipt.task_count = receipt.tasks.length;
  return receipt;
}

function rankP0(allLanes) {
  const candidates = [];
  for (const lane of Object.values(allLanes)) {
    for (const task of lane.tasks || []) {
      candidates.push({ ...task, lane: lane.lane });
    }
  }
  const comms = allLanes.comms;
  if (comms?.collectors?.slack_inbox?.items) {
    for (const item of comms.collectors.slack_inbox.items) {
      if (item.priority === 'urgent') {
        candidates.unshift({
          title: item.title,
          client: item.client,
          lane: 'comms',
          tier: 2,
          p0_reason: 'urgent slack loop',
          file: item.file,
        });
      }
    }
  }
  for (const item of allLanes.ads?.collectors?.approval_ads_items || []) {
    if (/billing|disapprov/i.test(item.line)) {
      candidates.unshift({
        title: item.line.slice(0, 140),
        client: item.client,
        lane: 'ads',
        tier: 2,
        p0_reason: 'billing or disapproval risk',
      });
    }
  }
  const seen = new Set();
  return candidates.filter((c) => {
    const key = slugify(c.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function synthesizeCommandLane(allLanes, profile) {
  const p0 = rankP0(allLanes);
  const approvals = scanApprovalQueue();
  const slackOpen = allLanes.comms?.collectors?.slack_inbox?.open || 0;
  const radar = allLanes.websites?.collectors?.radar_summary || allLanes.outreach?.collectors?.radar_summary;
  return {
    lane: 'command',
    agent: profile.lanes.command.agent,
    started_at: nowISO(),
    synthesis: {
      p0,
      open_approvals: approvals.total,
      open_slack_loops: slackOpen,
      radar_build_queue: radar?.build_queue ?? null,
      stalled_clients: (allLanes.clients?.collectors?.client_pulse?.stalled) || 0,
    },
    tasks: p0.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    })),
    finished_at: nowISO(),
  };
}

function renderApprovalBoard(runId, date, profile, lanes, command) {
  const lines = [
    `# Dillon Command Center — Approval Board`,
    ``,
    `Run: \`${runId}\` · Date: ${date}`,
    ``,
    `> One umbrella cycle. Eight parallel lanes. Nothing sends, publishes, deploys, or spends without explicit approval.`,
    ``,
    `## P0 stack`,
    ``,
  ];
  if (!command.synthesis.p0.length) {
    lines.push(`- No P0 items surfaced from vault evidence. Review open approvals manually.`);
  } else {
    for (const item of command.synthesis.p0) {
      lines.push(`- **${item.title}** (${item.lane}${item.p0_reason ? ` — ${item.p0_reason}` : ''})`);
    }
  }
  lines.push('', '## Lane receipts', '');
  for (const [id, lane] of Object.entries(lanes)) {
    if (id === 'command') continue;
    lines.push(`### ${id}`, `- agent: ${lane.agent}`, `- tasks: ${lane.task_count || 0}`, '');
  }
  lines.push('## Scoreboard', '');
  lines.push(`- Open approvals: **${command.synthesis.open_approvals}**`);
  lines.push(`- Open Slack loops: **${command.synthesis.open_slack_loops}**`);
  lines.push(`- Stalled clients: **${command.synthesis.stalled_clients}**`);
  if (command.synthesis.radar_build_queue != null) {
    lines.push(`- Prospect rebuild queue: **${command.synthesis.radar_build_queue}**`);
  }
  lines.push('', '## Superseded automations', '');
  for (const item of profile.supersedes || []) {
    lines.push(`- ${item}`);
  }
  lines.push('', '## Retained separate loops', '');
  for (const [name, note] of Object.entries(profile.retained_separate || {})) {
    lines.push(`- **${name}** — ${note}`);
  }
  return lines.join('\n');
}

function renderAmReport(date, lanes, command) {
  const lines = [
    `# AM Report — ${date}`,
    '',
    'Generated by Dillon Command Center (umbrella workflow).',
    '',
    '## Top 3 priorities',
    '',
  ];
  const top3 = command.tasks.slice(0, 3);
  if (!top3.length) {
    lines.push('1. Process open Slack loops and approval queue items.');
    lines.push('2. Touch stalled clients surfaced by client pulse.');
    lines.push('3. Verify connector health before any live ads work.');
  } else {
    top3.forEach((t, i) => lines.push(`${i + 1}. ${t.title}`));
  }
  lines.push('', '## Boss requests', '');
  const slackItems = lanes.comms?.collectors?.slack_inbox?.items || [];
  if (!slackItems.length) lines.push('- None with status:new in vault slack inbox.');
  else {
    for (const item of slackItems.slice(0, 5)) {
      lines.push(`- **${item.client}** — ${item.title} (${item.age_days}d old, ${item.priority})`);
    }
  }
  lines.push('', '## Client movement', '');
  const pulse = lanes.clients?.collectors?.client_pulse;
  if (pulse) {
    lines.push(`- Moving: ${pulse.moving} · Watch: ${pulse.watch} · Stalled: ${pulse.stalled}`);
  }
  lines.push('', '## Automation health', '');
  lines.push(`- Open approvals: ${command.synthesis.open_approvals}`);
  lines.push(`- Umbrella lanes executed: ${Object.keys(lanes).length}`);
  return lines.join('\n');
}

async function runCycle(options = {}) {
  const profile = loadProfile(options.profile);
  const date = options.date || todayISO();
  const runId = options.runId || `CMD-${date.replace(/-/g, '')}-${Date.now()}`;
  const dryRun = Boolean(options.dryRun);
  const laneFilter = options.lane ? [options.lane] : Object.keys(profile.lanes).filter((l) => l !== 'command');

  const runDir = repoPath('automation-runs/dillon-command', date);
  if (!dryRun) fs.mkdirSync(runDir, { recursive: true });

  const workerLanes = {};
  await Promise.all(
    laneFilter.map(async (laneId) => {
      workerLanes[laneId] = await collectLane(laneId, profile, { dryRun });
      if (!dryRun) {
        writeJson(path.join(runDir, `lane-${laneId}.json`), workerLanes[laneId]);
      }
    })
  );

  if (!options.lane || options.lane === 'command') {
    workerLanes.command = synthesizeCommandLane(workerLanes, profile);
    if (!dryRun) writeJson(path.join(runDir, 'lane-command.json'), workerLanes.command);
  }

  const command = workerLanes.command || synthesizeCommandLane(workerLanes, profile);
  const board = renderApprovalBoard(runId, date, profile, workerLanes, command);
  const amReport = renderAmReport(date, workerLanes, command);

  const runState = {
    run_id: runId,
    workflow_id: profile.workflow_id,
    date,
    mode: options.agentMode ? 'agent' : 'local',
    dry_run: dryRun,
    started_at: nowISO(),
    lanes: Object.keys(workerLanes),
    synthesis: command.synthesis,
    external_action_attempted: 'none',
    approval_state: 'awaiting_human',
  };

  if (!dryRun) {
    fs.writeFileSync(path.join(runDir, 'approval-board.md'), board);
    fs.writeFileSync(path.join(runDir, 'am-report.md'), amReport);
    fs.writeFileSync(path.join(runDir, `am-report-${date}.md`), amReport);
    writeJson(path.join(runDir, 'run-state.json'), runState);
    fs.writeFileSync(repoPath('Daily-Briefs', `am-report-${date}.md`), amReport);
    fs.writeFileSync(repoPath('Daily-Briefs/pulse-today.md'), renderPulse(workerLanes.clients));
    writeJson(repoPath('12_Brain/state/dillon-command.json'), {
      ...runState,
      finished_at: nowISO(),
      artifact_dir: path.relative(REPO_ROOT, runDir).replace(/\\/g, '/'),
    });
    appendJsonl(repoPath('12_Brain/queue', `dillon-command-${date}.jsonl`), {
      ts: nowISO(),
      run_id: runId,
      lanes: Object.keys(workerLanes),
      p0_count: command.synthesis.p0.length,
    });
  }

  runState.finished_at = nowISO();
  runState.artifacts = dryRun
    ? []
    : [
        path.relative(REPO_ROOT, path.join(runDir, 'approval-board.md')).replace(/\\/g, '/'),
        path.relative(REPO_ROOT, path.join(runDir, 'run-state.json')).replace(/\\/g, '/'),
        `Daily-Briefs/am-report-${date}.md`,
      ];
  return { runState, workerLanes, board, amReport };
}

function renderPulse(clientsLane) {
  const pulse = clientsLane?.collectors?.client_pulse;
  const lines = [
    `# Daily Pulse — ${todayISO()}`,
    '',
    'Generated by Dillon Command Center clients lane.',
    '',
    '## Coverage notes',
    '',
    `- Scanned \`01_Clients/\` directories via umbrella workflow.`,
    '',
  ];
  if (!pulse) {
    lines.push('## Stalled', '', '- Client pulse collector did not run.');
    return lines.join('\n');
  }
  lines.push('## Moving', '');
  for (const c of pulse.clients.filter((x) => x.state === 'moving').slice(0, 8)) {
    lines.push(`- **${c.client}** — touched within 48h`);
  }
  lines.push('', '## Watch', '');
  for (const c of pulse.clients.filter((x) => x.state === 'watch').slice(0, 8)) {
    lines.push(`- **${c.client}** — ${c.age_days}d since last touch`);
  }
  lines.push('', '## Stalled', '');
  for (const c of pulse.clients.filter((x) => x.state === 'stalled').slice(0, 10)) {
    lines.push(`- **${c.client}** — ${c.age_days}d untouched`);
  }
  lines.push('', '## Tomorrow\'s priority stack', '');
  const top = pulse.clients.filter((x) => x.state === 'stalled').slice(0, 3);
  top.forEach((c, i) => lines.push(`${i + 1}. Touch **${c.client}** — longest stall in active roster.`));
  return lines.join('\n');
}

module.exports = {
  loadProfile,
  collectLane,
  runCycle,
  listSlackInbox,
  scanApprovalQueue,
  scanClientPulse,
  rankP0,
  renderApprovalBoard,
};
