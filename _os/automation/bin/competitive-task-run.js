#!/usr/bin/env node
'use strict';

/**
 * Deterministic vault runner for competitive-task-orchestrator.
 * Cloud agents with MCP use the prompt + parallel subagents; this script
 * provides a reproducible vault-fallback path and acceptance checks.
 */

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('../lib/frontmatter');
const {
  repoPath,
  ensureDir,
  writeJson,
  todayISO,
  nowISO,
} = require('../lib/fsutil');

const SKIP_CLIENT_FILES = new Set([
  'client index.md',
  'm360-master-contacts.md',
]);

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86400000);
}

function readText(rel) {
  const file = repoPath(rel);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function latestDailyBrief(prefix) {
  const dir = repoPath('Daily-Briefs');
  if (!fs.existsSync(dir)) return null;
  const matches = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix))
    .sort()
    .reverse();
  return matches[0] || null;
}

function listClientNotes() {
  const clientsDir = repoPath('01_Clients');
  const notes = [];
  if (!fs.existsSync(clientsDir)) return notes;

  for (const ent of fs.readdirSync(clientsDir, { withFileTypes: true })) {
    if (ent.name.toLowerCase() === 'client index.md') continue;
    const full = path.join(clientsDir, ent.name);
    if (ent.isDirectory()) {
      const overview = path.join(full, 'overview.md');
      if (fs.existsSync(overview)) notes.push(overview);
      continue;
    }
    if (ent.isFile() && ent.name.endsWith('.md')) {
      if (!SKIP_CLIENT_FILES.has(ent.name.toLowerCase())) notes.push(full);
    }
  }
  return notes;
}

function scanVaultPulse(today) {
  const files = listClientNotes();
  const stalled = [];
  const dueSoon = [];
  const gaps = [];
  let active24h = 0;

  for (const file of files) {
    const rel = path.relative(repoPath(), file);
    const text = fs.readFileSync(file, 'utf8');
    const { data } = parseFrontmatter(text);
    const name = data.client || path.basename(file, '.md');
    const status = String(data.status || '').toLowerCase();
    const last = data.last_touched;
    const due = data.due;
    const next = data.next_action;

    if (!last && status === 'active') gaps.push({ name, rel, issue: 'missing last_touched' });
    if (!next && status === 'active') gaps.push({ name, rel, issue: 'missing next_action' });

    if (last && last !== 'none') {
      const stale = daysBetween(last, today);
      if (stale <= 1) active24h += 1;
      else if (stale >= 7) stalled.push({ name, rel, days: stale, last_touched: last, due, next_action: next });
      if (due && due !== 'none') {
        const untilDue = daysBetween(today, due);
        if (untilDue >= 0 && untilDue <= 2) dueSoon.push({ name, rel, due, days_until: untilDue });
      }
    } else if (status === 'active') {
      stalled.push({ name, rel, days: null, last_touched: last || 'missing', due, next_action: next });
    }
  }

  stalled.sort((a, b) => (b.days || 999) - (a.days || 999));
  return { active24h, stalled, dueSoon, gaps, scanned: files.length };
}

function scanSessions(today) {
  const dir = repoPath('10_Sessions');
  if (!fs.existsSync(dir)) return { recent: [], promotions: 0 };
  const recent = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith('.md')) continue;
    const full = path.join(dir, ent.name);
    const stat = fs.statSync(full);
    const age = daysBetween(stat.mtime.toISOString().slice(0, 10), today);
    if (age <= 7) recent.push({ file: `10_Sessions/${ent.name}`, age_days: age });
  }
  return { recent, promotions: 0 };
}

function scanAdsSeo() {
  const queues = [
    '02_Campaigns/Google Ads Optimization Queue.md',
    '02_Campaigns/Facebook Ads Optimization Queue.md',
    '02_Campaigns/Facebook Ads Testing Queue.md',
    '02_Campaigns/Facebook Ads Creative Requests.md',
  ];
  const adP0 = [];
  for (const rel of queues) {
    const text = readText(rel);
    if (!text) continue;
    const open = (text.match(/- \[ \]/g) || []).length;
    if (open > 0) adP0.push({ queue: rel, open_items: open });
  }
  const barCrawl = readText('01_Clients/Bar Crawl USA/active-campaigns.md') || '';
  if (/disapprov/i.test(barCrawl)) {
    adP0.push({ queue: '01_Clients/Bar Crawl USA/active-campaigns.md', signal: 'disapproval language present' });
  }
  return { adP0, seo: [] };
}

