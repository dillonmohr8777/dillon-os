# CLAUDE.md

## Remote Browser Bridge

This environment uses a persistent browser bridge on the Windows box:

- Start bridge (on the box): `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\dillo\start-box-bridge.ps1`
- The script writes `C:\Users\dillo\start-box-bridge-state.json` and the user environment variable `BOX_CDP_URL`.

Before remote automation, source the URL:

```powershell
$statePath = "$env:USERPROFILE\start-box-bridge-state.json"
if (Test-Path $statePath) {
    $state = Get-Content $statePath | ConvertFrom-Json
    if ($state.tunnelUrl) {
        $env:BOX_CDP_URL = $state.tunnelUrl
    }
}
```

If you want to verify the bridge session:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\dillo\test-box-bridge.ps1 -TunnelUrl $env:BOX_CDP_URL
```
