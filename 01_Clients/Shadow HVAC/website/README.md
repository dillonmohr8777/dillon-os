# Shadow Heating & Cooling — Website

> **Defend Your Comfort Zone.** *Fast Response. No Fumbles.*

A modern, 3D, fully static marketing site for Shadow Heating & Cooling — a
residential HVAC contractor in Hampshire, IL serving Kane County.

Built as a rebuild of `shadowheatingandcooling.com`, blending the live site's
page structure and content with the football-themed "bear concept" direction
(*Defend Your Comfort Zone*, the *Championship Playbook*, *Fast Response. No
Fumbles.*).

## Tech stack

| Layer        | Choice                                                      |
| ------------ | ---------------------------------------------------------- |
| Framework    | Next.js 15 (App Router) · TypeScript · static export       |
| 3D           | React Three Fiber + drei (Three.js) — code-split, client-only |
| Motion       | Framer Motion                                              |
| Styling      | Tailwind CSS (custom heat/ice/gold token system)           |
| Icons        | lucide-react                                               |
| Hosting      | Netlify (`netlify.toml`) — publishes `out/`                |

## Pages (their exact pages)

`/` · `/services` · `/packages` · `/book-a-service` · `/about` · `/faq` ·
`/contact` · `/reviews` · `/service-area` · `/financing`

## Signature interactive / 3D elements

- **3D hero scene** — animated energy core with orbiting heat (ember) and cool
  (ice) rings, rising/falling particle streams, mouse-parallax, and a starfield.
- **Draggable 3D thermostat dial** — spin it (or tap ±) to set the temperature;
  the segment ring morphs from ice-blue to ember-orange and the mode switches
  between HEAT / COOL / AUTO.
- Radar-style **service-area coverage map**, animated **stat counters**,
  **Championship Playbook**, **multi-step booking form**, **pricing toggle**
  (monthly/annual), **reviews carousel**, **FAQ accordion**, marquee, and
  scroll-reveal animations throughout.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## Deploy (Netlify)

`netlify.toml` is preconfigured. Point Netlify at this repo with:

- **Base directory:** `01_Clients/Shadow HVAC/website`
- **Build command:** `npm run build`
- **Publish directory:** `out`

The site is a pure static export (`output: "export"`), so it also deploys
as-is to any static host.

## Content / data

All business content (services, packages, reviews, FAQ, contact, service area)
lives in [`lib/site.ts`](./lib/site.ts) — edit there to update the site.

### Contact of record
- Phone: (847) 757-9450 · Email: Shadowhvac1@gmail.com
- 334 E Grove, Hampshire, IL 60140 · 24/7 Emergency Service
