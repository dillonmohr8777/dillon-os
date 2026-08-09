'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, readJson, writeJson, todayISO, nowISO, walkMarkdown } = require('./fsutil');
const { loadRegistry, writeRunState } = require('./registry');
const { parseFrontmatter } = require('./frontmatter');

const AUTOMATION_ID = 'competitive-task-orchestrator';

const LANES = [
  {
    id: 'gmail-intel',
    name: 'Gmail intelligence',
    agent: '.cursor/agents/gmail-intel.md',
    skill: 'inbox-brief',
    tier: 0,
    parallel: true,
    inputs: ['Gmail MCP or vault mirrors'],
    outputs: ['Daily-Briefs/inbox-brief-YYYY-MM-DD.md'],
  },
  {
    id: 'slack-intel',
    name: 'Slack intelligence',
    agent: '.cursor/agents/slack-intel.md',
    skill: 'slack-intake',
    tier: 0,
    parallel: true,
    inputs: ['Slack MCP or 00_Inbox/slack/'],
    outputs: ['00_Inbox/slack/*.md', 'Daily-Briefs/slack-intake-YYYY-MM-DD.md'],
  },
  {
    id: 'vault-pulse',
    name: 'Vault pulse',
    agent: '.cursor/agents/vault-pulse.md',
    skill: 'client-pulse',
    tier: 0,
    parallel: true,
    inputs: ['01_Clients/', 'Dashboard.md'],
    outputs: ['Daily-Briefs/pulse-today.md'],
  },
  {
    id: 'codex-session-sync',
    name: 'Codex and session sync',
    agent: '.cursor/agents/codex-session-sync.md',
    skill: 'session-mine',
    tier: 0,
    parallel: true,
    inputs: ['10_Sessions/', '12_Brain/raw/sessions/'],
    outputs: ['12_Brain/raw/sessions/session-log.md'],
  },
  {
    id: 'domain-ads-seo',
    name: 'Domain, ads, and SEO health',
    agent: '.cursor/agents/domain-ads-seo.md',
    skill: 'site-grade',
    tier: 0,
    parallel: true,
    inputs: ['12_Brain/registry/properties.json', 'Daily-Briefs/radar-*.md'],
    outputs: ['Daily-Briefs/site-health-report.md'],
  },
  {
    id: 'content-routines',
    name: 'Content routines',
    agent: '.cursor/agents/content-routines.md',
    skill: 'content-scan',
    tier: 0,
    parallel: true,
    inputs: ['03_Content/', '02_FullTimeJob/AlignHCM/linkedin-calendar.md'],
    outputs: ['Daily-Briefs/content-routines-YYYY-MM-DD.md'],
  },
  {
    id: 'memory-consolidator',
    name: 'Memory consolidator',
    agent: '.cursor/agents/memory-consolidator.md',
    skill: 'vault-compile',
    tier: 0,
    parallel: false,
    depends_on: ['gmail-intel', 'slack-intel', 'vault-pulse', 'codex-session-sync', 'domain-ads-seo', 'content-routines'],
    inputs: ['lane outputs', 'automation-runs/competitive-task-orchestrator/YYYY-MM-DD/'],
    outputs: ['Daily-Briefs/competitive-task-today.md', 'Dashboard.md'],
  },
];

const LEGACY_AUTOMATIONS = [
  'morning-loop-slack-am-pulse',
  'nightly-client-pulse',
  'gmail-to-vault-digest',
  'vault-integrity-sync',
  'chat-to-vault-sync',
  'bok-law-social-content',
  'linkedin-growth-engine',
  'book-site-seo-sweep',
];

function runDir(date = todayISO()) {
  return repoPath('automation-runs', AUTOMATION_ID, date);
}

function scanSlackInbox() {
  const dir = repoPath('00_Inbox/slack');
  if (!fs.existsSync(dir)) return { total: 0, new: 0, items: [] };
  const items = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data } = parseFrontmatter(text);
      return {
        file: `00_Inbox/slack/${f}`,
        status: data.status || 'unknown',
        priority: data.priority || null,
        type: data.type || null,
        client: data.client || null,
        requested_by: data.requested_by || null,
      };
    });
  return {
    total: items.length,
    new: items.filter((i) => i.status === 'new').length,
    items,
  };
}

