<#
.SYNOPSIS
  Creates and inspects a managed OpenAI Agents API session.

.DESCRIPTION
  The default -DryRun is offline and prints a redacted request shape. -Live creates
  one managed session, polls its documented state for a bounded interval, inspects
  turn/item evidence, and writes a non-secret receipt. It never starts a Windows
  executor, configures After Effects, creates credentials, or deletes a session
  unless -DeleteDisposableTestSession is supplied explicitly.

  Docs: https://developers.openai.com/api/docs/guides/agents-api/quickstart
  API:  POST/GET/DELETE https://api.openai.com/v1/agents/sessions
#>
[CmdletBinding(DefaultParameterSetName = 'DryRun')]
param(
  [Parameter(ParameterSetName = 'DryRun')]
  [switch]$DryRun,

  [Parameter(ParameterSetName = 'Live')]
  [switch]$Live,

  [Alias('EnvironmentType')]
  [ValidateSet('openai_hosted', 'self_hosted')]
  [string]$Environment = 'openai_hosted',

  [switch]$MultiAgent,

  [ValidateRange(1, 3)]
  [int]$MaxConcurrentSubagents = 1,

  [ValidateRange(1, 3)]
  [int]$MinimumCompletedSubagents = 1,

  [string]$InputText = 'Create tree.py, a Python script that prints a readable tree of the files in the current directory. Run it and show me the output.',

  [string]$InputFile,

  [string]$Model = 'gpt-5.5',

  [string]$Instructions = 'Write clean code, run it, and report actual output. Do not send email, post, publish, spend, or contact humans.',

  [ValidateSet('none', 'low', 'medium', 'high', 'xhigh', 'max')]
  [string]$ReasoningEffort = 'xhigh',

  [string]$WorkspaceDirectory = 'C:\workspace',

  [string[]]$CapabilityDirectories = @('C:\workspace\capabilities\skills'),

  [ValidateRange(10, 3600)]
  [int]$PollTimeoutSeconds = 120,

  [ValidateRange(1, 60)]
  [int]$PollIntervalSeconds = 3,

  [ValidateRange(5, 300)]
  [int]$RequestTimeoutSeconds = 60,

  [string]$ReceiptDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'outputs\agents-api-receipts'),

  [switch]$ExportArtifacts,

  [string]$ArtifactDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'outputs\agents-api-artifacts'),

  [ValidateRange(1, 3)]
  [int]$MaxArtifacts = 3,

  [ValidateRange(1, 10485760)]
  [int]$MaxArtifactBytes = 10485760,

  [switch]$DeleteDisposableTestSession,

  [switch]$OfflineLifecycleTest
)

$ErrorActionPreference = 'Stop'
$ApiBase = 'https://api.openai.com/v1'
$BetaHeader = 'agents=v1'
$script:SessionId = $null

if (-not $Live) { $DryRun = $true }

function Get-OpenAiKey {
  foreach ($scope in @('Process', 'User', 'Machine')) {
    $value = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY', $scope)
    if (-not [string]::IsNullOrWhiteSpace($value)) { return $value }
  }
  return $null
}

function Get-UsageSummary {
  param($Usage)
  if ($null -eq $Usage) { return $null }
  return [ordered]@{
    input_tokens = $Usage.input_tokens
    cached_input_tokens = $Usage.input_tokens_details.cached_tokens
    output_tokens = $Usage.output_tokens
    reasoning_tokens = $Usage.output_tokens_details.reasoning_tokens
    total_tokens = $Usage.total_tokens
  }
}

function Get-ActionSummary {
  param($Actions)
  if ($null -eq $Actions) { return @() }
  return @($Actions | ForEach-Object {
    [ordered]@{ type = $_.type; name = $_.name; turn_id = $_.turn_id; call_id = $_.call_id }
  })
}

function Get-ResourceSummary {
  param($Resource)
  if ($null -eq $Resource -or $null -eq $Resource.data) {
    return [ordered]@{ count = 0; types = @(); message_count = 0; assistant_message_count = 0; records = @() }
  }
  $data = @($Resource.data)
  return [ordered]@{
    count = $data.Count
    types = @($data | ForEach-Object { $_.type } | Where-Object { $_ } | Sort-Object -Unique)
    message_count = @($data | Where-Object { $_.type -match 'message' }).Count
    assistant_message_count = @($data | Where-Object { $_.type -match 'message' -and $_.role -eq 'assistant' }).Count
    records = @($data | ForEach-Object {
      # Keep receipts useful without persisting prompt text, generated output, command output, or headers.
      [ordered]@{ id = $_.id; type = $_.type; role = $_.role; status = $_.status; turn_id = $_.turn_id; phase = $_.phase; created_at = $_.created_at }
    })
  }
}

