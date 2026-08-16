---
tags: [research, outreach, qa, jesse, call-sheet]
created: 2026-08-16
updated: 2026-08-16
expires: 2026-09-16
source: "[[12_Brain/state/grades/built/report-2026-08-06]] · Gmail sent 2026-08-05 (100 hubs) and 2026-08-13 (238 sheet) · Slack #ai-tech-news 2026-08-03 / 2026-08-05 / 2026-08-06 · live HTTP probe of all 238 demo URLs on 2026-08-16"
---

# Jesse Call Sheet QA Audit

One-line summary: the four hubs and all 238 demo URLs are live and `noindex`, but they are **not** all QA-ready in the call-ready sense, and they are **not** all ready to call.

Contact rows stay in the Drive sheet. This page names businesses and verdicts only.

Related: [[02_Campaigns/AI Site Builder Outreach Engine/Site Grader|Site Grader]] · [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]] · [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]] · [[12_Brain/concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]]

## Verdict

| Question | Answer |
|---|---|
| Did we send Jesse batches? | Yes. Gmail is the handoff. Slack carried the same hubs and the 100-row sheet. |
| Are the pages up? | Yes. 4 original hubs + the 238-row remount hub all return HTTP 200 and `noindex`. All 238 sheet URLs resolve on one host. |
| Are they QA-ready to show on a call? | **No, not as a set.** 47 pages still say details are pending. Six titles say "City pending." Several later-batch pages still use placeholder service copy. |
| Are they ready to call as rebuild outreach? | **No.** The 2026-08-06 grader already answered Mac's objection: only **3 of 69** gradeable completed-100 sites are `rebuild`. The 2026-08-13 email still told Jesse the full 238 were ready for individual outreach. |
| Has anyone called yet? | **0 of 238** rows have a call result logged. |

**Call Jesse on 3 names today. Hold or reroute the other 235.** Do not send the correction below unless Dillon says send.

## What was actually sent

Two Gmail sends went to Jesse. Slack duplicated the 100-site dump and the Batch 2 hub. One later Gmail thread CC'd Jesse on the original Philly hub.

| When | Channel | What Jesse received | Claim at send time |
|---|---|---|---|
| 2026-08-03 | Slack `#ai-tech-news` | Batch 2 hub | 50+ sites ready to leverage in outreach; full responsive QA claimed |
| 2026-08-05 | Gmail | Four hubs (Batches 1–4, 25 sites each) | 100 prospect website concepts |
| 2026-08-05 | Slack DM + `#ai-tech-news` | Same Drive sheet (then 100 rows) | 100 homepage links + verified contact routes; asked if ready to send to prospects |
| 2026-08-06 | Slack `#ai-tech-news` | Prospect Radar hub | Review surface, not a new call list |
| 2026-08-11 | Gmail CC | Reply on the 2026-07-12 Philly hub thread | "New link" — not a new 25-site batch |
| 2026-08-13 | Gmail | Same Drive file, now titled **238 Call-Ready Businesses** | QA finished on every row; everything ready for individual outreach |

Not Jesse sends (Dillon-to-self only): "All 100 Prospect Website Links", "Desktop Screenshots for All 100 Prospect Websites", early July 7-concept emails.

The 238-row sheet is the current call surface. Every live URL on it points at one remount:

`https://momentum-prospect-radar-next20-2026-08-11.netlify.app/sites/<slug>/`

The four original hubs still work. The 238 sheet does **not** send Jesse to those original hosts. Original Batch 2 path `/sites/pt-in-philly/` on the Batch 2 hub 404s; the remount of that slug is live.

### Sheet mix (238 rows)

