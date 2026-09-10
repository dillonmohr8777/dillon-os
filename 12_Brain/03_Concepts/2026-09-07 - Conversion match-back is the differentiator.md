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

## The Zap fix recovers forms only — 2026-09-09

Confirmed by exhaustive search on 2026-09-09, not inferred:
`grep -rln -i "callrail"` across every client tree under
`Documents/Codex/projects/client-operations/clients/` returns **zero files** for
Omega. Omega has no call tracking of any kind.

Its landing page emits `phone_call` on a `.tracked-phone` click. As the tracking
readiness review states: "this is a phone click, not connected-call or
qualified-call evidence." A click is not a call, and it carries no identity.

This is a second, independent gap sitting alongside the Zapier defect, and it
changes what the Zap fix actually delivers:

- **Fixing the Zap recovers named leads from forms.**
- **Calls stay anonymous**, and `phone call lead` is a primary action on 9 of 9
  Omega campaigns. The July 6-12 window recorded 3 tracked actions — 1 call, 2
  forms — so calls are roughly a third of the signal.

So the honest promise to David is "we can now name your form leads," not "we can
now name your leads." Saying the second and delivering the first would be the
tenth broken promise, made from a fix rather than a gap.

Closing the phone leg needs a tracking number — CallRail or WhatConverts — which
is new vendor spend and a separate approval.

## Fagan is a reference, not a client — 2026-09-09

Dillon, 2026-09-09: "fagan im not rly doing anymore but u can always use him as
reference". Fagan Painting has been moved out of the active roster in
[[System/operating-status]] and its three client-action rows retired from
[[System/approval-queue]].

**This does not weaken the argument, and it sharpens one part of it.** The Fagan
Zap still works and its configuration is still the thing to copy — leads parsed
into the email body, carrying UTM source/medium/campaign, the click id, a
timestamp and a submission id. That is a technical reference and it stays valid.

Two consequences:

- **Do not cite Fagan to a client as a current case study.** "It works for
  another client of ours" is no longer true in the present tense. The honest
  framing is that the pattern is proven and Momentum has run it.
- **Nobody is currently receiving named leads.** Fagan was the one account where
  the loop closed. With it off the roster, the count of live accounts producing
  named-lead match-back is **zero**, not one. The differentiator is a claim
  about a capability, not a description of current delivery, until Omega or
  another account is fixed.

## The nine promises and the unsent email are the same 41 days — 2026-09-09

Found in `Documents/Codex/2026-08-06/c/work/recent-session-index.json`, which
preserves the final message of the 2026-07-30 Omega session verbatim:

> "Prepared Gmail draft `r4420360796608729033` to David, Christian, and John
> requesting the exact Google Ads, Wix, and Omega-only GHL permissions. It
> remains unsent pending approval."
>
> "**Say send and I'll send the prepared access request.** Until permissions
> arrive, leads remain downloadable through Google Ads as `CSV for CRM`."

That was **2026-07-30**. The draft is still unsent on 2026-09-09 — **41 days.**

Put the two timelines side by side and they are the same window:

| Date | Promise to Omega | Access request |
|---|---|---|
| 2026-07-20 | promise 1 | — |
| **2026-07-30** | — | **drafted, "say send", never sent** |
| 2026-08-03 | promises 2 and 3 | still unsent |
| 2026-08-10 | promise 4 | still unsent |
| 2026-08-17 | promise 5 | still unsent |
| 2026-08-24 | promise 6 | still unsent |
| 2026-08-31 | promise 7 | still unsent |
| 2026-09-09 | — | still unsent |

Six of the nine promises were made after the email that unblocks the Google Ads
Admin half of the problem was already written and waiting.

The failure was never analysis or effort. Both were done. **What did not happen
was a send** — the same pattern as the 57 unsent client replies and the five
weekly-report batches that generated and never went out.

To be precise about the quote: that is an *agent* asking for approval. It is not
approval, and nothing on disk shows Dillon replying "send." The draft is unsent
and unapproved, and it stays that way until he says otherwise.
