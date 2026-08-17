[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$RuntimePython = 'C:\Users\dillo\AppData\Local\Codex\AgentMemory\venv\Scripts\python.exe'
$StartScript = Join-Path $PSScriptRoot 'Start-AgentMemoryGateway.ps1'
$SyncScript = Join-Path $PSScriptRoot 'sync_vault.py'
$Mutex = [System.Threading.Mutex]::new($false, 'Local\CodexAgentMemoryVaultSync')
$HasMutex = $false

if (-not (Test-Path -LiteralPath $RuntimePython)) {
    throw "Agent Memory runtime Python is missing: $RuntimePython"
}

try {
    $HasMutex = $Mutex.WaitOne(0)
    if (-not $HasMutex) { throw 'Another Agent Memory vault sync is already running.' }
    & $StartScript | Out-Null
    & $RuntimePython $SyncScript --vault 'C:\Users\dillo\repos\dillon-os' --runtime 'C:\Users\dillo\AppData\Local\Codex\AgentMemory'
    if ($LASTEXITCODE -ne 0) { throw "Agent Memory vault sync failed with exit code $LASTEXITCODE" }
} finally {
    if ($HasMutex) { $Mutex.ReleaseMutex() }
    $Mutex.Dispose()
}
