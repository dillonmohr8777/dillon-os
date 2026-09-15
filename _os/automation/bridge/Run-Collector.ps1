# Run-Collector.ps1 -- Task Scheduler entry point for the managed-agents bridge.
#
# The API key is read from Windows Credential Manager at run time and handed to
# ONE child process. It is never stored in this file, in the task definition, or
# in any environment scope Claude Code could inherit. Setup is in SETUP.md next
# to this file (one Credential Manager entry, target Momentum.ManagedAgents.ApiKey).

$target = "Momentum.ManagedAgents.ApiKey"

$sig = @"
using System; using System.Runtime.InteropServices;
public class CredMan {
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int flags, out IntPtr cred);
  [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr cred);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL { public int Flags; public int Type; public string TargetName; public string Comment;
    public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob; public int Persist;
    public int AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName; }
}
"@
if (-not ([System.Management.Automation.PSTypeName]'CredMan').Type) { Add-Type -TypeDefinition $sig }

$ptr = [IntPtr]::Zero
if (-not [CredMan]::CredRead($target, 1, 0, [ref]$ptr)) {
  "collector: no credential '$target' in Credential Manager; nothing run. See SETUP.md." | Tee-Object -FilePath (Join-Path $PSScriptRoot "collector.log") -Append
  exit 0
}
$c   = [System.Runtime.InteropServices.Marshal]::PtrToStructure($ptr, [type][CredMan+CREDENTIAL])
$key = [System.Runtime.InteropServices.Marshal]::PtrToStringUni($c.CredentialBlob, $c.CredentialBlobSize / 2)
[CredMan]::CredFree($ptr)

Set-Location $PSScriptRoot
$env:ANTHROPIC_API_KEY = $key                       # this process only; gone when the script exits
try {
  & python collector.py --once 2>&1 | Tee-Object -FilePath (Join-Path $PSScriptRoot "collector.log") -Append
} finally {
  $env:ANTHROPIC_API_KEY = $null
  $key = $null
}
