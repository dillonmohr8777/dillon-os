---
tags: [concept, prediction]
source: "[[raw/2026-07-04 - lost-clients-confirmation-2]]"
updated: 2026-07-04
---

# Leading Indicators

**Summary:** the vault's job is prediction, not recall — these are the signals,
validated against our own client history, that say something is about to happen
before it happens.

## Churn signals (validated 2026-07-04)

1. **Silence predicts death.** Every single client with no activity in the June
   brief turned out to be gone when Dillon confirmed the roster (14 of 14,
   counting both confirmation rounds). Rule: **a client with no vault activity
   for ~6 weeks is presumed churning until proven alive** — surface it, don't
   wait to be told.
2. **Billing friction precedes exit.** Hardwood Artisan's card-update
   escalation (2026-04-07, via Sean) preceded the relationship ending. Rule:
   any billing escalation puts that client on churn watch.
3. **Rejected creative that keeps running is a trust leak.** Kimberly rejected
   Disney-style ads, then reported seeing them live — unresolved, that pattern
   ends retainers. Rule: creative rejections get verified-fixed within days,
   not remembered later.
4. **Undelivered work that's "done locally" is invisible to the client.** AMI
   lesson: a finished local build means nothing while the public site stays
   legacy. Rule: a build isn't done until the live URL proves it.

## Growth signals

- **Access granted quickly → engagement deepens** (7-Eleven tracking + LP
  family grew from fast access; Revive is stalled on GHL access — the deal is
  hostage to the handoff). Chase access like revenue.
- **Report quality converts to new scope.** The Netlify report factory turned
  reporting into a product (Jason Fallon's agent engagement, Melissa's portal).
  Every polished deliverable is a sales asset.
- **Web/landing work is the compounding lane** — it produced the biggest new
  deals (AMI, $45k Ecosystem proposal) while small GBP retainers churned.

## How the machine uses this

- `/client-pulse` and `/synthesize` check active clients against these signals
  and name the at-risk ones every week (see the Predictions section of
  `/synthesize`).
- When a prediction is confirmed or busted, note it here with the date — the
  list must earn its keep or shrink.

## Links
- [[concepts/Truth Hierarchy|Truth Hierarchy]] · [[concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]] · [[01_Clients/Client Index|Client Index]]
