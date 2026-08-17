[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$PackRoot = (Resolve-Path $PSScriptRoot).Path
$RepoRoot = (Resolve-Path (Join-Path $PackRoot '..\..')).Path
$AgentVaultRoot = 'C:\Users\dillo\Documents\Codex\projects\agent-vault'
$CodexRoot = 'C:\Users\dillo\.codex'

if (-not (Test-Path -LiteralPath $AgentVaultRoot)) {
    throw "Agent-vault source is missing: $AgentVaultRoot"
}
if (-not (Test-Path -LiteralPath $RepoRoot)) {
    throw "Dillon OS repository is missing: $RepoRoot"
}

$RecordedRoot = Join-Path $PackRoot 'recorded-training'
$WorkflowRoot = Join-Path $PackRoot 'workflow-estate'
$AutomationDest = Join-Path $WorkflowRoot 'codex-automations'
$DillonWorkflowDest = Join-Path $WorkflowRoot 'dillon-os-definitions'
$AgentWorkflowDest = Join-Path $WorkflowRoot 'agent-vault-definitions'
$EvidenceDest = Join-Path $PackRoot 'evidence\codex-rollouts'
$ScreenshotDest = Join-Path $PackRoot 'recordings\screenshots'
$SimulatorDest = Join-Path $PackRoot 'training-simulator'
$ResearchDest = Join-Path $PackRoot 'research-intake'

foreach ($directory in @($RecordedRoot, $AutomationDest, $DillonWorkflowDest,
        $AgentWorkflowDest, $EvidenceDest, $ScreenshotDest, $SimulatorDest,
        $ResearchDest)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

$sourceFiles = @(
    '2026-08-11-grok-bot-dillon-operating-curriculum.md',
    '2026-08-11-grok-bot-recording-ledger.md',
    '2026-08-11-grok-bot-routine-recording-manifest.json',
    '2026-08-11-grok-specialist-bench.md',
    '2026-08-11-grok-native-agent-bench-v2.md',
    '2026-08-11-grok-repository-and-skill-access-map.md',
    '2026-08-11-grok-research-scout-operating-brief.md',
    '2026-08-11-grok-delivery-design-reporting-playbook.md',
    '2026-08-11-grok-radar-next20-work-order.md',
    '2026-08-11-grok-specialist-bench.workflow.json',
    '2026-08-11-grok-bot-d01-verification-receipt.md',
    '2026-08-12-grok-authorized-roots-canary.md',
    '2026-08-12-grok-operating-team-verification-receipt.md',
    '2026-08-12-grok-radar-align-mirror-20x6-work-order.md',
    '2026-08-12-grok-radar-align-mirror-20x6-contract.json',
    '2026-08-12-d09-priority-packet.json'
)

foreach ($name in $sourceFiles) {
    $source = Join-Path $AgentVaultRoot "notes\inbox\$name"
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Required Rockbot source is missing: $source"
    }
    Copy-Item -LiteralPath $source -Destination $RecordedRoot -Force
}

$automationSource = Join-Path $CodexRoot 'automations'
foreach ($directory in Get-ChildItem -LiteralPath $automationSource -Directory) {
    $destination = Join-Path $AutomationDest $directory.Name
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    foreach ($name in @('automation.toml', 'memory.md')) {
        $source = Join-Path $directory.FullName $name
        if (Test-Path -LiteralPath $source) {
            Copy-Item -LiteralPath $source -Destination $destination -Force
        }
    }
}

$dillonWorkflows = Join-Path $RepoRoot '_os\automation\workflows'
if (Test-Path -LiteralPath $dillonWorkflows) {
    Get-ChildItem -LiteralPath $dillonWorkflows -File -Filter '*.json' |
        Copy-Item -Destination $DillonWorkflowDest -Force
}

$agentWorkflows = Join-Path $AgentVaultRoot 'workflows'
if (Test-Path -LiteralPath $agentWorkflows) {
    Get-ChildItem -LiteralPath $agentWorkflows -File -Filter '*.json' |
        Copy-Item -Destination $AgentWorkflowDest -Force
}

$rolloutSource = Join-Path $CodexRoot 'memories\rollout_summaries'
if (Test-Path -LiteralPath $rolloutSource) {
    Get-ChildItem -LiteralPath $rolloutSource -File |
        Where-Object { $_.Name -match '(?i)grok|agent_vault' } |
        Copy-Item -Destination $EvidenceDest -Force
}

$screenshotSource = Join-Path $AgentVaultRoot 'notes\inbox'
if (Test-Path -LiteralPath $screenshotSource) {
    Get-ChildItem -LiteralPath $screenshotSource -File -Filter '*.png' |
        Where-Object { $_.Name -match '(?i)^grok' } |
        Copy-Item -Destination $ScreenshotDest -Force
}

$simulatorSource = Join-Path $AgentVaultRoot 'notes\inbox\grok-bot-training-simulator'
if (Test-Path -LiteralPath $simulatorSource) {
    Get-ChildItem -LiteralPath $simulatorSource -File |
        Copy-Item -Destination $SimulatorDest -Force
}

$manifestPath = Join-Path $PackRoot 'SYNC-MANIFEST.json'
$manifest = [ordered]@{
    schema_version = '1.0'
    synced_at = (Get-Date).ToUniversalTime().ToString('o')
    pack_root = $PackRoot
    live_vault = $RepoRoot
    original_training_source = (Join-Path $AgentVaultRoot 'notes\inbox')
    codex_automation_source = $automationSource
    codex_rollout_source = $rolloutSource
    recorded_training_files = @(Get-ChildItem -LiteralPath $RecordedRoot -File | Select-Object -ExpandProperty Name)
    automation_directories = @(Get-ChildItem -LiteralPath $AutomationDest -Directory | Select-Object -ExpandProperty Name)
    dillon_os_workflow_files = @(Get-ChildItem -LiteralPath $DillonWorkflowDest -File | Select-Object -ExpandProperty Name)
    agent_vault_workflow_files = @(Get-ChildItem -LiteralPath $AgentWorkflowDest -File | Select-Object -ExpandProperty Name)
    rollout_evidence_files = @(Get-ChildItem -LiteralPath $EvidenceDest -File | Select-Object -ExpandProperty Name)
    screenshot_count = @(Get-ChildItem -LiteralPath $ScreenshotDest -File).Count
    simulator_files = @(Get-ChildItem -LiteralPath $SimulatorDest -File | Select-Object -ExpandProperty Name)
    research_intake_files = @(Get-ChildItem -LiteralPath $ResearchDest -File | Select-Object -ExpandProperty Name)
}
$json = $manifest | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($manifestPath, $json, [System.Text.UTF8Encoding]::new($false))

[pscustomobject]@{
    PackRoot = $PackRoot
    RecordedTrainingFiles = $manifest.recorded_training_files.Count
    AutomationDirectories = $manifest.automation_directories.Count
    DillonWorkflowFiles = $manifest.dillon_os_workflow_files.Count
    AgentVaultWorkflowFiles = $manifest.agent_vault_workflow_files.Count
    RolloutEvidenceFiles = $manifest.rollout_evidence_files.Count
    Screenshots = $manifest.screenshot_count
    SimulatorFiles = $manifest.simulator_files.Count
    ResearchIntakeFiles = $manifest.research_intake_files.Count
    Manifest = $manifestPath
} | Format-List
