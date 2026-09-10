---
note_type: concept
status: active
created: 2026-09-07
updated: 2026-09-07
tags: [concept, attribution, reporting, zapier, momentum-360, ai-division, positioning]
source_refs:
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md'
  - '[[01_Clients/Omega Landscaping/Agent Memory]]'
  - '[[01_Clients/Fagan Painting/overview]]'
  - '[[System/operating-status]]'
---

# Conversion match-back is the differentiator

**Summary:** Telling a client which actual humans their conversions were is a
claim almost no SMB agency can make. Momentum currently cannot make it either —
for one fixable reason, on three of four accounts. The fix is a Zap configuration
change, not a reporting project, and it is worth more as a sales asset than the
backlog it has been treated as.

## The promise, and how often it has been made

Conversion-to-named-lead match-back has been promised:

- **nine times to Omega Landscape**
- **twice to Kimberly James Bridal**
- **twice to Onsite Construction**
- and it currently **blocks the Fresh Blends deck**

Thirteen promises across four accounts.

## Why it cannot be produced

The Zapier notifications that arrive in Gmail **carry no lead data**. They carry a
link: "open this Zap run in Zapier." There is nothing in the message to reconcile
against a platform conversion, so no amount of reporting effort downstream can
produce the match.

**Fagan Painting is the only account where the loop closes**, and the reason is
narrow: its leads are **parsed into the email body**. Same tool, different Zap
configuration, working outcome.

Corroborating access constraint on Omega, independently recorded: the Google Ads
lead export through Zapier and Google Sheets could not be authorized —
`dillonmohr8777@gmail.com` holds `Standard` access and
`elitelandscapingconcrete@gmail.com` is the account Admin. Until that export is
connected, Google Ads offers only manual `CSV` / `CSV for CRM` downloads from the
lead-form asset table (`01_Clients/Omega Landscaping/Agent Memory.md`).

## The lesson

**A repeated broken promise is usually one defect wearing thirteen costumes.**

Thirteen unmet commitments across four accounts read like a capacity problem and
were queued like a reporting backlog. They are one integration defect — with a
known-good reference implementation already running in production on a fifth
account. The diagnostic move that resolved it was asking what the notification
actually *contains*, not why the report was late.

Generalise: when the same deliverable slips on multiple accounts, look for the
shared upstream dependency before scheduling more of the work.

## Why it is the sharpest differentiator available

Most SMB agency reporting stops at platform totals: conversions, cost per
conversion, a trend line. Naming the humans requires the lead payload to survive
the whole path from form to inbox to report — which is precisely what the defect
above breaks, and precisely what most agencies never notice is broken.

"We tell you which actual humans your conversions were" is:

- **concrete** — the client can check it against their own phone records
- **verifiable** — it either names people or it does not
- **outside reach** for an agency whose pipeline drops the payload

It is also the AI division's flagship offer proving itself on Momentum's own
book. The Lead Operations Pilot's acceptance criteria require destination readback
for 100% of accepted records. Momentum fails that on three of four accounts today.
Fix it internally and the demo stops being synthetic.

## The constraint that must hold

**Do not sell it before it is fixed.** It is currently true on one account of
four. Selling it now repeats the thirteen promises at larger scale, against
prospects rather than clients, which is a materially worse failure.

Sequence: fix the Zaps → verify named-lead match on all four accounts → then the
claim goes in the deck.

The Zap change is a client-account change and is **approval-gated**; it is queued
in [[System/approval-queue|Approval Queue]], not executed.

Feeds [[12_Brain/05_Projects/2026-09-07 - Momentum AI division launch]].
