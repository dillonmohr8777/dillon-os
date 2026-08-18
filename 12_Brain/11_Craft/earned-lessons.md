---
note_type: review
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - Firecrawl web capability receipt]]"
  - System/scripts/Build-ClaudeAgents.py
tags:
  - craft
  - lessons
---

# Earned lessons

Append-only log. Dated operating briefs are regenerated; this file is not.
Promote a lesson into `12_Brain/03_Concepts/` and `STANDING_LESSONS` only after it appears twice with evidence.

## 2026-08-18

- **Generated-file drift.** Hand-editing `.claude/agents/paid-media-analyst.md` was reverted by `Build-ClaudeAgents.py`. Fix the generator. Evidence: generator docstring and the regenerated agent files. Promoted: [[12_Brain/03_Concepts/Generated File Drift]].
- **Installed is not live.** Cursor Playwright MCP with `--extension` timed out on the MCP Bridge. The isolated sidecar on `:8931/mcp` navigated example.com. Isolated Chrome on 9223 remains the dump-dom fallback. Evidence: [[12_Brain/01_Captures/research/2026-08-18 - isolated Playwright MCP receipt]].
- **Do not append lessons to a generated brief.** `agent-craft-brief.js --write` overwrites the dated brief. This file is the compounding log.