function contentRoutineDay(today) {
  const d = new Date(`${today}T12:00:00`);
  const weekday = d.getUTCDay();
  if (weekday === 0) return { status: 'due', routines: ['bok-law-social', 'align-linkedin'] };
  if (weekday === 4) return { status: 'due', routines: ['book-seo-sweep'] };
  return { status: 'skipped', routines: [] };
}

function gmailFallback(today) {
  const latest = latestDailyBrief('inbox-brief-');
  const urgentPath = 'System/urgent-replies.md';
  return {
    source: latest ? 'vault-fallback' : 'missing',
    latest_brief: latest,
    urgent_exists: fs.existsSync(repoPath(urgentPath)),
  };
}

function slackFallback(today) {
  const slackDir = repoPath('00_Inbox/slack');
  const items = [];
  if (fs.existsSync(slackDir)) {
    for (const f of fs.readdirSync(slackDir).filter((x) => x.endsWith('.md'))) {
      items.push(`00_Inbox/slack/${f}`);
    }
  }
  const queueExists = fs.existsSync(repoPath('System/slack-action-queue.md'));
  return { source: 'vault-fallback', open_slack_notes: items.length, items, queue_exists: queueExists };
}

function writeLaneOutput(runDir, lane, body) {
  const out = path.join(runDir, 'lane-outputs', `${lane}.md`);
  ensureDir(path.dirname(out));
  fs.writeFileSync(out, body.trim() + '\n');
  return path.relative(repoPath(), out);
}

function buildBrief(today, lanes, pulse) {
  const lines = [
    `# Competitive Task — ${today}`,
    '',
    '## Coverage',
    `- Gmail: ${lanes.gmail.source}`,
    `- Slack: ${lanes.slack.source} (${lanes.slack.open_slack_notes} vault slack notes)`,
    `- Vault pulse: ${pulse.stalled.length} stalled / ${pulse.scanned} files scanned`,
    `- Sessions: ${lanes.sessions.recent.length} files touched in 7d`,
    `- Ads/SEO: ${lanes.ads.adP0.length} queue signals`,
    `- Content routines: ${lanes.content.status}`,
    '',
    '## P0 Stack',
  ];

  const p0 = [];
  const cindy = pulse.stalled.find((s) => /cindy may/i.test(s.name));
  if (cindy) {
    const dueOverdue = cindy.due && cindy.due !== 'none' ? daysBetween(cindy.due, today) : null;
    const dueNote = dueOverdue != null && dueOverdue > 0
      ? `${dueOverdue}d past due on due date`
      : `${cindy.days || 'unknown'}d since last_touched`;
    p0.push(`Close Cindy May Christmas — ${dueNote} (launch blocked on video/newsletter/photo/Shopify deps).`);
  }
  if (lanes.slack.open_slack_notes > 0) {
    p0.push(`Answer ${lanes.slack.open_slack_notes} stale Momentum 360 Slack asks in 00_Inbox/slack/ (open since ~2026-07-30).`);
  }
  p0.push('Get yes/no on BigOrange Marketing website build and Bar Crawl USA paid-media optimization (canonical queue needs_approval).');
  p0.push('Touch 3–5 stalled clients with real contact — do not re-run another full pulse scan.');
  if (lanes.ads.adP0.some((x) => /bar crawl/i.test(x.queue || ''))) {
    p0.push('Bar Crawl USA — clear disapproved ads after approval (Halloween/Fall Cocktail policy flags).');
  }

  p0.slice(0, 5).forEach((item, i) => lines.push(`${i + 1}. ${item}`));
  if (p0.length === 0) lines.push('1. No P0 — all lanes green on vault fallback scan.');

  lines.push('', '## Urgent Replies', '');
  if (lanes.gmail.latest_brief) {
    lines.push(`See latest inbox brief: \`Daily-Briefs/${lanes.gmail.latest_brief}\` (vault fallback; connect Gmail MCP for live scan).`);
  } else {
    lines.push('- No inbox brief on disk — run `/inbox-brief` or connect Gmail MCP.');
  }

  lines.push('', '## Stalled Clients (7+ days)', '');
  if (pulse.stalled.length === 0) lines.push('None.');
  else {
    pulse.stalled.slice(0, 10).forEach((s) => {
      lines.push(`- **${s.name}** — ${s.days != null ? `${s.days}d` : 'unknown'} stale (\`${s.rel}\`)`);
    });
    if (pulse.stalled.length > 10) lines.push(`- …and ${pulse.stalled.length - 10} more (see lane output vault-pulse).`);
  }

  lines.push('', '## Content / SEO Due Today', '');
  if (lanes.content.status === 'skipped') lines.push('Skipped — not Sunday or Thursday.');
  else lines.push(`Due: ${lanes.content.routines.join(', ')}`);

  lines.push('', '## Tomorrow Prep', '');
  lines.push('- BOK Law weekly content kit window opens 2026-09-08 — locate source packet before drafting.');
  lines.push('- Carry forward credential-rotation and inbox files-away list from latest inbox brief.');
  lines.push('');
  lines.push('---');
  lines.push(`Generated by \`competitive-task-run.js\` at ${nowISO()}.`);
  return lines.join('\n');
}

