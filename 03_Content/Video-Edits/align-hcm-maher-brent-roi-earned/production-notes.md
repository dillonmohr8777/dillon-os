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

## V3: three standalone clips (15 to 27s), three designs

| Clip | Source | Length | Design |
|------|--------|--------|--------|
| 1 · The Record Trap | 16.30 to 29.55 | 15.9s | Kinetic banner: giant serif keywords swap via orange wipe panel, synced to speech beats |
| 2 · Foundation to Skyscraper | 79.56 to 95.95 | 19.1s | Left rail with animated L1/L2/L3 floor stack that builds and lights up as each layer is mentioned, spire rises on "skyscraper" |
| 3 · Leverage the System | 103.86 to 127.90 | 26.7s | Three liquid-glass metric cards swipe in from the right with 3D rotation as each point lands |

Shared V3 system (`gfx3.html` + `render_gfx3.py` + `assemble3.sh`):
- Data-field background: live-drawing sparkline with traveling dot, pulsing bar chart, floating data chips (HCM ROI +38%, L1 L2 L3), ghost outline ROI and HCM typography, rising particle dots, orbiting satellite ring, liquid-glass squares with orange gradient shadows. Every element floats on its own sine rhythm; full-length per-clip frame sequences (not loops).
- Captions inside the video box, Gelasio SemiBold 54 to 58px, orange active word, drop shadow for legibility.
- Both speakers in frame (two-up crop) with dual name labels, active speaker in orange.
- Each clip exits with a smoothleft swipe into a branded end card (logo, serif kicker, ALIGNHCM.COM) over the data field.
- No dashes in any on-screen text.

## Batch 2: clips from the full 23:43 episode (native 1080p source)

Source: `align-hcm-maher-brent-chatcut` repo, `source/full-episode.mp4` (pushed by Codex, 1920x1080/24). YouTube json3 transcript aligns 1:1 with the file (whisper-verified within 60ms), so all cuts and captions use it directly.

| Clip | Source (s) | Length | Archetype |
|------|-----------|--------|-----------|
| 4 · Personal ROI | 139.60 to 159.55 | 22.6s | Kinetic banner |
| 5 · Product Not Utility | 711.40 to 734.90 | 26.2s | Swipe-in glass cards |
| 6 · Speak CFO | 1230.40 to 1258.95 | 31.2s | Translation stack (metric floors light up as translated) |

Background V4 ("premium SaaS field"): removed all fabricated data elements (fake sparkline, +38% chip, bar chart). Replaced with aurora light beams, rotating conic halos, radially masked dot matrix, film grain, periodic light streaks, and editorial glass pills carrying real episode language (System of Intelligence / Earned, Not Installed). Glass diamonds with orange gradient shadows retained. Full continuity with earlier deliverables (Gelasio system, orange ring box, dual name labels, word-tracked captions, end cards).

## V5: social caption band, all six clips unified

Per client markup on the Speak CFO frame: captions moved out of the video box into the open bottom band. Gelasio SemiBold 58 to 62px, cream, single line always (no wrap), active word rendered orange with a vertical jump-pop (fscy 128 to 100 over 150ms plus a brief orange glow outline). Video box reduced to 1220x686 for banner and cards archetypes to clear the band; keyword banner and card rows slimmed into a middle strip. Clips 1 to 3 rebuilt from the native 1080p episode source (located in the episode timeline by transcript matching) on the V4 SaaS field. All six deliverables share one system and carry the -v2 suffix.

## The Full Cut (3:23, longform supercut)

Eleven chapters spanning the episode's complete argument, hard-cut and hidden under 3D page-flip transitions (a branded navy sheet with Align watermark and orange spine sweeps in from the right, covers the frame at the cut, folds away left; soft pink-noise whoosh under each of the 12 flips). Each chapter opens with a cinematic frosted-glass title card over the footage (78px Gelasio, CHAPTER NN eyebrow) that dissolves out after ~3s. Captions at 66px in the bottom band with the orange word-jump. Ink-reveal intro, Get More From Your HCM outro. Rendered efficiently: one shared 8s seamless background loop plus per-chapter static chrome stills and 4s title-animation sequences composited in ffmpeg, so the 3:23 program needed only ~1,900 rendered frames.

Chapters: 01 ROI Myth (Brent) / 02 First Layer / 03 The Gap / 04 The Question (Brent) / 05 Blueprint / 06 The Unlock / 07 Job Number One / 08 Own It / 09 The Warning / 10 The Translation / 11 The Seat.
