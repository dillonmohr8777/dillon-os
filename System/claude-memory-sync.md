---
last_sync: 2026-06-19
tags: [system, memory, sync]
---

# Claude Memory Sync

Single source of truth for all Claude instances across Dillon OS. Updated by `memory-consolidator` inside `competitive-task-orchestrator` (daily 13:00 UTC).

## Active clients (Momentum 360)

• Bar Crawl USA ($950/mo) — active, campaigns live across 9+ cities. 2 disapproved ads open since 2026-04-14/15.
• Kimberly James Bridal ($300/mo) — active, Timeline page approved 2026-04-13; publish pending.
• Shadow HVAC ($250/mo) — active, LSA status needs verification after 2026-03-02 reset.
• LinkEZE ($300/mo) — active, enhanced conversions diagnostics warning open (~88 days).
• Omega Landscaping ($200/mo) — active, chasing David for drone footage.
• Jeff Hozias / Rand Realty ($200/mo) — active, Meta seller campaign approved 2026-04-14; launch pending.
• Fresh Blends / Replenish ($500/mo) — active, campaigns set to launch 2026-04-13; pacing unverified.
• BOK Law — active, weekly social cadence. Turn the Page due 2026-06-19; Family Fridays 2026-06-20.
• NKCDC — active, BLOCKED on NKCDC shipping Free Tax Prep landing page.
• Commercial Cleaners Alliance — onboarding, creatives in flight.
• Hardwood Artisan ($150/mo) — AT RISK, billing card update outstanding since 2026-04-07.
• Onsite Concrete & Landscape — active, standing Thursday 1:00 PM ET call.

## Full-time

• Align HCM — Dillon's full-time employer. Not a client. Not counted in client totals. Joann carousel due 2026-06-20; Mon–Wed June slots may need catch-up.

## Pending deliverables

• Bar Crawl USA — resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl language flagged 2026-04-14/15).
• BOK Law — ship Turn the Page Thursday 2026-06-19; prep Family Fridays 2026-06-20.
• Align HCM — Joann post-go-live carousel 2026-06-20; catch up Mon/Tue/Wed if unposted.
• Kimberly James Bridal — publish Timeline page, verify GA4 + GSC indexing per Mac.
• LinkEZE — fix enhanced conversions data source diagnostics; confirm MFA enabled on 809-600-6448.
• Fresh Blends / Replenish — confirm 2026-04-13 campaign launch went live; first-week performance snapshot.
• NKCDC — launch Free Tax Prep campaign the moment NKCDC clears the landing page.
• Commercial Cleaners Alliance — deliver CCA creatives + NexGen creatives (committed 2026-04-08).
• Hardwood Artisan — CHASE billing card update before engagement pauses.
• Omega Landscaping — drone footage from David.
• Jeff Hozias — launch approved seller Meta campaign.

## Upcoming deadlines (7 days)

• 2026-06-19 — BOK Law Turn the Page Thursday (today).
• 2026-06-20 — BOK Law Family Fridays; Align HCM Joann carousel.
• 2026-06-22 — Sunday content-routines trigger (next week BOK + Align calendars).
• 2026-06-26 — Book SEO Thursday sweep (next scheduled trigger).

## Recent completions (7 days)

• 2026-06-19 — Umbrella orchestrator daily run on `94fb`; restored workflow from `e3cc`.
• 2026-06-16 — BOK Law + Align HCM June 16–22 content calendars generated.
• 2026-06-16 — BOK post dates corrected to Wed/Thu/Fri slots.
• 2026-06-15 — Umbrella competitive-task-orchestrator with parallel agents created.

## Unanswered / urgent

• **NKCDC** — Anthony did not respond to Dillon's 2026-04-13 Monday check-in OR Mac's 2026-04-15 follow-up. Launch is blocked.
• **Hardwood Artisan** — Dalton said "give me a few days" on 2026-04-01. Sean's 2026-04-07 billing request still outstanding.
• **Bar Crawl USA** — 2 disapproved ads from 2026-04-14 and 2026-04-15 need resolution.
• **Omega Landscaping** — David hasn't confirmed Thursday meeting with John Belaska (pinged 2026-04-14).
• **Commercial Cleaners Alliance** — 2026-04-08 creative commitment needs delivery audit.

## Umbrella workflow

One cron (`competitive-task-orchestrator`, `0 13 * * *`) replaces 7 legacy routines. Dillon reads `Daily-Briefs/competitive-task-today.md` only. Parallel agents: gmail-intel, slack-intel, vault-pulse, codex-session-sync, content-routines, domain-ads-seo; then memory-consolidator.