function scanClientPulse() {
  const clientsDir = repoPath('01_Clients');
  const rows = [];
  for (const ent of fs.readdirSync(clientsDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const overview = path.join(clientsDir, ent.name, 'overview.md');
    if (!fs.existsSync(overview)) continue;
    const { data } = parseFrontmatter(fs.readFileSync(overview, 'utf8'));
    rows.push({
      client: ent.name,
      status: data.status || null,
      next_action: data.next_action || null,
      due: data.due || null,
      last_touched: data.last_touched || null,
    });
  }
  const urgent = rows.filter(
    (r) =>
      r.status === 'at_risk' ||
      (r.next_action && /urgent|blocked/i.test(r.next_action)) ||
      (r.due && r.due !== 'none')
  );
  return { total: rows.length, urgent_count: urgent.length, urgent };
}

function scanSessions() {
  const sessions = walkMarkdown(repoPath('10_Sessions'));
  const rawLog = repoPath('12_Brain/raw/sessions/session-log.md');
  return {
    session_notes: sessions.length,
    raw_log_exists: fs.existsSync(rawLog),
    newest_session: sessions
      .map((f) => ({ file: path.relative(repoPath(), f), mtime: fs.statSync(f).mtime.toISOString() }))
      .sort((a, b) => (a.mtime < b.mtime ? 1 : -1))[0] || null,
  };
}

function readLatestRadar() {
  const dir = repoPath('Daily-Briefs');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('radar-') && f.endsWith('.md'))
    .sort()
    .reverse();
  if (!files.length) return null;
  const file = files[0];
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  const tracked = text.match(/tracked:\s*(\d+)/i);
  const buildQueue = text.match(/build_queue:\s*(\d+)/i);
  return {
    file: `Daily-Briefs/${file}`,
    tracked: tracked ? Number(tracked[1]) : null,
    build_queue: buildQueue ? Number(buildQueue[1]) : null,
  };
}

function loadPreflightState() {
  const ids = ['frontmatter-validate', 'site-health-sentinel'];
  const states = {};
  for (const id of ids) {
    const file = repoPath('12_Brain/state', `${id}.json`);
    states[id] = readJson(file, null);
  }
  return states;
}

function buildPlan({ date = todayISO() } = {}) {
  const registry = loadRegistry();
  const preflight = loadPreflightState();
  const slack = scanSlackInbox();
  const clients = scanClientPulse();
  const sessions = scanSessions();
  const radar = readLatestRadar();

  const blockers = [];
  if (slack.new > 0) blockers.push({ id: 'slack-open-loops', count: slack.new, severity: 'high' });
  if (clients.urgent_count > 0) blockers.push({ id: 'client-urgent', count: clients.urgent_count, severity: 'high' });
  const siteHealth = preflight['site-health-sentinel'];
  if (siteHealth && siteHealth.status === 'fail') {
    blockers.push({ id: 'site-health-fail', severity: 'medium', detail: siteHealth.counts || null });
  }
  for (const [gate, status] of Object.entries(registry.gates || {})) {
    if (String(status).startsWith('pending')) {
      blockers.push({ id: `gate-${gate}`, severity: 'low', status });
    }
  }

  return {
    automation_id: AUTOMATION_ID,
    run_id: `${date}-${Date.now()}`,
    date,
    started_at: nowISO(),
    status: 'planned',
    replaces: LEGACY_AUTOMATIONS,
    lanes: LANES,
    vault_snapshot: { slack, clients, sessions, radar },
    preflight,
    blockers,
    gates: registry.gates || {},
    artifacts: {
      run_dir: `automation-runs/${AUTOMATION_ID}/${date}`,
      plan: `automation-runs/${AUTOMATION_ID}/${date}/run-plan.json`,
      board: `automation-runs/${AUTOMATION_ID}/${date}/approval-board.md`,
      today: `Daily-Briefs/competitive-task-today.md`,
    },
  };
}

