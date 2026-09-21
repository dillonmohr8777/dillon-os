---
tags: [project, outreach, goal, long-horizon]
status: active
updated: 2026-09-03
note_type: project
created: 2026-09-03
horizon: 2026-12-03
source_refs:
  - "[[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/Outreach Copy - Dillon Voice]]"
  - "[[Dillon Voice Profile]]"
  - "12_Brain/state/outreach-ledger.json"
---

# Outreach engine reaches its first prospect

**Summary:** The outreach engine has built sites for a year and reached zero prospects. This is
the goal that closes that gap and turns a build pipeline into a learning acquisition loop.

## The number that matters

Stage 8 ran for the first time on 2026-09-03. Here is the whole funnel:

| Stage | Count |
|---|---|
| Sites built | 20 |
| QA ready | 20 (**100%**) |
| Approved | **0** |
| Reached (mailed or emailed) | **0** |
| Replies | not measured |
| Calls booked | 0 |

The engine has a 100% QA pass rate and a 0% activation rate. It is a factory with no loading dock.
Every hour spent improving build quality from here returns nothing, because build quality was never
the constraint.

**Goal: 100 real prospects reached, with replies measured, by 2026-12-03.**

Not 100 sites built. Reached. The build side is solved and has been for months.

## Four things the ledger found on its first run

1. **14 of 15 batch directories have no `prospects.csv`.** They contain only
   `PREFLIGHT-EVIDENCE.json`. The nightly radar has been running preflight and never completing a
   build for about two weeks. The daily automation looks alive and produces nothing.

2. **Field mapping is broken.** One row's `market` column contains
   `valuedclient@balafinancial.com`. An email address is sitting in the market field. Merge a
   sequence off this CSV today and prospects get mail addressed to a market called
   "valuedclient@balafinancial.com". This must be fixed before any send, not after.

3. **Prospect identity is not reliable.** The 2026-09-01 preflight listed
   `affordabledentures.com` / "Affordable Dentures & Implants" as ready. That is a national chain,
   and the discovery layer claims to filter chains. It also listed `suburbansolutions.com` under the
   name "The Rouse Group Development Co." - the domain and the business name disagree, so one of
   them is wrong. Every listed candidate had empty phone, address, and city. Building a personalized
   spec homepage for a national chain, or for a business whose name does not match its domain, is
   the exact credibility failure the campaign note names as its top risk.

4. **The real inventory is not in the vault.** Slack says 50+ sites and a "Best 50 Call Sheet" in
   Google Sheets. The vault's measurable state is 20 rows. Two sources of truth, and the ledger can
   only see one. Until the sheet and the CSVs reconcile, no funnel number is trustworthy.

## Measured blockers — 2026-09-03

Numbers, not theory. Every figure below came from the pipeline's own files.

### 1. CORRECTED 2026-09-03. The 5% email rate was a tooling artefact, not reality.

`find-contacts.js` does one plain HTTP fetch per prospect and regexes for an address. Rendered
research on the same class of prospect found **7 published emails out of 10** — roughly 70%, not 5%.

The scraper under-reports because it cannot see:

- **JS-rendered contact details.** Street's Stores publishes `streetstores@aol.com` only after
  JavaScript runs; the static HTML is an empty shell.
- **Obfuscated mailtos.** Kitay Law's address is masked by an anti-scraper plugin.
- **WAF blocks.** Several sites return 403 to a bare fetch and 200 to a browser user agent, which the
  script records as "no email" rather than "could not check".
- **Contact pages.** Addresses frequently live on `/contact` rather than the homepage.

**Consequence: email is viable after all, and the phone-first conclusion below was drawn from a bad
denominator.** Phone coverage is still higher and still the better volume channel, but email is not
the 5% dead end it looked like. `find-contacts.js` needs a rendered fallback before its output is
used to make any channel decision, and its past output should not be trusted as a reachability
measure.

### 2. Channel mix. Phone still leads, but not 19-to-1.

