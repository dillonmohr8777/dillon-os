---
tags: [brief, competitive-task, orchestrator]
date: 2026-08-10
run_id: 2026-08-10-1786366938121
---

# Competitive Task — 2026-08-10

## The one thing

**NKCDC launch** — ads are built and approved; go-live is blocked on NKCDC shipping the Free Tax Prep page. One nudge to Anthony Miller today unblocks revenue and closes the open invoice thread.

## P0 today

1. **NKCDC** — launch blocked on client landing page; nudge Anthony Miller (`due: 2026-04-16`, overdue)
2. **BigOrange Marketing** — Custom Home Builder pillar audit **due today** (`due: 2026-08-10`)
3. **Hardwood Artisan** — Dalton card on file stale; Sean flagged at_risk of pausing
4. **Jason/Sean bot** — 4 Slack loops now **11 days** unanswered; stabilize case-status alerts

## Boss / Slack open loops (vault fallback)

| Who | Ask | Age |
|-----|-----|-----|
| Jason + Sean | Bot stability + case-status notifications | 11d |
| Sean | CallRail activity report | 11d |
| Melissa | Guidelines training prompt + Loom | 11d |
| Jenny | NeedMomentum brand direction | 11d |

## Client pulse

- **38/38** client notes with complete frontmatter
- **Moving:** 0 (no 24h vault changes — tracking stale)
- **At risk:** Hardwood Artisan
- **Due today:** BigOrange pillar audit

## Infrastructure

| Check | Status |
|-------|--------|
| Frontmatter | 38/38 complete |
| Site health (dry-run) | FAIL — `/api/dossier-leads` canary pattern |
| Prospect radar | **921** tracked, **152** rebuild-ready (+15 found today) |
| Gates | netlify token, mail vendor, landingfolio token pending |

## Deliberately not doing

- Tier-2 sends (mail, Slack posts, deploys, live ads edits)
- Prospect batch builds (152 queue — human approves)
- Weekly `/synthesize` (Friday cron)
- Sunday content catch-up (flagged, not auto-drafted)

## Connector gaps

- Gmail MCP: unavailable — vault mirrors only
- Slack MCP: unavailable — 4 inbox notes frozen at 2026-07-30
- Codex sessions: on operator 64GB machine, not in Git

## Next step

Review this PR on your phone. Reply "build it" on any `website-build` Slack note to trigger `/site-factory`.
