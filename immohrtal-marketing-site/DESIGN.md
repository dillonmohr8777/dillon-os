---
name: IMMOHRTAL Marketing Solutions
description: A particle-first proof system where memorable web work resolves into clear business outcomes.
colors:
  space-ink: "#020711"
  deep-observatory: "#07101f"
  raised-gunmetal: "#0b1729"
  proof-paper: "#f3f7fb"
  proof-paper-blue: "#e8f2fb"
  platinum: "#dce4ed"
  signal-muted: "#a7bbd1"
  cobalt: "#287dff"
  signal-cyan: "#18c8ff"
  verification-mint: "#58edb2"
  proof-ink: "#06101d"
  hairline: "rgba(166, 204, 240, 0.22)"
  hairline-strong: "rgba(181, 218, 250, 0.42)"
typography:
  display:
    fontFamily: "Unbounded Variable, sans-serif"
    fontSize: "clamp(2.7rem, 6.5vw, 6rem)"
    fontWeight: 720
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Unbounded Variable, sans-serif"
    fontSize: "clamp(1.65rem, 3vw, 2.8rem)"
    fontWeight: 720
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(1rem, 1.3vw, 1.16rem)"
    lineHeight: 1.72
  label:
    fontFamily: "Foundry Mono, IBM Plex Mono, monospace"
    fontSize: "0.67rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.12em"
rounded:
  control: "10px"
  action: "12px"
  window: "14px"
  rail: "15px"
  frame: "16px"
  pill: "999px"
spacing:
  micro: "8px"
  control: "12px"
  compact: "18px"
  content: "24px"
  panel: "30px"
  section: "92px"
components:
  control-button:
    backgroundColor: "{colors.raised-gunmetal}"
    textColor: "{colors.proof-paper}"
    rounded: "{rounded.action}"
    size: "50px"
  navigation-rail:
    textColor: "{colors.platinum}"
    rounded: "{rounded.rail}"
    padding: "12px 14px 12px 20px"
    height: "76px"
  browser-frame:
    backgroundColor: "{colors.raised-gunmetal}"
    textColor: "{colors.proof-paper}"
    rounded: "{rounded.frame}"
  evidence-window:
    textColor: "{colors.platinum}"
    rounded: "{rounded.window}"
---

# Design System: IMMOHRTAL Marketing Solutions

## Overview

**Creative North Star: "Particle Proof Conveyor"**

IMMOHRTAL is a dark technical observatory built around one visual argument: proof moves first. Work begins as signal, resolves first into the exact white IMMOHRTAL mark and then into exact-color client marks, expands into live website frames and search evidence, then becomes a legible operating system. The atmosphere is cinematic and technically fluent, but every authored effect must terminate in a name, artifact, status, or action the visitor can understand without learning agency terminology first.

Cold gunmetal space carries the active system. Pale paper chambers interrupt that darkness when evidence needs daylight, establishing a strong proof-versus-process rhythm. Cobalt, cyan, and mint behave as signal colors rather than ambient decoration; platinum and muted blue-gray keep long explanations readable without flattening the hierarchy.

The world is precise, dense, and proof-led. It rejects generic agency dashboards, unsupported metric theater, and spectacle that never resolves into usable evidence.

**Key Characteristics:**

- A dark observatory alternating with pale, high-contrast proof chambers.
- A high-clarity white IMMOHRTAL particle mark followed by exact-color client marks that resolve rapidly.
- Browser frames, evidence windows, agent stations, and operating receipts as the visual vocabulary.
- Chunky geometric display type balanced by plainspoken body copy and compact mono labels.
- Motion that communicates flow, verification, and system state, with complete static fallbacks.

## Colors

The palette combines cold technical depth with bright signal accents and clean paper fields reserved for proof.

### Primary

- **Signal Cyan:** The main signal, active-link, particle, and evidence accent. Its brightness identifies movement, navigation, and system attention.
- **Cobalt Current:** The deeper brand signal used inside gradients, audit bars, and atmospheric fields.

### Secondary

- **Verification Mint:** Reserved for positive verification, visible focus, successful system states, and the terminal edge of signal gradients.

### Neutral

- **Space Ink:** The foundational page background and particle chamber.
- **Deep Observatory:** The main dark section surface behind the agent roster.
- **Raised Gunmetal:** The resting surface for controls, browser chrome, and dark containers.
- **Proof Paper:** The high-contrast light surface for operating steps and static logo fallbacks.
- **Proof Paper Blue:** The pale search-evidence field; it differentiates cited proof from general page content.
- **Platinum:** Primary text on dark technical surfaces.
- **Signal Muted:** Secondary copy, metadata, and captions on dark surfaces.
- **Proof Ink:** Primary text on paper fields.
- **Hairline / Hairline Strong:** Cool translucent boundaries that explain container structure without becoming chrome.

