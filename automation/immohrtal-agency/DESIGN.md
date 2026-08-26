---
name: IMMOHRTAL Agency Operating Layer
description: A dark evidence observatory where every visible state resolves to a current receipt, blocker, or next action.
colors:
  space-ink: "#020711"
  deep-observatory: "#07101f"
  raised-gunmetal: "#0b1729"
  proof-paper: "#f3f7fb"
  platinum: "#dce4ed"
  signal-muted: "#a7bbd1"
  signal-cyan: "#18c8ff"
  verification-mint: "#58edb2"
  cobalt-current: "#287dff"
  attention-amber: "#ffc56e"
  blocked-coral: "#ff8d8d"
  hairline: "rgba(166, 204, 240, 0.22)"
  hairline-strong: "rgba(181, 218, 250, 0.42)"
  evidence-shadow: "rgba(0, 0, 0, 0.34)"
  worker-shadow: "rgba(0, 0, 0, 0.44)"
  control-shadow: "rgba(0, 0, 0, 0.28)"
typography:
  display:
    fontFamily: "Unbounded Variable, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 5rem)"
    fontWeight: 720
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Unbounded Variable, sans-serif"
    fontSize: "clamp(1.55rem, 3vw, 2.8rem)"
    fontWeight: 720
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Foundry Mono, IBM Plex Mono, monospace"
    fontSize: "0.67rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  control: "10px"
  action: "12px"
  window: "14px"
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
  status-chip:
    textColor: "{colors.platinum}"
    rounded: "{rounded.pill}"
    padding: "6px 9px"
  evidence-window:
    backgroundColor: "{colors.raised-gunmetal}"
    textColor: "{colors.platinum}"
    rounded: "{rounded.window}"
    padding: "24px"
  control-button:
    backgroundColor: "{colors.raised-gunmetal}"
    textColor: "{colors.proof-paper}"
    rounded: "{rounded.action}"
    height: "44px"
---

# Design System: IMMOHRTAL Agency Operating Layer

## Overview

**Creative North Star: "Particle Proof Conveyor"**

The operating layer is the internal expression of the established IMMOHRTAL
visual world. It behaves like a dark evidence observatory: work is visible as
signal, moves through named stations, and terminates in an exact receipt,
blocker, or next action. The atmosphere may feel alive, but the interface must
never confuse authored motion with proof that a worker is online.

Operate mode governs this surface. Scanability, current source time, exception
visibility, keyboard access, and truthful state labels outrank spectacle. The
cyan and mint signal system, gunmetal surfaces, inspectable windows, and agent
stations preserve continuity with the public IMMOHRTAL site.

**Key Characteristics:**

- Dark observatory surfaces with bright, rare state signals.
- Full-width work lanes and named stations instead of generic card grids.
- Geometric workers whose movement explains a real board or receipt change.
- Clear separation between live local data, receipt replay, and unobserved runtime.
- Complete static and reduced-motion interpretations of every state.

## Colors

Cold technical depth carries the floor while cyan, mint, amber, and coral mark
distinct operational meanings.

### Primary

- **Signal Cyan:** Active feed, movement path, selection, and current attention.
- **Cobalt Current:** Deeper energy inside data-flow and route treatments.

### Secondary

- **Verification Mint:** Verified work, keyboard focus, and successful checks.
- **Attention Amber:** Review-ready work and evidence that needs a human decision.
- **Blocked Coral:** Blocking state only, never general decoration.

### Neutral

- **Space Ink:** Page and floor background.
- **Deep Observatory:** Main control-room surface.
- **Raised Gunmetal:** Inspectable workstations, receipts, and controls.
- **Proof Paper:** High-contrast evidence and static fallbacks.
- **Platinum:** Primary text on dark surfaces.
- **Signal Muted:** Secondary copy, timestamps, and operational metadata.
- **Hairline / Hairline Strong:** Structural boundaries without ornamental chrome.

**The Signal Rarity Rule.** Accent color must identify action, evidence, or
state. It never becomes an ambient wash.

**The State Color Rule.** Cyan means active data, mint means verified, amber
means review, and coral means blocked. Do not reuse those colors casually.

## Typography

**Display Font:** Unbounded Variable (with sans-serif fallback)
**Body Font:** Manrope Variable (with sans-serif fallback)
**Label/Mono Font:** Foundry Mono, backed by IBM Plex Mono and monospace

**Character:** Unbounded supplies engineered conviction, Manrope keeps dense
operational copy readable, and the mono face is reserved for measurement,
status, source, and time.

