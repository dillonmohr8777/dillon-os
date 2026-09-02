---
tags: [campaign, batch, selection]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02b
date: 2026-09-02
---

# Selection: radar-next10-2026-09-02b

Source: `Daily-Briefs/radar-2026-09-01.md` top-suggestions table (full 15-row list read)
plus `12_Brain/state/radar/build-queue.csv` (57 lines / 56 data rows read, sorted by
`priority_score` descending).

## Why this batch does not reuse the radar brief's top table

The brief's top-suggestions table lists 15 rows scored 85-94. The top 10 of those rows
(94,94,94,94,94,94,94,94,94,89 -- Pearl Dental, Germantown Dental Group, Udis & Conn
Orthodontics, Colonial Animal Hospital, B & M Construction & Hvac, Bradco Heating and
Cooling, Casey Williams DMD, JT1 Electric, Advanced Air Services, Lee's Hoagie House)
were already built in batch `radar-next10-2026-09-02` -- confirmed by grepping every
slug against `batches/*/briefs/` and `batches/*/sites/` (all 10 present in that prior
batch, zero elsewhere). The remaining 5 brief rows (85, 85, 85, 85, 85 -- insurance x4
and a restaurant) are lower priority than several unbuilt rows still sitting in
`build-queue.csv`, so this batch pulls from the queue CSV instead of dropping to the
brief's insurance rows.

## Already-built check

Globbed `02_Campaigns/AI Site Builder Outreach Engine/batches/*/briefs/` and
`batches/*/sites/` (only `radar-next10-2026-09-02` exists) and `philly-sites/*`
(25 template-demo landmark dirs, no overlap). None of the 10 selected slugs below
collide with any existing batch or the Philly-25 demo set.

## Vertical approval check

Ran `resolveGeneratedStockAssignment` from
`automation/prospect-radar-next20/generated-stock-categories.js` against every
candidate in queue order. All of dentist, veterinary, ice-cream, hvac, and
metal-construction resolve to an approved board (dentist -> `germantown-dental-group`
or `udis-conn-orthodontics` depending on pediatric framing, veterinary ->
`category-veterinary`, ice-cream -> `category-dessert-bakery` via the bakery/dessert
regex, hvac -> `category-electric-pool`, metal-construction -> `category-construction-masonry`
via the `construction` substring match). **Go Vertical - Indoor Rock Climbing Gym**
(score 75, vertical `fitness-centre`) throws `No relevant generated-stock category is
approved` -- no rule or explicit assignment matches climbing/fitness. It is skipped on
this gate, not on score. The generated-stock library itself
(`automation/*/generated-stock-library/`) is still gitignored and absent from this
session's disk, so imagery stays degraded for all 10 picks regardless of board
approval -- placeholder `image-N.webp` alt-text only, no image files in `assets/`.

## Domain re-check (curl through proxy, two passes, run 2026-09-02)

Unlike the prior batch (10/10 dead domains), every domain here resolves and responds --
these are queue rows graded `broken`/`decayed` for mobile-viewport and reliability
faults, not domain failures. Results were flaky between the two curl passes (timeouts
and error codes on one pass, 2xx/3xx on the next), which is consistent with the
`server error 503` / slow-response faults the queue already recorded.

| Slug | URL | Pass 1 | Pass 2 |
|---|---|---|---|
| sprinkles-icecream | http://www.sprinklesicecreamelkinspark.com/ | timeout (curl 28) | 200 |
| dutton-road-veterinary-clinic | http://duttonroadvetclinic.com/ | 301 | 301 |
| colmar-dentistry-for-kids | https://www.colmarkids.com/ | 503 | 302 |
| andorra-family-dentistry | https://www.andorradental.com/ | 302 | 302 |
| always-dental-care | https://www.alwaysdentalcare.com/ | 503 | 302 |
| von-sas-and-son | http://vonsaselectric.com/ | 200 | 200 |
| pennsylvania-dental-group | https://www.padentalgroup.com/ | 202 | 202 |
| glen-eagle-pediatric-dentistry | https://gleneaglepediatricdentistry.com/ | 202 | 202 |
| dream-team | https://dreamteampa.com/ | 200 | 202 |
| davidson-fabricating | https://davidsonfab.com/ | 202 | 202 |

No existing site here is a clean, mobile-ready page -- the queue's own grading (site
quality 11-33, band `broken`/`decayed`) plus the observed 3xx redirects, 202s, and
intermittent 5xx/timeouts on recheck support keeping all 10 as rebuild candidates.
This is a genuinely different situation from the prior batch (dead domains) and is
called out explicitly rather than reused as boilerplate.

