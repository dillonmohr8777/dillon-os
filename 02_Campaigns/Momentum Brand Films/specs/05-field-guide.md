# 05 · FIELD GUIDE TO LOCAL DEMAND

**Reference** `refs/05-chatcut.mp4` — ChatCut's recreation of the **Fable 5.1** launch film.
Naturalist illustration seen through a circular lens: birds on branches, botanical plates,
leaf studies, old maps, microscopy, the moon — then sky, clouds, and elegant type. Slow,
contemplative, cinematic, film-grain. 27s, 16:9.

**Ours** `1920×1080 · 30fps · 26.0s`

The prestige piece. Its idea: **local demand is a natural phenomenon, and Momentum studies
it.** Everything inside the lens is a *drawn specimen of search behaviour* rendered like a
19th-century field plate — the search bar as a pressed flower, the map pack as a geological
section, the keyword cluster as a taxonomic chart, the AI answer as an illuminated panel.

Nothing here is photographic and nothing is AI-generated imagery. Every plate is drawn in
SVG, in ink line on aged paper, with Momentum blue and signal as the only colour.

Surface: `--m-deep` for the surround (the lens sits in darkness); plate interiors are
`--m-paper` warmed. Lens ring: a hard `--m-line-strong` keyline, no bevel, no glass.

## Beats

| t | Beat | What happens |
|---|---|---|
| 0.0–2.2 | **Aperture** | Black. A circle irises open at centre — a hard-edged mask, not a blur. Inside: an empty warm plate with a faint grid. A hairline crosshair drifts. |
| 2.0–4.6 | **Plate I — the query** | Drawn in with a line-draw (`stroke-dashoffset` on `t`): a search field rendered as a botanical specimen, its stem and leaves labelled in tiny italic Latin-ish captions. The words inside it: `"roofer near me"`. Plate label bottom-left: `Fig. I — the query`. |
| 4.4–7.4 | **Plate II — the pack** | The lens *slides* to a new plate rather than cutting: a geological cross-section, three strata, each a map-pack slot. Pins pressed into the strata like fossils. `Fig. II — the map pack.` |
| 7.2–10.2 | **Plate III — the cluster** | A taxonomic tree: one head term branching into intent variants, drawn as a naturalist's classification chart with hand-numbered nodes. `Fig. III — intent.` |
| 10.0–13.2 | **Plate IV — the answer** | The lens narrows. An illuminated manuscript panel: an AI answer box drawn as a decorated initial with marginalia, one line of text inside it set in Caveat — the film's single script accent. `Fig. IV — the answer engine.` |
| 13.0–15.6 | **Plate V — the orbit** | A celestial chart: concentric rings labelled `ORGANIC` · `PAID` · `MAP` · `AI`, with a small marker travelling one of them. `Fig. V — where they look.` |
| 15.4–18.6 | **The lens opens** | The circular mask expands past the frame — the surround falls away and we are in full paper for the first time. Everything simplifies. This is the film's release. |
| 18.4–21.6 | **The statement** | Centred, restrained, Nunito Sans at large size with wide tracking, two lines: `Demand leaves traces.` / `We read them.` |
| 21.4–23.8 | **The credit** | Small caps, letter-spaced, under a hairline rule: `FIELD GUIDE TO LOCAL DEMAND` / `SEO · AEO · GEO · PAID` |
| 23.6–26.0 | **Lockup** | Mark + `MOMENTUM` + `needmomentum.com`. The iris closes a little way back in — not to black, just enough to frame the lockup. Hold. |

## Copy (exact strings)

```
"roofer near me"
Fig. I — the query
Fig. II — the map pack
Fig. III — intent
Fig. IV — the answer engine
Fig. V — where they look
ORGANIC · PAID · MAP · AI
Demand leaves traces.
We read them.
FIELD GUIDE TO LOCAL DEMAND
SEO · AEO · GEO · PAID
MOMENTUM · needmomentum.com
```

## Craft notes

- **Type discipline.** The reference used an elegant serif. The Momentum system has two
  families and one script, and a third family is banned. So this film gets its elegance
  from *restraint instead of a serif*: Nunito Sans 400 at large size with wide tracking,
  generous leading, and Caveat used exactly once. That constraint is what stops this
  looking like a Fable homage and makes it look like Momentum.
- **The lens moves, it does not cut.** Plates I–V are laid out on one long horizontal
  strip behind a fixed circular mask; `seek(t)` translates the strip. Two of the five
  transitions may break that rule (a scale-through, an iris-narrow) so the sequence does
  not become a single repeated gesture — variance 9 applies inside the lens too.
- Line-draw everything. Plates arrive by drawing, never by fading in whole.
- Grain: a fixed, seeded static noise texture at very low opacity, generated once at load.
  It must not resample per frame or the video will boil.
- Anti-slop watch: "cinematic" is the strongest pull toward glow and vignette bloom here.
  The lens is a hard mask with a keyline. The darkness is flat `--m-deep`.
