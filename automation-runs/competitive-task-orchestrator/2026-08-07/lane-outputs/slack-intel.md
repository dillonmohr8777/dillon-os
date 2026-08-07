# Slack Intel — 2026-08-07

**MCP status:** unavailable — vault fallback from `00_Inbox/slack/` (4 notes, all `status: new`). No `Daily-Briefs/slack-intake-*.md` present. Supplemented by `Daily-Briefs/source-intake-2026-07-30.md` and `02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log.md`.

## Top unanswered asks

| Who | Channel | Type | Age | Ask | Suggested next step |
|---|---|---|---|---|---|
| Jason Fallon + Sean Boyle | group-dm | automation | 8d | Confirm bot stability; add automatic alerts to Jason and Sean when a case moves to reinstated | Identify bot runtime and case-status event source, reproduce missed behavior, draft bounded ETA plan — `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md` |
| Sean Boyle | #calls | report | 8d | Verify whether CallRail activity has happened; explain what changed | Pull latest CallRail logs, identify last known working event, draft concise evidence-backed update — `00_Inbox/slack/2026-07-30-sean-callrail-status.md` |
| Melissa Silber | #ai-tech-news | content | 8d (thread open since Jul 28, 10d) | Status on guidelines/training prompt, next-step and Loom timing, coordinate meeting this week | Verify prompt artifact and dependency owners, draft one accurate status reply with real Loom state and calendar options — `00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt.md` |
| Jenny McClain Miller | DM | question | 8d | Branding direction for `needmomentum.com` plus quick timeline for the update | Resolve direction with Mac and Sean, then draft one confirmed update and realistic connection window — `00_Inbox/slack/2026-07-30-jenny-brand-direction.md` |

### Mac automation context (from Slack Evidence Log)

| Who | Channel | Type | Age | Ask | Suggested next step |
|---|---|---|---|---|---|
| Mac Frederick | #ai-tech-news | automation | 26d | After Philly package delivery: "whats the steps taken we can use to automate everything" — collab with Jesse on automation steps | Document repeatable pipeline steps (discover → qualify → build → QA → human approval → activate); align with Orbit eight-stage framing — `02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log.md` |
| Mac Frederick | #ai-tech-news | automation | 16d | Reintegrate AI into Slack for team/person command props | Scope Slack-facing AI command layer (distinct from `/slack-intake` vault mirror); draft options or defer with ETA — same evidence log |
| Mac Frederick | #ai-tech-news | automation | 16d | Zapier QR from sheet rows; PostGrid direct-mail when address column = ready | Finish mail-side integration; batch CSV already sheet-ready per Mac's contract — same evidence log |

## Counts by type

**Inbox (`00_Inbox/slack/`, status: new)**

- automation: 1 (urgent)
- report: 1 (high)
- content: 1 (high)
- question: 1 (normal)

**Evidence log (campaign lane, not inbox-mirrored)**

- automation: 3 (boss asks, Jul 12–22)

## Ambiguous items

- **Melissa guidelines thread** — multiple watchdog digests repeated the same open loop; canonical deduped note is `2026-07-30-melissa-guidelines-training-prompt.md`. Loom final state and meeting slot still unverified.
- **Jenny brand direction** — formal confirmation from Mac and Sean still pending before Dillon can reply to Jenny.
- **Bot/case-status alert** — current bot owner and delivery timeline not verified in vault; needs runtime inspection before ETA.
- **CallRail** — source-trace details not yet validated per inbox note; may overlap with live ops outside Slack mirror window.
- **Mac automation steps vs. weekly batch cadence** — evidence log states no explicit Philly → PA → national directive from Mac; geography expansion is Dillon's plan. Mail vendor (StackAdapt vs PostGrid) and batch volume/budget remain undecided in Slack.

## Data gaps

- Live Slack MCP unavailable; no messages after **2026-07-30** captured in vault mirrors.
- `Daily-Briefs/source-intake-2026-07-30.md` confirms authenticated Slack search ran that day but Composio direct execution remains blocked; inbox mirrors are the authoritative fallback for this run.
- KJB channel: no items in current mirror set (CC rule N/A).
