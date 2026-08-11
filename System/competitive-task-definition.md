---
tags: [system, competitive-task, orchestrator]
updated: 2026-08-03
source: "[[00_Inbox/Top 15 Opportunities 2026-07-02]]"
---

# Competitive Task Definition

**Summary:** One ranked daily operating picture that moves ROAD TO 100 CLIENTS — synthesized from every channel, not seven separate crons.

## What “competitive task” means

The competitive task is **not** a single to-do. It is the daily answer to:

> Given everything Dillon owes across Momentum 360, Mohr Media, Align HCM, and the book — what must win today to protect revenue, unblock launches, and grow the client count?

It is scored against three written targets from `System/OS Config.md` and `00_Inbox/Top 15 Opportunities 2026-07-02.md`:

| Target | Current | Goal |
|--------|---------|------|
| Active clients | 12 | 100 |
| Mohr Media revenue (5 mo) | fragmented | $40,000 |
| Book subscribers (4 mo) | ~0 baseline | 2,000 |

## Inputs (parallel lanes)

| Lane | Agent | Primary sources | Replaces |
|------|-------|-----------------|----------|
| Gmail intel | `gmail-intel` | Gmail MCP or `12_Brain/01_Captures/Gmail/` + client notes | hourly Gmail triage cron |
| Slack intel | `slack-intel` | Slack MCP or `00_Inbox/slack/` + `12_Brain/01_Captures/Slack/` | morning slack-intake cron |
| Vault pulse | `vault-pulse` | `01_Clients/`, `02_Campaigns/`, frontmatter | client-pulse + am-report client sections |
| Codex session sync | `codex-session-sync` | `10_Sessions/`, `handoffs/`, `12_Brain/raw/sessions/` | Codex vault-dump cron |
| Domain / ads / SEO | `domain-ads-seo` | client agent memory, `02_Campaigns/`, site-health state | ads-health + site-health crons |
| Content routines | `content-routines` | `03_Content/`, content calendars, Sunday BOK/Align cadence | separate content crons |
| Memory consolidate | `memory-consolidator` | all lane outputs → one brief | plan-today + inbox-brief merge |

## P0 tie-break (when everything is urgent)

1. **Launch blocked** — client cannot go live (NKCDC, Netlify suspension, billing blocks)
2. **Billing risk** — ads paused, card outstanding, 90-day continuation at risk (Replenish, Hardwood)
3. **Ad disapprovals** — spend stopped or account limited
4. **Hard calendar** — meetings, EOM deadlines, boss requests unanswered 48h+ (Jason/Sean bot case)

## Output contract

Every run writes:

- `Daily-Briefs/competitive-task-today.md` — the single ranked board (≤60 lines)
- `12_Brain/state/competitive-task-orchestrator.json` — run metadata + lane statuses
- Updated `Dashboard.md` `## Today` — top 3 as unchecked tasks
- Optional lane artifacts under `Daily-Briefs/lanes/YYYY-MM-DD-<lane>.md`

## Hard rules

- **Draft-first.** Never send email, post Slack, deploy, or spend.
- **Align HCM** is full-time, not M360 revenue — tag separately, never mix billing.
- **KJB emails** must CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com.
- **Tier 2 stays gated** per `12_Brain/protocols/approval-tiers.md` — the orchestrator prepares; Dillon executes.
- When Gmail or Slack MCP is unavailable, fall back to vault captures — note the blind spot, do not fabricate.

## Umbrella replaces these legacy automations

Disable these separate Cursor crons once the umbrella is live:

1. Morning loop (`handoffs/Morning Loop Scheduled Agent Setup.md`)
2. Standalone `/slack-intake` cron
3. Standalone `/client-pulse` cron
4. Standalone `/am-report` cron
5. Standalone `/plan-today` cron
6. Communication intelligence daily ingest (folded into gmail-intel + slack-intel)
7. Sunday content-routines cron (folded into content-routines lane — runs every day but only acts on cadence triggers)
