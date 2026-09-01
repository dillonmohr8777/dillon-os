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
  - "[[12_Brain/01_Captures/2026-08-19 - CMO lane economics and sequencing]]"
tags:
  - brain
  - decision
  - cmo-lane
  - cost
  - agents
---

# Default CMO profile is balanced

**Decision:** Before any CMO-lane connector is turned on, the default model
profile is `balanced`, not `quality`. The earning roster is four agents:
`paid-search-analyst`, `local-seo`, `attribution-reconciler`, and
`seo-technical`. Content/social composition lanes are buy-not-build.

**Why:** The briefing's `quality` estimate is about $30 per client per month.
`balanced` is about $13.68, and judgement / strategy / reconciliation stay on
Opus because those classes are protected from downshift. Sixteen daily agents
are most of the cost and most of the approval queue. GEO on `quality` is the
single largest line and is still simulated, so it must not default on.

**Implications:**

- `CMO_PROFILE` (or the runtime equivalent) defaults to `balanced` in
  `11_Agents/cmo-lane.json` and `_os/cmo-lane/.env.example`.
- Claude follows `.claude/skills/cmo-lane/SKILL.md`. It does not enable the
  sixteen-agent roster, does not report simulated GEO, and does not treat
  okara-style content publishing as in-scope.
- This does not shrink the Dillon OS operating team (Marketing Chief and the
  seven `.claude/agents/` roles). Those are a different roster.
- Dollar figures remain **unverified** until a real `cmo seed` ledger exists.
  Do not quote them to clients.
- Google Ads developer token and GBP quota are operator forms, not code.

## Options considered

1. Keep `quality` as default until a real seed proves caching — rejected;
   connecting on `quality` makes the line item a problem before the product is
   proven.
2. Wire GSC first — delayed; forms that sit in week-long review queues go
   first, then one real seed, then GSC/Places.
3. Run all sixteen agents — rejected until four earn their keep.

## Evidence

- [[12_Brain/01_Captures/2026-08-19 - CMO lane economics and sequencing]]
- [[12_Brain/05_Projects/2026-08-19 - CMO paid local attribution lane]]
