# Philly Batch 2 — 25 rebuilt homepages

Rebuild of the 25 sites previously published at
`philly-25-homepage-concepts-batch-2.netlify.app`. The original batch ran all 25
businesses through one shared profile template. This rebuild gives each business
its **own design system**: its own layout, motion signature, footer, palette
handling, and reveal behaviour.

Open `index.html` for the review hub.

## What carried over from the originals

Everything factual. Each site's `original.html` is kept beside the new
`index.html` as the harvest receipt.

- **Real logo** — `assets/logo.png`, the business's actual mark, on every page.
- **Real photography** — the six `assets/image-*.webp` files harvested from each
  business's live site.
- **Real copy** — business name, tagline, services, phone, address, service area,
  and positioning, all taken from the business's own site.

Hours are the one field the originals did not carry in a structured form. Where a
business publishes them (Philly Medical and Rehab, Greater Philadelphia
Chiropractic), the published hours are used. Elsewhere the hours block shows a
plausible schedule for the trade and **must be confirmed with the owner before
any site goes live**. Same for the `#` deep links in the footer link lists: they
point at on-page sections, not at the business's real inner pages.

## The 25 archetypes

| # | Business | Archetype | Signature |
|---|---|---|---|
| 01 | Academy Chiropractic Center | `aurora-drift` | Drifting aurora field, glass cards on 3D tilt, header hides down / returns up |
| 02 | Acupuncture Medical Practice | `zen-strata` | Strata bands, slat curtain lifting off the hero, expanding service rows |
| 03 | Bridesburg Spine and Injury | `kinetic-blueprint` | Blueprint grid, dimension line drawing on scroll, engineering title-block footer |
| 04 | Bustleton Services | `field-grid` | Hard job-site grid, ticker, cells flooding with colour, site-plan footer |
| 05 | Dependable Concrete | `poured-slab` | Cast texture, headline poured line by line, shear slabs, control-joint footer |
| 06 | E & E Cleaning Services | `fresh-bloom` | Rising bubbles, pill sections, swelling cards, bubble-arc footer |
| 07 | Farrell's Roofing | `pitch-shift` | Angled roofline cuts between sections, shingle-stagger reveal, gable footer |
| 08 | Greater Philadelphia Chiropractic | `clinic-orbit` | Orbit rings with a tracking satellite, circular media, orbit-ring footer |
| 09 | Hal Rosenthaler DMD | `porcelain` | Gloss sheen sweeps, lifted cards, travel film strip, contact-sheet footer |
| 10 | Lawrence Kassan Podiatry | `step-trace` | Footprint trail drawing down the page on scroll, arch media, trail terminus |
| 11 | Martha's Sophisticated Shine | `gilded-sheen` | Gold shimmer across headings, hairline rules, gilded-bar footer |
| 12 | Mayfair Family Chiropractic | `spinal-column` | Vertebra rail doubling as section nav, stacking rows, column-base footer |
| 13 | Mayfair Fence | `picket-run` | Picket slats swinging open off the hero, rail dividers, picket-fence footer |
| 14 | Metro Physical Medicine | `vitals-monitor` | Running ECG trace, monitor-bezel panels, readouts, status-strip footer |
| 15 | Moss Contracting | `circuit-live` | Circuit traces energising on load, spark particles, circuit-board footer |
| 16 | Northeast Family Foot Care | `soft-arch` | Arch masks and colonnade rhythm, warm sand, arch-colonnade footer |
| 17 | Oxford Rehabilitation Center | `aqua-lane` | Caustic light, pool lane lines, waterline fade, lane-marker footer |
| 18 | Patriot Fence & Ironworks | `forge-iron` | Ember particles over a forge glow, scrollwork rules, iron-gate footer |
| 19 | Philly Medical and Rehab | `case-file` | Card deck fanning out on scroll, polaroid media, file-tab footer |
| 20 | PT in Philly | `one-on-one` | Editorial split-screen with a hard wipe, giant numerals, session-card footer |
| 21 | RHI Construction | `ridge-line` | Layered ridge silhouettes parallaxing, roofline horizons, skyline footer |
| 22 | Rittenhouse Square Chiropractic | `liquid-suite` | Full liquid glass over a moving colour field, tilt on everything |
| 23 | Rufus Chiropractic and Wellness | `stone-garden` | Stacked stone forms, raked-sand rules, ripple hovers, garden-bed footer |
| 24 | SCRC Accident & Injury Center | `impact-dossier` | Shard reveals, shockwave rings, mono index numbers, dossier footer |
| 25 | ZBC General Contracting | `build-blocks` | Blocks laying themselves into a wall, offset courses, mortar-course footer |

No two share a hero shape, a section rhythm, or a footer.

## The shared kernel

`_build/kernel.js` holds only what every site genuinely needs. Everything with a
visual opinion lives in the archetype.

**Ink-magic particle logos.** Every logo sits inside `.inkmark`: a canvas particle
field renders behind the mark and accelerates on hover. Eight physics variants
(`ink`, `sparkle`, `ember`, `dust`, `bubble`, `spark`, `mist`, `gold`) are chosen
per business — embers for the ironworks, sparks for the electrician, bubbles for
the cleaners, mist for the acupuncturist. The canvas only animates while the logo
is on screen, and does not run at all under `prefers-reduced-motion`.

**The logo plate.** Real logos are transparent PNGs, most drawn for white
backgrounds, and they disappear against a matching surface. Every logo's ink was
measured with `_build/logotone.json` (average luminance plus dark/light pixel
mass). Each site then gets a plate coloured *opposite* its ink. Because the plate
matches the surfaces where it isn't needed, it vanishes on those and appears only
where it rescues contrast. One rule, correct on every background. Rittenhouse
Square is the only light-ink logo in the batch, so it is the only one with a dark
plate.

**Appear and disappear.** `data-rv` picks a reveal direction (`up`, `down`,
`left`, `right`, `scale`, `blur`, `rot`, `clip`, `flip`); `data-vanish` makes an
element fade and lift back out as it leaves upward, so section headings retreat
rather than just scrolling away. `data-par` drives parallax, `data-scrub` exposes
scroll progress as a CSS variable for scroll-linked effects, `data-mag` makes
CTAs magnetic, and `data-count` animates numerals.

**Liquid glass 3D.** `.lg` is a real glass treatment: layered translucency,
backdrop blur with saturation, inset highlight and shadow, and a specular
radial that tracks the pointer. `.tilt3d` adds pointer-driven perspective
rotation with children lifted on the Z axis.

## Build

```
node _build/build.js            # all 25
node _build/build.js <slug>     # one site
node _build/hub.js              # review hub
```

- `_build/data.js` — harvested content, one record per business
- `_build/kernel.js` — tokens, reset, particles, scroll engines, glass
- `_build/arch/set1..5.js` — the 25 archetypes, five per file
- `_build/logotone.json` — measured logo ink tone, drives the plate colour

## Standing per page

Ten sections, six real photos, one real logo, 28 to 32 KB of self-contained HTML,
no external requests except the two Google Fonts families. Every page carries
`LocalBusiness` JSON-LD, a single `h1`, descriptive `alt` on every content image,
a skip link, visible focus rings, a mobile call bar, and a full
`prefers-reduced-motion` path.

`noindex,nofollow` is set on all 25. **Remove it before any site goes live.**
