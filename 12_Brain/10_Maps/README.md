---
note_type: map-index
status: active
created: 2026-07-29
updated: 2026-07-29
tags:
  - brain
  - maps
  - operations
---

# Map Maintenance

[[00_Atlas|Dillon OS Knowledge Atlas]] is the connective layer for the vault.
It links stable domain maps, client clusters, operating front doors, and every
visible Markdown note without rewriting canonical source files.

## Refresh

Run this after adding, moving, or renaming notes:

```powershell
System/scripts/Update-SecondBrainMaps.ps1
System/scripts/Test-SecondBrain.ps1
System/scripts/Update-SecondBrainHealth.ps1
```

Files under `Generated/` are deterministic outputs. Edit the source note or
the generator instead of hand-editing a generated map.

## Graph contract

- The full visible vault should form one connected component.
- Every source note should have at least one resolved connection.
- New captures may be briefly unconnected while they are being processed, but
  the health check warns until the maps are refreshed.
- Maps provide navigation and context; they do not replace canonical client,
  project, decision, or memory notes.

