# Shadow Heating & Cooling — Agent Guide

This folder is a **single-file, self-contained marketing site** for Shadow Heating &
Cooling (residential HVAC, Hampshire, IL). Everything — the Three.js library, the
fonts, and every image — is inlined into `index.html` as text/base64, so it runs with
**no build step, no npm install, and no internet connection**.

If you are an AI coding agent (Codex, Claude, etc.), this file tells you how to run,
preview, verify, and edit it. Read it before touching `index.html`.

## Run / preview

The site is a static file. Any of these work:

```bash
# 1. Simplest — no tools. Just open it:
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows

# 2. Local dev server (nicer; avoids file:// quirks):
npm start                # -> http://localhost:3000   (uses `npx serve`)
# or, with no Node:
python3 -m http.server 3000
```

Deploy = copy `index.html` to any static host (Netlify drag-and-drop at
app.netlify.com/drop, GitHub Pages, Vercel, S3, etc.). No configuration needed.

## Verify a change visually (headless — no GUI needed)

You cannot judge this site from the source alone (there's a live 3D canvas). Always
render it and look:

```bash
# Screenshot the whole page with headless Chromium:
npm run screenshot                 # writes preview.png (Playwright)
# or drive Chromium yourself against the file:// URL and check the console is clean.
```

Confirm: no console errors, the hero shows a 3D **AC condenser unit** (spinning fan),
the three service cards show the **bear** images, and the "Meet the Team" band shows the
mascot bear and **Bean** the cat.

## Anatomy of `index.html` (top → bottom)

1. **`<style>`** — design tokens as CSS custom properties at the very top:
   `--ember`/`--ember-l` (heat orange), `--ice`/`--ice-l` (cool blue), `--gold`
   (championship accent), `--bg`/`--surface` (dark ground). Two `@font-face` blocks
   embed **Oswald** (condensed display) and **Inter** (body) as base64 — do not replace
   with a CDN link (this file must stay offline-capable).
2. **Markup** — nav → hero (`#heroCanvas`) → marquee → stats → why → services
   (`#svcGrid`) → playbook + thermostat → process → packages → reviews → service area →
   **meet-the-team** (`#team`: mascot bear + Bean) → FAQ → contact → footer.
3. **Main `<script>`** — all editable **content lives in JS data arrays**: `services`,
   `packages`, `reviews`, `faqs`, `process`, `playbook`, `areas`, `marqueeItems`.
   Also all interactivity: mobile nav, FAQ accordion, monthly/annual pricing toggle,
   reviews carousel, animated counters, scroll-reveal, and the draggable thermostat dial.
4. **`window.SHADOW_IMG = {…}`** — every image as a base64 data URI:
   `logo`, `heatBear`, `coolBear`, `airBear`, `mascot`, `bean`. A small loader assigns
   them to elements via `data-img="key"` (→ `<img src>` or background) and
   `data-bg="key"` (→ background-image).
5. **`window.THREE = (…)`** — the entire Three.js library, inlined (this is the bulk of
   the file size).
6. **Hero `<script>`** — the 3D **AC condenser unit** scene: body + coil louvers, a
   spinning top fan + grille, copper refrigerant line-set, a hex condenser pad, an ember
   status LED, and cool-air particles venting up. Mouse-reactive + gently floating.

## How to edit common things

| Want to change… | Where |
|---|---|
| Phone, hours, address, copy | text in the markup + the data arrays in the main script |
| Services / prices / reviews / FAQ | the `services` / `packages` / `reviews` / `faqs` arrays |
| Brand colors | the CSS custom properties at the top of `<style>` |
| Swap a photo/logo | replace the base64 string for that key in `window.SHADOW_IMG` (keep the `data:image/…;base64,` prefix) |
| The 3D unit (geometry, colors, motion) | the hero `<script>` at the bottom — plain Three.js (`THREE.Mesh`, `THREE.MeshStandardMaterial`, lights, `requestAnimationFrame`) |

Keep it a single self-contained file. If you add an asset, inline it (base64) rather
than linking an external URL, so `open index.html` keeps working with no network.

## Business facts (source of truth)

- **Shadow Heating & Cooling** — "Defend Your Comfort Zone" · "Fast Response. No Fumbles."
- Phone **(847) 757-9450** · Email **Shadowhvac1@gmail.com**
- **334 E Grove, Hampshire, IL 60140** · **24/7** emergency service · serves Kane County
- Mascot: the **Shadow Bear**. Office cat: **Bean**, "Chief Comfort Officer."