## The 10, ranked

| Slug | Business | Vertical | City | Score | Worst fault (source) | Why selected |
|---|---|---|---:|---:|---|---|
| sprinkles-icecream | Sprinkles Icecream | ice-cream | Elkins Park | 78 | server error 503 | Highest unbuilt score, approved board (dessert-bakery) |
| dutton-road-veterinary-clinic | Dutton Road Veterinary Clinic | veterinary | Philadelphia | 78 | no viewport meta | Tied-highest score, approved board |
| colmar-dentistry-for-kids | Colmar Dentistry For Kids | dentist (pediatric) | Colmar | 78 | no viewport meta | Tied-highest score, approved board |
| andorra-family-dentistry | Andorra Family Dentistry | dentist | Philadelphia | 78 | no viewport meta | Tied-highest score, approved board |
| always-dental-care | Always Dental Care | dentist | Phoenixville | 78 | no viewport meta | Tied-highest score, approved board (this vertical's slug already has an explicit stock-board assignment) |
| von-sas-and-son | Harry M. Von Sas & Son | hvac | McSherrystown | 77 | no viewport meta | Next-highest score, approved board |
| pennsylvania-dental-group | Pennsylvania Dental Group | dentist | Philadelphia | 74 | no viewport meta | Next-highest score after skipping Go Vertical (75, no board), approved board |
| glen-eagle-pediatric-dentistry | Glen Eagle Pediatric Dentistry | dentist (pediatric) | Delaware County (city blank in source, area used) | 74 | no viewport meta | Tied score, approved board |
| dream-team | Dream Team | hvac | Paoli | 74 | no viewport meta | Tied score, approved board |
| davidson-fabricating | Davidson Fabricating, Inc. | metal-construction | Chester County (city blank in source, area used) | 74 | no viewport meta | Tied score, approved board (construction match) |

**Skipped:** Go Vertical - Indoor Rock Climbing Gym (score 75, `fitness-centre`) --
no approved generated-stock board resolves for this vertical; skipping on the board
gate, not on score, keeps this batch at exactly 10 without guessing at unapproved
imagery.

## Template changes

`_templates/site-factory/build-site.js` `defaultOrder` reordered: `contact` moved from
after `catalog` to directly after `spotlight` (immediately before `social`). The old
order (`... feature, spotlight, social, catalog, contact, closing`) ran four
consecutive image-led sections (feature, spotlight, social, catalog) back to back --
Dillon's feedback on the prior batch was "too many consecutive images." `contact` has
no imagery, so the new order (`... feature, spotlight, contact, social, catalog,
closing`) splits that run into two image pairs (feature+spotlight, then social+catalog)
with a text/CTA section between them. Verified on `pearl-dental`'s existing brief in a
scratch dir (not PREV's built output): identical 11 sections / 370 words / 19 images,
only the section order changed (`hero, offerings, proof, gallery, story, experience,
feature, spotlight, contact-system, social(aside), catalog, closing`). This is a
template-level change and applies to this batch's builds and all future site-factory
batches; PREV's already-built HTML in `radar-next10-2026-09-02/sites/` was not touched.

## Placeholders used (never invented)

No phone number, street address, hours, review, or price appears anywhere in these
briefs or the rendered sites -- `phone`, `address`, and `hours` are left as empty
strings in every brief, matching the prior batch's convention (the template omits
those contact cards when empty). `build-queue.csv` marks `has_phone: true` for all 10
rows but does not disclose the actual number, so no number was invented. Two rows
(`glen-eagle-pediatric-dentistry`, `davidson-fabricating`) had a blank `city` column in
the source CSV; the CSV's own `area` (county) value was used as `city` instead of
inventing a town -- this is real source data, not a fabrication, and is called out per
brief in each JSON file's `placeholders` array. Every brief also carries an explicit
`placeholders` array (added field, appended after `images`) listing phone/address/hours/
images and, where applicable, the city substitution -- this batch adds that field
because the task asked for an explicit per-brief placeholder list; the prior batch
documented the same facts only in its `selection.md`. Copy describes services and
positioning only, sourced from vertical + city/area; no specific claim (years in
business, staff count, awards, review counts) was invented for any of the 10.

## Build outcome

See `batch-report.md` and `batch-summary.json` for the full per-site QA detail after
`build-batch.js` runs. Imagery is degraded for the same reason as the prior batch
(generated-stock library gitignored and absent locally) -- a separate agent is expected
to run the Higgsfield imagery pass afterward, matching `radar-next10-2026-09-02/imagery.md`.
