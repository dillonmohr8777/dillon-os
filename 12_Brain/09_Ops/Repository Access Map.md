---
note_type: ops
status: active
created: 2026-09-02
updated: 2026-09-02
owner: Dillon Mohr
verification_status: verified
review_on: 2026-10-02
source_refs:
  - "[[12_Brain/01_Captures/sessions/2026-09-02 - repository-access-discovery]]"
  - "[[12_Brain/09_Ops/Connector Map]]"
  - "[[11_Agents/Rockbot Operating System/recorded-training/2026-08-11-grok-repository-and-skill-access-map]]"
  - "client-operations-canonical/REMOTE_WORKSPACE.md"
  - "client-operations-canonical/queue/work-items.json (revision 423)"
  - "client-operations-canonical/registry/clients.json (generatedAt 2026-08-07)"
tags:
  - brain
  - ops
  - repositories
  - github
  - access
---

# Repository Access Map

**Summary:** the authenticated GitHub identity `dillonmohr8777` sees 48
repositories; a Claude Code remote session clones 10 of them, and those 10 are
the canonical ones. Every `CLAUDE.md` still routes by Windows paths and
PowerShell scripts that do not exist in the remote container, which is why the
2026-09-02 morning brief ran with "canonical queue unavailable" even though the
queue was one directory away.

Live-checked 2026-09-02 (evening ET) from a Claude Code remote session with the
GitHub MCP `get_me`, the session's `list_repos`, and `git ls-remote` against
every clone. Counts are point-in-time; re-run the protocol in section 5 before
relying on them.

## 1. Identity

| Check | Result |
|---|---|
| GitHub login | `dillonmohr8777` (verified with GitHub MCP `get_me`) |
| Repositories visible to the session listing | 48 user-owned: 22 private, 26 public, 6 of the public ones are forks |
| Repositories cloned into a remote session | 10 (the scope list below); anything else needs `add_repo` |
| Not in the listing | `vaclaims-dev/vace-platform` (organization-owned; verify separately) |
| Local tooling in the container | Node 22, Python 3.11, git over the HTTPS proxy. No `gh`, no PowerShell, no `agent-memory` MCP |

**Two GitHub MCP servers can be connected at once, and `get_me` does not tell
them apart.** On 2026-09-02 both returned login `dillonmohr8777`, but only one
carried private-repository scope. The other read a public repository normally
and answered `404 Not Found` for every private one, which reads as "this
repository does not exist" rather than "this token cannot see it". Prove scope
with an actual private read before believing a 404: the session's own
repository-scoped server is the one that works; the account-level connector is
the one that does not.

## 2. Canonical roots, machine by machine

Windows paths are written with `%USERPROFILE%`; remote paths are relative to
the session working directory (`/home/user` in this session).

| Authority | Windows box | Remote container | GitHub | Default branch | Who may write |
|---|---|---|---|---|---|
| Live vault and brain | `%USERPROFILE%\repos\dillon-os` | `~/dillon-os` | `dillon-os` (private) | `main` | any session, by topic branch and PR |
| Canonical client registry and queue | `%USERPROFILE%\Documents\Codex\projects\client-operations` | `~/client-operations-canonical` | `client-operations-canonical` (private) | `main` | Marketing Chief on the two Windows hosts only; workers read |
| Shared agent-vault projection | `%USERPROFILE%\Documents\Codex\projects\agent-vault` | `~/agent-vault` | `agent-vault` (private) | `main` | generated read layer; sync scripts are PowerShell |
| Claude Code user config | `%USERPROFILE%\.claude` | `~/dillon-claude-config` | `dillon-claude-config` (private) | `main` | any session, by PR |
| Claude skills catalog | local skills roots | `~/claude-skills-repo` | `claude-skills-repo` (public) | `main` | any session, by PR |
| Bridge live frontend | client route via registry | `~/bridge-software-frontend` | `bridge-software-frontend` (public) | `production`; integrate from `development` | PR to `development` |
| Bridge discovery prototype | client route via registry | `~/bridge-discovery-prototype` | `bridge-discovery-prototype` (public) | `main` | PR |
| Align HCM public content | client route via registry | `~/align-hcm-public-content` | `align-hcm-public-content` (public) | `main` | PR |
| Align HCM lead intelligence | client route via registry; also a submodule of client-operations at `clients/align-hcm/github/` | `~/align-hcm-lead-intelligence` | `align-hcm-lead-intelligence` (private) | `main` | PR |
| Jason Fallon HubSpot agent | client route via registry | `~/jason-fallon-hubspot-agent` | `jason-fallon-hubspot-agent` (public) | `main` | PR; read-only against portal 50612503 |
| Codex memory bank | `%USERPROFILE%\.codex\memories` | not cloned | `codex-memories` (private) | `main` | attach with `add_repo` when prior-run detail is needed |
| Project index and bootstrap | `%USERPROFILE%\.codex\project-index.json`, `terminal-bootstrap.ps1` | absent | none | n/a | Windows-only discovery aids |

