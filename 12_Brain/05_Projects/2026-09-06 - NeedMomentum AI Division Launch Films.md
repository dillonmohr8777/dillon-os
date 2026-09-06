---
note_type: project
status: active
created: 2026-09-06
updated: 2026-09-06
owner: Dillon Mohr
area: NeedMomentum brand launch
finish_line: Six approved launch films delivered as 1080p masters with editable overlays, 16:9 and 9:16, published only after Dillon's approval
next_action: Dillon reviews the six recreations; then swap or cut every illustrative figure, and derive the 9:16 and 15 s cutdowns
review_date: 2026-09-13
source_refs:
  - "[[12_Brain/01_Captures/X/2026-09-06 - brand-launch-video-references]]"
  - "[[12_Brain/01_Captures/X/2026-09-06 - motion-astra-launch-video-reference]]"
  - "[[03_Content/momentum-launch-films/README]]"
  - "[[12_Brain/02_Entities/Higgsfield MCP]]"
  - "[[12_Brain/07_Reviews/MCP/2026-09-01 - higgsfield]]"
  - "_os/automation/lib/brand.js"
  - "_os/automation/assets/needmomentum-mark.png"
  - "_os/automation/assets/needmomentum-mark-2048.png"
  - "System/m360-leadership-notes.md"
  - "gmail:thread:1a077c51a0b9fd4d"
  - "gmail:thread:1a077fa7dcc4b71a"
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
5. Reading Terminal walk and the arcade walk (Mac-and-Sean-06 and 03, two new
   Kling clips) for the close, mark and URL.

Unused: monitor (`d2471e1f`), desk (`960371b3`) and Schuylkill (`b1de320a`);
see Selected stills below for why. New generation: zero,
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

## Selected stills (2026-09-06, from the 32 Codex images on Drive)

Source: Dillon's email "Your images with Mac and Sean, plus solo images" (gmail
thread 1a077fa7dcc4b71a), Drive folder `1h79yzkgkr_7Nwe19dI6nkJK1jQfRnc3D`. All
32 were downloaded and reviewed at full resolution, faces cropped and compared
against the real references (Dillon studio portrait `765eb5fe`, Sean front
`2a588fe6`, Mac front `33ea7b65`).

**Tier 1, animate first**

| Still | Drive id | Use |
|-------|----------|-----|
| Dillon-and-team-D01 | `1mVT0pJePfQau_ilxJY3urnbaxiRp8qv8` | Dillon player reveal, City Hall behind |
| Dillon-and-team-D08 | `1E88aXh22Me8kgfkuPDOn1I4-1ggITZTD` | Dillon second reveal / teaser, brick and warm light |
| Dillon-and-team-D05 | `194GptLEBWVW2XE0By-3WdwxMGMe-p_Vq` | Team hero frame, Parkway with City Hall |
| Mac-and-Sean-10 | `19dMISoluGqNwxRqP9pbC506xDQ6kOpIv` | Sean & Mac hero, Art Museum steps (Kling clip `8bcb3117` exists) |
| Mac-and-Sean-06 | `1aBem9E5MQ4bjgs1Z9hv1sPA6UK5oUaAu` | Reading Terminal walk, best energy in the set |
| Mac-and-Sean-03 | `1medNndYF6NNksxOi_akRZ7XW4j3fQkAm` | Arcade walk, the one candid frame |
| Dillon-and-team-D06 | `1BD49tWU6PFyKZXZUgiXHv6FCtfoTEd4h` | Dillon + Sean, Reading Terminal |

**Tier 2, montage**

| Still | Drive id | Note |
|-------|----------|------|
| Mac-and-Sean-09 | `1-iazgD6RqVO9yvvDLjytdPcTXz-7DEIv` | Whiteboard, clip `2c7b4c86` exists |
| Mac-and-Sean-11 | `1-CCOtPIkhFFfEYYeMD7QIH7O37BDJpRS` | Studio table, clip `47acea84` exists |
| Mac-and-Sean-01 | `1D6IdcsIWxocm2K2MlOzXmUeMuE_g9MbO` | City Hall day, clip `c134e121` exists |
| Mac-and-Sean-15 | `1TA4JKuHL4hhwKcsflz44KrqqDqAlGCFf` | City Hall night, clip `37a0eed3` exists; Sean flat |
| Mac-and-Sean-14 | `1JnsgSwxrNs9NmfzY04EENgAKYUSnkgYx` | Office, magazines |
| Dillon-and-team-D02 | `1lPQraFGBRk_BMIbfygREosNqH8nhazWI` | Dillon café, laptop |
| dillon-portrait-three-quarter-v02 | `1v2z0zasVE-aAMXtX77v74vsKxjK58oC0` | Studio, alternate reveal card |

