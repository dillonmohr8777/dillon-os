---
note_type: capture
status: active
created: 2026-08-18
captured: 2026-08-18
source_refs:
  - "[[12_Brain/11_Craft/earned-lessons]]"
  - "[[12_Brain/03_Concepts/Live Process Ownership]]"
tags:
  - capture
  - mcp
  - claude-code
  - cursor
---

# Claude Code MCP catalog verification

**Summary:** Claude Code live-checked Cursor user MCP on 2026-08-18: `claude-code` and `claude-code-control` are in `C:\Users\dillo\.cursor\mcp.json` (binary 2.1.233, no credentials). They are not in Claude Code's `.claude.json`. `attach_live=false` is the correct default. Operator-reported pong evidence: session `80b6465b`.

This capture is the forwarded Claude Code verification. This Cursor agent did not re-read the Windows user MCP files and did not re-run pong.

Verified by Claude Code against live files:

- Cursor user MCP (`C:\Users\dillo\.cursor\mcp.json`): 10 servers; `claude-code` and `claude-code-control` present; same file also loads `hermes-local-control`.
- `claude-code` → `claude.exe mcp serve`; binary **2.1.233**.
- `claude-code-control` stdio bridge: `hermes-control/scripts/claude-code-control/server.py` plus venv exist.
- Bridge env names only: `PYTHONUTF8`, `CLAUDE_CODE_EXE`, `CLAUDE_CODE_DEFAULT_CWD`. No port, no credentials in that env.
- Claude Code's own catalog (`C:\Users\dillo\.claude.json`): `composio, marketing-chief-files, private-memory, omniroute, agent-memory`. Does **not** include `claude-code` or `claude-code-control`.
- Shared across both user catalogs: `omniroute`, `marketing-chief-files`, `private-memory`, `agent-memory`.
- `attach_live=false` default: `codex-ef` (pid 8452) and `codex-c1` (pid 38824) stay unattached. Attaching would race the TUI for the same session ID.
- Operator-reported pong verification id: `80b6465b`.

Scope correction vs this branch: vault **project** MCP (`.cursor/mcp.json` / `.mcp.json` in `dillon-os`) is not "landingfolio only" on `cursor/web-stack-architecture-0ff8`. That pair registers `landingfolio` and `playwright-isolated`. User-level Cursor MCP is a different file. `claude-code` must not be copied into the vault project files.
