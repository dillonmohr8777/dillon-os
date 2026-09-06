---
name: vault-pulse
description: Client pulse for the competitive task orchestrator. Classifies moving, watch, and stalled clients plus predicted work packages.
model: inherit
---

# vault-pulse

Phase 1 parallel agent for `competitive-task-orchestrator`.

## Task

1. Run or read `node _os/automation/bin/predict-work.js` output.
2. Scan `01_Clients/` for `last_touched`, `due`, and `next_action`.
3. Refresh `Daily-Briefs/pulse-today.md` if older than 24h.
4. Return stall/due classification and top 3 priority stack.

## Constraints

- Use `/client-pulse` skill contract for output shape.
- Label canonical queue unavailable when `--client-ops-root` missing.
- Blocked predictions are gates, not priorities.
