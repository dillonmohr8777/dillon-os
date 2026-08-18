---
note_type: concept
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - isolated Chrome browser access receipt]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - Claude Code MCP catalog verification]]"
  - "[[12_Brain/11_Craft/earned-lessons]]"
tags:
  - concept
  - agents
  - mcp
  - safety
---

# Live Process Ownership

**Summary:** a long-running interactive process owns its state; a second writer does not share it politely.

Proven twice on 2026-08-18:

1. Isolated Chrome must use port **9223** and a dedicated profile. Attaching to **9222** / Dillon's default Chrome is refused because that profile is already owned.
2. `claude-code-control` keeps `attach_live=false`. Attaching `codex-ef` / `codex-c1` would race the TUI for the same session ID. Operator pong evidence: `80b6465b`.

## Rule

If a process already has a session, profile, or TUI, do not open a second writer on it. Probe, spawn an isolated sibling, or wait. A raced write looks like corruption rather than a conflict.

## Links

- [[12_Brain/03_Concepts/MCP Catalog Direction|MCP Catalog Direction]]
- [[12_Brain/03_Concepts/Web Escalation Ladder|Web Escalation Ladder]]
- [[12_Brain/04_Decisions/2026-08-18 - MCP catalogs stay directional|MCP catalogs stay directional]]
