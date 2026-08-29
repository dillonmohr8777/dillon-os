---
tags: [brief, competitive-task, daily]
date: 2026-08-29
source_refs:
  - System/competitive-task-definition.md
  - System/approval-queue.md
  - System/urgent-replies.md
  - Daily-Briefs/radar-2026-08-28.md
  - 12_Brain/07_Reviews/2026-08-15 - 120-Day Slack Operating System Audit.md
---

# Competitive Task — 2026-08-29

## Coverage

- **Gmail:** `source: vault-fallback` — no live Gmail MCP on cloud runner; refreshed from `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`, `12_Brain/09_Ops/Netlify Credits Suspension 2026-07-30.md`, and approval queue.
- **Slack:** `source: vault-fallback` — wrote `System/slack-action-queue.md` from `00_Inbox/slack/*`, 120-day audit, and gated approval items (last live connector success: 2026-08-17).
- **Vault pulse:** 40 client routes scanned; **zero** accounts touched in 22+ days; **8 overdue `due:` dates**; Capsule & Tonic and Everyday Life Insurance still pending registry reconciliation.
- **Sessions:** 2 substantive sessions in `10_Sessions/` (Bridge 2026-07-11, Momentum reporting 2026-07-29); 4 undated scaffolds need assign/archive; Session Index updated.
- **Ads/SEO:** P0s from client overviews — Replenish billing, Bar Crawl disapprovals, Onsite PMax + Search security block, Omega attribution/access, Shadow Meta/LSA, Tags 2 Go access.
- **Prospect Radar:** `Daily-Briefs/radar-2026-08-28.md` — 1,227 tracked, 230 rebuild-ready (Mohr Media growth lane, not client P0).
- **Content routines:** **skipped** — Saturday (Sunday = Bok + Align LinkedIn; Thursday = book SEO).
- **Automation health:** `System/routine-health.md` updated; legacy seven-crontab stack superseded by this umbrella run.

## P0 Stack

1. **Replenish** — Google Ads billing block; campaigns cannot run until Mia completes account-side payment. Highest billing-risk item on the blue-dashboard roster. Evidence: `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`.
2. **Shadow HVAC** — Meta confirmed off; LSA post-Evident reset unverified; Summer AC LP preview ready but deploy gated. Client waiting on lead delivery. Evidence: `01_Clients/Shadow HVAC/overview.md`, `active-campaigns.md`.
3. **Onsite Concrete** — PMax disapproved (bad destination); Search replacement draft blocked on Google security confirmation. Evidence: `01_Clients/Onsite Concrete/Agent Memory.md`.
4. **Momentum 360 / Customer Agent** — Jason & Sean bot stability + case-reinstated alerts unanswered since 2026-07-30. Operational blocker for Align customer-agent lane. Evidence: `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md`.
5. **Bar Crawl USA** — 2 ads disapproved since Apr 14–15; Boos & Booze event hub + current-event SEO QA overdue (`due` 2026-07-15 passed). Evidence: `01_Clients/Bar Crawl USA/active-campaigns.md`, `overview.md`.

**Next tier:** Revive LSA verification + 48-hour recovery brief; Fagan Meta attribution before scale; Sean CallRail status reply (after log verification); BigOrange pillar overdue (Aug 10 target passed).

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
| Bar Crawl USA | 2026-07-11 | 49 | Event hub + disapproved ads |
| Kimberly James Bridal | 2026-07-12 | 48 | FAQ crop + appointment routing |
| Shadow HVAC | 2026-07-12 | 48 | Meta/LSA + Summer AC LP |
| Hope Wellness Center | 2026-07-12 | 48 | Request analysis |
| Onsite Concrete | 2026-07-12 | 48 | Crawl + conversion audit |
| BigOrange Marketing | 2026-07-30 | 30 | Pillar audit overdue |
| Aug 1 cohort (17 folders) | 2026-08-01 | 28 | Portfolio-wide touch needed |
| Tags 2 Go | 2026-08-07 | 22 | Access mapping + rebuild |

**Registry gaps:** Capsule & Tonic and Everyday Life Insurance — `pending-registry-reconciliation` per Client Index.

## Content / SEO Due

- **Saturday 2026-08-29** — content-routines skipped
- **Sunday 2026-08-30** — BOK Law social + Align LinkedIn (`content-routines` runs tomorrow)
- **Preview-ready LPs** (approval-gated): Shadow Summer AC, KJB Wedding Timeline, Omega Outdoor Living — `02_Campaigns/Landing Page Build Queue.md`

## Tomorrow Prep

1. **Sunday** — review BOK + Align content-routines output before any publish.
2. Touch any worked client note → update `last_touched`, `next_action`, `due`.
3. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` to exit vault-fallback mode.
4. Disable legacy seven-crontab automations — see [[System/competitive-task-definition#Retired standalone crons]].
5. Prospect Radar 230 rebuild-ready sites = outreach fuel, not today's client P0.