| Batch label | Rows | What it actually is |
|---|---:|---|
| `radar_next15` | 47 | Newest radar pages. Every one still carries "details pending / official source only" copy. |
| `B3_homepage` | 25 | Trade-heavy (plumbing, painting, interiors). **None graded.** Best ungraded pool. |
| `B4_redesigns` | 25 | 21 already graded as polish/verify/enrich; **2 rebuilds** (Waste Gas, Dunryte). |
| `W34` | 25 | Mixed dental / franchise / location-unconfirmed. |
| `W33` | 25 | 23 location-unconfirmed. |
| `B1_philly25` | 25 | Famous food + institutions. 19 already graded polish/verify/nurture. **0 rebuilds.** |
| `W31` | 24 | Mostly Batch 2 remapped. 17 polish/verify; **1 rebuild** (Mayfair Fence). |
| `radar_next20` | 20 | 8 out of PHL metro; 10 location-unconfirmed. |
| `cinematic` | 10 | Mixed; 3 weak-phone, 1 out of market. |
| `telegram_3d` | 10 | 9 location-unconfirmed. |
| `radar_impeccable` | 1 | Location unconfirmed. |
| `B2_homepage` | 1 | Dependable Concrete only. Rest of Batch 2 now sits in `W31`. |

Sheet marks **every row** `Passed | live verified 2026-08-13`. That stamp is HTTP-live, not call-ready.

## Two different "ready" questions

The 2026-08-13 email collapsed them.

| Gate | What it proves | 2026-08-16 result |
|---|---|---|
| **Live** | URL returns 200, page has an H1, `noindex` is on | 238/238 live. Three earlier "not found" hits were false positives (the phrase appears in normal copy). |
| **Demo QA** | Page is specific enough to show a stranger without embarrassment | Fail for all 47 `radar_next15` placeholders, 6 "City pending" titles, leftover blog-title junk on PT in Philly, placeholder service copy on 4 later-batch pages. |
| **Offer** | Their current site is worse than what we would ship | Only 3 graded `rebuild` among the completed 100. 58 more are polish/verify/nurture/enrich — ads/SEO or a landing page, not a rebuild call. |
| **Contact** | Location confirmed, phone from an official or classified public source, not a duplicate | 85 location-unconfirmed, 17 weak-phone, 122 unclassified URL phone sources, 2 exact-phone duplicate pairs. |
| **Call-ready** | Live + demo QA + rebuild offer + clean contact + not a chain/institution/famous-food waste | **3 names.** |

[[Pipeline Spec]] already says static-only is not a full pass and `qa_ready` stays `hold`. "Passed | live verified" is not that gate.

## Exclusive buckets (238, no overlap)

Priority order: rebuild first, then suppress, then hold, then "maybe after a fresh grade."

| Bucket | Count | Meaning |
|---|---:|---|
| `call_rebuild` | **3** | Graded rebuild. Only names Jesse should call as a website rebuild. |
| `wrong_offer_existing_site_graded` | 58 | Their site already grades polish / verify / nurture / enrich. Pitch traffic or a landing page, not a rebuild. |
| `hold_location` | 58 | Sheet itself flags location unconfirmed. |
| `hold_placeholder_page` | 44 | Live page still says details pending / official source only. |
| `maybe_call_after_regrade` | 46 | Ungraded, not in a suppress/hold bucket. Do **not** call until `/site-grade` runs. |
| `hold_out_of_market` | 9 | Outside the PHL metro the engine is built for. |
| `hold_weak_phone` | 9 | Phone source is directory / Waze / other weak class. |
| `do_not_call_institution` | 6 | Gardens, penitentiary, market, EPAM. |
| `do_not_call_chain` | 3 | Franchise / chain with a confirmed location (more chains sit inside placeholder + location holds). |
| `hold_duplicate` | 2 | Same phone as another row. |

Tag counts overlap, so they are larger than these exclusive buckets: location unconfirmed 85, weak phone 17, chain/franchise 19, famous food/culture 17, out of PHL metro 9, institutions 6.

### CALL NOW (rebuild)

From [[12_Brain/state/grades/built/report-2026-08-06]]:

1. **Waste Gas Fabricating Company, Inc.** — B4 — SQS 33 — no mobile viewport
2. **Mayfair Fence** — W31 — SQS 54 — copyright still 2018
3. **Dunryte Electric, Inc.** — B4 — SQS 54 — table layout

All three have official phone-source class. Zero call results logged. Pitch the rebuild + QR, not ads.

### ADS / SEO / polish (do not pitch a rebuild)

58 names already graded. Famous food in this list is a credibility burn if Jesse opens with "we rebuilt your site."

