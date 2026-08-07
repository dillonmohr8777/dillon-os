---
tags: [campaign, spec, grader, qualification]
campaign: "[[AI Site Builder Outreach Engine]]"
answers: "Mac's 2026-08-05 note on the completed 100: some of these already have really great websites"
source: "_os/automation/fixtures/prospects/philly-100-completed.json (extracted from the 2026-08-05 completed-100 sheet)"
created: 2026-08-06
expires: 2026-11-06
---

# Site Grader

Stage 2 "Qualify" of the [[Pipeline Spec]], built. Scores the website a prospect **already has**, then routes them to the offer that fits it.

One-line summary: **a build slot is only worth spending when the prospect's current site is genuinely worse than what the factory would ship — and a prospect whose site is already good is a traffic client, not a discard.**

Skill: `/site-grade`. Code: `_os/automation/lib/site-grader.js`, `site-audit.js`, `opportunity.js`, `discovery.js`, `net.js`. Runners: `bin/discover-prospects.js`, `bin/grade-sites.js`. Tests: `_os/automation/tests/site-grader.test.js`.

## The problem it fixes

The previous qualify scorer (`lib/scorer.js`) could only detect **decay**. Nothing in it penalised quality. So a prospect with an excellent website collected ~50 points from reviews, vertical fit, ad presence and having-a-URL, then crossed the `queued_build` threshold of 60 on any hiring signal. The factory would spend a Tier-A build pitching a redesign to a business whose site is already better than the mirror.

Two scores now, deliberately not blended:

| Number | Question | High means |
|---|---|---|
| **Site Quality Score** | How good is their current site? | Leave it alone |
| **Opportunity Score** | Should we spend a build slot? | Build for them |

## Rubric

Six weighted dimensions, renormalised over whichever ones actually have evidence, so a Tier 0 and a Tier 1 grade share one 0–100 scale.

| Dimension | Weight | Covers |
|---|---:|---|
| Mobile | 22 | Viewport meta, responsive layout, horizontal overflow at 390/850/1440, tap targets |
| Foundation | 20 | HTTPS, resolves, no server error, not parked, no framesets/Flash, no broken TLS |
| Design craft | 18 | Modern layout primitives, type scale, palette depth, custom vs default styling |
| Performance | 16 | Response time, payload weight, oversized images, request count |
| Content & conversion | 14 | Copy depth, visible phone/CTA, hours, working contact path, booking flow |
| Discoverability | 10 | Title, meta description, schema.org, OG tags, alt text, copyright freshness |

Bands: **85+** elite · **70–84** strong · **50–69** dated · **30–49** decayed · **0–29** broken. Rebuild is appropriate at 55 and below; 56–74 is a polish pitch; 75+ is a traffic pitch.

## Tiers

Cost discipline. A market pull is hundreds of candidates; only the undecided ones earn an expensive look.

| Tier | Cost | What it adds |
|---|---|---|
| **0** | one HTTP GET, no browser | Dead domains, no-HTTPS, missing viewport, framesets, table layout, parked pages, thin copy, stale copyright, missing schema |
| **1** | Playwright render | Real computed palette and fonts, overflow at three viewports, payload weight, oversized images, tap targets |
| **1b** | free | Reuses an existing `harvest.json` from the site factory — a graded prospect is never harvested twice |
| **2** | human/agent | A 1–5 taste verdict: does it look expensive, does it look like that business |

### The rule that makes tiering honest

**Tier 0 can prove a site is bad. It cannot prove a site is good.**

It reads source HTML, never pixels — a dated 2014 contractor template and a beautifully art-directed build are near-identical in markup. So any unrendered grade that would otherwise read `strong` or `elite` is reported as **`unconfirmed`** and routed to **`verify`**, not to a skip. The decision to walk away from a prospect requires a render.

## Verdict routing

