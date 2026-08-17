---
note_type: research
status: verified
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
question: "How should the graph-engineering and precedent-memory pattern apply to Dillon OS?"
verification_status: verified
confidence: 0.9
expires: 2026-09-30
review_on: 2026-08-06
source_refs:
  - https://x.com/av1dlive/status/2082929954329919856
  - https://x.com/av1dlive/status/2082871171415175211
  - "[[12_Brain/09_Ops/Architecture]]"
  - "[[12_Brain/09_Ops/Schema]]"
  - "[[12_Brain/09_Ops/AGENT_PROTOCOL]]"
tags:
  - brain
  - research
  - context-graph
  - precedent
  - agentic-memory
---

# Context ledger pattern for Dillon OS

## Conclusion

Dillon OS should adopt the source's **decision-and-precedent pattern**, but it
does not need a graph database or a full GraphRAG stack to do so.

The vault already has immutable captures, canonical entity and client notes,
version-aware time fields, decisions, outcomes in review records, wikilinks,
append-only JSONL queues, maker-checker gates, approval tiers, and graph-health
scripts. The missing join is a consistent record connecting:

`subject or case -> evidence -> governing rule version -> decision -> outcome`

Today, decisions can cite sources without always identifying the triggering
case, the exact rule version applied, the result, and whether the ruling later
served as precedent. That is the highest-leverage gap to close.

## What the source actually proposes

The article distinguishes three retrieval models:

- vector search retrieves similar wording;
- a knowledge graph retrieves explicit relationships; and
- a context ledger retrieves relationships plus the ruling that formed them.

Its durable write is a resolved decision attached to evidence and the policy
version that governed it. Decisions are appended, not overwritten. Retrieval
walks the graph first and falls back to vector search only when the connected
history is empty. The router forwards clean matches, reviews mismatches, and
escalates genuine ambiguity to a human.

The article's embedded example uses these six relationships:

```text
(Invoice)-[:BILLED_AGAINST]->(Contract)
(Invoice)-[:EVIDENCED_BY]->(Shipment)
(Decision)-[:RULED_ON]->(Invoice)
(Decision)-[:APPLIED]->(PolicyVersion)
(Decision)-[:CITES]->(Evidence)
(Supplier)-[:HAS_PATTERN]->(Exception)
```

The labels are specific to invoice disputes. The reusable idea is the decision
structure, not the finance vocabulary.

## Dillon OS translation

Use five conceptual families while keeping existing canonical locations:

1. **Subject** — an existing client, entity, project, workflow, account, or
   bounded case/work item.
2. **Evidence** — an immutable capture, test artifact, source-linked research
   note, or verified canonical fact.
3. **Governance** — a versioned protocol, approval tier, acceptance contract,
   or rule that was valid when the decision was made.
4. **Decision** — the ruling, confidence, rationale, router action, maker,
   checker, and human gate.
5. **Outcome or exception** — the observed result and any pattern worth using
   on the next case.

For the first pilot, keep the outcome inline on the Decision note instead of
adding a new folder or relationship type. Promote outcomes to separate notes
only if repeated querying proves that useful.

### Proposed relationship properties

These are proposed for a sandbox pilot, not yet canonical schema:

```yaml
case: "[[12_Brain/07_Reviews/Automation Runs/RUN-2026-07-30-0C310011 - build-and-independently-verify-a-fixture-landing-page]]"
subject: "[[12_Brain/05_Projects/2026-07-30 - Integrate daily intelligence stack]]"
policy_version: "[[12_Brain/protocols/approval-tiers]]"
evidence:
  - "[[12_Brain/07_Reviews/Automation Runs/RUN-2026-07-30-0C310011 - build-and-independently-verify-a-fixture-landing-page]]"
precedent:
  - "[[12_Brain/04_Decisions/2026-07-30 - Adopt gated intelligence stack]]"
router_action: forward
confidence: 0.92
outcome: "Observed result after the decision"
```

Existing `source_refs`, `verification_status`, `observed_at`, `valid_from`,
`valid_to`, `supersedes`, `review_on`, approval fields, and maker-checker
evidence remain authoritative.

## Recommended pilot

Pilot **workflow acceptance decisions**, not client publishing or account
access. This lane is frequent, local, reversible, and already has deterministic
maker-checker evidence.

### Write path

When a workflow review closes:

1. append the run event to the existing JSONL evidence trail;
2. create one Decision note;
3. require `case`, `subject`, `policy_version`, and at least one evidence link;
4. store the observed outcome on the Decision; and
5. never rewrite the prior ruling when policy changes.

### Read path

Before the next acceptance decision:

1. traverse wikilinks and properties from the workflow or case to prior
   Decisions;
2. filter for the same workflow class, acceptance contract, and failure mode;
3. present the ruling, policy version, evidence, and outcome together; and
4. use keyword or vector retrieval over captures only when no connected
   precedent exists.

### Router and human gate

- Matching workflow class, contract, and failure mode: suggest the precedent.
- Any mismatch: send to maker-checker review.
- Missing rule version, weak evidence, conflicting outcomes, or ambiguity:
  escalate to Dillon; never silently override.

No precedent may authorize publishing, sending, spend, account mutation,
destructive action, credential use, or approval-tier bypass.

## Acceptance test

Seed ten historical workflow decisions and process five held-out cases.

Pass only when:

- every new Decision has a case, subject, policy version, evidence, and outcome;
- the correct prior ruling is retrieved for every exact-match held-out case;
- ambiguous and conflicting cases escalate instead of auto-resolving;
- immutable captures and old canonical notes remain byte-for-byte unchanged;
- JSONL evidence remains append-only; and
- `System/scripts/Test-SecondBrain.ps1` reports no structural failures.

The baseline metric is **precedent hit rate**: how many cases begin with a
relevant, verified ruling instead of starting cold.

## Recommendation

Adopt this as a bounded Markdown-first pilot. Do not install a graph database,
Vertex AI Memory Bank, or another retrieval platform unless the pilot proves
that native wikilinks, properties, search, and JSONL evidence cannot meet the
retrieval and audit requirements.
