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

**Suggested next step:** Run `/hubspot-ops`. Dry-run `_os/automation/bin/hubspot-attribution-repair.js`. Apply filters once HubSpot auth is ACTIVE.

## Draft reply for `#360marketing` (not sent)

Jason, Alexandra, Sean: the two circled segments are the overlap. `GMB_LP_Organic` and `Google P-max Suspensions` both sit at 32 contacts. Organic has Used In 0, so that segment is not emailing or Slacking anyone. PMax still has two HubSpot consumers.

New contacts are still landing in `#360leads` today, but every Source line is blank, and those new records are not joining Christian's June segments. Paid and organic share `fixmygooglelisting.com` form 804 with HubSpot tracking and no hidden UTM/`gclid` fields, so original source cookies mix the two channels.

I stood up a HubSpot Agent plus a dry-run repair CLI. Next gated step is a logged-in portal pass to rewrite the two filters so organic excludes Paid Search and PMax requires it, then map `#360leads` Source to original traffic source. I need Alexandra's live PMax campaign names for the paid filter. I have not posted this and have not written the portal yet.

## Draft reply for Jason / Sean / Dillon DM (not sent)

Jason: I can own this. I did not switch the ads manager. The break lines up with Christian → Alexandra and with those two segments staying at 32. Organic has no workflow attached (Used In 0). Happy to jump on the login call with Alexandra so we can apply the filter split in portal 50612503.

## Links

1. [Channel message](https://momentum3d.slack.com/archives/C06CL0R09A4/p1786986784428959)
2. [Group DM](https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786986997192739)
3. [[12_Brain/projects/HubSpot Attribution Repair]]
