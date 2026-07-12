---
tags: [system, approvals]
last_updated: 2026-07-12
status: active
---

# Approval Queue

> Draft actions requiring human approval. This file is LOCAL-ONLY and must never auto-execute actions. Hermes cron job `dillon-approval-queue` consolidates here hourly (read-only scan). No email, Slack, Telegram broadcasts.

## How It Works

- Each item = proposed action that would need external side effect (email send, ad change, client message, publish, deploy, spend, billing, credential rotation)
- Items are logged here with context, source, and approval checkbox
- Human checks [x] after manually performing or explicitly approving
- Automation never checks the box, never sends

Format:
```
- [ ] YYYY-MM-DD — [Client/Project] — Action — Source: <file/session> — Evidence: <link or note> — Risk: low/med/high
```

## Queue (as of 2026-07-12 initial seed)

- [ ] 2026-07-12 19:45 UTC — [Cursor / MCP] — Authenticate Composio MCP in Cursor (`user-composio` needsAuth) — Source: System/cursor-takeover-report.md — Evidence: blocks Gmail, Google Drive, Google Calendar read-only triage from Cursor; Hermes has Composio in config but Cursor session does not — Risk: low — Action: Dillon completes OAuth in Cursor MCP settings
- [ ] 2026-07-12 19:45 UTC — [Cursor / MCP] — Authenticate WordPress.com MCP in Cursor (`user-wordpress-com` needsAuth) — Source: System/cursor-takeover-report.md — Evidence: WP.com tools unavailable in Cursor until OAuth — Risk: low
- [ ] 2026-07-12 19:45 UTC — [Cursor / MCP] — Authenticate Slack MCP in Cursor (`plugin-slack-slack` needsAuth) — Source: System/cursor-takeover-report.md — Evidence: Slack read/triage blocked in Cursor — Risk: low
- [ ] 2026-07-12 19:45 UTC — [Book / ironicineptocracy.com] — Set Vercel env vars for MailerLite/webhook on dossier-leads (endpoint exists but unconfigured) — Source: System/cursor-takeover-report.md — Evidence: GET /api/dossier-leads returns mailerliteConfigured:false, webhookConfigured:false — Risk: high — Action: configure env + test POST; production deploy requires approval
- [ ] 2026-07-12 — [Telegram/Gateway] — Investigate & shut down external bot poller using same token (DillonHermesAgentBot) — Source: System/automation-status.md — Evidence: conflict every 25s persists after single-gateway repair, 1620 conflicts in last 5000 lines — Risk: medium — Note: requires locating VPS/remote deployment or manual token rotation via @BotFather (outside automated bounds)
- [ ] 2026-07-12 17:13 UTC — [Telegram/Gateway] — STILL ACTIVE: external poller causing 136 conflicts/hour (990 in last 2000 log lines, heartbeat 710s stale) — Source: System/gateway-health.md + C:/Users/dillo/AppData/Local/hermes/logs/gateway.log + gateway_state.json — Evidence: PID 37852 alive but telegram state stale 2026-07-12T17:01:55Z, log mtime 13:13:38 local, rate 1/26s, last error Conflict terminated by other getUpdates — Risk: high — Action: locate remote deployment, do NOT auto-rotate token — Risk: high
- [ ] 2026-07-12 17:31 UTC — [Telegram/Gateway] — STILL ACTIVE (update): external poller 136/hr, log frozen 13:31 local (4304 lines), heartbeat 1756s (29m) stale, PID 37852 pythonw alive single — Source: System/gateway-health.md 17:31 + gateway_state.json updated_at 17:01:55Z + logs/gateway.log mtime 13:31 — Evidence: total conflicts 2108 since 2026-07-11 18:54:09, 1h136/6h827/24h2108, pattern conflict 1/5 Waiting 20s, telegram state connected but stale — Risk: high — Action: kill remote poller (Fly.io/Railway/VPS/second laptop), drain getUpdates, do NOT auto-rotate token
- [ ] 2026-07-12 18:01 UTC — [Telegram/Gateway] — STILL ACTIVE (update 18:01Z): external poller 138/hr (threshold 10/hr), heartbeat 3592s (59.9m) stale, PID 37852 alive single, log 981K 4440 lines mtime 14:00:59 EDT last conflict 14:01:25 EDT — Source: System/gateway-health.md 18:01Z + gateway_state.json updated_at 17:01:55Z stale + logs/gateway.log 14:01:25Z conflict — Evidence: 1h138/6h826/24h2178 total 2178 since 2026-07-11 18:54:09, pattern terminated by other getUpdates every 26s, telegram state connected but mtime stale — Risk: high — Action: locate remote deployment (Fly.io/Railway/VPS/second laptop/WSL docker/GitHub Actions), kill remote poller, deleteWebhook+getUpdates drain, restart local PID 37852, verify heartbeat <120s + 0 conflicts 15m, DO NOT auto-rotate token
- [ ] 2026-07-12 18:32 UTC — [Telegram/Gateway] — CRITICAL UPDATE (139/hr >10/hr threshold): external poller alive, heartbeat 5414s (90.2m) stale frozen since 13:01, PID 37852 pythonw ALIVE single 145M, log 1,013K mtime 14:31:46 local last conflict 14:31:46 local — Source: System/gateway-health.md 18:32Z + gateway_state.json updated_at 17:01:55Z stale 90m + logs/gateway.log 14:31:46 conflict — Evidence: total 2248 since 2026-07-11 18:54:09, 1h139/6h826/24h2248 rate 1/25.9s continuous, state file mtime frozen 13:01 while log advancing, telegram connected stale — Risk: high — Action: kill remote poller (Fly.io/Railway/VPS/second laptop/WSL/docker/Actions), drain, restart local 37852, verify <120s + 0 conflicts 15m, DO NOT auto-rotate token
- [ ] 2026-07-12 19:01 UTC — [Telegram/Gateway] — CRITICAL UPDATE (139/hr >10/hr): external poller still alive, heartbeat 7149s (119m) STALE frozen since 13:01, PID 37852 pythonw ALIVE single, log 1,014,738 bytes mtime 14:33:25 local last conflict 14:33:04 — Source: System/gateway-health.md 19:01Z + gateway_state.json updated_at 17:01:55Z stale 119m + logs/gateway.log 14:33:04 conflict — Evidence: total 2251 since 2026-07-11 18:54:09, 1h139/6h826/24h2251 rate 1/25.9s, state file mtime frozen while log advancing, telegram connected stale, PID alive — Risk: high — Action: kill remote poller (Fly/Remote/VPS/laptop/docker), drain getUpdates, restart local 37852, verify heartbeat <120s + 0 conflicts 15m, DO NOT auto-rotate token
- [ ] 2026-07-12 — [Dillon OS / Revenue] — Reconcile active client count 12 vs 14 M360 entries + Direct list — Source: System/operating-status.md — Evidence: OS Config says 12, Client Index lists 14 — Risk: low
- [ ] 2026-07-12 — [Dillon OS / Revenue] — Verify MRR against Melissa invoicing for unknown-rate clients (Hardwood Artisan, NKCDC, Onsite, Blissful $500 project, BOK Law, Bluegrass) — Source: System/revenue-scorecard.md — Risk: low
- [ ] 2026-07-12 — [Dillon OS / Ops] — Soft-restart Hermes gateway PID 20848 if heartbeat still stale >30m (state frozen at 19:16:21Z, log mtime 15:16 local) — Source: System/gateway-health.md + refresh-gateway-health.ps1 — Evidence: PID alive, 0 conflicts/hr, but updated_at not advancing — Risk: low — Action: taskkill /PID 20848 /F, wait 8s, run Startup Hermes_Gateway.vbs, verify heartbeat <120s
- [ ] 2026-07-12 — [Clients / Bar Crawl USA] — Resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl language) — Source: System/claude-memory-sync.md 2026-04-15 — Risk: med — Stale, verify current status
- [ ] 2026-07-12 — [Clients / NKCDC] — Follow up on Free Tax Prep landing page block — Source: claude-memory-sync.md — Risk: med — Stale from April
- [ ] 2026-07-12 — [Clients / Hardwood Artisan] — Chase billing card update — Source: claude-memory-sync.md — Risk: med — Outstanding since 2026-04-07
- [ ] 2026-07-12 — [Automation] — Confirm daily briefing cron writes dated file and contains no invented numbers — Source: cron dillon-daily-brief — Risk: low
- [ ] 2026-07-12 — [Clients / Commercial Cleaners Alliance] — Deliver CCA creatives + NexGen creative from 2026-04-08 commitment — Source: 01_Clients/Commercial Cleaners Alliance/overview.md + System/urgent-replies.md — Evidence: "working on your creatives today … also have your NexGen, I will be done with today" due 2026-04-16, status onboarding — Risk: medium
- [ ] 2026-07-12 — [Clients / Fresh Blends - Replenish] — Verify 2026-04-13 launch pacing + send first-week performance snapshot + close GBP manager access for 5 kiosks — Source: 01_Clients/Fresh Blends Replenish/overview.md + System/claude-memory-sync.md — Evidence: "Confirm campaigns launched 2026-04-13 are pacing correctly; first-week snapshot" + Admin access granted to Mia for billing — Risk: medium
- [ ] 2026-07-12 — [Clients / Shadow HVAC] — Confirm LSA background check cleared and active + send March/April catch-up report + verify GBP 4x/week cadence — Source: 01_Clients/Shadow HVAC/overview.md + System/urgent-replies.md — Evidence: "Reset confirmed 2026-03-02. Gmail quiet after" + last_touched 2026-03-02 no comms since — Risk: medium
- [ ] 2026-07-12 — [Clients / LinkEZE] — Fix enhanced conversions diagnostics warning + confirm MFA/2SV enabled on Customer ID 809-600-6448 — Source: 01_Clients/Link Eze/overview.md — Evidence: "Take action to fix your setup on enhanced conversions" + "2-step verification required starting 2026-04-06" — Risk: high
- [ ] 2026-07-12 — [Clients / Omega Landscaping] — Chase David for drone footage (outstanding since 2026-04-02) + confirm Thursday meeting with John Belaska — Source: 01_Clients/Omega Landscaping/overview.md + System/urgent-replies.md — Evidence: "John Belaska following up with David re meeting Thursday" + "still waiting on additional drone footage" — Risk: low
- [ ] 2026-07-12 — [Clients / Kimberly James Bridal] — Publish Wedding Dress Timeline page approved 2026-04-13 + verify GA4/GSC indexing healthy per Mac — Source: 01_Clients/Kimberly James Bridal/overview.md + System/claude-memory-sync.md — Evidence: "Everything looks perfect … good to publish" + Mac 2026-04-11 double-check GA4+GSC — Risk: low
- [ ] 2026-07-12 — [Clients / Jeff Hozias] — Launch approved seller Meta Ads (Not a Zestimate angle) + investigate March GBP post rejections — Source: 01_Clients/Jeff Hozias/overview.md — Evidence: "Not a Zestimate. Not a guess. seller opener called scroll-stopper cleared for launch" + "Google rejected a number of GBP posts throughout March" — Risk: medium
- [ ] 2026-07-12 — [Book / ironicineptocracy.com] — Fix broken /api/dossier-leads email capture (dead since ~June 2) + verify MailerLite/Sheets delivery + confirm Garnier Dossier lead magnet — Source: 00_Inbox/Top 15 Opportunities 2026-07-02.md + Daily-Briefs/2026-07-12.md — Evidence: "The signup form posts to /api/dossier-leads and that endpoint doesn't exist … Every visitor since roughly June 2 has hit a dead form" — Risk: high
- [ ] 2026-07-12 — [Book / ironicineptocracy.com] — Ship dispatches 02-04 (Who Gets Spent, Memory Economy, Garnier Position) + publish press kit + push social assets in images/social/ — Source: 00_Inbox/Top 15 Opportunities 2026-07-02.md — Evidence: "Repo contains finished social assets for four drops … Only drop one is live" + "press kit still says Assets coming soon" — Risk: medium
- [ ] 2026-07-12 — [Dillon OS / Security] — Audit MFA/2SV across all managed Google Ads accounts after LinkEZE enforcement notice — Source: System/claude-memory-sync.md + 01_Clients/Link Eze/overview.md — Evidence: "Confirm MFA is enabled on Google Ads account (customer ID 809-600-6448) before April 6 cutoff" — Risk: high
- [ ] 2026-07-12 -- [Bar Crawl USA] -- Cap Soulard PMax $54 runaway to $15-20/day and verify tCPA guardrail on all PMax -- Source: 01_Clients/Bar Crawl USA/overview.md -- Evidence: Andy flagged $54 day spend on Soulard traced to Max Conversions without tCPA patched + asked cap ~$15-20/day so final week isn't biggest -- Risk: high
- [ ] 2026-07-12 -- [Book / ironicineptocracy.com] -- Install GA4 + Meta Pixel tracking + verify delivery (blocks paid funnel) -- Source: 00_Inbox/Top 15 Opportunities 2026-07-02.md -- Evidence: site has zero analytics beyond Vercel: no GA4 no Meta Pixel so ads can't be measured today -- Risk: medium
- [ ] 2026-07-12 -- [Book / ironicineptocracy.com] -- Draft and send guest-post pitches to CrimeReads Spybrary Independent Book Review for launch funnel -- Source: 00_Inbox/Top 15 Opportunities 2026-07-02.md -- Evidence: draft the CrimeReads Spybrary and Independent Book Review pitches that are defined but never sent -- Risk: low
- [ ] 2026-07-12 -- [Clients / BOK Law] -- Continue weekly social cadence Wed Wisdom Turn the Page Thu Family Fridays + deliver next batch -- Source: 01_Clients/Bok Law/overview.md -- Evidence: Weekly social content series 3 posts per week continuous cadence active through April 2026 + routine generates every Sun 6PM -- Risk: low
- [ ] 2026-07-12 -- [Clients / Onsite Concrete] -- Confirm standing Thursday 1PM ET sync + summarize Divi hero/service card fixes for Grace -- Source: 01_Clients/Onsite Concrete/overview.md -- Evidence: Standing meeting Onsite x M360 Call Thursdays 1:00-1:30 PM ET last held 2026-04-09 no substantive async deliverables -- Risk: low
- [ ] 2026-07-12 -- [Clients / Fresh Blends - Replenish] -- Chase GBP manager access for 5 kiosks + confirm billing CC entered by Mia -- Source: 01_Clients/Fresh Blends Replenish/overview.md -- Evidence: Admin access granted to Mia 2026-04-12 so she could enter billing + GBP Manager access needed for all 5 kiosk locations -- Risk: medium
- [ ] 2026-07-12 -- [Clients / Jeff Hozias] -- Fix Systeme.io funnel opt-in inactive + finalize Meta vs Google Ads strategy replacement -- Source: 01_Clients/Jeff Hozias/overview.md -- Evidence: Troubleshooting inactive page / opt-in issues + 2026-03-20 Meta Ads strategy call moving away from LSA low-quality leads -- Risk: low

