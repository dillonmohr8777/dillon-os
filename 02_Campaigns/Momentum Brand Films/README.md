---
note_type: campaign
status: active
updated: 2026-09-06
created: 2026-09-06
tags: [campaign, brand, video, momentum]
source_refs: ["[[12_Brain/01_Captures/2026-09-06 - momentum brand films brief]]"]
---

# Momentum Brand Films

**Summary:** six brand films for Momentum Digital, each rebuilt from a reference video
Dillon sent on 2026-09-06, rendered deterministically from code so the logo, palette and
type are exact and any film can be re-rendered after a copy change.

## Why code, not a video model

Dillon's ask was *"exact logos, everything."* A generative video model cannot hold
`#2A80C2`, the official script-`m` mark, and Archivo Black steady across 30 seconds. So
every film is a self-contained HTML page whose visual state is a pure function of time,
stepped frame by frame through headless Chromium and piped into ffmpeg. Re-rendering the
same frame twice is pixel-identical (verified). A copy change is a one-line edit and a
40-second re-render, not a new generation and a new set of artefacts.

Higgsfield / HyperFrames stay in reserve for shots that genuinely need generative imagery.
Nothing in this slate does, and no render credits have been spent.

## The mark

`brand/momentum-mark.svg` is the **official Momentum Digital mark**, vectorised with potrace
from the official asset already in this vault (`_os/automation/assets/needmomentum-mark.png`,
192px, the same file Google serves as the site favicon) and verified against it: rendered at
768px, the vector differs from the raster by a mean of **2.55/255 per pixel** — antialiasing
only. It paints with `currentColor` and scales to any size.

Its literal colour, sampled from the official asset, is **`#2A80C2`** (`--m-mark`).

**Open item — the wordmark.** needmomentum.com and momentum360.com are both behind a JS/CDN
challenge and would not serve their header artwork to this session, so the official
*wordmark* file was not obtainable. `MOMENTUM` is set in Archivo Black, the display face of
the Momentum design system, letter-spaced `-0.02em`. That treatment lives in exactly one
place — `Lockup()` in `brand/film-kit.js` — so dropping in the real artwork updates all six
films at once.

## Brand law

`brand/tokens.css` carries the token layer from the `momentum-brand-system` skill as
literals. `brand/contrast.json` records a **measured** ratio for all 22 text-on-background
pairs the slate uses, produced by `render/contrast.py` — the system's rule is measure, do
not assert. It confirms the system's own documented failures: signal as text on paper is
3.00, brand on deep is 2.63, white on signal is 3.18. All three are banned and none appear.

Useful measured values not previously recorded: the logo blue clears the 3.0 graphic
threshold on **both** surfaces — 3.99 on paper, 4.39 on deep.

## The slate

| # | Film | Format | Length | Rebuilt from |
|---|------|--------|--------|--------------|
| 1 | `01-momentum-news` — MOMENTUM SIGNAL, broadcast opener | 1080×1080 | 12s | Higgsfield GPT-6 Astra news intro |
| 2 | `02-take-off` — the agency film | 1920×1080 | 30s | Atomik Growth, "the launch video company" |
| 3 | `03-meet-the-bot` — the Momentum Bot | 1920×1080 | 34s | the `folk` mascot film |
| 4 | `04-ask-momentum` — vertical | 1080×1350 | 30s | Float launch film (HyperFrames recreation) |
| 5 | `05-field-guide` — the prestige piece | 1920×1080 | 26s | Fable 5.1 launch film (ChatCut recreation) |
| 6 | `06-one-prompt` — ads + SEO + AEO + GEO | 1920×1080 | 24s | Motion, "ChatGPT for Launch Videos" |

Each film's beat sheet, exact copy and craft notes are in `specs/`. The binding brief for
the whole slate — brand law, the render contract, the copy rules — is `specs/BRIEF.md`.

## The Momentum Bot

The slate's new character, from Dillon's note: *"it's, like, the momentum bot, but it looks
just like that, but it's branded, like, blue and white."* Derived from the mark rather than
placed next to it — the disc, the keyline ring and the script `m` are the character's DNA.
Chosen by a three-lens judge panel (brand fit / charm / craft) over four independent design
directions. Character sheet and rig API: `brand/BOT.md`.

## Layout

```
brand/     tokens.css · momentum-mark.svg · momentum-bot.svg · bot-rig.js · BOT.md
           film-kit.js (easing, timing, text, determinism, the shared Lockup)
           contrast.json · land-mask.txt · fonts/
films/     one directory per film, each a single self-contained film.html
           _smoke/ is the renderer's own test fixture — 2s, keep it, it is how you
           check the pipeline still works after touching render/
specs/     BRIEF.md plus one beat sheet per film
render/    capture.py (film → mp4/still) · shot.py (any html → png) ·
           sheet.py (mp4 → contact sheet) · contrast.py (measure every pair)
out/       rendered output — gitignored, regenerable; posters/ is kept
```

## Re-rendering

```bash
cd "02_Campaigns/Momentum Brand Films"
python3 render/capture.py films/01-momentum-news/film.html out/01-momentum-news.mp4
python3 render/sheet.py  out/01-momentum-news.mp4 out/01-sheet.png --duration 12
python3 render/capture.py films/01-momentum-news/film.html out/still.png --still 8.6
python3 render/contrast.py
```

Requires headless Chromium, Python `playwright`, and `ffmpeg`. In a remote Claude Code
session all three are present; on the Windows box, point `CHROME` in `render/capture.py`
at a local Chromium.

## Approval boundary

The films are **drafted, not published**. Posting, scheduling, or sending any of them to a
client is approval-gated, as is any spend on Higgsfield or HeyGen for a music or voiceover
pass. Both are queued in `System/approval-queue.md`.

## Links

- [[12_Brain/02_Entities/Momentum 360|Momentum 360]]
- [[02_Campaigns/Campaign Index|Campaign Index]]
- [[.claude/skills/scroll-hero|scroll-hero]] — the vault's existing HyperFrames loop skill
- [[.claude/skills/motion-design|motion-design]] · [[.claude/skills/ui-design|ui-design]]
