---
name: site-grade
description: Grade prospect websites and funnel a large list into outreach lanes. Run before any harvest or build so we never pitch a website to a business whose site is already good. Use for list qualification, single-site audits, and grader calibration.
---

# Site Grade

The gate between a list and a build. A high grade means **do not pitch them a
website**.

Model: `12_Brain/concepts/Website SIGNAL Score.md`.
Rules: `12_Brain/protocols/prospect-grading-gate.md`.
Runbook: `_os/automation/docs/GRADER.md`.

## When to use

- Before `/site-batch`, to pick the 25 from a larger list. This is the normal path.
- When someone asks "should we reach out to this business?"
- After changing `weights.json`, to prove the grader still agrees with human judgment.

## Grade a list

```bash
node _os/automation/bin/grade-list.js --from <roster.json> --take 25
```

Then read the output in this order:

1. **The lane table.** How much of the list is actually addressable.
2. **The do-not-pitch list.** Say these names out loud before anyone mails them.
   This is the section that exists because Mac spot-checked the first 100 and found
   businesses that already had good sites.
3. **The outreach queue**, ranked by `priority` (`opportunity × viability`). Take
   the top 25.
4. **The manual-review list.** Every row there is a page the grader could not read.
   Open them yourself; do not let them silently drop.

Only `build`, `rebuild`, and `refresh` may proceed to a brief. Hand those to
`/mirror-and-improve` or `/site-factory`.

## Grade one site

```bash
node _os/automation/bin/grade-site.js <url> --name "Business" --vertical hvac --reviews 180 --rating 4.7
```

Lead the answer with the lane and the top two gaps, not the number. The gaps are the
outreach hook; on an `adjacent` prospect they are what to sell *instead* of a site.

## Enrich instead of park

A prospect in the `enrich` lane is missing `review_count`, `rating`, or
`ad_presence` — not rejected. Add those fields to the roster and re-run; it routes
itself. Never report an `enrich` row as "not a fit".

## When you disagree with a grade

Record it once in `12_Brain/state/grader-overrides.json` with a reason and who
recorded it. It applies on every future run and becomes a calibration anchor. Use
`lane` to force a lane, or `signal_adjustment` (capped ±10) to nudge the score.

Then re-run calibration:

```bash
node _os/automation/bin/grade-calibrate.js --live --with-overrides
```

## The eyes pass

When a result carries a pending `eyes` escalation, the score sits within 5 points of
a lane boundary and the machine cannot settle it. Open the screenshots under
`_os/automation/state/grader-shots/<slug>/` and answer three questions: does it look
expensive, does it look like this specific business, is the palette dull. Record the
verdict as an override with a reason. Do not adjust a score without writing down why.

## Hard rules

- SIGNAL 80+ is hands-off regardless of how good the prospect looks otherwise.
- Blocked, unreadable, or low-confidence goes to a human. Never guess a lane.
- Never spoof a browser or work around a bot wall. A wall means `manual`.
- Grades expire. Re-grade before reusing a list older than 90 days.
- Contact data stays out of this repo. The sheet is the system of record.
- The grader sorts a list. Deploying, mailing, and sending stay Tier 2.
