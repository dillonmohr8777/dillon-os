---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: phl-2026-w33b
market: Philadelphia, PA
week: 2026-08-14
generated: 2026-08-14
mail_ready_default: hold
qa_ready_count: 16
---

# Batch Report: phl-2026-w33b

16 of 25 sites qa_ready. Weekly target is 25.
**mail_ready is hold on every generated row.** Only explicit human approval may flip it.


## Spec compliance

Canonical targets: 9-11 sections, 350-500 words, 12-13 images. Spec misses block `qa_ready`.

Batch averages: **11 sections, 415 words, 13 images, 31 KB**.

| Prospect | Business | Sections | Words | Images | QA | Visual | qa_ready | mail_ready | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PHL001 | Balance Studios | 11 | 457 | 13 | PASS | ran | hold | hold | clean |
| PHL002 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | 11 | 436 | 13 | PASS | ran | ready | hold | clean |
| PHL003 | Captain Car Wash | 11 | 364 | 13 | PASS | ran | hold | hold | clean |
| PHL004 | Chestnut Hill Animal Hospital | 11 | 360 | 12 | PASS | ran | ready | hold | clean |
| PHL005 | Custom IT Solutions | 11 | 395 | 12 | PASS | ran | ready | hold | clean |
| PHL006 | Electric Direct | 11 | 368 | 12 | PASS | ran | hold | hold | clean |
| PHL007 | Ember & Ale | 11 | 462 | 13 | PASS | ran | ready | hold | clean |
| PHL008 | Golden Sea | 11 | 383 | 12 | PASS | ran | ready | hold | clean |
| PHL009 | Heart & Soul Tattoo | 11 | 366 | 12 | PASS | ran | ready | hold | clean |
| PHL010 | Home Furnishings Consignment | 11 | 486 | 13 | PASS | ran | ready | hold | clean |
| PHL011 | Johnny's Pizza | 11 | 382 | 13 | PASS | ran | hold | hold | clean |
| PHL012 | McMenamin & Margiotti | 11 | 426 | 13 | PASS | ran | ready | hold | clean |
| PHL013 | New Pennsburg Diner | 11 | 363 | 13 | PASS | ran | hold | hold | clean |
| PHL014 | O'Donnell, Weiss & Mattei, P.C. | 11 | 428 | 12 | PASS | ran | hold | hold | clean |
| PHL015 | Oaks Italian Deli & Pizzeria | 11 | 365 | 13 | PASS | ran | ready | hold | clean |
| PHL016 | Peking Gourmet | 11 | 494 | 13 | PASS | ran | ready | hold | clean |
| PHL017 | Pipe Xpress Inc | 11 | 454 | 12 | PASS | ran | ready | hold | clean |
| PHL018 | Pro Nails | 11 | 366 | 13 | PASS | ran | hold | hold | clean |
| PHL019 | Red Hill Greenhouses & Florist | 11 | 469 | 12 | PASS | ran | ready | hold | clean |
| PHL020 | Sangillo Tire Center | 11 | 384 | 13 | PASS | ran | ready | hold | clean |
| PHL021 | TM Prestige Home Cash Buyer | 11 | 445 | 13 | PASS | ran | hold | hold | clean |
| PHL022 | Train and Nourish | 11 | 412 | 12 | PASS | ran | ready | hold | clean |
| PHL023 | Union Jack's Olde Congo Hotel | 11 | 397 | 12 | PASS | ran | hold | hold | clean |
| PHL024 | Weathers Motors & Auto Sales | 11 | 450 | 13 | PASS | ran | ready | hold | clean |
| PHL025 | WJA Landscaping | 11 | 451 | 13 | PASS | ran | ready | hold | clean |

## Held (9)

- **Balance Studios**: held
- **Captain Car Wash**: held
- **Electric Direct**: held
- **Johnny's Pizza**: held
- **New Pennsburg Diner**: held
- **O'Donnell, Weiss & Mattei, P.C.**: held
- **Pro Nails**: held
- **TM Prestige Home Cash Buyer**: held
- **Union Jack's Olde Congo Hotel**: held

## Duplicate imagery

No duplicate images across the batch.

## Outputs

- Review hub: `index.html`
- QR sheet: `manifest.csv`
- Mail merge: `prospects.csv` (`qa_ready` for review; `mail_ready` always hold until human approval)

## Scope

Unused Prospect Radar rebuilds, priority desc. None of the week 33 slugs were rebuilt. Harvest owns brand, copy, photos, and palette. No wow-library chrome. Nine rows stay `qa_ready=hold` because harvest did not publish a first-party street address.

## Next steps

1. Human taste pass on `compare.html` (their live homepage vs the rebuild).
2. Explicit human approval flips `mail_ready` to ready on approved rows only.
3. Deploy stays Tier 2. No outreach send from this runner.
