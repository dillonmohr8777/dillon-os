# Papa Advertising — Design Reference Spec

Source: mobile screen recording of papaadvertising.com, captured by Dillon
(1440px-wide portrait frames, f-001..010 at 1fps + g-001..030 at 3fps). This
is a **design-grammar reference for the site factory**, not a client asset.
See Usage boundary below.

## Logo

Wordmark "PAPA" set in a heavy, tightly-kerned geometric sans, all-caps, in
white on the blue hero. The two A's have their crossbars replaced by two
small solid orange capsule/pill shapes sitting where the apex would be —
this is the one distinctive brand mark (not a separate icon, a typographic
substitution). Same wordmark repeats small and white inside the dark nav bar
at every scroll position. Do not reproduce this wordmark or the pill-in-A
device on outreach sites — it identifies Papa Advertising specifically.

## Palette

| Hex | Role | Source frame |
|---|---|---|
| `#0468b6` (avg of `#076bbe`/`#0063b3`) | Brand blue — hero background, gradient CTA band | 01-nav-hero.png, 08-cta-band-footer.png |
| `#005a9d` (avg of `#005a9d`/`#0460a0`) | Ink blue — section headings ("RECENT WORK", "OUR SERVICES"), body copy in hero-b block | 03-work-grid-heading.png, 07-services-accordion.png |
| `#e17f1e` | Orange accent — pill marks in logo, hand-drawn underline/circle doodles, headphone icon | 01-nav-hero.png |
| `#d96f12` | Orange solid — button fills ("LEARN MORE", "DIVE DEEPER", "START TODAY") | 02-hero-b-message-cta.png, 07-services-accordion.png |
| `#363f45` | Charcoal — sticky nav bar background | 01-nav-hero.png |
| `#e3e8ec` | Pale blue-gray surface — client-logo-wall band | 06-client-logo-wall.png |
| `#ffffff` | White — card backgrounds, hero wordmark, footer nav text | throughout |
| `#1491cc` | Mid blue — accordion chevron-circle fill, secondary UI accent | 07-services-accordion.png |

Note: the orange accent and button fill read as the same brand orange; the
button measures slightly darker, likely a shadow/gradient effect, not a
second token.

## Type

- **Display / logo face**: extremely heavy, geometric, all-caps grotesque
  with almost no aperture — verticals are near-parallel, very tight tracking,
  large x-height relative to cap-height. Used for the PAPA wordmark and for
  big section headings ("RECENT WORK", "OUR SERVICES", "SOMETHING AWESOME").
  Visual match, not verified: **Archivo Black** or **Anton** (Google Fonts).
- **Hand-lettered accent face**: casual script/marker style used only for
  short emotional lines — "We solve problems." in the nav, "Let's Build" in
  the closing CTA. Loose, slightly wobbly baseline, thin stroke.
  Visual match, not verified: **Caveat** or **Kalam** (Google Fonts).
- **Body / UI face**: a clean, slightly rounded grotesque sans-serif for
  paragraph copy, button labels, accordion row labels ("BRANDING",
  "MARKETING", "WEBSITES", "TRAFFIC") and nav links (HOME/SERVICES/etc). Mid
  weight, generous line-height (~1.5), sentence case for body copy, all-caps
  for buttons and accordion labels with moderate tracking.
  Visual match, not verified: **Nunito Sans** or **Poppins** (Google Fonts).
- **Approximate sizes relative to a 390px mobile viewport**: hero wordmark
  ~62px cap-height (occupies most of the viewport width); section headings
  ("RECENT WORK") ~48–54px; body paragraph ~20px with ~1.5 line-height;
  button label ~18px all-caps; accordion row label ~22px semibold.
  Desktop sizes are not observed — this is a mobile capture only.

## Layout

- Container: generous side gutters, ~24–32px on mobile (6–8% of the 390px
  viewport), suggesting a ~1200px max-width container on desktop (estimated).
- Section vertical padding is large and consistent: ~80–120px between major
  sections on mobile, giving an unhurried rhythm despite dense content.
- Work-grid cards: large full-width image (~4:3 to 16:10, varies per piece —
  flat art, laptop mockup, lifestyle photo), white card bg with soft drop
  shadow, ~8–12px radius on image corners, plain all-caps client-name
  caption below (no card border; the shadow does the separating).
