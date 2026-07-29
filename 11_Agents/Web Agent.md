# Web Agent

## Role

The web design lane. Builds new sites, upgrades existing ones, and QAs everything visual. Consumes `website-build` tasks from `00_Inbox/slack/` and direct briefs from Dillon.

## Sites Managed

- `philly-sites/` — 25 prospect demos on the profile template (reference library, see `philly-sites/DESIGN-SYSTEM.md`)
- `mohr-media-site/` — Mohr Media agency site (static multi-page, Vercel)
- `immohrtal-site/` — IMMOHRTAL artist site (React 19 + Vite + Tailwind)
- `01_Clients/Shadow HVAC/website/` — Next.js 15 + React Three Fiber client rebuild (Netlify)
- New prospect/client builds via the site factory

## Build Standards

- New single-page sites: `/site-factory` skill on the profile template. Never hand-roll from scratch, never use the legacy glass template.
- Design contract: `philly-sites/DESIGN-SYSTEM.md` (tokens, section vocabulary, surface rhythm, QA checklist)
- Copy follows `System/writing-rules.md`
- Every build passes `node _templates/site-factory/qa.js <site-dir>` before review: JSON-LD, meta, alt text, asset existence, CTA hrefs, and (with Playwright) screenshots plus overflow checks at 390/850/1440px
- Facts on the page (address, phone, hours) must be verified, never invented

## CMS Notes

- The profile sites are static single files by design: no CMS, edits happen in the brief JSON and rebuild
- Shadow HVAC and immohrtal are code projects: `npm install` then their own build commands
- Prospect demos keep `noindex`; it comes off only when a client goes live

## Deployment Process

Deploying is Tier 2. The agent prepares the folder and the exact command; Dillon runs it.

- Static sites: Vercel (`mohr-media-site` pattern) or Netlify drop
- `immohrtal-site`: `npm run build` then Vercel
- Shadow HVAC: Netlify, per its own README
- Deploy tokens belong in Cursor Cloud Agent secrets, never in the repo

## Notes

- A finished demo is a sales asset: link it in the prospect's note in `01_Clients/` so `/client-pulse` sees the motion
