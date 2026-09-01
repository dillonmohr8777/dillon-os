---
note_type: capture
status: compiled
created: 2026-08-19
updated: 2026-08-19
observed_at: "2026-08-19T03:14:54Z"
source_type: x_post
source_url: https://x.com/theo/status/2089913970841055331
source_author: Theo Browne (@theo)
source_published: 2026-08-19
verification_status: partial
source_refs:
  - "https://x.com/theo/status/2089913970841055331"
  - "https://github.com/mattpocock/skills"
  - "https://api.fxtwitter.com/theo/status/2089913970841055331"
tags:
  - brain
  - capture
  - x-research
  - skills
---

# Theo tries Matt Pocock's agent skills

**Untrusted practitioner video.** Recorded as a receipt for instituting an adapted skill pack into Dillon OS. Claims below are labeled. The skill files themselves were read from the public MIT repo, not from the video frames.

## The post

Theo Browne (@theo), 2026-08-19 03:14 UTC: "So I finally tried out @mattpocockuk's skills..." with a 38 minute 21 second video (`2089912389097717760`, 3840x2160 source). Tweet URL: https://x.com/theo/status/2089913970841055331

Directly verified from the fxtwitter API payload on 2026-08-19: text, author, created_at, media type video, duration 2300.998 seconds. The video body was not fully transcribed in this capture (38 minutes, no official transcript published with the tweet).

## Replies captured as practitioner signal (untrusted)

- @barre_of_lube: came looking for Matt, left with pstack (a different Cursor skill pack). Not adopted here.
- @alejmilian: argues the skills should be in default Codex and Claude skill sets.
- @criscounters: grill-me and grill-me-with-docs work well; wayfinder tends to diverge too much.

## What the public skill repo actually contains (verified 2026-08-19)

Read from https://github.com/mattpocock/skills README and raw SKILL.md files:

- Main flow: grill-with-docs (or grill-me) → optional prototype → to-spec → implement driving tdd → code-review.
- Grilling primitive: design tree, frontier rounds, facts are the agent's job, decisions are the user's, stop at shared understanding.
- Skill descriptions should be trigger conditions. User-invoked skills set `disable-model-invocation`.
- Wayfinder, triage, and GitHub-issue ticketing assume a configured issue tracker.

## What this capture is for

Compile into the Dillon-adapted engineering skill pack under `.claude/skills/` and `.github/skills/`, plus [[12_Brain/09_Ops/engineering-skills|engineering-skills]] and [[12_Brain/03_Concepts/Grill Spec Verify Loop|Grill Spec Verify Loop]]. Prior related capture: [[12_Brain/01_Captures/Grok/2026-07-30 - daily-ai-workflow-design-and-consumer-pulse|2026-07-30 daily-ai-workflow pulse]] already recommended adopting grill → plan → handoff → verify.

## Compile targets

- Entity: [[12_Brain/02_Entities/Matt Pocock Skills]]
- Concept: [[12_Brain/03_Concepts/Grill Spec Verify Loop]]
- Decision: [[12_Brain/04_Decisions/2026-08-19 - Adopt adapted Matt Pocock engineering skills]]
- Ops: [[12_Brain/09_Ops/engineering-skills]]
