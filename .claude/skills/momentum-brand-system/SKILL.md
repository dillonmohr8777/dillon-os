---
name: "momentum-brand-system"
description: "Apply Dillon's design standard to any Momentum-branded visual output — slides, spec homepages, one-pagers, proposals, landing pages, social graphics, report layouts. Points at the real token file (colour, type, space, radius, elevation, motion) with measured WCAG ratios, plus the calibration from his design brief (visual variance 9/10, motion 8/10, information density 4/10) and a hard anti-slop list (no AI purple, no neon glow, no glassmorphism, no floating gradient orbs, no three-equal-card feature row). Use this whenever you are about to make design decisions on something that will carry the Momentum name or go in front of a Momentum client or prospect, and especially when a build risks defaulting to generic AI-template styling. Not for copywriting or data analysis with no visual output."
---

# Momentum Brand System

The design law for anything that carries the Momentum name. Read this before making layout, type, colour or motion decisions, not after, when the fixes are expensive.

Since v1.0 of the design system this skill no longer describes the brand in adjectives. **Pull the values from the token file.** The adjectives below govern composition; the file governs numbers.

## Where the real values live

```
C:\Users\dillo\Documents\Codex\momentum-design-system\
  index.html    the live system: every token and component rendered, contrast measured in-page
  tokens.css    the token layer, importable, literal values
  tokens.json   machine-readable export with every measured ratio
  AUDIT.md      the drift report these tokens were derived from
```

Read `tokens.css` and use `var(--m-*)`. Do not retype a hex you remember. Do not invent a spacing value. If a value you need is not in the file, that is a gap in the system worth naming in your handoff, not a licence to improvise one.

If the path is outside your connected folders, request access. If you truly cannot reach it, the reference table at the bottom of this skill is a faithful copy, but the file is the source.

## The three dials

The compressed version of the whole taste, and the fastest way to check whether a design is right, because almost every bad output fails at least one.

### Visual variance, 9 out of 10

Consecutive sections must not share a skeleton. Change the axis, the rhythm, the crop, the background treatment, the alignment. Full-bleed image against tight centred type against an asymmetric split against a text-only statement.

The test: if you can describe two sections with the same sentence, one of them is wrong. "Heading, paragraph, image on the right" twice in a row is a failure even if both are individually attractive. Sameness is the actual defect being designed against.

The token layer supports this directly. Five surfaces exist (`paper`, `panel`, `deep`, `deep-raised`, plus a signal fill) and the rule is that no two adjacent sections may use the same one.

### Motion, 8 out of 10

Motion is expected and load-bearing, not decoration. Entrances that stagger, scroll-linked reveals, parallax with real depth separation, hover states that displace rather than just tint, transitions that carry the eye between sections.

Three easing curves exist and they are not interchangeable:

- `--m-ease-standard` `cubic-bezier(.2,.7,.2,1)` for hover, tint, small state changes
- `--m-ease-entrance` `cubic-bezier(.16,1,.3,1)` for entrances, expo-out
- `--m-ease-emphatic` `cubic-bezier(.85,0,.15,1)` for deliberate swaps that should feel decided

Ask what each movement is *for*, revealing, directing attention, establishing hierarchy, and cut anything that answers "it looked nice." Something that shimmers for no reason reads cheaper than no motion at all.

Every duration token collapses to 1ms under `prefers-reduced-motion`, so layout never shifts. Honour that; do not write raw durations that escape it.

### Information density, 4 out of 10

Low. Deliberately low. Few words per screen, large type, generous air, one idea per section.

This is the dial most often violated, because the instinct is always to add. Resist it. If a section has three points, it is probably three sections. If a slide has a paragraph, it probably has a headline hiding inside it. Whitespace is doing work; it is not an empty slot waiting to be filled.

## The anti-slop list

Banned outright. Any one of them undoes the rest of the design instantly:

- **No AI purple.** No indigo to violet gradients, no `#6366f1`-family default. The single loudest tell.
- **No neon glow.** No glowing borders, no radiant box-shadows in saturated hues. When you need to lift a surface, use `--m-block-md`, a hard offset with zero blur, tinted with signal at 28 percent. It reads as print rather than UI chrome and cannot be mistaken for the banned thing.
- **No glassmorphism.** No frosted translucent panels with blurred backdrops.
- **No floating gradient orbs.** No soft blurred colored blobs drifting behind content.
- **No three-equal-card feature row.** Three identical cards side by side with an icon, a heading and two lines of body copy. The most reflexive layout in existence, and exactly the sameness that variance 9 exists to prevent. The system's own card component is deliberately `1.5fr / 1fr` so the pair reads as a lead and a follow.

When you catch yourself reaching for one of these, that is the signal to go find the more specific idea. The banned pattern is almost always a placeholder standing in for a real design decision that has not been made yet.

## Colour: the rule that matters most

**Foreground tokens are named for the surface they are legal on. Using one off its surface is how the last batch shipped nine accessibility failures nobody caught.**

- `--m-signal` `#E27113` fills, and speaks on dark. As text on paper it is 3.00:1 and illegal.
- `--m-signal-ink` `#A35309` speaks on light. On deep it is a graphic, not text.
- `--m-brand` `#155E86` speaks on light. On deep it is 2.63:1 and fails even the 3.0 graphic threshold.
- `--m-brand-lift` `#3897CC` is the blue that speaks on dark.
- `--m-on-signal` `#14181B` is the text on an orange fill. White on signal is 3.19:1. Never white.

