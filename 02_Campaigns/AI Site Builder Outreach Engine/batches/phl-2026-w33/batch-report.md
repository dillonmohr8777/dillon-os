---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: phl-2026-w33
market: Philadelphia, PA
week: 2026-08-14
generated: 2026-08-14
mail_ready_default: hold
qa_ready_count: 23
---

# Batch Report: phl-2026-w33

23 of 25 sites qa_ready. Weekly target is 25.
**mail_ready is hold on every generated row.** Only explicit human approval may flip it.


## Spec compliance

Canonical targets: 9-11 sections, 350-500 words, 12-13 images. Spec misses block `qa_ready`.

Batch averages: **11 sections, 365 words, 13 images, 31 KB**.

| Prospect | Business | Sections | Words | Images | QA | Visual | qa_ready | mail_ready | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PHL001 | Always Dental Care | 11 | 363 | 13 | PASS | ran | ready | hold | clean |
| PHL002 | Andorra Family Dentistry | 11 | 370 | 13 | PASS | ran | ready | hold | clean |
| PHL003 | Be Balanced Hormone Weight Loss Centers | 11 | 364 | 13 | PASS | ran | ready | hold | clean |
| PHL004 | Benjamin Lovell Shoes | 11 | 368 | 13 | PASS | ran | ready | hold | clean |
| PHL005 | Colmar Dentistry For Kids | 11 | 361 | 13 | PASS | ran | ready | hold | clean |
| PHL006 | Davidson Fabricating, Inc. | 11 | 362 | 13 | PASS | ran | ready | hold | clean |
| PHL007 | Dream Team | 11 | 366 | 13 | PASS | ran | ready | hold | clean |
| PHL008 | DreamMaker Bath & Kitchen | 11 | 370 | 13 | PASS | ran | ready | hold | clean |
| PHL009 | Dutton Road Veterinary Clinic | 11 | 362 | 13 | PASS | ran | ready | hold | clean |
| PHL010 | Eisenberg, Rothweiler, Winkler, Eisenberg & Jeck, P.C. | 11 | 361 | 13 | PASS | ran | ready | hold | clean |
| PHL011 | Elverson Supply | 11 | 369 | 13 | PASS | ran | ready | hold | clean |
| PHL012 | Floral and Hardy | 11 | 364 | 13 | PASS | ran | ready | hold | clean |
| PHL013 | Frederick W. Oster Fine Violins | 11 | 360 | 13 | PASS | ran | ready | hold | clean |
| PHL014 | Glen Eagle Pediatric Dentistry | 11 | 362 | 13 | PASS | ran | ready | hold | clean |
| PHL015 | GO2Tech | 11 | 362 | 13 | PASS | ran | ready | hold | clean |
| PHL016 | Live Urgent Care | 11 | 368 | 13 | PASS | ran | ready | hold | clean |
| PHL017 | MacLaren Kitchen and Bath | 11 | 363 | 13 | PASS | ran | ready | hold | clean |
| PHL018 | Metalmorphose Iron Studio | 11 | 366 | 13 | PASS | ran | ready | hold | clean |
| PHL019 | Mt. Airy Pediatrics, P.C. | 11 | 363 | 13 | PASS | ran | ready | hold | clean |
| PHL020 | Pennsylvania Dental Group | 11 | 360 | 13 | PASS | ran | ready | hold | clean |
| PHL021 | Philadelphia Garage | 11 | 371 | 12 | PASS | ran | hold | hold | clean |
| PHL022 | Plastic Surgery Solutions | 11 | 369 | 12 | PASS | ran | ready | hold | clean |
| PHL023 | Salter's Fireplace & Outdoor Living | 11 | 369 | 13 | PASS | ran | ready | hold | clean |
| PHL024 | Smile Culture Dental | 11 | 360 | 12 | PASS | ran | ready | hold | clean |
| PHL025 | Southampton Hot Tub | 11 | 363 | 12 | PASS | ran | hold | hold | clean |

## Held (2)

- **Philadelphia Garage**: held
- **Southampton Hot Tub**: held

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
