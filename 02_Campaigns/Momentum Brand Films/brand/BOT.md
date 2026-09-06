# The Momentum Bot

> The Momentum mark, alive. A blue disc with the keyline ring inset at the mark's own
> traced proportions, the script `m` standing in the ring's opening as an antenna, and
> two ink eyes. Six painted shapes; every pose is numbers on the same six.

**Artwork** `brand/momentum-bot.svg` · **Rig** `brand/bot-rig.js` · **Sheet** `brand/bot-sheet.html`

---

## What it is

The slate's character, per `specs/BRIEF.md`. Dillon's brief: *"there was, like, a grok bot
looking type thing. It's, like, the momentum bot, but it looks just like that, but it's
branded, like, blue and white."* The reference is the `folk` mascot — a soft blob, a
sprout, two big eyes, a small mouth, and an argument that most AI are tools and this one
is a friend.

Ours takes that warmth and builds it out of the Momentum mark instead of next to it.
Three DNA elements, all load-bearing:

| Mark | Bot | Load-bearing because |
|---|---|---|
| The blue **disc** | the body | It *is* the disc. Mean radius 69.65 in a 200 box, modulated +6.9% / −7.7% — a circle with a low centre of gravity, so it sits rather than floats. Remove the modulation and you have the mark's circle. |
| The white **keyline ring** | the keyline ring | Inset at the mark's measured stack and left open at the crown. Remove it and the bot is a generic blue blob. |
| The white script **m** | the antenna | Written in the air above the crown, its tail standing in the ring's opening. Remove it and nothing says Momentum. |

Value structure follows the mark: a **blue field** carrying **white** mark elements. The
only thing that is neither is the ink of the eyes and mouth, which is what makes it a
creature rather than a logo with a face drawn on it. That split is deliberate —
**white = the mark, ink = the life.**

The practical dividend: because the body is blue rather than white, the bot's small-size
failure mode is *becoming the mark* (a blue disc with a white keyline), not dissolving
into the page.

## Geometry

viewBox `0 0 200 200`. Body centroid **(99.4, 116.4)**, mean radius **R = 69.65**.

`#mb-fit` wraps everything and holds the artwork at 88% about (100, 106). That is the
safe area: it keeps the m inside the artboard when `bob`, `squash`, `mFlex` and `sway`
stack up at their extremes. Every shipped pose was measured against the artboard
edges and clears them; the envelope notes in the parameter table are the measured
exceptions, not guesses. The rig never writes to it — pose transforms go on `#mb-root`
inside it, so a static `<img>` of the file and a posed one frame identically.

**The ring stack is traced, not approximated.** The three radii were sampled off the
official asset — `brand/momentum-mark.svg` rendered at 768px, centre scanline, run-length
classified:

| Band | Measured on the mark | On the bot |
|---|---|---|
| Blue interior | inward of 0.8177R | inward of 0.8204R |
| White keyline | 0.8204R → 0.9199R (0.0995R) | 0.8204R → 0.9199R |
| Blue rim | 0.9199R → 1.000R (0.0801R) | 0.9199R → 1.000R |

Implementation: `#mb-ring` is the *same path* as `#mb-body`, scaled **0.870** about the
centroid (the band's midline) and stroked **7.97** (which is 0.0995R ÷ 0.870, because the
transform scales the stroke too). Change the body and the ring follows it for free.

The ring carries `pathLength="100"` with `stroke-dasharray="94.5 5.5"` and
`stroke-dashoffset="2.75"`, which opens it at **94.5%** of its own length — the point
where the m's tail crosses. The m is one blue path; there is no colour-changing or
clipped second copy of it. The ring is simply open where the m stands.

**The m is written, never stretched.** Tall entry stem, two arches, rising exit flick,
spanning x 85→152 with its root hidden at (86, 68) inside the ring band. The official mark
is never redrawn, squashed or re-cut to make the character work — the bot's m is its own
lettering in the mark's hand, and the mark file itself is untouched.

**Eyes** r 19 at (77, 110.4) and r 17.9 at (123, 111.6). The right eye is 6% smaller and
1.2 lower. That inequality is intentional: a matched pair stares, an unmatched pair looks.

## Colour

Literal hexes in the SVG, each matching `brand/tokens.css` exactly. Every paint is written
`var(--token, #LITERAL)`, so the file renders correctly standalone and a film can override
it by setting the property on any ancestor.

