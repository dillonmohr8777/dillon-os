[CmdletBinding()]
param([string]$RunId)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$node = (Get-Command node -ErrorAction Stop).Source
$npx = (Get-Command npx.cmd -ErrorAction Stop).Source
$vault = 'C:\Users\dillo\Documents\Codex\projects\agent-vault'
if ($RunId -and $RunId -notmatch '^\d{8}-\d{6}$') { throw 'RunId must use yyyyMMdd-HHmmss.' }
$stamp = if ($RunId) { $RunId } else { Get-Date -Format 'yyyyMMdd-HHmmss' }
$runDir = Join-Path $PSScriptRoot "runs\$stamp"
$log = Join-Path $runDir 'daily-run.log'
$state = Join-Path $PSScriptRoot 'latest-daily-state.json'
$batchDir = Join-Path $repo "02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-$stamp"
$generatedStockLibrary = Join-Path $PSScriptRoot 'generated-stock-library'
$mutex = [System.Threading.Mutex]::new($false, 'Global\ProspectRadarNext20Daily')
$locked = $false

function Write-State {
  param([string]$Status, [string]$Detail)
  $document = [ordered]@{
    automation = 'Prospect Radar - Next 20 Daily Builder'
    run_id = $stamp
    status = $Status
    detail = $Detail
    updated_at = (Get-Date).ToUniversalTime().ToString('o')
    batch_dir = $batchDir
    mail_ready = 'hold'
    delivery = 'local-only; no outreach, publish, deploy, CRM, or queue write'
  }
  $temp = "$state.$PID.tmp"
  $document | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $temp -Encoding UTF8
  Move-Item -LiteralPath $temp -Destination $state -Force
}

function Invoke-Logged {
  param([string]$FilePath, [string[]]$Arguments, [string]$Label, [switch]$AllowFailure)
  Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) START $Label" -Encoding UTF8
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $output = @(& $FilePath @Arguments 2>&1)
    $code = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
  foreach ($line in $output) {
    Add-Content -LiteralPath $log -Value ([string]$line) -Encoding UTF8
  }
  Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) END $Label EXIT $code" -Encoding UTF8
  if ($code -ne 0 -and -not $AllowFailure) { throw "$Label failed with exit code $code." }
  return $code
}

