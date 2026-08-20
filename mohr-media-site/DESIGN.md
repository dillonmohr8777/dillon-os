---
name: Immortal Kinetic Proof
description: An experience-led portfolio system that turns finished HCM work into a live prospect demonstration.
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
  action-cyan-top: "#49dcff"
  action-cyan-base: "#18bde9"
  signal-mint: "#58edb2"
typography:
  experience-display:
    fontFamily: "Unbounded Variable, sans-serif"
    fontSize: "clamp(3.8rem, 7.5vw, 8.4rem)"
    fontWeight: 760
    lineHeight: 0.92
    letterSpacing: "-0.065em"
  interface:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 590
    lineHeight: 1.4
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
rounded:
  control: "10px"
  action: "12px"
  rail: "15px"
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
  navigation-rail:
    backgroundColor: "rgba(5, 16, 34, 0.9)"
    textColor: "{colors.paper}"
    typography: "{typography.interface}"
    rounded: "{rounded.rail}"
    height: "78px"
  prospect-statement:
    textColor: "{colors.paper}"
    typography: "{typography.experience-display}"
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

# Design System: Immortal Kinetic Proof

## Overview

**Creative North Star: "The Need Momentum Mirror"**

This Experience surface borrows the proven interaction grammar of the approved Need Momentum homepage while preserving the Immortal identity and Dillon's portfolio evidence. It opens with a prospect-specific claim, proves the Align HCM result through the exact Align mark, then transforms the same visual language into a direct HRchitect possibility.

Deep gunmetal space carries the prospect sequence, full IMMOHRTAL particle mark, and live-work sequence; pale blueprint chambers interrupt it when dense proof needs daylight, precision, and longer reading. The ambient particle spine is an intentional spatial layer. It remains behind content and never becomes a substitute for hierarchy or proof.

Expression comes from editorial scale, restrained industrial labels, live browser frames, and motion with an operating purpose. The world is cinematic but never hides the work: each flourish resolves into a link, artifact, explanation, or playable edit.

**Key Characteristics:**

- Dimensional Unbounded statements for the experience opener and Immortal hero.
- Manrope navigation and interface copy that match the pinned interaction reference.
- Monumental Anton headlines cut with Instrument Serif phrases in downstream proof sections.
- Dark signal space alternating with cool blueprint proof surfaces.
- Exact IMMOHRTAL geometry as the recurring identity anchor.
- Substantial instrument frames, bounded glass, and tactile depth instead of decorative chrome.
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

**Experience Display Font:** Unbounded Variable. Used for the prospect opener, brand lockup, and primary Immortal command.
**Interface Font:** Manrope Variable. Used for the persistent rail, controls, and supporting interface copy.
**Display Font:** Foundry Display, built from Anton with a sans-serif fallback. Retained for downstream portfolio and case-study sections.
**Body Font:** Manrope Variable where the mirrored shell owns the surface; the platform UI sans stack remains available in legacy proof modules.
**Accent Font:** Foundry Serif, built from Instrument Serif.
**Label/Mono Font:** Foundry Mono, built from IBM Plex Mono.

**Character:** Condensed display type delivers force and compression; the italic serif introduces movement and human judgment; mono labels make the page feel instrumented without pretending to be a terminal.

### Hierarchy

- **Experience Display:** Heavy Unbounded with tight tracking, dimensional shadows, and sub-single line height. Used only for the top prospect statements and Immortal hero command.
- **Interface:** Manrope at medium to bold weights. Used for navigation, brand lockup, controls, and concise supporting copy.
- **Display:** Regular Anton, tightly tracked, sub-single line height. Used for downstream case-study theses and section commands.
- **Headline:** Regular condensed display at responsive editorial scale. Used for card and proof titles.
- **Accent:** Regular serif, usually italic, at the same visual weight as nearby display text. Used for one decisive phrase, not paragraphs.
- **Body:** Regular UI sans with generous leading and a practical maximum line length near 60 characters.
- **Label:** Medium mono, small, tracked, and uppercase. Used for coordinates, metadata, navigation, and state.

**The Four-Voice Rule.** Unbounded commands at the experience level, Manrope guides interaction, Anton commands inside the portfolio, serif interprets, and mono locates. Keep each voice within its assigned layer.

## Layout

The page uses full-bleed experience sections wrapped around inner widths between roughly 1,380 and 1,560 pixels. Major sections breathe at a 96-to-180-pixel rhythm. The hero and proof chambers use asymmetric two-column grids; evidence walls use two-by-two or image-plus-copy arrangements.

At 820 pixels, multi-column sections collapse, navigation becomes a disclosed panel, and the logo becomes an atmospheric layer above the copy. Horizontal work cards remain deliberately swipeable. At 560 pixels, actions stack, proof tiles become single-column, and section padding tightens without reducing tap targets.

