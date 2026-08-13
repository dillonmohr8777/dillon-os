---
tags: [agents, routines]
updated: 2026-08-12
source: "[[12_Brain/registry/agent-fleet.json]]"
---

# Routine Map

**Summary:** 54 proven routines this fleet owns, compiled from vault skills, GitHub skills, named schedules, the automation registry, and the morning skill-map.

`nightly-client-pulse` is the same work as `/client-pulse` (row 3). `site-factory-batch` is the same work as `/site-batch` (row 14). They are not double-counted.

| # | Routine | Kind | Owner | Path |
|---|---------|------|-------|------|
| 1 | `am-report` | vault-skill | `orchestrator` | `.claude/skills/am-report` |
| 2 | `automation-ops` | vault-skill | `guardrail` | `.claude/skills/automation-ops` |
| 3 | `client-pulse` | vault-skill | `reporting` | `.claude/skills/client-pulse` |
| 4 | `client-report` | vault-skill | `reporting` | `.claude/skills/client-report` |
| 5 | `content-scan` | vault-skill | `seo` | `.claude/skills/content-scan` |
| 6 | `frontend-build` | vault-skill | `web` | `.claude/skills/frontend-build` |
| 7 | `inbox-brief` | vault-skill | `comms` | `.claude/skills/inbox-brief` |
| 8 | `metrics-pull` | vault-skill | `sage` | `.claude/skills/metrics-pull` |
| 9 | `mirror-and-improve` | vault-skill | `web` | `.claude/skills/mirror-and-improve` |
| 10 | `motion-design` | vault-skill | `mira` | `.claude/skills/motion-design` |
| 11 | `plan-today` | vault-skill | `orchestrator` | `.claude/skills/plan-today` |
| 12 | `research-sweep` | vault-skill | `intel` | `.claude/skills/research-sweep` |
| 13 | `session-mine` | vault-skill | `brain` | `.claude/skills/session-mine` |
| 14 | `site-batch` | vault-skill | `web` | `.claude/skills/site-batch` |
| 15 | `site-factory` | vault-skill | `web` | `.claude/skills/site-factory` |
| 16 | `site-grade` | vault-skill | `leo` | `.claude/skills/site-grade` |
| 17 | `slack-intake` | vault-skill | `comms` | `.claude/skills/slack-intake` |
| 18 | `synthesize` | vault-skill | `brain` | `.claude/skills/synthesize` |
| 19 | `ui-design` | vault-skill | `design` | `.claude/skills/ui-design` |
| 20 | `ux-audit` | vault-skill | `calvin` | `.claude/skills/ux-audit` |
| 21 | `vault-clean` | vault-skill | `brain` | `.claude/skills/vault-clean` |
| 22 | `vault-compile` | vault-skill | `brain` | `.claude/skills/vault-compile` |
| 23 | `week-review` | vault-skill | `reporting` | `.claude/skills/week-review` |
| 24 | `wiki-lint` | vault-skill | `brain` | `.claude/skills/wiki-lint` |
| 25 | `dillon-plan-grill` | github-skill | `design` | `.github/skills/dillon-plan-grill` |
| 26 | `dillon-independent-web-checker` | github-skill | `guardrail` | `.github/skills/dillon-independent-web-checker` |
| 27 | `dillon-frontend-maker` | github-skill | `web` | `.github/skills/dillon-frontend-maker` |
| 28 | `gmail-to-vault-digest` | scheduled | `comms` | `System/routine-health.md` |
| 29 | `vault-integrity-sync` | scheduled | `brain` | `System/routine-health.md` |
| 30 | `chat-to-vault-sync` | scheduled | `brain` | `System/routine-health.md` |
| 31 | `bok-law-social-content` | scheduled | `cora` | `01_Clients/Bok Law/content-calendar.md` |
| 32 | `linkedin-growth-engine` | scheduled | `align` | `02_FullTimeJob/AlignHCM/linkedin-calendar.md` |
| 33 | `book-site-seo-sweep` | scheduled | `book` | `05_Book/seo-strategy.md` |
| 34 | `frontmatter-validate` | automation | `brain` | `12_Brain/registry/automations.json` |
| 35 | `frontmatter-repair` | automation | `brain` | `12_Brain/registry/automations.json` |
| 36 | `site-health-sentinel` | automation | `sage` | `12_Brain/registry/automations.json` |
| 37 | `discover-qualify` | automation | `leo` | `12_Brain/registry/automations.json` |
| 38 | `outreach-activate` | automation | `leo` | `12_Brain/registry/automations.json` |
| 39 | `indeed-hiring-adapter` | automation | `leo` | `12_Brain/registry/automations.json` |
| 40 | `grok-intelligence-ingest` | automation | `intel` | `12_Brain/registry/automations.json` |
| 41 | `xai-daily-search` | automation | `intel` | `12_Brain/registry/automations.json` |
| 42 | `experiment-queue` | automation | `intel` | `12_Brain/registry/automations.json` |
| 43 | `dillon-dev-sandbox` | automation | `web` | `12_Brain/registry/automations.json` |
| 44 | `maker-checker` | automation | `guardrail` | `12_Brain/registry/automations.json` |
| 45 | `mcp-acceptance-gate` | automation | `guardrail` | `12_Brain/registry/automations.json` |
| 46 | `context7-docs` | automation | `web` | `12_Brain/registry/automations.json` |
| 47 | `landingfolio-design-reference` | automation | `design` | `12_Brain/registry/automations.json` |
| 48 | `aeo-trust-gate` | automation | `guardrail` | `12_Brain/registry/automations.json` |
| 49 | `campaign-intel` | skills-repo | `ads` | `claude-skills-repo/skills/campaign-intel` |
| 50 | `paid-ads` | skills-repo | `ads` | `claude-skills-repo/skills/paid-ads` |
| 51 | `landing-page-generator` | skills-repo | `calvin` | `claude-skills-repo/skills/landing-page-generator` |
| 52 | `page-cro` | skills-repo | `calvin` | `claude-skills-repo/skills/page-cro` |
| 53 | `deep-research` | skills-repo | `intel` | `claude-skills-repo/skills/deep-research` |
| 54 | `money-run` | codex-port | `orchestrator` | `12_Brain/entities/King Agent OS.md` |

Owner callsigns resolve in [[11_Agents/Fleet Roster|Fleet Roster]].
