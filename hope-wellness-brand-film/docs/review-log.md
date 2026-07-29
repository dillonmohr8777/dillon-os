# Mandatory quality review — record

Run against `render/hope-wellness-five-video-brand-film-final.mp4`.
Automated portion: `python3 project/qc.py` — **43/43 checks pass**.
(Revision 2 findings are appended at the end of this file.)

| # | Check | Result |
|---|---|---|
| 1 | Official logo matches the website | **Pass.** Re-fetched the live header asset and compared byte-for-byte: MD5 `22c160b5…` identical to the committed copy. |
| 2 | Logo not recreated or altered | **Pass.** NCC 0.9478 between the official PNG and a crop of the finished render; rendered blue BGR `[157 75 14]` vs official `[152 76 16]`, green `[74 198 80]` vs `[65 196 78]` (deltas are grain + vignette + H.264). Aspect 3.0898 vs 3.0921. |
| 3 | All five videos appear meaningfully | **Pass.** 9 shots: c1, c2, c2, c4, c4, c5, c5, c1, c3 — 4.6–5.6 s each. |
| 4 | Weak / distorted frames removed | **Pass.** Clip 3's near-frozen head (frames 0–48) and its garbled word cloud (after ≈6.2 s) excluded; clip 4's frozen tail (frames 223–240) excluded. Asserted in `manifest.validate()`. |
| 5 | Feels like one continuous story | **Pass.** One graded palette, leaflets drifting through every shot, one continuous musical build, consistent 2.5D layering, and a swim→swim bookend. |
| 6 | No black frames | **Pass.** Darkest frame mean luma **178.3** (of 255) at 14.20 s. No fade to black anywhere; frame 0 is a full image. |
| 7 | No abrupt audio cuts | **Pass.** 0.30 s fade-in (first 50 ms peak 0.0121), 1.55 s resolved fade-out (last 50 ms 0.0038). No silent gap — quietest 0.25 s window −17.4 dBFS. |
| 8 | Typography readable on a phone | **Pass.** Smallest type is 31 px on a 628-line frame (≈4.9 % of height); brand blue on the pale ground measures ≈6.8:1 contrast. |
| 9 | Copy inside safe margins | **Pass.** All copy inside (72, 46)–(1128, 582). |
| 10 | URL exactly `thehopewellnesscenter.com` | **Pass.** |
| 11 | Service + location claims verified | **Pass.** Therapy / Medication management / Psychiatric care and MA·RI·NY·CO·AZ all confirmed on the site. |
| 12 | No unsupported medical claims | **Pass.** 16 whole-word claim checks. |
| 13 | No warped faces, hands or limbs | **Pass.** No optical-flow interpolation or stabilisation used. Vertical view windows set from measured character bounds so nothing is cropped; nothing is geometrically deformed. |
| 14 | Logo card holds ≥ 4 s | **Pass. 4.29 s** settled and unobstructed (42.95 in, 43.41 settled, 47.70 end). |
| 15 | Watched with sound | **Done** — see findings below. |
| 16 | Watched muted | **Done** — transition-by-transition frame review (`docs/review/transitions-1.jpg`, `transitions-2.jpg`). |
| 17 | First three seconds inspected separately | **Done** (`docs/review/first-three-seconds.jpg`). Full stroke cycle, continuous motion (Δ 1.1–3.1), copy revealed by the water ripple, no black, no static hold. |
| 18 | Any section feeling like clips placed consecutively | **Redesigned** — see finding B. |
| 19 | Any scene feeling templated or generic | **Improved** — see finding C. |
| 20 | Corrected version rendered before reporting | **Done.** Three full renders; the delivered file is the third. |

---

## Findings from review, and what was changed

**A. Visible vertical seams at the plate edges (picture).**
Measured a step of up to **47.5 luma units** (107× the local median gradient) where
the hero plate met the reconstructed background — clearly visible as a hard line.
Cause: the plate was being feathered into a flat fill rather than into the
extension. Since the mirrored extension already makes the seam-adjacent column
the plate's own edge column, the feather was removed entirely and the composite
made opaque. Seams now measure **0.12–0.43 luma units** across all nine shots —
invisible. Verified in a background-only row band so artwork edges can't
mask the result.

**B. The leaf transition's cut was landing in the open (18).**
The A/B switch peaked at 14.47 s, *after* the foreground leaf had already
cleared frame — so the cut read as a plain jump, exactly the "five clips in a
row" failure. Measured when the leaf actually covers the frame (prog 0.16–0.32,
i.e. 14.20–14.33 s) and retimed the wipe into that window, widening its edge.
The delta peak now sits at **14.30 s, fully behind the leaf**, and the reveal
reads as the leaf uncovering a new scene.

**C. An unmotivated dark blob in the reading shot's negative space (19).**
The widest extension (471 px, 39 % of frame) was mirroring a dark navy plant pot
into the type area — a distinct dark shape with no visual origin, 27 luma units
below the surrounding field. Narrowed the mirror strip (132→104 px), scaled the
defocus with the stretch (σ up to 114) and strengthened the ease-to-field for
wide gaps. It now reads as a smooth depth gradient anchoring the type.

