# hermes-local-control — take over Hermes on Windows HP 64GB via CDP

Updated: 2026-07-31  
Host: Windows HP 64GB (primary). Bash launcher remains for Linux fallback.

## Goal

Start a **new Hermes session** on the Windows 64GB machine that drives a live
Chrome window over CDP (visible on the attached TV/monitor).

## One-liner (PowerShell on the 64GB box)

```powershell
cd $HOME\dillon-os   # or wherever this vault lives
powershell -ExecutionPolicy Bypass -File .\_os\tools\hermes-local-control.ps1
```

Then:

```powershell
hermes chat
```

Inside Hermes:

```text
/browser connect
/browser status
```

Start a **new chat** and give Hermes the task.

## Why this lane

| Lane | Works from cloud Cursor? | Sees Windows cookies / monitor Chrome? |
|------|--------------------------|----------------------------------------|
| hermes-local-control (CDP) | No — Windows-only | Yes |
| Composio `BROWSER_TOOL` | Yes (if Enhanced Controls allow) | No — separate cloud browser |
| Claude in Chrome | No — local CLI | Yes |

Cloud agents prep the task packet; Hermes on the 64GB machine executes against the live browser.

## Chrome paths (auto-detected)

- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Brave / Edge fallbacks if Chrome missing
- Dedicated profile: `%USERPROFILE%\.hermes\chrome-debug` (required so port 9222 opens)

## Optional permanent CDP config

`%USERPROFILE%\.hermes\config.yaml`:

```yaml
browser:
  cdp_url: http://127.0.0.1:9222
```

## Verify

```powershell
Invoke-RestMethod http://127.0.0.1:9222/json/version
```

## Rules

- Dedicated profile: `~\.hermes\chrome-debug` (required so port 9222 opens)
- CDP bind: `127.0.0.1` only — never `0.0.0.0`
- `/browser connect` only in Hermes **terminal** CLI (not Web UI / Telegram / Discord)
- Disconnect when done; do not close Dillon's browser
- Matches 64GB orchestrator contract: one tab = one client = one CDP context

## Skill

`.claude/skills/hermes-local-control/SKILL.md`

## Related

- `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
- `12_Brain/protocols/browser-control-routing.md`
- `handoffs/composio-hermes-browser-control-2026-07-31.md` (cloud lane)
- Bash fallback: `_os/tools/hermes-local-control.sh` (Linux)
