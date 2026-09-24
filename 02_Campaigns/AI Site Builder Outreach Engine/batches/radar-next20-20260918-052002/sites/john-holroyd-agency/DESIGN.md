---
impeccable:
  schema: 1
  status: built
  version: 4.0.4
mode: Persuade
tokens:
  color:
    paper: #F4E7EC
    ink: #331D20
    signal: #9C2E40
    deep: #401C25
  type:
    display: Newsreader
    text: Figtree
  radius:
    media: 10px
  motion:
    authoredMoment: ink-logo-reveal
---

# Design system: John Holroyd Agency

## Direction

split signal composition with source-led imagery, decisive mobile type, and an exact-logo finale.

## Composition

The phone order is primary. Image, type, proof, and action move in one vertical sequence. Desktop expands that sequence without reordering it.

## Typography

Newsreader leads the expressive hierarchy. Figtree carries body copy and controls. Both are self-hosted WOFF2 assets.

## Color

Paper #F4E7EC; ink #331D20; signal #9C2E40; secondary #E7A843; panel #E9D1DB; deep #401C25.

## Components

Large direct actions, full-width media, bounded proof rows, and a quiet contact system. Decorative card grids and repeated eyebrow labels are excluded.

## Motion

Content reveals progressively and resolved fields may soften after passing. The exact transparent logo resolves from blur and contrast in the final ink field. Reduced motion displays every element in its final state.

## Asset rules

The logo is copied byte for byte from the first-party source. All content images are traceable first-party derivatives. See assets/PROVENANCE.json.

## Responsive rules

Mobile owns the hierarchy, type scale, button width, crop, and logo size. The final logo remains clear at 320, 375, and 390 pixels.

## Finish gate

Static checks, browser QA, detector review, duplicate hashes, exact-logo hash, and provenance must pass before completion.
