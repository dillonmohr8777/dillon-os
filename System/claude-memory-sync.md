---
last_sync: 2026-07-11
tags: [system, memory, sync]
---

# Claude Memory Sync

Single source of truth for all Claude instances across Dillon OS. Updated by `competitive-task-orchestrator` daily at 1:00 PM ET (replaces legacy `vault-integrity-sync` + `chat-to-vault-sync`).

## Active clients (Momentum 360)
• Bar Crawl USA ($950/mo) — active, 2 Google Ads disapprovals unresolved (~87 days).
• Kimberly James Bridal ($300/mo) — active, Timeline page approved 2026-04-13, not published.
• Shadow HVAC ($250/mo) — active, LSA status needs verification after 2026-03-02 reset (~131 days).
• LinkEZE ($300/mo) — active, enhanced conversions + MFA overdue (~95 days).
• Omega Landscaping ($200/mo) — active, chasing David for drone footage.
• Jeff Hozias / Rand Realty ($200/mo) — active, Meta seller campaign approved 2026-04-14, not launched (~88 days).
• Fresh Blends / Replenish ($500/mo) — active, launch confirmation + week-1 snapshot owed.
• BOK Law — active, weekly social drafts in `03_Content/` unshipped (2 days overdue).
• NKCDC — active, BLOCKED on NKCDC shipping Free Tax Prep landing page (~87 days silent).
• Commercial Cleaners Alliance — onboarding, creatives in flight.
• Hardwood Artisan ($150/mo) — AT RISK, billing card update outstanding (~95 days).
• Onsite Concrete & Landscape — active, standing Thursday call cadence.

## Full-time
• Align HCM — Dillon's full-time employer. Not a client. Align content drafts in `03_Content/` unshipped.

## Pending deliverables
• **BOK Law + Align HCM** — ship content week files in `03_Content/` (Jul 9 posts missed).
• Bar Crawl USA — resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl).
• Kimberly James Bridal — publish Timeline page, verify GA4 + GSC indexing per Mac.
• LinkEZE — fix enhanced conversions; confirm MFA on 809-600-6448.
• Fresh Blends / Replenish — confirm launch pacing; first-week snapshot to Mia.
• NKCDC — launch Free Tax Prep campaign the moment NKCDC clears the landing page.
• Commercial Cleaners Alliance — deliver CCA creatives + NexGen creatives.
• Hardwood Artisan — CHASE billing card update before engagement pauses.
• Omega Landscaping — drone footage from David.
• Jeff Hozias — launch approved seller Meta campaign.

## Upcoming deadlines (7 days)
• 2026-07-12 — Sunday content-routines: BOK social + Align LinkedIn draft generation.
• 2026-07-15 — Align HCM Maher post blocker (per handoff).
• 2026-07-17 — Thursday book SEO sweep (`content-routines`).

## Unanswered / urgent
• **NKCDC** — Anthony silent since Mac's 2026-04-15 follow-up. Launch blocked.
• **Hardwood Artisan** — Sean's 2026-04-07 billing request still outstanding (~95 days).
• **Bar Crawl USA** — 2 disapproved ads need resolution; Andy waiting.
• **Jeff Hozias** — approved Meta campaign not live (~88 days).
• **BOK Law / Align** — content drafts unshipped 2 days past Jul 9 window.

## Umbrella automation
• **One cron:** `competitive-task-orchestrator` at `0 13 * * *` (1 PM ET).
• **Parallel agents:** gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines → memory-consolidator.
• **Daily brief:** `Daily-Briefs/competitive-task-today.md`
