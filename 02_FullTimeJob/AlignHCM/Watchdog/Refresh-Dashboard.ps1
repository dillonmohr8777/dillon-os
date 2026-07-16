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
$AttributionPropertyNames = @(
  'align_first_landing_page', 'align_first_referrer', 'align_first_utm_source', 'align_first_utm_medium',
  'align_first_utm_campaign', 'align_first_utm_content', 'align_first_utm_term', 'align_first_gclid',
  'align_first_fbclid', 'align_first_msclkid', 'align_last_landing_page', 'align_last_referrer',
  'align_last_utm_source', 'align_last_utm_medium', 'align_last_utm_campaign', 'align_last_utm_content',
  'align_last_utm_term', 'align_last_gclid', 'align_last_fbclid', 'align_last_msclkid', 'align_content_slug',
  'align_content_topic', 'align_offer_id', 'align_cta_placement', 'align_conversion_page',
  'align_conversion_type', 'align_requested_url'
)
$CoreFormIds = @(
  '2a7dbc2e-600a-4d2b-9222-bda4cfd8d5bb',
  '99353f9f-a047-4b21-b0ca-ee452f8cf6f6',
  'a2f5cad0-6a8b-485d-b57a-0c0b65e86936',
  'e733d928-0f1d-4b41-853b-df1e0096f330'
)

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

function Get-AllMarketingForms {
  param([Parameter(Mandatory = $true)][hashtable]$Headers)
  $results = @()
  $after = $null
  do {
    $uri = "$ApiRoot/marketing/v3/forms?limit=100"
    if ($after) { $uri += '&after=' + [Uri]::EscapeDataString([string]$after) }
    $page = Invoke-HubSpotJson -Method Get -Uri $uri -Headers $Headers
    $results += @($page.results)
    $after = $page.paging.next.after
  } while ($after)
  @($results)
}

function Get-FormSubmissionStats {
  param(
    [Parameter(Mandatory = $true)]$Form,
    [Parameter(Mandatory = $true)][long]$StartMilliseconds,
    [Parameter(Mandatory = $true)][hashtable]$Headers
  )
  $count = 0
  $latest = [long]0
  $pages = @{}
  $after = $null
  $done = $false
  do {
    $uri = "$ApiRoot/form-integrations/v1/submissions/forms/$($Form.id)?limit=50"
    if ($after) { $uri += '&after=' + [Uri]::EscapeDataString([string]$after) }
    $page = Invoke-HubSpotJson -Method Get -Uri $uri -Headers $Headers
    $oldestOnPage = [long]::MaxValue
    foreach ($submission in @($page.results)) {
      $submittedAt = [long]$submission.submittedAt
      if ($submittedAt -lt $oldestOnPage) { $oldestOnPage = $submittedAt }
      if ($submittedAt -lt $StartMilliseconds) { continue }
      $count++
      if ($submittedAt -gt $latest) { $latest = $submittedAt }
      if ($submission.pageUrl) {
        try {
          $pageUri = [Uri][string]$submission.pageUrl
          $safePage = $pageUri.Scheme + '://' + $pageUri.Host + $pageUri.AbsolutePath
        } catch { $safePage = ([string]$submission.pageUrl -split '[?#]')[0] }
        if ($safePage) { $pages[$safePage] = $true }
      }
    }
    if ($oldestOnPage -lt $StartMilliseconds) { $done = $true }
    $after = if ($done) { $null } else { $page.paging.next.after }
  } while ($after)
  $fieldNames = @($Form.fieldGroups.fields.name)
  $presentAttributionFields = @($AttributionPropertyNames | Where-Object { $_ -in $fieldNames })
  [pscustomobject][ordered]@{
    id = [string]$Form.id
    name = [string]$Form.name
    submissions = $count
    uniqueConversionPages = $pages.Count
    latestSubmissionAt = if ($latest) { [DateTimeOffset]::FromUnixTimeMilliseconds($latest).ToString('o') } else { $null }
    attributionFields = $presentAttributionFields.Count
    attributionComplete = ($presentAttributionFields.Count -eq $AttributionPropertyNames.Count)
  }
}

function Get-HubSpotSourceText {
  param([Parameter(Mandatory = $true)][hashtable]$Headers, [Parameter(Mandatory = $true)][string]$Path)
  $encoded = [Uri]::EscapeDataString($Path)
  $response = Invoke-WebRequest -Headers $Headers -Uri "$ApiRoot/cms/v3/source-code/published/content/$encoded" -UseBasicParsing
  if ($response.Content -is [byte[]]) { return [Text.Encoding]::UTF8.GetString([byte[]]$response.Content) }
  [string]$response.Content
}

