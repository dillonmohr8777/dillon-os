---
type: action-pack
site: alignhcm.com
created: 2026-07-19
owner: Dillon Mohr
audience: marketing + sales ops + HubSpot admin
---

# Action Pack: fixes that need a human hand

The watchdog now measures and alerts on all of the issues below automatically. But three of them can only be *closed* by a person, because they are outreach or HubSpot admin settings the agent cannot perform. Each is prepped so it takes minutes.

## A. Re-engage the hot leads nobody contacted (marketing + sales)

These buyer-qualified, Hot (score 90+) inbound leads have zero logged sales outreach. They are the highest-value idle marketing output on the board. Work them top-down.

| Priority | Company | Score | Their stated need | Move |
|---|---|---|---|---|
| 1 | INDOCHINO | 99 | Cross-border UKG Pro/WFM stabilization backlog | Direct email from the UKG practice lead, reference the backlog |
| 2 | Therapeutic Associates PT | 98 | CPO wants *immediate* daily Dayforce leave coverage + Open Enrollment | Call this week; the need is time-sensitive |
| 3 | Tourism Holdings | 97 | Quote for global legislative-compliance payroll audits | Send scoping questions + a quote path |
| 4 | Wisq | 94 | Immediate Dayforce integration architecture | Route to Dayforce integration SME |

Also worked-but-stalled (touched, no opportunity opened, not lost) and worth a second push: LightSwitch (96), Crane NXT (94, enterprise HCM RFP), Shield AI (94).

## B. Reopen the two premature closes (sales ops)

Both were marked closed lost but the data says the decision may not be real:

1. **Superior Propane - Dayforce SmartCare** ($200K, Organic Search) - close date is **Jul 31, two weeks in the future**. Confirm it is genuinely dead; if not, reopen to the correct open stage.
2. **Eat'n Park - UTA to Pro WFM** (Direct) - closed lost Jul 17 with **no deal amount ever entered**. It was the #1-scored qualified lead of the year. Confirm the loss and capture a reason while it is fresh.

## C. Make closed-lost reason a required field (HubSpot admin)

**The finding:** 72 of 72 deals closed lost this year (about $11.3M) have **no loss reason recorded**. The field exists; nobody fills it. That is why "how do we know they lost" currently has no answer.

**The fix (about 3 minutes, admin):**
1. Settings (gear) > Objects > Deals > **Pipelines**.
2. Select the sales pipeline > the **Closed Lost** stage.
3. Turn on **"Set required properties for this stage"** and add **Closed lost reason** (create the property first under Settings > Properties > Deals if it does not exist, as a dropdown with a short reason list).
4. Save. From now on a rep cannot mark a deal lost without picking a reason.

Once this is live, the watchdog's "closed-lost without reason" count starts dropping, and next quarter this question is answerable from data instead of guesswork.

## What the watchdog now does on its own

- Computes and trends **visit-to-lead conversion rate**, **marketing-influenced open pipeline**, and the **lead follow-up gap** every run (`leading-indicators.md`).
- Alerts when conversion falls below 1.2% on a completed month, influenced pipeline drops to $0 or halves month over month, the no-outreach share of converters passes 35%, or a Hot lead sits untouched more than 3 business days.
- Flags any deal closed lost with no reason, and any premature close (future close date or missing amount).

So the measurement is fixed and permanent. Items A, B, and C are the human actions those measurements are pointing at.
