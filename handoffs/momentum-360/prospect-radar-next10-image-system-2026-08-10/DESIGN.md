# Design System

## Overview

Golden Eagle Jewelers is the north star: a near-black exhibition space, monumental condensed typography, macro material studies, isolated sculptural objects, layered depth, and a transformation verb that drives the scroll. The image system transfers that visual intelligence to ten different trades without copying the jewelry subject or relying on WebGL.

## Image System

Each prospect receives three text-free raster plates:

1. **Hero transformation**: cinematic 16:11 establishing plate with a dominant trade-specific object, strong negative space for code-native type, and deep layered lighting.
2. **Process macro**: 4:3 close study of hands, tools, ingredients, or mechanisms in use. No faces.
3. **Material study**: 4:3 abstract-but-literal detail of the material world that can carry an inset, gallery, or section transition.

All three plates for a prospect share one light temperature, one palette, one lens language, and one material story. Across prospects, compositions and palettes must differ.

## Visual Theme

Dark cinematic object-study rather than generic commercial photography. Environments feel like a crafted stage or night workshop, with controlled practical light, subtle atmospheric depth, real surface wear, and clear focal hierarchy. Objects stay recognizable. Avoid empty black fields and crush-black shadows.

## Color Strategy

Use a committed palette per prospect, anchored by tinted near-black rather than pure black. Accent color should emerge from real trade materials:

- Germantown Dental: midnight teal, porcelain, instrument steel.
- Udis & Conn: ink blue, orthodontic ceramic, restrained coral.
- Jarman: oxidized copper, cool steel, amber work light.
- Lee's: tomato red, mustard seed, deli-paper cream, charred steel.
- Anthony Gueriera Insurance: bottle green, warm paper, brass key metal.
- Bàn Bàn: lacquer red, black ceramic, steam white, chili amber.
- Big Head Transport: asphalt blue-black, rubber, amber safety light.
- Dutton Road Vet: deep sage, exam steel, warm leather and paper.
- Elite Auto Parts: graphite, cobalt, machined aluminum, signal red.
- Kehan's Auto Service: oil blue-black, tungsten steel, work-light amber.

## Typography Handoff

Typography is code-native, never rasterized into generated imagery. The reference uses custom Lab Text / Facet Display. Builders should emulate the structure, not counterfeit those files: a monumental condensed display face paired with a quiet humanist sans. Suggested starting families to test are Alumni Sans or Barlow Condensed for display and Public Sans or Source Sans 3 for body. Use fluid scale, aggressive size contrast, and readable 65–75ch body measure. Avoid the Impeccable reflex-reject font list.

## Logo Handoff

Do not generate business names or "exact" logos in raster images. First source a verified official logo from the business's public site or profile. If none exists, build a clean code/vector initials mark and label it as a concept mark. Keep logo provenance beside each prospect brief.

## Composition Rules

- Hero object sits off-center and may crop beyond the frame, leaving a calm type field.
- Use foreground occlusion, midground subject, and background glow to create depth without WebGL.
- Maintain meaningful detail in shadows; pages must survive constrained rendering.
- No centered object-on-gradient product mockups.
- No identical angles across consecutive prospects.
- No text, signage, labels, license plates, watermarks, or brand marks inside generated plates.

## Motion Handoff

Let the page animate code-native layers over static plates: slow parallax, masked reveals, scale drift, crop changes, and object-study insets. Motion uses transforms and opacity, exponential ease-out, and reduced-motion fallbacks. Images must still tell the story without motion.

## Release Boundary

Every page using these assets must disclose that the imagery is synthetic concept material and must not imply the images depict the actual business, staff, premises, customers, patients, or completed work.
