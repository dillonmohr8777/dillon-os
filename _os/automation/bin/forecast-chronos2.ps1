[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$RequestPath,

    [ValidateNotNullOrEmpty()]
    [string]$OutputPath,

    [switch]$CrossLearning
)

$ErrorActionPreference = 'Stop'
$request = (Resolve-Path -LiteralPath $RequestPath).Path
$router = Join-Path $PSScriptRoot 'forecast-route.js'
$launcher = Join-Path $env:USERPROFILE '.codex\tools\Invoke-Chronos2Forecast.ps1'

if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
    throw "The verified local Chronos-2 launcher is missing: $launcher"
}

& node $router route --from $request
if ($LASTEXITCODE -ne 0) {
    throw 'The forecast router blocked this request before model execution.'
}

$invokeParameters = @{ RequestPath = $request }
if ($OutputPath) {
    $invokeParameters.OutputPath = [System.IO.Path]::GetFullPath($OutputPath)
}
if ($CrossLearning) {
    $invokeParameters.CrossLearning = $true
}

& $launcher @invokeParameters
if ($LASTEXITCODE -ne 0) {
    throw "Chronos-2 execution failed with exit code $LASTEXITCODE"
}
