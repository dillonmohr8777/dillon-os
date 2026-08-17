---
source: slack
channel: "#360marketing"
channel_id: C06CL0R09A4
requested_by: Jason Fallon
permalink: "https://momentum3d.slack.com/archives/C06CL0R09A4/p1786986784428959"
type: ad-task
client: Momentum 360
status: in-progress
priority: urgent
source_as_of: 2026-08-17T17:20:00Z
tags: [slack, momentum360, hubspot, attribution, urgent]
---

# Restore HubSpot Google Ads vs website form attribution

**Exact ask:** Figure out attribution in HubSpot for Google Ads campaigns and the website form. Organic landing-page leads should be website leads, not ad-campaign leads. Confirm Slack vs email routing. Ads manager switch (Christian → Alexandra) unsynced the setup.

**Context:** Group DM https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786986997192739. Screenshot of Active Contact segments: `GMB_LP_Organic` 32 / Used In 0 and `Google P-max Suspensions` 32 / Used In 2 circled; `Google P-max-3-reviews` and `META Reviews` X'd. Aug 10 Jason already asked Alexandra why segment qty had not moved.

**Suggested next step:** Send the drafted Slack replies after Dillon says send. Map `#360leads` Source to Original Traffic Source. Add hidden UTM/`gclid` fields on CF7 804.

## Draft reply for `#360marketing` (not sent)

Jason, Alexandra, Sean: the two circled segments were the overlap. I rewrote the filters in portal 50612503.

`GMB_LP_Organic` went 32 → 7 (excludes Paid Search / Paid Social). `Google P-max Suspensions` went 32 → 23 (requires Paid Search and PMax campaign names, not every ads name containing GMB). Shared contacts went 19 → 0. `GMBs Phone Calls` stayed 7.

Organic still has Used In 0, so that segment is not emailing or Slacking anyone. New `#360leads` posts still print a blank Source line because Slack is mapped to the CallRail `source` field, not Original Traffic Source. Paid and organic still share `fixmygooglelisting.com` form 804 with no hidden UTM/`gclid` fields, so first-touch cookies can still stick. I have not posted this.

## Draft reply for Jason / Sean / Dillon DM (not sent)

Jason: the circled pair is split. Organic 7, PMax 23, overlap 0. I did not switch the ads manager. Remaining: Slack Source mapping plus hidden fields on the WordPress form. Say send if you want this in `#360marketing`.

## Links

1. [Channel message](https://momentum3d.slack.com/archives/C06CL0R09A4/p1786986784428959)
2. [Group DM](https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786986997192739)
3. [[12_Brain/projects/HubSpot Attribution Repair]]
