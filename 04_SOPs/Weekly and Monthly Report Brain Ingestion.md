---
note_type: sop
status: active
created: 2026-08-03
updated: 2026-08-03
owner: Dillon Mohr
verification_status: verified
source_refs:
  - "[[12_Brain/03_Concepts/Client Reporting and Outcome Scoreboards]]"
  - "_os/automation/workflows/report-brain-ingest.json"
  - "_os/automation/bin/report-ingest.js"
tags:
  - brain
  - sop
  - reporting
  - automation
---

# Weekly and Monthly Report Brain Ingestion

Every finalized weekly and monthly report must be archived in the `dillon-os`
Obsidian brain before the reporting workflow is closed.

## Required route

1. Keep the canonical report package and source evidence in its exact client or
   Align HCM project.
2. Select only the finalized client-facing PDF, HTML, or Markdown artifact.
3. Create a manifest matching `12_Brain/schemas/report-run.json`.
4. Validate without writing:

   ```powershell
   node _os/automation/bin/report-ingest.js --from <report-run.json> --validate-only
   ```

5. Ingest the verified manifest:

   ```powershell
   node _os/automation/bin/report-ingest.js --from <report-run.json>
   ```

6. Refresh the maps and run `System/scripts/Test-SecondBrain.ps1`.

## What the ingester writes

- An immutable artifact copy under `12_Brain/01_Captures/Reports/`.
- A connected report review under `12_Brain/07_Reviews/Reports/`.
- An idempotency and provenance record under
  `12_Brain/state/report-brain-ingest.json`.
- A redacted run row under `12_Brain/queue/`.

## Boundaries

- One report maps to one exact client or Align HCM route.
- Replenish and Fresh Blends remain separate.
- Raw exports, credentials, direct-message archives, and unnecessary PII do not
  belong in the report archive.
- Archiving never means a report was emailed, posted, published, or approved.
- If conversion reporting is not defensible, preserve the phrase
  `Conversion reporting is pending validation` in the client artifact.
