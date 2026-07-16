# Competitive Task — 2026-07-15

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-15).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` refreshed (10 actions, 4 P0).
- **Vault pulse:** 13 tracked overviews; zero `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-11`). 11+ active client stubs missing operational frontmatter.
- **Sessions:** 16 files scanned (runs 12–21 indexed; run 21 merged umbrella to ec43 branch). Facebook Ads session stubs still empty — export Codex sessions on 64GB machine.
- **Ads/SEO:** 7 open in Google Ads queue (3 High / 2 Medium / 2 Low). No new disapprovals since Run 20. Bar Crawl disapprovals are Google Ads (not FB queue).
- **Content routines:** **skipped** — Wednesday (not Sun/Thu). Seven draft-ready week files in `03_Content/` await operator ship.

## P0 Stack

1. **Align HCM Maher post — DUE TODAY** — Script ready in `03_Content/Align HCM — week of 2026-07-14.md`. Record talking-head or ship text-only fallback and schedule in HubSpot **before EOD**.
2. **Ship overdue content NOW** — BOK Law (`03_Content/Bok Law — week of 2026-06-23.md`, `2026-06-30.md`, `2026-07-07.md`) and Align HCM (`03_Content/Align HCM — week of 2026-06-23.md`, `2026-07-07.md`). Jul 9 posts missed — now **6 days overdue**. Joann Monday post (Jul 13) is **2 days late**.
3. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**2 days overdue**). Capture feedback on prototype + brand direction; update `01_Clients/Bridge Software Development/overview.md` and send follow-up.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**99 days**). Only client marked `at_risk`. Engagement pause risk.
5. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**91 days**). Escalate with Mac today.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~91 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~92 days not live.

## Urgent Replies

See [[System/urgent-replies]].

- **Align HCM** — Record or ship text-only Maher post **today** (Jul 15 deadline)
- **BOK Law** — Email all three overdue week files to Dorothy (CC: akocelko, rbowe) — Jul 9 Wisdom post now 6 days overdue
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Bar Crawl USA** — Disapproval resolution message to Andy
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~135 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~101 days) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch (2–7 days):** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **2 days overdue**.

**Data gaps:** 11+ active client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md` or pulse frontmatter.

## Content / SEO Due Today

- **TODAY 2026-07-15** — Align Maher video script drafted; record or ship text-only fallback **before EOD**
- **Overdue ship** — BOK Wednesday Wisdom (Jul 9) + Align backlog in `03_Content/` drafts (**6 days overdue**)
- **Overdue** — Align Joann Monday post (Jul 13) — **2 days late**; draft in Jul 14 week file
- **Thursday 2026-07-16** — BOK Wednesday Wisdom (Jul 14 week file) — pre-stage today
- **Thursday 2026-07-17** — book-site-seo-sweep runs (next content-routine day)

## Tomorrow Prep

1. **Ship BOK Jul 16 Wisdom** — draft ready in Jul 14 week file.
2. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
3. **Book SEO sweep** — Thursday content-routine fires tomorrow; read `05_Book/seo-strategy.md`.
4. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
5. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
