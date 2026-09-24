---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-28T18:47:32
session_last: 2026-07-28T18:47:32
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-28\continue-canonical-queue-we-didn-t"
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-28\continue-canonical-queue-we-didn-t

**1 session(s)** · 2026-07-28 18:47 → 2026-07-28 18:47 · 20.3h agent-time (summed; sessions may overlap) · 36 MB transcript · 7/7 turns completed

## 1. 2026-07-28 18:47 · 20.3h · 36.2 MB

`019faa0d-b1ef-7861-a018-1b315ccfc459` · turns 7/7

**Asked:**

> Continue canonical queue. We didn't get over, we didn't get some shit delivered today. Can you please look into Mia's ad account? There's no way she owes $2,700. That's got, that's insane. There's no way. Is there anyone we need to contact? Um, I dunno.

**Outcome reported:**

> There is a way Google reached that number, but it does **not** mean Mia owes it.
> 
> - 13 separate campaigns each had a $16.67 daily budget—potentially $216.71 per day combined.
> - Replenish gross spend: **$4,005.86**
> - Fresh Blends gross spend: **$2,100.66**
> - Google credits: **$558.26**
> - Retained payments: **$3,395.48**
> - Current unallocated balance: **$2,152.78**, not $2,700.
> 
> The written approvals show $500-per-location limits. Replenish has **$711.08** in campaign-level overages, although **$457.57** of that is Pompano spend tied to an authorized Google-credit restart. The other Replenish overages total **$253.51**. Fresh Blends exceeded its four $500 limits by **$100.66**.
> 
> The four San Diego campaigns spent another **$811.57**. Their launch was approved, but I did not find a definitive written spending ceiling.
> 
> Who to contact: **Google Ads Billing Support**, with the caps, campaign costs, Google-credit promise, credits, payments, and chargebacks. Do **not** release the bank chargebacks, pay the balance, or restart anything yet. Nobody was contacted or charged.
> 
> I removed the incorrect account-owner framing, corrected the [billing audit](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/replenish-7-eleven/paid-media/billing-audit-2026-07-28.md), updated the canonical queue to revision 328, passed all 243 checks, and pushed commit `b2b57ab`.
> 

> Mia only needs to confirm three things:
> 
> 1. Were the four chargebacks totaling **$1,942.67** intentional?
> 2. Was Pompano supposed to restart using **Google credit only**, and what was the approved total budget for the four San Diego campaigns?
> 3. Does she authorize us to submit the documented billing dispute to Google Ads Support?
> 
> She should **not pay the $2,152.78, release the chargebacks, add another card, or restart campaigns yet**. Once she answers those questions, we can calculate the defensible disputed amount and contact Google.

> The PDF is finished and saved in the canonical queue:
> 
> [Download the Replenish and Fresh Blends billing reconciliation PDF](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/replenish-7-eleven/deliverables/2026-07-29-google-ads-balance-reconciliation/Replenish-Fresh-Blends-Google-Ads-Balance-Reconciliation-2026-07-29.pdf)
> 
> Key findings:
> 
> - Four charges totaling **$1,942.67** were disputed on July 22–23.
> - Google only says the card issuer reported protested charges. Neither Google nor Mia’s emails explain why.
> - Google’s displayed balance is **$2,148.43**, but the currently supportable payment exposure is **$1,356.00–$1,812.68**, pending credit allocation.
> - There is **no evidence** this billing setup paid other Google Ads customer accounts. The selected customer funded only Replenish and Fresh Blends campaigns.
> - Mia needs to confirm whether the disputes were intentional, obtain the issuer’s exact reason, confirm the Pompano credit arrangement and San Diego ceiling, then authorize a Google Ads billing-support case.
> - The full $2,148.43 should not be paid until that reconciliation is written.
> 
> Nothing was sent, paid, restarted, or changed. The artifact passed visual QA and 248/248 system checks. Canonical commit: `6add140`.
> 

> No—Mia cannot reliably run ads right now.
> 
> - Every Replenish and Fresh Blends campaign in her Google Ads customer is currently paused.
> - July 23–29 shows zero impressions and zero clicks.
> - Google shows a payment-verification warning and says service may be suspended because the payment threshold was exceeded.
> 
> Both Replenish and Fresh Blends are affected because they share that customer account. Your other client accounts are not globally affected. I verified Onsite separately; it is still serving ads and recorded 290 clicks and $50 in spend during July 23–29.
> 
> Before Mia’s campaigns restart:
> 
> 1. Reconcile the chargebacks and final payable amount.
> 2. Make only the agreed payment.
> 3. Complete payment-method verification.
> 4. Confirm Google has removed the billing restriction.
> 5. Deliberately resume only the approved campaigns.
> 
> I made no campaign or billing changes.

> Google is currently demanding **$2,148.43**.
> 
> But we can only support **$1,356.00–$1,812.68** as payable until Google allocates the credits and explains the chargebacks. There is no separate minimum-payment amount shown.
> 
> I would not pay the full $2,148.43 yet. Google Billing Support needs to confirm the corrected amount and that paying it will restore service.

> [Open the Replenish Google Ads Billing Summary](https://ads.google.com/aw/billing/summary?ocid=8130906393)
> 
> If Google asks her to select an account, choose **Replenish — 627-501-4654**. Then click **Make a payment** or **Fix it**.

**Files written (3):**

- `../../projects/client-operations/clients/replenish-7-eleven/deliverables/2026-07-29-google-ads-balance-reconciliation/QA.md`
- `../../projects/client-operations/clients/replenish-7-eleven/deliverables/2026-07-29-google-ads-balance-reconciliation/report.html`
- `../../projects/client-operations/clients/replenish-7-eleven/deliverables/2026-07-29-google-ads-balance-reconciliation/source-data.json`

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-28T14-47-32-019faa0d-b1ef-7861-a018-1b315ccfc459.jsonl`</sub>
