---
note_type: project
status: active
created: 2026-09-06
updated: 2026-09-06
owner: Dillon Mohr
area: NeedMomentum brand launch
finish_line: Five approved launch films delivered as 1080p masters with editable overlays, 16:9 and 9:16, and published only after Dillon's approval
next_action: Dillon approves the staged credit budget in System/approval-queue.md and ships the Codex Guide stills into the vault or Higgsfield
review_date: 2026-09-13
source_refs:
  - "[[12_Brain/01_Captures/X/2026-09-06 - brand-launch-video-references]]"
  - "[[12_Brain/02_Entities/Higgsfield MCP]]"
  - "[[12_Brain/07_Reviews/MCP/2026-09-01 - higgsfield]]"
  - "_os/automation/lib/brand.js"
  - "_os/automation/assets/needmomentum-mark.png"
  - "System/m360-leadership-notes.md"
  - "gmail:thread:1a077c51a0b9fd4d"
  - "https://claude.ai/code/artifact/843f5b96-9596-4e1f-87cb-6b4c7c485899"
tags: [brain, project, needmomentum, brand-launch, video, higgsfield, momentum360]
---

# NeedMomentum AI Division Launch Films

**Summary:** five launch films for the NeedMomentum AI division built from the
exact NeedMomentum mark, the verified team (Dillon, Sean, Mac), the Philadelphia
plates and Mac + Sean two-shots already rendered in Higgsfield, and a motion
vocabulary pulled from the five X references. Generation is staged behind the
credit gate; assembly, names, copy and the logo stay editable in higgsedit.

Review board (visual): the "Momentum Launch Films" artifact,
https://claude.ai/code/artifact/843f5b96-9596-4e1f-87cb-6b4c7c485899 (private
until shared). Receipt: [[12_Brain/01_Captures/X/2026-09-06 - brand-launch-video-references|brand-launch video references]].

## Fixed inputs (do not reinterpret)

