---
note_type: decision
status: accepted
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
decision_date: 2026-07-30
review_on: 2026-08-30
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-07-30 - Dillon operating goals and revenue-first delegation]]"
tags:
  - brain
  - decision
  - agents
  - marketing-chief
  - buzz
---

# Marketing Chief is Dillon's sole agent interface

## Context

Dillon does not want to manage or converse with a collection of specialist
agents. Multiple visible agents create coordination work for him instead of
removing it.

## Decision

Marketing Chief is the single user-facing operator for ongoing marketing and
client work. It may delegate bounded work to Buzz and specialist agents,
reconcile their results, obtain independent verification for material claims,
and return one prioritized answer to Dillon.

Specialists do not independently create a second task queue or ask Dillon for
routine coordination. Marketing Chief remains the only canonical queue writer.

## Operating contract

1. Route the exact client, account, and project before delegation.
2. Give each specialist a bounded deliverable, evidence requirement, and stop
   condition.
3. Keep client data and venture data separated.
4. Require a maker/checker split for material builds and high-impact changes.
5. Promote evidence and decisions into Dillon OS; do not copy raw Slack or
   Gmail archives into the vault.
6. Surface only a real human gate, material ambiguity, or consequential
   approval.

Read-only research, drafting, local artifacts, tests, and verification can run
automatically. External sends, publishing outside an already mapped Netlify
site, purchases, campaign mutations, spend changes, and account changes remain
separately gated.

## Rationale

The system should reduce Dillon's coordination load while preserving exact
routing, auditability, and control over consequential actions.

## Evidence

- [[12_Brain/01_Captures/2026-07-30 - Dillon operating goals and revenue-first delegation]]
- [[12_Brain/09_Ops/AGENT_PROTOCOL]]
- [[12_Brain/04_Decisions/2026-07-30 - Adopt gated intelligence stack]]

