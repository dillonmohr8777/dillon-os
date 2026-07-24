# Align in Motion — landscape deck

Editable, self-contained builds of two AlignHCM 60-second motion videos:

| # | File | Video |
|---|------|-------|
| 04 | `04-public-service-cannot-pause.html` | Public Sector sizzle |
| 05 | `05-gtaa-case-study.html` | GTAA case study |

1920×1080, seven scenes, 60 seconds each. Open either file in Chrome and it
plays. Keys: **space** play/pause, **← →** seek, **H** hide the UI, **R** restart.

---

## v2 — smoother motion, more vibrant grade

### Why it's smooth now

**One GSAP master timeline drives everything.** The previous build toggled CSS
classes per scene and let each element run its own `transition`. That works, but
the browser has to reconcile dozens of independent transitions, and nothing is
seekable. Now the entire video is a single timeline:

- Only **GPU-composited properties** are animated: `transform`, `opacity`,
  `clip-path`. No `width`/`height`/`top`/`left`, so there is no layout work on
  any frame.
- `gsap.ticker.lagSmoothing(0)` stops the timeline from fast-forwarding to
  "catch up" after a slow frame, which is what produces visible hitching.
- All writes are batched into GSAP's single ticker instead of many separate
  transition callbacks, and GSAP manages `will-change` per tween.
- The playback scrubber animates with `scaleX` and the clock only writes when
  the displayed second actually changes. The old build wrote to the DOM on
  every single frame.

Cost was measured and cut, not guessed:

| change | effect on render throughput |
|---|---|
| dropped `filter: blur(90px)` on the glow layers (a radial gradient is already soft) | 1.0 → 3.1 fps |
| removed every `mix-blend-mode` (the single most expensive thing to rasterize) | 3.1 → 4.4 fps |
| baked the image color grade into the JPGs instead of a per-frame CSS `filter` | → 5.4 fps |
| final | **~6.5 fps, about 6.5× the original** |

### Why the exported MP4 has no judder

`render-frames.js` does **not** screen-record. Real-time capture drops frames
whenever the recorder and the browser disagree about timing, and resampling the
result (25fps → 30fps) adds judder on top. Instead it walks the timeline in
exact `1/FPS` steps, screenshots each step, and hands ffmpeg a numbered image
sequence:

```bash
node render-frames.js 04-public-service-cannot-pause.html out.mp4 60
```

Because the composition is a pure function of time (`window.AIM.renderAt(t)`),
every output frame is rendered from a known state. Rendering can take as long as
it likes and the result is still perfectly smooth. Verified deterministic: the
same timestamp screenshots byte-identical twice.

Needs `playwright-core`, `ffmpeg`, and Chromium. Override paths with
`CHROME_PATH` / `FFMPEG_PATH`. The shipped `*-REVISED.mp4` files are 60fps.

### What makes it pop

- Hotter brand orange (`#ff8a2b`) with a real glow on accent words, numbers, and
  rules, against a deeper navy floor so the accents actually read as light.
- Four drifting aurora layers, a periodic light sweep, and slow ember drift —
  all `transform`/`opacity` only, so they cost close to nothing per frame.
- Headlines reveal **word by word** on a `power4.out` curve; body copy, quotes,
  and attributions rise out of overflow masks (curtain reveal).
- Image panels enter on a `clip-path` wipe, then hold a slow parallax push.
- The GTAA stat counts up from 0 to 12; cards rise, draw their rule, and catch a
  light sweep.
- Scenes cross-dissolve with a slight scale drift, so there are no hard cuts.
- Grade is baked into the panel JPGs (saturation, contrast, brightness), which
  is both punchier and cheaper than filtering every frame.

Motion patterns and the performance rules come from the `epic-design` skill in
`claude-skills-repo` (`references/motion-system.md`, `references/performance.md`,
`references/text-animations.md`); brand tokens from `alignhcm-brand`.

---

## Editing

- **Copy:** edit the text in each `.html`. The orange accent word is `<em>…</em>`.
- **Scene length / order:** change `data-dur="8"` (seconds) on any
  `<section class="scene">`, or reorder the sections. The timeline rebuilds
  itself, so durations just need to sum to your target length.
- **Type, color, spacing:** `align-motion.css` (`--orange`, `--body`, `.body`,
  `.headline`, `.h-xl/.h-lg/.h-md`).
- **Choreography:** `sceneIn()` in `align-motion.js` — one function defines the
  entrance for every scene type.
- **Images:** swap the files in `assets/` at the same names.

## Files

```
align-motion.css     design system + grade
align-motion.js      GSAP master timeline, playback, export API (window.AIM)
render-frames.js     deterministic frame-accurate MP4 renderer
fonts.css            Playfair Display + Inter, embedded (works offline)
vendor/gsap.min.js   GSAP 3.12.5, vendored so nothing loads from a CDN
assets/              logo + the four illustration panels
```

Fonts and GSAP are local, so the deck renders identically with no network
connection.
