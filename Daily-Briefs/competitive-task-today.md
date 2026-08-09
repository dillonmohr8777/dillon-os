---
tags: [brief, competitive-task, orchestrator]
date: 2026-08-09
run_id: 2026-08-09-1786280655723
---

# Competitive Task — 2026-08-09

## The one thing

**Hardwood Artisan billing** — Dalton's card on file is stale; Sean flagged engagement
at risk of pausing. One call or email today prevents churn.

## P0 today

1. **Hardwood Artisan** — chase Dalton on card update (`due: 2026-04-18`, `at_risk`)
2. **NKCDC launch** — Free Tax Prep page still blocking go-live; nudge Anthony Miller
3. **Jason/Sean bot** — 4 Slack open loops are 10+ days old; stabilize case-status alerts

## Boss / Slack open loops (vault fallback — Slack MCP unavailable)

| Who | Ask | Age |
|-----|-----|-----|
| Jason + Sean | Bot stability + case-status notifications | 10d |
| Sean | CallRail activity report | 10d |
| Melissa | Guidelines training prompt + Loom | 10d |
| Jenny | NeedMomentum brand direction | 10d |

## Client pulse

- **38** client notes with complete frontmatter (0 incomplete)
- **Moving:** vault shows no 24h file changes — movement tracking is stale
- **At risk:** Hardwood Artisan
- **Due this week:** BigOrange pillar audit (Aug 10), CCA creatives, Onsite call Thu

## Infrastructure

| Check | Status |
|-------|--------|
| Frontmatter | 38/38 complete |
| Site health (dry-run) | FAIL — `/api/dossier-leads` canary pattern |
| Prospect radar | 906 tracked, 148 rebuild-ready |
| Gates | netlify token, mail vendor, landingfolio token all pending |

## Content routines

Sunday is Bok Law social + Align LinkedIn day. No new drafts flagged in `03_Content/`.
Book SEO sweep is Thursday — not due today.

## Deliberately not doing

- Tier-2 sends (mail, Slack posts, deploys)
- Prospect batch builds (148 queue — human approves)
- Weekly `/synthesize` (separate Friday cron)

## Connector gaps

- Gmail MCP: not connected this run — used vault mirrors
- Slack MCP: not connected — 4 inbox notes frozen at 2026-07-30
- Codex session history: on operator 64GB machine, not in Git

## Next step

Review this PR on your phone. Reply "build it" on any `website-build` Slack note
to trigger `/site-factory` same day.
