---
tags: [sop, claude, github, operations]
category: Admin / Operations
last_updated: 2026-08-19
owner: Dillon
source_refs:
  - "[[12_Brain/04_Decisions/2026-08-18 - Keep dillon-os private]]"
  - "[[12_Brain/01_Captures/2026-08-19 - claude dual machine full access]]"
---

# Claude Dual Machine Access

Give Claude Code full tool access on both operator machines without making
`dillon-os` public.

## Purpose

- Same Claude Code permission mode on every machine that opens this vault.
- Private GitHub clone on every machine, using the logged-in GitHub user.
- No visibility flip. Client evidence stays in a private repo.

## When to Use

- A second Windows box, the Ops Box, or a laptop cannot clone or pull
  `dillon-os`.
- Claude Code on one machine keeps asking for permission on every tool call.
- Someone suggests making the vault public so Claude can "see it."

## What Git already ships

`.claude/settings.json` in this repo sets `permissions.defaultMode` to
`bypassPermissions` and allows the core tools. Any machine that has a current
clone of **private** `dillon-os` gets that mode. Do not copy this file into a
public repo.

## Steps (run on EACH machine)

1. Log GitHub in as `dillonmohr8777`:

   ```powershell
   gh auth login
   gh auth status
   ```

   Choose GitHub.com, HTTPS, and allow Git to use GitHub credentials.

2. Confirm the private vault pulls:

   ```powershell
   git -C C:\Users\dillo\repos\dillon-os pull
   gh repo view dillonmohr8777/dillon-os --json visibility
   ```

   `visibility` must stay `PRIVATE`. If pull fails, the machine is not logged
   into GitHub — fix auth, do not make the repo public.

3. Log Claude Code into Anthropic on that machine (`claude` → login if prompted).

4. Optional, all Claude Code projects on that machine: put this in
   `%USERPROFILE%\.claude\settings.json` (create the folder if missing):

   ```json
   {
     "permissions": {
       "defaultMode": "bypassPermissions"
     }
   }
   ```

5. Open the vault and start Claude:

   ```powershell
   cd C:\Users\dillo\repos\dillon-os
   claude
   ```

## Tools Required

- GitHub CLI (`gh`) already on PATH
- Claude Code CLI (`claude`) already on PATH
- Operator GitHub account `dillonmohr8777`

## Notes / Edge Cases

- Making `dillon-os` public is not an access method. See
  [[12_Brain/04_Decisions/2026-08-18 - Keep dillon-os private]].
- Gmail and Slack MCP allow-rules only fire if that machine already has those
  Claude.ai connectors. They do not install connectors by themselves.
- Never paste tokens, PATs, or recovery codes into chat, Git, or this SOP.
- `bypassPermissions` is for Dillon's own machines on a private vault, not for
  shared or public checkouts.
