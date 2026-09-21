---
name: "momentum-client-report"
description: "Build a Momentum client performance report that leads with conversion-to-named-lead match-back — which actual people the reported conversions were — instead of platform totals alone. Use this for any monthly, quarterly or ad-hoc client reporting, performance recap, results deck, or \"how did we do for Omega/KJB/Fresh Blends/Onsite\" request, and whenever a client asks whether their leads are real. Momentum has promised this match-back nine times to Omega Landscape, twice to Kimberly James Bridal, twice to Onsite Construction, and it is currently blocking the Fresh Blends deck, so treat the named-lead question as the report's spine rather than an appendix. Not for internal agency metrics or new-business pitches."
---

# Momentum Client Reporting

Report on what a client actually got, with the named-lead question answered first.

## The problem this exists to fix

Momentum has promised conversion-to-named-lead match-back nine separate times to Omega Landscape, twice to Kimberly James Bridal, and twice to Onsite Construction. It is currently blocking the Fresh Blends deck. Roughly $2,600 a month of client spend is running with that qualification question open.

The reason it keeps not happening is structural, not lazy: each reporting cycle, the platform numbers are available and the lead-level join is not, so the report ships with the totals and the hard question rolls to next month. Nine cycles of that is how you get a client who no longer believes the number.

So this skill inverts the order. The named-lead question is answered — or explicitly declared unanswerable, with a reason and a fix — before anything else goes in the report. A report that shows "37 conversions" without saying who they were is not finished, it is deferred again.

## Step 1: Load the client

Get the client's record first: service lines purchased, monthly spend, start date, what was promised, what has already been reported. A report that contradicts last month's report or reports on a service they don't buy is worse than no report.

## Step 2: Answer the match-back question

**Conversion-to-named-lead match-back** means joining what the ad and analytics platforms count as a conversion to the actual human it represents — a name, a phone number, a form submission, a booked job. Clients care about this because "37 conversions" and "37 real prospective customers" are very different claims, and they are the ones who know which of their leads were real.

Platform analytics alone cannot do this. GA4 and Google Ads report events, not identities. The join always requires a lead-level source on the client's side. Establish which of these exists:

- **Form submission log** — the website's form handler, CRM inbox, or email notifications. Usually the most complete source.
- **Call tracking** — CallRail or similar, with per-call records and source attribution. Essential for trades and services clients where most leads phone.
- **CRM records** — contacts with a source field. Only useful if the source field is actually populated.
- **Client's own booking or job system** — the ground truth for whether a lead became revenue.

Then do the join on whatever keys exist: timestamp proximity, landing page, campaign or GCLID if captured, phone number, form ID. Be honest about join confidence — a timestamp-only match across a busy week is a guess, and should be labeled as one.

**Produce a named lead table.** Date, name, contact, channel and campaign, what they asked for, and outcome if the client has told you. This table is the report's centerpiece.

### If you cannot do the match-back

This is the important branch, because it is the one that has been mishandled nine times.

Do not quietly fall back to platform totals. Instead, state plainly in the report's first section:

1. **What is missing** — specifically. "No call tracking is installed, so the roughly 60% of leads that arrive by phone cannot be named" is useful. "Data limitations" is not.
2. **Which numbers are therefore unverified** — name them, so the client knows exactly which figure is a platform count rather than a confirmed person.
3. **What it takes to fix** — the actual instrumentation, roughly what it costs, and how long until it produces data.
4. **How long this has been open** — for Omega, KJB and Onsite, say so. A client who has asked nine times is owed an acknowledgment that they asked nine times, and it is the only thing that makes the tenth answer credible.

Then tell Dillon, outside the report, that the gap is still open and what decision he needs to make.

## Step 3: The rest of the report

Once the lead question is handled, cover the purchased service lines and only those:

- **Performance against the prior period and against the baseline at signing** — a number with no comparison is decoration.
- **What was done this period** — the actual work, so the retainer is legible.
- **What it produced** — traffic, rankings, impressions, spend and cost per result, tied to the lead table where possible.
- **What is next** — specific and dated, not "continue optimizing."

Keep the causal claims honest. Marketing reporting drifts toward implying credit for everything that moved. If rankings improved during a period when the client also ran a radio spot, say so. Clients forgive uncertainty; they do not forgive being handled.

## Step 4: Format and design

Match the format to the moment: a document or PDF for a monthly send, slides when it will be presented and discussed.

Apply the Momentum design standard — high layout variance between sections, low density, no generic AI-template styling. Reports earn somewhat more density than a pitch deck because they are read rather than presented, but resist the wall of charts. Every chart should answer a question a client actually asked.

Use the client's brand colors, not Momentum's.

## Before you send

- Does the report answer the named-lead question in its first section, either with names or with an explicit accounting of why not?
- Does every number have a comparison point?
- Does it only cover service lines this client actually purchased?
- Are causal claims hedged where the evidence is thin?
- Would this client, reading it, know more than they did before?

Sending a client report requires Dillon's explicit approval — draft it, show him, and let him send.

