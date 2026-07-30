# Competitive Task — 2026-07-30

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-30).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` unchanged (7 actions, 2 P0). Codex connector `oauth_refresh_token_rejected` blocks live Slack reads (**8 days open**).
- **Vault pulse:** 192 client files scanned; 13 overviews with tracking frontmatter; only Bridge touched in last 48h (`last_touched: 2026-07-30`). 24 root stubs bulk-synced Jul 29 with `TBD` next actions — not real movement. 12 clients missing `overview.md`.
- **Sessions:** 9 files in `10_Sessions/`; Facebook Ads session stubs still empty. Bridge post-Tori capture **17 days overdue**.
- **Ads/SEO:** Google Ads queue has 7 unchecked items; Meta/testing/creative/search queues empty. P0s sourced from client overviews + urgent-replies.
- **Content routines:** **skipped** — Wednesday (not Sunday/Thursday). **BOK Wed Wisdom + Align SmartCare due TODAY (Jul 30)**. Book SEO sweep fires tomorrow (Thursday).

## P0 Stack

1. **BOK Law — Wed Wisdom DUE TODAY + 7-week backlog** — Ship ALL overdue week files to Dorothy (CC: akocelko, rbowe): Jun 23 through Jul 21. **Wed Wisdom (co-parenting & back-to-school) due today Jul 30** — draft ready in `03_Content/Bok Law — week of 2026-07-28.md`. Oldest posts **20+ days overdue**.
2. **Align HCM — SmartCare DUE TODAY + ship backlog** — Maher thought leadership missed Jul 28 (**2 days past publish**; originally due Jul 15, **15 days overdue**). **SmartCare brand awareness post due today Jul 30** — draft ready in `03_Content/Align HCM — week of 2026-07-28.md`. Joann Monday post due Jul 13 (**17 days late**). Jul 21 payroll post **9 days overdue**. Ship entire Jun/Jul backlog, then publish today's SmartCare post.
3. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**106 days**). Escalate with Mac today.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**114 days**). Only client marked `at_risk`. Engagement pause risk.
5. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**17 days overdue**). Capture feedback on prototype + brand direction; update overview and send follow-up.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~106 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~107 days not live. **Book site** — email capture endpoint dead; blocks 2,000-subscriber goal. **Jason/Sean EOM** — classifications due **2026-07-31** (**tomorrow**). **Codex Slack reauth** — P0 blocker (**8 days open** since 2026-07-22). **LinkEZE** — enhanced conversions + MFA on `809-600-6448` (~115 days overdue).

## Urgent Replies

See [[System/urgent-replies]].

- **BOK Law** — Ship entire Jun/Jul backlog in one email; **publish Wed Wisdom today Jul 30**
- **Align HCM** — Ship overdue Maher + Joann + Jul 21 posts; **publish SmartCare post today Jul 30**
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop
- **Bar Crawl USA** — Disapproval resolution message to Andy + Soulard pacing check
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Omega Landscaping** — Escalate David/John Belaska Thursday account review (~107 days)

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~150 days) |
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

**Watch:** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **17 days overdue** (touched today for orchestrator sync only).

**Data gaps:** 12 client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md`. Five Meta/creative/search campaign queues empty. 8 Client Index entries have zero vault note.

## Content / SEO Due Today

- **DUE TODAY Jul 30** — BOK Wed Wisdom (co-parenting & back-to-school) + Align SmartCare brand awareness post
- **OVERDUE SHIP** — Align Maher post (missed Jul 28) + entire Jun/Jul backlog
- **OVERDUE SHIP** — BOK Jun 23 through Jul 21 week files (**7 weeks backlog**)
- **DUE Jul 31** — Jason/Sean EOM classifications (Chatbot, CallRail SMS, Internal Agent workflows)
- **TOMORROW Jul 31** — Book SEO sweep (content-routines fires Thursday) + BOK Turn the Page Thursday
- **BLOCKED** — Book email capture endpoint dead; fix before Meta lead-magnet ads

## Tomorrow Prep

1. **Thursday Jul 31** — book SEO sweep (content-routines) + Jason/Sean EOM classifications due same day + BOK Turn the Page Thursday publish.
2. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
3. **Reauth Codex Slack connector** — unblocks Slack MCP + Mac's Slack AI reintegration request (**8 days open**).
4. **Book site** — fix email capture endpoint (blocks subscriber goal).
5. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
6. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
7. Export **Facebook Ads Codex sessions** into `10_Sessions/` dated files.
