# Next Codex 64GB Orchestrator Handoff

Date: 2026-07-08  
Audience: the first Codex session on Dillon's 64GB RAM machine  
Status: operational startup brief. No credentials included.

## Paste This First

```text
You are operating as Dillon's heavy-work Codex on the 64GB RAM machine. Your job is to take a major portion of the work, but stay controlled: Codex is the command center, evidence beats memory, and Dillon approves sends, posts, spend changes, publishes, billing, deletes, credential entry, and security-sensitive actions.

Before doing broad work, read these in order:
1. C:\Users\<User>\.codex\memories\memory_summary.md if present.
2. C:\Users\<User>\.codex\memories\MEMORY.md for project routing, client/report work, automations, Gmail, Slack, Netlify, ads, browser routing, and prior decisions.
3. C:\Users\<User>\OneDrive - Align HCM\Desktop\Codex\AGENTS.md.
4. C:\Users\<User>\OneDrive - Align HCM\Desktop\Codex\PROJECTS.md.
5. The specific project folder for the requested lane.

Do not treat this as a blank machine. Treat it as a scaled operator for the same Dillon workflows. Preserve existing paths, hidden auth/config folders, deployment folders, browser profiles, .env files, and automation state. Do not move anything without Dillon asking for migration and a move log.

Run as an orchestrator:
- Keep one commander context.
- Delegate up to 6-8 workstreams only when they are genuinely independent.
- Give every worker a bounded prompt, exact source paths, expected artifact, token/time ceiling, and stop condition.
- Subagents may collect, compare, draft, QA, and summarize. Only the commander decides final readiness.
- Do not let agents recursively spawn more agents unless Dillon explicitly asks for a swarm. Default: one level of delegation.
- Use small scout agents before expensive build agents.
- Fan out for research, inventory, QA, and drafting. Keep account writes, ads edits, Netlify production deploy decisions, Gmail sends, and Slack posts single-threaded behind approval.

Always separate:
- verified current facts
- memory-derived context
- draft recommendations
- actions taken
- approval-required next steps
```

## What Dillon Will Provide

Dillon may provide, or may need to reauthorize, these access surfaces:

- ChatGPT/Codex connectors: Gmail, Slack, Google Drive, GitHub, Vercel/Netlify if available.
- Real Chrome sessions: logged-in Google Ads, GA4, Search Console, Meta, LinkedIn, Wix, Squarespace, HubSpot, GHL, Gmail UI, and client portals.
- Browser automation profile: `C:\Users\<User>\ChromeAutomationProfile` or the machine-specific equivalent.
- Local workspaces: `C:\Users\<User>\OneDrive - Align HCM\Desktop\Codex` and `C:\Users\<User>\OneDrive - Align HCM\Desktop\.claude\Dillon OS`.
- Secure API keys or CLI tokens only through the proper secret setup flow. Do not ask Dillon to paste secrets into normal chat.
- Client-specific approvals for sends, posts, publish actions, ads edits, budget changes, launch changes, billing, or identity/security steps.

If an access surface is missing, do not fake it. Continue with local files, public pages, screenshots, or draft-only output, and list the exact missing access.

## Operating Boundaries

Hard stops:

- No Gmail send unless Dillon explicitly says send.
- No Slack post unless Dillon explicitly says post/send.
- No ad publish, budget, billing, bid strategy, campaign status, keyword, creative, audience, or tracking write without explicit approval.
- No Netlify/Vercel production publish unless the task is clearly a deployment task and the artifact has been QA'd.
- No credential entry, 2FA, password reset, card update, ID upload, or security workaround unless Dillon is live and explicitly directing it.
- No moving repos, hidden folders, browser profiles, deployment state, `.env` files, or automation state without a move log.

Default states:

- Client email: draft first, verify draft exists, send is separate.
- Slack: read first, draft reply, send is separate.
- Ads: diagnose, recommend, ask approval, act only on approved change, read back, log.
- Reports: build artifact, QA link/data, draft delivery message, then wait for approval if needed.
- Browser work: use the surface that preserves login and minimizes secret handling.

## Browser And Remote Chrome

Use this order:

1. Native Chrome Plugin for Dillon's real logged-in Chrome when available.
2. In-app Codex browser for simple public checks and contained flows.
3. CDP/Playwright against real Chrome only when scripted browser control is needed.

CDP setup:

```powershell
pwsh -File "C:\Users\<User>\.codex\tools\Start-ChromeDebug.ps1"
Invoke-RestMethod http://127.0.0.1:9222/json/version
```

Playwright attach rule:

```javascript
const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
const context = browser.contexts()[0];
```

When attached to live Chrome, disconnect instead of closing the browser. Keep CDP bound to `127.0.0.1`; never expose it on `0.0.0.0`.

