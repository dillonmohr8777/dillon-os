---
note_type: project
status: active
created: 2026-09-03
updated: 2026-09-03
owner: Dillon Mohr
area: client delivery
priority: high
outcome: Pritzker Law Group runs as a deeply integrated, self-operating Dillon OS client — an attorney-approved, firm-voiced sponsor landing page that captures intake, an episode-to-content engine, sponsorship ROI reporting, and reputation monitoring — all fact-safe, human-owned, and approval-gated.
next_action: Confirm the six landing-page facts (conversion goal, production host, form destination, analytics property, launch facts, final approval owner) and build the voice profile from real approved firm samples.
review_on: 2026-09-17
source_refs:
  - "[[01_Clients/Pritzker Law Group/overview]]"
  - "[[01_Clients/Pritzker Law Group/Client Intelligence Overlay]]"
  - "[[01_Clients/Pritzker Law Group/voice-profile]]"
  - "[[12_Brain/05_Projects/2026-09-03 - Pritzker Law Group podcast sponsor landing page SEO-AEO-GEO plan]]"
  - "[[12_Brain/01_Captures/Communications/2026-09-03 - Pritzker anti-AI stance and SEO directive]]"
  - "[[.claude/skills/podcast-intake-loop/SKILL]]"
  - "[[.claude/skills/episode-content-pipeline/SKILL]]"
  - "[[.claude/skills/sponsorship-roi-report/SKILL]]"
  - "[[.claude/skills/reputation-engine/SKILL]]"
tags: [brain, project, goals, client, pritzker, automation]
---

# Pritzker Law Group deep-integration goal

Stand up a deep, self-operating automation system around Pritzker Law Group's
podcast sponsorship — intake, content, reporting, reputation — built in the firm's
authentic voice, held to high craft, and fully approval-gated.

## Outcome

Pritzker runs as a deeply integrated Dillon OS client: an attorney-approved,
firm-voiced sponsor landing page that captures intake, an episode-to-content
engine, sponsorship ROI reporting, and reputation monitoring — all fact-safe,
human-owned, and approval-gated. Client truth stays in
[[01_Clients/Pritzker Law Group/overview]] and the
[[01_Clients/Pritzker Law Group/Client Intelligence Overlay]]; this note links to
it and does not duplicate it.

## Scoreboard (measurable finish lines)

- Landing page live and the intake/booking agent capturing real contacts to the
  confirmed destination.
- N episode-derived assets (blog / GBP / social) drafted, attorney-approved, and
  published — count grows per episode.
- First sponsorship ROI report delivered with real analytics numbers
  (`sampleData: false`), not sample data.
- Reputation monitoring live: reviews / GBP / brand mentions watched, responses
  drafted and approved before posting.
- Branded-search lift and AI-citation lift tracked around episode drops.

## Operating model (honest, not concealment)

The client-side decision-maker is reported (by Dillon, unverified) as very
anti-AI — see
[[12_Brain/01_Captures/Communications/2026-09-03 - Pritzker anti-AI stance and SEO directive]].
The answer is the same one the law firm's fact-safety already demands, and it is
genuine human-owned quality — **not** hiding tooling from the client:

- Draft in the firm's authentic voice from a real, attorney-approved voice
  profile ([[01_Clients/Pritzker Law Group/voice-profile]]).
- Attorney sign-off before any publish.
- Fact-safe: no invented guests, episodes, dates, platforms, audience size,
  outcomes, awards, testimonials, legal advice, or sponsor benefits. Preserve the
  firm disclaimer; never imply an attorney-client relationship.
- High craft, so the work is genuinely human-owned.

## The four automations

Routed by the [[.claude/skills/pritzker-ops/SKILL|pritzker-ops]] umbrella skill:

- [[.claude/skills/podcast-intake-loop/SKILL|podcast-intake-loop]] — always-on
  landing-page intake/booking agent (Speko / ManyChat drafts only).
- [[.claude/skills/episode-content-pipeline/SKILL|episode-content-pipeline]] —
  episode transcript → firm-voiced, AEO/GEO content assets via maker/checker.
- [[.claude/skills/sponsorship-roi-report/SKILL|sponsorship-roi-report]] —
  sponsorship performance recap extending the client-report factory.
- [[.claude/skills/reputation-engine/SKILL|reputation-engine]] — reviews / GBP /
  brand-mention monitoring and firm-voiced response drafting.

All four are registered in `12_Brain/registry/automations.json` as `tier: 2`,
`external_actions: true`, `status: pending-gate` — drafts only until approved.

## Approval boundary

Nothing publishes, deploys, sends, posts, spends, or changes an account, and no
live Speko/ManyChat agent is stood up, until the six confirmations land and the
named attorney signs off. Every external action is drafted locally, appended to
`System/approval-queue.md`, and stopped. This is machinery and drafts only.
