---
name: ui-design
description: Visual design pass for a site build. Sets the palette, type scale, hierarchy, spacing, and contrast so a page looks expensive and looks like the business. Use during every site-factory build and on any design upgrade.
---

# UI Design

The visual layer. Applied to every batch site after harvest and before build. Design contract: `philly-sites/DESIGN-SYSTEM.md`.

## Inputs

`harvest/<slug>/harvest.json` (`brand.palette`, `brand.fonts`) and the screenshots in `harvest/<slug>/shots/`. Work from what the business actually uses, not from taste in a vacuum.

## Palette

1. Read `brand.palette` from the harvest. Colors are ranked by painted area, so the top entries are their real brand surfaces.
2. Discard near-whites and near-blacks used purely as page background and body text; those become `--paper` and `--ink` after tinting.
3. Find their actual accent: the most saturated color with meaningful weight. That's `--accent`. If the harvest gives nothing saturated, pull it from their signage, awning, packaging, or logo in the screenshots.
4. Build the six tokens: `--paper` (warm off-white tinted toward the brand, never pure #FFF), `--ink` (near-black tinted toward the brand, never pure #000), `--accent`, `--accent2` (a second hue for contrast moments), `--panel` (muted mid-tone), `--deep` (very dark brand tone).
5. Set every `--on-*` token to `#090909` or `#FFFFFF`, whichever passes WCAG AA on that surface. This is not optional; the QA gate checks contrast.

Never ship a generic blue. Never ship a palette that could belong to any other business in the batch.

## Type

- One display font carrying the brand plus one quiet text font. Check `brand.fonts` first: if they already use a distinctive face, match its character (serif to serif, condensed to condensed) with a Google Font equivalent.
- Upscale or heritage brands: serif display (EB Garamond, Playfair Display, Bodoni Moda, Cormorant Garamond, Lora, Crimson Pro).
- Loud, institutional, or working-class brands: slab or condensed display (Alfa Slab One, Archivo Black, Bungee, Rubik Mono One, Bebas Neue, Anton, Fjalla One).
- Text font stays out of the way: Inter, Work Sans, Space Grotesk, Chivo, Jost, Public Sans, IBM Plex Sans.
- All sizing via `clamp()`. Hero h1 `clamp(3.6rem, 7vw, 7rem)`, section h2 `clamp(2.6rem, 5.2vw, 5.6rem)`. `text-wrap:balance` on headings, `text-wrap:pretty` on body.

## Attitude tokens

`--border` and `--radius` set the era and the volume more than color does:

- 1px borders with 24 to 56px radius: elegant, restrained, upscale
- 3 to 8px borders with 0 to 8px radius: loud, brutalist, institutional, blue-collar

Pick from the business, not from preference. A South Philly roast pork counter and a Rittenhouse wine bar should not share these values.

## Hierarchy and rhythm

- One clear focal point per section. If two things compete, one is decoration.
- Alternate surfaces so no two adjacent sections share one (`paper` to `accent` to `panel` to `deep`).
- Section padding `clamp(78px, 10vw, 150px)`; generous whitespace is the cheapest way to look expensive.
- Proof strips state facts. Headlines make one claim. Never fill space with adjectives.

## Self-check before handing off

- Could a competitor's logo drop onto this page unchanged? If yes, the design isn't theirs yet.
- Does every text/background pair pass AA?
- Does the palette appear in their real photos, or did it come from nowhere?
- Is there exactly one primary action per screen?
