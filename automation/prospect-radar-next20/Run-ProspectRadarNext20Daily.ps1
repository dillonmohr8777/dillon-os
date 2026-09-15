[CmdletBinding()]
param(
    [string]$RunId,
    [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'

$env:CODEX_HOME = 'C:\Users\dillo\.codex'
$env:CODEX_SKILLS_HOME = 'C:\Users\dillo\.codex\skills'
$env:DILLON_AGENT_VAULT = 'C:\Users\dillo\Documents\Codex\projects\agent-vault'
$npmBin = 'C:\Users\dillo\AppData\Roaming\npm'
if ((Test-Path -LiteralPath $npmBin) -and (($env:Path -split ';') -notcontains $npmBin)) {
    $env:Path = "$npmBin;$env:Path"
}

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ($repo -ne 'C:\Users\dillo\repos\dillon-os') {
    throw "Daily runner must execute from the canonical repository. Resolved: $repo"
}
if ($RunId -and $RunId -notmatch '^\d{8}-\d{6}$') {
    throw 'RunId must use yyyyMMdd-HHmmss.'
}

$stamp = if ($RunId) { $RunId } else { Get-Date -Format 'yyyyMMdd-HHmmss' }
$runDir = Join-Path $PSScriptRoot "runs\$stamp"
$logPath = Join-Path $runDir 'worker.log'
$lastMessagePath = Join-Path $runDir 'last-message.md'
$promptPath = Join-Path $runDir 'prompt.txt'
$statusPath = Join-Path $runDir 'status.json'
$releaseReceiptPath = Join-Path $runDir 'DAILY-RELEASE.json'
$mutexName = 'Local\Codex-ProspectRadar-Next20-Daily'
$mutex = New-Object System.Threading.Mutex($false, $mutexName)
$hasLock = $false
$startedAt = Get-Date

New-Item -ItemType Directory -Force -Path $runDir | Out-Null

function Write-RunStatus {
    param(
        [string]$Status,
        [int]$ExitCode,
        [string]$Reason
    )

    $payload = [ordered]@{
        schema = 2
        automation = 'Prospect Radar - Next 20 Daily Builder'
        run_id = $stamp
        started_at = $startedAt.ToString('o')
        finished_at = (Get-Date).ToString('o')
        status = $Status
        exit_code = $ExitCode
        reason = $Reason
        repository = $repo
        run_directory = $runDir
        release_receipt = $releaseReceiptPath
        mail_ready = 'hold'
        delivery = 'exact existing Netlify radar site and canonical Google call sheet only; no outreach'
    }
    $temp = "$statusPath.$PID.tmp"
    $payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $temp -Encoding utf8
    Move-Item -LiteralPath $temp -Destination $statusPath -Force
}

function Resolve-CodexCommand {
    $localCli = 'C:\Users\dillo\.codex\tools\codex-cli-0147\node_modules\@openai\codex\bin\codex.js'
    if (Test-Path -LiteralPath $localCli) {
        return [pscustomobject]@{
            Command = 'C:\Program Files\nodejs\node.exe'
            Prefix = @($localCli)
        }
    }

    $codexPowerShell = Join-Path $env:APPDATA 'npm\codex.ps1'
    if (Test-Path -LiteralPath $codexPowerShell) {
        return [pscustomobject]@{ Command = $codexPowerShell; Prefix = @() }
    }

    $codex = Get-Command codex -ErrorAction Stop
    return [pscustomobject]@{ Command = $codex.Source; Prefix = @() }
}

function Resolve-AlignSkill {
    $root = 'C:\Users\dillo\.codex\plugins\cache\personal\align-hcm-image-gen'
    $skill = Get-ChildItem -LiteralPath $root -Recurse -Filter 'SKILL.md' -File -ErrorAction Stop |
        Where-Object { $_.FullName -match '\\skills\\align-hcm-image-gen\\SKILL\.md$' } |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    if (-not $skill) {
        throw 'The Align HCM Image Gen plugin skill is not installed.'
    }
    return $skill.FullName
}

function Invoke-LoggedScript {
    param([string]$Path, [string]$Label)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing $Label script: $Path"
    }
    "[$(Get-Date -Format o)] START $Label" | Tee-Object -FilePath $logPath -Append
    $priorPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $Path 2>&1 | Tee-Object -FilePath $logPath -Append
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    }
    finally {
        $ErrorActionPreference = $priorPreference
    }
    if ($exitCode -ne 0) {
        throw "$Label failed with exit code $exitCode."
    }
    "[$(Get-Date -Format o)] PASS $Label" | Tee-Object -FilePath $logPath -Append
}