function Get-ToolFailures {
  param($Items)
  if ($null -eq $Items -or $null -eq $Items.data) { return @() }
  return @($Items.data | Where-Object {
    $_.status -eq 'failed' -and $_.type -match 'tool|mcp|function|command|search|computer|patch'
  } | ForEach-Object {
    [ordered]@{ id = $_.id; type = $_.type; turn_id = $_.turn_id; error = $_.error }
  })
}

function Get-LifecycleAssessment {
  param($Session, $Turns, $Items = $null)

  # A completed worker turn is not proof that the coordinator synthesized a result.
  $allTurnData = if ($null -eq $Turns -or $null -eq $Turns.data) { @() } else { @($Turns.data) }
  $turnData = @($allTurnData | Where-Object { [string]::IsNullOrWhiteSpace([string]$_.subagent_id) })
  $turnStatuses = @($turnData | ForEach-Object { $_.status } | Where-Object { $_ } | Sort-Object -Unique)
  $toolFailures = Get-ToolFailures $Items

  if ($Session.status -eq 'requires_action') {
    return [ordered]@{ state = 'requires_action'; turn_statuses = $turnStatuses; tool_failures = $toolFailures }
  }
  if ($Session.status -eq 'failed' -or $turnStatuses -contains 'failed') {
    return [ordered]@{ state = 'failed'; turn_statuses = $turnStatuses; tool_failures = $toolFailures }
  }
  if ($turnStatuses -contains 'cancelled') {
    return [ordered]@{ state = 'cancelled'; turn_statuses = $turnStatuses; tool_failures = $toolFailures }
  }
  if ($turnStatuses -contains 'completed') {
    if ($toolFailures.Count -gt 0) {
      return [ordered]@{ state = 'tool_failed'; turn_statuses = $turnStatuses; tool_failures = $toolFailures }
    }
    return [ordered]@{ state = 'completed'; turn_statuses = $turnStatuses; tool_failures = $toolFailures }
  }
  # A newly created session can report idle while its first turn is still being provisioned.
  return [ordered]@{ state = 'pending'; turn_statuses = $turnStatuses; tool_failures = $toolFailures }
}

function Get-SubagentEvidence {
  param(
    [Parameter(Mandatory)][string]$SessionId,
    $CoordinatorItems = $null
  )

  $escapedSessionId = [uri]::EscapeDataString($SessionId)
  $listed = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/subagents?limit=100&order=asc" -f $escapedSessionId)
  $records = @()
  $completedTurnCount = 0
  $failedTurnCount = 0
  $cancelledTurnCount = 0
  $evidenceErrors = @()
  foreach ($listedSubagent in @($listed.data)) {
    $subagentId = [string]$listedSubagent.id
    if ([string]::IsNullOrWhiteSpace($subagentId)) { continue }
    try {
      # Retrieve the canonical record as well as the list entry. The documented Subagent
      # resource has no model field, so this deliberately records model as unavailable.
      $record = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/subagents/{1}" -f $escapedSessionId, [uri]::EscapeDataString($subagentId))
      $subagentTurns = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/subagents/{1}/turns?limit=100&order=asc" -f $escapedSessionId, [uri]::EscapeDataString($subagentId))
      $subagentItems = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/subagents/{1}/items?limit=100&order=asc" -f $escapedSessionId, [uri]::EscapeDataString($subagentId))
      $turns = @($subagentTurns.data)
      $completed = @($turns | Where-Object { $_.status -eq 'completed' }).Count
      $failed = @($turns | Where-Object { $_.status -eq 'failed' }).Count
      $cancelled = @($turns | Where-Object { $_.status -eq 'cancelled' }).Count
      $completedTurnCount += $completed
      $failedTurnCount += $failed
      $cancelledTurnCount += $cancelled
      $records += [ordered]@{
        id = $record.id
        name = $record.name
        status = $record.status
        opened_at = $record.opened_at
        closed_at = $record.closed_at
        parent_agent_id = $record.parent_agent_id
        model = $null
        model_evidence = 'not_exposed_by_documented_subagent_or_turn_resources'
        completed_turn_count = $completed
        failed_turn_count = $failed
        cancelled_turn_count = $cancelled
        item_count = @($subagentItems.data).Count
        item_types = @($subagentItems.data | ForEach-Object { $_.type } | Where-Object { $_ } | Sort-Object -Unique)
      }
    } catch {
      $evidenceErrors += ("subagent {0}: {1}" -f $subagentId, $_.Exception.Message)
      $records += [ordered]@{ id = $subagentId; retrieval_error = $_.Exception.Message; model = $null; model_evidence = 'unavailable_due_to_retrieval_error' }
    }
  }
  $coordinationItems = if ($null -eq $CoordinatorItems -or $null -eq $CoordinatorItems.data) { @() } else { @($CoordinatorItems.data) }
  $coordinationTypes = @('create_subagent_call', 'send_subagent_input_call', 'wait_for_subagents_call', 'interrupt_subagent_call', 'close_subagent_call')
  $coordination = @($coordinationItems | Where-Object { $coordinationTypes -contains $_.type })
  return [ordered]@{
    listed_subagent_count = @($listed.data).Count
    retrieved_subagent_count = @($records | Where-Object { -not $_.retrieval_error }).Count
    completed_subagent_turn_count = $completedTurnCount
    failed_subagent_turn_count = $failedTurnCount
    cancelled_subagent_turn_count = $cancelledTurnCount
    coordinator_coordination_item_count = $coordination.Count
    coordinator_coordination_item_types = @($coordination | ForEach-Object { $_.type } | Sort-Object -Unique)
    records = @($records)
    evidence_errors = @($evidenceErrors)
  }
}

