# Provenance

Rescued into the vault on 2026-09-09 by the daily orchestrator.

The original lived at
`C:/Users/dillo/Documents/Codex/2026-09-04/new-realtime-voice-chat-7/` — a
dated session folder, tracked by nothing, on a machine with fourteen unclean
power-offs in the last thirty days. It is the same failure mode as the Slack
sweep, the Gmail picture and the Nexla paid-media plan, all of which had to be
rescued from an application cache the same day.

Copied verbatim. Nothing was edited, refactored or renamed. Secret-scanned
before the copy: no secret-shaped strings, no file over 5 MB, no `node_modules`.

## What is here

- `GOOGLE-ADS-DAILY-RUNBOOK.md` — the daily loop, written 2026-09-05. Scope is
  Omega `2853981364`, Onsite `1033715894`, Nexla `7917802207`. KJB
  `8145506229` is a pause-safety check only, its cancelled duplicate
  `7214914099` is excluded, and Fagan is excluded.
- `work/google-ads-report-builder/` — the renderer. Takes a saved
  `run-receipt.json` and emits a dated
  `deliverables/<date>-google-ads-daily-health/` package with hash-pinned client
  artwork. Three 2026-09-05 build receipts are included.
- `radar-state.mjs` and `radar-state.test.mjs` — the scheduling plan. `node
  radar-state.mjs plan` exposes `googleAdsReportDue` at the first wake at or
  after 09:00 America/New_York, with same-day catch-up.
- Supporting reviews: `GOOGLE-ADS-REVIEW.md`, `OMEGA-RESTART-RECEIPT.md`,
  `omega-onsite-applied-status.md`, `google-ads-optimization-status.md`.

## What it is, and is not

The runbook states its own authority plainly: "Local draft preparation only;
not permission to change campaigns, tracking, bids, budgets, or send reports."
And: "Daily is a monitoring cadence, not a mandate for daily bid edits."

**Rendering works. Collection does not exist.** Every receipt to date came from
a hand-driven authenticated browser session — the exact route that failed on
2026-09-08 when the Chrome tab was gone. The renderer deliberately refuses to
invent data: "This partial renderer intentionally rejects verified outcome
totals until that evidence contract is added. Never reuse an old receipt under
a new date."

**Nothing schedules it.** `list_scheduled_tasks` returns nothing, and the
runbook says so itself: "Native schedule configuration is not proof of a
scheduled execution." The one run, on 2026-09-05, finished
`completed-partial-daily-blocked`.

**Step 5 cannot execute for Nexla today.** "Reconcile authorized CRM, booking
and call-log outcomes" needs HubSpot portal `3222786`, which is not connected.
A daily run built on this today reports spend and clicks, and
`Conversion reporting is pending validation` for leads.

## Related

- [[12_Brain/07_Reviews/2026-09-09 - Google Ads API access is blocked at the connector]]
- [[12_Brain/07_Reviews/2026-09-09 - Session estate consolidation]]
