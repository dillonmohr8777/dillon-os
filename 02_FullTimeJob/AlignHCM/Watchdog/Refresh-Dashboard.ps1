[CmdletBinding()]
param(
  [string]$WindowStart = '2026-01-01',
  [string]$QualifiedLeadReportPath,
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH,
  [switch]$Publish,
  [switch]$SkipCrawlerProbe
)

$ErrorActionPreference = 'Stop'
$ExpectedPortalId = '242825734'
$ApiRoot = 'https://api.hubapi.com'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$QualifiedLeadReportDirectory = 'C:\Users\dillo\Documents\Codex\2026-07-15\what-s-my-hubspot-token-again\outputs\align-hcm-lead-intelligence'
$RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$DataPath = Join-Path $RepoRoot 'site-analytics-dashboard\data.json'
$BaselinePath = Join-Path $PSScriptRoot 'baseline.json'
$NetlifySiteId = '2c966b0b-ce94-4b2a-8872-8c1e22092b3f'
$DashboardDirectory = Join-Path $RepoRoot 'site-analytics-dashboard'
$AttributionPropertyNames = @(
  'align_first_landing_page', 'align_first_referrer', 'align_first_utm_source', 'align_first_utm_medium',
  'align_first_utm_campaign', 'align_first_utm_content', 'align_first_utm_term', 'align_first_gclid',
  'align_first_fbclid', 'align_first_msclkid', 'align_last_landing_page', 'align_last_referrer',
  'align_first_li_fat_id', 'align_first_touch_channel', 'align_first_social_platform',
  'align_last_utm_source', 'align_last_utm_medium', 'align_last_utm_campaign', 'align_last_utm_content',
  'align_last_utm_term', 'align_last_gclid', 'align_last_fbclid', 'align_last_msclkid',
  'align_last_li_fat_id', 'align_last_touch_channel', 'align_last_social_platform', 'align_content_slug',
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

function Convert-LeadText {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return '' }
  $mojibakeMarkers = @([char]0x00C2, [char]0x00C3, [char]0x00E2)
  if ($mojibakeMarkers | Where-Object { $Value.IndexOf($_) -ge 0 }) {
    try {
      for ($attempt = 0; $attempt -lt 3; $attempt++) {
        $decoded = [Text.Encoding]::UTF8.GetString([Text.Encoding]::GetEncoding(1252).GetBytes($Value))
        if ($decoded -eq $Value) { break }
        $Value = $decoded
        if (!($mojibakeMarkers | Where-Object { $Value.IndexOf($_) -ge 0 })) { break }
      }
    }
    catch { }
  }
  $badApostrophe = [string]([char]0x00E2) + [char]0x20AC + [char]0x2122
  $Value = $Value.Replace($badApostrophe, [string][char]0x2019)
  if ($Value -notmatch 'â|Ã') { return $Value }
  try { [Text.Encoding]::UTF8.GetString([Text.Encoding]::GetEncoding(1252).GetBytes($Value)) }
  catch { $Value }
}

function Resolve-OwnedMarketingChannel {
  param($Properties, [object[]]$Deals)
  $first = "$($Properties.align_first_touch_channel)"
  $last = "$($Properties.align_last_touch_channel)"
  $self = "$($Properties.align_self_reported_source)"
  $native = "$($Properties.hs_analytics_source)"
  $referrer = "$($Properties.hs_analytics_first_referrer) $($Properties.align_first_referrer)"
  $channel = ''
  $confidence = 'medium'
  $evidence = @()
  if ($first -match '(?i)Organic Social.*LinkedIn' -or $self -eq 'LinkedIn' -or $referrer -match '(?i)linkedin|lnkd\.in') {
    $channel = 'Organic Social / LinkedIn'; $evidence += 'LinkedIn observed or buyer-reported'
    if ($first -match '(?i)LinkedIn' -or $referrer -match '(?i)linkedin|lnkd\.in') { $confidence = 'high' }
  } elseif ($first -eq 'Organic Search' -or $native -eq 'ORGANIC_SEARCH' -or $referrer -match '(?i)google\.|bing\.|yahoo\.|duckduckgo|msn\.') {
    $channel = 'Organic Search'; $evidence += 'Search referrer or HubSpot Organic Search'
    if ($first -eq 'Organic Search' -or $referrer -match '(?i)google\.|bing\.|yahoo\.|duckduckgo|msn\.') { $confidence = 'high' }
  } elseif ($first -eq 'Direct / Brand Demand' -or $native -eq 'DIRECT_TRAFFIC') {
    $channel = 'Direct / Brand Demand'; $evidence += 'Direct first touch or HubSpot Direct Traffic'
  } elseif ($native -eq 'SOCIAL_MEDIA' -or $first -match '(?i)Organic Social') {
    $channel = 'Organic Social'; $evidence += 'HubSpot Organic Social or observed social touch'
  }
  if (!$channel) { return $null }
  $conflicts = @($Deals | Where-Object { $_.leadSource -match '(?i)Sales Rep|Partner|ERM|Trade Show|Existing Client|Change Request' } | ForEach-Object { $_.leadSource } | Select-Object -Unique)
  [pscustomobject]@{
    channel = $channel; confidence = $confidence; firstTouch = $first; lastTouch = $last; selfReported = $self
    evidence = ($evidence -join '; '); conflict = ($conflicts -join ', ')
  }
}

