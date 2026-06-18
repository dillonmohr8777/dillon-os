---
last_sync: 2026-06-18
tags: [system, memory, sync]
---

# Claude Memory Sync

Single source of truth for all Claude instances across Dillon OS. Updated by `memory-consolidator` inside `competitive-task-orchestrator` (daily 13:00 UTC).

## Active clients (Momentum 360)
• Bar Crawl USA ($950/mo) — active, 2 ad disapprovals unresolved (P0).
• Kimberly James Bridal ($300/mo) — active, Timeline page publish pending.
• Shadow HVAC ($250/mo) — active, LSA status needs verification after 2026-03-02 reset.
• LinkEZE ($300/mo) — active, enhanced conversions diagnostics warning open.
• Omega Landscaping ($200/mo) — active, chasing David for drone footage.
• Jeff Hozias / Rand Realty ($200/mo) — active, Meta seller campaign approved, launch pending.
• Fresh Blends / Replenish ($500/mo) — active, launch verification needed.
• BOK Law — active, June 16–22 content calendar current; Turn the Page due 2026-06-18.
• NKCDC — active, BLOCKED on NKCDC shipping Free Tax Prep landing page (P0).
• Commercial Cleaners Alliance — onboarding, creatives overdue from 2026-04-08 commitment.
• Hardwood Artisan ($150/mo) — AT RISK, billing card update outstanding since 2026-04-07 (P0).
• Onsite Concrete & Landscape — active, standing Thursday 1:00 PM ET call.

## Full-time
• Align HCM — Dillon's full-time employer. Not a client. LinkedIn SmartCare + Monday posts overdue; Joann carousel due 2026-06-19.

## Pending deliverables
• Bar Crawl USA — resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl language flagged).
• Kimberly James Bridal — publish Timeline page, verify GA4 + GSC indexing per Mac.
• LinkEZE — fix enhanced conversions data source diagnostics; confirm MFA enabled on 809-600-6448.
• Fresh Blends / Replenish — confirm campaign launch pacing; first-week performance snapshot.
• NKCDC — launch Free Tax Prep campaign the moment NKCDC clears the landing page.
• Commercial Cleaners Alliance — deliver CCA creatives + NexGen creatives (committed 2026-04-08).
• Hardwood Artisan — CHASE billing card update before engagement pauses.
• Omega Landscaping — drone footage from David.
• Jeff Hozias — launch approved seller Meta campaign.
• BOK Law — Turn the Page Thursday 2026-06-18; Family Fridays 2026-06-19.
• Align HCM — SmartCare graphic (overdue Wed 2026-06-17); Joann carousel Fri 2026-06-19.

## Upcoming deadlines (7 days)
• 2026-06-18 — BOK Law Turn the Page Thursday; Align HCM SmartCare catch-up; Book SEO sweep.
• 2026-06-19 — BOK Law Family Fridays; Align HCM Joann carousel.
• 2026-06-25 — Bar Crawl USA Taco & Tequila wave 1 (9 cities) if disapprovals resolved.
• 2026-06-25 — Next book SEO sweep (Thursday trigger).

## Recent completions (7 days)
• 2026-06-18 — Umbrella orchestrator daily run; consolidated brief + book SEO sweep.
• 2026-06-17 — Fourth orchestrator run on `e3cc`; June content calendars generated.
• 2026-06-16 — BOK Law + Align HCM June 16–22 calendars created.

## Unanswered / urgent
• **NKCDC** — Anthony did not respond to Dillon's 2026-04-13 Monday check-in OR Mac's 2026-04-15 follow-up. Launch is blocked.
• **Hardwood Artisan** — Dalton said "give me a few days" on 2026-04-01. Sean's 2026-04-07 billing request still outstanding.
• **Bar Crawl USA** — 2 disapproved ads from 2026-04-14 and 2026-04-15 need resolution.
• **Omega Landscaping** — David hasn't confirmed Thursday meeting with John Belaska.
• **Commercial Cleaners Alliance** — 2026-04-08 creative commitment needs delivery audit.

## Umbrella workflow
• One cron: `competitive-task-orchestrator` at `0 13 * * *`
• Daily read: `Daily-Briefs/competitive-task-today.md`
• 7 legacy crons deprecated. See `System/competitive-task-definition.md`.
