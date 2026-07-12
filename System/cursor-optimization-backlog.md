---
tags: [system, cursor, backlog]
last_updated: 2026-07-12T19:35:00Z
ranking: business_value DESC, risk_reduction DESC, effort ASC, reversibility DESC
---

# Cursor Optimization Backlog

> Ranked for autonomous local execution. **Status:** `ready` = safe without approval; `blocked` = needs approval or auth; `done` = completed this loop.

## Scoring Key

| Rank | ID | Task | Biz Value | Risk ↓ | Effort | Reversible | Status |
|------|-----|------|-----------|--------|--------|------------|--------|
| 1 | G1 | Populate guardrail agents from verified client rules | High | High | S | Yes | **done** |
| 2 | G2 | Local gateway health refresh script + snapshot | Med | High | S | Yes | **done** |
| 3 | G3 | Refresh stale `last_touched` on M360 overviews from vault evidence | Med | Med | M | Yes | **done** |
| 4 | G4 | Wire Company OS file index in `operating-status.md` (cursor loop links) | Med | Low | S | Yes | **done** |
| 5 | G5 | Hermes cron job definitions for dillon-daily-brief / gateway-health / approval-queue | High | Med | M | Yes | blocked — verify Hermes cron API locally |
| 6 | B1 | Fix book `/api/dossier-leads` in ironic-ineptocracy-site | High | High | M | Yes | blocked — deploy approval |
| 7 | B2 | Install GA4 + Meta Pixel on book site | High | Med | S | Yes | blocked — deploy + IDs |
| 8 | C1 | Reconcile active client count 12 vs 14 | Med | Low | S | Yes | blocked — Melissa/Sean input |
| 9 | C2 | Stalled-client revival email drafts | High | Med | M | Yes | blocked — send approval |
| 10 | R1 | Client reporting registry + verify build-report.js | Med | Low | S | Yes | **done** |
| 11 | I1 | Port Codex Gmail triage automation to vault skills | Med | Med | L | Yes | blocked — Gmail MCP auth |
| 12 | A1 | Deduplicate duplicate hermes serve processes | Low | Low | S | Partial | blocked — may affect desktop |
| 13 | M1 | Repair mohr-vault MCP path + API key | Med | Med | M | Yes | blocked — credential/path approval |

## Top Safe Queue (autonomous)

1. **G1** — Fill `11_Agents/*.md` with machine-checkable rules (Bar Crawl alcohol, Presence Only, tCPA, KJB CC, Replenish branding).
2. **G2** — `System/scripts/refresh-gateway-health.ps1` appends verified snapshot to `gateway-health.md`.
3. **G3** — Bump `last_touched` and `next_action` on 12 M360 overviews using 2026-07-12 audit (no invented client facts).
4. **G4** — Cross-link cursor loop artifacts in operating status.

## Deferred (approval required)

See `System/approval-queue.md` for external/deploy/send items. Do not auto-promote to `ready` without evidence that local prep is complete.

## Completed This Loop

- **G1** — Guardrail agents populated (`11_Agents/*.md`)
- **G2** — `System/scripts/refresh-gateway-health.ps1` + live run
- **G3** — 12 client `overview.md` `last_touched: 2026-07-12`
- **R1** — `_os/reporting/client-registry.json` + build-report.js smoke test
