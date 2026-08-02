# Align Academy: "Align in Motion"

45s brand film for Align Academy™ (the Training service on alignhcm.com), built to sit
alongside the existing *Align in Motion* and *Align Industry Solutions* films.

**Output:** `videos/align-academy-in-motion.mp4` at 1920×1080, 30fps, 1350 frames, exactly 45.000s, silent (both reference films are silent too).

## Brief it answers

| Requirement | How it's met |
| --- | --- |
| Particles, like the first film | Logo assembles from ~5,200 vertices sampled off the exact brand artwork. Every headline word also settles out of drifting vertices |
| Vertex shuffling for the Academy benefits/services | Two shuffle-stack scenes (`WHO WE TRAIN`, `WHAT'S INSIDE`) where the centre row is sharp and lit, neighbours fade back and blur, and the list glides between rows. Heading only, no support copy, matching the original film's list treatment |
| Placement from the second film | Centre-focus card carousel (`HOW WE DELIVER`) and the orbiting node constellation (`WHY IT MATTERS`) |
| Cool swipe transitions | Diagonal shear wipes with a hot leading edge, spark spray blown off the edge, parallax push on the outgoing frame and a chromatic fringe on the incoming one |
| Icons only | Every marker is a stroked icon that draws itself on. Position indicators are ticks and dots |
| No numbers | There is not a single numeral in the film, verified against all copy, kickers, chrome and rails |
| No em dashes | Verified: zero em dashes (U+2014) or en dashes (U+2013) in rendered copy or source |
| Logo at beginning and end only | Particle logo runs 0.0 to 4.4s and 41.7 to 45.0s. Nowhere else |
| Cooler effects than usual | Bloom pass, anamorphic streak on logo formation, soft pressure-wave shockwave (no hard rings), drifting node mesh, aurora lobes, ambient god-ray haze, specular sheen sweep across headlines, film grain, vignette |

## Timeline

| Frames | Time | Scene |
| --- | --- | --- |
| 0 to 132 | 0.0 to 4.4s | Particle logo assembles, holds, bursts |
| 132 to 282 | 4.4 to 9.4s | Statement: *"A system either transforms your operations. Or it gathers dust."* |
| 282 to 500 | 9.4 to 16.7s | `WHO WE TRAIN`: Administrators, Managers, Employees |
| 500 to 748 | 16.7 to 24.9s | `HOW WE DELIVER`: workshops, virtual, e-learning, reinforcement |
| 748 to 968 | 24.9 to 32.3s | `WHAT'S INSIDE`: role-based design, learning paths, practice environments, post-launch |
| 968 to 1148 | 32.3 to 38.3s | `WHY IT MATTERS`: outcome constellation |
| 1148 to 1252 | 38.3 to 41.7s | Closing: *"Empower your team to maximize your HCM investment."* |
| 1252 to 1350 | 41.7 to 45.0s | Particle logo reassembles, plus alignhcm.com |

Copy is drawn from `alignhcm.com/services/training`.

## Rendering

`renderFrame(n)` is pure. Every particle position derives from the frame index plus
pre-baked seeded random tables, nothing accumulates. Any frame can be re-rendered in
isolation and will match a full pass byte-for-byte.

```bash
npm install playwright
python3 -m http.server 8791 --bind 127.0.0.1 --directory .   # file:// blocks fetch(), so serve it
CHROME_PATH=/path/to/chrome OUT_DIR=./frames node render.js   # add FROM/TO or ONLY=1,2,3 for subsets

ffmpeg -framerate 30 -i frames/f%05d.png \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -profile:v high -level 4.2 -movflags +faststart \
  align-academy-in-motion.mp4
```

Roughly 1.3s per frame single-threaded. Run 2 to 4 workers over disjoint `FROM`/`TO` ranges.

## Files

- `film.js`: palette, easing, background, particle systems, scenes, wipes, post
- `icons.js`: stroke icon paths (24-unit box, drawn on via `setLineDash`)
- `film.html`: canvas shell and `@font-face` declarations
- `render.js`: Playwright frame driver
- `assets/logo_full.png`: the complete brand lockup, recoloured for dark ground. Only the dark-grey ink is mapped to white. The brand orange is preserved verbatim and the tagline is the real artwork, never re-typeset
- `assets/logo_points.json`: particle targets sampled from that exact bitmap and normalised against the full lockup box, so vertices land dead on the art when the crisp logo crossfades in

## Dropping in supplied stills

The carousel's icon plate is the placeholder for the imagery referenced in the brief.
In `sceneDelivery`, the plate is drawn at centre `(x, ipy)` with side `plate = w * 0.40`.
Swap that block for a clipped `drawImage` and keep the icon as the fallback. The
surrounding card, focus scaling, blur and rail all continue to work unchanged.

## House style

* No em dashes in copy, comments, or docs. Use a colon, a comma, or a full stop instead.
* The logo is always the real artwork. Never redraw it, never re-typeset the
  `HUMAN CAPITAL MANAGEMENT` tagline, and never substitute a lookalike font. The
  tagline is justified to the full logo width and has its own letterforms, so any
  re-typesetting is visibly wrong.
