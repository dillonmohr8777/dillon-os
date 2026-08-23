---
tags: [system, competitive-task]
last_updated: 2026-08-23
source_refs:
  - "[[GROK-HANDOFF-DILLON-OS]]"
  - "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
  - "[[12_Brain/09_Ops/Claude Target Architecture Proposal]]"
---

# Competitive Task Definition

## What it is

Dillon's **competitive task** is operator throughput: run ~25 Momentum 360 / direct
client accounts plus Align HCM (full-time) and Mohr Media (business build) without
dropping launches, billing, or client comms.

The edge is not more tools — it is **one vault (Dillon OS) + parallel AI lanes**
that ingest email, Slack, sessions, and vault state, then output a single daily
priority stack.

## Success criteria

1. **Nothing launch-blocking sits silent** (e.g. NKCDC landing page, ad disapprovals).
2. **Billing risk surfaced before pause** (e.g. Replenish billing block).
3. **Urgent replies** have an owner and next action in `System/urgent-replies.md`.
4. **Vault stays truthful** — `last_touched`, `next_action`, `due` on client notes.
5. **One brief to open** — `Daily-Briefs/competitive-task-today.md` each afternoon.

## P0 tie-break (when everything screams)

1. Launch blocked (client waiting on you)
2. Billing / engagement at risk
3. Ad disapprovals / account health
4. Hard calendar commitments (calls, meetings)

## Sources of truth

| Source | Path / tool | Lane |
|--------|-------------|------|
| Obsidian vault | This repo | `vault-pulse`, `domain-ads-seo` |
| Gmail | Gmail MCP or `_os/automation/incoming/communications/` | `gmail-intel` |
| Slack | Slack MCP, `00_Inbox/slack/`, comms ingest | `slack-intel` |
| Codex / Cursor sessions | `10_Sessions/`, Rockbot codex-rollouts | `codex-session-sync` |
| Cross-instance memory | `System/claude-memory-sync.md` | `memory-consolidator` |

## Umbrella vs background automation

| Layer | What | Cadence | Operator-facing? |
|-------|------|---------|------------------|
| **Umbrella** | `competitive-task-orchestrator` | Daily 1 PM ET | **Yes** — open one brief |
| Background | `Invoke-ClaudeDailyDriver.ps1` (54 routines) | Every 15 min | No — receipts only |
| Background | Prospect Radar, Grok intel, report ingest | Daily / weekly | No — radar brief |
| Local only | 64GB morning orchestrator (Chrome tabs) | ~6:30 AM | Board when on machine |

The umbrella **does not replace** the daily driver or radar. It **replaces seven
operator-facing crons** that duplicated intel gathering without consolidation.

## Retired standalone crons (merged into umbrella)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

**Single replacement:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).