try {
    if (-not $mutex.WaitOne(0)) {
        Write-RunStatus -Status 'skipped-lock-held' -ExitCode 0 -Reason 'Another daily Next 20 worker is already running.'
        exit 0
    }
    $hasLock = $true

    Set-Location -LiteralPath $repo
    $codex = Resolve-CodexCommand
    $alignSkill = Resolve-AlignSkill
    $productionPointer = Join-Path $PSScriptRoot 'CURRENT-PRODUCTION.json'
    $requiredFiles = @(
        (Join-Path $repo 'AGENTS.md'),
        (Join-Path $PSScriptRoot 'select-ready.js'),
        (Join-Path $PSScriptRoot 'build-selected.js'),
        (Join-Path $PSScriptRoot 'acceptance-qa.js'),
        (Join-Path $PSScriptRoot 'final-audit.js'),
        (Join-Path $PSScriptRoot 'compose-netlify-release.js'),
        $productionPointer,
        $alignSkill
    )
    $missing = $requiredFiles | Where-Object { -not (Test-Path -LiteralPath $_) }
    if ($missing) {
        throw "Daily preflight is missing required files: $($missing -join ', ')"
    }

    $pointer = Get-Content -LiteralPath $productionPointer -Raw | ConvertFrom-Json
    if ($pointer.site.id -ne '3cf338d4-6813-4712-a6dc-d27e8778cae9' -or
        $pointer.site.name -ne 'momentum-prospect-radar-next20-2026-08-11' -or
        -not (Test-Path -LiteralPath $pointer.local_snapshot)) {
        throw 'CURRENT-PRODUCTION.json does not resolve the exact existing radar site and local production snapshot.'
    }
    $snapshotIndex = Join-Path $pointer.local_snapshot 'index.html'
    $snapshotSites = Join-Path $pointer.local_snapshot 'sites'
    if (-not (Test-Path -LiteralPath $snapshotIndex) -or -not (Test-Path -LiteralPath $snapshotSites)) {
        throw 'The current production snapshot is missing index.html or sites.'
    }
    $snapshotSha = (Get-FileHash -LiteralPath $snapshotIndex -Algorithm SHA256).Hash.ToLowerInvariant()
    $snapshotLinks = ([regex]::Matches((Get-Content -LiteralPath $snapshotIndex -Raw), 'href="/sites/')).Count
    if ($snapshotSha -ne $pointer.index_sha256 -or $snapshotLinks -ne [int]$pointer.indexed_businesses) {
        throw "The current production snapshot failed its SHA/count gate: sha=$snapshotSha links=$snapshotLinks."
    }

    if ($PreflightOnly) {
        Write-RunStatus -Status 'preflight-pass' -ExitCode 0 -Reason "Canonical repo, exact Netlify target, current production snapshot, Codex CLI, and Align plugin verified. Skill: $alignSkill"
        exit 0
    }

    $vaultRoot = 'C:\Users\dillo\Documents\Codex\projects\agent-vault'
    Invoke-LoggedScript -Path (Join-Path $vaultRoot 'scripts\Sync-AgentVault.ps1') -Label 'agent-vault-sync'
    Invoke-LoggedScript -Path (Join-Path $vaultRoot 'scripts\Test-AgentVault.ps1') -Label 'agent-vault-test'

    $prompt = @"
You are Dillon's scheduled Prospect Radar Next 20 production worker. Complete one end-to-end daily cycle now. Do not stop at a plan.

Run identity and scope:
- Run id: $stamp
- Canonical repository: $repo
- Evidence directory: $runDir
- Exact Align HCM Image Gen skill: $alignSkill
- Current production pointer: $productionPointer
- Canonical Google workbook id: 1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo
- Canonical tab: JESSE CALL SHEET, sheetId 8132026
- Exact existing Netlify target only: momentum-prospect-radar-next20-2026-08-11, site id 3cf338d4-6813-4712-a6dc-d27e8778cae9

Read the root AGENTS.md, the synced agent-vault rules, AUTOMATION.md, the current site-factory source, the Align skill completely, its required style guide, CURRENT-PRODUCTION.json, and all existing selection/build/deployment evidence before changing anything. Stay in the canonical client-independent Prospect Radar lane; the Business Workshop does not apply. Preserve unrelated user changes. Do not spawn subagents.

Selection and truth:
- Select exactly 20 current untouched prospects from the canonical Radar registry after global exclusion across all prior batch, target, manifest, deployment, and live-route evidence. Prioritize eligible prospects by registry first_seen ascending, oldest tracked first. Missing or invalid dates sort last. Rebuild score may break ties only within the same date, and vertical diversity must never move a newer prospect ahead of an older one. Resume an incomplete exact prior selection before consuming new prospects.
- Never claim that a prospect was discovered today unless its source evidence proves that date. Record the actual selection basis.
- Use first-party sources for identity, services, city, contact details, and claims. Never guess a phone, address, testimonial, certification, outcome, or logo.

Image system, mandatory before build:
- Use the named align-hcm-image-gen skill and the image generation tool for every selected business. Do not use a category board, generic stock substitute, or a board shared by two businesses.
- Generate one unique business-specific 2x2 editorial board per business. Show people who authentically work in that exact industry performing recognizable work in credible environments, with tools, clothing, materials, and customer context specific to that business type.
- Apply the Align visual system: Plus Jakarta Sans 800, DM Sans, orange/navy/paper/cyan palette, visibly pronounced but refined 35mm grain, documentary texture, grounded light, human editorial composition, and no glossy stock look.
- Do not invent a brand mark or imply generated people, facilities, projects, products, patients, customers, or outcomes are real. Retain the exact prompt, model, dimensions, business, route, source board file, and SHA-256 provenance.
- Create or update ALIGN-SITE-IMAGE-BOARDS.json and generated-stock-library so build-selected.js resolves all 20 exact slugs. If image generation or the Align skill is unavailable for any business, fail closed before the build.

Build and quality:
- Build exactly 20 noindex/nofollow sites with 12 unique 1200x900 derivatives per site, the visible interface grain layer, honest illustrative disclosure, exact verified first-party logo where available, and ordinary live-text identity otherwise. Do not stylize live text as a fake logo.
- Keep every site specific to its business and industry. Preserve the established majority-site grammar while varying composition by vertical. Use 9 to 11 meaningful sections, 350 to 500 words, self-hosted fonts, responsive mobile/desktop behavior, visible keyboard focus, reduced motion, no overflow, no broken images, and no console/page errors.
- Run the factory QA at all six required viewports with both top and full-page screenshots. Run acceptance-qa.js. Run exactly one npx impeccable detect --json pass, fix its mechanical findings without a second detector pass, retain only narrow documented exceptions required by the Align skill, then run final-audit.js and git diff --check. A run is not complete unless FINAL-AUDIT.json says PASS with 20/20 qa_ready, 20 unique board hashes, 240 unique image hashes, and 240 screenshots.

Release and sheet:
- Read CURRENT-PRODUCTION.json and verify its local snapshot index SHA/count against the current live root before composition. Stop on mismatch or an ambiguous site/account.
- Compose additively with compose-netlify-release.js, preserving every existing live route. Deploy only to the exact existing Netlify site above under Dillon's standing approval. Verify the root, the new indexed count, all 20 routes, hero assets, provenance files, and noindex headers live. Update CURRENT-PRODUCTION.json atomically to the newly verified local release snapshot and deploy receipt.
- Append exactly 20 nonduplicate rows to the canonical JESSE CALL SHEET in selection-rank order, which must be oldest first by registry first_seen. Keep column N labeled Radar First Seen and write each row's verified registry date there. Preserve prior batch chronology and never globally reorder completed call history. Expand the grid and copy formatting when required. Mark SHOW only when the phone and business identity are verified from an official source; otherwise mark REVIEW and leave unverified contact fields blank. Read back the exact written range. Do not use or update a Business Workshop sheet.

Safety and completion receipt:
- Keep mail_ready=hold. Do not send outreach, post, launch ads, create a new public site, change accounts, or write to a different CRM/sheet/site.
- Before a successful exit, write $releaseReceiptPath as JSON with schema=1, run_id='$stamp', status='PASS', businesses=20, qa_ready=20, site_specific_boards=20, unique_images=240, screenshots=240, live_verified=true, exact_site_id='3cf338d4-6813-4712-a6dc-d27e8778cae9', sheet_rows=20, sheet_readback=true, mail_ready='hold', and exact artifact/live/sheet locators. If any required gate is unavailable, write status='BLOCKED' with the exact blocker and return a nonzero exit.
"@
    Set-Content -LiteralPath $promptPath -Value $prompt -Encoding utf8

    $codexArgs = @(
        $codex.Prefix
        'exec',
        # Codex CLI 0.147 parses the newer context_management feature table as a
        # boolean feature. Override it at invocation time so the scheduled worker
        # remains compatible while the shared config can retain the newer table.
        '-c', 'features.context_management=true',
        '-C', $repo,
        '-m', 'gpt-5.6-terra',
        '-s', 'danger-full-access',
        '--ephemeral',
        '--color', 'never',
        '--json',
        '-o', $lastMessagePath,
        '-'
    )
    "[$(Get-Date -Format o)] START Codex daily production worker" | Tee-Object -FilePath $logPath -Append
    $priorPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $prompt | & $codex.Command @codexArgs 2>&1 | Tee-Object -FilePath $logPath -Append
        $workerExit = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $priorPreference
    }
    if ($workerExit -ne 0) {
        throw "Codex worker returned exit code $workerExit."
    }
    if (-not (Test-Path -LiteralPath $releaseReceiptPath)) {
        throw 'Codex worker exited without DAILY-RELEASE.json.'
    }

    $release = Get-Content -LiteralPath $releaseReceiptPath -Raw | ConvertFrom-Json
    $receiptPass = $release.status -eq 'PASS' -and
        [int]$release.businesses -eq 20 -and
        [int]$release.qa_ready -eq 20 -and
        [int]$release.site_specific_boards -eq 20 -and
        [int]$release.unique_images -eq 240 -and
        [int]$release.screenshots -eq 240 -and
        $release.live_verified -eq $true -and
        $release.exact_site_id -eq '3cf338d4-6813-4712-a6dc-d27e8778cae9' -and
        [int]$release.sheet_rows -eq 20 -and
        $release.sheet_readback -eq $true -and
        $release.mail_ready -eq 'hold'
    if (-not $receiptPass) {
        throw 'DAILY-RELEASE.json did not satisfy the full build, QA, live, sheet, and hold gates.'
    }

    Write-RunStatus -Status 'complete' -ExitCode 0 -Reason '20 business-specific Align sites passed local and live QA, were appended to the exact existing radar site and canonical call sheet, and remain outreach hold.'
    exit 0
}
catch {
    $_ | Out-String | Tee-Object -FilePath $logPath -Append | Out-Null
    Write-RunStatus -Status 'failed' -ExitCode 1 -Reason $_.Exception.Message
    exit 1
}
finally {
    if ($hasLock) {
        $mutex.ReleaseMutex()
    }
    $mutex.Dispose()
}
