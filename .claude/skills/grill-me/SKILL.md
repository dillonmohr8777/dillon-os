---
name: grill-me
description: Stress-test a plan or design through an explicitly invoked, one-question-at-a-time interview that resolves decision dependencies and records shared understanding before execution. Use when Dillon says "grill me", asks to interrogate or pressure-test an idea, or explicitly invokes $grill-me.
---

# Grill Me

Turn an underspecified plan into a shared, reviewable decision model before implementation. This is a user-invoked clarification protocol, not a sixteenth agent, approval authority, or automatic blocker.

## Interview protocol

1. Read the plan, relevant repository files, current runtime state, and existing decisions before asking anything.
2. Map the unresolved decisions as a dependency tree. Start with the most load-bearing unresolved branch and finish it before opening a dependent branch.
3. Ask exactly one question per turn and wait for the answer.
4. Include a recommended answer and a short rationale with every question.
5. If the codebase, vault, connected source, or current runtime can answer a question safely, inspect that source and record the answer instead of asking Dillon.
6. After every answer, update the local Grill Me receipt before asking the next question when the session spans multiple turns.
7. Stop when every material branch is resolved, further questions would not change the plan, or a real authority or evidence blocker is reached.

Use this question shape:

```text
Q[current]/[total]: [one focused question]
Recommended answer: [specific recommendation and one-sentence rationale]
```

## Fleet boundaries

- Every registered agent may participate, but the agent that owns the current task owns the interview; do not delegate questioning or create a parallel command center.
- Marketing Chief remains the sole canonical queue writer and final synthesis authority.
- The receipt is local clarification evidence only. It cannot approve delivery, publishing, spend, account changes, destructive actions, authentication, or business decisions.
- Do not request passwords, tokens, one-time codes, or other secrets. Resolve only non-secret access locators and stop at human-only gates.
- Do not ask Dillon to repeat facts already available in the current thread, codebase, shared vault, canonical client registry, or source evidence.
- Do not run Grill Me implicitly. For ordinary ambiguity, make safe scoped assumptions or ask the minimum blocking question under the normal workflow.

## Receipt and handoff

For a resumable session, use `_os/automation/lib/grill-me.js` or `_os/automation/bin/grill-me.js` and keep the receipt under the explicit run or output directory. The receipt must preserve the subject, owning agent, source locators, branch dependencies, one active question at most, recommendations, answers, resolution source, open branches, and authority boundary.

When shared understanding is reached, summarize:

- locked decisions;
- assumptions and evidence locators;
- unresolved non-blocking risks;
- the agreed next action;
- any approval that is still pending.

Attach the hashed receipt to Agent Runtime Contract v1 as `clarification` evidence when the session governs a nontrivial run. See [fleet integration](references/fleet-integration.md) for the exact lifecycle.

## Acceptance

Run:

```powershell
node --test _os/automation/tests/grill-me.test.js _os/automation/tests/agent-runtime.test.js _os/automation/tests/agent-fleet.test.js
node _os/acceptance/run.js grill-me
```

The protocol passes only when it asks one question at a time, preserves dependency order and resumability, gives a recommendation, prefers source inspection over redundant questions, reaches shared understanding only after all material branches resolve, and records zero new authority.
