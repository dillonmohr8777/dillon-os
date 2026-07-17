[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][uri]$Destination,
  [Parameter(Mandatory = $true)][string]$Campaign,
  [Parameter(Mandatory = $true)][string]$Content,
  [string]$Term
)

$ErrorActionPreference = 'Stop'
if ($Destination.Host -notin @('alignhcm.com', 'www.alignhcm.com')) { throw 'Destination must be an Align HCM URL.' }

function ConvertTo-Slug([string]$Value) {
  $slug = $Value.Trim().ToLowerInvariant() -replace '[^a-z0-9]+', '_'
  $slug.Trim('_')
}

$campaignSlug = ConvertTo-Slug $Campaign
$contentSlug = ConvertTo-Slug $Content
if (!$campaignSlug -or !$contentSlug) { throw 'Campaign and Content must contain letters or numbers.' }

$builder = [UriBuilder]$Destination
$pairs = [ordered]@{
  utm_source = 'linkedin'
  utm_medium = 'organic_social'
  utm_campaign = $campaignSlug
  utm_content = $contentSlug
}
if ($Term) { $pairs.utm_term = ConvertTo-Slug $Term }
$builder.Query = (($pairs.GetEnumerator() | ForEach-Object {
  [Uri]::EscapeDataString($_.Key) + '=' + [Uri]::EscapeDataString([string]$_.Value)
}) -join '&')
$builder.Uri.AbsoluteUri