function Get-DelegationAssessment {
  param(
    [bool]$Enabled,
    [int]$MinimumCompleted,
    $Evidence = $null
  )
  if (-not $Enabled) { return [ordered]@{ state = 'not_requested'; sufficient = $true } }
  if ($null -eq $Evidence -or @($Evidence.evidence_errors).Count -gt 0) {
    return [ordered]@{ state = 'delegation_unverified'; sufficient = $false }
  }
  if ($Evidence.failed_subagent_turn_count -gt 0 -or $Evidence.cancelled_subagent_turn_count -gt 0) {
    return [ordered]@{ state = 'subagent_failed'; sufficient = $false }
  }
  if ($Evidence.retrieved_subagent_count -lt $MinimumCompleted -or $Evidence.completed_subagent_turn_count -lt $MinimumCompleted) {
    return [ordered]@{ state = 'delegation_unverified'; sufficient = $false }
  }
  return [ordered]@{ state = 'delegation_observed'; sufficient = $true }
}

function Get-ArtifactEvidence {
  param([Parameter(Mandatory)][string]$SessionId)
  $escapedSessionId = [uri]::EscapeDataString($SessionId)
  $artifacts = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/artifacts?limit=100&order=asc" -f $escapedSessionId)
  return @($artifacts.data | ForEach-Object {
    [ordered]@{ id = $_.id; path = $_.path; size_bytes = $_.size_bytes; turn_id = $_.turn_id; created_at = $_.created_at; environment_id = $_.environment_id }
  })
}

function Export-HostedArtifacts {
  param(
    [Parameter(Mandatory)][string]$SessionId,
    [Parameter(Mandatory)]$Artifacts
  )
  if ($Environment -ne 'openai_hosted') { throw 'Artifacts can be exported only from openai_hosted sessions; self_hosted files are not published through this API.' }
  New-Item -ItemType Directory -Path $ArtifactDirectory -Force | Out-Null
  $escapedSessionId = [uri]::EscapeDataString($SessionId)
  $exported = @()
  $eligible = @($Artifacts | Where-Object { $_.path -like '/workspace/outputs/*' -and $_.size_bytes -le $MaxArtifactBytes } | Select-Object -First $MaxArtifacts)
  foreach ($artifact in $eligible) {
    $leaf = [IO.Path]::GetFileName([string]$artifact.path) -replace '[^A-Za-z0-9_.-]', '_'
    if ([string]::IsNullOrWhiteSpace($leaf)) { $leaf = 'artifact' }
    $destination = Join-Path $ArtifactDirectory ("{0}-{1}-{2}" -f ($SessionId -replace '[^A-Za-z0-9_.-]', '_'), ($artifact.id -replace '[^A-Za-z0-9_.-]', '_'), $leaf)
    Invoke-AgentsArtifactDownload -Path ("agents/sessions/{0}/artifacts/{1}/content" -f $escapedSessionId, [uri]::EscapeDataString([string]$artifact.id)) -OutFile $destination
    $exported += [ordered]@{ id = $artifact.id; source_path = $artifact.path; local_path = $destination; size_bytes = (Get-Item -LiteralPath $destination).Length; sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash }
  }
  return @($exported)
}

