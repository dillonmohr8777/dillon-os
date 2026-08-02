# Competitive Task — 2026-08-01

## Coverage

- **Gmail:** fallback — MCP not connected in cloud agent; `System/urgent-replies.md` refreshed from vault + `Daily-Briefs/source-intake-2026-07-30.md`.
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` (7 actions, 2 P0). Codex connector `oauth_refresh_token_rejected` blocks live reads (**10 days open**).
- **Vault pulse:** 148 client files; 14 `overview.md` with tracking frontmatter; BigOrange + Bridge touched in last 48h. Most M360 `last_touched` frozen at April 2026.
- **Sessions:** 12 files in `10_Sessions/` (5 orchestrator run logs + Bridge build + FB Ads stubs still empty). Bridge post-Tori capture **19 days overdue**.
- **Ads/SEO:** Google Ads queue empty on `main`; P0s from client overviews + Jul 30 source intake (Replenish billing block).
- **Content routines:** **skipped** — Saturday (not Sunday/Thursday). **Tomorrow (Sun Aug 2)** content-routines fires. Book SEO sweep **overdue** since Jul 31 (Thursday missed).

## P0 Stack

1. **Jason/Sean EOM classifications — OVERDUE (due Jul 31)** — Classify Chatbot, CallRail after-hours/SMS, and Internal Agent workflows as built / tested / blocked / approval-required with evidence. Source: Jason Fallon DM 2026-07-22. No SMS activation or routing changes without explicit approval.
2. **Replenish — Google Ads billing block** — Campaigns cannot run until Mia completes account-side payment update. Confirm billing screen cleared and delivery restored. Separate from Fresh Blends.
3. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**108 days**). Escalate with Mac today.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**116 days**). Only client marked `at_risk`. Engagement pause risk.
5. **Netlify credits suspension** — `dillonmohr8777` team exceeded 3,000-credit cycle; projects suspended until top-up or **Aug 6 reset**. Inventory which mapped sites are offline before approving spend.

**Next tier:** **BOK Law** — Wed Wisdom (Jul 30) + Turn the Page (Jul 31) + Family Fri (Aug 1) all unshipped; 7-week backlog. **Align HCM** — SmartCare post (Jul 30) + Maher/Joann/Jul 21 backlog unshipped. **Bar Crawl USA** — 2 Google Ads disapprovals (~108 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~109 days not live. **Bridge Software Development** — Tori decision package was 2026-07-13; post-meeting capture **19 days overdue**. **Book site** — email capture endpoint dead; blocks 2,000-subscriber goal. **Codex Slack reauth** — P0 blocker (**10 days open**). **BigOrange** — Custom Home Builder pillar audit due **Aug 10** (9 days).

## Urgent Replies

See [[System/urgent-replies]].

- **Jason Fallon / Sean Boyle** — EOM status on Chatbot, CallRail SMS, Internal Agent workflows (**OVERDUE**)
- **Replenish (Mia)** — Confirm Google Ads billing screen completed and campaigns serving
- **BOK Law** — Ship entire Jun/Jul backlog; Wed Wisdom (Jul 30) + Turn the Page (Jul 31) + Family Fri (Aug 1) overdue
- **Align HCM** — Ship overdue Maher + Joann + Jul 21 posts; SmartCare post (Jul 30) overdue
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop
- **Bar Crawl USA** — Disapproval resolution message to Andy + Soulard pacing check
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps
- **Melissa Silber** — Guidelines prompt + Loom status (from Jul 30 Slack open loop)

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on most M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~152 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~118 days overdue) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch:** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **19 days overdue**. BigOrange — pillar audit due Aug 10.

**Data gaps:** 134 client stubs without `overview.md`. Google Ads queue empty. Facebook Ads session stubs in `10_Sessions/` still empty.

## Content / SEO Due

- **OVERDUE (Jul 30)** — BOK Wed Wisdom + Align SmartCare brand awareness post (drafts in `03_Content/`)
- **OVERDUE (Jul 31)** — BOK Turn the Page Thursday + book SEO sweep (Thursday routine missed)
- **OVERDUE (Aug 1)** — BOK Family Fridays post (draft in `03_Content/Bok Law — week of 2026-07-28.md`)
- **OVERDUE SHIP** — BOK Jun 23 through Jul 21 week files (**7+ weeks backlog**)
- **OVERDUE SHIP** — Align Maher (missed Jul 28) + Joann + Jul 21 payroll posts
- **UPCOMING Aug 10** — BigOrange Custom Home Builder pillar audit + Janice interview
- **BLOCKED** — Book email capture endpoint dead; fix before Meta lead-magnet ads

## Tomorrow Prep

1. **Sunday Aug 2** — content-routines fires (BOK social drafts for next week + Align LinkedIn calendar).
2. **Netlify** — decide top-up vs wait for Aug 6 reset; inventory suspended mapped sites.
3. **Bridge** — if Tori decisions captured, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
4. **Reauth Codex Slack connector** — unblocks Slack MCP + Mac's Slack AI reintegration request (**10 days open**).
5. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
6. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).
7. Export **Facebook Ads Codex sessions** into `10_Sessions/` dated files.
