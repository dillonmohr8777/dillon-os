# Competitive Task — 2026-07-28

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-28).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` unchanged (7 actions, 2 P0). Codex connector `oauth_refresh_token_rejected` blocks live Slack reads.
- **Vault pulse:** 143 client files scanned; 13 overviews with tracking frontmatter; zero substantive `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-27`). 13 client stubs missing `overview.md`.
- **Sessions:** 6 files in `10_Sessions/`; no new sessions since Run 34. Facebook Ads session stubs still empty. Bridge post-Tori capture **15 days overdue**.
- **Ads/SEO:** Google Ads queue has 7 unchecked items; Meta/testing/creative/search queues empty. P0s sourced from client overviews + urgent-replies.
- **Content routines:** **skipped** — Tuesday (not Sunday/Thursday). Week of Jul 28 drafts already exist from Run 34.

## P0 Stack

1. **Align HCM — Maher post DUE TODAY + ship backlog** — Maher thought leadership was due Jul 15 (**13 days overdue**). Joann Monday post due Jul 13 (**15 days late**). Jul 21 payroll post **7 days overdue**. **TODAY (Tue Jul 28):** publish Maher post from `03_Content/Align HCM — week of 2026-07-28.md` — but ship entire Jun/Jul backlog first in one consolidated send.
2. **BOK Law ship backlog — 16+ DAYS OVERDUE** — Ship ALL overdue week files to Dorothy (CC: akocelko, rbowe): Jun 23, Jun 30, Jul 7 (**Jul 9 Wisdom 19 days overdue**), Jul 14 (**Jul 16 Turn the Page 12 days**, **Jul 17 Family Fridays 11 days overdue**), Jul 21 week file. Wed Wisdom for Jul 30 is next hard date (2 days).
3. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**104 days**). Escalate with Mac today.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**112 days**). Only client marked `at_risk`. Engagement pause risk.
5. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**15 days overdue**). Capture feedback on prototype + brand direction; update overview and send follow-up.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~104 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~105 days not live. **Book site** — email capture endpoint dead; blocks 2,000-subscriber goal. **Jason/Sean EOM** — classifications due **2026-07-31** (3 days). **Codex Slack reauth** — P0 blocker (6 days open since 2026-07-22).

## Urgent Replies

See [[System/urgent-replies]].

- **Align HCM** — Ship overdue Maher + Joann + Jul 21 posts; **publish Maher thought leadership TODAY**
- **BOK Law** — Ship entire Jun/Jul backlog in one email; Wed Wisdom due Jul 30
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop
- **Bar Crawl USA** — Disapproval resolution message to Andy + Soulard pacing check
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Omega Landscaping** — Escalate David/John Belaska Thursday account review (~105 days)

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~148 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~114 days overdue) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch:** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **15 days overdue**.

**Data gaps:** 13 client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md`. Five Meta/creative/search campaign queues empty.

## Content / SEO Due Today

- **DUE TODAY** — Align Maher thought leadership post (`03_Content/Align HCM — week of 2026-07-28.md`)
- **OVERDUE SHIP** — BOK Jun 23 through Jul 21 week files (**7 weeks backlog**)
- **OVERDUE SHIP** — Align Jun/Jul week files (**7 weeks backlog**)
- **DUE Jul 30** — BOK Wed Wisdom + Align SmartCare post (drafts ready)
- **NEXT BOOK SEO SWEEP** — Thursday 2026-07-31 (also Jason/Sean EOM deadline)
- **BLOCKED** — Book email capture endpoint dead; fix before Meta lead-magnet ads

## Tomorrow Prep

1. **Ship BOK + Align backlog** — one consolidated email per client before publishing remaining Jul 28 week drafts.
2. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
3. **Jason/Sean EOM** — classify Chatbot, CallRail SMS, Internal Agent workflows by Jul 31 (see `handoffs/marketing-chief-intake-2026-07-22.md`).
4. **Thursday Jul 31** — book SEO sweep (content-routines) + EOM classifications due same day.
5. **Reauth Codex Slack connector** — unblocks Slack MCP + Mac's Slack AI reintegration request.
6. **Book site** — fix email capture endpoint (blocks subscriber goal).
7. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
8. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
9. Export **Facebook Ads Codex sessions** into `10_Sessions/` dated files.
