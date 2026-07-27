# Momentum 360 — virtual tours landing page

A single-page landing site for **Momentum 360**, the property marketing division of
Momentum Digital. Built as a direct structural recreation of the "REALHOME" concept
page shared by Ahmed ([@ranakabiria](https://x.com/ranakabiria)), rebranded to
Momentum 360 with real brand assets and real service copy.

```
momentum-360-site/
├── index.html                      # the whole page (inline CSS + JS, no build step)
├── assets/
│   ├── momentum-logo-white.png     # real Momentum wordmark (white, transparent)
│   ├── fonts/inter-tight-latin.woff2
│   └── img/                        # 19 vendored photos (~2.8 MB)
└── README.md
```

Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000        # then visit http://127.0.0.1:8000
```

Serving over HTTP is preferred — the webfont is fetched in CORS mode, so on a
bare `file://` open the browser blocks it and falls back to Helvetica/Arial.
Everything else works either way.

---

## Section order (mirrors the reference)

| # | Section | Reference equivalent |
|---|---------|----------------------|
| 1 | Fixed transparent nav, goes solid on scroll | same |
| 2 | Full-bleed hero, headline bottom-left, pill CTA | "Discover the perfect place to call home" |
| 3 | Full-bleed about, heading left / paragraph right | "What is REALHOME?" |
| 4 | Tour card grid, tan pill eyebrow, dark "View all" | "Discover homes tailored to your lifestyle." |
| 5 | Centered heading + sticky image / accordion split | "Helping you move with complete confidence" |
| 6 | Stats band, testimonials, closing CTA, footer | *not in the recording — built in the same language* |

The source recording cut off partway through the accordion (16s of a ~30s video),
so sections 6 onward are original work matching the established design language
rather than a recreation.

## Design tokens

Sampled pixel-by-pixel from the reference recording rather than eyeballed:

| Token | Value | Use |
|-------|-------|-----|
| `--paper` → `--paper-3` | `#fefefe` → `#f2f2f0` → `#dcdcda` | light section gradient |
| `--card` / `--card-2` | `#e9e9e7` / `#e4e4e2` | card body / meta strip |
| `--tan` | `#dbbdb1` | pill eyebrow |
| `--btn` | `#2e2e2c` | dark buttons, stats band |
| `--ink` | `#111110` | body text |

Type is **Inter Tight**, a close free stand-in for the neo-grotesque in the
reference (Helvetica Neue class — closed apertures, spurred `a`, tight tracking).
Display sizes use `-.035em` letter-spacing to match.

## Content provenance

**Real** — taken from Momentum's own site:

- The eight services in the accordion: Virtual Tour, Google Street View,
  Photo Stitching & Editing, 3D Staging, Virtual Video Tour, HD Photography,
  Google Local Buildout, Website Embedding
- Positioning: Google Street View Trusted Agency, Google Trusted Photographer
  Agency, Matterport Virtual Tour Service Provider, division of Momentum Digital
- Stats: 500+ projects since 2017, all 50 states, 1,200+ photographer network,
  #1 ranked tours in Philadelphia
- Contact: 1635 Market St. #1601, Philadelphia PA 19103 · 215-876-2954
- All three testimonials are real reviews published on Momentum's own site
  (Charlene Mullholland / Sorella Boutique, Matt Borowsky, Aaron Weber)

**Placeholder — replace before launch:**

- **Tour card venues and metrics.** The six cards (Suraya, Sorella Boutique,
  Frankford Hall, Momentum Athletic Club, Main Line Dental, The Wharton Hotel)
  and their sq ft / pano / floor counts are illustrative. Swap for real completed
  tours and link each card to its live Matterport or Street View URL.
- **All photography.** Vendored from Unsplash as stand-ins. Replace with real
  Momentum 360 capture work.

## Swapping content

Cards, services, and testimonials are plain data arrays at the top of the script
in `index.html` — edit those, not the markup:

```js
const TOURS    = [{cat, name, type, sqft, panos, floors, img}, …];
const SERVICES = [{i /* icon key */, t /* title */, img, d /* description */}, …];
const QUOTES   = [{p /* quote */, b /* name */, s /* org */}, …];
```

`img` is a basename in `assets/img/` (no extension). To swap a photo, drop a new
file in at the same name and keep the aspect ratio — hero/about/cta are 16:9 at
1920w, tour cards 3:2 at 900w, service images ~4:3 at 1100w.

## Notes

- **No external requests.** Font and imagery are local, so the page renders
  identically offline and there are no CDN or privacy dependencies.
- **Accessibility:** the accordion uses real `<button>`s with `aria-expanded`
  and `aria-controls`, anchored sections carry `scroll-margin-top` so the fixed
  nav never covers a heading, focus rings are visible, and hero rotation plus all
  reveal animations are disabled under `prefers-reduced-motion`.
- **Verified** in Chromium at 1440px and 390px: no console errors, no broken
  images, no horizontal overflow, accordion image-sync and collapse working,
  hero dots working, mobile nav opening and closing on link tap.