### Hierarchy

- **Display** (720, fluid 2.25rem to 5rem, 0.98): The office thesis only.
- **Title** (720, fluid 1.55rem to 2.8rem, 1.05): Floor and major workstream names.
- **Body** (400, 1rem, 1.55): Explanations limited to roughly 65 to 75 characters.
- **Label** (500, 0.67rem, 0.08em tracking): State, source, time, and controls.

**The Instrument Panel Rule.** Mono type is functional. It does not costume
ordinary body copy as technical.

The floor map has a narrow instrument-label exception from 0.48rem to 0.92rem.
Those values are reserved for worker tags, source time, and station telemetry
inside the spatial map. They do not extend the page hierarchy or body-copy ramp.

## Layout

The desktop office uses a 1480px ceiling and a two-level composition: a compact
truth header followed by a large spatial floor. Workstations occupy stable map
positions so movement communicates continuity rather than decoration. The
exception ledger and closeout remain linear below the floor for rapid reading.

Below 1100px, the map reduces density and supporting panels stack. Below 720px,
the spatial floor becomes a horizontal route strip plus an accessible agent
activity list. The minimum supported width is 320px, and no essential state is
available only through hover or animation.

**The Fixed Geography Rule.** A station keeps one operational meaning at every
viewport. Responsive layouts may rearrange the map but never rename a state.

## Elevation & Depth

Depth is structural. Most surfaces are flat tonal layers with cool hairlines.
Wide, soft shadows appear only under inspectable evidence or a focused control.

### Shadow Vocabulary

- **Evidence lift** (`0 32px 90px rgba(0, 0, 0, 0.34)`): Receipt and workstation inspection.
- **Control lift** (`0 12px 34px rgba(24, 200, 255, 0.20)`): Active controls only.

**The Artifact Elevation Rule.** Ordinary text and layout regions stay flat.
Only an inspectable artifact or active control earns a shadow.

## Shapes

Controls use 10px to 12px corners, evidence windows use 14px, and major frames
use 16px. Pills are reserved for short state controls. Circular geometry is
reserved for signals, route nodes, and worker joints.

**The One Container, One Radius Rule.** Use the established radius steps rather
than introducing visually indistinguishable variants.

Robot joints and visor geometry are illustrative primitives, not containers.
They may use circular or sub-10px geometry while controls, windows, frames, and
content surfaces remain on the documented radius scale.

## Components

### Control Buttons

- **Shape:** Compact action corners (12px) with at least a 44px target height.
- **Resting state:** Raised Gunmetal with Platinum text and a strong cool hairline.
- **Hover / Focus:** Cyan boundary, small lift, and the global 3px mint focus ring.
- **Use:** Pause replay, refresh state, and inspect evidence.

### Status Chips

- **Style:** Transparent or tonal background, one hairline, full-pill shape.
- **State:** Cyan for live local data, mint for verified, amber for review,
  coral for blocked, and muted for unobserved or static.

### Evidence Windows

- **Corner Style:** 14px with separate source, state, and timestamp regions.
- **Background:** Raised Gunmetal on the observatory floor.
- **Integrity:** Every value has a source time and an explicit does-not-prove boundary.

### Agent Stations

- **Structure:** A named workstation, one geometric worker, current board item,
  runtime evidence state, blocker, and next action.
- **Motion:** A worker moves only for a received state change or a clearly
  labeled receipt replay. Idle movement must not imply that a process is online.
- **Fallback:** Reduced motion shows the destination and route as static geometry.

### Exception Ledger

- **Structure:** Linear rows for item, owner, state, blocker, and next action.
- **Priority:** Blocked work remains visible without competing with the floor.

## Do's and Don'ts

### Do:

- **Do** show the source time and feed mode next to every live claim.
- **Do** move workers between fixed, named operational stations.
- **Do** keep blockers, next actions, and runtime evidence readable without motion.
- **Do** preserve the established IMMOHRTAL palette, type hierarchy, and focus ring.
- **Do** pause nonessential motion when the page is hidden or reduced motion is set.

### Don't:

- **Don't** label a worker online without a current process receipt.
- **Don't** turn receipt replay into an autonomous-operation claim.
- **Don't** use fake metrics, progress rings, or decorative activity streams.
- **Don't** hide a blocker inside a moving scene or require pointer hover to read it.
- **Don't** introduce a new type family, radius step, or status-color meaning casually.
