[CmdletBinding()]
param([int]$Port = 4243)
$ErrorActionPreference = 'Stop'
if ($Port -lt 1024 -or $Port -gt 65535) { throw 'Port must be between 1024 and 65535.' }
if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
  $env:OPENAI_API_KEY = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'User')
}
$env:SWARM_PORT = [string]$Port
$nodePath = (Get-Command node -ErrorAction Stop).Source
& $nodePath (Join-Path $PSScriptRoot 'server.js')
exit $LASTEXITCODE
