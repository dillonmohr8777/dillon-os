# ChatGPT Codex desktop unlock — this Linux box

Updated: 2026-07-28  
Host: Cursor cloud VNC desktop (Ubuntu 24.04 / XFCE)

## What was broken

- ChatGPT / Codex desktop was not installed on this machine.
- Codex CLI was missing.
- Default sandbox would have been restricted once installed.

## What was fixed

1. Installed official Codex CLI `0.145.0` via `https://chatgpt.com/codex/install.sh`.
2. Installed Linux ChatGPT/Codex desktop `26.721.41059` (`codex-desktop` `.deb`).
3. Unlocked local sandbox in `~/.codex/config.toml`:
   - `sandbox_mode = "danger-full-access"`
   - `approval_policy = "on-request"`
   - `web_search = "live"`
   - enabled browser/computer-use/plugins features
4. Doctor now reports: `sandbox unrestricted fs + enabled network · approval OnRequest`.
5. Created reliable VNC launcher: `~/.local/bin/chatgpt-codex`
6. Added desktop entry + Plank dock item for **ChatGPT Codex**.

## Current state

- Desktop app is running and shows **Sign in to ChatGPT**.
- Auth is still required. Without sign-in, Codex stays locked behind account auth (`auth.json` missing).
- This is expected: credentials cannot be invented or copied from another machine.

## Finish unlock (interactive — Dillon)

1. Focus the Codex window on this desktop.
2. Click **Continue to sign in**.
3. Complete ChatGPT OAuth with Dillon's normal account.
4. Confirm the Chat / Work / Codex switcher appears.
5. Optional CLI check: `codex doctor` should show auth OK.

## Relaunch later

```bash
chatgpt-codex
# or
CODEX_DISABLE_SANDBOX=1 CODEX_USE_X11=1 CODEX_GL_BACKEND=angle /opt/Codex/codex-desktop
```

Do not use raw `pkill -f codex-desktop` from a command that also contains that string — it can kill the calling shell.


## Active device login (started 2026-07-28)

A CLI device-auth login is waiting in tmux session `codex-login`:

1. Open https://auth.openai.com/codex/device
2. Enter one-time code: `W5V3-KG6O0` (expires ~15 minutes from start)
3. Sign in with Dillon's ChatGPT account
4. Confirm `codex login status` shows logged in
5. Restart desktop app if needed: `chatgpt-codex`

Sandbox unlock is already done. Auth is the remaining unlock step.
