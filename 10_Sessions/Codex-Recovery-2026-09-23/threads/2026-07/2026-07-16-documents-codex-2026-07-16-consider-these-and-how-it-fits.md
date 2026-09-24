---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-16T05:48:16
session_last: 2026-07-16T05:48:16
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-16\consider-these-and-how-it-fits"
open_flags: [blocked]
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-16\consider-these-and-how-it-fits

**1 session(s)** · 2026-07-16 05:48 → 2026-07-16 05:48 · 2m agent-time (summed; sessions may overlap) · 2 MB transcript · 1/1 turns completed

> **Open flags:** `blocked`

## 1. 2026-07-16 05:48 · 2m · 1.6 MB

`019f6977-de7f-7cb0-9f12-fcb9ced2c9fd` · turns 1/1 · flags: blocked

**Asked:**

> <recommended_plugins>
> Here is a list of plugins that are available but not installed. If the user's query would benefit from one of these plugins, use the `request_plugin_install` tool to suggest that they install it. Pass the parenthesized ID as `plugin_id`. For example, suggest the Google Drive plugin if the query could possibly be better answered with access to Google Drive.
> 
> - Atlassian Rovo (atlassian-rovo@openai-curated-remote)
> - Box (box@openai-curated-remote)
> - Notion (notion@openai-curated-remote)
> - Outlook Calendar (outlook-calendar@openai-curated-remote)
> - Outlook Email (outlook-email@openai-curated-remote)
> - SharePoint (sharepoint@openai-curated-remote)
> - Teams (teams@openai-curated-remote)
> </recommended_plugins>
> # AGENTS.md instructions
> 
> <INSTRUCTIONS>
> # Dillon's Global Codex Rules
> 
> These instructions apply across every project unless Dillon gives a more specific instruction

**Outcome reported:**

> These screenshots describe the right philosophy, but their proposed implementation is an earlier, Linux-flavored version of the operating system we have already been building.
> 
> The best fit is:
> 
> > The terminal is the control plane. Codex handles orchestration and execution. Chrome, HubSpot, Google Ads, Canva, and similar interfaces remain the review, authorization, and publishing planes.
> 
> ### What we already have
> 
> | Screenshot concept | Current implementation |
> |---|---|
> | `daily-start` | PowerShell profiles automatically load `terminal-bootstrap.ps1`; no ritual command is required |
> | Find repositories and unfinished work | Persistent `project-index.json` with `Update-CodexProjectIndex`, `Find-CodexProject`, and `Show-CodexProjects` |
> | `client-start "BOK Law"` | Canonical `clients.json` plus `Resolve-Client.ps1`, including alias resolution and ambiguity blocking |
> | Load relevant skills | Installed skills remain under `.codex`; Codex selects them according to the request |
> | Central client memory | Separate, safer layers: global rules, Codex memory, client `CLIENT.md` files, Access Broker, and project state |
> | Daily priorities and approvals | The Marketing OS [CONTROL.md](C:/Users/dillo/Documents/Codex/projects/client-operations/CONTROL.md) and `queue/work-items.json` |
> | GitHub inspection | GitHub CLI and persistent authenticated project discovery |
> | Reusable marketing automation | Client-specific scripts and artifacts already exist, especially for Align HCM and reporting workflows |
> 
> The current client system is materially stronger than searching one large `00_Memory_File.md`: it has 18 routed client records, stable folders, alias handling, status gates, queue state, approval boundaries, and client separation.
> 
> ### What should be added
> 
> Three friendly PowerShell commands would make the existing system feel as simple as the screenshots:
> 
> - `Start-CodexDay`  
>   Refreshes safe inventories, displays priorities, reports dirty repositories, shows access health, and identifies blocked or approval-dependent work.
> 
> - `Start-ClientWork "BOK Law" -Task copywriting`  
>   Resolves the client, verifies status, locates its canonical folder and project, identifies relevant skills, checks current worktree state, and prints a bounded session brief.
> 
> - `Complete-CodexDay`  
>   Reports changed files, dirty repositories, test/build results, unfinished work, approval items, and reviewable artifacts. It should never commit, push, send, or publish automatically.
> 
> After those, task-specific commands such as `New-ClientContent`, `New-ClientReport`, and `Test-CampaignPackage` 

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-16T01-48-16-019f6977-de7f-7cb0-9f12-fcb9ced2c9fd.jsonl`</sub>
