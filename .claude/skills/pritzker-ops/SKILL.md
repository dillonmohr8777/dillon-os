---
name: pritzker-ops
description: Umbrella operating skill for Pritzker Law Group — routes any Pritzker task (landing-page intake, episode content, sponsorship reporting, reputation) to the right automation under the anti-AI operating model. Use when a Pritzker request arrives and you need to pick the lane, or to re-anchor the operating model and the gating confirmations (e.g. "/pritzker-ops what do I do with this episode transcript").
---

# pritzker-ops

The front door for all Pritzker Law Group automation. Pritzker is a Momentum 360
client; the locked lane is a reviewable sponsor landing page for the firm's
premium sponsorship of Love, Philadelphia — The Podcast. Client truth lives in
`01_Clients/Pritzker Law Group/` — link to it, never duplicate it here.

## Operating model

Authentic firm voice + human approval before publish + fact-safety + high craft.
**Not** concealment. Canonical definition:
`12_Brain/03_Concepts/Anti-AI Client Operating Model.md` — read it there rather
than restating it here.

## The gating confirmations

The original six client-side confirmations, unchanged:

1. Conversion goal (the one measurable action).
2. Production host.
3. Form destination.
4. Analytics property.
5. Launch facts (date, listening destinations, source channels).
6. Final approval owner (role TO CONFIRM — client evidence says "final approval
   owner", not necessarily an attorney).

Two more, **identified by this build** (not client-stated), that block the same
work:

7. The firm's **verbatim disclaimer text**. It is NOT yet captured anywhere in
   the vault. It must be obtained verbatim from the firm and recorded in
   `01_Clients/Pritzker Law Group/voice-profile.md` before any asset publishes.
   If it is absent, STOP and flag — do not invent, paraphrase, or approximate it.
8. **Three approved firm writing samples** to build the voice profile from. Until
   they land, `voice-profile.md` stays an empty template and every skill that
   depends on it stops and flags.

Nothing goes live until all eight land.

## Inputs

- `01_Clients/Pritzker Law Group/overview.md`
- `01_Clients/Pritzker Law Group/Client Intelligence Overlay.md`
- `01_Clients/Pritzker Law Group/voice-profile.md`
- `12_Brain/03_Concepts/Anti-AI Client Operating Model.md` (the operating model)
- `12_Brain/05_Projects/2026-09-03 - Pritzker Law Group deep-integration goal.md` (the goal)
- `12_Brain/05_Projects/2026-09-03 - Pritzker Law Group podcast sponsor landing page SEO-AEO-GEO plan.md`
- The four automation skills below.

## Steps

1. Read the client files and the goal note above. Re-anchor the operating model
   and the gating confirmations before doing anything.
2. Route the task to the right lane:
   - Landing-page intake / booking agent → `pritzker-podcast-intake-loop` (`/podcast-intake-loop`).
   - Episode transcript → content assets → `pritzker-episode-content-pipeline` (`/episode-content-pipeline`).
   - Sponsorship performance recap → `pritzker-sponsorship-roi-report` (`/sponsorship-roi-report`).
   - Reviews / GBP / brand mentions → `pritzker-reputation-engine` (`/reputation-engine`).
3. Confirm every draft cites `source_refs` and stays fact-safe.
4. For any external action, append a go-live item to `System/approval-queue.md`
   **when a concrete artifact is ready** — not in advance — and stop.

## Boundaries

- Approval boundary: no publish, deploy, send, post, spend, account change, or
  live Speko/ManyChat agent. Draft locally, append to `System/approval-queue.md`, stop.
- Fact-safety: never invent guests, episodes, dates, platforms, audience size,
  outcomes, awards, testimonials, legal advice, sponsor benefits, metrics, or
  search volumes. Unknown ⇒ mark TO CONFIRM.
- The firm's disclaimer text is a **blocking input**, not a placeholder. It is not
  captured yet; if it is absent, STOP and flag. Never imply an attorney-client
  relationship.
- The voice profile must be built from real approved firm writing, never fabricated.
- Nothing here frames the work as hiding AI from the client — see the concept note.
