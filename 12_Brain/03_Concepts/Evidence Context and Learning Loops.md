---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-09-01
domain: knowledge operations
maturity: operational
summary: Durable learning joins immutable evidence to canonical knowledge, decisions, outcomes, rule versions, and future precedent without confusing capture with truth.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[12_Brain/03_Concepts/Living Second Brain]]"
  - "[[12_Brain/06_Research/2026-07-30 - Context ledger pattern for Dillon OS]]"
  - "[[12_Brain/09_Ops/Architecture]]"
  - "[[12_Brain/09_Ops/Schema]]"
  - "[[04_SOPs/Communication Intelligence Ingestion]]"
  - "[[12_Brain/05_Projects/2026-07-29 - Complete Dillon OS second brain]]"
  - "[[12_Brain/03_Concepts/Specialist Forecast Router]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist]]"
tags:
  - brain
  - concept
  - evidence
  - learning-loop
  - context-ledger
  - precedent
---

# Evidence, Context, and Learning Loops

The brain improves when a new observation changes a supported model and that
model improves a future decision. More notes alone are not learning.

## Knowledge chain

```text
source receipt
-> verified observation
-> canonical claim or model
-> bounded decision
-> executed action
-> observed outcome
-> reusable lesson or precedent
-> next hypothesis
```

Each transition must preserve the source and the difference between fact,
interpretation, decision, and result.

## Evidence classes

### Immutable capture

What a source said or showed at a point in time. It is append-only history and
may be wrong, incomplete, or untrusted.

### Canonical knowledge

The current best supported model. It can be updated when stronger evidence
arrives and should link to sources and contradictions.

### Decision

The selected action or rule, with rationale, evidence, confidence, owner,
policy version, and review date.

### Outcome

What actually happened after the decision. An outcome may be successful,
failed, mixed, or inconclusive.

### Precedent

A prior decision and outcome that can inform a genuinely similar case. It is
advisory unless a current policy explicitly makes it binding.

## Two clocks and freshness

Use:

- `observed_at`: when the vault learned it;
- `valid_from`: when it became true in the world;
- `valid_to`: when it stopped being true;
- `updated`: when the compiled note meaningfully changed;
- `expires`: when external research must be revalidated; and
- `review_on`: when the system should reconsider the note.

This prevents an old correct observation from masquerading as current state.

## Compile protocol

1. Preserve the source receipt or exact locator.
2. Identify claims, decisions, deliverables, deadlines, contradictions, and
   reusable methods.
3. Route each item to the canonical client, entity, concept, project, decision,
   review, or memory note.
4. Update before creating a duplicate.
5. Add source references and freshness.
6. Separate observed fact from inference.
7. Record unresolved conflict.
8. Link the knowledge to execution or explain why it remains research.
9. Run link, schema, and coverage checks.

Raw Slack, Gmail, transcripts, and browser output should not be copied wholesale
into compiled notes. Store only the evidence needed to retrieve and verify the
source.

## Contradiction handling

When sources disagree:

- retain both source receipts;
- state the exact fields in conflict;
- compare authority, directness, recency, and scope;
- verify live state when cheap and safe;
- mark the canonical claim disputed or time-bound;
- do not merge conflicting client or account identities; and
- create a decision or human gate only when the conflict changes action.

## Experiment loop

Every proposed operational change should state:

```yaml
hypothesis: ""
baseline: ""
intervention: ""
expected_outcome: ""
acceptance_test: ""
independent_checker: ""
risk: ""
rollback: ""
review_on: ""
result: "pending"
```

Research proposes experiments. It does not auto-change production strategy.
Numeric futures follow the same loop: a specialist forecast is evidence, not
an adopted operating change, until
[[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER|EXP-TIMESFM-FORECAST-ROUTER]]
passes and a human gate promotes it.

## Daily brain growth protocol

The daily growth loop is bounded so the brain compounds without manufacturing
knowledge or creating note debt:

```text
new verified evidence
-> one demonstrated weakness or improvement question
-> baseline measurement
-> primary-source research when needed
-> at most one canonical change
-> fixed acceptance tests
-> keep, or restore only the loop's own files
-> dated learning receipt
```

The loop changes one variable at a time and may retain no more than one durable
improvement per day. A healthy no-op is better than an unsupported update. It
must update the strongest existing canonical record before creating a page,
preserve immutable captures, and keep facts, inference, hypotheses, experiments,
and outcomes distinct.

An improvement is retained only when it:

- has exact source references and appropriate freshness or verification;
- solves a concrete retrieval, reasoning, memory, workflow, or coverage need;
- introduces no duplicate canonical page;
- preserves zero structural errors, one graph component, full graph coverage,
  zero orphans, and all operational knowledge domains; and
- survives the repository automation tests.

On Sundays, the same loop performs seven-day consolidation: stale and
contradictory claims are surfaced, automation failures and unresolved
experiments are reviewed, outcomes are linked back to decisions, and redundant
memory is merged into the strongest canonical record without deleting evidence.
Blocked or empty research inputs remain explicitly unavailable; they are never
converted into invented evidence.

## Decision-to-precedent record

Join:

```text
subject or case
-> evidence
-> policy or rule version
-> decision
-> outcome
-> later precedent use
```

Retrieve precedent only when workflow class, decision type, policy, and failure
mode are meaningfully similar. Ambiguous or conflicting precedent escalates.

## Memory promotion test

Promote a fact or preference to durable memory only when it is:

- likely to matter again;
- safe and non-secret;
- supported by evidence or an explicit user instruction;
- stable enough to reduce future work; and
- not already captured in a stronger canonical rule.

Routine chatter, temporary debugging, and ephemeral system output do not
belong in memory.

## Knowledge health

Measure:

- concept coverage by strategic domain;
- sources linked to canonical concepts;
- research past expiry;
- active projects past review date;
- decisions without outcomes;
- duplicate or conflicting canonical notes;
- graph components and orphans;
- unresolved links;
- source-less durable claims; and
- time from a material signal to a compiled decision.

Use [[12_Brain/09_Ops/Knowledge Coverage|Knowledge Coverage]] and
[[12_Brain/09_Ops/Health|Brain Health]].

## Failure modes

- Append-only capture with no compilation.
- Canonical notes with no sources.
- Source links treated as current verification.
- Rewriting history instead of superseding it.
- Recording a decision but never observing the outcome.
- Generalizing from one client or experiment without limits.
- Creating a graph database before native links and properties prove
  insufficient.
- Persisting secrets, PII, or raw communications.
