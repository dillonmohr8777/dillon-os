# Grok repository and skill access map

Status: redacted discovery and routing map
Prepared: 2026-08-11 18:08 ET
Owner: Dillon Mohr
Primary orchestrator: Codex acting as Marketing Chief

## Current inventory

The live project index was refreshed on 2026-08-11 at 18:08 ET.

- Codex workspaces discovered: 603
- Local Git repositories discovered: 228
- GitHub repositories visible to the authenticated `dillonmohr8777` account: 33
- Installed skill files discovered: 1,428

This map grants Grok task-scoped discovery and read context across the listed
repositories. It does not grant autonomous write, push, merge, deploy, publish,
permission, billing, or destructive authority.

## Access policy

- Broad repository **read** access is approved for Grok Research Scout when the
  exact task route is known.
- Start from names and metadata. Read only the files needed for the task.
- Treat repository availability as discovery, not permission to mix clients or
  ingest everything.
- Read the nearest `AGENTS.md` before repository work.
- Inspect current branch, status, remote, and source freshness before relying on
  a checkout.
- Prefer canonical repositories over dated clones, exports, generated mirrors,
  and historical worktrees.
- Never retrieve or expose `.env` values, credentials, tokens, cookies, signing
  material, card data, MFA/recovery codes, or raw private communications.
- GitHub write/admin scopes are not approved for Grok. If a connector cannot be
  limited to read-only behavior, use it only for read operations under the
  bounded worker contract and do not authorize new write/admin permissions.
- Repository modifications, commits, pushes, pull requests, merges, releases,
  Actions changes, branch protection changes, and secret changes require exact
  current authority and Codex verification.

## Verified GitHub runtime route

Updated 2026-08-11 after live canaries in Grok Bot 0.16.0:

- The marketplace GitHub plugin is installed, but this Grok Bot build did not
  forward its saved PAT to the active remote MCP session. Its calls behaved as
  anonymous and must not be treated as authenticated until a future canary
  proves private-repository access.
- Use the local computer's existing authenticated `gh` session for GitHub read
  work. Restrict it to `gh auth status`, `gh api` GET requests, and read-only
  `list` or `view` commands for repositories, pull requests, issues, and runs.
- Never use `gh api` with POST, PUT, PATCH, or DELETE. Never use create, edit,
  close, comment, merge, approve, run, rerun, cancel, delete, secret, variable,
  release, gist, or repository-setting commands without explicit approval for
  that exact action.
- Live proof: authenticated login `dillonmohr8777`; 32 user-owned repositories
  visible, split 22 public and 10 private; private reads succeeded for
  `dillonmohr8777/client-operations-canonical` and
  `vaclaims-dev/vace-platform`. The latter is organization-owned and is outside
  the 32 user-owned count.
- The credential itself was independently validated against both GitHub's API
  and official remote MCP endpoint. Never print or transmit its value.

## Canonical local roots

Prefer these current roots before dated workspaces:

- `C:\Users\dillo\Documents\Codex\projects\agent-vault`
- `C:\Users\dillo\Documents\Codex\projects\client-operations`
- `C:\Users\dillo\Documents\Codex\projects\dillon-operations`
- `C:\Users\dillo\Documents\Codex\projects\dillon-os`
- `C:\Users\dillo\Documents\Codex\projects\hermes-control`
- `C:\Users\dillo\repos\dillon-os` — active Obsidian vault
- `C:\Users\dillo\repos\ironic-ineptocracy-site`
- `C:\Users\dillo\repos\coinbase-derivatives-paper-platform`
- `C:\Users\dillo\repos\vace-platform`
- `C:\Users\dillo\repos\ponytail`

Client-specific canonical repositories must first be resolved through
`client-operations/registry/clients.json`. Examples currently indexed include:

- Align HCM lead intelligence under the Align HCM client route;
- Shadow Heating & Cooling website under its client route; and
- VA Claims Edge platform under its client route.

Do not infer that similarly named clones, worktrees, or exports are canonical.

## GitHub inventory

The authenticated account currently sees these 33 repositories:

1. `dillonmohr8777/agentic-inbox` — public — default `main`
2. `dillonmohr8777/alignhcm-ai-marketing-skills` — private — default `main`
3. `dillonmohr8777/align-hcm-august-2026-content` — private — default `main`
4. `dillonmohr8777/align-hcm-lead-intelligence` — private — default `main`
5. `dillonmohr8777/align-hcm-maher-brent-chatcut` — public — default `main`
6. `dillonmohr8777/align-hcm-public-content` — public — default `main`
7. `dillonmohr8777/bigorange-marketing-homepage` — public — default `main`
8. `dillonmohr8777/bridge-discovery-prototype` — public — default `main`
9. `dillonmohr8777/bridge-discovery-prototype-kimi-design` — public — default
   `main`
