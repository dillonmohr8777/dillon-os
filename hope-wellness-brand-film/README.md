# The Hope Wellness Center — brand film

A 47.70 s landscape brand film built from five supplied animated clips, the
practice's own official logo, and a score synthesised for this piece.

**Final deliverable:** `render/hope-wellness-five-video-brand-film-final.mp4`
1200 × 628 · 30 fps · H.264 High / yuv420p · AAC 192 kb/s 48 kHz stereo · faststart

---

## Build

```bash
./project/render.sh          # everything: assets, score, picture, mux
./project/render.sh video    # picture + mux only
./project/render.sh audio    # re-synthesise the score only
python3 project/qc.py        # 39 automated checks + contact sheet
```

Requires `ffmpeg`/`ffprobe` on `PATH` and `numpy scipy opencv-python-headless pillow`.
Picture renders in 4 parallel segments split on whole frames, concatenated
losslessly, then muxed. Reproducible: every random element is seeded.

## Project layout

| Path | What |
|---|---|
| `assets/source-videos/upload1-5.mp4` | the five supplied clips, untouched |
| `assets/logo/` | official logo downloaded from the live site |
| `assets/type/Poppins-*.ttf` | typography |
| `assets/transitions/` | 19 botanical cutouts keyed out of the artwork |
| `assets/masks/` | organic blob + radial matte fields |
| `project/manifest.py` | **the timeline** — shots, framing, transitions, all copy |
| `project/compose.py` | 2.5D compositor: grade, reframe, extend, transitions, type |
| `project/audio.py` | score + sound design synthesis |
| `project/qc.py` | automated QC, contact sheet, logo verification |
| `project/render.sh` | full build |
| `project/scene-manifest.json` | machine-readable timeline export |
| `render/score.wav` | 24-bit master audio |
| `render/contact-sheet.png` | six-frame contact sheet |
| `docs/logo-source.md` | logo provenance record |
| `build/inspect/` | preview grids, seam tests, spectrogram, logo verify |

## Verified brand facts

Everything on screen traces to <https://thehopewellnesscenter.com/> (fetched 2026-07-28).

| | |
|---|---|
| Name | The Hope Wellness Center |
| Tagline | "Helping you find comfort, peace of mind, and hope!" |
| Positioning | "Personalized Mental Health Care Rooted in Compassion, Trust, and Expertise" |
| Model | **Telehealth only** — "We do not offer in-person sessions." |
| States | Massachusetts · Rhode Island · New York · Colorado · Arizona |
| CTA on site | "Book an Appointment" |
| Blue / Green | `#104C98` / `#4EC441`, sampled from the official logo's pixels |

Three service phrases are used, all named on the site: **Therapy** ·
**Medication management** · **Psychiatric care**. No outcome, insurance,
availability, credential, statistic, testimonial or in-person claim appears
anywhere. Brand green measures ≈1.8:1 on the artwork's pale ground so it is
never used for type (blue measures ≈6.8:1); green appears only as graphic
accent — state separators, the wipe stroke, particles.

## Edit

Upload order was **not** kept. The clips were re-ordered for the arc
*pressure → pause → reflection → support → movement → confidence → hope*,
and four clips appear twice from **non-overlapping** source windows, so the
returns read as second angles rather than repeats.

| # | Shot | Clip | Screen | Source | Speed | Copy |
|---|---|---|---|---|---|---|
| 1 | swim | 1 | 0.00–4.60 | 0.35–4.95 | 1.00× | "When life / feels heavy…" |
| 2 | tree pose | 2 | 4.60–10.20 | 0.25–5.85 | 1.00× | "Find space / to breathe." |
| 3 | tree pose, in | 2 | 10.20–14.10 | 6.30–9.35 | 0.78× | "A place / to feel / heard." |
| 4 | pottery | 4 | 14.10–19.40 | 0.50–5.80 | 1.00× | "Care that makes room for the whole person." |
| 5 | pottery, in | 4 | 19.40–23.00 | 5.80–8.40 | 0.72× | "Personalized support." → "Wherever life happens." |
| 6 | band | 5 | 23.00–27.90 | 0.40–5.30 | 1.00× | "Therapy" → "Medication management" |
| 7 | band, in | 5 | 27.90–32.20 | 5.30–9.00 | 0.86× | "Psychiatric care" → "Secure telehealth across · MA RI NY CO AZ" |
| 8 | swim, forward | 1 | 32.20–37.10 | 5.90–9.30 | 0.69× | "One small step can begin a new direction." |
| 9 | reading | 3 | 37.10–42.10 | 2.32–5.80 | 0.70× | "Comfort." → "Peace of mind." → "Hope." |
| 10 | brand card | — | 42.10–47.70 | — | — | logo · "Schedule Your Appointment" · thehopewellnesscenter.com |

All speeds are ≤ 1.00× — nothing is sped up, so the calm never feels rushed.

### Footage defects removed

Measured per frame, then designed around:

- **clip 3** — frames 0–48 are near-frozen (Δ 0.21) and the rising "hope" word
  cloud **degrades into garbled, overlapping letterforms after ≈6.2 s**. Only
  the clean window 2.32–5.80 s is used, where the words are legible.
- **clip 4** — frames 223–240 are frozen. All reads stop by 8.40 s.
- **clip 2** — the camera settles after 6 s; that stillest window is
  deliberately given to the "feel heard" reflection beat.