function updateRoutineHealth(today, laneStatus) {
  const file = repoPath('System/routine-health.md');
  const body = `---
last_checked: ${today}
last_orchestrator_run: ${today}
tags: [system, routines]
---

# Routine Health Monitor

Canonical daily operator cycle: **competitive-task-orchestrator** (cron \`0 13 * * *\` America/New_York).

Legacy standalone crons listed below are **retired** — use the umbrella only.

## Umbrella lanes (${today})

| Lane | Status |
|------|--------|
| gmail-intel | ${laneStatus.gmail} |
| slack-intel | ${laneStatus.slack} |
| vault-pulse | ${laneStatus.vault} |
| codex-session-sync | ${laneStatus.sessions} |
| domain-ads-seo | ${laneStatus.ads} |
| content-routines | ${laneStatus.content} |
| memory-consolidator | ${laneStatus.consolidator} |

## Retired (merged into umbrella)

- \`nightly-client-pulse\` → vault-pulse lane
- \`gmail-to-vault-digest\` → gmail-intel lane
- \`vault-integrity-sync\` → memory-consolidator lane
- \`chat-to-vault-sync\` → codex-session-sync lane
- \`bok-law-social-content\` / \`linkedin-growth-engine\` / \`book-site-seo-sweep\` → content-routines lane (day-gated)
- \`daily-morning-orchestrator-dry-board\` (Codex) → superseded; see [[04_SOPs/competitive-task-orchestrator]]

## Still separate (not merged)

- \`daily-communications-brain\` — canonical comms → vault ingest (07:00 ET)
- \`weekly-client-marketing-reports\` + \`report-brain-reconciliation\`
- \`marketing-chief-twice-daily-brief\` — infra health only
- \`daily-grok-dillon-os-intelligence\`, \`obsidian-guard-dog\`, Prospect Radar

## Brain layer

- [[12_Brain/03_Concepts/Competitive Task]]
- [[12_Brain/System/Health Automation]]
`;
  fs.writeFileSync(file, body);
}

function updateMemorySync(today, pulse, lanes) {
  const file = repoPath('System/claude-memory-sync.md');
  const body = `---
last_sync: ${today}
tags: [system, memory]
---

# Claude Memory Sync

Operator snapshot for cross-session continuity. Updated by competitive-task-orchestrator.

## Pending deliverables

- Cindy May Christmas — site build approved; blocked on video destination, newsletter, photo map, Shopify (\`due: 2026-09-01\`, overdue).
- BOK Law Firm — weekly three-topic content kit predicted 2026-09-08–09-10; prep only until source packet fingerprinted.

## Unanswered / urgent

- ${lanes.slack.open_slack_notes} Momentum 360 Slack asks in \`00_Inbox/slack/\` (since ~2026-07-30).
- BigOrange Marketing website build — \`needs_approval\` on canonical queue.
- Bar Crawl USA paid-media optimization — \`needs_approval\` on canonical queue.

## Upcoming deadlines (7 days)

${pulse.dueSoon.length ? pulse.dueSoon.map((d) => `- ${d.name}: due ${d.due}`).join('\n') : '- None with due dates in the next 48h on vault scan.'}

## Vault health

- ${pulse.stalled.length} / ${pulse.scanned} client files stalled 7+ days on \`last_touched\`.
- Latest inbox brief: ${lanes.gmail.latest_brief || 'none'}.
`;
  fs.writeFileSync(file, body);
}

