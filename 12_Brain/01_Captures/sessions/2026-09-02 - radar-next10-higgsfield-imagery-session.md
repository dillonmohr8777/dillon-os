---
note_type: capture
status: raw
created: 2026-09-02
updated: 2026-09-02
observed_at: "2026-09-02T00:00:00.000Z"
source_type: session
verification_status: verified
source_refs:
  - "https://claude.ai/code/session_01DvtM1zTGNBzCzwUh6aHAzz"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02/verdict]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02/imagery]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02/qa-summary]]"
tags:
  - brain
  - capture
  - session
  - radar-next10
  - website-factory
  - higgsfield
  - qa
---

# Session: Radar next-10 batch — Higgsfield imagery fix, favicon template fix, 10/10 approval

## What happened

- Batch `radar-next10-2026-09-02` existed on branch `claude/fable-5-1-integration-v2qu71`
  with selection, briefs, and 10 built sites, but no imagery assets present.
- First QA pass failed all 10 sites on image 404s (generated-stock board referenced
  in the brief was not actually present locally).
- The lead's plan was a template fix to drop the missing `<img>` references
  entirely; Dillon interrupted that plan and directed using Higgsfield to
  actually generate the imagery instead of degrading the sites.
- video-director generated 120 images via Higgsfield `nano_banana` (1 credit
  each, 120 credits total). 15 of the first-pass generations were auto-flagged
  `nsfw` by the provider — false positives on generic HVAC-house, dental-
  instrument, and sandwich-shop prompts — and were regenerated with rephrased
  prompts until all 120 slots were filled with photorealistic, face/text/logo-
  free imagery.
- Re-QA after imagery landed found a batch-wide favicon.ico 404 that only
  surfaced on the first site opened per browser process (subsequent same-
  process navigations reused the cached miss and didn't re-report it), which
  masked the defect on early runs. Fixed at the template level: a favicon
  `<link>` was added to the base template so the browser stops requesting
  `/favicon.ico`.
- Re-QA came back 10/10 PASS at 390 px and 1440 px, zero broken images, hero
  contrast >= 12.4, page weights 59-199 KB.
- Lead wrote `verdict.md` approving all 10 for deploy, conditional on Google
  Fonts rendering being unverified (sandbox has no font-CDN egress) and imagery
  being disclosed as Higgsfield-generated, not real business photos.
- The Netlify deploy line for this batch was appended to
  `System/approval-queue.md` and stays approval-gated — nothing is live yet.

## Decisions made

- **Higgsfield `nano_banana` is the accepted imagery path for radar batches
  when no approved stock board exists**, superseding for these verticals the
  2026-08-18 generated-stock-board request that this batch could not fulfill
  locally. Follow-up: reconcile this with the 2026-08-18 generated-stock-board
  decision/ask — do not edit that queue line here, flag it for the next
  review pass.

## Lessons

- The favicon `<link>` belongs in the base template, not per-site — a missing
  one causes a batch-wide 404 that intermittently disappears from QA logs
  depending on browser-process reuse, which makes it easy to miss on a partial
  re-run.
- Playwright running in a no-egress sandbox must explicitly abort font-CDN
  (Google Fonts) requests, and any resulting QA pass must label font rendering
  `unverified` rather than implicitly passing it — a route that never fires
  is not the same as a route that was checked and succeeded.

## Patterns confirmed

- When a build is blocked on missing real assets and no approved stock board
  exists, generating disclosed AI imagery (with full provenance logged) and
  shipping the batch on schedule beats silently degrading the sites (dropping
  images) or stalling the batch.
- A human interrupt mid-plan (Dillon's "use Higgsfield" call) changed the
  remediation path from template degradation to actual asset generation —
  worth defaulting to "generate the missing thing" over "engineer around the
  gap" when the gap is imagery and a paid generation path exists.
