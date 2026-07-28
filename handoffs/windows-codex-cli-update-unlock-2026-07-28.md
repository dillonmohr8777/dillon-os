# Windows Codex CLI unlock / update fix

Updated: 2026-07-28  
Target: Dillon's Windows desktop (photo showed Codex v0.144.5 in `C:\windows\System32`, YOLO mode, `model: loading`, update banner to 0.145.0)

## What the photo shows

- Codex CLI is already unlocked for permissions (`permissions: YOLO mode`).
- The real breakage is: outdated CLI + likely stuck model load + bad working directory (`System32`).

## Confirmed failure (2026-07-28)

1. `ENOSPC: no space left on device` during `npm install -g @openai/codex`
2. Broken portable Node path won:
   `C:\Users\DillonMohr\Downloads\node-v24.14.1-win-x64\node_modules\@openai\codex\`
3. Runtime error: `Missing optional dependency @openai/codex-win32-x64`

Disk-full caused the Windows binary optional package to fail extraction. npm then left a meta package that cannot start.

## Fix — paste this in PowerShell (not System32)

```powershell
cd $HOME
irm https://raw.githubusercontent.com/dillonmohr8777/dillon-os/main/handoffs/Fix-Windows-Codex.ps1 | iex
```

That script now:
- frees npm/temp cache space
- deletes the broken Downloads portable `@openai` install
- downloads the standalone `codex.exe` from GitHub releases into `%LOCALAPPDATA%\Programs\codex\`
- prepends that folder on User PATH
- writes YOLO / full-sandbox `config.toml`

Then:

```powershell
& "$env:LOCALAPPDATA\Programs\codex\codex.exe" --version
& "$env:LOCALAPPDATA\Programs\codex\codex.exe" doctor
& "$env:LOCALAPPDATA\Programs\codex\codex.exe" login
& "$env:LOCALAPPDATA\Programs\codex\codex.exe"
```

Open a **new** PowerShell window after so PATH persists.

## If still ENOSPC before download

Free at least ~2–3 GB on `C:`:
- Empty Recycle Bin
- Settings → System → Storage → Temporary files
- Delete big installers under `Downloads` (keep the node zip only if you still need it)
- `npm cache clean --force`

## Do not

- Do not keep launching Codex from `C:\windows\System32`.
- Do not keep using `Downloads\node-v24*\node_modules\@openai\codex` as your Codex install.
- Do not copy `auth.json` between computers.
- Do not retry bare `npm install -g @openai/codex` until disk has free space; prefer the standalone exe path above.

## Related

- Linux cloud VNC box was separately installed/unlocked in `handoffs/linux-desktop-chatgpt-codex-unlock-2026-07-28.md` — that is a different machine than this Windows monitor photo.
- Slack connector reauth (if needed after login): `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md`
