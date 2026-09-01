---
note_type: protocol
status: active
created: 2026-09-01
updated: 2026-09-01
source_refs:
  - "[[12_Brain/03_Concepts/Specialist Forecast Router]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist]]"
  - "[[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER]]"
tags:
  - brain
  - protocol
  - forecasting
  - agents
---

# Forecast Specialist Protocol

Portable rules for any agent that wants a numeric future. Detailed model
facts live on [[12_Brain/02_Entities/TimesFM|TimesFM]]. The operating idea
lives on [[12_Brain/03_Concepts/Specialist Forecast Router|Specialist Forecast Router]].

## When to call a specialist

Call it when the question is "where does this number go" and a source-backed
series exists.

Do not call it when the question is language, routing, design, or a discrete
operator decision already covered by `Get-NextActions.ps1`.

## Hard routing

| Question type | Owner |
|---|---|
| Browse, code, write, summarize | LLM / Marketing Chief |
| Exact client route, queue, approval | Marketing Chief |
| Numeric timeline | Forecast specialist |
| Accept / modify / defer / reject | Prediction ledger |
| Send, spend, publish, account change | Human or standing envelope |

## License lanes

- `apache-2.0`: TimesFM 2.5 local. Still no external action.
- `research-only`: TimesFM-3.0. Synthetic or public non-client series only.
- `commercial-managed`: future BigQuery or licensed 3.0. Not live as of
  2026-09-01.

If the lane is missing, refuse the forecast.

## Agent steps

1. Resolve one client or `portfolio/system`.
2. Collect the series from a named source locator. No Slack prose as the
   series.
3. Record the cutoff, source observation time, maximum source age, cadence
   verification, and leakage check. Abstain when any is unresolved.
4. Attach future covariates only when they are actually known (calendar,
   approved promo, remaining budget, scheduled webinar).
5. Choose a license-legal model.
6. Validate `12_Brain/schemas/forecast-request.json` with
   `_os/automation/bin/forecast-route.js route --from <request.json>`.
7. Stop on `blocked`. `sandbox-eligible` is a policy receipt, not proof that
   a checkpoint ran or that its license was accepted.
8. Write the forecast-run artifact. Include `as_of`, exact model id, source
   locators, all p10-p90 bands, and whether client series were used.
9. Validate it with `forecast-route.js validate-run --from <run.json>`.
10. Let the LLM interpret p10 / p50 / p90 into one suggested next action.
11. Stop. Do not spend, send, or publish from the band.

The router is intentionally fail-closed. As of 2026-09-01, TimesFM-3.0 can
only be `sandbox-eligible` for synthetic or public non-client research, while
TimesFM 2.5 remains research-only inside Dillon OS until the experiment and
human promotion gates pass.

## Reporting language

Forecast bands are not conversion results. If a defensible conversion number
is unavailable, say conversion reporting is pending validation. Never say
zero conversions.
