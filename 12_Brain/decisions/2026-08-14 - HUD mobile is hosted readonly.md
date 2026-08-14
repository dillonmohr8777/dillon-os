---
tags: [decision]
decided: 2026-08-14
status: active
supersedes:
source: "[[12_Brain/protocols/HUD Protocol]]"
updated: 2026-08-14
---

# 2026-08-14 — HUD mobile is a hosted read-only snapshot

**Decision:** Dillon OS on a phone is a published PWA snapshot
(https://dillon-os-hud.netlify.app), not the loopback Command Deck.

**Why:** `node _os/server.js` binds `127.0.0.1` because `/api/run` can launch
skills. Opening that on the public internet would be a remote command
surface. A file in the vault is also not something you can open on a phone
at 7am. The snapshot is noindex, has no skill runner, and installs to the
home screen.

**Implications:**

- Add to Home Screen is the daily phone entry. Freshness follows git/Netlify, not the laptop being awake.
- Command Deck, SSE job logs, and `mail_ready` flips stay on desktop.
- `NETLIFY_AUTH_TOKEN` is required to publish. GitHub Action `hud-mobile.yml` rebuilds on vault/HUD changes.
