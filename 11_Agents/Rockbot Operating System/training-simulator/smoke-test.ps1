[CmdletBinding()]
param(
    [string]$Url = 'http://127.0.0.1:8877/grok-bot-training-simulator/#D01',
    [int]$Port = 19337
)

$ErrorActionPreference = 'Stop'
$chrome = 'C:\Users\dillo\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe'
$profile = Join-Path ([IO.Path]::GetTempPath()) ("grok-trainer-cdp-{0}" -f [guid]::NewGuid().ToString('N'))
$chromeProcess = $null
$socket = $null

function Send-Cdp {
    param(
        [Parameter(Mandatory)] [System.Net.WebSockets.ClientWebSocket]$Socket,
        [Parameter(Mandatory)] [int]$Id,
        [Parameter(Mandatory)] [string]$Method,
        [hashtable]$Params = @{}
    )

    $payload = @{ id = $Id; method = $Method; params = $Params } | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
    $segment = [ArraySegment[byte]]::new($bytes)
    $Socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null

    do {
        $buffer = New-Object byte[] 65536
        $stream = New-Object IO.MemoryStream
        do {
            $part = [ArraySegment[byte]]::new($buffer)
            $result = $Socket.ReceiveAsync($part, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
            $stream.Write($buffer, 0, $result.Count)
        } until ($result.EndOfMessage)
        $text = [Text.Encoding]::UTF8.GetString($stream.ToArray())
        $message = $text | ConvertFrom-Json
    } until ($message.id -eq $Id)

    return $message
}

try {
    New-Item -ItemType Directory -Path $profile | Out-Null
    $chromeProcess = Start-Process -FilePath $chrome -ArgumentList @(
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--no-first-run',
        "--remote-debugging-port=$Port",
        "--user-data-dir=$profile",
        $Url
    ) -WindowStyle Hidden -PassThru

    $targets = $null
    for ($attempt = 0; $attempt -lt 30 -and -not $targets; $attempt++) {
        Start-Sleep -Milliseconds 250
        try {
            $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/list" -TimeoutSec 1
        } catch {
            $targets = $null
        }
    }

    $page = $targets | Where-Object { $_.type -eq 'page' -and $_.url -match 'grok-bot-training-simulator' } | Select-Object -First 1
    if (-not $page) {
        $seen = ($targets | ForEach-Object { "[$($_.type)] $($_.url)" }) -join '; '
        throw "Trainer page did not appear in CDP targets. Seen: $seen"
    }

    $socket = [System.Net.WebSockets.ClientWebSocket]::new()
    $socket.ConnectAsync([uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null

    Send-Cdp -Socket $socket -Id 1 -Method 'Emulation.setDeviceMetricsOverride' -Params @{
        width = 390; height = 844; deviceScaleFactor = 1; mobile = $true
    } | Out-Null

    $ready = $false
    for ($attempt = 0; $attempt -lt 30 -and -not $ready; $attempt++) {
        Start-Sleep -Milliseconds 150
        $probe = Send-Cdp -Socket $socket -Id (100 + $attempt) -Method 'Runtime.evaluate' -Params @{
            expression = "document.readyState === 'complete' && document.querySelectorAll('[data-routine]').length === 54 && !!document.querySelector('#receiptJson')"
            returnByValue = $true
        }
        $ready = $probe.result.result.value -eq $true
    }
    if (-not $ready) {
        $diagnostic = Send-Cdp -Socket $socket -Id 199 -Method 'Runtime.evaluate' -Params @{
            expression = "JSON.stringify({href:location.href,readyState:document.readyState,title:document.title,routines:document.querySelectorAll('[data-routine]').length,errors:window.__trainerErrors,stage:document.querySelector('#stagePurpose')?.textContent,html:document.documentElement.outerHTML.slice(0,300)})"
            returnByValue = $true
        }
        throw "Trainer did not reach the interactive ready state: $($diagnostic.result.result.value)"
    }

    $expression = @'
(() => {
  const errors = [];
  const initial = {
    routine: document.querySelector('#routineId')?.textContent,
    stage: document.querySelector('#sessionStage')?.textContent,
    manifestCount: document.querySelectorAll('[data-routine]').length
  };
  for (let index = 0; index < 9; index += 1) {
    const execute = document.querySelector('.execute-action:not(:disabled)');
    if (!execute) { errors.push(`missing execute at stage ${index + 1}`); break; }
    execute.click();
    if (index < 8) {
      const next = document.querySelector('#nextButton');
      if (!next || next.disabled) { errors.push(`next disabled at stage ${index + 1}`); break; }
      next.click();
    }
  }
  const receipt = JSON.parse(document.querySelector('#receiptJson').textContent);
  return {
    initial,
    finalStatus: document.querySelector('#receiptStatus')?.textContent,
    checks: receipt.checks,
    privacy: receipt.privacy,
    externalActionAttempted: receipt.external_action_attempted,
    canonicalWriteAttempted: receipt.canonical_write_attempted,
    nextSafestAction: receipt.next_safest_action,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    errors
  };
})()
'@

    $response = Send-Cdp -Socket $socket -Id 2 -Method 'Runtime.evaluate' -Params @{
        expression = $expression
        returnByValue = $true
        awaitPromise = $true
    }
    if ($response.result.exceptionDetails) {
        $detail = $response.result.exceptionDetails
        throw "Browser evaluation failed: $($detail.text) $($detail.exception.description) at $($detail.lineNumber):$($detail.columnNumber)"
    }
    $value = $response.result.result.value
    if ($null -eq $value) {
        throw "Browser evaluation returned no value: $($response | ConvertTo-Json -Depth 20 -Compress)"
    }

    $checks = [ordered]@{
        LoadedD01 = $value.initial.routine -eq 'D01'
        LoadedManifest = $value.initial.manifestCount -eq 54
        SealedReceipt = $value.finalStatus -eq 'SEALED'
        CompletedNineStages = $value.checks -eq '9/9'
        PrivacyRedacted = $value.privacy -eq 'redacted'
        NoExternalAction = $value.externalActionAttempted -eq $false
        NoCanonicalWrite = $value.canonicalWriteAttempted -eq $false
        ReplayIsNext = $value.nextSafestAction -eq 'Replay against a second synthetic fixture'
        NoMobileOverflow = $value.horizontalOverflow -eq $false
        NoInteractionErrors = @($value.errors).Count -eq 0
    }

    $result = [ordered]@{
        ok = -not ($checks.Values -contains $false)
        checks = $checks
        observed = $value
    }
    $result | ConvertTo-Json -Depth 12
    if (-not $result.ok) { exit 1 }
}
finally {
    if ($socket) { $socket.Dispose() }
    if ($chromeProcess -and -not $chromeProcess.HasExited) { Stop-Process -Id $chromeProcess.Id -Force }
    $fullProfile = [IO.Path]::GetFullPath($profile)
    $fullTemp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ((Test-Path -LiteralPath $fullProfile) -and $fullProfile.StartsWith($fullTemp, [StringComparison]::OrdinalIgnoreCase)) {
        Get-CimInstance Win32_Process | Where-Object {
            $_.CommandLine -and $_.CommandLine.IndexOf($fullProfile, [StringComparison]::OrdinalIgnoreCase) -ge 0
        } | ForEach-Object {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 300
        for ($cleanupAttempt = 0; $cleanupAttempt -lt 3 -and (Test-Path -LiteralPath $fullProfile); $cleanupAttempt++) {
            try {
                Remove-Item -LiteralPath $fullProfile -Recurse -Force -ErrorAction Stop
            } catch {
                Start-Sleep -Milliseconds 350
            }
        }
    }
}
