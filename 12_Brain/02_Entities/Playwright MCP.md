---
note_type: entity
status: active
created: 2026-08-18
updated: 2026-08-18
expires: 2026-11-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - isolated Playwright MCP receipt]]"
  - "[[12_Brain/09_Ops/Web Escalation Architecture]]"
  - https://github.com/microsoft/playwright-mcp
tags:
  - entity
  - tool
  - playwright
  - mcp
---

# Playwright MCP

**Summary:** Isolated `@playwright/mcp` sidecar is the local JS-interact engine; Cursor `--extension` Playwright is a different, currently dead server.

- Live path: `node _os/automation/bin/browser-access.js start-playwright` → `http://localhost:8931/mcp`. Flags: `--headless --isolated`. Never `--extension`.
- Cursor project registration: `playwright-isolated` in `.cursor/mcp.json` / `.mcp.json`.
- Dead path: Cursor cloud `Playwright` with `--extension` (MCP Bridge timeout on 2026-08-18).
- Does not replace Firecrawl, camofox, isolated Chrome 9223, or Claude in Chrome.
- Form submit, credentials, and cookie import stay gated.

## Links

- [[12_Brain/02_Entities/Camofox Browser|Camofox Browser]] · [[12_Brain/03_Concepts/Web Escalation Ladder|Web Escalation Ladder]]
