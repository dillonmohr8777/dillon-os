---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
decision_date: 2026-08-19
review_on: 2026-11-19
verification_status: partial
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-19 - theo-mattpocock-skills]]"
  - "[[12_Brain/05_Projects/2026-07-30 - Frontier actions 1-4]]"
  - "https://github.com/mattpocock/skills"
tags:
  - brain
  - decision
  - skills
  - agents
---

# Adopt adapted Matt Pocock engineering skills

## Context

Dillon asked to institute https://x.com/theo/status/2089913970841055331 into Dillon OS skill sets. The tweet is Theo trying Matt Pocock's skills. The vault already had a thin Copilot wrapper (`dillon-plan-grill`) from [[12_Brain/05_Projects/2026-07-30 - Frontier actions 1-4]] and a 2026-07-30 research recommendation to adopt grill → plan → handoff → verify.

## Options considered

1. Install the upstream Claude plugin as a read-only bundle that updates behind us.
2. Copy the entire upstream set, including wayfinder and GitHub-issue ticketing.
3. Adapt the core loop into `.claude/skills/` and `.github/skills/`, map docs onto `12_Brain/`, keep approval gates, skip wayfinder.

## Decision

Option 3. Own editable copies of grilling, grill-me, grill-with-docs, domain-modeling, handoff, tdd, diagnosing-bugs, code-review, to-spec, implement, writing-for-agents, and ask-dillon-skills. Upgrade `dillon-plan-grill`. Add `dillon-code-review`. Keep them off the HUD Command Deck.

## Rationale

Matt's own README says to hack the skills and make them yours. A plugin subscribe would duplicate skills and fight vault paths. Wayfinder wants an issue tracker; a reply on the source tweet said it diverges. Dillon OS already has projects, decisions, maker/checker, and approval-queue. The missing piece was the interview primitive and the two-axis review, not another ticket database.

## Consequences

- Agents can be told `/grill-with-docs` or `/ask-dillon-skills` inside this repo.
- Specs write to `12_Brain/05_Projects/`, glossary to product `CONTEXT.md` or `12_Brain/09_Ops/engineering-glossary.md`.
- No GitHub issues, sends, publishes, or deploys from these skills.
- Upstream updates are a bounded diff, not an auto-sync.

## Reversal trigger

If the adapted copies drift from how Dillon actually works, or if a later review shows wayfinder earning its complexity on a real multi-session build, revisit on 2026-11-19. Deleting the new `.claude/skills/` directories and reverting `dillon-plan-grill` rolls this back.

## Evidence

- [[12_Brain/01_Captures/X/2026-08-19 - theo-mattpocock-skills]]
- [[12_Brain/03_Concepts/Grill Spec Verify Loop]]
- [[12_Brain/09_Ops/engineering-skills]]
