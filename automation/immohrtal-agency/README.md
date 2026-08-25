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

The personal Drive sheet ID is recorded only in `config/source-metadata.json` as `discovery_only_pending_requalification`. No personal rows are embedded here.

## Current limitations

- No live discovery, crawling, screenshotting, ranking research, email verification, or analytics access.
- The local cross-run index stores normalized prospect keys, but it has no CRM reconciliation or externally verified contact history.
- No partial prospect checkpoint resume. Matching completed receipts are idempotent.
- No Gmail, Google Drive, HubSpot, publishing, ads, spend, or credential adapter.
- Draft copy is generic and must be verified against the current website before approval.
- The scheduler is not installed.

## Adapter path

1. Add a read-only Google Drive adapter that selects only rows explicitly marked for IMMOHRTAL, strips unrelated columns, and writes the local schema with source timestamps and row hashes.
2. Add live website evidence collection as a separate Scout input with URL, captured-at time, status, and content hash.
3. Add a persistent local dedupe and suppression index with append-only receipts.
4. Add a Gmail **draft creator**, not sender, bound to an exact approved fingerprint and verified personal account. Read back the Gmail draft and routing.
5. Design sending only as a separate, one-time, human-approved command. Do not place it in the daily orchestrator.
