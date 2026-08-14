---
tags: [project]
status: active
updated: 2026-08-14
source: "[[12_Brain/decisions/2026-08-14 - HUD mobile is hosted readonly]]"
---

# Dillon OS Mobile HUD

**Summary:** Installable phone view of D.I.L.L.O.N. OS. Read-only snapshot, home-screen app, always on.

URL: https://dillon-os-hud.netlify.app

## Goal

Open the HUD from a phone anytime without the laptop, without exposing the Command Deck.

## Next actions

- [ ] Add to Home Screen on Dillon's phone (Share → Add to Home Screen)
- [ ] Confirm the GitHub Action published after this lands on the branch
- [ ] Keep NETLIFY_AUTH_TOKEN on the repo so the snapshot stays current

## Links

- Decision: [[12_Brain/decisions/2026-08-14 - HUD mobile is hosted readonly]]
- Protocol: [[12_Brain/protocols/HUD Protocol]]
- Engine: `_os/bin/export-hud.js` · `_os/bin/hud-deploy.js`
