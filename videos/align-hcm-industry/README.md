# Align HCM · Industry Solutions

One film covering all five industries, on a light stage: white paper, blue and
orange type, dimensional icon tiles, and one image per industry taken from that
industry's own page.

`align-hcm-industries.mp4` — 67.2s, 1920x1080, 30fps, H.264, silent.

## Where the copy comes from

The script follows the voice on the industry hub and its four industry pages,
not a generic brand script. That voice has a shape worth keeping:

1. **A concrete operational claim.** "Workforce technology for the work every
   industry depends on."
2. **The consequence when the pieces are disconnected**, as a real chain of
   events rather than an abstraction.
3. **Operational realities**, three of them, each a bold claim over one line.
4. **How Align helps**, four of them, in the same shape.

Section eyebrows are the pages' own: `Industry context`, `Operational
realities`, `How Align helps`. Every claim on screen traces to a page.

## Light theme

Tokens are Align's own, lifted from the `:root` block on
`alignhcm.com/align-hcm-smartcare`:

```
paper  #ffffff    ink    #0b0f14    orange   #ee6b2f
cream  #f7f3ec    ink-3  #3c4658    orange-2 #f28a4c
blue   #16326e    ink-4  #6b788f    orange-3 #f9a45c
```

The blue is the display colour, taken from the deep navy the dark brand film
uses and lightened until it reads as blue rather than black. Headlines are
Playfair Display in blue with orange accent phrases; body is Inter.

Because the stage is white, **SmartCare needs no card and no processing**. The
mark is the 715x445 transparent PNG off `/align-hcm-smartcare`, inlined exactly
as it ships: navy wordmark, grey heart, orange tagline, nothing recoloured and
nothing traced. Getting to use the real artwork untouched is the whole reason to
go light.

## The two set pieces

**The filmstrip** (`s3`). Five industries, one image each, scrolling through
centre. It replaces a box grid: each industry gets the frame to itself for
a beat, the neighbours sit blurred and desaturated at the edges to imply the
strip continues, and progress bars track position. The scroll is a staircase
eased at the risers, so it holds to be read and then glides.

**Public sector has no page of its own**, so it borrows the `support` hero: a
dispatch desk and a headset, which is the closest thing among the hub's nine
illustrations to the work those teams actually do. `media.py` prepares all nine;
`build.py` inlines only the six on screen, or the page carries three megabytes of
artwork it never draws.

The orbit carries eight marks, two per industry, because no public sector client
roster exists on the hub to draw from.

**The ink reveal** (`s0`). The full lockup is masked by a rectangle sweeping left
to right. That rectangle is displaced by fractal noise and blurred, so its leading
edge behaves like ink spreading into paper rather than a hard wipe. The filter sits
on the **mask**, never on the artwork, so the logo itself stays perfectly sharp
while its reveal edge goes organic. A warm bloom rides just behind the front.

**The orbit** (`s6`). Client marks ride a ring around the **full Align lockup**,
wordmark and mark, not the standalone icon. Two of the biggest names per industry,
eight in total, **in their own colours** on white chips, so nothing is knocked out
or recoloured. The ring turns slowly and each chip counter turns so the marks
stay level.

Each chip is three stacked layers: a warm flare behind it, the disc, and a
specular band across the top of the disc. The disc paints over the middle of the
flare, so the flare reaches 56px past the chip or all that shows on a strike is a
thin rim. The rim is two orange rings with a **white gap between them**; ring on
ring immediately just muddies into a brown halo on warm paper.

The hub is clip-masked by `drawLockup` like every other lockup in the set, so it
needs that call in `draw` or it renders as an empty circle with three loose dots.

The ring geometry is load bearing and is sized around the lightning corridor:
centre at x 1410 with radius 352 and 150px chips puts the hub rim at r 152 and
the chip edge at r 277, leaving 125px of clear paper for a discharge to be seen
in. The artwork reaches to x 983 and the copy column stops at 944. The hub shrank
from 380px and the radius grew from 322 to open that corridor; before, the gap
was 52px and every bolt read as a small squiggle. Change one and check the rest.

## Lightning

The spokes are discharges, not wires. Each connection is a rest wire plus five
stacked paths sharing one jagged geometry: a wide warm bloom, a mid orange halo,
the bolt itself in the deepest orange in the palette, a pale filament inside it,
and a short fat dash chasing the front out to the mark. On a white stage a bolt
reads by being **saturated, not bright**; a pale glow only hazes the paper, which
is the opposite of the dark film's instinct.

Every offset comes out of a `sin`-based hash rather than `Math.random`, because
the exporter seeks to arbitrary frames and has to get the identical bolt back
each time it lands on one. Shape is quantised to 15 redraws a second: a bolt that
eases between shapes reads as a wiggling rope, one that snaps every couple of
frames reads as electricity. A bell curve pins both endpoints, so however hard
the middle is thrown around the bolt always leaves the hub and lands on the mark
dead centre. One dead end branch per bolt is the single cheapest thing that
separates lightning from a jagged line.

Strikes run on a 2.6s cycle staggered by `i/n`, so the discharge chases around
the ring rather than all eight firing at once. `pathLength="1"` makes the
travelling front a plain dash fraction, so revealing the bolt hub outward is two
attributes instead of a length measurement. The bolt starts at the hub **rim**,
not the centre, or most of its travel happens behind the logo. The hub brightens
as it launches and each mark blooms when the front lands on it.

## Icons

`icons3d.py` draws the dimensional tiles: a rounded squircle with an orange
gradient, a cast shadow, a specular band across the top, an inner stroke that
catches the top edge, and a white monoline glyph. The depth is three cheap
tricks stacked rather than a fake perspective, so each tile is one self
contained SVG with no dependency beyond `feDropShadow`.

## Build and render

```bash
python3 media.py            # fetch and prepare artwork, cached
python3 icons3d.py          # redraw the icon tiles
python3 build.py            # -> industries.html
node render.mjs             # -> align-hcm-industries.mp4, about 14 minutes
node render.mjs --from 10 --to 24 --out build/probe.mp4   # one scene
```

Open `industries.html` in a browser for a live scrubber. The page is fully self
contained: fonts, artwork, icons and logos are all inlined, so it runs from
`file://` with no network.

`build/copycheck.mjs industries` dumps every on screen string and fails on a
dash. `build/shot.mjs industries.html <dir> <t>...` grabs stills at given
timestamps, which is how the orbit geometry above was dialled in.

## Script order matters

A scene file calls engine helpers (`split`, `typeset`, `eyebrow`, `tile`,
`lockupSVG`) while it is still being parsed, and the boot half needs `SCENES`
and `TITLE` to already exist. So `shell.html` loads **assets, engine, scenes,
boot** in that order, and `engine.js` and `boot.js` are separate files for
exactly this reason.

## Shared inputs

`build/fonts.css`, `build/wordmark.path` and `build/noise.b64` are generated by
the scripts in `../align-hcm-intro/` and copied here so this project stands on
its own. The Align wordmark, and the reason the lockup mark is not the favicon
geometry, are documented in that project's README. The favicon geometry **is**
used here, correctly, as the standalone mark at the centre of the orbit.
