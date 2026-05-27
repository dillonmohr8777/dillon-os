# Automation Debug Log

## Active Issues

• **2026-05-27** — `dillon-os-operator` first consolidated run: Gmail MCP and Slack MCP unavailable in cloud agent. Intel lanes skipped; pulse uses vault carry-forward only.
• **2026-05-27** — `System/claude-memory-sync.md` last_sync 2026-04-15 (42 days). Needs full refresh when Gmail connected.
• **2026-05-27** — `10_Sessions/` empty: Session Index, Facebook Ads Build Log, API notes never populated. Codex session exports not landing in vault.

## Resolved Issues

• **2026-05-27** — Seven fragmented crons documented as retired; umbrella spec shipped (`System/dillon-os-operator.md`).

## Error Patterns

• Cloud operator runs without connected Gmail/Slack produce stale urgent-replies until MCP wired.

## Notes

• Disable legacy automations after 3 consecutive green umbrella runs (see `System/routine-health.md`).

