---
tags: [campaign, growth-workshop, deploy]
campaign: "[[Growth Workshop]]"
created: 2026-08-14
updated: 2026-08-14
---

# LP date push — Aug 27 + calendar auto-add deploy checklist

One-line summary: deploy the patched LP (now including the public ICS), verify Aug 27 + Meet + calendar links, then (separately) turn on the registrant invite webhook.

## What changed

| File | Edit |
|---|---|
| `index.html` | Aug 27 copy, calendar-open default on, honest auto-invite FAQ/privacy, Meet URL in operator form |
| `script.js` | localStorage key `momentum-workshop-event-v5`, Meet default, ICS with stable UID / TZID / 24h+1h alarms |
| `momentum-workshops.ics` | **new — must deploy.** Public calendar file the confirmation `webcal://` link already points at |
| `netlify/functions/calendar-invite.js` | optional. Only if you skip the Apps Script webhook |

**Why the key bump matters:** v4 cached an empty meeting URL. v5 forces every visitor onto the live Meet default.

## Deploy (pick one)

**Option A — local project (preferred).** In the local `momentum-workshop-pilot` project folder, replace `index.html` and `script.js`, add `momentum-workshops.ics` at the site root (same folder as `index.html`), then deploy as usual.

**Option B — no local copy.** Download live `styles.css` and `assets/` from the site, put them next to these files (including the ICS), drag-drop the folder onto Netlify Deploys.

**Option C — agent deploy script.** `NETLIFY_AUTH_TOKEN=… node _os/automation/bin/workshop-lp-deploy.js` mirrors live assets, overlays the three patched files, and publishes to the existing site named `momentum-workshop-pilot`. It will not create a site. `--dry-run` prints the file list only.

**Option D — GitHub Actions (this is where the token actually lives).** `NETLIFY_AUTH_TOKEN` is a repository Actions secret on `dillon-os` (created 2026-08-07). GitHub will not return the value. The workflow `.github/workflows/workshop-lp-deploy.yml` injects it at runtime. `workflow_dispatch` only works after that file is on `main`. A one-shot `push:` trigger on this branch published production on 2026-08-14 (run 31834536835) and was then removed so later commits do not auto-deploy.

Do **not** drag-drop only the two HTML/JS files — without styles/assets/ICS the site breaks or Apple/webcal 404s.

The Netlify function is optional. Layer-1 auto-invite is the Apps Script webhook in [[../Calendar Auto-Add|Calendar Auto-Add]] — it does not have to ship with this static deploy.

## Post-deploy verification

1. Hard-refresh: hero, rail, and ticket read **Thursday, August 27** / **12:00 PM ET**.
2. `https://momentum-workshop-pilot.netlify.app/momentum-workshops.ics` downloads, `METHOD:PUBLISH`, `DTSTART;TZID=America/New_York:20260827T120000`.
3. Submit one test registration (personal email, first name `Test`): Google Calendar template opens with **Thu 2026-08-27, 12:00–1:00 PM ET** and the Meet location.
4. Confirmation Google / Outlook / ICS controls use the same window.
5. Netlify Forms: `workshop-registration` row with `event_date=2026-08-27`.
6. WordPress wrapper still needs **no change**.
7. After the webhook is on: the test Gmail should receive a Google Calendar invitation for the same event. Delete that test guest from the event if you do not want them on the attendee list.

## Still open (does not block this deploy)

- Sean/Mac may replace the Meet URL with Zoom. If they do: update the canonical Google event, bump or rewrite the ICS (`--write-ics`), paste the new URL into drip C1–C3, and bump the localStorage key again.
- Sender mailbox and seat cap.
- Apps Script / function webhook (layer 1) — LP layer 2 works without it.

## Rollback

Netlify UI → Deploys → previous production deploy → Publish deploy.