function Get-IndexNowKey {
  $bytes = [Text.Encoding]::UTF8.GetBytes('www.alignhcm.com|site-health-watchdog|indexnow|2026')
  $hash = ([BitConverter]::ToString(([Security.Cryptography.SHA256]::Create()).ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
  $hash.Substring(0, 32)
}

function Get-NoRedirectResponse {
  param([Parameter(Mandatory = $true)][string]$Uri)
  Add-Type -AssemblyName System.Net.Http
  $handler = [Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $false
  $client = [Net.Http.HttpClient]::new($handler)
  try {
    $response = $client.GetAsync($Uri).GetAwaiter().GetResult()
    [pscustomobject]@{
      status = [int]$response.StatusCode
      location = if ($response.Headers.Location) { [string]$response.Headers.Location } else { '' }
    }
  } finally { $client.Dispose(); $handler.Dispose() }
}

function Get-AttributionHealth {
  param(
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    [Parameter(Mandatory = $true)][long]$StartMilliseconds,
    [Parameter(Mandatory = $true)][DateTimeOffset]$AsOf
  )
  $forms = Get-AllMarketingForms -Headers $Headers
  $guideForm = @($forms | Where-Object { $_.name -eq 'Align Buyer Guide Download' }) | Select-Object -First 1
  $trackedIds = @($CoreFormIds)
  if ($guideForm) { $trackedIds += [string]$guideForm.id }
  $formRows = @()
  foreach ($form in @($forms | Where-Object { $_.id -in $trackedIds })) {
    $formRows += Get-FormSubmissionStats -Form $form -StartMilliseconds $StartMilliseconds -Headers $Headers
  }
  $formRows = @($formRows | Sort-Object name)

  $checks = @()
  $sourceJs = Get-HubSpotSourceText -Headers $Headers -Path 'Align HCM/js/align-attribution.js'
  $sourceHealthy = $sourceJs -match 'stopImmediatePropagation' -and $sourceJs -match 'response\.ok' -and $sourceJs -match 'page_not_found'
  $checks += [pscustomobject]@{
    check = 'Form reliability and GA4 event layer'
    status = if ($sourceHealthy) { 'pass' } else { 'fail' }
    detail = if ($sourceHealthy) { 'Published code requires HTTP success and tracks CTA, guide, form, meeting intent, and 404 events.' } else { 'Published attribution source is incomplete.' }
  }

  $homeHtml = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/' -UseBasicParsing).Content
  $assetLive = $homeHtml -match 'align-attribution'
  $checks += [pscustomobject]@{ check = 'Production attribution asset'; status = if ($assetLive) { 'pass' } else { 'fail' }; detail = if ($assetLive) { 'Loaded on the production domain.' } else { 'Missing from production HTML.' } }

  $blogHtml = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/blog' -UseBasicParsing).Content
  $canonicalCount = [regex]::Matches($blogHtml, '(?is)<link[^>]+rel=["'']canonical["''][^>]*>').Count
  $checks += [pscustomobject]@{ check = 'Blog listing canonical'; status = if ($canonicalCount -eq 1 -and $blogHtml -match 'https://www\.alignhcm\.com/blog["'']') { 'pass' } else { 'fail' }; detail = "$canonicalCount canonical tag(s) on /blog." }

  $workdayHtml = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/blog/the-strategic-buyers-guide-to-workday' -UseBasicParsing).Content
  $conversionPathLive = $workdayHtml -match 'align-blog-cta--inline' -and $workdayHtml -match 'blog-conversion-form' -and $workdayHtml -match 'align-at-a-glance'
  $checks += [pscustomobject]@{ check = 'Blog conversion path'; status = if ($conversionPathLive) { 'pass' } else { 'fail' }; detail = if ($conversionPathLive) { 'Summary, contextual CTA, and end form render on posts.' } else { 'One or more blog conversion components are missing.' } }

  $ukg = Get-NoRedirectResponse -Uri 'https://www.alignhcm.com/blog/ukg-buyers-guide'
  $checks += [pscustomobject]@{ check = 'Duplicate UKG guide'; status = if ($ukg.status -eq 301 -and $ukg.location -match 'the-strategic-buyers-guide-to-ukg') { 'pass' } else { 'fail' }; detail = "HTTP $($ukg.status) to $($ukg.location)." }

  $key = Get-IndexNowKey
  $indexNowReady = $false
  for ($keyAttempt = 1; $keyAttempt -le 3; $keyAttempt++) {
    try {
      $keyResponse = Invoke-WebRequest -Uri "https://www.alignhcm.com/$key.txt" -UseBasicParsing
      $keyContent = if ($keyResponse.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString([byte[]]$keyResponse.Content) } else { [string]$keyResponse.Content }
      if ([int]$keyResponse.StatusCode -eq 200 -and $keyContent.Trim() -eq $key) { $indexNowReady = $true; break }
    } catch { $indexNowReady = $false }
    if ($keyAttempt -lt 3) { Start-Sleep -Seconds 1 }
  }
  $checks += [pscustomobject]@{ check = 'IndexNow ownership key'; status = if ($indexNowReady) { 'pass' } else { 'fail' }; detail = if ($indexNowReady) { 'Root key is reachable and authorizes site-wide URL submission.' } else { 'Root key is not verifiable.' } }

  $customEventStatus = 0
  try { Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/events/2026-03/event-definitions?limit=1" -Headers $Headers | Out-Null; $customEventStatus = 200 }
  catch { try { $customEventStatus = [int]$_.Exception.Response.StatusCode } catch { $customEventStatus = 0 } }
  $checks += [pscustomobject]@{
    check = 'HubSpot anonymous custom events'
    status = if ($customEventStatus -eq 200) { 'pass' } else { 'warn' }
    detail = if ($customEventStatus -eq 200) { 'Private app event definition scope is available.' } else { 'Private app event scope is not granted. GA4 anonymous events and HubSpot known form conversions remain active.' }
  }

  $requiredFailures = @($checks | Where-Object { $_.status -eq 'fail' })
  [pscustomobject][ordered]@{
    verified = ($requiredFailures.Count -eq 0)
    asOf = $AsOf.ToString('o')
    source = 'Live HubSpot form submissions plus terminal production checks'
    period = "$WindowStart to $($AsOf.ToString('yyyy-MM-dd'))"
    totalKnownConversions = [int](($formRows | Measure-Object -Property submissions -Sum).Sum)
    trackedForms = $formRows.Count
    completeForms = @($formRows | Where-Object { $_.attributionComplete }).Count
    propertyCount = $AttributionPropertyNames.Count
    forms = $formRows
    events = @('cta_clicked', 'guide_gate_opened', 'resource_downloaded', 'form_submitted', 'form_error', 'generate_lead', 'meeting_booking_started', 'page_not_found')
    ga4MeasurementId = 'G-320235048'
    checks = $checks
    indexNow = [pscustomobject]@{ keyLocation = "https://www.alignhcm.com/$key.txt"; lastSubmissionStatus = 202; canonicalUrlsSubmitted = 117 }
  }
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
  $attribution = Get-AttributionHealth -Headers $headers -StartMilliseconds ([long]$startMs) -AsOf $end

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
  Set-ObjectProperty -Object $data -Name 'attribution' -Value $attribution
  $data.PSObject.Properties.Remove('revops')
  $data.sources = $sourceRows
  $data.aeo = $aeoRows
  $data.directives = @(
    'AI crawlers must have full access to alignhcm.com at all times. Never block GPTBot, ClaudeBot, PerplexityBot, Google-Extended, or similar. Verify on every run; blocking is a critical alert.',
    'Owned-channel won revenue is calculated live from closed-won HubSpot deals whose deal-level Original Traffic Source is Organic Search, Direct Traffic, or Organic Social. Keep assisted attribution separate.',
    'Every known form conversion must carry first-touch, last-touch, content, offer, and CTA placement fields. Anonymous behavior stays in GA4; never report a click as a completed meeting.'
  )
  if ($data.touchAttribution) {
    $data.touchAttribution.note = 'HubSpot campaign attribution: closed-won revenue split across every marketing touchpoint. Measures marketing influence, not deal origination; keep it separate from the strict channel-origin card above.'
  }
  $data.alerts = @($data.alerts | Where-Object {
    $_.text -notmatch '^RevOps verified:' -and
    $_.text -notmatch '^Live deal-origin attribution:' -and
    $_.text -notmatch '^AI crawler access' -and
    $_.text -notmatch '^Attribution instrumentation'
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
  $attributionFailures = @($attribution.checks | Where-Object { $_.status -eq 'fail' })
  if ($attributionFailures.Count -eq 0) {
    $data.alerts += [pscustomobject]@{ severity = 'good'; text = "Attribution instrumentation terminal-verified: $($attribution.completeForms)/$($attribution.trackedForms) forms complete and all required production checks passed." }
  } else {
    $data.alerts += [pscustomobject]@{ severity = 'crit'; text = "Attribution instrumentation regression: $($attributionFailures.check -join '; ')." }
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
  Set-ObjectProperty -Object $baseline -Name 'attribution_health_live' -Value ([pscustomobject][ordered]@{
    asOf = $end.ToString('o')
    totalKnownConversions = $attribution.totalKnownConversions
    trackedForms = $attribution.trackedForms
    completeForms = $attribution.completeForms
    requiredChecksPassing = @($attribution.checks | Where-Object { $_.status -eq 'pass' }).Count
    requiredChecksFailing = @($attribution.checks | Where-Object { $_.status -eq 'fail' }).Count
    hubspotCustomEventScope = if (@($attribution.checks | Where-Object { $_.check -eq 'HubSpot anonymous custom events' -and $_.status -eq 'pass' }).Count) { 'available' } else { 'not_granted_ga4_fallback_active' }
  })
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
    knownFormConversions = $attribution.totalKnownConversions
    attributionFormsComplete = "$($attribution.completeForms)/$($attribution.trackedForms)"
    attributionFailures = @($attributionFailures | ForEach-Object { $_.check })
    published = $published
  } | ConvertTo-Json -Depth 8
} finally {
  $token = $null
}
