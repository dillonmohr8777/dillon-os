---
tags: [brief, predictive-work, forecasting]
date: 2026-09-02
lookahead_days: 35
authority: planning-evidence-only
status: ok
---

# Predictive work brief — 2026-09-02

Evidence window: 2026-06-05 through 2026-09-02. 118 dated work packages and 17 active canonical queue items were scanned. Client-operations source: branch cursor/bigorange-aeo-geo-seo-991e at 773a16f, 633 modified file(s), 18 ahead / 18 behind origin/main.

Every row below is a prediction unless its Kind column says otherwise. Only canonical queue rows are confirmed requests, and only a recorded dueAt is a confirmed deadline.

## What is likely to come next

For verified recurrences and historical cadence, confidence estimates recurrence strength after hindcast calibration. For canonical queue rows, it estimates source and work-package classification confidence; the recorded state still controls whether work may proceed.

| Window | Kind | Confidence | Client or lane | Expected deliverable | Evidence |
| --- | --- | --- | --- | --- | --- |
| 2026-09-08 to 2026-09-10 | prediction only | 96% confirmed-pattern | bok-law-firm | BOK weekly three-topic designed content kit | owner-verified-recurrence: Three designed topics and generated image backgrounds are expected from the latest verified pattern and Dillon's instruction; the exact current packet overrides the count. 3 matching dated packages observed in the history window. |
| 2026-09-07 to 2026-09-09 | prediction only | 67% watch (raw 67%, hit-rate 100%) | momentum-360 | Prospect, franchise, outreach, or sales-campaign package | historical-cadence: 6 dated packages imply a weekly median interval of 6 days; prediction is not a request or deadline. |
| 2026-09-07 to 2026-09-11 | prediction only | 67% watch (raw 67%, hit-rate 100%) | portfolio/multiple (13 routes) | Branded client report or performance presentation | historical-cadence: 13 client routes share the same historical report window. This is a preparation signal, not a confirmed reporting deadline. |
| 2026-09-10 to 2026-09-12 | prediction only | 61% watch (raw 61%, hit-rate 100%) | momentum-360 | Website, landing page, or frontend build | historical-cadence: 3 dated packages imply a biweekly median interval of 12.5 days; prediction is not a request or deadline. |
| 2026-09-16 to 2026-09-18 | prediction only | 61% watch (raw 61%, hit-rate 100%) | fagan-painting | SEO, AEO, GEO, blog, or authority-content package | historical-cadence: 3 dated packages imply a biweekly median interval of 15.5 days; prediction is not a request or deadline. |
| needs-approval | confirmed request, undated | 86% likely | bar-crawl-usa | Paid-media, conversion, or lead-performance work package | canonical-queue: Obtain explicit approval for the exact billing accounts, effective date, and protected payment-method update path; keep all invoice and advertising account changes paused. |
| needs-approval | confirmed request, undated | 80% likely | replenish-7-eleven | Paid-media, conversion, or lead-performance work package | canonical-queue: Approve the exact PDF attachment and recipient, then send it to Mia; collect her chargeback reason, Pompano credit intent, and San Diego budget ceiling before opening the Google Ads billing case or making any payment. |
| when-gate-clears | confirmed request, undated | 68% watch | puttery-nyc | Data source, tracking, or API integration | canonical-queue: Obtain the signed agreement; rotate and store the reservation-vendor credential through the approved vault route before any use; then verify the exact reservation business identifiers and webhook authorization, analytics and tag-manager access, advertising and CMS access, a test booking path, and the approved privacy, consent, and booking-value decisions. |

## Plan inputs for today

Hard commitments (recorded due dates): none in the lookahead window.
Predicted preparation (max two, 45 minutes each, after hard commitments): bok-law-firm BOK weekly three-topic designed content kit from 2026-09-08 at 96%; momentum-360 Prospect, franchise, outreach, or sales-campaign package from 2026-09-07 at 67%.
Gated rows for Deliberately not doing: bar-crawl-usa Paid-media, conversion, or lead-performance work package (needs_approval); replenish-7-eleven Paid-media, conversion, or lead-performance work package (needs_approval); puttery-nyc Data source, tracking, or API integration (blocked).

## Prepare now

### BOK weekly three-topic designed content kit — bok-law-firm

Signal: **confirmed-pattern (96%)**, prediction only. Three designed topics and generated image backgrounds are expected from the latest verified pattern and Dillon's instruction; the exact current packet overrides the count. 3 matching dated packages observed in the history window.

