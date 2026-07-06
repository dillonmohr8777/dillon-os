# No Way Out — Music Video (paper-collage render pipeline)

Full-length music video for **"No Way Out"** (3:39), built as a living paper-collage
world: torn newsprint, ripped photo layers, xerox grain, halftone dots, ink bleed,
stop-motion jitter, and parallax paper depth. Visual journey runs Erie, PA
(lake, lighthouse, brick streets, 814) into Pittsburgh, PA (tunnels, bridges,
skyline, night streets), ending on the "NO WAY OUT" back-shot and an IMMOHRTAL
ink-stamp outro.

## How it works

`render.py` is a self-contained pipeline (Python + Pillow + numpy + ffmpeg via
`imageio-ffmpeg`). Every frame is a pure function of its index, so rendering is
chunk-parallel and resumable.

Stages (run in order):

```
python3 render.py slice      # cut the collage sheets into 22 panels
python3 render.py audio      # onset/beat + intensity analysis of the song
python3 render.py prep       # plates, torn-edge fragment sprites, paper/halftone/vignette/wipe textures
python3 render.py preview    # 16-frame contact sheet (preview.png)
python3 render.py render     # 5,268 frames @ 1920x1080/24fps, 24 chunks on 4 workers
python3 render.py finalize   # concat chunks + mux song audio (AAC 256k) -> No_Way_Out_Music_Video.mp4
```

## Design notes

- Scene cuts are snapped to detected audio onsets; strong beats drive a subtle
  zoom "pulse", ink-blotch hits, and the mid-song quick-cut montage.
- Transitions are animated torn-paper wipes with a pale fiber rim.
- Stop-motion feel: all layer jitter/flicker is quantized to 8 fps holds.
- Static paper scraps are constrained to the outer frame bands so they never
  cover the artist's face.
- Source plates: the two uploaded collage sheets (artist portraits, Erie/
  Pittsburgh scenes, 814 identity) plus the IMMOHRTAL logo for the outro stamp.

Inputs (song MP3, collage sheets, logo) live in the session uploads directory —
paths are set at the top of `render.py`.
