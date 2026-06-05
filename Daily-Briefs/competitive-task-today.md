---
generated: 2026-06-05T13:01:37Z
orchestrator: competitive-task-orchestrator
agents_run: [gmail-intel, slack-intel, vault-pulse, codex-session-sync, content-routines, domain-ads-seo, memory-consolidator]
coverage_gaps: [Gmail MCP unavailable, Slack MCP unavailable, vault last_touched frozen since 2026-04-15]
---

# Competitive Task Brief — 2026-06-05

## P0 — Do First

1. **NKCDC — launch blocked.** Free Tax Prep landing page still not cleared by Anthony. Mac checked in 2026-04-15, no response. Nudge again today. This is the #1 launch blocker across the portfolio.
2. **Hardwood Artisan — billing at risk.** Sean's card-update push to Dalton (2026-04-07) still outstanding. Engagement pauses if Dalton doesn't act. Due was 2026-04-18, now 48 days past.
3. **Bar Crawl USA — 2 disapproved ads.** Halloween / Fall Cocktail Crawl language flagged 2026-04-14–15. Andy is waiting on resolution. Use pre-approved copy only. Zero alcohol language.
4. **LinkEZE — enhanced conversions + MFA.** Diagnostics warning open since 2026-04-05. Google Ads MFA deadline was 2026-04-06. Customer ID 809-600-6448. 60 days overdue.
5. **BOK Law — content due today.** Turn the Page Thursday post due 2026-06-05. Family Fridays due 2026-06-06. Last delivery logged 2026-04-14. Eight-week gap in social cadence.

## P1 — Today

• **Commercial Cleaners Alliance** — CCA + NexGen creatives committed 2026-04-08, never delivered. 50 days overdue.
• **Fresh Blends / Replenish** — Confirm 2026-04-13 launch pacing. Send first-week snapshot. Use "Replenish" branding.
• **Jeff Hozias** — Meta seller campaign approved 2026-04-14, still not launched.
• **Kimberly James Bridal** — Publish Timeline page (approved 2026-04-13). Verify GA4/GSC indexing per Mac. CC Mac, Sean, Melissa on any KJB email.
• **Shadow HVAC** — LSA status unverified since 2026-03-02 reset. Gmail quiet 95 days. Send catch-up report to Mike.
• **Omega Landscaping** — Chase David for drone footage. Confirm Thursday meeting with John Belaska happened.

## P2 — This Week

• **Align HCM LinkedIn** — No June calendar exists. Mon 6/9 thought leadership post needs topic + author assigned before the weekend.
• **Book SEO sweep** — Thursday 2026-06-04 gate missed. Guest-post pipeline empty. Email growth tracker never baselined. Goal: 2,000 subscribers in 4 months.
• **Align HCM blog pipeline** — 4 CEO blogs listed, 9 SEO drafts in `SEO/AlignHCM/Blogs/` with no publish status tracked.
• **Campaign queues** — All six queue files under `02_Campaigns/` are empty shells. Populate from client overviews or deprecate in favor of this brief.
• **Agent Memory files** — All 12 client Agent Memory.md files are blank templates. No persisted ads intel.

## Client Pulse

| Client | Status | Last Touched | Signal |
|--------|--------|--------------|--------|
| NKCDC | blocked | 2026-04-15 | Launch waiting on client page |
| Hardwood Artisan | at_risk | 2026-04-07 | Billing card outstanding |
| Bar Crawl USA | active | 2026-04-15 | 2 disapproved ads, Soulard cap patched |
| LinkEZE | active | 2026-04-05 | Enhanced conversions + MFA overdue |
| CCA | onboarding | 2026-04-14 | Creatives 50 days overdue |
| BOK Law | active | 2026-04-14 | Social cadence 8 weeks stale |
| Fresh Blends | active | 2026-04-13 | Launch verify needed |
| Jeff Hozias | active | 2026-04-14 | Meta launch pending |
| KJB | active | 2026-04-15 | Timeline page pending |
| Shadow HVAC | active | 2026-03-02 | 95 days stale, LSA unverified |
| Omega | active | 2026-04-14 | Drone footage chase |
| Onsite Concrete | active | 2026-04-09 | Weekly call was 2026-04-16 |

**Stalled:** All 12 clients have `last_touched` 51–95 days stale. Vault frontmatter needs refresh after real work happens.

## Content & Campaigns

**BOK Law (due now):**
• Turn the Page Thursday — due today 2026-06-05
• Family Fridays — due tomorrow 2026-06-06
• Next week batch (Wed Wisdom, Thu, Fri) — undrafted, Sun 2026-06-08 gate is recovery point

**Align HCM LinkedIn:**
• June calendar missing entirely. May was last built.
• Mon 6/9 thought leadership, Wed 6/11 SmartCare, Fri 6/13 personality post all unassigned.

**Ads queues:** Empty. Effective backlog lives in client overviews (see P0/P1 above).

**Book SEO:** Thursday sweep missed. No guest-post pitches logged. Subscriber baseline never captured.

## Session Loops

No open Codex/Cursor session loops. `10_Sessions/` is template-only:
• Session Index empty
• Facebook Ads Build Log, API Notes, Automation Ideas all blank scaffolds
• Automation Debug Log has no active issues

**Vault setup needed:** Start logging sessions after Codex/Cursor work using `_templates/Session.md`.

## Coverage Notes

• **Gmail MCP unavailable** — urgent-replies.md last updated 2026-04-15. Email tier classifications are vault-stale.
• **Slack MCP unavailable** — no Slack signal this run. Team coordination gaps may exist outside vault view.
• **Vault frozen since April** — every client `last_touched` predates 2026-04-16. This brief synthesizes from last-known state plus calendar math.
• **Legacy crons deprecated** — this brief replaces nightly-client-pulse, gmail-to-vault-digest, vault-integrity-sync, chat-to-vault-sync, bok-law-social-content, linkedin-growth-engine, and book-site-seo-sweep. One orchestrator, seven agents, one read.

→ Architecture: [[System/competitive-task-orchestrator]]
