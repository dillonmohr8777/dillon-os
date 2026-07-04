# Momentum 360 Agents — Landing Page

Redesign of https://momentum-360-agents.netlify.app in the exact design system of
https://momentum-360-landing.netlify.app (same CSS, navy/gold palette, Montserrat + Inter,
section patterns, reveal animations, stat counters).

All copy is about **Momentum 360 Agents**: 19 specialist AI marketing agents in 4 squads
(Capture & Showcase, Get Found, Win Customers, Content & Run It), trained on Momentum 360
playbooks and powered by GPT-5.5.

## Contents

- `index.html` — the entire site, self-contained (CSS inline, logo embedded as base64)
- `momentum-360-logo.png` — the exact Momentum 360 logo mark (also used as favicon)
- `assets/badges/` — partner/recognition badges (Google Partner, Inc. 5000, Philly 100, RankWatch, Best of PA)

## Deploy

Static site — no build step. On Netlify: drag-and-drop this folder, or point a site at this
directory (publish directory: `momentum-360-agents-site`).

## Wiring the forms

Both forms (hero "Ask Your First Question" and bottom "Ask The Agents Anything") currently
show a success state and log the payload to the console. Search `index.html` for `TODO: POST`
to connect them to HubSpot / your CRM endpoint.