**The Signal Rarity Rule.** Cyan and mint identify action, evidence, or verified state. They do not wash whole sections or decorate every edge.

**The Proof in Daylight Rule.** Search captures and operating sequences move onto pale paper so evidence reads as evidence, not as another effect inside the spectacle.

## Typography

**Display Font:** Unbounded Variable (with sans-serif fallback)  
**Body Font:** Manrope Variable (with sans-serif fallback)  
**Label/Mono Font:** Foundry Mono, backed by IBM Plex Mono and monospace  
**Supporting Display Fonts:** Foundry Display and Foundry Serif remain available assets, but the implemented homepage hierarchy is owned by Unbounded.

**Character:** Unbounded gives the studio its compact, engineered conviction; Manrope makes technical positioning direct and readable; Foundry Mono turns evidence, URLs, statuses, and operating sequences into a shared instrumentation language.

### Hierarchy

- **Display** (720, fluid 2.7rem to 6rem, 0.98 line-height): Section theses and closing declarations, balanced to roughly 13 to 15 characters per line where the copy permits.
- **Hero phrase** (760, fluid 3.2rem to 6rem, 0.92 line-height): The short particle-sequence statements only, with a compact stacked shadow that reads like dimensional lettering.
- **Title** (720, fluid 1.65rem to 2.8rem, 1.05 line-height): Named website projects and major roster entries.
- **Body** (regular, fluid 1rem to 1.16rem, 1.72 line-height): Explanations constrained to roughly 60 to 67 characters where practical.
- **Label** (500, 0.62rem to 0.7rem, 0.1em to 0.15em tracking, uppercase where procedural): Evidence labels, URLs, sequence controls, indices, and operating states.

**The One Conviction Voice Rule.** Unbounded owns declarations and names. It never carries paragraph-length explanation.

**The Instrument Panel Rule.** Mono text is functional: status, source, step, URL, or evidence label. It is not a texture applied to ordinary body copy.

**The Outcome Before Acronym Rule.** Navigation, headlines, calls to action, and robot roles name the customer problem or outcome first. AEO, GEO, schema, entity, and governance language belongs in the supporting explanation or the long-form guide that defines it.

## Layout

The desktop system uses a generous 1420px content ceiling with fluid 24px to 92px side insets. Major introductions are asymmetric two-column grids: a dominant thesis at left and a narrower explanation or action at right. Long sections use 100px to 200px vertical breathing room so dense evidence assemblies can arrive as authored scenes rather than stacked cards.

Website work uses a horizontal scroll-snap rail with browser frames up to 980px wide. Search evidence uses overlapping, slightly rotated paper captures. Operating artifacts use an absolute-positioned window field, and the agent roster uses repeated two-column stations rather than a generic card grid. The closing statement returns to centered, full-viewport scale.

At 1000px, navigation collapses and all major thesis grids become one column. At 720px, controls compact to 46px, project cards occupy 88vw, proof captions stack, work windows become a single descending field, agent stations stack vertically, and system steps move to a two-column number-and-content pattern. The minimum supported width is 320px and overflow is clipped or intentionally scrollable.

**The Conveyor Rule.** Every section advances the proof sequence: trust marks, web work, search evidence, operating artifacts, agents, system, action. Reordering must preserve that causal story.

## Elevation & Depth

The system is layered rather than uniformly glassy. Most page regions are flat color fields separated by tonal change and hairlines. Elevation appears only where an object represents something inspectable: the fixed navigation rail, a browser frame, a captured search result, or a moving operating window. Atmospheric radial gradients provide scale behind hero and agent scenes without replacing structural contrast.

### Shadow Vocabulary

- **Evidence lift** (`0 32px 90px rgba(0, 0, 0, 0.34)`): Browser frames and elevated navigation surfaces.
- **Paper proof lift** (`0 44px 100px rgba(18, 43, 65, 0.20)`): Google AI Overview captures over the pale proof field.
- **Operating-window lift** (`0 30px 80px rgba(0, 0, 0, 0.42)`): Floating audit, entity, and CRM windows.
- **Signal action lift** (`0 12px 34px rgba(24, 200, 255, 0.20)`): Cyan calls to action at rest, strengthening on hover.

**The Artifact Elevation Rule.** Shadows belong to inspectable artifacts or active controls. Ordinary copy sections stay flat.

## Shapes

The form language is engineered but not severe. Navigation, windows, controls, and browser frames use consistent gentle corners from 10px to 16px, while status chips and progress bars use full pills. The particle chamber's oversized rotated ellipse is a singular spatial boundary, not a reusable card shape. Evidence captures may rotate by only a few degrees to signal physical layering while keeping the source legible.

