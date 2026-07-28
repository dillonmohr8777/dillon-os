# Windows Codex CLI unlock / update fix

Updated: 2026-07-28  
Target: Dillon's Windows desktop (photo showed Codex v0.144.5 in `C:\windows\System32`, YOLO mode, `model: loading`, update banner to 0.145.0)

## What the photo shows

- Codex CLI is already unlocked for permissions (`permissions: YOLO mode`).
- The real breakage is: outdated CLI + likely stuck model load + bad working directory (`System32`).

## Fix — paste this in PowerShell (not System32)

```powershell
# 1) Leave System32
cd $HOME

# 2) Prefer your real workspace if it exists
$ws = @(
  "$HOME\OneDrive - Align HCM\Desktop\Codex",
  "$HOME\Desktop\Codex",
  "$HOME\dillon-os"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($ws) { Set-Location $ws; Write-Host "cwd=$ws" } else { Write-Host "cwd=$PWD" }

# 3) Update Codex CLI
npm install -g @openai/codex@latest
# fallback if npm global is weird:
# irm https://chatgpt.com/codex/install.ps1 | iex

# 4) Confirm version
codex --version
# expect 0.145.0 or newer

# 5) Health check
codex doctor
codex login status

# 6) Relaunch from a real project folder (NOT System32)
codex
```

## If model stays on "loading"

```powershell
# Re-auth (device code in browser)
codex logout
codex login

# Or force config unlock (YOLO + full sandbox) in %USERPROFILE%\.codex\config.toml
@"
approval_policy = "never"
sandbox_mode = "danger-full-access"
web_search = "live"
"@ | Set-Content -Encoding utf8 "$HOME\.codex\config.toml"

codex
```

## Do not

- Do not keep launching Codex from `C:\windows\System32`.
- Do not copy `auth.json` between computers.
- Do not downgrade below 0.145.0 while chasing the stuck model spinner.

## Related

- Linux cloud VNC box was separately installed/unlocked in `handoffs/linux-desktop-chatgpt-codex-unlock-2026-07-28.md` — that is a different machine than this Windows monitor photo.
- Slack connector reauth (if needed after login): `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md`
