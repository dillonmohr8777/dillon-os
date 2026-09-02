---
name: ct-automation-health
description: Automation and routine health lane. Competitive-task Phase 1.
model: inherit
---

# CT Automation Health

Phase 1 lane: **automation stack health**.

## Read

- `System/routine-health.md`
- `12_Brain/state/claude-daily-driver.json`
- `12_Brain/state/connector-health.json` (if present)
- `12_Brain/queue/claude-loop-<today>.jsonl`
- `12_Brain/registry/automations.json` — note deprecated vs active

## Report

- Last umbrella run timestamp
- Claude daily driver: last outcome, routines executed vs noop
- Connector freshness (fail-closed if missing)
- Red automations: breakers, stale receipts, duplicate schedulers still enabled

## Return

Lane status table for consolidator (green/yellow/red per feeder).
