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

### Why the 2026-09-17 rubric over-flagged

Two wrong explanations were recorded before the right one. Both are struck out
here rather than deleted, because the mistake is the same one this tool exists
to catch: an explanation asserted without measuring it.

1. ~~Date-range blindness.~~ **Retracted.** `jaggedness-probe.mjs` tested all
   six documented weak spots — date ordering, date-in-window, counting, hex
   proximity, hex difference, double negatives — and Jev answered **6/6
   correctly** for $0.00008. The vendor's limitations page was taken as
   measurement when it was a claim.
2. The real cause, from independent benchmarks published after launch:
   **Jev is weak when asked for a broad judgement and strong when asked narrow
   factual sub-questions that code then combines.** On 2,000 phishing emails
   (`anisselbd/jev-phishing-bench`) Jev scored **62.6% accuracy end-to-end
   against Claude Haiku 4.5's 81.3%** — it lost badly as a drop-in labeller.
   But its *decomposed signals*, fed to a logistic regression, reached
   **AUROC 0.988**, matching the LLM at ~27x cheaper and ~5x faster.

`scopeCoversClaim` is a broad judgement, and `judge()` gates on it directly with
a hand-picked 0.5 threshold. That is precisely the shape the benchmark says
fails. Calibration compounds it: Jev 1.13 measures **ECE 0.154** against Haiku's
0.097, so the raw probabilities are not honest enough to threshold by hand.

**The fix is not new questions, it is a fitted combiner.** Label 200-500 claims,
run the battery once (cents), sweep the cutoff on a train split, confirm on
held-out, and fit the weights rather than guessing them. `bitnovus/jev-spam-eval`
moved false positives from **694 to 203** on criteria wording alone, and got
98.33% — matching a trained TF-IDF classifier — by doing this.

Worth keeping in view: on that phishing set, a **two-line regex scored 91.6%**.
Climb the ladder before reaching for a model.

## Gateway passes confidence through, and reports billed cost

Probed 2026-09-17 with `confidence-probe.mjs`. A practitioner asked publicly
whether the Gateway forwards TypeSafe's calibrated confidence. It does:

```
providerMetadata.typesafe.confidence  ->  { element: 1, risk: 0.6 }
```

Choice and Score carry confidence. Boolean does not, by design — for a
boolean the probability IS the answer, not a confidence in it.

More useful still, the Gateway reports **actual billed cost per call**:

```
providerMetadata.gateway.cost            "0.000016926"
providerMetadata.gateway.outputInferenceCost  "0"
providerMetadata.gateway.generationId    "gen_01M2R0FE16EHHR7SD3SFD96DC4"
```

`verify-claims.mjs` now reports this figure rather than multiplying tokens by
the list price, and says which source it used. The routing block also carries
per-attempt `startTime`/`endTime` — that probe round-tripped in **375 ms**.

`rounding` comes back `{probabilityDecimals: 2, scoreDecimals: 2}`, so every
probability is 2dp. Do not build a threshold that depends on finer resolution.

## Bake-off, measured 2026-09-17

Nine models, four real Momentum jobs, 35 of 36 runs succeeded, **$0.329 billed**
(read from `providerMetadata.gateway.cost`, not computed).

| model | avg ms | 4 jobs | code test |
|---|---|---|---|
| `anthropic/claude-sonnet-5` | **5,451** | $0.018274 | PASS |
| `inclusionai/ling-3.0-flash` | 8,484 | **$0.000557** | PASS |
| `openai/gpt-6-astra` | 9,705 | $0.062130 | PASS |
| `moonshotai/kimi-k3` | 13,988 | $0.083800 | PASS |
| `anthropic/claude-fable-5.1` | 17,010 | $0.115300 | 1 run failed |
| `deepseek/deepseek-v4-flash` | 20,353 | $0.004646 | PASS |
| `alibaba/qwen3.7-flash` | 32,077 | $0.001323 | PASS |
| `spacexai/grok-4.20-reasoning` | 47,284 | $0.036557 | PASS |
| `zai/glm-5.3-flash` | **107,733** | $0.006615 | PASS |

**Two findings that overturned the benchmark research.**

**Sonnet 5 is the fastest model in the set**, beating every cheap model and both
frontier ones. Speed is not something you buy by going cheap.

**GLM-5.3-Flash is the slowest by a wide margin** at 107s average, with single
jobs at 147s and 189s. The benchmarks put it 29 points above Sonnet 5 on
Terminal-Bench 4.0, and on this hardware against these jobs it is unusable
interactively. Batch only. This is the entire argument for measuring your own
work rather than reading a leaderboard.

**Quality gap is narrower than price implies.** The code job carried a
correctness trap (sRGB linearisation, the 0.03928 threshold). Every model's
output was executed: **all eight that produced code passed their own asserts**,
including `ling-3.0-flash` at $0.02/1M. On prose the cheap tier is more generic,
but it is not wrong.

`claude-fable-5.1` returned `GatewayRateLimitError: No access to this model` on
one job. That key cannot reach Fable 5.1 reliably.

Picks: **`deepseek-v4-flash`** as the default (1M context, passed the trap,
4x cheaper than Sonnet), **`ling-3.0-flash`** for bulk, **Sonnet 5** when latency
matters. Note DeepSeek is reported to ignore negative instructions, so "do not
touch X" is unreliable with it.
