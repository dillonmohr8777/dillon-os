# 03 · MEET THE MOMENTUM BOT

**Reference** `refs/03-mascot.mp4` — the `folk` mascot film. A soft cream blob with a tiny
antenna lives inside an iPhone Messages thread, reacting to the conversation with real
expression changes, occasionally leaving the phone to appear at full size against white.
Closes `most AI are tools / Folk is a friend / folk — just folk it`. 50s, 16:9.

**Ours** `1920×1080 · 30fps · 34.0s`

This is the film Dillon asked for by name — *"the momentum bot, but it looks just like
that, but it's branded, like, blue and white."* It introduces the character and, through
one conversation, states Momentum's actual differentiator: they answer the question a
business owner really has, instead of mailing a dashboard.

Uses `brand/momentum-bot.svg` + `brand/bot-rig.js`. Pose the bot from `seek(t)` —
never swap in a second piece of artwork.

Surface: `--m-paper`, with two deliberate inversions to `--m-deep`. Message bubbles:
incoming `--m-panel` with `--m-ink`; outgoing `--m-brand` with `--m-on-brand`.

## Beats

| t | Beat | What happens |
|---|---|---|
| 0.0–2.4 | **The thread** | A phone frame, centred but slightly off-axis, drawn entirely in CSS. A messages thread with a header reading `Momentum` and the bot's disc as the avatar. Empty thread, cursor in the field: `Message Momentum`. |
| 2.2–6.4 | **First message** | Outgoing bubble types in character by character: `did anyone actually call from the ads last month?` Bubble commits with a small spring. The bot appears from behind the bubble — peeking — eyes tracking the text. |
| 6.2–11.0 | **First answer** | Incoming bubbles, staggered: `11 calls.` / `9 were real people.` / `2 were the same wrong number.` The bot's expression moves neutral → focused → pleased across the three. Small caption under the thread: `Illustrative. Not client data.` |
| 10.8–14.4 | **Zoom out** | The camera pulls back from the phone; the phone tilts away in perspective; the bot detaches from the screen and scales up into the room, now large and centred against paper. Its ring catches the move. This is the film's biggest skeleton change — earn it. |
| 14.2–17.4 | **The statement** | Bot large, left. Type right, flush-left, low density: `Most agencies` / `send a report.` Ink, with `send a report` in `--m-muted` — greyed, because it is the thing being dismissed. |
| 17.2–20.4 | **The turn** | Hard inversion to `--m-deep`. Bot re-lit, its blue reading as `--m-brand-lift` on dark. Type: `Momentum sends` / `the answer.` The word `answer` in `--m-signal` — legal on dark. |
| 20.2–25.6 | **Second exchange** | Back to a thread, but a *different* skeleton: bubbles now float free on paper with no phone frame, larger, cinematic. Outgoing: `what happens when someone asks AI for a plumber?` Incoming: `we make sure it says your name.` The bot does its widest expression change of the film on that line. |
| 25.4–29.2 | **What that's called** | Three labels resolve around the bot on a stagger, each with a hairline connector: `SEO — search engines` · `AEO — answer engines` · `GEO — generative search`. Bot looks at each in turn as it lands. |
| 29.0–31.6 | **The line** | Everything clears to paper. Bot small, centred. One line under it in `--m-font-script` Caveat, the single script accent of the film: `most agencies are vendors.` Then, in Archivo Black under that: `Momentum is on your side.` |
| 31.4–34.0 | **Lockup** | Bot walks/settles into position beside the official mark; mark + `MOMENTUM` + `needmomentum.com`. Bot does one slow blink on the last beat. Hold. |

## Copy (exact strings)

```
Momentum                                   (thread header)
Message Momentum                           (input placeholder)
did anyone actually call from the ads last month?
11 calls.
9 were real people.
2 were the same wrong number.
Illustrative. Not client data.
Most agencies send a report.
Momentum sends the answer.
what happens when someone asks AI for a plumber?
we make sure it says your name.
SEO — search engines
AEO — answer engines
GEO — generative search
most agencies are vendors.                 (Caveat, the one script accent)
Momentum is on your side.
MOMENTUM · needmomentum.com
```

## Craft notes

- The numbers (`11 calls` / `9 real`) are the film's sharpest moment because they are the
  **named-lead match-back** Momentum actually does — but they are illustrative UI and the
  caption must say so. No client name appears anywhere.
- Typing animation: derive the visible substring from `t`, with a caret that blinks on a
  `t`-derived square wave. No timers.
- The bot must never teleport. Every appearance either grows from something, slides from
  behind something, or is already there. Its bob is a slow sine of `t` at low amplitude —
  alive, not bouncing.
- Expression range across the film should hit at least: neutral, focused, pleased,
  surprised, and a slow blink. If two beats read the same, the rig is being under-used.
- Anti-slop watch: chat UI is where glassmorphism creeps in. Bubbles are flat fills with a
  radius. No frosted panels, no blurred backdrops, no glow behind the bot.
