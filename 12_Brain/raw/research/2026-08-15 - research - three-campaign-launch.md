---
tags: [raw, research, ads]
date: 2026-08-15
---

# 2026-08-15 three-campaign launch attempt

Untrusted-until-compiled receipt. Do not rewrite this file.

## Ask

Operator ordered a live Google Ads login on this Cloud Agent desktop, then three new campaigns in parallel (Onsite, Omega, Kimberly) using tracked URLs those accounts already have.

## Surfaces tried

- Computer use / Chrome → ads.google.com
- Composio Google Ads (list accessible customers)
- Gmail thread search + selected thread reads
- Google Drive file search
- Slack keyword search
- Live fetch of the three candidate landing pages

## Login result

Not signed in. First blocker: 2FA / recovery for the phone ending in 33. Second blocker: Google rejected the VM as an unrecognized device and sent the session to account recovery. MCC not reached. No campaign was created, edited, paused, or enabled in the UI.

Composio Google Ads returned HTTP 429 resource exhausted (developer basic-access quota). Retry delay was on the order of hours. Campaign mutate tools were already restricted in this environment.

## Tracked URLs confirmed (public pages)

These are the existing destinations the packets use. Live fetch 2026-08-15.

- Onsite Google Ads LP: `https://onsite-gads-landing-page.netlify.app/`
- Omega estimate LP: `https://omega-landscaping-landing-page.netlify.app/`
- Kimberly appointment request: `https://www.kimberlyjamesbridal.com/bridal-appointment-request`

Supporting pointers (no secrets copied here): Drive client-access intake named the Onsite Netlify LP; Netlify form mail named the Omega Netlify LP; a July appointment-request notification carried a Google click id on the Kimberly appointment URL; Slack #omega-landscape on 2026-08-10 said the new estimate destination was published and wired.

## What was written instead of a live apply

Three parallel agents produced Search CREATE packets under `Daily-Briefs/`:

- `ads-launch-packet-2026-08-15-onsite.md`
- `ads-launch-packet-2026-08-15-omega.md`
- `ads-launch-packet-2026-08-15-kjb.md`

Parent brief: `Daily-Briefs/ads-launch-2026-08-15-onsite-omega-kjb.md`

## Not done

- No live campaign create
- No client email
- No Smart Bidding change
- No new UTM scheme
- No customer IDs, emails, or phones copied into this receipt
