# 01 · MOMENTUM SIGNAL — broadcast opener

**Reference** `refs/01-higgsfield.mp4` — Higgsfield's GPT-6 Astra broadcast-news intro.
Dark ground, a dotted wireframe globe with yellow-green orbital arcs, a corner lockup,
huge display type, a tiny caption line. 11.1s, 1:1.

**Ours** `1080×1080 · 30fps · 12.0s`

The reference is a news-package opener. Ours is a **report opener** — the six seconds
that top a Momentum monthly client report or a results post. Same broadcast authority,
Momentum's colours, and the data is local search demand instead of world news.

Surface: `--m-deep` `#0E1417`. Type on it: `--m-on-deep`. Accent: `--m-signal` `#E27113`
as fill and as text-on-dark (legal there). Globe wireframe: `--m-brand-lift` `#3897CC`.

> Naming note: "SIGNAL" is a proposed name for the report opener, chosen because it maps
> to the `--m-signal` token. It is one string in `film.html` — swap it if Dillon prefers
> "MOMENTUM REPORT" or a client name.

## Beats

| t | Beat | What happens |
|---|---|---|
| 0.0–1.6 | **Ignition** | Black. A single orbital ring sweeps in from off-frame and closes. The globe's dotted latitude grid resolves out of nothing, dot by dot, from the centre outward. Emphatic easing — this should feel *decided*, not soft. |
| 1.2–3.0 | **Lockup in** | Top-left: the official mark + `MOMENTUM` in Archivo Black caps, small, wipes in from a clip-path. Top-right: a signal-filled badge, `LOCAL SEARCH` / `PHILADELPHIA`, with `--m-on-signal` text (never white on signal). |
| 2.4–5.0 | **Demand lights up** | The globe rotates slowly, continuously, one axis. Arc paths spring outward from a Philadelphia origin pin to other pins — each arc draws along its path, then dims to a trace. Dotted country-mass shapes catch a highlight as they pass the terminator. |
| 4.6–7.8 | **The title** | `MOMENTUM` sets in Archivo Black, huge, left-aligned, rising with a mask-reveal. Beat. Then `SIGNAL` lands beneath it in `--m-signal`, larger, with an emphatic snap. The globe pushes right and back to make room — the type displaces it, it does not just sit next to it. |
| 7.4–9.6 | **The caption** | A hairline rule draws left-to-right under the title. Under it, small and letter-spaced: `THE MONTH IN LOCAL DEMAND`. Bottom edge: a slow ticker strip of generic search-demand fragments (`"roofer near me" ▲` / `MAP PACK` / `AI ANSWERS` / `PAID` — labels only, no invented numbers presented as real data). |
| 9.4–11.2 | **Settle** | Everything holds. The globe keeps its slow rotation — the frame is alive but calm. The mark does one restrained scale-pulse on the beat. |
| 11.2–12.0 | **Sign-off** | Ticker fades. `needmomentum.com` appears bottom-right in `--m-on-deep-muted`. Last frame is a deliberate composition, not a mid-fade. |

## Copy (exact strings)

- `MOMENTUM` · `SIGNAL`
- Badge: `LOCAL SEARCH` / `PHILADELPHIA`
- Caption: `THE MONTH IN LOCAL DEMAND`
- Ticker: `"roofer near me"` · `MAP PACK` · `AI ANSWERS` · `ORGANIC` · `PAID` · `GBP`
- Sign-off: `needmomentum.com`

## Craft notes

- The globe is **canvas or inline SVG driven by `seek(t)`** — project a lat/long dot grid
  to 2D with a rotation angle of `t`. Dots near the limb fade; dots on the far side are
  culled or dimmed. No 3D library, no imported model.
- Arcs are great-circle paths drawn with a `stroke-dashoffset` that is a function of `t`.
- Seed any scatter (dot jitter, ticker offsets) from a fixed PRNG seed at load, never at
  paint time — the render must be reproducible frame for frame.
- Variance: the ignition, the arc sequence, the title and the caption must not share a
  skeleton. The title beat *displaces* the globe; that is the variance move.
- Anti-slop watch: this is the film most likely to drift into neon-glow sci-fi. No bloom,
  no radiant shadows. The globe is a **wireframe drawing**, thin strokes, flat colour.
