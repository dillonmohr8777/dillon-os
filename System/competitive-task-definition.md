---
tags: [system, automation, strategy]
updated: 2026-08-06
source: "[[00_Inbox/Automation Deep Analysis 2026-07-29]] · [[System/OS Config]] · [[00_Inbox/Top 15 Opportunities 2026-07-02]]"
---

# Competitive task definition

One-line summary: the daily work that moves all three North Star targets at once — clients, revenue, and book growth — without splitting attention across separate automations.

## What “competitive task” means

Dillon's **competitive task** is not one client ticket. It is the ranked daily execution loop that advances every written target in `System/OS Config.md` and the opportunity stack in `00_Inbox/Top 15 Opportunities 2026-07-02.md`:

| Target | Current | Goal | Primary lever |
|---|---|---|---|
| **ROAD TO 100 CLIENTS** | 12 | 100 | Mac's site-factory outreach engine + client retention |
| **Mohr Media revenue** | fragmented | $40K in 5 months | audit-to-retainer funnel + reporting factory |
| **Book subscribers** | 0 baseline | 2,000 in 4 months | fix book capture → dispatch calendar → paid funnel |

The competitive task is **winning the day against those three scoreboards** while clearing boss/client asks from Gmail and Slack and keeping the vault honest.

## What counts as competitive work (ranked)

1. **Launch blocked** — anything where ads, sites, or billing cannot move until a dependency clears (NKCDC tax-prep page, Hardwood card, Netlify/auth resets).
2. **Billing / retention risk** — card updates, invoice friction, at-risk accounts.
3. **Boss / client unanswered asks** — Slack and Gmail threads with explicit requests (Jason/Sean bot, CallRail, Melissa guidelines, Jenny brand direction).
4. **Revenue pipeline** — site-factory batch progress, prospect qualify scores, Mohr Media outreach drafts.
5. **Client delivery** — reports, creatives, GBP cadence, ad disapprovals.
6. **Book + Align lanes** — only after P0–P2 client/M360 items are surfaced; Align HCM is full-time, never billed as M360.

## P0 tie-break rules

When two items look equal:

`launch blocked` > `billing risk` > `ad disapprovals` > `hard calendar commitment`

Align HCM routes to the full-time lane — never under Momentum 360.

## Operator rules (hard)

- KJB emails **must CC**: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Draft-first: ingestion and scouts are Tier 0; sends, posts, deploys, spend, and billing are Tier 2
- Gmail + Slack MCP preferred; vault mirrors (`00_Inbox/slack/`, client notes) are fallback evidence — label the source
- One worker per client per lane; never two writers on the same account

## What this replaces

Seven legacy crons collapse into **one** umbrella automation (`competitive-task-orchestrator`, cron `0 13 * * *` UTC ≈ 09:00 ET):

| Legacy skill / cron | Absorbed by subagent |
|---|---|
| `/slack-intake` + `/inbox-brief` | `slack-intel`, `gmail-intel` |
| `/client-pulse` | `vault-pulse` |
| `/am-report` synthesis | `memory-consolidator` |
| `/content-scan` (Thu SEO sweep) | `content-routines` |
| Codex session mining | `codex-session-sync` |
| Ads / SEO / site health scouts | `domain-ads-seo` |
| `/plan-today` afternoon block | operator reads `Daily-Briefs/competitive-task-today.md` |

Nightly `/vault-compile` and weekly `/wiki-lint` + `/research-sweep` stay separate — they are compounding loops, not daily competitive execution.

## Daily output contract

Every run writes:

- `Daily-Briefs/competitive-task-today.md` — the single page Dillon opens
- `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/run-state.json` — machine-readable run log
- `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/lane-outputs/*.md` — one file per parallel subagent

Updates `Dashboard.md` `## Today` with the top 3 competitive priorities.
