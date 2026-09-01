---
note_type: concept
status: active
created: 2026-09-01
updated: 2026-09-01
domain: prediction
maturity: proposed
summary: Do not make an LLM guess numeric business trends. Route time series to a dedicated forecast specialist, then let the LLM interpret quantile bands into one gated next action.
review_on: 2026-10-01
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-31 - analogalok-timesfm3-agent-forecast-router]]"
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist]]"
  - "[[12_Brain/03_Concepts/Leading Indicators]]"
  - "[[12_Brain/03_Concepts/Evidence Context and Learning Loops]]"
tags:
  - brain
  - concept
  - forecasting
  - predictors
  - automation
  - agenda
---

# Specialist Forecast Router

LLMs browse, write, and decide language. They do not own the future of a
number. When the question is a timeline, call a forecast specialist.

## The split

```text
language question  -> LLM / Marketing Chief
numeric future     -> forecast specialist
discrete outcome   -> existing prediction ledger (accept / modify / defer / reject)
consequential act  -> human or standing envelope
```

These four loops stay separate. Mixing them is how invented spend, fake
conversions, and unauthorized launches get into the agenda.

## Input contract

Every specialist call needs:

```yaml
client_id: ""          # exact registry route, or portfolio/system if not client work
series_id: ""
frequency: ""          # day / week / month
targets: []            # past values only, from a named source
past_covariates: []    # history-only helpers
future_covariates: []  # known future: promos, holidays, budgets, webinars, posts
horizon: 0
as_of: ""
source_locators: []
contains_client_series: false
model_id: ""           # timesfm-2.5-200m | timesfm-3.0-research | bigquery-timesfm
license_lane: ""       # apache-2.0 | research-only | commercial-managed
```

Reject the call when the client route is ambiguous, the series source is
stale, future covariates do not cover the horizon, or `license_lane` does not
match `model_id`.

## Output contract

```yaml
point: []
quantiles: { p10: [], p50: [], p90: [] }
horizon: 0
as_of: ""
model_id: ""
license_lane: ""
used_for: "agenda-feature | automation-evidence | research"
forbidden_uses:
  - spend
  - send
  - publish
  - conversion-claim
```

Store the artifact. Do not paste raw arrays into client copy. Interpret
bands as "likely range given this history," never as a booked result.

## How agenda uses it

`Get-NextActions.ps1` already ranks work with heuristics and a learned prior
that activates only after three comparable accept/reject outcomes. That
categorical predictor stays canonical.

A specialist forecast may later become a **feature** on that ranker:

- overpace risk (spend vs remaining budget vs remaining days);
- lead-drought risk;
- workshop-fill risk;
- silence length vs the six-week churn rule in [[Leading Indicators]].

It does not replace exact current-item feedback, approval gates, or WIP
limits. A high p90 spend band is evidence for a decision item, not an
automatic bid change.

## How automations use it

Automations already have a state machine, approval tier, and readback. Add
one optional stage after verified intake:

```text
Trigger -> Intake -> Normalize -> Route -> (optional) Forecast
-> Work -> Verify -> Gate -> Act -> Readback -> Ledger
```

Rules:

- Forecast is Level 1 or 2 assistance until a commercial model path is
  proven. It is not Level 3.
- The forecast artifact is evidence, like a QA report. It is not the side
  effect.
- Paid-media, HubSpot, morning-orchestrator, and report automations may
  attach bands. They may not enable campaigns from a band.
- Client series never enter TimesFM-3.0 until the license lane is
  commercial-managed.

## How predictors use it

There are now two predictor classes:

1. **Action predictors** — will Dillon accept this next action? Ledger:
   `client-operations/state/prediction-outcomes.jsonl`.
2. **Series predictors** — where does this number probably go? Ledger: a
   forecast-run artifact with quantiles and source locators.

Do not score one with the other's metric. An accepted local draft is not
proof that next week's spend will land inside p50.

## Failure modes

- Asking Codex, Claude, or Grok to "project next month's leads" from a
  paragraph of Slack.
- Feeding TimesFM-3.0 a client Ads or HubSpot series.
- Treating p10 as a conversion floor in a client email.
- Scheduling an unattended forecast job before the experiment acceptance
  contract passes.
- Letting a forecast create a second queue beside Marketing Chief.
