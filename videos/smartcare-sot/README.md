# SmartCare - Stabilize · Optimize · Thrive (animated video)

An animated, self-playing video built from the five SmartCare slides
(Support → Stabilize → Optimize → Thrive → the "Stabilize. Optimize. Thrive."
summary) plus an Align HCM sign-off. Dark brand theme, 1920×1080, loops.

## View it

- **`SmartCare-SOT.mp4`** - the rendered video (H.264, 1920×1080, 30fps, ~53s).
  This is the shareable deliverable: post it to LinkedIn, drop it in email, etc.
  Rendered frame-by-frame from the animation below, with the real fonts baked in.
- **`SmartCare-SOT-Standalone.html`** - double-click to open in any browser.
  Everything (styles, animation code, logos) is embedded in this one file, so
  it works on its own with no other files needed. Best for sharing / screen
  recording. *(Fonts load from Google Fonts, so use an online browser for the
  exact typeface; offline it falls back to a system serif/sans.)*
- **`SmartCare-SOT.html`** - the same video, but loading the CSS / JS / logo
  files alongside it. Use this one when editing.

Playback controls: click ▶/❚❚, drag the scrubber, Space = play/pause,
← / → step a second, `0` restarts.

## Motion parameters (per the brief)

- **Motion-swipe transitions** - a bright branded seam wipes between every scene.
- **Disappearing-ink exits** - the outgoing scene dissolves through an SVG
  turbulence/displacement "ink bleed" as the swipe passes.
- **3D pop-ins** - cards, checklists, icons and the summary flow cards pop in on
  a real perspective (rotateX/Y + depth), using per-element `transformPerspective`.
- **Beautiful Align ending** - the final scene resolves to the SmartCare heart,
  the "Stabilize. Optimize. Thrive." signature, and the Align HCM lockup.
- **Clean overlays** - persistent chrome (Align logo, `ALIGNHCM.COM`, progress
  pips) is positioned clear of all scene content and fades out on the ending.

## Files

| File | Purpose |
| --- | --- |
| `SmartCare-SOT.mp4` | Rendered H.264 video - the shareable deliverable |
| `SmartCare-SOT.html` | Player (references the files below) |
| `SmartCare-SOT-Standalone.html` | Single-file, fully self-contained build |
| `smartcare-sot.css` | Dark theme + all scene styling |
| `smartcare-sot-scenes.js` | The six scenes (GSAP timelines) |
| `gsap.min.js` | GSAP 3.12.5 (animation engine) |
| `assets/` | Align + SmartCare logo art |

## Editing

Edit `smartcare-sot-scenes.js` (scene content/timing) and `smartcare-sot.css`
(look), then re-open `SmartCare-SOT.html`. Each scene is one function returning
a GSAP timeline; `SCENE_DUR` in `SmartCare-SOT.html` sets seconds-per-scene.
Regenerate the standalone by re-inlining the CSS/JS/`gsap.min.js` and encoding
the `assets/` PNGs as `data:` URIs.