**D. Mirrored lettering was legible in the extension.**
Clip 3's rising "hope" words fell inside the mirror strip and read as reversed
text. Added a defocus floor proportional to the horizontal stretch, held true
continuity for only ~36 px past the seam, then committed to the defocused
version. No lettering is readable in any extension.

**E. A ghost double of every subject (picture).**
The atmospheric field was built from the whole frame, so a blurred duplicate of
each figure appeared behind her. Rebuilt from **background only** — a wide max
filter removes the (darker) figure before the blur, so a ghost is now
structurally impossible.

**F. Sound design was inaudible on 6 of 9 transitions (15).**
Two causes: swells were peaking ~0.5 s *after* their cut (envelope crest was
mid-sound but they were placed at the cut), and the glue compressor was
flattening their transients. Anchored every sound by its own crest position,
softened the glue, and added a 3 dB music duck under each transition. Now
**8 of 9 read at 1.32–3.33× the local bed**; the ninth (rising horizon, 1.29×)
also carries a large visual light sweep and a bell.

**G. The mix nearly cancelled in mono.**
L/R correlation was **+0.042** with a **−6.3 dB** fold penalty in the sub band —
two independent reverb impulse responses were decorrelating the whole mix, and
the pads were two independently-seeded panned layers. Switched to a shared IR
with a quiet mid/side width layer, rebuilt the pads and ambience as true
mid/side, and summed everything below 160 Hz to mono. Correlation is now
**+0.651** with a **−0.84 dB** fold penalty — safe on a phone speaker.

**H. Contact sheet caught the opening line mid-reveal.**
Moved the first sample from 1.60 s to 2.60 s so the delivered sheet shows the
fully-resolved phrase.

## Watched with sound — notes

The score's RMS tracks the edit: −17.6 dBFS over the opening, rising through
−14.5 / −14.2 / −13.5 to a **−12.4 dBFS peak on the forward-movement beat**,
then easing to −14.0 for the brand resolve. Percussion enters at bar 5 (12 s)
and drops out entirely for the logo card, so the resolve lands on piano and pad
alone. Sound design is restrained and object-matched — water under both swim
shots, breath swells over the tree pose, a ceramic ring on the wheel, band
tension on the resistance work, and the band-stroke wipe panned L→R with the
on-screen travel. Peak −0.71 dBFS, no clipping.

## Remaining defects that could not be repaired

1. **Clip 3's word cloud garbles after ≈6.2 s of source** — overlapping,
   malformed letterforms. Unfixable without redrawing AI output, so it is
   excluded; the film uses only the legible window.
2. **Clip 5's yoga mat is clipped at frame left/right in shots 6–7.** No view
   window keeps the figure, the fully-extended band *and* both mat ends. A prop
   edge, not a body part.
3. **24 → 30 fps cadence.** All five clips are 24 fps. Handled with
   nearest-frame selection plus a light temporal blend under a continuous 30 fps
   synthetic camera move. Optical-flow interpolation was tested and rejected —
   it bent hands and plant edges. Residual luma flicker measures 0.199.

## Evidence

| File | Shows |
|---|---|
| `docs/review/logo-verify.jpg` | official PNG on light and dark vs a crop from the final render |
| `docs/review/preview-grid.jpg` | 28 sampled moments across the whole film |
| `docs/review/transitions-1.jpg` | ripple, breath ring, match cut, rising horizon |
| `docs/review/transitions-2.jpg` | band stroke, motion trail, bow wave, gather |
| `docs/review/first-three-seconds.jpg` | opening inspected frame by frame |
| `docs/review/leaf-transition-retimed.jpg` | the cut now hidden behind the passing leaf |
| `docs/review/score-spectrogram.jpg` | harmonic content, chord changes, transition swells |
| `docs/review/clip3-word-cloud-degradation.jpg` | why clip 3 is cut at 5.80 s of source |
| `docs/review/botanical-cutouts.jpg` | the 19 botanicals keyed out of the artwork |
| `docs/review/final-review.jpg` | 20 sampled moments from the delivered file |
| `docs/review/ink-intro.jpg` | the ink logo assembling, frame by frame |
| `docs/review/ink-logo-vs-official-2x.jpg` | settled intro logo vs the official PNG at 2× nearest |
| `docs/review/swipes-and-pushes.jpg` | type swipes, swipe bars and the push cut |
| `docs/review/green-gradient-type.jpg` | the brand-green gradient behind copy |
| `docs/review/yoga-reframe.jpg` | the reframe that cleared the right-hand copy |


---

# Revision 2 — intro, stills and motion pass

Requested: a magic-ink particle logo intro, the five new stills added, more
green gradient behind the type, better type placement, font swipes, a 3D pop,
and more motion / better cuts overall. Runtime 47.70 → **49.80 s**, sections
10 → **14**, transitions 9 → **13**.