- **Mark.** `_os/automation/assets/needmomentum-mark.png`, the blue circle "M"
  sampled from the live favicon. It is a 192 px raster; no vector exists in any
  repo. It is composited exactly, never regenerated, never redrawn
  (Higgsfield's own brand-asset rule). A vector or 1024 px export from Mac or
  Sean is the one asset that would lift every logo moment. **Missing input.**
- **Colours.** From `_os/automation/lib/brand.js` (measured): brand blue
  `#2A80C2`, gold `#FFC63B`, ink `#111823`, deep `#101823`, light field
  `#F4F7FA`. Gold is a fill, never text on light. The blue-and-gold Guide figure
  in the Codex stills already sits on this palette. Note the momentum-brand-system
  skill's token file (`#155E86` brand, `#E27113` signal) is the Momentum 360
  design system; this launch is NeedMomentum, so blue + gold governs colour while
  the skill's dials still govern composition: variance 9, motion 8, density 4,
  and the anti-slop list (no AI purple, no neon glow, no glassmorphism, no
  gradient orbs, no three-equal-card row).
- **Type.** Archivo Black for display, Nunito Sans for everything else, Caveat
  once per film at most. Archivo Black and Caveat are built into higgsedit;
  Nunito Sans is vendored with `higgsedit fonts add`.
- **People.** Sean Boyle, Managing Partner, Momentum 360 (verified in
  `System/m360-leadership-notes.md`). Mac Frederick, leadership (no verified
  title in the vault). Dillon Mohr (account manager at Momentum 360; NeedMomentum
  title not verified). **Missing input:** the exact three titles for the
  lower-thirds. Names are never generated into pixels; they live in editable
  overlays.
- **Philadelphia.** City Hall, the Parkway, the Art Museum steps, Boathouse Row,
  Broad Street. All plates already exist (below).

## Reference verdicts (what was actually watched, ranked for this job)

Watched frame by frame: the five X clips. Read: the NBA Finals case study and
the Higgsfield academy course. Not watched: the ten illustrated references and
the case films; nothing below relies on them.

1. **Higgsfield globe intro (Blender).** Dillon's supporting reference and the
   best single idea for us: the dotted sphere with glowing arc bands, two
   orbital rings, a bold condensed title stack that reveals word by word, one
   short underline bar. We take it whole and make it the logo device: the "M"
   mark becomes a dotted sphere, one gold orbital ring, titles stack left.
2. **Tejas / "the launch video company" (HyperFrames + Remotion).** The layout
   language Dillon chose: white field, one sentence per beat, one keyword in
   brand colour, cards in a perspective grid, a stat table that rises, a tilted
   product card with a live cursor, a closing word stack. It even says "Not
   just views. Momentum." That line is ours to use.
3. **VertexCGI NBA Finals (Kling 3.0).** The production method rather than a
   visible shot list: explore in Nano Banana Pro and GPT Image 2, lock frames,
   animate with Kling 3.0, iterate at lower cost, re-render approved shots at
   1080p. Our team reveals follow the player-intro grammar: hold on the face,
   name slams in, role sits under it.
4. **milo_reed / float (HyperFrames).** The metamorphosis transition: scattered
   dots orbit, collapse into a sphere, the sphere becomes a face. Our version:
   the mark's dots scatter into a Philadelphia map, then collapse back into the
   "M".
5. **tenseidesign / folk.** A mascot carries the story inside real product UI,
   and the "tools → friend" word swap. The Guide figure does this for us in the
   AI-division film.
6. **ChatCut / Fable 5.1.** Circular iris masks over plates, one cut per
   second, serif calm. We keep only the iris as a transition between
   Philadelphia plates; the editorial serif is not our voice.

## Motion vocabulary (stolen on purpose, mapped to what higgsedit can draw)

| Move | Seen in | Ours | higgsedit primitive |
|------|---------|------|---------------------|
| Word-by-word title stack with underline bar | Globe | "NEED MOMENTUM" then "AI DIVISION", bar grows in gold | `<text motion={{by:"word"}}>` + `<rect scaleX 0→1>` |
| Keyword in brand colour inside a plain sentence | Tejas | "Not just views. **Momentum.**" | two `<text>` nodes in a `<row>`, second in `#2A80C2` |
| Cards flying in a perspective grid | Tejas | service cards (Google Ads, Meta, Local SEO, GBP, Web, Landing pages, WordPress) | `<group z>` under `camera` (2.5D), staggered offsets |
| Stat table rising row by row | Tejas | client proof rows (only verified numbers) | `<column>` with per-row `y` + `opacity` chains |
| Tilted product card with cursor | Tejas | needmomentum.com homepage capture | `<media>` in a rotated `<group>`, cursor `icon("mouse-pointer")` |
| Closing word stack | Tejas | "Ads. Search. Sites. Momentum." | one `<column>`, `motion by line` |
| Dots → sphere → face | float | dots → Philly map → "M" | `<path>` mask chain, keyframed `scale` |
| Mascot living in the UI | folk | the Guide walks through product frames | `<media>` alpha clip over UI composition |
| Iris mask cut | ChatCut | plate-to-plate transitions | ellipse `mask` keyframed radius |
| Face hold, name slam, role under | NBA | Dillon, Sean, Mac reveals | lower-third component (editable `text` params) |
| Orbital ring | Globe | one gold ring around the sphere logo | 3D Jutsu render, or `<path>` ellipse with `rotation` chain |

## The five films

Order is release order. Durations are targets; masters are 1920x1080 at 30 fps,
with a 1080x1920 version of each.

### 1. "Momentum" — hero launch film, 50 s (+ 15 s cutdown = film 5)

The huge one. Beats:

| t | Beat | Source | New generation |
|---|------|--------|----------------|
| 0-4 | Dark field. Mark dots assemble into a dotted sphere, one gold orbital ring, "NEED MOMENTUM" then "AI DIVISION" stack in Archivo Black, gold bar | globe device | 3D Jutsu turntable or Seedance 2.5 sphere plate, type native |
| 4-10 | Iris open onto City Hall dusk push-in, then Parkway aerial | plates `6a33f269`, `20288f7d` | none |
| 10-22 | Three player reveals. Dillon (new), Sean (new), Mac (new): tight 85 mm hold, slow push, name slam, role under | Nano Banana Pro still per person from Elements, Kling 3.0 pro 5 s each | 3 stills, 3 clips |
| 22-30 | "Not just views. Momentum." sentence beat; service cards fly in a 2.5D grid | native | none |
| 30-40 | The three walk toward camera on the Art Museum steps with the Guide beside them; the Guide points at a floating UI card | one hero still (Nano Banana Pro, 3 Elements + Guide reference), Kling 3.0 pro 8 s or Seedance 2.0 1080p | 1 still, 1-2 clips |
| 40-46 | Dots scatter into a Philadelphia map and collapse into the "M" | native mask chain | none |
| 46-50 | End card: exact mark, "needmomentum.com", word stack | native | none |

### 2. "Sean & Mac" — the partners' own film, 30 s

Built entirely from the eight Kling two-shots already in the library, which are
natural and consistent (wardrobe, faces and framing hold in every clip):

1. Art Museum steps walk toward camera (`8bcb3117`) with "SEAN BOYLE / MAC
   FREDERICK" name slams on the walk.
2. Broad Street dolly-in with City Hall (`c134e121`), role cards.
3. Parkway lateral dolly at blue hour (`37a0eed3`), "Not just views. Momentum."
4. Whiteboard (`2c7b4c86`) and studio table (`47acea84`) as a fast work montage
   with service words popping.
5. Schuylkill golden hour (`b1de320a`) for the close, mark and URL.

Unused: monitor (`d2471e1f`, the screen glow reads as a prop) and desk
(`960371b3`, a duplicate of the studio-table energy). New generation: zero,
unless Dillon wants a 16:9 version of the steps walk (one Kling clip, 14 credits).
The two Codex stills Dillon rejected as unnatural are not used anywhere.

### 3. "Meet the Guide" — AI division film, 35 s

The fun one, in the folk / Notion register but photographic. The Guide (the
blue-and-gold figure from the Codex stills) walks Philadelphia with the three of
them, then steps into product UI: Italian Market, doorway, café, Broad Street.
Needs the Codex stills brought into Higgsfield (see missing inputs). Each still
becomes a Kling 3.0 pro 8 s clip; UI beats are native higgsedit compositions
with the Guide cut out via `remove_background` as an alpha layer.

### 4. "What we do" — services film, 30 s, illustrated

The seven services as one continuous line-drawing scene in blue and gold
(the Capita / Kong / Diplomat register from the illustrated references), each
service icon drawn on, then the matching real deliverable cuts in for one
second: a Google Ads chart, a GBP post, a spec homepage from the site factory.
Line art loops come from Seedance 2.5 flat-vector prompts (the Puttery
windmill loop on 2026-09-04 proves the recipe) or Recraft V4.1 SVG icons drawn
on with `strokeWidth` and mask chains natively. Mostly native; two or three
generated loops.

### 5. "Fifteen" — teaser cutdown, 15 s, vertical first

Sphere logo (0-3), three face holds with names (3-9), "Not just views.
Momentum." (9-12), mark and URL (12-15). Zero new generation; all from film 1.

## How the Higgsfield MCP does this (verified surface, 2026-09-06)

The server exposes far more than the five tools the entity note lists. What this
project uses, in order:

1. **Identity, free.** `show_reference_elements action=create` for Sean from
   image job `2a588fe6-6a33-4c8d-a311-3836dfd114bd` and Mac from
   `33ea7b65-1611-4057-8da5-16b897150b0b` (front refs already in the library).
   Dillon already has two Elements. Elements work in Nano Banana Pro, GPT Image
   2, Seedream, Kling 3.0 and Seedance 2.0 via `<<<element_id>>>` in the prompt,
   several per prompt, so the three-person shots are possible. Soul training
   is not needed; it only serves one person per shot.
2. **Logo and Guide in, free.** `media_upload` the mark PNG and the Codex Guide
   stills (or `media_import_url` if Dillon drops them on a URL), `media_confirm`,
   and `remove_background` on the Guide for alpha overlays.
3. **Frames first (NBA method).** `generate_image_batch` on `nano_banana_pro`,
   2k, 16:9 and 9:16, one job per storyboard frame, `get_cost: true` preflight,
   then `jobs_wait` and one `show_generation_by_ids`. Dillon approves frames
   before any video credit is spent.
4. **Motion.** `generate_video_batch`: `kling3_0` mode `pro`, 5-8 s, `sound:
   off`, `start_image` = approved frame, optional `end_image` for A-to-B moves
   (14 credits per 8 s observed). `seedance_2_0` std 1080p with
   `image_references` for the three-person Guide shots when Kling drifts on
   identity. `hf_mult_motion_control` (Genjutsu) if a walk from the Mac + Sean
   set should be transferred onto Dillon. Stage at `std`, promote approved shots
   to `pro`.
5. **Dimensional logo.** `scene_builder_3d_create_project` plus
   `scene_builder_3d_run_python` to build the dotted sphere, gold ring and
   extruded "M" and render the turntable (the reference was made in Blender;
   this is the in-MCP equivalent). Fallback: `seedance_2_5` text-to-video of a
   dotted sphere on black in `#2A80C2` and `#FFC63B`, keyed in higgsedit with
   `threshold-key`.
6. **Assembly, editable.** `sandbox_exec` with the `video-editing` workflow:
   one `edit.jsx` per film, plates and clips on the spine with `p.cut`, every
   title, name, role, service card and the exact mark as native `compose`
   nodes, iris and dot masks as keyframed masks, 2.5D camera for the card grid,
   `higgsedit fonts add Nunito\ Sans`, `render --engine node`. `fable_editor`
   returns an editor link so Dillon can change names and copy without a
   re-render from us. Vertical versions are a second project at 1080x1920 (or
   `reframe` for pure footage).
7. **Finish.** `upscale_video` for a 4K hero if wanted, `generate_audio` for a
   music bed and VO only if Dillon wants sound, the `subtitles` workflow for
   burned captions. `virality_predictor` on the teaser before posting is cheap
   and honest.
8. **Never inside the MCP:** publishing. `tiktok_publish` and every external
   send stays behind `System/approval-queue.md`.

From the Windows box the same server is added with
`claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp`
then `/mcp` to log in; in this remote session it is already connected.

## Credit budget (staged, from observed unit costs)

| Stage | What | Est. credits |
|-------|------|--------------|
| A | 30-40 Nano Banana Pro frames at 2k, 2-3 candidates per shot | 120 |
| B | 14 Kling 3.0 clips at `std` for the animatic (films 1, 3, 4) | 100-140 |
| C | Promote 10 approved shots to `pro` 1080p, 2 Seedance 2.0 three-person shots | 140-220 |
| D | 3D logo turntable or sphere plate, 3 flat-vector loops | 60-120 |
| E | Upscales, audio, contingency | 150 |
| | **Cap requested** | **700** |

Balance on 2026-09-06: 3,640 credits on the `max` plan. Films 2 and 5 cost
nothing new. Nothing is generated until the queue line is approved.

## Missing inputs

1. The Codex Guide stills and their JSON specs (`codex-stills-A01-v3.json`,
   `D05-v2`, `D06-v2`) from DESKTOP-4AHKEC4, plus which two are rejected.
   Commit them under `03_Content/Brand Launch/stills/` or upload to Higgsfield.
2. A vector or 1024 px NeedMomentum mark.
3. Exact titles for Dillon, Sean and Mac.
4. Three or four verified proof numbers for the stat beat (or the beat is cut).
5. A homepage capture of needmomentum.com once its brand direction is
   confirmed (open loop since 2026-07-30, Jenny's Slack ask).
6. Music: licensed track or a `generate_audio` bed; silent masters otherwise.

## Decisions taken here

- Sean and Mac get film 2 from the existing Kling set; the rejected Codex
  two-shots are dropped, not fixed.
- Real people are never generated from text descriptions again (the 09-05
  office-comedy set used caricature prompts); every person shot starts from an
  Element or an approved frame.
- Names, roles, copy and the logo are overlays, not pixels.
- Frames before motion, `std` before `pro`, 720p iteration is not needed
  because Kling `pro` already lands at 1080p for 14 credits.

## Links

- [[12_Brain/02_Entities/Higgsfield MCP|Higgsfield MCP]]
- [[12_Brain/02_Entities/Momentum 360|Momentum 360]]
- [[12_Brain/01_Captures/X/2026-09-06 - brand-launch-video-references|Reference receipt]]
- [[System/approval-queue|Approval queue]]
