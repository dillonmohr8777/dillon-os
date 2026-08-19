---
tags: [artifact, github, visibility]
created: 2026-08-19
updated: 2026-08-19
status: verified-read
source: gh repo list dillonmohr8777
---

# GitHub visibility inventory — 2026-08-19

Read-only `gh repo list dillonmohr8777 --limit 200` against the connected
account. Org listing returned 403 from this integration, so org repos are
unknown here.

| Count | Visibility |
|------:|------------|
| 22 | repos visible to this token |
| 21 | public |
| 1 | private (`dillon-os`) |

The operator mentioned 34 repos. This token sees 22. The gap is unverified
(other account, org, or archived/inaccessible).

## Private (hold)

- `dillon-os` — operating vault. Stays private. See
  [[12_Brain/04_Decisions/2026-08-18 - Keep dillon-os private]].

## Already public

- `bridge-discovery-prototype`
- `claude-skills-repo`
- `bridge-discovery-prototype-kimi-design`
- `mohr-vault`
- `ironic-ineptocracy-site`
- `workflow-voiceover-claude-edit`
- `align-hcm-public-content`
- `jason-fallon-hubspot-agent`
- `immohrtal-kimi-redesign`
- `immohrtal-website`
- `bigorange-marketing-homepage`
- `nkcdc-phase-two-growth-proposal`
- `align-hcm-maher-brent-chatcut`
- `claude-ads`
- `Open-Generative-AI`
- `agentic-inbox`
- `hyperframes`
- `Google-Flash`
- `Open-LLM-VTuber`
- `camofox-browser`
- `semrush-proxy`

## What was not done

No visibility writes. GitHub MCP has no update-visibility tool in this
environment. `gh` is read-only. `dillon-os` was not made public.
