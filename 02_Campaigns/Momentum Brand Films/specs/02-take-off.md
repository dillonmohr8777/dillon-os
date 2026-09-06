# 02 · TAKE OFF — the agency film

**Reference** `refs/02-atomik.mp4` — "the launch video company" by Atomik Growth.
Pale lavender-white ground, black headlines with one word in accent colour, UI cards
tumbling in 3D perspective, a small rocket, a metric bar, a closing wordmark. 33s, 16:9.

**Ours** `1920×1080 · 30fps · 30.0s`

The straight agency pitch, and the film that does the most work. Light, fast, confident.
Reference's structure exactly: a rhythm of two-tone one-liners, punctuated by three
object beats where UI does the talking.

Surface: `--m-paper` `#FBF8F4`, one beat on `--m-panel`, one full-bleed beat on `--m-brand`.
Headline ink: `--m-ink`. **The accent word is `--m-signal-ink` `#A35309`, never `--m-signal`** —
signal on paper is 3.00:1 and illegal as text.

## Beats

| t | Beat | What happens |
|---|---|---|
| 0.0–2.6 | **Line 1** | Centred, mid-size Archivo Black: `Most local businesses` + `run ads.` (accent). Words rise word-by-word on a 70ms stagger, entrance easing. Nothing else on screen. |
| 2.4–5.0 | **Line 2** | Hard cut of content, same position: `Great ones` + `build momentum.` The word `momentum` gets the accent and a beat of extra scale. |
| 4.8–8.4 | **The stack** | Type shrinks and pins to the upper third. Below it, three device cards — a phone, a browser, a map card — fly in on separate arcs with real perspective (`rotateX/rotateY`, a shared vanishing point) and settle into a loose, deliberately *un*-gridded arrangement. Caption under: `Illustrative UI — not client work.` |
| 8.2–11.4 | **We run the ads** | Cards slide out left. A single browser card centres and scales up, showing a generic search results page: an ad slot highlighted with a signal keyline. Headline right of it: `We run the ads.` |
| 11.2–14.6 | **We win the map** | Full skeleton change: the frame splits — left half `--m-panel`, right half paper. A map card occupies the left with three pins dropping in sequence; the third pin snaps to the top of a three-item map pack. Right: `We win the map.` |
| 14.4–18.0 | **We write the pages** | Another skeleton change: a tall page mock scrolls upward behind large type set flush-left at the frame edge, half-cropped by the edge: `We write the pages` + `that answer the question.` |
| 17.8–21.6 | **Everywhere they look** | Full-bleed `--m-brand` beat. White type, centred, low density: `Search. Answers.` / `Everything after.` Three small labels orbit in on a stagger: `SEO` · `AEO` · `GEO`, each with its expansion underneath in small caps — `Search engines` / `Answer engines` / `Generative search`. |
| 21.4–24.4 | **The metric bar** | Back to paper. A single horizontal bar assembles from three segments (`Ads` / `Organic` / `AI answers`) with a `--m-block-md` hard offset shadow, not a blur. Above it: `Not just clicks.` + `Momentum.` (accent). Bar is unlabelled by value — shape, not a claim. |
| 24.2–27.2 | **The dart** | Everything clears. One object: the Momentum mark, small, travels a long ease-out arc from lower-left to centre, growing, leaving a thin signal trail that dissipates behind it. This is the film's "rocket" beat. |
| 27.0–30.0 | **Lockup** | Mark + `MOMENTUM` set together, centred. Under it, one line: `Philadelphia. Since 2015.` Under that, `needmomentum.com`. Hold two full seconds — the last frame is the frame people screenshot. |

## Copy (exact strings)

```
Most local businesses run ads.
Great ones build momentum.
We run the ads.
We win the map.
We write the pages that answer the question.
Search. Answers. Everything after.
SEO — Search engines
AEO — Answer engines
GEO — Generative search
Not just clicks. Momentum.
MOMENTUM · Philadelphia. Since 2015. · needmomentum.com
Illustrative UI — not client work.
```

## Craft notes

- **Variance is the whole game here.** Nine beats, and no two may be describable by the
  same sentence. The written skeletons above already alternate centred / stacked /
  split / cropped-flush / full-bleed / object-only. Keep that.
- Card perspective: one shared `perspective` on the parent, cards get `rotateX`/`rotateY`
  and `translateZ`. Never more than three concurrent tweens.
- The `--m-brand` beat is the only place white type appears on blue; `--m-on-brand` is
  `#FFFFFF` and legal there. Do not put white on `--m-signal` anywhere.
- Every device mock is drawn in CSS/SVG. No screenshots, no stock photography, no client
  names, no invented metric values rendered as text.
- The dart beat is the only "effect" in the film. Its trail is a thin tapered path, not a
  glow.
