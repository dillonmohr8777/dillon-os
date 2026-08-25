# IMMOHRTAL Unit Economics and Capacity Model

**Workflow:** `IMMOHRTAL-DAY1-20260825`
**Step:** `FOUNDATION`
**As-of:** 2026-08-25
**Status:** Internal planning model; not actual financial performance
**Source:** `DAY-1-PRICE-BOOK.md`, `OFFER-CARDS.json`, and `PUBLIC-MONTHLY-SERVICE-MENU.json`

## Zero-baseline boundary

- Verified actual revenue: **$0.00 recorded; current completeness unverified**.
- Verified actual cash: **not established**. The zero ledger is a control baseline, not a bank-balance claim.
- Verified actual expenses, receivables, payables, deposits, tax, payroll, and profit: **not established**.
- Every price, hour, cost, margin, invoice, and capacity figure below is a **planning assumption** unless and until tied to a signed contract, invoice, payment receipt, time record, bill, and accounting review.
- Public pricing is approved only for the seven exact monthly fees in `PUBLIC-MONTHLY-SERVICE-MENU.json`. Every custom diagnostic, sprint, website, visibility-program, and agent price below remains an internal planning figure and is not evidence of historical customer pricing.

## Model assumptions

1. Delivery labor is valued at **$70 per hour**, exactly as stated in the price book.
2. Planning delivery cost includes assumed delivery labor and stated direct expenses. It excludes sales time, general overhead, taxes, and owner distributions.
3. Gross profit is `price - planning delivery cost`; gross margin is `gross profit / price`.
4. Range endpoints pair low price with low cost and high price with high cost. A low price with high-end scope is not an allowed plan.
5. The visibility foundation fee and managed-support ranges lack separate cost/hour assumptions. Their standalone margin is therefore **not computable**, not zero.
6. The capacity math below assumes **25 delivery hours per week** after sales/admin and contingency. That is a planning limit, not a time record or a promise. Dillon must change it when real availability is measured.

## Approved public monthly fee reconciliation

These fees reconcile the published menu, not delivery cost or margin. Delivery units, labor assumptions, direct expenses, and capacity limits for these new monthly products remain open controller items and may not be invented from the fee alone.

| Public service | Monthly fee | A la carte reference | Bundle savings | Margin status |
|---|---:|---:|---:|---|
| Technical SEO | $700 | $700 | Not applicable | Not computable until scope and cost are defined. |
| AEO | $700 | $700 | Not applicable | Not computable until scope and cost are defined. |
| GEO | $700 | $700 | Not applicable | Not computable until scope and cost are defined. |
| SEO + AEO + GEO | $1,500 | $2,100 | $600 per month | Not computable until scope and cost are defined. |
| Google Ads management | $400 | $400 | Not applicable | Not computable until scope and cost are defined. |
| Meta Ads management | $400 | $400 | Not applicable | Not computable until scope and cost are defined. |
| Google + Meta Ads management | $650 | $800 | $150 per month | Not computable until scope and cost are defined. |

## Offer economics reconciliation

