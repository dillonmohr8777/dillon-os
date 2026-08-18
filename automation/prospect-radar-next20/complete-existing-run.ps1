[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidatePattern('^\d{8}-\d{6}$')]
  [string]$RunId
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$batchDir = Join-Path $repo "02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-$RunId"
$runDir = Join-Path $PSScriptRoot "runs\$RunId"
$statePath = Join-Path $PSScriptRoot 'latest-daily-state.json'
$summaryPath = Join-Path $batchDir 'batch-summary.json'
$buildReceiptPath = Join-Path $batchDir 'BUILD-RECEIPT.json'
$stockReceiptPath = Join-Path $runDir 'GENERATED-STOCK-RECEIPT.json'
$detectorPath = Join-Path $runDir 'IMPECCABLE-DETECTOR-RERUN.json'
$completionPath = Join-Path $runDir 'COMPLETION-RECEIPT.json'

foreach ($path in @($summaryPath, $buildReceiptPath, $stockReceiptPath, $detectorPath)) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Required completion evidence is missing: $path" }
}

$summary = Get-Content -LiteralPath $summaryPath -Raw | ConvertFrom-Json
$build = Get-Content -LiteralPath $buildReceiptPath -Raw | ConvertFrom-Json
$stock = Get-Content -LiteralPath $stockReceiptPath -Raw | ConvertFrom-Json
$detector = ConvertFrom-Json -InputObject (Get-Content -LiteralPath $detectorPath -Raw)
$siteIndexes = @(Get-ChildItem -LiteralPath (Join-Path $batchDir 'sites') -Filter index.html -Recurse -File)
$generatedAssets = @(Get-ChildItem -LiteralPath (Join-Path $batchDir 'sites') -Filter 'generated-stock-*.webp' -Recurse -File)
$noindexSites = @($siteIndexes | Where-Object {
  (Get-Content -LiteralPath $_.FullName -Raw) -match '<meta name="robots" content="noindex,nofollow">'
})

$checks = [ordered]@{
  run_id_matches = $build.runId -eq $RunId
  summary_ok = $summary.ok -eq $true
  exact_brief_count = $summary.briefCount -eq 20
  exact_qa_ready_count = $summary.qaReadyCount -eq 20
  browser_qa_all_passed = @($summary.results | Where-Object { $_.qa -eq 'PASS' -and $_.visualQa -eq 'ran' }).Count -eq 20
  mail_ready_held = $summary.mailReadyAlwaysHold -eq $true
  exact_site_count = $siteIndexes.Count -eq 20
  noindex_all_sites = $noindexSites.Count -eq 20
  exact_generated_stock_sites = $stock.siteCount -eq 20
  exact_generated_stock_images = $stock.imageCount -eq 80 -and $generatedAssets.Count -eq 80
  detector_clean = @($detector).Count -eq 0
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key })
if ($failed.Count) { throw "Completion checks failed: $($failed -join ', ')" }

$completedAt = (Get-Date).ToUniversalTime().ToString('o')
$receipt = [ordered]@{
  run_id = $RunId
  status = 'complete-local'
  completed_at = $completedAt
  batch_dir = $batchDir
  selected = 20
  qa_ready = 20
  generated_stock_sites = 20
  generated_stock_images = 80
  detector_exit = 0
  detector_findings = 0
  privacy = 'redacted'
  mail_ready = 'hold'
  delivery = 'local-only; no outreach, publish, deploy, CRM, or canonical queue write'
  external_action_attempted = $false
  checks = $checks
  evidence = [ordered]@{
    build_receipt = $buildReceiptPath
    batch_summary = $summaryPath
    generated_stock_receipt = $stockReceiptPath
    detector_receipt = $detectorPath
  }
}

$state = [ordered]@{
  automation = 'Prospect Radar - Next 20 Daily Builder'
  run_id = $RunId
  status = 'complete'
  detail = '20 local noindex sites built with 80 category-relevant generated assets; 20/20 browser QA and clean detector completion pass; mail remains hold.'
  updated_at = $completedAt
  batch_dir = $batchDir
  mail_ready = 'hold'
  delivery = 'local-only; no outreach, publish, deploy, CRM, or queue write'
}

$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $completionPath -Encoding UTF8
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $batchDir 'COMPLETION-RECEIPT.json') -Encoding UTF8
$state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statePath -Encoding UTF8
if (Test-Path -LiteralPath (Join-Path $runDir 'BLOCKED-DAILY-RECEIPT.json')) {
  Rename-Item -LiteralPath (Join-Path $runDir 'BLOCKED-DAILY-RECEIPT.json') -NewName 'SUPERSEDED-BLOCKED-DAILY-RECEIPT.json' -Force
}

$receipt | ConvertTo-Json -Depth 8
