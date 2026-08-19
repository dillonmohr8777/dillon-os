---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
client: Bridge Software Development
project: "[[12_Brain/05_Projects/2026-08-19 - Bridge Phase 3 promotion and protected profile]]"
decision_date: 2026-08-19
review_on: 2026-08-26
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 is the current product lane]]"
  - "https://github.com/dillonmohr8777/bridge-discovery-prototype/blob/main/docs/phase2/04-phased-backlog-and-decisions.md"
tags:
  - brain
  - decision
  - bridge-software
---

# Bridge Phase 3 slice is open

Phase 3 is the current Bridge product/UX lane: typed claims, upload intent, Promotion create, and protected profile projection.

## Context

Phase 2's five-route Trusted Current frontend is technically complete and live on the unified noindex review URL. Treating missing Tori checkboxes as a hard stop incorrectly parked the next contracted slice.

## Options considered

1. Wait for written route-by-route acceptance, payment ledger reconciliation, and Miraj staging before any Phase 3 code.
2. Open Phase 3 on the already-recommended Promotion + protected-profile slice, keep the live API unbound, and keep Netlify deploy gated.

## Decision

Option 2. Frontend Phase 3 work proceeds now. A live `/api/v1` origin is not bound until Miraj publishes inspectable staging. The unified review site is not updated until Dillon approves that deploy.

## Rationale

Melissa already told the team to move forward. Dillon named this exact slice on 2026-08-16. The repo backlog already labeled it Phase 3. Miraj reported Milestone 2 done pending his tests.

## Consequences

- `/create` and `/my-profile` use the Phase 3 adapter instead of inert prototype controls.
- Expanded directories, ranking, subscriptions, and in-platform ordering stay future/change-order work.
- Tori acceptance is still recorded when it arrives; it does not gate adapter work.

## Reversal trigger

Mac or Tori issues a written hold, or Miraj's inspectable contract contradicts the proposed `/api/v1` paths enough that the slice must be re-cut.

## Evidence

- [[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 is the current product lane]]
