---
tags: [concept, outreach, grader, websites]
source: "[[12_Brain/raw/sessions/2026-08-06-pa-website-grader]]"
created: 2026-08-06
updated: 2026-08-06
expires: 2027-02-06
---

# Website SIGNAL Score

**A prospect's current website is graded 0–100 on six dimensions, and a high score
means do not pitch them a website.**

The score answers one question: how good is the site they already have? It is
deliberately inverted from a lead score. High SIGNAL is a reason to walk away from
the web offer, because pitching a rebuild to a business with a good site costs
credibility and wastes a build slot.

Implementation: `_os/automation/lib/grader/`. Runbook: `_os/automation/docs/GRADER.md`.
Gate that consumes it: [[12_Brain/protocols/prospect-grading-gate|prospect-grading-gate]].

## The six dimensions

SIGNAL is an acronym for what gets measured, and the weights sum to exactly 100.

| | Dimension | Weight | Asks |
|---|---|---|---|
| **S** | Structure | 18 | Is the technical foundation sound? |
| **I** | Impression | 22 | Does it look current and expensive? |
| **G** | Get found | 18 | Can search, maps, and AI answer engines read it? |
| **N** | Navigation | 16 | Can a person on a phone actually use it? |
| **A** | Action | 16 | Is there an obvious way to become a customer? |
| **L** | Load | 10 | Does it show up fast enough to keep the visit? |

Thirty-two individual checks sit under those six, each worth explicit points in
`weights.json`. Every check returns evidence, not just a verdict, so a score can be
argued with. "SIGNAL 41" is useless; "SIGNAL 41, phone is text-only not tappable,
no schema, 92KB of jQuery, copyright 2018" is an outreach script.

## Two axes, not one

SIGNAL is only half the decision. The other half is **viability**: reviews, rating,
vertical fit against a Momentum industry page, ad presence, multi-location, reachable
contact. A business with a terrible site and no ability to pay is not a prospect.

- `opportunity = 100 − SIGNAL` (no site at all counts as 100)
- `priority = opportunity × viability`, a product not a sum, because headroom is
  worthless without the money to act on it

## Three rules that make the score trustworthy

**1. Table stakes cannot buy a good grade.** Every check is tiered `stakes` (42
points) or `craft` (58 points). Stakes are what stop a site being broken — HTTPS, a
viewport tag, a title. Craft is what makes it good — real copy, responsive imagery,
tap-to-call, schema, speed. A site that clears only the stakes is capped out of the
upper bands. Shipping HTTPS in 2026 is the floor, not an achievement.

**2. Some failures are disqualifying, not merely costly.** A missing viewport, a
table layout, a marquee, dead tech, or a placeholder page caps the score outright:
one tell caps at 64, two at 44, three at 24. Without this, a primitive page scores
points for loading fast, and it loads fast *because* it is primitive. This is the
formalized version of scoring on "design elements + outdated transitions."

**3. Unknown is not zero.** A check the pass could not determine is excluded from
both sides of the ratio and lowers **confidence** instead of the score. Below 70%
confidence the grader refuses to route and asks for a human or a further pass. The
failure this prevents is the expensive one: a bot wall or a client-rendered page
looks like an empty site, scores terribly, and lands a business with a perfectly
good website in the mail queue.

## Bands

| Band | Range | What it means |
|---|---|---|
| Excellent | 80–100 | Do not pitch a website. They already have one. |
| Solid | 65–79 | Works fine. A web pitch reads as insulting. Sell something else. |
| Dated | 45–64 | Functional but behind. Refresh, not rebuild. |
| Weak | 25–44 | Real gaps a rebuild fixes. Core outreach target. |
| Broken | 0–24 | Actively costing them customers. Best target that has a site. |

The strongest target is not in the table: **no website at all** scores no SIGNAL and
goes straight to the top of the funnel. That is the pool Jesse pointed at, and all
25 of batch B3 turned out to be in it.

## Why it is iterative

Three loops, and the third is the one that matters.

1. **Escalating passes per site.** Resolve → static → render → eyes. Each pass runs
   only when the cheaper one could not decide, so a thousand-row list costs about a
   thousand HTTP requests rather than a thousand browser sessions.
2. **Expiring grades.** Every grade carries an `expires` date, 90 days for active
   lanes and 180 for hands-off. Sites decay; a stale grade announces itself.
3. **Calibration against human judgment.** `12_Brain/registry/grader-calibration.json`
   holds anchors — a site plus the band a human says it belongs in. Mac's
   "Suraya already has a good website" is anchor `live-suraya`, and if the grader
   ever routes Suraya into a web pitch, calibration fails and the run is blocked.
   Human overrides are replayed as anchors, so a correction made once becomes a
   permanent regression test instead of a Slack message that scrolls away.

## First run

Graded the existing 100 Philly prospects on 2026-08-06: 19 hands off, 19 adjacent
offer, 53 genuine targets pending enrichment, 9 unreadable. **38 of 100 built sites
went to businesses that should never have been pitched a website.**

Related: [[12_Brain/entities/Website Factory|Website Factory]] ·
[[12_Brain/entities/Momentum 360|Momentum 360]] ·
[[12_Brain/concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]] ·
[[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]]
