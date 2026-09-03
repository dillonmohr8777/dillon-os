---
tags: [system, competitive-task]
last_updated: 2026-09-03
source_refs:
  - Daily-Briefs/plan-2026-09-03.md
  - Daily-Briefs/inbox-brief-2026-09-03.md
  - Daily-Briefs/pulse-today.md
  - AGENTS.md
---

# Competitive Task Definition

## What it is

Dillon's **competitive task** is operator throughput: run ~25 Momentum 360 /
direct client accounts plus Align HCM (full-time) and Mohr Media (business
build) without dropping launches, billing, or client comms.

This is **not** competitor research. It is the daily question: *what must
Dillon do today to stay ahead of client, billing, and launch risk?*

The edge is one vault (Dillon OS) plus **parallel AI lanes** that ingest email,
Slack, inbox, sessions, ads queues, and vault state — then output a single
afternoon priority stack.

## Success criteria

1. **Nothing launch-blocking sits silent** (e.g. overdue site builds, ad
   disapprovals).
2. **Billing risk surfaced before pause** (card failures, engagement at risk).
3. **Urgent replies** have an owner and next action in `System/urgent-replies.md`.
4. **Vault stays truthful** — `last_touched`, `next_action`, `due` on client notes.
5. **One brief to open** — `Daily-Briefs/competitive-task-today.md` each afternoon.

## P0 tie-break (when everything screams)

1. Launch blocked (client waiting on you)
2. Hard calendar commitments within 24h
3. Billing / engagement at risk
4. Ad disapprovals / account health
5. Overdue `due:` dates on active clients

## Sources of truth

| Source | Path / tool | Lane agent |
|--------|-------------|------------|
| Inbox triage | `00_Inbox/` | `ct-inbox-intel` |
| Gmail | Gmail MCP (when connected) | `ct-gmail-intel` |
| Slack | Slack MCP (when connected) | `ct-slack-intel` |
| Obsidian vault | `01_Clients/`, `02_Campaigns/` | `ct-vault-pulse` |
| Codex / Cursor sessions | `10_Sessions/` | `ct-session-sync` |
| Ads / SEO queues | `02_Campaigns/*Queue*.md` | `ct-ads-seo` |
| Automation health | `12_Brain/state/`, `System/automation-status.md` | `ct-automation-health` |
| Day-gated content | BOK / Align / Book calendars | `ct-content-routines` |
| Cross-instance memory | `System/claude-memory-sync.md` | `ct-consolidator` |

When Gmail or Slack MCP is unavailable, lanes must set `source: vault-fallback` and
read the latest `Daily-Briefs/inbox-brief-*`, `00_Inbox/slack/`, and
`System/urgent-replies.md` — do not fail the run.

## Umbrella automation

**Single replacement:** `competitive-task-orchestrator` — cron `0 13 * * *`
(1:00 PM America/New_York daily).

| Phase | Agents | Mode |
|-------|--------|------|
| 1 | `ct-inbox-intel`, `ct-gmail-intel`, `ct-slack-intel`, `ct-vault-pulse`, `ct-session-sync`, `ct-ads-seo`, `ct-automation-health`, `ct-content-routines` | **Parallel** |
| 2 | `ct-consolidator` | Sequential |

Prompt: `System/competitive-task-orchestrator-prompt.md`  
Runbook: `04_SOPs/competitive-task-orchestrator.md`  
Config: `.cursor/automation/competitive-task-orchestrator.md`

## Retired standalone Cursor crons (merged into umbrella)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`
- `morning-loop` (cloud duplicate — morning briefs now feed the umbrella via vault)

Disable these in Cursor Automations once the umbrella is verified for three runs.

## Windows feeders (NOT duplicates — keep running)

These run on the Windows box and **write into the vault**; the umbrella reads
their output instead of re-running the same work:

| Task | Cadence | Output the umbrella consumes |
|------|---------|------------------------------|
| `daily-communications-brain` | 7:00 AM | `Daily-Briefs/inbox-brief-*`, comms captures |
| `Claude-Autonomous-Daily-Driver` | every 15 min | `12_Brain/queue/claude-loop-*.jsonl`, routine receipts |
| `Prospect Radar - Next 20 Daily Builder` | 5:20 AM | `Daily-Briefs/radar-*`, `12_Brain/state/radar/` |
| `obsidian-guard-dog` | 8:30 AM | vault integrity receipts |
| Morning skills (am-report, plan-today, client-pulse) | ~7:00 AM | `Daily-Briefs/plan-*`, `pulse-today.md`, `metrics-*` |

The umbrella's job is **afternoon reconciliation** — merge morning briefs with
anything that changed since 7 AM and produce the P0 stack Dillon executes before EOD.

## Operator rules

- **KJB emails** must CC: mjfrederick334@gmail.com, sean@needmomentum.com,
  melissarobinn@gmail.com
- **Align HCM** is full-time employer — not M360 client revenue
- **Commercial Cleaners Alliance** — Momentum 360 brand on client-facing sends
- **Codex / Marketing Chief** owns execution on approved work; the umbrella is
  the priority stack only — it does not send, publish, deploy, or spend
