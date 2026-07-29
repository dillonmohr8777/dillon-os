# Momentum Profile Site Design System

Extracted from the 25 Philadelphia prospect sites in this folder (built and design-upgraded through 2026-07-12), plus patterns from `mohr-media-site/`. This is the source of truth for the site factory at `_templates/site-factory/`. When building a new site, follow this document instead of reverse-engineering the sites again.

## Two template generations

- **Profile template (current, use this one).** 24 of the 25 sites. Body class `profile-page slug-<name>`, sections composed from a fixed vocabulary, colors driven by design tokens, surfaces mapped by utility classes. Single self-contained `index.html` (inline CSS + JS) plus an `assets/` folder of local `.webp` images and a `logo.png`.
- **Glass template (legacy).** `genos-steaks/` only. Body class `layout-0/1/2`, glassmorphism cards, `--soft/--mist` tokens. Keep for reference; don't build new sites on it.

## Design tokens (the entire brand personality lives here)

Every site defines the same `:root` block; only the values change per brand:

| Token | Role | Observed range |
|---|---|---|
| `--paper` | Base background, warm off-white tinted toward the brand | `#D8C39D` to `#FDFBF7` |
| `--ink` | Base text, near-black tinted toward the brand | dark, tinted |
| `--accent` | Primary brand color: CTAs, accent surfaces | any saturated brand hue |
| `--accent2` | Secondary hue for contrast moments | complementary to accent |
| `--panel` | Mid-tone surface for proof strips and closing sections | muted brand tone |
| `--deep` | Darkest surface for story/catalog/contact sections | very dark brand tone |
| `--on-paper` `--on-accent` `--on-accent2` `--on-panel` `--on-deep` | Text color on each surface, always `#090909` or `#FFFFFF` | pick for WCAG contrast |
| `--border` | Border weight, sets the attitude | `1px` (elegant) to `8px` (loud) |
| `--radius` | Corner rounding, sets the era | `0px` (brutalist) to `56px` (soft retro) |

Rules of thumb from the 25 builds:

