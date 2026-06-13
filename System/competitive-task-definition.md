---
tags: [system, competitive-task, orchestrator]
last_updated: 2026-06-13
---

# Competitive Task Definition

## What "competitive task" means

Your competitive task is the daily fight to pick the right work when everything competes for the same hours. You run Momentum 360 client accounts, Align HCM full-time, direct clients, a DBA program, a book project, and a growing automation stack. The competitive task is not one deliverable. It is the ranked stack of what must win today so revenue, launches, and relationships do not slip.

## Domains that compete

| Domain | Source of truth | What "winning" looks like |
|--------|-----------------|---------------------------|
| M360 clients | `01_Clients/`, Gmail threads | Launches live, ads approved, reports sent, billing current |
| Align HCM (full-time) | `02_FullTimeJob/AlignHCM/` | LinkedIn calendar filled, SEO blogs shipped, SmartCare assets on track |
| Communications | Gmail, Slack | Urgent threads answered, CC rules honored, meetings confirmed |
| Recurring content | BOK Law calendar, Align LinkedIn calendar, book SEO | This week's posts drafted before deadline |
| Campaign ops | `02_Campaigns/`, ad platform intel | Disapprovals cleared, queues drained, budgets shifted |
| Knowledge sync | Vault, Codex sessions, chat logs | `last_touched` current, memory files accurate |
| Personal / school | `06_Personal/`, `07_DBA/` | Assignments tracked, nothing silently overdue |

## P0 tie-break order

When two items feel equally urgent, rank by this order:

1. **Launch blocked** — client or campaign cannot go live (e.g. NKCDC landing page)
2. **Billing risk** — card failures, pause threats, invoice disputes (e.g. Hardwood Artisan)
3. **Ad disapprovals** — live revenue stopped or at risk (e.g. Bar Crawl USA)
4. **Hard calendar** — meetings, committed delivery dates within 48 hours
5. **Stalled client** — 7+ days no vault update and no email movement
6. **Recurring content due** — BOK Law (Sun), LinkedIn (Sun), book SEO (Thu)
7. **Queue maintenance** — optimization queues, SEO pipeline, reporting backlog

## Operator rules (non-negotiable)

- KJB emails MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Align HCM is full-time W2. Never count it as M360 client revenue.
- Bar Crawl USA: pre-approved ad copy only. Zero alcohol language.
- Fresh Blends / Replenish: "Replenish" branding, no phone-call conversions.
- All client emails under Momentum 360 branding, never Buzz Bull.

## Legacy crons replaced

The umbrella `competitive-task-orchestrator` (daily 1:00 PM ET) replaces these seven separate automations:

| Legacy cron | Absorbed by subagent |
|-------------|---------------------|
| `nightly-client-pulse` | `vault-pulse` |
| `gmail-to-vault-digest` | `gmail-intel` |
| `vault-integrity-sync` | `memory-consolidator` |
| `chat-to-vault-sync` | `codex-session-sync` |
| `bok-law-social-content` | `content-routines` |
| `linkedin-growth-engine` | `content-routines` |
| `book-site-seo-sweep` | `content-routines` + `domain-ads-seo` |

## Daily output

- **Read:** `Daily-Briefs/competitive-task-today.md`
- **Memory:** `System/claude-memory-sync.md` (rewritten by consolidator)
- **Urgent:** `System/urgent-replies.md` (updated by gmail-intel)
