# Automation Debug Log

## Active Issues

• **2026-06-07** — `dillon-os-operator` run: Gmail MCP and Slack MCP unavailable (2nd consecutive run). Approaching ESCALATE threshold per Master Agent.
• **2026-06-07** — Bulk vault mtime refresh masks 7-day stall detection until organic client edits resume.
• **2026-06-07** — `10_Sessions/` still lacks Codex/Cursor session exports; open loops inferred from scaffolding only.
• **2026-06-06** — Gmail MCP and Slack MCP unavailable. Intel-gmail and intel-slack used vault fallback only (~52 days stale).

## Resolved Issues

• **2026-06-07** — Phase 2 Sunday lanes completed: BOK Law `Weekly Social 2026-06-08.md`, Align `LinkedIn Drafts 2026-06-08.md`.
• **2026-06-07** — Umbrella workflow merged to branch `cursor/competitive-task-consolidation-ce14`.
• **2026-06-06** — First full parallel Phase 1 run. Pulse, urgent-replies, memory-sync synthesized.
• **2026-05-27** — Seven fragmented crons documented as retired; umbrella spec shipped (`System/dillon-os-operator.md`).

## Error Patterns

• Cloud operator runs without connected Gmail/Slack produce stale urgent-replies until MCP wired.
• Two consecutive MCP-gap runs trigger ESCALATE — currently at 2 runs (2026-06-06, 2026-06-07).

## Notes

• Disable legacy automations after 3 consecutive green umbrella runs (see `System/routine-health.md`). Current: 2 partial green (MCP gap).
• Next Thursday (2026-06-12): Phase 2 runs `content-book-seo`.
• Human must approve Sunday drafts before client send.