function Invoke-OfflineLifecycleTest {
  $steps = @(
    [ordered]@{ session = [pscustomobject]@{ status = 'idle' }; turns = [pscustomobject]@{ data = @() }; expected = 'pending' },
    [ordered]@{ session = [pscustomobject]@{ status = 'in_progress' }; turns = [pscustomobject]@{ data = @([pscustomobject]@{ status = 'in_progress' }) }; expected = 'pending' },
    [ordered]@{ session = [pscustomobject]@{ status = 'idle' }; turns = [pscustomobject]@{ data = @([pscustomobject]@{ status = 'completed' }) }; expected = 'completed' }
  )
  foreach ($step in $steps) {
    $actual = (Get-LifecycleAssessment -Session $step.session -Turns $step.turns).state
    if ($actual -ne $step.expected) { throw "Lifecycle test expected $($step.expected), received $actual." }
  }
  $failed = Get-LifecycleAssessment -Session ([pscustomobject]@{ status = 'idle' }) -Turns ([pscustomobject]@{ data = @([pscustomobject]@{ status = 'failed' }) })
  if ($failed.state -ne 'failed') { throw "Failed-turn test expected failed, received $($failed.state)." }
  $toolFailed = Get-LifecycleAssessment -Session ([pscustomobject]@{ status = 'idle' }) -Turns ([pscustomobject]@{ data = @([pscustomobject]@{ status = 'completed' }) }) -Items ([pscustomobject]@{ data = @([pscustomobject]@{ id = 'item_tool'; type = 'mcp_call'; status = 'failed'; turn_id = 'turn_1'; error = 'fake tool failure' }) })
  if ($toolFailed.state -ne 'tool_failed') { throw "Tool-failure test expected tool_failed, received $($toolFailed.state)." }
  $delegated = Get-DelegationAssessment -Enabled $true -MinimumCompleted 3 -Evidence ([pscustomobject]@{ evidence_errors = @(); retrieved_subagent_count = 3; completed_subagent_turn_count = 3; failed_subagent_turn_count = 0; cancelled_subagent_turn_count = 0 })
  if ($delegated.state -ne 'delegation_observed') { throw "Delegation test expected delegation_observed, received $($delegated.state)." }
  $unverified = Get-DelegationAssessment -Enabled $true -MinimumCompleted 3 -Evidence ([pscustomobject]@{ evidence_errors = @(); retrieved_subagent_count = 2; completed_subagent_turn_count = 2; failed_subagent_turn_count = 0; cancelled_subagent_turn_count = 0 })
  if ($unverified.state -ne 'delegation_unverified') { throw "Delegation absence test expected delegation_unverified, received $($unverified.state)." }
  $subagentFailed = Get-DelegationAssessment -Enabled $true -MinimumCompleted 1 -Evidence ([pscustomobject]@{ evidence_errors = @(); retrieved_subagent_count = 1; completed_subagent_turn_count = 1; failed_subagent_turn_count = 1; cancelled_subagent_turn_count = 0 })
  if ($subagentFailed.state -ne 'subagent_failed') { throw "Subagent failure test expected subagent_failed, received $($subagentFailed.state)." }
  Write-Host 'Offline lifecycle tests passed: idle -> in_progress -> completed; failed turns/tools and unverified or failed delegation are not successful.'
}

