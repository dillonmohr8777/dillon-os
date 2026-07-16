---
last_sync: 2026-07-15
tags: [system, memory, sync]
---

# Claude Memory Sync

Single source of truth for all Claude instances across Dillon OS. Updated by `competitive-task-orchestrator` daily at 1:00 PM ET (replaces `vault-integrity-sync` + `chat-to-vault-sync`).

## Active clients (Momentum 360)
• Bar Crawl USA ($950/mo) — active, 2 Google Ads disapprovals unresolved (~91 days).
• Kimberly James Bridal ($300/mo) — active, Timeline page + GA4/GSC still open.
• Shadow HVAC ($250/mo) — active, LSA status needs verification after 2026-03-02 reset (~135 days).
• LinkEZE ($300/mo) — active, enhanced conversions + MFA overdue on 809-600-6448 (~101 days).
• Omega Landscaping ($200/mo) — active, chasing David for drone footage.
• Jeff Hozias / Rand Realty ($200/mo) — active, Meta seller campaign approved 2026-04-14, not launched (~92 days).
• Fresh Blends / Replenish ($500/mo) — active, confirm launch + week-1 snapshot.
• BOK Law — active, weekly social cadence; Jul 9 posts unshipped (6 days overdue), Jul 14 week drafts ready.
• NKCDC — active, BLOCKED on Free Tax Prep landing page (~91 days).
• Commercial Cleaners Alliance — onboarding, creative delivery audit due.
• Hardwood Artisan ($150/mo) — AT RISK, billing card update outstanding since 2026-04-07 (~99 days).
• Onsite Concrete & Landscape — active, standing Thursday 1:00 PM ET call.
• Bridge Software Development — discovery complete 2026-07-11; Tori decision package due 2026-07-13 — **post-meeting capture 2 days overdue**.

## Full-time
• Align HCM — Dillon's full-time employer. Not a client. Jul 15 Maher post drafted 2026-07-12 (**DUE TODAY**); Jul 21 SmartCare video still needs asset.

## Pending deliverables
• Align HCM — record/ship Maher post **today Jul 15**; ship overdue week files (Jun 23, Jul 7).
• Bar Crawl USA — resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl).
• Kimberly James Bridal — publish Timeline page, verify GA4 + GSC indexing per Mac.
• LinkEZE — fix enhanced conversions; confirm MFA on 809-600-6448.
• Fresh Blends / Replenish — confirm launch; first-week performance snapshot.
• NKCDC — launch Free Tax Prep campaign when NKCDC clears landing page.
• Commercial Cleaners Alliance — deliver CCA + NexGen creatives (committed 2026-04-08).
• Hardwood Artisan — CHASE billing card update before engagement pauses.
• Omega Landscaping — drone footage from David.
• Jeff Hozias — launch approved seller Meta campaign.
• BOK Law — ship overdue week files (Jun 23, Jun 30, Jul 7) + Jul 14 week continues.
• Bridge Software Development — capture Tori meeting outcome; send follow-up with decisions.

## Upcoming deadlines (7 days)
• 2026-07-15 — Align HCM Maher LinkedIn post (**TODAY** — script drafted, needs record/review).
• 2026-07-16 — BOK Wednesday Wisdom (Jul 14 week file).
• 2026-07-17 — Book SEO sweep (Thursday content-routine day).
• 2026-07-18 — BOK Family Fridays (Jul 14 week file).
• 2026-07-21 — Align SmartCare video post (asset still missing — do not schedule).

## Recent completions (7 days)
• 2026-07-15 — competitive-task-orchestrator run 22; umbrella workflow on branch ec43.
• 2026-07-14 — competitive-task-orchestrator run 21; umbrella workflow merged to branch 2304.
• 2026-07-13 — competitive-task-orchestrator run 20; umbrella infrastructure merged to dd09 branch.
• 2026-07-12 — competitive-task-orchestrator run 19; BOK + Align Jul 14 content drafts generated.
• 2026-07-11 — Bridge Software Development discovery session complete; vault archived.

## Unanswered / urgent
• **Align HCM** — Maher post due **today**; Joann Monday post 2 days late.
• **NKCDC** — Anthony unresponsive since Mac's 2026-04-15 follow-up. Launch blocked.
• **Hardwood Artisan** — Sean's 2026-04-07 billing request still outstanding (~99 days).
• **Bar Crawl USA** — 2 disapproved ads need resolution (~91 days).
• **Omega Landscaping** — David hasn't confirmed Thursday meeting with John Belaska.
• **Commercial Cleaners Alliance** — 2026-04-08 creative commitment needs delivery audit.
• **BOK Law** — Jul 9 posts missed (6 days); three overdue week files unshipped.
• **Bridge** — Tori meeting outcome not captured in vault (2 days overdue).

## Orchestrator
• **Single automation:** `competitive-task-orchestrator` — cron `0 13 * * *`
• **Parallel lanes:** gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines → memory-consolidator
• **Daily brief:** `Daily-Briefs/competitive-task-today.md`
• **Gmail/Slack MCP:** not connected — vault fallback until OAuth enabled
