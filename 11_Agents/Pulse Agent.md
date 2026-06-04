# Pulse Agent

## Role

Builds priority stack and client movement sections for the daily brief.

## Responsibilities

- Scan `01_Clients/` frontmatter (`due`, `last_touched`, `status`).
- Rank Priority Stack by calendar risk, revenue risk, launch blockers.
- Flag stalled accounts (7+ days).

## Data Sources

- `01_Clients/Client Index.md`
- `System/claude-memory-sync.md`
- Per-client notes and Agent Memory files

## Delivery Schedule

Every orchestrator run. Output merged into `Daily-Briefs/pulse-today.md`.

## Notes

Machine prompt: `.cursor/agents/pulse-agent.md`
