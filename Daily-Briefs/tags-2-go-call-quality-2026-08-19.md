---
date: 2026-08-19
client: Tags 2 Go
status: live
verification_status: verified
tags:
  - briefing
  - google-ads
  - tags-2-go
  - call-quality
source_refs:
  - 12_Brain/01_Captures/2026-08-19 - Tags 2 Go call quality and CTR check.md
  - 12_Brain/07_Reviews/2026-08-19 - Tags 2 Go call quality.md
---

# Tags 2 Go | were those two calls good, and is 10% CTR real?

**Yes on both, with limits.** The two conversions were 3-minute and 4-minute ad calls. The CTR is real local "near me" demand on a campaign that barely shows. Do not raise budget yet. Confirm with the client whether those two Aug 18 late-morning calls became visits.

Live read Aug 17 to 19 (Aug 19 still open at this pull): Search-1, CID `921-429-2423`. **500 impr, 52 clicks, $34.97, 10.4% CTR, 2 conv.** Morning four-client snapshot was $33.04 / 50 clicks; Aug 19 kept spending.

## The two conversions

`Calls from ads` only counts calls **≥ 60 seconds**. Eight ad-originated calls hit the account. Two cleared the bar:

| When (account TZ, Eastern) | Duration | Counted? |
|---|---:|---|
| Aug 17 1:55pm | 26s | no |
| Aug 17 4:42pm | 16s | no |
| Aug 17 4:42pm | 49s | no (7s short) |
| **Aug 18 11:02am** | **3m 07s** | **yes** |
| **Aug 18 11:23am** | **4m 13s** | **yes** |
| Aug 18 3:28pm | 3s | no |
| Aug 19 9:44am | 2s | no |
| Aug 19 11:29am | 23s | no |

Both counted calls: received, US, mobile click-to-call from the ad (`HIGH_END_MOBILE_SEARCH`), not a website widget. 21 minutes apart. Counting is `MANY_PER_CLICK`, so this can be two people or one callback. Ads cannot prove a paid job.

Attributed keywords: exact `auto tags near me` and phrase `car registration`. Search-term report only names `auto tags near me` (5 clicks on Aug 18, 1 conv). Google hid the other converting query.

**Ask the client:** two inbound calls around 11:00–11:30am on Monday Aug 18, about 3 minutes and 4 minutes. Were they real title/tag customers?

## Why CTR is ~10% and why that is not a scale signal

| Check | Result |
|---|---|
| Invalid clicks | 2 invalid, **3.7%** rate. Not fake CTR. |
| Insurance leakage | **0 clicks.** 1 impression. Not the CTR story. |
| Device split | Mobile 10.2% CTR (48 clicks). Desktop 10.3% CTR (3 clicks). Same rate. |
| Query mix | `auto tags near me` 11 clicks / 11.5% CTR / 1 conv. `tag agency near me` 21% CTR. `notary near me` 16% CTR, $5, 0 conv. |
| Auction | Search IS **16.7%**. Rank-lost **83%**. Budget-lost **0%**. Abs-top IS **10%**. |
| Quality score | `auto tags near me` QS **1**; creative, landing page, predicted CTR all **below average**. |

The campaign only enters auctions it can win inside a 5-mile circle on exact/"near me" tag language. People who type `auto tags near me` in that circle click. 10% CTR on 500 impressions is a small-sample, high-intent slice. Raising the $15/day cap while rank-lost is 83% and QS is 1 mostly buys more losing auctions, not more of this CTR.

Hour 11am Eastern is the only hour with conversions (14 clicks, $10.23, both long calls). 3pm Eastern ran 18% CTR with 11 clicks and 0 long calls.

## Not junk, not perfect

On-intent: tag/title/registration queries. The live landing page is the Philadelphia title-registration URL and does offer tags, titles, plates, notary, and insurance paperwork.

Watch:

- `notary near me`: 7 clicks, $5, 0 long calls. On-service for this shop, weaker than tag queries.
- `jack rabbit auto tags norristown`: 1 competitor click. Negative after approval.
- RSA still `APPROVED_LIMITED` (government documents). That matches QS 1 more than it matches the actual CTR.
- Leftover exact `car insurance` / `auto insurance` still enabled and still not spending. Pause them anyway.

## Do not do yet

No budget raise. No bid change. No send. Client confirmation of the two Monday calls is the next evidence, then ad/LP quality work to fix QS 1.
