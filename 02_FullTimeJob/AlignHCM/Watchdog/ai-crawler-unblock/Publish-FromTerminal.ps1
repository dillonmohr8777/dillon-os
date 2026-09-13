[CmdletBinding()]
param(
  [switch]$Apply,
  [string]$PortalId = '242825734',
  [string]$LlmsPath,
  [string]$TokenDpapiPath = $env:ALIGN_HUBSPOT_TOKEN_DPAPI_PATH
)

$ErrorActionPreference = 'Stop'
$DefaultTokenPath = 'C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi'
$ApiRoot = 'https://api.hubapi.com'
$FolderPath = '/alignhcm/ai'
$RedirectPath = '/llms.txt'

if (!$LlmsPath) { $LlmsPath = Join-Path $PSScriptRoot 'llms.txt' }

function Get-AlignHubSpotToken {
  if ($env:HUBSPOT_SERVICE_KEY) { return $env:HUBSPOT_SERVICE_KEY }
  if ($env:HUBSPOT_ACCESS_TOKEN) { return $env:HUBSPOT_ACCESS_TOKEN }

  $path = if ($TokenDpapiPath) { $TokenDpapiPath } else { $DefaultTokenPath }
  if (!(Test-Path -LiteralPath $path)) {
    throw "No HubSpot token environment variable or DPAPI token was found. Set ALIGN_HUBSPOT_TOKEN_DPAPI_PATH."
  }

  $secure = ConvertTo-SecureString (Get-Content -Raw -LiteralPath $path)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  }
  finally {
    if ($ptr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
  }
}

function Invoke-HubSpotJson {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    $Body
  )

  $args = @{
    Method = $Method
    Uri = $Uri
    Headers = $Headers
    ContentType = 'application/json'
  }
  if ($null -ne $Body) {
    $args.Body = $Body | ConvertTo-Json -Depth 12
  }
  Invoke-RestMethod @args
}

function Get-AllRedirects {
  param([hashtable]$Headers)
  $all = @()
  $after = $null
  do {
    $uri = "$ApiRoot/cms/v3/url-redirects?limit=100"
    if ($after) { $uri += '&after=' + [Uri]::EscapeDataString([string]$after) }
    $page = Invoke-HubSpotJson -Method Get -Uri $uri -Headers $Headers
    $all += @($page.results)
    $after = $page.paging.next.after
  } while ($after)
  $all
}

function Upload-LlmsFile {
  param(
    [Parameter(Mandatory = $true)][string]$Token,
    [Parameter(Mandatory = $true)][string]$Path
  )

  Add-Type -AssemblyName System.Net.Http
  $client = [Net.Http.HttpClient]::new()
  $multipart = [Net.Http.MultipartFormDataContent]::new()
  try {
    $client.DefaultRequestHeaders.Authorization = [Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $Token)
    $bytes = [IO.File]::ReadAllBytes($Path)
    $fileContent = [Net.Http.ByteArrayContent]::new($bytes)
    $fileContent.Headers.ContentType = [Net.Http.Headers.MediaTypeHeaderValue]::new('text/plain')
    $multipart.Add($fileContent, 'file', [IO.Path]::GetFileName($Path))
    $multipart.Add([Net.Http.StringContent]::new($FolderPath), 'folderPath')
    $options = '{"access":"PUBLIC_INDEXABLE","duplicateValidationScope":"EXACT_FOLDER","duplicateValidationStrategy":"RETURN_EXISTING"}'
    $multipart.Add([Net.Http.StringContent]::new($options), 'options')

    $response = $client.PostAsync("$ApiRoot/files/v3/files", $multipart).GetAwaiter().GetResult()
    $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if (!$response.IsSuccessStatusCode) {
      throw "HubSpot file upload failed with HTTP $([int]$response.StatusCode): $payload"
    }
    $payload | ConvertFrom-Json
  }
  finally {
    $multipart.Dispose()
    $client.Dispose()
  }
}

if (!(Test-Path -LiteralPath $LlmsPath)) { throw "Missing llms.txt at $LlmsPath" }

$token = Get-AlignHubSpotToken
try {
  $headers = @{ Authorization = "Bearer $token" }
  $tokenInfo = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/integrations/v1/me" -Headers $headers
  $livePortalId = if ($tokenInfo.portalId) { [string]$tokenInfo.portalId } else { [string]$tokenInfo.hubId }
  if ($livePortalId -ne $PortalId) {
    throw "HubSpot portal mismatch. Expected $PortalId, got $livePortalId."
  }

  # HubSpot's search index stores the filename stem in `name`; the full extension remains in `path`.
  $existingFiles = Invoke-HubSpotJson -Method Get -Uri "$ApiRoot/files/v3/files/search?name=llms&limit=100" -Headers $headers
  $existingFile = @($existingFiles.results | Where-Object { $_.path -eq "$FolderPath/llms.txt" }) | Select-Object -First 1
  $existingRedirect = @(Get-AllRedirects -Headers $headers | Where-Object { $_.routePrefix -eq $RedirectPath }) | Select-Object -First 1

  if (!$Apply) {
    [ordered]@{
      mode = 'dry-run'
      portalId = $PortalId
      llmsFileExists = [bool]$existingFile
      llmsRedirectExists = [bool]$existingRedirect
      crawlerProbe = 'run with -Apply to publish, then verify https://www.alignhcm.com/llms.txt'
    } | ConvertTo-Json -Depth 5
    exit 0
  }

  $file = if ($existingFile) { $existingFile } else { Upload-LlmsFile -Token $token -Path $LlmsPath }
  $fileUrl = if ($file.defaultHostingUrl) { $file.defaultHostingUrl } else { $file.url }
  if (!$fileUrl) { throw 'HubSpot uploaded the file but did not return a public URL.' }

  $redirectBody = @{
    routePrefix = $RedirectPath
    destination = $fileUrl
    redirectStyle = 301
    isOnlyAfterNotFound = $true
    isMatchFullUrl = $false
    isMatchQueryString = $false
    isPattern = $false
    isTrailingSlashOptional = $true
    isProtocolAgnostic = $true
  }

  if ($existingRedirect) {
    if ($existingRedirect.destination -ne $fileUrl) {
      $redirect = Invoke-HubSpotJson -Method Patch -Uri "$ApiRoot/cms/v3/url-redirects/$($existingRedirect.id)" -Headers $headers -Body $redirectBody
    }
    else { $redirect = $existingRedirect }
  }
  else {
    $redirect = Invoke-HubSpotJson -Method Post -Uri "$ApiRoot/cms/v3/url-redirects" -Headers $headers -Body $redirectBody
  }

  [ordered]@{
    mode = 'applied'
    portalId = $PortalId
    llmsFileId = $file.id
    llmsFileUrl = $fileUrl
    redirectId = $redirect.id
    redirectPath = $RedirectPath
    redirectStyle = $redirect.redirectStyle
  } | ConvertTo-Json -Depth 5
}
finally {
  $headers = $null
  $token = $null
}