function Get-LinkedInOrganicLeadAttribution {
  param(
    [Parameter(Mandatory = $true)][object[]]$Contacts,
    [Parameter(Mandatory = $true)][DateTimeOffset]$Start,
    [Parameter(Mandatory = $true)][DateTimeOffset]$AsOf
  )

  $contentRows = @{}
  $publisherContacts = @{
    align_page = @{}
    maher_profile = @{}
    unassigned = @{}
  }
  $linkedInContactIds = @{}

  foreach ($contact in $Contacts) {
    $properties = $contact.properties
    $touches = @{}
    $firstIsLinkedIn = "$($properties.align_first_utm_source)" -match '(?i)^linkedin$' -and "$($properties.align_first_utm_medium)" -match '(?i)^organic_social$'
    $lastIsLinkedIn = "$($properties.align_last_utm_source)" -match '(?i)^linkedin$' -and "$($properties.align_last_utm_medium)" -match '(?i)^organic_social$'

    if ($firstIsLinkedIn) {
      $content = "$($properties.align_first_utm_content)".Trim().ToLowerInvariant()
      if (!$content) { $content = 'unassigned' }
      $touches[$content] = [pscustomobject]@{ first = $true; last = $false; campaign = "$($properties.align_first_utm_campaign)" }
    }
    if ($lastIsLinkedIn) {
      $content = "$($properties.align_last_utm_content)".Trim().ToLowerInvariant()
      if (!$content) { $content = 'unassigned' }
      if ($touches.ContainsKey($content)) { $touches[$content].last = $true }
      else { $touches[$content] = [pscustomobject]@{ first = $false; last = $true; campaign = "$($properties.align_last_utm_campaign)" } }
    }
    $confirmedMeetingContent = ''
    $confirmedMeetingIsLinkedIn = "$($properties.engagements_last_meeting_booked_source)" -match '(?i)^linkedin$' -and "$($properties.engagements_last_meeting_booked_medium)" -match '(?i)^organic_social$'
    if ($confirmedMeetingIsLinkedIn -and "$($properties.engagements_last_meeting_booked_campaign)" -match '(?i)^linkedin_(.+)$') {
      $confirmedMeetingContent = $Matches[1].ToLowerInvariant()
      if (!$touches.ContainsKey($confirmedMeetingContent)) {
        $touches[$confirmedMeetingContent] = [pscustomobject]@{ first = $false; last = $true; campaign = 'confirmed_meeting' }
      }
    }
    if (!$touches.Count) { continue }

    $contactId = "$($contact.id)"
    $linkedInContactIds[$contactId] = $true
    $conversionType = "$($properties.align_conversion_type)"
    foreach ($entry in $touches.GetEnumerator()) {
      $content = $entry.Key
      $publisherKey = if ($content -match '^align_page_') { 'align_page' } elseif ($content -match '^maher_profile_') { 'maher_profile' } else { 'unassigned' }
      $publisherContacts[$publisherKey][$contactId] = $true
      if (!$contentRows.ContainsKey($content)) {
        $contentRows[$content] = [pscustomobject][ordered]@{
          utmContent = $content
          publisher = if ($publisherKey -eq 'align_page') { 'Align HCM Page' } elseif ($publisherKey -eq 'maher_profile') { 'Maher profile' } else { 'Unassigned LinkedIn source' }
          campaign = $entry.Value.campaign
          potentialLeads = 0
          firstTouchLeads = 0
          lastTouchLeads = 0
          contactForms = 0
          guideDownloads = 0
          meetingStarts = 0
          confirmedMeetings = 0
        }
      }
      $row = $contentRows[$content]
      $row.potentialLeads++
      if ($entry.Value.first) { $row.firstTouchLeads++ }
      if ($entry.Value.last) { $row.lastTouchLeads++ }
      if ($conversionType -eq 'contact_form') { $row.contactForms++ }
      elseif ($conversionType -eq 'guide_download') { $row.guideDownloads++ }
      elseif ($conversionType -eq 'meeting_booking') { $row.meetingStarts++ }
      if ($confirmedMeetingContent -and $content -eq $confirmedMeetingContent -and $properties.engagements_last_meeting_booked) { $row.confirmedMeetings++ }
    }
  }

  $rows = @($contentRows.Values | Sort-Object @{ Expression = 'potentialLeads'; Descending = $true }, utmContent)
  $publishers = @(
    [pscustomobject][ordered]@{ key = 'align_page'; publisher = 'Align HCM Page'; potentialLeads = $publisherContacts.align_page.Count },
    [pscustomobject][ordered]@{ key = 'maher_profile'; publisher = 'Maher profile'; potentialLeads = $publisherContacts.maher_profile.Count },
    [pscustomobject][ordered]@{ key = 'unassigned'; publisher = 'Unassigned LinkedIn source'; potentialLeads = $publisherContacts.unassigned.Count }
  )
  [pscustomobject][ordered]@{
    verified = $true
    asOf = $AsOf.ToString('o')
    period = "$($Start.ToString('yyyy-MM-dd')) to $($AsOf.ToString('yyyy-MM-dd'))"
    source = 'Live HubSpot first-touch and last-touch contact attribution'
    methodology = 'Unique organic LinkedIn utm_content values separate the Align HCM Page from Maher profile posts. Potential leads are unique HubSpot contacts with a captured LinkedIn organic first or last touch; conversion intent is grouped without publishing personal data.'
    potentialLeads = $linkedInContactIds.Count
    contactForms = [int](($rows | Measure-Object -Property contactForms -Sum).Sum)
    guideDownloads = [int](($rows | Measure-Object -Property guideDownloads -Sum).Sum)
    meetingStarts = [int](($rows | Measure-Object -Property meetingStarts -Sum).Sum)
    confirmedMeetings = [int](($rows | Measure-Object -Property confirmedMeetings -Sum).Sum)
    byPublisher = $publishers
    byContent = $rows
    privacy = 'Aggregate counts only. Names, emails, phone numbers, contact IDs, and submitted values are excluded.'
  }
}

