# 04 · ASK MOMENTUM — vertical

**Reference** `refs/04-milo.mp4` — a HyperFrames recreation of the **Float** launch film.
Near-white ground, kinetic single lines where individual words fade in and out mid-sentence,
a green pill-faced mascot that morphs, an `Ask Float anything…` bar that expands into a
conversation, then a product still, then the wordmark. 43s, portrait.

**Ours** `1080×1350 · 30fps · 30.0s` — 4:5, the feed-native format.

The quiet one. Restraint is the point: the reference's power is how little is on screen at
any moment. Information density 3/10 here, not 4.

Surface: `--m-paper` throughout, one beat excepted. This is the film that proves Momentum
can be calm.

## Beats

| t | Beat | What happens |
|---|---|---|
| 0.0–4.2 | **The premise** | Centred, single line, mid-size Nunito Sans (not display — this film speaks quietly). Words resolve and dissolve independently inside the line: `You don't think about` → `finding` → `a plumber.` The greyed words drop to `--m-muted` as the next arrives. |
| 4.0–6.8 | **Turn** | Same position, new line: `You just search.` Two words. Full stop. Long hold — the empty frame is doing the work. |
| 6.6–9.6 | **The thesis** | `Getting found should feel that natural.` The word `found` in `--m-signal-ink`. |
| 9.4–12.6 | **The bot arrives** | Four blue dots drift in from the edges, converge, and merge into the Momentum Bot's disc — the mark's ring closing around them last. Scale up. It blinks once. No type on screen. |
| 12.4–16.0 | **The bar** | The bot shrinks to a small avatar and docks into the left of an input bar that draws itself across the frame: `Ask Momentum anything…` with a signal-filled send button. Cursor blinks. |
| 15.8–19.4 | **The question** | Types in: `should I raise my Google Ads budget?` The bar grows taller to hold the text, the send button lifts, the bot reacts. |
| 19.2–24.0 | **The answer** | The bar becomes a conversation. Answer arrives as three short paragraphs, revealed line by line: `Not this month.` / `Your top campaign is capped by conversion rate, not budget.` / `Fix the landing page first — I'd rather spend $400 there than $400 more on clicks.` The bot's expression shifts to focused, then settles. |
| 23.8–26.4 | **The dashboard** | Skeleton change: a single dark card slides up from the bottom edge on `--m-deep`, showing a calm summary UI — three labelled rows (`Calls` / `Forms` / `Named leads matched`), a small sparkline, no values presented as real. Caption: `Illustrative.` |
| 26.2–28.4 | **The close** | Card slides away. Paper. One line: `Then most of it, handled.` |
| 28.2–30.0 | **Lockup** | Mark + `MOMENTUM`, small and centred, `needmomentum.com` beneath. Bot peeks in from the lower edge on the final half-second and holds — the only wink in the slate. |

## Copy (exact strings)

```
You don't think about finding a plumber.
You just search.
Getting found should feel that natural.
Ask Momentum anything…
should I raise my Google Ads budget?
Not this month.
Your top campaign is capped by conversion rate, not budget.
Fix the landing page first — I'd rather spend $400 there than $400 more on clicks.
Calls · Forms · Named leads matched
Illustrative.
Then most of it, handled.
MOMENTUM · needmomentum.com
```

## Craft notes

- **The answer copy is the whole film.** It has to sound like an operator, not a chatbot:
  specific, slightly contrarian, willing to tell you not to spend. That is Momentum's
  actual voice and it is what makes this different from every other AI-assistant ad.
- Per-word opacity: each word in a kinetic line has its own in/out envelope as a function
  of `t`. Build the line as spans and drive them individually.
- The four-dots-become-the-bot beat must land. Dots travel on eased paths to their final
  positions; the ring scales in last with emphatic easing. It is the film's one flourish.
- Type is Nunito Sans here, not Archivo Black, except the lockup. Display weight would
  break the calm.
- Vertical composition: keep everything inside a centred safe area with generous margins;
  nothing important within 120px of any edge.
- Anti-slop watch: an AI-assistant film is one careless decision away from a glowing orb.
  The bot is a flat disc. No glow, no gradient, no pulse ring.