| Signal | Count |
|---|---|
| Graded prospects with a phone number | **113 of 118 (96%)** |
| Prospects publishing an email address | **3 of 60 (5%)** |
| Prospects with neither an email nor a contact form | **56 of 60 (93%)** |

That is a 19x gap. These businesses are reachable by phone and effectively unreachable by email,
because small operators route contact through a form or a phone line on purpose.

**Mac's original spec was right and the email substitution was wrong.** "Bot scrape > database > AI
site builder > Zapier > QR Code > Direct Mail > Gate Keep for Sales Call" targets exactly this
prospect type. Email got picked up here only because direct mail was blocked on a vendor decision,
which is choosing a channel by what is convenient rather than by who can receive it. No amount of
domain warming fixes a 5% address rate.

### 2. Supply collapse. The nightly batch is starving, not erroring.

| Batch | Candidate pool | Passed readiness |
|---|---|---|
| 2026-08-26 | 63 | 23 |
| 2026-09-01 | 42 | **3** |

The 14 batches with no `prospects.csv` did not crash. They ran, found too few qualified candidates,
and produced nothing. The daily automation looks alive and is quietly running dry.

**Root cause: dead domains.** In the 2026-09-01 pool, 39 of 42 candidates were rejected, and the
rejections are dominated by `HTTP 404` and `Could not resolve host`. The discovery source carries
defunct records.

This is the deepest problem in the engine: **the qualification signal and the disqualification signal
are the same signal.** A dead domain scores as maximum site decay, which is exactly what the
opportunity scorer is built to reward. The engine is being steered toward businesses whose websites
do not exist, and some of which no longer trade. Discovery needs a liveness gate before scoring, so a
domain that does not resolve is dropped rather than promoted.

### 2b. Confirmed: the top of the queue contains dead and mis-identified targets.

Rendered research on the 5 highest-priority unbuilt rows (2026-09-03) found **2 of 5 are not valid
prospects at all**, which is a 40% bad-target rate at the very top of the queue:

- **Go Vertical (priority 78).** The climbing gym is **closed**, and `govertical.com` now belongs to
  an unrelated residential developer in Greenville, South Carolina. The page contains no occurrence
  of "climb", "rock", "bouldering" or "gym". Building a spec site off that domain would have
  mirrored a different company in a different state. The registry still stores a "503 server error"
  fault for it from 2026-08-06, which is stale twice over.
- **Mt. Airy Pediatrics (priority 72).** The practice was **acquired by Advocare, LLC**. Every URL
  redirects to `advocaremtairypeds.com`, and the current site is modern with no defect found. The
  registry still tracks the old standalone domain as an independent practice.

Both entries in `12_Brain/state/radar/registry.json` need correcting, and neither would have been
caught by a scorer that reads decay signals without first asking whether the business still exists
and still owns the domain.

A third, **Always Dental Care**, is behind a genuine drag-puzzle captcha. It was correctly reported
as BLOCKED rather than as "no email" - the distinction the contact scraper fails to make.

### 3. The 20-site batch was never deployed.

`radar-next20-20260826` contains 20 built, QA-passed sites and no Netlify URL anywhere in its batch
data. Only the 10-site `radar-next10-2026-09-02c` batch is live. A site that is not deployed cannot
be linked in outreach, so those 20 builds currently generate nothing.

### 4. Inventory truth is still split three ways.

Slack says 50+ sites and a Best 50 Call Sheet. The ledger sees 20 rows. Ten are live. Until one
number is true, no funnel figure means anything.

## Why this is now unblockable

Stage 7 has been stuck on two external decisions: a PostGrid account for direct mail and a mail
vendor choice. Neither has moved since July.

Gmail came online 2026-09-03. **Email activation routes around both blockers entirely.** The QR and
direct-mail lane can stay parked; it is not on the critical path to the first reached prospect.

## The loop

What runs without being asked, and exactly where it stops.

