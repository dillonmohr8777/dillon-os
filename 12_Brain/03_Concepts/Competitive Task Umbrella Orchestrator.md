---
note_type: concept
status: active
created: 2026-08-29
updated: 2026-08-29
source_refs:
  - System/competitive-task-definition.md
  - 12_Brain/07_Reviews/2026-08-15 - 120-Day Slack Operating System Audit.md
  - GROK-HANDOFF-DILLON-OS.md
tags: [concept, automation, operating]
---

# Competitive Task Umbrella Orchestrator

One scheduled automation replaces seven legacy Cursor crons and folds overlapping Codex/Rockbot intel tasks into a single daily operator cycle with parallel Phase 1 agents and one Phase 2 consolidator.

## What competitive task means

Operator throughput across ~25 accounts plus Align HCM and Mohr Media — not competitor research. Success is one afternoon brief (`Daily-Briefs/competitive-task-today.md`) with a P0 stack, urgent replies, and stalled-client hygiene.

## Architecture

| Phase | Mode | Agents |
| --- | --- | --- |
| 1 | Parallel | gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines (day-gated) |
| 2 | Sequential | memory-consolidator |

Registry: `.cursor/agents/` · Prompt: `System/competitive-task-orchestrator-prompt.md` · SOP: `04_SOPs/competitive-task-orchestrator.md`.

## P0 tie-break

Launch blocked → billing risk → ad disapprovals → hard calendar.

## Related

- [[12_Brain/03_Concepts/Agent Governance and Verification]]
- [[12_Brain/04_Decisions/2026-08-15 - Use Slack as intake and Codex as execution]]
