---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
decision_date: 2026-08-19
review_on: 2026-11-19
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/sessions/2026-08-19 - unslop-follow-up]]"
  - "[[12_Brain/01_Captures/X/2026-08-19 - theo-mattpocock-skills]]"
  - "https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md"
tags:
  - brain
  - decision
  - skills
  - writing
---

# Adopt adapted pstack unslop

## Context

After the adapted Matt Pocock pack landed, Dillon asked about `unslop`. The X capture already noted pstack as a different pack that was not adopted at capture time. Unslop is that pack's copy pass: a 31-pattern scan plus a voice rewrite. Upstream applies it to every writing pass.

## Options considered

1. Ignore it. House writing rules already ban em dashes and corporate jargon.
2. Subscribe to pstack as a Cursor plugin and let unslop always apply.
3. Own an adapted `unslop` copy for agent-authored marketing prose, with house rules winning and captures/harvested voice left alone.

## Decision

Option 3. Install `.claude/skills/unslop/` and `.github/skills/dillon-unslop/`. Keep `command_deck: false`. Do not treat unslop as always-on. Do not install the rest of pstack.

## Rationale

The 31-pattern scan is useful on ads, emails, blogs, reports, and landing-page sentences an agent invented. Always-on would rewrite captures, skill files, and harvested client nouns, which Dillon OS forbids. "Adding soul" cannot invent facts. Bar Crawl ads stay in the pre-approved library. `System/writing-rules.md` already owns em dashes, contractions, Momentum vs Align branding, and Replenish vs Fresh Blends.

## Consequences

- Copy that is about to be called ship-ready gets an unslop pass.
- Captures, skills, `AGENTS.md`, `CLAUDE.md`, harvested nouns, and live published copy are out of scope.
- Sending and publishing stay on [[System/approval-queue]].
- The rest of pstack is still not installed.

## Reversal trigger

If unslop starts flattening client voice or fighting `mirror-and-improve`, delete `.claude/skills/unslop/` and `.github/skills/dillon-unslop/` and drop the pointer in `System/writing-rules.md`. Review on 2026-11-19.

## Evidence

- [[12_Brain/01_Captures/sessions/2026-08-19 - unslop-follow-up]]
- [[12_Brain/09_Ops/engineering-skills]]
- [[12_Brain/09_Ops/engineering-glossary]]
