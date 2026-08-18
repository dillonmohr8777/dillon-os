---
note_type: decision
status: active
owner: Dillon Mohr
created: 2026-08-18
updated: 2026-08-18
decided_at: 2026-08-18
review_on: 2026-09-18
supersedes: "[[12_Brain/04_Decisions/2026-08-18 - Local web stack and browser history grant]]"
source_refs:
  - "[[12_Brain/04_Decisions/2026-08-18 - Local web stack and browser history grant]]"
  - "[[12_Brain/04_Decisions/2026-08-18 - MCP catalogs stay directional]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - isolated Playwright MCP receipt]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - Claude Code MCP catalog verification]]"
tags:
  - decision
  - approval
  - cursor
  - playwright
  - claude-code
---

# Cursor Desktop full local runtime

**Decision:** Run the stack from **Cursor Desktop**. Full local access is granted: vault work, web ladder, isolated Playwright MCP screenshots, isolated Chrome 9223, `claude-code` / `claude-code-control` from Cursor user MCP, camofox clone, owned-history ingest. Agents must take screenshots when they claim to have seen a page. Do not keep asking for this grant.

**Why:** Dillon ordered full access approval and to run it from the Cursor app with screenshots. Cursor user MCP already has `claude-code` 2.1.233. Project MCP has `playwright-isolated`. Claude Code chats cannot see those Cursor-only tools.

**Granted (do not re-ask)**

- Everything in the 2026-08-18 local-stack grant
- Cursor Desktop as the runtime
- `claude-code` MCP: `claude_status`, `claude_list_sessions`, `claude_prompt` on **new** sessions
- Playwright isolated MCP: `browser_navigate`, `browser_snapshot`, `browser_take_screenshot` (never `--extension`)
- `node _os/automation/bin/browser-access.js screenshot` as the CLI fallback
- Saving screenshot files under `12_Brain/private/screenshots/` (gitignored)

**Still gated**

- send, post, publish, schedule, deploy, merge, spend, purchase
- account change, credential read/rotate/delete
- form submit, accept terms, cookie import
- `attach_live=true` on an already-running TUI (`codex-ef`, `codex-c1`, live Claude)
- port 9222 and Dillon's default Chrome profile

**How to screenshot in Cursor Desktop**

1. Prefer project MCP `playwright-isolated`: navigate, then `browser_take_screenshot`.
2. Else `node _os/automation/bin/browser-access.js start-playwright` and `screenshot <url> --out 12_Brain/private/screenshots/<name>.png`.
3. If a Playwright tool errors with Extension connection timeout, that is the wrong server. Switch to `playwright-isolated` or `browser-access.js`.
