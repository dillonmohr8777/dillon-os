---
tags: [research, outreach, qa, jesse, design]
created: 2026-08-16
updated: 2026-08-16
expires: 2026-09-16
source: "[[philly-sites/DESIGN-SYSTEM]] · Gmail sent 2026-08-05 (100 hubs) and 2026-08-13 (238 sheet) · Slack #ai-tech-news 2026-08-03 / 2026-08-05 / 2026-08-06 · live HTML design scan + desktop visual review of hubs and per-batch samples on 2026-08-16"
---

# Jesse Call Sheet QA Audit

One-line summary: the **original Batch 1–4 hubs are design-QA ready**; the **238-row remount is not**. The Drive sheet now lists the 100 designed originals first and the 138 later-batch rows after. 71 remounts still fail a design show (47 identical unfinished concepts + 24 flattened Batch 2 pages).

Contact rows stay in the Drive sheet. This page names businesses and design verdicts only.

Related: [[philly-sites/DESIGN-SYSTEM]] · [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]] · [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]]

## Verdict (design only)

The question is whether a page looks finished enough to screenshare: expensive, like that business, not a recolor of the last one, not a "private concept" shell.

| What Jesse has | Design-QA ready? |
|---|---|
| Aug 5 Gmail — four original hubs (100 sites) | **Yes, as a set.** 94 originals that still resolve scored `design_ok`. Batch 2 originals look custom. Zahav, A.M. Electric, Advanced Commercial still look like those businesses. |
| Aug 3 Slack — Batch 2 hub | **Yes.** This is the designed Batch 2, not the later remount. |
| Aug 13 Gmail — 238 remount URLs | **No, not as a set.** Same host for every row. 146 still look finished. **71 should not be shown.** 20 cinematic/3D pages look designed but need `?forcegl` in some browsers. |

Do not send the correction below unless Dillon says send.

## The remount is the design bug

Every URL on the 238-row sheet points at:

`https://momentum-prospect-radar-next20-2026-08-11.netlify.app/sites/<slug>/`

That remount kept Batch 1, 3, and 4. It **flattened Batch 2** into a thinner `vt-thin` template (W31, 24 rows). It also added 47 `radar_next15` pages that share one unfinished hero.

Paired fetch of 94 original hub URLs vs their remounts: **20 Batch 2 businesses dropped 60–80 KB and 400–500 words.** Headlines went from a claim to the business name.

| Business | Original Batch 2 | Remount Jesse opens |
|---|---|---|
| Academy Chiropractic | Custom `arch-aurora-drift`, 845 words, "Chiropractic care that treats you like a person, not a chart" | `vt-thin`, 316 words, H1 is just the name, copy cuts off |
| Mayfair Fence | Full-bleed fence hero, condensed claim, orange CTA | Sparse beige page, leftover review-title junk in the section list |
| PT in Philly | "One hour. One patient. One Doctor of Physical Therapy." | Name-only H1, leftover blog-title junk in the HTML |

Dependable Concrete is the only Batch 2 name that kept its custom architecture on the remount.

## Design scan of the 238 remounts

HTML pass over every remount URL, scored against [[philly-sites/DESIGN-SYSTEM]] (10 sections, 350–500 words, 12–13 images, unique palette, no placeholder copy) plus a desktop visual sample.

