---
tags: [daily-brief, competitive-task, umbrella]
created: 2026-09-11
status: synthesized
source_refs:
  - "[[System/competitive-task-definition]]"
  - "[[Daily-Briefs/pulse-today]]"
  - "[[Daily-Briefs/inbox-brief-2026-09-10]]"
  - "[[Daily-Briefs/predicted-work-2026-09-11]]"
  - "[[Daily-Briefs/radar-2026-09-11]]"
  - "[[12_Brain/queue/codex-session-sync-2026-09-11]]"
---

# Competitive task — 2026-09-11

Run `CTO-2026-09-11-1789132431137` · workflow `competitive-task-orchestrator`

**Meaning:** operator throughput across clients, inbox loops, canonical queue gates, and infra — not competitor research. One umbrella replaces four competing schedulers.

## P0 — one thing

**Cindy May Christmas** — `due: 2026-09-01`, now **10 days overdue**. Site package is approved; build is blocked on four prerequisites only (video destination, newsletter connection, photo map, Shopify). Carried on `Dashboard.md` `## Today` since at least 2026-09-04 with zero movement. Close the gap today: resolve the four deps or get an explicit client reschedule and log it.

## Stale comms (vault `00_Inbox/slack/` — no live Slack in cloud)

| Age | Who | Ask | Lane |
| --- | --- | --- | --- |
| ~43d | Melissa | Guidelines/training-prompt status + Loom + meeting slot | Momentum 360 |
| ~43d | Jenny | `needmomentum.com` brand direction + timeline | Momentum 360 |
| ~43d | Jason/Sean | Bot stability + reinstated-case alerts | Momentum 360 |
| ~43d | Sean | CallRail activity status | Momentum 360 |

Draft replies live in `System/slack-action-queue.md`. **Tier 2 — send gated.**

Inbox freeze: no `00_Inbox/` file changed since 2026-09-01 (10 days). `slack-intake-2026-09-10` found zero new qualifying asks in Momentum channels.

## Queue gates (`predict-work` — degraded in cloud)

`DILLON_CLIENT_OPERATIONS_ROOT` unset in this VM → predict-work scanned vault history only (0 canonical queue items). On Dillon's box with client-ops mounted, expect **ok** with 6 queue candidates. Top gates from last full run (2026-09-10):

| Window | Client | Deliverable | Gate |
| --- | --- | --- | --- |
| past-due-needs_approval | bigorange-marketing | Website / landing build | Final sign-off + invoice recipient |
| needs-approval | bar-crawl-usa | Paid-media optimization | Billing account + payment-method approval |
| when-gate-clears | revive-systems | HighLevel publish + sitemap | Google OAuth for exact location |
| when-gate-clears | momentum-360 | CallRail / Track 360 test | Access Broker + controlled caller |
| when-gate-clears | align-hcm | Customer Agent acceptance | HubSpot + Microsoft reauth |
| when-gate-clears | tags-2-go | Ads account health baseline | Agency-admin access restore |
| 2026-09-15–17 | bok-law-firm | Weekly three-topic content kit | Prep only — fingerprint source packet (4 days out) |

## Infra receipt

| Check | Status | Note |
| --- | --- | --- |
| env-check | warn | client-operations checkout missing in cloud VM |
| connector-health | **blocked** | 0/5 connectors usable (Ads quota, Meta/HubSpot not connected) |
| queue-status | ok | competitive-task-orchestrator registered |
| predict-work | ok (degraded) | 1 recurrence candidate only; canonical queue unavailable |
| frontmatter-validate | ok | 37/37 complete |
| agent-craft-brief | ok | W09 unreliable (29%), 7 authorized-never-ran routines |
| prospect-radar | ok | 1465 tracked, 4 rebuild-ready, 3 new today |

## Codex / session open loops

From `12_Brain/queue/codex-session-sync-2026-09-11.jsonl`:

1. **P1** — Disable legacy Cursor daily draft-PR automation; paste Cloud Routine prompts (carried since 2026-09-05 PR sweep).
2. **P1** — Flip or delete public `mohr-vault` copy (repository-access-discovery 2026-09-02).
3. **P2** — Apply desktop retirement patch for Fagan Painting + Shadow HVAC registry rows.
4. **P2** — Momentum AI Division: Mac sign-off on five skills before client-facing use.
5. **P0** — Cindy May Christmas prerequisites (same as above).

## Approval board (Tier 1 candidates only)

Reversible, local, no outbound:

1. Fix Momentum 360 `last_touched` frontmatter (git shows 2026-09-08 work; frontmatter still 2026-08-01). Momentum dropped out of "moving" today (>48h since last commit).
2. BOK prep: locate current weekly packet + resolve three topics (window opens in 4 days; no images yet).
3. Tags 2 Go: draft access-request note for approval queue.
4. Inbox hygiene: delete 5 empty stubs per `inbox-brief-2026-09-10.md` (local only).

Tier 2 → `System/approval-queue.md` (no auto-execution).

## Retired automations check

- **This run** ships the canonical umbrella on branch `cursor/competitive-task-consolidation-c4c6` — one rolling PR, not another orphan draft.
- **Owner still must:** disable the old Cursor daily draft-PR automation; paste Routine prompts from `11_Agents/Cloud Routine Prompts 2026-09-05.md` or disable morning/learning/hygiene Routines.
- **Kept separate:** Claude-Autonomous-Daily-Driver (15m), Prospect Radar Next 20, Gmail/Slack bridges.

## Parallel lanes today

| Lane | Status | Output |
| --- | --- | --- |
| Machine intel | ran | `Daily-Briefs/umbrella-run-2026-09-11.json` |
| vault-pulse | reused (2026-09-10) | `Daily-Briefs/pulse-today.md` |
| gmail-intel | reused (2026-09-10) | `Daily-Briefs/inbox-brief-2026-09-10.md` |
| metrics-pull | reused (2026-09-10) | `Daily-Briefs/metrics-2026-09-10.md` |
| plan-today | ran | `Daily-Briefs/plan-2026-09-11.md` |
| codex-session-sync | ran | `12_Brain/queue/codex-session-sync-2026-09-11.jsonl` |
| memory-consolidator | this file | `Daily-Briefs/competitive-task-today.md` |

## Next safe action

Resolve Cindy May Christmas prerequisites or reschedule in writing. While waiting, send nothing — use `System/slack-action-queue.md` drafts for Dillon's one-click approval on the four Momentum loops.
