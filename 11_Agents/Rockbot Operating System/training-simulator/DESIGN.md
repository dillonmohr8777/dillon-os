---
name: "Protocol 54"
description: "A laboratory protocol bench for teaching and verifying Dillon's operating routines."
colors:
  protocol-ink: "#162231"
  lab-paper: "#f7fbff"
  work-surface: "#ffffff"
  muted-reading: "#526578"
  ruled-line: "#b7c7d8"
  action-cobalt: "#164f9c"
  action-cobalt-deep: "#0c356b"
  verified-ink: "#137152"
  verified-wash: "#d8f3e8"
  boundary-wash: "#fff0d3"
typography:
  display:
    fontFamily: "IBM Plex Sans Condensed, sans-serif"
    fontSize: "clamp(1.45rem, 2.2vw, 2.35rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans Condensed, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  status: "6px"
  control: "8px"
  panel: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action-cobalt}"
    textColor: "{colors.work-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.action-cobalt-deep}"
    textColor: "{colors.work-surface}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "42px"
  button-secondary:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.action-cobalt-deep}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "42px"
  input-search:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.protocol-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
    height: "42px"
---

# Design System: Protocol 54

## Overview

**Creative North Star: "The Protocol Bench"**

Protocol 54 feels like a clean working laboratory in which each routine is a
repeatable procedure and every claim leaves evidence. The interface is dense
enough for an operator, but hierarchy comes from one large work surface, a
fixed reading order, and explicit ruled state rather than a wall of equal
cards. Cobalt marks action, green marks reproduced proof, and amber marks the
place where authority changes.

The world is precise without becoming sterile or generic. Self-hosted IBM Plex
type gives headings the compression of equipment labels while body text remains
comfortable for long operational instructions.

**Key Characteristics:**

- One routine, one visible procedure, one evidence tray.
- Laboratory surfaces and ledger rules, not decorative dashboard cards.
- State is written in precise language and backed by a reproducible check.
- Approval boundaries remain visible throughout the task.
- Desktop preserves simultaneous context; narrow screens preserve critical
  reading order through stacking.

## Colors

The palette uses cool paper and graphite as the working field, with cobalt for
action, green for verified state, and amber only where safety or authority is
being communicated.

### Primary

- **Action Cobalt:** Primary controls, selected routines, and the active stage.
- **Deep Cobalt:** Persistent headers and primary-control hover state.

### Secondary

- **Verified Ink and Wash:** Reproduced checks, completed stages, and sealed
  receipts.
- **Boundary Wash:** Approval boundaries and synthetic-safety notices.

### Neutral

- **Protocol Ink:** Primary text and the masthead field.
- **Lab Paper and Work Surface:** The measured background and active work area.
- **Muted Reading:** Supporting operational text.
- **Ruled Line:** Dividers, ledger rows, and measurement structure.

### Named Rules

**The One Live Boundary Rule.** Amber appears only where a viewer must understand
that a privacy, approval, or external-action boundary is active.

**The Evidence Before State Rule.** Green never means hopeful, configured, or
in progress; it appears only after the represented check has completed.

## Typography

**Display Font:** IBM Plex Sans Condensed, self-hosted WOFF2

**Body Font:** IBM Plex Sans, self-hosted WOFF2

**Character:** Condensed headings read like durable protocol and instrument
labels. The wider body face carries instructions and evidence without making
the interface feel like a terminal costume.

### Hierarchy

- **Display:** Major routine and stage names, compact but immediately dominant.
- **Title:** Panel and receipt names inside the current work surface.
- **Body:** Explanations and procedure steps, generally kept within a readable
  65–75 character measure.
- **Label:** IDs, cadence, field names, and state labels in restrained uppercase.

### Named Rules

**The Noun Carries the Heading Rule.** A heading names the procedure or evidence
directly; decorative kickers and generic assistant labels do not sit above it.

## Layout

Desktop uses a three-zone operating frame: a narrow routine rack, a large
procedure bench, and a narrow evidence tray. The central bench itself is a
two-column specimen/procedure surface with a nine-stage track, an authority band,
and fixed actions below. Below 1260px the evidence tray becomes a full-width
ledger. Below 930px every major zone stacks in the same critical order. Below
560px controls become full width and nonessential session telemetry disappears.

The 4/8/16/24 rhythm governs recurring spacing. Larger one-off gaps exist only
to separate major zones. The faint graph-paper field is permitted because this
surface is explicitly a measurement and training workspace; it is not a general
background treatment for future screens.

## Elevation & Depth

The system is flat inside the procedure itself and uses diffuse ambient lift
only to separate the three major working surfaces from the graph-paper field.
Primary actions receive a smaller cobalt-tinted lift so they remain findable;
state, hierarchy, and grouping otherwise rely on tonal layers and rules.

**The Bench, Not a Card Wall Rule.** Elevation belongs to the major operating
surfaces. Do not turn steps, evidence rows, or status facts into independent
floating cards.

## Shapes

Panels remain squared and ruled. Interactive controls use an eight-pixel corner
so they read as safe touch targets, while tiny status stamps use a six-pixel
corner. The twelve-pixel panel radius is reserved for a future bounded surface
that genuinely needs clipping; the current major work surfaces stay mostly
rectilinear.

## Components

### Buttons

- **Shape:** Compact equipment-control rectangle using the control radius.
- **Primary:** Cobalt field, white label, strong weight, and diffuse downward
  lift; deepens on hover.
- **Secondary:** White field with a ruled outline and deep-cobalt label.
- **Focus:** A high-contrast amber focus ring sits outside the control.
- **Disabled:** Tonal gray communicates unavailable state without looking
  complete.

### Chips

- **Style:** Small status stamps with a ruled edge. Amber identifies synthetic
  or open boundary state; green identifies sealed evidence only.

### Cards / Containers

- **Corner Style:** Major working containers remain rectilinear.
- **Background:** Work surface for active procedure; pale blue for specimen
  context.
- **Shadow Strategy:** Ambient lift only on whole operating zones.
- **Border:** One-pixel ruled lines carry structure.
- **Internal Padding:** Usually one large spacing unit, reduced on narrow screens.

### Inputs / Fields

- **Style:** White field, one-pixel strong rule, control radius, and body type.
- **Focus:** Amber external ring; no glow or layout shift.

### Navigation

The routine rack is a ledger list, not a collection of cards. Selection fills
the whole row cobalt and reverses text. The stage track uses numbered contiguous
cells; complete becomes verified green and current becomes cobalt.

### Evidence Tray

The evidence tray is a persistent ledger containing route, artifact, check
count, approval, privacy, next action, and a collapsible machine-readable
receipt. It seals only after all nine stages pass.

## Do's and Don'ts

### Do:

- **Do** preserve the sense-to-learn reading order across every viewport.
- **Do** show source freshness, approval state, and external-action state near
  the procedure.
- **Do** use green only after a reproduced check.
- **Do** keep synthetic training data visibly labeled at all times.
- **Do** keep focus, disabled, error, open, and sealed states distinct.

### Don't:

- **Don't** convert the work surface into a grid of equal dashboard cards.
- **Don't** use decorative eyebrow copy above headings.
- **Don't** use amber or green as general decoration.
- **Don't** hide approval boundaries inside a tooltip, modal, or final-only
  receipt.
- **Don't** imply that a local or simulated state is a live external delivery.
