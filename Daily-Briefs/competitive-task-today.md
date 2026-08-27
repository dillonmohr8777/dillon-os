# Competitive Task — 2026-08-27

Umbrella run: **company-os-umbrella** (11 parallel lanes + consolidator).  
Sources: vault pulse, `00_Inbox/slack/` captures, approval queue, radar-2026-08-26, 120-day Slack audit.

## Coverage

| Lane | Status | Notes |
|------|--------|-------|
| Gmail | fallback | No live Gmail MCP in cloud run; used `System/urgent-replies.md` + approval queue |
| Slack | fallback | Used `00_Inbox/slack/` captures (2026-07-30); live Slack MCP not connected |
| Vault pulse | yellow | 5+ active clients stale since 2026-07-12; 325 notes missing frontmatter ops fields |
| Sessions | ok | 6 session files on disk; Session Index not linked — promotions listed below |
| Ads/SEO | red | Replenish billing block; Fagan attribution; Shadow Meta visibility |
| Content routines | skipped | Thursday — book SEO sweep would run; deferred to next Thu |
| Automation health | yellow | 90 duplicate competitive-task branches; Hermes conflict items in approval queue |
| Websites | ok | Book `/api/dossier-leads` still flagged in opportunities doc |
| Outreach | ok | Radar 2026-08-26: 1161 tracked, 222 rebuild-qualified, 0 render-blocked, mail_ready hold |
| Reporting | yellow | Bar Crawl June report still sample figures; Shadow catch-up report gated |
| Ads scout | red | See P0 stack |

## P0 Stack

1. **Replenish — Google Ads billing block** — campaigns cannot run until billing update confirmed (Mia payment screen). *Tier 0 diagnosis; Tier 2 if spend/account change needed.*
2. **Shadow HVAC — Meta visibility + overdue reconciliation** — overview due 2026-07-15, catch-up report to Mike gated. *Launch/delivery blocked.*
3. **Revive Systems — 48-hour lead-recovery brief** — urgent item in approval queue since 2026-07-13. *Client waiting on deliverable.*
4. **M360 bot stabilization** — Jason/Sean unanswered since 2026-07-30: bot stability + case-reinstated alerts. *Internal ops, Tier 1.*
5. **Fagan Painting — attribution repair before scale** — Meta Lead/form/phone reconciliation required. *Tier 1 until verified.*

## Urgent Replies

| From | Ask | Since | Owner |
|------|-----|-------|-------|
| Jason + Sean (DM) | Bot stability + reinstated-case alerts | 2026-07-30 | Dillon / automation lane |
| Sean (#calls) | CallRail activity verification | 2026-07-30 | Dillon |
| Melissa (#ai-tech-news) | Guidelines/training prompt + Loom | 2026-07-28 | Dillon |
| Jenny (DM) | NeedMomentum brand direction for site | 2026-07-30 | Dillon + Mac/Sean |

## Stalled Clients (7+ days)

- Shadow HVAC — last_touched 2026-07-12, due 2026-07-15
- Kimberly James Bridal — last_touched 2026-07-12, due 2026-07-15
- On-Site Concrete — last_touched 2026-07-12, due 2026-07-15
- Bar Crawl USA — last_touched 2026-07-11, due 2026-07-15
- Hope Wellness Center — GBP/reporting follow-up open

## Automation Lanes

| System | Status | Signal |
|--------|--------|--------|
| company-os-umbrella | green | This run — canonical replacement for 7+ legacy crons |
| Claude daily driver | unverified | Cloud cannot read Windows receipts; check `12_Brain/queue/claude-loop-*.jsonl` locally |
| Prospect Radar Next 20 | green | Latest sweep 2026-08-26 on main |
| Hermes gateway | red | Repeated conflict-storm items in approval queue (through 2026-08-05) |
| Slack→Codex spine | yellow | 120-day audit: model correct, episode layer not shipped (shadow mode pending) |
| Duplicate PR debt | red | ~90 `competitive-task-consolidation-*` branches — close after this canonical merge |

## Session Promotions

- **Bridge / Tori** — discovery prototype ready; NDA-safe walkthrough still approval-gated (`10_Sessions/Bridge Software Development - 2026-07-11.md`)
- **Reporting dashboard training** — five open commitments (Nick template, Zaret, Melissa recordings) not wired to recurring delivery
- **Slack audit** — implement Phase 0/1 request-episode detector before ambient auto-execution

## Approval — one decision

**Shadow HVAC catch-up report to Mike** — after LSA/Evident verification, approve sending the prepared catch-up report. Source: approval-queue 2026-07-12. Risk: medium.

## Content / SEO Due Today

- Book site SEO sweep (Thursday routine) — skipped this run; queue for next Thursday or manual `/content-scan` on `05_Book/seo-strategy.md`

## Tomorrow Prep

1. Confirm Replenish billing resolution path with Mia (blocks paid lane).
2. Run `frontmatter-repair` dry-run on top 5 stalled client overviews.
3. Disable legacy Cursor crons listed in `System/competitive-task-definition.md` after three green umbrella runs.
4. Authenticate Composio Gmail/Slack when live reads are required (approval-queue item).

---

*Execution: route P0 items to Codex/Marketing Chief → matching routine in `11_Agents/claude-operating-team.json`. This brief does not authorize external action.*
