# Reporting Log

## DO NOT REPORT THE 17 CONVERSIONS AS-IS - standing constraint, 2026-09-09

Before any client report, re-examine the 17 conversions in the 2026-04-01 to
2026-09-08 range on account 285-398-1364. At least 6 came from a competitor
brand search (`timberline landscaping`, 20 clicks, $161.22, 6.00 conversions =
35% of the account) and at least 1 more from another competitor
(`landscape endeavors`, 1.00 conv). Presenting those to David as Omega demand
would repeat exactly the reporting error the match-back work exists to fix.

Nine search terms total -- 3 competitors and 6 supplier/quarry queries, 49
clicks and $388.14 -- all served through PMax, and ALL NINE show
Added/Excluded: None. No negative has ever been applied on this account.
Adding them is a campaign change and stays approval-gated;
`launch-authority.json` is still status:draft, approvedBy:null.

Full audit: [[2026-09-09 - Omega search terms, first audit]]

This constraint was living in System/approval-queue.md, where a reporting run
would never see it. Moved here 2026-09-14 so it binds at the point of use.

## Conversion count for Sep 7-13, rechecked 2026-09-22

Search | High Intent | Colorado Springs | 2026-07-30, summed from
`_os/automation/google-ads-api/pulls/2026-09-15/Omega_daily_14d.json`:
43 clicks, $331.73, 1.0 platform-reported conversion. Impressions are not in
that file. The 2026-09-14 queue read of 1,028 impressions matches those
clicks, cost, and conversions and was not re-pulled today.

The live landing-page script was fetched again 2026-09-22T06:10:39Z. It does
not fire the Ads conversion on submit. `/thank-you/` does, and it is
`noindex`. The public Sep 14–20 report already tells the client to expect
the count to fall and withholds a new platform total.

Client-facing draft, not sent: [[2026-09-22 conversion disclosure draft]].
The nine negatives in the section above are still unapplied.

## Latest Snapshot


## Ad Performance Notes


## SEO Notes


## Website Changes


## Next Actions

