# Google Ads: delivery, signal quality, and qualified leads

September 4, 2026. Partial live account audit plus current Google documentation review. The initial findings below are a pre-change baseline. Subsequently, under Dillon's explicit $50/day recovery authorization, Omega's High Intent campaign was enabled and the $20 Concrete Call Only campaign paused. Fresh reload verified High Intent Eligible, all other campaigns Paused, and $50/day combined enabled budget. See [restart receipt](OMEGA-RESTART-RECEIPT.md). No bid, goal, tag, budget-field, ad or client-communication changes were made by this audit task. Actual post-change delivery and qualified outcomes remain pending.

## What the live evidence actually says

The first issue is not demonstrably that Google is buying lots of bad leads. In the verified last-seven-day view, Omega and Onsite barely delivered. Separately, their measurement configurations have concrete issues that would weaken any attempt to optimize for real business outcomes. These are two different problems, and both need attention.

| Client / exact customer | Live period and delivery | Current verified configuration | Interpretation |
|---|---|---|---|
| Omega / 2853981364 | August 28–September 3, Mountain Time: 5 impressions, 0 clicks, $0 spend | The concrete-services call-only Search campaign is enabled and eligible at $20/day. Several other visible Search campaigns are paused. Qualified-lead and won-contract upload actions are Primary but Inactive. Form Submission is marked Needs attention. | Establish why intended delivery is absent before proposing scale. The existence of upload actions does not prove a working CRM feedback loop. |
| Onsite / 1033715894 | August 28–September 3, Pacific Time: 3 impressions, 0 clicks, $0 spend | High Intent Solano County Search is enabled at $7/day using Maximize Clicks. The old Smart campaign and PMax are paused. Four actions are Misconfigured; all 14 listed actions are Primary. | The active bid strategy optimizes clicks. Measurement needs validation before switching the objective. Multiple Primary actions are a duplication risk, not proof that actual leads were double-counted. |
| Kimberly James Bridal / 8145506229 | August 28–September 3, Eastern Time: 454 impressions, 25 clicks, $101.91 spend | Both campaigns are currently Paused in the campaign table. The cancelled duplicate account was excluded. | Past-window spend is not current active delivery. Preserve the pause; Google performance must remain separate from the Meta lead workflow. |

Source: read-only Google Ads account selector, Overview, Campaigns and conversion-action tables in this session. Detailed redacted settings: [live evidence](work/google-ads-live-evidence.json). No qualified-lead, connected-call, estimate, or sales counts have been reconciled. Conversion reporting is pending validation.

Coverage is incomplete. Omega campaign pagination, 28-day comparisons, change history, full location/network/search-term settings, actual landing-page tracking and CRM/call-log reconciliation are not finished. Replenish and Fresh Blends are separate canonical lanes sharing one customer; their account row was visible, but navigation did not complete in the resumed browser pass. Nexla appears in the authorized selector and client registry but is missing from the old paid-media roster. Its newer documented launch requires roster reconciliation and live verification, not an inferred optimization mandate. The remaining selector entries have not been presumed active clients. This document is not a claim that every active Google account received a deep audit.

## Subsequent scope and implementation instructions

Dillon subsequently confirmed that Nexla campaigns are running and KJB is Facebook-only for September. These are user-confirmed scope facts, distinct from live platform verification. KJB's observed Google pause is expected. Nexla belongs in the current audit scope; its actual platform delivery remains to be inspected and the older roster needs reconciliation.

Dillon also authorized professional selection of Omega's existing campaign at $50/day combined. The subsequent full 9-of-9 campaign table showed four paused campaigns at that budget. Comparing actual delivery, targeting, bids, ads, keyword statuses, call assets and pause history supported controlled High Intent recovery. The parent reviewed focused hold checks and the live website/call route. The approved swap is now applied: Concrete Call Only paused first, then High Intent enabled at its existing $50/day; all others remain paused. Earlier findings and PDFs are pre-change snapshots. The restart receipt contains the exact rationale, limits and fresh after-state proof.

## The machine-learning strategy

My recommendation is to make the business outcome explicit, verify the data reaching Google, then test reach and bidding changes against qualified outcomes. An optimization score, cheap click, long call, or form event is not a substitute for a relevant inquiry that the client can serve.

### Give bidding a trustworthy target

Google's Primary actions can drive bidding when their standard goal is selected. Secondary actions are usually observational, but a custom goal can make them biddable too. Audit campaign-goal membership as well as the Primary label. Keep raw contacts, connected calls, qualified estimates and won jobs separately measurable; decide which stage is reliable and timely enough to optimize, without counting the same funnel journey repeatedly as independent acquisition. [Google: primary and secondary actions](https://support.google.com/google-ads/answer/11461796?hl=en)

For Omega, start by testing the existing qualified-lead upload path, rather than creating another inactive action. For Onsite, establish what each of the 14 actions actually fires on, validate successful server receipts, and resolve the four configuration errors. Do not assume similarly named actions are duplicates without comparing triggers and records.

### Close the lead-quality feedback loop

Where authorized and technically supported, use enhanced conversions for leads to associate downstream qualified outcomes with the original advertising interaction. Google's GTM documentation describes matching hashed first-party data collected at lead capture to later offline outcomes. Hashing is not permission to collect or share data; account approval, lawful handling, appropriate disclosure, and a validated import path still matter. Keep lead identifiers out of broad reports. [Google: enhanced conversions for leads with GTM](https://support.google.com/google-ads/answer/11347292?hl=en)

