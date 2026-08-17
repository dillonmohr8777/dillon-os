'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { repoPath, readJson, writeJson, ensureDir, walkMarkdown, todayISO, nowISO } = require('./fsutil');

function loadProfile() {
  return readJson(repoPath('_os/automation/profiles/dillon-command.json'));
}

function runDirFor(date = todayISO()) {
  return repoPath('automation-runs/dillon-command', date);
}

function parseFrontmatterStatus(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (m) data[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return data;
}

function collectSlackIntake() {
  const slackDir = repoPath('00_Inbox/slack');
  const items = [];
  if (!fs.existsSync(slackDir)) return items;
  for (const file of fs.readdirSync(slackDir).filter((f) => f.endsWith('.md'))) {
    const full = path.join(slackDir, file);
    const text = fs.readFileSync(full, 'utf8');
    const meta = parseFrontmatterStatus(text);
    items.push({
      file: path.relative(repoPath(), full),
      status: meta.status || 'unknown',
      type: meta.type || 'unknown',
      client: meta.client || null,
      requested_by: meta.requested_by || null,
    });
  }
  return items;
}

function collectOpenSlackLoops() {
  const items = collectSlackIntake();
  return items.filter((i) => i.status === 'new' || i.status === 'open');
}

function collectWebsiteBuildAsks(slackItems) {
  return slackItems.filter((i) => i.type === 'website-build');
}

function scanClientMovement(hours = 48) {
  const root = repoPath('01_Clients');
  const cutoff = Date.now() - hours * 3600 * 1000;
  const moving = [];
  const stalled = [];
  for (const file of walkMarkdown(root)) {
    if (!file.endsWith('.md') || file.includes('Client Index')) continue;
    const stat = fs.statSync(file);
    const meta = parseFrontmatterStatus(fs.readFileSync(file, 'utf8'));
    const rel = path.relative(repoPath(), file);
    const row = {
      file: rel,
      last_modified: stat.mtime.toISOString(),
      status: meta.status || null,
      due: meta.due || null,
      next_action: meta.next_action || null,
    };
    if (stat.mtimeMs >= cutoff) moving.push(row);
    else if (!meta.last_touched || meta.last_touched < todayISO()) stalled.push(row);
  }
  return { moving, stalled, scanned: moving.length + stalled.length };
}

function rankP0Items({ openSlack, websiteBuilds, clientScan, profile }) {
  const items = [];
  for (const s of openSlack) {
    const age = s.file;
    let priority = 2;
    let reason = `Open Slack ask (${s.type})`;
    if (s.type === 'ad-task') {
      priority = 0;
      reason = 'Ad task from Slack — check disapprovals/billing';
    }
    if (s.type === 'website-build') {
      priority = 1;
      reason = 'Website build request blocking launch';
    }
    items.push({
      lane: 'comms',
      tier: s.type === 'ad-task' ? 1 : 0,
      priority,
      title: s.file.replace(/\.md$/, ''),
      reason,
      evidence: s.file,
    });
  }
  for (const c of clientScan.stalled.slice(0, 5)) {
    if (c.due && c.due !== 'none' && c.due <= todayISO()) {
      items.push({
        lane: 'clients',
        tier: 1,
        priority: 0,
        title: `Due client work: ${c.file}`,
        reason: `due=${c.due}`,
        evidence: c.file,
      });
    }
  }
  items.sort((a, b) => a.priority - b.priority || a.tier - b.tier);
  return items.slice(0, profile?.board_limit || 12);
}

function renderApprovalBoard({ date, laneResults, ranked, profile }) {
  const lines = [
    `# Dillon Command Center — ${date}`,
    '',
    `Generated: ${nowISO()}`,
    '',
    '## One approval surface',
    '',
    'Tier 0 scouts ran in parallel. Review ranked items below. One approval executes the Tier-1 batch.',
    '',
    '## P0 stack',
    '',
  ];
  if (!ranked.length) {
    lines.push('- No P0 items surfaced from vault scouts.');
  } else {
    for (const [i, item] of ranked.entries()) {
      lines.push(`${i + 1}. **[${item.lane}]** ${item.title} — ${item.reason} (tier ${item.tier})`);
      lines.push(`   - evidence: \`${item.evidence}\``);
    }
  }
  lines.push('', '## Lane status', '');
  for (const lane of profile.lanes) {
    const result = laneResults[lane.id] || { status: 'skipped' };
    const icon = result.status === 'ok' ? '✓' : result.status === 'warn' ? '!' : result.status === 'error' ? '✗' : '–';
    lines.push(`- ${icon} **${lane.name}** (\`${lane.id}\`) — ${result.summary || result.status}`);
    if (result.artifacts?.length) {
      lines.push(`  - artifacts: ${result.artifacts.map((a) => `\`${a}\``).join(', ')}`);
    }
    if (result.blocked) {
      lines.push(`  - blocked: ${result.blocked}`);
    }
  }
  lines.push('', '## Tier 2 queue (Dillon only)', '');
  lines.push('- Outbound: Gmail send, Slack post, deploy/publish, spend changes, credentials');
  lines.push('- See `tier2-queue.md` in the run folder for prepared decision-ready items');
  lines.push('', '## Superseded crons', '');
  lines.push('- Do not schedule separate slack-intake, am-report, or client-pulse crons.');
  lines.push('- Run `/dillon-command` once; lanes fan out in parallel.');
  return lines.join('\n') + '\n';
}

function renderTier2Queue({ openSlack, websiteBuilds }) {
  const lines = [
    '# Tier 2 queue',
    '',
    'Prepared but never auto-executed.',
    '',
  ];
  if (!openSlack.length) {
    lines.push('No open Slack-derived items.');
  } else {
    for (const item of openSlack) {
      lines.push(`- ${item.file} (${item.type}) — needs Dillon approval to act`);
    }
  }
  if (websiteBuilds.length) {
    lines.push('', '## Website builds ready for /site-factory', '');
    for (const w of websiteBuilds) {
      lines.push(`- ${w.file}`);
    }
  }
  return lines.join('\n') + '\n';
}

function renderAgentManifest({ date, profile, laneResults }) {
  return {
    id: 'dillon-command',
    date,
    mode: 'agent',
    contract: profile.contract,
    instructions: [
      'You are the commander (L0). Fan out one sub-agent per lane below in parallel.',
      'Each lane agent follows its skill(s) read-only first (Tier 0).',
      'Synthesize one approval board. Open one PR with board + AM report + pulse.',
      'Never send Slack, email, deploy, or change ad spend without explicit Tier-2 approval.',
    ],
    lanes: profile.lanes.map((lane) => ({
      id: lane.id,
      name: lane.name,
      skills: lane.skills || [lane.skill].filter(Boolean),
      scout: lane.scout,
      outputs: lane.outputs,
      mcp: {
        optional: lane.mcp_optional || [],
        required_for_live: lane.mcp_required_for_live || [],
      },
      prior_status: laneResults[lane.id]?.status || 'pending',
    })),
    artifacts_dir: `automation-runs/dillon-command/${date}/`,
    push: profile.push,
  };
}

function runShellCommand(command, args, { cwd = repoPath() } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d;
    });
    child.stderr.on('data', (d) => {
      stderr += d;
    });
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    child.on('error', (err) => {
      resolve({ code: 1, stdout, stderr: String(err) });
    });
  });
}

async function runLaneCommand(lane) {
  if (!lane.command) {
    return {
      status: 'scout-only',
      summary: 'vault scout only — agent skill required for full output',
      artifacts: [],
    };
  }
  const parts = lane.command.split(/\s+/);
  const bin = parts[0];
  const args = parts.slice(1);
  const nodeBin = bin === 'node' ? 'node' : bin;
  const nodeArgs = bin === 'node' ? args : [bin, ...args];
  const result = await runShellCommand(nodeBin, nodeArgs);
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = null;
  }
  const status = result.code === 0 ? (parsed?.status === 'fail' ? 'warn' : 'ok') : 'error';
  return {
    status,
    summary: parsed?.counts ? JSON.stringify(parsed.counts) : result.code === 0 ? 'completed' : 'command failed',
    artifacts: parsed?.report ? [parsed.report] : parsed?.state ? [parsed.state] : [],
    blocked: result.code !== 0 ? result.stderr.slice(0, 200) : null,
  };
}

async function runVaultScouts(profile) {
  const slackItems = collectSlackIntake();
  const openSlack = collectOpenSlackLoops();
  const websiteBuilds = collectWebsiteBuildAsks(slackItems);
  const clientScan = scanClientMovement();
  const laneResults = {
    command: {
      status: 'ok',
      summary: `${openSlack.length} open Slack loops, ${clientScan.moving.length} moving clients`,
      artifacts: [],
    },
    comms: {
      status: openSlack.length ? 'warn' : 'ok',
      summary: `${slackItems.length} slack notes, ${openSlack.length} open`,
      artifacts: slackItems.slice(0, 5).map((s) => s.file),
    },
    clients: {
      status: clientScan.stalled.length > 10 ? 'warn' : 'ok',
      summary: `${clientScan.moving.length} moving / ${clientScan.stalled.length} stalled`,
      artifacts: [],
    },
  };

  const parallel = profile.lanes.filter((l) => l.command);
  const commandResults = await Promise.all(
    parallel.map(async (lane) => {
      const result = await runLaneCommand(lane);
      return [lane.id, result];
    })
  );
  for (const [id, result] of commandResults) {
    laneResults[id] = result;
  }

  for (const lane of profile.lanes) {
    if (!laneResults[lane.id]) {
      laneResults[lane.id] = {
        status: 'scout-only',
        summary: `skills: ${(lane.skills || []).join(', ') || lane.skill || 'n/a'}`,
        artifacts: [],
        blocked: lane.mcp_required_for_live?.length
          ? `live reads need MCP: ${lane.mcp_required_for_live.join(', ')}`
          : null,
      };
    }
  }

  return { slackItems, openSlack, websiteBuilds, clientScan, laneResults };
}

async function runDillonCommand(options = {}) {
  const date = options.date || todayISO();
  const profile = loadProfile();
  const runDir = runDirFor(date);
  ensureDir(runDir);

  const scouts = await runVaultScouts(profile);
  const ranked = rankP0Items({ ...scouts, profile });

  const runState = {
    id: 'dillon-command',
    date,
    started_at: nowISO(),
    status: 'ok',
    lanes: scouts.laneResults,
    counts: {
      slack_total: scouts.slackItems.length,
      slack_open: scouts.openSlack.length,
      website_builds: scouts.websiteBuilds.length,
      clients_moving: scouts.clientScan.moving.length,
      clients_stalled: scouts.clientScan.stalled.length,
      p0_items: ranked.length,
    },
    p0: ranked,
  };

  const board = renderApprovalBoard({
    date,
    laneResults: scouts.laneResults,
    ranked,
    profile,
  });
  const tier2 = renderTier2Queue({
    openSlack: scouts.openSlack,
    websiteBuilds: scouts.websiteBuilds,
  });

  const boardPath = path.join(runDir, 'approval-board.md');
  const tier2Path = path.join(runDir, 'tier2-queue.md');
  const statePath = path.join(runDir, 'run-state.json');
  fs.writeFileSync(boardPath, board);
  fs.writeFileSync(tier2Path, tier2);
  writeJson(statePath, runState);

  const manifest = renderAgentManifest({ date, profile, laneResults: scouts.laneResults });
  const manifestPath = path.join(runDir, 'agent-manifest.json');
  writeJson(manifestPath, manifest);

  return {
    date,
    runDir: path.relative(repoPath(), runDir),
    boardPath: path.relative(repoPath(), boardPath),
    statePath: path.relative(repoPath(), statePath),
    manifestPath: path.relative(repoPath(), manifestPath),
    counts: runState.counts,
    manifest: options.agentMode ? manifest : undefined,
  };
}

module.exports = {
  loadProfile,
  runDirFor,
  collectSlackIntake,
  collectOpenSlackLoops,
  scanClientMovement,
  rankP0Items,
  renderApprovalBoard,
  renderAgentManifest,
  runDillonCommand,
};
