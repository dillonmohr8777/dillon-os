# Align in Motion — landscape deck (revised)

Editable, self-contained rebuild of two AlignHCM 60-second motion videos:

| # | File | Video |
|---|------|-------|
| 04 | `04-public-service-cannot-pause.html` | Public Sector sizzle |
| 05 | `05-gtaa-case-study.html` | GTAA case study |

Each is 1920×1080, seven scenes, 60 seconds, and plays automatically in any
modern browser.

## What changed in this revision

1. **Body copy is much bigger and more readable.** Supporting text jumped from
   ~28 px to **47 px** (43 px on the split scenes), the color went from a dim
   gray to a bright `#cfdaee`, and every scene is now vertically centered so it
   fills the frame instead of clustering in the top-left with a large empty
   void.
2. **The floating glass "gem / rhombus" shapes are gone.** The background is now
   a clean navy gradient with a faint grid, soft brand glows, and a single
   oversized watermark word per scene. No decorative diamonds anywhere.

Everything else (brand colors, the Playfair serif headline with the orange
accent word, the duotone illustration panels, the logo, footer, and pager) is
kept faithful to the originals.

## Record a new MP4

1. Open the `.html` file in Chrome (double-click, or drag it into a tab).
2. It auto-plays. Press **space** to replay, **H** to hide the on-screen
   controls, **← / →** to scrub.
3. Screen-record the 60-second pass (QuickTime, OBS, or Chrome's built-in
   recorder). The stage scales to your window, so make the window 16:9 or use a
   1920×1080 capture region for a pixel-perfect export.

Pre-rendered H.264 previews are included as
`*-REVISED.mp4` if you just need the file right now.

## Edit the content

- **Copy:** edit the text directly inside each `.html` file. The orange accent
  word is wrapped in `<em>…</em>`.
- **Scene length / order:** change `data-dur="8"` (seconds) on any `<section
  class="scene">`, or reorder the sections. Durations should sum to 60.
- **Type sizes / colors / spacing:** all live in `align-motion.css`
  (`--body`, `.body`, `.headline`, `.h-xl/.h-lg/.h-md`, etc.).
- **Images:** the duotone panels in `assets/` are reused from the original
  renders. Drop in replacements at the same names.

## Files

```
align-motion.css     shared design system (this is where the two fixes live)
align-motion.js      timeline driver (play/pause/scrub, auto-hide UI, loop)
fonts.css            Playfair Display + Inter, embedded so it works offline
assets/              logo + the four illustration panels
```

Fonts are embedded as base64, so the deck renders identically with no network
connection.