- [ ] 2026-07-12 -- [LinkEZE] -- Audit ALL campaigns for Presence Only targeting, fix Presence or Interest misconfig wasting spend -- Source: 01_Clients/Link Eze/active-campaigns.md + overview.md -- Evidence: "Location targeting must be Presence Only across every campaign. Presence or Interest was prior misconfiguration and it burned budget" + "Location targeting was previously set to Presence or Interest instead of Presence Only. Corrected, but audit every new campaign" -- Risk: high
- [ ] 2026-07-12 -- [Bar Crawl USA] -- Audit ALL PMax cities for Presence Only + verify tCPA guardrail attached to every PMax (Soulard $54 runaway prevention) -- Source: 01_Clients/Bar Crawl USA/active-campaigns.md + notes.md -- Evidence: "Location targeting MUST be Presence Only. NEVER Presence or Interest. This has burned both Bar Crawl USA and LinkEZE" + "Soulard incident 2026-04-13: Max Conversions without tCPA -> $54 single-day spend. Guard rail: every PMax gets a tCPA" -- Risk: high
- [ ] 2026-07-12 -- [NKCDC] -- Chase invoice collection: first month + remaining grant-project invoices (billing follow-up) -- Source: 01_Clients/NKCDC/contact-info.md + System/claude-memory-sync.md -- Evidence: "First month invoice sent by Melissa 2026-04-15. Grant-project invoices also outstanding" + "No response from NKCDC team yet" -- Risk: medium
- [ ] 2026-07-12 -- [Hardwood Artisan] -- Draft pause-notice email + flag to Sean if billing still stalled beyond mid-April, stop production to avoid unpaid work -- Source: 01_Clients/Hardwood Artisan/notes.md + overview.md -- Evidence: "If billing stalls beyond mid-April, flag to Sean and stop production to avoid unpaid work" + "Sean is pushing Dalton to update the card on file for the next 90 days. Engagement is at risk of pausing" -- Risk: medium
- [ ] 2026-07-12 -- [Shadow HVAC] -- Deploy static website (Next.js out/ -> Netlify) to production, verify live URL serving -- Source: 01_Clients/Shadow HVAC/website/README.md -- Evidence: "Hosting Netlify (netlify.toml) — publishes out/ — pure static export, also deploys" -- Risk: low
- [ ] 2026-07-12 -- [Align HCM / Full-time] -- Build & deploy SmartCare maturity assessment + FTE ROI calculator as AEO lead-gen assets -- Source: 00_Inbox/Top 15 Opportunities 2026-07-02.md Opp 10 -- Evidence: "The SmartCare website spec in 02_FullTimeJob/AlignHCM calls for a maturity assessment tool and an FTE ROI calculator. Neither exists yet. These are interactive lead-gen apps ... strongest AEO/GEO assets" -- Risk: medium

## Completed / Archived

- (none yet)

## Rules

- Never auto-send, auto-publish, auto-spend
- All entries must have date, client/project, action, source, evidence
- Approval = human checks box + adds comment with date and how executed
- Cron job only appends new findings, never removes or checks boxes
- Keep file under 200 lines; archive completed to `System/approval-queue-archive.md` when >150 lines

## Verification

- Created 2026-07-12 as part of Company OS init
- Seeded with items from existing memory files and gateway findings
