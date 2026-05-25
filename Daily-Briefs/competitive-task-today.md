# Competitive Task Brief — 2026-05-25

## Executive summary

Vault data has not been refreshed since mid-April 2026 — treat client `last_touched` dates as **stale** until Gmail/Slack MCP runs succeed inside the umbrella automation. The competitive stack is now **one orchestrator** with six parallel intel agents; disable the seven legacy crons. Today's P0 themes from vault memory: **NKCDC launch blocked**, **Bar Crawl ad disapprovals**, **Hardwood Artisan billing risk**, and **overdue LinkEZE enhanced conversions**. First priority after enabling MCP: re-sync email reality, then rewrite `System/claude-memory-sync.md`.

## P0 — Do first

1. **NKCDC** — Anthony still non-responsive per vault; Free Tax Prep page blocks launch. Nudge + align with Mac (`01_Clients/NKCDC/overview.md`).
2. **Bar Crawl USA** — Resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl). Andy waiting (`01_Clients/Bar Crawl USA/overview.md`).
3. **Hardwood Artisan** — Chase Dalton on card update before engagement pauses (`01_Clients/Hardwood Artisan/overview.md`).
4. **LinkEZE** — Enhanced conversions + MFA diagnostics overdue since 2026-04-06 (`01_Clients/Link Eze/overview.md`).

## P1 — This week

- **Kimberly James Bridal** — Publish Timeline page; verify GA4/GSC (Mac). CC rule on all sends.
- **Fresh Blends / Replenish** — Confirm launch pacing + first-week snapshot.
- **Commercial Cleaners Alliance** — Creative delivery audit (2026-04-08 commitment).
- **Jeff Hozias** — Launch approved Meta seller campaign.
- **Omega Landscaping** — David / John Belaska meeting + drone footage.
- **Shadow HVAC** — LSA live check; GBP cadence (stalled since 2026-03-02).
- **BOK Law** — Weekly social cadence (`due` was 2026-04-19 in vault — verify current week).

## Sources merged

| Source | Status |
|--------|--------|
| Gmail | **Unavailable** this run — enable Gmail MCP on automation `bc523644-815a-43a9-b434-fd2967c1be2c` |
| Slack | **Unavailable** this run — enable Slack MCP |
| Vault pulse | **OK** — scanned `01_Clients/*/overview.md` frontmatter |
| Codex/sessions | **OK** — workflow + agents committed; no new session exports in repo |
| Content routines | **Skipped** — 2026-05-25 is Sunday; book SEO not Thursday |

## Client table

| Client | Status | Next action | Due (vault) |
|--------|--------|-------------|-------------|
| NKCDC | BLOCKED | Free Tax Prep page + Anthony reply | 2026-04-16 (stale) |
| Bar Crawl USA | Active | Fix 2 disapproved ads | 2026-04-25 (stale) |
| Hardwood Artisan | AT RISK | Billing card update | 2026-04-18 (stale) |
| Link Eze | Active | Enhanced conversions / MFA | 2026-04-06 (overdue) |
| KJB | Active | Timeline publish + indexing | — |
| Fresh Blends | Active | Launch + week-1 snapshot | — |
| CCA | Onboarding | Deliver creatives | 2026-04-16 (stale) |
| Jeff Hozias | Active | Launch Meta seller ads | — |
| Omega | Active | Drone footage + David meeting | — |
| Shadow HVAC | Active | LSA verification | — |
| Onsite Concrete | Active | Weekly call | 2026-04-16 (stale) |
| BOK Law | Active | Weekly social | 2026-04-19 (stale) |

## Coverage gaps

- Vault `last_touched` fields are 5–6 weeks old — pulse cannot detect 24h activity until notes are updated or Gmail/Slack sync runs.
- No Codex session export files in repo; `codex-session-sync` relied on vault + new workflow docs only.
- `Daily-Briefs/pulse-today.md` (2026-04-15) superseded by this file going forward.

## Automation health

- **Umbrella**: `competitive-task-orchestrator` — prompt at `System/competitive-task-orchestrator-prompt.md`
- **Subagents**: `.cursor/agents/` (7 files)
- **Action**: Disable legacy automations listed in `System/routine-health.md`
- **Action**: Paste orchestrator prompt into Cursor UI; confirm repo attached + Gmail MCP

## Tomorrow's stack (after MCP sync)

1. Re-run competitive task with Gmail live → refresh `System/urgent-replies.md` and client `last_touched`.
2. P0 from fresh email: likely Bar Crawl + NKCDC + Hardwood still top.
3. Add `last_touched: 2026-05-25` to any client touched during cleanup.
