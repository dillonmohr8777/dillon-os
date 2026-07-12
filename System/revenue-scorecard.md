---
tags: [system, revenue, scorecard]
last_updated: 2026-07-12
status: skeleton
---

# Revenue Scorecard (Skeleton — Verified Only)

> Do not invent numbers. Unknown = marked unknown. Verified from `01_Clients/Client Index.md` as of 2026-07-12. Invoicing source of truth is Melissa Silber / Momentum 360.

## MRR — Momentum 360 (Verified Rates)

| Client | Rate | Source | Status |
|--------|------|--------|--------|
| Bar Crawl USA | $950/mo | Client Index.md | verified |
| Shadow HVAC | $250/mo | Client Index.md | verified |
| Link Eze (LinkEZE) | $300/mo | Client Index.md | verified |
| Omega Landscaping | $200/mo | Client Index.md | verified |
| Jeff Hozias / Rand Realty | $200/mo | Client Index.md | verified |
| Kimberly James Bridal (KJB) | $300/mo | Client Index.md | verified |
| Fresh Blends / Replenish | $500/mo | Client Index.md | verified |
| **Subtotal verified M360 MRR** | **$2700/mo** | sum of above | partial — excludes unknown-rate clients |

## Other M360 Clients (Rate Unknown — needs verification)

| Client | Rate | Notes |
|--------|------|-------|
| Hardwood Artisan | unknown | GBP + reports; legacy note said $150/mo but not in index |
| NKCDC | unknown | ICP research, keyword strategy |
| Onsite Concrete & Landscape | unknown | WP/Divi repair |
| Blissful Events | $500 project | one-time, not MRR |
| Bridge of Hope OTC | unknown | SEO blog content |
| Bok Law | unknown | weekly social — since Dec 2025+ |
| Bluegrass Janitorial | unknown | SEO blogs, MailChimp |

## Direct / 1099 / Other (Rate Unknown)

From Client Index — Direct section: Next Gen Solutions, Florecita, Commercial Cleaners Alliance, Sally Compton, PNW Pro Clean, PureClean Carpets, Ram Air, Bluegrass Janitorial, Bridge of Hope OTC, Dryer Vent John, Biohazard Remediation, Guaranteed Cleaning, Bend Plastic Surgery, Bend Oral Surgery, Coach B, Vanessa, AWCI, MMC Land Management.

- Rates: unknown — not listed in Client Index for Direct tier
- Action: fill after invoicing verification

## Software Development

- Bridge Software Development — Tori's cannabis-industry network; product discovery, UX/UI, Next.js, Supabase — rate unknown

## Full-Time (Excluded from MRR)

- Align HCM — full-time employer, not counted

## Totals

- Verified MRR (partial): $2700/mo from 7 clients with explicit rates
- Unknown MRR: requires invoicing audit
- Project income: Blissful Events $500 project (verified) + others unknown
- Goal tracker: OS Config says 12 active clients / 100 target — reconcile against Client Index which shows 14 M360 rows + Direct list

## Pipeline

- Source: `00_Inbox/Top 15 Opportunities 2026-07-02.md` — not yet parsed into scorecard
- Action: add pipeline stage frontmatter when opportunity notes exist

## Next Steps

1. Have Melissa / Sean confirm invoicing for each M360 client in table
2. Verify Hardwood Artisan current rate and billing status (card update outstanding per claude-memory-sync 2026-04-15)
3. Add Direct tier rates after proposal/invoice evidence
4. Keep this file as skeleton — future automation may populate from verified sources only, never invent

## Frontmatter Guidance (for future client notes, not bulk rewrite)

When updating a client note under `01_Clients/`, consider adding if missing:
```yaml
---
tags: [client]
status: active | onboarding | at_risk | paused | past
rate: $XXX/mo or $XXX project or unknown
start_date: YYYY-MM-DD
industry: ...
tier: m360 | direct | 1099 | software_dev
last_touched: YYYY-MM-DD
next_action: ...
---
```
Do not bulk rewrite hundreds of notes now — add as you touch clients.

## Verification

- Created 2026-07-12
- No invented numbers — only rates present in Client Index.md are listed as verified
- Unknown clearly marked
