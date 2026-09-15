---
note_type: reference
status: active
created: 2026-09-06
updated: 2026-09-06
owner: Dillon Mohr
area: NeedMomentum brand launch
source_refs:
  - "[[12_Brain/05_Projects/2026-09-06 - NeedMomentum AI Division Launch Films]]"
  - "[[12_Brain/01_Captures/X/2026-09-06 - brand-launch-video-references]]"
  - "_os/automation/lib/brand.js"
  - "_os/automation/assets/needmomentum-mark-2048.png"
tags: [needmomentum, brand-launch, video, higgsedit, source]
---

# Momentum launch films — higgsedit sources

**Summary:** six 1080p launch films, each a Momentum-branded recreation of one X
reference. Every frame is drawn from vector primitives and the traced Momentum
mark, so nothing here costs Higgsfield credits and every word stays editable.

## The six

| File | Film | Recreates | Length |
|---|---|---|---|
| `01-chatgpt-ads.jsx` | Momentum for ChatGPT Ads | Motion `@motion_so` "Astra" | 26.0 s |
| `02-meet-momo.jsx` | Meet Momo | `folk` mascot / iMessage spot | 29.0 s |
| `03-answer-engine.jsx` | They started asking | `float` (HyperFrames recreation) | 27.8 s |
| `04-everywhere-they-ask.jsx` | Everywhere they ask | Higgsfield GPT-6 ASTRA globe | 26.2 s |
| `05-ads-compound.jsx` | Great ads compound | Atomik "the launch video company" | 29.0 s |
| `06-same-market.jsx` | Same market. Different answer. | ChatCut / Fable 5.1 split plates | 23.2 s |

## Momo

The Momentum bot is pure vector, defined by the `momo()` helper in films 2 and 3:
a blue `#2A80C2` squircle body, two white capsule eyes, a gold `#FFC63B` antenna
dot on a blue stem. It lives inside one `<group>` so a pop, bob or tilt moves the
whole character. `blink(t...)` drives the eyes with a `scaleY` snap. Scale it with
the `s` argument; every dimension derives from it.

## How to rebuild

Runs in the Higgsfield cloud sandbox (`sandbox_exec`), which ships `higgsedit`:

```bash
mkdir -p film/src && cd film
# the mark, traced from the 192 px favicon and rendered at 2048 px
cp _os/automation/assets/needmomentum-mark-2048.png src/mm.png
cp _os/automation/assets/needmomentum-mark-white-2048.png src/mm-white.png
# third-party marks, exact paths from simple-icons, rasterised in the brand colour
for p in openai perplexity googlegemini google claude; do
  curl -sS "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/$p.svg" \
    | sed 's|<svg |<svg fill="#141A21" |' > /tmp/$p.svg
  convert -background none -density 1200 /tmp/$p.svg -resize 256x256 \
    -colorspace sRGB PNG32:src/$p.png
done
higgsedit init proj --size 1920x1080 --fps 30
higgsedit fonts add proj "Nunito Sans" "Nunito Sans:600" "Nunito Sans:700" \
  "Nunito Sans:800" "Archivo Black"
higgsedit build edit.jsx
```

## higgsedit rules these files were written against

Learned the hard way; each one cost a build.

1. `p.render()` takes the out path as its **first argument**:
   `p.render("renders/x.mp4", {quality:"final"})`. Passing an options object
   throws `out.endsWith is not a function`.
2. Fonts must be vendored into the project **before** the render, one face per
   weight: `higgsedit fonts add proj "Nunito Sans:700"`. A missing face fails the
   render rather than silently substituting.
3. Every `animate` value is an **array** of tracks.
4. Animatable properties are exactly: `positionX positionY offsetX offsetY scale
   scaleX scaleY rotation skewX skewY opacity color blur volume effectParam width
   height strokeWidth radius radiusTL radiusTR radiusBR radiusBL
   gradientStopOffset gradientStopColor gradientStopOpacity textProgress maskX
   maskY maskWidth maskHeight morphProgress`. It is `rotation`, not `rotate`.
5. `d` attributes **cannot contain arc (`A`) commands**. Circles and ellipses have
   to be cubic beziers — see `ellipsePath()` in `04-everywhere-they-ask.jsx`.
6. `<rect fill={null}>` renders **white**, not transparent. Draw a ring as a
   larger filled disc with the plate disc on top of it.
7. `scale` and `rotation` pivot on each node's own centre, so a character made of
   several rects must live inside a `<group>` or it comes apart.
8. Keyframe times are relative to the node's start, and a node's start defaults to
   the start of the `p.compose()` beat it sits in. Setting a node's own `at` makes
   it absolute on the timeline.
9. `<text>` must contain words; a `<column>`/`<row>` must not take `shadow`.

## Before any of this is published

Every figure on screen is illustrative: the `$60`/`$41` cost-per-lead exchange in
film 2, the ranked roofer list in film 3, the coverage board in film 4, the
progress bars in film 5, and the cited firm in film 6. They are dramatisations of
an interface, not measured Momentum results. Swap them for real numbers or cut the
frames before anything runs as an ad. Publishing stays gated on Dillon.