Client work still resolves through `registry/clients.json` first (24 clients,
23 active, `zen-spa-tropicana` inactive). Client truth in this vault stays in
[[01_Clients/Client Index|01_Clients]].

## 3. The other 38 GitHub repositories

Discovery hints only; none is in the remote session scope until attached.

- **Operating estate:** `codex-memories`, `dillon-operations`, `hermes-control`,
  `codex-router`, `mohr-vault` (public), `kimi-mcp-design-agent`, `rockbot`
  (public), `alignhcm-ai-marketing-skills`.
- **Prospect and site factories:** `philadelphia-prospect-sites`,
  `prospect-radar-live12-20260815`, `tell-kimi-to-find-those-25`,
  `make-kimmy-build-25-more-philadelphia`, `bigorange-marketing-homepage`
  (public), `nkcdc-phase-two-redesign`, `nkcdc-phase-two-growth-proposal`
  (public), `shadow-heating-website` (public), `pro-fence-deck-claude-handoff`,
  `nt-main-2-social-ad` (public).
- **Align HCM:** `align-hcm-august-2026-content`, `align-hcm-maher-brent-chatcut`
  (public).
- **Bridge:** `bridge-discovery-prototype-kimi-design` (public).
- **Personal ventures:** `immohrtal-website`, `immohrtal-kimi-redesign`,
  `ironic-ineptocracy-site`, `workflow-voiceover-claude-edit`,
  `coinbase-derivatives-paper-platform` (public), `coinbase-execution-gateway`,
  `crypto-intelligence-core`, `grand-theft-bureaucracy`,
  `find-the-plant-app-i-built`, `Google-Flash` (public), `semrush-proxy`
  (public).
- **Forks:** `claude-ads`, `Open-Generative-AI`, `agentic-inbox`, `hyperframes`,
  `Open-LLM-VTuber`, `camofox-browser`.

