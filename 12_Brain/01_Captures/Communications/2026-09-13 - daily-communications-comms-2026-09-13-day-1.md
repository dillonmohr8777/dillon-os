---
note_type: capture
status: compiled
created: 2026-09-13
updated: 2026-09-13
captured_at: "2026-09-13T07:03:00-04:00"
source_type: communication_intelligence
run_id: "COMMS-2026-09-13-DAY-1"
verification_status: verified
source_refs:
  - "gmail://thread/1a081d3c706e1ee9"
  - "gmail://thread/1a08d92a6a8582ae"
  - "gmail://thread/1a0592c581c51729"
  - "https://momentum3d.slack.com/archives/C0BT1P1PGJF/p1789072696879919"
  - "gmail://thread/1a08da046a582dc7"
  - "https://momentum3d.slack.com/archives/C1CFQBC79/p1789294052563369"
  - "https://momentum3d.slack.com/archives/C1CFQBC79/p1788964684489459"
  - "https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789050634769399"
  - "gmail://message/1a08978cf7807c91"
tags:
  - brain
  - capture
  - gmail
  - slack
  - communication-intelligence
---

# 2026-09-13 - Gmail and Slack intelligence capture

> [!source] Curated receipt
> This preserves verified operational summaries and source locators, not raw
> email or Slack archives. No message was sent or posted during ingestion.

## Run scope

- Run: COMMS-2026-09-13-DAY-1
- Window: 2026-09-06T19:04:14-04:00 to 2026-09-13T07:03:00-04:00
- Gmail: ok
- Slack: ok
- New durable items: 9

## Curated evidence

### Nexla - decision

- Priority: **high**
- Occurred: 2026-09-11T10:12:54-04:00
- Participants: Dana Palko, Jayashree Rajan, Dillon Mohr
- Source: gmail://thread/1a081d3c706e1ee9
- Summary: Nexla confirmed the test reached HubSpot and Slack; lifecycle stage remains Lead while Demo Request is still secondary.
- Evidence: Hydrated Gmail thread contains the client confirmation and the staged-versus-published tracking distinction.
- Uncertainty: Single-primary conversion choice and final GTM publication remain unresolved.
- Next safe action: Keep tracking changes staged; obtain the agreed primary conversion and business-test validation before publishing.
- Intended compile targets:
  - `01_Clients/Nexla/overview.md`
  - `12_Brain/07_Reviews/Daily Intelligence/2026-09-13 - Communication Intelligence.md`

### Deborah Mara web design - deliverable

- Priority: **high**
- Occurred: 2026-09-11T16:24:08-04:00
- Participants: Deborah Mara, Beth Kann, Dillon Mohr
- Source: gmail://thread/1a08d92a6a8582ae
- Summary: AEO strategy PDF was supplied and WordPress access was confirmed; the client route remains unresolved pending canonical client mapping.
- Evidence: Hydrated Gmail thread shows the plan attachment and confirmation that access is available.
- Uncertainty: No exact currently active client record was identified in the registry during this run.
- Next safe action: Resolve the canonical client route before updating client truth or queue state.
- Intended compile targets:
  - `12_Brain/07_Reviews/Daily Intelligence/2026-09-13 - Communication Intelligence.md`

### Bar Crawl USA - client-change

- Priority: **high**
- Occurred: 2026-09-11T20:00:48Z
- Participants: Andy Zirger, Dillon Mohr
- Source: gmail://thread/1a0592c581c51729
- Summary: Bar Crawl clarified that the last four reported items are not occurring, changing the interpretation of the August report.
- Evidence: Hydrated Gmail thread includes the client correction and follow-up report context.
- Uncertainty: The exact page or item references require the client report artifact for reconciliation.
- Next safe action: Reconcile the four disputed items against the report before any client-facing revision.
- Intended compile targets:
  - `01_Clients/Bar Crawl USA/overview.md`

### Puttery NYC - blocker

