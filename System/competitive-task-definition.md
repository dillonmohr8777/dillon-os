---
tags: [system, competitive-task]
last_updated: 2026-09-02
source_refs:
  - "[[04_SOPs/competitive-task-orchestrator]]"
  - "[[12_Brain/registry/automations.json]]"
---

# Competitive Task Definition

## What it is

Dillon's **competitive task** is operator throughput: run ~25 Momentum 360 / direct
client accounts plus Align HCM (full-time) and Mohr Media (business build) without
dropping launches, billing, or client comms.

The edge is not more tools — it is **one vault (Dillon OS) + one umbrella automation
with parallel intel lanes** that ingest email, Slack, sessions, inbox, automation
state, and vault pulse, then output a single daily priority stack.

## Success criteria

1. **Nothing launch-blocking sits silent** (landing pages, ad disapprovals, access gaps).
2. **Billing risk surfaced before pause** (card failures, engagement drift).
3. **Urgent replies** have an owner and next action in `System/urgent-replies.md`.
4. **Vault stays truthful** — `last_touched`, `next_action`, `due` on client notes.
5. **One brief to open** — `Daily-Briefs/competitive-task-today.md` after each run.
6. **Approval queue cross-check** — open Momentum 360 Slack asks and gated items
   appear in the P0 stack when still unanswered.

## P0 tie-break (when everything screams)

1. Launch blocked (client waiting on you)
2. Hard calendar commitments (calls, meetings) inside 24h
3. Billing / engagement at risk
4. Ad disapprovals / account health
5. Overdue `due:` on active clients

## Sources of truth

| Source | Path / tool | Lane |
|--------|-------------|------|
| Obsidian vault | This repo | `ct-vault-pulse` |
| Today's briefs | `Daily-Briefs/*` (same day) | `ct-inbox-intel` |
| Gmail | Gmail MCP or `12_Brain/01_Captures/Communications/` | `ct-gmail-intel` |
| Slack | Slack MCP or `00_Inbox/slack/` | `ct-slack-intel` |
| Codex / Cursor sessions | `10_Sessions/`, `00_Inbox/Agent-Proposals/` | `ct-session-sync` |
| Campaign queues | `02_Campaigns/*Queue*.md` | `ct-ads-seo` |
| Automation state | `12_Brain/state/`, `System/routine-health.md` | `ct-automation-health` |
| Cross-instance memory | `System/claude-memory-sync.md` | `ct-consolidator` |

## Umbrella vs feeders (2026-09 architecture)

**One Cursor scheduled automation** — `competitive-task-orchestrator` — runs Phase 1
lanes in parallel, then `ct-consolidator` writes the operator brief.

These are **feeders, not competing operators** (they write inputs the umbrella reads):

| Feeder | Role | Do not duplicate in Cursor |
|--------|------|---------------------------|
| `daily-communications-brain` | Codex 7 AM Gmail+Slack → captures | Intel lane reads captures |
| `Claude-Autonomous-Daily-Driver` | Windows bounded routine execution | Separate lane; umbrella reads receipts |
| `Prospect Radar - Next 20` | 5:20 AM site batch | Factory output only |
| `obsidian-guard-dog` | 8:30 AM brain hygiene | Infrastructure only |
| `marketing-chief-twice-daily-brief` | OmniRoute/Sites infra health | Not client inbox |

## Retired standalone Cursor crons (merged into umbrella)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`
- Separate `morning-loop` cloud automation (slack-intake + am-report + pulse as three schedulers)

**Single replacement:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).
Disable duplicate Cursor automations after the first three green umbrella runs.
