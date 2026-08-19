---
name: cmo-lane
description: Run the paid + local + attribution CMO lane on the balanced profile with four earning agents. Use when asked to seed a CMO client, change CMO_PROFILE, wire GSC/Places/GEO/WordPress, or push the CMO goal board to Netlify.
---

# CMO Lane

Read `11_Agents/cmo-lane.json` first. It is the contract. Do not widen it.

## Defaults (non-negotiable)

- `CMO_ROUTING_PROFILE=balanced` (the `_cmo/` env name on PR `#323`).
  `CMO_PROFILE=balanced` is the vault alias. Never switch the default to `quality`.
- Active roster is exactly: `paid-search-analyst`, `local-seo`,
  `attribution-reconciler`, `seo-technical`.
- GEO is simulated until a real SERP provider is connected. Do not report
  those numbers.
- Content/social composition is buy-not-build. Do not add article, X, or
  LinkedIn publishers.
- This lane does not disable Dillon OS's seven `.claude/agents/` roles.

## Sequence

1. Keep the config at `balanced` + four agents. Already done in this repo.
2. Dillon files Google Ads developer token and GBP quota (forms, weeks).
3. One real `ANTHROPIC_API_KEY` and one real client seed. Watch:
   send-worthy output, `cache_read_input_tokens > 0`, structured-output
   validation, token-estimate error. Expect bugs.
4. GSC + Places (OAuth/key; no review).
5. DataForSEO (or equivalent) before calling GEO reportable.
6. One WordPress Application Password publisher, approval-gated.
7. Server auth if anyone but Dillon opens it.
8. Postgres + scheduler only after ~3 clients or unattended runs.

Do not skip ahead to GSC, GEO, WordPress, or Postgres to look busy.

## Runtime gap

`cmo seed` is not in this Git tree. Do not invent a second CMO product. If
the runtime appears, point it at `11_Agents/cmo-lane.json` and
`_os/cmo-lane/.env.example`.

## Netlify

Operator board lives in `_os/cmo-lane/public/` and must stay `noindex`.
Visual language matches the Momentum 360 agents board (navy/gold, cute
agent portraits, platform marks). Do not swap it for a sixteen-agent
marketing site or a public client URL.

```
node _os/automation/bin/cmo-lane-netlify-deploy.js --dry-run
```

Live or draft publish requires a pinned `CMO_LANE_NETLIFY_SITE_ID` and
explicit approval. Never create a Netlify site. Never `--disable-linking`
without a site ID. Never overlay a client site.

## Finish

Update the project
`12_Brain/05_Projects/2026-08-19 - CMO paid local attribution lane.md`
with what changed, what was verified, and the next safe action. External
sends, spend, production deploys, and account changes stay on
`System/approval-queue.md`.
