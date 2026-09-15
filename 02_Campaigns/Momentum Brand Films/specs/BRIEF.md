# Momentum Brand Films — shared build brief

Read this in full before writing a frame. Everything here is binding.

## What this slate is

Six brand films for **Momentum Digital**, rebuilt from six reference videos Dillon
sent. Each film keeps the *structure, pacing and craft* of its reference and
replaces the subject entirely with Momentum. No reference brand's name, mark,
palette, mascot or copy survives into our version — only its motion grammar.

## Who Momentum is

- **Momentum Digital** — digital marketing agency, Philadelphia. `needmomentum.com`.
- Founded 2015. Founder & CEO Mac Frederick. Dillon Mohr runs accounts.
- What they sell: Google Ads, Meta Ads, local SEO, Google Business Profile
  content, web design, landing pages, WordPress — for small local businesses.
- The line that matters this slate: **they manage your ads**, and they do
  **SEO, AEO and GEO** — ranking in Google, in AI answers, and in generative search.
- Tone: direct, execution-first, no fluff. Confident, not loud. Never cutesy
  about results, never a guarantee.

## The mark — exact, never redrawn

`brand/momentum-mark.svg` is the **official Momentum Digital mark**, vectorised
from the official 192px asset in this vault (`_os/automation/assets/needmomentum-mark.png`)
and verified against it at 768px (mean pixel delta 2.55/255 — antialiasing only).
A blue disc, a white keyline ring, a white script `m` knocked out of the middle.

- Its literal colour is `--m-mark` `#2A80C2`. The SVG paints with `currentColor`,
  so set `color:` on its container.
- **Never** redraw, restyle, skew, recolour off-brand, add a glow to, or
  "improve" this mark. Scale and rotate only.
- The wordmark beside it is set in `--m-font-display` (Archivo Black), letter-spaced
  `-0.02em`, in caps: `MOMENTUM`. This is a design-system treatment, not a scan of
  an official wordmark file — flagged as such in the README. It lives in one place,
  `brand/lockup.html`, so it can be swapped for the official artwork in one edit.

## Brand law

Pull colour, type, space and motion from `brand/tokens.css`. Do not retype a hex
you remember; do not invent a spacing value.

**The three dials** (from the `momentum-brand-system` skill):
- **Visual variance 9/10** — consecutive beats must not share a skeleton. If you
  can describe two shots with the same sentence, one is wrong.
- **Motion 8/10** — motion is load-bearing, not decoration. Every movement must
  answer "what is this revealing / directing / establishing?" Cut anything whose
  answer is "it looked nice."
- **Information density 4/10** — few words per screen, large type, generous air,
  one idea per beat. This is the dial that gets violated. Resist adding.

**Easing** — three curves, not interchangeable:
- `--m-ease-standard` `cubic-bezier(.2,.7,.2,1)` — small state changes
- `--m-ease-entrance` `cubic-bezier(.16,1,.3,1)` — entrances (expo-out)
- `--m-ease-emphatic` `cubic-bezier(.85,0,.15,1)` — deliberate swaps

**Colour law — foreground tokens are named for the surface they are legal on:**
- `--m-signal` `#E27113` is a **fill**, and text on dark. As text on paper it is
  3.00:1 and illegal.
- `--m-signal-ink` `#A35309` is the orange that speaks **on light**.
- `--m-brand` `#155E86` speaks **on light**. On deep it is 2.63:1 — fails.
- `--m-brand-lift` `#3897CC` is the blue that speaks **on dark**.
- `--m-on-signal` `#14181B` is the text on an orange fill. **Never white on signal.**

**Anti-slop — any one of these undoes the film:**
no AI purple / indigo-violet gradients · no neon glow or radiant shadows ·
no glassmorphism / frosted blurred panels · no floating gradient orbs ·
no three-equal-card feature row · no generic stock photography.
To lift a surface use `--m-block-md` — a hard offset with zero blur, tinted with
signal. It reads as print, not UI chrome.

## The Momentum Bot

The slate's new character. Dillon's words: *"there was, like, a grok bot looking
type thing. It's, like, the momentum bot, but it looks just like that, but it's
branded, like, blue and white."*

The reference is the `folk` mascot in `refs/03-mascot.mp4` — a soft cream blob with
a tiny antenna sprout, two large solid eyes and a small smile, animated inside a
messages UI, with expression changes (neutral, happy, squint, furious). Its whole
argument is *"most AI are tools; folk is a friend."*

