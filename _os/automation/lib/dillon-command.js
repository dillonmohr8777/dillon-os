'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./frontmatter');
const {
  repoPath,
  ensureDir,
  readJson,
  writeJson,
  todayISO,
  nowISO,
  walkMarkdown,
} = require('./fsutil');
const { writeRunState, enqueue } = require('./registry');

const PRIORITY_WEIGHT = {
  launch_blocked: 100,
  billing_risk: 95,
  ad_disapproval: 90,
  calendar_commitment: 85,
  boss_request: 80,
  client_deliverable: 70,
  website_ready: 60,
  outreach_queue: 50,
  reporting_gap: 45,
  intelligence: 30,
  operating: 20,
};

function loadProfile() {
  return readJson(repoPath('_os/automation/profiles/dillon-command.json'));
}

function readText(rel) {
  const file = repoPath(rel);
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
}

function listFiles(dir, { pattern = /\.md$/ } = {}) {
  const full = repoPath(dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const ent of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(full, ent.name);
    if (ent.isDirectory()) out.push(...listFiles(path.relative(repoPath(), p), { pattern }));
    else if (pattern.test(ent.name)) out.push(p);
  }
  return out;
}

function newestRadarBrief() {
  const dir = repoPath('Daily-Briefs');
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^radar-\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse();
  return files[0] ? path.join(dir, files[0]) : null;
}

function parseApprovalItems(text) {
  const items = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^- \[ \] (.+?) -- Risk: (\w+)/);
    if (!m) continue;
    const body = m[1];
    const risk = m[2].toLowerCase();
    let category = 'operating';
    let score = PRIORITY_WEIGHT.operating;
    const lower = body.toLowerCase();
    if (/billing|invoice|payment/.test(lower)) {
      category = 'billing_risk';
      score = PRIORITY_WEIGHT.billing_risk;
    } else if (/disapprov|ad change|campaign|google ads|meta ads|lsa/.test(lower)) {
      category = /disapprov/.test(lower) ? 'ad_disapproval' : 'client_deliverable';
      score = PRIORITY_WEIGHT[category] || PRIORITY_WEIGHT.client_deliverable;
    } else if (/publish|deploy|launch|404|site/.test(lower)) {
      category = /blocked|404|doesn't exist/.test(lower) ? 'launch_blocked' : 'website_ready';
      score = PRIORITY_WEIGHT[category] || PRIORITY_WEIGHT.website_ready;
    } else if (/meeting|calendar|teams/.test(lower)) {
      category = 'calendar_commitment';
      score = PRIORITY_WEIGHT.calendar_commitment;
    } else if (/client message|reply|slack/.test(lower)) {
      category = 'boss_request';
      score = PRIORITY_WEIGHT.boss_request;
    }
    items.push({
      id: body.slice(0, 120),
      title: body,
      lane: inferLane(category, body),
      category,
      score,
      risk,
      tier: risk === 'high' ? 2 : 1,
      source: 'System/approval-queue.md',
    });
  }
  return items;
}

function inferLane(category, text) {
  if (category === 'boss_request' || /slack|reply|message/.test(text.toLowerCase())) return 'comms';
  if (category === 'billing_risk' || category === 'ad_disapproval') return 'ads';
  if (category === 'website_ready' || category === 'launch_blocked') return 'websites';
  if (/report|dashboard/.test(text.toLowerCase())) return 'reporting';
  if (/prospect|outreach|radar/.test(text.toLowerCase())) return 'outreach';
  if (/research|grok|intel/.test(text.toLowerCase())) return 'intelligence';
  return 'command';
}

function scanSlackRequests() {
  const files = listFiles('00_Inbox/slack');
  const tasks = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const { data } = parseFrontmatter(text);
    if (data.status !== 'new') continue;
    const rel = path.relative(repoPath(), file).replace(/\\/g, '/');
    const ageDays = data.source_as_of
      ? Math.floor((Date.now() - Date.parse(data.source_as_of)) / 86400000)
      : null;
    tasks.push({
      id: rel,
      title: data.requested_by
        ? `${data.requested_by}: ${path.basename(file, '.md')}`
        : path.basename(file, '.md'),
      lane: 'comms',
      category: data.priority === 'urgent' ? 'boss_request' : 'client_deliverable',
      score: data.priority === 'urgent' ? PRIORITY_WEIGHT.boss_request + 5 : PRIORITY_WEIGHT.boss_request,
      risk: data.priority === 'urgent' ? 'high' : 'medium',
      tier: 2,
      age_days: ageDays,
      client: data.client || null,
      source: rel,
    });
  }
  return tasks;
}

