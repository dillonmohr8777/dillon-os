---
tags: [campaign, batch, selection]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02
date: 2026-09-02
---

# Selection: radar-next10-2026-09-02

Source: `Daily-Briefs/radar-2026-09-01.md` top-suggestions table (full 15-row list read)
plus `12_Brain/state/radar/build-queue.csv` (239 rows read). The top 10 rows of the
radar table already satisfied every rule below, so no rows past priority 89 were
needed.

## Already-built check

Globbed `02_Campaigns/AI Site Builder Outreach Engine/batches/*/` (empty -- this is
the first batch in that path) and `philly-sites/*/` (25 dirs: bartram-garden,
dibruno-bros, eastern-state, fantes-kitchen-shop, frankford-hall,
franklin-fountain, genos-steaks, good-dog-bar, isgro-pastries, johnny-brendas,
johns-roast-pork, la-colombe-rittenhouse, magic-gardens, moms-organic-market,
morris-arboretum, pats-king-steaks, philadelphia-record-exchange,
reading-terminal, reanimator-coffee, square-1682, standard-tap, suraya,
termini-bros, victor-cafe, zahav -- all existing template-demo landmarks, no
overlap with any radar prospect). None of the 10 selected slugs collide.

## Vertical approval check

`automation/prospect-radar-next20/generated-stock-categories.js` excludes only
advertising-agency, gft, lasting-impressions, smart-signs from an approved board.
dentist, hvac, electrician, veterinary, and restaurant all resolve to an approved
board (germantown-dental-group, udis-conn-orthodontics, category-electric-pool,
category-veterinary, lees-hoagie-house / category-general-restaurant), so all 10
picks clear this gate. **The generated-stock image library itself
(`automation/*/generated-stock-library/`) is gitignored and not present on disk
in this session** -- confirmed by `find` returning nothing -- so no real board
imagery could be applied. Every brief below ships with placeholder
`image-N.webp` alt-text entries only; no image files exist in `assets/`.
**Imagery is degraded on all 10 builds.**

## Domain re-check (curl through proxy, 10s timeout, run 2026-09-02)

| Slug | URL | curl result |
|---|---|---|
| pearl-dental | https://www.pearldentalphilly.com/ | connect failed (curl 56) |
| germantown-dental-group | http://germantowndental.us/ | DNS did not resolve (curl 6) |
| udis-conn-orthodontics | http://www.udisandconnorthodontics.com/ | DNS did not resolve (curl 6) |
| colonial-animal-hospital | http://www.colonialnewtownsquare.com/ | DNS did not resolve (curl 6) |
| b-and-m-construction-hvac | https://bmconstructionhvac.com/ | connect failed (curl 56) |
| bradco-heating-and-cooling | https://www.bradcocoolingandheatingpa.com/ | connect failed (curl 56) |
| casey-williams-dmd | http://www.caseywilliamsdental.com/index.html | DNS did not resolve (curl 6) |
| jt1-electric | http://jt1electricinc.com/ | DNS did not resolve (curl 6) |
| advanced-air-services | https://www.heatingandcoolingwaynesboropa.com/ | connect failed (curl 56) |
| lees-hoagie-house | http://www.leeshoagieshorsham.com/ | 301 -> 3leeshoagies.com, which itself does not resolve (curl 2) |

No prospect resolves to a working, decent site -- every domain in the batch is
dead or redirects to a dead host. The `score under 60` skip rule (no rebuild
where a decent existing site is found) never triggers here; all 10 stay in.

## The 10, ranked

| Slug | Business | Vertical | City | Score | Worst fault | Why chosen |
|---|---|---|---|---:|---|---|
| pearl-dental | Pearl Dental | dentist | Philadelphia | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| germantown-dental-group | Germantown Dental Group | dentist | Philadelphia | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, own approved board |
| udis-conn-orthodontics | Udis & Conn Orthodontics | dentist (ortho) | Jenkintown | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, own approved board |
| colonial-animal-hospital | Colonial Animal Hospital | veterinary | Newtown Square | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| b-and-m-construction-hvac | B & M Construction & Hvac LLC | hvac | Whitehall | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| bradco-heating-and-cooling | Bradco Heating and Cooling | hvac | Cochranton | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| casey-williams-dmd | Casey Williams, DMD | dentist | Boiling Springs | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| jt1-electric | JT1 Electric Inc. | electrician | Pocono Lake | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| advanced-air-services | Advanced Air Services LLC | hvac | Waynesboro | 94 | domain does not resolve (ENOTFOUND) | Top-priority row, preferred vertical, approved board |
| lees-hoagie-house | Lee's Hoagie House | restaurant | Horsham (Montgomery County) | 89 | domain does not resolve (ENOTFOUND) | Next-highest row, preferred vertical, own approved board |

All 10 are the highest-scoring rows in the radar's top-suggestions table (89-94,
the entire top of the list) that are not already built and whose vertical clears
the approved-board gate. No insurance prospects were needed to reach 10.

## Placeholders used (never invented)

No phone number, street address, hours, review, or price appears anywhere in
these briefs or the rendered sites -- `phone`, `address`, and `hours` are left
as empty strings in every brief (the template omits those contact cards
entirely when empty, confirmed in `build-site.js`). Copy describes services and
positioning only, sourced from the vertical and city on the radar row; no
specific claim (years in business, staff count, awards) was invented. Real
harvest was attempted for none of the 10 since every domain independently
failed to resolve or connect (see table above) -- per the mirror-and-improve
rule, a dead domain gets radar-row-only sourcing, not a fabricated mirror.

## Build outcome

All 10 built structurally (11 sections, 366-417 words, within the 350-500 word
spec). All 10 are held at `qa_ready: hold` / `mail_ready: hold` because of
missing real image assets (generated-stock library unavailable, see above) and
no Playwright visual pass in this environment -- this is a degraded-imagery,
not-QA-clean state, not a build failure. See `batch-report.md` for the full
per-site QA detail.
