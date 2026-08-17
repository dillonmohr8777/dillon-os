---
note_type: runbook
status: active
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
vendor: PostGrid
mode: test-first
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log.md"
  - "_os/automation/bin/direct-mail-plan.js"
  - "https://docs.postgrid.com/"
tags:
  - campaign
  - automation
  - direct-mail
  - postgrid
---

# Direct Mail Activation Runbook

## Selected path

Use PostGrid for the direct-mail layer. It matches the existing
Sheet/Zapier/API workflow and provides address verification, idempotency, webhooks,
and test-mode proofs that do not enter the mail stream. StackAdapt remains an
option for a future programmatic media test, not the default factory mailer.

## Prepare a batch without sending

The site factory must finish first. Its generated `prospects.csv` keeps every
`mail_ready` value on `hold`.

```powershell
node _os/automation/bin/direct-mail-plan.js --from <batch-dir>/prospects.csv --out <batch-dir>/direct-mail-plan.json
```

An optional quoted unit cost may be supplied for a planning estimate:

```powershell
node _os/automation/bin/direct-mail-plan.js --from <batch-dir>/prospects.csv --unit-cost 0.95
```

This command performs no network request, does not expose addresses in its output,
and never authorizes a live send.

## Test-mode activation

1. Store the PostGrid test key only in the approved secret manager and register
   its opaque locator in Access Broker.
2. Verify the return address and sender identity.
3. Validate approved recipient addresses in PostGrid test mode.
4. Render the exact postcard proof with its QR target.
5. Record maker evidence and independent checker evidence.
6. Present Dillon with the exact rows, proof, unit cost, total spend cap, and
   proposed send date.

## Production gate

Live mail remains blocked until Dillon approves the exact preview and spend.
Approval for one batch does not authorize later batches. A production run must
also verify the live PostGrid account, idempotency key, webhook destination,
return address, creative hash, recipient count, and total cost immediately before
the request.
