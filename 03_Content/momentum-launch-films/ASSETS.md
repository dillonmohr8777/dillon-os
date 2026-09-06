---
note_type: reference
status: active
created: 2026-09-06
updated: 2026-09-06
owner: Dillon Mohr
area: NeedMomentum brand launch
source_refs:
  - "[[12_Brain/05_Projects/2026-09-06 - NeedMomentum AI Division Launch Films]]"
  - "[[03_Content/momentum-launch-films/README]]"
  - "[[12_Brain/02_Entities/Higgsfield MCP]]"
tags: [needmomentum, brand-launch, video, assets, higgsfield, philadelphia]
---

# Launch-film asset pool — what is cleared, and what is not

**Summary:** the people-free plates cleared for the Momentum launch films, their
permanent URLs, and the single colour grade that makes them read as one campaign.
Everything containing an AI-generated person is listed too, as a do-not-use.

## Why this note exists

Dillon's constraint is verbatim: *"let's not use any pictures that we created"* —
meaning the generated likenesses of him, Sean and Mac. It is not a ban on the
Philadelphia footage; he later asked to *"pull the cities and everything that were
created today"*. This note is the line between the two, so nobody has to re-litigate
it per film.

## Cleared — use freely

Rendered 2026-09-06 in Higgsfield (Kling 3.0, 4K). All people-free or with people
only as distant, unresolvable crowd. All already sit in the Momentum blue/white/gold
palette, which is why they work without heavy correction.

| Key | What it is | Aspect | Why it earns a place |
|---|---|---|---|
| `sphere` | Dotted blue globe rotating on its axis, thin gold orbital ring counter-rotating, deep-navy field | 16:9 | Brand blue plus brand gold, already moving. Replaces the hand-built wireframe globe in film 4 outright. |
| `fw-water1` | Blue and white fireworks over the Delaware, Ben Franklin Bridge lit blue, skyline behind | 16:9 | The announcement image. Blue-and-white is literally the brand. |
| `waterfront-v` | Same scene, vertical, better reflections | 9:16 | The 9:16 cutdowns. |
| `plaza3` | City Hall at blue hour, wide, deep blue sky | 16:9 | Place, stated plainly. The best single "Philadelphia agency" frame available. |
| `aerial-lawn` | Aerial over the Parkway and the Art Museum toward the skyline, golden hour | 16:9 | The warm counterpoint to all the blue. |
| `fw-stadium` | Aerial, blue fireworks over the stadium | 16:9 | Scale and civic energy. |
| `plaza1` | Aerial, stadium at night under blue floodlight | 16:9 | Texture. |
| `k-cityhall` | City Hall, locked off, blue hour | 16:9 | Held from the earlier batch; people-free. |
| `k-parkway-aerial` | Aerial over the Parkway | 16:9 | Held from the earlier batch; people-free. |

Permanent sources are under
`https://d8j0ntlcm91z4.cloudfront.net/user_3DxdQQ56LjUMLsFAdLg2819ySpn/`, so any
sandbox can `curl` them directly — there is no need to re-render or re-upload:

```
sphere        hf_20260906_190849_1c8e175d-08c2-4e66-b3fb-6fa75755ba36.mp4
fw-water1     hf_20260906_202649_44303f49-2a0b-4992-97d6-4d03aa181441.mp4
fw-stadium    hf_20260906_202758_5a60fdc1-63f3-4ae4-9427-f24117d453d5.mp4
aerial-lawn   hf_20260906_202649_f1094f39-15ab-4aa3-b434-47646bbfa803.mp4
plaza1        hf_20260906_202759_94c78918-a2d6-422d-8e60-7964825ce538.mp4
plaza3        hf_20260906_202758_219842fa-66c2-477b-aec7-182c3964c2e8.mp4
waterfront-v  hf_20260906_200444_81a06ccb-a76d-4ac4-b5e4-f25dffcad7dd.mp4
```

## Rejected — do not use

- **`fw-water2`** — the same waterfront, but with the three generated faces
  composited into the drone show above the river. Breaks the no-generated-people
  rule and reads uncanny at any size.
- **`plaza2`** — a grand station concourse full of people. It is not Philadelphia,
  and it is not people-free.
- **`k-artmuseum`, `k-broadst`, `k-desk`, `k-monitor`, `k-parkway`, `k-schuylkill`,
  `k-studiotable`, `k-whiteboard`, `m360-brand`, `m360-service`** — all contain the
  generated likenesses.
- **`v-cafe`, `v-diner`, `v-handoff`, `v-lineup`, `v-street`, `v-truck`** and
  `bot-orange.png` — the orange robot. Superseded by Momo, who is blue and white;
  keeping an orange mascot alive would fork the brand.

## The one grade

Applied identically to every cleared plate at build time, so the set reads as one
campaign rather than a folder of stock:

```bash
GRADE="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,\
eq=contrast=1.10:saturation=1.04:gamma=0.98,\
colorbalance=rs=-0.05:bs=0.07:rm=-0.02:bm=0.04:rh=0.03:bh=-0.02,\
unsharp=5:5:0.5"
ffmpeg -i in.mp4 -vf "$GRADE" -an out.mp4
```

Pulls shadows toward brand blue, holds the highlights neutral so white fireworks
stay white rather than going cyan, and adds a little contrast and bite. Use
`gamma=1.02` instead of `0.98` on the daylight plates (`aerial-lawn`), which crush
slightly at 0.98. Verified side by side against the ungraded frames before adoption.

## Also verified today, and worth knowing

- **higgsedit vendors any Google Font**, not just a shortlist. Confirmed installing
  Instrument Serif, Sora, Geist, Space Grotesk, Manrope, Bricolage Grotesque,
  Fraunces, Newsreader, DM Sans, Outfit, Familjen Grotesk, Chivo, Anton, Syne,
  Unbounded and Gabarito. Fontshare-only faces (General Sans, Satoshi) are not
  available.
- **`<column gap={n}>` auto-flows and wraps.** A deliberately over-long line was
  allowed to wrap to four lines and it *pushed the following line down* instead of
  overlapping it. Every text collision in the first cut came from hand-picked
  absolute `y` values; columns remove the possibility. `padding` + `fill` + `radius`
  on a column gives a real card, `<row>` nests inside with its own gap, and
  `align="center"` works.
- **`higgsedit frame <dir> <seconds> --out x.png`** renders one frame in about two
  seconds. Iterate layout on frames, not on 30-second renders.
