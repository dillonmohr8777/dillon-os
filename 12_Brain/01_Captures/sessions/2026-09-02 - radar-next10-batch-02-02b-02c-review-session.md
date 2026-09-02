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
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/sheet-crosscheck-2026-09-02]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/verdict]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/qa-summary]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/selection]]"
tags:
  - brain
  - capture
  - session
  - radar-next10
  - website-factory
  - netlify
  - higgsfield
  - qa
---

# Session: Radar next-10 batches 02/02b/02c — sheet cross-check, stalled imagery agent, bespoke build path

## What happened

- Cross-checked batches `radar-next10-2026-09-02` and `radar-next10-2026-09-02b`
  (20 slugs total) against the master outreach Google Sheets workbook and found
  11 of the 20 slugs were already built and deployed in a lane this repo has no
  local record of — `radar-unslop-20260819` — plus other prior lanes. Documented
  in `02_Campaigns/AI Site Builder Outreach Engine/batches/sheet-crosscheck-2026-09-02.md`.
- Batch 02b's imagery-generation agent was stopped mid-run. 93 Higgsfield credits
  had already been spent generating renders that were never downloaded out of
  the generation history — the spend is not lost, the assets are recoverable
  from Higgsfield's generation history, but nothing was pulled down before the
  stop.
- Batch 02b has 8 clean replacement prospects already selected and recorded in
  `replacements.md`, swapped in for the slugs the sheet cross-check disqualified,
  but none of those 8 are built yet.
- Batch 02c was built on a different path entirely: a shared design kit (Opus),
  five Sonnet copywriters, and ten Sonnet builders, with no factory template and
  no stock or generated photography — every site's imagery is animated,
  currentColor SVG art adapted per site. A qa-critic pass on this batch found and
  fixed a shared-kit bug (a mobile split-grid layout that didn't reset
  `grid-template-columns`, breaking the two-column split panel at 390px). Final
  QA came back 10/10 pass at 390px and 1440px, all 10 approved, deploy queued in
  `System/approval-queue.md` — nothing live.
- Separately, Netlify site creation for batch 02 succeeded via the Netlify MCP
  tool, but the subsequent file upload to that site was blocked by a content
  classifier.

## Decisions made

- **Check the outreach Google Sheets workbook before every batch selection**,
  not just the local repo's `batches/` tree — the repo alone does not reflect
  everything already built and deployed (the `radar-unslop-20260819` lane was
  invisible from git history and only surfaced via the sheet). Supersedes any
  prior selection process that treated the local repo as the full picture of
  built inventory.
- **Bespoke build path (shared design kit + per-site Sonnet copywriters +
  Sonnet builders, no factory template, no photography) is the new default
  radar build path**, as proven out in batch 02c.
- **Reserve Higgsfield-generated imagery for cases where a photo is essential**
  to the pitch (e.g. a real building/product shot expected by the vertical),
  rather than defaulting to it for every batch's visuals.

## Lessons

- A mobile grid override must explicitly reset `grid-template-columns` (not
  just adjust gap/flow) or a two-column split-panel layout silently keeps its
  desktop column count at narrow widths — this is the exact bug the 02c
  qa-critic pass caught and fixed in the shared kit before sign-off.
- Parked/for-sale domains make the strongest outreach prospects (no real site
  to protect, clean rebuild pitch) but require placeholder discipline in the
  generated copy — contact fields (phone, address, hours, email) must be
  explicitly marked as placeholders rather than invented, since there is no
  live source to harvest them from.
- When an image-generation agent is stopped mid-run, download/save whatever was
  already generated before doing anything else — batch 02b's stop left 93
  Higgsfield credits' worth of renders sitting in generation history,
  un-downloaded and not yet converted into usable local assets.

## Patterns confirmed

- Sheet-first cross-checking against the canonical outreach workbook, not just
  local repo state, is now confirmed necessary — it caught more than half
  (11/20) of two batches' prospects as already-built duplicates that local
  grepping alone would have missed entirely.
- The bespoke-kit + Sonnet-copy + Sonnet-builder pipeline with a qa-critic pass
  on the shared kit (not just per-site QA) is confirmed as a working batch
  process: it caught a kit-level bug once and the fix propagated correctly to
  all 10 sites, landing a clean 10/10 approval.
