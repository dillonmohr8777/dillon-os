---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: phl-2026-w33b
market: Philadelphia, PA
week: 2026-08-14
generated: 2026-08-15
mail_ready_default: hold
qa_ready_count: 16
---

# Batch Report: phl-2026-w33b

16 of 25 sites qa_ready. Weekly target is 25.
**mail_ready is hold on every generated row.** Only explicit human approval may flip it.


## Spec compliance

Canonical targets: 9-11 sections, 350-500 words, 12-13 images. Spec misses block `qa_ready`.

Batch averages: **11 sections, 413 words, 13 images, 31 KB**.

| Prospect | Business | Sections | Words | Images | QA | Visual | qa_ready | mail_ready | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PHL001 | Balance Studios | 11 | 454 | 13 | PASS | ran | hold | hold | clean |
| PHL002 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | 11 | 434 | 13 | PASS | ran | ready | hold | clean |
| PHL003 | Captain Car Wash | 11 | 361 | 13 | PASS | ran | hold | hold | clean |
| PHL004 | Chestnut Hill Animal Hospital | 11 | 366 | 12 | PASS | ran | ready | hold | clean |
| PHL005 | Custom IT Solutions | 11 | 393 | 12 | PASS | ran | ready | hold | clean |
| PHL006 | Electric Direct | 11 | 365 | 12 | PASS | ran | hold | hold | clean |
| PHL007 | Ember & Ale | 11 | 459 | 13 | PASS | ran | ready | hold | clean |
| PHL008 | Golden Sea | 11 | 380 | 12 | PASS | ran | ready | hold | clean |
| PHL009 | Heart & Soul Tattoo | 11 | 363 | 12 | PASS | ran | ready | hold | clean |
| PHL010 | Home Furnishings Consignment | 11 | 500 | 13 | PASS | ran | ready | hold | clean |
| PHL011 | Johnny's Pizza | 11 | 379 | 13 | PASS | ran | hold | hold | clean |
| PHL012 | McMenamin & Margiotti | 11 | 423 | 13 | PASS | ran | ready | hold | clean |
| PHL013 | New Pennsburg Diner | 11 | 361 | 13 | PASS | ran | hold | hold | clean |
| PHL014 | O'Donnell, Weiss & Mattei, P.C. | 11 | 425 | 12 | PASS | ran | hold | hold | clean |
| PHL015 | Oaks Italian Deli & Pizzeria | 11 | 362 | 13 | PASS | ran | ready | hold | clean |
| PHL016 | Peking Gourmet | 11 | 491 | 13 | PASS | ran | ready | hold | clean |
| PHL017 | Pipe Xpress Inc | 11 | 452 | 12 | PASS | ran | ready | hold | clean |
| PHL018 | Pro Nails | 11 | 363 | 13 | PASS | ran | hold | hold | clean |
| PHL019 | Red Hill Greenhouses & Florist | 11 | 467 | 12 | PASS | ran | ready | hold | clean |
| PHL020 | Sangillo Tire Center | 11 | 382 | 13 | PASS | ran | ready | hold | clean |
| PHL021 | TM Prestige Home Cash Buyer | 11 | 442 | 13 | PASS | ran | hold | hold | clean |
| PHL022 | Train and Nourish | 11 | 409 | 12 | PASS | ran | ready | hold | clean |
| PHL023 | Union Jack's Olde Congo Hotel | 11 | 394 | 12 | PASS | ran | hold | hold | clean |
| PHL024 | Weathers Motors & Auto Sales | 11 | 447 | 13 | PASS | ran | ready | hold | clean |
| PHL025 | WJA Landscaping | 11 | 449 | 13 | PASS | ran | ready | hold | clean |

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

## Next steps

1. Human taste pass on the hub.
2. Explicit human approval flips `mail_ready` to ready on approved rows only.
3. Deploy stays Tier 2. No outreach send from this runner.
