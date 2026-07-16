[CmdletBinding()]
param(
  [string]$WindowStart = '2026-01-26',
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH,
  [switch]$Publish,
  [switch]$SkipCrawlerProbe
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$DataPath = Join-Path $RepoRoot 'site-analytics-dashboard\data.json'
$BaselinePath = Join-Path $PSScriptRoot 'baseline.json'

function Get-AlignHubSpotToken {
  if ($env:HUBSPOT_SERVICE_KEY) { return $env:HUBSPOT_SERVICE_KEY }
  if ($env:HUBSPOT_ACCESS_TOKEN) { return $env:HUBSPOT_ACCESS_TOKEN }

  $path = if ($TokenDpapiPath) { $TokenDpapiPath } else { $DefaultTokenPath }
  if (!(Test-Path -LiteralPath $path)) {
    throw 'No Align HubSpot token environment variable or DPAPI token was found.'
  }

  $secure = ConvertTo-SecureString (Get-Content -Raw -LiteralPath $path)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) } }
}

function Invoke-HubSpotJson {
  param(
    [Parameter(Mandatory = $true)][ValidateSet('Get', 'Post')][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    [object]$Body
  )

  $params = @{ Method = $Method; Uri = $Uri; Headers = $Headers }
  if ($null -ne $Body) {
    $params.ContentType = 'application/json'
    $params.Body = $Body | ConvertTo-Json -Depth 12 -Compress
  }
  Invoke-RestMethod @params
}

function Invoke-HubSpotSearch {
  param(
    [Parameter(Mandatory = $true)][string]$ObjectType,
    [Parameter(Mandatory = $true)][object[]]$Filters,
    [Parameter(Mandatory = $true)][string[]]$Properties,
    [Parameter(Mandatory = $true)][hashtable]$Headers
  )

  $results = @()
  $after = $null
  do {
    $body = [ordered]@{
      filterGroups = @(@{ filters = $Filters })
      properties = $Properties
      limit = 100
    }
    if ($after) { $body.after = "$after" }
    $page = Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/crm/v3/objects/$ObjectType/search" -Headers $Headers -Body $body
    $results += @($page.results)
    $after = $page.paging.next.after
  } while ($after)
  @($results)
}

function Set-ObjectProperty {
  param([Parameter(Mandatory = $true)][object]$Object, [Parameter(Mandatory = $true)][string]$Name, $Value)
  if ($Object.PSObject.Properties[$Name]) { $Object.$Name = $Value }
  else { $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value }
}

function Write-JsonFile {
  param([Parameter(Mandatory = $true)][object]$Value, [Parameter(Mandatory = $true)][string]$Path)
  $json = ($Value | ConvertTo-Json -Depth 30) + "`n"
  $utf8 = New-Object Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($Path, $json, $utf8)
  Get-Content -Raw -LiteralPath $Path -Encoding UTF8 | ConvertFrom-Json | Out-Null
}

function Get-AmountTotal {
  param([object[]]$Deals)
  $total = [decimal]0
  foreach ($deal in @($Deals)) {
    if ($deal.properties.amount) { $total += [decimal]$deal.properties.amount }
  }
  [long][Math]::Round($total, 0)
}

function Get-SourceLabel {
  param([string]$SourceKey, [hashtable]$Labels)
  if ($Labels.ContainsKey($SourceKey)) { return $Labels[$SourceKey] }
  if ([string]::IsNullOrWhiteSpace($SourceKey)) { return 'Unknown / blank' }
  (($SourceKey -split '_') | ForEach-Object {
    if ($_.Length -gt 1) { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1).ToLowerInvariant() }
    else { $_.ToUpperInvariant() }
  }) -join ' '
}

function Test-AiCrawlerAccess {
  $agents = @('GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended')
  $paths = @('/', '/robots.txt', '/llms.txt')
  $failures = @()
  foreach ($agent in $agents) {
    foreach ($path in $paths) {
      try {
        $response = Invoke-WebRequest -Uri "https://www.alignhcm.com$path" -Headers @{ 'User-Agent' = $agent } -UseBasicParsing -MaximumRedirection 5
        if ([int]$response.StatusCode -ne 200) { $failures += "$agent $path HTTP $([int]$response.StatusCode)" }
        if ($path -eq '/llms.txt' -and $response.Headers['Content-Type'] -notmatch '^text/plain') {
          $failures += "$agent $path content-type $($response.Headers['Content-Type'])"
        }
      } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $failures += "$agent $path HTTP $status"
      }
    }
  }
  [pscustomobject]@{ checks = $agents.Count * $paths.Count; failures = @($failures) }
}

