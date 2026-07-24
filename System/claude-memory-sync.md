---
last_sync: 2026-07-24
tags: [system, memory, sync]
---

# Claude Memory Sync

Single source of truth for all Claude instances across Dillon OS. Updated by `/memory-consolidator` during `competitive-task-orchestrator` daily run.

## Competitive task (umbrella)

One automation replaces 7 legacy crons: `competitive-task-orchestrator` — cron `0 13 * * *`. Parallel lanes: gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines (Sun/Thu). Consolidator writes this file + `Daily-Briefs/competitive-task-today.md`.

## Active clients (Momentum 360)

- Bar Crawl USA ($950/mo) — active, 2 Google Ads disapprovals unresolved (~100 days).
- Kimberly James Bridal ($300/mo) — active, Timeline page + GA4/GSC open.
- Shadow HVAC ($250/mo) — active, LSA verification after 2026-03-02 reset (~144 days).
- LinkEZE ($300/mo) — active, enhanced conversions + MFA overdue (~110 days).
- Omega Landscaping ($200/mo) — active, chasing David for drone footage.
- Jeff Hozias / Rand Realty ($200/mo) — active, Meta seller campaign approved 2026-04-14, not live (~101 days).
- Fresh Blends / Replenish ($500/mo) — active, week-1 snapshot pending.
- BOK Law — active, **Jun/Jul social backlog unshipped**; Jul 24 Turn the Page due today.
- NKCDC — active, **BLOCKED** on Free Tax Prep landing page (~100 days).
- Commercial Cleaners Alliance — onboarding, creatives in flight.
- Hardwood Artisan ($150/mo) — **AT RISK**, billing card update (~108 days).
- Onsite Concrete & Landscape — active, standing Thursday call cadence.
- Bridge Software Development — active-discovery, Tori meeting capture **11 days overdue**.

## Full-time

- Align HCM — Dillon's full-time employer. Not a client. Overdue LinkedIn posts: Maher Jul 15 (**9 days**), Joann Jul 13 (**11 days**), Joann Jul 21 payroll (**3 days**).

## Pending deliverables

- **BOK Law** — Ship Jun 23, Jun 30, Jul 7, Jul 14, Jul 21 week files; publish Jul 24 Turn the Page today; Jul 23 Wisdom 1 day overdue.
- **Align HCM** — Ship overdue Maher + Joann posts; publish Jul 21 Joann payroll post.
- **Bridge Software Development** — Capture Tori 2026-07-13 meeting outcome; send follow-up.
- Bar Crawl USA — resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl).
- NKCDC — launch Free Tax Prep campaign when Anthony ships landing page.
- Hardwood Artisan — CHASE billing card update before engagement pauses.
- Jeff Hozias — launch approved seller Meta campaign.
- LinkEZE — fix enhanced conversions + MFA on 809-600-6448.
- Fresh Blends / Replenish — first-week performance snapshot to Mia.
- Commercial Cleaners Alliance — deliver CCA + NexGen creatives audit.
- Kimberly James Bridal — Timeline page publish + GA4/GSC verification.
- **Book site** — email capture endpoint dead (`/api/dossier-leads`); blocks 2,000-subscriber goal.

## Upcoming deadlines (7 days)

- **2026-07-24** — BOK Turn the Page Thursday (today).
- **2026-07-25** — BOK Family Fridays.
- **2026-07-30** — Next book SEO sweep (Thursday content routine).
- **Sunday 2026-07-27** — BOK social + Align LinkedIn content routine generates next week's drafts.

## Recent completions (7 days)

- 2026-07-23 — Book SEO sweep → `05_Book/seo-sweep-2026-07-23.md` (3 keyword outlines).
- 2026-07-23 — Competitive task orchestrator run 30; umbrella infrastructure restored on consolidation branch.

## Unanswered / urgent

- **BOK Law** — Entire Jun/Jul social backlog unshipped; Jul 23 Wisdom 1 day overdue; Jul 24 Turn the Page due today.
- **Align HCM** — Maher Jul 15 (**9 days**), Joann Jul 13 (**11 days**), Joann Jul 21 payroll (**3 days**) all overdue.
- **Bridge** — Tori meeting outcome not captured post-2026-07-13 (**11 days**).
- **NKCDC** — Anthony silent since Mac's 2026-04-15 follow-up. Launch blocked.
- **Hardwood Artisan** — Dalton card update outstanding since Sean's 2026-04-07 push.
- **Bar Crawl USA** — 2 disapproved ads need resolution reply to Andy.

## Known gaps

- Gmail + Slack MCP unavailable on cloud runner — both lanes use vault fallback.
- Vault `last_touched` frozen at April 2026 on most M360 clients.
- `10_Sessions/` Facebook Ads templates still empty — export Codex sessions on 64GB machine.
- Codex Slack connector: `oauth_refresh_token_rejected` — see `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md`.

## Operator rules

- KJB emails MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Align HCM is full-time, not M360 client revenue
- P0 tie-break: launch blocked > billing risk > ad disapprovals > calendar