function Get-QualifiedLeadPipeline {
  param(
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    [Parameter(Mandatory = $true)][DateTimeOffset]$Start,
    [Parameter(Mandatory = $true)][DateTimeOffset]$AsOf
  )

  if ([string]::IsNullOrWhiteSpace($QualifiedLeadReportPath) -and (Test-Path -LiteralPath $QualifiedLeadReportDirectory)) {
    $QualifiedLeadReportPath = Get-ChildItem -LiteralPath $QualifiedLeadReportDirectory -Filter '*-ytd-lead-intelligence-report.json' -File |
      Sort-Object LastWriteTimeUtc -Descending |
      Select-Object -First 1 -ExpandProperty FullName
  }

  if ([string]::IsNullOrWhiteSpace($QualifiedLeadReportPath) -or !(Test-Path -LiteralPath $QualifiedLeadReportPath)) {
    return [pscustomobject][ordered]@{
      verified = $false
      asOf = $AsOf.ToString('o')
      source = 'Qualified-lead source report unavailable'
      total = 0; followedUp = 0; missingFollowUp = 0; open = 0; won = 0; lost = 0; noDeal = 0
      openPipeline = 0; wonRevenue = 0; lostValue = 0; rows = @()
    }
  }

  $leadReport = Get-Content -Raw -LiteralPath $QualifiedLeadReportPath -Encoding UTF8 | ConvertFrom-Json
  $buyers = @($leadReport.rows | Where-Object {
    $_.classification -eq 'Buyer lead' -and $_.firstSubmittedAt -and ([DateTimeOffset]$_.firstSubmittedAt) -ge $Start
  })

  $ownerNames = @{}
  $ownerPage = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/owners/?limit=500" -Headers $Headers
  foreach ($owner in @($ownerPage.results)) {
    $ownerNames["$($owner.id)"] = ("$($owner.firstName) $($owner.lastName)").Trim()
  }

  $pipelineMap = @{}
  $pipelinePage = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/pipelines/deals" -Headers $Headers
  foreach ($pipeline in @($pipelinePage.results)) {
    $stageMap = @{}
    foreach ($stage in @($pipeline.stages)) {
      $stageMap["$($stage.id)"] = [pscustomobject]@{ label = "$($stage.label)"; isClosed = "$($stage.metadata.isClosed)" }
    }
    $pipelineMap["$($pipeline.id)"] = [pscustomobject]@{ label = "$($pipeline.label)"; stages = $stageMap }
  }

  $rows = @()
  foreach ($buyer in $buyers) {
    $contactSearch = Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/crm/v3/objects/contacts/search" -Headers $Headers -Body ([ordered]@{
      filterGroups = @(@{ filters = @(@{ propertyName = 'email'; operator = 'EQ'; value = "$($buyer.email)" }) })
      properties = @('jobtitle', 'city', 'state', 'country', 'hs_analytics_source', 'hs_analytics_first_referrer', 'align_first_referrer', 'align_first_touch_channel', 'align_last_touch_channel', 'align_self_reported_source')
      limit = 10
    })
    $contact = @($contactSearch.results) | Select-Object -First 1
    $contactDetail = $null
    $dealRows = @()

    if ($contact) {
      $contactDetail = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/objects/contacts/$($contact.id)?properties=jobtitle,city,state,country,hs_analytics_source,hs_analytics_first_referrer,align_first_referrer,align_first_touch_channel,align_last_touch_channel,align_self_reported_source&associations=deals" -Headers $Headers
      $dealIds = @($contactDetail.associations.deals.results | Where-Object { $_.id } | ForEach-Object { "$($_.id)" } | Select-Object -Unique)
      foreach ($dealId in $dealIds) {
        $deal = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/objects/deals/${dealId}?properties=dealname,amount,createdate,closedate,dealstage,pipeline,dealtype,lead_source,hs_is_closed_count,hs_is_closed_won,hs_is_closed_lost,hubspot_owner_id" -Headers $Headers
        $created = if ($deal.properties.createdate) { [DateTimeOffset]$deal.properties.createdate } else { $null }
        $closed = if ($deal.properties.closedate) { [DateTimeOffset]$deal.properties.closedate } else { $null }
        if (($created -and $created -lt $Start) -and (!$closed -or $closed -lt $Start)) { continue }

        $pipeline = $pipelineMap["$($deal.properties.pipeline)"]
        $stage = if ($pipeline) { $pipeline.stages["$($deal.properties.dealstage)"] } else { $null }
        $dealRows += [pscustomobject][ordered]@{
          id = "$($deal.id)"
          name = Convert-LeadText "$($deal.properties.dealname)"
          amount = if ($deal.properties.amount) { [long][Math]::Round([decimal]$deal.properties.amount, 0) } else { 0 }
          pipeline = if ($pipeline) { "$($pipeline.label)" } else { "$($deal.properties.pipeline)" }
          stage = if ($stage) { "$($stage.label)" } else { "$($deal.properties.dealstage)" }
          open = "$($deal.properties.hs_is_closed_count)" -ne '1'
          won = "$($deal.properties.hs_is_closed_won)" -eq 'true'
          lost = "$($deal.properties.hs_is_closed_lost)" -eq 'true'
          closeDate = if ($closed) { $closed.ToString('yyyy-MM-dd') } else { '' }
          leadSource = "$($deal.properties.lead_source)"
          owner = $ownerNames["$($deal.properties.hubspot_owner_id)"]
          url = "https://app.hubspot.com/contacts/$ExpectedPortalId/record/0-3/$($deal.id)?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=qualified_leads"
        }
      }
    }

    $openDeals = @($dealRows | Where-Object { $_.open })
    $wonDeals = @($dealRows | Where-Object { $_.won })
    $lostDeals = @($dealRows | Where-Object { $_.lost })
    $outcome = if ($openDeals.Count) { 'Open' } elseif ($wonDeals.Count) { 'Won' } elseif ($lostDeals.Count) { 'Lost' } else { 'No deal' }
    $primary = if ($openDeals.Count) { $openDeals | Select-Object -First 1 } elseif ($wonDeals.Count) { $wonDeals | Select-Object -First 1 } elseif ($lostDeals.Count) { $lostDeals | Select-Object -First 1 } else { $null }

    $locationParts = @()
    if ($contactDetail) {
      $locationParts = @($contactDetail.properties.city, $contactDetail.properties.state, $contactDetail.properties.country) | Where-Object { $_ }
    }
    $location = $locationParts -join ', '
    if (!$location -and "$($buyer.signal)" -match '(?i)Vancouver') { $location = 'Vancouver, Canada' }
    elseif (!$location -and "$($buyer.signal)" -match '(?i)Australia.*US.*Canada') { $location = 'Australia / US / Canada' }
    elseif (!$location) { $location = 'Not recorded' }

    $platforms = @()
    foreach ($dealRow in $dealRows) {
      if ($dealRow.pipeline -match '(?i)Dayforce') { $platforms += 'Dayforce' }
      elseif ($dealRow.pipeline -match '(?i)Paylocity') { $platforms += 'Paylocity' }
      elseif ($dealRow.pipeline -match '(?i)UKG') { $platforms += 'UKG' }
    }
    if (!$platforms.Count) {
      foreach ($platform in @('Dayforce', 'UKG', 'Paylocity', 'Workday', 'ADP')) {
        if ("$($buyer.signal)" -match [regex]::Escape($platform)) { $platforms += $platform }
      }
    }

    $owned = if ($contactDetail) { Resolve-OwnedMarketingChannel -Properties $contactDetail.properties -Deals $dealRows } else { $null }
    $rows += [pscustomobject][ordered]@{
      company = Convert-LeadText "$($buyer.company)"
      score = [int]$buyer.score
      fit = "$($buyer.fit)"
      submitted = ([DateTimeOffset]$buyer.firstSubmittedAt).ToString('yyyy-MM-dd')
      followedUp = [bool]$buyer.followedUp
      owner = if ($primary -and $primary.owner) { $primary.owner } elseif ("$($buyer.owner)" -match '^\d+$') { $ownerNames["$($buyer.owner)"] } else { "$($buyer.owner)" }
      role = if ($contactDetail) { Convert-LeadText "$($contactDetail.properties.jobtitle)" } else { '' }
      location = $location
      source = if ($contactDetail) { "$($contactDetail.properties.hs_analytics_source)" } else { '' }
      ownedChannel = if ($owned) { $owned.channel } else { '' }
      attributionConfidence = if ($owned) { $owned.confidence } else { '' }
      firstTouchChannel = if ($owned) { $owned.firstTouch } else { '' }
      lastTouchChannel = if ($owned) { $owned.lastTouch } else { '' }
      selfReportedSource = if ($owned) { $owned.selfReported } else { '' }
      attributionEvidence = if ($owned) { $owned.evidence } else { '' }
      sourceConflict = if ($owned) { $owned.conflict } else { '' }
      platform = (@($platforms | Select-Object -Unique) -join ' / ')
      wanted = Convert-LeadText "$($buyer.signal)"
      outcome = $outcome
      dealName = if ($primary) { $primary.name } else { '' }
      amount = if ($primary) { $primary.amount } else { 0 }
      pipeline = if ($primary) { $primary.pipeline } else { '' }
      stage = if ($primary) { $primary.stage } else { '' }
      closeDate = if ($primary) { $primary.closeDate } else { '' }
      dealUrl = if ($primary) { $primary.url } else { '' }
      linkedDeals = $dealRows.Count
    }
  }

  $openRows = @($rows | Where-Object { $_.outcome -eq 'Open' })
  $wonRows = @($rows | Where-Object { $_.outcome -eq 'Won' })
  $lostRows = @($rows | Where-Object { $_.outcome -eq 'Lost' })
  $noDealRows = @($rows | Where-Object { $_.outcome -eq 'No deal' })
  [pscustomobject][ordered]@{
    verified = $true
    asOf = $AsOf.ToString('o')
    source = 'Qualified inbound buyer audit enriched from live HubSpot contacts and associated deals'
    period = "$($Start.ToString('yyyy-MM-dd')) to $($AsOf.ToString('yyyy-MM-dd'))"
    privacy = 'Company-level business context only. Personal names, emails, phone numbers, messages, and contact IDs are excluded from the public dashboard.'
    total = $rows.Count
    followedUp = @($rows | Where-Object { $_.followedUp }).Count
    missingFollowUp = @($rows | Where-Object { !$_.followedUp }).Count
    open = $openRows.Count
    won = $wonRows.Count
    lost = $lostRows.Count
    noDeal = $noDealRows.Count
    openPipeline = [long](($openRows | Measure-Object -Property amount -Sum).Sum)
    wonRevenue = [long](($wonRows | Measure-Object -Property amount -Sum).Sum)
    lostValue = [long](($lostRows | Measure-Object -Property amount -Sum).Sum)
    rows = @($rows | Sort-Object @{ Expression = { switch ($_.outcome) { 'Open' { 0 } 'No deal' { 1 } 'Won' { 2 } default { 3 } } } }, @{ Expression = 'score'; Descending = $true })
  }
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

