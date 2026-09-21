# Daily Google Ads health reports

Approved by Dillon's September 4 request for daily client-branded Google Ads reporting. Local draft preparation only; not permission to change campaigns, tracking, bids, budgets, or send reports.

## Schedule and ownership

Use the existing Quiet client-action radar heartbeat, not a second scheduler or visible watchdog. `node radar-state.mjs plan` exposes `googleAdsReportDue` at the first wake at or after 9 AM America/New_York, with same-day catch-up. This is the default morning time selected for the request. Respect global pause and worker-capacity limits. The recurring job starts September 5; the September 4 manual investigation is a baseline, not a completed scheduled daily run.

If due, either execute the bounded report pass here or resume its owning worker. Record `daily/googleAdsReport/dispatched` only with an actual owning worker ID and track its completion separately. Record `complete` only after artifacts and evidence are verified, or `blocked` with an exact source gap and a saved partial receipt. Do not mark an unexecuted pass complete or repeatedly dispatch the same day's work. A newly restored source may justify an explicit retry, with a fresh receipt replacing neither history nor source truth.

## Exact scope

Read canonical registry, paid-media roster, current client decisions, and latest account evidence each run. An active client is not proof of active Google Ads. The September 4 baseline verified Omega 2853981364 and Onsite 1033715894 with enabled campaigns; KJB 8145506229 has both campaigns paused and is an internal pause-safety check, not an active performance report. Exclude KJB's cancelled duplicate 7214914099.

Replenish / 7-Eleven and Fresh Blends / Kwik Trip share customer 6275014654 but never share report metrics or brand identity. The weekly reporting automation has a narrower scope and must remain unchanged. Do not reuse that weekly job's scope as a complete portfolio roster. Dillon explicitly confirmed on September 4 that Nexla campaigns are running: include Nexla in discovery and the daily audit scope despite its absence from the older roster, verify actual platform/customer mapping and delivery before reporting metrics, and keep roster reconciliation separate from current user-confirmed scope. Google selector customer 7917802207 is a candidate already observed, not yet a live campaign audit. Dillon also confirmed KJB is Facebook-only during September 2026: its Google pause is expected, not a delivery failure. Keep KJB current performance in the separate Meta workflow. Other visible Google accounts are discovery metadata, not automatic eligibility. Fagan remains excluded.

## Read and reconcile

September 4 late-session update: Nexla's customer7917802207/ocid862908857 was verified live with MCP23705317332 and Brand22038365681 enabled, combined$65.75/day. Use the new canonical Nexla live-review receipt, not the superseded no-go memo, for discovery; refresh all metrics each run. Omega's approved status swap was independently reloaded: HighIntent24082267830 enabled/eligible at$50/day, Concrete23307822197 paused, allothercampaignspaused. OMEGA-RESTART-RECEIPT.md contains before/after proof. Do not repeat the swap. First post-change delivery remains to be observed. KJB Meta live September1–3 baseline is saved in its canonical deliverables folder, with Facebook/Instagram split and attribution limits; do not replace native fresh leads with the older Gmail fallback table.

1. Reuse the authorized browser/connector session. Validate the exact signed-in identity and customer before reading. Keep routine UI backgrounded. A reporting connector reauthentication failure does not mean the browser is inaccessible. Never consume MFA messages or change security settings.
2. Verify enabled/paused/ended state and actual delivery. Read yesterday plus the last complete 7 and 28 days, and prior comparison periods, in each account's timezone. Do not label the incomplete current day final. Record currency, period, source, capture time, active filters, pagination and coverage limitations.
3. Check campaign delivery, billing/eligibility warnings, change history, bidding target and caps, budget pacing, locations and presence settings, schedule, networks, search intent/negative conflicts, and actual landing destinations. Explain unavailable metrics; do not infer causal conclusions from a single dashboard card.
4. Audit conversion-action definitions, sources, primary/secondary status, campaign/custom-goal membership, One/Every count, click/view windows, attribution model, tags/import diagnostics, latency, and deduplication. A phone-number click is not proof of a connected or qualified call. A form event is not proof of a successful receipt. Multiple Primary actions indicate a risk to investigate, not proof of actual duplicate leads.
5. Reconcile authorized CRM, booking and call-log outcomes. Keep raw inquiries, connected calls, qualified leads, booked estimates and sales separate. Do not read or persist unnecessary lead PII. Do not record calls or enable AI call analysis without exact approval, eligibility and privacy review.

## Draft contract

Use the existing client-specific report design and exact verified logo, unmodified with preserved aspect ratio. Never generate a replacement logo or use a text wordmark fallback. The reusable local builder is under `work/google-ads-report-builder`; inspect its current README and CLI before running it. As of September 5 it supports Omega, Onsite, and Nexla with exact hash-checked artwork and explicit daily receipt input.

After collecting and saving each current receipt, the owning daily worker invokes (from this runbook's workspace):

```powershell
node work/google-ads-report-builder/build.mjs --date 2026-09-05 --input C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-05-google-ads-daily-health/run-receipt.json
node work/google-ads-report-builder/build.mjs --date 2026-09-05 --input C:/Users/dillo/Documents/Codex/projects/client-operations/clients/onsite-concrete-landscape/deliverables/2026-09-05-google-ads-daily-health/run-receipt.json
node work/google-ads-report-builder/build.mjs --date 2026-09-05 --input C:/Users/dillo/Documents/Codex/projects/client-operations/clients/nexla/deliverables/2026-09-05-google-ads-daily-health/run-receipt.json
C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe work/google-ads-report-builder/check-pdf.py 2026-09-05
```

Substitute the actual capture date and matching fresh source paths at each wake. Do not invoke the no-argument baseline mode for a daily run. The renderer rejects capture/date mismatches, wrong accounts, fractional counts, invalid periods, and non-null outcomes outside the present partial-evidence contract. It does not collect source data or mark radar state. The daily worker owns these invocation arguments and its existing completion bookkeeping; no scheduler change is required or made by this renderer extension.

September 5 completion: all three HTML/PDF packages were generated from the original saved partial receipts captured approximately 13:36–13:38 UTC. Original `run-receipt.json` history remains untouched, including its then-current renderer-blocked status. Each package now has `render-receipt.json`, `verification.json`, PDF checks and screenshots proving rendering completion. This resolves rendering only; missing account windows and outcome reconciliation remain gaps, and it is not proof of a new live collection or scheduled run.

Produce local HTML and PDF in the exact canonical client's dated deliverables folder. Show verified delivery facts, source dates, a short decision-focused interpretation, and prioritized next actions. Unknown business outcomes remain null and read `Conversion reporting is pending validation`. Counts are integers; preserve any raw fractional attributed platform measure in source evidence rather than passing rounded attribution credits off as unique people. Never use sample data, stale hardcoded weekly metrics, or unsupported improvement percentages.

Daily is a monitoring cadence, not a mandate for daily bid edits. Keep experiments and recommendations as drafts. Read current official Google documentation for material platform recommendations and distinguish feature availability from proof that it helps this account. Require exact approval before live implementation.

## Verification and notification

Validate dates, account and brand separation, logo hash/load, KPI math and null handling, PDF content/page count, desktop/mobile rendering, source freshness and evidence coverage. A health-review draft is not a completed deep account audit. Save a redacted run receipt even for partial coverage. Summarize material new risks or a completed report bundle in this Codex thread; suppress unchanged reminders. No automated client email, Slack message, ad change, deployment, or public report.

Native schedule configuration is not proof of a scheduled execution. Report actual wake/run evidence separately. An awake supported host and functioning app/runtime are required; this is not guaranteed mobile-only or machine-off execution.
