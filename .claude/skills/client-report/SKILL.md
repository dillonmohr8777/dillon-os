---
name: client-report
description: Build a branded interactive HTML performance report for a client — gathers context from the vault, fills the report data file, renders the deliverable into Daily-Briefs/reports/. Use when asked for a client report, monthly report, or performance recap (e.g. "/client-report Bar Crawl USA June").
---

# Client Report Factory

Turn one command into a polished, self-contained HTML performance report.

## Inputs
Parse the client name and period from the arguments (default period: last full month). Example: `Bar Crawl USA 2026-06`.

## Steps

1. **Gather context.** Read the client's note and folder under `01_Clients/`, plus `System/claude-memory-sync.md` for retainer, contacts, campaign state, and compliance rules. Respect `System/writing-rules.md` in every sentence (contractions, • bullets, no em dashes, Momentum 360 branding).
2. **Assemble the data file** at `_os/reporting/data/<slug>-<period>.json` following the shape of `bar-crawl-usa-2026-06.json`:
   • `kpis` — 3 or 4 headline numbers with deltas. Set `deltaGoodWhenDown: true` for cost metrics.
   • `charts` — 1 or 2 weekly series (labels + values, optional `prefix` like `$`).
   • `campaigns` — table rows with status `live` / `watch` / `blocked` / `paused`.
   • `wins` and `actions` — 3 bullets each, written to Dillon's rules.
   • `summary` — 2 sentences, plain language, no jargon.
3. **Never invent live metrics.** Use numbers found in the vault or provided in the conversation. Anything estimated stays flagged with `"sampleData": true`, which renders a visible draft banner. Only set it false when every figure is confirmed real.
4. **Render:** `node _os/reporting/build-report.js _os/reporting/data/<file>.json`
5. **Log it.** Append a line to the client's note under a `## Reports` heading: date, period, output path.
6. **Report back** the output path and any figures that still need real data before sending.

## Notes
• Output is fully self-contained HTML: attach to email, open locally, or drop on any static host.
• Brand tokens live in one `:root` block at the top of `_os/reporting/report-template.html`. Swap per client when a client wants their own colors.
• Align HCM reports must never carry Momentum 360 branding: set `"agency": "Align HCM"` in the data file.
