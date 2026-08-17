---
note_type: research
status: candidate
created: 2026-08-04
updated: 2026-08-04
domain: prospecting
market: Pennsylvania
campaign: "[[02_Campaigns/AI Site Builder Outreach Engine/AI Site Builder Outreach Engine]]"
summary: "Bounded Pennsylvania candidate universe for the AI site-builder pipeline"
verification_status: bounded_source_candidate
sheet_url: "https://docs.google.com/spreadsheets/d/1Zc_THSYHKDbv_eDcbUpUnW7OtED-hRTjwqcpqHvyT10/edit"
source_refs:
  - "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-07-27-philadelphia-workshop-prospects\\prospects.csv"
  - "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-07-27-philadelphia-workshop-prospects\\source-manifest.json"
  - "https://phdcphila.org/wp-content/uploads/RFPs/Lawncrest/Attachment-B-Additional-Information.pdf"
  - "https://www.psaphcc.com/members/"
  - "https://www.dc21.org/contractors/"
tags:
  - research
  - prospecting
  - pennsylvania
  - website-factory
  - ai-site-builder
---

# Pennsylvania website-gap candidate universe

## Result

The existing Momentum 360 control sheet now has a `PA No Website Research` tab
with 213 Pennsylvania records. These are every Pennsylvania row in the
bounded 250-record Philadelphia-area workshop package whose source `website`
field was blank when checked on 2026-07-27.

This is not an exhaustive census of every Pennsylvania business, and a blank
directory field is not proof that a business has no website. The sheet labels
each row `blank_in_public_source` and keeps the pipeline stage at
`research_only`. Rows with a non-generic public email domain are marked
`needs_domain_check` because the domain may indicate a website or another
first-party web presence.

## Build gate

Before a homepage is built, verify the exact Google Maps or Places website
field and run a bounded first-party search for the business. Suppress current
Momentum clients, active pipeline deals, prior mailings, opt-outs, and
ambiguous identities. Only verified candidates should enter a coherent batch
of 25 private, noindex site previews.

No homepage was built, deployed, published, mailed, or sent from this intake.

## Built batch reconciliation

The previously built `phl-2026-w31` factory batch was also reconciled into the
existing control tab as 25 `PHL-W31-*` records. The batch contains 20 records
marked `qa_ready` and 5 records held for viewport-height failures. All 25 are
local noindex review artifacts. Deployment, QR generation, mail activation,
outreach, and spend remain held; the batch is pending independent verification
and human taste review.

Batch evidence:

- `C:\Users\dillo\Documents\Codex\2026-07-29\monitor-this-session-on-cursor-i\work\pr226-site-factory\02_Campaigns\AI Site Builder Outreach Engine\batches\phl-2026-w31\FINAL-VERIFICATION.json`
- `C:\Users\dillo\Documents\Codex\2026-07-29\monitor-this-session-on-cursor-i\work\pr226-site-factory\02_Campaigns\AI Site Builder Outreach Engine\batches\phl-2026-w31\manifest.csv`
