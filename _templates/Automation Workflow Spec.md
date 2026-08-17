---
note_type: project
status: proposed
created: "{{date}}"
updated: "{{date}}"
owner: Dillon Mohr
area: automation
priority: normal
outcome: ""
next_action: ""
review_on: ""
source_refs: []
tags: [brain, project, automation, workflow]
---

# Automation workflow spec - {{title}}

## Purpose and route

- Workflow ID/version:
- Owner:
- Exact client/project/account route:
- Source of truth:
- Intended outcome:
- Non-goals:

## Trigger and inputs

- Trigger:
- Schedule/timezone:
- Inputs and schemas:
- Freshness requirement:
- Idempotency key:
- Dedupe/suppression:

## State machine

```text
discovered -> normalized -> routed -> eligible -> in_progress
-> maker_complete -> checking -> awaiting_approval
-> authorized -> executed -> verified -> closed
```

Failure/hold states:

## Capabilities and boundaries

- Allowed reads:
- Allowed local writes:
- Approval-gated side effects:
- Forbidden actions:
- Secret handling:
- Human-only gates:

## Worker and verification contract

- Maker identity/output:
- Checker identity/output:
- Deterministic checks:
- Evidence artifacts/hashes:
- Acceptance criteria:
- Approval record:
- Live readback:

## Failure and recovery

- Error classes:
- Retry/backoff:
- Timeout:
- Resume behavior:
- Checkpoint rule:
- Rollback:
- Stop/kill switch:

## Observability and notification

- Run ledger:
- Redaction:
- Health/staleness:
- Success notification policy:
- Failure/escalation policy:

## Test plan

- Healthy fixture:
- Broken fixture:
- Duplicate/replay:
- Wrong route:
- Missing auth:
- Human gate:
- Partial external failure:

## Next action

See [[12_Brain/03_Concepts/Automation and Workflow Engineering]].

