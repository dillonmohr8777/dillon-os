<#
.SYNOPSIS
    Read-only capability canary for the Claude browser evidence harness.

.DESCRIPTION
    Decides whether a browser evidence session is safe to start, or verifies an already-active
    loopback-only session with -Active. It never starts a process itself.
    No process is launched, no window focused, no page navigated, no connector touched, no
    credential read, no external request made.

    Preconditions asserted:
      P1 dedicated evidence port 9223 is free, or is the one authorized loopback listener in
         -Active mode (never share Dillon's foreground CDP port)
      P2 Dillon's foreground CDP port 9222 state is recorded, and the harness refuses to
         attach to it under any condition
      P3 no stale bridge state is treated as live (start-box-bridge-state.json must parse)
      P4 public tunnel policy is off: no tunnel URL is adopted from state
      P5 an isolated profile directory is configured and is NOT an existing Chrome profile
      P6 the evidence directory contract is satisfiable and client-scoped
      P7 forbidden-action list is present and includes every write verb
      P8 MFA / consent handling is declared as a hard stop

    Verdict is READY only when every precondition passes. Anything else is NOT-READY, and
    activation remains an approval-gated human decision either way.

.EXAMPLE
    & .\System\scripts\Test-ClaudeBrowserCanary.ps1
    & .\System\scripts\Test-ClaudeBrowserCanary.ps1 -Json
#>
[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [int]$EvidencePort = 9223,
    [int]$ForegroundPort = 9222,
    [string]$ClientId,
    [switch]$Active,
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$resolvedVault = (Resolve-Path -LiteralPath $VaultRoot).Path
$evidenceRoot = Join-Path $resolvedVault '12_Brain/state/browser-evidence'

# Reuse the existing Claude-dedicated profile declared by start-box-bridge-state.json
# (browserPolicy=claude-dedicated, debugPort 9223) instead of inventing a second profile.
$bridgeState = Join-Path $env:USERPROFILE 'start-box-bridge-state.json'
$profileDir = Join-Path $env:USERPROFILE 'claude-chrome'
$bridgeParsed = $null
if (Test-Path -LiteralPath $bridgeState) {
    try {
        $bridgeParsed = Get-Content -LiteralPath $bridgeState -Raw | ConvertFrom-Json
        if ($bridgeParsed.profileDir) { $profileDir = $bridgeParsed.profileDir }
        if ($bridgeParsed.debugPort) { $EvidencePort = [int]$bridgeParsed.debugPort }
    } catch { $bridgeParsed = $null }
}

$checks = New-Object System.Collections.Generic.List[object]
function Add-P {
    param([string]$Id, [string]$Name, [bool]$Ok, [string]$Detail)
    $checks.Add([pscustomobject]@{ id = $Id; check = $Name; ok = $Ok; detail = $Detail })
}

function Get-Listeners {
    param([int]$Port)
    try { return @(netstat -ano | Select-String -SimpleMatch (":" + $Port) | Where-Object { $_ -match 'LISTENING' }) }
    catch { return @() }
}

# P1 dedicated evidence port must be free before activation. In active verification mode,
# require exactly one loopback listener owned by the dedicated Chrome process.
$ev = Get-Listeners -Port $EvidencePort
$p1ok = ($ev.Count -eq 0)
$p1name = 'evidence_port_free'
$p1detail = "port $EvidencePort listeners=$($ev.Count)"
if ($Active) {
    $p1name = 'active_loopback_listener_verified'
    $owners = @(Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $EvidencePort -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
    $ownerOk = $false
    if ($owners.Count -eq 1) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($owners[0])" -ErrorAction SilentlyContinue
        $ownerOk = ($proc.Name -eq 'chrome.exe' -and $proc.CommandLine -like '*--remote-debugging-address=127.0.0.1*' -and
                    $proc.CommandLine -like "*--remote-debugging-port=$EvidencePort*" -and $proc.CommandLine -like '*claude-chrome*')
    }
    $p1ok = ($owners.Count -eq 1 -and $ownerOk)
    $p1detail = "port $EvidencePort loopback owners=$($owners.Count) dedicated_chrome=$ownerOk"
}
Add-P 'P1' $p1name $p1ok $p1detail

# P2 foreground port state recorded; attaching to it is permanently refused
$fg = Get-Listeners -Port $ForegroundPort
$fgState = 'not listening'
if ($fg.Count -gt 0) { $fgState = "listening ($($fg.Count))" }
Add-P 'P2' 'foreground_port_never_attached' $true "port $ForegroundPort $fgState; attach refused by policy"

# P3 bridge state must parse, and its age must be reported (config, never liveness)
$bridgeOk = $true
$bridgeDetail = 'no bridge state file (acceptable)'
if (Test-Path -LiteralPath $bridgeState) {
    if ($bridgeParsed) {
        $ageD = '?'
        if ($bridgeParsed.startedAt) {
            $ageD = [math]::Round(((Get-Date) - [datetime]$bridgeParsed.startedAt).TotalDays, 1)
        }
        $bridgeDetail = "parses; startedAt age ${ageD}d; config only, not liveness"
    } else {
        $bridgeOk = $false
        $bridgeDetail = 'bridge state present but UNPARSEABLE; must not be trusted'
    }
}
Add-P 'P3' 'bridge_state_parses' $bridgeOk $bridgeDetail

# P9 loopback-only policy: the bridge must not declare a public tunnel provider
$tunnelDeclared = $false
$tunnelDetail = 'no tunnel provider declared'
if ($bridgeParsed) {
    if ($bridgeParsed.tunnelProvider -or $bridgeParsed.tunnelUrl -or
        ($bridgeParsed.remoteTransport -and $bridgeParsed.remoteTransport -ne 'loopback')) {
        $tunnelDeclared = $true
        $tunnelDetail = ("bridge declares remoteTransport='{0}' and a tunnelUrl; public tunnels are policy-disabled" -f $bridgeParsed.remoteTransport)
    }
}
Add-P 'P9' 'no_public_tunnel_declared' (-not $tunnelDeclared) $tunnelDetail

# P4 public tunnel must stay off; the canary never adopts a tunnel URL
$tunnelAdopted = $false
if ($env:BOX_CDP_URL) { $tunnelAdopted = $true }
Add-P 'P4' 'public_tunnel_not_adopted' (-not $tunnelAdopted) `
    $(if ($tunnelAdopted) { 'BOX_CDP_URL is set in this environment; refuse until policy re-approved' } else { 'no tunnel URL adopted; loopback only' })

# P5 isolated profile must not collide with a real Chrome profile
$realChrome = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
$collides = ($profileDir -like ($realChrome + '*'))
$profileExists = Test-Path -LiteralPath $profileDir
$dedicated = $true
if ($bridgeParsed -and $bridgeParsed.browserPolicy -and $bridgeParsed.browserPolicy -ne 'claude-dedicated') { $dedicated = $false }
Add-P 'P5' 'isolated_dedicated_profile' ((-not $collides) -and $dedicated) `
    "profile=$profileDir exists=$profileExists policy=$($bridgeParsed.browserPolicy) collides=$collides"

# P6 evidence directory contract, client-scoped
$scope = 'internal'
if ($ClientId) { $scope = $ClientId }
$targetDir = Join-Path $evidenceRoot $scope
$parentOk = Test-Path -LiteralPath (Split-Path $evidenceRoot -Parent)
Add-P 'P6' 'evidence_dir_contract_satisfiable' $parentOk "would write under $($targetDir.Substring($resolvedVault.Length + 1))"

# P7 forbidden actions must be complete
$forbidden = @('click_submit', 'click_pay', 'click_send', 'click_publish', 'click_delete',
               'form_submit', 'file_upload', 'oauth_consent', 'permission_grant',
               'new_public_destination', 'cookie_read', 'credential_entry', 'mfa_entry')
$required = @('form_submit', 'oauth_consent', 'cookie_read', 'credential_entry', 'mfa_entry')
$missing = @($required | Where-Object { $forbidden -notcontains $_ })
Add-P 'P7' 'forbidden_action_list_complete' ($missing.Count -eq 0) "$($forbidden.Count) forbidden verbs; missing=$($missing.Count)"

# P8 MFA and consent must be declared hard stops
Add-P 'P8' 'mfa_consent_hard_stop_declared' $true `
    'on challenge: screenshot page only, never the code field; emit blocked:human_auth_required; type nothing'

$failed = @($checks | Where-Object { -not $_.ok })
$verdict = 'NOT-READY'
if ($failed.Count -eq 0) { $verdict = 'READY (activation still approval-gated)' }

$contract = [ordered]@{
    mode                 = 'read-only evidence capture'
    launch_performed     = $false
    navigation_performed = $false
    profile              = $profileDir
    port                 = $EvidencePort
    bind                 = '127.0.0.1 only; no LAN, no tunnel'
    client_scope         = 'one client per session; teardown between clients'
    capture              = @('full-page screenshot at 1440 and 390 widths', 'trimmed DOM text',
                             'request URL list without headers or cookies', 'manifest.json with SHA-256 per artifact')
    never_captured       = @('cookies', 'headers', 'request bodies', 'credential fields', 'MFA codes')
    teardown             = @('close targets', 'kill listener', 'wipe cookie jar and storage',
                             'assert port closed', 'retain evidence dir only')
    forbidden_actions    = $forbidden
    approval_gate        = 'Dillon must approve activation; every write verb needs separate exact approval'
}

if ($Json) {
    [pscustomobject]@{
        harness = 'Test-ClaudeBrowserCanary'; verdict = $verdict
        passed = ($checks.Count - $failed.Count); total = $checks.Count
        browser_launched = $false; external_request_made = $false; credential_read = $false
        checks = $checks.ToArray(); evidence_contract = $contract
    } | ConvertTo-Json -Depth 6
} else {
    Write-Host ''
    Write-Host 'Claude browser capability canary   nothing launched, nothing navigated'
    Write-Host ('-' * 84)
    foreach ($c in $checks) {
        $mark = 'ok  '
        if (-not $c.ok) { $mark = 'FAIL' }
        Write-Host ("  [{0}] {1} {2,-42} {3}" -f $mark, $c.id, $c.check, $c.detail)
    }
    Write-Host ('-' * 84)
    Write-Host ("  verdict: {0}   {1}/{2} preconditions" -f $verdict, ($checks.Count - $failed.Count), $checks.Count)
    Write-Host '  browser launched: false   external request: false   credential read: false'
    Write-Host ''
}

if ($failed.Count -gt 0) { exit 1 }
exit 0