B1 (wrong offer or institution, not rebuild): Geno's Steaks, Pat's King of Steaks, Di Bruno Bros., Termini Brothers Bakery, Isgro Pastries, John's Roast Pork, Franklin Fountain, Zahav, Standard Tap, La Colombe Rittenhouse, Frankford Hall, Johnny Brenda's, Suraya, Victor Cafe, Good Dog Bar, Square 1682, ReAnimator Coffee, Fante's Kitchen Shop, MOM's Organic Market Center City, Reading Terminal Market, Eastern State Penitentiary, Philadelphia's Magic Gardens, Bartram's Garden, Morris Arboretum.

Trade examples already graded **verify/polish** (sell ads/SEO or one landing page): A.M. Electric, All Phase Electric, APT Heating and Cooling, Bill Frusco, Borden Heating & Cooling, Brandon Electric, Centrum Mechanical, Guaranteed Plumbing, JDV Electric, Manayunk Plumbing, Solution Based Plumbing, Strickland Electric, Young's Electrical, Farrell's Roofing, Moss Contracting, Academy Chiropractic, PT in Philly.

### HOLD — placeholder pages (all `radar_next15`)

Do not show these on a call. The page tells the prospect we did not finish the facts.

Agnes Edmunds Bridal & Formals · Al Tacos Locos · Apollo Wealth Advisors · APR Supply Company · Borsello Landscaping · Boyle Energy · Brandywine Auto Parts · Captain Car Wash · City Electric Supply West Chester · Custom IT Solutions · Ember & Ale · Euphoria Nail Bar · Ferrari Philadelphia · Field 1 Post · Francis Kaufman House · Heart & Soul Tattoo · Highline Motors Aston · Holiday Hair Quakertown · IVC Wealth Advisors · J-Pro Pools · Johnny Destructo's Hero Complex · Just Tires Media · Kinetic Physical Therapy · Manatawny Still Works · Ming's Chinese Restaurant · Narberth Pizza and Steaks · NovaCare Rehabilitation Conshohocken · O'Donnell, Weiss & Mattei · Ooka Hibachi and Sushi · Orthodontic Associates of Collegeville · Philadelphia Auto Accident Injury Attorney · Rally House Collegeville · Red Hill Greenhouses & Florist · Rocco's Brick Oven Pizzeria · Seiler & Drury · Snyder Online Marketing · The Edge Fitness Clubs Media · The Restaurant Store Plymouth Meeting · Theory Outlet at Philadelphia Premium Outlets · TM Prestige Home Cash Buyer · Towne Book Center & Wine Bar · Trend Auto Trader · UNO Pizzeria & Grill Oaks · Zuber Realty

"City pending" in the title (subset): Euphoria Nail Bar, Francis Kaufman House, Johnny's Pizza, Just Tires Media, Manatawny Still Works, O'Donnell, Weiss & Mattei.

### HOLD — location unconfirmed (exclusive 58)

Always Dental Care · Andorra Family Dentistry · Art City Vets · Artisan Wine and Cheese Cellars · Auger Manufacturing · Baldwin's Book Barn · Benjamin Lovell Shoes · C&C Super Seal · Chadds Ford Animal Hospital · Chestnut Hill Animal Hospital · Ciocca Pre-Owned · County Line Veterinary · Davidson Fabricating · Del Chevrolet · Dentistry for Life · Dream Team Home Services · Dutton Road Veterinary · Eastern Dragon · Easy Auto Tag & Insurance · Eisenberg Rothweiler · Electric Direct · Elverson Supply · Faulkner Buick GMC · Fillman & Sons Floors · Floral and Hardy of Skippack · Frederick W. Oster Fine Violins · Glen Eagle Pediatric Dentistry · GO2 Tech · Hamburg Animal Hospital · HaverCrown Dental · Home Furnishing Consignment · Jarman Sales & Service · Johnny's Pizza & Pasta · MacLaren Kitchen and Bath · Main Line Veterinary · Metalmorphose Ironworks · Morton Electric Pool & Spa · Nottingham Creamery · Oaks Italian Deli · Peking Gourmet · Pennsylvania Dental Group · Pipe Xpress · Pizza Peddler · Pro Nails · Radiance Dental · Riley Rodzianko & Clymer · Rittenhouse Square Chiro · Salter's Fireplace · Sciacca Service Center · Scott Lot · Southampton Hot Tub · The New Pennsburg Diner · THR Insurance · Train and Nourish · UrgentVet Pottstown · Welcome Dental · Whitelands Animal Hospital · Wholly Grounds Coffeehouse

