---
employer: Align HCM
tags: [brand, align-hcm, smartcare]
source: skills/alignhcm-brand-system/SKILL.md (dillonmohr8777/claude-skills-repo)
updated: 2026-08-13
---

# Brand Guidelines

Summary: Align has no single interchangeable orange. Pick the surface first, then
the tokens. The execution authority is the `alignhcm-brand-system` skill.

## Authority

This page is a quick reference, not the source of truth. Before producing any
Align deliverable, load `skills/alignhcm-brand-system/SKILL.md` from
`dillonmohr8777/claude-skills-repo`, read the reference files for your surface,
and run `brand_lint.py --surface <surface>` before delivery.

That skill supersedes the older `alignhcm-brand`, `alignhcm-smartcare`, and
`alignhcm-carousel-video` skills, all three now deprecated.

## Palette by surface

Tokens do not travel between surfaces. Using the web orange in a deck is an error.

| Surface | Primary orange | Ground |
| --- | --- | --- |
| PowerPoint, formal documents | `#E97722` | Navy `#232E3E` |
| Web, HubSpot | `#FF9902` | Slate `#2C3C4C`, ink navy `#041424` |
| LinkedIn carousel, social | `#F05A28` to `#FF6B35` | Ink navy `#0A1628` |
| Video, motion | `#F47A25`, `#FF9A4D` | Ink `#0A1424` |
| Blog, editorial | `#FF6B2B` | Navy deep `#0A1628`, warm paper `#FBF9F6` |

Teal `#2BB5A0` is a secondary accent on social and editorial only.

## Fonts by surface

| Surface | Type system |
| --- | --- |
| Decks, formal documents | Cambria display, Calibri body |
| Web, HubSpot | Inter |
| Blog, editorial | Plus Jakarta Sans display, DM Sans body |
| Video, motion | Gelasio display, Inter support |
| Social | Inter, or DM Sans plus Syne for the premium variant |

Do not mix two systems inside one artifact.

## Never use

- `#E8760A` and `#414042`. They come from the generic `cool-data-elements` skill
  and ship in no Align file.
- `#E8832A` for new work. Historical documentation evidence only, ruled out
  2026-08-13.
- Generic `brand-guidelines` or `cool-data-elements` tokens on any Align work.

## Tone

Professional, consultative, expert-level HCM knowledge. Never salesy. Speak to decision-makers and implementation leaders who already understand UKG, Workday, and payroll operations.

## Writing rules

- **No em dashes anywhere.** Ever. Use periods, commas, colons, or restructure.
- Use contractions.
- Bullet character only, never dashes as list markers.

## SmartCare messaging

Ongoing expert access. Platform optimization. Post-go-live support. Stabilize → Essentials → Accelerate → Transform maturity ladder.
