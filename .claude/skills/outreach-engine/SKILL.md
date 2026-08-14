---
name: outreach-engine
description: Run Mac's AI Site Builder Outreach pipeline end to end from the 238 Jesse call sheet or a new weekly batch. Generates QR codes, mail proofs, Zapier CSVs, and the sales-call gate. Never sends mail.
---

# Outreach Engine

Mac's chain: scrape → database → AI site builder → Zapier → QR → direct mail → gatekeep the sales call.

The 238-row Google Sheet Dillon sent Jesse is the live database. Those homepages are already built. This skill packs QR, mail proofs, sheet CSVs, and the call gate around them, then holds mail until a human approves the exact list.

## Commands

```bash
# Full 238 pack (sites already live)
node _os/outreach-engine/bin/run-engine.js --source jesse-238

# Preview a slice
node _os/outreach-engine/bin/run-engine.js --source jesse-238 --count 12 --batch jesse-238-preview

# New fictional factory batch (tests / demo only)
node _os/outreach-engine/bin/run-engine.js --source demo --allow-partial --skip-qa

# Explicit human approval — the only way mail_ready flips
node _os/outreach-engine/bin/approve-batch.js \
  "02_Campaigns/AI Site Builder Outreach Engine/batches/jesse-238" \
  --approver "Mac Frederick" --prospects J238-001,J238-002

# Stage 8 learn
node _os/outreach-engine/bin/record-results.js \
  "02_Campaigns/AI Site Builder Outreach Engine/batches/jesse-238" \
  --prospect J238-001 --event scan --vertical "HVAC"
```

HUD: `node _os/server.js` then http://127.0.0.1:4242/outreach/jesse-238/

## Hard rules

- `mail_ready` stays `hold` until `approve-batch.js` with a human name.
- Phones, emails, and street addresses stay in the Google Sheet. This public repo only stores names, verticals, and live noindex URLs.
- Do not send Slack, mail, or CRM writes from this skill unless Dillon explicitly says to send.
