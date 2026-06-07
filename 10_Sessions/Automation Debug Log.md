# Automation Debug Log

## Active Issues

• **2026-06-06** — `dillon-os-operator` run: Gmail MCP and Slack MCP unavailable. Intel-gmail and intel-slack used vault fallback only (~52 days stale).
• **2026-06-06** — Bulk vault mtime refresh masks 7-day stall detection until organic client edits resume.
• **2026-06-06** — `10_Sessions/` still empty: Codex/Cursor session exports not landing in vault.
• **2026-05-27** — `System/claude-memory-sync.md` was 42 days stale; refreshed 2026-06-06 with carry-forward banner.

## Resolved Issues

• **2026-06-06** — First full parallel Phase 1 run on branch `cursor/competitive-task-consolidation-dc88`. Pulse, urgent-replies, memory-sync synthesized.
• **2026-05-27** — Seven fragmented crons documented as retired; umbrella spec shipped (`System/dillon-os-operator.md`).

## Error Patterns

• Cloud operator runs without connected Gmail/Slack produce stale urgent-replies until MCP wired.

## Notes

• Disable legacy automations after 3 consecutive green umbrella runs (see `System/routine-health.md`). Current: 1 partial green (MCP gap).
• Tomorrow (Sunday): Phase 2 runs `content-bok-law` + `content-align-linkedin` in parallel.