**Higgsfield media ids (uploaded 2026-09-06 ~18:40Z, no credits spent).** Dillon-and-team-D01 `e08e617d`; Dillon-and-team-D08 `9d35c51f`; Dillon-and-team-D05 `ce75cc98`; Dillon-and-team-D06 `b3feb1ea`; Dillon-and-team-D02 `7a951406`; Mac-and-Sean-03 `3917257c`; Mac-and-Sean-06 `6441066a`; Mac-and-Sean-14 `3c378720`; dillon-portrait-three-quarter-v02 `c4ab9274`. Mac-and-Sean-10, 09, 11, 01 and 15 were already in the library as the Kling start images (`d9c7779a`, `9ac637fc`, `67130282`, `3cb2e964`, `469ac3c5`).

**Cut (11 of the 26 scene stills)**

- D03, D04: Dillon's likeness is the weakest of the set (rounder, younger);
  D04 catches him mid-gesture with an open mouth and Sean's hand is wrong.
- D07: Dillon is not in it and both faces are too small to hold a reveal.
- Mac-and-Sean-02: Mac's expression is off leaning over the laptop.
- Mac-and-Sean-04: both faces off, Mac squinting, Sean stiff (the desk Kling
  clip `960371b3` came from this frame; dropped).
- Mac-and-Sean-05: Sean's face is wrong, flat backlight (the Schuylkill Kling
  clip `b1de320a` came from this frame; dropped from film 2).
- Mac-and-Sean-07: Sean's open-arm gesture and face are distorted.
- Mac-and-Sean-08: Sean looking down, unnatural (monitor clip `d2471e1f`; dropped).
- Mac-and-Sean-12: camera-and-bottles props read as a different business;
  Sean's hand is wrong.
- Mac-and-Sean-13: Sean's blank stare, cluttered board.
- All six "Earlier" versions are superseded by their D-number finals;
  `dillon-front-v01` and `dillon-full-body-front-v02` are identity references,
  not shots.

**Two systemic notes**

1. Sean is clean-shaven in all 32 images; his real front reference has a
   trimmed beard. If that reference is current, every Sean shot needs a
   regeneration pass from a bearded Element before film 2 locks. Dillon decides.
2. Mac is consistent across the whole set. Dillon reads truest in D01, D08,
   D05 and D06.

**Film 2 revision.** The Schuylkill close is replaced by Mac-and-Sean-06 and
Mac-and-Sean-03, which need two new Kling 3.0 pro clips (about 28 credits).
Everything else in film 2 still comes from clips that already exist.

## Style bible (per film: look, type, movement, swipes, tool)

Every film uses the same five transitions and nothing else, so the set reads
as one family. Dissolves are allowed only on type, never on footage.

| Swipe | Taken from | What it looks like |
|-------|-----------|--------------------|
| Iris | ChatCut / Fable 5.1 | a circle opens or closes over the frame, one cut per beat |
| Screen slide | folk | the whole frame slides up or sideways like a phone screen |
| Grid pan | Tejas | a plane of cards in perspective pans past camera |
| Metamorphosis | float | dots orbit, collapse into a sphere, the sphere becomes the mark |
| Hard cut on beat | NBA / ChatCut | no transition, cut lands on the music hit |