Plus 27 more location-unconfirmed rows that landed in placeholder / out-of-market / duplicate buckets. Confirm the place before anyone dials.

### HOLD — out of market (9)

Katana Pittsburgh · Nicky's Thai Kitchen Downtown · Dinse Dental Care · Elite Philly Auto Parts · Fredo's Deli · Harry's Hotdogs · OpenArc · OSS Health · Sesame Inn

### HOLD — weak phone source (exclusive 9)

Barnes Financial Group · Big Head Transport · Golden Eagle Jewelers · L. A. Verruni Landscaping · Legacy Jewelers · Malvern Vision Care · McMenamin & Margiotti · Philadelphia Garage · Udis & Conn Orthodontics

### HOLD — duplicates

- **Johnny's Pizza** (radar_next15, "City pending") shares a phone with **Johnny's Pizza & Pasta** (W33).
- **THR Insurance Agency** (radar_next15) shares a phone with **THR Insurance** (W33).

Keep the W33 row after location is confirmed. Kill the radar_next15 clone.

### KILL / do not call as rebuild

Institutions: Bartram's Garden · Eastern State Penitentiary · EPAM Philadelphia · Morris Arboretum · Philadelphia's Magic Gardens · Reading Terminal Market

Chains with confirmed location: BeBalanced Royersford · DreamMaker Bath & Kitchen of Chester County · Live Urgent Care King of Prussia

More chains sit in holds (UNO, Rally House, NovaCare, Ferrari, Theory, The Edge Fitness, Captain Car Wash, City Electric Supply, APR Supply, Ciocca, Del Chevrolet, Faulkner, UrgentVet). Same rule: not a rebuild call.

### MAYBE — regrade before any call (46)

These are the only ungraded rows that are not already suppressed or held. They are **not** call-ready today.

**Regrade first (B3, all 25 — trades):** A POSITIVE RESPONSE PLUMBING · Advanced Commercial Interior · Anton's Plumbing & Heating · Bryn Mawr Plumbing & Heating · C. Mazzoni Brothers · Choice Coating · Chris Clement Plumbing & Heating · Commercial Wallcovering · Dan Ferry Plumbing · Ferguson Plumbing & Heating · Gracies Painting · Graham Painting (10/98) · Integrity Interiors · James Harper Painting · Lynch Plumbing & Heating · Mary Cleary Drywall & Carpentry · Mitchell Painting · PK2 Construction · Prime Interiors · Robert J. Spence Plumbing and Heating · Sharp Edge Construction · Shooster Development · Sioutis Coatings · Tanglewood PTG · Trend Painting

**Also ungraded, cleaner contact class:** CompuCraft Fabricators · United Metal Construction · Patriot Fence & Ironworks · RHI Construction · Lawrence Kassan Podiatry · Philly Medical and Rehab Associates · SCRC Accident & Injury Center · BG Electric Service · BPM Fitness · Colmar Dentistry For Kids · Plastic & Reconstructive Surgical Solutions · Wynnewood Eye Care · WJA Landscaping · Anthony Gueriera Jr. Insurance · Bàn Bàn Asian Bistro · Germantown Dental Group · Kehan's Auto Service · Lee's Hoagie House of Horsham · Frazer Antiques · Reardon Dental Exton · Philadelphia Record Exchange

B3 is the only later batch that is 25/25 in this bucket. If any new rebuilds exist, they are probably here.

## Demo-content problems that survive a 200

Content scan of all 238 live remount pages, 2026-08-16:

| Signal | Count | Notes |
|---|---:|---|
| Details pending / official source only | 47 | Entire `radar_next15` set |
| Confirm-location copy | 86 | Matches the sheet's location-unconfirmed problem |
| "Review contact source" / checked 2026-08-13 | 139 | The sheet told Jesse to review the source, then marked the row passed |
| Contact checked 2026-08-05 | 99 | Original 100, never re-verified against the grader |
| City pending in title | 6 | All `radar_next15` |
| Placeholder service copy | 4 | Benjamin Lovell Shoes, Home Furnishing Consignment, Pro Nails, Train and Nourish |
| Thin CTA | 0 | Not the failure mode |

