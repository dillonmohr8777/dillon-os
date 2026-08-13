---
tags: [campaign, batch, report]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: phl-2026-w34
market: Philadelphia, PA
week: 2026-08-17
generated: 2026-08-13
mail_ready_default: hold
qa_ready_count: 14
---

# Batch Report: phl-2026-w34

14 of 25 sites qa_ready. Weekly target is 25.
**mail_ready is hold on every generated row.** Only explicit human approval may flip it.


## Spec compliance

Canonical targets: 9-11 sections, 350-500 words, 12-13 images. Spec misses block `qa_ready`.

Batch averages: **10 sections, 449 words, 13 images, 44 KB**.

| Prospect | Business | Sections | Words | Images | QA | Visual | qa_ready | mail_ready | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PHL001 | Always Dental Care | 10 | 481 | 13 | PASS | ran | ready | hold | clean |
| PHL002 | Auger Manufacturing Specialists | 10 | 412 | 13 | PASS | ran | ready | hold | clean |
| PHL003 | Barnes Financial Group | 10 | 430 | 13 | PASS | ran | hold | hold | clean |
| PHL004 | Be Balanced Hormone Weight Loss Centers | 10 | 468 | 13 | PASS | ran | ready | hold | clean |
| PHL005 | BG Electric Service LLC | 10 | 464 | 13 | PASS | ran | hold | hold | clean |
| PHL006 | BPM Fitness | 10 | 433 | 13 | PASS | ran | hold | hold | clean |
| PHL007 | Chestnut Hill Animal Hospital | 10 | 429 | 13 | PASS | ran | ready | hold | clean |
| PHL008 | Colmar Dentistry For Kids | 10 | 468 | 13 | PASS | ran | ready | hold | clean |
| PHL009 | County Line Veterinary Hospital | 10 | 455 | 13 | PASS | ran | ready | hold | clean |
| PHL010 | DreamMaker Bath & Kitchen | 10 | 467 | 13 | PASS | ran | hold | hold | clean |
| PHL011 | Easy Auto Tag & Insurance | 10 | 464 | 13 | PASS | ran | hold | hold | clean |
| PHL012 | Eisenberg, Rothweiler, Winkler, Eisenberg & Jeck | 10 | 459 | 13 | PASS | ran | ready | hold | clean |
| PHL013 | Fillman & Sons Floors & More | 10 | 455 | 13 | PASS | ran | hold | hold | clean |
| PHL014 | Glen Eagle Pediatric Dentistry | 10 | 456 | 13 | PASS | ran | ready | hold | clean |
| PHL015 | HaverCrown Dental | 10 | 393 | 13 | PASS | ran | ready | hold | clean |
| PHL016 | Jarman Sales & Service | 10 | 478 | 13 | PASS | ran | ready | hold | clean |
| PHL017 | Live Urgent Care | 10 | 465 | 13 | PASS | ran | hold | hold | clean |
| PHL018 | Malvern Vision Care | 10 | 434 | 13 | PASS | ran | hold | hold | clean |
| PHL019 | McMenamin & Margiotti | 10 | 465 | 13 | PASS | ran | ready | hold | clean |
| PHL020 | Pennsylvania Dental Group | 10 | 474 | 13 | PASS | ran | ready | hold | clean |
| PHL021 | Plastic Surgery Solutions | 10 | 423 | 13 | PASS | ran | hold | hold | clean |
| PHL022 | Sciacca Service Center | 10 | 457 | 13 | PASS | ran | hold | hold | clean |
| PHL023 | Train and Nourish | 10 | 417 | 13 | PASS | ran | ready | hold | clean |
| PHL024 | L A Verruni Landscaping | 10 | 446 | 13 | PASS | ran | ready | hold | clean |
| PHL025 | Wynnewood Eyecare | 10 | 423 | 13 | PASS | ran | hold | hold | clean |

## Held (11)

- **Barnes Financial Group**: held
- **BG Electric Service LLC**: held
- **BPM Fitness**: held
- **DreamMaker Bath & Kitchen**: held
- **Easy Auto Tag & Insurance**: held
- **Fillman & Sons Floors & More**: held
- **Live Urgent Care**: held
- **Malvern Vision Care**: held
- **Plastic Surgery Solutions**: held
- **Sciacca Service Center**: held
- **Wynnewood Eyecare**: held

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
