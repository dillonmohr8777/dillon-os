---
tags: [daily-brief, competitive-task, umbrella]
created: 2026-09-10
status: synthesized
source_refs:
  - "[[System/competitive-task-definition]]"
  - "[[Daily-Briefs/pulse-today]]"
  - "[[Daily-Briefs/inbox-brief-2026-09-10]]"
  - "[[Daily-Briefs/plan-2026-09-10]]"
  - "[[Daily-Briefs/predicted-work-2026-09-10]]"
  - "[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]"
---

# Competitive task — 2026-09-10

Run `CTO-2026-09-10-1789045380204` · workflow `competitive-task-orchestrator`

**Meaning:** operator throughput across clients, inbox loops, canonical queue gates, and infra — not competitor research. One umbrella replaces four competing schedulers.

## P0 — one thing

**Cindy May Christmas** — `due: 2026-09-01`, now **9 days overdue**. Site package is approved; build is blocked on four prerequisites only (video destination, newsletter connection, photo map, Shopify). Carried on `Dashboard.md` `## Today` since at least 2026-09-04 with zero movement. Close the gap today: resolve the four deps or get an explicit client reschedule and log it.

## Stale comms (vault `00_Inbox/slack/` — no live Slack in cloud)

| Age | Who | Ask | Lane |
| --- | --- | --- | --- |
| ~42d | Melissa | Guidelines/training-prompt status + Loom + meeting slot | Momentum 360 |
| ~42d | Jenny | `needmomentum.com` brand direction + timeline | Momentum 360 |
| ~42d | Jason/Sean | Bot stability + reinstated-case alerts | Momentum 360 |
| ~42d | Sean | CallRail activity status | Momentum 360 |

Draft replies live in `System/slack-action-queue.md`. **Tier 2 — send gated.**

Inbox freeze: no `00_Inbox/` file changed since 2026-09-01 (9 days). Puttery/WNF replies sent 2026-09-02 per approval queue.

## Queue gates (`predict-work` — degraded in cloud)

`DILLON_CLIENT_OPERATIONS_ROOT` unset in this VM → predict-work ran on vault history only. On Dillon's box with client-ops mounted, status is **ok** (16 queue items, 6 candidates). Top gates:

| Window | Client | Deliverable | Gate |
| --- | --- | --- | --- |
| past-due-needs_approval | bigorange-marketing | Website / landing build | Final sign-off + invoice recipient |
| needs-approval | bar-crawl-usa | Paid-media optimization | Billing account + payment-method approval |
| when-gate-clears | revive-systems | HighLevel publish + sitemap | Google OAuth for exact location |
| when-gate-clears | momentum-360 | CallRail / Track 360 test | Access Broker + controlled caller |
| when-gate-clears | align-hcm | Customer Agent acceptance | HubSpot + Microsoft reauth |
| when-gate-clears | tags-2-go | Ads account health baseline | Agency-admin access restore |
| 2026-09-15–17 | bok-law-firm | Weekly three-topic content kit | Prep only — fingerprint source packet |

## Infra receipt

| Check | Status | Note |
| --- | --- | --- |
| env-check | warn | client-operations checkout missing in cloud VM |
| connector-health | **blocked** | 0/5 connectors usable (Ads quota, Meta/HubSpot not connected) |
| queue-status | ok | competitive-task-orchestrator registered |
| frontmatter-validate | ok | 37/37 complete |
| agent-craft-brief | ok | W09 unreliable (29%), 7 authorized-never-ran routines |

## Approval board (Tier 1 candidates only)

Reversible, local, no outbound:

1. Fix Momentum 360 `last_touched` frontmatter (git shows 2026-09-08 work; frontmatter still 2026-08-01).
2. BOK prep: locate current weekly packet + resolve three topics (no images yet).
3. Tags 2 Go: draft access-request note for approval queue.
4. Inbox hygiene: delete 5 empty stubs per `inbox-brief-2026-09-10.md` (local only).

Tier 2 → `System/approval-queue.md` (no auto-execution).

## Retired automations check

- **This run** ships the canonical umbrella on branch `cursor/competitive-task-consolidation-48f5` — not another orphan draft PR.
- **Owner still must:** disable the old Cursor daily draft-PR automation; paste Routine prompts from `11_Agents/Cloud Routine Prompts 2026-09-05.md` or disable morning/learning/hygiene Routines.
- **Kept separate:** Claude-Autonomous-Daily-Driver (15m), Prospect Radar Next 20, Gmail/Slack bridges.

## Parallel lanes today

| Lane | Status | Output |
| --- | --- | --- |
| Machine intel | ran | `Daily-Briefs/umbrella-run-2026-09-10.json` |
| vault-pulse | reused | `Daily-Briefs/pulse-today.md` |
| gmail-intel | reused | `Daily-Briefs/inbox-brief-2026-09-10.md` |
| metrics-pull | reused | `Daily-Briefs/metrics-2026-09-10.md` |
| plan-today | reused | `Daily-Briefs/plan-2026-09-10.md` |
| codex-session-sync | ran | `12_Brain/queue/codex-session-sync-2026-09-10.jsonl` |
| memory-consolidator | this file | `Daily-Briefs/competitive-task-today.md` |

## Next safe action

Resolve Cindy May Christmas prerequisites or reschedule in writing. While waiting, send nothing — use `System/slack-action-queue.md` drafts for Dillon's one-click approval on the four Momentum loops.
