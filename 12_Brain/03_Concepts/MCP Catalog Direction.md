---
note_type: concept
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - Claude Code MCP catalog verification]]"
  - "[[12_Brain/04_Decisions/2026-08-18 - MCP catalogs stay directional]]"
  - AGENTS.md
tags:
  - concept
  - mcp
  - agents
---

# MCP Catalog Direction

**Summary:** three MCP files, three runtimes; restarting one does not load another.

| File | Runtime that reads it | What belongs there |
|---|---|---|
| Vault `.cursor/mcp.json` and `.mcp.json` | Cursor/Claude Code **project** scope | Repo-safe servers only (`landingfolio`, `playwright-isolated`). No machine-local control bridges. |
| `C:\Users\dillo\.cursor\mcp.json` | **Cursor Desktop** user scope | Cursor-side tools, including `claude-code` and `claude-code-control`. |
| `C:\Users\dillo\.claude.json` | **Claude Code** user scope | Claude-side tools (`composio`, `agent-memory`, …). Not the Claude-control servers. |

Overlap is not identity. Some servers are registered in both user catalogs. That does not mean every Cursor user server is visible to Claude Code.

## Rule

Name the file and the runtime before telling anyone to restart. If the chat cannot see a tool, check which catalog it actually reads.

## Links

- [[12_Brain/03_Concepts/Live Process Ownership|Live Process Ownership]]
- [[12_Brain/04_Decisions/2026-08-18 - MCP catalogs stay directional|MCP catalogs stay directional]]
- [[12_Brain/02_Entities/Playwright MCP|Playwright MCP]]