Drift since the 2026-08-11 Grok map (33 repositories then): 16 repositories
are new, 13 of them pushed in one batch on 2026-09-02 between 03:40Z and 04:05Z
(backup pushes of local work such as agent-vault's "Backup snapshot
2026-09-01"). `dillon-os` went private on 2026-08-18 as planned.
`shadow-heating-website`, `coinbase-derivatives-paper-platform`, and
`nt-main-2-social-ad` were private on 2026-08-11 and are public now; confirm
that was deliberate.

## 4. State snapshot, 2026-09-02

All ten remote clones were clean, at the default-branch tip, with no stashes,
no extra worktrees, and no tags. `dillon-os`, `client-operations-canonical`,
and `bridge-software-frontend` are shallow clones; history searches there need
`git fetch --unshallow` first.

| Repository | Tip | Remote branches | Open PRs | Notes |
|---|---|---|---|---|
| dillon-os | `1a3436a` radar sweep 2026-09-02 | 431 (216 `claude/`, 179 `cursor/`, 23 `codex/`, 4 `agent/`, 2 `rescue/`, 2 `feature/`, 5 bare) | 123 | a `cursor[bot]` draft titled "competitive task consolidation" or "umbrella orchestrator" opens almost daily (#333 to #355) and none merge |
| client-operations-canonical | `9776fe0` Creative Factory MCP (#55) | 59 | 50 | many `cursor/` PRs are stacked on other `cursor/` branches rather than `main` |
| claude-skills-repo | `eafcd8e` 2026-08-13 | 30 | 19 | oldest open PR is from 2026-04-26 |
| dillon-claude-config | `7a45db1` 2026-08-18 | 3 | 1 | PR #1 documents the seven agents |
| bridge-software-frontend | `6d7aed6` merge of `development` (#9) | 7 | 2 | PR #13 `feature/admin-login` is from the external account `clickthedemo`; verify who that is before merging |
| bridge-discovery-prototype | `a951723` unified deploy (#5) | 6 | 2 | |
| align-hcm-public-content | `bbd6d4c` 2026-07-24 | 2 | 1 | |
| align-hcm-lead-intelligence | `d4becf6` 2026-08-15 | 4 | 1 | client-operations pins the submodule at `663d4be` (2026-07-17), five commits behind; the remote clone leaves it uninitialized |
| agent-vault | `03377cd` backup snapshot 2026-09-01 | 1 | 0 | README still says no GitHub remote is configured |
| jason-fallon-hubspot-agent | `80b7c20` 2026-08-28 | 1 | 0 | |

Canonical queue at the same moment: revision 423, updated 2026-09-01T17:32Z by
`marketing-chief`, mode `manual-pilot`, 108 work items (69 done, 23 cancelled,
10 blocked, 3 needs_approval, 2 deferred, 1 verification). Writer policy:
`canonicalWriter: marketing-chief`, `workerCanonicalWritesAllowed: false`,
`staleWritePolicy: reject`. The registry file was generated 2026-08-07, three
and a half weeks before the queue's last write.

## 5. Discovery protocol for a remote session

The Linux equivalent of the PowerShell checklist. Run it before declaring a
repository unavailable.

1. Identity **and scope**: `get_me` must return `dillonmohr8777`, then read a
   known private repository (its branches or a pull request) to prove that
   server has private scope. A 404 on a private repository from a server whose
   `get_me` looks correct means the wrong server, not a missing repository.
2. Inventory: the session's `list_repos`; attach anything missing with
   `add_repo` rather than reporting it unreachable.
3. Local clones: `ls ~`; then per repo `git remote -v`, `git branch -vv`,
   `git worktree list --porcelain`, `git stash list`, and
   `git ls-remote --heads origin`. The harness pre-creates local
   `origin/<task-branch>` refs that do not exist on GitHub until pushed, so
   trust `ls-remote`, not `branch -r`.
4. Canonical state: read `~/client-operations-canonical/registry/clients.json`
   and `queue/work-items.json`; note the revision; never edit them or
   `CONTROL.md` from a remote session.
5. Automation that reads client-operations takes two different environment
   variables, both verified from this container on 2026-09-02:

   | Automation | Variable | Shape |
   |---|---|---|
   | `bin/predict-work.js` | `DILLON_CLIENT_OPERATIONS_ROOT` | one path (or pass `--client-ops-root`) |
   | `bin/report-ingest.js` (`lib/reports.js`) | `DILLON_REPORT_SOURCE_ROOTS` | `;`-separated list that **replaces** the defaults, so re-list the vault's own `Daily-Briefs/reports` alongside the clone |

   ```bash
   export DILLON_CLIENT_OPERATIONS_ROOT=~/client-operations-canonical
   export DILLON_REPORT_SOURCE_ROOTS="$HOME/client-operations-canonical/clients;$HOME/dillon-os/Daily-Briefs/reports"
   ```

   Measured: `predict-work.js` without the first variable produced 1 candidate
   and a null `sources.canonical_queue_source`, reproducing the degraded
   2026-09-02 brief exactly; with it, 7 candidates and
   `client-operations://queue/work-items.json`. Neither variable is set by the
   remote morning-brief routine today.

   The failure is silent by construction: on Linux `path.resolve()` turns the
   Windows default `C:/Users/...` into a nonexistent path *under the vault*
   rather than raising, so the root is skipped with no error.
6. Pull requests: `list_pull_requests` per repository. A cross-repository
   search must carry `repo:` qualifiers for the session scope only.
7. Ship: `git push -u origin <task-branch>`, then a draft PR. Record the branch,
   base, commits, and PR in the client or project note the same session.
8. Checks that replace the PowerShell test scripts remotely:
   `node --test _os/test/public-safety.test.js` and a wikilink resolution pass
   on any note touched. `Test-SecondBrain.ps1`, `Sync-AgentVault.ps1`, and
   `Test-AgentVault.ps1` cannot run without PowerShell; report them as
   degraded, not skipped.

## 6. Follow-ups (report, not fixed here)

- The remote morning-brief routine sets neither client-operations environment
  variable (section 5), so it silently degrades. This needs a routine config
  change, **not** a code change: both automations already support an override,
  and no vault code should be patched for it.
- 199 open PRs across the ten repositories, most of them drafts. The daily
  `cursor[bot]` umbrella-orchestrator drafts on `dillon-os` need a keep-one,
  close-the-rest decision.
- Registry projection (2026-08-07) lags the queue (2026-09-01); the roster in
  [[System/operating-status]] names Capsule & Tonic and Everyday Life
  Insurance, which the registry does not carry.
- `agent-vault/README.md` claims no GitHub remote; the private remote exists.
- Three repositories flipped private to public since 2026-08-11 (section 3).
- The `align-hcm-lead-intelligence` submodule pin in client-operations is
  stale (section 4).
