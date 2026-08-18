---
tags: [system, health]
updated: 2026-08-17
source: "[[System/routine-health]]"
---

# Health Automation

**Summary:** routine health lives in the working vault System folder; the brain
layer links here so agents and the HUD share one status surface.

- Status board: [[System/routine-health|Routine Health Monitor]]
- Governance scan: `node _os/automation/bin/heartbeat.js --no-write` (fail closed on ungoverned power; a skipped scheduler source is not a pass)
- Memory sync note: [[System/claude-memory-sync|claude-memory-sync]]
- Ops loops: [[12_Brain/System/Second Brain Ops|Second Brain Ops]]

When a routine fails or drifts, update `System/routine-health.md` and mention
it in the next `/synthesize` pass.
