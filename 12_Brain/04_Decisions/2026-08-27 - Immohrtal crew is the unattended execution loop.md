---
note_type: decision
status: active
created: 2026-08-27
updated: 2026-08-27
source_refs:
  - System/scripts/Invoke-ImmohrtalCrew.ps1
  - System/scripts/Register-ImmohrtalCrewTask.ps1
  - 12_Brain/state/immohrtal-crew/latest.json
  - AGENTS.md
tags:
  - immohrtal
  - autonomy
  - marketing-chief
---

# Immohrtal crew is the unattended execution loop

The seven Immohrtal agents now have a durable local dispatcher and a Cursor private-worker wake.

- Local: Windows task `Immohrtal-Crew` every 2 hours through the hidden VBS host. It ranks, QAs preview LPs, probes connector health and the live agency site, and writes receipts. `mail_ready=hold`.
- Cursor: this private-worker conversation wakes on the same cadence to do MCP work (ordinary Gmail, Ads after live readback), commit feature-branch receipts, and update the draft PR.
- `IMMOHRTAL Agency Daily` stays Disabled until the source audit clears. Do not re-enable it from this loop.
- Codex remains the only writer of `client-operations/queue/work-items.json`.

This does not authorize send, publish, production deploy, merge to main, force-push, spend, or account changes.
