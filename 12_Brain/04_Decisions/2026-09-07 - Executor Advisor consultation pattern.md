---
note_type: decision
status: active
created: 2026-09-07
updated: 2026-09-07
owner: Dillon Mohr
decision: "Add a new `advisor` subagent implementing an Executor/Advisor pattern: the Executor (whichever agent drives a task, turn by turn, on its own default model) may call `advisor` mid-task for a read-only second opinion, on Fable, before it commits to a costly or stuck decision. This is a separate mechanism from the existing maker/checker signoff gate (web-product-builder/qa-critic), not a replacement for it."
verification_status: partial
review_on: 2026-10-07
source_refs:
  - "[[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults]]"
  - "[[12_Brain/09_Ops/AGENT_PROTOCOL.md]]"
  - "[[.claude/agents/advisor.md]]"
  - "[[.claude/agents/qa-critic.md]]"
tags:
  - brain
  - decision
  - agents
  - model-routing
---

# Executor/Advisor consultation pattern

**Summary:** Dillon directed this live in session (2026-09-07, from a diagram
showing "Executor: Sonnet 5, runs every turn" calling out to "Advisor: Fable 5,
on-demand, sends advice"). No separate capture exists for the directive itself;
this note and the diff are the record.

## Context

The vault already has a maker/checker signoff gate - `web-product-builder`
(maker) never signs off on its own work; `qa-critic` (checker) does, once, at
handoff, per [[12_Brain/09_Ops/AGENT_PROTOCOL.md]]'s "checker must be a
different model family" rule. It also already inverted the model tiers from
what the diagram implies: per
[[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults]],
Fable 5.1 is the *session* default and subagents default to Sonnet - the
opposite of "Sonnet runs every turn, Fable is the on-demand consult."

Neither existing mechanism covers what the diagram describes: an
always-running Executor calling a smarter model **mid-task**, zero-to-many
times, for a second opinion that comes back as advice rather than an edit or a
pass/fail verdict.

## Decision

1. Add `.claude/agents/advisor.md` (mirrored in `dillon-claude-config/agents/`)
   as a new subagent, read-only tools only (`Read, Grep, Glob, Bash, WebFetch,
   WebSearch` - no `Edit`, `Write`, or `Agent`), pinned `model: fable`. Any
   agent may invoke it via the `Agent` tool with `subagent_type: advisor`.
2. Document the pattern in [[12_Brain/09_Ops/AGENT_PROTOCOL.md]] under
   "Route models," explicitly distinguished from the maker/checker gate:
   maker/checker runs once, at handoff, on a finished artifact, and can fail
   the work; Executor/Advisor runs mid-task, on a question or a plan, and
   never fails anything - it only advises.
3. **Deliberately not touched:** `11_Agents/claude-operating-team.json`. That
   manifest hard-asserts 6 cadence bots / 15 specialists / 54 routines via a
   Windows-only PowerShell validator this session cannot run
   (`System/scripts/Test-ClaudeOperatingTeam.ps1`). Advisor is a cross-cutting
   consultation capability available to every agent, not a numbered
   specialist or routine slot, so it does not need a manifest entry. If Dillon
   later wants it in that roster (e.g. as a new `claude_role: advisor` in
   `delegated_policy_v1`), that is a separate, explicit change to make on the
   machine that can run the validator.

## Consequences

- Any agent's frontmatter can now legitimately reference "consult `advisor`"
  as a step without a new mechanism needing to be invented per-agent.
- Advisor has no owned routine IDs and is not scheduled - it will not show up
  in cadence audits, and that is correct, not a gap.
- Cost: an Advisor call is a full Fable-tier subagent invocation. It is meant
  for real forks in a plan, not routine formatting or data pulls - the
  existing "effort down before model up" cost playbook still applies to
  whether to call it at all.

## Supersedes

Nothing. Extends
[[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults]]
and the maker/checker rule in [[12_Brain/09_Ops/AGENT_PROTOCOL.md]] with a
third, orthogonal role pair.
