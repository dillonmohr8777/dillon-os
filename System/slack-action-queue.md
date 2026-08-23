---
last_checked: 2026-08-23
tags: [system, slack, actions]
source_refs:
  - "[[00_Inbox/slack/2026-07-30-jenny-brand-direction]]"
  - "[[00_Inbox/slack/2026-07-30-sean-callrail-status]]"
  - "[[00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert]]"
  - "[[00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt]]"
  - "_os/automation/incoming/communications/COMMS-2026-08-17-DAY-1.json"
---

# Slack Action Queue

Connector status: **failed** (latest COMMS envelope 2026-08-17). Items below are vault-captured; live Slack MCP not verified this run.

## P0 — unanswered since July 30

| Channel | Ask | Owner | Action |
|---------|-----|-------|--------|
| DM Jenny | NeedMomentum brand direction + timeline | Dillon + Mac/Sean | Draft reply after Mac/Sean confirm direction — **approval-gated** |
| #calls Sean | CallRail activity — what changed? | Dillon | Pull CallRail logs, draft evidence-backed reply — **approval-gated** |
| Group DM Jason+Sean | Bot stability + case-status alerts | Dillon | Verify bot runtime, draft ETA — **approval-gated** |

## P1 — this week

| Channel | Ask | Owner | Action |
|---------|-----|-------|--------|
| Melissa | Guidelines training prompt + Loom + meeting slot | Dillon | Confirm status, propose slots — **approval-gated** |

## Connector remediation

1. Restore Slack connector in comms ingest (`connectors.slack: failed` since 2026-08-17 envelope).
2. Enable Slack MCP on `competitive-task-orchestrator` automation for live 48h window.
3. Until live: refresh from `00_Inbox/slack/` captures after each source-intake run.
