# Competitive Task — 2026-07-26

## Coverage

- **Gmail:** fallback — MCP not connected; `System/urgent-replies.md` refreshed from vault (2026-07-26).
- **Slack:** fallback — MCP not connected; `System/slack-action-queue.md` refreshed (11 actions, 4 P0).
- **Vault pulse:** 13 tracked overviews; zero `last_touched` in last 48h; all frozen at March–April 2026 except Bridge (`updated: 2026-07-11`). 11+ active client stubs missing operational frontmatter.
- **Sessions:** 16 files scanned; run 22 indexed; no new session exports since 2026-07-15. Facebook Ads session stubs still empty — export Codex sessions on 64GB machine.
- **Ads/SEO:** 7 open in Google Ads queue (3 High / 2 Medium / 2 Low). No new disapprovals since Run 22. Bar Crawl disapprovals are Google Ads (not FB queue).
- **Content routines:** **skipped** — Saturday (not Sun/Thu). **Seven** week files in `03_Content/` await operator ship; entire Jun/Jul backlog still undelivered.

## P0 Stack

1. **Ship BOK Law + Align HCM content backlog NOW** — Four BOK week files (`2026-06-23`, `2026-06-30`, `2026-07-07`, `2026-07-14`) and three Align week files (`2026-06-23`, `2026-07-07`, `2026-07-14`) are draft-ready. Jul 14 week alone has Wed Wisdom (**10 days overdue**), Turn the Page Thu (**9 days**), Family Fri (**8 days**). Batch-email BOK to Dorothy (CC: akocelko, rbowe) and schedule Align posts in HubSpot before generating another week.
2. **Align HCM Maher post — 11 days overdue** — Script ready in `03_Content/Align HCM — week of 2026-07-14.md`. Record talking-head or ship text-only fallback **today**; Jul 21 SmartCare slot still blocked on video asset.
3. **Bridge Software Development** — Tori decision package was Monday **2026-07-13**; post-meeting capture still missing (**13 days overdue**). Capture feedback on prototype + brand direction; update `01_Clients/Bridge Software Development/overview.md` and send follow-up.
4. **Hardwood Artisan** — Billing card update outstanding since Sean's 2026-04-07 escalation (~**110 days**). Only client marked `at_risk`. Engagement pause risk.
5. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since Mac's 2026-04-15 follow-up (~**102 days**). Escalate with Mac today.

**Next tier:** **Bar Crawl USA** — 2 Google Ads disapprovals (~102 days). **Jeff Hozias** — Meta seller campaign approved 2026-04-14, ~103 days not live. **Book site** — email capture endpoint reported dead (verify on next Thu SEO sweep).

## Urgent Replies

See [[System/urgent-replies]].

- **BOK Law** — Batch-email all four overdue week files to Dorothy; Jul 23 Wisdom now **3 days overdue**, Jul 24 Turn the Page **2 days overdue**, Jul 25 Family Fridays **1 day overdue**
- **Align HCM** — Record or ship text-only Maher post (**11 days overdue**); Joann Monday post (Jul 14 week) **12 days late**
- **Bridge Software Development** — Capture Tori meeting outcome; send follow-up with decisions + next steps (**13 days overdue**)
- **Bar Crawl USA** — Disapproval resolution message to Andy
- **NKCDC** — Coordinated follow-up with Mac to Anthony
- **Hardwood Artisan** — Billing nudge to Dalton via Sean loop

## Stalled Clients (7+ days)

Vault `last_touched` frozen at April 2026 on all M360 accounts — update when you touch a note:

| Client | last_touched | Open item |
|--------|--------------|-----------|
| Shadow HVAC | 2026-03-02 | LSA verification after reset (~146 days) |
| LinkEZE | 2026-04-05 | Enhanced conversions + MFA (~112 days) |
| Hardwood Artisan | 2026-04-07 | Billing card update |
| Onsite Concrete | 2026-04-09 | Weekly call cadence |
| Fresh Blends / Replenish | 2026-04-13 | Launch confirmation + week-1 snapshot |
| Commercial Cleaners Alliance | 2026-04-14 | Creative delivery audit |
| Omega Landscaping | 2026-04-14 | Drone footage + John Belaska meeting |
| Jeff Hozias | 2026-04-14 | Launch approved Meta seller campaign |
| Bar Crawl USA | 2026-04-15 | Ad disapprovals |
| NKCDC | 2026-04-15 | Launch blocked |
| Kimberly James Bridal | 2026-04-15 | Timeline page publish + GA4/GSC |

**Watch (2–7 days):** Bridge Software Development — discovery complete 2026-07-11; post-Tori meeting capture **13 days overdue**.

**Data gaps:** 11+ active client stubs (Buzz Bull, Florecita, Bluegrass Janitorial, etc.) have no `overview.md` or pulse frontmatter.

## Content / SEO Due Today

- **Overdue ship** — Entire BOK Jun/Jul backlog + Align Jun/Jul backlog in `03_Content/` (**1–12 days overdue** depending on slot)
- **Overdue** — Align Maher post (Jul 15) **11 days**; Joann Monday (Jul 14 week) **12 days**
- **Blocked** — Align Jul 21 SmartCare video — no asset file; do not schedule until video exists
- **Sunday 2026-07-27** — `content-routines` generates next Bok Law social week + Align LinkedIn week (do not generate until backlog ships)
- **Thursday 2026-07-31** — book-site-seo-sweep runs (next content-routine day)

## Tomorrow Prep

1. **Sunday 2026-07-27** — `content-routines` fires for BOK + Align **only after** Jun/Jul backlog is shipped or explicitly waived.
2. **Bridge** — if Tori decisions captured today, start Claude session with repo + `CLAUDE_SESSION_PROMPT.md`.
3. **Codex Slack reauth** — follow `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md` on 64GB desktop (`oauth_refresh_token_rejected`).
4. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (both lanes still vault-fallback).
5. Disable **7 legacy crons** in Cursor UI if still active (see [[System/competitive-task-definition]]).

---

_Generated by competitive-task-orchestrator — run 33, branch `cursor/competitive-task-consolidation-5280`._
