---
note_type: decision
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
decision: "Single owner for the daily communications brain: the Codex scheduled automation on the Windows box. The Dillon OS workflow JSON definition and the daily-morning-orchestrator-dry-board orchestrator are deprecated as owners."
verification_status: verified
review_on: 2026-10-01
source_refs:
  - "[[_os/automation/workflows/daily-communications-brain.json]]"
  - "[[11_Agents/Rockbot Operating System/workflow-estate/codex-automations/daily-communications-brain/memory]]"
  - "[[11_Agents/Rockbot Operating System/workflow-estate/codex-automations/daily-morning-orchestrator-dry-board/memory]]"
  - "[[12_Brain/registry/automations.json]]"
  - "[[12_Brain/04_Decisions/2026-08-15 - Use Slack as intake and Codex as execution]]"
tags:
  - decision
  - automation
  - registry
  - codex
  - daily-communications-brain
---

# Daily comms single owner

## Decision

The daily communications brain had three definitions doing the same job: the
Dillon OS workflow JSON (`_os/automation/workflows/daily-communications-brain.json`),
the Codex scheduled automation on the Windows box, and the
`daily-morning-orchestrator-dry-board` morning orchestrator. Only the Codex
automation has a real, dated run history (checkpoints, connector status,
captures through 2026-08-12); the dry board's last recorded run was
2026-07-14, and the workflow JSON was never itself a scheduler.

**Owner:** the Codex scheduled automation
(`C:\Users\dillo\.codex\automations\daily-communications-brain`), matching the
2026-08-15 decision that Codex is the execution owner.

**Deprecated as owners:** `daily-communications-brain-workflow-def` (the
workflow JSON) and `daily-morning-orchestrator-dry-board`, both now marked
`status: deprecated`, `superseded_by: daily-communications-brain` in
`12_Brain/registry/automations.json`.

**Not deleted:** both files remain on disk as reference/inputs — the workflow
JSON documents the step contract, the dry-board memory stays as history.

**Re-verify:** read the latest dated entry in
`11_Agents/Rockbot Operating System/workflow-estate/codex-automations/daily-communications-brain/memory.md`
for the last-run timestamp and connector status.
