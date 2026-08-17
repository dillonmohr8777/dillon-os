---
note_type: research_synthesis
status: adopted_with_constraints
reviewed_at: 2026-08-12
tags: [claude, memory, reasoning, workflows, operating-system]
---

# Operational synthesis: J-space and layered agent memory

## Decision

Adopt the workflow principles, not the videos' strongest marketing claims.

The two sources point at complementary parts of a reliable agent system:

- deliberate task execution that surfaces auditable decision factors; and
- layered, source-linked memory that retrieves the smallest relevant context.

Neither replaces verification. Hidden neural activity is not proof of
consciousness or correctness, and benchmark gains are not production evidence
for Dillon's estate.

## Claude operating update

For complex work, Claude should:

1. Read the live authority and exact project sources before acting.
2. Build a private plan and revisit it after material tool results.
3. Retrieve only relevant memory, while preserving links to source evidence.
4. Return a concise decision log rather than hidden chain-of-thought.
5. Separate current fact, memory-derived context, inference, proposal, and
   verified result.
6. Report assumptions, evidence paths, tests, approval state, and next action.
7. Never use fluent reasoning or remembered context as a completion receipt.

## Memory-layer mapping

| Layer | Dillon source | Purpose | Authority |
|---|---|---|---|
| Immediate state | Current task, runtime, and workflow checkpoint | Execute the active step | Current live evidence |
| Captures | `12_Brain/01_Captures` and bounded intake records | Preserve uncompiled observations | Evidence only |
| Compiled knowledge | Brain entities, projects, concepts, and research | Retrieve reusable context | Must retain source and freshness |
| Durable operating rules | Workflow contracts, decisions, manifests, and governing agent files | Control repeated behavior | Project or canonical policy authority |
| Provenance | Rollout summaries, receipts, source references, and artifacts | Audit claims and corrections | Supporting evidence |

The canonical client queue, approvals, and durable decisions remain in
`client-operations`; the shared agent vault remains a projection. A memory
engine may accelerate retrieval but may not become a parallel queue writer or
silently promote inferred facts.

## Recommended next experiment

Create an isolated TencentDB Agent Memory evaluation only after a bounded test
corpus is selected. Use redacted historical tasks and compare it with the
current source-selection workflow. Do not ingest credentials, unredacted
client communications, active approval queues, or mutable production state.

Acceptance requires measurable improvement and all governance gates in the
source review note. Until then, status is `candidate`, not `installed`,
`integrated`, or `production-ready`.

## Source notes

- [[11_Agents/Rockbot Operating System/research-intake/2026-08-12-tiktok-claude-j-space|Claude J-space TikTok review]]
- [[11_Agents/Rockbot Operating System/research-intake/2026-08-12-tiktok-tencentdb-agent-memory|TencentDB Agent Memory TikTok review]]

