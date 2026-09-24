---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-12T20:50:49
session_last: 2026-07-12T20:50:49
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-12\figure-out-how-to-make-windows"
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-12\figure-out-how-to-make-windows

**1 session(s)** · 2026-07-12 20:50 → 2026-07-12 20:50 · 36m agent-time (summed; sessions may overlap) · 1 MB transcript · 2/2 turns completed

## 1. 2026-07-12 20:50 · 36m · 1.1 MB

`019f5818-c002-7061-bb0a-9c47121252a7` · turns 2/2

**Asked:**

> Figure out how to make Windows Security allow every single install that I want from this point forward.

> I’m tired of approvals for codex. Solve the issue I don’t wanna see them again

**Outcome reported:**

> The blocker is UAC elevation, not Windows Security.
> 
> Current PC state:
> 
> - `dillo` is already a local administrator.
> - Codex runs with a normal, non-elevated token.
> - AppLocker and Smart App Control are not blocking installers.
> - Defender is active; its only recent installer-related action involved `ngrok.zip`.
> 
> To allow unattended installations, set UAC to **Never notify / Elevate without prompting** while leaving Defender enabled. Run this once in **Windows Terminal (Admin)**:
> 
> ```powershell
> reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 0 /f
> ```
> 
> That makes administrator elevation automatic, including for installers launched by Codex. Microsoft warns that it also lets any process elevate silently—not only installations. [Microsoft’s UAC policy documentation](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/user-account-control-behavior-of-the-elevation-prompt-for-administrators-in-admin-approval-mode)
> 
> I would leave these protections enabled:
> 
> - Microsoft Defender real-time protection
> - Tamper Protection
> - SmartScreen
> - `EnableLUA=1`
> 
> Turning those off would permit malicious or tampered installers too. If Defender flags a legitimate installer, allow that individual detection after verifying its publisher rather than excluding `Downloads` or `Temp`.
> 
> To restore normal prompts later:
> 
> ```powershell
> reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 5 /f
> ```
> 
> Smart App Control is currently in evaluation mode and therefore does not block anything. If it later becomes enforced, it can be switched off under **Windows Security → App & browser control → Smart App Control settings**, but Microsoft notes that turning it off is one-way until Windows is reset or reinstalled. [Smart App Control documentation](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/appcontrol)
> 

> Solved globally in [config.toml](C:/Users/dillo/.codex/config.toml:4):
> 
> - Shell approvals: `never`
> - Sandbox: `danger-full-access`
> - Windows sandbox: `elevated`
> - Apps/connectors: approved by default
> - Mandatory destructive reviews: routed to automatic review, not you
> - Open-world and destructive connector tools: enabled
> 
> Verification passed: Codex loaded the configuration with unrestricted filesystem, enabled network, approval policy `Never`, and zero failures. This matches OpenAI’s documented full-access configuration. [Official approval documentation](https://learn.chatgpt.com/docs/agent-approvals-security)
> 
> Restart Codex once so every new thread inherits it. Blue Windows UAC dialogs are separate from Codex and may still appear for system-wide installers.

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-12T16-50-49-019f5818-c002-7061-bb0a-9c47121252a7.jsonl`</sub>
