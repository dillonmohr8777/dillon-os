---
name: reputation-engine
description: Monitor reviews, Google Business Profile, and brand mentions for Pritzker Law Group, draft fact-safe responses in the firm's authentic voice, run maker/checker, and queue for approval before any posting. Use when watching or responding to Pritzker reviews/GBP/mentions (e.g. "/reputation-engine draft a reply to this new review"). Never posts or contacts anyone live without approval; no legal advice.
---

# reputation-engine

Watch the firm's reputation surfaces and draft firm-voiced responses, gated
behind approval. See `pritzker-ops` for the operating model and the six
confirmations. Client truth: `01_Clients/Pritzker Law Group/`. GBP existence and
ownership are TO CONFIRM — do not assume a profile exists or that the firm
controls it.

## Inputs

- The review / GBP item / brand mention (supplied; cite it in `source_refs`).
- `01_Clients/Pritzker Law Group/voice-profile.md` for tone.
- Signal sources: reuse the radar/site-grade signals (`site-grade`, the Cloudflare
  D1 Radar entity) and the measurement concept notes:
  `12_Brain/03_Concepts/AI Visibility Measurement.md`,
  `12_Brain/03_Concepts/Entity Authority and Citation Readiness.md`,
  `12_Brain/03_Concepts/Local Search and Maps Site Parity.md`.

## Steps

1. **Monitor.** Collect new reviews, GBP activity, and brand mentions read-only.
   Track branded-search and citation signals via the measurement notes above.
2. **Draft the response** in the firm's authentic voice (from the voice profile).
   Fact-safe, no legal advice, disclaimer preserved, never implying an
   attorney-client relationship. Thank / acknowledge; route substantive matters
   to the firm offline.
3. **Maker/checker.** Run `node _os/automation/bin/workflow-gate.js start|maker|check`
   with distinct maker and checker identities; the checker verifies voice match,
   fact-safety, and that no legal advice is given.
4. **Queue for approval.** Append the posting/contact action to
   `System/approval-queue.md` under `## Current client actions` (approval required
   before any post or outreach). Stop.

## Boundaries

- Never post a review response, GBP reply, or contact anyone live without
  approval. Drafts only.
- No legal advice; preserve the firm disclaimer; never imply an attorney-client
  relationship.
- Fact-safe: no invented outcomes, testimonials, awards, or benefits.
- Do not assume a GBP exists or is firm-controlled — confirm first.
- Approval boundary: draft locally, append to `System/approval-queue.md`, stop.
