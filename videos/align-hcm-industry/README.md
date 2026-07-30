# Align HCM · Industry Solutions

One film covering all five industries, on a light stage: white paper, blue and
orange type, dimensional icon tiles, and one image per industry taken from that
industry's own page.

`align-hcm-industries.mp4` — 65.8s, 1920x1080, 30fps, H.264, silent.

## What the film argues

Align works with the HCM platforms and applies them with **industry expertise**:
the configuration is shaped to a client's actual operating environment by people
who already speak that industry's business language. Every scene serves that one
claim, in order:

| Scene | Beat |
| --- | --- |
| s1 | What Align does. "We configure HCM platforms around how your industry actually runs." |
| s2 | The differentiator. "Every industry runs on its own vocabulary. We already speak it." Ghost word `FLUENCY`. |
| s3 | **The proof.** Each industry's own terms, not a sentence about it. |
| s4 | What fluency changes. Configuration is where a platform becomes your operation. |
| s5 | How Align works, four cards. |
| s6 | Platforms and clients together. "We speak the platform. We speak your business." |
| s7 | The same industry team, long after go-live. |
| s8 | End card. "We know your industry. The configuration proves it." |

The end card leads with the expertise and makes the configuration the proof of
it, in that order. An earlier pass ended on the configuration itself ("Anyone can
turn the platform on. Configuring it is the work."), which put the mechanism ahead
of the thing that actually differentiates Align. Knowing the industry is the
claim; the configuration is where that knowledge becomes visible, so it goes
second. The brand film keeps its own sign off; this tagline belongs to the
industry cut.

s2 exists to set up s3. Once "every industry runs on its own vocabulary" is on
screen, the filmstrip needs no label: five industries, five sets of terms, and the
argument makes itself. That is why the strip carries `Census, float pool,
credentials, differentials, ratios` rather than a sentence about healthcare. Every
term on screen is one Align configures for, and the s4 cards deliberately repeat
them so the claim in s2 pays off in the same words twice.

Section eyebrows track the argument rather than the site's own headings:
`Industry expertise`, `Why it matters`, `Configured to your environment`,
`How we work`, `Many platforms, every industry`.

## Copy has to fit its column

`build/fitcheck.mjs` reports, per headline, how many lines it **declared** with
`|` against how many it **rendered**. A mismatch means the browser had to break a
line again and the layout is quietly wrong, which is exactly what happened to s1
on the first pass: three declared lines rendered as four, because the split
layout's copy column is only 836px and "We configure HCM platforms" needs 1261px
at 72px Playfair. Measure before rewriting; the limit is narrower than it looks.

Card headings reserve two lines whether they need them or not, so the bodies
across a row start at the same baseline. Without that, one heading wrapping drags
its own paragraph down and the row reads as misaligned.

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

**The logo is not on that palette.** Align's mark is grey and orange and carries
no blue at all, so it renders in its own two values, sampled off
`assets/logos/align-hcm-logo.png` as the site ships it:

```
logo grey  #555555     logo orange  #f8931d
```

Those drive `.lockup`, `.inklockup` and both lockup captions, everywhere the mark
appears: the ink reveal, the orbit hub, and the end card. The logo orange is
warmer than the film's `--orange`, and that is correct rather than a mistake to
reconcile: a viewer will forgive a second orange long before they forgive a logo
in the wrong colour. On the end card the hairline separates the two, so above the
rule is the mark in its real colours and below it is the film's.

The dark brand film keeps a **white** knockout for the same mark, which is the
right reverse treatment on navy. Grey at #555555 would disappear there.

**SmartCare is no longer in this film.** The past go-live beat used to open on
the mark, and it was pulled at Ben's request: SmartCare is its own product with
its own film, and dropping its logo into the last ten seconds of the industry cut
introduced a second brand with no setup behind it. The beat kept its line, which
is the claim it was actually making, and now carries it typographically. The
artwork stays in `assets/logos/smartcare.png` for the SmartCare film; `build.py`
no longer inlines it here.

## The two set pieces

**The filmstrip** (`s3`). Five industries, one image each, scrolling through
centre. It replaces a box grid: each industry gets the frame to itself for
a beat, the neighbours sit blurred and desaturated at the edges to imply the
strip continues, and progress bars track position. The scroll is a staircase
eased at the risers, so it holds to be read and then glides.

**Public sector has no page of its own**, so it borrows the `managed-payroll`
hero: a calendar, an approval loop, a timesheet in hand and a stack of records.
That is what public sector HR work looks like from the inside. The `support`
illustration was here first and was wrong for it, being two people at a laptop
that said nothing specific, and its caption has been rewritten to match what the
new artwork actually shows.

Each hero carries **its own crop anchor** in `HEROES`. One global anchor cannot
serve all nine: these are composed illustrations, not photographs, and some put
the subject's face high with background below while others carry the meaning at
the bottom of the frame, in the papers on the desk. Public sector is anchored low
at 0.62 for exactly that reason.

`media.py` prepares all nine; `build.py` inlines only the six on screen, or the
page carries three megabytes of artwork it never draws.

The orbit carries eight marks, two per industry, because no public sector client
roster exists on the hub to draw from.

**The ink reveal** (`s0`). The full lockup is masked by a rectangle sweeping left
to right. That rectangle is displaced by fractal noise and blurred, so its leading
edge behaves like ink spreading into paper rather than a hard wipe. The filter sits
on the **mask**, never on the artwork, so the logo itself stays perfectly sharp
while its reveal edge goes organic. A warm bloom rides just behind the front.

The slide is the lockup and its caption, nothing else. It used to carry a line of
copy underneath and held 6.2s to fit it; with the line gone the caption is the
last thing to land, at 2.95s, so the scene is 4.8s and every later scene moved
back 1.4s rather than leaving a dead beat on a static logo.

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

The ring geometry is load bearing and is sized around the signal corridor:
centre at x 1410 with radius 352 and 150px chips puts the hub rim at r 152 and
the chip edge at r 277, leaving 125px of clear paper for a pulse to be read in.
The artwork reaches to x 983 and the copy column stops at 944. The hub shrank
from 380px and the radius grew from 322 to open that corridor; before, the gap
was 52px and nothing travelling the wire was legible. Change one and check the
rest.

## Spokes

The spokes are wires with a signal travelling out along them. Each connection is
a rest wire plus two stacked paths sharing one straight geometry: a wide warm
bloom and the pulse itself in the deepest orange in the palette. On a white stage
the pulse reads by being **saturated, not bright**; a pale glow only hazes the
paper, which is the opposite of the dark film's instinct.

An earlier pass drew these as jagged lightning discharges, and it was cut. It
read as a stock effect rather than as this company, and the argument the scene
makes is that Align sits at the centre of an operation and reaches each platform
deliberately, which is a steady signal rather than a storm.

Signals run on a 2.6s cycle staggered by `i/n`, so one chases around the ring
rather than all eight firing at once. `pathLength="1"` makes the pulse a plain
dash fraction, so moving it out along the wire is two attributes instead of a
length measurement; the gap either side is padded so the dash pattern never
repeats and leaves a dotted line trailing behind. Travel is eased in and out, so
the pulse leaves the hub and settles on the mark rather than running at a
constant machine speed. It starts at the hub **rim**, not the centre, or most of
its travel happens behind the logo. The hub brightens as it sends and each mark
lights when the signal lands on it.

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
