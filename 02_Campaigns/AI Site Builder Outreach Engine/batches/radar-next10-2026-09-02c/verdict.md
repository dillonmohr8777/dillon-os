---
note_type: verdict
batch: radar-next10-2026-09-02c
status: approved
verdict_by: Fable 5.1 lead seat
created: 2026-09-02
source_refs:
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/qa-summary]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/sheet-crosscheck-2026-09-02]]"
---

# Verdict: radar-next10-2026-09-02c (bespoke cut)

**Summary:** 10 of 10 approved. Bespoke single-file builds, Sonnet-written copy, animated SVG art, no photos, 29-35 KB each. QA round 2 clean at 390 and 1440 px after one kit fix (mobile split grid).

| Slug | Verdict | Reason |
|---|---|---|
| f-m-berkheimer-inc | approve | passes; parked domain so contact fields are placeholders, best pitch in the batch |
| the-juice-merchant | approve | passes; parked domain, trade-generic copy, contact placeholders |
| golden-sea | approve | passes; fully sourced copy, zero placeholders |
| specks-broasted-chicken | approve | passes; sourced copy, email placeholder only |
| weathers-motors-and-auto-sales | approve | passes; sourced copy, timeline strip, email omitted |
| nolts-auto-parts | approve | passes; B2B positioning verified from source, hours placeholder |
| union-chill-mat-company | approve | passes; industrial art direction, hours and email placeholders |
| sangillo-tire-center | approve | passes; brand purple sampled from their CSS, full contact |
| smile-culture-dental | approve | passes; no clinical guarantees, email placeholder |
| advance-exterior-solutions | approve | passes; bot-walled source, trade-generic copy, contact placeholders |

Rejected: none. Retry rounds: 0 (QA fixed the shared kit in its own round).

Conditions carried into the deploy line:
- Secondary text pairs (eyebrows, pills, accent labels) were flagged by a static scan at 2.9 to 4.4 contrast; h1 and body pass. Spot-check one site live and darken accents if needed before mailing.
- Webfont rendering unverified in the sandbox.
- Three sites carry contact placeholders; confirm phone and address before any mailer.