- Locate and fingerprint the newest source packet before drafting or generating images
- Resolve the three topics, exact copy, dates, and approved BOK template
- Prepare three ChatGPT image-generation prompts and output slots without publishing anything

Preparation contract:
- Inputs: Newest attorney-approved weekly packet PDF, for example clients/bok-law-firm/deliverables/<date>-*/pdf/BOK_Corrected_Weekly_Social_Content.pdf, fingerprinted before any drafting; Three topic and copy records in drafts/01-*.md, 02-*.md, and 03-*.md derived only from that packet
- Templates: clients/bok-law-firm/deliverables/2026-09-01-three-blogs/build_social_packet.py and build_pdfs.py as the current generators; qa/pdf-verification.json and qa/social-final from the prior week as the acceptance reference
- Outputs: Three branded graphics as PNG and JPG at the template's native size; Source and final PDFs plus a contact sheet or rendered-page inspection set
- QA: Copy matches the packet verbatim; no invented legal claims; Geography reads as western Pennsylvania, not Pittsburgh-only

Gate: Missing or conflicting packet, legal/geographic ambiguity, wrong Facebook page, duplicate schedule, or any content outside the exact approved source

### Prospect, franchise, outreach, or sales-campaign package — momentum-360

Signal: **watch (67%)**, prediction only. 6 dated packages imply a weekly median interval of 6 days; prediction is not a request or deadline.

- Resolve exact identities and remove duplicates before drafting
- Collect the authoritative site, logo, offer, and fit evidence
- Prepare the reviewable asset and draft package without sending

Gate: Email or Slack send authority, ad spend, list purchase, public posting, or uncertain prospect identity

### Branded client report or performance presentation — portfolio/multiple

Signal: **watch (67%)**, prediction only. 13 client routes share the same historical report window. This is a preparation signal, not a confirmed reporting deadline.

- Freeze the reporting window and identify every required source
- Reconcile platform events to CRM or booking outcomes before writing conclusions
- Load the exact prior approved template and client visual assets

Preparation contract:
- Inputs: Client route, exact reporting period, and the source-of-truth ledger (platform exports, CRM, booking, call logs) with freshness dates; The prior approved report for the same client as the structural and visual baseline
- Templates: _os/reporting/data/bar-crawl-usa-2026-06.json for the data shape and _os/reporting/build-report.js as the renderer; .claude/skills client-report and am-report
- Outputs: Self-contained HTML report; Rendered PDF with page-render QA screenshots
- QA: KPI math recomputed from the ledger; Brand separation: one client per document, no cross-client numbers

Gate: Unverified conversion definitions, inaccessible source fields, external delivery, or a client/account mismatch

### Website, landing page, or frontend build — momentum-360

Signal: **watch (61%)**, prediction only. 3 dated packages imply a biweekly median interval of 12.5 days; prediction is not a request or deadline.

- Resolve the exact client, repository, current site, and deployment mapping
- Collect the approved logo, imagery, copy, tokens, and reference surface
- Write the smallest implementation and QA contract before building

Preparation contract:
- Inputs: Exact client route from client-operations registry/clients.json and the current live URL; Approved logo, photography, palette source, and copy facts (address, phone, hours, offerings) with source locators
- Templates: philly-sites/DESIGN-SYSTEM.md as the design contract; _templates/site-factory/example-brief.json and _templates/site-factory/build-site.js
- Outputs: One self-contained index.html inside the 27 to 37 KB budget plus assets/; Reviewable Netlify preview URL, or the exact mapped live URL when standing approval applies
- QA: qa-critic pass: contrast, keyboard focus, links, forms, console errors, mobile overflow; LocalBusiness JSON-LD and the noindex flag match the deployment intent

Gate: New public site, ambiguous deployment target, client sign-off, credentials, or non-Netlify publication

### SEO, AEO, GEO, blog, or authority-content package — fagan-painting

Signal: **watch (61%)**, prediction only. 3 dated packages imply a biweekly median interval of 15.5 days; prediction is not a request or deadline.

- Confirm the exact page, topic, intent, and existing canonical URL
- Gather current first-party evidence and approved brand sources
- Define the content and QA contract before drafting

Gate: Unsupported legal or performance claims, client sign-off, CMS access, or publication without standing approval

### Paid-media, conversion, or lead-performance work package — bar-crawl-usa

