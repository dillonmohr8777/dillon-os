# IMMOHRTAL office daily report runbook

## Status

- Runner: built and locally runnable.
- Input contract: configured and tested.
- Background runtime: not verified running.
- Schedule: manifest only, not installed or changed by this workflow.
- External actions: unavailable.

This runbook covers the five-seat internal office report. It is separate from
the prospect-preparation orchestrator and its Scout, Atlas, Forge, Relay, and
Proof service crew.

## Inputs

Each invocation reads and hashes:

1. `11_Agents/IMMOHRTAL Business Crew/CREW.json`
2. `11_Agents/IMMOHRTAL Business Crew/DAY-1-COMMAND-BOARD.md`
3. `automation/immohrtal-agency/ops/DAY-1-SCORECARD.json`
4. The latest usable `automation/immohrtal-agency/runs/*/run-receipt.json`,
   when one exists, or an explicitly supplied receipt

It does not read raw email, Slack, Drive rows, contact rows, secrets, browser
sessions, credentials, calendars, CRM records, or advertising accounts.

## Manual dry run

From the repository root:

```powershell
& .\automation\immohrtal-agency\ops\Run-ImmohrtalOfficeDaily.ps1 -DryRun -Mode both
```

Deterministic evidence run:

```powershell
& .\automation\immohrtal-agency\ops\Run-ImmohrtalOfficeDaily.ps1 `
  -DryRun `
  -Mode both `
  -AsOf 2026-08-25T20:00:00.000Z `
  -RunId 20260825-160000-office
```

Use `-Mode standup` for the morning surface or `-Mode eod` for closeout. Both
modes still report the complete safety and runtime truth.

The Node entrypoint is also callable directly:

```powershell
node .\automation\immohrtal-agency\ops\run-office-report.mjs `
  --dry-run `
  --mode both
```

The explicit dry-run marker is mandatory. No live or external mode exists.

## Output and readback

The default output is:

```text
automation/immohrtal-agency/ops/receipts/<YYYY-MM-DD>/<run-id>/
├── run-receipt.json
├── office-report.json
├── office-report.md
└── office-dashboard.html
```

Read back `run-receipt.json` and verify:

1. `status` is `complete`.
2. `dry_run` is `true`.
3. `office_lifecycle.current_invocation_state` is
   `COMPLETED_LOCAL_DRY_RUN`.
4. `office_lifecycle.background_runtime_state` is
   `NOT_VERIFIED_RUNNING` unless a different current external receipt is added
   under separate authority in a future version.
5. All five roster entries have `online_claim: false` and
   `runtime_state: NOT_OBSERVED` when no employee process receipt was supplied.
6. Every external-action count is zero.
7. Source and artifact hashes are present and 64 hexadecimal characters.
8. The HTML dashboard has `noindex,nofollow,noarchive,nosnippet` and shows the
   exact board assignments, due times, blockers, and latest agency receipt.

A `complete` receipt proves only that this local report run completed and its
artifacts were written and hashed.

## Idempotency and collisions

The same run ID can be reused only when its input fingerprint matches. A run ID
collision with different sources, timestamp, or report mode fails closed. A
directory without a valid receipt also fails closed instead of being silently
overwritten.

## Proposed daily cadence

`office-daily.manifest.json` proposes:

- Weekdays at 08:30 ET: `standup`
- Weekdays at 17:00 ET: `eod`

This is documentation, not task registration. Installation was not authorized
or performed in this lane. A future approved Windows registration must use
`C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs` and the hidden-task
manifest. Direct scheduled PowerShell actions are prohibited.

Before claiming a schedule is running, verify the exact task, triggers, hidden
launcher mapping, last run result, dated child receipt, and zero external
actions. Configuration presence is not runtime evidence.

## Failure and escalation

| Failure | Result | Safe next action |
|---|---|---|
| Missing or malformed crew, board, or scorecard | Nonzero exit; no complete receipt | Repair the named local source and rerun tests |
| Board item missing one of 13 required fields | Nonzero exit | Original owner restores the exact handoff field |
| Unknown role, checker, or state | Nonzero exit | Reconcile against `CREW.json`; do not guess |
| External authority enabled in the scorecard | Nonzero exit | Restore the internal-only contract and audit the change |
| Latest agency receipt missing | Report continues with evidence state `unknown` | Inspect agency runs; do not infer online or idle state |
| Agency receipt records a nonzero external action | Office state becomes scope-reconciliation blocked | Stop and verify the exact approval and action receipt |
| Output run ID collision | Nonzero exit | Inspect the existing receipt and choose a new run ID only for a new invocation |
| Same runtime cause fails three times | Circuit breaker | Record root cause and require human review before retry |

No failure permits sending, posting, booking, publishing, deployment, spend,
purchase, hiring, contracting, provider-side draft creation, CRM mutation,
account changes, credential access, or schedule installation.

## Verification commands

```powershell
node --test `
  .\automation\immohrtal-agency\test\agency.test.mjs `
  .\automation\immohrtal-agency\test\ops-office-report.test.mjs
```

```powershell
node --check .\automation\immohrtal-agency\ops\lib\office-report.mjs
node --check .\automation\immohrtal-agency\ops\run-office-report.mjs
```
