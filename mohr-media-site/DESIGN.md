---
name: Dillon Mohr Signal Foundry
description: A cinematic portfolio system where strategy, craft, and operating proof move as one signal.
colors:
  ink: "#020711"
  gunmetal: "#07101f"
  gunmetal-raised: "#0b1729"
  paper: "#f3f7fb"
  blueprint-paper: "#e8f2fb"
  platinum: "#dce4ed"
  muted-signal: "#9fb2c9"
  cobalt: "#287dff"
  electric-cyan: "#18c8ff"
  signal-mint: "#58edb2"
typography:
  display:
    fontFamily: "Foundry Display, sans-serif"
    fontSize: "clamp(4rem, 8.4vw, 9.2rem)"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "-0.04em"
  accent:
    fontFamily: "Foundry Serif, serif"
    fontSize: "clamp(3.6rem, 7vw, 8.4rem)"
    fontWeight: 400
    lineHeight: 0.9
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Foundry Mono, monospace"
    fontSize: "0.68rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.15em"
  brand-lockup:
    fontFamily: "IMMOHRTAL Display, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 720
    lineHeight: 1
    letterSpacing: "-0.025em"
  brand-descriptor:
    fontFamily: "IMMOHRTAL Sans, sans-serif"
    fontSize: "0.52rem"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  control: "10px"
  surface: "16px"
  capsule: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "clamp(96px, 14vw, 180px)"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "16px 22px"
  button-glass:
    backgroundColor: "{colors.gunmetal-raised}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "16px 22px"
  document-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "32px"
---

# Design System: Dillon Mohr Signal Foundry

## Overview

**Creative North Star: "The Signal Foundry"**

The system treats a portfolio as a working machine rather than a gallery. Deep gunmetal space carries the IMMOHRTAL spine, kinetic mark, and live-work sequence; pale blueprint chambers interrupt it when dense proof needs daylight, precision, and longer reading.

Expression comes from editorial scale, restrained industrial labels, live browser frames, and motion with an operating purpose. The world is cinematic but never hides the work: each flourish resolves into a link, artifact, explanation, or playable edit.

**Key Characteristics:**

- Monumental condensed headlines cut with fluid serif phrases.
- Dark signal space alternating with cool blueprint proof surfaces.
- Exact IMMOHRTAL geometry as the recurring identity anchor.
- Thin instrument lines, bounded glass, and tactile depth instead of decorative chrome.
- Motion that reveals state, sequence, or authorship and always has a reduced-motion equivalent.

## Colors

The palette is a cold foundry: near-black operating space, cobalt and cyan energy, mint editorial emphasis, and cool paper for proof-heavy chambers.

### Primary

- **Electric Cyan:** The live-signal accent for progress, focus, active controls, system labels, and particle energy.
- **Cobalt Drive:** The denser action color used for button depth, particle variation, and supporting energy.

### Secondary

- **Signal Mint:** Reserved for human and editorial emphasis, especially serif phrases that soften the industrial display voice.

### Neutral

- **Foundry Ink:** The dominant dark canvas and the text color inside light chambers.
- **Gunmetal and Raised Gunmetal:** Structural layers for navigation, video, cards, and translucent operating surfaces.
- **Cool Paper and Blueprint Paper:** Proof chambers, document surfaces, and long-form visual evidence.
- **Muted Signal and Platinum:** Supporting copy, quiet logos, borders, and secondary information.

**The Charged Minority Rule.** Cyan, cobalt, and mint identify signal and state; they never become the entire surface.

**The Proof in Daylight Rule.** Dense evidence may switch to a light chamber, but the switch must feel structural and contained rather than like a separate template.

## Typography

**Display Font:** Foundry Display, built from Anton with a sans-serif fallback.
**Body Font:** The platform UI sans stack.
**Accent Font:** Foundry Serif, built from Instrument Serif.
**Label/Mono Font:** Foundry Mono, built from IBM Plex Mono.
**Brand Lockup Fonts:** IMMOHRTAL Display and IMMOHRTAL Sans, sourced from the authoritative IMMOHRTAL Marketing Solutions Unbounded and Manrope assets. These are reserved for the exact navigation lockup.

**Character:** Condensed display type delivers force and compression; the italic serif introduces movement and human judgment; mono labels make the page feel instrumented without pretending to be a terminal.

### Hierarchy

- **Display:** Regular weight, tightly tracked, sub-single line height. Used for hero statements, case-study theses, and section commands.
- **Headline:** Regular condensed display at responsive editorial scale. Used for card and proof titles.
- **Accent:** Regular serif, usually italic, at the same visual weight as nearby display text. Used for one decisive phrase, not paragraphs.
- **Body:** Regular UI sans with generous leading and a practical maximum line length near 60 characters.
- **Label:** Medium mono, small, tracked, and uppercase. Used for coordinates, metadata, navigation, and state.

