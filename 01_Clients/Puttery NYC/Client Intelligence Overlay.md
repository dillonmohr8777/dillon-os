---
note_type: client_intelligence
status: active
client: Puttery NYC
client_id: puttery-nyc
relationship: client
division: Momentum 360
created: 2026-09-02
updated: 2026-09-02
evidence_as_of: 2026-09-01
verification_status: current-local-evidence
intelligence_maturity: operational
keyword_state: deferred
aeo_geo_state: deferred
pipeline_state: blocked
reporting_state: developing
workflow_state: operational
priority: high
next_action: "Rotate and verify the Tock role credential, approve a durable HTTPS host, register the Reservation Webhook, and validate one controlled Puttery NYC payload before production attribution or conversion delivery."
review_on: 2026-09-09
source_refs:
  - "[[overview]]"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/CLIENT.md"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/PRODUCTION_READINESS_2026-09-01.md"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/VERIFICATION_2026-09-01.md"
tags: [client-intelligence, puttery-nyc, momentum360, attribution, tock, reporting]
---

# Puttery NYC Client Intelligence Overlay

## Executive operating thesis

Puttery NYC has a locally verified reservation-event receiver and an exact NYC
business filter, but production attribution remains gated by credential
rotation, durable hosting, vendor registration, a controlled live payload, and
approved measurement definitions. Reporting may describe delivered readiness
work; it must not claim live booking attribution, media performance, or
ad-platform conversions before those gates pass.

## Current evidence snapshot

- The canonical active route is Puttery NYC under Momentum 360, with the exact
  internal Slack route recorded as `#puttery`.
- The Tock Business Group ID is `28086`; the Puttery NYC Business ID is `37824`,
  and `business.id` is the authoritative venue filter.
- The receiver passed 13 of 13 Node tests and a protected Windows end-to-end
  check covering target insertion, duplicate suppression, and non-target
  filtering on September 1, 2026.
- The exact-scope Data Exports probe returned HTTP 503. Authentication and
  provisioning therefore remain unverified.
- The August attribution dashboard, kickoff material, access packet, and
  reservation measurement specification were delivered. No verified
  advertising spend source is mapped.
- Production is held pending commercial approval, credential rotation, an
  approved durable host, vendor registration, one controlled NYC payload,
  measurement and consent decisions, and exact analytics and advertising
  account mapping.

## Strategy-system coverage

| System | State | Evidence | Gap | Next move |
|---|---|---|---|---|
| Reservation identity | Operational foundation | Exact business group, NYC business ID, and venue filter are documented | One controlled production payload has not been observed | Validate `business.id = 37824` after approved registration |
| Attribution architecture | Developing | Receiver contract, normalized event schema, and duplicate/conflict controls exist | Transaction grain, booking value, consent, and retention ownership remain open | Approve the measurement contract before production ingestion |
| Pipeline | Blocked | Reservation events can be normalized locally | Durable host, rotated credential, and vendor registration are not complete | Clear the production-readiness gates in order |
| Reporting | Developing | August readiness deliverables and local verification evidence exist | No live reservation stream or verified media source is mapped | Report readiness separately from live performance |
| Paid media | Blocked | Analytics and ad-platform destinations are named as required mappings | Exact GA4, GTM, Google Ads, Meta, and CMS accounts are unverified | Map each account before any conversion delivery claim |
| Workflow | Operational | Receiver tests, protected credential path, deployment runbook, and rollback requirements are documented | Container build and approved-host verification remain outstanding | Build and verify on the selected durable host |
| AEO/GEO and organic demand | Deferred | No current source establishes this as part of the engagement | Scope and evidence are absent | Keep outside the active lane unless scope expands |

## Production gate sequence

1. Complete the signed agreement and payment form.
2. Rotate the vendor role credential and retain it only through the approved
   protected route.
3. Approve the durable HTTPS host, source repository, backup, restore, and
   rollback route.
4. Register the Reservation Webhook and exchange the secure header through the
   protected path.
5. Validate one controlled Puttery NYC payload using Business ID `37824`.
6. Approve transaction grain, booking-value definition, consent treatment, and
   retention ownership.
7. Map the exact analytics, advertising, and CMS accounts before conversion
   delivery.

## Shared systems

- [[12_Brain/03_Concepts/Qualified Pipeline Measurement]]
- [[12_Brain/03_Concepts/Client Reporting and Outcome Scoreboards]]
- [[12_Brain/03_Concepts/Evidence Context and Learning Loops]]
- [[12_Brain/03_Concepts/Draft-First Operating Rules]]
