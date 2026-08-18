---
tags: [concept, design, front-end]
source: "[[12_Brain/raw/research/2026-08-15 - research - High-Craft Front-End References]]"
updated: 2026-08-16
expires: 2026-11-15
---

# Haoqi Design Language

**Summary:** retro-futurist personal-site system: CAD grid, glossy glass script, dithered stickers, mono body, lime signature, DOM for structure and WebGL for the unexpected.

Compiled from the live [haoqi.design](https://haoqi.design/) mobile frame and Haoqi Wen's [Codrops case study](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/) (2026-08-15). Stack and shader notes are single-source author claims. Visual rules below were also seen on the live 390px screenshot.

## What to copy

1. **Paper is a sky, not a fill.** Pale blue vertical gradient, soft diagonal light beams, never pure white.
2. **Drafting grid stays visible.** Hairline gray plus `+` crosshairs at intersections. The page should feel like a CAD sheet.
3. **Three type voices.** Heavy gothic all-caps for the mark and the one headline. Monospace for body, meta, and decode. One lime (or brand-tinted) script for the signature only.
4. **One glass line.** A tubular, refractive script (`hello` on the source) sits in a reserved slot in the back. One or two lowercase Pacifico words. Caps (`SMILE`) read as a different font. Desktop slot is larger so the line fills that width. Pointer-driven rim light stays on the letter edge, not the face.
5. **Dithered stickers stay in the word slot.** Pixel heart, leaf, smile, head, zigzag. They do not sit on headlines, body copy, or photos.
6. **Interface feedback is discrete.** Scramble-decode on text. Dot-matrix on hover, load, menu, and route changes. Shared 40ms ticker.
7. **Corner chrome.** Mark top-left, two-line hamburger top-right, live clock + temperature bottom-left, record-dot bottom-right. Pointer UV readout when there is room.
8. **Portrait closer.** Grainy high-contrast photo, lime script over the frame, tiny technical meta in the corner.

## What CSS owns vs what a shader owns

CSS / DOM: structure, type, grid, accessibility, the photo, CTAs. Copy lives in glass text boxes: IBM Plex Mono 500, cool layered shadows, inset highlight. Hover lifts with transform only.

Canvas / WebGL: glass word, sticker field, chromatic refraction, sparkles, curl or bulge, fullscreen dot wipe.

Codrops rule worth keeping: one scroll source and one pointer UV for every effect. Two `requestAnimationFrame` loops is how the glass slips a frame.

## Factory vs this language

[[12_Brain/entities/Website Factory|Website Factory]] ships the Philly profile template (10 sections, 27-37 KB, attitude skins). This language is a separate craft skin. Prospect demos that use it still keep `noindex`, harvested voice, and verifiable facts. They do not go through `build-site.js`.

Shipped demos: `haoqi-radar-sites/jarman-sales/` (`stay cool`) and `haoqi-radar-sites/andorra-family-dentistry/` (`smile more`). Live hub: https://haoqi-radar-craft.netlify.app/. Word rules: [[12_Brain/concepts/Haoqi Craft Word|Haoqi Craft Word]].

## Links

- [[12_Brain/research/High-Craft Front-End References|High-Craft Front-End References]]
- [[12_Brain/entities/Website Factory|Website Factory]]
- [[philly-sites/DESIGN-SYSTEM|Momentum Profile Design System]]
