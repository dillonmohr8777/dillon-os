---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: phl-2026-w35
market: Philadelphia, PA
week: 2026-08-24
generated: 2026-08-13
mail_ready_default: hold
qa_ready_count: 15
---

# Batch Report: phl-2026-w35

15 of 25 sites qa_ready. Weekly target is 25.
**mail_ready is hold on every generated row.** Only explicit human approval may flip it.


## Spec compliance

Canonical targets: 9-11 sections, 350-500 words, 12-13 images. Spec misses block `qa_ready`.

Batch averages: **10 sections, 437 words, 13 images, 47 KB**.

| Prospect | Business | Sections | Words | Images | QA | Visual | qa_ready | mail_ready | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PHL001 | Advance Exterior Solutions | 10 | 447 | 13 | PASS | ran | hold | hold | clean |
| PHL002 | Al Tacos Locos | 10 | 409 | 13 | PASS | ran | ready | hold | clean |
| PHL003 | Bala Financial Group | 10 | 428 | 13 | PASS | ran | hold | hold | clean |
| PHL004 | Balance Studios | 10 | 471 | 13 | PASS | ran | hold | hold | clean |
| PHL005 | Boyle Energy | 10 | 418 | 13 | PASS | ran | ready | hold | clean |
| PHL006 | Brandywine Auto Parts | 10 | 401 | 13 | PASS | ran | hold | hold | clean |
| PHL007 | Caise Benefits | 10 | 391 | 13 | PASS | ran | ready | hold | clean |
| PHL008 | Captain Car Wash | 10 | 471 | 13 | PASS | ran | hold | hold | clean |
| PHL009 | Custom IT Solutions | 10 | 494 | 13 | PASS | ran | hold | hold | clean |
| PHL010 | Dirt Work Solutions | 10 | 399 | 13 | PASS | ran | ready | hold | clean |
| PHL011 | Ember & Ale | 10 | 464 | 13 | PASS | ran | ready | hold | clean |
| PHL012 | Euphoria Nail Bar | 10 | 410 | 13 | PASS | ran | ready | hold | clean |
| PHL013 | Fusion Gyms | 10 | 430 | 13 | PASS | ran | hold | hold | clean |
| PHL014 | Golden Sea | 10 | 437 | 13 | PASS | ran | ready | hold | clean |
| PHL015 | IVC Wealth Advisors | 10 | 407 | 13 | PASS | ran | ready | hold | clean |
| PHL016 | Ming's Restaurant | 10 | 485 | 13 | PASS | ran | ready | hold | clean |
| PHL017 | Ooka Hibachi and Sushi | 10 | 440 | 13 | PASS | ran | hold | hold | clean |
| PHL018 | O'Donnell, Weiss & Mattei, P.C. | 10 | 465 | 13 | PASS | ran | ready | hold | clean |
| PHL019 | Red Hill Greenhouse & Florist | 10 | 494 | 13 | PASS | ran | ready | hold | clean |
| PHL020 | Rocco's Brick Oven Pizzeria | 10 | 392 | 13 | PASS | ran | hold | hold | clean |
| PHL021 | Sangillo Tire Center | 10 | 422 | 13 | PASS | ran | ready | hold | clean |
| PHL022 | Speck's Broasted Chicken | 10 | 413 | 13 | PASS | ran | ready | hold | clean |
| PHL023 | Trend Auto Trader | 10 | 455 | 13 | PASS | ran | ready | hold | clean |
| PHL024 | Union Jack's Olde Congo Hotel | 10 | 464 | 13 | PASS | ran | hold | hold | clean |
| PHL025 | Weathers Motors | 10 | 415 | 13 | PASS | ran | ready | hold | clean |

## Held (10)

- **Advance Exterior Solutions**: held
- **Bala Financial Group**: held
- **Balance Studios**: held
- **Brandywine Auto Parts**: held
- **Captain Car Wash**: held
- **Custom IT Solutions**: held
- **Fusion Gyms**: held
- **Ooka Hibachi and Sushi**: held
- **Rocco's Brick Oven Pizzeria**: held
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
