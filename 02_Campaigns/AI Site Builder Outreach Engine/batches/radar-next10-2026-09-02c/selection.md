---
tags: [campaign, batch, selection]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
date: 2026-09-02
---

# Selection: radar-next10-2026-09-02c

Source: `12_Brain/state/radar/build-queue.csv` (57 lines / 56 data rows) plus the
full `12_Brain/state/radar/registry.json` (1298 tracked prospects, 212 lifecycle
`queued_build` + others with `current.verdict == "rebuild"`). The registry was
read in full because `build-queue.csv` is a partial cache — cross-checking it
against the registry surfaced ~65 unbuilt, live-site `rebuild` candidates that
never made it into the CSV snapshot. `Daily-Briefs/radar-2026-09-01.md`'s
top-suggestions table (scores 85-94) was also read in full but every row on it
has `site_quality: 0` (`ENOTFOUND`/`ECONNREFUSED` — domain does not resolve) and
all ten of its top rows are already built in `radar-next10-2026-09-02/`, so none
of it qualifies under this batch's "live current website" rule.

## Already-built check — local batches

Read every file under `batches/*/sites/`, `batches/*/briefs/`, `batches/*/manifest.csv`,
and `batches/*/prospects.csv` for `radar-next10-2026-09-02` (10 slugs: pearl-dental,
germantown-dental-group, udis-conn-orthodontics, colonial-animal-hospital,
b-and-m-construction-hvac, bradco-heating-and-cooling, casey-williams-dmd,
jt1-electric, advanced-air-services, lees-hoagie-house) and `radar-next10-2026-09-02b`
(10 slugs: andorra-family-dentistry, dutton-road-veterinary-clinic, always-dental-care,
colmar-dentistry-for-kids, sprinkles-icecream, von-sas-and-son, pennsylvania-dental-group,
glen-eagle-pediatric-dentistry, davidson-fabricating, dream-team; Go Vertical was
considered but never built — skipped on the imagery-board gate, not built). Also
grepped every candidate's business name against `02_Campaigns/` and `01_Clients/`
directly to catch anything built outside the `batches/` tree — no hits beyond the
radar's own source/grading files (`Daily-Briefs/prospect-radar.html`,
`12_Brain/state/radar/*`, `12_Brain/queue/*`, `12_Brain/state/grades/*`), none of
which are builds or sends.

## Already-built / already-contacted check — Google Sheets

