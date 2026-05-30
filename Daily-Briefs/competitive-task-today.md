# Competitive Task — 2026-05-30

> Umbrella orchestrator run (6 parallel intel lanes + consolidator). Gmail and Slack **SKIPPED** — connect MCP on `competitive-task-orchestrator` for live inbox intel. Vault intel reflects April 2026 seed until connectors refresh.

## Priority stack (do in order)

1. **NKCDC** — Launch blocked on Free Tax Prep landing page; Anthony unresponsive since 2026-04-15. Escalate with Mac.
2. **Bar Crawl USA** — Resolve 2 ad disapprovals (Halloween / Fall Cocktail Crawl). Pre-approved copy only.
3. **Hardwood Artisan** — Billing card update outstanding; engagement at risk.
4. **Commercial Cleaners Alliance** — Deliver CCA + NexGen creatives (2026-04-08 commitment).
5. **Link Eze** — Enhanced conversions diagnostics + MFA on 809-600-6448.
6. **Sunday prep (tomorrow)** — BOK Law weekly social + Align LinkedIn week of 2026-06-02 (calendars stale; refresh before generate).
7. **Vault hygiene** — Add `last_touched` / `next_action` / `due` after Gmail confirms activity.

## Gmail

**SKIPPED — Gmail MCP not connected on this run.**

Last vault intel (`System/urgent-replies.md`, 2026-04-15):

• Bar Crawl USA — Andy ad disapprovals; Dillon investigating 2026-04-15.
• NKCDC — Mac follow-up 2026-04-15, no client response.
• Omega Landscaping — John Belaska Thursday meeting; David no reply; Dillon CC monitor.
• Buzz Bull / CCA — Mike Ross Teams invite (~2026-04-14); confirm attendance.

**Action:** Enable Gmail MCP on orchestrator and re-run `gmail-intel`.

## Slack

**SKIPPED — Slack MCP not connected on this run.**

**Action:** Enable Slack MCP; prioritize M360 leadership and client ops channels.

## Vault

• No `01_Clients/` file changes in last 7 days (git/mtime since April seed).
• All 12 active M360 clients in memory sync show 7+ days without vault touch.
• Hub notes missing `last_touched`, `next_action`, `due` on Bar Crawl, KJB, Shadow HVAC, Link Eze, Omega, Jeff Hozias, Fresh Blends, BOK Law, NKCDC, CCA, Hardwood Artisan, Onsite Concrete.
• `00_Inbox/` — 1 item (Start Here only).

## Sessions / automation

• Umbrella workflow active — `.cursor/agents/` + [[System/automation-manifest]].
• **Disable 7 legacy crons** in Cursor Automations UI if still scheduled (see manifest).
• `10_Sessions/Automation Debug Log.md` — Gmail/Slack MCP gap logged 2026-05-28; still open.
• Facebook Ads session scaffolds empty; not wired to orchestrator subagents yet.
• Recommend session note for 2026-05-28 first umbrella run (consolidator optional).

## Content due

• **Today (Sat):** No routine window open.
• **Tomorrow Sun 2026-05-31 6:00 PM ET** — BOK Law weekly social (Wed Wisdom, Turn the Page Thu, Family Fri); deliver to Dorothy, Aleksandra, Rachael by Tue AM.
• **Tomorrow Sun 9:00 PM ET** — Align LinkedIn week of 2026-06-02 (Mon TL, Wed SmartCare, Fri TL/personality).
• **Thu 2026-06-04** — Book site SEO sweep per `05_Book/seo-strategy.md` (confirm whether 2026-05-28 sweep ran).
• **Blockers:** BOK calendar still `month: 2026-04`; Align calendar last_touched 2026-04-15; book SEO strategy stale.

## Ads & SEO

### P0 (today/tomorrow)

• NKCDC — blocked launch until landing page ships.
• Bar Crawl USA — policy/disapproval resolution (pre-approved library only).
• Hardwood Artisan — billing before pause.
• Commercial Cleaners Alliance — creative delivery audit.
• Link Eze — enhanced conversions + MFA verification.

### P1 (this week)

• Kimberly James Bridal — Timeline publish + GA4/GSC indexing.
• Replenish — confirm launch live + first-week snapshot; GBP access for 5 kiosks.
• Shadow HVAC — LSA serving + catch-up report to Mike.
• Omega Landscaping — drone footage from David; Thursday account review.
• Jeff Hozias — launch approved Meta seller campaign.
• Bar Crawl USA — Soulard budget cap ~$15–20/day post overspend patch.
• Align HCM — SEO blog pipeline (employer, not M360).

### Monitoring

• Bar Crawl Taco & Tequila PMax across 9+ cities.
• Replenish PMax ~$6.50/day per location.
• Align May LinkedIn vs calendar plan.

## Draft actions (not sent)

• NKCDC escalation to Anthony (CC Mac, Melissa per contact-info) — **hold until Gmail confirms thread state.**
• Bar Crawl status note to Andy — **approved copy library only.**

## Connector gaps

• Gmail MCP — required for `gmail-intel`
• Slack MCP — required for `slack-intel`
• After connecting: disable legacy crons per [[System/automation-manifest]]