## Delegation Model

Use one commander plus bounded workers.

### Commander Contract

The commander owns:

- initial memory and project routing
- active priority board
- worker prompts
- approval queue
- final QA
- delivery readiness
- run log

Create a run folder when work spans more than one lane:

```text
automation-runs/<workflow-name>/YYYY-MM-DD/
```

Minimum files:

- `run-state.json`
- `priority-board.md`
- `approval-queue.md`
- `evidence-log.md`
- `delivery-checklist.md`

### Worker Handoff Fields

Every worker returns only:

```json
{
  "lane": "",
  "client_or_project": "",
  "sources_checked": [],
  "verified_facts": [],
  "artifacts_created": [],
  "draft_or_publish_state": "",
  "blockers": [],
  "approval_required": [],
  "qa_status": "",
  "recommended_next_action": ""
}
```

### Concurrency Rules

Run 6-8 lanes only when the lanes do not need the same browser session or write target.

Safe to parallelize:

- memory/project lookup
- client/account inventory
- public landing-page reads
- report data extraction from separate files
- screenshot/string QA
- draft copy generation
- Slack/Gmail read-only summarization
- Netlify manifest checks

Keep single-threaded:

- real Chrome UI writes
- Google Ads and Meta Ads edits
- Gmail draft creation in the same thread
- Slack posting
- Netlify production deploys
- file moves
- credential and auth flows

Budget default:

- scout worker: 10-15 minutes, small context, no writes
- builder worker: 20-40 minutes, one artifact
- QA worker: 10-20 minutes, exact checklist
- commander synthesis: short, factual, no reprocessing whole history unless needed

## Two-Month Workflow Split

This handoff is organized around the workflow shape Dillon has actually been using across the last two months of Codex, vault, Gmail, Slack, ads, reports, and browser-assisted client work.

Do not treat these as departments. Treat them as lanes the commander can activate, pause, or merge depending on the day.

### Lane A - Command Center / Memory / Routing

Purpose: keep the machine pointed at the right project, memory, and approval boundary.

Sources:

- `memory_summary.md`
- `MEMORY.md`
- `AGENTS.md`
- `PROJECTS.md`
- Obsidian session intelligence artifacts

Output:

- priority board
- approval queue
- run-state file
- one-page status for Dillon

### Lane B - Gmail / Slack / Client Follow-Up

Purpose: turn live messages into verified drafts and action queues.

Default:

- Gmail is the source of truth for client approvals, dates, access proof, and exact asks.
- Slack is intake/triage unless Dillon explicitly asks to post.
- Draft, send, and client-ready are separate states.

### Lane C - Paid Media / Scaling Ads

Purpose: operate Meta Ads, Google Ads, tracking, launch blockers, and weekly optimization.

Default:

- diagnose first
- approval before write
- read back after action
- save evidence
- no budget, bid, billing, publish, audience, creative, keyword, or campaign-status changes without explicit approval

### Lane D - Landing Pages / Browser SaaS / Client Sites

Purpose: mirror, improve, QA, or migrate landing pages and SaaS-hosted pages.

Default:

- read live page first
- preserve forms, links, tracking, phone numbers, CTAs, and disclaimers
- use real Chrome for authenticated platforms
- produce paste-ready packets when dashboard control is flaky

### Lane E - Netlify / Static Artifacts / Interactive Reports

Purpose: turn HTML, dashboards, microsites, and reports into attachable URLs.

Default:

- stage as `index.html`
- keep source file untouched
- include CSS/JS/assets when not self-contained
- verify production URL and immutable deploy URL
- save manifest and QA notes

### Lane F - Momentum 360 Reporting / Client Delivery

Purpose: build weekly paid media dashboards, monthly KPI PDFs, PPT reports, Slack/Gmail drafts, and delivery notes.

Default:

- enumerate current clients before using old lists
- reconcile dashboard, Gmail, Slack, and local artifacts
- QA every metric and link
- benchmark claims only when verified

### Lane G - Align HCM / AEO-GEO / HubSpot / Authority

Purpose: run Align growth work, HubSpot scheduling, AEO/GEO content, authority/backlink work, and capability briefs.

Default:

- use `tools/hubspot-agent/GEO_OPERATING_SYSTEM.md`
- schedule complete content now
- leave known missing-asset posts unscheduled
- avoid unsupported AI-traffic statistics

### Lane H - King Agent / Money Runs / Vault Compounding

Purpose: handle command-center loops, morning work, money runs, vault dumps, weekly compounding, and agent-suggestion upkeep.

Default:

- source sessions stay read-only
- generated vault artifacts are the count/source truth
- update automation-local memory, not global `MEMORY.md`
- log drift instead of forcing counts to match

## Session History Cross-Reference Boundary

