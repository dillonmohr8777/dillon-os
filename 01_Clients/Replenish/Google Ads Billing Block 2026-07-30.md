---
note_type: project
status: blocked
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
client: "[[01_Clients/Replenish/overview|Replenish]]"
area: Google Ads billing
priority: urgent
outcome: Restore verified ad eligibility without changing campaigns or spend.
next_action: Confirm Mia reached the Google Ads payment screen and completed the account-side update.
source_refs:
  - "gmail:thread:19fae684cc2ef236"
tags: [brain, project, replenish, google-ads, billing, blocked]
---

# Google Ads Billing Block 2026-07-30

## Current state

Google Ads reported that campaigns could not run until a billing update was completed. Dillon sent Mia the account billing link. Mia asked whether she had reached the correct page, and Dillon clarified that the destination should be a payment screen.

## Guardrails

1. Replenish remains separate from Fresh Blends.
2. The account owner completes billing details.
3. No budget, campaign, or conversion change is implied by this task.
4. Do not copy payment details into the vault.

## Next actions

1. [ ] Confirm the billing screen opened for Mia.
2. [ ] Confirm the billing requirement is cleared in the correct Replenish Google Ads account.
3. [ ] Verify campaign delivery and conversion reporting after the account clears.

## Evidence

1. [Gmail thread](https://mail.google.com/mail/u/0/#all/19fae684cc2ef236)
2. [[Communication Intelligence Map]]

## Re-read 2026-09-22, stored pull only

`_os/automation/google-ads-api/pulls/Replenish_FreshBlends_campaigns_all_status.json`
still shows the seven `Replenish | PMAX` campaigns as ENABLED / ENDED, and
Fresh Blends #1110 and #1161 as PAUSED / SERVING, in customer 6275014654.
The export has no end date, so this is not a new Ads API read and it does
not clear the billing checks above. Do not restart or extend dates from
this note. Decision card: [[Daily-Briefs/2026-09-22-carry-forward-decisions]].
