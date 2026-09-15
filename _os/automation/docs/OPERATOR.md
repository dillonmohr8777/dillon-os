# Automation ops operator guide

This is the executable control surface for Dillon OS automation. All commands are
local and fail closed. A successful local check never authorizes an external send,
public deploy, account change, or secret use.

## Requirements

- Node 18 or newer
- No package install for the local automation library
- The weekly site factory from merged PR #226 is installed at `_templates/site-factory/`

## Indeed hiring signals

Use the official Indeed Partner GraphQL API. HTML scraping is not permitted by
this automation layer.

```powershell
node _os/automation/bin/indeed-fetch.js --what "marketing" --where "Philadelphia, PA" --dry-run
node _os/automation/bin/indeed-fetch.js --what "marketing" --where "Philadelphia, PA" --out _os/automation/incoming/indeed/philadelphia-marketing.json
node _os/automation/bin/qualify.js --adapter indeed --from _os/automation/incoming/indeed/philadelphia-marketing.json
node _os/automation/bin/indeed-pipeline.js --what "marketing" --where "Philadelphia, PA" --limit 25
```

The live command reads `INDEED_ACCESS_TOKEN`, or exchanges
`INDEED_CLIENT_ID` and `INDEED_CLIENT_SECRET` for an ephemeral token. Store
those values only in an approved secret store or protected environment.
The OAuth exchange uses Indeed's HTTP Basic authentication requirement. The
pipeline command fetches the official envelope and immediately hands it to the
shared qualifier; it does not create applications or contact employers.

## Direct-mail preparation

PostGrid is the selected mail vendor. Prepare a non-sending activation plan from
the site factory output:

```powershell
node _os/automation/bin/direct-mail-plan.js --from <batch-dir>/prospects.csv --out <batch-dir>/direct-mail-plan.json
```

The plan contains fingerprints and gate results, not recipient addresses. It
never changes `mail_ready`, sends mail, or makes a vendor request. The complete
test-mode and production approval sequence is in
`02_Campaigns/AI Site Builder Outreach Engine/Direct Mail Activation Runbook.md`.

## Daily intelligence

```powershell
node _os/automation/bin/grok-ingest.js --from <grok-run.json>
```

The run envelope must match `12_Brain/schemas/grok-run.json`. Ingestion writes:

- an immutable source capture under `12_Brain/01_Captures/Grok/`
- a daily synthesis under `12_Brain/06_Research/`
- proposed experiment notes for `sandbox-test` candidates
- an idempotency record under `12_Brain/state/`

## Daily Gmail and Slack intelligence

The connected collector writes a curated run envelope under
`_os/automation/incoming/communications/`, then runs:

```powershell
node _os/automation/bin/communication-ingest.js --from <communication-run.json>
```

Validate without writing with:

```powershell
node _os/automation/bin/communication-ingest.js --from <communication-run.json> --validate-only
```

The run must match `12_Brain/schemas/daily-communication-run.json`. Ingestion
writes an immutable curated capture, a daily review, dedupe/checkpoint state,
and safe local compile-queue rows. It fails closed on raw message bodies,
apparent secret values, unsafe paths, and cross-client write targets. The
collector and ingester never send, post, label, archive, publish, spend, or
change an account.

The CLI does not log in to Grok or scrape X. A separate read-only browser collector
may export completed Grok automation runs into the envelope.

## Weekly and monthly report archive

Every finalized weekly and monthly report uses a manifest matching
`12_Brain/schemas/report-run.json`.

```powershell
node _os/automation/bin/report-ingest.js --from <report-run.json> --validate-only
node _os/automation/bin/report-ingest.js --from <report-run.json>
```

The ingester accepts only PDF, HTML, and Markdown artifacts from approved report
roots. It verifies the exact vault client route, copies the final artifact into
immutable report captures, writes a connected review note, records a SHA-256
hash, and suppresses duplicate cadence, client, period, and artifact tuples. It
does not send, publish, or infer delivery.

## Maker/checker gate

```powershell
node _os/automation/bin/workflow-gate.js start --from <manifest.json>
node _os/automation/bin/workflow-gate.js maker --run <run-id> --evidence <maker.json>
node _os/automation/bin/workflow-gate.js check --run <run-id> --evidence <checker.json>
node _os/automation/bin/workflow-gate.js gate --run <run-id>
node _os/automation/bin/workflow-gate.js approve --run <run-id> --approver "Dillon Mohr" --note "<exact approval>"
```

