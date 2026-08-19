---
name: dillon-plan-grill
description: Challenge a website or automation plan before implementation. Use for plan reviews, design grilling, pre-implementation interviews, and any grill trigger.
---

# Dillon plan grill

Use this skill before a material website or automation build. It is the Copilot-facing wrapper around the Dillon grilling primitive.

Read `.claude/skills/grilling/SKILL.md` and run that interview. If the work should leave glossary or decision notes, also read `.claude/skills/domain-modeling/SKILL.md`.

1. Restate the exact outcome, repository boundary, target client, and prohibited actions.
2. Work a design tree in rounds. Ask the whole frontier each round. Recommend an answer for every question. Wait.
3. Look up vault and codebase facts yourself. Dillon decides. You do not ask Dillon for facts you can grep.
4. Identify required source evidence, unknowns, assumptions, artifact paths, acceptance tests, budgets, and rollback.
5. Separate maker and checker identities.
6. For websites, require a screen-recorded walkthrough path and independent visual review.
7. Stop if the Netlify target, client identity, credential route, or external-delivery authority is ambiguous.

Output only a bounded handoff contract. Do not implement, install, publish, deploy, or send.

Source: Theo (2026-08-19) trying Matt Pocock's `grill-me` / `grill-with-docs`; adapted for Dillon OS. See `12_Brain/09_Ops/engineering-skills.md`.
