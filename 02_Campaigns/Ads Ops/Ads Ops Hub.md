---
tags: [campaign, ads, moc]
updated: 2026-07-31
---

# Ads Ops Hub

Front door for paid-media execution across Google Ads and Meta. The working
queues below are where the day-to-day lives; the brain pages are the compiled
patterns those queues are supposed to apply.

## Working queues

| Surface | Queue | Use it for |
|---|---|---|
| Google Ads | [[02_Campaigns/Google Ads Optimization Queue\|Google Ads Optimization Queue]] | Bid, structure, and no-spend fixes waiting to ship |
| Meta | [[02_Campaigns/Facebook Ads Optimization Queue\|Facebook Ads Optimization Queue]] | Account-level optimization backlog |
| Meta | [[02_Campaigns/Facebook Ads Testing Queue\|Facebook Ads Testing Queue]] | Planned creative and audience tests |
| Meta | [[02_Campaigns/Facebook Ads Creative Requests\|Facebook Ads Creative Requests]] | Creative asks out to design |
| Meta | [[02_Campaigns/Facebook Ads Budget Shift Log\|Facebook Ads Budget Shift Log]] | Dated record of budget moves and why |
| Meta | [[02_Campaigns/Facebook Ads Weekly Review\|Facebook Ads Weekly Review]] | Weekly wins, losses, budget changes |

## Compiled patterns these queues apply

- [[12_Brain/concepts/Conversion Tracking Setup 2026|Conversion Tracking Setup 2026]] — enhanced conversions, GA4 double-counting, gclid/fbclid stitching, verification order. Every conversion audit starts here.
- [[12_Brain/concepts/Google Ads Conversion Optimization 2026|Google Ads Conversion Optimization 2026]] — bid strategy by conversion volume, PMax structure, no-spend diagnosis.
- [[12_Brain/concepts/Meta Lead Ads Optimization 2026|Meta Lead Ads Optimization 2026]] — optimization goal, Advantage+ behavior, pixel/CAPI, rejection traps.

## Standing rules

- Conversion audits run in the order the tracking page specifies — a bid change
  on top of unverified conversions optimizes toward noise.
- Report only what the source proves: see
  [[12_Brain/concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]].
- Blocked live reads are an access problem before they are a data problem: see
  [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]].

## Links
- [[02_Campaigns/Campaign Index|Campaign Index]] · [[01_Clients/Client Index|Client Index]]