10. `dillonmohr8777/camofox-browser` — public — default `master`
11. `dillonmohr8777/claude-ads` — public — default `main`
12. `dillonmohr8777/claude-skills-repo` — public — default `main`
13. `dillonmohr8777/client-operations-canonical` — private — default `main`
14. `dillonmohr8777/coinbase-derivatives-paper-platform` — private — default
    `main`
15. `dillonmohr8777/dillon-os` — public — default `main`
16. `dillonmohr8777/Google-Flash` — public — default `main`
17. `dillonmohr8777/hyperframes` — public — default `main`
18. `dillonmohr8777/immohrtal-kimi-redesign` — public — default `main`
19. `dillonmohr8777/immohrtal-website` — public — default `main`
20. `dillonmohr8777/ironic-ineptocracy-site` — public — default `main`
21. `dillonmohr8777/jason-fallon-hubspot-agent` — public — default `main`
22. `dillonmohr8777/mohr-vault` — public — default `main`
23. `dillonmohr8777/nkcdc-phase-two-growth-proposal` — public — default `main`
24. `dillonmohr8777/nkcdc-phase-two-redesign` — private — default `main`
25. `dillonmohr8777/nt-main-2-social-ad` — private — default `main`
26. `dillonmohr8777/Open-Generative-AI` — public — default `main`
27. `dillonmohr8777/Open-LLM-VTuber` — public — default `main`
28. `dillonmohr8777/philadelphia-prospect-sites` — private — default `main`
29. `dillonmohr8777/pro-fence-deck-claude-handoff` — private — default `main`
30. `dillonmohr8777/semrush-proxy` — public — default `main`
31. `dillonmohr8777/shadow-heating-website` — private — default `main`
32. `dillonmohr8777/workflow-voiceover-claude-edit` — public — default `main`
33. `vaclaims-dev/vace-platform` — private — default `main`

Visibility and default-branch metadata are discovery hints, not proof of the
current working branch or deploy target. Verify live before acting.

## Skill system

The complete local skill registry is discoverable from:

- `C:\Users\dillo\.codex\project-index.json`
- `C:\Users\dillo\.codex\skills`
- `C:\Users\dillo\.agents\skills`
- project-local `.agents\skills` directories

Use the following protocol:

1. Search the registry by the user's task language.
2. Select the minimal skill set that fully covers the task.
3. Read every selected `SKILL.md` from start to finish.
4. Follow its routing to only the needed references.
5. Reuse its scripts, templates, and assets.
6. Obey the exact project `AGENTS.md` and Dillon's current instruction.
7. State which skill materially shaped the artifact.

Common skill families currently installed include:

- frontend and design: `impeccable`, `a11y-audit`, `apple-hig-expert`,
  `image-to-code-skill`, `animation-quality-gate`;
- engineering: `code-reviewer`, `api-design-reviewer`,
  `api-test-suite-builder`, `dependency-auditor`, `coverage`,
  `git-worktree-manager`, `monorepo-navigator`;
- automation and agents: `agent-workflow-designer`, `agents-best-practices`,
  `agenthub`, `autoresearch-agent`, `browser-automation`, `ai-security`,
  `env-secrets-manager`;
- marketing and growth: `cmo-advisor`, `campaign-analytics`, `campaign-intel`,
  `ads`, `ad-creative`, `ab-testing`, `attribution`, `cro`, `marketing-ops`;
- content and discovery: `content-strategy`, `content-production`,
  `copywriting`, `ai-seo`, `competitive-intel`, `customer-research`;
- client and executive operations: `chief-of-staff`, `coo-advisor`,
  `company-os`, `decision-logger`, `customer-success-manager`,
  `revenue-operations`;
- communications: `email-ops`, `emails`, `email-template-builder`,
  `google-workspace-ops`;
- data and reporting: `analytics`, `analytics-tracking`, `financial-analyst`,
  `data-quality-auditor`; and
- creative production: `image`, `imagegen-frontend-web`,
  `imagegen-frontend-mobile`, `heygen-video`, `chatcut` skill packages.

Do not assume a skill is current because its folder exists. Confirm the selected
`SKILL.md`, version, and project-precedence path at use time.

## Task-scoped access request format

Before opening repository content, state:

```text
Task:
Exact client/project:
Repository and branch:
Files or surfaces needed:
Selected skills:
Read-only or proposed write:
Source freshness:
Forbidden actions:
Expected artifact:
Verification plan:
```

If any exact route is ambiguous, stop at discovery and return the ambiguity to
Marketing Chief. Never solve ambiguity by blending sources.

## Source locators

- `C:\Users\dillo\.codex\project-index.json`
- `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json`
- `C:\Users\dillo\Documents\Codex\projects\agent-vault\AGENTS.md`
- `C:\Users\dillo\Documents\Codex\projects\client-operations\AGENTS.md`
- `C:\Users\dillo\Documents\Codex\.agents\skills\impeccable\SKILL.md`
