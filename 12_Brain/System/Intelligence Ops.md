---
tags: [system, runbook, intelligence]
source: "[[12_Brain/raw/research/2026-08-11 - governed agent-stack evidence]]"
canonical: 12_Brain
updated: 2026-08-11
---

# Intelligence Ops

**Summary:** the intelligence plane keeps model, harness, and skill evidence
current while preserving the human and canonical-system authority boundaries.

## Authority boundary

1. Dillon's current instruction is the highest authority.
2. Codex acting as Marketing Chief is the primary orchestrator, final synthesis
   and verification authority, and sole user-facing command center.
3. Claude, Grok, Cursor, Hermes, and other models are bounded workers. They
   return evidence and artifacts; they do not become parallel command centers.
4. `12_Brain/` stores knowledge, receipts, proposals, and history. It does not
   grant approval or become a machine configuration authority.
5. For client work, the canonical `client-operations` registry, queue,
   execution graphs, evidence, approvals, and decisions outrank this vault.

## Evidence contract

Every decision-relevant claim records:

- the claim and exact URL;
- publisher plus published or observed date;
- access date, source type, and expiry;
- model and harness together for agentic benchmarks;
- effort, cost or billing mode, and uncertainty where published.

Search snippets, vague domain lists, provider-only superiority claims, and
undated rankings are discovery leads, not receipts. A routing change needs two
independent sources, current route health, current price or billing mode, and a
representative Dillon workload comparison.

## Proposal and apply are separate

Scouts may write immutable evidence and a private proposal. They never edit the
approved Model Roster, live Skill Registry, Upgrade Log, global configuration,
automations, agent specs, canonical queues, or approval state. They never
install, commit, push, publish, or schedule.

Codex reconciles the evidence and displays the proposed file-level changes.
Consequential changes are applied only in a separate turn with exact current
authorization. Every applied change is reread, tested, and only then appended
to the Upgrade Log.

## Bounded operating loops

| Trigger | Output | Default state |
|---|---|---|
| Material model, price, or benchmark change | `/model-scout` evidence plus private roster proposal | manual, pending |
| Material skill or plugin change | `/skill-scout` evidence plus private install proposal | manual, pending |
| Explicitly approved routing proposal | `/stack-sync` reversible file diffs | draft first |
| Broad review requested by Dillon | `intel-sweep` evidence plus private proposal | manual, pending |

No schedule is created by this system. An unattended run requires an explicit
schedule request, no more than three concurrent workers, declared
`budget_tokens` and `timeout_seconds` per handoff, and a real session-level
dollar cap such as `--max-budget-usd` where the harness supports it.

## Files

- [[12_Brain/System/Model Roster|Model Roster]] — verified provider snapshot and routing candidates, not authority.
- [[12_Brain/System/Skill Registry|Skill Registry]] — project inventory and proposal-only candidates.
- [[12_Brain/System/Upgrade Log|Upgrade Log]] — applied and verified changes only.
- `12_Brain/private/proposals/` — gitignored pending diffs and install proposals.

## Links

[[12_Brain/concepts/Agent Stack Patterns|Agent Stack Patterns]] · [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]] · [[12_Brain/concepts/Truth Hierarchy|Truth Hierarchy]]