function Write-SessionReceipt {
  param(
    [Parameter(Mandatory)]$Session,
    [Parameter(Mandatory)][string]$ReceiptStatus,
    [int]$ElapsedSeconds = 0,
    $Items = $null,
    $Turns = $null,
    [string]$EvidenceError = $null,
    $Deletion = $null,
    $Assessment = $null,
    $SubagentEvidence = $null,
    $Delegation = $null,
    $Artifacts = @(),
    $ExportedArtifacts = @()
  )

  New-Item -ItemType Directory -Path $ReceiptDirectory -Force | Out-Null
  $safeId = if ([string]::IsNullOrWhiteSpace($Session.id)) { 'create-failed' } else { ($Session.id -replace '[^A-Za-z0-9_.-]', '_') }
  $stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ')
  $receiptPath = Join-Path $ReceiptDirectory ("agent-session-{0}-{1}.json" -f $safeId, $stamp)
  $receipt = [ordered]@{
    schema_version = 2
    recorded_at_utc = [DateTime]::UtcNow.ToString('o')
    receipt_status = $ReceiptStatus
    session_id = $Session.id
    session_status = $Session.status
    environment = $Environment
    model = $Model
    reasoning_effort = $ReasoningEffort
    multi_agent = [bool]$MultiAgent
    max_concurrent_subagents = if ($MultiAgent) { $MaxConcurrentSubagents } else { 0 }
    minimum_completed_subagents = if ($MultiAgent) { $MinimumCompletedSubagents } else { 0 }
    input = $inputMetadata
    elapsed_seconds = $ElapsedSeconds
    poll_timeout_seconds = $PollTimeoutSeconds
    request_timeout_seconds = $RequestTimeoutSeconds
    error = $Session.error
    required_actions = Get-ActionSummary $Session.required_actions
    usage = Get-UsageSummary $Session.usage
    items = Get-ResourceSummary $Items
    turns = Get-ResourceSummary $Turns
    turn_statuses = if ($null -eq $Assessment) { @() } else { @($Assessment.turn_statuses) }
    tool_failures = if ($null -eq $Assessment) { @() } else { @($Assessment.tool_failures) }
    delegation = $Delegation
    subagent_evidence = $SubagentEvidence
    artifacts = @($Artifacts)
    exported_artifacts = @($ExportedArtifacts)
    evidence_error = $EvidenceError
    deletion = $Deletion
  }
  $receipt | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $receiptPath -Encoding utf8
  return $receiptPath
}

function Invoke-AgentsApi {
  param(
    [Parameter(Mandatory)][ValidateSet('Get', 'Post', 'Delete')][string]$Method,
    [Parameter(Mandatory)][string]$Path,
    [string]$Body = $null
  )
  $uri = "$ApiBase/$Path"
  $headers = @{ Authorization = "Bearer $(Get-OpenAiKey)"; 'OpenAI-Beta' = $BetaHeader }
  $parameters = @{ Method = $Method; Uri = $uri; Headers = $headers; TimeoutSec = $RequestTimeoutSeconds; ErrorAction = 'Stop' }
  if ($null -ne $Body) {
    $parameters.Body = $Body
    $parameters.ContentType = 'application/json'
  }
  return Invoke-RestMethod @parameters
}

function Invoke-AgentsArtifactDownload {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$OutFile
  )
  $headers = @{ Authorization = "Bearer $(Get-OpenAiKey)"; 'OpenAI-Beta' = $BetaHeader }
  Invoke-WebRequest -Method Get -Uri "$ApiBase/$Path" -Headers $headers -OutFile $OutFile -TimeoutSec $RequestTimeoutSeconds -ErrorAction Stop | Out-Null
}

if ($OfflineLifecycleTest) {
  Invoke-OfflineLifecycleTest
  exit 0
}

$inputMetadata = [ordered]@{ source = 'inline'; file_name = $null; bytes = [Text.Encoding]::UTF8.GetByteCount($InputText); sha256 = $null }
if (-not [string]::IsNullOrWhiteSpace($InputFile)) {
  if ($PSBoundParameters.ContainsKey('InputText')) { throw 'Specify either InputText or InputFile, not both.' }
  $inputItem = Get-Item -LiteralPath $InputFile
  if ($inputItem.PSIsContainer) { throw 'InputFile must be a file.' }
  if ($inputItem.Length -gt 65536) { throw 'InputFile exceeds the 65536-byte safety limit.' }
  $InputText = Get-Content -LiteralPath $inputItem.FullName -Raw
  if ([string]::IsNullOrWhiteSpace($InputText)) { throw 'InputFile is empty.' }
  $inputMetadata = [ordered]@{ source = 'file'; file_name = $inputItem.Name; bytes = $inputItem.Length; sha256 = (Get-FileHash -LiteralPath $inputItem.FullName -Algorithm SHA256).Hash }
}

