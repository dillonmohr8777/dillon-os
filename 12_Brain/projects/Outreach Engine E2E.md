---
tags: [project]
status: active
updated: 2026-08-14
source: "[[12_Brain/decisions/2026-08-14 - Jesse 238 is the outreach database]]"
---

# Outreach Engine E2E

**Summary:** End-to-end pack for Mac's AI Site Builder Outreach chain, wired to the 238-row sheet Dillon sent Jesse.

Engine: `_os/outreach-engine/`. Command: `node _os/outreach-engine/bin/run-engine.js --source jesse-238`. HUD: `/outreach/jesse-238/`.

## Goal

Close scrape → database → site → QR → mail → gatekeep so Jesse can call from the sheet and Mac can approve a mail drop from one hub.

## Next actions

- [ ] Mac/Melissa review the hub and pick a mail vendor
- [ ] Wire `qrtiger.csv` / `postgrid.csv` into the existing Zapier zaps
- [ ] Log Jesse's call results into the Stage 8 ledger
