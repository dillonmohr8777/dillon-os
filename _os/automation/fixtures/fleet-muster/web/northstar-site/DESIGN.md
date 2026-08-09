---
name: Northstar Hearth & Home Synthetic Fixture
description: A source-bounded home-preparation route for local web acceptance testing.
colors:
  ember-copper: "#c76635"
  ember-dark: "#8f3f1f"
  midnight-slate: "#172126"
  slate-raised: "#233138"
  hearth-cream: "#f4ead8"
  cream-muted: "#d8cbb8"
  route-thread: "#77888d"
  success: "#b8d5b2"
  error: "#ffd1c2"
typography:
  display:
    fontFamily: "Northstar Barlow, sans-serif"
    fontSize: "clamp(3.25rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Northstar Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "4px"
  surface: "14px"
spacing:
  compact: "0.75rem"
  base: "1rem"
  field: "1.2rem"
  section: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.ember-copper}"
    textColor: "{colors.hearth-cream}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.85rem 1.2rem"
  route-surface:
    backgroundColor: "{colors.hearth-cream}"
    textColor: "{colors.midnight-slate}"
    rounded: "{rounded.surface}"
    padding: "2.2rem"
---

# Design System: Northstar Hearth & Home Synthetic Fixture

## Overview

**Creative North Star: "The Home-Preparation Route"**

The system makes project planning feel inspectable: a midnight field holds one cream route sheet, copper marks the active path, and restrained seam lines connect evidence without turning the page into a dashboard. Its expression is warm but procedural, matching the fixture's practical and evidence-led voice while keeping every claim boundary visible.

**Key Characteristics:**

- One route-scale visual anchors the first viewport.
- Copper marks action and progress; it does not decorate every surface.
- Cream fields are reserved for the route and the local planning action.
- All demonstration content is explicitly synthetic and local-only.

## Colors

The palette is a full three-role system: midnight provides the planning field, cream carries inspectable work, and copper marks the path and primary action. Muted cream and route-thread support secondary content without introducing neutral gray disconnected from the scene.

## Typography

Northstar Barlow is self-hosted under the included Open Font License and provides a practical signage character without an external font request. Display text is compressed through line height and tracking rather than a separate decorative face; body and label roles use the same family for continuity.

**The One Route Voice Rule.** Display, body, map labels, and controls share one humanist grotesk family; hierarchy comes from scale, weight, and placement.

## Layout

The desktop shell is bounded to 1180 pixels and alternates asymmetric split fields with one four-step route row. Below 860 pixels, split fields stack; below 520 pixels, actions and process stops become one column. Every grid child establishes `min-width: 0`, copy can wrap, and the root is verified without horizontal overflow at 390 pixels.

## Elevation & Depth

The system is flat except for the primary cream route sheet, which receives one wide ambient shadow. Section structure uses tonal changes and thin seams rather than stacked shadows or nested cards.

**The One Lift Rule.** Only the focal route sheet floats; other surfaces earn hierarchy through field color and spacing.

## Shapes

Major cream surfaces use a 14-pixel corner. Buttons and inputs use 4-pixel corners so actions feel clipped and field-ready. The authored compass mark and curved route field supply the signature geometry; pills are not part of the system.

## Components

### Buttons

- **Shape:** Clipped field control (4px radius).
- **Primary:** Ember copper with cream text and firm body weight.
- **Hover / Focus:** A lighter copper hover and a three-pixel visible focus outline with four-pixel offset.

### Cards / Containers

- **Corner Style:** Route surfaces use the 14-pixel surface radius.
- **Background:** Cream for inspectable route or action fields; raised slate for sequential process stops.
- **Shadow Strategy:** Only the route-map surface uses ambient elevation.
- **Border:** Process stops are separated by one-pixel slate seams.

### Inputs / Fields

- **Style:** White-cream field, two-pixel slate stroke, and 4-pixel radius.
- **Focus:** The shared high-contrast focus outline.
- **Error:** Ember-dark stroke over the light error field; the status text names recovery.

### Navigation

Desktop navigation is a short underlined route index. Mobile removes the redundant index while retaining the brand, skip link, in-page actions, and semantic landmarks.

### Route Map

The route map is authored SVG geometry with four numbered waypoints, a house origin, a dotted path, and one copper trace. Reduced-motion users receive the complete route immediately.

## Do's and Don'ts

### Do:

- **Do** use route geometry to explain sequence or dependency.
- **Do** keep proof boundaries adjacent to the content they qualify.
- **Do** reserve cream surfaces for work the visitor can inspect or perform.
- **Do** preserve local-only, zero-network, and reduced-motion behavior.

### Don't:

- **Don't** turn the route into a grid of interchangeable feature cards.
- **Don't** add unsupported performance, savings, safety, pricing, or leadership claims.
- **Don't** introduce cross-brand assets, external fonts, decorative gradients, or repeated pills.
- **Don't** hide overflow; fix the layout and verify the real scroll width.
