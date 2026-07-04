# Shadow Heating & Cooling — Website (Next.js) — Agent Guide

This is the **full multi-page site** for Shadow Heating & Cooling (Hampshire, IL): a
Next.js 15 App Router app that builds to a **static export** (`out/`) and deploys to
Netlify. If you are an agent (Codex, Claude, etc.), this is how to run, build, deploy,
and edit it.

## Pages (10)

`/` (Home) · `/services` · `/packages` · `/book-a-service` · `/about` · `/faq` ·
`/contact` · `/reviews` · `/service-area` · `/financing`

## Run / build

```bash
npm install          # first time
npm run dev          # dev server → http://localhost:3000
npm run build        # static export → ./out  (this is what gets deployed)
```

`next.config.mjs` sets `output: "export"` + `images.unoptimized` + `eslint.ignoreDuringBuilds`,
so `npm run build` produces a fully static `out/` folder with no server needed.

## Deploy to Netlify

`netlify.toml` is already configured for repo-connected deploys
(base `01_Clients/Shadow HVAC/website`, build `npm run build`, publish `out`, Node 22).

**CLI deploy (needs a token — the human provides it, never commit it):**

```bash
export NETLIFY_AUTH_TOKEN=xxxxxxxx      # Netlify → User settings → Personal access tokens
export NETLIFY_SITE_ID=<site-api-id>    # optional: target an existing site, non-interactive
npm run deploy:draft                    # build + preview URL (safe)
npm run deploy                          # build + publish to production
```

**Or connect the repo once** at app.netlify.com (import `dillonmohr8777/dillon-os`; the
settings above are read from `netlify.toml`) → auto-deploys on every push to `main`.

Custom domain: Netlify → Domain management → add `shadowheatingandcooling.com`.

## Verify a change visually (headless)

There's a live 3D canvas — always render and look, don't judge from source:

```bash
npm run build && npx --yes serve out -l 4400 &
npx --yes playwright screenshot --viewport-size=1440,900 http://localhost:4400/ home.png
```

Confirm: no console errors; the hero is a 3D **AC condenser unit** (spinning fan); the
Heating/Cooling/Indoor-Air-Quality cards show the **bear** images; the home "Meet the
Team" band shows the mascot bear and **Bean**.

## Where things live

| Thing | File |
|---|---|
| All content data (services, packages, reviews, FAQ, areas, team, business info) | `lib/site.ts` |
| Brand imagery (logo, bears, mascot, Bean) | `public/img/*` — referenced as `/img/…` |
| Nav / footer (use the real logo) | `components/Navbar.tsx`, `components/Footer.tsx` |
| 3D AC-condenser hero (plain three.js, mounted in `useEffect`) | `components/three/HeroCanvas.tsx` (wrapped by `Hero3D.tsx`, client-only) |
| Draggable 3D thermostat | `components/ThermostatDial.tsx` + `components/three/ThermostatScene.tsx` |
| Meet-the-team mascot + Bean | `components/TeamBean.tsx` (rendered on the home page) |
| Colors / design tokens | `tailwind.config.ts` + `app/globals.css` |

To add a service image, drop a file in `public/img/` and set `img: "/img/<file>"` on that
entry in `lib/site.ts`. Swap the logo/bears/Bean by replacing the files in `public/img/`.

## Business facts (source of truth)

- **Shadow Heating & Cooling** — "Defend Your Comfort Zone" · "Fast Response. No Fumbles."
- (847) 757-9450 · Shadowhvac1@gmail.com · 334 E Grove, Hampshire, IL 60140 · 24/7 emergency.
- Mascot: the **Shadow Bear**. Office cat: **Bean**, "Chief Comfort Officer."

## Note on the single-file version

There's also a zero-build single-file build at `../site/index.html` (everything inlined).
This Next.js app is the **full multi-page website**; prefer it for real development.