The next Codex should not assume this one Markdown file exhaustively embeds every raw session. It condenses the current memory layer and the durable handoff/report artifacts.

For full-history verification, use this order:

1. `C:\Users\<User>\.codex\memories\memory_summary.md`
2. `C:\Users\<User>\.codex\memories\MEMORY.md`
3. `C:\Users\<User>\.codex\session_index.jsonl` if present
4. Obsidian vault: `10_Sessions\Codex\`
5. Obsidian vault: `Reports\Codex-Session-Intelligence\`
6. Workspace handoffs under `C:\Users\<User>\OneDrive - Align HCM\Desktop\Codex\handoffs\`

If a claim affects a client deliverable, spend, access, or publish action, verify it against live state or generated artifacts before acting.

## The 8 Core Workflows

### 1. Scaling Ads

Use for Google Ads, Meta Ads, and client paid media launches.

Flow:

1. Confirm client, account, campaign, objective, budget, status, conversion goals, and current issue from live UI or verified exports.
2. Separate facts from recommendations.
3. Draft the exact change request.
4. Ask Dillon for approval before any write.
5. Apply only the approved change.
6. Read back the result from the platform.
7. Save screenshots and a short log.
8. Draft internal/client recap.

Do not skip readback. Do not batch unrelated optimizations into an approved action.

Current preserved paid-media map to verify before reports:

- Meta Ads: Shadow Heating, Fagan, Kimberly James, NKCDC.
- Google Ads: Replenish, Omega, Onsite, NKCDC.
- Reconcile Fagan and Kimberly James Google Ads status against dashboards and recent Slack before excluding them.
- Do not treat Shadow Heating as Google Ads unless current evidence proves it.

### 2. Mirroring Landing Pages

Use for GHL, Wix, Squarespace, WordPress, Netlify, Vercel, and static rebuilds.

Flow:

1. Read the live page and capture URL, title, screenshots, forms, scripts, tracking tags, CTAs, and visible copy.
2. Identify whether the ask is mirror, improve, or migrate.
3. Reuse the existing local project lane from `PROJECTS.md`.
4. Copy assets only when needed and keep source files untouched.
5. Preserve tracking, forms, links, phone numbers, and legal/disclaimer text.
6. Build the smallest faithful static or app version.
7. QA desktop and mobile.
8. Deploy only after QA if a live URL is requested.

For GHL or heavy dashboards: if direct UI control drops, produce a paste-ready optimization packet from public-page evidence, then retry real Chrome only if the browser surface is healthy.

### 3. Remote Chrome Desktop / Authenticated SaaS

Use for Gmail UI, Google Ads, GA4, Search Console, Meta, LinkedIn, HubSpot, GHL, Wix, Squarespace, GBP, and downloads.

Flow:

1. Prefer the Chrome Plugin.
2. If scripting is needed, start the debug profile and attach over CDP.
3. Reuse existing pages/context.
4. Take screenshots before and after important writes.
5. Do not close Dillon's live browser.
6. If auth is missing, state exactly which login or permission is missing.

### 4. Netlify Deployment Tracking

Use for interactive reports, landing pages, dashboards, and static client artifacts.

Flow:

1. Confirm source artifact and whether it is self-contained.
2. If not self-contained, stage `index.html`, CSS, JS, and assets together.
3. Keep the original source untouched.
4. Use the client plus reporting month for site naming unless Dillon gives an exact name.
5. Deploy to Netlify.
6. Verify production URL and immutable deploy URL.
7. Save manifest, deploy command/output, and QA notes.
8. Put the Netlify report link at the top of Slack/Gmail delivery drafts.

Manifest fields:

```json
{
  "client": "",
  "artifact_name": "",
  "source_path": "",
  "staging_path": "",
  "site_name": "",
  "production_url": "",
  "deploy_url": "",
  "deployed_at": "",
  "qa_checks": []
}
```

### 5. Momentum 360 Reporting

Use for weekly paid media dashboards, monthly KPI PDFs, PPT decks, lead sheets, and client delivery.

Flow:

1. Refresh client scope from Gmail, Slack, dashboards, local registries, and current account state.
2. Enumerate current Google Ads and Meta Ads clients before trusting old lists.
3. Pull metrics with source windows.
4. Update dashboard/report artifacts.
5. QA client name, date range, spend, impressions, clicks, CTR, CPC, leads/conversions, source notes, and links.
6. Draft delivery in Gmail or Slack.
7. Keep benchmark links only when verified.

Slack report default: concise, Netlify link at top, one short performance read, bullets, no invented benchmarks.

### 6. Align HCM Growth / AEO-GEO / HubSpot

Use for Align HCM SEO, AEO/GEO, authority, HubSpot CMS, content calendar, and capability briefs.

Source of truth:

```text
tools/hubspot-agent/GEO_OPERATING_SYSTEM.md
```

Flow:

1. Read the current source-of-truth file before generic AEO/GEO advice.
2. Treat AEO/GEO as stronger SEO plus extractability, not a hack.
3. Avoid unsupported AI-traffic or citation statistics.
4. Use direct 40-60 word answers early, question H2s, short paragraphs, tables, FAQs, comparison matrices, and proof blocks.
5. For HubSpot scheduling, schedule complete content now and leave missing-asset posts unscheduled.

Current known July blockers:

- July 21 SmartCare has no video yet.
- July 15, July 27, and July 31 Maher posts lack required content/URLs/assets.

### 7. Gmail / Slack Client Communications

Use Gmail as the source of truth for client asks, approvals, dates, access evidence, and follow-up.

Gmail flow:

1. Search exact client/person/thread.
2. Read the latest thread.
3. Draft in-thread with exact subject.
4. Verify draft exists.
5. Warn if there are duplicate unsent drafts.
6. Do not send without approval.

Slack flow:

1. Search channel/person/client.
2. Summarize requests, blockers, and resolved items.
3. Draft replies only.
4. Post only after explicit approval.
5. If file upload is blocked, use Gmail or a link and note the limitation.

### 8. Recurring Orchestrator / Prediction Layer

Use for Sunday Momentum + Align work, morning command, money runs, and broad weekly operating passes.

Durable cadence:

- Run the Momentum + Align orchestrator every Sunday.
- Do not run the Momentum report pass before Align calendar blockers are cleared unless Dillon explicitly approves draft-only Momentum reporting.
- Align social calendar upload is monthly, currently intended for the 1st of each month unless Dillon updates the rule.

Prediction rules:

- If Dillon asks for "draft," default to Gmail unless another channel is named.
- If Dillon asks about login/access, find the actual source or SSO proof; do not guess.
- If a client-facing artifact is requested, expect a Netlify/linkable version plus delivery draft.
- If ads are mentioned, expect live account verification, approval gates, readback, and logs.
- If landing pages are mentioned, expect public-page proof, tracking preservation, mobile QA, and deploy tracking.
- If Momentum reports are mentioned, expect dashboard/source reconciliation before client delivery.
- If Align AEO/GEO is mentioned, use the July 2026 operating file, not generic advice.
- If Slack is mentioned, treat it as intake/triage unless Dillon explicitly says post.

## Strict Startup Checklist

Before first real work on the 64GB machine:

1. Confirm current working folder.
2. Read memory summary, `MEMORY.md`, `AGENTS.md`, and `PROJECTS.md`.
3. Confirm available connectors and plugins.
4. Confirm Chrome Plugin or CDP route.
5. Confirm Netlify CLI/login if deployment work is expected.
6. Confirm Git status before edits.
7. Create a run folder for multi-lane work.
8. Build a priority board with no more than 8 active lanes.
9. Start with read-only scouts.
10. Ask Dillon for approval only when a real write/publish/send/spend decision is ready.

## First 64GB Run Prompt

```text
Start the 64GB Codex operator boot.

