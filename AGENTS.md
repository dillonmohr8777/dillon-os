# AGENTS.md

Read this first. It tells any agent (Cursor, Claude Code, Codex) what this repo is and how to work inside it without re-exploring from scratch.

## What this repo is

This is **Dillon OS**: Dillon Mohr's Obsidian vault plus an agentic operating layer for his agency work (Momentum 360 / Mohr Media) and full-time job (Align HCM). It is a working second brain, not an app monorepo. Primary directive: **Road to 100 clients** (current progress lives in `System/OS Config.md` frontmatter).

Three kinds of things live here:

1. **The vault**: markdown notes organized by numbered folders (see map below)
2. **Skills**: runnable agent workflows in `.claude/skills/` (one folder per skill, each with a `SKILL.md`)
3. **Website projects**: real shippable code in `philly-sites/`, `mohr-media-site/`, `immohrtal-site/`, `_templates/site-factory/`, and inside some client folders (e.g. `01_Clients/Shadow HVAC/website/`)

## Vault map

| Folder | Purpose |
|---|---|
| `00_Inbox/` | Quick capture, unsorted. Slack intake tasks land here too. |
| `01_Clients/` | One note per client (`Client Name.md`), plus a folder per client with deeper work. `Client Index.md` is the roster. |
| `02_Campaigns/` | Ad campaign plans and queues |
| `02_FullTimeJob/` | Align HCM work. NOT Momentum 360. Never mix branding. |
| `03_Content/` | Content drafts, ad copy, SEO writing |
| `04_SOPs/` | Repeatable playbooks |
| `05_Offers/`, `05_Book/` | Mohr Media offers and book project |
| `06_Personal/`, `07_DBA/` | Personal, non-client |
| `10_Sessions/` | Client session notes |
| `11_Agents/` | Agent role definitions and orchestrator specs. Read `11_Agents/Master Agent.md` for the delegation model. |
| `Daily-Briefs/` | Output folder for skills (am-report, pulse, metrics, etc.) |
| `System/` | OS config, writing rules, memory sync. Read `System/writing-rules.md` before writing any client-facing copy. |
| `_os/` | Local Node HUD (`node _os/server.js` on port 4242). One button per skill. Zero npm dependencies. |
| `_templates/` | Obsidian note templates plus `site-factory/` (the website generator) |
| `.claude/skills/` | All runnable skills. Drop a new folder with `SKILL.md` and the HUD picks it up automatically. |
| `philly-sites/` | 25 finished single-page prospect sites built on one shared template system. The reference library for the site factory. |
| `mohr-media-site/` | Mohr Media agency marketing site (static, Vercel) |
| `immohrtal-site/` | IMMOHRTAL artist site (React 19 + Vite + Tailwind) |
| `handoffs/` | Machine-to-machine handoff docs |

## Skills (the runnable workflows)

All skills are vault-native: they read the vault and write results back, mostly to `Daily-Briefs/`. Invoke as `/skill-name` in Claude Code, via the `_os` HUD, or by following the `SKILL.md` steps in any agent.

| Skill | What it does |
|---|---|
| `am-report` | Morning briefing: priorities, client movement, inbox, content, schedule. Updates `Dashboard.md`. |
| `slack-intake` | Reads boss/client requests from Slack, classifies them, writes task notes into `00_Inbox/slack/`. |
| `inbox-brief` | Triage of `00_Inbox/` (do/delegate/file/delete). Read-only. |
| `plan-today` | Time-blocked day plan synced to `Dashboard.md` (max 5 tasks). |
| `client-pulse` | Classifies clients moving/watch/stalled with due-soon list. |
| `client-report` | Branded HTML performance report via `node _os/reporting/build-report.js`. |
| `content-scan` | Ranks ship-ready content vs gaps vs kill list. |
| `metrics-pull` | Vault vitals snapshot with 7-day deltas. |
| `site-factory` | Generates a complete client/prospect website from a brief, using the Philly-25 template system. |
| `site-batch` | Runs the weekly 25-site outreach batch end to end. |
| `mirror-and-improve` | Harvests a target's site and socials, adopts their lingo, rebuilds it better. |
| `ui-design` | Visual pass: palette from their real brand, type, hierarchy, contrast. |
| `ux-audit` | Audits their current site's friction, designs the conversion flow, accessibility. |
| `motion-design` | Scroll reveals, hover states, signature micro-interaction. |
| `frontend-build` | Implementation standards: semantic markup, page-weight budget, no-JS resilience. |
| `vault-clean` | Vault hygiene. Moves only unambiguous strays, never deletes. |
| `week-review` | Friday/Sunday retrospective. |

## Rules every agent must follow

1. Read `System/writing-rules.md` before producing ANY client-facing copy (emails, blogs, ads, reports). Key ones: no em dashes ever, always contractions, Momentum 360 branding on client email (never Buzz Bull), Align HCM is never under Momentum 360.
2. Client-specific overrides live at the bottom of `System/writing-rules.md` (Bar Crawl USA copy restrictions, Kimberly James Bridal CC list, Fresh Blends uses "Replenish" branding). Check them before touching a client.
3. Vault edits: preserve frontmatter, use `[[wikilinks]]` between notes, keep the numbered-folder structure. New notes should use the matching template from `_templates/`.
4. Never delete vault notes. Move to `00_Inbox/` if unsure where something belongs.
5. Approval tiers (from `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`): read/analyze/draft/build is autonomous (Tier 0). Reversible tweaks batch under one approval (Tier 1). Anything outbound or irreversible (sending email, posting to Slack channels, deploying, spending money) needs explicit human approval (Tier 2).
6. Websites: the shared design system is documented in `philly-sites/DESIGN-SYSTEM.md`, including the canonical batch spec (10 sections, 350 to 500 words, 12 to 13 images) measured across the existing 25 sites. New builds go through `_templates/site-factory/`, not from scratch.
7. The outreach engine (weekly 25-site batches, QR, direct mail) is specified in `02_Campaigns/AI Site Builder Outreach Engine/`. Read `Pipeline Spec.md` for what's automated and who owns each stage before changing that workflow.

## Environment notes

- The `_os` HUD and site-factory generator run on plain Node 18+, no npm install needed.
- `immohrtal-site/` and `01_Clients/Shadow HVAC/website/` need `npm install` before building.
- Cloud agent MCPs currently connected: Slack (read/search/draft) and Exa (web search/fetch). Gmail tools are allowlisted in `.claude/settings.local.json` for Claude desktop only.
- Large media (zips, videos) is gitignored. Don't commit binaries.
