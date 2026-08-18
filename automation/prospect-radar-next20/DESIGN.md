---
impeccable:
  schema: 1
  status: seed
  version: 4.0.4
mode: Persuade
tokens:
  radius:
    control: 14px
    media: 16px
  type:
    bodyMin: 16px
    displayMax: 96px
  motion:
    authoredMoment: ink-logo-reveal
---

# Design system

## Direction

Verified identity, mobile-first cinematic pacing, and one memorable close. Each prospect keeps its own logo and source-led palette while the factory supplies a disciplined page grammar.

## Composition

The phone view owns the hierarchy: a compact identity header, one-line offer, primary action in the first viewport, decisive full-width imagery, alternating dense and quiet fields, and a large bottom logo that materializes like ink. Desktop expands the composition without changing its reading order.

## Typography

Use self-hosted, expressive open-source display faces selected by direction family and a highly legible text face. Do not use Oswald, IBM Plex, Inter, DM Sans, Plus Jakarta Sans, Space Grotesk, or another default training-set pairing in this lane.

## Color

Derive the identity color from verified source material, then build an accessible four-role palette: paper, ink, signal, and deep field. Color owns page-scale regions rather than decorating cards.

## Components

Buttons are 48 pixels tall or larger. Media uses 12 to 16 pixel corners. Cards are reserved for genuinely discrete choices or facts. Small tracked kickers and decorative glass panels are not part of this system.

## Motion

Sections are visible by default. Progressive enhancement may reveal content and let completed fields soften as they leave the viewport. The exact-logo outro is the authored moment: blur, scale, contrast, and opacity resolve into a crisp transparent mark. Reduced-motion users receive the final state immediately.

## Asset rules

Logos come only from verified first-party assets and retain their original geometry, spelling, proportions, and colors. SVG is preferred; transparent PNG or WebP is allowed. Every source and derivative has a URL, hash, format, dimensions, and role in `PROVENANCE.json`.

## Responsive rules

- Zero horizontal overflow at 320, 375, 390, 768, 1024, and 1440 pixels.
- Header, actions, images, and logo outro are composed for phones first.
- The sticky phone action never obscures the footer logo or the final disclosure.
- Desktop never becomes the hidden source of the mobile order.

## Finish gate

This seed becomes a built-system record after the first Next 20 batch passes source, asset, static, browser, reduced-motion, detector, and duplicate-hash checks.
