# Fleet integration

`grill-me-v1` is a shared clarification protocol, not an agent identity.

## Lifecycle

1. Dillon explicitly invokes Grill Me for a plan, design, workflow, or proposed change.
2. The current task-owning agent inspects available sources and declares the unresolved decision branches.
3. The agent asks one ready question at a time. A branch is ready only when all of its dependencies are resolved.
4. Codebase-resolvable branches are recorded with evidence locators without consuming a user turn.
5. The local receipt reaches `shared_understanding` only when all branches are resolved.
6. A nontrivial Agent Runtime Contract v1 run may attach the receipt hash under `clarification`.
7. Independent Verifier may verify the receipt and artifact hash but cannot edit the interview decisions.

## Status mapping

- `not_invoked`: no explicit Grill Me request governed this run.
- `in_progress`: the interview has an unresolved or currently active branch.
- `shared_understanding`: every declared material branch is resolved.
- `blocked`: a required answer needs unavailable evidence, authority, or human-only access.
- `not_applicable`: the run is a deterministic simulation or other context where user interrogation does not apply.

No status grants approval. Consequential actions remain governed by the existing approval state in Agent Runtime Contract v1.
