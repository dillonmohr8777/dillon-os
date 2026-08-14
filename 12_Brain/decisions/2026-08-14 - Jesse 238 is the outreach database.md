---
tags: [decision]
decided: 2026-08-14
status: active
supersedes:
source: "[[02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log]]"
updated: 2026-08-14
---

# 2026-08-14 — Jesse 238 is the outreach database

**Decision:** The Google Sheet *Momentum 360 - 238 Call-Ready Businesses - 2026-08-13* is Stage 1 of Mac's AI Site Builder Outreach pipeline. The outreach engine reads a public-safe snapshot of it, then generates QR, mail proofs, Zapier CSVs, and the sales-call gate. Phones, emails, and street addresses stay in the sheet.

**Why:** Mac asked to automate scrape → database → site builder → QR → mail → gatekeep. The 238 sheet is the database Jesse already has. Those homepages are already built. The missing legs were activate and learn, not another scrape.

**Implications:**

- New weekly batches still use radar + site-factory. They merge into this sheet by domain, they do not replace it.
- `mail_ready` stays hold until Mac or Melissa approve named prospect ids.
- This public repo never stores the contact directory.