| Offer | Planning price | Planning delivery hours | Direct expense | Planning delivery cost | Planning gross profit | Planning gross margin | Price-book reconciliation |
|---|---:|---:|---:|---:|---:|---:|---|
| Live Website Decision Diagnostic | $950 | 7 | Up to $50 | $540 | $410 | 43.2% | Exact fixed launch price and cost. |
| Website Optimization Sprint — starting scope | $4,500 | 32 | $150 | $2,390 | $2,110 | 46.9% | Exact low endpoint. |
| Website Optimization Sprint — high scope | $7,500 | 50 | $300 | $3,800 | $3,700 | 49.3% | Exact high endpoint. |
| Distinctive Website System — starting scope | $18,000 | 120 | $800 | $9,200 | $8,800 | 48.9% | Exact low endpoint. |
| Distinctive Website System — high scope | $32,000 | 210 | $1,500 | $16,200 | $15,800 | 49.4% | Exact high endpoint. |
| Visibility foundation fee | $2,000 | Not separately assigned | Not separately assigned | Not computable | Not computable | Not computable | Fee reconciles; cost allocation is an open controller item. |
| Search and Answer Visibility — monthly starting tier | $3,500/month | 25/month | $200/month | $1,950/month | $1,550/month | 44.3% | Exact low monthly endpoint. |
| Search and Answer Visibility — monthly high tier | $6,500/month | 45/month | $300/month | $3,450/month | $3,050/month | 46.9% | Exact high monthly endpoint. |
| Bounded Business Agent Implementation — starting scope | $7,500 | 60 | $300 | $4,500 | $3,000 | 40.0% | Exact low endpoint. |
| Bounded Business Agent Implementation — high scope | $15,000 | 115 | $600 | $8,650 | $6,350 | 42.3% | Exact high endpoint. |
| Optional managed agent support | $1,500–$3,000/month | Not assigned | Not assigned | Not computable | Not computable | Not computable | Price range reconciles; do not sell until units, support window, and cost are scoped. |

The small rounding differences in the source price book (for example, the sprint low-end shown as approximately 47%) are reproduced here from the exact arithmetic and remain consistent with its stated approximate range.

## Payment and cash-collection map

This table is a planning invoice schedule. It is not booked revenue or cash.

| Offer | Contract planning value | Booking invoice | Later invoice(s) | Revenue-recognition warning |
|---|---:|---:|---|---|
| Diagnostic | $950 | $950 (100%) | None | Booking cash may remain deferred until the CPA-approved performance/acceptance rule is met. |
| Optimization — starting | $4,500 | $2,700 (60%) | $1,800 before release | Invoicing and cash do not by themselves prove revenue earned. |
| Optimization — high | $7,500 | $4,500 (60%) | $3,000 before release | Match scope and cost to the high endpoint. |
| Website system — starting | $18,000 | $7,200 (40%) | $5,400 at direction; $3,600 at staging; $1,800 before release | Track each milestone and any deferred balance separately. |
| Website system — high | $32,000 | $12,800 (40%) | $9,600 at direction; $6,400 at staging; $3,200 before release | Contract value is not cash or revenue. |
| Visibility — starting | $23,000 initial six-month contract planning value | $5,500 at booking ($2,000 foundation + first $3,500 month) | Five monthly invoices of $3,500 in advance | Service-period recognition and foundation-cost allocation require CPA policy. |
| Visibility — high | $41,000 initial six-month contract planning value | $8,500 at booking ($2,000 foundation + first $6,500 month) | Five monthly invoices of $6,500 in advance | Do not claim the unassigned foundation margin. |
| Agent implementation — starting | $7,500 | $3,750 (50%) | $2,250 at safe-mode demo; $1,500 at acceptance | Customer deposits remain a liability until recognition criteria are met. |
| Agent implementation — high | $15,000 | $7,500 (50%) | $4,500 at safe-mode demo; $3,000 at acceptance | Managed support is a separate contract, not assumed. |

## Delivery-capacity math

### Planning load per active unit

| Work unit | Source delivery window | Planning hours | Average weekly delivery load | Hard launch ceiling from price book |
|---|---:|---:|---:|---:|
| One diagnostic | 5 business days | 7 | 7.0 in its delivery week | Up to 3 starts/week |
| One starting optimization sprint | 10 business days | 32 | 16.0 for 2 weeks | Up to 2 active |
| One high optimization sprint | 15 business days | 50 | 16.7 for 3 weeks | Up to 2 active |
| One starting website system | 8 weeks | 120 | 15.0 | 1 active |
| One high website system | 12 weeks | 210 | 17.5 | 1 active |
| One starting visibility program | Monthly | 25/month | 5.8 using 4.33 weeks/month | Up to 3 active |
| One high visibility program | Monthly | 45/month | 10.4 using 4.33 weeks/month | Up to 3 active |
| One starting agent implementation | 4 weeks | 60 | 15.0 | 1 active |
| One high agent implementation | 6 weeks | 115 | 19.2 | 1 active |