There is no single orange that clears 4.5:1 as text on light and works as a fill. That is why there are two. If you find yourself wanting one, you are about to ship the failure.

**Nothing is derived at runtime.** The previous kit computed `--muted` and `--panel` with `color-mix()`; because the result was never re-measured per site, secondary text landed between 4.28:1 and 4.49:1 on nine of ten shipped sites. Every colour in this system is a literal that was measured individually. Keep it that way.

**Measure, do not assert.** Any new pairing gets a real contrast number before it ships. `index.html` computes all 29 pairs live at load; open it and read the matrix rather than trusting memory.

## Colour and type for client work

**For client work**, the client's own brand governs. Pull the palette and typefaces from their record. Your job is to apply the structural taste, variance, motion, restraint, within their identity, not to overwrite it. A client with a conservative brand still gets high variance and low density; they just get it in their colours.

But apply the *discipline* regardless of whose colours they are: measure every text-on-background pair, and split the accent into a fill value and a text value if one value cannot do both. That discipline is the transferable part.

**For Momentum's own materials**, use this system. It is now decided rather than open. Note that needmomentum.com is *not* on it, and currently has six measured AA failures including the primary CTA at 2.58:1; treat the live site as a thing to be migrated, not as a reference.

**Type**: two families carry everything. `--m-font-display` Archivo Black for headings only, never below h3. `--m-font-text` Nunito Sans for body, UI and eyebrows, weights 400/700/800 only. `--m-font-script` Caveat is an accent: one per page, never a full line, never below 1.5rem. Eight scale steps exist with real jumps between them. Do not stack a third family.

## Applying this to specific surfaces

**Slides**: variance means slide layouts rotate; a deck where every slide is title-plus-bullets fails. Density 4 means roughly one idea per slide and headlines that are statements, not labels. Motion applies to build order and transitions.

**Spec homepages and landing pages**: this is where all three dials matter most, because the whole pitch is that the page looks better than what the business currently has. Full variance across sections, real scroll motion, and confident emptiness. The shipped section grammar is hero deep, services paper, stats brand, process panel, split paper, faq panel, marquee deep, cta accent, with no two adjacent surfaces the same.

**One-pagers, proposals, reports**: density can rise somewhat because these are read, not presented, but variance still holds. Do not run five identical sections down a page. Data-heavy pages earn more density; narrative pages do not.

## Before you ship

1. Can any two adjacent sections be described the same way? Fix the second one.
2. Is anything on the anti-slop list present? Remove it and replace with a real decision.
3. Could you cut a third of the words without losing meaning? Then cut them.
4. Does every animation have a job, and does it collapse under `prefers-reduced-motion`?
5. Is every foreground token on a surface it is legal on? Check the ones on dark especially.
6. Have you measured every new text-on-background pair, or are you assuming?
7. If it is client work, is it in the client's colours rather than yours?

## Reference copy of the token values

Use the file. This table is a fallback for when the file is unreachable.

**Colour, light**: paper `#FBF8F4` · panel `#F0ECE5` · ink `#14181B` · muted `#636465` · line `#DCD6CC` (decorative only, not AA) · line-strong `#8E8578`
**Colour, dark**: deep `#0E1417` · deep-raised `#1A2226` · on-deep `#F4F1EC` · on-deep-muted `#8A9296`
**Brand**: brand `#155E86` · brand-lift `#3897CC` · on-brand `#FFFFFF`
**Signal**: signal `#E27113` · signal-ink `#A35309` · on-signal `#14181B` · focus `#A35309`

**Type scale**: display `clamp(3rem,7vw,6.5rem)` · h1 `clamp(2.4rem,5.2vw,4.5rem)` · h2 `clamp(1.9rem,3.6vw,3rem)` · h3 `clamp(1.35rem,2vw,1.75rem)` · lead `clamp(1.15rem,1.4vw,1.4rem)` · body `clamp(1rem,1.1vw,1.125rem)` · sm `.9375rem` · xs `.78rem`

**Space**: `.25 / .5 / .75 / 1 / 1.5 / 2 / 3 / 4 / 6 / 8` rem · section-y `clamp(72px,9vw,128px)` · gutter `clamp(16px,3vw,32px)` · container `1200px` · measure `68ch`

**Radius**: 8 / 16 / 26 / 999px

**Elevation, soft**: `0 1px 2px rgba(14,20,23,.08), 0 6px 18px rgba(14,20,23,.06)` · `0 18px 40px -22px rgba(14,20,23,.45)` · `0 38px 90px -30px rgba(14,20,23,.5)`
**Elevation, block**: `8px 10px 0` / `14px 16px 0` / `24px 28px 0`, tint `rgba(226,113,19,.28)`

**Motion**: 120ms instant · 220ms fast · 500ms base · 800ms slow · 40s marquee · stagger 70ms

## Provenance, so nothing inferred gets treated as measured

Carried forward as **measured**: the space scale, `--fs-h2`, `--fs-body`, `--fs-xs`, `shadow-2`, the 500ms base and the standard easing, all from the ten shipping radar sites. Pill geometry, the fixed dark header and the 800ms emphatic curve, from the desktop capture of papaadvertising.com at 1440x900 with computed styles. The expo-out entrance curve, from the BigOrange cinematic build.

Deliberately **not** carried: every number from the earlier phone-capture Papa reference. Its own Confidence section marks the type sizes, container width, section padding, card radius and all motion values as estimated or not observed. None of them are in this system, and none of them should be reintroduced as though they were measured.

Papa's wordmark, the pill-in-A logo device and its client logos remain out of bounds. Grammar only.

