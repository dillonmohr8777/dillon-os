# Automation Debug Log

## Active Issues

• **2026-05-29** — Gmail MCP unavailable on cloud orchestrator run. Brief used vault fallback (last sync 2026-04-15).
• **2026-05-29** — Slack MCP unavailable on cloud orchestrator run.
• **2026-05-29** — Vault client files: 0 mtime updates in 7 days. Priority stack may not reflect live state.

## Resolved Issues

• **2026-05-29** — Consolidated 7 legacy crons into single `competitive-task-orchestrator` umbrella workflow.

## Error Patterns

• Cloud automation runs without Gmail/Slack connectors → STALE brief banner. Fix: connect MCPs or run orchestrator locally.

## Notes

• Subagent defs: `.cursor/agents/`
• Orchestrator prompt: `System/competitive-task-orchestrator-prompt.md`

