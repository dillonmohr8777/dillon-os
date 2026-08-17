---
note_type: research
status: active
created: 2026-08-05
updated: 2026-08-05
observed_at: 2026-08-05
review_on: 2026-09-05
domain: website production
verification_status: partial-source-limited
source_refs:
  - "https://www.designspells.com/"
  - "https://www.designspells.com/?tag=animation"
  - "https://www.designspells.com/?tag=motion"
  - "https://www.designspells.com/newsletters/17"
  - "[[03_Concepts/High Craft Website Factory]]"
  - "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\integrations\\buzz\\references\\ai-tech-news-site-factory.md"
tags:
  - research
  - designspells
  - interaction-design
  - motion
  - website-factory
---

# DesignSpells interaction reference

## What was verified

The DesignSpells catalog presents small, reusable interaction ideas and groups
them with tags such as Mobile, Desktop, Interaction, Animation, Motion,
Transition, Button, Scroll, and 3D. Individual spell pages and the digest
format provide source locators that can be attached to a brief or evidence
manifest. The reference is useful for discovering a specific interaction
intent, such as a transition, scroll threshold, feedback state, or tactile
button response.

## Source limitation

The live homepage and tag pages returned an access-denied response to the
current browser fetch. The categories and examples above were verified from
the indexed source results and linked source metadata, so this note is
source-limited rather than a claim that every current spell was inspected.
Recheck the selected spell URL during implementation before treating it as
current design evidence.

## Factory application rule

DesignSpells is an optional inspiration reference, not a copy library, design
system, asset source, or licensing signal. For each UI surface or 25-site
batch, inspect the relevant category only when the page goal would benefit
from a purposeful interaction. Record the chosen URL or slug in the local
brief or evidence manifest. Reuse a local motion token or component only
after the same intent is needed in at least three surfaces, while preserving
the existing factory grammar and each business's art direction.

CTA scroll motion must clarify hierarchy or state, remain brief and
interruptible, work for touch and keyboard users, and fall back safely under
reduced-motion preferences. It must not introduce overflow, layout shift,
focus loss, or motion-only meaning. Every selected interaction receives
desktop, mobile, touch, keyboard, reduced-motion, and console QA before it is
accepted into a build.

## Current action

The canonical Momentum 360 artifact
`clients/momentum-360/deliverables/2026-08-05-designspells-reference-integration.md`
records the applied rule for the AI Tech News site factory. No site, preview,
deployment, outreach, or account state was changed by this research pass.
