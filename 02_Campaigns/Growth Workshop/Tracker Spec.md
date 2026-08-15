---
tags: [campaign, growth-workshop, tracker]
campaign: "[[Growth Workshop]]"
created: 2026-08-15
---

# Tracker Spec — Growth Workshop lists

One-line summary: one schema for the Philly 200-list and the franchise send-ready sheet; contact rows live in Drive + gitignored private copies, never in this repo.

## Where the rows live

| Copy | What | In git? |
|---|---|---|
| Drive folder "Franchise Workshop Lists — 2026-08-14" | Wave 1 (50) + full 720 + how-to Doc | no |
| `12_Brain/private/contacts/` | local CSVs (same counts) | no (gitignored) |
| This repo | methods, counts, this schema | yes |

720-sheet: https://docs.google.com/spreadsheets/d/1sCb-PjUzewfyf8N5tbgcnHlVVzVCbO5eGX6Wlz-oemE/edit
Wave 1: https://docs.google.com/spreadsheets/d/1BEnCDb81vQMNNJkoy1Dk-kM4iOdtXhrnJJw05H4mgeQ/edit

## Columns

`Prospect ID | Business Name | Contact Name | Email | Franchise Brand | Category | City | State | Phone | Website | Registration Link | Role Type | Email Type | MX Status | Source | Source URL | Accessed | Wave | Send Batch | Outreach Status | Email Sent Date | Notes`

200-list rows keep the existing Philly IDs (`PHL-WORKSHOP-###`) and `utm_campaign=phl_owner_workshop_2026_08`.
Franchise rows use `FRAN-SEND-####` / `FRAN-WORKSHOP-###` and `utm_campaign=franchise_workshop_2026_08`.

## Status values

`Not sent` · `sent-t1` · `sent-t2` · `sent-t3` · `replied` · `registered` · `suppressed`

Any bounce, "no thanks," or unsubscribe → `suppressed` the same day.

## Registration link pattern (franchise)

`https://momentum-workshop-pilot.netlify.app/?utm_source=franchise_pilot&utm_medium=permissioned_outreach&utm_campaign=franchise_workshop_2026_08&utm_content=FRAN-WORKSHOP-####register`

One contact per company. Owner-named beats a location mailbox; both get typed honestly in `Role Type` / `Email Type`.

## MX

`node _os/automation/bin/mx-check.js <csv> --email-col Email` — DNS only. Only `mx_ok` rows are send-ready.
