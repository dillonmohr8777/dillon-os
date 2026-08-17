---
note_type: source-capture
created: 2026-08-17
captured_at: 2026-08-17T17:20:00Z
source_type: slack
tags: [brain, slack, hubspot, attribution, momentum360]
---

# Jason Fallon HubSpot attribution incident 2026-08-17

Read-only Slack capture. No lead names, phones, or mailboxes. Nothing was posted back to Slack.

## Asks

1. Group DM Jason / Sean / Dillon, 13:16 ET: figure out HubSpot attribution for Google Ads campaigns and the website form. Setup used to show leads by channel. After the ads-manager switch it is wrong.
2. Same thread, 13:18 ET: ads manager switch was Christian to Alexandra. Alexandra worked the existing three campaigns. Organic is now showing the same leads as one paid channel.
3. `#360marketing`, 13:13 ET: leads look the same in two HubSpot locations; the other two show nothing new. Organic landing-page leads should be website leads, not ad-campaign leads. Confirm whether leads still go to Slack, email, or somewhere else.

## Segment screenshot (Jason, `#360marketing`)

Active Contact segments, creator Christian Tippens, last edited late June 2026:

| Segment | Size | Used In | Jason mark |
|---|---:|---:|---|
| GMB_LP_Organic | 32 | 0 | circled |
| Google P-max Suspensions | 32 | 2 | circled |
| Google P-max-3-reviews | 3 | 1 | X |
| GMBs Phone Calls | 7 | 1 | none |
| META Reviews | 5 | 1 | X |

GMB_LP_Organic and Google P-max Suspensions share size 32. Organic has zero downstream uses.

## Prior signal

`#360marketing`, 2026-08-10: Jason asked Alexandra why ads-tied HubSpot segments still showed the same quantity. Sean said campaigns had been live about 2-4 days and there were no leads yet.

## Live routing observed 2026-08-17

1. `#360leads` still posts `New Hubspot Lead / Contact` records. The `Source =` line is blank on every sampled post from 2026-08-15 through 2026-08-17.
2. One CallRail-style contact posted three times within one second.
3. `#gmbs-reinstatement` still receives Meta form leads via Zapier with campaign names filled in.

## Website evidence (public HTML)

1. `fixmygooglelisting.com` loads HubSpot tracking `js.hs-scripts.com/50612503.js` (WordPress plugin).
2. Homepage form is Contact Form 7 id 804. Fields: name, email, phone, suspension reason, Google profile name. No hidden `gclid`, `utm_source`, `utm_medium`, or `utm_campaign` fields.
3. Same form id 804 is embedded twice on the homepage. Thank-you redirect: `/thank-you/`. A second CF7 form 1077 redirects to `/lsa-thank-you/`.
4. `momentumvirtualtours.com` also loads HubSpot portal 50612503. Homepage consultation form is CF7 49990. Footer contains a HubSpot-hosted form embed (`hbspt.forms.create`).

## Permalinks

1. https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786986997192739
2. https://momentum3d.slack.com/archives/C06CL0R09A4/p1786986784428959
3. https://momentum3d.slack.com/archives/C06CL0R09A4/p1786373038545799
