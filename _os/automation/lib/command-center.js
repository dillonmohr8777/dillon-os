'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { repoPath, readJson, writeJson, walkMarkdown, todayISO, nowISO } = require('./fsutil');
const { loadRegistry, writeRunState } = require('./registry');

const PROFILE_PATH = repoPath('_os/automation/profiles/dillon-command.json');

function loadProfile(file = PROFILE_PATH) {
  return readJson(file);
}

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    agentMode: false,
    lanes: null,
    date: todayISO(),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--agent-mode') opts.agentMode = true;
    else if (a === '--date') opts.date = argv[++i];
    else if (a === '--lanes') opts.lanes = new Set(argv[++i].split(',').map((s) => s.trim()));
  }
  return opts;
}

function runCommand(command, { dryRun = false, timeoutMs = 120000 } = {}) {
  if (dryRun) {
    return Promise.resolve({ command, status: 'dry-run', stdout: '', stderr: '', code: 0 });
  }
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, cwd: repoPath() });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ command, status: 'timeout', stdout, stderr: 'command timed out', code: 124 });
    }, timeoutMs);
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        command,
        status: code === 0 ? 'ok' : 'error',
        stdout,
        stderr,
        code,
      });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ command, status: 'error', stdout, stderr: err.message, code: 1 });
    });
  });
}

function collectCliSteps(lanes) {
  const steps = [];
  for (const lane of lanes) {
    for (const cmd of lane.cli || []) {
      steps.push({ lane: lane.id, command: cmd });
    }
  }
  return steps;
}

async function runCliSteps(steps, opts) {
  const results = await Promise.all(
    steps.map(async (step) => ({
      lane: step.lane,
      ...(await runCommand(step.command, { dryRun: opts.dryRun })),
    }))
  );
  return results;
}

