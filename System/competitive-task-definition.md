---
tags: [system, automation, orchestration]
last_updated: 2026-09-06
source_refs:
  - System/operating-status.md
  - 11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md
  - 00_Inbox/Automation Deep Analysis 2026-07-29.md
  - Daily-Briefs/pulse-today.md
---

# Competitive task definition

**Competitive task** means operator throughput across the active client portfolio
(~25 Momentum 360 and direct accounts, plus Align HCM and Mohr Media lanes) — not
competitor research or market intelligence.

The job is to win the day against stall, missed commitments, approval backlog, and
unanswered comms without spawning a separate morning cron for every lane.

## What counts as competitive work

| Signal | Source | Example |
|---|---|---|
| Overdue or due-soon client commitments | `01_Clients/` frontmatter, canonical queue | Cindy May Christmas `due: 2026-09-01` |
| Unanswered boss or client Slack asks | `00_Inbox/slack/`, comms captures | M360 Melissa/Jenny/Sean/Jason threads |
| Approval-gated queue items | `System/approval-queue.md`, canonical queue | BigOrange sign-off, Bar Crawl paid-media |
| Predicted prep with no gate | `12_Brain/state/work-predictor/latest.json` | BOK weekly content kit |
| Stalled roster (7+ days untouched) | client pulse | 40/40 clients in current snapshot |
| Codex session open loops | `10_Sessions/`, `00_Inbox/Agent-Proposals/` | Daily-driver receipts, handoff blockers |

## Umbrella automation

**One scheduled automation:** `competitive-task-orchestrator`

- **Cadence:** daily at 13:00 UTC (`0 13 * * *`) — afternoon operator reset after
  the 07:00 comms compile and morning plan blocks.
- **Prompt:** `System/competitive-task-orchestrator-prompt.md`
- **Workflow:** `_os/automation/workflows/competitive-task-orchestrator.json`
- **Fallback runner:** `node _os/automation/bin/competitive-task-run.js`
- **Primary output:** `Daily-Briefs/competitive-task-today.md`
- **State:** `12_Brain/state/competitive-task-orchestrator.json`
- **Slack action rollup:** `System/slack-action-queue.md`

### Phase 1 — parallel agents (`.cursor/agents/`)

| Agent | Reads | Writes |
|---|---|---|
| `gmail-intel` | Gmail connector or vault comms captures | open loops, commitments |
| `slack-intel` | Slack connector or `00_Inbox/slack/` | `System/slack-action-queue.md` |
| `vault-pulse` | `01_Clients/`, predict-work | stall/due classification |
| `codex-session-sync` | `10_Sessions/`, Agent-Proposals | session blockers |
| `domain-ads-seo` | client campaign notes, metrics briefs | ads/SEO flags |
| `content-routines` | Sun/Thu only — BOK, Align content cadence | prep contracts |

### Phase 2 — sequential consolidator

`memory-consolidator` merges Phase 1 receipts into one ranked board:

1. The one competitive win for today
2. Parallel prep lanes (safe Tier 0 only)
3. Approval cards (Tier 2 — human only)
4. Retired crons and what still runs separately

## Still separate (not merged into this run)

These stay on their own schedules or triggers:

- `daily-communications-brain` — 07:00 Gmail/Slack compile (Codex Windows)
- Weekly client reports + `report-brain-ingest`
- `marketing-chief-twice-daily-brief` — infra heartbeat
- Grok / xAI intelligence ingest
- `obsidian-guard-dog` — vault health
- Prospect Radar Next 20 builder — acquisition batch

## Retired morning crons

Do not re-enable without removing this umbrella first:

- Seven legacy Hermes `dillon-*` morning jobs (superseded by Codex scheduler)
- `daily-morning-orchestrator-dry-board` (folded into daily comms)

## Authority boundary

This automation **reads, ranks, and drafts**. It does not send, publish, deploy,
spend, merge, or mutate the canonical client-operations queue. Codex acting as
Marketing Chief remains the sole canonical writer.