$environmentSpec = @{ type = $Environment }
if ($Environment -eq 'self_hosted') {
  $environmentSpec.workspace_directory = $WorkspaceDirectory
  $environmentSpec.capability_directories = @($CapabilityDirectories)
}

$agent = @{
  model = $Model
  instructions = $Instructions
  reasoning = @{ effort = $ReasoningEffort }
}
if ($MultiAgent) {
  $agent.multi_agent = @{ enabled = $true; max_concurrent_subagents = $MaxConcurrentSubagents }
}

$payload = [ordered]@{
  agent = $agent
  environment = $environmentSpec
  input = $InputText
  stream = $false
}
$body = $payload | ConvertTo-Json -Depth 10

Write-Host '=== OpenAI Agents API managed-session wrapper ==='
Write-Host ("Mode: {0}" -f $(if ($Live) { 'LIVE' } else { 'DRY-RUN (no network)' }))
Write-Host 'Endpoint: POST https://api.openai.com/v1/agents/sessions'
Write-Host 'Lifecycle: GET session, turns, and items; no automatic deletion'
Write-Host ("Environment: {0}; model: {1}; reasoning: {2}" -f $Environment, $Model, $ReasoningEffort)
Write-Host ("MultiAgent: {0}; maximum subagents: {1}" -f [bool]$MultiAgent, $(if ($MultiAgent) { $MaxConcurrentSubagents } else { 0 }))
Write-Host ("Input: {0}; {1} bytes" -f $inputMetadata.source, $inputMetadata.bytes)

if (-not $Live) {
  Write-Host '--- redacted request body ---'
  $preview = [ordered]@{ agent = $agent; environment = $environmentSpec; input = ("[redacted {0} input, {1} bytes]" -f $inputMetadata.source, $inputMetadata.bytes); stream = $false } | ConvertTo-Json -Depth 10
  Write-Host $preview
  Write-Host '--- end request body ---'
  Write-Host 'Dry-run complete. No API call, key read, executor launch, or deletion occurred.'
  exit 0
}

if ([string]::IsNullOrWhiteSpace((Get-OpenAiKey))) {
  throw 'OPENAI_API_KEY is missing. Refusing -Live without printing or accepting a key value.'
}

