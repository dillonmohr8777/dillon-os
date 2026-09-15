---
tags: [daily-brief, competitive-task, umbrella]
date: 2026-09-07
workflow: company-os-umbrella
source_refs:
  - Daily-Briefs/plan-2026-09-07.md
  - Daily-Briefs/inbox-brief-2026-09-07.md
  - Daily-Briefs/pulse-today.md
  - Daily-Briefs/predicted-work-2026-09-07.md
  - System/competitive-task-definition.md
  - automation-runs/company-os-umbrella/2026-09-07/lane-results.json
---

# Competitive Task — 2026-09-07

One umbrella run. Eleven parallel intel lanes + memory-consolidator. Execution stays with Codex/Marketing Chief.

## Coverage

| Lane | Source | Status | Notes |
| --- | --- | --- | --- |
| Gmail | vault-fallback | yellow | No live Gmail MCP. `00_Inbox/` frozen since 2026-09-01 (6 days). Morning inbox-brief already ran. |
| Slack | vault-fallback | yellow | No live Slack MCP. Four captures in `00_Inbox/slack/`, all dated 2026-07-30 (~5.5 weeks stale). |
| Vault pulse | vault | red | 37/37 clients stalled (0 touched in 7 days). Frontmatter validate: 37/37 complete. |
| Codex sessions | vault | green | `10_Sessions/` has 7 notes; no unprocessed session promotions flagged. |
| Ads / SEO | vault + queue | yellow | Bar Crawl USA paid-media item `needs-approval`; book site `/api/dossier-leads` still broken in fixture sentinel. |
| Content routines | calendar | green | Monday — no Sunday BOK/Align LinkedIn gate. BOK weekly window opens **tomorrow** (2026-09-08). |
| Automation health | local state | yellow | Claude loop receipts stop at 2026-08-18; daily driver likely idle on cloud clone. Registry gates unchanged. |
| Websites | preflight CLI | yellow | Site-health dry-run: 1 pass, 1 fail (book form fixture), 3 skipped (live checks need `--live`). |
| Outreach | preflight CLI | green | Queue-status OK; prospect radar artifacts current through 2026-09-06. |
| Ads scout | vault | yellow | P0 approvals queued, not execution-ready. |
| Reporting | vault | yellow | Bar Crawl June HTML report still sample figures; no new report ingests since 2026-08-11. |

## P0 Stack

Apply tie-break: launch blocked → billing → ad health → calendar → stale truth.

1. **Cindy May Christmas — launch blocked (6 days overdue).** `due: 2026-09-01`. Site build approved; blocked on video destination, newsletter connection, photo map, Shopify prerequisites. Carried on `Dashboard.md` since 2026-09-04 with no movement. **Action:** resolve the four deps or get explicit client reschedule today.
2. **Momentum 360 Slack backlog — client replies overdue (~5.5 weeks).** Four unanswered asks (Jason/Sean bot alerts, Sean CallRail, Melissa guidelines/Loom, Jenny brand direction). **Action:** draft replies for approval — do not send from this automation.
3. **BOK Law Firm weekly kit — window opens tomorrow (96% recurrence).** Fingerprint source packet today so tomorrow is draft-and-ship, not still-hunting-for-source. **Action:** locate attorney-approved PDF packet; stage three image slots.
4. **Bar Crawl USA — ad disapprovals + billing path (needs approval).** Canonical queue `wi-20260808-0003` at `needs-approval` (0.80). Two disapproved Halloween/Fall Cocktail ads still on record. **Action:** one yes/no on billing-account update path.
5. **BigOrange Marketing — website build (needs approval, 28 days overdue on `due:`).** Private WordPress pilot complete; waiting factual sign-off + invoice recipient. **Action:** approval ask only — no build until signed off.

## Urgent Replies

| Client / lane | Item | Age | Next action |
| --- | --- | --- | --- |
| Momentum 360 | Jason/Sean — bot stability + reinstated-case alerts | ~5.5 wk | Draft status reply → approval queue |
| Momentum 360 | Sean — CallRail activity explanation | ~5.5 wk | Pull logs, draft reply |
| Momentum 360 | Melissa — guidelines/training prompt + Loom + meeting | ~5.5 wk | Draft status + Loom link |
| Momentum 360 | Jenny — needmomentum.com brand direction | ~5.5 wk | Sync Mac/Sean, then reply |
| Puttery (Jesse) | Dashboard within 2 weeks of access | conditional | Check whether access window elapsed |

No new Gmail threads surfaced (inbox frozen). Credential rotations (Resy plain-text; git-exposed secret since 2026-08-13) remain approval-gated.

## Stalled Clients (7+ days)

**All 37 active clients** — unchanged from `pulse-today.md`. Closest overdue dates:

- Cindy May Christmas — `due: 2026-09-01` (6d overdue) — **only launch-blocking P0**
- BigOrange Marketing — `due: 2026-08-10` (28d overdue)
- Tags 2 Go — `due: 2026-08-08` (30d overdue)
- Six clients share `due: 2026-07-15` (54d overdue): Bar Crawl USA, Hope Wellness, KJB, Omega, Onsite, Replenish

Today's 12:00 pulse block (from morning plan): touch 3–5 stalled clients for real contact — lead with Bar Crawl USA and BigOrange approval asks.

## Automation Lanes

| System | Status | Detail |
| --- | --- | --- |
| company-os-umbrella | green | This run — scaffold + preflight OK |
| morning brief (claude.ai) | green | `plan-2026-09-07.md` written today |
| Claude daily driver | yellow | Last loop receipts 2026-08-18; cloud clone cannot run Windows scheduler |
| daily-communications-brain | yellow | Codex Windows owner; artifacts not refreshed in this clone |
| prospect-radar-next20 | green | Last radar sweep 2026-09-06 |
| site-health sentinel | yellow | Fixture fail on book form endpoint; live checks skipped in dry-run |
| Hermes gateway | red (stale data) | `automation-status.md` last updated 2026-07-12 — refresh on desktop |
| Legacy Cursor crons | retire | See `System/competitive-task-definition.md` superseded list |

## Approval — one decision

**Cindy May Christmas:** Approve chasing the four blocking prerequisites today (video, newsletter, photo map, Shopify) — or approve sending the client an explicit reschedule request. Everything else on the board waits behind this launch blocker.

## Content / SEO Due Today

- None on the Monday calendar gate.
- **Tomorrow:** BOK weekly three-topic designed content kit (prep today per plan).

## Tomorrow Prep

1. BOK source packet fingerprint + three image prompt slots staged before drafting.
2. Carry Momentum 360 Slack drafts into approval queue if not done today.
3. Reconcile `System/OS Config.md` `goal_current: 12` vs `Client Index` `canonical_active_route_count: 23` (11-client gap flagged four straight metrics runs).
