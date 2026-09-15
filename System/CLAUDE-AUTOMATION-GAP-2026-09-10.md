# CLAUDE-AUTOMATION-GAP-2026-09-10

Terse. Sources: `.claude/scheduled-tasks`, `.codex/automations`, `dillon-os/.claude/agents/marketing-chief.md`, `00_Inbox/Automation Deep Analysis 2026-07-29.md`, `System/MASTER-ORCHESTRATOR.md`, client-ops Pritzker zap receipts. Slack MCP not re-searched this pass (disk + parent steer).

## Claude automations found (path + what it does + cadence)

### Claude scheduled-tasks (live)
`C:\Users\dillo\.claude\scheduled-tasks\`

| Path | What | Cadence |
|---|---|---|
| `...\am-report-local\SKILL.md` | Vault AM brief → `Daily-Briefs/am-report-YYYY-MM-DD.md`; updates Dashboard Today | weekday AM (local FS only) |
| `...\slack-intake-local\SKILL.md` | Composio Slack read → `00_Inbox/slack/*.md` + run summary | **9:30 / 12:30 / 15:30 / 18:30 weekdays** (stated in am-report skill) |
| `...\client-ads-metrics-pull\SKILL.md` | Composio Ads/GA4/GSC → `Daily-Briefs/ads-metrics-*.md` | weekday |
| `...\forecast-backtest-weekly\SKILL.md` | Chronos / predict-work evidence-only | weekly |
| `...\google-ads-oauth-reminder\SKILL.md` | One-shot OAuth consent nag for GoogleAdsProbe | one-time (retire when `google-ads.yaml` exists) |

`scheduled_tasks.lock` under `.claude\.claude\` only (session lock, not a schedule registry).

### Claude agents / settings (discussed / defined, not all scheduled)
- Agents (vault): `C:\Users\dillo\repos\dillon-os\.claude\agents\` — marketing-chief + 9 lane agents. Home `C:\Users\dillo\.claude\agents\` empty/thin.
- `marketing-chief.md` D-table: D01/D02/D04/D05/D06/D09/D20/D21/D27 + W01/W07/E02 = **Codex-owned, Claude refuse**. Claude analyst only: D10/D11.
- OPERATING-PLAN roster (discussed, not all installed as crons): skill-selector, prospect-site builder batch-20, Claude-design/MP4 daily, email-outreach draft, cross-reference on open, HubSpot tracker, job-search, client-conversion.
- `settings.json`: SessionStart hook → `local-capabilities-start.cjs`; ponytail enabled; no cron block inside settings.
- Deep Analysis (2026-07-29): site-health sentinel daily (W3), GBP/social weekly (D1–D3), prospect sheet + Zapier mail path (O1–O4), “port 28 Codex automations” into 12_Brain — mostly still open / Codex-owned.

### Codex automations Claude discussed / refused to own (`C:\Users\dillo\.codex\automations\`)
Key ones (rrule ET unless noted):

| ID | Cadence | Role |
|---|---|---|
| marketing-chief-twice-daily-brief | 9:00 + 17:00 daily | MMCO evidence monitor |
| daily-morning-orchestrator-dry-board | daily (DTSTART 07:00) | morning orchestra |
| daily-communications-brain | 07:00 daily | comms brain |
| daily-grok-dillon-os-intelligence | 07:30 daily | frontier intel |
| momentum-hubspot-day/night-pulse | 15m day / hourly night | HubSpot pulse |
| momentum-radar-daily-12 | cron `0 5 * * *` | prospect radar 12 |
| weekly-client-marketing-reports | Mon 10:00 | report batch |
| slack-reply-watchdog | every 6h | Slack reply watch |
| six-hour-important-email-drafter | every 6h | email drafts |
| + Align dashboard, SEMrush, BOK FB PDF, Puttery monitor, IMMOHRTAL loops, etc. (~25 total) | | |

Hermes `cron/jobs.json` not present/readable this pass (Jul doc claimed dillon-daily-brief / gateway-health / approval-queue).

## Slack-related automation mentions found on disk (if any)

- **Pritzker Zapier status**: `...\client-operations\clients\pritzker-law-group\deliverables\2026-09-08-zapier-status\` — zap **379405193** published ON; Mondays schedule; parent steer: → `#pritzker-law-group`; disk continuity also records dest **`#momentum360xplg` (`C0BQV7N570T`)** + Sean ack. Ready-to-Send stays **No** until human row. First Monday run unobserved → do not resend.
- Parent/Jenny-Sean ask Sep 8 (Slack) → Dillon published that zap.
- **Align / HubSpot zaps** (parent): `332246329` (+ PMax `369135469` / Meta `368432826` Aug 17) — client Zapier, not a Grok cron. Sparse ID hits in vault this pass; treat as known external.
- Approval-queue: Zapier match-back for Omega/KJB/Onsite/Fresh Blends still gated; Fagan Zap = technical reference only (client retired).
- Deep Analysis / Mac chain: Bot scrape → site factory → **Zapier → QR → Direct Mail** (mail vendor still open).
- Claude `slack-intake-local` + Codex `slack-reply-watchdog` + D05 triage = Slack automation layer on disk.

## Grok routines already covering

From `System/MASTER-ORCHESTRATOR.md` + parent list:

| Grok routine | Cadence | Covers |
|---|---|---|
| CEO daily operating sweep | weekdays 8:00 ET | day map / board (should READ Claude Daily-Briefs) |
| AI Division CEO daily impress loop | weekdays 8:00 ET | Big 7 impress (new; not in Claude schedules) |
| Mohr Media morning standup | 9:00 ET | personal brand (isolated) |
| Hyperframes craft health | weekdays 9:30 ET | craft stack health |
| Mohr Media prospect scan | 10:30 ET | Mohr Media prospects |
| Daily AEO GEO SEO dry-run | weekdays 10:00 ET | client AEO/GEO/SEO dry-run |
| Mike Over LSA daily until live | weekdays 11:00 ET | Revive LSA finite watch |

Big 7 bots + AI Division CEO exist as agents (`System/GROK-BIG-7-ROSTER.md`); skill-selector discussed in OPERATING-PLAN, partially mirrored by Skill Router Pro.

## Gaps (Claude had it / Slack needed it, Grok missing)

1. **No gap to clone**: slack-intake-local, am-report-local, D01–D27 / marketing-chief-twice-daily, HubSpot pulses, forecast-backtest — Claude/Codex SoT. Grok twin = waste + conflict.
2. **CEO sweep integration gap**: sweep does not yet *explicitly* consume `Daily-Briefs/am-report-*.md` + `slack-intake-*.md` + ads-metrics (prompt update only).
3. **client-ads-metrics-pull**: Grok-port only if Claude schedule dies; else leave.
4. **google-ads-oauth-reminder**: one-shot; verify probe yaml → pause/delete Claude task if authorized (Ads API already live per daily-orchestrator 2026-09-10).
5. **Pritzker Zapier**: **not a Grok gap** — Zap ON externally; no Monday Grok cron. Optional: disk watch for first Monday receipt only.
6. **Align HubSpot zaps**: external; no Grok schedule needed.
7. **OPERATING-PLAN unbuilt vs Grok Big 7**: job-search daily + prospect batch-20 token-frugal path still thin relative to Claude plan; Big 7 covers desks but not full Claude scheduled-task set.
8. **Site-health sentinel (W3) / Zapier mail activate (O3–O4)**: still open in Deep Analysis — neither Claude schedule nor Grok routine owns live sentinel/mail send (correctly gated).
9. **M360 daily health to Jason+Sean**: OPERATING-PLAN says dead 8d — confirm before restore; **not** auto-add to Grok (would re-arm Slack post).

## Safe next actions (no send/post; disk only)

1. Patch CEO daily sweep prompt: read latest `Daily-Briefs/am-report-*.md`, `slack-intake-*.md`, `ads-metrics-*.md` first.
2. Leave Claude `scheduled-tasks` + Codex automations primary for intake/metrics/MMCO.
3. Check `GoogleAdsProbe\google-ads.yaml`; if present, mark oauth-reminder retired on disk.
4. Do **not** create Grok twins of Marketing Chief / HubSpot pulse / slack-intake.
5. Keep Grok-only lanes: AI Division impress, Hyperframes, Mohr Media standup/prospect, Mike LSA, AEO dry-run.
6. Pritzker: leave Zapier; optional local note when first Mon run appears — no Slack send.
7. No client messaging from this report.

Written: 2026-09-10 ~20:10 ET
