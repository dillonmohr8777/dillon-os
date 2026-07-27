# Competitive Task — 2026-07-27

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-27).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` refreshed (7 actions, 2 P0). Codex connector `oauth_refresh_token_rejected` blocks live Slack reads.
- **Vault pulse:** 192 client files scanned; 13 overviews with tracking frontmatter; zero `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-27`). 10+ client stubs missing operational frontmatter.
- **Sessions:** 6 files in `10_Sessions/`; Session Index updated. Facebook Ads session stubs still empty — export Codex sessions on 64GB machine. Bridge post-Tori capture **14 days overdue**.
- **Ads/SEO:** Campaign queues empty on branch; P0s sourced from client overviews + urgent-replies. Bar Crawl disapprovals (~103 days), NKCDC launch blocked (~103 days), LinkEZE MFA/diagnostics (~113 days overdue).
- **Content routines:** **done** — Sunday. Drafted `03_Content/Bok Law — week of 2026-07-28.md` and `03_Content/Align HCM — week of 2026-07-28.md`. **7 overdue Jun/Jul week files** still need shipping for both clients.

## P0 Stack

1. **BOK Law ship backlog — 15+ DAYS OVERDUE** — Ship ALL overdue week files to Dorothy (CC: akocelko, rbowe): Jun 23, Jun 30, Jul 7 (**Jul 9 Wisdom 18 days overdue**), Jul 14 (**Jul 16 Turn the Page 11 days**, **Jul 17 Family Fridays 10 days overdue**), Jul 21 week file. **TODAY (Sun):** draft week of Jul 28 is ready — but backlog ships first in one consolidated email.
2. **Align HCM — ship overdue + Jul 28 post** — Maher post was due Jul 15 (**12 days overdue**). Joann Monday post was due Jul 13 (**14 days late**). Jul 21 Joann payroll post **6 days overdue**. Week of Jul 28 drafted today (Maher Mon Jul 28, SmartCare Wed Jul 30, Barbara Fri Aug 1) — ship backlog first.
3. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**14 days overdue**). Capture feedback on prototype + brand direction; update overview and send follow-up.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**111 days**). Only client marked `at_risk`. Engagement pause risk.
5. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**103 days**). Escalate with Mac today.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~103 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~104 days not live. **Book site** — email capture endpoint dead; blocks 2,000-subscriber goal. **Slack AI reintegration** — P0 blocker on Codex connector reauth (Mac #ai-tech-news).

## Urgent Replies

See [[System/urgent-replies]].

- **BOK Law** — Ship entire Jun/Jul backlog in one email; then deliver week of Jul 28 drafts
- **Align HCM** — Ship overdue Maher + Joann posts; publish Jul 28 Maher thought leadership
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Bar Crawl USA** — Disapproval resolution message to Andy + Soulard pacing check
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop
- **Omega Landscaping** — Escalate David/John Belaska Thursday account review (~104 days)

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~147 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~113 days overdue) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch (2–14 days):** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **14 days overdue**.

**Data gaps:** 10+ client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md` or pulse frontmatter. All campaign queues empty.

## Content / SEO Due Today

- **DRAFTED TODAY** — BOK week of Jul 28 (Wed Jul 30, Thu Jul 31, Fri Aug 1) in `03_Content/Bok Law — week of 2026-07-28.md`
- **DRAFTED TODAY** — Align week of Jul 28 (Mon Jul 28 Maher, Wed Jul 30 SmartCare, Fri Aug 1 Barbara) in `03_Content/Align HCM — week of 2026-07-28.md`
- **OVERDUE SHIP** — BOK Jun 23, Jun 30, Jul 7, Jul 14, Jul 21 week files (**7 weeks backlog**)
- **OVERDUE SHIP** — Align Jun/Jul week files (**7 weeks backlog**)
- **NEXT BOOK SEO SWEEP** — Thursday 2026-07-31
- **BLOCKED** — Book email capture endpoint dead; fix before Meta lead-magnet ads

## Tomorrow Prep

1. **Ship BOK + Align backlog** — one consolidated email per client with all overdue week files before publishing Jul 28 drafts.
2. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
3. **Jason/Sean EOM** — classify Chatbot, CallRail SMS, Internal Agent workflows by Jul 31 (see `handoffs/marketing-chief-intake-2026-07-22.md`).
4. **Reauth Codex Slack connector** — unblocks Slack MCP + Mac's Slack AI reintegration request.
5. **Book site** — fix email capture endpoint (blocks subscriber goal).
6. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
7. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
8. Export **Facebook Ads Codex sessions** into `10_Sessions/` dated files.