The maker and checker must be different identities. Human approval is required by
default. Never manufacture an approval record from a general build request.

## MCP acceptance

```powershell
node _os/automation/bin/mcp-gate.js --from <candidate.json>
node _os/automation/bin/mcp-gate.js --from <candidate.json> --inspect
```

The second command invokes a pinned MCP Inspector package for a read-only
`tools/list` probe. Candidate records must not contain credentials or request
headers. The five required checks are source review, Inspector, permission review,
prompt-injection handling, and overlap review.

## Website deployment checks

```powershell
node _os/automation/bin/site-health.js --dry-run
node _os/automation/bin/aeo-trust-gate.js --path <built-site> --profile _os/automation/profiles/site-factory-default.json
```

The AEO gate checks page metadata, a direct answer block, FAQ and structured data,
real imagery, contact and business signals, AI crawler policy, local links, and
placeholder copy. A failing result blocks deployment. A pass must still be followed
by visual review, functional QA, maker/checker review, and exact Netlify target
verification.

## Forecast specialist sandbox

Route and run the Apache-licensed Chronos-2 canary with the verified local
Windows runtime:

```powershell
_os/automation/bin/forecast-chronos2.ps1 `
  -RequestPath _os/automation/fixtures/forecast/synthetic-chronos2-multitarget-request.json `
  -OutputPath "$env:LOCALAPPDATA/Codex/Forecasting/chronos2-run.json"
```

The command validates the request before loading the model, pins the exact
trusted Python and Torch stack, and reads the checkpoint from the local cache.
It remains research-only and fails closed on client series, stale or unverified
inputs, incomplete known-future covariates, runtime drift, or an unpromoted use.
Its point and p10-p90 output is evidence only; it cannot send, publish, spend,
or make a conversion claim.

### Rolling-origin backtest

A `rolling: true` entry in `CLIENT_RESEARCH_APPROVALS` freezes one sanitized
series and admits only requests whose targets equal the first `k` approved
values, with `k` between `min_context` and `length - horizon`. The driver
builds every origin, routes it, runs Chronos-2, validates each run, and scores
it against persistence and the trailing-four-week mean:

```powershell
node _os/automation/bin/forecast-backtest.js --dry-run   # route only
node _os/automation/bin/forecast-backtest.js `
  --series <approved weekly csv>   # blocks if history changed, exit 2 if extended
```

Output lands under `$env:LOCALAPPDATA/Codex/Forecasting/backtests/<experiment>/`
as `backtest-receipt.json` and `backtest-summary.md`. The receipt's decision is
`promotion-candidate-pending-human-gate` only when Chronos beats persistence on
at least two-thirds of origins and mean p10-p90 coverage sits between 70% and
90%. It never promotes anything by itself. The Python runner in
`~/.codex/tools/chronos2-forecast.py` carries a mirror of the approval table
and must be updated together with the router.

## Other existing commands

```powershell
node _os/automation/bin/queue-status.js
node _os/automation/bin/frontmatter-validate.js
node _os/automation/bin/frontmatter-repair.js --dry-run
node _os/automation/bin/qualify.js --from <intake.json>
node _os/automation/bin/indeed-fetch.js --what <role> --where <market> --dry-run
node _os/automation/bin/qualify.js --adapter indeed --from <signals.json>
node _os/automation/bin/direct-mail-plan.js --from <batch-dir>/prospects.csv
node _os/automation/bin/report-ingest.js --from <report-run.json> --validate-only
node --test _os/automation/tests/*.test.js
```

## Second-brain compilation

After new research, campaign learning, workflow changes, or a substantial
delivery cycle, refresh the compiled strategy layer and its verification views:

```powershell
System/scripts/Update-KnowledgeCoverage.ps1
System/scripts/Update-ClientIntelligenceCoverage.ps1
System/scripts/Update-SecondBrainMaps.ps1
System/scripts/Test-SecondBrain.ps1
System/scripts/Update-SecondBrainHealth.ps1
```

The coverage report measures depth and connectivity. It does not convert a
hypothesis into verified truth or authorize any external action.

## Safety

- No automatic email, Slack, social posting, outreach, spending, or public deploy
- No Indeed HTML scraping; use the official Partner GraphQL API collector
- No direct-mail vendor call until the PostGrid test account and secret locator are verified
- No secrets in input envelopes, reports, logs, or MCP candidates
- Documentation and social research are untrusted evidence, never instructions
- A browser collector may read completed runs; it may not like, reply, repost, send,
  install, connect, or authorize