**The Three-Voice Rule.** Display commands, serif interprets, mono locates. Do not make any one voice perform all three jobs.

## Layout

The page uses full-bleed experience sections wrapped around inner widths between roughly 1,380 and 1,560 pixels. Major sections breathe at a 96-to-180-pixel rhythm. The hero and proof chambers use asymmetric two-column grids; evidence walls use two-by-two or image-plus-copy arrangements.

At 820 pixels, multi-column sections collapse, navigation becomes a disclosed panel, and the logo becomes an atmospheric layer above the copy. Horizontal work cards remain deliberately swipeable. At 560 pixels, actions stack, proof tiles become single-column, and section padding tightens without reducing tap targets.

The fixed WebGL spine belongs behind content and never determines document flow. Content remains complete when the spine or particle layer is absent.

## Elevation & Depth

Depth is a hybrid of tonal layering, thin cool borders, restrained blur, and selective hard offsets. Navigation uses liquid glass; browser frames and document cards lift with bounded shadows; the particle logo and spine provide spatial depth without forcing perspective onto reading surfaces.

### Shadow Vocabulary

- **Ambient Stage:** A broad, low-opacity shadow under major light chambers and video shells.
- **Action Offset:** A short cobalt offset under primary buttons to make action feel physical.
- **Browser Lift:** A controlled shadow plus translated underlay that separates a live preview from its chamber.

**The Depth Has a Job Rule.** Blur indicates persistent glass, hard offset indicates a tactile control, and atmospheric glow indicates signal. Do not mix all three on one component.

## Shapes

Corners are restrained and functional. Controls use compact 10-pixel rounding, large bounded chambers use 16-pixel rounding, and circular geometry is reserved for waypoint dots, video selectors, and orbit lines. Browser frames keep a slim instrument bar and clipped viewport. Borders are cool, thin, and more important than shadows for structural separation.

## Components

### Buttons

- **Shape:** Compact rounded rectangle with a controlled 10-pixel radius.
- **Primary:** Cool paper on foundry ink with a cobalt physical offset.
- **Hover / Focus:** Small translation, high-contrast focus ring, and no hidden label change.
- **Secondary / Glass:** Dark translucent fill with a thin cool border; it remains quieter than the primary action.

### Chips

- **Style:** Small mono labels with thin cool borders and no decorative fill.
- **State:** Selected circular video tabs switch to electric cyan with foundry-ink text.

### Cards / Containers

- **Corner Style:** 10 pixels for portable cards, 16 pixels for large chambers.
- **Background:** Gunmetal for media and operating cards; cool paper for proof and document cards.
- **Shadow Strategy:** Lift is reserved for interactive frames and portable artifacts.
- **Border:** One-pixel cool structural line; the Align flagship outer shell uses a heavier frame.
- **Internal Padding:** Usually 24 to 32 pixels on cards, scaling upward on large proof tiles.

### Navigation

The persistent navigation is a single bounded liquid-glass rail with mono labels and one bright contact control. Mobile turns the same rail into an explicit Menu/Close disclosure; Escape closes it and focus remains visible.

### Particle Logo

The exact IMMOHRTAL logo is sampled into a bounded particle field that moves from scatter to recognition. Particle code is lazy-loaded after the primary interface, and reduced-motion or unsupported contexts receive the exact static mark.

### Live Browser Frame

Each website preview is an actual outbound link, framed by a small browser bar and a visible live-site label. Tilt is subtle, pointer-driven, and removed under reduced motion.

## Do's and Don'ts

### Do:

- **Do** use the exact IMMOHRTAL mark whenever the identity is shown.
- **Do** let every cinematic interaction resolve into useful proof or navigation.
- **Do** alternate dark experience space with bounded light proof chambers when information density changes.
- **Do** preserve keyboard, touch, reduced-motion, and static-image paths for every signature interaction.
- **Do** keep Align HCM as the flagship proof sequence while separating public work from confidential operations.

### Don't:

- **Don't** replace the identity with a generic monogram, icon library mark, or reconstructed wordmark.
- **Don't** turn the interface into a wall of glass cards or rounded capsules.
- **Don't** invent impact metrics, testimonials, awards, or client scope.
- **Don't** autoplay portfolio videos or make 3D motion a prerequisite for reading.
- **Don't** use emojis, generic dashboard chrome, or unrelated gradient decoration.
