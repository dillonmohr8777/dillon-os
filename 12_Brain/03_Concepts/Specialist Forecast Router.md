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
request_id: ""
client_id: ""          # exact registry route, or portfolio/system if not client work
route_verified: false
cadence_verified: false
leakage_checked: false
series_id: ""
frequency: ""          # hour / day / week / month / quarter
targets:               # past values only, from a named source
  - { series_id: "", values: [] }
past_covariates:       # history-only helpers; each vector matches target context
  - { series_id: "", values: [] }
past_future_covariates: # known past + future; each vector is context + horizon
  - { series_id: "", values: [] }
horizon: 0
as_of: ""
cutoff_at: ""
source_observed_at: ""
max_source_age_hours: 0
source_locators: []
contains_client_series: false
model_id: ""           # exact checkpoint or managed-route id
license_lane: ""       # apache-2.0 | research-only | commercial-managed
used_for: ""           # agenda-feature | automation-evidence | research
```

Reject the call when the client route is ambiguous, the series source is
stale, future covariates do not cover the horizon, or `license_lane` does not
match `model_id`.

## Output contract

```yaml
target_outputs:
  - series_id: ""
    point: []
    quantiles:
      { p10: [], p20: [], p30: [], p40: [], p50: [], p60: [], p70: [], p80: [], p90: [] }
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

## Enforced router

The contract is executable, not just prose:

```powershell
node _os/automation/bin/forecast-route.js route `
  --from _os/automation/fixtures/forecast/synthetic-timesfm3-request.json
```

The router performs no model inference and no network call. It validates
source freshness, route/cadence/leakage attestations, context and horizon
dimensions, model-to-license mapping, client-data restrictions, and allowed
use. Its only successful current state
is `sandbox-eligible`; that status still requires the listed human, license,
hardware, and experiment gates. Run artifacts are checked against
`12_Brain/schemas/forecast-run.json`, including all nine non-crossing
quantiles and TimesFM point = p50.

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
