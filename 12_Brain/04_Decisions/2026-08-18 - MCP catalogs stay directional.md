---
note_type: decision
status: active
owner: Dillon Mohr
created: 2026-08-18
updated: 2026-08-18
decided_at: 2026-08-18
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - Claude Code MCP catalog verification]]"
  - "[[12_Brain/03_Concepts/MCP Catalog Direction]]"
tags:
  - decision
  - mcp
  - cursor
  - claude-code
---

# MCP catalogs stay directional

**Decision:** `claude-code` and `claude-code-control` live in Cursor's **user** MCP (`C:\Users\dillo\.cursor\mcp.json`). They do **not** go in Claude Code's `.claude.json`, and they do **not** go in this vault's project `.cursor/mcp.json` / `.mcp.json`.

**Why:** Restarting a runtime only reloads that runtime's catalog. Putting control tools in `.claude.json` would let Claude Code attach to its own sessions. Putting them in the vault project files would publish a machine-local bridge into Git. Claude Code live-checked the split on 2026-08-18.

**Do**

- Run from **Cursor Desktop**. That is the runtime that can see `claude-code` and take Playwright screenshots in the same chat.
- Restart Cursor Desktop once after MCP changes.
- Keep `attach_live=false`. Do not attach to a live Codex/Claude TUI session.
- Take a screenshot when you claim to have seen a page (`playwright-isolated`).

**Do not**

- Add those servers to `.claude.json` "so this Claude Code chat can see them."
- Copy them into the vault project MCP files.
- Infer a catalog from overlap. Four servers are shared across user catalogs; these two are not.

**Still gated:** sending from those tools, attaching live sessions, credential changes.