PT in Philly still carries leftover blog-title junk ("The Shifting Landscape: Why is the Physiotherapy Industry") on the remount. That page is graded polish — ads/SEO, and clean the leftover copy before anyone screenshares it.

Johnny's Pizza remount is an explicit unverified concept: title "City pending", facts empty, duplicate phone.

## What I would do

1. **Stop the 238-row call pass.** Jesse should not work the sheet top to bottom. The 2026-08-13 subject line is wrong.
2. **Give him three rebuild calls for today:** Waste Gas Fabricating, Mayfair Fence, Dunryte Electric. One sentence each on why their current site loses (no viewport / stale copyright / table layout).
3. **Hand him a separate ads/SEO list**, not a discard pile. Start with the graded trades in B4 and W31 (electric, HVAC, plumbing, roofing, chiro). Famous B1 food stays off the rebuild script.
4. **Split the Drive sheet into four tabs:** `CALL NOW` (3) · `ADS SEO` (58 graded wrong-offer) · `HOLD` (placeholders, location, weak phone, out of market, duplicates) · `KILL` (institutions, chains, famous-food rebuild attempts). Leave the raw 238 tab as archive. Stop stamping `Passed | live verified` as if it were `qa_ready`.
5. **Deduplicate** Johnny's and THR. Keep the W33 row; drop the radar_next15 clone.
6. **Do not show `radar_next15` to anyone.** Fill facts or delete the 47 rows. "Official source only" on a live demo is the opposite of call-ready.
7. **Run `/site-grade` on B3** (25 trades) before adding names to `CALL NOW`. Optionally grade the other 21 "maybe" rows after that. A live demo is not a rebuild verdict.
8. **Confirm location** on the 85 unconfirmed rows before they leave HOLD. Jarman, Andorra Family Dentistry, Dutton Road Veterinary and several others already appear on the daily radar as decayed sites — that is a grader signal, not a location confirmation.
9. **Draft the correction. Do not send it** until Dillon says send. Text is below.
10. **Change the gate.** Live HTTP 200 + `noindex` may mark `live`. It must not mark `qa_ready` or `call_ready`. Call-ready needs: rebuild (or an explicit ads/SEO offer) + confirmed location + classified official/public phone + no placeholder copy + not a chain/institution/duplicate.

## Draft correction to Jesse (do not send)

> Jesse — short correction on the 238-row sheet I sent 2026-08-13.
>
> The pages are up. That is not the same as ready to call. Please do not work the list top to bottom.
>
> Call these three as website rebuilds: Waste Gas Fabricating, Mayfair Fence, Dunryte Electric. Their current sites are the ones that actually lose to what we built.
>
> Everything else is either a different offer (ads / local SEO / one landing page), a hold (location, thin demo, weak phone, out of market, duplicate), or a do-not-call (institutions, chains, famous food as a rebuild).
>
> I will split the sheet into CALL NOW / ADS SEO / HOLD / KILL so the first tab is the only call tab. Until that lands, use the three names above.

## What this does not prove

- Visual taste at desktop/mobile. This pass was HTTP + HTML content, not a Playwright walkthrough of all 238.
- Whether a B3 plumber would grade `rebuild` tomorrow. Ungraded means unknown, not yes.
- Whether Jesse already called off-sheet. The sheet has zero call results; Slack/Gmail do not log a completed call pass.
- Mail/QR readiness. Out of scope. `mail_ready` stays hold until a human flips it.

## Sources (no contact rows)

- Gmail: `100 Prospect Website Concepts` (2026-08-05) · `238 Business Call Sheet Ready for Tomorrow` (2026-08-13) · Philly hub thread CC (2026-08-11)
- Slack: `#ai-tech-news` Batch 2 hub (2026-08-03), 100-site dump (2026-08-05), radar link (2026-08-06); Jesse DM with the Drive sheet (2026-08-05)
- Drive sheet title as of 2026-08-13: `Momentum 360 - 238 Call-Ready Businesses - 2026-08-13`
- Grader: [[12_Brain/state/grades/built/report-2026-08-06]] (69 of the completed 100; mean SQS 66; rebuild 3 / polish 45 / verify 19 / nurture 1 / enrich 1)
- Live probe + content scan: 2026-08-16, all 238 remount URLs plus the four original hubs
