---
client: Omega Landscaping
client_id: omega-landscaping
status: draft
last_touched: 2026-09-22
next_action: Approve or reject this disclosure before any client send. The live Sep 14-20 report already states the correction and withholds platform metrics.
due: none
source_refs:
  - "System/approval-queue.md"
  - "_os/automation/google-ads-api/pulls/2026-09-15/Omega_daily_14d.json"
  - "https://omega-landscaping-landing-page.netlify.app/script.js"
  - "https://omega-landscaping-landing-page.netlify.app/thank-you/"
  - "https://momentum-weekly-client-reports.netlify.app/reports/omega-landscaping/"
  - "gmail-draft:r4420360796608729033"
tags: [client, omega, disclosure, draft]
---

# Omega conversion disclosure — draft, do not send

Status: drafted 2026-09-22. Not pasted into Gmail. An older draft already exists (`r4420360796608729033`, subject “Omega conversion tracking: we found a counting error…”, dated 2026-09-14). That draft explains the click-before-accept defect and then asks for Google Ads Admin, Wix, and GoHighLevel access. This draft adds the measured week and does not hold the correction behind that access ask.

## What was rechecked today

Fetched 2026-09-22T06:10:39Z.

- `https://omega-landscaping-landing-page.netlify.app/script.js` returned HTTP 200, 4,428 bytes, sha256 `a226aeb4f7990114d3e9607973d4d3fb8f6c88e71c4645b5197fd5c43ee91067`. The submit handler records `form_submit` and does not fire the Ads conversion. The comment in the live file says `/thank-you/` fires the conversion and Netlify serves that page only after acceptance.
- `https://omega-landscaping-landing-page.netlify.app/thank-you/` returned HTTP 200, carries `noindex`, and fires `AW-16794883273/QzZeCKWOnvMbEMmptsg-`. sha256 `0af9c0b12d9c93df7976afe312c0458041750577efcee263c37d2f882fdab7cf`.
- The public report index `…/reports/omega-landscaping/` is titled **Sep 14 to Sep 20, 2026**. It already says the count was inflated by bots, the fix was verified live on September 14, and reported conversions should fall. It also says current platform metrics are not established for that report, so they are not estimated. A dated PDF for Sep 7–13 and for Sep 14–20 both returned 404.

## Numbers that can be stated

From `_os/automation/google-ads-api/pulls/2026-09-15/Omega_daily_14d.json`, campaign “Search | High Intent | Colorado Springs | 2026-07-30” (`24082267830`), summed for 2026-09-07 through 2026-09-13:

- 43 clicks
- $331.73
- 1.0 platform-reported conversion

Impressions are not in that daily file. The 2026-09-14 approval-queue read of the same campaign and window is 1,028 impressions, 43 clicks, $331.73, 1 conversion. Clicks, cost, and conversions match the file. The 1,028 impressions were not re-pulled today.

These figures are one Search campaign. They are not the whole account, and they are not named leads. The nine competitor and supplier negatives from the 2026-09-09 audit are still unapplied in the approval queue. This session did not change the Ads account.

## Replacement text, if you want it sent later

Hi David and Christian,

For September 7 through 13, the Search campaign “High Intent | Colorado Springs” recorded 43 clicks and $331.73, with 1 platform-reported conversion. That conversion count is not a count of accepted estimates.

The landing page was firing the Google Ads conversion when someone clicked Submit, before the form was accepted and before the bot filter ran. Filtered submissions could still be reported as conversions. I corrected that on September 14. I checked the live page again on September 22: the conversion now fires on the thank-you page, which is served only after the form is accepted.

Reported conversions from that page should drop after September 14. That drop is the bad count leaving. It is not a sign the campaign suddenly got worse.

The September 14–20 progress page already says this in plain language and does not print a new conversion total, because a platform event is still not a named lead. I have not added the nine competitor and supplier negatives yet. That is a separate account change and I will not apply it unless you approve the list.

Thanks,

Dillon

## Still gated

Do not send this email. Do not apply the nine negatives. Say “release the AI division gates” only if you want those twenty decision records flipped. This draft does not flip them.