$session = $null
$items = $null
$turns = $null
$evidenceError = $null
$assessment = $null
$subagentEvidence = $null
$delegation = $null
$artifactEvidence = @()
$exportedArtifacts = @()
$stopwatch = [Diagnostics.Stopwatch]::StartNew()
try {
  # Invoke-RestMethod keeps the bearer token in an HTTP header, never a curl process argument or output.
  $session = Invoke-AgentsApi -Method Post -Path 'agents/sessions' -Body $body
  $script:SessionId = [string]$session.id
  if ([string]::IsNullOrWhiteSpace($script:SessionId)) { throw 'Create response did not include a session ID.' }
  Write-Host ("Created session: {0}; initial status: {1}" -f $session.id, $session.status)

  $escapedSessionId = [uri]::EscapeDataString($script:SessionId)
  $turns = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/turns?limit=100&order=asc" -f $escapedSessionId)
  $assessment = Get-LifecycleAssessment -Session $session -Turns $turns

  # `idle` alone is not completion: newly-created sessions may be idle while a turn provisions.
  while ($assessment.state -eq 'pending' -and $stopwatch.Elapsed.TotalSeconds -lt $PollTimeoutSeconds) {
    Start-Sleep -Seconds $PollIntervalSeconds
    $session = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}" -f $escapedSessionId)
    $turns = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/turns?limit=100&order=asc" -f $escapedSessionId)
    $assessment = Get-LifecycleAssessment -Session $session -Turns $turns
    Write-Host ("Session status: {0}; lifecycle: {1} ({2}s)" -f $session.status, $assessment.state, [math]::Floor($stopwatch.Elapsed.TotalSeconds))
  }

  if ($assessment.state -eq 'pending') {
    $receiptPath = Write-SessionReceipt -Session $session -ReceiptStatus 'timed_out' -ElapsedSeconds ([math]::Floor($stopwatch.Elapsed.TotalSeconds)) -Turns $turns -Assessment $assessment
    Write-Warning ("Polling timed out; session remains available for inspection: {0}" -f $session.id)
    Write-Host ("Receipt: {0}" -f $receiptPath)
    exit 3
  }

  try {
    $items = Invoke-AgentsApi -Method Get -Path ("agents/sessions/{0}/items?limit=100&order=asc" -f $escapedSessionId)
  } catch {
    $evidenceError = $_.Exception.Message
  }

  $assessment = Get-LifecycleAssessment -Session $session -Turns $turns -Items $items
  if ($MultiAgent) {
    try {
      $subagentEvidence = Get-SubagentEvidence -SessionId $script:SessionId -CoordinatorItems $items
      $delegation = Get-DelegationAssessment -Enabled $true -MinimumCompleted $MinimumCompletedSubagents -Evidence $subagentEvidence
    } catch {
      $subagentEvidence = [ordered]@{ retrieval_error = $_.Exception.Message }
      $delegation = [ordered]@{ state = 'delegation_unverified'; sufficient = $false }
      $evidenceError = @($evidenceError, $_.Exception.Message | Where-Object { $_ }) -join '; '
    }
  } else {
    $delegation = Get-DelegationAssessment -Enabled $false -MinimumCompleted 0
  }
  if ($assessment.state -eq 'completed' -and $Environment -eq 'openai_hosted') {
    try {
      $artifactEvidence = Get-ArtifactEvidence -SessionId $script:SessionId
      if ($ExportArtifacts) { $exportedArtifacts = Export-HostedArtifacts -SessionId $script:SessionId -Artifacts $artifactEvidence }
    } catch {
      $evidenceError = @($evidenceError, $_.Exception.Message | Where-Object { $_ }) -join '; '
    }
  } elseif ($ExportArtifacts) {
    $evidenceError = @($evidenceError, 'Artifact export requested but only documented for openai_hosted sessions.' | Where-Object { $_ }) -join '; '
  }
  $receiptStatus = switch ($assessment.state) {
    'completed' {
      if ($delegation.sufficient -eq $false) { $delegation.state }
      elseif ($evidenceError -or $null -eq $items -or @($items.data).Count -eq 0) { 'unverified' } else { 'completed' }
    }
    'requires_action' { 'requires_action' }
    'failed' { 'failed' }
    'cancelled' { 'cancelled' }
    'tool_failed' { 'tool_failed' }
    default { 'unverified' }
  }

  $deletion = $null
  if ($DeleteDisposableTestSession) {
    # DELETE is intentionally opt-in and applies only to the session created above.
    $deletion = Invoke-AgentsApi -Method Delete -Path ("agents/sessions/{0}" -f [uri]::EscapeDataString($script:SessionId))
    $deletion = [ordered]@{ id = $deletion.id; deleted = $deletion.deleted; object = $deletion.object }
    Write-Host ("Explicit disposable-test deletion confirmed for: {0}" -f $script:SessionId)
  }

  $receiptPath = Write-SessionReceipt -Session $session -ReceiptStatus $receiptStatus -ElapsedSeconds ([math]::Floor($stopwatch.Elapsed.TotalSeconds)) -Items $items -Turns $turns -EvidenceError $evidenceError -Deletion $deletion -Assessment $assessment -SubagentEvidence $subagentEvidence -Delegation $delegation -Artifacts $artifactEvidence -ExportedArtifacts $exportedArtifacts
  Write-Host ("Final session status: {0}; receipt status: {1}" -f $session.status, $receiptStatus)
  Write-Host ("Receipt: {0}" -f $receiptPath)

  if ($receiptStatus -eq 'completed') { exit 0 }
  if ($receiptStatus -eq 'requires_action') { exit 4 }
  if ($receiptStatus -eq 'failed') { exit 5 }
  if ($receiptStatus -eq 'cancelled') { exit 6 }
  if ($receiptStatus -eq 'tool_failed') { exit 7 }
  if ($receiptStatus -eq 'delegation_unverified') { exit 9 }
  if ($receiptStatus -eq 'subagent_failed') { exit 10 }
  exit 8
} catch {
  $message = $_.Exception.Message
  if ($null -ne $session) {
    $receiptPath = Write-SessionReceipt -Session $session -ReceiptStatus 'error' -ElapsedSeconds ([math]::Floor($stopwatch.Elapsed.TotalSeconds)) -Items $items -Turns $turns -EvidenceError $message -Assessment $assessment
    Write-Host ("Receipt: {0}" -f $receiptPath)
  }
  throw
} finally {
  $stopwatch.Stop()
}
