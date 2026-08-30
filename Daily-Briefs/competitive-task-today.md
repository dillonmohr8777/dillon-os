---
tags: [brief, competitive-task, daily]
date: 2026-08-30
source_refs:
  - System/competitive-task-definition.md
  - System/approval-queue.md
  - System/urgent-replies.md
  - Daily-Briefs/radar-2026-08-30.md
  - 12_Brain/07_Reviews/2026-08-15 - 120-Day Slack Operating System Audit.md
---

# Competitive Task — 2026-08-30

## Coverage

- **Gmail:** `source: vault-fallback` — no live Gmail MCP on cloud runner; refreshed from `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`, `System/urgent-replies.md`, and approval queue (last live connector: 2026-08-17).
- **Slack:** `source: vault-fallback` — `System/slack-action-queue.md` refreshed from `00_Inbox/slack/*` (4 July 30 loops still `status: new`).
- **Vault pulse:** 41 canonical client routes; **zero** touched in 24h; **37 active** stalled 7+ days; **Cindy May Christmas** due **2026-09-01** (build package).
- **Sessions:** 7 files in `10_Sessions/`; 2 substantive (Bridge 2026-07-11, Reporting 2026-07-29); Session Index updated; 19 promotion candidates → partial sync to Momentum 360 + Bridge overviews.
- **Ads/SEO:** P0s from client notes — Replenish billing, Shadow Meta/LSA, Onsite PMax/Search, Bar Crawl disapprovals, Revive LSA brief. Campaign queues empty (drift from client truth).
- **Prospect Radar:** `Daily-Briefs/radar-2026-08-30.md` — 1,283 tracked, **238 rebuild-queue** (Mohr Media growth lane).
- **Content routines:** **done (Sunday)** — BOK Law Wed–Fri drafts + Align LinkedIn week of Sep 1–7 drafted (approval-gated).
- **Automation health:** Umbrella run on branch `cursor/competitive-task-consolidation-dabf`; legacy seven-crontab stack superseded.

## P0 Stack

1. **Replenish** — Google Ads billing block; campaigns cannot run until Mia completes account-side payment. Highest billing-risk item on the blue-dashboard roster. Evidence: `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`.
2. **Shadow HVAC** — Meta confirmed off; LSA post-Evident reset unverified; Summer AC LP preview ready but deploy gated. Client waiting on lead delivery. Evidence: `01_Clients/Shadow HVAC/overview.md`, `active-campaigns.md`.
3. **Onsite Concrete** — PMax disapproved (bad destination); Search replacement draft blocked on Google security confirmation. Evidence: `01_Clients/Onsite Concrete/Agent Memory.md`.
4. **Momentum 360 / Customer Agent** — Jason & Sean bot stability + case-reinstated alerts unanswered since 2026-07-30. Operational blocker for Align customer-agent lane. Evidence: `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md`.
5. **Bar Crawl USA** — 2 ads disapproved since Apr 14–15; Boos & Booze event hub + current-event SEO QA overdue (`due` 2026-07-15 passed). Evidence: `01_Clients/Bar Crawl USA/active-campaigns.md`, `overview.md`.

**Next tier:** Revive LSA verification + 48-hour recovery brief; Cindy May Christmas build due tomorrow; Fagan Meta attribution before scale; Sean CallRail status reply; daily-driver budget ceiling (26/26) blocking autonomous routines.

## Urgent Replies

See [[System/urgent-replies]] and [[System/slack-action-queue]]. All external replies remain approval-gated.

| Lane | Ask | Gate |
| --- | --- | --- |
| Replenish / Mia | Confirm billing screen completed; verify ad delivery after clearance | High — approval queue |
| Jason & Sean | Bot stability + auto alerts on case reinstatement | Med — approval queue |
| Sean / CallRail | Activity verification before status reply | Med — approval queue |
| Melissa | Guidelines prompt, Loom, meeting slot | Low — approval queue |
| Jenny / NeedMomentum | Brand direction + timeline after Mac/Sean confirm | Med — approval queue |
| Shadow / Mike | Catch-up report after LSA/Meta verification | Med — approval queue |

**KJB rule:** any client email must CC mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com.

## Stalled Clients (7+ days)

| Client | last_touched | Days | Open item |
| --- | --- | ---: | --- |
| Bar Crawl USA | 2026-07-11 | 50 | Event hub + disapproved ads |
| Kimberly James Bridal | 2026-07-12 | 49 | FAQ crop + appointment routing |
| Shadow HVAC | 2026-07-12 | 49 | Meta/LSA + Summer AC LP |
| Hope Wellness Center | 2026-07-12 | 49 | Request analysis |
| Onsite Concrete | 2026-07-12 | 49 | Crawl + conversion audit |
| BigOrange Marketing | 2026-07-30 | 31 | Pillar audit overdue |
| Aug 1 cohort (17 folders) | 2026-08-01 | 29 | Portfolio-wide touch needed |
| Tags 2 Go | 2026-08-07 | 23 | Access mapping + rebuild |

**Due tomorrow:** Cindy May Christmas — `due: 2026-09-01` — website package after video/newsletter/Shopify prerequisites.

**Registry gaps:** Capsule & Tonic and Everyday Life Insurance — `pending-registry-reconciliation` per Client Index.

## Content / SEO Due Today

- **Sunday 2026-08-30** — drafts written (do not publish without approval):
  - BOK Law: `03_Content/BOK Law/2026-09-01-week-social-drafts.md`
  - Align HCM LinkedIn: `02_FullTimeJob/AlignHCM/linkedin-drafts-2026-09-01-week.md`
- **Preview-ready LPs** (approval-gated): Shadow Summer AC, KJB Wedding Timeline, Omega Outdoor Living — `02_Campaigns/Landing Page Build Queue.md`
- **Queue hygiene:** Mirror P0 ad items into `02_Campaigns/Google Ads Optimization Queue.md` and `Facebook Ads Optimization Queue.md` on next vault touch.

## Tomorrow Prep

1. **Monday 2026-09-01** — Cindy May Christmas build window; Labor Day calendar check.
2. Review BOK + Align drafts; route BOK to Dorothy after legal guardrails check.
3. Touch any worked client note → update `last_touched`, `next_action`, `due`.
4. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` to exit vault-fallback mode.
5. Disable legacy seven-crontab automations — see [[System/competitive-task-definition#Retired standalone crons]].
6. Prospect Radar 238 rebuild-ready sites = outreach fuel, not today's client P0.
