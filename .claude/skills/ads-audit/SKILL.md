---
name: ads-audit
description: Adapter to AgriciDaniel/claude-ads for Google/Meta account audits. Use when reviewing an ads account Dillon already manages. Capability gate — no spend, no campaign mutations from this skill.
---

# Ads audit (upstream adapter)

One-line: Audit structure and waste on accounts we already run. Never change bids, budgets, or status from this skill.

## Upstream

Install locally when needed:

```bash
# reference only — clone or npx per operator machine
# https://github.com/AgriciDaniel/claude-ads
```

Upstream skills in that repo include `ads-audit` and related Google Ads helpers. Dillon didn't write them. Don't claim authorship. Don't vendor the whole repo into this vault.

## Capability gate (hard)

- **No spend.** This skill does not create campaigns, change budgets, enable ads, or pause live traffic.
- Human (Dillon or Mac) approves any mutation in the live ads UI.
- Output is a markdown audit: structure, query mapping, obvious waste, creative gaps. File it under the client folder or `02_Campaigns/`.
- Public GitHub: no customer PII, no unredacted account IDs in tracked files.

## When to use

- Weekly or monthly on Align / Need Momentum accounts Dillon already touches.
- Before an AI Marketing page claim: if we cannot show an audit artifact, we do not claim "AI-optimized ads."

## Pair with

- [AI Marketing Creative](../../../05_Offers/AI%20Marketing%20Creative.md)
- Vault [metrics-pull](../metrics-pull/SKILL.md) for numbers, not this skill.
