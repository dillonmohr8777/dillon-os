# Fix Windows Codex CLI — free disk, remove broken portable install, install standalone binary.
# Paste in PowerShell:
#   irm https://raw.githubusercontent.com/dillonmohr8777/dillon-os/main/handoffs/Fix-Windows-Codex.ps1 | iex

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

Write-Step 'Leave System32 / pick workspace'
Set-Location $HOME
$candidates = @(
  "$HOME\OneDrive - Align HCM\Desktop\Codex",
  "$HOME\Desktop\Codex",
  "$HOME\dillon-os"
)
$ws = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($ws) { Set-Location $ws; Write-Host "cwd=$ws" } else { Write-Host "cwd=$PWD" }

Write-Step 'Check free space on C:'
$drive = Get-PSDrive -Name C
$freeGB = [math]::Round(($drive.Free / 1GB), 2)
Write-Host ("C: free = {0} GB" -f $freeGB)
if ($freeGB -lt 2) {
  Write-Host 'WARNING: under 2 GB free. Cleaning caches...' -ForegroundColor Yellow
}

Write-Step 'Free space (npm cache + temp leftovers)'
try { npm cache clean --force 2>$null } catch {}
$cleanTargets = @(
  "$env:LOCALAPPDATA\npm-cache",
  "$env:TEMP\npm-*",
  "$env:TEMP\codex*",
  "$HOME\AppData\Local\Temp\npm-*"
)
Get-ChildItem -ErrorAction SilentlyContinue $cleanTargets | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Broken portable Node install from Downloads (this is what your error path showed)
$brokenPortable = "$HOME\Downloads\node-v24.14.1-win-x64\node_modules\@openai"
if (Test-Path $brokenPortable) {
  Write-Step "Removing broken portable Codex under Downloads"
  Remove-Item -Recurse -Force $brokenPortable -ErrorAction SilentlyContinue
}

Write-Step 'Uninstall broken global npm Codex packages'
try { npm uninstall -g @openai/codex @openai/codex-win32-x64 2>$null } catch {}

Write-Step 'Install standalone Codex Windows binary (avoids npm optional-deps bug)'
$installDir = Join-Path $env:LOCALAPPDATA 'Programs\codex'
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
$exePath = Join-Path $installDir 'codex.exe'
$url = 'https://github.com/openai/codex/releases/download/rust-v0.145.0/codex-x86_64-pc-windows-msvc.exe'
Write-Host "Downloading $url"
Invoke-WebRequest -Uri $url -OutFile $exePath -UseBasicParsing
if (-not (Test-Path $exePath)) { throw "Download failed: $exePath missing" }
Write-Host "Installed $exePath"

Write-Step 'Put standalone codex first on User PATH'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (-not $userPath) { $userPath = '' }
$parts = $userPath.Split(';') | Where-Object { $_ -and ($_ -ne $installDir) }
$newPath = ($installDir + ';' + ($parts -join ';')).TrimEnd(';')
[Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
$env:Path = $installDir + ';' + $env:Path
Write-Host "PATH prepended: $installDir"

Write-Step 'Write unlocked config (YOLO + full sandbox)'
$codexHome = Join-Path $HOME '.codex'
New-Item -ItemType Directory -Force -Path $codexHome | Out-Null
$configPath = Join-Path $codexHome 'config.toml'
@"
approval_policy = "never"
sandbox_mode = "danger-full-access"
web_search = "live"

[features]
apps = true
browser_use = true
computer_use = true
plugins = true
shell_tool = true
unified_exec = true
"@ | Set-Content -Encoding utf8 $configPath
Write-Host "wrote $configPath"

Write-Step 'Verify'
& $exePath --version
Write-Host ''
Write-Host 'SUCCESS. Next commands in THIS shell:' -ForegroundColor Green
Write-Host "  & '$exePath' doctor"
Write-Host "  & '$exePath' login"
Write-Host "  & '$exePath'"
Write-Host ''
Write-Host 'Open a NEW PowerShell window afterward so PATH persists.'
Write-Host 'Do NOT launch from C:\windows\System32.'
Write-Host 'If disk is still tight: Settings > System > Storage > Temporary files, empty Recycle Bin, clear Downloads installers.'
