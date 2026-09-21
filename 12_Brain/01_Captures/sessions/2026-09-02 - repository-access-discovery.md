---
note_type: capture
status: compiled
created: 2026-09-02
updated: 2026-09-02
observed_at: "2026-09-03T01:25:00.000Z"
source_type: session
verification_status: verified
source_refs:
  - "https://claude.ai/code/session_01UBuynVuUrhJmfCMcP4Tq4G"
  - "[[12_Brain/09_Ops/Repository Access Map]]"
tags:
  - brain
  - capture
  - session
  - repositories
  - github
  - access
---

# Session: repository access discovery from a remote Claude Code session

Task: apply the "repository access and canonical project discovery" contract
(the PowerShell checklist written for the Windows box) inside a Claude Code
remote container, and record what a remote session can actually reach.

## Facts learned

- GitHub identity verified as `dillonmohr8777` through the GitHub MCP; 48
  user-owned repositories are visible (22 private, 26 public, 6 forks). The
  2026-08-11 Grok map counted 33.
- Ten repositories are cloned into a remote session, all at the default-branch
  tip, clean, no stashes, no worktrees, no tags. Three are shallow clones.
- The designated task branch appears locally as `origin/<branch>` before it
  exists on GitHub. `git ls-remote --heads` is the only honest check.
- The canonical registry and queue are readable at
  `client-operations-canonical/registry/clients.json` and
  `queue/work-items.json` (revision 423). The writer policy forbids worker
  writes, so a remote session reads and never mutates them.
- The 2026-09-02 morning brief committed "canonical queue unavailable" and
  dropped from 118 dated packages plus 17 queue items to 1 candidate because
  `predict-work.js` looked only at the Windows path; the env override
  `DILLON_CLIENT_OPERATIONS_ROOT` already exists and was not set.
- Open PRs: 123 on dillon-os, 50 on client-operations-canonical, 19 on
  claude-skills-repo, 7 across the other seven repositories.
- Three repositories changed from private to public between 2026-08-11 and
  2026-09-02: shadow-heating-website, coinbase-derivatives-paper-platform,
  nt-main-2-social-ad.

## Patterns confirmed

- `git -C <repo> ls-remote --heads origin` works through the session proxy for
  all ten repositories, so remote branch inventories do not need `gh`.
- A GitHub PR search stays inside the session scope when the query lists the
  ten `repo:` qualifiers explicitly; `total_count` gives an open-PR count
  without paging.
- `node --test _os/test/public-safety.test.js` runs in the container and is
  the substitute for `Test-SecondBrain.ps1`, which needs PowerShell.

## Mistakes and blocks

- No PowerShell, no `gh`, no `project-index.json`, no `terminal-bootstrap.ps1`
  in the container. Every step of the Windows checklist needed a Linux or MCP
  equivalent; the equivalents are now in the Repository Access Map.
- `vaclaims-dev/vace-platform` is not in the session repository listing, so
  organization-owned repositories cannot be confirmed from here.

## Outputs

- [[12_Brain/09_Ops/Repository Access Map]] (new ops note).
- `dillon-claude-config/CLAUDE.md` gained a remote-session path map.
- INDEX.md links the new map.