function scanLandingPageQueue() {
  const file = repoPath('02_Campaigns/Landing Page Build Queue.md');
  if (!fs.existsSync(file)) return [];
  const tasks = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!/preview ready|publish/i.test(line)) continue;
    const m = line.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
    if (!m) continue;
    tasks.push({
      id: `lp:${m[1].trim()}`,
      title: `${m[1].trim()} — ${m[3].trim()}`,
      lane: 'websites',
      category: 'website_ready',
      score: PRIORITY_WEIGHT.website_ready,
      risk: 'medium',
      tier: 2,
      source: '02_Campaigns/Landing Page Build Queue.md',
    });
  }
  return tasks;
}

function scanRadarQueue() {
  const radar = newestRadarBrief();
  const tasks = [];
  if (radar) {
    const text = fs.readFileSync(radar, 'utf8');
    const buildMatch = text.match(/\*\*(\d+)\*\* qualify for a rebuild/);
    if (buildMatch) {
      tasks.push({
        id: 'radar:build-queue',
        title: `${buildMatch[1]} prospects qualify for rebuild`,
        lane: 'outreach',
        category: 'outreach_queue',
        score: PRIORITY_WEIGHT.outreach_queue,
        risk: 'low',
        tier: 0,
        source: path.relative(repoPath(), radar).replace(/\\/g, '/'),
      });
    }
  }
  const csv = repoPath('12_Brain/state/radar/build-queue.csv');
  if (fs.existsSync(csv)) {
    const lines = fs.readFileSync(csv, 'utf8').trim().split('\n');
    if (lines.length > 1) {
      tasks.push({
        id: 'radar:csv-queue',
        title: `${lines.length - 1} rows in build-queue.csv`,
        lane: 'outreach',
        category: 'outreach_queue',
        score: PRIORITY_WEIGHT.outreach_queue - 5,
        risk: 'low',
        tier: 0,
        source: '12_Brain/state/radar/build-queue.csv',
      });
    }
  }
  return tasks;
}

function scanClientRisks() {
  const tasks = [];
  const replenish = repoPath('01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md');
  if (fs.existsSync(replenish)) {
    tasks.push({
      id: 'client:replenish-billing',
      title: 'Replenish Google Ads billing block — verify Mia payment + delivery',
      lane: 'ads',
      category: 'billing_risk',
      score: PRIORITY_WEIGHT.billing_risk,
      risk: 'high',
      tier: 2,
      source: '01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md',
    });
  }
  return tasks;
}

