# Align HCM — Blog Optimization Audit (all 63 published posts)
**Date:** 2026-07-09 · Live pull from HubSpot. Signals: internal links, external links, schema, FAQ, question headings, word count.

## First, the date thing you flagged — you were right
Every post's `updated` timestamp is bunched between **2026-06-19 and 2026-07-09** — i.e., they were **bulk-bumped** (a migration/republish), not really edited. So "last touched" dates are meaningless for finding stale content. I switched to scoring by **actual on-page optimization gaps** instead, which is what you actually care about.

## The gaps across all 63
| Gap | Posts affected |
|---|---|
| **No schema** (FAQPage/Article) | **52 / 63** |
| **No FAQ block** | 45 |
| **No question headings** | 39 |
| **No external links** | **25** |
| **No internal links** | **17** |
| Thin (<900 words) | 9 |

Only the ~9 posts I optimized earlier (schema + already had links) are in good shape. The rest need work.

## Tier 1 — highest priority (15 posts): zero internal links, zero external links, no schema, no FAQ, no question headings
These are fully un-optimized. Most are long/valuable (1,000–2,700 words) — good content, invisible structure.
- The Strategic Buyer's Guide to **Paylocity** (2,741w)
- Most HCM Platforms Add AI Features. **Dayforce** Built… (2,295w)
- The **UKG Ecosystem** Advantage: Open APIs & Partners (2,101w)
- When Speed Meets Strategy: **UKG Rapid Hire** (2,027w)
- Beyond Timekeeping: Three Dimensions of Manufacturing… (1,923w)
- 5 Critical Mistakes to Avoid During HCM Implementation (1,933w)
- UKG's Approach to AI: Human-Centered Automation (1,791w)
- Beyond Hiring: The Case for Internal Talent Mobility (1,782w)
- Beyond the Basics: Advanced HCM Training Strategies (1,386w)
- Why Your **Workday** Reporting Strategy Is Backwards (1,327w)
- The Hidden ROI in **Paylocity's** Time & Attendance (1,300w)
- The Process Alignment Imperative (1,330w)
- The Retention Equation: Retail Turnover Costs (1,338w)
- Quarterly System Health Checks (1,180w)
- The Ultimate Year-End Payroll Checklist (998w)

**Fix each:** add 3–5 internal links (to the platform guides + pillar + Public Sector page), 1–2 authoritative external links, a direct-answer opener, 2–3 question headings + FAQ block, then FAQ/Article schema.

## Tier 2 — partial (need some work, ~30 posts)
Have a few links but still missing schema and usually FAQ/question headings. Notable: the long **Buyer's Guide to UKG (2,756w)** variant (only 1 external link, no schema), "Why DIY HCM Implementation Costs More," the HiBob and integration series. These need schema + interlinking mainly.

## Done / healthy (~9)
The posts optimized earlier (ADP/Workday/Dayforce/UKG short guides, Summer PTO, Dayforce Optimization, Workday-UKG Integration, HCM AI, High-Performance Culture) — schema in place, links present.

## Recommended plan
1. **Internal-link sweep first** (cheapest, biggest cross-site SEO lift): wire the 17 orphan posts + Tier-1 into the cluster — every post links to its platform guide, the "How to Choose an HCM Platform" pillar, and 1–2 siblings. This alone lifts topical authority.
2. **Batch schema** onto all Tier-1/Tier-2 posts that have (or will get) FAQ blocks — same tool that did the first 9.
3. **Add FAQ + question headings + direct answers** to Tier 1 (also unlocks schema for them).
4. **External links** — add 1–2 authoritative citations (gov/standards/vendor docs) to the 25 that have none.

All executable through the token agent: draft the changes → dry-run → you approve → push.
