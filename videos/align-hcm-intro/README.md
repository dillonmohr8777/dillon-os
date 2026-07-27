# Align HCM · Brand Intro (52.6s)

A 53 second animated brand introduction for Align HCM. Deep navy stage, orange
accent, high contrast serif headlines, per letter kinetic reveals, and the logo
lockup assembling out of a light burst. The look is taken from the supplied
Align stills; the motion language is taken from the supplied reference video.

Output is 1920x1080, 30fps, H.264. **Ships silent.**

| File | What it is |
| --- | --- |
| `align-hcm-intro.mp4` | The finished cut, no audio |
| `index.html` | Self contained, playable, scrubbable source. Open it in a browser. |
| `src/` | The editable source: styles, scene graph, page shell |
| `assets/logos/` | Cut out platform logos, the SmartCare mark, the Align mark |
| `assets/icons/` | The ten service icons as standalone SVGs |
| `build.py` | Assembles `src/` into `index.html` |
| `logos.py` | Fetches and background cuts the logos |
| `icons.py` | Draws the icon set |
| `render.mjs` | Frame exporter, Playwright to ffmpeg |
| `audio.py` | Synthesises an optional underscore (off by default) |

## Brand tokens

Sampled directly from the reference stills, not guessed.

```
navy deep    #0a1120      orange        #f0994c
navy base    #0b1326      orange deep   #f05a28
navy mid     #101a33      ember         #4a2a18
blue glow    #24407a      body text     #c9d4e8
blue soft    #1b325e      dim text      #8f9fbe
```

Display serif is **Playfair Display** (700, 900, 700 italic). Everything else is
**Inter** (400 to 800). Both are OFL and embedded in `index.html` as base64
woff2, latin subset only, so the page runs with no network.

The `Align` wordmark is a vector trace of the real logo taken off the supplied
end card still (`build/wm.py`). The mark beside it (two leaning bars, three
dots) is hand measured from the same still and drawn as SVG so the bars can wipe
and the dots can pop on cue.

Note the mark is deliberately **not** the favicon geometry from
`/hubfs/Site Images/Align Favicon.svg`. That file is the standalone icon, whose
bars lean about 44 degrees; the bars in the wordmark lockup are much more
upright. Swapping one for the other is visibly wrong next to the word "Align".
The favicon still ships verbatim as `assets/logos/align-mark.svg`, and it is the
authority on the brand orange: **`#fc9121`**.

## Logos

`logos.py` pulls the real assets off alignhcm.com, cuts their backgrounds, and
writes three variants of each into `assets/logos/`:

| Suffix | Use |
| --- | --- |
| `<name>.png` | Full colour, transparent. For light backgrounds. |
| `<name>-white.png` | Flat white knockout, for dark grounds where colour is not wanted. |
| `<name>-reverse.png` | Neutrals lifted to white, brand chroma kept. What the video uses for SmartCare. |

The video shows the platform marks in **their own brand colours**, which needs a
light ground: UKG and Workday are near black teal and simply vanish on navy. So
they sit in cream cards (`#f3efe7`, the `--cream` token off alignhcm.com) that
read as a partner strip and give each mark its correct clear space. SmartCare
keeps the reverse treatment instead, because it is the hero of its own slide
rather than a card, and its orange half is already correct on navy.

Background removal is a **border flood fill** over near white pixels, never a
global threshold. That distinction matters: HiBob's "Hi" is white ink sitting
inside a red speech bubble, and a global key punches it straight out. Edge
pixels are then un-matted from white, so nothing carries a pale fringe onto
navy. `emit()` asserts that at least 5 percent of every output frame is
transparent and exits if a cut silently failed.

The SmartCare artwork ships with a white outer glow baked in for light pages.
`strip_white_glow()` keys that off on neutrality, so the halo goes while the
pale yellow at the head of the "Stabilize · Optimize · Thrive" gradient stays.

Paylocity and HiBob are parked; two commented lines in `logos.py` bring them
back. Platform logos are scaled to equal **optical area**, not equal width or
height, with a per mark weight for ink density. Sizing four logos of wildly
different proportion to a common width makes some shout and others whisper.
Tune the overall size with `LOGO_AREA` in `src/scenes.js`; the card's padding
sets the clear space and `max-width`/`max-height` on the image is the hard
guarantee that nothing can overrun its box whatever the area is set to.

## Icons

`icons.py` draws ten service icons: one monoline family on a 24 unit grid, 1.7
stroke, round caps and joins, stroked in `currentColor` so one file works orange
on navy, white on navy, or ink on cream. They appear in the service ticker and
ship standalone in `assets/icons/` for decks, the site, and one pagers.

## Scene map