try {
  New-Item -ItemType Directory -Force $runDir | Out-Null
  $locked = $mutex.WaitOne(0)
  if (-not $locked) {
    Write-State -Status 'skipped-overlap' -Detail 'Another daily Next 20 run owns the mutex.'
    exit 0
  }

  Write-State -Status 'running' -Detail 'Validating shared context.'
  Invoke-Logged -FilePath 'powershell.exe' -Arguments @('-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',(Join-Path $vault 'scripts\Sync-AgentVault.ps1')) -Label 'agent-vault-sync'
  Invoke-Logged -FilePath 'powershell.exe' -Arguments @('-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',(Join-Path $vault 'scripts\Test-AgentVault.ps1')) -Label 'agent-vault-test'

  $areas = @(
    @{ market = 'PHL'; area = 'Philadelphia' },
    @{ market = 'PHL'; area = 'Montgomery' },
    @{ market = 'PHL'; area = 'Delaware' },
    @{ market = 'PHL'; area = 'Bucks' },
    @{ market = 'PHL'; area = 'Chester' },
    @{ market = 'PGH'; area = 'Allegheny' },
    @{ market = 'PA'; area = 'Lehigh' },
    @{ market = 'PA'; area = 'Erie' },
    @{ market = 'PA'; area = 'Lancaster' },
    @{ market = 'PA'; area = 'Dauphin' },
    @{ market = 'PA'; area = 'Berks' },
    @{ market = 'PA'; area = 'York' },
    @{ market = 'PA'; area = 'Northampton' },
    @{ market = 'PA'; area = 'Monroe' },
    @{ market = 'PA'; area = 'Luzerne' },
    @{ market = 'PA'; area = 'Lackawanna' },
    @{ market = 'PA'; area = 'Cumberland' },
    @{ market = 'PA'; area = 'Westmoreland' },
    @{ market = 'PA'; area = 'Centre' },
    @{ market = 'PA'; area = 'Butler' }
  )
  $day = [int](Get-Date -UFormat %j)
  $selected = $false
  Write-State -Status 'selecting' -Detail 'Global duplicate and source preflight against the current registry.'
  $selectionCode = Invoke-Logged -FilePath $node -Arguments @((Join-Path $PSScriptRoot 'select-ready.js'),$stamp) -Label 'select-ready-current-registry' -AllowFailure
  if ($selectionCode -eq 0) { $selected = $true }

  for ($attempt = 0; $attempt -lt 4; $attempt += 1) {
    if ($selected) { break }
    $target = $areas[($day + $attempt) % $areas.Count]
    # --imagery is the stage that mints logo evidence. It was 0 here, so every
    # area this loop discovered arrived with `logo_provenance_missing` and could
    # never satisfy the exact-logo gate select-ready.js enforces two lines below.
    # Four discovery attempts then failed to find 20 eligible rows and the task
    # exited 1 -- every morning, whatever the discovery found.
    Write-State -Status 'discovering' -Detail "Attempt $($attempt + 1): $($target.market) $($target.area)."
    Invoke-Logged -FilePath $node -Arguments @(
      (Join-Path $repo '_os\automation\bin\radar-refresh.js'),
      '--discover','320','--market',$target.market,'--area',$target.area,
      '--groups', $(if (($attempt % 2) -eq 0) { 'home-services,medical,legal' } else { 'industrial,spa-wellness,auto,retail,food' }),
      '--recheck','0','--concurrency','12','--max-tier','0','--enrich','0','--render','0','--imagery','120'
    ) -Label "radar-$($target.market)-$($target.area)"

    Write-State -Status 'selecting' -Detail "Global duplicate and source preflight after $($target.area)."
    $selectionCode = Invoke-Logged -FilePath $node -Arguments @((Join-Path $PSScriptRoot 'select-ready.js'),$stamp) -Label "select-ready-$($attempt + 1)" -AllowFailure
    if ($selectionCode -eq 0) { $selected = $true; break }
  }

  if (-not $selected) { throw 'Four bounded discovery areas did not yield 20 globally new source-ready candidates.' }

  Write-State -Status 'building' -Detail 'Preparing exact logos, fonts, private sites, and browser QA.'
  $buildReceiptPath = Join-Path $batchDir 'BUILD-RECEIPT.json'
  $batchSummaryPath = Join-Path $batchDir 'batch-summary.json'
  $resumeVerifiedBuild = $false
  if ((Test-Path -LiteralPath $buildReceiptPath) -and (Test-Path -LiteralPath $batchSummaryPath)) {
    try {
      $buildReceipt = Get-Content -LiteralPath $buildReceiptPath -Raw | ConvertFrom-Json
      $existingSummary = Get-Content -LiteralPath $batchSummaryPath -Raw | ConvertFrom-Json
      $summaryHash = (Get-FileHash -LiteralPath $batchSummaryPath -Algorithm SHA256).Hash.ToLowerInvariant()
      $resumeVerifiedBuild = (
        $buildReceipt.runId -eq $stamp -and
        $buildReceipt.status -eq 'built-and-browser-qa-passed' -and
        $buildReceipt.selected -eq 20 -and
        $buildReceipt.qaReady -eq 20 -and
        $buildReceipt.batchSummarySha256 -eq $summaryHash -and
        $existingSummary.ok -and
        $existingSummary.briefCount -eq 20 -and
        $existingSummary.qaReadyCount -eq 20
      )
    } catch {
      $resumeVerifiedBuild = $false
    }
  }
  if ($resumeVerifiedBuild) {
    Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) RESUME build-and-browser-qa FROM verified receipt" -Encoding UTF8
  } else {
    Invoke-Logged -FilePath $node -Arguments @((Join-Path $PSScriptRoot 'build-selected.js'),$stamp) -Label 'build-and-browser-qa'
  }

  Write-State -Status 'imagery' -Detail 'Assigning four generated editorial images from each verified business category; unfamiliar categories fail closed.'
  Invoke-Logged -FilePath $node -Arguments @(
    (Join-Path $PSScriptRoot 'integrate-generated-stock.js'),
    $batchDir,
    $generatedStockLibrary,
    (Join-Path $runDir 'GENERATED-STOCK-RECEIPT.json')
  ) -Label 'generated-stock-integration'

  Write-State -Status 'detecting' -Detail 'Running the required Impeccable detector completion pass.'
  $detectorPath = Join-Path $runDir 'IMPECCABLE-DETECTOR.json'
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    & $npx impeccable detect --json (Join-Path $batchDir 'sites') 1> $detectorPath 2>> $log
    $detectorCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
  Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) END impeccable-detector EXIT $detectorCode"
  if ($detectorCode -ne 0) { throw "Impeccable detector blocked the batch with exit code $detectorCode." }

  $summary = Get-Content (Join-Path $batchDir 'batch-summary.json') -Raw | ConvertFrom-Json
  if ($summary.briefCount -ne 20 -or $summary.qaReadyCount -ne 20 -or -not $summary.ok) {
    throw "Batch summary gate failed: $($summary.qaReadyCount)/20 qa_ready."
  }
  $stock = Get-Content (Join-Path $runDir 'GENERATED-STOCK-RECEIPT.json') -Raw | ConvertFrom-Json
  # Every site that HAS an approved board must get all four assets. Sites whose
  # vertical has no approved board are named in the receipt and reported, not
  # guessed at -- and no longer abort the whole batch. Before 2026-08-18 a single
  # unapproved vertical discarded 19 finished, QA-passed sites.
  $unassigned = [int]$stock.unassignedCount
  $assignedSites = 20 - $unassigned
  $expectedImages = $assignedSites * 4
  if ($stock.siteCount -ne 20 -or $stock.imageCount -ne $expectedImages) {
    throw "Generated stock gate failed: $($stock.siteCount) sites, $($stock.imageCount) assets, expected $expectedImages for $assignedSites assigned."
  }
  if ($unassigned -gt 0) {
    $slugs = ($stock.unassignedSites | ForEach-Object { $_.slug }) -join ', '
    Write-State -Status 'complete_partial' -Detail "$assignedSites of 20 sites integrated with $($stock.imageCount) generated assets; browser QA and detector passed; mail remains hold. NEEDS AN APPROVED BOARD: $slugs."
  } else {
    Write-State -Status 'complete' -Detail '20 local noindex sites built with 80 category-relevant generated assets; browser QA and detector passed; mail remains hold.'
  }
} catch {
  New-Item -ItemType Directory -Force $runDir | Out-Null
  $receipt = [ordered]@{
    run_id = $stamp
    status = 'blocked'
    failed_at = (Get-Date).ToUniversalTime().ToString('o')
    reason = $_.Exception.Message
    mail_ready = 'hold'
  }
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $runDir 'BLOCKED-DAILY-RECEIPT.json') -Encoding UTF8
  Write-State -Status 'blocked' -Detail $_.Exception.Message
  Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) BLOCKED $($_.Exception.Message)" -Encoding UTF8
  exit 1
} finally {
  if ($locked) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
