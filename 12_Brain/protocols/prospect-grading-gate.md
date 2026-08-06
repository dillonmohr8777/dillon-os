---
tags: [protocol, outreach, grader, gate]
source: "[[12_Brain/raw/sessions/2026-08-06-pa-website-grader]]"
created: 2026-08-06
updated: 2026-08-06
---

# Prospect grading gate

**No prospect enters a build or an outreach list without a current grade, and a
business whose site is already good never gets a website pitch.**

This is the gate stage 2 of the [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]]
was always supposed to have. Scoring model:
[[12_Brain/concepts/Website SIGNAL Score|Website SIGNAL Score]].

## The rule

```
large list  →  grade  →  lanes  →  only three lanes reach outreach
```

Run before any harvest, any brief, any build:

```bash
node _os/automation/bin/grade-list.js --from <roster.json> --take 25
```

A prospect is eligible for the site factory only if its lane is `build`,
`rebuild`, or `refresh`. Everything else is held, and the hold is the point.

## Lanes

| Lane | Trigger | What happens |
|---|---|---|
| `build` | No website at all, and viability known-good | Full site build. The demo is the entire pitch. Highest priority in the funnel. |
| `rebuild` | SIGNAL under 45 | Full mirror-and-improve. Lead outreach with the two worst measured gaps. |
| `refresh` | SIGNAL 45–64 | Targeted upgrade, not a teardown. Cheaper build, shorter pitch. |
| `enrich` | Site side says go, ability to pay unknown | Pull reviews, rating, ad presence. Then it routes itself. **Not a rejection.** |
| `adjacent` | SIGNAL 65–79 | **Do not pitch a website.** Pitch the gap the grade found: GBP, social content, 360 tour, ads, AEO. |
| `hands_off` | SIGNAL 80+ | No offer. Their site is excellent and a cold pitch costs us credibility. |
| `park` | Viability known-low | Site needs work, business cannot carry the spend. Revisit if something changes. |
| `manual` | Grader could not read the page | A human opens it. The grader refuses to guess. |
| `suppressed` | Existing client, active deal, previously mailed | Never contact. |

## Hard rules

1. **A high SIGNAL outranks everything.** 80+ goes hands-off no matter how rich the
   prospect or how well the vertical fits. This rule exists because breaking it is
   what prompted the gate.
2. **The grader never guesses into an outreach decision.** Blocked, unreadable,
   client-rendered without a render pass, or under 70% confidence all route to
   `manual`. An unread page is not a bad page.
3. **`enrich` is not `park`.** Unknown ability to pay means the row is missing data,
   not that the business was judged and rejected. Only a *known* low viability parks
   a prospect.
4. **No site beats a bad site.** A business with no website is the strongest target
   in the funnel and is never scored as though it had a terrible one.
5. **Grades expire.** 90 days for active lanes, 180 for hands-off. An expired grade
   is not a grade; re-run before reusing a list.
6. **Calibrate before you trust a run.** Any change to `weights.json` requires
   `node _os/automation/bin/grade-calibrate.js` to pass. Offline anchors must hit
   their exact band every time.

## When a human disagrees

The grader is wrong sometimes. Record it once, in
`12_Brain/state/grader-overrides.json`:

```json
{
  "overrides": {
    "PHL-B1-suraya": {
      "url": "https://www.surayaphilly.com/",
      "business_name": "Suraya",
      "lane": "hands_off",
      "expect_band": "excellent",
      "reason": "Mac checked it 2026-08-05: already has a good website",
      "recorded_by": "mac"
    }
  }
}
```

Overrides are applied on every future run and replayed as calibration anchors, so
the correction becomes a permanent regression test. A `signal_adjustment` is capped
at ±10 points; a human can nudge the grader, not overrule the evidence.

## What still needs a human

- The taste question the score cannot answer: does it look expensive, does it look
  like *this* business, is the palette dull. That is the `eyes` pass, and it only
  fires for scores within 5 points of a lane boundary.
- Approving the outreach list and the mail piece. Unchanged, still Tier 2, still
  Mac or Melissa. See [[12_Brain/protocols/approval-tiers|approval-tiers]].

## Boundaries

- The grader makes read-only GET requests to public homepages, identified by user
  agent, capped at 6 concurrent. It never posts, authenticates, or spoofs a browser
  to get past a bot wall — a wall means `manual`, not a workaround.
- Contact data (emails, phone numbers) stays out of this repo. The sheet is the
  system of record; this repo is public.
- The grader does not deploy, mail, or send anything. It sorts a list.
