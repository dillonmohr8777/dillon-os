# Need Momentum AI launch: local review export

Status: **30-second MP4 exported and technically verified; staged for Dillon's review.** No publication, sending, voiceover, or client outcome is claimed.

## Review files

- Master: `../remotion/out/NeedMomentumAILaunch30-review.mp4`
- Six scene contact sheet: `../remotion/out/NeedMomentumAILaunch30-contact-sheet.jpg`
- Transition sheet: `../remotion/out/NeedMomentumAILaunch30-transitions.jpg`
- Machine evidence: `../remotion/out/NeedMomentumAILaunch30-ffprobe.json`
- Final audio analysis: `../remotion/out/NeedMomentumAILaunch30-audio-analysis.txt`
- All 34 full-resolution samples: `../remotion/out/launch-qa/`

The contact sheets were extracted from this exact master, not separately rendered stills. SHA256: `2f1391e2391419a6ae71efd2d1d7585e072e3900b6bbabe5843ae84c03445107`.

## Export and content verification

`qa_launch.py` passes: 1920×1080, exactly 900 frames, 30 fps, 30.000000 seconds, H.264, stereo AAC at 48 kHz. The finishing pass uses limited-range YUV420P and Rec.709 metadata. Initial Remotion output had 0.06 seconds of AAC container padding; the local FFmpeg finishing pass corrected it. The untouched Remotion output remains at `out/NeedMomentumAILaunch30-remotion.mp4`.

Six distinct scenes carry the approved working copy: incoming work; customer request and AI draft; human rewrite and review check; connected next steps; wider human conversation; original mark and division introduction. One reply-card component persists through drafting, review, and the first workflow step. Task sheets, type, route, birds, people, and original mark are independently composited. Birds translate and rotate as paper cutouts; their wings and people's hands/mouths are not deformed. The end lockup holds still from frame 780 through 899.

Animation-quality-gate review covered six representative scenes and 28 transition samples: readable copy, intact silhouettes, no baked checkerboard rectangles, independently controlled layers, physical paper transitions, restrained motion, and exact master compatibility. An internal vertical people crop found in the first still pass was removed; close-ups now crop only at the video frame boundary. The full conversation is intact in the fifth scene. The short transition intervals intentionally permit foreground paper to cover outgoing content.

## Brand and asset provenance

Blue `#1766ab`, navy `#072d53`, Archivo Black, and Nunito Sans come from the existing `2026-09-08-momentum-brand-system-v3` files. The generated paper texture is composited over the blue stage and reused within cream paper layers. The original logo is unchanged at near-native display size and remains separate from type and imagery. Its SHA256 is `046b7bc27374c1d38f3885a3c638908e1dd8097cfed6fafed9631d7d60bc1ef2`, matching the source manifest.

The people source is preserved at `assets/people/NM-HUMAN-TABLEAU-03-magenta-source.png`. The compositor derivative is `remotion/public/launch/human.png`. Standard FFmpeg video compositing key: `format=rgba,colorkey=0xFF00FF:0.30:0.05`. The generated image's magenta backing was removed for the edit; this was not a successful native-alpha generation. Fine keyed edges remain a review consideration at magnified inspection. Dove and cardinal use the parent's supplied PNG assets and are clean at their actual displayed size.

The old 15-second `NeedMomentumBirdsHero.tsx` remains unchanged; the new composition is registered separately as `NeedMomentumAILaunch30`.

## Audio and limits

Original local synthesis supplies quiet paper slips, pencil strokes, and a warm plucked pulse. No paid audio API, external recording/sample, fake voiceover, or licensed-music claim. Reproducible source: `remotion/make_launch_audio.py`; stereo WAV: `remotion/public/launch/paper-pulse.wav`. Final measured level: -25.59 LUFS integrated and -8.39 dBTP, with no clipping. Levels and export track were measured; subjective speaker playback was not performed to avoid disturbing Dillon's foreground YouTube session. All narrative meaning remains in visible copy.

This is a local review master, not an approved campaign release or a verified product demonstration. CTA has no invented destination. The human tableau is stylized artwork, not client footage. The supplied 1672×941 texture is modestly enlarged for the 1080p master; foreground cutouts and type retain separate detail. No foreground browser interaction, machine setting changes, or publishing occurred.

## Reproduce

From `remotion/`, run `python make_launch_audio.py`, `npm run lint`, and render composition `NeedMomentumAILaunch30` at H.264 CRF 18 with stereo AAC. Apply the documented 30-second Rec.709 finishing pass, then run `python qa_launch.py` to verify the master and rebuild both contact sheets.
