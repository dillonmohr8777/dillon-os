# Align HCM — AEO/GEO Content Audit
**Date:** 2026-07-09 · **Scope:** 12 most recent published blog posts (live signals pulled from HubSpot)

Measured against the AEO/GEO standard in `tools/align-web-system/…` and the GEO operating
system: rank higher by being the *extractable, directly-answering* source AI engines and
featured snippets pull from — "stronger SEO plus extractability."

---

## What's already working
- **Cadence is strong** — 18 posts in 2026, publishing several times a week.
- **Question-shaped headings on newer posts** — Dayforce Optimization (13), Workday/UKG Integration (12), HCM AI (11) hit query-matching well.
- **FAQ content exists on 8 of 12** posts.
- **No em dashes; meta lengths mostly in range.** Clean, on-voice.

## The core problem (why you're not ranking/getting cited higher)
You have the *content* but not the *machine-readable structure* AI engines and Google reward. Two gaps repeat across nearly every post.

---

## Priority fixes (ranked by impact)

### P1 — Add FAQPage + BlogPosting schema (JSON-LD). BIGGEST WIN.
**Finding:** 8 of 12 posts have FAQ content, but only **1 of 12 has any structured data.** No FAQPage schema anywhere.
**Why it matters:** FAQ content with no FAQPage schema is invisible to rich results and far harder for AI answer engines to extract as clean Q&A. This is the single highest-leverage fix.
**Fix:** Inject FAQPage JSON-LD (built from the existing FAQ blocks) + BlogPosting schema on every post. Retro-fit all 8 posts that already have FAQs; make it a template default going forward.

### P2 — Buyer's Guides need tables + scannable lists.
**Finding:** ADP / Workday / UKG / Dayforce guides have **24–25 H3s but ZERO tables and ZERO lists.** A "buyer's guide" with no comparison table is a wall of subheads.
**Why it matters:** Comparison tables and bulleted criteria are exactly what AI engines lift into answers ("Align HCM vs…", "best HCM for public sector"). Tables are extraction gold.
**Fix:** Add a criteria comparison table + scannable pros/cons/decision lists to each of the 4 guides.

### P3 — Direct-answer-first + query headings on the "deep" posts.
**Finding:** Earning HCM ROI (1,732w), High-Performance Culture (2,008w), Post-Implementation Review (1,619w), and The Workforce Visibility Gap have **0 question headings and no FAQ** — they read as essays, not answer sources.
**Fix:** Open each with a 40–60 word direct answer (TL;DR), convert section headers to the real questions people ask, and add an FAQ block.

### P4 — Expand the Buyer's Guides (they're thin).
**Finding:** Guides run ~886–967 words vs. your deep posts at 1,600–2,000. For competitive buyer-intent terms, ~900 words is thin.
**Fix:** Grow each to ~1,400–1,800w with the tables (P2), a "who it's best for" section, and a public-sector angle (link to the new Public Sector page).

### P5 — Trim two meta descriptions + build a pillar/cluster.
**Finding:** ADP (176c) and Workday (169c) metas will truncate in SERP (target ≤160).
**Fix:** Trim both. Then create a **pillar page** — "How to Choose an HCM Platform" — that links down to the 4 guides and back, forming a topic cluster (strong ranking signal + gives AI a clear authority hub).

---

## Per-post scorecard (recent 12)

| Post | Words | Q-heads | Lists | Tables | FAQ | Schema | Meta |
|---|---|---|---|---|---|---|---|
| Buyer's Guide: ADP | 967 | 5 | 0 | 0 | ✓ | ✗ | too long |
| Buyer's Guide: Workday | 955 | 5 | 0 | 0 | ✓ | ✗ | too long |
| Buyer's Guide: Dayforce | 899 | 5 | 0 | 0 | ✓ | ✗ | ok |
| Buyer's Guide: UKG | 886 | 5 | 0 | 0 | ✓ | ✗ | ok |
| Summer PTO Planning | 1186 | 7 | 1 | 1 | ✓ | ✗ | ok |
| Dayforce Optimization | 857 | 13 | 6 | 1 | ✓ | ✗ | ok |
| Workday/UKG Integration | 1038 | 12 | 4 | 2 | ✓ | ✗ | ok |
| Workforce Visibility Gap | 894 | 0 | 0 | 0 | ✗ | ✗ | ok |
| HCM AI ≠ Payroll Fix | 893 | 11 | 4 | 2 | ✓ | ✗ | ok |
| Earning HCM ROI | 1732 | 0 | 5 | 1 | ✗ | ✗ | ok |
| High-Performance Culture | 2008 | 0 | 0 | 0 | ✗ | ✓ | ok |
| Post-Implementation Review | 1619 | 0 | 0 | 0 | ✗ | ✗ | ok |

**Headline metric:** schema present on **1 of 12** (8%). Fixing P1 alone moves the whole library toward rich-result + AI-citation eligibility.

---

## Suggested execution order
1. Build a reusable FAQPage + BlogPosting JSON-LD template; retro-fit the 8 FAQ posts (P1).
2. Rework the 4 Buyer's Guides: tables, lists, +500–800 words, public-sector angle (P2, P4).
3. Retro-fit the 4 "essay" posts with direct answers + question headings + FAQ (P3).
4. Trim the 2 long metas; build the "How to Choose an HCM Platform" pillar (P5).

All of this is publishable through the token-route agent (draft → dry-run → you approve → schedule).
