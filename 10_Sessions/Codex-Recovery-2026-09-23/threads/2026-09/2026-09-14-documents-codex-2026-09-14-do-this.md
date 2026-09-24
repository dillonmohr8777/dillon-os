---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-14T19:42:06
session_last: 2026-09-14T19:42:06
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-14\do-this"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-14\do-this

**1 session(s)** · 2026-09-14 19:42 → 2026-09-14 19:42 · 28m agent-time (summed; sessions may overlap) · 5 MB transcript · 6/6 turns completed

## 1. 2026-09-14 19:42 · 28m · 4.9 MB

`01a0a170-e97a-7440-a155-05e84372d453` · turns 6/6

**Asked:**

> Do this

> No, it didn't. Take over and configure it. Give it full access. Didn't even work.

**Outcome reported:**

> Claude’s authorization page is open and ready. The next click grants Claude Design permission to view, create, and modify your Claude Design projects.
> 
> Do you want me to click **Authorize**?

> Done—Claude saved the design credential and confirmed **“Design-system access authorized.”** `/design-sync` can now access your Claude Design projects on this machine.
> 
> No projects were modified or published.

> Configured and verified. My earlier answer stopped at the login confirmation; it didn’t prove the agent could use it.
> 
> I fixed the [design agent configuration](C:/Users/dillo/.claude/agents/design-canvas.md) to include `DesignSync` and removed its outdated instructions saying hosted access was broken.
> 
> A fresh headless run successfully listed **Momentum Design System** and **195 paths: 174 files and 21 directories**, with no permission denials. The saved credential grants both **Design read and write access**.
> 
> Existing sessions need to reload the updated agent configuration. Read access is live-tested; project writes remain subject to DesignSync’s built-in finalized-plan requirement.

> Done. I removed the design agent’s tool allowlist so it inherits all tools available in its parent session. Claude already has broad local permissions, and Design read/write authorization is saved. Disconnected services still need their own login; this cannot grant access to accounts Claude doesn’t have.
> 
> I **sent the prompt to the exact Claude session in your screenshot**, and it’s now working on a ranked creative brief. The earlier “verification only” restriction is explicitly superseded.
> 
> The directions I gave it:
> 
> - **Animated Momentum showcase:** logo choreography, kinetic typography, service transitions, and case-study reveals.
> - **Interactive 3D scene:** explore a venue or service with camera movement and useful hotspots.
> - **Interactive case study:** before/after comparisons with evidence and an engaging walkthrough.
> - **Reusable motion library:** polished animations we can reuse across sites, presentations, and campaigns.
> 
> My creative pick is **animation first, then one focused 3D experience**. Animation gives us reusable material immediately. For 3D, I’d want people exploring a space or understanding a service—not simply watching a rotating logo. Claude is checking the existing assets and turning those ideas into a concrete build brief.

> Fixed—the conversation is running again, and Claude confirms **Remote Control is active**.
> 
> [Open the restored Claude session](https://claude.ai/code/session_01TU8WSatTrqHEZGRR1DY9Af)
> 
> The local terminal hosting that session disappeared; I can’t prove why it exited. I had launched it through a temporary terminal, so I’ve now resumed it under Claude’s background service. Its history is preserved, and it’s continuing the creative brief.
> 
> Claude as a whole didn’t appear to go offline: your other local sessions were running, and [Claude’s status page](https://status.claude.com) reports all systems operational.

> Found and fixed the cause: **the local GPU watchdog was mistakenly killing Claude Code**, treating its `claude.exe` as the desktop app. Its log confirms it killed the restored session. My earlier diagnosis was incomplete.
> 
> I corrected that rule and verified the new session stayed running for over two minutes, past the watchdog’s 90-second targeting window. Remote Control is active, and the creative brief is continuing.
> 
> **[Open the working session here](https://claude.ai/code/session_018GLFWQjo5iSDHeG3VvYkD8)** — the old session in your screenshot will remain offline.

**Files written (4):**

- `C:/Users/dillo/.claude/agents/design-canvas.md`
- `C:/Users/dillo/.codex/tools/Get-ElectronGuiMainProcesses.ps1`
- `C:/Users/dillo/Documents/Codex/2026-09-14/do-this/keep-claude-design.ps1`
- `C:/Users/dillo/Documents/Codex/2026-09-14/do-this/test-claude-gpu-classification.ps1`

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\14\rollout-2026-09-14T15-42-06-01a0a170-e97a-7440-a155-05e84372d453.jsonl`</sub>