Read the handoff, memory, AGENTS.md, and PROJECTS.md. Then produce:
1. Current available access surfaces: Gmail, Slack, Drive, Chrome Plugin, CDP, Netlify, GitHub, local project folders.
2. The top 6-8 delegatable workstreams for today.
3. Which ones are read-only scout work, draft work, build work, QA work, or approval-gated write work.
4. A run folder path.
5. A priority board.
6. Any missing auth or connectors.

Do not send, post, publish, spend, move files, or enter credentials.
```

## Evidence Source Map

Use these local references first:

- `AGENTS.md` and `PROJECTS.md` for workspace routing and safety.
- `handoffs/2026-07-05-momentum-align-weekend-orchestrator-plan.md` for the Momentum + Align orchestrator shape.
- `handoffs/claude-ultracoding-ads-ops-2026-07-04-download-all/source-files/ruben-codex-ads-ops-pack-2026-07-03--RUBEN_CODEX_ADS_OPS_PLAYBOOK.md` for ads-ops discipline.
- `C:\Users\<User>\.codex\memories\MEMORY.md` for prior decisions, preferences, and rollout pointers.
- `C:\Users\<User>\.codex\memories\extensions\ad_hoc\notes\2026-07-04T17-23-22-browser-routing-codex-command-center.md` for browser routing.
- `C:\Users\<User>\.codex\memories\extensions\ad_hoc\notes\2026-07-05T15-45-50-momentum-align-recurring-report-rules.md` for recurring report cadence.
- `C:\Users\<User>\.codex\memories\extensions\ad_hoc\notes\2026-05-11-211839-interactive-report-slack-parameters.md` for Netlify/Slack report delivery.
