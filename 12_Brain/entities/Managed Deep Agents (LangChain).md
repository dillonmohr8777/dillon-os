---
tags: [entity, tool, competitor]
source: "[[12_Brain/01_Captures/X/2026-08-08 - langchain-managed-deep-agents-launch]]"
updated: 2026-08-08
---

# Managed Deep Agents (LangChain)

**Summary:** LangChain's managed runtime for production agents — the
productized version of the control plane this stack already runs by hand.
Treat it as a benchmark and a vocabulary source, not a migration target.

## What it is

Public beta (2026-08-07). You define an agent as instructions markdown +
tools + skills + middleware + memory + channels + schedules + eval specs,
then deploy to LangSmith's hosted runtime with one command. The bundle:
durable execution, streaming, sandboxes, thread- vs agent-scoped memory
(Context Hub), state-based evals (Harbor), OIDC identity, native Slack and
GitHub channels. LangSmith Cloud US only, CLI-first, no published pricing yet.

## Status: watch — do not migrate

- Our managed runtime already exists: Claude Code remote sessions carry the
  24 vault skills, MCP connectors, scheduled triggers, hooks, and subagent
  fan-out. The Codex-side Marketing Chief carries the durable queue,
  maker/checker handoffs, execution graphs, and approval gates. Moving buys
  capabilities we largely have and costs a full port to a new vendor mid-beta.
- The real value is their seven-gate framing of production readiness — applied
  to this stack in [[12_Brain/concepts/Managed Agent Production Gates|Managed
  Agent Production Gates]], which carries the gap list and apply plan.
- It is also a competitor signal: when managed agents become a checkbox
  product, the harness stops being a moat. Ours is the context layer —
  the vault, client registry, corrections ledger, and approval envelopes —
  which no hosted runtime ships with.

## If an experiment is ever wanted

Same standing acceptance gate as any vendor tool (per the
[[12_Brain/entities/LandingFolio MCP|LandingFolio]] precedent): sandbox-only,
one non-client workload, zero client data (their beta is US-cloud hosted),
verdict filed under `12_Brain/07_Reviews/` before anything touches real work.

## Links

- [[12_Brain/01_Captures/X/2026-08-08 - langchain-managed-deep-agents-launch|Origin capture]]
- [[12_Brain/concepts/Managed Agent Production Gates|Managed Agent Production Gates]]
- [[12_Brain/concepts/Second Brain Architecture|Second Brain Architecture]]