`mcp__Google_Drive__search_files` for radar / prospect / outreach-batch / mailer /
QR / site-inventory terms surfaced a master outreach workbook the local repo does
not track (folder `1udVXudaELnUAodM-VJbrML40FUb9E7z1`, "Momentum rebuilt-site
outreach workbook", last touched 2026-08-19, plus a near-duplicate "238
Call-Ready Businesses" sheet last opened 2026-09-01). Sheets read in full:

- **`0 · START HERE — verified 2026-08-19`** — index: 238 site pages built across
  all lanes (`philly-site-builder-hub-0711`, `philly-25-homepage-concepts-batch-2/3`,
  `philly-25-redesigns-batch-4`, `momentum-prospect-radar-next20-2026-08-11`, and
  a lane this repo has no local record of at all, **`radar-unslop-20260819`**).
- **`1 · CALL LIST — 133 cleared to show`** (full 133 rows read)
- **`2 · HOLD — 87 not cleared to show`** (full 87 rows read)
- **`3 · DO NOT PITCH — 18 off the list`** (full 18 rows read)
- **`5 · BATCHES — where each batch lives`**
- `Momentum 360 - 238 Call-Ready Businesses - 2026-08-13` ("Jesse Call Sheet",
  reopened 2026-09-01 — same 238-business universe as the tabs above; a
  full-text check against this batch's 10 final picks returned zero matches)

**This was decisive.** The `radar-unslop-20260819` lane alone already built and
deployed 40+ of the exact businesses sitting in `build-queue.csv` — including
nearly every row this batch would otherwise have picked next: Electric Direct,
Speck's Broasted Chicken was **not** in it (kept), but Johnny's Pizza, Eastern
Dragon, New Pennsburg Diner, Dr. Weiss's Office, L. A. Verruni Landscaping,
Fillman & Sons Floors & More, Peking Gourmet, Auger Manufacturing, Davidson
Fabricating, Pennsylvania Dental Group, Glen Eagle Pediatric Dentistry, Dream
Team, Malvern Vision Care, Smile Culture Dental's neighbors, and roughly 40
more `build-queue.csv` rows were all already built there or in
`momentum-prospect-radar-next20-2026-08-11`. None of this is visible from the
git repo alone — it lives only in Netlify + this Drive workbook. Full name list
cross-checked is in "Excluded on sheet evidence" below.

## Live-site verification (curl through the proxy, 2026-09-02, 2-3 passes per URL)

After excluding everything already built (locally or via the sheets), ~65
`build-queue`/`registry` rows remained with a real `site_quality > 0` (a
gradable, resolving domain). Applying the vertical preference (dental, hvac,
plumbing, electrical, vet, restaurant, auto, legal, home services) and the
4-per-vertical cap against that list, then re-verifying each finalist live,
found four that fail right now and were swapped out:

| Business | Registry score | curl result | Disposition |
|---|---:|---|---|
| Grand Sport Auto Body | 72 | connection timeout / reset, 2 passes, both protocols | dropped — unreachable now |
| Accurate Temperature | 66 | DNS/TLS failure, 4 passes | dropped — unreachable now |
| Malvern Veterinary Hospital | 72 | HTTP 404 (its `vetstreet.com` host page is gone; the platform root is up) | dropped — no page left to harvest |
| Bei Jing Chinese Food | 68 | HTTP 301 → `order.wasabisushihouse.com` (redirects to an unrelated business's ordering site) | dropped — no longer this business's site |
| Kevin T Coyne Attorney At Law | 58 | proxy CONNECT failure, 2 passes | dropped — unreachable now |
| D&T Auto Body | 63 | HTTP 503, 2 passes | dropped — reproducible server error, no content to harvest |

The 10 finalists below were each confirmed with a clean `200` except Advance
Exterior Solutions, which reproducibly returns `202` (not an error family
code, same result on two passes) — kept as the best live, preferred-vertical
option remaining once the roofer/home-services tier was reached.

## The 10, ranked

| Slug | Business | Vertical | Town | Score | Current-site grade | Website | Why |
|---|---|---|---|---:|---|---|---|
| f-m-berkheimer-inc | F M Berkheimer Inc | hvac | Mechanicsburg, Cumberland County | 74 | 33/100 (decayed) | https://fmberkinc.com/ | Highest unbuilt score of the batch; preferred vertical (hvac); confirmed live 200; not in any batch or sheet |
| the-juice-merchant | The Juice Merchant | restaurant | Narberth, Montgomery County | 69 | 25/100 (broken) | http://www.thejuicemerchant.com/ | Preferred vertical (restaurant); confirmed live 200 |
| golden-sea | Golden Sea | restaurant | Blue Bell, Montgomery County | 67 | 29/100 (broken) | http://goldenseabluebell.com/ | Preferred vertical; confirmed live 200 |
| specks-broasted-chicken | Speck's Broasted Chicken | restaurant | Collegeville, Montgomery County | 66 | 30/100 (decayed) | http://speckschicken.com/ | Preferred vertical (restaurant cap reached at 4 with this pick); confirmed live 200; highest-scoring row in `build-queue.csv` that survived every exclusion check |
| weathers-motors-and-auto-sales | Weathers Motors & Auto Sales | car (auto) | Media, Delaware County | 65 | 23/100 (broken) | https://www.weathersmotors.com/ | Preferred vertical (auto); independent used-car lot, not a franchise; confirmed live 200 |
| nolts-auto-parts | Nolt's Auto Parts #2 | car-parts (auto) | Denver, Lancaster County | 63 | 25/100 (broken) | http://noltsautoparts.com/ | Preferred vertical (auto); confirmed live 200 |
| union-chill-mat-company | Union Chill Mat Company | hvac | Zelienople, Butler County | 62 | 53/100 (dated) | https://www.unionchill.com/ | Preferred vertical (hvac); confirmed live 200 |
| sangillo-tire-center | Sangillo Tire Center | tyres (auto) | Folsom, Delaware County | 60 | 29/100 (broken) | http://www.sangillos.com/ | Preferred vertical (auto, tire/repair service); confirmed live 200; outranks the tied-score Smile Culture Dental only by being checked first, both kept |
| smile-culture-dental | Smile Culture Dental | dentist | Huntingdon Valley, Montgomery County | 60 | 55/100 (dated) | https://smileculture.com/huntingdon-valley/ | Preferred vertical (dentist); confirmed live 200; worst fault is a hard-coded desktop width, a clean mirror-and-improve target |
| advance-exterior-solutions | Advance Exterior Solutions | roofer (home services) | Macungie, Lehigh County | 58 | 33/100 (decayed) | https://advanceexteriorsolutions.com/ | Preferred vertical (home services); highest-scoring live home-services row left once Kevin T Coyne (legal, unreachable) dropped out; reproducibly returns 202, not an error |

Verticals used: restaurant ×3, auto/car ×3 (car, car-parts, tyres are three
distinct `vertical` field values), hvac ×2, dentist ×1, roofer ×1 — every
vertical is at or under the 4-per-vertical cap.

## Excluded on sheet evidence

| Business | Sheet | Reason |
|---|---|---|
| Electric Direct | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/electric-direct/`, held only on an imagery-disclosure fix |
| Johnny's Pizza | `2 · HOLD` + `1 · CALL LIST` (`radar-unslop-20260819` / `momentum-prospect-radar-next20`) | Already built under two slugs (`johnnys-pizza`) |
| Auger Manufacturing Specialists | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/auger-manufacturing/` |
| Davidson Fabricating | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/davidson-fabricating/` (also built locally in `radar-next10-2026-09-02b`) |
| Dream Team | `2 · HOLD` (`momentum-prospect-radar-next20`, as "Dream Team Home Services") | Already attempted, `/sites/dream-team-hvac/` |
| L. A. Verruni Landscaping | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/verruni-landscaping/` |
| Fillman & Sons Floors & More | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/fillman-and-sons-floors/` |
| Dutton Road Veterinary Clinic | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/dutton-road-veterinary-clinic/` (also built locally in `radar-next10-2026-09-02b`) |
| Eastern Dragon | `1 · CALL LIST` (`radar-unslop-20260819`) | Already built, `/sites/eastern-dragon/`, cleared to show |
| New Pennsburg Diner | `1 · CALL LIST` (`radar-unslop-20260819`, as "The New Pennsburg Diner") | Already built, `/sites/new-pennsburg-diner/`, cleared to show |
| Dr. Weiss's Office | `1 · CALL LIST` (`momentum-prospect-radar-next20`, as "Orthodontic Associates of Collegeville") | Already built, `/sites/dr-weiss-s-office/` |
| Peking Gourmet | `1 · CALL LIST` (`radar-unslop-20260819`) | Already built, `/sites/peking-gourmet/`, cleared to show |
| Malvern Vision Care | `1 · CALL LIST` (`radar-unslop-20260819`) | Already built, `/sites/malvern-vision-care/`, cleared to show |
| Metalmorphose Iron Studio | `1 · CALL LIST` (`momentum-prospect-radar-next20`, as "Metalmorphose Ironworks") | Already built, `/sites/metalmorphose-iron-studio/` |
| Home Furnishings Consignment | `1 · CALL LIST` (`momentum-prospect-radar-next20`) | Already built, `/sites/home-furnishings-consignment/` |
| Ooka Hibachi and Sushi | `2 · HOLD` (`radar-unslop-20260819`) | Already built, `/sites/ooka-hibachi-and-sushi/` |
| Snyder Online Marketing, Eisenberg Rothweiler, Philadelphia Auto Accident Injury Attorney, McMenamin & Margiotti, THR Insurance Agency, Be Balanced Hormone, Plastic Surgery Solutions, WJA Landscaping, Live Urgent Care, Floral and Hardy, Salter's Fireplace, GO2Tech, Southampton Hot Tub, Pipe Xpress, MacLaren Kitchen and Bath, Philadelphia Garage, Elverson Supply, DreamMaker Bath & Kitchen, Frederick W. Oster Fine Violins, Pro Nails, Benjamin Lovell Shoes, UNO Chicago Style Pizza, Oaks Italian Deli & Pizzeria, Brandywine Auto Parts | `2 · HOLD` and/or `1 · CALL LIST` | Every one of the remaining `build-queue.csv` rows above score 55 is already built under `radar-unslop-20260819` or `momentum-prospect-radar-next20-2026-08-11` |
| Andorra Family Dentistry, Always Dental Care, Colmar Dentistry For Kids, Sprinkles Icecream, Harry M. Von Sas & Son, Pennsylvania Dental Group, Glen Eagle Pediatric Dentistry | `1 · CALL LIST` / `2 · HOLD` (`radar-unslop-20260819`) | Already built **both** here and locally in `radar-next10-2026-09-02b` — confirms the two lanes overlapped |
| Pearl Dental, Germantown Dental Group, Udis & Conn Orthodontics, Lee's Hoagie House, Anthony Gueriera Jr. Insurance, Bàn Bàn Asian Bistro, Big Head Transport, Elite Auto Parts, Kehan's Auto Service, Morton Electric Pool & Spa | `1 · CALL LIST` (`radar-unslop-20260819`) | Already built (this is the same top-15 radar-brief cohort already fully consumed by local batch `radar-next10-2026-09-02`) |

**Not excluded, still available (deliberately not selected this round):** Go
Vertical - Indoor Rock Climbing Gym (75, `fitness-centre` — no preferred-vertical
match), Mt. Airy Pediatrics (72, `doctor` — not a preferred vertical), F M
Berkheimer's runner-up ties in the 55-58 band (Kevin T Coyne — dropped for being
unreachable, not for sheet evidence), Nathan Bean Contracting (57, `roofer` —
returns `403`, kept in reserve behind Advance Exterior Solutions's cleaner
`202`), Canton Building Supply and Frees Insurance (57 each, neither vertical is
on the preferred list). None of these appear on any sheet or in any batch — they
are simply lower priority or lower reliability than the 10 picked.

## Sources checked

1. `12_Brain/state/radar/build-queue.csv` (57 lines) — read in full
2. `12_Brain/state/radar/registry.json` (1298 prospects, 2.0 MB) — read in full,
   filtered to `current.verdict == "rebuild"` with a resolving `sqs > 0`
3. `Daily-Briefs/radar-2026-09-01.md` — read in full
4. `batches/radar-next10-2026-09-02/*` and `batches/radar-next10-2026-09-02b/*`
   (`selection.md`, `prospects.csv`, `manifest.csv`, `briefs/*.json`, `sites/`) —
   read in full
5. Vault-wide grep of every candidate's business name against `02_Campaigns/`,
   `01_Clients/`, and the whole repo — no builds or sends found outside the
   radar's own source data
6. Google Drive: `mcp__Google_Drive__search_files` for radar/prospect/outreach
   batch/mailer/QR terms, then full reads of `0 · START HERE — verified
   2026-08-19`, `1 · CALL LIST — 133 cleared to show`, `2 · HOLD — 87 not
   cleared to show`, `3 · DO NOT PITCH — 18 off the list`, `5 · BATCHES —
   where each batch lives`, and `Momentum 360 - 238 Call-Ready Businesses -
   2026-08-13`. A final full-text search on the 10 finalists' exact names
   turned up nothing relevant.
7. Live curl re-check (through the session's egress proxy) of all 10 final
   picks plus 6 near-miss candidates that were dropped for being unreachable —
   2-4 passes per URL, 2026-09-02

## Placeholders used (never invented)

No phone number, street address, hours, review, or price appears anywhere in
this selection. `build-queue.csv`/`registry.json` mark `has_phone: true` for 8
of the 10 rows (false for Nolt's Auto Parts and Malvern-adjacent rows are moot
since Malvern was dropped) but do not disclose the actual number, so none was
invented. Every town/county comes directly from the registry's own `city`/`area`
fields.