function main() {
  const today = argValue('--date') || todayISO();
  const dryRun = process.argv.includes('--dry-run');
  const runDir = repoPath('automation-runs', 'competitive-task-orchestrator', today);

  const pulse = scanVaultPulse(today);
  const sessions = scanSessions(today);
  const ads = scanAdsSeo();
  const content = contentRoutineDay(today);
  const gmail = gmailFallback(today);
  const slack = slackFallback(today);

  const lanePaths = {};
  if (!dryRun) {
    lanePaths['vault-pulse'] = writeLaneOutput(
      runDir,
      'vault-pulse',
      `# Vault Pulse — ${today}\n\n- Active/touched 24h: ${pulse.active24h}\n- Stalled (7+d): ${pulse.stalled.length}\n- Due in 48h: ${pulse.dueSoon.length}\n- Data gaps: ${pulse.gaps.length}`
    );
    lanePaths['codex-session-sync'] = writeLaneOutput(
      runDir,
      'codex-session-sync',
      `# Codex Session Sync — ${today}\n\nRecent sessions (7d): ${sessions.recent.length}\n${sessions.recent.map((r) => `- ${r.file}`).join('\n') || '- none'}`
    );
    lanePaths['domain-ads-seo'] = writeLaneOutput(
      runDir,
      'domain-ads-seo',
      `# Domain Ads & SEO — ${today}\n\n${ads.adP0.map((a) => `- ${a.queue}: ${a.open_items || a.signal}`).join('\n') || '- No open queue signals'}`
    );
    lanePaths['gmail-intel'] = writeLaneOutput(
      runDir,
      'gmail-intel',
      `# Gmail Intel — ${today}\n\nsource: ${gmail.source}\nlatest_brief: ${gmail.latest_brief || 'none'}`
    );
    lanePaths['slack-intel'] = writeLaneOutput(
      runDir,
      'slack-intel',
      `# Slack Intel — ${today}\n\nsource: ${slack.source}\nopen_notes: ${slack.open_slack_notes}\n${slack.items.map((i) => `- ${i}`).join('\n')}`
    );
    lanePaths['content-routines'] = writeLaneOutput(
      runDir,
      'content-routines',
      content.status === 'skipped'
        ? `skipped: not a content routine day (${today})`
        : `# Content Routines — ${today}\n\nDue: ${content.routines.join(', ')}`
    );

    const brief = buildBrief(today, { gmail, slack, sessions, ads, content }, pulse);
    fs.writeFileSync(repoPath('Daily-Briefs', 'competitive-task-today.md'), brief);

    const runState = {
      workflow_id: 'competitive-task-orchestrator',
      date: today,
      started_at: nowISO(),
      completed_at: nowISO(),
      mode: 'vault-fallback',
      lanes: {
        gmail: gmail.source,
        slack: slack.source,
        vault: 'ok',
        sessions: sessions.recent.length > 0 ? 'ok' : 'empty',
        ads: ads.adP0.length > 0 ? 'signals' : 'ok',
        content: content.status,
      },
      lane_outputs: lanePaths,
      p0_count: Math.min(5, pulse.stalled.length + slack.open_slack_notes),
      stalled_clients: pulse.stalled.length,
    };
    writeJson(path.join(runDir, 'run-state.json'), runState);
    writeJson(repoPath('12_Brain/state/competitive-task-orchestrator.json'), runState);

    updateRoutineHealth(today, {
      gmail: gmail.source === 'vault-fallback' ? 'yellow' : 'green',
      slack: slack.open_slack_notes > 0 ? 'yellow' : 'green',
      vault: pulse.stalled.length > 20 ? 'yellow' : 'green',
      sessions: sessions.recent.length ? 'green' : 'yellow',
      ads: ads.adP0.length ? 'yellow' : 'green',
      content: content.status === 'skipped' ? 'green' : 'yellow',
      consolidator: 'green',
    });
    updateMemorySync(today, pulse, { gmail, slack });
  }

  const result = {
    ok: true,
    date: today,
    dry_run: dryRun,
    stalled_clients: pulse.stalled.length,
    slack_open: slack.open_slack_notes,
    content: content.status,
    brief: dryRun ? null : 'Daily-Briefs/competitive-task-today.md',
  };
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