Signal: **likely (86%)**, confirmed request, undated. Obtain explicit approval for the exact billing accounts, effective date, and protected payment-method update path; keep all invoice and advertising account changes paused.

- Resolve the exact account and reporting window
- Verify tracking and downstream outcomes before interpreting conversion counts
- Draft the read-only audit and proposed measurement plan

Gate: Budget, bidding, targeting, creative, billing, conversion-action, or account changes Canonical work item wi-20260808-0003 still requires its recorded approval.

### Paid-media, conversion, or lead-performance work package — replenish-7-eleven

Signal: **likely (80%)**, confirmed request, undated. Approve the exact PDF attachment and recipient, then send it to Mia; collect her chargeback reason, Pompano credit intent, and San Diego budget ceiling before opening the Google Ads billing case or making any payment.

- Resolve the exact account and reporting window
- Verify tracking and downstream outcomes before interpreting conversion counts
- Draft the read-only audit and proposed measurement plan

Gate: Budget, bidding, targeting, creative, billing, conversion-action, or account changes Canonical work item wi-20260728-0001 still requires its recorded approval.

### Data source, tracking, or API integration — puttery-nyc

Signal: **watch (68%)**, confirmed request, undated. Obtain the signed agreement; rotate and store the reservation-vendor credential through the approved vault route before any use; then verify the exact reservation business identifiers and webhook authorization, analytics and tag-manager access, advertising and CMS access, a test booking path, and the approved privacy, consent, and booking-value decisions.

- Resolve the exact source account and destination before configuring anything
- Draft the field and identifier map, including missing decisions
- Prepare a synthetic or read-only acceptance test

Preparation contract:
- Inputs: Exact client, source account, environment, source owner, and destination consumer; Identifier and field map with privacy, consent, and retention boundaries
- Templates: clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/WEBHOOK_RECEIVER_CONTRACT.md; account-binding.template.json and acceptance-cases.json from that same package
- Outputs: Contract markdown, field-map JSON, and acceptance-cases JSON; Verification receipt with sample identifiers redacted
- QA: Acceptance cases pass against the receiver; Idempotency and version handling verified with a replayed payload

Gate: MFA, CAPTCHA, new consent, credentials, billing, production writes, or account changes Canonical work item wi-20260901-0005 is blocked; do not treat the predicted package as ready to execute.

## Calibration

| Evidence tier | Judged | Hit | Hit rate | Multiplier | Applied |
| --- | ---: | ---: | ---: | ---: | --- |
| historical-cadence | 14 | 14 | 100% | 1 | yes |

Hindcast origins 7, 14, 21, 28 days back, 14-day lookahead, ±2 days tolerance, judged through 2026-09-02.

## Chronos workload shadow

Status: **evaluated-shadow**. A routeable workload request is ready, but Chronos remains a shadow challenger until repeated holdouts beat simple baselines and calibration passes.

Latest decision: **retain-deterministic-baseline-primary**. Planner-consumption gate: **FAIL**.

Rolling origins: Chronos beat the best deterministic baseline on 1 of 4 scored origins (0 rejected). Mean MAE Chronos 2.5357 vs best baseline 2.2962 (trailing_28_day_mean, day_of_week_mean, zero, persistence). Mean p10-p90 coverage 53.6% against a free weekday band at 67.8%.

Next-14-day total-workload shadow: point 14.98, p10 1.34, p50 14.98, p90 96.92. Capacity context only.

Chronos forecasts numeric arrival counts and ranges. The deterministic evidence router predicts the actual deliverable and preparation contract. Sparse per-type series remain withheld from Chronos. The daily plan may show the total band, but it may not reorder work until a human records a promotion after the repeated-holdout gate passes.

## Blind spots and limits

- Predictions were read from a client-operations checkout on branch cursor/bigorange-aeo-geo-seo-991e at 773a16f with 633 modified file(s), 18 ahead and 18 behind origin/main. Canonical main may differ.
- 14 open queue items were excluded from the predictive stack because their evidence was older than the status-specific freshness window.
- Folder dates are work-package evidence, not measured effort hours or guaranteed completion dates.
- Live Gmail, Slack, calendar, and connector state are not inferred unless already reconciled into the canonical queue or deliverable history.
- Predictions do not create work, deadlines, approvals, or external authority.

> This brief may prepare reviewable local work. It cannot send, publish, spend, change an account, or mutate the canonical queue.
