---
note_type: review
status: active
created: 2026-09-10
updated: 2026-09-10
owner: Dillon Mohr
priority: high
verification_status: verified
observed_at: 2026-09-10
next_action: Monitor the desktop Antigravity Gemini seat from Cursor with Grok; leave Workspace and Cloud MCP off
tags: [review, antigravity, gemini, orchestrator]
source_refs:
  - "[[12_Brain/06_Research/2026-09-10 - Antigravity extra Google access]]"
  - "[[System/daily-orchestrator]]"
---

# Antigravity Gemini 3.8 Flash wiring

Pickup after Dillon said Gemini 3.8 Flash was already running and that
Antigravity probably had one more Google access. Parallel research confirmed
the extra path is plan quota, not another marketing API.

## Verified

- Antigravity desktop live, Gemini 3.8 Flash (High).
- Gemini CLI 0.52.0 live.
- Ads probe remains the Ads source. Composio stays dead.
- Empty Antigravity MCP config is the correct default.

## Configured this pass

Headless Gemini CLI wrappers were staged, then parked. Dillon's correction:
do not use Gemini 3.8 inside Cursor. The live 3.8 Flash seat is the desktop
Antigravity window. SettingsGuard still holds `mcp.json`. Leave
`gemini-cli-control` uninstalled until that seat is the one being talked to.

## Still on Dillon

- GTM consent for project `150963436905`
- Whether to enroll official Workspace MCP
- Whether to connect a Google provider in OmniRoute
- The PSU