- Buttons: full pill/stadium shape, solid orange fill, white bold all-caps
  label, no border — the same shape recurs for every CTA on the page
  ("LEARN MORE," "DIVE DEEPER," "VIEW MORE," "START TODAY"), making the CTA
  shape a consistent, recognizable target throughout the scroll.
- Client-logo wall: plain pale-blue-gray full-bleed band, low logo density
  (two per mobile screen), generously spaced, greyscale-adjacent — restraint
  over a crowded logo soup.
- Accordion (services list): plain horizontal rules between rows, no card
  chrome, right-aligned solid-blue circular chevron toggle per row — quiet
  and list-like against the loud hero/CTA sections.
- Hand-drawn doodle overlays (crown, headphone-and-mic, speech-bubble
  scribble, wavy line, exclamation/question marks, arrow underline) sit atop
  both the blue hero and white body sections in flat orange — the single
  strongest "handmade, not corporate" device on the page.
- No grain/texture overlay; backgrounds are flat/gradient, except a faint
  tone-on-tone line-art pattern ("LOVE WHAT WE DO" + icon outlines) baked
  into the hero blue at low contrast.
- No large hero photo — the hero leads with wordmark + illustration + one
  tilted product photo (CBD bottles) inset below with a torn/cut drop
  shadow, not a full-bleed image.

## Components

**Nav bar** — fixed/sticky dark charcoal bar, wordmark left, hamburger +
"MENU" label right in orange/white, persists unchanged through the entire
scroll (confirmed identical crop across all 40 frames) — this is what keeps
navigation always one tap away without eating body-copy space, and it never
photographs as "stuck weird" because its own background never competes with
scrolled content.

**Hero** — blue field with tone-on-tone pattern, big wordmark with the
orange pill-in-A device, a tilted/rotated product photo breaking out of its
own frame at the bottom edge (photo appears rotated ~15° with soft shadow,
reads as "dropped in," not a static rectangle). Premium because the imagery
has intentional imperfection (rotation, shadow, bleed past its box) instead
of a locked grid photo.

**Hero-B (message + CTA)** — big bold all-caps blue-on-white statement
sentence, hand-drawn doodles flanking it (headphones = "we listen," speech
bubble = "we share ideas"), single pill CTA button. Premium because the
doodles do the job icons usually do, but read as authored, not stock.

**Recent Work (portfolio grid)** — heading in the heavy display face with a
hand-drawn double-underline scribble beneath it (not a straight rule),
stacked full-width cards, one per client, image-first with the client name
as a quiet caption below (not overlaid on the image). Premium because every
card's creative is a different medium (print flyer, laptop mockup, product
photo, apparel photo, tradeshow booth render) — it reads as range, not a
templated three-photo-per-client layout.

**Client-logo wall** — flat pale band, low logo density, generous
whitespace between marks. Premium because it resists the temptation to
cram every logo the agency has ever touched onto one screen; two logos per
mobile screen reads deliberate, almost editorial.

**Services accordion** — plain list, one word per service (Branding /
Marketing / Websites / Traffic), blue circular chevron toggle, thin
dividing rules only. Premium because after two loud, illustrated sections
it lets the page go quiet and scannable right where a visitor needs to
compare offerings fast.

**CTA / closing band** — full-bleed vertical blue gradient (lighter top to
darker bottom), hand-drawn crown, hand-lettered "Let's Build" over bold
display "SOMETHING AWESOME," short paragraph, single pill button, then the
footer nav row and copyright directly inside the same blue field (no
separate white footer) — the whole close-out reads as one uninterrupted
gesture rather than "content" then "footer."

## Motion

Observed directly in the recording (not inferred): straightforward vertical
scroll with no visible parallax differential between the hero illustration
layer and the product photo layer — they move together at the same rate.
The nav bar is fixed/sticky: identical pixel content across every frame
regardless of scroll position. No entrance/fade-in animation was caught at
1–3fps sampling — sections are already at rest by the time each frame lands,
which is inconclusive at this sample rate: a fast (<300ms) scroll-reveal
could exist between frames and go uncaught. No hover or video content
observed (mobile touch recording, no cursor, no autoplay video in any
frame). No loading skeletons or lazy-load pop-in artifacts visible.

