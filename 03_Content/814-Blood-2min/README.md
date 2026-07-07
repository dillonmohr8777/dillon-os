# 814 Blood ft. King Keev — 2:00 Music Video (814 x 412)

Two-minute 1920x1080/24fps music video for **"814 Blood" ft. King Keev**, built in the living
paper-collage language of the original No-Way-Out render (the stylistic
reference) — torn newsprint, halftone dots, xerox grain, stop-motion
jitter — upgraded with an **electric-blue / golden-yellow energy system**:
duotone grades (blue = Erie / 814, gold = Pittsburgh / 412), corner light
leaks, beat-driven streak slashes, spark particles, and colored torn rims.

## Structure (beat-synced, cuts snapped to detected onsets)

| Time | Section |
|------|---------|
| 0:00–0:15 | Intro — torn-window reveal, flickering headlines, face reveals |
| 0:15–0:35 | Build 1 — Erie blue block into Pittsburgh gold block, 3-frame flash cuts on strong beats |
| 0:35–0:55 | Performance — duo shots, whip-pan transitions, pulse zooms |
| 0:55–1:15 | Chaos collage — multi-panel moving storyboard, word overlays (814 BLOOD / ERIE / PITTSBURGH / 814 X 412 / NO HANDOUTS / BUILT NOT GIVEN) on strong beats |
| 1:15–1:40 | Bigger world — cities collide on an animated torn seam, lightning streaks, flying paper |
| 1:40–1:55 | Hero — blue/gold smoke portraits, split-screen face and hoodie closeups |
| 1:55–2:00 | End poster — duo centre, 814 brick left / 412 gold right, 814 BLOOD title, IMMOHRTAL ink stamp |

## How it works

`render.py` is a self-contained pipeline (Python + Pillow + numpy +
`imageio-ffmpeg`). Every frame is a pure function of its index, so rendering is
chunk-parallel and resumable.

```
python3 render.py slice      # cut the two collage sheets + duo portrait into 32 panels
python3 render.py audio      # onset/beat + intensity analysis of the first 120 s
python3 render.py prep       # plates, torn fragments, word sprites, leaks/streaks/smoke textures
python3 render.py preview    # 28-frame contact sheet (preview.png)
python3 render.py render     # 2,880 frames @ 1920x1080/24fps, 16 chunks on 4 workers
python3 render.py finalize   # concat + mux song audio (AAC 256k, 3 s tail fade) -> MP4
```

Inputs (song MP3, two collage sheets, studio duo photo, IMMOHRTAL logo) live in
the session uploads directory — paths at the top of `render.py`. Faces are
never synthesized: every artist appearance is a crop of the uploaded
reference images, and static paper scraps are constrained to outer frame bands
so they never cover a face. Hoodie numbers stay correct throughout:
814 = red-haired artist (Erie), 412 = dark-haired artist (Pittsburgh).
