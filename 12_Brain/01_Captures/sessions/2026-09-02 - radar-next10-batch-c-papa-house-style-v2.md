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
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/verdict]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/design-references/papa-advertising/tokens]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/qa-summary]]"
tags:
  - brain
  - capture
  - session
  - radar-next10
  - website-factory
  - design-system
  - qa
---

# Session: Radar next-10 batch C — Papa Advertising house style v2 rebuild

## What happened

- Dillon asked for Papa Advertising (papaadvertising.com, his former employer)
  design language as the primary style for the `radar-next10-2026-09-02c`
  batch's v2 rebuild — a "house style" home-page layer to run across the
  radar factory, not a one-off treatment.
- papaadvertising.com blocks curl with a SiteGround captcha, and a headless
  Chromium capture attempt stalled, so Dillon supplied a phone screen
  recording of the live site as the capture source instead.
- Frames were extracted from the recording with a pip-installed `ffmpeg`. A
  Sonnet agent pixel-sampled the frames and derived the palette (`#0468b6`
  blue, `#e17f1e` orange, `#363f45` charcoal) plus the grammar: pill buttons,
  heavy-caps display type, script accents, orange doodles, and an alternating
  loud/quiet section rhythm.
- The lead seat authored the shared house-style assets: `kit-v2.css`,
  `sections-v2.html`, `DESIGN-v2.md`, `voice.md`, 10 per-site hero SVGs, an
  icon sprite, a seal element, dividers, and doodles.
- 5 Sonnet writers expanded copy (process, cta_band, footer_line) and 5
  Sonnet assemblers built the 10 pages against the shared kit.
- QA caught and fixed, per-site (not upstream in the shared kit): a hero
  eyebrow contrast bug (accent-on-brand collapsing to ~1.2:1 because
  `kit-v2.css`'s `.hero{background:var(--brand)}` beats `kit.css`'s
  `.surface-deep{background:var(--brand-2)}` on cascade order), a ghost-hover
  contrast bug, and a padded-chip logo measurement issue. Batch passed 10/10
  at 390 and 1440 px after fixes.
- Exact real logos (byte-identical harvested assets) landed on 8 of 10 sites;
  2 (`the-juice-merchant`, `advance-exterior-solutions`) kept a designed
  placeholder mark because no verifiable real logo exists for either
  business, flagged in `verdict.md` and carried into the deploy line's
  conditions.
- The `ui-design` skill gained a house-style clause as a result of this pass.
- The review hub (`index.html`) was rebuilt for v2 using the Papa blue/orange/
  charcoal palette directly (not the batch's per-site brand tokens), since the
  hub is Dillon's own review surface, not a prospect-facing page.
- The Netlify deploy line for this batch stays approval-gated in
  `System/approval-queue.md`; nothing is live.

## Decisions made

- **House style + exact-logo harvesting is now the standard radar build
  path** going forward, not a one-off for this batch — a shared Papa-derived
  design layer (kit-v2) applied per-site, with real logos harvested wherever
  a verifiable source exists and a clearly-flagged designed placeholder only
  when none does.
- **Design references live under `design-references/<name>/`** inside this
  campaign folder (e.g. `design-references/papa-advertising/`), as a
  reusable, versioned asset separate from any single batch.
- **A screen recording is an accepted capture source** when a target site
  blocks programmatic fetches (captcha, bot-wall) — frame-extract with
  `ffmpeg` and pixel-sample from the frames rather than stalling the batch on
  a blocked live capture.

## Lessons

- Keep shared kit edits (e.g. `kit-v2.css`) applied *before* running per-site
  assembly, or propagate any post-assembly kit fix to every already-assembled
  site — QA found the same hero-eyebrow contrast bug independently on
  multiple sister sites because the fix was applied locally per-site rather
  than upstream in the shared kit first.
- Measure a logo's rendered height on the `<img>` itself, not on its padded
  `.chip` wrapper — the wrapper's padding was inflating the apparent logo
  size during QA.
- Hero eyebrows (and any label sitting on a brand-colored section
  background) must resolve to an on-brand-safe color, not the raw `--accent`
  token — accent-on-brand pairs can collapse to near-invisible contrast
  (observed ~1.2:1 to ~1.8:1 across multiple sites) even when accent passes
  fine against paper or white.

## Patterns confirmed

- Fan-out assembly (one lead seat authoring the shared design system, N
  Sonnet writers expanding copy, N Sonnet assemblers building pages) scales
  a house-style rebuild across a 10-site batch cleanly, provided the shared
  kit is locked before assembly starts.
- Flagging a designed placeholder explicitly in `verdict.md` and threading
  that condition through to the deploy-queue line (rather than silently
  shipping a fake logo) keeps a "no real logo found" gap from becoming a
  mailing mistake later.
