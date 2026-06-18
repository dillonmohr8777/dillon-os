---
last_updated: 2026-06-18
tags: [system, competitive-task, orchestrator]
---

# Competitive Task Definition

Single definition of what Dillon's **competitive task** means across every surface. All agents in the umbrella orchestrator read this file first.

## What "competitive task" means

Dillon operates across **three revenue lanes** that compete for the same calendar:

| Lane | Scope | Risk if neglected |
|------|-------|-------------------|
| **Momentum 360** | 12+ retainer clients, account management, ads, reports | Churn, disapprovals, blocked launches, unpaid invoices |
| **Align HCM** | Full-time W2 employer (NOT M360 revenue) | LinkedIn cadence slip, SEO/blog backlog, internal visibility |
| **Direct / 1099** | BOK Law, Buzz Bull, Florecita, CCA, Mohr Media, book | Missed content deadlines, proposal delays |

The competitive task is **winning the priority stack every day**: identify what blocks revenue or reputation, execute or draft the next action, and write state back to the vault so tomorrow's run starts smarter.

## Priority tie-break (P0 → P3)

When agents disagree on ordering, apply this ladder:

1. **P0 Launch blocked** — client waiting on Dillon/M360 to ship (NKCDC landing page dependency, campaign not live)
2. **P0 Billing risk** — card update outstanding, invoice unpaid, engagement about to pause (Hardwood Artisan)
3. **P0 Ad disapprovals** — Meta/Google rejections blocking spend (Bar Crawl USA)
4. **P1 Calendar hard commits** — Teams meetings, standing calls, content publish dates within 48h
5. **P1 Unanswered client email** — direct ask to Dillon, no reply in 24h+
6. **P2 Content cadence** — BOK Law weekly social, Align HCM LinkedIn, SEO blog queue
7. **P3 Optimization** — queue reviews, A/B tests, reporting, SEO sweeps

## Data sources (ingested in parallel)

| Source | Agent | Primary outputs |
|--------|-------|-----------------|
| Gmail | `gmail-intel` | `System/urgent-replies.md`, client `## Gmail intel` sections |
| Slack | `slack-intel` | `System/slack-intel.md` (runtime MCP; vault baseline if unavailable) |
| Obsidian vault | `vault-pulse` | `Daily-Briefs/pulse-today.md`, stalled-client flags |
| Codex / Cursor sessions | `codex-session-sync` | `10_Sessions/Session Index.md`, `System/session-handoff.md` |
| Scheduled content | `content-routines` | BOK Law calendar, Align HCM LinkedIn, book SEO |
| Ads & SEO queues | `domain-ads-seo` | `02_Campaigns/*` queue updates, disapproval alerts |

## Consolidator outputs (sequential, after parallel phase)

`memory-consolidator` merges all agent reports into:

- `Daily-Briefs/competitive-task-today.md` — **the one file Dillon reads each morning**
- `System/claude-memory-sync.md` — cross-agent memory
- `System/routine-health.md` — last-run timestamps per subagent
- Client `last_touched` / `next_action` / `due` frontmatter where gaps exist

## Operator rules (non-negotiable)

- **KJB emails** MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- **Align HCM** is full-time employment, not M360 client revenue. Never mix branding.
- **Bar Crawl USA** — pre-approved ad copy only. Zero alcohol language.
- **Fresh Blends** — brand as "Replenish", not "Fresh Blends"
- All client emails: Momentum 360 branding, HTML bullets, Dillon signature per `System/writing-rules.md`

## Legacy crons replaced by umbrella

These seven separate automations are **deprecated**. One cron handles all:

| Legacy routine | Absorbed by |
|----------------|-------------|
| `nightly-client-pulse` | `vault-pulse` |
| `gmail-to-vault-digest` | `gmail-intel` |
| `vault-integrity-sync` | `memory-consolidator` |
| `chat-to-vault-sync` | `codex-session-sync` |
| `bok-law-social-content` | `content-routines` |
| `linkedin-growth-engine` | `content-routines` |
| `book-site-seo-sweep` | `domain-ads-seo` |

**Umbrella cron:** `competitive-task-orchestrator` at `0 13 * * *` (1:00 PM UTC daily).