function writePlan(plan) {
  const dir = runDir(plan.date);
  fs.mkdirSync(dir, { recursive: true });
  const planFile = path.join(dir, 'run-plan.json');
  writeJson(planFile, plan);
  writeRunState(AUTOMATION_ID, {
    run_id: plan.run_id,
    started_at: plan.started_at,
    status: plan.status,
    date: plan.date,
    blockers: plan.blockers,
    artifact_paths: [planFile],
  });
  return planFile;
}

function rankPriorities(plan) {
  const p0 = [];
  const p1 = [];
  const p2 = [];

  for (const item of plan.vault_snapshot.clients.urgent || []) {
    const entry = {
      source: 'client',
      client: item.client,
      action: item.next_action,
      due: item.due,
      status: item.status,
    };
    if (item.status === 'at_risk' || /urgent|blocked/i.test(item.next_action || '')) p0.push(entry);
    else if (item.due && item.due !== 'none') p1.push(entry);
    else p2.push(entry);
  }

  for (const item of plan.vault_snapshot.slack.items.filter((i) => i.status === 'new')) {
    const entry = {
      source: 'slack',
      file: item.file,
      client: item.client,
      type: item.type,
      requested_by: item.requested_by,
      priority: item.priority,
    };
    if (item.priority === 'urgent') p0.push(entry);
    else if (item.priority === 'high') p1.push(entry);
    else p2.push(entry);
  }

  if (plan.preflight['site-health-sentinel']?.status === 'fail') {
    p1.push({
      source: 'site-health',
      action: 'Review site-health-report.md; book /api/dossier-leads fixture failure is the canary pattern',
    });
  }

  return { p0, p1, p2 };
}

function renderApprovalBoard(plan) {
  const priorities = rankPriorities(plan);
  const lines = [
    '# Competitive Task Approval Board',
    '',
    `Date: ${plan.date}`,
    `Run: ${plan.run_id}`,
    '',
    '## P0 — do today',
    '',
  ];
  if (!priorities.p0.length) lines.push('- None flagged.');
  else priorities.p0.forEach((p) => lines.push(`- **${p.client || p.file || p.source}** — ${p.action || p.type || 'review'}`));

  lines.push('', '## P1 — this week', '');
  if (!priorities.p1.length) lines.push('- None flagged.');
  else priorities.p1.forEach((p) => lines.push(`- **${p.client || p.file || p.source}** — ${p.action || p.type || 'review'}`));

  lines.push('', '## P2 — backlog', '');
  if (!priorities.p2.length) lines.push('- None flagged.');
  else priorities.p2.slice(0, 8).forEach((p) => lines.push(`- ${p.client || p.file || p.source}`));

  lines.push('', '## Tier gates', '');
  lines.push('- Tier 0 (read/analyze/draft): all lane agents run unattended.');
  lines.push('- Tier 1 (reversible tweaks): batch under one approval on the 64GB machine.');
  lines.push('- Tier 2 (send/post/deploy/spend): prepared only; Dillon executes live.');

  lines.push('', '## Legacy automations replaced by this run', '');
  for (const id of plan.replaces) lines.push(`- ${id} → disabled after 3 green runs`);

  return { markdown: lines.join('\n'), priorities };
}

function writeBoard(plan) {
  const { markdown, priorities } = renderApprovalBoard(plan);
  const dir = runDir(plan.date);
  fs.mkdirSync(dir, { recursive: true });
  const boardFile = path.join(dir, 'approval-board.md');
  fs.writeFileSync(boardFile, markdown + '\n');
  const prioritiesFile = path.join(dir, 'priorities.json');
  writeJson(prioritiesFile, priorities);
  return { boardFile, prioritiesFile, priorities };
}

module.exports = {
  AUTOMATION_ID,
  LANES,
  LEGACY_AUTOMATIONS,
  buildPlan,
  writePlan,
  writeBoard,
  rankPriorities,
  renderApprovalBoard,
  scanSlackInbox,
  scanClientPulse,
  scanSessions,
  runDir,
};
