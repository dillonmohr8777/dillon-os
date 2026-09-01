---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
decision_date: 2026-08-19
review_on: 2026-09-19
verification_status: partial
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Operator asked to decide lineage PRs and boards]]"
  - "[[System/approval-queue]]"
  - "automation/prospect-radar-next20/generated-stock-categories.js"
tags:
  - brain
  - decision
  - radar
  - generated-stock
---

# Generated-stock boards

**Decision:** Yes for the two verticals we can name. No guessing for the two
we cannot. One unknown vertical still must not sink a batch.

| Slug / signal | Verdict | Board key |
|---|---|---|
| `digital-marketing-service-pro-west-chester-pa` / advertising agency | **yes** | `category-advertising-agency` |
| `smart-signs` / signage | **yes** | `category-signage` |
| `lasting-impressions` | **hold** | none until the vertical is named from a live source |
| `gft` | **hold** | none until the vertical is named from a live source |

**Why:** Imagery that misrepresents a real business is worse than no imagery.
Radar already has `digitalmarketingservpro.com` as `advertising-agency`.
`smart-signs` is signage. `lasting-impressions` and `gft` have no vertical in
the tracked registry, so mapping them would be a guess.

**Implications:**

- Assignment keys land in Git. PNG boards stay in the gitignored
  `generated-stock-library` and must be generated locally before those two
  yes-slugs carry imagery.
- `lasting-impressions` and `gft` keep building without generated stock until
  a human names the vertical.
- The refuse-don't-guess rule stays. The unknown-vertical test now uses a
  category that is still unapproved, not advertising agency.
