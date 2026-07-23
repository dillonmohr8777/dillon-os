# Competitive Task — 2026-07-23

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-23).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` refreshed (12 actions, 5 P0). Marketing Chief intake items merged from `handoffs/marketing-chief-intake-2026-07-22.md`.
- **Vault pulse:** 145 client files scanned; 13 overviews with tracking frontmatter; zero `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-11`). 15 client stubs missing operational frontmatter.
- **Sessions:** 24 files scanned (runs 12–29 indexed; run 30 today). Facebook Ads session stubs still empty — export Codex sessions on 64GB machine.
- **Ads/SEO:** 7 open in Google Ads queue (3 High / 2 Medium / 2 Low). No new disapprovals since Run 20. Bar Crawl disapprovals are Google Ads (not FB queue).
- **Content routines:** **done** — Thursday book SEO sweep → `05_Book/seo-sweep-2026-07-23.md`. Email capture endpoint still dead (P0 blocker).

## P0 Stack

1. **BOK Law ship backlog — 14 DAYS OVERDUE** — Ship ALL overdue week files to Dorothy (CC: akocelko, rbowe): Jun 23, Jun 30, Jul 7 (**Jul 9 Wisdom 14 days overdue**), Jul 14 (**Jul 16 Turn the Page 7 days**, **Jul 17 Family Fridays 6 days overdue**), Jul 21 week file. **Today:** publish Wednesday Wisdom (Jul 23) from week-of-Jul-21 file. One consolidated email, all weeks attached.
2. **Align HCM — ship overdue + Jul 21 post** — Maher post was due Jul 15 (**8 days overdue**). Joann Monday post was due Jul 13 (**10 days late**). Joann payroll post (Jul 21) is **2 days overdue** in `03_Content/Align HCM — week of 2026-07-21.md` — ship backlog first, then Jul 21 post. SmartCare video still needs asset (leave unscheduled).
3. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**10 days overdue**). Capture feedback on prototype + brand direction; update `01_Clients/Bridge Software Development/overview.md` and send follow-up.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**107 days**). Only client marked `at_risk`. Engagement pause risk.
5. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**98 days**). Escalate with Mac today.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~98 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~99 days not live. **Book site** — email capture endpoint dead; blocks 2,000-subscriber goal.

## Urgent Replies

See [[System/urgent-replies]].

- **BOK Law** — Ship entire Jun/Jul backlog + publish Jul 23 Wednesday Wisdom **today**
- **Align HCM** — Ship overdue Maher + Joann posts; publish Jul 21 Joann payroll post
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Bar Crawl USA** — Disapproval resolution message to Andy
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~142 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~108 days) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch (2–7 days):** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **10 days overdue**.

**Data gaps:** 15 client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md` or pulse frontmatter.

## Content / SEO Due Today

- **PUBLISH TODAY** — BOK Wednesday Wisdom (Jul 23) from `week of 2026-07-21` file
- **OVERDUE SHIP** — BOK Jun 23, Jun 30, Jul 7, Jul 14 week files (**14 days** on Jul 9 posts)
- **OVERDUE SHIP** — Align Jul 14 week file (Maher Jul 15, Joann Jul 13)
- **2 DAYS OVERDUE** — Align Joann payroll post (Jul 21) in week file — ship after clearing backlog
- **DONE** — Book SEO sweep `05_Book/seo-sweep-2026-07-23.md` (3 keyword outlines)
- **BLOCKED** — Book email capture endpoint dead; fix before Meta lead-magnet ads
- **Jul 21** — Align SmartCare video still needs asset (leave unscheduled)
- **Tomorrow** — BOK Turn the Page Thursday (Jul 24) from week-of-Jul-21 file

## Tomorrow Prep

1. **Ship BOK backlog** — one consolidated email to Dorothy with all overdue week files + Jul 21 week; publish Jul 23 Wisdom today.
2. **Align** — ship overdue Maher + Joann; publish Jul 21 Joann post; review week drafts.
3. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
4. **BOK Turn the Page** — Jul 24 post from week-of-Jul-21 file.
5. **Book site** — fix email capture endpoint (blocks subscriber goal).
6. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
7. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
8. **Marketing Chief intake** — Slack AI reintegration (Mac #ai-tech-news) and Jason/Sean EOM agenda items in `handoffs/marketing-chief-intake-2026-07-22.md`.