| SVG property | Literal | Token | Used for |
|---|---|---|---|
| `--m-bot-body` | `#2A80C2` | `--m-mark` | body, antenna, eyelid plates |
| `--m-bot-key` | `#FFFFFF` | `--m-on-brand` | keyline ring, catchlights |
| `--m-bot-ink` | `#14181B` | `--m-ink` | eyes, mouth, brows |
| `--m-bot-sig` | `#E27113` | `--m-signal` | the spark (hidden at rest) |

Measured against the two slate surfaces: the blue body is **3.91:1** on `--m-paper` and
**4.55:1** on `--m-deep`; ink on the body is **4.44:1**. All are non-text graphics, so all
clear the 3:1 floor on both surfaces. The bot needs no alternate colourway.

## Rig API

`brand/bot-rig.js` — ES module, no dependencies, **a pure function of its arguments**. No
timers, no `requestAnimationFrame`, no `Date`, no `Math.random`. `poseBot(el, P)` called
twice with the same `P` paints an identical frame, which is what lets `render/capture.py`
drive it from `seek(t)` and scrub.

```js
import { mountBot, poseBot, idleBot, mixBot } from "../../brand/bot-rig.js";

const markup = await (await fetch("../../brand/momentum-bot.svg")).text();
const bot = mountBot(document.querySelector("#bot"), { markup, size: "160px" });

window.seek = (t) => {
  poseBot(bot, mixBot(idleBot(t), t > 4 ? "pleased" : {}));
};
```

`mountBot` rewrites the SVG's `mb-` id prefix per instance, so any number of bots can live
in one document. It returns `{ host, svg, refs, pose(params) }`.

### Parameters

**The six the brief names**

| Param | Range | Default | Effect |
|---|---|---|---|
| `look` | `[x, y]`, −8…8 units each | `[0,0]` | Gaze. Eyes move fully, mouth follows at 45% x / 25% y, so the face turns as a unit. |
| `blink` | 0…1 | `0` | 0 open, 1 shut. Collapses the eye about its centre and leaves a 1.6-unit ink line — never a gap. |
| `mouth` | `'neutral' │ 'smile' │ 'talk' │ 'flat' │ 'o'` | `'neutral'` | See the mouth table. |
| `tilt` | −14…14 deg | `0` | Whole body, pivoting at the base (94, 181): it leans, it does not spin. |
| `bob` | −10…10 units | `0` | Whole body; negative is up. |
| `scale` | 0.55…1 | `1` | About the same base pivot. Above 1 the artwork leaves the artboard — to render the bot bigger, size the `<svg>`, do not scale past 1 here. |

**Extensions** — optional, all default to neutral

| Param | Range | Effect |
|---|---|---|
| `talk` | 0…1 | Mouth openness when `mouth: 'talk'`. Drive it from `t`. |
| `squash` | −0.09…0.09 | + wide-and-short (impact, settle), − tall-and-thin (anticipation, lift). Safe alone across the range; with `bob` below −6, keep \|squash\| ≤ 0.05 — a lift stacked on a lift walks the m off the top. |
| `eyeArc` | −1…1 | +1 pleased crescent, 0 round, −1 wide-open. |
| `lid` | 0…1 | A body-coloured plate, clipped to the live eye, drawn down from the top. Blink closes symmetrically; the lid cuts a straight edge — that is what reads as heavy or concentrating. |
| `eyeRot` | −14…14 deg | Mirrored. + drops the inner corners = stern. |
| `brow` | −1…1 | 0 = absent (opacity 0, costs nothing at rest). + raised, − furrowed. |
| `sway` | −22…22 deg | The m about its root. |
| `mFlex` | −0.25…0.20 | The m stretches about its root. Measured safe across the whole range, including with `bob` at −10. |
| `mSkew` | −8…8 deg | The m leans. |
| `mouthShift` | −9…9 units | Slides the mouth sideways. A flat mouth on one cheek is the cheapest deadpan in the rig. |
| `signal` | 0…1 | >0.5 shows the orange spark at the exit flick. |
| `catchlight` | 0…1 | >0.5 shows two white specks. Off by default; the reference has none. |

### One primitive

Both eyes and the mouth are three instances of `blob(w, up, down)` — two mirrored arcs
with a half-width, a rise and a drop, built on the circle constant `K = 0.5523`, so
`blob(r, r, r)` is a true circle. Negative values are legal and give crescents. That
single function is the entire face rig; there is no alternate face artwork anywhere, and
adding some would break the promise this character is built on.

```js
MOUTHS = {
  neutral: [10.5, -1.6, 8.6],   // small closed smile, flat on top
  smile:   [14,   -0.4, 14.5],  // open grin
  flat:    [11,    1,    1],    // a closed line — this is the deadpan
  o:       [ 6.6,  7.4,  7.4],  // round, surprised
}
```