- Elegant/upscale brands (Zahav, Victor Cafe, La Colombe): `--border` 1px, serif display font, muted `--accent`.
- Loud/institutional brands (Pat's, Frankford Hall, Eastern State): `--border` 3px to 8px, `--radius` 0, condensed or slab display font.
- The palette always derives from the business's real signage, product, and interior photos. Never generic blue.

## Fonts

One or two Google Fonts per site, loaded with `preconnect` + one stylesheet link:

- **Display font** carries the brand: observed serif (EB Garamond, Playfair Display, Bodoni Moda, Cormorant Garamond, Lora, Crimson Pro), slab/loud (Alfa Slab One, Archivo Black, Bungee, Rubik Mono One, Bebas Neue, Anton, Fjalla One, Saira Stencil One), and neutral (Archivo, Barlow Condensed).
- **Text font** stays quiet: Inter, Work Sans, Space Grotesk, Chivo, Jost, Public Sans, IBM Plex Sans/Mono, Space Mono.

## Section vocabulary

Pages compose from this fixed set, each `<section class="<name> surface-<paper|accent|panel|deep>">`. Order varies per site; hero is always first, closing always last:

| Section | Content |
|---|---|
| `hero` | Full-bleed media + headline + subline + primary/secondary CTA buttons |
| `proof` | Strip of 2 to 4 hard facts (founded date, hours, signature item, service area) |
| `offerings` | Numbered grid (01/02/03) of what they sell or do |
| `story` | Split layout: history/positioning copy beside a photo |
| `gallery` | Bento image grid with pill captions |
| `experience` | Numbered grid of what visiting/working with them is like |
| `catalog` | Card grid of deep links (menu, delivery, shop, booking) |
| `feature` | Split layout spotlighting one signature thing |
| `spotlight` / `commercial-spotlight` | Secondary business line (merch, wholesale, events) |
| `contact-system` / `visit` | Address, hours, phone, and a `visit-links` list (call / order / directions) |
| `closing` | Big repeat of the main claim + one CTA |

Surface rhythm: alternate surfaces so no two adjacent sections share one (typical flow: paper → accent → panel → deep → paper...).

## Canonical batch spec (measured, not guessed)

Every new batch site must resemble the majority of the 25. These are the actual measured numbers across the folder, and they are the acceptance targets for the batch runner:

| Dimension | Range across the 25 | Target for new builds |
|---|---|---|
| Sections total | 8 to 11 | **10** (hero + 8 middle + closing) |
| Words of real copy | 293 to 543 | **350 to 500** |
| Images | 7 to 13 (mode 13) | **12 to 13** |
| Final page weight | 22 to 36 KB | **27 to 37 KB** |

Section frequency across the 24 profile-template sites, which defines what's mandatory versus optional:

| Section | Appears in | Rule for new builds |
|---|---|---|
| `hero` | 24/24 | Required, always first |
| `offerings` | 24/24 | Required |
| `story` | 24/24 | Required |
| `gallery` | 24/24 | Required |
| `contact-system` | 24/24 | Required, always second to last |
| `closing` | 24/24 | Required, always last |
| `proof` | 21/24 | Include unless there are fewer than 3 verifiable facts |
| `feature` | 21/24 | Include when there's one signature thing to spotlight |
| `experience` | 16/24 | Include when the visit or process is a selling point |
| `catalog` | 16/24 | Include when they have 3+ real deep links (menu, booking, shop) |
| `spotlight` | 7/24 | Only for a genuine secondary business line (merch, wholesale, events) |

So the floor is 6 required sections; hitting the target of 10 means adding `proof`, `feature`, and two of `experience`/`catalog`/`spotlight`. A build that lands at 8 sections and 300 words is thin compared to the batch and should be sent back for more research, not shipped.

## Shared chrome and behavior

- `site-header`: fixed/absolute pill bar with `brand-logo` (or `wordmark` fallback), 3 anchor links, one `nav-cta`. Collapses to logo + CTA under 850px.
- `mobile-action`: fixed bottom CTA bar, mobile only.
- `site-footer`: name + address + `footer-links`.
- Reveal-on-scroll with direction/delay variants; sections can `.vanish-out` as they leave upward
- Marquee strip after the hero (their lingo, not filler)
- Liquid-glass header, contact cards, and hero float
- Sticky mobile action bar
- Per-site `attitude` skin (`glass` | `editorial` | `brutal` | `warm` | `industrial` | `neon`) so every homepage has its own feel
- Social rail fed by harvested site/social imagery via `apply-harvest-images.js`
- Buttons: pill (`border-radius:999px`) with hover lift (`translateY(-2px)` + shadow) and active scale `.97`. `:focus-visible` outline in `--accent`.
- Images: local `assets/image-N.webp`, `loading="lazy"` on everything below the hero, descriptive `alt` text always.
- Breakpoints: 850px (stack splits, hide nav links, show mobile-action) and 520px (single-column everything, tighter type scale).
- Type scale: `clamp()` everywhere. Hero h1 `clamp(3.6rem, 7vw, 7rem)`; section h2 `clamp(2.6rem, 5.2vw, 5.6rem)`; `text-wrap:balance` on headings, `text-wrap:pretty` on paragraphs.

## Head requirements (every site)

1. `<meta name="viewport">`, charset, `theme-color` set to `--deep`
2. Title pattern: `Business Name | Philadelphia` (or city)
3. Real meta description pulled from the business's actual positioning
4. `LocalBusiness` JSON-LD: name, url, telephone, address
5. `noindex,nofollow` for prospect demos; REMOVE it when a site goes live for a paying client
6. Google Fonts preconnect pair before the stylesheet link

## Per-site skin layer

Sites with extra character add a second class (`profile-pats-king-steaks`) and an appended CSS block that only overrides decoration (textures, tilted elements, marquee strips). The base template classes and section structure never change. Put customization in the skin layer, not in the base.

## Copy voice

Short declarative claims in the hero ("BEST CHEESESTEAK IN PHILLY"). Proof strips state facts, not adjectives. Offerings name real menu items or services. Everything follows `System/writing-rules.md`: no em dashes, contractions, no corporate filler.

## QA checklist before a site ships

- View at 390px, 850px, and 1440px: no horizontal overflow, hero readable, mobile-action visible on phone width
- All `assets/` images exist and have alt text
- Every CTA href points at a real destination (order link, tel:, maps)
- JSON-LD parses; phone and address match the real business
- Contrast: text on every surface passes WCAG AA (that's what the `--on-*` tokens are for)
- `noindex` present for demos, absent for live client sites
