---
name: hermes-local-control
description: Take over Dillon's Windows HP 64GB Hermes Agent via local Chrome CDP (/browser connect). Use when Dillon says hermes-local-control, wants monitor/TV-visible browser control, or Composio Enhanced Controls block cloud browser tools.
---

# hermes-local-control

Drive Hermes on Dillon's **Windows HP 64GB** machine against a live Chromium
window (monitor/TV-visible). Cloud Cursor agents **cannot** reach Windows
`127.0.0.1:9222` — this skill orchestrates the **local** attach path.

## When to use

- Dillon says `hermes-local-control` or "take over Hermes"
- Logged-in Ads / GBP / GHL / Slack UI work that needs his cookies
- Composio returns `Tool execution denied by user: BROWSER_TOOL_*`
- He wants to watch the agent on the TV/monitor attached to the 64GB box

## Do not use when

- Pure cloud research with no Windows session (use Composio Browser Tool if allowed)
- Claude Code local with `--chrome` already covering the task
- CDP would be exposed on `0.0.0.0` (forbidden — bind `127.0.0.1` only)

## Operator steps (Windows 64GB — PowerShell)

1. Run the launcher:

```powershell
cd $HOME\dillon-os
powershell -ExecutionPolicy Bypass -File .\_os\tools\hermes-local-control.ps1
```

2. In a **Hermes terminal** (not Web UI / Telegram / Discord):

```text
hermes chat
/browser connect
/browser status
```

3. Start a **new chat session** in Hermes and give the task.

4. Confirm CDP:

```powershell
Invoke-RestMethod http://127.0.0.1:9222/json/version
```

## Agent steps (this skill)

1. Confirm cloud cannot attach — do not pretend CDP is reachable from cloud.
2. Point Dillon at `_os/tools/hermes-local-control.ps1` + `handoffs/hermes-local-control.md`.
3. Prep the exact Hermes prompt / task packet he should paste into the new session.
4. Align with 64GB orchestrator: one tab = one client = one CDP context; disconnect, never close browser.
5. If Composio was the intended path, note Enhanced Controls still apply separately.

## Hermes slash commands

| Command | Effect |
|---------|--------|
| `/browser connect` | Attach to `http://127.0.0.1:9222` (auto-launches if needed) |
| `/browser connect ws://host:port` | Specific CDP endpoint |
| `/browser status` | Connection check |
| `/browser disconnect` | Detach; return to cloud/local agent-browser |

## Hard rules

- Use dedicated `--user-data-dir` (`%USERPROFILE%\.hermes\chrome-debug`) so port 9222 opens when Chrome is already running.
- Never close Dillon's live browser; disconnect CDP only.
- Never expose CDP on `0.0.0.0`.
- `/browser connect` only works in interactive Hermes CLI — not gateway chats.
- Host is **Windows HP 64GB**, not Mac.

## References

- [[12_Brain/protocols/browser-control-routing|browser-control-routing]]
- [[12_Brain/entities/Hermes|Hermes]]
- `handoffs/hermes-local-control.md`
- `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
- Docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/browser
