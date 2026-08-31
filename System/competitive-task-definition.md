---
tags: [system, competitive-task]
last_updated: 2026-08-28
source_refs:
  - 12_Brain/07_Reviews/2026-08-15 - 120-Day Slack Operating System Audit.md
  - GROK-HANDOFF-DILLON-OS.md
---

# Competitive Task Definition

## What it is

Dillon's **competitive task** is operator throughput: run ~25 Momentum 360 / direct client accounts plus Align HCM (full-time) and Mohr Media (business build) without dropping launches, billing, or client comms.

The edge is not more tools — it is **one vault (Dillon OS) + parallel AI lanes** that ingest email, Slack, sessions, and vault state, then output a single daily priority stack.

## Success criteria

1. **Nothing launch-blocking sits silent** (e.g. NKCDC landing page, ad disapprovals).
2. **Billing risk surfaced before pause** (e.g. Hardwood Artisan card).
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
| Gmail | Gmail MCP (when connected) | `gmail-intel` |
| Slack | Slack MCP (when connected) | `slack-intel` |
| Codex / Cursor sessions | `10_Sessions/`, session exports | `codex-session-sync` |
| Cross-instance memory | `System/claude-memory-sync.md` | `memory-consolidator` |
| Prospect Radar | `Daily-Briefs/radar-*.md`, `12_Brain/state/radar/` | `domain-ads-seo` (outreach lane) |
| Automation health | `System/automation-status.md`, `System/gateway-health.md` | `memory-consolidator` |

## Retired standalone crons (merged into umbrella)

**Cursor automations (disable these):**

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

**Codex / Rockbot scheduled tasks (fold into umbrella or Marketing Chief daily driver):**

- `daily-morning-orchestrator-dry-board` (PAUSED — superseded)
- `marketing-chief-twice-daily-brief`
- `six-hour-important-email-drafter`
- `slack-reply-watchdog`
- `daily-communications-brain`
- `daily-grok-dillon-os-intelligence`
- `report-brain-reconciliation`
- `momentum-hubspot-day-pulse` / `momentum-hubspot-night-pulse`
- `daily-align-hcm-semrush-blog-intelligence`
- `align-hcm-dashboard-live-refresh`
- `weekly-client-marketing-reports`
- `bok-facebook-weekly-pdf-scheduler`
- `obsidian-guard-dog`

**Single replacement:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Runbook: [[04_SOPs/competitive-task-orchestrator]]. Agent registry: `.cursor/agents/`.