The hard launch ceilings are per-offer safeguards, not permission to fill every lane simultaneously. At the planning limit of 25 delivery hours/week, the aggregate scheduled load must remain at or below 25 before a start date is promised.

### Safe admission examples

| Example active mix | Average weekly load | Planning result | Reason |
|---|---:|---|---|
| 1 starting website system + 1 starting visibility program | 20.8 | ADMISSIBLE with 4.2 hours buffer | Below the 25-hour aggregate limit and within offer ceilings. |
| 1 starting website system + 1 diagnostic that week | 22.0 | ADMISSIBLE with 3.0 hours buffer | No additional sprint/implementation should be started that week. |
| 1 starting optimization sprint + 1 starting visibility program | 21.8 | ADMISSIBLE with 3.2 hours buffer | Leaves little room for unscheduled client work. |
| 1 starting agent implementation + 1 starting visibility program | 20.8 | ADMISSIBLE with 4.2 hours buffer | Do not add another major implementation lane. |
| 2 starting optimization sprints | 32.0 | DO NOT SCHEDULE under current planning limit | Allowed by the per-offer ceiling but exceeds aggregate founder-led delivery capacity. |
| 3 diagnostics in one week | 21.0 | ADMISSIBLE only if no major-lane deadline consumes more than 4 hours | Maximum-start ceiling is not a weekly default. |
| 1 high website system + 1 high visibility program | 27.9 | DO NOT SCHEDULE under current planning limit | Exceeds aggregate delivery capacity. |

### Capacity admission rule

Before any proposal promises a date:

1. Calculate weekly hours for every signed and probable project through its acceptance/release date.
2. Reserve the offer's average weekly load plus known deadline spikes.
3. Keep total planned delivery at or below 25 hours/week until four weeks of real time data justify a change.
4. Preserve a minimum five-hour general contingency outside that 25-hour delivery limit; urgent work does not erase signed work.
5. Do not use an AI agent as evidence that human review, client input, QA, or professional expertise costs disappeared.
6. If capacity fails, offer a dated queue slot, narrow scope, or add a qualified subcontractor only after foundation controls are complete.

## Contribution targets and pricing guardrails

- Minimum planned gross margin at sale: **40%**, because the current ladder bottoms at 40.0%. This is a planning floor, not guaranteed profit.
- Do not discount price while retaining high-end scope. Reduce routes, units, integrations, revisions, support window, or timeline load in a signed scope instead.
- Direct project expenses above the modeled allowance require a price/scope change or an explicitly approved pass-through.
- Sales/admin time, insurance, legal/accounting, subscriptions, processor fees, taxes, and bad debt are below gross margin and still need coverage.
- The visibility foundation fee and managed support cannot pass a margin review until their hours/direct costs are assigned.
- No founder compensation, owner draw, or tax reserve is inferred from gross profit.

## First 30-day controller measurements

Record actuals only from evidence:

| Measure | Day 1 baseline | First review |
|---|---:|---|
| Signed contract value | $0 verified / completeness unverified | Weekly |
| Invoices issued | $0 verified / completeness unverified | Weekly |
| Cash collected | $0 verified / completeness unverified | Weekly |
| Revenue recognized | $0 recorded / completeness unverified | Monthly close |
| Direct delivery cost | $0 recorded / completeness unverified | Weekly by project |
| Delivery hours | 0 recorded / completeness unverified | Daily time record; weekly review |
| Accounts receivable | $0 recorded / completeness unverified | Weekly aging |
| Customer deposits/deferred revenue | $0 recorded / completeness unverified | Weekly and close |
| Gross margin | Not computable from actuals | Monthly close |
| Capacity committed | 0 hours recorded / completeness unverified | Before every proposal/start date |

After four complete weeks, replace planning throughput with measured delivery time by offer and scope driver. Never overwrite the launch assumptions; version the model so estimate error is visible.
