---
tags: [sop, automation, competitive-task]
updated: 2026-08-03
source: "[[System/competitive-task-definition]]"
---

# Competitive Task Orchestrator — Runbook

**Summary:** Operator guide for the one umbrella automation that replaces seven daily crons.

## What it does

Every day at 9:00 AM ET, a cloud agent:

1. Spawns **six parallel scouts** (Gmail, Slack, vault, Codex sessions, ads/SEO, content)
2. Runs **one consolidator** that ranks everything into P0–P3
3. Writes `Daily-Briefs/competitive-task-today.md` — your single morning board
4. Updates `Dashboard.md` with the top 3 tasks

## Setup (one time)

1. Cursor Dashboard → Automations → Create scheduled automation
2. Schedule: `0 13 * * *` (cron)
3. Repo: `dillon-os`
4. Paste prompt from `System/competitive-task-orchestrator-prompt.md`
5. Connect Slack + Gmail MCP in Dashboard → Integrations (optional but recommended)
6. Disable the seven legacy crons listed in `System/competitive-task-definition.md`

## Daily operator flow

1. Open `Daily-Briefs/competitive-task-today.md` (or review the PR the automation opens)
2. Work P0 items first — tie-break is in the definition doc
3. Execute Tier 2 items yourself (send, deploy, spend) — the orchestrator only prepares
4. Check `## Blind spots` — if Gmail/Slack MCP was down, run a manual pass or wait for next cron

## On-demand run

In any Cursor session:

```
Run /competitive-task-orchestrator
```

Or: "What's my competitive task today?"

## Lane artifacts

Each run also writes detailed lane files to `Daily-Briefs/lanes/YYYY-MM-DD-<lane>.md`. Use these when you need the evidence behind a P0 line.

## Troubleshooting

| Issue | Action |
|-------|--------|
| Empty P0 list | Check vault frontmatter — most clients have `next_action: TBD` |
| Duplicate with old crons | Disable legacy crons; only one should run |
| Slack asks missing | Connect Slack MCP or manually run `/slack-intake` once |
| Stale client dates | Run `node _os/automation/bin/frontmatter-repair.js` (dry-run first) |

## Related

- [[System/competitive-task-definition|Competitive Task Definition]]
- [[11_Agents/Master Agent|Master Agent]] — routes here instead of legacy morning loop
- [[handoffs/Morning Loop Scheduled Agent Setup|Morning Loop (legacy — disable)]]
- [[12_Brain/protocols/approval-tiers|Approval Tiers]]
