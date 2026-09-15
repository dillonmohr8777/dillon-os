---
note_type: ops
status: active
created: 2026-09-03
updated: 2026-09-03
owner: Dillon Mohr
verification_status: verified
review_on: 2026-10-03
source_refs:
  - "12_Brain/registry/automations.json"
  - ".claude/skills/"
  - "[[12_Brain/04_Decisions/2026-09-03 - Channel access to Dillon OS automations for the Pritzker channel]]"
tags:
  - brain
  - ops
  - capability
  - automations
  - skills
  - reference
---

# Dillon OS capability index

A single, scannable reference to every automation and skill in Dillon OS, so
anyone with vault/repo access can find and invoke what exists.

**This is a discoverability / reference layer, not an access-control system.**
The vault has no per-user identity or RBAC. Running consequential or external
actions (sending, publishing, deploying, spend, account changes, merges,
destructive actions) remains **approval-gated** per the approval boundary — this
document lists capabilities, it does not authorize firing them.

Source of truth: `12_Brain/registry/automations.json` and
`.claude/skills/*/SKILL.md`. The five `pritzker-*` skills are **pending on
PR #361 and not yet available** on this branch — they are intentionally not
listed below.

## Automations

From `12_Brain/registry/automations.json`. "Access" column reflects
`external_actions` plus gate notes: read-only means no external side effects;
approval-gated means it can act externally and needs Dillon's approval.

### Scheduled (run on a cadence)

| id | Purpose | Status | Access |
|----|---------|--------|--------|
| `daily-communications-brain` | Daily 7 AM Gmail + Slack read compiled into brain captures/reviews | active-scheduled | read-only |
| `obsidian-guard-dog` | Daily 8:30 AM Obsidian/brain guard: safe updates + one bounded learning | active-scheduled | read-only |
| `report-brain-ingest` | Archive finalized weekly/monthly reports into the brain with provenance | active-scheduled | read-only |
| `marketing-chief-twice-daily-brief` | 9 AM/5 PM OmniRoute + ChatGPT-Sites health brief | active-scheduled | read-only |

### On-demand (CLI / skill)

| id | Purpose | Status | Access |
|----|---------|--------|--------|
| `frontmatter-validate` | Validate client-note frontmatter | implemented | read-only |
| `frontmatter-repair` | Repair missing client frontmatter (dry-run default) | implemented | read-only |
| `site-health-sentinel` | Site health checks (fixtures; `--live` opt-in) | implemented | read-only |
| `discover-qualify` | Prospect intake + 0-100 scorer, drafts only | implemented | read-only |
| `indeed-hiring-adapter` | Normalize Indeed hiring signals into the prospect schema | implemented | read-only |
| `grok-intelligence-ingest` | Grok run JSON into immutable brain captures/research | implemented | read-only |
| `xai-daily-search` | Direct xAI X + web research collector | implemented | read-only |
| `experiment-queue` | Create proposed experiments from ingest candidates | implemented | read-only |
| `dillon-dev-sandbox` | Dev-environment doctor/verify prototype (fixture-only) | implemented | read-only |
| `maker-checker` | Independent maker/checker workflow gate (human approval required) | implemented | read-only |
| `mcp-acceptance-gate` | MCP source/permission/overlap/injection gate | implemented | read-only |
| `context7-docs` | Version-sensitive third-party docs via MCP | implemented | read-only |
| `aeo-trust-gate` | Website AEO/trust deployment gate (a fail blocks deploy) | implemented | read-only |
| `agent-craft-brief` | Recursive infrastructure-learning brief (routine D26) | implemented | read-only |
| `connector-health` | Connector reachability/freshness probe | implemented | read-only |
| `browser-access` | Web escalation ladder (probe / recommend / fetch / screenshot) | implemented | read-only |
| `am-report` | Morning inbox + client pulse + directives + content brief | implemented | read-only |

### Gated / external-dependency