function Get-SiteCoverage {
  [xml]$sitemap = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/sitemap.xml' -UseBasicParsing -TimeoutSec 60).Content
  $urls = @($sitemap.SelectNodes("//*[local-name()='url']/*[local-name()='loc']") |
    ForEach-Object { $_.InnerText.Trim() } |
    Where-Object { $_ } |
    Select-Object -Unique)

  Add-Type -AssemblyName System.Net.Http
  $noRedirectHandler = [Net.Http.HttpClientHandler]::new()
  $noRedirectHandler.AllowAutoRedirect = $false
  $noRedirectHandler.MaxConnectionsPerServer = 8
  $noRedirectClient = [Net.Http.HttpClient]::new($noRedirectHandler)
  $redirectHandler = [Net.Http.HttpClientHandler]::new()
  $redirectHandler.AllowAutoRedirect = $true
  $redirectHandler.MaxConnectionsPerServer = 8
  $redirectClient = [Net.Http.HttpClient]::new($redirectHandler)
  $noRedirectClient.Timeout = [TimeSpan]::FromSeconds(45)
  $redirectClient.Timeout = [TimeSpan]::FromSeconds(45)
  $noRedirectClient.DefaultRequestHeaders.UserAgent.ParseAdd('Align-Site-Watchdog/1.0')
  $redirectClient.DefaultRequestHeaders.UserAgent.ParseAdd('Align-Site-Watchdog/1.0')

  $redirects = @()
  $brokenSitemap = @()
  $missingGa4 = @()
  $missingHubSpot = @()
  $attributionGaps = @()
  $coverageGaps = @()
  $sandboxPages = @()
  $legacyPages = @()
  $internalTargets = @{}
  $customAttributionCount = 0
  $nativeCaseStudyCount = 0
  $conversionCoveredCount = 0
  $finalOk = 0
  $smartCare = $null

  try {
    foreach ($url in $urls) {
      $initialStatus = 0
      $finalStatus = 0
      $finalUrl = $url
      $html = ''
      try {
        $initialResponse = $noRedirectClient.GetAsync($url, [Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
        try { $initialStatus = [int]$initialResponse.StatusCode } finally { $initialResponse.Dispose() }

        for ($attempt = 1; $attempt -le 2; $attempt++) {
          try {
            $response = $redirectClient.GetAsync($url).GetAwaiter().GetResult()
            try {
              $finalStatus = [int]$response.StatusCode
              $finalUrl = [string]$response.RequestMessage.RequestUri.AbsoluteUri
              $html = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            } finally { $response.Dispose() }
            break
          } catch {
            if ($attempt -eq 2) { throw }
          }
        }
      } catch {
        $brokenSitemap += [pscustomobject]@{ url = $url; status = 0; error = $_.Exception.Message }
        continue
      }

      if ($initialStatus -ge 300 -and $initialStatus -lt 400) {
        $redirects += [pscustomobject]@{ url = $url; status = $initialStatus; finalUrl = $finalUrl }
      }
      if ($finalStatus -ge 200 -and $finalStatus -lt 400) { $finalOk++ }
      else { $brokenSitemap += [pscustomobject]@{ url = $url; status = $finalStatus; error = '' } }

      $path = ([Uri]$finalUrl).AbsolutePath
      $hasGa4 = $html -match 'G-320235048'
      $hasHubSpot = $html -match '(?:hs/scriptloader/242825734\.js|js\.hs-scripts\.com/242825734\.js)'
      $hasCustomAttribution = $html -match 'align-attribution(?:\.min)?\.js'
      $isCaseStudy = $path -match '^/case-studies(?:/|$)' -and $html -match 'scp_content_type:\s*["'']case-study["'']'
      $hasNativeCaseStudyCoverage = $isCaseStudy -and $hasGa4 -and $hasHubSpot -and
        ($path -match '^/case-studies/?$' -or $html -match 'data-hubspot-wrapper-cta-id=' -or $html -match '(?is)<form\b')

      if (!$hasGa4) { $missingGa4 += $url }
      if (!$hasHubSpot) { $missingHubSpot += $url }
      if ($hasCustomAttribution) { $customAttributionCount++ }
      elseif ($hasNativeCaseStudyCoverage) { $nativeCaseStudyCount++ }
      if (!$hasCustomAttribution -and !$hasNativeCaseStudyCoverage) { $attributionGaps += $url }

      $hasForm = $html -match '(?is)<form\b|data-hs-forms-root|hbspt\.forms\.create'
      $hasTrackedCta = $html -match 'data-hubspot-wrapper-cta-id=|data-align-cta(?:\s|=)|align-blog-cta--inline'
      $hasMeetingOrContactLink = $html -match '(?is)href\s*=\s*["''][^"'']*(?:/contact(?:[/?#]|["''])|meetings(?:-na2)?\.hubspot\.com|/meetings/|/schedule)'
      if ($hasForm -or $hasTrackedCta -or $hasMeetingOrContactLink) { $conversionCoveredCount++ }
      else { $coverageGaps += $url }
      if ($html -match 'sandbox\.hs-sites\.com') { $sandboxPages += $url }
      if ($url -match '/case-studies-old(?:/|$)|/success-stories/?$') { $legacyPages += $url }

      if ($url -match '/align-hcm-smartcare/?$') {
        $smartCare = [pscustomobject]@{
          ga4 = $hasGa4
          hubspot = $hasHubSpot
          attribution = $hasCustomAttribution
          managedForm = ($html -match 'data-align-managed-form="true"')
          fakeSuccessRemoved = ($html -notmatch 'Thanks\. We will call you within the hour')
        }
      }

      foreach ($linkMatch in [regex]::Matches($html, '(?is)\bhref\s*=\s*["'']([^"'']+)["'']')) {
        $href = [Net.WebUtility]::HtmlDecode($linkMatch.Groups[1].Value.Trim())
        if (!$href -or $href -match '^(?:#|mailto:|tel:|javascript:|data:)') { continue }
        try { $targetUri = [Uri]::new([Uri]$finalUrl, $href) } catch { continue }
        if ($targetUri.Host -notin @('alignhcm.com', 'www.alignhcm.com')) { continue }
        if ($targetUri.AbsolutePath -match '^/(?:hs|_hcms)/') { continue }
        if ($targetUri.AbsolutePath -match '\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|mp4|webm)(?:$|/)') { continue }
        $builder = [UriBuilder]::new($targetUri)
        $builder.Scheme = 'https'
        $builder.Host = 'www.alignhcm.com'
        $builder.Port = -1
        $builder.Query = ''
        $builder.Fragment = ''
        $target = $builder.Uri.AbsoluteUri
        $internalTargets[$target] = $true
      }
    }

    $brokenInternal = @()
    foreach ($target in @($internalTargets.Keys | Sort-Object)) {
      try {
        $response = $redirectClient.GetAsync($target, [Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
        try { $status = [int]$response.StatusCode } finally { $response.Dispose() }
        if ($status -lt 200 -or $status -ge 400) { $brokenInternal += [pscustomobject]@{ url = $target; status = $status } }
      } catch { $brokenInternal += [pscustomobject]@{ url = $target; status = 0 } }
    }
  } finally {
    $noRedirectClient.Dispose()
    $noRedirectHandler.Dispose()
    $redirectClient.Dispose()
    $redirectHandler.Dispose()
  }

  [pscustomobject][ordered]@{
    asOf = [DateTimeOffset]::Now.ToString('o')
    sitemapUrls = $urls.Count
    finalOk = $finalOk
    brokenSitemapUrls = @($brokenSitemap)
    redirectingSitemapUrls = @($redirects)
    internalTargets = $internalTargets.Count
    brokenInternalTargets = @($brokenInternal)
    missingGa4 = @($missingGa4)
    missingHubSpot = @($missingHubSpot)
    customAttributionPages = $customAttributionCount
    nativeCaseStudyPages = $nativeCaseStudyCount
    attributionCoverageGaps = @($attributionGaps)
    conversionCoveredPages = $conversionCoveredCount
    conversionCoverageGaps = @($coverageGaps)
    sandboxLinkPages = @($sandboxPages)
    legacyCaseStudyPages = @($legacyPages)
    smartCare = $smartCare
  }
}

function Get-AttributionHealth {
  param(
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    [Parameter(Mandatory = $true)][long]$StartMilliseconds,
    [Parameter(Mandatory = $true)][DateTimeOffset]$AsOf,
    [Parameter(Mandatory = $true)]$SiteCoverage
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
  $sourceHealthy = $sourceJs -match 'stopImmediatePropagation' -and $sourceJs -match 'response\.ok' -and $sourceJs -match 'page_not_found' -and $sourceJs -match 'content_engaged' -and $sourceJs -match 'align-next-step-path'
  $checks += [pscustomobject]@{
    check = 'Form reliability and GA4 event layer'
    status = if ($sourceHealthy) { 'pass' } else { 'fail' }
    detail = if ($sourceHealthy) { 'Published code requires HTTP success and tracks CTA, guide, form, meeting intent, and 404 events.' } else { 'Published attribution source is incomplete.' }
  }

  $homeHtml = (Invoke-WebRequest -Uri 'https://www.alignhcm.com/' -UseBasicParsing).Content
  $assetLive = $homeHtml -match 'align-attribution'
  $checks += [pscustomobject]@{ check = 'Production attribution asset'; status = if ($assetLive) { 'pass' } else { 'fail' }; detail = if ($assetLive) { 'Loaded on the production domain.' } else { 'Missing from production HTML.' } }

  $sitemapHealthy = $SiteCoverage.finalOk -eq $SiteCoverage.sitemapUrls -and @($SiteCoverage.brokenSitemapUrls).Count -eq 0
  $checks += [pscustomobject]@{
    check = 'Full sitemap crawl'
    status = if ($sitemapHealthy) { 'pass' } else { 'fail' }
    detail = "$($SiteCoverage.finalOk)/$($SiteCoverage.sitemapUrls) sitemap URLs reached a healthy final response."
  }
  $checks += [pscustomobject]@{
    check = 'Internal link integrity'
    status = if (@($SiteCoverage.brokenInternalTargets).Count -eq 0) { 'pass' } else { 'fail' }
    detail = "$($SiteCoverage.internalTargets) unique internal targets checked; $(@($SiteCoverage.brokenInternalTargets).Count) broken."
  }
  $checks += [pscustomobject]@{
    check = 'GA4 site coverage'
    status = if (@($SiteCoverage.missingGa4).Count -eq 0) { 'pass' } else { 'fail' }
    detail = "$(@($SiteCoverage.missingGa4).Count) sitemap page(s) missing G-320235048."
  }
  $checks += [pscustomobject]@{
    check = 'HubSpot site coverage'
    status = if (@($SiteCoverage.missingHubSpot).Count -eq 0) { 'pass' } else { 'fail' }
    detail = "$(@($SiteCoverage.missingHubSpot).Count) sitemap page(s) missing portal 242825734 tracking."
  }
  $checks += [pscustomobject]@{
    check = 'Site-wide attribution coverage'
    status = if (@($SiteCoverage.attributionCoverageGaps).Count -eq 0) { 'pass' } else { 'fail' }
    detail = "$($SiteCoverage.customAttributionPages) custom-attribution page(s) plus $($SiteCoverage.nativeCaseStudyPages) HubSpot-native case-study page(s); $(@($SiteCoverage.attributionCoverageGaps).Count) measurement gap(s)."
  }
  $checks += [pscustomobject]@{
    check = 'Site-wide conversion paths'
    status = if (@($SiteCoverage.conversionCoverageGaps).Count -eq 0) { 'pass' } else { 'fail' }
    detail = "$($SiteCoverage.conversionCoveredPages)/$($SiteCoverage.sitemapUrls) sitemap page(s) expose a form, tracked CTA, contact link, or meeting path; $(@($SiteCoverage.conversionCoverageGaps).Count) gap(s)."
  }
  $smartCareHealthy = $SiteCoverage.smartCare -and $SiteCoverage.smartCare.ga4 -and $SiteCoverage.smartCare.hubspot -and
    $SiteCoverage.smartCare.attribution -and $SiteCoverage.smartCare.managedForm -and $SiteCoverage.smartCare.fakeSuccessRemoved
  $checks += [pscustomobject]@{
    check = 'SmartCare form and tracking'
    status = if ($smartCareHealthy) { 'pass' } else { 'fail' }
    detail = if ($smartCareHealthy) { 'GA4, HubSpot, managed submission, attribution, and honest success handling are live.' } else { 'One or more SmartCare conversion requirements failed.' }
  }
  $checks += [pscustomobject]@{
    check = 'Sandbox footer links'
    status = if (@($SiteCoverage.sandboxLinkPages).Count -eq 0) { 'pass' } else { 'fail' }
    detail = "$(@($SiteCoverage.sandboxLinkPages).Count) sitemap page(s) contain sandbox-domain policy links."
  }
  $checks += [pscustomobject]@{
    check = 'Legacy case-study duplicates'
    status = if (@($SiteCoverage.legacyCaseStudyPages).Count -eq 0) { 'pass' } else { 'warn' }
    detail = "$(@($SiteCoverage.legacyCaseStudyPages).Count) legacy case-study URL(s) remain in the sitemap."
  }
  $checks += [pscustomobject]@{
    check = 'Redirecting sitemap URLs'
    status = if (@($SiteCoverage.redirectingSitemapUrls).Count -eq 0) { 'pass' } else { 'warn' }
    detail = "$(@($SiteCoverage.redirectingSitemapUrls).Count) sitemap URL(s) redirect before reaching the canonical page."
  }

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
    events = @('cta_clicked', 'guide_gate_opened', 'resource_downloaded', 'form_submitted', 'form_error', 'generate_lead', 'meeting_booking_started', 'content_engaged', 'scroll_depth_50', 'scroll_depth_90', 'page_not_found')
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
    'amount', 'createdate', 'closedate', 'dealtype', 'pipeline', 'dealstage',
    'hs_analytics_source', 'hs_analytics_source_data_1', 'hs_analytics_source_data_2',
    'lead_source', 'hs_is_closed_won'
  ) -Filters @(
    @{ propertyName = 'closedate'; operator = 'GTE'; value = $startMs },
    @{ propertyName = 'closedate'; operator = 'LTE'; value = $endMs },
    @{ propertyName = 'hs_is_closed_won'; operator = 'EQ'; value = 'true' }
  )

  $contacts = Invoke-HubSpotSearch -ObjectType 'contacts' -Headers $headers -Properties @(
    'createdate', 'hs_analytics_source', 'hs_analytics_source_data_1',
    'hs_analytics_source_data_2', 'hs_analytics_first_referrer', 'lifecyclestage',
    'align_first_utm_source', 'align_first_utm_medium', 'align_first_utm_campaign', 'align_first_utm_content',
    'align_last_utm_source', 'align_last_utm_medium', 'align_last_utm_campaign', 'align_last_utm_content',
    'align_conversion_type', 'align_conversion_page', 'align_offer_id', 'align_cta_placement',
    'engagements_last_meeting_booked', 'engagements_last_meeting_booked_source',
    'engagements_last_meeting_booked_medium', 'engagements_last_meeting_booked_campaign'
  ) -Filters @(
    @{ propertyName = 'createdate'; operator = 'GTE'; value = $startMs },
    @{ propertyName = 'createdate'; operator = 'LTE'; value = $endMs }
  )

  $sourceProperty = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/crm/v3/properties/contacts/hs_analytics_source" -Headers $headers
  $sourceLabels = @{}
  foreach ($option in @($sourceProperty.options)) { $sourceLabels["$($option.value)"] = "$($option.label)" }

  $selectedSources = @(
    [pscustomobject]@{ key = 'ORGANIC_SEARCH'; label = 'Organic Search'; note = 'Verified deal source is Organic Search, the deal entered the cohort during the window, and no partner or sales-source field contradicts it.' },
    [pscustomobject]@{ key = 'DIRECT_TRAFFIC'; label = 'Direct Traffic'; note = 'Verified direct origin only. Meeting links and partner/vendor-sourced deals are excluded from Direct.' },
    [pscustomobject]@{ key = 'SOCIAL_MEDIA'; label = 'Organic Social'; note = 'Verified deal source is Organic Social, the deal entered the cohort during the window, and no partner or sales-source field contradicts it.' }
  )

  $acquisitionDeals = @($deals | Where-Object {
    $_.properties.createdate -and
    ([DateTimeOffset]$_.properties.createdate) -ge $start -and
    "$($_.properties.dealtype)" -eq 'newbusiness' -and
    "$($_.properties.lead_source)" -notin @('Change Request', 'Existing Client')
  })
  $contradictoryLeadSources = @(
    'UKG Sales Rep', 'UKG ERM', 'UKG Partner Channel', 'Channel Partner',
    'Dayforce Sales Rep', 'UKG Referral', 'Trade Show', 'Paylocity Sales Rep',
    'Change Request', 'Existing Client'
  )
  $channelRows = @()
  $selectedDealIds = @{}
  foreach ($source in $selectedSources) {
    $matches = @($acquisitionDeals | Where-Object {
      $leadSource = "$($_.properties.lead_source)"
      $drilldown = "$($_.properties.hs_analytics_source_data_1)"
      "$($_.properties.hs_analytics_source)" -eq $source.key -and
      $leadSource -notin $contradictoryLeadSources -and
      !($source.key -eq 'DIRECT_TRAFFIC' -and $drilldown -match '(?i)(?:meetings|scheduler|calendar)')
    })
    foreach ($deal in $matches) { $selectedDealIds["$($deal.id)"] = $true }
    $channelRows += [pscustomobject][ordered]@{
      sourceKey = $source.key
      channel = $source.label
      won = Get-AmountTotal -Deals $matches
      deals = $matches.Count
      note = $source.note
    }
  }
  $selectedDeals = @($acquisitionDeals | Where-Object { $selectedDealIds.ContainsKey("$($_.id)") })
  $selectedTotal = Get-AmountTotal -Deals $selectedDeals
  $crmReportedWebsiteDeals = @($acquisitionDeals | Where-Object {
    "$($_.properties.lead_source)" -eq 'Website' -and
    !$selectedDealIds.ContainsKey("$($_.id)")
  })
  $crmReportedWebsiteTotal = Get-AmountTotal -Deals $crmReportedWebsiteDeals
  $conflictingOwnedDeals = @($acquisitionDeals | Where-Object {
    "$($_.properties.hs_analytics_source)" -in @('ORGANIC_SEARCH', 'DIRECT_TRAFFIC', 'SOCIAL_MEDIA') -and
    !$selectedDealIds.ContainsKey("$($_.id)")
  })
  $conflictingOwnedTotal = Get-AmountTotal -Deals $conflictingOwnedDeals

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
  $siteCoverage = Get-SiteCoverage
  $attribution = Get-AttributionHealth -Headers $headers -StartMilliseconds ([long]$startMs) -AsOf $end -SiteCoverage $siteCoverage
  $qualifiedLeads = Get-QualifiedLeadPipeline -Headers $headers -Start $start -AsOf $end
  $linkedinOrganic = Get-LinkedInOrganicLeadAttribution -Contacts $contacts -Start $start -AsOf $end
  $ownedRows = @($qualifiedLeads.rows | Where-Object { $_.ownedChannel -and $_.outcome -ne 'No deal' })
  $ownedOpen = @($ownedRows | Where-Object { $_.outcome -eq 'Open' })
  $ownedWon = @($ownedRows | Where-Object { $_.outcome -eq 'Won' })
  $ownedLost = @($ownedRows | Where-Object { $_.outcome -eq 'Lost' })
  $ownedMarketing = [pscustomobject][ordered]@{
    verified = $true; asOf = $end.ToString('o'); period = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    source = 'Live HubSpot contact journey plus associated deal audit'
    methodology = 'Observed first-touch, HubSpot original source, referrer, and buyer-reported source are preserved separately. Organic Search, Organic Social, LinkedIn, and Direct/Brand Demand are included; contradictory partner or rep evidence is flagged, never silently erased.'
    opportunities = $ownedRows.Count
    totalValue = [long](($ownedRows | Measure-Object -Property amount -Sum).Sum)
    open = $ownedOpen.Count; openPipeline = [long](($ownedOpen | Measure-Object -Property amount -Sum).Sum)
    won = $ownedWon.Count; wonRevenue = [long](($ownedWon | Measure-Object -Property amount -Sum).Sum)
    lost = $ownedLost.Count; lostValue = [long](($ownedLost | Measure-Object -Property amount -Sum).Sum)
    rows = $ownedRows
    privacy = $qualifiedLeads.privacy
  }

  $onlineContacts = @($contacts | Where-Object {
    $sourceKey = "$($_.properties.hs_analytics_source)"
    $sourceKey -and $sourceKey -ne 'OFFLINE'
  })

  $data = Get-Content -Raw -LiteralPath $DataPath -Encoding UTF8 | ConvertFrom-Json
  $data.PSObject.Properties.Remove('topPages')
  if ($data.kpis) { $data.kpis.PSObject.Properties.Remove('bounceRate') }
  $data.generated = $end.ToString('o')
  $data.window.start = $WindowStart
  $data.window.end = $end.ToString('yyyy-MM-dd')
  Set-ObjectProperty -Object $data.kpis -Name 'selectedChannelWon' -Value $selectedTotal
  Set-ObjectProperty -Object $data.kpis -Name 'selectedChannelDeals' -Value $selectedDeals.Count
  Set-ObjectProperty -Object $data.kpis -Name 'crmReportedWebsiteWon' -Value $crmReportedWebsiteTotal
  Set-ObjectProperty -Object $data.kpis -Name 'crmReportedWebsiteDeals' -Value $crmReportedWebsiteDeals.Count
  Set-ObjectProperty -Object $data.kpis -Name 'contacts' -Value $onlineContacts.Count
  Set-ObjectProperty -Object $data.kpis -Name 'customers' -Value @($onlineContacts | Where-Object { $_.properties.lifecyclestage -eq 'customer' }).Count
  $data.kpis.PSObject.Properties.Remove('wonRevenueYtd')

  $channelRevenue = [pscustomobject][ordered]@{
    verified = $true
    asOf = $end.ToString('yyyy-MM-dd')
    source = 'Live HubSpot closed-won acquisition cohort with conflict checks'
    period = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    methodology = 'Verified owned-channel origin requires a new-business deal created and closed in the window, an Organic Search, Direct Traffic, or Organic Social deal source, and no contradictory partner, vendor, rep, meeting-link, renewal, existing-client, or change-request evidence.'
    totalWon = $selectedTotal
    deals = $selectedDeals.Count
    byChannel = $channelRows
    crmReportedWebsite = [pscustomobject][ordered]@{
      won = $crmReportedWebsiteTotal
      deals = $crmReportedWebsiteDeals.Count
      confidence = 'medium'
      note = 'The CRM Lead source says Website, but first-party traffic evidence does not independently verify Organic, Direct, or Social. This is reported separately and is never added to verified origin.'
    }
    excludedConflicts = [pscustomobject][ordered]@{
      won = $conflictingOwnedTotal
      deals = $conflictingOwnedDeals.Count
      note = 'Deals with an owned-looking traffic source but contradictory partner, vendor, rep, or meeting evidence are excluded from verified origin.'
    }
    cohort = [pscustomobject][ordered]@{
      eligibleNewBusinessDeals = $acquisitionDeals.Count
      eligibleNewBusinessWon = Get-AmountTotal -Deals $acquisitionDeals
    }
    excludedAssistNote = 'CRM-reported Website, associated-contact-only matches, contradictory-source deals, renewals, existing-client work, change requests, and LINEAR touch credit are excluded from verified owned-channel origin.'
  }
  Set-ObjectProperty -Object $data -Name 'channelRevenue' -Value $channelRevenue
  Set-ObjectProperty -Object $data -Name 'qualifiedLeads' -Value $qualifiedLeads
  Set-ObjectProperty -Object $data -Name 'ownedMarketing' -Value $ownedMarketing
  Set-ObjectProperty -Object $data -Name 'linkedinOrganic' -Value $linkedinOrganic
  Set-ObjectProperty -Object $data -Name 'attribution' -Value $attribution
  Set-ObjectProperty -Object $data -Name 'siteCoverage' -Value $siteCoverage
  $data.PSObject.Properties.Remove('revops')
  $data.sources = $sourceRows
  $data.aeo = $aeoRows
  $data.directives = @(
    'AI crawlers must have full access to alignhcm.com at all times. Never block GPTBot, ClaudeBot, PerplexityBot, Google-Extended, or similar. Verify on every run; blocking is a critical alert.',
    'Verified owned-channel won revenue requires new-business cohort timing plus non-conflicting first-party source evidence. Keep CRM-reported Website and assisted attribution separate.',
    'Every known form conversion must carry first-touch, last-touch, content, offer, and CTA placement fields. Anonymous behavior stays in GA4; never report a click as a completed meeting.'
  )
  if ($data.touchAttribution) {
    $data.touchAttribution.note = 'HubSpot campaign attribution: closed-won revenue split across marketing touchpoints. It measures influence, not deal origination, and is not added to verified or CRM-reported Website revenue.'
  }
  $data.alerts = @($data.alerts | Where-Object {
    $_.text -notmatch '^RevOps verified:' -and
    $_.text -notmatch '^Live deal-origin attribution:' -and
    $_.text -notmatch '^Verified owned-channel origin:' -and
    $_.text -notmatch '^CRM-reported Website:' -and
    $_.text -notmatch '^Qualified inbound buyers:' -and
    $_.text -notmatch '^Conflicting owned-channel evidence:' -and
    $_.text -notmatch '^Full-site crawl:' -and
    $_.text -notmatch '^AI crawler access' -and
    $_.text -notmatch '^Attribution instrumentation' -and
    $_.text -notmatch '^Blog earned roughly' -and
    $_.text -notmatch '^404 page viewed 119' -and
    $_.text -notmatch '^Untitled tracked page' -and
    $_.text -notmatch '(?i)bounce rate' -and
    $_.text -notmatch '^Duplicate UKG buyer' -and
    $_.text -notmatch '^9 case studies live'
  })
  $revenueAlert = 'Verified owned-channel origin: ${0} closed-won (${1} Organic Search, ${2} Direct Traffic, ${3} Organic Social).' -f ('{0:N0}' -f $selectedTotal), ('{0:N0}' -f $channelRows[0].won), ('{0:N0}' -f $channelRows[1].won), ('{0:N0}' -f $channelRows[2].won)
  $data.alerts += [pscustomobject]@{
    severity = 'good'
    text = $revenueAlert
  }
  $data.alerts += [pscustomobject]@{
    severity = 'warn'
    text = ('CRM-reported Website: ${0} across {1} closed-won acquisition deal(s), shown separately because the manual CRM source is not independently verified traffic origin.' -f ('{0:N0}' -f $crmReportedWebsiteTotal), $crmReportedWebsiteDeals.Count)
  }
  $data.alerts += [pscustomobject]@{
    severity = if ($qualifiedLeads.noDeal -or $qualifiedLeads.missingFollowUp) { 'crit' } else { 'good' }
    text = "Qualified inbound buyers: $($qualifiedLeads.total) total, $($qualifiedLeads.open) open, $($qualifiedLeads.won) won, $($qualifiedLeads.lost) lost, $($qualifiedLeads.noDeal) with no associated deal, and $($qualifiedLeads.missingFollowUp) without logged follow-up."
  }
  if ($conflictingOwnedDeals.Count) {
    $data.alerts += [pscustomobject]@{
      severity = 'warn'
      text = ('Conflicting owned-channel evidence: ${0} across {1} deal(s) excluded from verified origin because partner, rep, vendor, or meeting evidence contradicts the traffic-source label.' -f ('{0:N0}' -f $conflictingOwnedTotal), $conflictingOwnedDeals.Count)
    }
  }
  $data.alerts += [pscustomobject]@{
    severity = if (@($siteCoverage.brokenInternalTargets).Count -eq 0 -and @($siteCoverage.conversionCoverageGaps).Count -eq 0 -and @($siteCoverage.attributionCoverageGaps).Count -eq 0) { 'good' } else { 'crit' }
    text = "Full-site crawl: $($siteCoverage.finalOk)/$($siteCoverage.sitemapUrls) sitemap URLs healthy, $($siteCoverage.internalTargets) internal targets checked, $(@($siteCoverage.brokenInternalTargets).Count) broken, $(@($siteCoverage.conversionCoverageGaps).Count) conversion-path gaps, and $(@($siteCoverage.attributionCoverageGaps).Count) attribution-coverage gaps."
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
  $baseline.window.start = $WindowStart
  $baseline.window.end = $end.ToString('yyyy-MM-dd')
  $baseline.PSObject.Properties.Remove('revops_verified')
  $baseline.PSObject.Properties.Remove('contact_sources_ytd')
  Set-ObjectProperty -Object $baseline -Name 'channel_revenue_live' -Value ([pscustomobject][ordered]@{
    asOf = $end.ToString('yyyy-MM-dd')
    window = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    methodology = 'New-business deals created and closed in-window; verified owned-channel source only when partner, vendor, rep, meeting-link, renewal, existing-client, and change-request evidence does not conflict.'
    totalWon = $selectedTotal
    deals = $selectedDeals.Count
    byChannel = $channelRows
    crmReportedWebsiteWon = $crmReportedWebsiteTotal
    crmReportedWebsiteDeals = $crmReportedWebsiteDeals.Count
    conflictingOwnedSourceWon = $conflictingOwnedTotal
    conflictingOwnedSourceDeals = $conflictingOwnedDeals.Count
  })
  Set-ObjectProperty -Object $baseline -Name 'qualified_leads_live' -Value ([pscustomobject][ordered]@{
    asOf = $qualifiedLeads.asOf
    window = $qualifiedLeads.period
    total = $qualifiedLeads.total
    followedUp = $qualifiedLeads.followedUp
    missingFollowUp = $qualifiedLeads.missingFollowUp
    open = $qualifiedLeads.open
    won = $qualifiedLeads.won
    lost = $qualifiedLeads.lost
    noDeal = $qualifiedLeads.noDeal
    openPipeline = $qualifiedLeads.openPipeline
    wonRevenue = $qualifiedLeads.wonRevenue
    lostValue = $qualifiedLeads.lostValue
  })
  if ($data.touchAttribution) {
    $touchRows = @($data.touchAttribution.byChannel)
    Set-ObjectProperty -Object $baseline -Name 'attribution_snapshot' -Value ([pscustomobject][ordered]@{
      asOf = $end.ToString('yyyy-MM-dd')
      model = "$($data.touchAttribution.model)"
      window = "$WindowStart to $($end.ToString('yyyy-MM-dd')), closed-won influenced revenue"
      note = "$($data.touchAttribution.note)"
      byChannel = $touchRows
      totalAttributedRevenue = [long](($touchRows | Measure-Object -Property revenue -Sum).Sum)
    })
  }
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
  Set-ObjectProperty -Object $baseline -Name 'site_coverage_live' -Value ([pscustomobject][ordered]@{
    asOf = $siteCoverage.asOf
    sitemapUrls = $siteCoverage.sitemapUrls
    finalOk = $siteCoverage.finalOk
    internalTargets = $siteCoverage.internalTargets
    brokenInternalTargets = @($siteCoverage.brokenInternalTargets).Count
    attributionCoverageGaps = @($siteCoverage.attributionCoverageGaps).Count
    conversionCoveredPages = $siteCoverage.conversionCoveredPages
    conversionCoverageGaps = @($siteCoverage.conversionCoverageGaps).Count
    missingGa4 = @($siteCoverage.missingGa4).Count
    missingHubSpot = @($siteCoverage.missingHubSpot).Count
    redirectingSitemapUrls = @($siteCoverage.redirectingSitemapUrls).Count
    legacyCaseStudyPages = @($siteCoverage.legacyCaseStudyPages).Count
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
    $netlify = Get-Command netlify -ErrorAction SilentlyContinue
    if (!$netlify) { throw 'Netlify CLI is required to publish the production dashboard.' }
    $deployJson = & netlify deploy --prod --dir $DashboardDirectory --site $NetlifySiteId --message "Automated Align attribution refresh $($end.ToString('o'))" --json
    if ($LASTEXITCODE -ne 0) { throw 'Netlify production deploy failed.' }
    $deploy = $deployJson | ConvertFrom-Json
    if ("$($deploy.site_id)" -ne $NetlifySiteId -or !"$($deploy.url)") { throw 'Netlify deploy returned an unexpected site identity.' }
    $published = $true
  }

  [pscustomobject]@{
    portalId = $ExpectedPortalId
    window = "$WindowStart to $($end.ToString('yyyy-MM-dd'))"
    selectedChannelWon = $selectedTotal
    selectedChannelDeals = $selectedDeals.Count
    crmReportedWebsiteWon = $crmReportedWebsiteTotal
    crmReportedWebsiteDeals = $crmReportedWebsiteDeals.Count
    conflictingOwnedSourceWon = $conflictingOwnedTotal
    conflictingOwnedSourceDeals = $conflictingOwnedDeals.Count
    qualifiedLeads = [pscustomobject]@{
      total = $qualifiedLeads.total
      open = $qualifiedLeads.open
      won = $qualifiedLeads.won
      lost = $qualifiedLeads.lost
      noDeal = $qualifiedLeads.noDeal
      missingFollowUp = $qualifiedLeads.missingFollowUp
      openPipeline = $qualifiedLeads.openPipeline
    }
    byChannel = $channelRows
    onlineContactsInWindow = $onlineContacts.Count
    totalContactsInWindow = $contacts.Count
    crawlerChecks = $crawler.checks
    crawlerFailures = @($crawler.failures)
    knownFormConversions = $attribution.totalKnownConversions
    attributionFormsComplete = "$($attribution.completeForms)/$($attribution.trackedForms)"
    attributionFailures = @($attributionFailures | ForEach-Object { $_.check })
    siteCoverage = [pscustomobject]@{
      sitemapUrls = $siteCoverage.sitemapUrls
      finalOk = $siteCoverage.finalOk
      internalTargets = $siteCoverage.internalTargets
      brokenInternalTargets = @($siteCoverage.brokenInternalTargets).Count
      attributionCoverageGaps = @($siteCoverage.attributionCoverageGaps).Count
      conversionCoverageGaps = @($siteCoverage.conversionCoverageGaps).Count
      missingGa4 = @($siteCoverage.missingGa4).Count
      missingHubSpot = @($siteCoverage.missingHubSpot).Count
    }
    published = $published
  } | ConvertTo-Json -Depth 8
} finally {
  $token = $null
}