A negative *rise* tucks the top lip below the baseline (the flat-topped ink crescent); a
positive rise opens the mouth. `talk` interpolates between the two.

### Expressions

| Pose | Eyes | Mouth | Body | Reads as |
|---|---|---|---|---|
| `neutral` | round, open | small closed smile | still | present, unbothered |
| `thinking` | half-lidded, up and right | flat, shoved to the left cheek | leaning back 5° | working it out |
| `pleased` | crescents | open grin | up 4.5, tilted 4° | pleased, not delighted |
| `focused` | narrowed, inner corners down, brows furrowed | flat | settled, squashed 4% | concentrating |
| `surprised` | wide, brows up | O | up 7, tilted 6°, spark on | caught out |
| `talking` | round | open, `talk` drives it | small lean | mid-sentence |
| `blink` | two ink lines | unchanged | unchanged | alive |

`idleBot(t)` returns an ambient loop — breathe, slow lean, m sway, a blink every 4.4s —
as a pure function of seconds. `mixBot(...)` merges pose objects left to right.

## Scale

Ramp on `brand/bot-sheet.html`, both surfaces.

- **480 → 104 px** — everything reads, including the mouth and the ring's opening.
- **72 px** — the ring's opening closes up; the m is a sprout with two bumps.
- **48 px** — the mouth is a smudge; disc, keyline and eyes still separate.
- **32 px — the floor.** Films 3 and 4 put the bot in a message thread at 19–40px: use
  **40 px, unaltered**, which is above the floor. No simplified small-size variant exists.
- **Below 32 px** the mouth goes, then the ring's opening. What survives is a blue disc
  with a white keyline, two ink eyes and a sprout — which is still the mark. The failure
  mode is the bot becoming its own logo, and that is acceptable.

## Do

- Pose it from `poseBot`. Every film uses the same artwork.
- Keep the bot on `--m-paper`, `--m-panel` or `--m-deep`. It is legal on all three.
- Let it be deadpan. `mouth: 'flat'` with `lid` and a `mouthShift` is the register that
  separates this character from a corporate helper.
- Use `bob` and `squash` together — they are how it breathes.
- Scale and rotate it freely.

## Don't

- **Never distort the official mark.** `brand/momentum-mark.svg` is scale-and-rotate only.
  The bot is derived from it; it does not license editing it.
- **Never add a glow, blur, gradient, bevel, drop shadow or filter.** The SVG contains
  zero filter and zero gradient elements and must continue to. To lift it off a surface
  use `--m-block-md` on its container — a hard offset with zero blur.
- **Never recolour off-palette.** The four literals above, or their tokens. No purple, no
  neon, no "AI" colourway.
- **Never draw new bot artwork for a pose.** If a beat seems to need a prop, an arm or a
  new mouth shape, the beat is wrong — the character has no limbs by design, and props are
  what turned the losing direction into an assistant illustration.
- Never stretch the body non-uniformly outside `squash`, which preserves volume.
- Never put ink eyes on anything but the body blue; they are specified against `#2A80C2`.
- Never imply the bot is Momentum's product. Momentum is an agency that uses the tools.

## Provenance

Derived from `brand/momentum-mark.svg`, the official Momentum Digital mark vectorised from
`_os/automation/assets/needmomentum-mark.png`. The ring-stack radii in this document were
re-measured off that file rather than carried over as claims.

Chosen from a four-direction bake-off — `blob-badge`, `stroke-bot`, `disc-body`,
`logo-alive` — judged on three lenses: mark fidelity, *friend not tool*, and
simplicity/riggability/anti-slop. `blob-badge` won on combined score (20.0), taking the
character and production lenses outright. This final artwork is that winner with the
grafts the panel named:

- the traced ring stack and the mark's own value structure, blue field with white keyline
  (from `logo-alive`, which won the fidelity lens) — this is why the body is blue, and the
  reason the panel's one real objection to the winner is answered;
- the mark's ring-stack ratios held as hard numbers, and the opacity-0 brow pair and
  mask-driven lid that add expression registers without adding shapes (from `disc-body`);
- the m's tail escaping through the opening it leaves in the keyline ring (from
  `stroke-bot`) — with `stroke-bot`'s two-path clipped implementation deliberately *not*
  taken, because it is unrecallable; the ring is simply open where the m stands;
- the arc thresholds that make one primitive cover both crescents and the O
  (from `stroke-bot`);
- and from the winner itself, kept: the asymmetric disc, the one-primitive face, the flat
  closed-line mouth that buys deadpan, the hidden signal spark, and `idleBot(t)`.
