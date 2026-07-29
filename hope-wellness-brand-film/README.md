# The Hope Wellness Center — brand film

A 49.80 s landscape brand film built from five supplied animated clips, five
supplied stills, the practice's own official logo, and a score synthesised for
this piece. It opens on a magic-ink logo signature: particles sampled from the
official artwork swirl in, coalesce, and resolve into the exact bitmap.

**Final deliverable:** `render/hope-wellness-five-video-brand-film-final.mp4`
1200 × 628 · 30 fps · 49.80 s · H.264 High / yuv420p · AAC 192 kb/s 48 kHz stereo · faststart

---

## Build

```bash
./project/render.sh          # everything: assets, score, picture, mux
./project/render.sh video    # picture + mux only
./project/render.sh audio    # re-synthesise the score only
python3 project/qc.py        # 43 automated checks + contact sheet
```

Requires `ffmpeg`/`ffprobe` on `PATH` and `numpy scipy opencv-python-headless pillow`.
Picture renders in 4 parallel segments split on whole frames, concatenated
losslessly, then muxed. Reproducible: every random element is seeded.

## Project layout

| Path | What |
|---|---|
| `assets/source-videos/upload1-5.mp4` | the five supplied clips, untouched |
| `assets/source-stills/still*.png` | the five supplied stills + normalised copies |
| `assets/logo/` | official logo downloaded from the live site |
| `assets/type/Poppins-*.ttf` | typography |
| `assets/transitions/` | 19 botanical cutouts keyed out of the artwork |
| `assets/masks/` | organic blob + radial matte fields |
| `project/manifest.py` | **the timeline** — shots, framing, transitions, all copy |
| `project/compose.py` | 2.5D compositor: grade, reframe, extend, transitions, type |
| `project/particles.py` | magic-ink particle engine (logo assembly + ink dissolve) |
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

Fourteen sections. Upload order was **not** kept: the clips were re-ordered for
the arc *ink signature → pressure → pause → reflection → expression → support →
everyday → services → access → telehealth → confidence → forward → hope →
resolve*, and the five stills are interleaved with the five clips so the cutting
alternates between motion and held image. Four clips appear twice from
**non-overlapping** source windows, so returns read as second angles.

| # | Section | Source | Screen | Copy |
|---|---|---|---|---|
| 0 | ink logo signature | official logo | 0.00–4.20 | — |
| 1 | swim | clip 1 | 4.20–8.40 | "When life / feels heavy…" |
| 2 | bench, headphones | **still 1** | 8.40–11.20 | "Find space / to breathe." |
| 3 | tree pose | clip 2 | 11.20–15.00 | "A place / to feel / heard." |
| 4 | painting | **still 4** | 15.00–17.80 | "Care that makes room for the whole person." |
| 5 | pottery | clip 4 | 17.80–21.60 | "Personalized support." → "Care built around you." |
| 6 | tree pose | **still 5** | 21.60–23.80 | "Wherever life happens." |
| 7 | band | clip 5 | 23.80–27.60 | "Therapy" → "Medication management" |
| 8 | band, cut in | clip 5 | 27.60–31.00 | "Psychiatric care" |
| 9 | pottery | **still 2** | 31.00–33.40 | "Secure telehealth across · MA RI NY CO AZ" |
| 10 | dancing | **still 3** | 33.40–36.40 | "One small step can begin a new direction." |
| 11 | swim, forward | clip 1 | 36.40–39.60 | *(none — a breath)* |
| 12 | reading | clip 3 | 39.60–44.40 | "Comfort." → "Peace of mind." → "Hope." |
| 13 | brand resolve | official logo | 44.40–49.80 | logo · CTA · thehopewellnesscenter.com |

All clip speeds are ≤ 1.00× — nothing is sped up. Stills are never static: each
gets a continuous push/drift, denser drifting botanicals, and parallax
foregrounds.

## The ink logo signature

Particles are **sampled from the official logo's own pixels** — each carries the
colour of the pixel it will land on. They fly in from a swirling cloud along
curl-noise paths, arriving in staggered waves, and land on their exact source
position. As they settle, the particle layer **fades out completely** and the
exact official bitmap cross-resolves in its place, so the held logo is the
downloaded asset alone with nothing overlaying or thickening its strokes
(verified at NCC 0.95 against the source PNG, with the residual being the
gradient background rather than any distortion). Drifting botanicals are drawn
behind the lockup, never over it. The same motif returns as the `inkdissolve`
transition out of the intro.

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

Thirteen cuts, no plain crossfades. Each is motivated by an object in the shot,
by the resistance band's own line, or by the ink motif:

| At | Device |
|---|---|
| 4.20 | the logo breaks back into ink motes, revealing the water |
| 8.40 | water ripple off the swimmer becomes a circular mask, with a lit crest |
| 11.20 | a brand-green bar **swipes** L→R and drags the next shot in with it |
| 15.00 | breath ring expands past the frame edge |
| 17.80 | **zoom punch** — the outgoing frame is driven to abstract streaks before the incoming arrives, so the two never co-read |
| 21.60 | the glowing wheel disc expands into a circular mask |
| 23.80 | a defocused leaf crosses the lens; the cut happens entirely behind it |
| 27.60 | the resistance band becomes a travelling stroke, panned L→R in the mix |
| 31.00 | the frame **pushes** sideways, carrying the reframe |
| 33.40 | a green bar swipes back R→L into the turn |
| 36.40 | motion trail smears and sweeps into water |
| 39.60 | bow-wave ripple reveals the chair — mirrors the opening |
| 44.40 | hope-words and botanicals gather to centre, dissolving into the card |

## Typography

Poppins — ExtraBold/Bold for emotional phrases, SemiBold/Medium for support.
One phrase on screen at a time, auto-fitted to a per-shot maximum width so it
can never collide with the subject, and alternating sides (six left, four right,
one shot deliberately typography-free).

Every block sits over a **soft brand-green gradient** — a directional wash
arriving from low and from the type's outer edge. It lifts toward white first to
protect contrast, then tints brand green, so it reads as lighting rather than as
a box. The same green lean runs faintly through the reconstructed frame edges,
so the gradient language carries across the whole film.

Reveal techniques: ripple-mask, **3D pop** (a perspective tilt resolving flat
over an extruded edge), **swipe** (a hard green bar sweeping across, dragging the
letters in behind it), per-word blur assembly, lifting swap, a stroke travelling
along the band, rise-with-blur, and dispersal into translucent particles. No
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
3. **Runtime is 49.80 s**, at the top of the briefed 42–50 s window. The ink
   intro and the five stills were added on request; every clip section was
   tightened to absorb them rather than letting the film run long.
4. **Two of the five supplied stills** (pottery, tree pose) depict scenes that
   also appear as animated clips. They are used as deliberate held beats at
   different framings and scales — punctuation between motion sections — rather
   than as substitutes for the moving versions.
5. **The logo is enlarged 3× (Lanczos) once, then drawn smaller than that
   master.** 470 × 152 is the largest variant the site publishes; no vector or
   larger original exists publicly. Aspect, colour and transparency are
   untouched. See `docs/logo-source.md`.
6. **Typography alternates sides but leans left (six of eleven copy blocks).**
   That is where the negative space actually is in this artwork — the characters
   sit centre-right in most sources. Four blocks sit right, and one section
   carries no copy at all as a breath.

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
