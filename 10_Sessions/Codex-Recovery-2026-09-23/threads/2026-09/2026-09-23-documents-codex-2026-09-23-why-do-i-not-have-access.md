---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-23T15:40:56
session_last: 2026-09-23T15:40:56
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-23\why-do-i-not-have-access"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-23\why-do-i-not-have-access

**1 session(s)** · 2026-09-23 15:40 → 2026-09-23 15:40 · 7m agent-time (summed; sessions may overlap) · 6 MB transcript · 1/2 turns completed

## 1. 2026-09-23 15:40 · 7m · 6.4 MB

`01a0ceeb-e4f5-7b81-b9f0-c7ad5b46be3c` · turns 1/2

**Asked:**

> Why do I not have access to GPT-6 Sol and GPT-6 Luna? Can you use the OpenRouter key to bring them in here? I know they're on the GPT Work and then the chat, but they don't seem to be inside the coding model.

**Outcome reported:**

> Active Desktop is still running the stale embedded CLI:
> 
> - Desktop app: `C:\Program Files\WindowsApps\OpenAI.Codex_26.915.4065.0_x64__2p2nqsd0c76g0\app\ChatGPT.exe`
> - Active app-server PID 7200: `C:\Users\dillo\AppData\Local\OpenAI\Codex\bin\247581e40ee272fb\codex.exe`
> - Active version: `codex-cli 0.155.0-alpha.9.2`
> - Current installed per-user CLI: `C:\Users\dillo\AppData\Local\Programs\OpenAI\Codex\bin\codex.exe`
> - Current installed version: `codex-cli 0.156.1`
> 
> The router is running on `127.0.0.1:4202`, but its catalogs last refreshed on September 19 and contain GPT-5.6 Sol/Luna plus GPT-6 Astra/Astra Pro. There are no `gpt-6-sol` or `gpt-6-luna` entries in the native, merged, picker, announced, or OpenRouter provider catalogs. The OpenRouter environment variable exists; its value was not read or tested.
> 
> Safest remediation commands, after preserving active work and fully quitting Desktop:
> 
> ```powershell
> $codex = 'C:\Users\dillo\AppData\Local\Programs\OpenAI\Codex\bin\codex.exe'
> & $codex update
> & $codex --version
> ```
> 
> Then relaunch Desktop and verify that its app-server executable is no longer the `247581e40ee272fb` alpha path. Updating the client can expose models supported by the newer catalog, but it cannot create GPT-6 Sol/Luna entries that the current OpenRouter catalog does not advertise.

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\23\rollout-2026-09-23T11-40-56-01a0ceed-5b21-7923-8b63-d87868daf41f.jsonl`</sub>
