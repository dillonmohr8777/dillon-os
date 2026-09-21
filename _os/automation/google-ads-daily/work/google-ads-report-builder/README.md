# Google Ads partial report renderer

No-argument invocation retains the September 4 baseline. Daily mode requires an explicit date and one saved account receipt:

```powershell
node build.mjs --date 2026-09-05 --input C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-05-google-ads-daily-health/run-receipt.json
node check-daily.mjs
C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe check-pdf.py 2026-09-05
```

Run separately for Omega, Onsite, and Nexla. Daily input follows the existing run-receipt.json: exact clientId/customerId, date, capturedAtUtc, timezone, currency, campaignId/state, dailyBudget, metricScope, periods (first is the single-day headline), null outcome fields, conversionLabel, coverageGaps, source. Dates must match capture; periods cannot extend beyond capture date; counts must be whole integers. This partial renderer intentionally rejects verified outcome totals until that evidence contract is added. Never reuse an old receipt under a new date.

Output goes to that client's deliverables/<date>-google-ads-daily-health/: HTML, PDF, exact logo, source data with input hash, screenshots, verification.json. Original run receipts remain untouched. A rerun replaces the generated package at the same date. Build receipts are saved per date/client beside this script.

This renders saved evidence only. It does not collect Ads data, configure a schedule, change accounts, send email, or publish. September 5 outputs retain approximate capture times 13:36–13:38 UTC and missing-period/outcome labels.

The existing report layout and Arial remain intact. Nexla uses exact first-party SVG from https://nexla.com/n3x_ctx/uploads/2026/02/nexla-logo.svg, visually checked and pinned by SHA-256. Its dark lettering sits directly on a white masthead. Impeccable detector reported one nonblocking inherited Arial warning (exit 1); preserving portable report typography is intentional.
