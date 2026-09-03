---
name: episode-content-pipeline
description: Turn a Love, Philadelphia podcast episode transcript into a Pritzker-relevant legal angle and draft a blog post, GBP post, and social caption in the firm's authentic voice, AEO/GEO-structured, then maker/checker and queue for attorney sign-off. Use when a new episode transcript is ready (e.g. "/episode-content-pipeline episode 4 transcript"). Voice comes from the real approved profile; no invented facts.
---

# episode-content-pipeline

Compile one episode transcript into fact-safe, firm-voiced content assets, gated
behind attorney sign-off. See `pritzker-ops` for the operating model and the six
confirmations. Client truth: `01_Clients/Pritzker Law Group/`.

## Inputs

- The episode transcript (supplied; treat as source, cite it in `source_refs`).
- `01_Clients/Pritzker Law Group/voice-profile.md` — the firm's authentic voice
  (must come from real approved firm writing; if empty, stop and flag).
- `System/writing-rules.md` for house style.
- Reuse `content-scan` (pipeline placement) and `brain-capture` (immutable receipt
  of the transcript).

## Steps

1. **Capture the transcript.** Route it through `brain-capture` so the source is
   an immutable receipt with a stable path to cite.
2. **Extract the legal angle.** Find the Pritzker-relevant, evidence-backed legal
   theme (tie only to confirmed firm practice areas from the overlay). No invented
   guests, episode facts, dates, or outcomes.
3. **Draft the assets in the firm's voice** (from the voice profile):
   - Blog post — AEO/GEO structured: answer-extractable H2 questions with the
     direct answer first, internal links to the firm's relevant practice pages
     (descriptive anchors), fact-safe FAQ schema only for Q&A actually on the page.
   - GBP post — short, fact-safe, firm-voiced.
   - Social caption — one platform-appropriate caption, disclaimer-safe.
4. **Maker/checker.** Run the independent gate:
   `node _os/automation/bin/workflow-gate.js start|maker|check` with distinct
   maker and checker identities. Checker verifies voice match, fact-safety,
   disclaimer, and AEO structure.
5. **Queue for sign-off.** Append the publish action to `System/approval-queue.md`
   under `## Current client actions` (attorney sign-off required), and surface it
   in the morning approval queue. Stop.

## Boundaries

- Attorney sign-off before any publish. Drafts only; nothing posts.
- No invented facts, guests, dates, episodes, or outcomes — fact-safe throughout.
- The voice profile must come from real, attorney-approved firm writing, never
  fabricated. If `voice-profile.md` is still an empty template, stop and flag.
- Preserve the firm disclaimer; never imply an attorney-client relationship.
- Approval boundary: draft locally, append to `System/approval-queue.md`, stop.
