---
note_type: decision
status: directed
date: 2026-09-14
directed_by: Dillon Mohr
tags: [architecture, agents-api, orchestration, mac-mini]
---

# Claude orchestrates the Agents API; it becomes the primary execution space

Dillon's direction, 2026-09-14: **Claude Code is the main orchestrator of the
OpenAI Agents API**, with an automation making that combination the primary
execution space. He also noted the **Mac mini arrives in roughly one to two
weeks** and should be part of the plan.

## Why this is the right shape

Each half covers the other's exact weakness, verified today rather than assumed.

**Claude Code knows where everything is and dies easily.** It sees the vault,
`client-operations`, the registry, the skills, the authenticated connectors. It
also dies with the machine, dies with the five-hour Codex quota next door, and
cannot message its own subagents mid-flight.

**An Agents API session knows nothing and will not die.** No filesystem access
here, no connectors, but durable sessions, automatic context compaction,
mid-turn steering, and — on `openai_hosted` only — free artifact durability.
Proven today: a severed stream did not kill the work; the session finished
alone.

So: Claude is the hand that gathers, resolves the client, and files the result.
The Agents API is the engine that grinds without dying. Neither is the primary
seat on its own.

## The Mac mini is the missing third piece

Ordered already (M5 Pro, 15-core CPU, 16-core GPU, 48 GB unified memory, 512 GB
SSD, Thunderbolt 5 — confirmed from the Apple order mail 2026-09-13). It solves
the two structural gaps nothing else does:

1. **Agents are durable, not always-on.** Nothing self-wakes; a trigger must
   come from somewhere that is reliably up. DESKTOP-4AHKEC4 is not that machine
   — 14 unclean power-offs in 30 days, attributed to the PSU.
2. **The retrieval heartbeat and `_os/agent-swarm` need a host that stays up.**
   Both are currently local to a failing box.

The Mac mini becomes the always-on orchestration host. The Windows desktop keeps
what is bound to it — the authenticated browser sessions, the Obsidian process,
the DPAPI-sealed key, the in-app browser pane. See [[machine-power-fault]].

## What has to be true before this is real

- **A cost ledger, first.** A completed run returned `usage: null` at session and
  turn level. Making a metered API the primary execution space without a ledger
  replaces a visible capacity wall with an invisible spend wall.
- **The retrieval loop must close.** `_os/agent-swarm` already exists — built and
  verified 2026-09-12/13, 15/15 backend checks, a real hosted three-subagent run
  that survived a local server restart. It has one smoke-test mission and is not
  running. Nothing retrieves artifacts unless a human opens the UI. That is the
  same finish-and-file failure, on a system that has not shipped a real mission.
- **`/workspace/outputs` is the only thing that survives.** The sandbox is
  reclaimed after an hour idle and that is not configurable. Every task
  instruction must write there and read it back.
- **Most work stays local.** Anything needing the vault, an authenticated
  connector, the canonical queue, the in-app browser pane, or standing send
  authority cannot move. This is a tool for bounded, credential-free slices, not
  a relocation.

## Not the first move

Partner environments (Cloudflare, Vercel) require `self_hosted`, a second
restricted executor key, and real infrastructure — and **lose the Artifacts API
entirely**, which is the durability that makes this worth doing. Revisit only
when a job genuinely needs multi-day persistence.

Related: [[System/approval-queue.md]] ·
[[10_Sessions/2026-09-14 Weekend accounting 2026-09-11 to 09-13]] ·
[[agents-api-curl-path]]
