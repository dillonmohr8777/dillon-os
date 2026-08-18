---
source: slack
channel: "#360marketing"
channel_id: C06CL0R09A4
requested_by: Jason Fallon
permalink: "https://momentum3d.slack.com/archives/C06CL0R09A4/p1786986784428959"
type: ad-task
client: Momentum 360
status: done
priority: urgent
source_as_of: 2026-08-17T19:20:00Z
tags: [slack, momentum360, hubspot, attribution, urgent]
---

# Restore HubSpot Google Ads vs website form attribution

**Exact ask:** Figure out attribution in HubSpot for Google Ads campaigns and the website form. Organic landing-page leads should be website leads, not ad-campaign leads. Confirm Slack vs email routing. Ads manager switch (Christian → Alexandra) unsynced the setup.

**Context:** Group DM https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786986997192739. Screenshot of Active Contact segments: `GMB_LP_Organic` 32 / Used In 0 and `Google P-max Suspensions` 32 / Used In 2 circled; `Google P-max-3-reviews` and `META Reviews` X'd. Aug 10 Jason already asked Alexandra why segment qty had not moved.

**Suggested next step:** Momentum Zapier login to remap `#360leads` Source on zap 332246329. WordPress or GTM login to add hidden URL-param UTM/`gclid` on CF7 804 (paste kit in the SOP).

Sent 2026-08-17:

- `#360marketing` thread: https://momentum3d.slack.com/archives/C06CL0R09A4/p1786994238641579?thread_ts=1786986784.428959
- Jason/Sean/Dillon DM: https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786994238851459?thread_ts=1786986997.192739

## Sent reply for `#360marketing`

Jason, Alexandra, Sean: the two circled segments were the overlap. Filters are rewritten in portal 50612503.

`GMB_LP_Organic` went 32 → 7 (excludes Paid Search / Paid Social). `Google P-max Suspensions` went 32 → 23 (requires Paid Search and PMax campaign names, not every ads name containing GMB). Shared contacts went 19 → 0. `GMBs Phone Calls` stayed 7.

Organic now emails and in-app notifies Jason and Sean when a contact joins that segment (future members only). HubSpot copies Original Traffic Source into empty Source five minutes after a new contact is created, so the CRM field fills for website leads. `#360leads` Slack is still Zapier zap 332246329 reading CallRail Source at create time, so that Slack line can still print blank until the zap maps Original Traffic Source. Duplicate `#360leads` posts are zaps 332246329, 369135469, and 368432826 — I cannot pause Zapier from here. `fixmygooglelisting.com` form 804 still has no hidden UTM/gclid fields; GTM-WHKR99SC is on the page if someone with GTM or WordPress access wants those injected.

## Sent reply for Jason / Sean / Dillon DM

Jason: the circled pair is split. Organic 7, PMax 23, overlap 0. Organic now has email + in-app routing. Remaining: Zapier Source mapping on zap 332246329, and hidden fields on the WordPress form.

## Remaining follow-up (2026-08-17)

HubSpot now has form-field properties `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. Captured CF7 form is not writable via this app. Zapier / WordPress / GTM still need their own logins. Paste kit is in [[04_SOPs/HubSpot Channel Attribution SOP]].

Sent remaining:

- `#360marketing` thread: https://momentum3d.slack.com/archives/C06CL0R09A4/p1786995217871659?thread_ts=1786986784.428959
- Jason/Sean/Dillon DM: https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786995218093179?thread_ts=1786986997.192739

## Remaining `#360marketing` reply

Jason, Alexandra, Sean: HubSpot-side remaining is in. Portal 50612503 now has form-field properties utm_source, utm_medium, utm_campaign, utm_content, utm_term (gclid already existed). I cannot write the captured WordPress form from this app, and I cannot log into Zapier, WordPress, or GTM from here.

#360leads Source= is still zap 332246329 reading CallRail Source at create. Remap that Slack line to Original Traffic Source: https://zapier.com/webintent/edit-zap/332246329

Duplicates: keep 369135469 (PMax named posts) and 368432826 (Meta Reviews). Add a Filter on 332246329 so the catch-all does not also fire for those form creates. Do not pause the campaign zaps.
https://zapier.com/webintent/edit-zap/369135469
https://zapier.com/webintent/edit-zap/368432826

GTM-WHKR99SC is Ads conversion tags only. To stamp UTMs on CF7 804, add the hidden CF7 fields or a GTM Custom HTML tag that copies URL params only (not the gclid cookie). Paste kit is in the HubSpot Channel Attribution SOP.

## Remaining DM reply

Jason: HubSpot now has utm_* form fields ready. #360leads Source still needs zap 332246329 remapped to Original Traffic Source. Filter that catch-all so it does not double-post the PMax and Meta zaps. CF7/GTM hidden fields still need WordPress or GTM login.

## Links

1. [Channel message](https://momentum3d.slack.com/archives/C06CL0R09A4/p1786986784428959)
2. [Group DM](https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786986997192739)
3. [[12_Brain/projects/HubSpot Attribution Repair]]