$token = Get-AlignHubSpotToken
$headers = @{ Authorization = "Bearer $token" }
try {
  $identity = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/integrations/v1/me" -Headers $headers
  if ("$($identity.portalId)" -ne $ExpectedPortalId) {
    throw "HubSpot portal mismatch. Expected $ExpectedPortalId, got $($identity.portalId)."
  }

  $start = [DateTimeOffset]::Parse("$WindowStart`T00:00:00-05:00")
  $end = [DateTimeOffset]::Now
  $startMs = $start.ToUnixTimeMilliseconds().ToString()
  $endMs = $end.ToUnixTimeMilliseconds().ToString()

  $deals = Invoke-HubSpotSearch -ObjectType 'deals' -Headers $headers -Properties @(
    'amount', 'closedate', 'hs_analytics_source', 'hs_analytics_source_data_1',
    'hs_analytics_source_data_2', 'lead_source', 'hs_is_closed_won'
  ) -Filters @(
    @{ propertyName = 'closedate'; operator = 'GTE'; value = $startMs },
    @{ propertyName = 'closedate'; operator = 'LTE'; value = $endMs },
    @{ propertyName = 'hs_is_closed_won'; operator = 'EQ'; value = 'true' }
  )

  $contacts = Invoke-HubSpotSearch -ObjectType 'contacts' -Headers $headers -Properties @(
    'createdate', 'hs_analytics_source', 'hs_analytics_source_data_1',
    'hs_analytics_source_data_2', 'hs_analytics_first_referrer', 'lifecyclestage'
  ) -Filters @(
    @{ propertyName = 'createdate'; operator = 'GTE'; value = $startMs },
    @{ propertyName = 'createdate'; operator = 'LTE'; value = $endMs }
  )

  $sourceProperty = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/properties/contacts/hs_analytics_source" -Headers $headers
  $sourceLabels = @{}
  foreach ($option in @($sourceProperty.options)) { $sourceLabels["$($option.value)"] = "$($option.label)" }

  $selectedSources = @(
    [pscustomobject]@{ key = 'ORGANIC_SEARCH'; label = 'Organic Search'; note = 'Deal-level Original Traffic Source = Organic Search.' },
    [pscustomobject]@{ key = 'DIRECT_TRAFFIC'; label = 'Direct Traffic'; note = 'Deal-level Original Traffic Source = Direct Traffic. Direct is reported separately and is not automatically claimed as SEO.' },
    [pscustomobject]@{ key = 'SOCIAL_MEDIA'; label = 'Organic Social'; note = 'Deal-level Original Traffic Source = Organic Social.' }
  )

  $channelRows = @()
  $selectedDealIds = @{}
  foreach ($source in $selectedSources) {
    $matches = @($deals | Where-Object { "$($_.properties.hs_analytics_source)" -eq $source.key })
    foreach ($deal in $matches) { $selectedDealIds["$($deal.id)"] = $true }
    $channelRows += [pscustomobject][ordered]@{
      sourceKey = $source.key
      channel = $source.label
      won = Get-AmountTotal -Deals $matches
      deals = $matches.Count
      note = $source.note
    }
  }
  $selectedDeals = @($deals | Where-Object { $selectedDealIds.ContainsKey("$($_.id)") })
  $selectedTotal = Get-AmountTotal -Deals $selectedDeals

  $sourceCounts = @{}
  foreach ($contact in $contacts) {
    $key = "$($contact.properties.hs_analytics_source)"
    if ([string]::IsNullOrWhiteSpace($key)) { $key = 'UNKNOWN' }
    if (!$sourceCounts.ContainsKey($key)) { $sourceCounts[$key] = 0 }
    $sourceCounts[$key]++
  }
  $sourceOrder = @('DIRECT_TRAFFIC', 'ORGANIC_SEARCH', 'SOCIAL_MEDIA', 'REFERRALS', 'AI_REFERRALS', 'PAID_SEARCH', 'PAID_SOCIAL', 'EMAIL_MARKETING', 'OTHER_CAMPAIGNS')
  $sourceRows = @()
  foreach ($key in $sourceOrder) {
    if ($sourceCounts.ContainsKey($key)) {
      $sourceRows += [pscustomobject][ordered]@{
        source = Get-SourceLabel -SourceKey $key -Labels $sourceLabels
        contacts = $sourceCounts[$key]
        aeo = ($key -eq 'AI_REFERRALS')
      }
    }
  }
  foreach ($key in @($sourceCounts.Keys | Where-Object { $_ -notin $sourceOrder -and $_ -notin @('OFFLINE', 'UNKNOWN') } | Sort-Object)) {
    $sourceRows += [pscustomobject][ordered]@{
      source = Get-SourceLabel -SourceKey $key -Labels $sourceLabels
      contacts = $sourceCounts[$key]
      aeo = $false
    }
  }

  $aeoPatterns = [ordered]@{
    ChatGPT = 'chatgpt\.com|chat\.openai\.com'
    Perplexity = 'perplexity\.ai'
    Claude = 'claude\.ai'
    Gemini = 'gemini\.google\.com'
    'Microsoft Copilot' = 'copilot\.microsoft\.com'
  }
  $aeoRows = @()
  foreach ($entry in $aeoPatterns.GetEnumerator()) {
    $count = @($contacts | Where-Object { "$($_.properties.hs_analytics_first_referrer)" -match $entry.Value }).Count
    $aeoRows += [pscustomobject][ordered]@{ platform = $entry.Key; contacts = $count }
  }

  $crawler = if ($SkipCrawlerProbe) { [pscustomobject]@{ checks = 0; failures = @() } } else { Test-AiCrawlerAccess }

  $onlineContacts = @($contacts | Where-Object {
    $sourceKey = "$($_.properties.hs_analytics_source)"
    $sourceKey -and $sourceKey -ne 'OFFLINE'
  })

  $data = Get-Content -Raw -LiteralPath $DataPath -Encoding UTF8 | ConvertFrom-Json
  $data.generated = $end.ToString('o')
  $data.window.end = $end.ToString('yyyy-MM-dd')
  Set-ObjectProperty -Object $data.kpis -Name 'selectedChannelWon' -Value $selectedTotal
  Set-ObjectProperty -Object $data.kpis -Name 'selectedChannelDeals' -Value $selectedDeals.Count
  Set-ObjectProperty -Object $data.kpis -Name 'contacts' -Value $onlineContacts.Count
  Set-ObjectProperty -Object $data.kpis -Name 'customers' -Value @($onlineContacts | Where-Object { $_.properties.lifecyclestage -eq 'customer' }).Count
  $data.kpis.PSObject.Properties.Remove('wonRevenueYtd')

  $channelRevenue = [pscustomobject][ordered]@{
    verified = $true
    asOf = $end.ToString('yyyy-MM-dd')
    source = 'Live HubSpot closed-won deals grouped by the deal-level Original Traffic Source'
    period = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    methodology = 'Strict deal-origin attribution. Each deal is counted once only when its own Original Traffic Source is Organic Search, Direct Traffic, or Organic Social. Associated-contact-only matches and LINEAR touch credit are excluded.'
    totalWon = $selectedTotal
    deals = $selectedDeals.Count
    byChannel = $channelRows
    excludedAssistNote = 'Associated-contact-only matches and LINEAR touch credit are excluded from this originated-revenue total.'
  }
  Set-ObjectProperty -Object $data -Name 'channelRevenue' -Value $channelRevenue
  $data.PSObject.Properties.Remove('revops')
  $data.sources = $sourceRows
  $data.aeo = $aeoRows
  $data.directives = @(
    'AI crawlers must have full access to alignhcm.com at all times. Never block GPTBot, ClaudeBot, PerplexityBot, Google-Extended, or similar. Verify on every run; blocking is a critical alert.',
    'Owned-channel won revenue is calculated live from closed-won HubSpot deals whose deal-level Original Traffic Source is Organic Search, Direct Traffic, or Organic Social. Keep assisted attribution separate.'
  )
  if ($data.touchAttribution) {
    $data.touchAttribution.note = 'HubSpot campaign attribution: closed-won revenue split across every marketing touchpoint. Measures marketing influence, not deal origination; keep it separate from the strict channel-origin card above.'
  }
  $data.alerts = @($data.alerts | Where-Object {
    $_.text -notmatch '^RevOps verified:' -and
    $_.text -notmatch '^Live deal-origin attribution:' -and
    $_.text -notmatch '^AI crawler access'
  })
  $revenueAlert = 'Live deal-origin attribution: ${0} closed-won from the selected channels since Jan 26 (${1} Organic Search, ${2} Direct Traffic, ${3} Organic Social).' -f ('{0:N0}' -f $selectedTotal), ('{0:N0}' -f $channelRows[0].won), ('{0:N0}' -f $channelRows[1].won), ('{0:N0}' -f $channelRows[2].won)
  $data.alerts += [pscustomobject]@{
    severity = 'good'
    text = $revenueAlert
  }
  if ($crawler.failures.Count -eq 0) {
    $data.alerts += [pscustomobject]@{ severity = 'good'; text = "AI crawler access terminal-verified: $($crawler.checks) endpoint checks passed." }
  } else {
    $data.alerts += [pscustomobject]@{ severity = 'crit'; text = "AI crawler access regression: $($crawler.failures -join '; ')." }
  }
  Write-JsonFile -Value $data -Path $DataPath

  $baseline = Get-Content -Raw -LiteralPath $BaselinePath -Encoding UTF8 | ConvertFrom-Json
  $baseline.generated = $end.ToString('yyyy-MM-dd')
  $baseline.window.end = $end.ToString('yyyy-MM-dd')
  $baseline.PSObject.Properties.Remove('revops_verified')
  $baseline.PSObject.Properties.Remove('contact_sources_ytd')
  Set-ObjectProperty -Object $baseline -Name 'channel_revenue_live' -Value ([pscustomobject][ordered]@{
    asOf = $end.ToString('yyyy-MM-dd')
    window = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    methodology = 'Strict deal-level Original Traffic Source; associated-contact-only and LINEAR touch attribution excluded.'
    totalWon = $selectedTotal
    deals = $selectedDeals.Count
    byChannel = $channelRows
  })
  $sourceCountObject = [ordered]@{}
  foreach ($key in @($sourceCounts.Keys | Sort-Object)) { $sourceCountObject[$key] = $sourceCounts[$key] }
  Set-ObjectProperty -Object $baseline -Name 'contact_sources_window' -Value ([pscustomobject]$sourceCountObject)
  $aeoCountObject = [ordered]@{}
  foreach ($row in $aeoRows) { $aeoCountObject[$row.platform] = $row.contacts }
  Set-ObjectProperty -Object $baseline -Name 'aeo_referrals_window' -Value ([pscustomobject]$aeoCountObject)
  Write-JsonFile -Value $baseline -Path $BaselinePath

  $published = $false
  if ($Publish) {
    $branch = (& git -C $RepoRoot branch --show-current).Trim()
    if (!$branch) { throw 'Cannot publish the dashboard from a detached Git HEAD.' }
    $paths = @(
      'site-analytics-dashboard/data.json',
      '02_FullTimeJob/AlignHCM/Watchdog/baseline.json'
    )
    $todayReport = "02_FullTimeJob/AlignHCM/Watchdog/reports/$($end.ToString('yyyy-MM-dd')).md"
    if (Test-Path -LiteralPath (Join-Path $RepoRoot $todayReport)) { $paths += $todayReport }
    & git -C $RepoRoot add -- @paths
    $staged = @(& git -C $RepoRoot diff --cached --name-only)
    if ($staged.Count -gt 0) {
      & git -C $RepoRoot commit -m "watchdog: daily report $($end.ToString('yyyy-MM-dd'))"
      if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
      & git -C $RepoRoot push origin HEAD
      if ($LASTEXITCODE -ne 0) { throw 'Git push failed.' }
      $published = $true
    }
  }

  [pscustomobject]@{
    portalId = $ExpectedPortalId
    window = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    selectedChannelWon = $selectedTotal
    selectedChannelDeals = $selectedDeals.Count
    byChannel = $channelRows
    onlineContactsInWindow = $onlineContacts.Count
    totalContactsInWindow = $contacts.Count
    crawlerChecks = $crawler.checks
    crawlerFailures = @($crawler.failures)
    published = $published
  } | ConvertTo-Json -Depth 8
} finally {
  $token = $null
}
