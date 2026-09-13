---
employer: Align HCM
tags: [align-hcm, video, motion-graphics, linkedin]
---

# Align HCM landscape motion reels

Rebuilt, higher-energy versions of the two 16:9 brand reels. Both are
code-driven, so copy and timing are edits to a text file rather than a
re-record.

The on-screen "ALIGN IN MOTION" rail tag is gone from both, at Ben's request. It
came out of a prompt asking for motion effects rather than from anything in the
brand, and it is not a line Align uses. Nothing going forward should carry it.

| File | Reel | Output | Length |
| --- | --- | --- | --- |
| `align-in-motion.html` | Who We Are | `out/2026-08-03 - The Team That Finishes It (Reel Cut).mp4` | 56.2s |
| `align-public-sector.html` | Public Sector / Shift | `out/2026-08-14 - Public Service Cannot Pause.mp4` | 49.2s |

Both render at **1920x1080, 30fps**. The originals were a 960x540 screen
recording and a 1080p recording, so the Who We Are reel is a 4x pixel upgrade.

## What changed from the originals

**The logo is now an atom system.** The mark is sampled into ~3,600 particles
that swarm in from off-frame, lock into the full logo, hold with orbiting
electrons and a specular sheen, then blow apart and scatter into the slide
underneath. It runs at the open and, in reverse, on the end card (atoms gather
back into the mark and stay). There is deliberately no mid-reel logo beat: the
mark appears at the top and the bottom, nowhere in between.

**Atoms carry through everything else.** A low-contrast field of drifting dots
sits under every slide, so the particle logo reads as part of the system instead
of a one-off effect.

**The end card carries no tagline.** "Built for the people who keep it
running." is retired and nothing replaced it. The close is the mark, HUMAN
CAPITAL MANAGEMENT, and the URL. Ben flagged that line separately, as sounding
like a product rather than a firm; it was already out by then, so any render
still showing it predates this cut.

**The SmartCare slide leads with the mark.** Its headline, "The part nobody
sells you.", is cut on Ben's note. The slide keeps the lockup and the line that
does the actual work: ongoing HCM support after go-live, real experts, no queue,
no chatbot.