```
DAILY (autonomous, no approval needed)
  1. discover      discover-prospects.js     new candidates for the active market
  2. qualify       grade-sites.js            score decay + opportunity, route strong sites to ads
  3. brief+build   build-batch.js            spec homepage per qualified prospect
  4. quality gate  qa.js                     fail closed; qa_ready=ready or nothing
  5. contacts      find-contacts.js          published addresses from their own site only
  6. draft         Gmail create_draft        Dillon-voice sequence, saved as drafts
  7. learn         outreach-ledger.js        funnel + bottleneck, every day

  ===================== HARD STOP =====================

HUMAN (Dillon, per batch)
  8. approve       read the drafts, press send, or do not
  9. record        emailed_on / replied / bounced back into prospects.csv
```

Stages 1 through 7 are Tier 0 and already forbidden from sending by `claude-loop.js`, whose
`FORBIDDEN_VERBS` list includes `send`, `post`, `publish`, `deploy`, and `spend`. The stop is
structural, not a promise.

Stage 6 writes **drafts**. A draft is not a send. Nothing leaves the account without Dillon
pressing send.

## Non-negotiables

- **Never send from `dillonmohr8777@gmail.com`.** It carries client work and live proposals. Cold
  volume goes on a separate warmed domain. One spam complaint on the personal address costs more
  than this entire channel is worth.
- **Warm before volume.** New domain, 2 to 3 weeks, ramp 20/day to 100. There is no shortcut and
  attempting one ends the channel permanently.
- **No attachments.** Link to the live site. The Philly videos are 35 to 52 MB and exceed Gmail's
  25 MB cap anyway; the decision is arithmetic, not taste.
- **Three touches, then stop.** Already Mac's rule in [[Drip Copy]]. A reply removes a contact from
  every remaining touch.
- **Real observation or no T2.** The second touch requires a verified, specific finding about that
  prospect's site. No generic filler. Generic observations convert the sequence back into a template
  and destroy the only advantage it has.
- **Never guess an email address.** `find-contacts.js` reads published addresses from a prospect's
  own site and stores them in the gitignored private layer. Roughly a quarter of small businesses
  publish one; the rest route through a form on purpose. Guessing patterns burns the domain and is
  not worth 4x the list size.

## Sequenced plan

**Phase 1 - stop lying to ourselves (this week).** Fix the field mapping bug. Fix chain filtering and
name/domain agreement in discovery. Find out why 14 of 15 batches produced no CSV. Reconcile the Google Sheet against the vault so one number is true. Add
`email`, `emailed_on`, `replied`, `bounced` to the CSV contract. No outreach until the data is real.

**Phase 2 - open the channel (weeks 2 to 4).** Buy the sending domain. SPF, DKIM, DMARC. Warm it.
While it warms, run `find-contacts.js` across the existing inventory and see how many prospects are
actually reachable by email. That number sets the realistic ceiling and may be much lower than the
site count.

**Phase 3 - first blood (week 4).** 20 drafts. Dillon reads all 20 and sends the ones he stands
behind. Record every outcome. This is the first honest reply-rate number the engine has ever
produced.

**Phase 4 - compound (weeks 5 to 13).** Ramp toward 100/day only if bounce stays under 2% and spam
complaints stay at zero. Each week the ledger slices replies by market, vertical, and subject line.
Wins become the default; losses get written down as mistakes, not quietly dropped.

## Kill switches

Stop the channel immediately, not after a review, if any of these trip:

- Any spam complaint
- Bounce rate above 3% on any batch
- A prospect responds angrily about accuracy on a site built for them
- The sending domain's reputation drops in Google Postmaster

## Review cadence

Weekly, Friday, against the ledger. Three questions and nothing else:

1. Did the reached number move?
2. What did the bottleneck line say, and is it the same one as last week?
3. What did we learn that changes the scoring in Stage 2?

A week where the reached number did not move and the bottleneck did not change is a failed week,
regardless of how many sites got built.

## Definition of done

The goal is met when: 100 prospects reached, reply rate known to one decimal place, bounce under 2%,
zero complaints, and the ledger shows a bottleneck that is downstream of activation. Anything that
improves build quality before that is a distraction.
