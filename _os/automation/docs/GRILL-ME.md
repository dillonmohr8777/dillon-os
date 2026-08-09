# Grill Me protocol

Grill Me is Dillon OS's fleet-wide, explicitly invoked clarification protocol. It adapts Matt Pocock's one-question-at-a-time planning interview to the existing Agent Runtime Contract without introducing a new agent, queue, brain writer, approval service, or delivery path.

## What it changes

- Every registered agent can own a Grill Me session for its current task.
- The session walks a dependency-ordered decision tree and gives a recommendation with each user question.
- Questions answerable from the codebase, vault, connected source, or runtime are resolved from evidence instead of being sent back to Dillon.
- Long sessions checkpoint atomically to a local JSON receipt and can resume without losing the active question or prior decisions.
- A completed receipt can be hashed and attached to Agent Runtime Contract v1 under `clarification`.

## What it does not change

Marketing Chief remains the only canonical queue writer and final synthesizer. Independent Verifier remains the only artifact acceptor. A Grill Me answer records shared understanding but never grants delivery, publishing, deployment, spend, account, destructive, authentication, or business-decision approval.

The protocol is not automatic. Invoke it with `$grill-me`, `/grill-me`, or a direct request such as `grill me on this plan`.

## Local CLI

Start or resume only inside an explicit local output directory:

```powershell
node _os/automation/bin/grill-me.js start --session outputs/grill/session.json --input _os/automation/fixtures/grill-me/fleet-plan.json
node _os/automation/bin/grill-me.js next --session outputs/grill/session.json
```

Record a user answer through a small JSON resolution file containing `answer` and optional `evidenceLocators`, or resolve a source-answerable branch with `resolve-source --branch <id> --resolution <json>`. Receipts are prohibited under `12_Brain`, canonical queue paths, and `.git`.

## Verification

```powershell
node --test _os/automation/tests/grill-me.test.js
node _os/acceptance/run.js grill-me
```

The tests cover single-question cadence, recommendations, dependency ordering, source-first resolution, atomic resumability, authority denial, and runtime receipt attachment.
