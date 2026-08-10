---
name: Prospect Radar Cinematic Scroll Trio
description: Three material transformation worlds told through self-hosted editorial type, distributed cinematic frames, and scroll-driven 3D.
colors:
  night-ink: "#07090a"
  gallery-paper: "#f5f2ea"
  gallery-paper-dim: "rgba(245, 242, 234, 0.7)"
  maclaren-sage: "#8aae98"
  maclaren-blue: "#1e70b8"
  golden-yellow: "#ffc90e"
  golden-brass: "#d99b12"
  morton-cyan: "#4bd8e4"
  morton-heat: "#ff9a45"
  morton-ground: "#031014"
  action-ink: "#07100f"
  line-soft: "rgba(255, 255, 255, 0.16)"
  line-mid: "rgba(255, 255, 255, 0.22)"
  white-strong: "rgba(255, 255, 255, 0.7)"
  lab-ground: "#11100e"
  lab-amber: "#ffbd6d"
typography:
  display:
    fontFamily: "Lab Display, Georgia, serif"
    fontSize: "clamp(4rem, 7.5vw, 7.6rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "-0.03em"
  facet-display:
    fontFamily: "Facet Display, Lab Display, sans-serif"
    fontSize: "clamp(4rem, 7.5vw, 7.6rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "-0.03em"
  action-word:
    fontFamily: "Lab Display, Georgia, serif"
    fontSize: "clamp(5.5rem, 14.8vw, 14.5rem)"
    fontWeight: 400
    lineHeight: 0.7
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Lab Display, Georgia, serif"
    fontSize: "clamp(3.1rem, 5.2vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 0.93
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Lab Text, Arial, sans-serif"
    fontSize: "clamp(14px, 1.15vw, 17px)"
    fontWeight: 400
    lineHeight: 1.75
  support:
    fontFamily: "Lab Text, Arial, sans-serif"
    fontSize: "clamp(13px, 1.05vw, 16px)"
    fontWeight: 400
    lineHeight: 1.65
  micro:
    fontFamily: "Lab Text, Arial, sans-serif"
    fontSize: "clamp(7px, 0.6vw, 9px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.18em"
  label:
    fontFamily: "Lab Text, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
spacing:
  xs: "12px"
  sm: "18px"
  md: "24px"
  lg: "32px"
  xl: "64px"
  page: "clamp(24px, 5.5vw, 96px)"
components:
  primary-action:
    backgroundColor: "{colors.maclaren-sage}"
    textColor: "{colors.night-ink}"
    typography: "{typography.label}"
    padding: "0 19px"
    height: "46px"
  secondary-action:
    backgroundColor: "transparent"
    textColor: "{colors.gallery-paper}"
    typography: "{typography.label}"
    padding: "0 19px"
    height: "46px"
---

# Design System: Prospect Radar Cinematic Scroll Trio

## Overview

**Creative North Star: "The Material Transformation Stage"**

The system behaves like a dark exhibition space in which one business-specific material world is progressively revealed. Editorial HTML remains readable and controlled while a persistent cinematic plate, transparent foreground layer, WebGL atmosphere, technical HUD, and authored camera path create depth behind it. Six generated editorial frames per route are distributed across the inset, alternating chapters, final reveal, and source boundary rather than stacked as a gallery. The three routes share one motion grammar but never one costume: MacLaren is architectural and cool, Golden Eagle is mineral and luminous, and Morton is aquatic with visible heat and utility.

This is a persuasive experience surface, not an application dashboard. It favors oversized action words, deliberate empty space, hard editorial edges, restrained controls, and proof that arrives in a four-beat scroll sequence. Generated visuals support the concept; verified brand assets and factual caveats remain distinct from the imagined world.

**Key Characteristics:**

