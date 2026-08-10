# Fable / Opus Build Handoff

## North Star

Use Golden Eagle Jewelers as the art-direction reference: a dark exhibition, monumental typography, sculptural objects, tactile macro photography, and deliberate scroll pacing. Transfer that grammar to each trade without copying the jewelry subject or introducing WebGL.

## Lowest-token build contract

The complete prompt system is in `IMAGE-SYSTEM.json`. Do not regenerate or redescribe the images. For every site, import the three files from `assets/images/<slug>/`:

1. `hero-transformation.png` — full-bleed hero or oversized masked crop; preserve the supplied negative-space side for the headline.
2. `process-macro.png` — process/service section; crop no tighter than 4:3.
3. `material-study.png` — inset, split panel, or sectional transition; use at least once below the fold.

Create variety through layout, crop, scale, and code-native motion—not additional generation. Avoid a repeated seven-section template across all ten sites.

## Type

Use a monumental condensed display face with a restrained humanist sans. Start with Alumni Sans or Barlow Condensed for display and Public Sans or Source Sans 3 for body. Set the hero with fluid sizing (`clamp`) and strong contrast; keep body copy readable. Do not bake typography into images.

## Logo boundary

Do not ask an image model to recreate an exact logo. Use a verified official logo from the business's public site/profile and retain its source URL. If no official asset is verifiable, create a clearly labeled code/SVG concept mark—never present it as exact.

## Image implementation

- Keep `object-position` aligned with each hero's open type field.
- Use tinted near-black backgrounds; do not crush shadows to pure black.
- Give images stable aspect-ratio containers and responsive `srcset`/modern derivatives when the builder produces them.
- Motion may use masked reveals, crop drift, slow parallax, and scale transforms. The static layout must remain complete with reduced motion.
- Each homepage should visibly use all three supplied plates.

## Release boundary

These are synthetic concept images. Add a source note stating they do not depict the real business, staff, premises, customers, patients, or completed work. Replace them with approved photography before any production launch.

## Delivery state

Thirty final PNG assets are present: ten sites × three roles. No deployment or publication is authorized by this package.
