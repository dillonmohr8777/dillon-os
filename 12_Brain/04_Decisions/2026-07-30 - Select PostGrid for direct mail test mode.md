---
note_type: decision
status: accepted
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
decision: "Use PostGrid as the default direct-mail vendor for test-mode integration."
verification_status: verified
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log.md"
  - "02_Campaigns/AI Site Builder Outreach Engine/Direct Mail Activation Runbook.md"
  - "https://docs.postgrid.com/"
  - "https://www.stackadapt.com/programmatic-direct-mail-advertising"
tags:
  - brain
  - decision
  - automation
  - direct-mail
---

# Select PostGrid for direct mail test mode

## Decision

PostGrid is the default vendor for the weekly site factory's direct-mail
integration. The first implementation phase is test mode only: validate addresses,
render proofs, and capture delivery-event mappings without sending physical mail.

## Why

The existing campaign evidence already describes a Sheet/Zapier/PostGrid path.
PostGrid supplies the API controls this workflow needs, including test and live
separation, address verification, idempotency, webhooks, and postcard/letter
objects. StackAdapt is designed for broader programmatic media orchestration and
is not the simplest default for a bounded 25-piece bespoke mail batch.

## Boundaries

This decision does not create an account, accept vendor terms, authorize spend,
or approve a mailing. Production credentials must stay in the approved secret
store. Each live batch requires an exact creative proof, recipient list, unit
cost, total spend cap, maker/checker evidence, and Dillon's explicit approval.

## Reversal

The planning output is vendor-neutral enough to route to another approved mailer.
Changing vendors requires updating the adapter and recording a replacement
decision; no prospect or client record needs to be rewritten.
