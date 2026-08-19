---
note_type: capture
status: compiled
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T01:50:00Z"
source_type: operator briefing
source_url:
source_author: Dillon Mohr
source_published:
related_entities: []
tags:
  - brain
  - capture
  - cmo-lane
  - cost
  - sequencing
---

# CMO lane economics and sequencing

## Why this matters

The quality-profile cost estimate (~$30/client/month) reframes sequencing
before any connector is turned on. Dillon asked to file this as a goal,
configure it for Claude, and prepare a Netlify push — not to connect APIs yet.

## Source material

Operator briefing on a CMO-style agent runtime that is not present in this
repository. Claims below are source-linked estimates from that briefing, not
live ledger receipts.

### Economics

- Default `quality` profile: about $30 per client per month; $1,200/month at 40
  clients.
- `balanced` profile: about $13.68 per client per month. Judgement, strategy,
  and reconciliation classes stay on Opus (protected from downshift).
- Instruction: switch the default to `balanced` before connecting anything.
- GEO scan is the largest `quality` cost (~$14 of $30) and is currently
  simulated, so premium rates would be paid for a number that cannot be
  reported. Real SERP data was estimated at $6/client/month.

### File today (operator forms, not engineering)

1. Google Ads developer token application (review queue measured in weeks).
2. Google Business Profile quota request (ships with zero default quota).

### Highest-information engineering step

Set `ANTHROPIC_API_KEY`, point `cmo seed` at one real client site, and watch:

- Is the output send-worthy, or still mock filler?
- Does prompt caching engage (`cache_read_input_tokens > 0`)?
- Do structured outputs validate against the real API?
- Are token estimates right?

### Then, in this order

1. GSC + Places (OAuth/key only; no review queue). Places makes local real
   without waiting on GBP.
2. DataForSEO for GEO (converts simulated measurement to reportable).
3. WordPress publisher (Application Passwords; closes approval→publish→receipt).
4. Auth on the server if anyone but Dillon ever opens it (`by` is self-asserted).
5. Postgres + a scheduler only past ~3 clients or when unattended.

### What to cut

Sixteen daily agents per client is most of the $30 and most of the approval
queue. Keep four: `paid-search-analyst`, `local-seo`,
`attribution-reconciler`, `seo-technical`. Weakest relative to how they
sound: `report-composer`, `competitor-watch`.

### Honest scope

Content lanes (articles, X, LinkedIn) can be bought. Paid media, local/GBP,
and attribution reconciliation are the defensibility. Narrower than a
sixteen-agent CMO product.

## Claims to verify

- [ ] `quality` ≈ $30/client/month and `balanced` ≈ $13.68 are live ledger
  facts, not briefing estimates.
- [ ] Prompt caching engages on a real `cmo seed`.
- [ ] GEO remains simulated until DataForSEO (or equivalent) is connected.
- [ ] The `cmo seed` runtime exists on a machine Dillon can run; it is not in
  this Git tree.

## Compile targets

- Decision: [[12_Brain/04_Decisions/2026-08-19 - Default CMO profile is balanced]]
- Project: [[12_Brain/05_Projects/2026-08-19 - CMO paid local attribution lane]]
- Concept: [[12_Brain/03_Concepts/CMO Lane Cost Discipline]]
