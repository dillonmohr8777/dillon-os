---
note_type: concept
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/11_Craft/00_Index]]"
  - System/scripts/Build-ClaudeAgents.py
  - System/scripts/Build-ClaudeOperatingTeam.py
  - "[[12_Brain/11_Craft/earned-lessons]]"
tags:
  - concept
  - agents
  - generators
---

# Generated File Drift

**Summary:** hand-editing generated output is silently reverted; fix the generator, then prove it reproduces the committed files.

Proven twice on 2026-08-18: `claude-operating-team.json` and `.claude/agents/paid-media-analyst.md`. The standing craft lesson is now this concept. The same trap applies to dated craft briefs — they are regenerated, so earned lessons live in `earned-lessons.md`.

## Rule

1. Edit the generator.
2. Run it.
3. Confirm `git diff` on the generated files is the intended change, then empty on a second run.

## Links

- [[12_Brain/11_Craft/00_Index|Agent Craft]]
- [[12_Brain/03_Concepts/Web Escalation Ladder|Web Escalation Ladder]]