| Verdict | Condition | Offer | Build slot |
|---|---|---|---|
| `rebuild` | quality ≤ 55, opportunity ≥ floor | Tier-A demo site + direct mail QR | **yes** |
| `verify` | Tier 0 clean but never rendered | undecided | no |
| `polish` | quality 56–74 | one high-intent landing page, CRO | no |
| `ads_seo` | quality 75+, visibility gap | Google Ads / Meta / local SEO / GBP content | no |
| `nurture` | quality 75+, visibility healthy | relationship only | no |
| `enrich` | evidence too thin, or fetch inconclusive | retry / fix the URL | no |
| `suppress` | client, prior deal, already mailed | none | no |

`ads_seo` is the point of the whole design. A business with a genuinely good site has proven it invests in marketing — that is a Google Ads, Meta Ads, local SEO and GBP prospect, which is what Dillon sells. Filtering those out would throw away the best-qualified names on the list.

## Calibration — 2026-08-06

Run over 500 freshly discovered Philadelphia-metro prospects (none previously built for) plus the 69 of the completed 100 whose own site could be identified.

|  | Fresh 500 | Completed 100 (69 gradeable) |
|---|---:|---:|
| Mean site quality | 58 | **64** |
| Would qualify for a rebuild | 84 (18%) | **6 (9%)** |
| Needs a render to decide (`verify`) | 127 | 19 |
| Polish / nurture | 255 | 44 |

The completed 100 had **better** websites on average than a fresh, priority-weighted pull, and only 9% of them would qualify for a rebuild under this rubric. That is Mac's objection, quantified.

Vertical mix of the fresh 500 deliberately inverts the food-and-culture skew of the shipped batch, per [[Market Roster]]: 167 home services, 150 medical, 100 legal, 35 spa/wellness, 20 auto, 18 industrial, 10 retail/food.

### Bugs the calibration run found

Each of these could have mailed a redesign to a business with a working website, or dropped a genuine target:

1. **Craft scored a confident 78 on every Tier 0 grade.** Design cannot be read from markup. Craft is now half-weight until rendered, and confidence reports honestly (~91% instead of 100%).
2. **Client-rendered sites were penalised for "thin copy."** A Squarespace or React homepage exposes almost no text in source, so the rubric punished exactly the newest sites. Positive findings are now kept and absence penalties suppressed when client-side rendering is detected.
3. **`"@context": "http://schema.org"` was flagged as mixed content** — on essentially every site with structured data. Only real subresource loads count now.
4. **A 60-point dimension baseline made "no evidence" a passing grade.** Median site landed at 76 and *nothing at all* qualified for a rebuild. Baseline is 50; table-stakes rewards were trimmed.
5. **Missing ability-to-pay data was scored as inability to pay.** OSM carries no review counts, so 121 decayed sites were routed to `nurture`. The opportunity score is now a percentage of the points actually available, with `opportunity_confidence` reported alongside.
6. **52 of 500 sites were flagged as dead domains; only 18 were.** 22 were the local proxy returning 502, the rest timeouts and transient DNS. Fetch errors are classified `dead` / `broken_tls` / `inconclusive`, inconclusive ones are retried once, and only `ENOTFOUND`/`ECONNREFUSED` assert a dead domain.
7. **A failed Playwright render overwrote a successful Tier 0 grade with `reachable: false`**, cratering the score of live sites. Tier 1 failure now returns a marker that cannot destroy Tier 0 evidence.

### Found in review (PR #262, 2026-08-06)

8. **`EHOSTUNREACH` and `ENETUNREACH` were classified as dead domains.** They read like the host is gone, but both are routing failures on *our* side of the wire — the same class of error as a proxy 502. Only `ENOTFOUND` and `ECONNREFUSED` are authoritative now, because only those require an answer from the other side. Anything unrecognised defaults to inconclusive.
9. **The discovered candidate set carried street addresses, phone numbers and GPS coordinates into a public repo.** 483 addresses, 486 phones and coordinates for all 500 rows. Individually those facts are public in OpenStreetMap; committed together they are a targeting dataset, and some OSM entries are home-run businesses where the address is a residence. `sanitizeForGit()` now strips `street`, `phone`, `lat`, `lon` and the OSM ids from every write path, keeping a `has_phone` boolean so reachability scoring still works. City and postcode stay — coarse enough to batch by, not a doorstep.
10. **A `rebuild` verdict assembled from soft signals alone could reach `queued_build`.** The Tier 0 asymmetry cuts both ways: markup cannot certify a site as good, but it *can* certify specific defects. `gradeSite()` now returns `hard_faults` — dead domain, missing viewport, no HTTPS, broken TLS, framesets, table layout, 4xx/5xx, placeholder copy — and only a rebuild verdict backed by one of those is promoted to `queued_build`. Everything else stays `graded` and waits for a render.