- Fixed full-viewport cinematic stage behind scrolling editorial chapters.
- Six route-specific editorial frames paced across the full homepage.
- Dark opening states that withhold the completed transformation.
- Brand-specific accent pairs, materials, light, and camera choreography.
- Square, border-led components and a measured reticle HUD with no ornamental pill language.
- Reduced-motion and static fallback modes that resolve to the final legible composition.

## Colors

The shared canvas is nearly black with warm paper text; each route owns a narrow two-color signal used for focus, progress, labels, and transformation lighting.

### Primary

- **Night Ink** (`#07090a`): The shared stage, scrim, and atmospheric ground.
- **Gallery Paper** (`#f5f2ea`): Primary editorial copy and the bright source-verification panel.

### Secondary

- **MacLaren Sage / Blue** (`#8aae98` / `#1e70b8`): Calm joinery, daylight, and architectural resolution.
- **Golden Yellow / Brass** (`#ffc90e` / `#d99b12`): Facet highlights, setting metal, and jewelry cues.
- **Morton Cyan / Heat** (`#4bd8e4` / `#ff9a45`): Water flow contrasted with copper and thermal energy.

### Neutral

- **Gallery Paper Dim** (`rgba(245, 242, 234, 0.7)`): Supporting copy, source notes, and quiet metadata.
- **Lab Ground** (`#11100e`): The Scroll Lab index background.
- **Lab Amber** (`#ffbd6d`): Lab focus and boundary emphasis.

**The Narrow Signal Rule.** A route uses only its assigned accent pair; never mix accent palettes across businesses.

## Typography

**Display Font:** Lab Display with Georgia fallback

**Body Font:** Lab Text with Arial fallback

**Facet Display:** Facet Display with Lab Display fallback on Golden Eagle only

**Character:** Broad editorial display forms give the work cinematic scale, while compact sans-serif labels make the system feel authored and technical. Golden Eagle alone receives the cut, gemstone-like Facet Display treatment.

### Hierarchy

- **Display** (400, `clamp(4rem, 7.5vw, 7.6rem)`, 0.82): Route hero statements, limited to roughly 12 characters per line.
- **Headline** (400, `clamp(3.1rem, 5.2vw, 5.5rem)`, 0.93): Chapter and verification titles.
- **Action word** (400, `clamp(5.5rem, 14.8vw, 14.5rem)`, 0.70): One oversized verb crossing the lower frame.
- **Body** (400, `clamp(14px, 1.15vw, 17px)`, 1.75): Narrative copy, capped around 60 characters.
- **Support** (400, `clamp(13px, 1.05vw, 16px)`, 1.65): Hero context and short explanatory copy.
- **Micro / Label** (400-700, 7-10px, 1.2): Uppercase navigation, frame indices, HUD readouts, steps, controls, and source metadata with wide tracking.

**The One Giant Word Rule.** Each route gets one oversized action word per hero; do not stack multiple display gimmicks in the same frame.

**The No Eyebrow Rule.** Do not place a kicker or eyebrow immediately above a heading; context belongs in body copy, the scene readout, or a frame caption.

## Layout

The route shell is a fixed 100svh scene with a header and progress rail above it. The hero and each chapter consume at least a viewport; chapters extend to 112svh so the damped camera has room to travel. Copy occupies 43-47vw on desktop and alternates left and right. Selected chapters add one hard-edged editorial frame in the opposing field; intervening chapters remain type-and-motion led so images never form a consecutive gallery wall. A separate 110svh final frame provides the last wide reveal.

Page gutters use `clamp(24px, 5.5vw, 96px)`. The header collapses at 960px, and the stage becomes a mobile editorial crop below 680px. On narrow screens the copy widens, secondary navigation disappears, chapter frames become compact upper-field studies, and the plate/camera framing shifts to keep the subject clear without horizontal overflow. The verification panel is sized to the remaining viewport above the 112px footer, with header-aware top padding, so the prior cinematic frame never bleeds into the final state.

## Elevation & Depth