The fixed WebGL spine belongs behind content and never determines document flow. The blueprint grid used in the downloadable-document vault is a functional artifact cue and a narrow detector exception, not a general page background. Content remains complete when the spine or particle layer is absent.

## Elevation & Depth

Depth is a hybrid of tonal layering, decisive cool borders, restrained blur, and selective hard offsets. Navigation uses liquid glass; browser frames and document cards lift with bounded shadows; the particle logo and spine provide spatial depth without forcing perspective onto reading surfaces.

### Shadow Vocabulary

- **Ambient Stage:** A broad, low-opacity shadow under major light chambers and video shells.
- **Action Offset:** A short cobalt offset under primary buttons to make action feel physical.
- **Browser Lift:** A controlled shadow plus translated underlay that separates a live preview from its chamber.

**The Depth Has a Job Rule.** Blur indicates persistent glass, hard offset indicates a tactile control, and atmospheric glow indicates signal. Do not mix all three on one component.

## Shapes

Corners are restrained and functional. Controls use compact 10-pixel rounding, the action control uses 12 pixels, the pinned navigation rail uses 15 pixels, and large bounded chambers use 16 pixels. Circular geometry is reserved for waypoint dots, video selectors, and orbit lines. Browser frames keep a slim instrument bar and clipped viewport. Primary proof frames use two or three pixel cool borders. The mirrored header and its mobile menu intentionally use one-pixel strokes because those dimensions are part of the approved Need Momentum reference, not a weakening of the general structural-frame rule.

**The Structural Frame Rule.** Major proof surfaces and section boundaries use visible two or three pixel strokes. Thin rules may organize content but never run through or crowd a brand mark. The single-pixel mirrored navigation frame is the sole pinned-reference exception.

## Components

### Buttons

- **Shape:** Compact rounded rectangle with a controlled 10-pixel radius.
- **Primary:** Cool paper on foundry ink with a cobalt physical offset.
- **Hover / Focus:** Small translation, high-contrast focus ring, and no hidden label change.
- **Secondary / Glass:** Dark translucent fill with a two pixel cool border; it remains quieter than the primary action.

### Chips

- **Style:** Small mono labels with two pixel cool borders and no decorative fill.
- **State:** Selected circular video tabs switch to electric cyan with foundry-ink text.

### Cards / Containers

- **Corner Style:** 10 pixels for portable cards, 16 pixels for large chambers.
- **Background:** Gunmetal for media and operating cards; cool paper for proof and document cards.
- **Shadow Strategy:** Lift is reserved for interactive frames and portable artifacts.
- **Border:** Two pixel cool structural frame; flagship outer shells may use three or four pixels.
- **Internal Padding:** Usually 24 to 32 pixels on cards, scaling upward on large proof tiles.

### Navigation

The persistent navigation exactly follows the approved Need Momentum geometry: 18-pixel desktop side offsets, 20-pixel top offset, 78-pixel minimum height, 15-pixel radius, and a one-pixel cool stroke. Its action uses a 12-pixel radius and the vertical cyan gradient from #49dcff to #18bde9. At 820 pixels and below, the rail uses 12-pixel side offsets and a 68-pixel minimum height. The mobile disclosure is a centered 120-pixel-wide vertical menu with a 46-pixel square Menu/Close control; Escape closes it and focus remains visible.

### Prospect Proof Sequence

The page opens in this exact order and then loops: "I did this for" for 1.8 seconds, the Align HCM logo for 5 seconds, "I can do it for" for 1.8 seconds, the HRchitect logo for 5 seconds, then a 0.9-second reset gap. Each logo uses the same camera, scene, and optical target width. Both marks converge from a right-origin particle field, stay fully resolved for 3.07 seconds, and dissolve without clipping. The local transparent assets preserve official artwork and backgrounds remain removed. Reduced motion replaces the loop with a static two-logo proof statement.

### Client Logo Rail

Client marks appear in their exact brand colors on individual cool paper stages. Marks are never desaturated, recolored, or separated by lines that can visually collide with their artwork. Each stage provides generous clear space, consistent optical height, and an unhurried continuous rail with a static responsive grid under reduced motion.

### Particle Logo

The complete 1000 by 912 IMMOHRTAL artwork, including the monogram, infinity form, and wordmark, is sampled with stratified alpha-mask selection so every region remains represented. It uses 36,000 particles on desktop and 24,000 on mobile across platinum, cobalt, cyan, and mint energy colors. The mark moves from scatter to convergence, holds as one fully legible identity, then dissolves without orbital rings or cropped geometry. Particle code is lazy-loaded after the primary interface, and reduced-motion contexts receive a settled particle rendering of the same complete mark.

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