Ours must be:
- **Blue and white.** Momentum blue `--m-mark` / `--m-brand`, white, dark ink eyes.
- **Derived from the mark, not invented next to it** — the disc, the keyline ring
  and the script `m` are the character's DNA. A viewer should read it as
  "that's the Momentum logo, alive."
- **Simple enough to redraw from memory** — the reference mascot is four shapes.
- **Rigged**: one SVG with parameterised eyes, mouth and tilt so every film can pose
  it from `seek(t)` without new artwork.
- Warm, competent, a little deadpan. Not cute-for-cute's-sake, not a corporate
  robot, not a glowing AI orb.

Final artwork lands at `brand/momentum-bot.svg` with its rig documented in
`brand/BOT.md`.

## The six films

| # | Slug | Ref | Format | Target | Subject |
|---|---|---|---|---|---|
| 1 | `01-momentum-news` | Higgsfield broadcast intro (11s, 1:1) | 1080×1080 | ~12s | Broadcast-style opener: wireframe globe, orbital data arcs, `MOMENTUM / SIGNAL` |
| 2 | `02-take-off` | atomikgrowth launch film (33s, 16:9) | 1920×1080 | ~30s | Light, kinetic two-tone headlines + floating UI cards. The agency pitch. |
| 3 | `03-meet-the-bot` | folk mascot film (50s, 16:9) | 1920×1080 | ~34s | The Momentum Bot in a messages UI. "Most agencies send reports." |
| 4 | `04-ask-momentum` | float / HyperFrames recreation (43s, vertical) | 1080×1350 | ~30s | Minimal. An "Ask Momentum anything" bar → the bot answers about spend and leads. |
| 5 | `05-field-guide` | Fable 5.1 recreation (27s, 16:9) | 1920×1080 | ~26s | Cinematic. Circular lens over naturalist "plates" of search demand. |
| 6 | `06-one-prompt` | motion.so / ChatGPT film (22s, 16:9) | 1920×1080 | ~24s | A prompt is typed; Momentum does the work. Ads + SEO + AEO + GEO. |

Every film opens on its own idea and closes on the same lockup: mark + `MOMENTUM`
+ one line + `needmomentum.com`.

## Copy rules

- Claims must be things an agency can say without proof: *what they do*, not
  *what results you will get*. No invented client names, no invented metrics
  presented as real, no "300% ROI" style numbers.
- Where a film shows a number, it must read as **illustrative UI**, not as a
  case-study claim — generic labels, no client names.
- Never imply a guarantee. Never imply Momentum is an AI company; Momentum is an
  agency that uses the tools.
- Say **AEO** and **GEO** in full at least once across the slate: *Answer Engine
  Optimization*, *Generative Engine Optimization*.

## The render contract

Each film is one self-contained HTML file at `films/<slug>/film.html` that declares:

```js
window.FILM = { width, height, fps: 30, duration };   // seconds
window.seek = (t) => { /* paint the frame at time t */ };
```

Hard requirements:
- **Every visual state is a pure function of `t`.** `tokens.css` kills all CSS
  animations and transitions, so nothing moves on its own. No `requestAnimationFrame`,
  no `Date.now()`, no `Math.random()` at paint time (seed a PRNG once at load if you
  need scatter). Re-rendering the same `t` twice must give an identical frame.
- Relative paths only: `../../brand/tokens.css`, `../../brand/momentum-mark.svg`.
- Load the mark by `fetch()` + inline at boot and set `window.__ready = true` when
  all async work is done; keep `window.FILM` and `window.seek` defined synchronously.
- Prefer `transform` and `opacity`. Canvas and inline SVG are both fine — drive
  them from `seek(t)`.
- First frame and last frame must be deliberate: a film that starts mid-motion or
  ends on a half-faded word reads as broken.

Render and QA:

```bash
cd "02_Campaigns/Momentum Brand Films"
python3 render/capture.py films/<slug>/film.html out/<slug>.mp4
python3 render/sheet.py out/<slug>.mp4 out/<slug>-sheet.png --duration <seconds>
```

Then **open the contact sheet and look at it.** A film you have not looked at is
not finished. Check: type clipping, overlap, elements entering before their beat,
dead frames, contrast on every text-on-background pair, and whether any two
adjacent beats share a skeleton.
