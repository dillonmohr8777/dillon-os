---
title: MomoBot
type: entity
tags: [ai-division, momobot, deerflow]
source_refs: ["repos/dillon-os/ai-division/MomoBot"]
---

# MomoBot

**The 30-second pitch:** MomoBot is Momentum's AI workforce — a private,
per-client agent workspace built on a [DeerFlow](https://github.com/bytedance/deer-flow)
fork. Each client gets an isolated space where specialist agents (research,
content, reporting, ops) do real work under Dillon's approval gates: nothing
sends, posts, publishes, or spends without a human pressing go. It is the
product behind Momentum's "dedicated AI workforce" offer.

See [[DEMO-2026-09-23]] for the narrated walkthrough and [[EVIDENCE]] for the
dated, source-linked ledger this page draws on.

## Where it runs

| Instance | Port | Purpose |
|---|---|---|
| Live | `:2026` | Client-facing MomoBot, on `m4` images |
| Rehearsal | `:2027` | Pre-promote smoke test before every live deploy |
| Dillon's private workspace | `:2028` | Owner-only instance, 21 department agents, capabilities the client app doesn't have. `http://desktop-4ahkec4.tailade026.ts.net:2028` |

Repo: [github.com/dillonmohr8777/deer-flow](https://github.com/dillonmohr8777/deer-flow),
trunk `integrate/m1-20260922`.

See [[WORKSPACE]] for the private workspace's current state, and the
[runbook](file:///C:/Users/dillo/.claude/plans/snappy-munching-heron.md) for
how a promote to `:2026` actually happens.

## Plan and runbook

- [Office day / m4 deploy runbook](file:///C:/Users/dillo/.claude/plans/snappy-munching-heron.md) — `C:\Users\dillo\.claude\plans\snappy-munching-heron.md`
- [Dillon's Workspace goal](file:///C:/Users/dillo/Documents/Codex/2026-09-24/dillons-workspace/GOAL.md) — `C:\Users\dillo\Documents\Codex\2026-09-24\dillons-workspace\GOAL.md`
