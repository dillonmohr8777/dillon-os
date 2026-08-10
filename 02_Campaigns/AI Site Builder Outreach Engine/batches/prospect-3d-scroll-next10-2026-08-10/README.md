# Prospect Radar — Next Ten Cinematic Scroll Builds

Builds 169–178. Ten composited scroll worlds on one spec-driven engine,
descended from the trio (builds 166–168) and the Kage motion grammar.

## Routes

- `/` — Scroll Lab index for the ten
- `/sites/germantown-dental-group/` … `/sites/kehans-auto-service/` (see `src/config.mjs → ORDER`)

## What each page is

A synthetic cinematic plate (from the `agent/momentum-next10-image-system`
handoff), business-specific 3D choreography enacting one verb, and two
editorial stills hanging in world space — all sharing one camera. Copy
describes the trade, never the client. Every page carries `noindex`, the mail
hold, a source-boundary panel, and a synthetic-imagery disclosure.

## The spec system

`src/config.mjs` holds one spec per business: verified facts (radar brief),
palette, world (ground, props + choreography DSL, lighting, particles, panels,
camera preset), and page copy. `src/scenes.js` is the engine; `scripts/build-pages.mjs`
renders the committed HTML. Design notes: `12_Brain/concepts/Composited Scroll
World System.md` · loop: `12_Brain/protocols/Daily 3D Build Loop.md`.

## Fonts

Alumni Sans (display) + Public Sans (text), self-hosted variable subsets
downloaded from Google Fonts per the handoff's type direction.

## Local build

```bash
npm install
npm run build        # textures → pages → vite
npm run qa           # static gates
npx vite preview --host 127.0.0.1 --port 4178 --strictPort
npm run qa:browser -- http://127.0.0.1:4178 round-1
```

## Image provenance

`public/assets/plates/<slug>/` are optimized webp derivatives of the 30 PNGs
on `agent/momentum-next10-image-system` (`handoffs/momentum-360/prospect-radar-next10-image-system-2026-08-10/`).
They are synthetic concept art direction and are disclosed as such on every
page. Replace with approved photography before any production launch.

## Release boundary

- No deployment is performed from this package; composing onto the live
  Prospect Radar host is a separate operator step.
- Business facts are limited to name, locale, and (where a radar brief
  supplied one) domain. Dutton Road Veterinary Clinic has no verified domain
  on file, so its links route to public listings only.
- All ten pages stay noindex with the mail hold.