| # | In | Out | Len | Beat |
| --- | --- | --- | --- | --- |
| 1 | 0.0 | 4.2 | 4.2 | "You picked the platform." Ghost word `HCM`. |
| 2 | 4.2 | 8.3 | 4.1 | "Now the **hard part** starts." Ghost `NOW WHAT`. |
| 3 | 8.3 | 13.0 | 4.7 | "Every rollout hits the same five walls." Friction pills stagger in. |
| 4 | 13.0 | 16.6 | 3.6 | Light burst, logo assembles. |
| 5 | 16.6 | 20.6 | 4.0 | "We are the team that **finishes it**." Ghost `SPECIALISTS`. |
| 6 | 20.6 | 25.6 | 5.0 | Platform logos: UKG, Dayforce, Workday, ADP. |
| 7 | 25.6 | 29.6 | 4.0 | Service ticker, ten services and icons snapping through focus. |
| 8 | 29.6 | 33.6 | 4.0 | The SmartCare mark. "Most callbacks inside the hour." |
| 9 | 33.6 | 38.0 | 4.4 | Counter rolls to `100+` five star reviews. |
| 10 | 38.0 | 42.6 | 4.6 | "From system problems to **measurable outcomes**." Ghost `OUTCOMES`. |
| 11 | 42.6 | 46.8 | 4.2 | "Kill complexity." with a light sweep. |
| 12 | 46.8 | 52.6 | 5.8 | End card: lockup, tagline, alignhcm.com. |

### Retiming

Every scene carries **one extra second of hold** over the first cut, so each
line has room to land. Scene 7 is the exception and stays at exactly 4.0s: the
ticker scroll is derived from its own duration, so lengthening the scene would
slow the list down, and the list already reads at the right pace.

Content animations are keyed to absolute times local to their scene, not to
fractions of the duration, so changing an `out` value only extends the hold at
the end. Two things do read `dur` and will change if you retime: the ghost
watermark drift, and the ticker scroll in scene 7.

Every claim on screen traces to alignhcm.com. No invented numbers.

House rule for this piece: **no dashes in any on screen copy**, with exactly
one deliberate exception, `Go-live`, which is the industry term and how Align
writes it. `build/copycheck.mjs` allowlists that single string and still fails
on anything else, so the rule keeps catching accidents.

## How it works

`src/scenes.js` is a deterministic scene graph. Every visual property is a pure
function of the playhead `t` in seconds, written through `window.__seek(t)`.
There are no CSS keyframes, no `requestAnimationFrame` driven state, and nothing
reads the clock. That is what lets the exporter seek to an exact frame and get a
byte identical result every time.

Helpers worth knowing, all in `src/scenes.js`:

- `seg(x, a, b)` normalised progress of `x` across `[a, b]`
- `pulse(x, a, b, c, d)` rises over `[a,b]`, falls over `[c,d]`
- `typeset(text)` splits copy into per character spans. `*stars*` mark an accent
  word, `|` forces a line break, words are kept unbreakable.
- `revealChars(el, lt, start, opts)` the blur to sharp letter cascade
- `drawLockup(root, id, p)` assembles the logo from `p` 0 to 1

Each scene is an object with `in`, `out`, an `html` string, and a `draw(root, lt,
dur)` called with time local to that scene. Add a scene by pushing another entry
into `SCENES` and shifting the times after it.

## Editing and re-rendering

```bash
# 1. edit src/style.css or src/scenes.js
python3 build.py                 # regenerate index.html

# 2. preview: open index.html in a browser and use the scrubber

# 3. render
node render.mjs --jobs 3         # about 10 minutes for the full 52.6s
```

Regenerate assets only when they change:

```bash
python3 logos.py                 # refetch and re cut the logos
python3 logos.py --refetch       # ignore the cache
python3 icons.py                 # redraw the icon set
python3 build.py                 # then always rebuild index.html
```

Useful render flags:

```bash
node render.mjs --music                            # mux the underscore in
node render.mjs --from 10 --to 13 --out build/probe.mp4   # one scene
node render.mjs --jobs 1                           # single browser, easier to debug
```

The exporter cuts the timeline into contiguous segments, renders them in
parallel browsers, and concatenates. Chromium's PNG encoder is the bottleneck at
roughly one second per frame per browser, so `--jobs` is the main speed dial.
`FFMPEG` and `CHROME` env vars override the binary paths.

### Regenerating the embedded assets

Rarely needed, and both are deterministic (rerunning them reproduces the
committed files byte for byte). Run them from inside `build/`:

```bash
cd build
python3 fonts.py     # refetch Google Fonts, re-inline as base64 -> fonts.css
python3 wm.py        # retrace the Align wordmark off the still -> wordmark.path
```

`build.py` reads both. `build/shot.mjs` grabs stills at given timestamps and
`build/copycheck.mjs` dumps every on screen string and fails loudly on a dash.

## Dependencies

- `playwright` (installed globally) and Chromium
- A full ffmpeg with `libx264` and `aac`. The Playwright bundled ffmpeg will not
  work: it only ships png and vp8. `pip install imageio-ffmpeg` gives a usable
  build, which is the default path in `render.mjs`.
- `pip install numpy pillow potracer` for the audio and the asset scripts

## Notes

- 16:9 only. A 9:16 vertical cut for LinkedIn and Reels is a small change: adjust
  the stage dimensions in `src/style.css` and the per scene layout.
- The cut ships silent by design. `python3 audio.py && node render.mjs --music`
  produces `align-hcm-intro-music.mp4` with a quiet synthesised underscore at
  about 15 dBFS RMS, low enough to sit under a voice over without ducking.
- Platform logos are the property of their respective owners and are used here
  to state a support relationship. The white knockout is the reverse treatment
  every one of these vendors publishes in their own brand kit.
