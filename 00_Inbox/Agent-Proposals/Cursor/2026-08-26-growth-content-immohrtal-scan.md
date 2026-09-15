---
note_type: proposal
status: draft
created: 2026-08-26
agent: growth-content
privacy: redacted
source_refs:
  - https://immohrtal-website.netlify.app
  - C:/Users/dillo/repos/immohrtal-website/src/content/album.ts
  - https://onsiteconcretelandscape.com/
---

# Growth-content scan — IMMOHRTAL preview and Onsite organic

No publish. Local scan only.

## IMMOHRTAL preview (`https://immohrtal-website.netlify.app`)

- One H1-class lockup is present: *Dance With The Delusional*.
- All five platform hrefs in `src/content/album.ts` are `null` (Spotify, Apple Music, YouTube, SoundCloud, Pre-Save).
- All four social hrefs are `null`; handles render as `@immohrtal` with nowhere to go.
- Track audio `src` values are `null` by design for the public preview.
- Booking email and phone are filled. Email capture exists on the live page.

Next local draft, not a ship: fill platform and social hrefs only when Dillon supplies final URLs. Do not invent DistroKid or streaming links.

## Onsite organic (GSC, 2026-08-18 to 2026-08-24, property `https://onsiteconcretelandscape.com/`)

- `onsite concrete`: 2 clicks, 10 impressions, avg position 15.6.
- Other sampled queries are impression-only.
- Live H1 is not campaign-shaped. That matches the queued Divi hero repair.

## Shadow organic (GSC, same window, `sc-domain:shadow-heating.com`)

- Brand queries impress (`shadow heating and cooling` 16 impressions, position ~4.9) with 0 clicks in this window.
- `ac repair hampshire il` sits around position 75.

Do not treat GSC as Ads delivery. Ads API remains quota-blocked.
