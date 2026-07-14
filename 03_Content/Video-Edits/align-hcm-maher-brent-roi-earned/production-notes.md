# Align HCM — Maher × Brent — "ROI Is Earned" (64s LinkedIn cut)

**Deliverable:** `Align HCM - Maher x Brent - ROI Is Earned - 64s.mp4` — 1920×1080, 30 fps, H.264 + AAC 48 kHz, ~64 s.

## Source

- Master: `align-hcm-maher-brent-chatcut` repo → `source/Maher x Brent - full 2m08s.mp4` (Git LFS, 128.4 s two-up recording, decoded 2868×1320).
- Speaker map: Brent Skinner tile left (x 262–1441), Maher El-Abdallah tile right (x 1443–2604), full-height tiles.
- Transcript: faster-whisper `base.en`, word-level timestamps (`master_words.json`).

## Editorial structure (4 beats + intro/outro)

| Beat | Source (s) | Final start | Framing | Sidebar |
|------|-----------|-------------|---------|---------|
| Intro — ink-reveal logo | — | 0.0 | — | — |
| A1 · Maher | 7.50–14.92 | 4.25 | Two-up | 01 · The Gap, "Managed. Not leveraged." |
| A2 · Maher | 16.30–29.55 | 11.37 | Maher solo | (same plate, dissolve seam) |
| B · Brent | 68.10–74.60 | 24.12 | Brent solo | 02 · The Question — "What about layers two & three?" |
| C1 · Maher | 79.45–95.95 | 30.12 | Two-up | 03 · The Answer — "Foundation to skyscraper." |
| C2 · Maher | 116.30–128.10 | 46.60 | Maher solo, 1.06× punch-in | 04 · The Takeaway — "Leverage it. Don't just manage it." |
| Outro — CTA card | — | 57.80 | — | "Get more from your HCM." |

Transitions: fade 0.5 (intro→A1), dissolve 0.35 (A1→A2 source seam), smoothleft 0.5 (A2→B), smoothright 0.5 (B→C1), hard cut (C1→C2 reframe), fade 0.6 (C2→outro). Audio acrossfades mirror video; final loudnorm I=-16 LUFS.

## Design system (from brand tokens + master template)

- Background `#0E1A2B` navy with blue/orange glow blobs, rotated diamond accents, vignette.
- Accent orange `#F47A25`, cream `#F7F4EE`.
- Headings: Libre Baskerville (intro tagline, outro CTA). Sidebar/labels: Inter. Captions: Inter Tight SemiBold 46 px, cream, **orange active-word highlight**, ≤2 lines, per-word ASS events.
- Layout per reference: left dark sidebar (logo → series eyebrow "HCM ROI" → section eyebrow + underline → bold headline → sub → progress bar), 3 px orange divider, right panel with 1260×709 video box (12 px radius, 3 px orange ring, drop shadow), speaker label row under the box, 6 px top gradient bar, 46 px footer bar.
- Intro: Align reversed logo materializes via SVG turbulence "ink" dissolve; tagline "ROI isn't installed. *It's earned.*"
- Outro: "Get more from **your HCM.**" + "with Align HCM, your implementation & optimization partner" + logo + ALIGNHCM.COM.

## Pipeline (all local, reproducible)

1. `gfx.html` — deterministic seek-driven motion graphics (scenes: intro, outro, plate, chrome).
2. `render_gfx.py` — Playwright/Chromium renders stills + 30 fps PNG sequences.
3. `build_captions_master.py` — word-timed ASS captions with active-word highlight, mapped to the final timeline.
4. `assemble.sh` — ffmpeg: crop/scale each beat, rounded-corner alphamerge, plate + ring overlays, xfade/acrossfade chains, ASS burn-in, loudnorm, H.264 export.

Exact Align logo pulled from alignhcm.com (`align white logo.png` / reversed variant generated from `Align HCM logo.png`).

## V2 revisions (client feedback)

- Both speakers stay in frame for every beat (two-up crop `2340:1316:264:2`; takeaway beat is a 1.06x punch-in of the same two-up).
- Type scale increased across the board: sidebar serif headlines 60px Gelasio Bold (Georgia-family match to the PowerPoint template), captions 58px Gelasio SemiBold, series title 26px, labels 24px.
- All transitions are directional swipes (smoothright/smoothleft/smoothup xfades) with matching audio crossfades.
- Dual speaker labels under the box, one per speaker half; the active speaker's name renders orange with a glowing dot.
- Background diamonds rebuilt as liquid-glass 3D elements (backdrop blur, specular highlight, rotateX/rotateY float on a 4s seamless loop) with orange radial-gradient shadows beneath; plates are now animated 4s loop videos rather than stills.
- No dashes anywhere in on-screen text; whisper's stray hyphen tokens stripped from captions.
