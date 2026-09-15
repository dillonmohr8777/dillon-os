# Local draft receipt

Workflow: google-ads-deep-review. Step: report-drafts. Maker: ads_reports. Status: drafted, independent review pending.

Two client-separated local packages exist at canonical `clients/<id>/deliverables/2026-09-04-google-ads-health-review/` for `omega-landscaping` and `onsite-concrete-landscape`.

Each contains `report.html`, a client-named PDF, `client-logo.png`, `source-data.json`, `verification.json`, desktop/mobile PNGs, and two rendered PDF-page PNGs. The input is the Chief-reviewed `../google-ads-live-evidence.json`, not historical report metrics. No account authentication was attempted by this worker.

## Verified locally

- Four browser-emulated screen views: 1200px and 320px per client. No horizontal overflow, loaded exact images, one H1, pending conversion wording, keyboard-reachable source link and no console/page errors.
- Both PDFs parse as exactly two US Letter pages. Extracted text verifies account separation, current August 28–September 3 window and pending conversion wording. Actual rendered pages were inspected; one batched correction increased print body/source sizes and removed the transient keyboard-focus outline from PDFs.
- Exact client-logo SHA256 matches the source inventory. Artwork unchanged. Original first-party download provenance was not independently refreshed.
- Conversion, qualified-lead, connected-call and booked-estimate input fields are required to be null for this bounded snapshot. No traffic metric is relabeled as a real business outcome.
- Static artifact, no animation; reduced motion receives identical complete content. No controls beyond the source link; no form, loading flow or remote asset dependency.
- Local outputs only. No queue, memory, send, publish, schedule, provider or budget change.

## Limits

Impeccable detector exit 1: optional HTML parser modules unavailable (`htmlparser2`, `css-select`, `css-tree`, `domutils`), so fallback cannot certify selector matching, custom-property or computed contrast coverage. Two Arial warnings match the documented incumbent PDF-continuity exception in `SURFACE.md`. This is a degraded detector run, not an automated design pass. No dependency was installed or shared configuration changed.

Browser checks use Chromium emulation, not real phone devices or email clients. These are review drafts, not sent client reports, completed comprehensive audits or proof of a daily scheduled run. The narrow builder deliberately rejects another date window; a future daily workflow needs a separately validated fresh-evidence contract.

## Repeat checks

`node work/google-ads-report-builder/build.mjs`

`C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe work/google-ads-report-builder/check-pdf.py`

The initially probed PyMuPDF module was unavailable; the PDF check uses already-installed pypdf and pypdfium2. `build-receipt.json` and each package's `verification.json` carry current PDF hashes and local check results. Independent QA must decide release readiness.

Reusable lesson proposal for Chief: blur the active keyboard element before exporting a PDF after keyboard QA, or focus indicators become part of the permanent print artifact. Evidence: first PDF render captured focused source-link outline; `build.mjs` now blurs after verifying the link remains keyboard accessible.
