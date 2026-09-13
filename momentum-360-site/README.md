# Momentum 360 virtual tours landing page

A single-page landing site for **Momentum 360**, the property marketing division of
Momentum Digital. Built as a structural recreation of the "REALHOME" concept page
shared by Ahmed ([@ranakabiria](https://x.com/ranakabiria)), rebranded to Momentum
360 with real brand assets, real service copy, and Momentum's own photography.

```
momentum-360-site/
├── index.html                      # the whole page, inline CSS + JS, no build step
├── README.md
└── assets/
    ├── momentum-360-logo.png       # circular 360 mark, used as the favicon
    ├── momentum-logo-white.png     # MOMENTUM wordmark, white on transparent
    ├── fonts/inter-tight-latin.woff2
    └── img/                        # 11 images, 2.1 MB
```

Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000        # then visit http://127.0.0.1:8000
```

Serving over HTTP is preferred. The webfont is fetched in CORS mode, so on a bare
`file://` open the browser blocks it and falls back to Helvetica or Arial.
Everything else works either way.

## Writing rules

Copy on this page follows `System/writing-rules.md`. No em dashes anywhere.
Contractions throughout. No sentences opening with And, But, Or, It is, Do not,
That is, or This is. Keep to those rules when editing any string in this file or
in `index.html`.

## Section order

Sections 1 through 5 mirror the reference recording. Section 6 onward is original
work in the same design language, because the recording captured 16 seconds of a
roughly 30 second video and cut off partway through the accordion.

| # | Section | Reference equivalent |
|---|---------|----------------------|
| 1 | Fixed transparent nav, solid on scroll | same |
| 2 | Full-bleed hero, headline bottom-left, pill CTA | "Discover the perfect place to call home" |
| 3 | Full-bleed about, heading left, paragraph right | "What is REALHOME?" |
| 4 | Tour card grid, tan pill eyebrow, dark "View all" | "Discover homes tailored to your lifestyle." |
| 5 | Centered heading, sticky image plus accordion | "Helping you move with complete confidence" |
| 6 | Stats band with award badges | not in the recording |
| 7 | Testimonials | not in the recording |
| 8 | Founders | not in the recording |
| 9 | Closing CTA and footer | not in the recording |

## Design tokens

Sampled pixel by pixel from the reference recording rather than eyeballed:

| Token | Value | Use |
|-------|-------|-----|
| `--paper` to `--paper-3` | `#fefefe`, `#f2f2f0`, `#dcdcda` | light section gradient |
| `--card` / `--card-2` | `#e9e9e7` / `#e4e4e2` | card body / meta strip |
| `--tan` | `#dbbdb1` | pill eyebrow |
| `--btn` | `#2e2e2c` | dark buttons, stats band |
| `--ink` | `#111110` | body text |

Type is **Inter Tight**, a close free stand-in for the neo-grotesque in the
reference. It sits in the Helvetica Neue class, with closed apertures, a spurred
lowercase `a`, and tight tracking. Display sizes use `-.035em` letter-spacing to
match.

## Imagery

All photography comes from Momentum's own Netlify build at
`momentum360-3d-home.netlify.app`. Filenames there carried a `real-` or `concept-`
prefix, and that distinction is preserved here:

| File | Origin | Used for |
|------|--------|----------|
| `granite-park.jpg` | real capture | Granite Park card, Virtual Tour service |
| `restaurant.jpg` | real capture | The Larder card, HD Photography service |
| `commercial-property.jpg` | real capture | Google Street View service |
| `society-hill.webp` | concept | hero slide 1, Society Hill card, Local Buildout service |
| `main-line-modern.webp` | concept | hero slide 2, Main Line card, Video Tour service, closing CTA |
| `rittenhouse-penthouse.webp` | concept | hero slide 3, Rittenhouse card, Stitching service |
| `old-city-loft.webp` | concept | about section, Old City card, 3D Staging service |
| `sean-boyle.webp`, `mac-frederick.webp` | real headshots | founders section |
| `award-inc-5000.png`, `award-philly-100.png` | real badges | stats band |

Cards backed by a genuine capture carry a "Captured work" chip, so real projects
read differently from concept imagery. Keep that distinction accurate if you swap
anything.

`commercial-property.jpg` is an aerial of Lower Manhattan, not Philadelphia. It's
used only for the Google Street View service slot, where an aerial reads as map
context. Don't promote it to a tour card labelled as local work.

The 360 mark in `momentum-360-logo.png` ships with an opaque white background, so
it serves as the favicon rather than sitting on the dark nav. The nav and footer
use the transparent `momentum-logo-white.png` wordmark with a `360` suffix.

## Content provenance

Real, taken from Momentum's own site:

* The eight services: Virtual Tour, Google Street View, Photo Stitching and
  Editing, 3D Staging, Virtual Video Tour, HD Photography, Google Local Buildout,
  Website Embedding
* Positioning: Google Street View Trusted Agency, Google Trusted Photographer
  Agency, Matterport Virtual Tour Service Provider, division of Momentum Digital
* Stats: 500+ projects since 2017, all 50 states, 1,200+ photographer network,
  number one ranked tours in Philadelphia
* Awards: Inc. 5000, Philadelphia 100 Forum 2023 Winner
* Contact: 1635 Market St. #1601, Philadelphia PA 19103, 215-876-2954
* All three testimonials are reviews published on Momentum's own site
  (Charlene Mullholland of Sorella Boutique, Matt Borowsky, Aaron Weber)

Written as demo content, not sourced:

* **Tour card entries.** Granite Park is the one name carried over from a source
  filename. The Larder, Society Hill Row, Bank Street Loft, Locust Penthouse, and
  Ardmore Modern are invented listing names, and every square footage, panorama
  count, and floor count is invented to be internally plausible. Swap in real
  projects when they're available and link each card to its live Matterport or
  Street View URL.
* **Founder titles.** Both source files were named `founder-bio`. Sean Boyle
  reads as Co-Founder and Managing Partner, Mac Frederick as Founder of Momentum
  Digital. Neither title is confirmed.

Venue names are deliberately generic listing-style labels rather than real
Philadelphia businesses. A "Captured work" chip next to an actual named business
would assert a client relationship that hasn't been verified, so the chip appears
only on the two cards whose photography is genuinely Momentum's own capture work,
Granite Park and The Larder.

## Swapping content

Cards, services, and testimonials are plain data arrays at the top of the script
in `index.html`. Edit those, not the markup:

```js
const TOURS    = [{cat, name, type, sqft, panos, floors, img, real}, …];
const SERVICES = [{i /* icon key */, t /* title */, img, d /* description */}, …];
const QUOTES   = [{p /* quote */, b /* name */, s /* org */}, …];
```

`img` is a filename in `assets/img/` including its extension, so `.jpg` and
`.webp` can be mixed freely. Set `real: true` to show the "Captured work" chip.
When swapping a photo, keep the aspect ratio: hero, about, and CTA run 16:9 at
roughly 1600 to 1900 wide, tour cards 3:2 at 900 wide, service images near 4:3 at
1100 to 1600 wide.

## Notes

* **No external requests.** Font and imagery are local, so the page renders
  identically offline with no CDN or privacy dependencies.
* **Accessibility.** The accordion uses real buttons with `aria-expanded` and
  `aria-controls`. Anchored sections carry `scroll-margin-top` so the fixed nav
  never covers a heading. Focus rings are visible. Hero rotation and every reveal
  animation switch off under `prefers-reduced-motion`.
* **Verified** in Chromium at 1440px and 390px: no console errors, 25 of 25
  images loading, no horizontal overflow, accordion image sync and collapse
  working, hero dots working, mobile nav opening and closing on link tap.
