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

Verified identity, mobile-first cinematic pacing, and one memorable close. Every prospect uses the Align HCM orange, navy, warm-paper, and cyan material system with a business-specific editorial board, while exact first-party identity remains authoritative.

## Composition

The phone view owns the hierarchy: a compact identity header, one-line offer, primary action in the first viewport, decisive full-width imagery, alternating dense and quiet fields, and a large bottom logo that materializes like ink. Desktop expands the composition without changing its reading order.

## Typography

Use self-hosted Plus Jakarta Sans at 800 for display statements and self-hosted DM Sans at 400 to 700 for body copy and controls. This is an explicit Align HCM contract, not a generic default.

## Color

Use Align warm paper, deep and midnight navy, structural orange, and pale cyan as page-scale fields. The verified first-party business logo retains its own original colors and geometry; no generated or reconstructed mark is permitted.

## Components

Buttons are 48 pixels tall or larger. Media uses 12 to 16 pixel corners. Cards are reserved for genuinely discrete choices or facts. Small tracked kickers and decorative glass panels are not part of this system.

## Motion

Sections are visible by default. Progressive enhancement may reveal content and let completed fields soften as they leave the viewport. The authored moment is the documentary image-to-identity transition; an exact logo is used only when verified, and a fallback remains ordinary live text. Reduced-motion users receive the final state immediately.

## Asset rules

Logos come only from verified first-party assets and retain their original geometry, spelling, proportions, and colors. SVG is preferred; transparent PNG or WebP is allowed. Every source and derivative has a URL, hash, format, dimensions, and role in `PROVENANCE.json`.

## Responsive rules

- Zero horizontal overflow at 320, 375, 390, 768, 1024, and 1440 pixels.
- Header, actions, images, and logo outro are composed for phones first.
- The sticky phone action never obscures the footer logo or the final disclosure.
- Desktop never becomes the hidden source of the mobile order.

## Finish gate

This seed becomes a built-system record after the first Next 20 batch passes source, asset, static, browser, reduced-motion, detector, and duplicate-hash checks.
