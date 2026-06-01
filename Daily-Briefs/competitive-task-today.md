# Competitive Task — 2026-06-01

## Run meta

- Orchestrator: competitive-task-orchestrator (consolidation build)
- MCP: Gmail **fallback** | Slack **fallback** (vault-only run; connect MCP on automation for live intel)
- Legacy crons replaced: 7

## P0 — Do first

• **NKCDC** — Launch blocked until Free Tax Prep landing page ships. Anthony silent on 2026-04-13 and 2026-04-15 follow-ups. Escalate or alternate POC.
• **Hardwood Artisan** — Billing card update outstanding since 2026-04-07. Engagement at risk.
• **Bar Crawl USA** — Two ad disapprovals (Halloween / Fall Cocktail Crawl). Resolution owed to Andy Zirger.
• **Commercial Cleaners Alliance** — Creative delivery committed 2026-04-08 (CCA + NexGen). Audit status.
• **Fresh Blends / Replenish** — Confirm campaign launch and first-week snapshot (target launch 2026-04-13).

## Gmail

• Vault intel through 2026-04-15. Re-run with Gmail MCP to refresh unread/unanswered.
• **Omega Landscaping** — John Belaska Thursday Google Ads sync; Dillon CC'd. Monitor or confirm attendance.
• **Buzz Bull / CCA** — Mike Ross Teams invite (~2026-04-14). Confirm attendance.
• **KJB** — Timeline page publish + GA4/GSC per Mac after 2026-04-13 approval.

## Slack

• MCP_FALLBACK — no Slack scan this run. Connect Slack MCP on next orchestrator run.

## Vault pulse

• Client notes under `01_Clients/` last bulk-updated 2026-04-15. Without `last_touched` updates, stalled detection is weak.
• **Action:** Add `last_touched`, `due`, `next_action` to active client frontmatter on touch.
• Campaign queues (`02_Campaigns/*`) are mostly empty shells. Populate from ads work sessions.

## Ads / SEO / campaigns

• **Bar Crawl USA** — Disapprovals P0; Taco & Tequila wave deadlines 2026-04-25 and 2026-05-02.
• **Link Eze** — Enhanced conversions diagnostics; MFA on 809-600-6448.
• **Shadow HVAC** — Verify LSA serving after quiet Gmail since 2026-03-02.
• **Align HCM** — SEO blogs in `SEO/AlignHCM/Blogs/` (full-time lane, not M360).

## Content (if ran today)

• content routines: **not scheduled today** (Sunday = BOK Law + Align LinkedIn; Thursday = book SEO)

## Codex / sessions

• `10_Sessions/Session Index.md` sparse. Capture Facebook Ads automation work in session notes when running builds.
• This run installed umbrella orchestrator spec + `.cursor/agents/dillon-*.md`.

## Stalled (7+ days)

• Entire `01_Clients/` tree by file mtime since 2026-04-15 (expected until next live MCP pulse).
• **NKCDC**, **Hardwood Artisan**, **Omega** (drone footage) — standing stalls per `System/claude-memory-sync.md`.

## Calendar (48h)

• Verify Onsite Concrete weekly call cadence (historically Thu 1:00 PM ET).
• Bar Crawl wave 1 approaching if still on April calendar.

---

> Next run: enable Gmail + Slack on automation `bc523644-815a-43a9-b434-fd2967c1be2c`, disable seven legacy crons after three green days.
