---
status: scaffold
mail_ready: hold
updated: 2026-08-14
source: "[[12_Brain/state/radar/build-queue.csv]]"
---

# phl-2026-w33 — scaffold only

Starter eight from the Radar rebuild queue. Home services plus dental. `targetCount` is 8 on purpose. Market roster wanted home services / medical / legal, not another restaurant week.

Harvest has **not** run. `briefs/` is empty. `mail_ready` stays `hold`. Don't deploy. Don't print QR.

## Why these eight

Reachable rebuilds already graded. Not current clients in `01_Clients/`. Dream Team, Electric Direct, WJA, Jarman (viewport fault on http), plus four dental offices at the top of the queue.

Restaurants, ice cream, bars, and the 503s (Go Vertical, Mt. Airy Pediatrics) stayed out.

## Expand to 25

After Mac says the vertical mix is right, pull more HVAC / electrician / landscaping / dental / legal from the same queue. Drop anyone whose harvest fails. Never fill the gap with invented facts.

## Next command (human-gated)

```bash
node _templates/site-factory/harvest.js --from "02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w33/targets.json"
```

Then `/site-batch` from the campaign runbook. Stop before mail.

## Gate

AI division outbound resumes only after Mac confirms SKUs and the 90-day pilots. See `02_Campaigns/Need Momentum AI Division/`.
