# IMMOHRTAL Agency

A dependency-free, local-first daily operating layer for website optimization, AEO, GEO, and practical business-agent outreach.

## Run it safely

From the repository root:

```powershell
& .\automation\immohrtal-agency\Run-ImmohrtalAgencyDaily.ps1 -DryRun -RunId 20260824-120000 -AsOf 2026-08-24T12:00:00.000Z
```

Or call the Node layer directly:

```powershell
node .\automation\immohrtal-agency\src\cli.mjs --input .\automation\immohrtal-agency\fixtures\prospects.json --suppression .\automation\immohrtal-agency\fixtures\suppressions.json --run-id 20260824-120000 --as-of 2026-08-24T12:00:00.000Z --output .\automation\immohrtal-agency\.tmp\smoke --state .\automation\immohrtal-agency\.tmp\smoke-state
```

Tests:

```powershell
node --test .\automation\immohrtal-agency\test\agency.test.mjs
```

One-prospect optional model smoke:

```powershell
& .\automation\immohrtal-agency\Run-ImmohrtalAgencyDaily.ps1 -DryRun -UseModel -InputPath .\automation\immohrtal-agency\fixtures\model-smoke.json -RunId 20260824-180000 -AsOf 2026-08-24T18:00:00.000Z
```

The default remains deterministic. `-UseModel` runs Codex ephemerally in a read-only sandbox with a strict output schema and then sends the result through deterministic Proof. It still creates drafts only.

## Local input schema

JSON uses `{ "source": {...}, "prospects": [...] }`. CSV uses the fixture header. Required prospect fields are `prospect_id`, `company_name`, `website`, `market`, and `category`. Governance fields are `allowed_channels`, `opt_out`, `do_not_contact`, and `suppression_reason`. `observations` are source assertions, not verified facts.

The verified Drive allowlist, HOLD, and DO NOT PITCH sheet IDs live in `config/source-metadata.json`. Connector snapshots are written to the gitignored `.runtime/raw` directory, converted by `src/snapshot-cli.mjs`, and rejected after 14 days without a refresh.

## Current limitations

- Scout live-checks the referenced concept URL and records HTTP, title, H1, content hash, and capture time. It does not claim analytics or rankings.
- The local cross-run index stores normalized prospect keys, but it has no CRM reconciliation or externally verified contact history.
- No partial prospect checkpoint resume. Matching completed receipts are idempotent.
- Google Drive intake is snapshot-based because local scheduled code cannot reuse the in-app connector token. Stale snapshots fail closed.
- Gmail output is a fingerprinted draft manifest. A connected Codex operator can create drafts from it, but the local scheduler cannot send.
- No HubSpot, publishing, ads, spend, or credential adapter exists.
- The weekday 8:10 AM task is installed through the console-free launcher.

## Adapter path

1. Refresh the three Drive snapshots through the connected Codex Drive tool when the freshness gate approaches 14 days.
2. Review fingerprinted Gmail-ready packages and create Gmail drafts only after exact routing and body verification.
3. Keep sending as a separate, one-time, human-approved command. It never belongs in the daily orchestrator.
