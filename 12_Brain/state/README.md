# State

Machine checkpoints and run records written by the `_os/automation/bin/*` CLIs.
This directory is operational telemetry, not canonical agency work state. The
Marketing Chief queue in `client-operations` remains authoritative for current
commitments, approvals, owners, and transitions.

## Checkpoint state

Loose JSON files at this level record the latest known result or cursor for an
automation. They are rebuildable from a new run, but deleting one may cause a
full rescan, duplicate processing, or loss of useful diagnostic context. Back
them up before repair and let the owning CLI recreate them.

Examples include frontmatter validation, communication ingestion, report
ingestion, site-health, qualification, and Grok-intelligence checkpoints.

## Run evidence

`workflow-runs/` contains dated maker/checker execution receipts. Treat these as
audit evidence: append new runs and retain prior receipts unless a documented
retention policy explicitly archives them.

## Authority and safety

- State files never outrank an exact source, current canonical note, or live
  provider readback.
- A successful checkpoint proves only what that run verified; it does not grant
  permission to send, publish, spend, deploy, change accounts, or mutate the
  canonical Marketing Chief queue.
- Do not store secrets, raw communications, direct identifiers, cookies, or
  one-time codes here.
- When state and evidence disagree, preserve both, mark the conflict, and rerun
  the narrow verification before compiling a durable conclusion.
