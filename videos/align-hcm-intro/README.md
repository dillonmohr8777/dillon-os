# Align HCM · Brand Intro (45s)

A 45 second animated brand introduction for Align HCM. Deep navy stage, orange
accent, high contrast serif headlines, per letter kinetic reveals, and the logo
lockup assembling out of a light burst. The look is taken from the supplied
Align stills; the motion language is taken from the supplied reference video.

Output is 1920x1080, 30fps, H.264 + AAC.

| File | What it is |
| --- | --- |
| `align-hcm-intro.mp4` | The finished cut with the underscore |
| `align-hcm-intro-silent.mp4` | Same picture, no audio |
| `index.html` | Self contained, playable, scrubbable source. Open it in a browser. |
| `src/` | The editable source: styles, scene graph, page shell |
| `build.py` | Assembles `src/` into `index.html` |
| `render.mjs` | Frame exporter, Playwright to ffmpeg |
| `audio.py` | Synthesises the underscore |

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

## Scene map

| # | In | Out | Beat |
| --- | --- | --- | --- |
| 1 | 0.0 | 3.2 | "You picked the platform." Ghost word `HCM`. |
| 2 | 3.2 | 6.3 | "Now the **hard part** starts." Ghost `NOW WHAT`. |
| 3 | 6.3 | 10.0 | "Every rollout hits the same five walls." Friction chips stagger in. |
| 4 | 10.0 | 12.6 | Light burst, logo assembles. |
| 5 | 12.6 | 15.6 | "We are the team that **finishes it**." Ghost `SPECIALISTS`. |
| 6 | 15.6 | 19.6 | Platform grid: UKG, Dayforce, Workday, ADP, Paylocity, HiBob. |
| 7 | 19.6 | 23.6 | Service ticker, ten services snapping through focus. |
| 8 | 23.6 | 26.6 | `{ SmartCare }`. "Most callbacks inside the hour." |
| 9 | 26.6 | 30.0 | Counter rolls to `100+` five star reviews. |
| 10 | 30.0 | 33.4 | St. Petersburg / Toronto. Nine to nine, seven days. |
| 11 | 33.4 | 37.0 | "From system problems to **measurable outcomes**." Ghost `OUTCOMES`. |
| 12 | 37.0 | 40.2 | "Kill complexity." with a light sweep. |
| 13 | 40.2 | 45.0 | End card: lockup, tagline, alignhcm.com. |

Every claim on screen traces to alignhcm.com. No invented numbers.

House rule for this piece: **no dashes in any on screen copy.**

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
python3 audio.py                 # only if you changed the underscore
node render.mjs --jobs 3         # about 10 minutes for the full 45s
```

Useful flags:

```bash
node render.mjs --silent                          # picture only
node render.mjs --from 10 --to 13 --out build/probe.mp4 --silent   # one scene
node render.mjs --jobs 1                          # single browser, easier to debug
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
- The underscore is deliberately quiet, about 15 dBFS RMS. It sits under a voice
  over without ducking if one is ever added.
