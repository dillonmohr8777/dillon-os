# Competitive Task — 2026-07-29

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-29).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` unchanged (7 actions, 2 P0). Codex connector `oauth_refresh_token_rejected` blocks live Slack reads (**7 days open**).
- **Vault pulse:** 143 client files scanned; 13 overviews with tracking frontmatter; zero substantive `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-27`). 13 client stubs missing `overview.md`.
- **Sessions:** 7 files in `10_Sessions/` (Run 36 added); Facebook Ads session stubs still empty. Bridge post-Tori capture **16 days overdue**.
- **Ads/SEO:** Google Ads queue has 7 unchecked items; Meta/testing/creative/search queues empty. P0s sourced from client overviews + urgent-replies.
- **Content routines:** **skipped** — Wednesday (not Sunday/Thursday). Jul 28 week drafts ready; BOK Wed Wisdom due **tomorrow (Jul 30)**.

## P0 Stack

1. **Align HCM — Maher post MISSED YESTERDAY + ship backlog** — Maher thought leadership was due Jul 15 (**14 days overdue**). Jul 28 publish date **missed yesterday**. Joann Monday post due Jul 13 (**16 days late**). Jul 21 payroll post **8 days overdue**. **Ship entire Jun/Jul backlog today**, then publish Maher from `03_Content/Align HCM — week of 2026-07-28.md`.
2. **BOK Law ship backlog — 17+ DAYS OVERDUE** — Ship ALL overdue week files to Dorothy (CC: akocelko, rbowe): Jun 23, Jun 30, Jul 7 (**Jul 9 Wisdom 20 days overdue**), Jul 14 (**Jul 16 Turn the Page 13 days**, **Jul 17 Family Fridays 12 days overdue**), Jul 21 week file. **Wed Wisdom due tomorrow Jul 30** — draft ready in Jul 28 week file.
3. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**105 days**). Escalate with Mac today.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**113 days**). Only client marked `at_risk`. Engagement pause risk.
5. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**16 days overdue**). Capture feedback on prototype + brand direction; update overview and send follow-up.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~105 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~106 days not live. **Book site** — email capture endpoint dead; blocks 2,000-subscriber goal. **Jason/Sean EOM** — classifications due **2026-07-31** (**2 days**). **Codex Slack reauth** — P0 blocker (**7 days open** since 2026-07-22).

## Urgent Replies

See [[System/urgent-replies]].

- **Align HCM** — Ship overdue Maher + Joann + Jul 21 posts; **publish Maher thought leadership (missed Jul 28)**
- **BOK Law** — Ship entire Jun/Jul backlog in one email; Wed Wisdom due **Jul 30**
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop
- **Bar Crawl USA** — Disapproval resolution message to Andy + Soulard pacing check
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Omega Landscaping** — Escalate David/John Belaska Thursday account review (~106 days)

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~149 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~115 days overdue) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch:** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **16 days overdue**.

**Data gaps:** 13 client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md`. Five Meta/creative/search campaign queues empty.

## Content / SEO Due Today

- **OVERDUE SHIP** — Align Maher post (missed Jul 28) + entire Jun/Jul backlog
- **OVERDUE SHIP** — BOK Jun 23 through Jul 21 week files (**7 weeks backlog**)
- **DUE Jul 30** — BOK Wed Wisdom + Align SmartCare post (drafts ready in Jul 28 week files)
- **DUE Jul 31** — Jason/Sean EOM classifications (Chatbot, CallRail SMS, Internal Agent workflows)
- **TOMORROW Jul 31** — Book SEO sweep (content-routines fires Thursday)
- **BLOCKED** — Book email capture endpoint dead; fix before Meta lead-magnet ads

## Tomorrow Prep

1. **Ship BOK + Align backlog** — one consolidated email per client before Jul 30 publishes.
2. **Thursday Jul 31** — book SEO sweep (content-routines) + Jason/Sean EOM classifications due same day.
3. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
4. **Reauth Codex Slack connector** — unblocks Slack MCP + Mac's Slack AI reintegration request (**7 days open**).
5. **Book site** — fix email capture endpoint (blocks subscriber goal).
6. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
7. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
8. Export **Facebook Ads Codex sessions** into `10_Sessions/` dated files.
