---
tags: [daily-brief, competitive-task, umbrella]
created: 2026-09-09
status: synthesized
source_refs:
  - Daily-Briefs/plan-2026-09-09.md
  - Daily-Briefs/inbox-brief-2026-09-09.md
  - Daily-Briefs/predicted-work-2026-09-09.md
  - Daily-Briefs/metrics-2026-09-09.md
  - 12_Brain/state/competitive-task-orchestrator.json
  - System/competitive-task-definition.md
---

# Competitive task — 2026-09-09

Run `CTO-2026-09-09-1788958948773` · workflow `competitive-task-orchestrator`

## P0 — one thing

**Cindy May Christmas** — `due: 2026-09-01` is **8 days overdue**. Site build is approved; blockers are video destination, newsletter connection, photo map, and Shopify prerequisites (`01_Clients/Cindy May Christmas/overview.md`). Close by resolving those four items or getting an explicit client reschedule — no fifth carry on `Dashboard.md`.

## Stale comms (4 loops, ~41 days)

All from `00_Inbox/slack/` (2026-07-30), unchanged since 2026-09-01 inbox freeze:

1. Jason/Sean — bot stability + reinstated-case alerts
2. Jenny — `needmomentum.com` brand direction + timeline
3. Melissa — guidelines/training Loom + meeting slot
4. Sean — CallRail activity status

Draft angles in `System/slack-action-queue.md`. Momentum 360 had real delivery commits yesterday (AI Division archive) but these four client-facing asks remain untouched.

## Queue gates (predict-work)

| Window / status | Client | Deliverable | Confidence |
| --- | --- | --- | --- |
| past-due-needs_approval | bigorange-marketing | WordPress pilot sign-off before invoice | 86% |
| needs-approval | bar-crawl-usa | Billing/payment-method path approval | 80% |
| 2026-09-15–17 | bok-law-firm | Weekly three-topic content kit | 96% (prep only — 6 days out) |
| when-gate-clears | revive-systems, momentum-360, align-hcm, tags-2-go | Human access gates — do not execute | 68% |

## Infra receipt

| Phase | Result |
| --- | --- |
| preflight | **warn** — `DILLON_CLIENT_OPERATIONS_ROOT` missing on cloud VM |
| intel | connector-health **blocked** (0/5 connectors usable); queue-status **ok**; predict-work **ok**; frontmatter-validate **ok** |
| morning | **deferred** — pulse/inbox/metrics/plan already written today (`Daily-Briefs/*-2026-09-09.md`) |
| learn | agent-craft-brief **ok**; codex-session-sync **deferred** → `12_Brain/queue/codex-session-sync-2026-09-09.jsonl` |
| hygiene | **deferred** — vault-clean/wiki-lint ran 2026-09-08 |
| synthesize | this brief |

Full machine receipt: `Daily-Briefs/umbrella-run-2026-09-09.json`

## Approval board (Tier 1 batch — review, don't auto-send)

- BigOrange Marketing — yes/no on pilot + invoice recipient
- Bar Crawl USA — yes/no on billing account change path
- Tags 2 Go — restore agency-admin Google Ads access (unblocks research brief)

Tier 2 items (credential rotation, Hermes conflict storm, deploys) stay in `System/approval-queue.md`.

## Umbrella consolidation status

**Shipped today:** one workflow registry (`12_Brain/registry/umbrella-workflow.json`), parallel runner (`competitive-task-run.js`), seven agent lanes (`.cursor/agents/`), definition + prompt.

**Owner still must:**

1. Disable the legacy Cursor automation that only opened daily draft PRs (this automation *is* the replacement).
2. Paste Routine prompt fixes from `11_Agents/Cloud Routine Prompts 2026-09-05.md` or disable redundant Claude morning/learning/hygiene Routines.
3. Clone `client-operations-canonical` beside the vault on cloud agents for full predict-work resolution.

**Kept separate:** Claude-Autonomous-Daily-Driver (15m), Prospect Radar Next 20, Gmail/Slack bridges, marketing-chief-twice-daily-brief.

## Top 3 blocks today

1. **09:00** — Cindy May Christmas prerequisites or explicit reschedule
2. **12:00** — Touch 3–5 stalled clients (Tags 2 Go access ask, BigOrange/Bar Crawl yes/no)
3. **Bounded prep** — BOK source packet fingerprint only (window opens 2026-09-15)