function dedupeTasks(tasks) {
  const seen = new Set();
  return tasks
    .filter((t) => {
      const key = t.id || t.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score || String(a.risk).localeCompare(String(b.risk)));
}

async function runLane(lane, context) {
  const started = nowISO();
  const findings = [];
  const errors = [];

  try {
    switch (lane.id) {
      case 'comms':
        findings.push(...scanSlackRequests());
        break;
      case 'clients': {
        const approval = parseApprovalItems(context.approvalQueue);
        findings.push(
          ...approval.filter((i) => ['clients', 'command'].includes(i.lane) && i.category === 'client_deliverable').slice(0, 8)
        );
        break;
      }
      case 'intelligence': {
        const radar = newestRadarBrief();
        if (radar) {
          findings.push({
            id: 'intel:radar',
            title: `Prospect radar updated: ${path.basename(radar, '.md')}`,
            lane: 'intelligence',
            category: 'intelligence',
            score: PRIORITY_WEIGHT.intelligence,
            risk: 'low',
            tier: 0,
            source: path.relative(repoPath(), radar).replace(/\\/g, '/'),
          });
        }
        break;
      }
      case 'websites':
        findings.push(...scanLandingPageQueue());
        break;
      case 'outreach':
        findings.push(...scanRadarQueue());
        break;
      case 'ads':
        findings.push(...scanClientRisks());
        findings.push(
          ...parseApprovalItems(context.approvalQueue).filter((i) => i.lane === 'ads').slice(0, 6)
        );
        break;
      case 'reporting': {
        const reportsDir = repoPath('Daily-Briefs/reports');
        if (fs.existsSync(reportsDir)) {
          const drafts = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.html'));
          if (drafts.length) {
            findings.push({
              id: 'reporting:drafts',
              title: `${drafts.length} draft report(s) in Daily-Briefs/reports`,
              lane: 'reporting',
              category: 'reporting_gap',
              score: PRIORITY_WEIGHT.reporting_gap,
              risk: 'medium',
              tier: 1,
              source: 'Daily-Briefs/reports',
            });
          }
        }
        break;
      }
      case 'command':
        findings.push({
          id: 'command:approval-count',
          title: `${context.approvalCount} open approval items`,
          lane: 'command',
          category: 'operating',
          score: PRIORITY_WEIGHT.operating,
          risk: 'medium',
          tier: 0,
          source: 'System/approval-queue.md',
        });
        break;
      default:
        break;
    }
  } catch (err) {
    errors.push(err.message);
  }

  return {
    lane: lane.id,
    agent: lane.agent,
    skills: lane.skills,
    started,
    finished: nowISO(),
    status: errors.length ? 'degraded' : 'ok',
    findings: dedupeTasks(findings),
    errors,
  };
}

function buildApprovalBoard(allTasks, laneResults, date) {
  const top = allTasks.slice(0, 12);
  const lines = [
    `# Dillon Command Center — Approval Board`,
    ``,
    `Date: ${date}`,
    `Generated: ${nowISO()}`,
    ``,
    `One push per cycle. Tier 0 = auto. Tier 1 = one morning batch approval. Tier 2 = live only.`,
    ``,
    `## Top priorities`,
    ``,
  ];

  for (const [i, task] of top.entries()) {
    lines.push(
      `${i + 1}. **[${task.lane}]** ${task.title}`,
      `   - category: ${task.category} · score: ${task.score} · risk: ${task.risk} · tier: ${task.tier}`,
      `   - source: \`${task.source}\``,
      task.age_days != null ? `   - age: ${task.age_days} days` : null,
      ``
    );
  }

  lines.push(`## Lane status`, ``);
  for (const result of laneResults) {
    lines.push(
      `- **${result.lane}** (${result.agent}): ${result.status} — ${result.findings.length} finding(s)${
        result.errors.length ? ` · errors: ${result.errors.join('; ')}` : ''
      }`
    );
  }

  lines.push(
    ``,
    `## Boss requests (Slack)`,
    ``
  );
  const boss = allTasks.filter((t) => t.lane === 'comms' && t.category === 'boss_request');
  if (!boss.length) lines.push(`- None with status:new`);
  else for (const b of boss) lines.push(`- ${b.title} (${b.age_days ?? '?'} days)`);

  lines.push(
    ``,
    `## Tier 1 batch (reversible, one approval)`,
    ``,
    `- Pause wasteful keywords / negatives after live readback`,
    `- Fix broken CTA links flagged in site-health`,
    `- Draft status replies for Momentum Slack threads (no send)`,
    ``,
    `## Tier 2 queue (live only)`,
    ``,
    `- Any publish, deploy, send, spend, billing, or credential change`,
    `- Replenish billing follow-up with Mia`,
    `- Bar Crawl disapproved ads clearance`,
    ``,
    `> Nothing sends, publishes, or spends without explicit approval.`,
    ``
  );

  return lines.filter((l) => l !== null).join('\n');
}

function buildAmReport(allTasks, laneResults, date) {
  const top3 = allTasks.slice(0, 3);
  const boss = allTasks.filter((t) => t.lane === 'comms');
  const lines = [
    `# AM Report — ${date}`,
    ``,
    `## Top 3 priorities`,
    ``,
  ];
  for (const [i, t] of top3.entries()) {
    lines.push(`${i + 1}. ${t.title} — _${t.category}, ${t.lane} lane_`);
  }
  lines.push(``, `## Boss requests`, ``);
  if (!boss.length) lines.push(`- No open Slack requests with status:new`);
  else for (const b of boss) lines.push(`- **${b.client || 'Momentum'}**: ${b.title}`);
  lines.push(``, `## Client movement`, ``);
  const client = allTasks.filter((t) => ['ads', 'clients'].includes(t.lane)).slice(0, 5);
  if (!client.length) lines.push(`- No new high-priority client flags beyond approval queue`);
  else for (const c of client) lines.push(`- ${c.title}`);
  lines.push(``, `## Parallel lanes`, ``);
  for (const r of laneResults) {
    lines.push(`- **${r.lane}**: ${r.findings.length} items (${r.status})`);
  }
  lines.push(
    ``,
    `## Schedule (from OS Config)`,
    ``,
    `- 07:00 AM report and inbox brief`,
    `- 09:00 Deep work — client deliverables`,
    `- 12:00 Client pulse check`,
    `- 15:00 Content block`,
    `- 17:00 Plan tomorrow and vault clean`,
    ``
  );
  return lines.join('\n');
}

function updateDashboardTop3(tasks) {
  const file = repoPath('Dashboard.md');
  if (!fs.existsSync(file)) return false;
  const top3 = tasks.slice(0, 3);
  const bullets = top3.map(
    (t) => `- [ ] ${t.title.split('—')[0].trim().slice(0, 90)} ([[${t.source}|source]])`
  );
  const text = fs.readFileSync(file, 'utf8');
  const replacement = `## Today\n\nCheckbox items only — \`_os/vault-state.js\` reads this section for the HUD\ndirective feed and skips any other list format.\n\n${bullets.join('\n')}`;
  const updated = text.replace(/## Today\n[\s\S]*?(?=\n## )/, `${replacement}\n`);
  if (updated !== text) {
    fs.writeFileSync(file, updated);
    return true;
  }
  return false;
}

async function runDillonCommand(options = {}) {
  const date = options.date || todayISO();
  const profile = loadProfile();
  const approvalQueue = readText('System/approval-queue.md');
  const approvalCount = (approvalQueue.match(/^- \[ \]/gm) || []).length;
  const context = { approvalQueue, approvalCount, date };

  const laneResults = await Promise.all(profile.lanes.map((lane) => runLane(lane, context)));
  const allTasks = dedupeTasks(laneResults.flatMap((r) => r.findings));
  const approvalItems = parseApprovalItems(approvalQueue);
  const mergedTasks = dedupeTasks([...allTasks, ...approvalItems]).slice(0, 40);

  const runDir = repoPath('automation-runs/dillon-command', date);
  ensureDir(runDir);

  const runState = {
    id: 'dillon-command',
    date,
    started_at: nowISO(),
    status: laneResults.some((r) => r.status === 'degraded') ? 'degraded' : 'ok',
    lanes: laneResults.map((r) => ({
      lane: r.lane,
      agent: r.agent,
      status: r.status,
      findings: r.findings.length,
      errors: r.errors,
    })),
    competitive_tasks: mergedTasks.length,
    approval_open: approvalCount,
    top_priority: mergedTasks[0] || null,
  };

  const board = buildApprovalBoard(mergedTasks, laneResults, date);
  const amReport = buildAmReport(mergedTasks, laneResults, date);
  const tier1 = mergedTasks.filter((t) => t.tier === 1).slice(0, 8);
  const tier2 = mergedTasks.filter((t) => t.tier === 2).slice(0, 12);

  writeJson(path.join(runDir, 'run-state.json'), runState);
  writeJson(path.join(runDir, 'lane-results.json'), laneResults, { compact: true });
  writeJson(path.join(runDir, 'tier1-batch.json'), tier1, { compact: true });
  writeJson(path.join(runDir, 'tier2-queue.json'), tier2, { compact: true });
  fs.writeFileSync(path.join(runDir, 'approval-board.md'), board);
  fs.writeFileSync(path.join(runDir, 'am-report.md'), amReport);

  const briefPath = repoPath(`Daily-Briefs/am-report-${date}.md`);
  fs.writeFileSync(briefPath, amReport);
  const boardCopy = repoPath(`Daily-Briefs/command-board-${date}.md`);
  fs.writeFileSync(boardCopy, board);

  if (options.updateDashboard !== false) {
    runState.dashboard_updated = updateDashboardTop3(mergedTasks);
  }

  runState.finished_at = nowISO();
  writeJson(path.join(runDir, 'run-state.json'), runState);
  writeRunState('dillon-command', runState);
  enqueue('dillon-command', 'run_complete', {
    date,
    tasks: mergedTasks.length,
    lanes: laneResults.length,
  });

  return {
    runState,
    mergedTasks,
    laneResults,
    artifacts: {
      runDir: path.relative(repoPath(), runDir).replace(/\\/g, '/'),
      board: path.relative(repoPath(), boardCopy).replace(/\\/g, '/'),
      amReport: path.relative(repoPath(), briefPath).replace(/\\/g, '/'),
    },
  };
}

module.exports = {
  PRIORITY_WEIGHT,
  loadProfile,
  runLane,
  runDillonCommand,
  parseApprovalItems,
  scanSlackRequests,
  dedupeTasks,
  buildApprovalBoard,
};