| Batch | n | Template | Mean words / imgs | Design show? |
|---|---:|---|---|---|
| B1 remount | 25 | profile (24) | 478 / 11.6 | **Show.** Brand tokens held. Zahav remount matches the original hub. |
| B3 remount | 25 | custom-arch | 1269 / 8.2 | **Show.** Unique fonts and architectures. Advanced Commercial looks like a finished contractor page. |
| B4 remount | 25 | custom-arch | 1212 / 8.4 | **Show.** A.M. Electric remount matches the Batch 4 original. |
| B2 remount (Dependable only) | 1 | custom-arch | 823 / 8 | **Show.** |
| W34 | 25 | profile | 549 / 17 | **Show, with taste flags.** Always Dental is finished but the hero art is surreal / AI, and a caption runs together. |
| W33 | 25 | profile (24) | 620 / 14.4 | **Show 24.** Dutton Road Veterinary is the odd one (0 `<img>` tags). |
| radar_next20 | 20 | profile | 560 / 6 | **Show, thin imagery.** Below the 12–13 image target. |
| radar_impeccable | 1 | other | 544 / 16 | **Show.** |
| cinematic | 10 | WebGL / canvas | 607 / ~0 | **Show with `?forcegl`.** Bàn Bàn rendered a designed dark scene, unique headline, not a profile clone. |
| telegram_3d | 10 | WebGL archetypes | 621 / 0 | **Show with `?forcegl`.** Baldwin's Book Barn rendered. Shared subtitle "A new world in motion" across the ten. |
| W31 (Batch 2 remounted) | 24 | **vt-thin** | **272 / 7.2** | **Do not show.** Use the original Batch 2 hub instead. |
| radar_next15 | 47 | profile shell | 458 / 12 | **Do not show.** One concept template, three palettes, same hero. |

Scanner totals on the remount: `design_ok` 146 · `design_review` 29 · `design_not_ready` 63.

Visual pass upgrades cinematic + telegram from "review" to "show with `?forcegl`." It does **not** upgrade W31. Those 24 stay hidden.

**Do not screenshare from the remount: 71 pages (47 + 24).**

### radar_next15 is one page with 47 names

All 47 share the hero **“A clearer next step begins with the right question.”** Eyebrow is `<city> | <category> concept`. Body says services, address, hours, and contact are pending. Badge: "Private concept."

They are not 47 designs. They are three recolors:

| Accent | Count | Examples |
|---|---:|---|
| `#286b52` | 17 | APR Supply, Ember & Ale, EPAM, Narberth Pizza, NovaCare |
| `#375f78` | 16 | Ferrari Philadelphia, Rally House, Heart & Soul, Ming's |
| `#7a5135` | 14 | Agnes Edmunds, UNO Oaks, Theory Outlet, Al Tacos Locos |

Desktop: Agnes (bridal) and UNO (pizza) are the same layout, same buttons ("Open official source" / "See the concept"), different abstract blob. That fails the design-system rule: two sites in one batch must never converge.

### W31 remounts fail the taste pass

All 24 are `z-body vt-page`. H1 is the business name. Word count sits at 228–316 against a 350–500 target. Original Batch 2 pages were 664–845 words on custom architectures.

Desktop: Academy original is a dark glass hero with a real claim. Academy remount is a light card, name as headline, sentence cut off. Mayfair original is a contractor site. Mayfair remount is a sparse title page with a junk section labeled like a review title.

Point Jesse at `https://philly-25-homepage-concepts-batch-2.netlify.app/<slug>/` for these names, not the remount.

W31 remounts: Academy Chiropractic · Acupuncture Medical Practice · Bridesburg Spine · Bustleton Services · E & E cleaning · Farrell's Roofing · Greater Philadelphia Chiropractic · Hal Rosenthaler DMD · Lawrence Kassan Podiatry · Martha's Sophisticated Shine · Mayfair Family Chiropractic · Mayfair Fence · Metro Physical Medicine · Moss Contracting · Northeast Family Foot Care · Oxford Rehabilitation · Patriot Fence & Ironworks · Philly Medical and Rehab · PT in Philly · RHI Construction · Rittenhouse Square Chiro · Rufus Chiropractic · SCRC Accident & Injury · ZBC General Contracting

### What is actually design-showable

**From the original hubs (preferred):** all of Batch 1, Batch 2, Batch 3, Batch 4.

**From the remount, safe to show:** B1, B3, B4, Dependable Concrete, W33 (except Dutton Road Vet), W34, radar_next20 (thin photos), cinematic + telegram with `?forcegl`.

**Never show from the remount:** all 47 `radar_next15`, all 24 W31.