Type is fixed across all five: Archivo Black, caps, tight, for names and
title stacks (the globe reference's condensed caps, in our face); Nunito Sans,
sentence case, for every sentence beat and role line (the Tejas / float
grotesk register, and its rounded terminals nod to folk); Caveat once per
film at most, as a handwritten note or arrow (the Guide film only). Keyword
colour inside a sentence is always brand blue `#2A80C2`; bars, rings and
slams are gold `#FFC63B`.

Entrances follow one rule: words rise 28 px and fade in on an expo-out curve,
word by word for stacks (globe), line by line for sentences (Tejas); objects
pop with a 1.06 overshoot (Tejas icons, folk bubbles); nothing slides in from
off-screen except lower-thirds, which slam up from a mask (NBA).

### Film 1 "Momentum" — broadcast launch film, 50 s, 16:9 master + 9:16

- **Look:** photographic Philadelphia footage cut against two graphic fields,
  deep `#101823` for the logo device and end card, paper `#F4F7FA` for the
  sentence beats. Sections alternate dark / footage / white so no two
  neighbours share a skeleton.
- **Movement, in order:** dots assemble into the rotating dotted sphere and a
  gold ring draws around it (globe + float); "NEED MOMENTUM / AI DIVISION"
  stacks word by word with the gold bar; iris opens onto the City Hall
  push-in, iris again to the Parkway aerial; three player reveals on a slow
  Kling push with name slams and roles; white field, "Not just views.
  Momentum." with the keyword swap, then seven service cards fly onto a
  perspective plane and grid-pan left; the three on the Art Museum steps with
  the Guide, a UI card pops beside the Guide and its content slides (folk);
  the mark's dots scatter into a Philadelphia map and collapse back into the
  M (float); end card, mark overshoots in, URL, closing word stack "Ads.
  Search. Sites. Momentum." (Tejas).
- **Pace:** 2 s per graphic beat, 4 s per reveal, one 10 s hero shot. Music
  bed, no voice.
- **Tools:** Higgsfield for every frame and clip (Nano Banana Pro frames,
  Kling 3.0 pro motion, Seedance 2.0 for the three-person shot), 3D Jutsu for
  the sphere turntable, higgsedit for all type, masks, the 2.5D card plane and
  the render. Vertical is a second higgsedit project at 1080x1920.

### Film 2 "Sean & Mac" — founders walk-and-talk, 30 s, 9:16 first

- **Look:** pure footage, the six Kling two-shots, colour-graded to one
  warm-blue Philadelphia. No graphic fields except the last three seconds.
- **Movement:** open on the Art Museum steps walk; names slam up from a mask
  as they walk (NBA); screen-slide up into Broad Street, roles slam; hard
  cuts on beat through whiteboard and studio table with service words popping
  one at a time (Tejas icon pops); screen-slide into the Parkway lateral for
  "Not just views. Momentum."; Reading Terminal walk to close; iris closes to
  the mark and URL.
- **Pace:** 4 to 5 s per clip, cuts on the downbeat. Music bed.
- **Tools:** existing Kling clips plus two new ones (Mac-and-Sean-06 and 03),
  higgsedit for slams, slides, iris and render. HyperFrames on the Windows box
  is an equal option for the lower-third if Dillon wants it as a reusable
  GSAP component.

### Film 3 "Meet the Guide" — mascot in the world, 35 s, 16:9

- **Look:** folk's grammar on photographic plates: the blue-and-gold Guide
  walks real Philadelphia, and product UI lives in the air beside them as
  white rounded cards with soft shadow, never glass.
- **Movement:** Guide walks in from the Italian Market still (Kling from the
  Codex frame); a chat bubble pops beside the Guide with a spring; typed text
  with a caret and a reply (float); word swap "Most AI is a tool." to "The
  Guide is a teammate." with the second word scrambling into place (folk);
  camera zooms into a floating card until it fills the frame, which becomes
  the next scene (folk's phone zoom); screen slides between doorway, café and
  Broad Street; one handwritten Caveat arrow points at the Guide; iris to the
  mark.
- **Pace:** slower, 3 s per beat, room for the character to move.
- **Tools:** Higgsfield for Guide clips (Kling from the Codex stills) and
  `remove_background` for the alpha layer; higgsedit for the UI cards, typing,
  zooms and slides. HyperFrames is the alternative for the UI compositions.
- **Copy is placeholder** until Dillon writes it; every line is an editable
  overlay.

### Film 4 "What we do" — continuous line-drawing explainer, 30 s, 16:9 + 1:1

- **Look:** paper-white field, one continuous brand-blue line with gold
  fills, the Capita / Kong / Diplomat register from the illustrated
  references. Nunito Sans sentence beats with the service name in blue.
- **Movement:** the line draws each service icon on (stroke reveal), then
  redraws itself into the next icon without a cut (Capita's continuous
  transitions): search bar to map pin to storefront to browser window to
  landing page to WordPress mark; after each icon the real deliverable cuts in
  for one second inside an iris (a Google Ads chart, a GBP post, a spec
  homepage from the site factory); the final icon becomes the mark.
- **Pace:** 4 s per service, seven services, 2 s close.
- **Tools:** HyperFrames (GSAP, SVG stroke and morph) is the primary tool for
  this film, run from the Windows box with the local skill; it is exactly what
  the references were built in. higgsedit path masks are the fallback if it
  stays in the cloud. Two or three Seedance 2.5 flat-vector loops only where a
  scene is too rich to draw by hand. Remotion is not needed.

### Film 5 "Fifteen" — teaser, 15 s, 9:16

- **Look and movement:** the sphere logo device (3 s); three face holds with
  name slams, hard cuts on beat (6 s); "Not just views. Momentum." on paper
  (3 s); mark and URL (3 s). One iris, otherwise cuts.
- **Tools:** cut from film 1 assets in higgsedit, reframed to vertical.

### Tool split, in one line each

- **Higgsfield:** every photographic frame and clip, the 3D logo, the Guide
  alpha, assembly and render for films 1, 2, 3 and 5, upscale, music bed.
- **HeyGen HyperFrames:** film 4 in full, and any typography or UI beat
  Dillon would rather own as GSAP code on his box. Its cloud compose tool is
  disabled for CLI agents, so it runs locally, not from this session.
- **Remotion:** not used. HyperFrames covers the same ground and matches the
  references' own toolchain.

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

## Production log

### Stage A, 2026-09-06 18:55Z to 19:03Z (approved cap 700; spent 45.0; balance 3,594.95)

Elements created (free): `b4ecb258-34a4-4eea-bdef-2be9a43223f3` Sean-Boyle-launch
(cropped from Mac-and-Sean-10, clean-shaven to match the footage),
`726804d5-ac2f-4c83-b33d-414348b0a78c` Mac-Frederick-launch (cropped from D05).
Dillon uses the existing `967e2123-51ac-431f-9717-2219e9631aeb` Dillon-Mohr.

| # | Job | What | Credits | Verdict |
|---|-----|------|---------|---------|
| 1 | `ff6bd784` | Dillon reveal, Broad St golden, right third, from D01 reference | 2 | keep |
| 2 | `80a5be2f` | Dillon reveal, Broad St golden, left third | 2 | keep |
| 3 | `7811c83b` | Dillon reveal, Parkway blue hour, centered | 2 | keep |
| 4 | `f18514a6` | Sphere plate, one gold ring and arc band | 2 | keep, animated below |
| 5 | `52fea0b8` | Sphere plate, two rings, latitude rows | 2 | keep as alt |
| 6 | `02f97c7d` | Sean reveal, Art Museum steps, right third | 2 | keep |
| 7 | `661c9229` | Sean reveal, Broad St golden, left third | 2 | keep, best Sean |
| 8 | `1d4601c1` | Sean tight, Reading Terminal | 2 | usable, stare is hard |
| 9 | `3594d031` | Mac reveal, Art Museum steps, left third | 2 | keep |
| 10 | `2fd04bbb` | Mac reveal, Parkway blue hour, right third | 2 | keep |
| 11 | `bf856604` | Mac tight, Boathouse Row golden | 2 | keep, best Mac |
| 12 | `9a97345c` | Trio walking up the Art Museum steps | 2 | keep, faces small |
| 13 | `d8efac08` | Trio on the Parkway | 2 | reject, two Dillons, no Mac |
| 14 | `65e5fd01` | Trio on the Parkway, retry with explicit order | 2 | keep, hero frame candidate |
| 15 | `3cb6473c` | Kling 3.0 std 5 s 9:16 push-in on D01 | 7.5 | keep, blink and hair natural |
| 16 | `59f88fb4` | Kling 3.0 std 5 s 16:9 on sphere plate 4 | 7.5 | keep, ring orbits and arc travels |

Lesson: with three Elements in one prompt, name the order and the wardrobe
explicitly and pass the approved group still as the reference, or the model
duplicates the strongest identity. Kling standard from a still animates the
logo plate convincingly at 7.5 credits, so the 3D Jutsu turntable is now
optional rather than required.

Waiting on Dillon: pick one reveal frame each (Dillon 1/2/3, Sean 6/7/8, Mac
9/10/11), sphere 4 or 5, and confirm trio 14 as the film 1 hero frame. Stage
B (standard-mode animatic clips) starts on those picks.

### Stage B + C, 2026-09-06 18:55Z to 19:40Z (spent 305 of the approved 700; balance 3,334.95)

Dillon approved 700 in session ("700 first go"), then asked for finished videos
rather than another approval round. Picks were made on his behalf and recorded
here: Dillon reveal 3 (Parkway blue hour), Sean 7 (Broad St golden), Mac 11
(Boathouse Row golden), sphere plate 4 (one ring), trio retry 14 as the hero frame.

**Eight Kling 3.0 pro clips, 8 s, 1080p, silent (14 credits each, 112 total)**

| Job | Shot | Aspect |
|-----|------|--------|
| `9b5ec4f4` | Dillon push-in, Parkway blue hour | 16:9 |
| `f2de6f73` | Sean push-in, Broad St golden | 16:9 |
| `23af0a6d` | Mac push-in, Boathouse Row golden | 16:9 |
| `f12eeae8` | Trio dolly-in, Parkway with City Hall | 16:9 |
| `f167265d` | Trio walking up the Art Museum steps | 16:9 |
| `1c8e175d` | Sphere logo device, ring orbit | 16:9 |
| `3ff8a465` | Mac + Sean, Reading Terminal walk | 9:16 |
| `bfac732a` | Mac + Sean, arcade walk | 9:16 |

**The bot films.** Dillon supplied the orange blocky agent mascot plus two
Momentum headshots mid-session and asked for "videos of this bot / us giving
agents to business people". Ten Nano Banana Pro frames (20 credits, one 503 and
four re-runs because the first pass omitted the bot as an image reference), then
six Kling 3.0 pro 8 s clips (84 credits):

| Job | Scene |
|-----|-------|
| `70ae41d1` | Dillon hands the bot to a shop owner, she takes its weight |
| `16b8e292` | Dillon and a restaurant owner, bot turns between them |
| `bd7bc962` | Bot walks a diner counter toward a laughing owner |
| `b4dfdbd4` | Bot rides shotgun with a contractor (still rendering at log time) |
| `66f4ce22` | Five bots on a table, heads turn in a wave |
| `9531837a` | Bot walking away down a Philadelphia sidewalk |

Frame source: `f0d006ba` (bot), `88e451eb` (Dillon tee), `810b4bf2` (Dillon
blazer). Lesson: the bot must be passed as `image_references` in every prompt or
the model invents a different robot; and "rigid physical object, stiff toy-robot
steps, no morphing, no glowing" is what keeps Kling from turning it into a
glowing CGI creature.

**Film 1 assembled and rendered.** `edit.jsx` in the higgsedit sandbox: 47 s,
1920x1080, 30 fps, 1410 frames, h264, 29.7 MB, rendered on the Node engine at
43 ms/frame. Beats: sphere logo with the word-by-word title stack and gold bar
(0-8), City Hall and Parkway plates with a sentence beat (8-15), three player
reveals with name slams and gold bars (15-30), "Not just views. Momentum."
(30-35), the seven services over a left gradient scrim (35-41), end card with
the exact mark, URL and word stack (41-47). Every title, name, role and the
mark are native nodes, so all of it stays editable.

Two build lessons: `compose` refuses an `animate` object and requires an array,
even for a single track; and the sandbox is recycled between tool calls, so the
whole pipeline (download, init, fonts, build, render, upload) has to run as one
chained background job or the project directory disappears mid-flight.

**Known defect, not yet fixed.** Mac's lower third is white type over a bright
golden-hour background and reads washed out; Dillon's and Sean's are fine. The
fix is a bottom scrim behind the lower third, one re-render, no new credits.

**Not yet done:** films 2 to 5, the vertical 1080x1920 versions, music, and the
Guide film (still waiting on the Codex Guide stills).

## Redirect, 2026-09-06 — the six-film system (supersedes "The five films")

Dillon rejected the first delivery outright ("These are so bad. Come on. We can do
way better.") and reset the brief in one message. The new constraints, verbatim
where they matter:

- **All six** references recreated, branded for Momentum only. The sixth is
  Motion's "Astra" post, receipted at
  [[12_Brain/01_Captures/X/2026-09-06 - motion-astra-launch-video-reference|the Astra capture]].
- "I want exact logos, everything." Spin on the logo is fine; data elements in the
  background are welcome.
- **"let's not use any pictures that we created"** — no generated people, no
  reuse of the 32 Codex stills, no Philadelphia plates.
- A **Momentum bot** with the same character energy as the mascot in the `folk`
  reference, branded blue and white.
- **"we're not doing MCPs"** — the MCP film is out of scope.
- Message: we manage your ads inside ChatGPT, plus AEO / SEO / GEO.

### What shipped

| # | Film | Recreates | Length | Source |
|---|---|---|---|---|
| 1 | Momentum for ChatGPT Ads | Motion "Astra" | 26.0 s | `03_Content/momentum-launch-films/01-chatgpt-ads.jsx` |
| 2 | Meet Momo | folk mascot spot | 29.0 s | `02-meet-momo.jsx` |
| 3 | They started asking | float / HyperFrames | 27.8 s | `03-answer-engine.jsx` |
| 4 | Everywhere they ask | Higgsfield GPT-6 ASTRA | 26.2 s | `04-everywhere-they-ask.jsx` |
| 5 | Great ads compound | Atomik launch-video co. | 29.0 s | `05-ads-compound.jsx` |
| 6 | Same market. Different answer. | ChatCut / Fable 5.1 | 23.2 s | `06-same-market.jsx` |

All six are 1920 × 1080, 30 fps, and cost **zero Higgsfield credits** — every
frame is drawn from vector primitives in higgsedit. 305 of the approved 700 remain
spent from the earlier stage; 395 are still unspent.

### The exact logo problem, solved

`_os/automation/assets/needmomentum-mark.png` is a 192 px raster and goes to mush
above ~400 px on screen. Fix: flatten it on white, trace it with `potrace`
(threshold 180, turdSize 8), and render the resulting curves at 2048 px with
`sharp`. That produced
`_os/automation/assets/needmomentum-mark-2048.png` (brand blue, transparent `m`)
and `needmomentum-mark-white-2048.png` (knockout). Both are committed and are now
the mark to use for any surface larger than a favicon.

Third-party marks are **exact**, not approximations: `simple-icons` path data
pulled from jsDelivr and rasterised in the needed colour — OpenAI, Perplexity,
Gemini, Google, Claude.

### Momo

Blue `#2A80C2` squircle body, two white capsule eyes, gold `#FFC63B` antenna dot
on a blue stem, all inside one `<group>` so he pops, bobs and tilts as one piece.
Defined by the `momo()` helper in films 2 and 3; `blink()` snaps the eyes with a
`scaleY` track. Pure vector, so he redraws crisp at any size and costs nothing.

### Every number on screen is illustrative

The `$60`/`$41` cost-per-lead exchange, the ranked roofer list, the answer
coverage board, the service progress bars and the cited firm are dramatisations of
an interface, not measured Momentum results. Swap them for real figures or cut the
frames before any of this runs as an ad.

### Google Drive, checked

Drive holds an earlier set — `momentum-{bridge,capita,marlow,notion}-recreation-*.mp4`
plus `momentum-founders-*` and `momentum-city-launch-*`, all uploaded 2026-09-06
20:58–21:14Z. Nothing from that set was reused. The only Momentum brand assets in
Drive are `mohr-media-*` (a different mark) and the Align logo pack; the
needmomentum mark still lives only in this repo.

## Missing inputs

1. The Guide stills (the blue-and-gold figure scenes) and their JSON specs
   from DESKTOP-4AHKEC4; the 2026-09-06 Drive folder holds only the people
   shots, and its email says the Guide stills were excluded on purpose.
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
- [[03_Content/momentum-launch-films/README|higgsedit sources for the six films]]
- [[12_Brain/01_Captures/X/2026-09-06 - motion-astra-launch-video-reference|Astra reference receipt]]
