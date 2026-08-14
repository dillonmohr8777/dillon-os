---
tags: [campaign, growth-workshop, deploy]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
---

# LP date push — Aug 13 → Aug 27 deploy checklist

One-line summary: replace two files on `momentum-workshop-pilot.netlify.app`, verify three dates and the calendar links, done in ~5 minutes.

## What changed (4 edits, 2 files)

| File | Edit |
|---|---|
| `index.html` | 3× visible `Thursday, August 13` → `Thursday, August 27` (hero, rail, ticket) |
| `index.html` | Event-settings form default `value="2026-08-13"` → `value="2026-08-27"` |
| `script.js` | Config default `date: "2026-08-13"` → `date: "2026-08-27"` |
| `script.js` | localStorage key `momentum-workshop-event-v3` → `momentum-workshop-event-v4` |

**Why the key bump matters:** the page caches event config in localStorage. Anyone who already visited would keep seeing August 13 from the old cache. Bumping the key to `-v4` forces every visitor onto the new default. Side effect: any values entered in the on-page "Workshop details" admin form (e.g. a meeting URL) reset to defaults — re-enter the meeting link after deploy if it was set there.

## Deploy (pick one)

**Option A — local project (preferred).** In the local `momentum-workshop-pilot` project folder, replace `index.html` and `script.js` with the two files in this folder, then deploy the same way as previous deploys (Netlify CLI `netlify deploy --prod` or the Netlify UI). Assets (`styles.css`, `assets/`) are untouched.

**Option B — no local copy.** Download the current live `styles.css` and `assets/` files from the deployed site, put them next to these two files, and drag-drop the folder onto the site's Deploys page in the Netlify UI.

## Post-deploy verification

1. Hard-refresh the page (or open a private window): hero, right-rail, and ticket all read **Thursday, August 27** / **12:00 PM ET**.
2. Submit one test registration (use a personal email, first name `Test`): confirmation ticket shows Aug 27.
3. Click the Google Calendar and Outlook links and the ICS download from the confirmation: event lands **Thu 2026-08-27, 12:00–1:00 PM ET**.
4. Check the Netlify Forms dashboard: the test submission arrived on form `workshop-registration` with `event_date=2026-08-27`.
5. Check the WordPress wrapper [momentumvirtualtours.com/growth-workshop](https://www.momentumvirtualtours.com/growth-workshop/) — it embeds the Netlify app in an iframe, so it needs **no change** and should now show Aug 27.
6. Delete/ignore the test registration in the dashboard count.

## Still open (blocks sends, not the deploy)

- **Meeting link** (Zoom/Meet) — decision owed by Sean/Mac. The page works without it; the confirmation and reminder emails need it.
- Seat cap, if any.

## Rollback

Netlify UI → Deploys → select the previous production deploy → "Publish deploy". Old date returns (including the v3 cache behavior).
