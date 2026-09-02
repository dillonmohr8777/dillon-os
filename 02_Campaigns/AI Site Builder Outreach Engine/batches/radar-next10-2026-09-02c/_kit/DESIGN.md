---
tags: [campaign, batch, design-system]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
date: 2026-09-02
source_refs: ["02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/selection.md"]
---

# Art direction — radar-next10-2026-09-02c

Ten bespoke prospect sites. No factory template, **no photographs of any kind**:
every visual is CSS or inline SVG. Ten sites must not look like ten recolors of
one page — the kit supplies structure and safety, you supply the character.

## Palette: exactly three colors per business

Derive them, never invent them.

1. **`--brand`** — the dominant color on their *live* site (nav bar, logo,
   awning, signage in their own artwork). Screenshot it, sample it, use it.
2. **`--brand-2`** — one deep neutral, tinted toward `--brand`. Never `#000`.
   This is the footer, the dark section, the anchor.
3. **`--accent`** — one warm accent for the single primary action per screen.
   If their brand color is already warm, push the accent cooler or deeper.

`--paper` is a warm off-white tinted toward the brand, never `#fff`. `--ink` is
a near-black tinted toward the brand, never `#000`. Everything else (`--panel`,
`--line`, `--muted`) derives via `color-mix()` — do not hand-pick them.

Set `--on-brand`, `--on-deep`, `--on-accent` to `#ffffff` or `#0b0b0b`,
whichever clears 4.5:1 on that surface. A light `--brand` **must** flip
`--on-brand` to `#0b0b0b`. This is checked, not trusted.

If a competitor's logo could sit on the page unchanged, the palette isn't theirs
yet. No two sites in this batch may ship the same `--brand`.

## Type: one display, one text, always with a fallback

Google Fonts only, two families maximum, and every stack ends in a system font
so the page reads correctly before webfonts land:

```
--font-display: "Fraunces", Georgia, "Times New Roman", serif;
--font-text: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

Pairings that fit this batch's verticals:

| Character | Display | Text |
|---|---|---|
| Upscale, clinical, established | Fraunces / Playfair Display / Lora | Inter / Public Sans |
| Blue-collar, mechanical, loud | Archivo Black / Anton / Bebas Neue | Work Sans / Chivo |
| Food, warm, hand-made | Bricolage Grotesque / Fraunces | Jost / Work Sans |
| Modern service, neutral | Space Grotesk | IBM Plex Sans |

Use `<link rel="preconnect">` plus one `display=swap` request. Sizing comes from
the `--fs-*` clamp tokens only; never hard-code a px font size.

## Spacing and rhythm

- Use the `--s-1`…`--s-10` scale. A raw px margin in a site file is a bug.
- Sections use `--section-y`; only a deliberate breather uses less.
- Body copy stays inside `--measure` (68ch). Headings cap around 22ch.
- Alternate surfaces: `paper → panel → deep → paper → accent`. **Never two
  adjacent sections on the same surface**, and **never two art-only sections
  adjacent** — art always earns its place next to copy or proof.
- One focal point per section. If two elements compete, one is decoration.

## Motion: one dominant moment, then quiet

- The **hero art is the only loud motion on the page.** One pattern from `art/`,
  in the `.hero-art` slot, `aria-hidden="true"`.
- Everything below the fold is quiet: `data-reveal` fades, `data-stagger` on
  grids, one `data-count` stats strip, one marquee at most.
- Transform and opacity only. Never animate width, height, top, left, or shadow.
- Nothing over 1.1s. No carousels, no scroll-jacking, no parallax on scroll —
  `data-parallax` is pointer-driven, fine-pointer only, and capped ~14px.
- Hero h1 and the primary CTA are readable at first paint, animated or not.

## Performance and integrity budget

- **250 KB total per site, everything included.** Realistic split: ~35 KB HTML,
  14 KB `kit.css`, 4 KB `kit.js`, under 8 KB of inline SVG, the rest fonts.
- No external images, no icon fonts, no analytics, no third-party scripts.
- **Zero layout shift.** `.split-art` and every art box carry `aspect-ratio`;
  reveals move only inside their own box.
- `noindex,nofollow` on every prospect demo. It comes off only when they pay.
- Placeholders stay placeholders: never invent a phone number, address, hours,
  price, or review. If it isn't in the brief, it doesn't ship.

## Art patterns

`art/airstream-hvac.svg` (HVAC/mechanical) · `art/steam-citrus-food.svg`
(restaurant/juice) · `art/tread-road-auto.svg` (auto, parts, tyres) ·
`art/roofline-rain-sun-exterior.svg` (roofing/exterior) ·
`art/arcs-professional.svg` (dental/professional).

Three sites in this batch share the restaurant pattern and three share the auto
pattern. **Differentiate them by palette, type, layout order, and scale/rotation
of the art — not by reusing the same composition.** Flip it, crop it hard, or
move it to a `.split-art` panel instead of the hero.

## Builder checklist — run before you call a site done

- [ ] 390 px and 1440 px both render with **no horizontal overflow**
- [ ] `h1` is visible and readable at first paint, no font-swap jump
- [ ] Every text/background pair clears **4.5:1** (3:1 for large display text)
- [ ] Full keyboard pass: skip link first, visible focus ring everywhere, no trap
- [ ] Reduced motion on ⇒ everything static, nothing hidden
- [ ] JS off ⇒ all content visible, all links work
- [ ] No two adjacent sections share a surface; no two art-only sections adjacent
- [ ] Total page weight under 250 KB, no external image or script requests
- [ ] `noindex,nofollow` present; no invented business facts
- [ ] Hand to `qa-critic`. You do not pass your own build.
