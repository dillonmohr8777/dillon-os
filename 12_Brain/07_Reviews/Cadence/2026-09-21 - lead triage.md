---
note_type: review
status: active
date: 2026-09-21
updated: 2026-09-21
cadence: daily
job: leads-triage
source: "Slack #360leads (C05R2B1ULF6)"
tags: [review, cadence, leads]
---

# Lead triage, 2026-09-21

Window read: **2026-09-20 08:12 EDT to 2026-09-21 08:12 EDT**, both `oldest` and
`latest` bounded. Slack returned 4 messages and confirmed no more were available
in range.

## Counts

**real 2 / duplicate 1 / noise 1** out of 4 messages.
Duplicates **25%**, noise **25%**. Half the channel was not a new lead.

Low volume weekend traffic, so the percentages carry little weight on their own.
What matters is that the duplicate pattern fired again, unchanged.

## Real leads, 2

| name | email | phone | business | source |
| --- | --- | --- | --- | --- |
| La Toxiica Toxiica | yasmindegro34@gmail.com | +1 939 649 0663 | "amo joderte xD" | Meta Lead Ads 2026 Suspension Ads |
| Dallas Wayne Thompson | dallas93309@gmail.com | +1 928 551 5511 | StoreExpress and BestRvTravel.com | HubSpot, no source field set |

### Quality note on the first one

It passes the rule as written (a name plus both an email and a real number), so
it is counted real. It should still be looked at before anyone calls it:

- The business field is a crude Spanish phrase, not a business name.
- The form answers contradict each other. "Is your Google business profile
  currently suspended or disabled?" answers **No**, and the very next answer says
  it has been suspended **1 to 4 weeks**. Business type is "Other".
- The area code is 939, Puerto Rico, against a campaign named 2026 Suspension
  Ads.

This is the shape of a form filled to see what happens, not a buying intent. It
costs a Meta lead credit and a HubSpot contact either way. Counted real,
qualified as low.

### Note on the second

Dallas Wayne Thompson arrived as a HubSpot contact with **no source field**, and
no Meta or audit copy fired before it inside the window. So either it came in
through a path that does not stamp a source, or its originating copy landed
outside the window. Either way there is no campaign attribution on a lead with a
full name, email, phone and two named businesses. That is a real lead nobody can
attribute.

## Duplicate pairs that fired, 1

| kept | dropped | gap |
| --- | --- | --- |
| **New Meta Lead**, La Toxiica Toxiica, `1789968487.208609`, 2026-09-21 01:28:07 EDT | **New Hubspot Lead / Contact**, same person, `1789968559.388759`, 2026-09-21 01:29:19 EDT | **72 seconds** |

Matched on email `yasmindegro34@gmail.com`. The Meta copy is the one kept: it
carries the campaign name, the phone number, the business field and all three
qualifying answers. The HubSpot copy that fired 72 seconds later carries a name
and an email and nothing else, and would have thrown away the campaign
attribution if it had been the copy anyone worked.

**This is the same Zap overlap measured on 2026-09-16 and again on 2026-09-17.**
It is now the third dated observation of the identical pattern. Nothing upstream
has changed.

## Noise, 1

| message | why |
| --- | --- |
| "Toronto On", `647-655-8792`, 2026-09-20 12:01:42 EDT | Name is a place, not a person. Caller ID only. No email, no business, no source. |

## What this job did not do

Nothing posted to Slack, nothing replied in the channel, nothing touched in
HubSpot. Report only. Jason and Sean decide.
