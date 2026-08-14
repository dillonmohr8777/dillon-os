# Outreach Engine

One command for Mac's pipeline: **Bot scrape → database → AI site builder → Zapier → QR → Direct Mail → Gate Keep for Sales Call**.

The live database is the 238-row sheet Dillon sent Jesse:

[Momentum 360 - 238 Call-Ready Businesses - 2026-08-13](https://docs.google.com/spreadsheets/d/1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo)

Those 238 homepages are already built and QA'd. This engine adds the missing activate + learn legs without waiting on Zapier, QRTiger, PostGrid, or a Netlify token.

```bash
node _os/outreach-engine/bin/run-engine.js --source jesse-238
```

Output lands in `02_Campaigns/AI Site Builder Outreach Engine/batches/<id>/`:

| File | Role |
|---|---|
| `index.html` | One review hub (the link Mac gets) |
| `gate/<slug>/` | Sales-call gatekeep landing (QR target) |
| `qr/<slug>.svg` | Local QR, no Zapier required |
| `mail/<slug>.html` | Print-ready 6×4 postcard proof |
| `zapier.csv` | Mac's column set: Platform, Campaign, Ad Set, Name, Number, Email, Business, Website |
| `qrtiger.csv` | URL column for the QRTiger zap |
| `postgrid.csv` | Address + `mail_ready` for the mail zap |
| `prospects.csv` | Approval surface. `mail_ready` is always `hold` |
| `results.md` | Stage 8 ledger |

`mail_ready` never becomes `ready` from this runner. That takes:

```bash
node _os/outreach-engine/bin/approve-batch.js <batch-dir> --approver "Mac Frederick" --prospects J238-001
```

HUD serves the pack at `http://127.0.0.1:4242/outreach/jesse-238/` and accepts gatekeep bookings at `POST /api/outreach/book` (logs a call request, does not email anyone).

Public-safety: phones, emails, and street addresses stay in the Google Sheet. The committed fixture is names + verticals + live noindex URLs only.
