---
tags: [system, cursor, takeover]
last_updated: 2026-07-12
verified_by: codex-roster-reconciliation
---

# Cursor Takeover Report

Cursor correctly identified `C:\Users\dillo\repos\dillon-os` as the operational vault, but its client conclusions were based on April notes and modified timestamps. Those conclusions are superseded by the 2026-07-12 roster reconciliation.

## Corrected client truth

- 14 active client or product lanes are listed in `01_Clients/Client Index.md`.
- Align HCM is active full-time work and is excluded from the client count.
- NKCDC and Fresh Blends are paused and excluded from the active roster.
- Replenish is a separate active brand lane.
- Historical rates are not current revenue evidence; `System/revenue-scorecard.md` now requires invoice or contract verification.

## Cursor loop posture

1. Read the active index before client work.
2. Do not stamp `last_touched` merely because an audit opened a file.
3. Require evidence inside the rolling 21-day window before adding a client to the active roster.
4. Never resurrect deleted April-only tasks from historical notes without current Slack, Gmail, Ads, project, delivery, invoice, or contract evidence.
5. Keep all external delivery and account mutations approval-gated.

## Infrastructure findings retained

- The vault remains the single source of truth.
- Gateway, connector, and repository health remain separate operating lanes.
- Current connector authentication gaps should be handled only when live reads are required.