Hairlines are cool, translucent, and structural. Circular geometry is reserved for point signals, entity hubs, particles, and agent grounding glows.

**The One Container, One Radius Rule.** Use the established 10px control, 12px action, 14px window, 15px rail, and 16px frame steps instead of introducing near-duplicate corner values.

## Components

### Primary Calls to Action

- **Shape:** Gently compact action corners (12px) with at least a 50px target height.
- **Primary:** A vertical cyan gradient with Space Ink text, strong Manrope weight, and a small directional arrow.
- **Hover / Focus:** Lift by 3px with a stronger cyan shadow; use the global 3px mint focus outline and 4px offset for keyboard focus.
- **Placement:** One compact action in the fixed rail and one centered action in the final section.

### Icon Controls

- **Shape:** Square 50px controls with 12px corners; 46px at the compact breakpoint.
- **Resting state:** Raised Gunmetal, Platinum icon, and a strong cool hairline.
- **Hover / Focus:** Cyan boundary and slight upward movement; the same mint focus treatment as every interactive element.

### Navigation Rail

- **Style:** A fixed three-column glass-gunmetal rail with the exact IMMOHRTAL mark, centered navigation, and an action at right.
- **Desktop:** 76px minimum height, 15px corners, cool translucent boundary, and restrained blur.
- **Mobile:** Compact wordmark, menu control, icon-only action, and a fully bounded popover menu below the rail.

### Browser Frames

- **Corner Style:** Broad but technical frame corners (16px).
- **Background:** Raised Gunmetal with a darker browser bar and pale source URL.
- **State:** The page preview scales only 1.025 on hover; the effect invites inspection without falsifying motion inside the source site.
- **Proof behavior:** Every frame links to the real project and preserves an explicit live-site label.

### Chips

- **Style:** Transparent background, cool hairline boundary, full-pill shape, and Platinum text.
- **Use:** Project disciplines and factual categories only; never as decorative filler.

### Evidence Windows

- **Corner Style:** 14px windows with internal header and receipt divisions.
- **Background:** Translucent dark gunmetal with blur, cool hairlines, Cyan header state, Mint terminal output, and Muted receipts.
- **Motion:** Three slow alternate drift paths create a living workflow. They stop effectively under reduced motion.
- **Integrity:** Illustrative values must be labeled illustrative; real evidence retains source, date, and change caveat.

### Client Particle Sequence

- **Structure:** One persistent WebGL particle field resolves the exact IMMOHRTAL mark in white, runs through 21 verified public-safe marks, bridges to the invitation, and builds “YOU” from the same system.
- **Color:** The house mark preserves its exact alpha silhouette in pure white. Client and partner marks preserve their sampled source RGB and alpha without tinting or normalization.
- **Control:** Pause and replay remain visible; status announcements update for assistive technology.
- **Fallback:** Reduced motion or loading failure produces a complete static logo grid and a high-clarity “YOU” conclusion.

### Agent Stations

- **Structure:** Repeated full-width rows with a visual worker bay and a named plain-language job, responsibility, personality line, and receipt.
- **Depth:** The shared robot canvas sits behind the copy layer; static line-art workers remain available as the fallback.
- **Personality:** Scout is curious and scanner-led, Atlas is calm and orbital, Forge is broad and tool-driven, Relay is fast and signal-led, and Proof is skeptical with a monocle and shield. Silhouette, props, motion, and temperament must all differ.
- **Integrity:** A worker appears only when its public role maps to real bounded infrastructure.

## Do's and Don'ts

### Do:

- **Do** make proof visible before explaining the method.
- **Do** use Cyan, Cobalt, and Mint to describe signal, action, flow, and verification.
- **Do** move evidence inside browser frames, captured-paper layers, operating windows, or named agent stations.
- **Do** lead with a better website, getting found, less busywork, or another customer outcome before naming the technical discipline.
- **Do** preserve the exact house-logo geometry and transparency in white, and preserve exact client-mark colors and transparency.
- **Do** label illustrative interfaces and time-sensitive search evidence honestly.
- **Do** provide pause, keyboard focus, reduced-motion, and no-WebGL paths that retain the complete story.

### Don't:

- **Don't** turn the page into a generic grid of glass cards or an interchangeable agency dashboard.
- **Don't** add unsupported metrics, testimonials, client counts, system status, or autonomous-operation claims.
- **Don't** use accent color as an ambient wash when no signal, action, or state is present.
- **Don't** let motion obscure source material, delay access to proof, or continue without a useful final state.
- **Don't** use mono labels as a decorative substitute for clear body copy.
- **Don't** make a visitor decode AEO, GEO, entities, schema, bounded agents, or governance language before they understand what improves for their business.
- **Don't** introduce a new display family, radius step, or shadow vocabulary without updating this system intentionally.
