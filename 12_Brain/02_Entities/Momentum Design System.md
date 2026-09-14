---
tags: [entity, system, design, brand]
updated: 2026-09-05
note_type: entity
status: active
created: 2026-09-05
observed_at: 2026-09-05
verification_status: verified
source_refs:
  - "C:/Users/dillo/Documents/Codex/momentum-design-system/AUDIT.md"
  - "C:/Users/dillo/Documents/Codex/momentum-design-system/tokens.json"
  - "C:/Users/dillo/.claude/CLAUDE.md"
---


# Momentum Design System

**Summary:** the token source of truth for anything carrying the Momentum name.
Lives outside the vault at `C:\Users\dillo\Documents\Codex\momentum-design-system`
and is routed from global `CLAUDE.md`, so every Claude session in every repo
resolves it without being told.

## Public facts

- v1.0.0, dated 2026-09-05. Owner: Momentum Digital / Momentum 360, Philadelphia.
- Four files: `tokens.json` (source), `tokens.css` (consumable layer),
  `index.html` (renderer), `AUDIT.md` (the measured drift report).
- **Every colour is a literal, measured value. Runtime derivation is banned**
  in this layer — `color-mix()` on `--muted` / `--panel` hid nine undetected
  WCAG AA failures across the ten shipped radar sites.
- Contrast: WCAG 2.1 AA, 29 pairs measured, 0 failures, lowest text pair 4.695:1.
- Foreground tokens are named for the surface they are legal on — `--m-signal`
  is legal on deep, `--m-signal-ink` on paper and panel. No single orange clears both.

## Rules

- Reference the tokens by path. **Do not vendor a copy into a repo** — copied
  palettes are precisely the drift `AUDIT.md` measured.
- Read `AUDIT.md` before changing a token or reconciling a site's palette.
- **It is now a Git repository as of 2026-09-09** (baseline commit `75b386a`, 5 files tracked). Before that it was unversioned, which made every edit a one-way door. Pushed to a remote as of 2026-09-14: `origin` is `https://github.com/dillonmohr8777/momentum-design-system.git` and `refs/heads/main` on the remote is `75b386a`, identical to local HEAD. Working tree clean. Verified with `git ls-remote origin` 2026-09-14.

## Links

- [[12_Brain/02_Entities/Momentum 360|Momentum 360]]
- [[12_Brain/02_Entities/Website Factory|Website Factory]]