Depth comes from compositing, not card shadows: far cinematic plate, soft WebGL atmosphere, transparent near-plane image, scrims, fog, particles, film grain, and a thin measured HUD. The opening plate is darker, desaturated, and slightly enlarged; scroll increases reveal, brightness, saturation, and WebGL prominence while the camera moves along separate position and target curves. The HUD axes scale and the reticle rotates from the shared scroll progress without becoming primary chrome.

Shadows are ambient and image-motivated. Use `0 24px 65px rgba(0,0,0,.32)` for the hero inset and `0 14px 42px rgba(0,0,0,.48)` for display text over imagery. Bloom is restrained and belongs only to luminous scene elements.

**The World Before Chrome Rule.** Interface styling must remain subordinate to the material transformation and cannot become a floating-card layer over the scene.

## Shapes

The system is intentionally square and architectural. Actions, panels, image crops, logos, and ledgers use hard edges; separation comes from fine 1px borders and clipping masks. Radial shapes belong to light, fog, and the near-plane mask, not to interface containers.

## Components

### Fixed Brand Header

A transparent-to-dark fixed header contains the verified brand lockup, small uppercase navigation, and lab return. Official marks sit on their required backing; text-only identity remains text-only when no authentic mark is available.

### Primary and Secondary Actions

Primary actions are solid route-accent rectangles with uppercase labels and a 46px minimum height. On hover they lift 3px and switch to Gallery Paper. Secondary actions use a simple lower border and adopt the route accent on hover. Both retain a 2px accent focus ring with 5px offset.

### Hero Inset

A small square frame uses the second editorial sequence image rather than repeating the hero plate. It uses a fine white border, inner keyline, frame index, reticle, ambient shadow, concise label, and slight scroll counter-motion. It is evidence of the world, not a generic card.

### Scene HUD

Two hairline axes, a route-accent reticle, and a compact lens/state readout sit over the scene's visual field. The HUD is decorative and hidden below 680px; it never carries information required to understand or act on the page.

### Editorial Chapter Frame

Selected chapters pair copy with one portrait-oriented crop from the route's six-frame sequence. A single route-accent rule, restrained ambient shadow, frame number, and material caption make the frame feel authored without turning it into a card grid.

### Final Reveal Frame

The sixth editorial frame expands inside a nearly full-viewport black field with one fine border and oversized Lab Display closure. It is separated from the scrolling chapters so the final reveal reads as a deliberate endpoint rather than another content tile.

### Chapter Ledger

Technical details are arranged as border-led definition rows: compact accent labels at left, quiet copy at right. The ledger never receives a filled card background.

### Source Verification Panel

The final panel inverts to Gallery Paper with near-black text. It cleanly separates conceptual imagery from verified sources, caveats, and outbound actions. A low-opacity environmental process frame sits at the lower edge; source labels use a darkened accent mix that remains above WCAG AA on Gallery Paper.

## Do's and Don'ts

### Do:

- **Do** preserve the shared four-shot scroll grammar while giving each business its own materials, lighting, and camera framing.
- **Do** use verified official brand art exactly as sourced and keep provenance notes with the build.
- **Do** use the six-frame route sequence as spaced editorial evidence: inset, selected chapters, final reveal, and quiet source accent.
- **Do** make the opening, midpoint, and final frames materially different states of one transformation.
- **Do** resolve reduced-motion and WebGL-fallback users to a complete, legible final composition.
- **Do** keep touch targets at least 46px high and preserve visible keyboard focus.

### Don't:

- **Don't** copy Kage code, artwork, Japanese motifs, or decorative costume.
- **Don't** invent a logo when authentic brand artwork cannot be verified.
- **Don't** reveal the finished room, ring, or pool system in full at the opening frame.
- **Don't** introduce rounded cards, dashboard chrome, stock gradients, or interchangeable route styling.
- **Don't** place kickers or eyebrows above headings, or bake typography and logos into generated imagery.
- **Don't** let WebGL become required for understanding the brand, copy, source boundary, or action.
