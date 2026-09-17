# Jev claim verification

Built 2026-09-17. Runs `typesafe-ai/jev` through the Vercel AI Gateway to
separate what someone **asserted** from what was **measured**.

Wiring, pricing and the full API contract live in
[`System/api-keys-setup.md`](../../../System/api-keys-setup.md).

## Run it

```powershell
# costs nothing, needs no key, prints the exact payload and a cost estimate
node verify-claims.mjs --input records/orchestrator-claims-2026-09-17.json

# cheapest proof the key works (one question, fraction of a cent)
node verify-claims.mjs --smoke

# the real run - spends
node verify-claims.mjs --input records/orchestrator-claims-2026-09-17.json --live

# the self-check - no network, no cost
node test-verify-claims.mjs
```

Exit codes: `0` clean, `1` at least one claim flagged, `2` `AI_GATEWAY_API_KEY`
unset, `64` bad arguments. The `1` is deliberate, so this can gate a batch.

## Why this rubric and not a token or contrast checker

Hex equality and WCAG contrast are arithmetic. A script does that better than
any model and cannot be wrong about it. Reaching for a probabilistic model there
would make a solved problem unreliable.

What no script can do is read a line that says `PASS`, or `merged`, or
`root cause`, and notice that nothing behind it was ever inspected — or that
what *was* inspected does not cover what the line claims.

So the question is never "is this true". It is **"did anyone look, and did what
they looked at actually cover this"**.

## The rubric

Six atomic questions against one shared state, answered in a single request.
This follows TypeSafe's own build guide: narrow questions each evaluating one
property, with composition and every threshold kept in code.

| Question | Type | Catches |
|---|---|---|
| `reportsAReading` | boolean | a verdict with no observed value behind it |
| `scopeCoversClaim` | boolean | real evidence about the wrong window, account or system |
| `restatesWithoutSupport` | boolean | evidence that just repeats the claim |
| `contradictsClaim` | boolean | evidence that actually says the opposite |
| `supportIsTestimony` | boolean | a person said so, no instrument recorded it |
| `blastRadius` | score 0-3 | what it costs if the claim is wrong |

`judge()` composes these into `ok` / `review` / `flag`. Two hard gates
short-circuit: **contradiction**, and **scope**. Everything else is a weighted
evidence score (`reading .4`, `scope .4`, `not-restated .2`).

### Scope is a gate, not a contributor

The self-check enforces this, and it is the whole point. A weighted average
lets a confident reading mask a total scope failure — `reading=0.98,
scope=0.04` averages to 0.60 and sails through as "review". But strong evidence
about the wrong thing does not *partially* support a claim. It does not support
it at all.

That is the exact shape of the two worst failures in the record:

- **Empeon PR #399.** An auditor subagent reported the work "merged to GitHub",
  citing `git cat-file` output. The output was real. It was about the
  daily-sweep and report-email commits, not the Empeon commit, which sat in a
  **draft** PR the whole time. `gh pr view 399` returned `isDraft: true`.
- **The power fault.** 14 unclean power-offs in 30 days is a real measurement.
  It was used to explain a specific weekend the event log later showed the
  machine was up for, continuously.

Both are genuine readings, generalised past what they cover. A naive
"is this supported" question waves both through, because the evidence *looks*
strong. Splitting scope out is what catches them.

## Records

`records/*.json` are arrays of `{id, claim, evidence, source, groundTruth}`.

**`groundTruth` is never sent to the model** — `stateFor()` passes only claim,
evidence and source, and the self-check asserts the holdout. It exists so a live
run can be scored against answers established independently, rather than judged
on whether the output reads plausibly.

`orchestrator-claims-2026-09-17.json` holds nine real claims from the record:
six later overturned or narrowed by measurement, three true controls. A correct
rubric must pass the controls, not just flag everything.

## What Jev cannot do

Probed live 2026-09-17 with `limits-probe.mjs`. Re-run it after a version bump —
`jev-latest` is a moving alias, so these limits can shift under you.

`generateText` against `typesafe-ai/jev` returns, verbatim from the Gateway:

> Model 'typesafe-ai/jev' is an evaluation model, not a language model.
> Use the evaluation generation API instead.

TypeSafe's own limitations page agrees: **"Jev 1.13 is not trained to generate
text."** The model registry reports `context_window: 0` and `max_tokens: 0`.

An open-ended question is refused before it reaches the model:
`choice criteria must be a nonempty option map`. You supply every option it may
pick. It cannot propose one you did not write.

So it cannot write, cannot call a tool, cannot loop, and cannot choose its own
next step. In the function-calling cookbook it selects a function and its
arguments; the surrounding code executes them. It is a router, not an agent.

### Documented weak spots that hit this vault directly

From `docs.typesafe.ai/model-jaggedness/jev-1.13`:

| Weakness, their words | What it rules out here |
|---|---|
| "Jev is not a calculator", "does not count reliably" | any metrics, spend or lead reconciliation |
| "cannot reliably judge whether two values are near each other" given RGB or hex | the design-token and palette QA idea. Use arithmetic. |
| "reads dates as text, not as ordered quantities" | date-window checks |
| "Accuracy falls as the state grows with content unrelated to the decision" | passing whole documents as state |
| "does not treat [adversarial content] as hostile by default" | anything reading inbound email or Slack unfiltered |

**This explains the 2026-09-17 over-flagging.** The `scopeCoversClaim` question
asked it to judge whether a 30-day aggregate covers a specific weekend — a date
range comparison, which is a documented blind spot. The rubric was built on top
of one of its known weaknesses. Any recalibration has to drop the date reasoning
out of the model and into code first.
