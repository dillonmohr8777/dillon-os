# Competitive Task — 2026-08-28

## Coverage

- **Gmail:** fallback — MCP not connected on cloud runner; refreshed from `System/urgent-replies.md` and approval queue.
- **Slack:** fallback — wrote `System/slack-action-queue.md` from 120-day audit + gated queue items.
- **Vault pulse:** 30+ client overviews scanned; **5 accounts** stale 27+ days on `last_touched`; **4 accounts** frozen since July 11–12 (46+ days).
- **Sessions:** 6 files in `10_Sessions/`; no new exports since July 29 reporting training. Facebook Ads session stubs still need Codex export on 64GB machine.
- **Ads/SEO:** Google Ads optimization queue empty in vault; P0s carried from client overviews and urgent-replies (Shadow Meta, Bar Crawl hub, Fagan attribution).
- **Prospect Radar:** latest `Daily-Briefs/radar-2026-08-27.md` — 1,200 tracked, 226 rebuild-ready (Mohr Media growth lane, not client P0).
- **Content routines:** **skipped** — Friday (Sunday/Thursday only). Book SEO path lives in `_archive/05_Book/seo-strategy.md` if Thursday sweep resumes.
- **Automation health:** `System/automation-status.md` dated 2026-07-12 — stale; gateway telemetry requires Windows box read. Umbrella run recorded in `System/routine-health.md`.

## P0 Stack

1. **Shadow HVAC** — Meta visibility and current-week lead delivery unverified since 2026-07-12; `due` 2026-07-15 passed. Highest launch/revenue risk on active HVAC account.
2. **Kimberly James Bridal** — FAQ desktop crop + responsive QA + appointment routing still open; `last_touched` 2026-07-12.
3. **Bar Crawl USA** — Boos & Booze city/event QA and current-event hub repair; `last_touched` 2026-07-11.
4. **Revive Systems** — 48-hour lead-recovery brief and LSA verification stage still unresolved (`System/urgent-replies.md`).
5. **Fagan Painting** — Meta Lead / form / phone attribution must reconcile before any scale (`approval-queue` high risk).

**Next tier:** Replenish billing owner + San Diego expansion decision; Onsite technical crawl; Omega Wix/Ads/GHL access verification.

## Urgent Replies

See [[System/urgent-replies]] and [[System/approval-queue]].

- **Momentum / NeedMomentum** — brand-direction reply to Jenny (gated)
- **Sean / CallRail** — activity verification before status reply (gated)
- **Replenish / Mia** — billing owner follow-up (gated)
- **Shadow / Mike** — catch-up report after LSA/Meta verification (gated)

## Stalled Clients (7+ days)

| Client | last_touched | Days | Open item |
| --- | --- | ---: | --- |
| Bar Crawl USA | 2026-07-11 | 48 | Event hub + Boos & Booze QA |
| Kimberly James Bridal | 2026-07-12 | 47 | FAQ crop + appointment routing |
| Shadow HVAC | 2026-07-12 | 47 | Meta visibility + lead delivery |
| Hope Wellness Center | 2026-07-12 | 47 | Request analysis + GBP follow-up |
| Onsite Concrete | 2026-07-12 | 47 | Technical crawl + conversion actions |
| BigOrange Marketing | 2026-07-30 | 29 | Pillar audit + Janice interview |
| *All Aug 1 cohort* | 2026-08-01 | 27 | Touch notes when worked — includes NKCDC, Omega, Fagan, Momentum 360, etc. |

**Registry gaps:** Capsule & Tonic and Everyday Life Insurance remain `pending-registry-reconciliation`.

## Content / SEO Due Today

- **Friday 2026-08-28** — content-routines skipped
- **Sunday 2026-08-30** — next BOK social + Align LinkedIn draft generation
- **Align HCM** — 10 drafted blogs in `SEO/AlignHCM/Blogs/` still need polish/publish (approval-gated)

## Tomorrow Prep

1. **Sunday** — content-routines runs; review BOK + Align drafts before ship.
2. Update `last_touched` on any client note you touch today.
3. Connect **Gmail + Slack MCP** on `competitive-task-orchestrator` for live intel (lanes still vault-fallback).
4. Confirm legacy crons disabled — see [[System/competitive-task-definition#Retired standalone crons]].
5. Prospect Radar: 226 rebuild-ready sites are outreach fuel, not today's client P0.
