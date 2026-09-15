# Google Ads optimization status — September 5, 2026

Status: implementation incomplete. Live audit and source checks completed to the scope below. No account configuration, budget, bid, ad, conversion action or campaign status changed by this review. Do not label clients fully optimized.

## Account-specific priorities

| Client | Verified or dated evidence | Next requirement |
|---|---|---|
| Omega 285-398-1364 | Live High Intent learning; form goal needs attention; qualified and converted lead goals misconfigured | Trace actual lead/call and offline import diagnostics; fix measurement before conversion-based bidding changes |
| Onsite 103-371-5894 | Worker live review: Search $7/day Maximize Clicks, $2 CPC cap, Search partners and Display off | Inspect keyword auction eligibility and appropriate service area before cap experiment; cap is a hypothesis, not proved cause |
| Nexla 791-780-2207 | Live MCP Eligible (Limited), limited by search volume; $40.75/day MaxClicks/$12 cap; lifecycle-Lead custom goal. Brand evidence remains September 4 | Reconcile intended qualified/demo outcome and CRM import; inspect search-intent coverage before expansion |
| Replenish 627-501-4654 | Live all nine campaigns ended | Retain launch hold; revalidate location tracking/assets and verification |
| Fresh Blends 627-501-4654 | Live all four campaigns paused | Keep brand separate and pause intact; verify exact restart scope independently |
| KJB 814-550-6229 | Live no ads running; both diagnostic campaigns paused, tracking incomplete | Preserve September Facebook-only direction |

Canonical client receipts are under each client's deliverables/2026-09-05-google-ads-optimization-review folder. Nexla and Onsite worker receipts supersede this short summary where more specific.

Fresh Nexla MCP Aug 29–Sep 4: 2,626 impressions, 79 clicks, $236.25. Networks and AI Max off. Goal popover Recording does not prove qualified-lead quality. Onsite Aug 28–Sep 3: 3 impressions; eight target locations visible, presence option unresolved. Both workers and root closed owned browser tabs. No ongoing worker remains for this review.

## Skills and current source checks

Applied installed Ads skill v2.2.0 and its Google Search playbook as an audit framework, not unquestioned platform rules. Inspected https://github.com/ccccchuck/google-ads-agent-skill at verified main commit 833559e99f1f991b6910cd028a9a1f1fa1df45c7, dated May 28, 2026. Recent search indexing is not a recent code release. Read its full SKILL.md; retained evidence-backed proposals and dry-run-first discipline. No third-party skill code installed or executed. Also surveyed https://github.com/mardab96/google-ads-skills; repository claims alone are not authoritative Google release evidence.

Google references checked:

- https://support.google.com/google-ads/answer/11459091?hl=en-GB — qualified/converted lead feedback from the business funnel.
- https://support.google.com/google-ads/answer/11461796?hl=en — secondary actions inside a custom goal can still be used for bidding. Therefore changing an action to Secondary alone may not remove it from campaign optimization.
- https://support.google.com/google-ads/answer/6268626?hl=en-EN — Maximize Clicks and maximum CPC limits. More expensive clicks do not themselves establish better lead quality.
- https://support.google.com/google-ads/answer/14593387?hl=en-1 — allow conversion-cycle learning when changing a goal; avoid simultaneous strategy churn.

## Completion criteria still open

An account is not finished merely because its optimization score rises. Require validated real leads/calls, accurate campaign-specific goal selection, service-area and search-intent checks, then a bounded measured change with before/after settings and rollback. Do not apply universal negative keyword lists, invent target CPA or qualified-lead values, enable AI Max/PMax automatically, or restart held campaigns. Client reports must retain source dates and whole-number event counts without calling events unique qualified leads.