`project/qc.py` — **43/43 pass**, including two new logo-integrity checks and
coverage checks for all five clips *and* all five stills.

## Findings from review, and what was changed

**I. The intro's held logo was not the pure official asset.**
The particle layer was still being drawn *underneath* the resolved bitmap, so
its 3×3 splats and bleed halo thickened the mark's strokes. Measured NCC against
the source PNG: **0.879**. The particle layer now fades out completely as the
bitmap cross-resolves, and the settled lockup is the downloaded asset alone —
**0.953** (the residual is the gradient background, not distortion; a 2×
nearest-neighbour comparison confirms the strokes, letterforms and colours are
identical). The end card measures **0.998**.

**J. Drifting botanicals could pass in front of the intro logo.**
They were composited after it. Reordered to draw behind the lockup, so nothing
obstructs it at any point.

**K. A uniform "breath" scale on the held intro logo was removed.**
It was legitimate (the whole asset scaled), but it made the lockup differ from
the end card and defeated exact verification. The intro logo now holds dead
still at native scale, exactly like the resolve.

**L. The zoom-punch transition read as a double exposure.**
Two legible images were crossfading while both were still readable. Restructured
so the outgoing frame is driven to abstract radial streaks *before* the incoming
arrives (crossfade starts at 40 % instead of 22 %, blur ramps 1.55× faster).
Only one image is ever legible.

**M. The yoga shot's reframe put the figure where the right-hand copy sits.**
Widening that shot moved her to screen x 479–1007, straight through "A place /
to feel / heard." at x 812. Re-framed to vw 900 / sx 0 so she lands at 157–684,
leaving the right third clear.

**N. One still's extension mirrored a dark navy plant pot into the type area.**
Flipped the pottery still's plate to the right so the reconstructed side falls
over the pale vase region instead, and moved its copy to the left.

**O. The green gradient was too subtle to read as requested.**
Strengthened the scrim (tint 0.22 → 0.36, lift 0.30 → 0.34, pad 190×120 →
250×156) and made it directional — arriving from low and from the type's outer
edge — so it reads as lighting rather than a box. Contrast for the blue type
stays ≈5.6:1. A faint green lean (6 %) was also added to the reconstructed frame
edges so the gradient language runs through the whole film, not only behind copy.

**P. The first frame of the film was empty.**
The ink cloud had not built yet and the single opening bloom had faded. Added a
second staggered bloom (0.34 s, 1.05 s) and pulled particle arrival earlier
(t0 max 0.94 → 0.80), so frame 1 already carries a visible event.

**Q. Four transitions' sound design was masked by the pad bed.**
Bright noise alone could not cut through. Added a dedicated **low-mid whoosh**
generator for the mechanical cuts (zoom punch, push, both swipes) and raised
their levels. 12 of 13 transitions now read at 1.25–2.54× the local bed; the
thirteenth (leaf pass, 1.13×) carries a distinct leaf-rustle timbre plus the
largest visual event in the film.

**R. Programme level dropped when the duck count went 9 → 13.**
Ducking 3 dB at thirteen cuts cost overall loudness (RMS had fallen to
−16.1 dBFS). Reduced the duck to 2 dB with a higher floor and eased the glue
threshold: RMS back to **−14.11 dBFS**, peak −0.80, correlation +0.675, mono-fold
penalty −0.77 dB.

**S. Hard-cut detection had to learn the new transition vocabulary.**
`push` and `swipebar` are decisive by design and legitimately spike the
frame-delta metric. The check now distinguishes spikes *inside* a transition
window (the transition working) from stray spikes *outside* one (an unintended
jump). Result: 6 spikes, all inside transitions, 0 stray.

## New motion vocabulary

- **Ink logo assembly** — particles sampled from the official artwork's own
  pixels, flown in on curl-noise paths in staggered waves, landing exactly.
- **Ink dissolve** — the same motif as a transition: the frame breaks into motes
  that lift and smear while the next bleeds through.
- **3D pop** — a perspective tilt resolving flat over an extruded edge, with the
  extrusion depth collapsing as it settles.
- **Type swipe** — a hard brand-green bar sweeps across, dragging the letters in
  behind it, with a glow at the leading edge.
- **Swipe bar transition** — a full-frame green bar swipe that drags the incoming
  shot with it, in both directions.
- **Zoom punch** and **push** — added for cutting variety.

## Remaining defects that could not be repaired

Unchanged from revision 1 (clip 3's word cloud garbling after ≈6.2 s, clip 5's
mat edges in the band shots, and the 24 → 30 fps cadence), plus:

4. **Two of the five supplied stills** (pottery, tree pose) depict scenes that
   already exist as animated clips. They are used as held punctuation beats at
   different framings rather than as substitutes, but they are inherently less
   novel than the bench, painting and dancing stills.
5. **The ink-dissolve out of the intro** briefly shows the logo breaking up over
   the opening water shot. It is the intended motif, but for ~0.7 s the mark and
   the footage co-exist. Shortening it further would lose the ink read.
