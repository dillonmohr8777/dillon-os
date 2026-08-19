---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says diagnose or debug this, or reports something broken, throwing, failing, or slow.
command_deck: false
---

# Diagnosing Bugs

A discipline for hard bugs. Skip phases only when explicitly justified.

Read the nearest `CONTEXT.md` or `12_Brain/09_Ops/engineering-glossary.md` when exploring.

## Redact

Show commands, outputs, and captured artifacts with secrets removed. Write `[redacted]` in place of credentials. Build loops against env vars so the credential stays in the environment.

## Phase 1 — Build a feedback loop

This is the skill. If you have a tight pass/fail signal for the bug, you will find the cause. If you do not, staring at code will not save you.

Try in this order: failing test at the seam that reaches the bug; curl/HTTP script; CLI with a fixture; headless browser script; replay a captured trace; throwaway harness; property/fuzz loop; bisection harness; differential old-vs-new; last resort a structured human-in-the-loop script.

Tighten the loop: faster, sharper symptom assertion, deterministic.

Phase 1 is done when you can name **one command** you have already run at least once that is red-capable (asserts the user's exact symptom), deterministic, fast, and agent-runnable.

If you catch yourself reading code to build a theory before this command exists, stop.

## Phase 2 — Reproduce and minimise

Run the loop. Watch it go red on the failure the user described. Shrink the repro one cut at a time until every remaining element is load-bearing.

## Phase 3 — Hypothesise

Generate 3-5 ranked, falsifiable hypotheses before testing any of them. Show the list. Do not block if Dillon is AFK.

Format: "If X is the cause, then Y will make the bug disappear / get worse."

## Phase 4 — Instrument

Each probe maps to a specific prediction. Change one variable at a time. Prefer a debugger over log-everything. Tag debug logs with a unique prefix such as `[DEBUG-a4f2]` so cleanup is one grep.

For performance regressions, measure first.

## Phase 5 — Fix + regression test

Write the regression test before the fix, but only at a correct seam that exercises the real bug pattern. If no correct seam exists, that is the finding: flag the architecture.

## Phase 6 — Cleanup

- Original Phase 1 loop is green
- Regression test passes, or missing seam is documented
- All `[DEBUG-...]` instrumentation removed
- Throwaway prototypes deleted
- The correct hypothesis is stated in the commit or PR message

Do not deploy, send, or merge as part of diagnosis.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