- Priority: **high**
- Occurred: 2026-09-10T16:38:16-04:00
- Participants: Dillon Mohr, Joe, Tom
- Source: https://momentum3d.slack.com/archives/C0BT1P1PGJF/p1789072696879919
- Summary: GTM and Meta access were confirmed, but Ads, GA4, CMS, Meta identifiers, and Toast confirmation still gate tagged-booking attribution proof.
- Evidence: Slack #puttery call update lists cleared access and the remaining attribution requirements.
- Uncertainty: Some access was expected to arrive after the update; current completion is not independently verified here.
- Next safe action: Collect exact account identifiers and verify each remaining access grant before changing the dashboard gate.
- Intended compile targets:
  - `01_Clients/Puttery NYC/overview.md`

### Revive Systems - blocker

- Priority: **high**
- Occurred: 2026-09-11T13:55:10-07:00
- Participants: Local Services Ads Team, Dillon Mohr
- Source: gmail://thread/1a08da046a582dc7
- Summary: Local Services Ads verification remains incomplete because required business-owner documentation has not been received.
- Evidence: Hydrated support thread confirms the verification hold and directs the account owner to the required follow-up.
- Uncertainty: No completion date was provided.
- Next safe action: Keep the activation hold; have the account owner complete the provider-directed verification step.
- Intended compile targets:
  - `01_Clients/Revive Systems/overview.md`

### Momentum sites SEO task cadence - deliverable

- Priority: **normal**
- Occurred: 2026-09-13T06:07:32-04:00
- Participants: Ovais, Beth Kann, Obaidullah Shaikh
- Source: https://momentum3d.slack.com/archives/C1CFQBC79/p1789294052563369
- Summary: AI Design Services and ChatGPT Ads Management pages are ready for review; Instagram page feedback was applied, with imagery still needed.
- Evidence: Slack #momentumsites update lists page states and the remaining imagery dependency.
- Uncertainty: Ready-for-review is not a publication receipt.
- Next safe action: Run review and asset handoff; do not publish until the normal QA and approval gates pass.
- Intended compile targets:
  - `System/operating-status.md`

### Momentum weekly reporting - process-knowledge

- Priority: **normal**
- Occurred: 2026-09-09T10:38:04-04:00
- Participants: Obaidullah Shaikh, Melissa Silber
- Source: https://momentum3d.slack.com/archives/C1CFQBC79/p1788964684489459
- Summary: Weekly reporting will add lead breakdown by landing page and lead quantity by source regardless of quotable status.
- Evidence: Slack #momentumsites records the agreed reporting additions.
- Uncertainty: Implementation receipt was not included in the source message.
- Next safe action: Verify the next report contains both dimensions before treating the change as live.
- Intended compile targets:
  - `System/operating-status.md`

### Lead intake reconciliation - process-knowledge

- Priority: **normal**
- Occurred: 2026-09-10T10:30:34-04:00
- Participants: Nick Groh, Jason Fallon, Sean Boyle
- Source: https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789050634769399
- Summary: Three leads were added to the automation path with HubSpot record creation and campaign attribution review planned.
- Evidence: Slack #360leads records the automation change and the requested campaign-level breakdown.
- Uncertainty: Lead quality and downstream attribution are not yet verified.
- Next safe action: Reconcile the lead records and attribution fields before using the process as a reporting baseline.
- Intended compile targets:
  - `System/operating-status.md`

### Google Ads access evidence - process-knowledge

- Priority: **normal**
- Occurred: 2026-09-09T20:59:50-07:00
- Participants: Google Ads API, Dillon Mohr
- Source: gmail://message/1a08978cf7807c91
- Summary: Google Ads API Explorer access was approved for the registered project.
- Evidence: Gmail notification confirms Explorer access approval.
- Uncertainty: Explorer approval does not establish production access or write authority.
- Next safe action: Keep use read-only and separately verify any production or manager-scope gate before relying on it.
- Intended compile targets:
  - `System/operating-status.md`

## Exclusions

- newsletters: 31
- promotions: 18
- billing_excluded: 14
- credential_or_security: 12
- bot_or_routine_chatter: 47
- personal_or_non_work: 22
- unresolved_non_material: 9