- Every shot's outgoing transition tail is asserted in `manifest.validate()`
  to stay inside its clip's clean region.

## Landscape reframing

Source is 1104 × 816 (1.353:1); delivery is 1.911:1 — **proportionally wider
than the source**. So rather than cropping the artwork to fill, every shot is
scaled to fill the full 628 height and the frame is completed *sideways*:

1. The vertical view window per shot comes from measured character bounds, so
   no head, hand, foot or held prop is ever cut.
2. The gap is filled by **mirroring the plate's edge region, stretching it
   across the gap and defocusing it outward**. Mirroring makes the column
   touching the seam the plate's own edge column, so the join is
   pixel-continuous — measured at **0.13–0.60 luma units**, i.e. invisible.
3. The wider the gap, the harder it resolves to clean field (a 40 %-wide gap
   must read as designed negative space, not mirrored scenery), with a defocus
   floor scaled to the stretch so lettering can never read reversed.
4. Subject weighted to one side, typography in the opposing negative space —
   the strongest editorial move in 1.91:1. Shot 3 flips to the right for rhythm.

Also layered: a background-only atmospheric field (a wide max filter removes
the darker figure, so it can never ghost the subject), drifting organic blobs
in the artwork's own shape language, and defocused botanical foregrounds on a
faster parallax track.

## Transitions

Ordinary crossfades are not used. Each transition is motivated by an object
physically present in the outgoing shot:

| At | Device |
|---|---|
| 4.60 | water ripple off the swimmer becomes a circular mask, with a lit crest |
| 10.20 | breath ring expands past the frame edge and carries the reframe |
| 14.10 | a defocused leaf crosses the lens; the cut happens entirely behind it |
| 19.40 | the glowing wheel disc expands into a circular mask (**match cut** — action continues) |
| 23.00 | the wheel disc flattens into a rising horizon line of light |
| 27.90 | the resistance band becomes a travelling stroke, panned L→R in the mix |
| 32.20 | motion trail off the band release smears and sweeps into water |
| 37.10 | bow-wave ripple reveals the chair — mirrors the opening |
| 42.10 | hope-words and botanicals gather to centre, dissolving into the card |

## Typography

Poppins — ExtraBold/Bold for emotional phrases, SemiBold/Medium for support.
One phrase on screen at a time, auto-fitted to a per-shot maximum width so it
can never collide with the subject. Reveal techniques: ripple-mask, breath-ring
mask, rise with blur-resolve, per-word blur assembly, lifting swap, a stroke
travelling along the band, and dispersal into translucent particles. No
bouncing, karaoke, glitch, neon or rounded caption boxes.

## Score

Synthesised from scratch — 80 BPM, A major/modal, no lyrics.
Airy piano (inharmonic struck-string model), warm detuned pads, sub, and gentle
organic percussion entering at bar 5 and dropping out for the brand card.
Convolution reverb from a synthesised impulse response. RMS rises −19 → −11 dBFS
across the film and eases back for the resolve — the build tracks the edit.
Sound design sits on the transitions: water swells, airy sweeps, leaf rustle,
breath, ceramic ring, band tension, a resolving bell under the logo.
Peak −1.12 dBFS, no clipping, no silent gap, 0.30 s fade-in and a 1.55 s
resolved fade-out.

**No voiceover.** See deviations.

## Deliberate deviations

1. **1200 × 628 landscape instead of 1080 × 1920 vertical**, at the client's
   direction mid-build. 627 was requested; H.264 with yuv420p requires even
   dimensions, so the height is 628 — visually identical, encodes cleanly.
   Consequently the Reels/TikTok action-rail safe margins in the original brief
   do not apply to this shape; generous editorial margins
   (72 / 46 px) are used instead, so the film stays safe if it is ever reframed.
2. **No voiceover.** The brief asks for the strongest music-and-visual version
   first, and permits narration only if a genuinely natural premium adult voice
   is available. No such voice is available in this environment, and the brief
   explicitly forbids an obviously synthetic one — so the film ships as
   designed, without one. The score and sound design carry it.
3. **The logo is enlarged 3× (Lanczos) once, then drawn smaller than that
   master.** 470 × 152 is the largest variant the site publishes; no vector or
   larger original exists publicly. Aspect, colour and transparency are
   untouched. See `docs/logo-source.md`.
4. **Typography sits left of the subject in 8 of 9 shots.** That is where the
   negative space actually is in this artwork — the characters sit centre-right
   in all five clips. Shot 3 flips right; rhythm otherwise comes from varying
   scale, vertical placement and line count.

## Remaining footage defects that could not be repaired

- **Clip 3's word cloud** garbles after ≈6.2 s of source. Unfixable without
  redrawing AI output, so it is simply excluded — the film uses only the
  legible window and cuts away before the degradation.
- **Clip 5's yoga mat** is clipped at frame left/right in shots 6–7. The mat is
  wider than any view window that also keeps the figure and the fully-extended
  band uncropped. A prop edge, not a body part.
- All five clips are 24 fps and delivery is 30 fps. Resolved with nearest-frame
  selection plus a light temporal blend, under a continuous 30 fps synthetic
  camera move that masks the cadence. No optical-flow interpolation was used —
  it bent hands and plant edges on this material, and the brief forbids
  visible warping. Measured luma flicker: 0.219 (2nd-difference mean).
