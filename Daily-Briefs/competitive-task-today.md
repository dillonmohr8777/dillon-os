---
tags: [daily-brief, competitive-task, umbrella]
created: 2026-09-08
status: active
source_refs:
  - "Daily-Briefs/plan-2026-09-08.md"
  - "Daily-Briefs/inbox-brief-2026-09-08.md"
  - "Daily-Briefs/metrics-2026-09-08.md"
  - "12_Brain/state/competitive-task-orchestrator.json"
  - "[[12_Brain/04_Decisions/2026-09-08 - Adopt umbrella competitive-task orchestrator]]"
---

# Competitive task — 2026-09-08

**Umbrella run:** `CTO-2026-09-08-1788872711608` · workflow `competitive-task-orchestrator`

## P0

**Cindy May Christmas** — site build approved, **7 days past due** (`due: 2026-09-01`). Four blocking prerequisites remain: video destination, newsletter connection, photo map, Shopify. Close with delivery or explicit client reschedule today.

## Top 3 blocks

1. **09:00 deep work** — Cindy May Christmas prerequisites (same as P0).
2. **12:00 client pulse** — Real contact on 3–5 stalled clients; lead with Tags 2 Go (agency-admin Ads access blocker), BigOrange (`needs-approval` website), Bar Crawl USA (`needs-approval` paid media).
3. **Umbrella adoption** — This run ships the canonical orchestrator; **disable** the legacy Cursor cron that opened daily draft PRs.

## Stale comms (4)

All in `00_Inbox/slack/`, unchanged since 2026-07-30 (~40 days):

| Ask | Owner | Draft queue |
| --- | --- | --- |
| Bot stability + case alerts | Jason/Sean | `System/slack-action-queue.md` |
| needmomentum.com brand direction | Jenny | same |
| Guidelines / Loom / meeting | Melissa | same |
| CallRail activity status | Sean | same |

Inbox frozen 7 days (23/23 notes identical since 2026-09-01).

## Queue / predict-work

- `goal_current: 12` vs `canonical_active_route_count: 23` — reconcile when a block opens (flagged 5+ days).
- Canonical queue work packages (Revive, Tags 2 Go, Align, M360) remain **blocked** on human gates — outreach only at 12:00, not execution.
- BOK weekly kit window **2026-09-15–17** — note only; do not prep until 2–3 days out.

## Machine phase receipt

| Phase | Lanes |
| --- | --- |
| preflight | env-check:warn |
| intel | connector-health:blocked, queue-status:ok, predict-work:ok, frontmatter-validate:ok |
| morning | deferred to agent session (existing plan/inbox/metrics today) |
| learn | agent-craft-brief:ok |
| hygiene | deferred (not hygiene window) |
| synthesize | this file |

Full JSON: `12_Brain/state/competitive-task-orchestrator.json`

## Tier 1 batch (one approval executes all)

- None identified for today without live ads access. Tier 1 candidates require authenticated platform readback first.

## Tier 2 → approval queue

- Momentum 360 Slack replies (4) — draft in `System/slack-action-queue.md`, send gated.
- Credential rotations (Resy, git-exposed secret) — still open in `System/approval-queue.md`.

## Retired automation check

- **Do not** open a new draft PR for this brief.
- Supersedes: daily Cursor consolidation PRs, redundant morning/learning/hygiene PR loops.
- See [[System/competitive-task-definition]] and [[12_Brain/04_Decisions/2026-09-08 - Adopt umbrella competitive-task orchestrator]].
