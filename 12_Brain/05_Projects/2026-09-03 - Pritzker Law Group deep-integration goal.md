---
note_type: project
status: active
created: 2026-09-03
updated: 2026-09-03
owner: Dillon Mohr
area: client delivery
priority: high
outcome: Scaffolding is in place for a Pritzker Law Group automation system (sponsor landing-page intake, episode-to-content, sponsorship reporting, reputation monitoring). Nothing runs end to end yet — all four automations halt at their first gate until the client supplies the voice-profile samples, the verbatim disclaimer text, and the final approval owner.
next_action: Obtain the eight gating confirmations from the client — the original six (conversion goal, production host, form destination, analytics property, launch facts, final approval owner) plus the firm's verbatim disclaimer text and three approved firm writing samples.
review_on: 2026-09-17
source_refs:
  - "[[01_Clients/Pritzker Law Group/overview]]"
  - "[[01_Clients/Pritzker Law Group/Client Intelligence Overlay]]"
  - "[[01_Clients/Pritzker Law Group/voice-profile]]"
  - "[[12_Brain/03_Concepts/Anti-AI Client Operating Model]]"
  - "[[12_Brain/05_Projects/2026-09-03 - Pritzker Law Group podcast sponsor landing page SEO-AEO-GEO plan]]"
  - "[[12_Brain/01_Captures/Communications/2026-09-03 - Pritzker anti-AI stance and SEO directive]]"
  - ".claude/skills/pritzker-ops/SKILL.md"
  - ".claude/skills/podcast-intake-loop/SKILL.md"
  - ".claude/skills/episode-content-pipeline/SKILL.md"
  - ".claude/skills/sponsorship-roi-report/SKILL.md"
  - ".claude/skills/reputation-engine/SKILL.md"
tags: [brain, project, goals, client, pritzker, automation]
---

# Pritzker Law Group deep-integration goal

Build toward an automation system around Pritzker Law Group's podcast
sponsorship — intake, content, reporting, reputation — in the firm's authentic
voice, held to high craft, and fully approval-gated.

## What exists today (honest state)

**Scaffolding, not a running system.** As of 2026-09-03 this build has produced:

- Five skill definitions (one router + four automations) and five registry
  entries.
- One canonical concept note for the operating model.
- A voice-profile scaffold that is still an **empty template**.

Nothing has been drafted, approved, or published for the client. All four
automations are wired to **halt at their first gate** and will keep halting until
the client supplies the missing inputs below. This note describes machinery and
its blockers — it does not claim a working, self-operating client system.

## Still needed from the client (the blockers)

The original **six** confirmations, unchanged:

1. Conversion goal (the one measurable action).
2. Production host.
3. Form destination.
4. Analytics property.
5. Launch facts (date, listening destinations, source channels).
6. Final approval owner (role TO CONFIRM — client evidence says "final approval
   owner", not necessarily an attorney).

Two more **identified by this build** (not client-stated) that block the same
work:

7. The firm's **verbatim disclaimer text**. It is NOT captured anywhere in the
   vault, yet every skill instructs "preserve the firm disclaimer". It must be
   obtained verbatim from the firm and recorded in
   [[01_Clients/Pritzker Law Group/voice-profile]] before any asset publishes. If
   it is absent, the run STOPS and flags. It is never invented or paraphrased.
8. **Three approved firm writing samples** to build the voice profile from. Until
   they land, `voice-profile.md` stays empty and every dependent skill stops.

## Scoreboard

Counts are as of 2026-09-03. Targets that depend on unsupplied client facts are
marked TO CONFIRM rather than given a made-up number.

| Measure | Today | Target |
|---|---|---|
| Gating confirmations landed | 0 of 8 | 8 of 8 |
| Approved firm writing samples captured | 0 | 3 |
| Firm disclaimer text captured verbatim | no | yes (1 verbatim block) |
| Voice-profile sections populated | 0 of 6 | 6 of 6 |
| Skills built (router + automations) | 5 | 5 (complete) |
| Registry entries | 5 (1 tier-0, 4 tier-2 pending-gate) | 5 (complete) |
| Landing page live, capturing to the confirmed destination | no | yes |
| Episode-derived assets drafted / approved / published | 0 / 0 / 0 | TO CONFIRM — no episode cadence or slate is evidenced in the vault |
| Sponsorship ROI reports delivered with `sampleData: false` | 0 | 1 (first real-analytics report) |
| Reputation responses drafted / approved / posted | 0 / 0 / 0 | TO CONFIRM — depends on GBP ownership, which is unconfirmed |

Do not fill any TO CONFIRM cell with an estimate. Fill it when the client
supplies the fact.

## Operating model

Authentic firm voice + human approval before publish + fact-safety + high craft.
**Not** concealment. Canonical definition:
[[12_Brain/03_Concepts/Anti-AI Client Operating Model]].

The "anti-AI" attribute is Dillon-reported and not independently verified against
the client's own words — see
[[12_Brain/01_Captures/Communications/2026-09-03 - Pritzker anti-AI stance and SEO directive]].

Client truth stays in [[01_Clients/Pritzker Law Group/overview]] and the
[[01_Clients/Pritzker Law Group/Client Intelligence Overlay]]; this note links to
it and does not duplicate it.

## The four automations

Routed by the `pritzker-ops` umbrella skill
(`.claude/skills/pritzker-ops/SKILL.md`). Each halts at the gate named beside it:

- `.claude/skills/podcast-intake-loop/SKILL.md` — landing-page contact capture.
  Primary path is a plain, non-AI-forward form plus a ManyChat flow (ManyChat is
  the only client-evidenced tool, and it is unverified). A Speko AI voice agent is
  an **optional** path requiring explicit client consent — proposing one to this
  reported-anti-AI decision-maker is a known relationship risk.
  **Halts on:** conversion goal + form destination, and vendor-confidentiality consent.
- `.claude/skills/episode-content-pipeline/SKILL.md` — episode transcript →
  firm-voiced, AEO/GEO content assets via maker/checker.
  **Halts on:** empty voice profile, missing disclaimer text.
- `.claude/skills/sponsorship-roi-report/SKILL.md` — sponsorship performance
  recap extending the client-report factory; in-lane KPIs only.
  **Halts on:** analytics property, form destination.
- `.claude/skills/reputation-engine/SKILL.md` — reviews / GBP / brand-mention
  monitoring and firm-voiced response drafting.
  **Halts on:** unconfirmed GBP ownership, empty voice profile.

All four are registered in `12_Brain/registry/automations.json` as `tier: 2`,
`external_actions: true`, `status: pending-gate` — drafts only until approved.
The `pritzker-ops` router is registered separately as `tier: 0`,
`external_actions: false` (routing and drafts only).

## Approval boundary

Nothing publishes, deploys, sends, posts, spends, or changes an account, and no
live Speko/ManyChat agent is stood up, until the gating confirmations land and
the final approval owner signs off. Every external action is drafted locally and
stopped.

**An approval-queue entry is appended to `System/approval-queue.md` when a
concrete artifact is ready — not in advance.** The queue holds current actions
only; prospective gates for artifacts that do not exist yet are tracked by
`status: "pending-gate"` in `12_Brain/registry/automations.json` and by this
note, not by the queue.
