# Fix Windows Codex CLI (update + leave System32 + unlock)
# Run in PowerShell as your normal user.

$ErrorActionPreference = 'Stop'

Write-Host '==> Leaving System32 / picking workspace'
Set-Location $HOME
$candidates = @(
  "$HOME\OneDrive - Align HCM\Desktop\Codex",
  "$HOME\Desktop\Codex",
  "$HOME\dillon-os"
)
$ws = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($ws) {
  Set-Location $ws
  Write-Host "cwd=$ws"
} else {
  Write-Host "cwd=$PWD (no known Codex workspace found)"
}

Write-Host '==> Updating Codex CLI to latest'
npm install -g @openai/codex@latest

Write-Host '==> Writing unlocked config (YOLO + full sandbox)'
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

Write-Host '==> Version / doctor / login status'
codex --version
codex doctor
codex login status

Write-Host ''
Write-Host 'If login status is not authenticated, run:  codex login'
Write-Host 'Then relaunch from this folder with:        codex'
Write-Host 'Done.'
