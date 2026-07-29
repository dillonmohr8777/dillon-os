---
employer: Align HCM
tags: [align-hcm, video, motion-graphics, linkedin]
---

# Align in Motion (landscape motion reels)

Rebuilt, higher-energy versions of the two 16:9 "Align in Motion" reels. Both
are code-driven, so copy and timing are edits to a text file rather than a
re-record.

| File | Reel | Output | Length |
| --- | --- | --- | --- |
| `align-in-motion.html` | Who We Are | `out/align-in-motion.mp4` | ~59s |
| `align-public-sector.html` | Public Sector / Shift | `out/align-public-sector.mp4` | ~53s |

Both render at **1920x1080, 30fps**. The originals were a 960x540 screen
recording and a 1080p recording, so the Who We Are reel is a 4x pixel upgrade.

## What changed from the originals

**The logo is now an atom system.** The mark is sampled into ~3,600 particles
that swarm in from off-frame, lock into the full logo, hold with orbiting
electrons and a specular sheen, then blow apart and scatter into the slide
underneath. It runs at the open, once mid-reel, and in reverse on the end card
(atoms gather back into the mark and stay).

**Atoms carry through everything else.** A low-contrast lattice of drifting
nodes and bonds sits under every slide, so the particle logo reads as part of
the system instead of a one-off effect.

**The old sign-off is gone.** "Built for the people who keep it running." is
retired. Replacements:

* Who We Are ends on **"Make the platform earn it."**
* Public Sector ends on **"When the shift can't fail."**

**Copy is sharper.** Hooks were rewritten to open on tension rather than
statement ("You bought the platform." / "Go-live is the starting line."), and
each reel gained a payoff beat before the end card ("Kill complexity." and
"Nobody notices when it works."). Public-sector language got more specific:
overtime rules are now settled "before the tones drop."

**New motion.** Word-by-word headline reveals with blur and rise, an accent
underline that draws itself in, pills that snap in like atoms, a real count-up
on the reviews number, ken-burns on the photo panels, and a progress bar with
a glowing head.

## Editing

Copy and timing live in the `scenes` array at the bottom of each HTML file.
Nothing else needs touching.

```js
{ kind: 'text', dur: 4.6,
  eyebrow: 'THE REAL WORK',
  ghost: 'NOW WHAT',                       // huge faint word behind the type
  headline: 'Go-live is the {starting line}.',
  underline: true,                          // draw the accent underline
  sub: 'Selection takes a quarter...' },
```

* `{braces}` mark the one accent phrase that turns orange.
* ` // ` forces a line break, so headlines break where you want them to.
* `dur` is seconds. Total length is just the sum of every `dur`.
* `chapter: true` includes the scene in the `01 / 05` counter.

Scene kinds: `text`, `statement` (big centred line), `chips`, `cards`, `list`,
`grid`, `lockup`, `bignum`, `logo` (atom interstitial), `endcard`.

Brand rules enforced in the copy: no em dashes anywhere, contractions on, one
accent phrase per headline.

## Preview

Open either HTML file directly in Chrome. It loops in real time. No server
needed: the logo bitmap is inlined as a data URI in `assets/mark-data.js`
specifically so the particle sampler can read its pixels over `file://`.

## Re-rendering

```bash
npm install playwright          # or symlink a global install into node_modules
node render.mjs align-in-motion.html out/align-in-motion.mp4 --fps 30
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

`assets/` holds the brand art recovered from the original reels: the Align mark
keyed to transparency, the SmartCare lockup, the four platform cards (UKG,
Dayforce, Workday, ADP), and the three public-sector illustration panels
(utilities, fire and EMS, K-12). Regenerate `mark-data.js` after replacing
`align-mark.png`; the command is in the header of that file.
