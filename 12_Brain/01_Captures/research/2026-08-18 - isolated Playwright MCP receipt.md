---
note_type: capture
status: active
created: 2026-08-18
captured: 2026-08-18
source_refs:
  - "[[12_Brain/09_Ops/Web Escalation Architecture]]"
  - https://github.com/microsoft/playwright-mcp
  - System/browser-access.policy.json
tags:
  - capture
  - research
  - playwright
  - mcp
---

# Isolated Playwright MCP receipt

**Summary:** Cursor's Playwright MCP with `--extension` timed out. A separate isolated sidecar on `http://localhost:8931/mcp` navigated example.com and returned title Example Domain.

- Cursor cloud server: `npx @playwright/mcp@0.0.69 --extension`. Error: Extension connection timeout (Playwright MCP Bridge). Not used.
- Isolated sidecar: `npx @playwright/mcp@0.0.69 --headless --isolated --no-sandbox --port 8931`. Listening on localhost:8931.
- `tools/call browser_navigate` https://example.com → Page Title: Example Domain.
- Never port 9222. Never Dillon's default Chrome profile. Form submit still gated.

Start: `node _os/automation/bin/browser-access.js start-playwright`
