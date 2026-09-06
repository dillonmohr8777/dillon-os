#!/usr/bin/env node
'use strict';

/**
 * Competitive task orchestrator — deterministic vault-fallback runner.
 * Fans in client pulse, Slack loops, sessions, predictions, and approval
 * signals into one operator board. Live Gmail/Slack merge happens in the
 * Cursor automation phase; this script is the always-available baseline.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  repoPath,
  readJson,
  writeJson,
  walkMarkdown,
  todayISO,
  nowISO,
} = require('../lib/fsutil');

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function daysBetween(isoDate, asOf) {
  if (!isoDate || isoDate === 'none') return null;
  const start = new Date(`${isoDate}T00:00:00Z`);
  const end = new Date(`${asOf}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.floor((end - start) / 86400000);
}

function scanClients(asOf) {
  const root = repoPath('01_Clients');
  const files = walkMarkdown(root).filter((f) => !f.endsWith('Client Index.md'));
  const clients = [];
  for (const file of files) {
    const rel = path.relative(repoPath(), file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const fm = parseFrontmatter(content);
    const name = fm.client || path.basename(file, '.md');
    const lastTouched = fm.last_touched || null;
    const due = fm.due || null;
    const staleDays = daysBetween(lastTouched, asOf);
    let bucket = 'unknown';
    if (staleDays === null) bucket = 'unknown';
    else if (staleDays < 2) bucket = 'moving';
    else if (staleDays < 7) bucket = 'watch';
    else bucket = 'stalled';
    const dueOverdueDays = due && due !== 'none'
      ? Math.max(0, daysBetween(due, asOf))
      : null;
    clients.push({
      name,
      client_id: fm.client_id || null,
      path: rel,
      last_touched: lastTouched,
      due,
      next_action: fm.next_action || null,
      stale_days: staleDays,
      bucket,
      due_overdue_days: dueOverdueDays,
    });
  }
  clients.sort((a, b) => (b.stale_days ?? 999) - (a.stale_days ?? 999));
  return clients;
}

function scanSlackLoops() {
  const slackDir = repoPath('00_Inbox', 'slack');
  if (!fs.existsSync(slackDir)) return [];
  return fs.readdirSync(slackDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const file = path.join(slackDir, f);
      const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      const dateMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
      return {
        file: `00_Inbox/slack/${f}`,
        captured: dateMatch ? dateMatch[1] : fm.created || null,
        title: f.replace(/\.md$/, ''),
        status: fm.status || 'open',
      };
    });
}

function scanCodexSessions() {
  const sessions = [];
  const sessionDir = repoPath('10_Sessions');
  if (fs.existsSync(sessionDir)) {
    for (const f of fs.readdirSync(sessionDir).filter((n) => n.endsWith('.md'))) {
      sessions.push({
        file: `10_Sessions/${f}`,
        kind: 'session',
      });
    }
  }
  const proposals = repoPath('00_Inbox', 'Agent-Proposals', 'Claude');
  if (fs.existsSync(proposals)) {
    for (const f of fs.readdirSync(proposals).filter((n) => n.endsWith('.md'))) {
      sessions.push({
        file: `00_Inbox/Agent-Proposals/Claude/${f}`,
        kind: 'agent-proposal',
      });
    }
  }
  return sessions.slice(-12);
}

function refreshPredictions(asOf) {
  if (!hasFlag('--refresh-predictions')) return readJson(repoPath('12_Brain', 'state', 'work-predictor', 'latest.json'), null);
  try {
    execSync(
      `node _os/automation/bin/predict-work.js --as-of ${asOf} --lookahead-days 35 --history-days 90`,
      { cwd: repoPath(), stdio: 'pipe' },
    );
  } catch (error) {
    return { error: String(error.message || error), degraded: true };
  }
  return readJson(repoPath('12_Brain', 'state', 'work-predictor', 'latest.json'), null);
}

function buildSlackActionQueue(loops, asOf) {
  const lines = [
    '---',
    'tags: [system, slack, action-queue]',
    `last_updated: ${asOf}`,
    'owner: competitive-task-orchestrator',
    '---',
    '',
    '# Slack action queue',
    '',
    'Open boss/client asks ranked by age. Draft-only — nothing sent automatically.',
    '',
    '| Age | Client | Ask | Source |',
    '|---|---|---|---|',
  ];
  for (const loop of loops) {
    const age = loop.captured ? `${daysBetween(loop.captured, asOf)}d` : 'unknown';
    const client = loop.file.includes('momentum') || loop.title.includes('melissa') || loop.title.includes('sean') || loop.title.includes('jenny') || loop.title.includes('jason')
      ? 'Momentum 360'
      : 'unresolved';
    lines.push(`| ${age} | ${client} | ${loop.title.replace(/-/g, ' ')} | \`${loop.file}\` |`);
  }
  if (loops.length === 0) {
    lines.push('| — | — | No open Slack loops in vault | — |');
  }
  lines.push('');
  lines.push('> Live Slack connector may surface additional items during Phase 1 `slack-intel`.');
  return lines.join('\n');
}

function pickCompetitiveWin(clients, predictions, slackLoops) {
  const overdue = clients
    .filter((c) => c.due_overdue_days !== null && c.due_overdue_days > 0)
    .sort((a, b) => a.due_overdue_days - b.due_overdue_days);
  if (overdue.length) {
    const top = overdue[0];
    return {
      title: `Close ${top.name}`,
      reason: `due ${top.due} (${top.due_overdue_days}d overdue)`,
      evidence: top.path,
      tier: 1,
    };
  }
  if (slackLoops.length >= 4) {
    return {
      title: 'Clear Momentum 360 Slack comms debt',
      reason: `${slackLoops.length} unanswered asks since Jul 2026`,
      evidence: '00_Inbox/slack/',
      tier: 2,
    };
  }
  const topCandidate = predictions?.candidates?.[0];
  if (topCandidate) {
    return {
      title: topCandidate.title || topCandidate.work_package_id,
      reason: `predicted ${topCandidate.confidence_label || topCandidate.confidence} — prep window ${topCandidate.window?.start || 'soon'}`,
      evidence: '12_Brain/state/work-predictor/latest.json',
      tier: 0,
    };
  }
  return {
    title: 'Touch 3 stalled clients with real contact',
    reason: `${clients.filter((c) => c.bucket === 'stalled').length} clients stalled 7+ days`,
    evidence: 'Daily-Briefs/pulse-today.md',
    tier: 0,
  };
}

function renderBrief(state) {
  const { as_of: asOf, competitive_win: win, clients, slack_loops: slack, predictions, parallel_lanes: lanes, approval_cards: cards, automations } = state;
  const stalled = clients.filter((c) => c.bucket === 'stalled').length;
  const lines = [
    '---',
    'tags: [brief, competitive-task, orchestrator]',
    `date: ${asOf}`,
    `mode: ${state.mode}`,
    '---',
    '',
    `# Competitive task — ${asOf}`,
    '',
    `**Mode:** ${state.mode} · **Stalled clients:** ${stalled}/${clients.length} · **Open Slack loops:** ${slack.length}`,
    '',
    '## Competitive win',
    '',
    `**${win.title}** — ${win.reason}`,
    '',
    `- Evidence: \`${win.evidence}\``,
    `- Tier: ${win.tier} (${win.tier === 2 ? 'approval required' : win.tier === 1 ? 'client deliverable' : 'safe prep'})`,
    '',
    '## Parallel lanes (safe today)',
    '',
  ];
  for (const lane of lanes) {
    lines.push(`- **${lane.title}** — ${lane.action} (\`${lane.evidence}\`)`);
  }
  lines.push('', '## Approval cards (do not execute here)', '');
  if (cards.length === 0) {
    lines.push('_None surfaced from vault scan — check `System/approval-queue.md`._');
  } else {
    for (const card of cards) {
      lines.push(`- [ ] **${card.title}** — ${card.reason} · \`${card.evidence}\``);
    }
  }
  lines.push('', '## Comms debt', '');
  for (const loop of slack) {
    const age = loop.captured ? `${daysBetween(loop.captured, asOf)}d` : '?';
    lines.push(`- **${age}** — ${loop.title} → \`${loop.file}\``);
  }
  lines.push('', '## Predicted prep', '');
  const cands = predictions?.candidates || [];
  if (!cands.length) {
    lines.push('_No prediction candidates (canonical queue may be unavailable)._');
  } else {
    for (const c of cands.slice(0, 5)) {
      lines.push(`- **${c.client_id}** — ${c.title || c.work_package_id} (${Math.round((c.confidence || 0) * 100)}%)`);
    }
  }
  lines.push('', '## Automation map', '');
  lines.push('**This run replaces:** ' + automations.supersedes.join(', '));
  lines.push('');
  lines.push('**Still separate:** ' + automations.still_separate.join(', '));
  lines.push('');
  lines.push('> Connector auth for live Gmail/Slack: see `System/approval-queue.md`. Vault-fallback is valid; label degraded when connectors unavailable.');
  return lines.join('\n');
}

function main() {
  const asOf = argValue('--as-of', todayISO());
  const mode = hasFlag('--live') ? 'live' : 'vault-fallback';
  const predictions = refreshPredictions(asOf);
  const clients = scanClients(asOf);
  const slackLoops = scanSlackLoops();
  const sessions = scanCodexSessions();
  const competitiveWin = pickCompetitiveWin(clients, predictions, slackLoops);

  const parallelLanes = [];
  const bok = (predictions?.candidates || []).find((c) => c.client_id === 'bok-law-firm');
  if (bok) {
    parallelLanes.push({
      title: 'BOK weekly content prep',
      action: 'Locate/fingerprint source packet; stage 3 topic image slots — no drafting',
      evidence: '12_Brain/state/work-predictor/latest.json',
    });
  }
  parallelLanes.push({
    title: 'Client pulse touch subset',
    action: 'Real contact with 3–5 stalled clients (not another scan)',
    evidence: 'Daily-Briefs/pulse-today.md',
  });
  if (slackLoops.length) {
    parallelLanes.push({
      title: 'M360 Slack draft replies',
      action: 'Draft status replies for Melissa, Jenny, Sean, Jason — approval-gated send',
      evidence: 'System/slack-action-queue.md',
    });
  }

  const approvalCards = [
    {
      title: 'BigOrange Marketing website build',
      reason: 'needs_approval on canonical queue',
      evidence: 'System/approval-queue.md',
    },
    {
      title: 'Bar Crawl USA paid-media optimization',
      reason: 'needs_approval — budget/billing gated',
      evidence: 'System/approval-queue.md',
    },
  ];

  const state = {
    workflow_id: 'competitive-task-orchestrator',
    generated_at: nowISO(),
    as_of: asOf,
    mode,
    competitive_win: competitiveWin,
    clients,
    slack_loops: slackLoops,
    codex_sessions: sessions,
    predictions: {
      as_of: predictions?.as_of || null,
      degraded: predictions?.degraded || !predictions?.sources?.canonical_queue_available,
      candidates: (predictions?.candidates || []).map((c) => ({
        client_id: c.client_id,
        work_package_id: c.work_package_id,
        title: c.title,
        confidence: c.confidence,
        confidence_label: c.confidence_label,
        window: c.window,
      })),
    },
    parallel_lanes: parallelLanes,
    approval_cards: approvalCards,
    automations: {
      supersedes: [
        'daily-morning-orchestrator-dry-board',
        'legacy-hermes-dillon-daily-brief',
        'legacy-hermes-dillon-approval-queue',
      ],
      still_separate: [
        'daily-communications-brain',
        'report-brain-ingest',
        'marketing-chief-twice-daily-brief',
        'grok-intelligence-ingest',
        'obsidian-guard-dog',
        'prospect-radar-next20',
      ],
    },
  };

  const statePath = repoPath('12_Brain', 'state', 'competitive-task-orchestrator.json');
  const briefPath = repoPath('Daily-Briefs', `competitive-task-today.md`);
  const slackQueuePath = repoPath('System', 'slack-action-queue.md');

  writeJson(statePath, state);
  fs.writeFileSync(briefPath, `${renderBrief(state)}\n`);
  fs.writeFileSync(slackQueuePath, `${buildSlackActionQueue(slackLoops, asOf)}\n`);

  console.log(JSON.stringify({
    status: 'ok',
    as_of: asOf,
    mode,
    competitive_win: competitiveWin.title,
    stalled_clients: clients.filter((c) => c.bucket === 'stalled').length,
    slack_loops: slackLoops.length,
    output: {
      state: statePath,
      brief: briefPath,
      slack_queue: slackQueuePath,
    },
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