## Imagery

Mixed-medium portfolio imagery by design: flat vector/print-design mockups
(NWIRC flyer, Electric Materials print ad), device mockups (Wavepoint on a
laptop), straight product/lifestyle photography (French Creek Nursery hat,
CBD oil bottles in the hero), and 3D render (MFG Tray tradeshow booth, Erie
Cancer Wellness Center interior). No single photographic "look" — the
throughline is the orange-doodle overlay and pill-button treatment applied
consistently across all of it, not a shared photo grade or filter.

## Voice

Verbatim lines readable in frames: "We solve problems." (nav tagline) ·
"WE LISTEN. WE ASK A LOT OF QUESTIONS. WE SHARE IDEAS. AND THEN, WE CREATE
STRATEGIC MARKETING PROGRAMS WITH INNOVATIVE SOLUTIONS THAT DELIVER REAL
RESULTS." (hero-B statement) · "LEARN MORE" / "DIVE DEEPER" / "VIEW MORE" /
"START TODAY" (button labels) · "RECENT WORK" / "OUR SERVICES" (section
headings) · "If you boil what we do down to one thing, we solve problems.
Sometimes, with one project at a time. And just as often, with one big
daddy marketing plan and an annual budget." (services intro) · "BRANDING" /
"MARKETING" / "WEBSITES" / "TRAFFIC" (accordion labels) · "Let's Build" /
"SOMETHING AWESOME" (closing CTA) · "We've been building BA brands since
1990. We do not dabble in this arena; we dominate it. Call, email, or
drop-in and get rollin' with a FREE consult." (closing CTA body — "BA" reads
as a regional/industry abbreviation, unverified) · "© Copyright 2026. PAPA
Advertising, Inc, Erie, PA. All Rights Reserved." (footer)

Voice overall: confident, plain-spoken, a little folksy/regional ("big daddy
marketing plan," "get rollin'"), short punchy sentences, no jargon, all-caps
used for emphasis and section labels rather than for whole paragraphs.

## What makes it premium

The page pairs a genuinely loud, illustrated, hand-drawn brand layer
(doodles, script lettering, tilted photography) against a disciplined, quiet
structural grammar (one repeating pill-button shape, one heavy display face,
consistent card treatment, restrained logo density) — the looseness reads as
craft rather than mess because everything underneath it is rigidly
consistent. It also varies its own rhythm deliberately: loud hero, loud
message block, image-forward portfolio, quiet logo wall, quiet accordion,
loud closing band — so no two adjacent sections compete for the same kind of
attention. Nothing on the page apologizes for being a marketing site; the
copy is short, declarative, and confident instead of hedging with feature
lists.

## Usage boundary

Papa Advertising's wordmark, the pill-in-A logo device, and the specific
client logos shown on this page (NWIRC, Wavepoint, French Creek Nursery,
Electric Materials, MFG Tray, Erie Cancer Wellness Center, Rooftop
Equipment, Red Letter Hospitality) belong to Papa Advertising and its
clients — do not reproduce, trace, or closely imitate any of them. Only the
design grammar documented above (palette roles, type pairing logic, pill
button shape, doodle-overlay technique, section rhythm, card and accordion
patterns) is intended for reuse in outreach-site builds.

## Confidence

- **Measured directly** (Pillow-sampled from actual frame pixels): all hex
  values in the Palette table, section order, button shape, card
  radius/shadow presence, nav-bar fixed behavior, accordion structure, and
  all verbatim copy.
- **Estimated / visual judgment**: exact type families (flagged "visual
  match, not verified"), precise px sizes/line-heights (scaled from a
  1440px portrait capture, not a browser inspector), container max-width
  and desktop breakpoint behavior — this is a **mobile-only recording**, so
  desktop proportions, nav collapse, and whether the work grid goes
  multi-column above mobile are all inferred, not observed.
- **Not observed at all**: hover/focus states, keyboard nav, the
  open/expanded accordion state, the full "MENU" slide-out content, and
  page-load performance — the recording never triggers the hamburger menu
  or an accordion expansion.
