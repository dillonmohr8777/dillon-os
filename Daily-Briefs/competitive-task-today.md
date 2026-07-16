# Competitive Task — 2026-07-16

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-16).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` refreshed (10 actions, 5 P0).
- **Vault pulse:** 13 tracked overviews; zero `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-11`). 11+ active client stubs missing operational frontmatter.
- **Sessions:** 17 files scanned (runs 12–22 indexed; run 23 today). Facebook Ads session stubs still empty — export Codex sessions on 64GB machine.
- **Ads/SEO:** 7 open in Google Ads queue (3 High / 2 Medium / 2 Low). No new disapprovals since Run 20. Bar Crawl disapprovals are Google Ads (not FB queue).
- **Content routines:** **done** — Thursday book SEO sweep → `05_Book/seo-sweep-2026-07-16.md`. BOK Jul 16 Wisdom draft ready to ship.

## P0 Stack

1. **BOK Law Wednesday Wisdom — DUE TODAY Jul 16** — Draft ready in `03_Content/Bok Law — week of 2026-07-14.md`. Email Dorothy (CC: akocelko, rbowe). Also ship Jun 23, Jun 30, Jul 7 backlog (**7 days overdue**).
2. **Align HCM Maher post — 1 DAY OVERDUE** — Was due Jul 15. Script in `03_Content/Align HCM — week of 2026-07-14.md`. Ship text-only fallback today or record talking-head. Joann Monday post (Jul 13) is **3 days late**.
3. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**3 days overdue**). Capture feedback on prototype + brand direction; update `01_Clients/Bridge Software Development/overview.md` and send follow-up.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**100 days**). Only client marked `at_risk`. Engagement pause risk.
5. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**92 days**). Escalate with Mac today.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~92 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~93 days not live.

## Urgent Replies

See [[System/urgent-replies]].

- **BOK Law** — Ship Jul 16 Wisdom + overdue week files to Dorothy **today**
- **Align HCM** — Ship overdue Maher post (text-only OK) + Joann Monday post
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Bar Crawl USA** — Disapproval resolution message to Andy
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~136 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~102 days) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch (2–7 days):** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **3 days overdue**.

**Data gaps:** 11+ active client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md` or pulse frontmatter.

## Content / SEO Due Today

- **TODAY 2026-07-16** — BOK Wednesday Wisdom (Jul 14 week file) — **ship now**
- **OVERDUE** — Align Maher post (Jul 15) — **1 day late**; Joann Monday (Jul 13) — **3 days late**
- **OVERDUE ship** — BOK + Align backlog in `03_Content/` drafts (**7 days overdue**)
- **DONE** — Book SEO sweep → `05_Book/seo-sweep-2026-07-16.md` (email capture fix is P0 blocker for growth)
- **Sunday 2026-07-20** — Next BOK + Align LinkedIn content-routine day

## Tomorrow Prep

1. **Ship BOK Turn the Page Thursday** — draft ready in Jul 14 week file (Jul 17).
2. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
3. **Book site** — fix dead email capture endpoint before any paid traffic.
4. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
5. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
