# Daily Pulse 2026-06-15

## Coverage Notes

• Run date 2026-06-15. Scanned `01_Clients/` (138 files), `02_Campaigns/` (9 queue files), and `02_FullTimeJob/AlignHCM/` (7 files).
• Vault client intel is frozen at April 2026. No `01_Clients/` notes carry `last_touched` or `due` dates in June. Live Gmail/Slack scans are needed to refresh P0 status.
• `02_Campaigns/` queue files are empty templates. No non-empty pending items in Pending Review, Pending Requests, High Priority, Queued, or In Progress sections.
• Align HCM calendars (`content-calendar.md`, `linkedin-calendar.md`) still reference April 2026. No June due dates found. `linkedin-calendar.md` last_touched 2026-04-15.
• Previous `pulse-today.md` was dated 2026-04-15. This run advances the pulse to the orchestrator run date.

## Active Clients

• **NKCDC** (P0 launch blocked) • last_touched 2026-04-15 • Campaign built and approved. Waiting on Anthony Miller to ship Free Tax Prep landing page. No response since Mac's 2026-04-15 check-in.
• **Bar Crawl USA** (P0 ad disapprovals) • last_touched 2026-04-15 • 2 disapproved ads (Halloween / Fall Cocktail Crawl). Resolution owed to Andy. Pre-approved copy only per brand rules.
• **Hardwood Artisan** (P0 billing risk, status at_risk) • last_touched 2026-04-07 • Dalton has not updated card on file since Sean's 2026-04-07 request. Engagement pause risk.
• **Commercial Cleaners Alliance** (onboarding) • last_touched 2026-04-14 • Creative delivery audit against 2026-04-08 commitment (CCA + NexGen).
• **Onsite Concrete** • last_touched 2026-04-09 • Standing weekly call cadence. Vault due date 2026-04-16 is stale.
• **LinkEZE** • last_touched 2026-04-05 • Enhanced conversions diagnostics and MFA confirmation still open. Vault due 2026-04-06 is 70 days overdue.
• **Fresh Blends / Replenish** • last_touched 2026-04-13 • Verify campaign pacing and send Mia first-week performance snapshot.
• **Kimberly James Bridal** • last_touched 2026-04-15 • Publish Timeline page and verify GA4/GSC indexing.
• **Jeff Hozias** • last_touched 2026-04-14 • Launch approved Meta seller campaign.
• **Omega Landscaping** • last_touched 2026-04-14 • Chase David for drone footage and confirm John Belaska meeting.
• **BOK Law** • last_touched 2026-04-14 • Weekly social cadence (Wed Wisdom, Family Fridays, Sat Solutions).
• **Shadow HVAC** • last_touched 2026-03-02 • LSA clearance and GBP cadence check. Longest stall in vault.

## Pending Deliverables

• **No items due within 48h** (2026-06-15 through 2026-06-17). No client frontmatter carries June due dates.
• **Overdue vault due dates** (all April, require status refresh):
  • LinkEZE • due 2026-04-06 • Enhanced conversions + MFA on account 809-600-6448
  • NKCDC • due 2026-04-16 • Launch blocked on client landing page
  • Commercial Cleaners Alliance • due 2026-04-16 • CCA + NexGen creative delivery
  • Onsite Concrete • due 2026-04-16 • Weekly call (date stale)
  • Hardwood Artisan • due 2026-04-18 • Card update for next 90 days
  • BOK Law • due 2026-04-19 • Weekly social content cadence
  • Bar Crawl USA • due 2026-04-25 • Disapproval resolution + Taco & Tequila wave 1 pacing
• **02_Campaigns queues** • All pending sections empty. No queued optimizations, creative requests, landing pages, or search term reviews.
• **Align HCM** • No dated deliverables in `content-calendar.md` or `linkedin-calendar.md`. April highlights and May calendar text only. No June entries.

## Stalled Items

• Criteria: `status: active` (or `onboarding` / `at_risk`) with `last_touched` older than 7 days (before 2026-06-08), or no tracking frontmatter at all.
• **Shadow HVAC** • last_touched 2026-03-02 (105 days) • Confirm LSA cleared and GBP cadence resumed
• **LinkEZE** • last_touched 2026-04-05 (71 days) • Enhanced conversions diagnostics + MFA
• **Hardwood Artisan** • last_touched 2026-04-07 (69 days) • Billing card update (at_risk)
• **Onsite Concrete** • last_touched 2026-04-09 (67 days) • Weekly call attendance
• **Fresh Blends / Replenish** • last_touched 2026-04-13 (63 days) • First-week performance snapshot
• **Commercial Cleaners Alliance** • last_touched 2026-04-14 (62 days) • Creative delivery audit
• **BOK Law** • last_touched 2026-04-14 (62 days) • Weekly social cadence
• **Jeff Hozias** • last_touched 2026-04-14 (62 days) • Meta seller campaign launch
• **Omega Landscaping** • last_touched 2026-04-14 (62 days) • Drone footage + John Belaska meeting
• **Bar Crawl USA** • last_touched 2026-04-15 (61 days) • Ad disapproval resolution
• **NKCDC** • last_touched 2026-04-15 (61 days) • Launch blocked on client page
• **Kimberly James Bridal** • last_touched 2026-04-15 (61 days) • Timeline page publish
• **10 active clients with no overview/tracking frontmatter** • Buzz Bull, Florecita, Bridge of Hope OTC, Bend Plastic Surgery, Bluegrass Janitorial, Coach B, AWCI, Vanessa, PNW Pro Clean, Next Gen Solutions

## Frontmatter Gaps

• **12 M360 clients have `overview.md` with full tracking** • Bar Crawl USA, BOK Law, CCA, Fresh Blends, Hardwood Artisan, Jeff Hozias, KJB, LinkEZE, NKCDC, Omega, Onsite Concrete, Shadow HVAC. Root `.md` stubs still lack `last_touched` / `next_action` / `due`.
• **10 active clients missing all three tracking fields** (no `overview.md`): Buzz Bull, Florecita, Bridge of Hope OTC, Bend Plastic Surgery, Bluegrass Janitorial, Coach B, AWCI, Vanessa, PNW Pro Clean, Next Gen Solutions
• **Align HCM** • `01_Clients/Align HCM.md` has `status: active` only. Production calendars live in `02_FullTimeJob/AlignHCM/` but carry no `due` fields and no June 2026 entries.
• **Recommendation** • Add `overview.md` with `last_touched`, `next_action`, `due` to every active client. Refresh all April dates before next orchestrator run.

## Tomorrow's Priority Stack

1. **NKCDC** • Nudge Anthony Miller on Free Tax Prep landing page ETA. P0 launch blocked. CC Mac and Melissa per standard rules.
2. **Bar Crawl USA** • Resolve 2 ad disapprovals. Confirm zero alcohol language. Reply to Andy with fix timeline.
3. **Hardwood Artisan** • Nudge Dalton on card update. CC Sean. Flag engagement pause risk.
