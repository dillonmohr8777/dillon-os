---
note_type: decision
status: proposed
owner: Dillon Mohr
created: 2026-08-15
updated: 2026-08-15
decided_at: 2026-08-15
review_on: 2026-08-29
source_refs:
  - 12_Brain/07_Reviews/2026-08-15 - 120-Day Slack Operating System Audit.md
  - 11_Agents/claude-operating-team.json
  - 12_Brain/09_Ops/AGENT_PROTOCOL.md
  - C:/Users/dillo/Documents/Codex/projects/client-operations/docs/CURSOR_SLACK_INTAKE.md
tags:
  - decision
  - slack
  - codex
  - marketing-chief
  - automation
---

# Use Slack as intake and Codex as execution

## Proposed decision

Use Slack as an authenticated event and evidence source, not as the runtime that creates client deliverables.

The Marketing Chief remains Dillon's sole user-facing orchestrator and canonical queue writer. It assembles complete conversation episodes, resolves the exact client and operating route, decides whether actionable work exists, deduplicates against current work, and compiles a bounded Dillon-style work contract.

Codex creates or resumes the execution run, supervises the maker and checker, and returns an evidence-backed handoff. External sending, publishing, spend, account changes, destructive actions, authentication gates, and material business decisions remain subject to current approval policy.

## Rationale

- A 120-day Slack audit found that 51.5 percent of incoming threads in which Dillon participated did not mention him in the parent message.
- Slack work commonly spans request, clarification, attachments, dependencies, revisions, approval, and delivery.
- The existing 54 routines already cover most execution capabilities after a work item is accepted.
- Current Slack scheduling can report healthy without creating any Slack intake, so end-to-end evidence is required.
- A bounded context compiler can use Dillon's accepted precedent and memory without passing the full private history to every run.

## Adoption condition

Keep the decision proposed until a 14-day shadow-mode canary demonstrates:

- at least 95 percent recall on reviewed Dillon-owned requests;
- at least 90 percent actionable precision;
- exact source and client binding for every proposed item;
- reliable duplicate and supersession handling;
- zero unauthorized external actions;
- zero cross-client contamination.

## Non-goals

- Slack does not become a parallel command center.
- Cursor, Hermes, or another specialist does not supersede the Marketing Chief.
- The system does not auto-send, auto-publish, or auto-spend because a message sounds urgent.
- The entire Slack history is not injected into each Codex prompt.
- Model confidence does not override exact routing, evidence, permissions, or approval gates.

## Next safe action

Implement Phase 0 and Phase 1 from the linked audit: truthful Slack pipeline health followed by a 14-day shadow-mode episode detector. Do not enable ambient auto-execution during those phases.