**Copy is sharper.** Hooks were rewritten to open on tension rather than
statement ("You bought the platform." / "Go-live is the starting line."), and
the public-sector reel gained a payoff beat before the end card ("Nobody
notices when it works."). The Who We Are reel had one too, "Kill complexity.",
and it was cut on Ben's note that it was not needed; that reel now runs from the
outcomes beat straight into the end card. Public-sector language got more specific:
overtime rules are now settled "before the tones drop."

**The service wheel is intact and reinforced.** The vertical scroll through all
ten services carries over from the reference cut, with the same icon, number and
name layout. It now runs as a picker wheel: the focused service sits solid white
in a pool of warm light while its neighbours fall away in scale, opacity, blur
and X-rotation, and the wheel dwells on each item instead of gliding past.

**No lines anywhere.** No connecting lines in the atom field, no accent
underline, no divider on the end card. Dots only.

**Type is sized for in-feed viewing on a phone.** Body copy is the thing people
actually have to read, so it carries real weight: 62px for a standard sub, 58px
beside a photo panel, 66px under a big statement, 50px for list descriptions.
Headlines sit above it at 112px (92px beside a photo, 86px on the list slide),
statements at 158px, service names at 92px. Labels scale with the copy rather
than staying fine print: eyebrows 26px, the slide counter 28px, the rail 20px.

At these sizes a long line can quietly slide under the bottom rail, so
`checkfit.mjs` measures every scene and fails if anything leaves the safe area.
Run it after any copy or size change:

```bash
node checkfit.mjs align-in-motion.html
node checkfit.mjs align-public-sector.html
```

It measures text *ink* via a Range rather than element boxes, because a centred
full-width paragraph has a 1920px box but short lines.

**New motion.** Word-by-word headline reveals with blur and rise, pills that
snap in like atoms, a real count-up on the reviews number, ken-burns on the
photo panels, and a progress bar with a glowing head.

## Editing

Copy and timing live in the `scenes` array at the bottom of each HTML file.
Nothing else needs touching.

```js
{ kind: 'text', dur: 4.6,
  eyebrow: 'THE REAL WORK',
  ghost: 'NOW WHAT',                       // huge faint word behind the type
  headline: 'Go-live is the {starting line}.',
  sub: 'Selection takes a quarter...' },
```

* `{braces}` mark the one accent phrase that turns orange.
* ` // ` forces a line break, so headlines break where you want them to. Use it
  to kill widows: a headline that would drop one word to its own line reads
  better broken earlier.
* `dur` is seconds. Total length is just the sum of every `dur`.
* `chapter: true` includes the scene in the `01 / 05` counter.

Scene kinds: `text`, `statement` (big centred line), `chips`, `cards`, `list`,
`reel` (the vertical service wheel), `lockup`, `bignum`, `logo` (atom beat),
`endcard`.

Reel items take an `icon` key naming one of the ten line icons defined in
`ICONS` at the top of `engine.js`: `assess`, `layers`, `cap`, `nodes`, `db`,
`headset`, `trend`, `pie`, `people`, `merge`.

Brand rules enforced in the copy: no em dashes anywhere, contractions on, one
accent phrase per headline.

Headlines use Playfair Display, matched against the reference cut letterform by
letterform at equal cap height. Do not swap it.

## Preview

Open either HTML file directly in Chrome. It loops in real time. No server
needed: the logo bitmap is inlined as a data URI in `assets/mark-data.js`
specifically so the particle sampler can read its pixels over `file://`.

## Re-rendering

```bash
npm install playwright          # or symlink a global install into node_modules
node render.mjs align-in-motion.html "out/2026-08-03 - The Team That Finishes It (Reel Cut).mp4" --fps 30
```

QC a few frames without rendering the whole thing:

```bash
node render.mjs align-in-motion.html --stills 2.4,16.0,51.0
```

`render.mjs` drives `window.__seek(t)` and screenshots each frame instead of
letting the page animate itself, so output is reproducible frame for frame.
Requires `ffmpeg` on PATH.

Fonts (Inter, Playfair Display) are vendored in `fonts/` and loaded by
`@font-face`, so renders match on any machine.

## Assets

`assets/` holds the brand art. The Align mark, the UKG and Dayforce cards and the
three public-sector illustration panels (utilities, fire and EMS, K-12) were
recovered from the original recordings and keyed to transparency. Regenerate
`mark-data.js` after replacing `align-mark.png`; the command is in the header of
that file.

The strip is UKG, Dayforce, HiBob and Paylocity. Ben asked for that swap along
with "one partner, **many** platforms, not every platform", which is now the
eyebrow. Workday and ADP are no longer shown; `card-workday.png` and
`card-adp.png` stay in `assets/` in case the row is ever reshuffled.

`make-cards.py` builds the HiBob and Paylocity cards. Because the recovered cards
bake the whole card into one bitmap, field and gradient and rounded corners and
all, a hand-drawn fifth card would never have sat in the same row. So the script
lifts the field off `card-ukg.png` instead: every row of a card is one flat
colour and the margins either side of the logo are untouched by it, so the median
of those margins per row reconstructs the field exactly, alpha and corner radius
included. Logos come from `../align-hcm-intro/assets/logos/`, which `logos.py`
fetches off alignhcm.com and cuts properly. Run that first if they are missing.

Marks are fitted to a common height, with one exception: Paylocity is a stacked
lockup, an icon over a small wordmark, so at UKG's height its type comes out half
the size and the card reads empty. `FIT` gives it a 1.3x box.

`smartcare.png` is built from the supplied master artwork rather than recovered
from video. That master is charcoal and orange on white, which would vanish on
this deck's navy field, so it is keyed to transparency and knocked out: orange
holds its exact brand value (#F08B2F) and the charcoal becomes near-white. That
matches how the earlier cut of this reel treated the lockup. If you ever need it
on a light background, use the master directly instead of this file.
