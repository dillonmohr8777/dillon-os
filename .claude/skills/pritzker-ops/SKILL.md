---
name: pritzker-ops
description: Umbrella operating skill for Pritzker Law Group — routes any Pritzker task (landing-page intake, episode content, sponsorship reporting, reputation) to the right automation under the anti-AI operating model. Use when a Pritzker request arrives and you need to pick the lane, or to re-anchor the operating model and the six gating confirmations (e.g. "/pritzker-ops what do I do with this episode transcript").
---

# pritzker-ops

The front door for all Pritzker Law Group automation. Pritzker is a Momentum 360
client; the locked lane is a reviewable sponsor landing page for the firm's
premium sponsorship of Love, Philadelphia — The Podcast. Client truth lives in
`01_Clients/Pritzker Law Group/` — link to it, never duplicate it here.

## Operating model (honest, not concealment)

The client-side decision-maker is reported (by Dillon, unverified) as very
anti-AI. The answer is the same one a law firm's fact-safety already demands, and
it is genuine human-owned quality — **not** hiding tooling from the client:

- **Voice profile.** Draft in the firm's authentic voice from a real,
  attorney-approved voice-capture profile: `01_Clients/Pritzker Law Group/voice-profile.md`.
- **Attorney sign-off before publish.** Every claim, disclaimer, and CTA passes
  named attorney review before anything goes live.
- **Fact-safe.** Only claims verifiable from the firm site or supplied sponsor
  identity ship. Preserve the firm disclaimer; never imply an attorney-client
  relationship.
- **High craft.** Held to a quality bar that makes it genuinely human-owned.

## The six gating confirmations

Nothing goes live until all six land: (1) conversion goal, (2) production host,
(3) form destination, (4) analytics property, (5) launch facts, (6) final
approval owner (named attorney reviewer).

## Inputs

- `01_Clients/Pritzker Law Group/overview.md`
- `01_Clients/Pritzker Law Group/Client Intelligence Overlay.md`
- `01_Clients/Pritzker Law Group/voice-profile.md`
- `12_Brain/05_Projects/2026-09-03 - Pritzker Law Group deep-integration goal.md` (the goal)
- `12_Brain/05_Projects/2026-09-03 - Pritzker Law Group podcast sponsor landing page SEO-AEO-GEO plan.md`
- The four automation skills below.

## Steps

1. Read the client files and the goal note above. Re-anchor the operating model
   and the six confirmations before doing anything.
2. Route the task to the right lane:
   - Landing-page intake / booking agent → `pritzker-podcast-intake-loop` (`/podcast-intake-loop`).
   - Episode transcript → content assets → `pritzker-episode-content-pipeline` (`/episode-content-pipeline`).
   - Sponsorship performance recap → `pritzker-sponsorship-roi-report` (`/sponsorship-roi-report`).
   - Reviews / GBP / brand mentions → `pritzker-reputation-engine` (`/reputation-engine`).
3. Confirm every draft cites `source_refs` and stays fact-safe.
4. For any external action, append a go-live item to `System/approval-queue.md` and stop.

## Boundaries

- Approval boundary: no publish, deploy, send, post, spend, account change, or
  live Speko/ManyChat agent. Draft locally, append to `System/approval-queue.md`, stop.
- Fact-safety: never invent guests, episodes, dates, platforms, audience size,
  outcomes, awards, testimonials, legal advice, or sponsor benefits.
- Preserve the firm disclaimer; never imply an attorney-client relationship.
- The voice profile must be built from real approved firm writing, never fabricated.
- Nothing here frames the work as hiding AI from the client — it is human-owned quality.
