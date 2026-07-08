# Align HCM Web System — canonical source of truth

> Every Align HCM / SmartCare web page, HubSpot module, and Netlify prototype
> conforms to THIS file. If a page disagrees with this file, the page is wrong.
> This exists because standalone builds kept drifting (wrong orange, Arial
> fallback, missing footer, bolted-on dashboards). One spec ends the drift.

Extracted from production: `alignhcm.com`, the shipped global-header mega-menu
snippet, and the `alignhcm-brand` skill. Verified 2026-07-08.

---

## 1. The golden rule

**On HubSpot, the header, navigation menu, and footer are GLOBAL content.**
A page does not get its own nav or footer. It inherits them. A standalone
prototype (Netlify) must *mirror* the global header + footer markup in this
folder, never invent its own. If you are hand-rolling a nav bar or a footer on
an Align page, stop — you are recreating the exact drift this file prevents.

---

## 2. Brand tokens (exact — no "close enough")

### Color
| Token | Hex | Use |
|---|---|---|
| `--orange` | `#F05A28` | primary accent, links, active nav, bullets |
| `--orange-amber` | `#E8832A` | secondary orange |
| `--orange-hot` | `#FF6B35` | gradient end-stop only |
| `--gold` | `#F5A623` | sparing highlight |
| `--teal` | `#2BB5A0` | sparing secondary accent |
| `--ink` | `#111820` | darkest text / dark sections |
| `--navy` | `#17324d` | headings on light, deep panels |
| `--navy-2` | `#22384f` | navy variant |
| `--warm` | `#f4efe7` | warm cream section background |
| `--bg` | `#fafafa` | light section background |
| `--white` | `#ffffff` | cards, header |

**CTA gradient (signature):** `linear-gradient(135deg, #F05A28 0%, #FF6B35 100%)`
**Banned:** `#ff9700`, `#ff970f`, `#f2652f` and any other "orange" — these are
the Codex drift values. Only `#F05A28` (+ gradient end `#FF6B35`).

### Type
- Load: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap`
- Headings + UI: `'Plus Jakarta Sans', sans-serif`
- Body / small text: `'DM Sans', sans-serif`
- `Inter` acceptable where already used.
- **Never** ship `Arial`/`Helvetica` as the primary face. That is the tell of a
  broken build.

### Signature effects (apply where relevant)
- CTA buttons: orange→hot gradient, pill radius (`999px`), shimmer optional.
- Accent word in an `<h1>`: colored `--orange` (see the manufacturing hero).
- Glass depth panels: `backdrop-filter: blur(20–24px)`.
- Ambient glow: large low-opacity orange blur blob in a corner.
- No em dashes in copy, ever. Contractions on. Bullet character, not hyphen.

---

## 3. Navigation — the menu (THE fix)

**Canonical top-level order (left → right):**

1. Home
2. Services ▾
3. Public Sector
4. SmartCare
5. Channel Partner ▾
6. Partners ▾
7. Insights
8. Case Studies
9. About ▾
10. **Contact us** (pill CTA, far right)

Notes:
- `Public Sector` is a **new** top-level item at position 3 (the manufacturing /
  public-sector page). It did not exist in the old menu; add it.
- Keep the HubSpot **Elevate** header classes (`hs-elevate-*`). Do not replace
  the header component.
- Keep the **icon tiles** in the mega-menu submenus. They are injected by the JS
  icon map in `global-header-mega-menu.html` (`labelIcons` + inline SVG). Colored
  tile variants: default orange, `--rose`, `--gold`, `--slate`.
- Submenu opens on hover/focus, 4-col grid (3-col 901–1240px), white rounded card.
- Corrected, paste-ready global header: **`global-header-mega-menu.html`**.

This is the artifact to paste into HubSpot's global content editor, AND the
HubSpot Navigation Menu (Settings → Content → Navigation) must be reordered to
match items 1–10 above.

---

## 4. Sliding logo strip (client proof)

Required on marketing pages (it's on the real site). Auto-scrolling marquee,
grayscale-to-color optional, pauses on hover, duplicated track for seamless loop.
Reusable markup: **`partials/logo-carousel.html`**.

Current client logos: Arrow Electronics, Vibra Healthcare, VIEW, Alterra Mountain
Company, Kimberly-Clark Professional, First Horizon, Air Methods, Troon, Resorts
World, OhioHealth. (Keep whatever set the live site currently shows; do not drop
logos without a reason.)

---

## 5. Footer — continuity is mandatory

**A page may not ship a different footer.** On HubSpot it is global; a prototype
mirrors **`partials/footer.html`**. The heading line MAY be page-specific (e.g.
"Build a stronger manufacturer") but structure, colors, and content stay identical.

Real footer content (do not alter):
- Heading: "We are happy to help" (page variant allowed for the CTA line).
- Copy: "No matter where you are in your HCM solution journey, we can help you
  thrive with HR, payroll, and workforce management solutions. Contact us for a
  free, no-obligation assessment. Please fill out the Contact Us form or call us
  at 888-905-4824."
- St. Petersburg Office: 360 Central Ave Suite 800, St. Petersburg, FL 33701
- Toronto Office: 60 Atlantic Ave. Suite 200, Toronto, ON M6K 1X9
- Phone: 888-905-4824 · LinkedIn · Privacy Policy
- "© 2026 Align HCM. All Rights Reserved."
- Style: dark background, orange (`#F05A28`) uppercase column headers in Plus
  Jakarta Sans, muted gray body in DM Sans, thin orange rule at top.

---

## 6. Hard bans (the "Codex broke it" checklist)

- ❌ No fake dashboard / metric board in a hero ("12 open shifts, 4.8% overtime
  risk, 98% time ready"). Removed. Replace with on-brand proof, never a mock UI.
- ❌ No `Arial`/`Helvetica` primary font.
- ❌ No off-brand orange (`#ff9700`, `#ff970f`, `#f2652f`).
- ❌ No page-specific nav bar or footer that differs from global.
- ❌ No missing footer.
- ❌ No em dashes in copy.

If any of these appear on a page, it fails QA (§7).

---

## 7. QA checklist (pass/fail per page)

1. Nav order matches §3 exactly, incl. `Public Sector` at position 3.
2. Mega-menu icon tiles present and colored.
3. Primary font resolves to Plus Jakarta Sans (not Arial).
4. Every orange is `#F05A28` (or the gradient); zero banned oranges.
5. Sliding logo strip present and animating.
6. Footer present, matches §5 content + style; only the heading line may vary.
7. No dashboard/metric-board mock anywhere.
8. Mobile: nav collapses, grids stack, no horizontal scroll.
9. Copy: no em dashes, contractions used.

---

## 8. Files in this folder

- `ALIGN_WEB_SYSTEM.md` — this spec.
- `global-header-mega-menu.html` — corrected global header (paste into HubSpot).
- `site/index.html` — corrected, deploy-ready manufacturing/public-sector page
  (real Align logo + real client logos in `site/assets/`).
- `partials/logo-carousel.html` — reusable sliding logo strip.
- `partials/footer.html` — reusable continuity footer.

Agents that apply/enforce this spec live in `.claude/agents/align-*`.