The operational missing piece is often lead disposition: relevant service, correct location, connected, spam/duplicate, estimate booked, won, and value when actually known. These fields should come from the client or CRM, not an AI guess. Import receipts and match diagnostics must be checked before calling the loop working.

### Measure real calls

Separate call-button clicks, connected calls and qualified sales conversations. Google call reporting can expose duration and connection status through forwarding numbers, but those details alone do not establish a qualified opportunity. Reconcile to the actual phone/CRM outcome and the client's ability to answer calls. [Google: call reporting](https://support.google.com/google-ads/answer/2454052?hl=en)

Current Google documentation also describes AI-qualified call measurement using recordings, with duration or interaction-based fallbacks. Eligibility is limited and privacy terms apply. This is a feature to evaluate with explicit approval, not something enabled during this audit, and AI classification must not be labeled a verified booked job. [Google: measure calls from ads](https://support.google.com/google-ads/answer/6095882?hl=en)

### Restore intended delivery before widening reach

Inspect change history, pauses/end dates, bid limits, goal eligibility, billing, geo exclusions, schedules, keyword eligibility and negative conflicts. Determine whether low delivery is intentional. Preserve intentional pauses. For Onsite, Maximize Clicks is not a conversion-optimization strategy; a conversion-focused strategy is a candidate only after measurement and constraints are verified. Smart Bidding optimizes toward its supplied goal, not a business result it has never been told about. [Google: automated bidding](https://support.google.com/google-ads/answer/2979071?hl=en)

Do not apply a universal rule such as “30 conversions unlocks automation,” “every edit resets learning,” or “always raise budgets 20%.” Strategy requirements, learning and conversion delay vary. Read the account's actual status and current strategy-specific guidance. Google's conversion-goal migration guidance is especially relevant when moving from raw inquiries to qualified outcomes. [Google: changing Smart Bidding goals](https://support.google.com/google-ads/answer/14571185?hl=en_us_us)

### Test new Google AI features rather than enabling everything

AI Max is an experiment candidate after measurement and delivery are stable. Its default treatment can include search-term matching, text customization and final URL expansion. Check approved destinations, brand controls and experiment eligibility. Do not turn on automatic application of results. Judge a test by cost per qualified lead and estimate quality, accounting for conversion delay, not just more platform events. [Google: AI Max experiments](https://support.google.com/google-ads/answer/16450159?hl=en)

Smart Bidding Exploration is not a universal rescue feature. Google's current documentation ties it to target ROAS, broader targeting and unconstrained budgets; it explicitly trades some ROAS strictness for exploration. That is not a default fit for small capped local-service accounts with unresolved measurement. Do not activate it here. [Google: Smart Bidding Exploration](https://support.google.com/google-ads/answer/16294223?hl=en)

## Ranked implementation proposals, not applied fixes

1. Verify intended delivery and identify the actual constraint in Omega and Onsite. Preserve KJB's pause. Resolve roster conflicts without overwriting historical records.
2. Validate form success, call connection, four Onsite configuration errors, and Omega's inactive outcome imports. Record before/after test receipts and deduplication evidence.
3. Reconcile qualified inquiries and booked estimates. Choose a stable bidding target and realistic economics using verified business data, not invented lead values.
4. Review search intent, local eligibility and landing-page promise/CTA alignment. Test mobile paths without submitting unsolicited leads or ringing the client's phone.
5. Propose one bounded experiment at a time, with exact account, budget envelope, hypothesis, measurement window, success criteria and rollback. Request approval for the specific live change.

## Subsequent portfolio readbacks

Nexla customer 7917802207 is now verified live: MCP Search and Brand Exact are enabled at $40.75/day and $25/day respectively, with all other 34 campaign rows paused. Both use a custom goal tied to the lifecycle-Lead CRM import; this requires reconciliation before changing bidding. Detailed current results and coverage are in `clients/nexla/deliverables/2026-09-04-google-ads-live-review.md` under the canonical client-operations repository. This supersedes the earlier Nexla coverage gap above.

KJB's September performance was checked separately in Meta customer1249689223687250: September1–3 had two attributed form leads, $26.98 spend,901impressions,589reach. Platform split shows Facebook plus Instagram, not Facebook placements alone. Its Google pause remains expected. See canonical `clients/kimberly-james-bridal/deliverables/2026-09-04-meta-september-live-review.md`. Platform lead counts are not verified appointments or qualified leads. No Nexla or KJB campaign settings were changed.

## Daily report execution contract

The existing quiet radar has been updated to prepare local report drafts at the first eligible wake at or after 9 AM Eastern starting September 5, with catch-up and daily deduplication. No new popup watchdog or client auto-send was added. [Daily runbook](GOOGLE-ADS-DAILY-RUNBOOK.md)

The baseline builder adapts existing client report layouts, uses exact logo assets and preserves unknown outcomes as pending. Initial health-review drafts cover Omega and Onsite; paused or unverified lanes do not get fabricated active-performance dashboards. The initial seven-day baseline is not yesterday's daily report. Future runs require fresh date-bounded input and save a partial receipt if data cannot be read. Schedule configuration and unit tests are not proof that the first scheduled report run has executed.