| id | Purpose | Status | Access |
|----|---------|--------|--------|
| `outreach-activate` | QR + direct-mail activation for an approved batch | gated | approval-gated (external) |
| `site-factory-batch` | Weekly 25-site build batch | external-dependency (PR #226) | read-only; depends on discover-qualify + human approval |
| `landingfolio-design-reference` | Landing-page layout reference via MCP | pending-gate | read-only; sandbox-only until Inspector passes |

*Also in the registry but not runnable capabilities:*
`daily-communications-brain-workflow-def` and
`daily-morning-orchestrator-dry-board` are **deprecated** reference definitions
(superseded by `daily-communications-brain`), kept for history only.

*Standing gates* (`automations.json` → `gates`): `obsidian_sync_cli`
pending-human, `netlify_deploy_token` pending-secret, `landingfolio_token`
pending-secret, `mail_vendor` pending-decision, `outreach_send` hard-blocked.

## Skills (slash commands)

From `.claude/skills/*/SKILL.md`. Invoke as `/name`. All are read-and-draft by
default; any external send, publish, deploy, or spend they touch stays
approval-gated.

| Skill | What it does |
|-------|--------------|
| `/am-report` | Morning briefing: inbox, client pulse, today's directives, content pipeline |
| `/automation-ops` | Run the OS gates: intelligence ingest, experiment queue, maker/checker, MCP, AEO, frontmatter, site-health, qualification |
| `/brain-capture` | Turn a source/transcript/thread/session into an immutable receipt and route durable contents |
| `/brain-compile` | Compile captures + session outcomes into sourced canonical entities/concepts/decisions/projects/memory |
| `/brain-review` | Weekly synthesis: projects, decisions, memory, research expiry, client drift, vault health, priorities |
| `/client-pulse` | Sweep 01_Clients for movement, stalls, and due-soon work → `Daily-Briefs/pulse-today.md` |
| `/client-report` | Build a branded interactive HTML performance report for a client |
| `/content-scan` | Scan 03_Content and 02_Campaigns for ship-ready ideas; rank drafts, flag gaps, propose the slate |
| `/franchise-list` | Pull a franchise brand's locations in a state, grade each site, package a CSV + brief |
| `/frontend-build` | Front-end implementation standards for batch sites (semantics, performance, responsive, no-JS) |
| `/inbox-brief` | Triage 00_Inbox: summarize unprocessed notes, extract actions, file a brief |
| `/metrics-pull` | Compute vault-wide metrics and log a dated snapshot |
| `/mirror-and-improve` | Core batch workflow: harvest a target, adopt its copy, rebuild a better site |
| `/motion-design` | Motion/interaction pass: scroll reveals, hover, transitions, micro-interactions |
| `/operating-team` | Instantiate a Claude-native role from the Grok operating team; run/own/route a routine by ID |
| `/plan-today` | Build today's time-blocked plan from Dashboard, latest brief, and open client work |
| `/research-sweep` | Split a question, fan out parallel searchers, attack claims, land dated sourced findings |
| `/scroll-hero` | Turn a site-factory harvest.json into a 6-8s looping HyperFrames hero video, QA by JSON |
| `/session-mine` | Mine the session for decisions/mistakes/patterns into `12_Brain/01_Captures/sessions/` |
| `/site-batch` | Run a weekly 25-prospect-site batch end to end + review hub, QR, mail-merge |
| `/site-factory` | Generate a full client/prospect site from a brief using the Momentum profile template system |
| `/site-grade` | Find prospect businesses in a market and grade their existing sites before building |
| `/slack-intake` | Read boss/client Slack requests, classify, and file structured task notes into the inbox |
| `/synthesize` | Weekly big-model synthesis: what changed, what's drifting, what deserves attention |
| `/ui-design` | Visual design pass: palette, type scale, hierarchy, spacing, contrast |
| `/ux-audit` | UX/conversion pass: audit friction, define flow, IA, accessibility of the replacement |
| `/vault-clean` | Vault hygiene: stray root files, broken wikilinks, empty notes, stale inbox items |
| `/vault-compile` | Nightly compile: new captures + today's changes into entities/concepts; refresh INDEX |
| `/week-review` | Weekly review: what shipped, what stalled, task completion, next week's focus |
| `/wiki-lint` | Weekly graph hygiene: contradictions, duplicate pages, dead wikilinks, missing sources, stale expiry |

*Pending, not yet available:* the five `pritzker-*` skills are on **PR #361**
(not merged) and are deliberately omitted until that PR lands.
