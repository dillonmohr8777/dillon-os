---
tags: [brief, competitive-task, daily]
date: 2026-08-31
source_refs:
  - System/competitive-task-definition.md
  - System/approval-queue.md
  - System/urgent-replies.md
  - System/slack-action-queue.md
  - Daily-Briefs/radar-2026-08-30.md
  - 12_Brain/07_Reviews/2026-08-15 - 120-Day Slack Operating System Audit.md
---

# Competitive Task — 2026-08-31

## Coverage

- **Gmail:** `fallback` — no Gmail MCP on cloud runner; refreshed `System/urgent-replies.md` from vault overlays (last live connector evidence: 2026-08-17).
- **Slack:** `fallback` — Slack read MCP needsAuth; created `System/slack-action-queue.md` from `00_Inbox/slack/` (2026-07-30 captures).
- **Vault pulse:** 39 canonical client notes; **0** touched in 24h; **36** stalled 7+ days; **1** due in 48h (Cindy May Christmas).
- **Sessions:** 6 files in `10_Sessions/`; 2 substantive with open commitments; Session Index updated; 2 client promotions (Momentum 360, Bridge).
- **Ads/SEO:** 5 ad P0s surfaced; campaign optimization queues empty (drift from client truth).
- **Content routines:** `skipped` — Monday; Sunday BOK/Align drafts already written 2026-08-30 on branch `dabf` (not merged here).
- **Prospect Radar:** `Daily-Briefs/radar-2026-08-30.md` — 1,283 tracked, **238** rebuild-queue (Mohr Media growth lane, not client P0).
- **Automation health:** Umbrella run on branch `cursor/competitive-task-consolidation-9c7d`; legacy seven-crontab stack superseded by this workflow.

## P0 Stack

1. **Cindy May Christmas** — `due: 2026-09-01` (~12h). Build website package after video/newsletter/Shopify prerequisites. Launch-blocked calendar item.
2. **Replenish** — Google Ads billing block; campaigns cannot run until Mia completes account-side payment. Highest billing-risk on blue-dashboard roster. Evidence: `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`.
3. **Shadow HVAC** — Meta visibility unverified; LSA post-Evident reset never confirmed; Summer AC LP preview ready but deploy gated. Client waiting on lead delivery. Evidence: `01_Clients/Shadow HVAC/overview.md`.
4. **Momentum 360 / Customer Agent** — Jason & Sean bot stability + case-reinstated alerts unanswered since 2026-07-30. Operational blocker for Align customer-agent lane. Evidence: `System/slack-action-queue.md`.
5. **Bar Crawl USA** — 2 ads disapproved since Apr 14–15; confirmed-event SEO + current-event hub QA overdue (`due` 2026-07-15 passed). Evidence: `01_Clients/Bar Crawl USA/active-campaigns.md`.

**Next tier:** Onsite PMax disapproval + conversion audit; Fagan Meta attribution before scale; Revive 48-hour recovery brief delivery; Sean CallRail status reply; daily-driver budget ceiling (26/26) blocking autonomous Claude routines.

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
| Bar Crawl USA | 2026-07-11 | 51 | Event hub + disapproved ads |
| Kimberly James Bridal | 2026-07-12 | 50 | FAQ crop + appointment routing |
| Shadow HVAC | 2026-07-12 | 50 | Meta/LSA + Summer AC LP |
| Hope Wellness Center | 2026-07-12 | 50 | Request analysis |
| Onsite Concrete | 2026-07-12 | 50 | Crawl + conversion audit |
| BigOrange Marketing | 2026-07-30 | 32 | Pillar audit overdue |
| Aug 1 cohort (17 folders) | 2026-08-01 | 30 | Portfolio-wide touch needed |
| Tags 2 Go | 2026-08-07 | 24 | Access mapping + rebuild (`due` 2026-08-08 passed) |

**Due tomorrow:** Cindy May Christmas — `due: 2026-09-01` — website package after video/newsletter/Shopify prerequisites.

**Registry gaps:** Capsule & Tonic and Everyday Life Insurance — `pending-registry-reconciliation` per Client Index.

**Data gaps:** 16 active clients still carry `next_action: TBD — needs human next action`.

## Content / SEO Due Today

- **Monday 2026-08-31** — no day-gated content routine (Sunday = BOK + Align; Thursday = book SEO).
- **Preview-ready LPs** (approval-gated): Shadow Summer AC, KJB Wedding Timeline, Omega Outdoor Living — `02_Campaigns/Landing Page Build Queue.md`.
- **Queue hygiene:** Mirror P0 ad items into `02_Campaigns/Google Ads Optimization Queue.md` and `Facebook Ads Optimization Queue.md` on next vault touch.

## Tomorrow Prep

1. **Tuesday 2026-09-01** — Cindy May Christmas build window; Labor Day calendar check.
2. Review any Sunday content drafts on merged branch; route BOK to Dorothy after legal guardrails check.
3. Touch any worked client note → update `last_touched`, `next_action`, `due`.
4. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` to exit vault-fallback mode.
5. Disable legacy seven-crontab automations — see [[System/competitive-task-definition#Retired standalone crons]].
6. Prospect Radar 238 rebuild-ready sites = outreach fuel, not today's client P0.