function parseFrontmatter(text) {
  const out = {};
  if (!text || !text.startsWith('---')) return out;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return out;
  for (const line of text.slice(3, end).split('\n')) {
    const m = line.match(/^([\w-]+)\s*:\s*(.+)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

function scanVaultSignals(date = todayISO()) {
  const inboxDir = repoPath('00_Inbox');
  const slackDir = repoPath('00_Inbox/slack');
  const clientsDir = repoPath('01_Clients');
  const briefsDir = repoPath('Daily-Briefs');

  const inboxNotes = walkMarkdown(inboxDir).filter((f) => !f.includes(`${path.sep}slack${path.sep}`));
  const slackNotes = walkMarkdown(slackDir);
  const slackNew = slackNotes.filter((f) => {
    const fm = parseFrontmatter(fs.readFileSync(f, 'utf8'));
    return fm.status === 'new';
  });

  const dashboard = fs.existsSync(repoPath('Dashboard.md'))
    ? fs.readFileSync(repoPath('Dashboard.md'), 'utf8')
    : '';
  const todaySection = (dashboard.match(/## Today[\s\S]*?(?=## |$)/) || [''])[0];
  const openTodayTasks = (todaySection.match(/- \[ \]/g) || []).length;

  const briefFiles = fs.existsSync(briefsDir)
    ? fs
        .readdirSync(briefsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => ({ name: f, mtime: fs.statSync(path.join(briefsDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)
    : [];

  const hasBrief = (prefix) => briefFiles.some((f) => f.name.startsWith(prefix) && f.name.includes(date));

  let stalledClients = 0;
  let movingClients = 0;
  const cutoff = Date.now() - 48 * 3600000;
  if (fs.existsSync(clientsDir)) {
    for (const ent of fs.readdirSync(clientsDir, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name.startsWith('.')) continue;
      const clientMd = path.join(clientsDir, ent.name, `${ent.name}.md`);
      if (!fs.existsSync(clientMd)) continue;
      const mtime = fs.statSync(clientMd).mtimeMs;
      if (mtime >= cutoff) movingClients += 1;
      else stalledClients += 1;
    }
  }

  return {
    date,
    inbox_unprocessed: inboxNotes.length,
    slack_new_requests: slackNew.length,
    slack_total_filed: slackNotes.length,
    dashboard_open_tasks: openTodayTasks,
    clients_moving_48h: movingClients,
    clients_stalled: stalledClients,
    briefs_present: {
      am_report: hasBrief('am-report-'),
      slack_intake: hasBrief('slack-intake-'),
      inbox_brief: hasBrief('inbox-brief-'),
      pulse: fs.existsSync(repoPath('Daily-Briefs/pulse-today.md')),
    },
    latest_briefs: briefFiles.slice(0, 5).map((f) => f.name),
  };
}

function laneAgentInstructions(lane, date) {
  const skills = (lane.skills || []).map((s) => `/${s}`).join(', ');
  return {
    lane_id: lane.id,
    agent: lane.agent,
    tier: lane.tier,
    parallel: lane.parallel !== false,
    skills: lane.skills || [],
    skill_invocations: skills,
    requires_mcp: lane.requires_mcp || [],
    vault_agent: lane.vault_agent || null,
    outputs: lane.outputs || [],
    prompt: [
      `Lane ${lane.id} (${lane.name}) for ${date}.`,
      skills ? `Run: ${skills}.` : 'Vault analysis only.',
      lane.requires_mcp?.length ? `Requires MCP: ${lane.requires_mcp.join(', ')}.` : '',
      'Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend.',
      'Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

function buildApprovalItems(signals, laneResults, profile) {
  const items = [];
  let rank = 1;

  if (signals.slack_new_requests > 0) {
    items.push({
      rank: rank++,
      tier: 0,
      lane: 'comms',
      title: `${signals.slack_new_requests} new Slack request(s) need review`,
      action: 'Read 00_Inbox/slack/ notes; draft replies in vault only',
      urgency: 'high',
    });
  }
  if (signals.inbox_unprocessed > 0) {
    items.push({
      rank: rank++,
      tier: 0,
      lane: 'comms',
      title: `${signals.inbox_unprocessed} inbox note(s) unprocessed`,
      action: 'Run /inbox-brief or file away per verdict',
      urgency: signals.inbox_unprocessed > 5 ? 'high' : 'medium',
    });
  }
  if (signals.clients_stalled > 0) {
    items.push({
      rank: rank++,
      tier: 0,
      lane: 'clients',
      title: `${signals.clients_stalled} client(s) stalled 48h+`,
      action: 'Review Daily-Briefs/pulse-today.md priority stack',
      urgency: 'medium',
    });
  }

  for (const result of laneResults) {
    if (result.status === 'error') {
      items.push({
        rank: rank++,
        tier: 0,
        lane: result.lane,
        title: `CLI step failed: ${result.command}`,
        action: 'Inspect stderr in evidence-log.md',
        urgency: 'high',
      });
    }
  }

  if (!signals.briefs_present.am_report) {
    items.push({
      rank: rank++,
      tier: 0,
      lane: 'command',
      title: 'Morning report not written today',
      action: 'Command lane runs /am-report after scouts complete',
      urgency: 'high',
    });
  }

  items.push({
    rank: rank++,
    tier: 1,
    lane: 'ads',
    title: 'Tier-1 batch placeholder',
    action: 'After scout synthesis: one approval executes reversible ads tweaks across clients',
    urgency: 'low',
    gated: true,
  });

  items.push({
    rank: rank++,
    tier: 2,
    lane: 'command',
    title: 'Outbound queue',
    action: 'Gmail send, Slack post, deploy, mail — prepared only, never auto-executed',
    urgency: 'low',
    gated: true,
  });

  return items;
}

function renderApprovalBoard({ date, signals, items, lanes, agentInstructions }) {
  const lines = [
    `# Approval board — ${date}`,
    '',
    `Generated: ${nowISO()}`,
    '',
    '## Vault signals',
    '',
    `- Inbox unprocessed: **${signals.inbox_unprocessed}**`,
    `- Slack new requests: **${signals.slack_new_requests}**`,
    `- Clients moving (48h): **${signals.clients_moving_48h}**`,
    `- Clients stalled: **${signals.clients_stalled}**`,
    `- Dashboard open tasks: **${signals.dashboard_open_tasks}**`,
    '',
    '## Ranked items',
    '',
  ];

  for (const item of items) {
    lines.push(
      `${item.rank}. **[Tier ${item.tier}]** ${item.title}`,
      `   - Lane: \`${item.lane}\` · Urgency: ${item.urgency}`,
      `   - Action: ${item.action}`,
      ''
    );
  }

  lines.push('## Parallel lanes', '');
  for (const lane of lanes) {
    lines.push(`- **${lane.id}** (${lane.name}) — agent \`${lane.agent}\`${lane.parallel === false ? ' · runs last' : ''}`);
  }

  if (agentInstructions?.length) {
    lines.push('', '## Agent dispatch (parallel scouts)', '');
    for (const inst of agentInstructions) {
      if (inst.lane_id === 'command') continue;
      lines.push(`### ${inst.lane_id}`, '', inst.prompt, '');
    }
  }

  lines.push(
    '',
    '## One push rule',
    '',
    'Dillon gets exactly one notification per cycle — this board plus the AM report.',
    'Tier 0 runs unattended. Tier 1 batches under one approval. Tier 2 stays gated.',
    ''
  );

  return lines.join('\n');
}

function renderAgentManifest({ date, lanes, signals, agentInstructions }) {
  return {
    workflow: 'dillon-command',
    date,
    generated_at: nowISO(),
    commander: '11_Agents/Master Agent.md',
    contract: profileContract(),
    signals,
    parallel_lanes: agentInstructions.filter((i) => i.lane_id !== 'command'),
    synthesis_lane: agentInstructions.find((i) => i.lane_id === 'command'),
    lanes: lanes.map((l) => ({ id: l.id, name: l.name, agent: l.agent, skills: l.skills || [] })),
    hard_rules: [
      'Never send email, post to Slack, deploy, or change ad spend without explicit Tier-2 approval.',
      'One worker per client per lane; never two writers on the same ads account.',
      'Expired auth marks needs-reauth; other lanes continue.',
      'STOP flag in run folder halts everything.',
    ],
  };
}

function profileContract() {
  return '11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md';
}

function runFolder(date) {
  return repoPath('automation-runs/dillon-command', date);
}

async function runCommandCenter(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const profile = loadProfile();
  let lanes = profile.lanes || [];
  if (opts.lanes) {
    const wanted = opts.lanes;
    const ids = new Set(lanes.map((l) => l.id));
    for (const dep of lanes) {
      for (const d of dep.depends_on || []) ids.add(d);
    }
    lanes = lanes.filter((l) => wanted.has(l.id) || (l.depends_on && l.depends_on.some((d) => wanted.has(d))));
    lanes = lanes.filter((l) => wanted.has(l.id) || !(l.depends_on || []).length);
    // Keep command lane if any scout is selected
    if ([...wanted].some((id) => id !== 'command') && !lanes.find((l) => l.id === 'command')) {
      const commandLane = profile.lanes.find((l) => l.id === 'command');
      if (commandLane) lanes.push(commandLane);
    }
  }

  const parallelLanes = lanes.filter((l) => l.parallel !== false && l.id !== 'command');
  const commandLane = lanes.find((l) => l.id === 'command');

  const cliSteps = collectCliSteps(parallelLanes);
  const cliResults = await runCliSteps(cliSteps, opts);
  const signals = scanVaultSignals(opts.date);
  const approvalItems = buildApprovalItems(signals, cliResults, profile);
  const agentInstructions = lanes.map((lane) => laneAgentInstructions(lane, opts.date));
  const approvalBoard = renderApprovalBoard({
    date: opts.date,
    signals,
    items: approvalItems,
    lanes,
    agentInstructions,
  });
  const agentManifest = renderAgentManifest({
    date: opts.date,
    lanes,
    signals,
    agentInstructions,
  });

  const outDir = runFolder(opts.date);
  if (!opts.dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
    writeJson(path.join(outDir, 'run-state.json'), {
      workflow: profile.id,
      date: opts.date,
      started_at: nowISO(),
      status: 'ok',
      dry_run: false,
      signals,
      cli_results: cliResults.map(({ stdout, stderr, ...rest }) => rest),
      lanes_active: lanes.map((l) => l.id),
    });
    fs.writeFileSync(path.join(outDir, 'approval-board.md'), approvalBoard);
    fs.writeFileSync(path.join(outDir, 'agent-manifest.json'), JSON.stringify(agentManifest, null, 2) + '\n');
    fs.writeFileSync(
      path.join(outDir, 'evidence-log.md'),
      [
        `# Evidence log — ${opts.date}`,
        '',
        '## CLI results',
        '',
        ...cliResults.map(
          (r) =>
            `### ${r.lane}\n\n\`\`\`\n${r.command}\nexit ${r.code}\n${r.stderr ? `stderr: ${r.stderr.slice(0, 500)}\n` : ''}\`\`\``
        ),
        '',
      ].join('\n')
    );
    writeRunState('dillon-command', {
      status: 'ok',
      date: opts.date,
      counts: {
        lanes: lanes.length,
        cli_steps: cliResults.length,
        approval_items: approvalItems.length,
        slack_new: signals.slack_new_requests,
        inbox_unprocessed: signals.inbox_unprocessed,
      },
      artifact_paths: [
        `automation-runs/dillon-command/${opts.date}/approval-board.md`,
        `automation-runs/dillon-command/${opts.date}/agent-manifest.json`,
      ],
    });
  }

  const registry = loadRegistry();
  const superseded = (profile.supersedes || []).join(', ');

  const result = {
    workflow: profile.id,
    name: profile.name,
    date: opts.date,
    dry_run: opts.dryRun,
    lanes: lanes.map((l) => l.id),
    signals,
    cli_results: cliResults,
    approval_items: approvalItems,
    run_folder: opts.dryRun ? null : `automation-runs/dillon-command/${opts.date}`,
    superseded,
    registry_automations: registry.automations.length,
    agent_mode: opts.agentMode ? agentManifest : undefined,
  };

  if (opts.agentMode) {
    result.next_steps = [
      'Spawn parallel scouts per agent-manifest.json parallel_lanes.',
      'Each scout runs its skills (Tier 0) and returns worker JSON.',
      'Command lane runs /am-report and /plan-today to synthesize.',
      'Commit run artifacts and open one PR for Dillon review.',
    ];
  }

  return result;
}

module.exports = {
  loadProfile,
  parseArgs,
  runCommand,
  collectCliSteps,
  runCliSteps,
  scanVaultSignals,
  laneAgentInstructions,
  buildApprovalItems,
  renderApprovalBoard,
  renderAgentManifest,
  runCommandCenter,
};