## Sheet order (rewritten 2026-08-16)

Drive sheet: [Momentum 360 call sheet](https://docs.google.com/spreadsheets/d/1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo)

`JESSE CALL SHEET` now leads with the 100 designed originals, then the 138 later-batch rows. Contact rows stay in Drive.

| Block | Sheet rows | n | Live Site |
|---|---|---:|---|
| SHOW | 1–100 | 100 | Original Batch 1–4 hubs. All 24 W31 names open the Batch 2 hub, not the thin remount. |
| REVIEW | 101–191 | 91 | Remount. W33 / W34 / next20 / impeccable stay as-is. Cinematic + telegram include `?forcegl`. |
| DO NOT SHOW | 192–238 | 47 | Remount `radar_next15`. Same unfinished hero. |

This is a sheet fix, not a live rebuild. The 47 placeholder pages and the W34 taste flags still need a site-factory pass plus a Dillon-run deploy. Do not treat the new order as those 138 sites being design-QA.

## What I would do (design)

1. **Tell Jesse which URL to open.** For Batches 1–4, use the original hub, not the 238 remount. For anything in W31, the remount is the worse page.
2. **Hide `radar_next15` from any screenshare.** Fill real copy and a real hero, or delete the 47 rows. Do not ship three shared palettes and one sentence.
3. **W31 sheet links now open the Batch 2 hub.** Do not remount custom-arch sites onto `vt-thin` again. Live remount pages are still thin until a Dillon-run deploy restores them.
4. **Keep cinematic / telegram.** They are the most designed pages in the later set. Open with `?forcegl`. Expect a shared "new world in motion" line on the 3D ten.
5. **Taste-pass W34 before a screenshare.** Always Dental is complete; the hero is not a real operatory. Fix the run-together caption.
6. **Do not treat `Passed | live verified` as design QA.** Live 200 plus 12 images still ships a generic hero. Design QA is: unique claim, unique palette, looks like that business, no "private concept" badge.
7. **Draft the correction. Do not send** until Dillon says send.

## Draft correction to Jesse (do not send)

> Jesse — design correction on the 238-row sheet.
>
> The sheet is now ordered: 100 designed originals first, then 138 later-batch rows.
>
> The original Batch 1–4 hubs are the ones to show. Those look finished. W31 Live Site URLs now open the Batch 2 hub.
>
> Do not screenshare the 47 newest radar pages. They all use the same headline ("A clearer next step begins with the right question") and say details are pending. That is a concept shell, not 47 designs.
>
> The cinematic / 3D ones are actually designed. If a page looks black, add `?forcegl` to the URL.

## Separate question: call-ready

Design-showable is not the same as "call this business to sell a rebuild." The 2026-08-06 grader still says only Waste Gas, Mayfair Fence, and Dunryte are `rebuild` among the completed 100. Mayfair's **designed** page is the Batch 2 original, not the remount.

Offer / location / phone buckets from the earlier pass stay in the Daily Brief. They are not the design gate.

## What this does not prove

- Overflow and contrast at 390 / 850 / 1440 on all 238. Visual review was desktop samples, not a full Playwright matrix.
- Whether every B3/B4 custom-arch page would pass a human taste jury. Scanner + spot checks say they look finished; a dull one can still hide in 25.
- Mail/QR readiness.

## Sources (no contact rows)

- Gmail: `100 Prospect Website Concepts` (2026-08-05) · `238 Business Call Sheet Ready for Tomorrow` (2026-08-13)
- Slack: `#ai-tech-news` Batch 2 hub (2026-08-03), 100-site dump (2026-08-05)
- Design contract: [[philly-sites/DESIGN-SYSTEM]]
- Live HTML design scan of 238 remounts + 94 original hub URLs, 2026-08-16
- Desktop visual review of both hubs, Academy / Mayfair original vs remount, Agnes + UNO (`radar_next15`), Bàn Bàn (`?forcegl`), Baldwin's Book Barn (`?forcegl`), Always Dental, Advanced Commercial
