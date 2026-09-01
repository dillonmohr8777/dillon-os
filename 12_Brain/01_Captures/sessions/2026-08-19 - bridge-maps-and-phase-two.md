---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
source_refs: []
tags: [capture]
---

# 2026-08-19 — Bridge Maps and Phase 2 (mined)

- Decision: the unified review URL stays the original Connected Industry Prototype Suite. Draft prototype PR #6 is not that visual.
- Decision: Slack, email to Tori/Melissa/Mac/Miraj, live API bind, and merge stay held even though Tori said she would review and pay on 2026-08-19.
- Fact: Tori 2026-08-18 promised Phase 2 payment "tomorrow." Re-read 2026-08-19 21:17Z: still no Gmail or Slack receipt. Unverified / not paid in the vault.
- Fact: Melissa's 2026-08-17 send already pointed Tori at https://bridge-connected-signal.netlify.app and the five routes.
- Fact: July 23 39:17 transcript items are already in the original-suite HTML. No extra routes were shipped. Formal accept boxes still pending.
- Mistake: Netlify zip-archive of a `site/` folder plus `netlify.toml` publishes the zip root. `/` 404ed and the suite lived under `/site/`. Digest deploy files at root.
- Mistake: function zip hashed with SHA1 and uploaded after files 400s. Use SHA256, `?runtime=js`, functions before files.
- Mistake: zipping the handler as `index.js` 502s (`Cannot find module 'google-maps-loader'`). Zip `{function-name}.js`.
- Pattern: the pinned suite disables live Maps unless `data-live-map="enabled"`. Loader 302 is not enough if the mount flag is off.
- Fact: after enabling the flag, the Explore badge reads Live Google 3D discovery and Google paints its generic error overlay. Key referrer / Maps 3D / billing is an operator console check, not a vault secret.