## Discovery

`bin/discover-prospects.js` pulls from OpenStreetMap via Overpass — a public ODbL dataset with a documented API, no scraping problem, and the `website` tag we need. It drops national and regional chains (1,669 of 5,171 raw rows in the Philadelphia pull), social-and-directory-only listings, duplicate domains, current clients, and every domain in the completed-100 exclusion list.

**Coverage caveat:** OSM only holds what somebody mapped. It skews to city centres and under-represents suburban trades — the Philadelphia pull found 365 medical but only 167 home services. It is a strong free first source, not a census. Pair it with Mac's Maps pull when volume matters.

## Known gaps

- **Tier 1 could not run in the sandbox** this was built in: Chromium cannot tunnel the agent proxy (`ERR_CONNECTION_RESET` on every navigation, in every proxy configuration tried). Rendering was **confirmed working on Dillon's machine** during the PR #262 review, so this is a sandbox limitation only. Until a Tier 1 pass runs, the `verify` rows stay undecided and craft is measured at half weight everywhere.
- **Three tests fail in this sandbox** (`dev doctor`, two path-escape guards). They fail because the sandbox's filesystem layout defeats the "reject paths outside the repository" assertion, not because of any change here — the same commit passes **57/57 on a normal checkout**, verified in review.
- **No ability-to-pay data yet.** Review counts, ratings, ad presence and GBP status all come from Mac's Maps sheet, not OSM. Wiring that in is what will sharpen the `rebuild` ranking most — `opportunity_confidence` currently sits at 0.65 for OSM-sourced rows.
- **No outcome feedback yet.** Thresholds are calibrated against site quality, not against what closed. Record scans, calls and closes in each batch's `results.md`, then re-tune.
- **31 of the completed 100** cite only a trade-association or municipal directory, not a site of their own, so they cannot be graded at all. Those are flagged `own_site_found: false`.

## The standing loop

`/site-grade` is the on-demand path. The daily one is `bin/radar-refresh.js`, wrapped by `bin/radar-morning.ps1` as a Windows Scheduled Task on Dillon's desktop — chosen over a cloud runner because Tier 1 needs a Chromium that can actually reach the internet, and a CONNECT-only proxy cannot render.

`lib/radar.js` holds a persistent registry: every business ever seen, full grade history, a per-verdict recheck cadence (`verify` 7 days, `rebuild` 45, `polish` 90, `ads_seo` 120), and lifecycle state so nothing is pitched twice. That is what a one-shot graded CSV cannot do — a decayed site that quietly hires an agency stops being a target, and a good site that rots becomes one.

Geography weighting is explicit: Philadelphia ×1.0, collar counties ×0.88–0.92, rest of Pennsylvania ×0.62, and five of the seven rotation slots are Philadelphia-area. Momentum 360 is a Philadelphia agency, so a Pittsburgh prospect with an identical site is genuinely worth less to this pipeline and the ranking says so.

`lib/places.js` adds the ability-to-pay signals OSM lacks — review count, rating, business status — behind `GOOGLE_PLACES_API_KEY`. A result is accepted only when the website domain Google returns matches the domain we hold, so a national chain can never lend its 40,000 reviews to a small contractor. Budgeted per day, cached 150 days, halts on the first fatal error.

Setup and troubleshooting: `_os/automation/docs/RADAR-SETUP.md`.

## Related

- [[Pipeline Spec]] — the eight-stage model this fills in at stage 2
- [[Market Roster]] — the geography ladder and vertical priorities
- [[Batch Runbook]] — what happens to the `rebuild` queue next
