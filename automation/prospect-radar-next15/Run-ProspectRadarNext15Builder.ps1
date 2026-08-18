[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$env:CODEX_HOME = 'C:\Users\dillo\.codex'
$env:CODEX_SKILLS_HOME = 'C:\Users\dillo\.codex\skills'
$env:DILLON_AGENT_VAULT = 'C:\Users\dillo\Documents\Codex\projects\agent-vault'
$npmBin = 'C:\Users\dillo\AppData\Roaming\npm'
if ((Test-Path -LiteralPath $npmBin) -and (($env:Path -split ';') -notcontains $npmBin)) {
    $env:Path = "$npmBin;$env:Path"
}

$projectRoot = 'C:\Users\dillo\Documents\Codex\projects\dillon-os'
$runRoot = Join-Path $projectRoot 'automation\prospect-radar-next15\runs'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$runDir = Join-Path $runRoot $stamp
$mutexName = 'Local\Codex-ProspectRadar-Next15-Builder'
$mutex = New-Object System.Threading.Mutex($false, $mutexName)
$hasLock = $false

New-Item -ItemType Directory -Force -Path $runDir | Out-Null
$logPath = Join-Path $runDir 'worker.log'
$lastMessagePath = Join-Path $runDir 'last-message.md'
$statusPath = Join-Path $runDir 'status.json'
$promptPath = Join-Path $runDir 'prompt.txt'

function Write-RunStatus {
    param(
        [string]$Status,
        [int]$ExitCode,
        [string]$Reason = ''
    )

    $payload = [ordered]@{
        batch = 'Prospect Radar next 15 private builder'
        startedAt = $script:startedAt.ToString('o')
        finishedAt = (Get-Date).ToString('o')
        status = $Status
        exitCode = $ExitCode
        runDirectory = $runDir
        reason = $Reason
        scope = $projectRoot
        delivery = 'local-only; no send, publish, deploy, CRM, or queue writes'
    }
    $payload | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statusPath -Encoding utf8
}

$script:startedAt = Get-Date

try {
    if (-not $mutex.WaitOne(0)) {
        Write-RunStatus -Status 'skipped-lock-held' -ExitCode 0 -Reason 'Another six-hour worker is already running.'
        exit 0
    }
    $hasLock = $true

    Set-Location -LiteralPath $projectRoot
    "[$(Get-Date -Format o)] Starting private Prospect Radar next-15 run in $projectRoot" | Tee-Object -FilePath $logPath -Append

    $vaultRoot = 'C:\Users\dillo\Documents\Codex\projects\agent-vault'
    $syncScript = Join-Path $vaultRoot 'scripts\Sync-AgentVault.ps1'
    $testScript = Join-Path $vaultRoot 'scripts\Test-AgentVault.ps1'
    if (Test-Path -LiteralPath $syncScript) {
        $syncSucceeded = $true
        try {
            & $syncScript 2>&1 | Tee-Object -FilePath $logPath -Append
        }
        catch {
            $syncSucceeded = $false
            $_ | Out-String | Tee-Object -FilePath $logPath -Append | Out-Null
        }
        if (-not $syncSucceeded) {
            Write-RunStatus -Status 'blocked-vault-sync' -ExitCode 1 -Reason 'Agent vault sync failed; no build was attempted.'
            exit 1
        }
    }
    if (Test-Path -LiteralPath $testScript) {
        $testSucceeded = $true
        try {
            & $testScript 2>&1 | Tee-Object -FilePath $logPath -Append
        }
        catch {
            $testSucceeded = $false
            $_ | Out-String | Tee-Object -FilePath $logPath -Append | Out-Null
        }
        if (-not $testSucceeded) {
            Write-RunStatus -Status 'blocked-vault-test' -ExitCode 1 -Reason 'Agent vault test failed; no build was attempted.'
            exit 1
        }
    }

    $prompt = @"
You are the private Prospect Radar next-15 builder. Run one resumable build cycle now.

Hard scope: work only in $projectRoot. Read the root AGENTS.md, the exact project AGENTS.md files, the current Daily-Briefs\prospect-radar.html and registry, every prior batch target and manifest, the current site-factory source, and the existing Impeccable PRODUCT.md, DESIGN.md, and surface contracts. This run id is $stamp and its evidence directory is $runDir.

Selection: refresh the radar on every run. Exclude every domain present in any prior completed target, manifest, or build evidence. A blocked pre-build selection is not completed: when RUN-MANIFEST.json for an earlier cycle exists with no site directories, resume that exact selection before choosing new domains. Select exactly 15 untouched rebuild plus queued_build rows. Take remaining bd=1 rows first, then the highest-opportunity fallbacks with vertical diversity. Record rank, opportunity, quality, band, buildable status, and fallback reason in SELECTION-EVIDENCE.json. Write a resumable run manifest before the first item and atomically after each item; never rebuild a completed target.

The previously blocked selection from run 20260808-232052 was fulfilled by the completed concept batch radar-next15-20260808-232850; treat that blocked receipt as superseded and do not resume or select any of its 15 domains again.

Hard exclusion set from prior Prospect Radar deliveries: davidsonfab.com, smileculture.com, metalmorphoseironworks.com, bebalancedcenters.com, plasticsurgerysolutions.com, liveurgentcare.com, saltersfireplace.com, dreammaker-remodel.com, southamptonhottub.com, philadelphiagarage.com, osterviolins.com, blshoes.com, floralandhardyofskippack.com, go2tech.com, candcsuperseal.com, andorradental.com, padentalgroup.com, gleneaglepediatricdentistry.com, dreamteampa.com, erlegal.com. Treat www variants, URL paths, and matching prior slugs as the same completed domain. Scan every prior SELECTION-EVIDENCE.json, DEPLOYMENT.json, PROVENANCE.json, targets.json, manifest.csv, batch-summary.json, and sourceSite, siteUrl, radarDomain, domain, url, website, and officialUrl fields before ranking.

Source and imagery: crawl first-party source first and use only verified contact, service, and copy facts. Missing source or street address must not block a private concept-only preview: use only radar-confirmed identity, city, vertical, and the official URL, label every unverified detail as pending, keep all factual proof empty, and leave qa_ready=hold. If first-party assets are insufficient, use the available image-generation capability for clearly labelled concept studies only; record source sheet, prompt, tile, and SHA256 in each site's PROVENANCE.json. Generated studies must never depict the actual prospect, staff, facility, products, or outcomes, and no invented claims or stock lookalikes may be used as proof. If image generation is unavailable, preserve the fallback status and keep the run resumable rather than fabricating evidence.

Build: create a new dated batch under 02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next15-$stamp with local noindex/nofollow HTML, per-site PRODUCT.md, DESIGN.md, DIRECTION-CONTRACT.md, .impeccable sidecar, self-hosted fonts, 12 unique images, 9 to 11 sections, and 350 to 500 words. Reuse the existing factory only after reading its current source and preserving unrelated user changes. Run build-batch.js with full visual QA. Run one manual npx impeccable detect --json pass on changed UI targets at the end, fix mechanical findings from that pass, then run final-audit.js and git diff --check. Do not run a second detector pass.

Safety: keep mail_ready=hold. Do not touch CRM or the canonical queue. Do not send, post, publish, deploy, create public sites, or change accounts. Use the managed-agent fleet only as a bounded worker pattern if it is available; never create a second scheduler, hosted memory, Slack channel, or raw-secret store. Return exact artifact paths, full QA count, qa_ready count, fallback and source status, generated-image count, and blockers. Do not stop at a plan: complete the safe local build or leave an explicit blocked receipt.
"@
    Set-Content -LiteralPath $promptPath -Value $prompt -Encoding utf8

    $localCodexCli = 'C:\Users\dillo\.codex\tools\codex-cli-0147\node_modules\@openai\codex\bin\codex.js'
    if (Test-Path -LiteralPath $localCodexCli) {
        $codexCommand = 'C:\Program Files\nodejs\node.exe'
        $codexPrefixArgs = @($localCodexCli)
    }
    else {
        $codexCommand = Join-Path $env:APPDATA 'npm\codex.ps1'
        if (-not (Test-Path -LiteralPath $codexCommand)) {
            $codexCommand = 'codex'
        }
        $codexPrefixArgs = @()
    }
    $codexArgs = @(
        $codexPrefixArgs
        'exec',
        '-C', $projectRoot,
        '-m', 'gpt-5.6-terra',
        '-s', 'danger-full-access',
        '--ephemeral',
        '--color', 'never',
        '--json',
        '-o', $lastMessagePath,
        '-'
    )
    "[$(Get-Date -Format o)] Launching Codex worker" | Tee-Object -FilePath $logPath -Append
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $prompt | & $codexCommand @codexArgs 2>&1 | Tee-Object -FilePath $logPath -Append
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorAction
    }
    if ($exitCode -eq 0) {
        Write-RunStatus -Status 'completed' -ExitCode 0 -Reason 'Codex worker completed; inspect batch FINAL-AUDIT.json for release evidence.'
    } else {
        Write-RunStatus -Status 'failed' -ExitCode $exitCode -Reason 'Codex worker returned a non-zero exit code; inspect worker.log and last-message.md.'
    }
    exit $exitCode
}
catch {
    $_ | Out-String | Tee-Object -FilePath $logPath -Append | Out-Null
    Write-RunStatus -Status 'failed-exception' -ExitCode 1 -Reason $_.Exception.Message
    exit 1
}
finally {
    if ($hasLock) {
        $mutex.ReleaseMutex()
    }
    $mutex.Dispose()
}
