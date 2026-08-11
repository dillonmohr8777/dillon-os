---
tags: [system, intelligence, registry]
source: "[[12_Brain/raw/research/2026-08-11 - verified skill sources]]"
canonical: 12_Brain
updated: 2026-08-11
expires: 2026-09-11
---

# Project Skill Registry

**Summary:** the project-local skill inventory plus exact-source candidates.
Global/user skills are separate and must be inspected live before any decision.

## Installed in this repository

| Group | Skills | Provenance |
|---|---|---|
| Brain and daily ops | am-report, client-pulse, client-report, content-scan, inbox-brief, metrics-pull, plan-today, research-sweep, session-mine, synthesize, vault-clean, vault-compile, week-review, wiki-lint | project-authored |
| Build and automation lanes | automation-ops, frontend-build, mirror-and-improve, motion-design, site-batch, site-factory, site-grade, slack-intake, ui-design, ux-audit | project-authored |
| Intelligence proposals | model-scout, skill-scout, stack-sync | project-authored; proposal-only |

## Discovery candidates — not vetted, approved, or installed

| Source | Possible fit | Current state |
|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | official skill patterns and document tooling | discovery only |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | official plugin catalog | discovery only |
| [obra/superpowers](https://github.com/obra/superpowers) | planning, TDD, and review discipline | discovery only; overlap review required |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | marketing frameworks | discovery only; substantial overlap expected |
| [AgriciDaniel/claude-ads](https://github.com/AgriciDaniel/claude-ads) | ad-audit workflow ideas | discovery only; account-write and reporting review required |
| [snyk/agent-scan](https://github.com/snyk/agent-scan) | scanner input to manual vetting | discovery only; scanner is not approval |

## Vetting gate

1. Resolve the exact capability gap and installed overlap first.
2. Pin an exact source repository and commit; registries are discovery surfaces.
3. Read every tracked file, script, hook, config, and dependency.
4. Reject obfuscation, unknown network calls, credential/profile reads,
   permission bypasses, hidden instruction injection, or opaque persistent hooks.
5. Test only in a disposable gitignored environment without client credentials.
6. Present the exact install diff, maintenance/context cost, rollback, and
   evidence. Installation needs a separate explicit approval.
7. Re-scan and manually review every update; a prior pass does not bless drift.

## Links

[[12_Brain/System/Intelligence Ops|Intelligence Ops]] · [[12_Brain/System/Model Roster|Model Roster]] · [[12_Brain/System/Upgrade Log|Upgrade Log]]
