# Prospect Radar — desktop setup

One-time setup for the daily sweep on `DESKTOP-4AHKEC4`. After this, the radar runs itself every weekday morning and leaves the dashboard and the ranked build queue in the vault.

The sweep runs **here rather than in the cloud** for one concrete reason: Tier 1 grading needs a real Chromium that can reach the internet. A cloud sandbox behind a CONNECT-only proxy cannot render pages, and without rendering the grader can never certify a site as good — the `verify` pile just grows. This machine has a working Chromium, so `-MaxTier` defaults to `1`.

## 1. Prerequisites

```powershell
node --version        # 20 or newer
git -C C:\path\to\dillon-os status
```

Playwright, for Tier 1 rendering:

```powershell
cd C:\path\to\dillon-os
npm i --no-save playwright
npx playwright install chromium
```

Verify a render actually works before trusting the daily run:

```powershell
node -e "const{auditTier1}=require('./_os/automation/lib/site-audit');auditTier1('https://example.com').then(a=>console.log('tier1 ok, fonts:',(a.fonts||[]).length))"
```

If that prints a font count, Tier 1 is live. If it throws, the sweep still works at Tier 0 — pass `-MaxTier 0` and every borderline prospect stays in `verify` until rendering is fixed.

## 2. Store the Google Places key

The key is protected with DPAPI, the same pattern as `xai-research.ps1`. It is decrypted into the child process environment at run time only: never written in the clear, never logged, never committed.

```powershell
$dir = "$env:LOCALAPPDATA\Codex\Secrets"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Read-Host -AsSecureString "Google Places API key" |
  ConvertFrom-SecureString |
  Set-Content -LiteralPath "$dir\google-places-dillon-os.dpapi"
```

DPAPI ties the file to **this Windows user on this machine** — it cannot be decrypted elsewhere, which is the point. Copying the vault to another machine means re-creating the key there.

In Google Cloud, the project needs:

- **Places API (New)** enabled — the sweep calls `places:searchText`. The legacy Places API is a different product and will answer 403.
- The key restricted to the Places API, and ideally IP-restricted.
- A **budget alert**, because enrichment is the only part of this pipeline that costs money.

### What it costs, and the guards around it

Every lookup is billed, so cost is bounded in four places rather than trusted to good behaviour:

| Guard | Effect |
|---|---|
| `-Enrich 60` | Hard daily ceiling on lookups. Not a target — the sweep stops there. |
| Field mask | Requests exactly the six fields the opportunity model reads. Nothing speculative. |
| 150-day cache | A prospect is re-queried twice a year at most; review counts drift slowly. A previous no-match backs off to 300 days. |
| Fatal-error halt | A 400/401/403/429, or three failures in a row, stops the run. A bad key costs one call, not sixty. |

Check current Places API pricing yourself before setting the budget — it changes, and I would rather you see the real number than trust one written here. Start with `-Enrich 20` for a week and read the actual bill.

## 3. Register the scheduled task

```powershell
$ps      = "$env:ProgramFiles\PowerShell\7\pwsh.exe"   # or "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$script  = "C:\path\to\dillon-os\_os\automation\bin\radar-morning.ps1"

$action  = New-ScheduledTaskAction -Execute $ps -Argument "-NoProfile -File `"$script`""
$trigger = New-ScheduledTaskTrigger -Daily -At 7:00am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable `
              -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask -TaskName "Dillon OS prospect radar" `
  -Action $action -Trigger $trigger -Settings $settings `
  -Description "Daily prospect discovery and website grading"
```

`-StartWhenAvailable` is the flag that matters: if the desktop is off at 7am the sweep runs when it next wakes, instead of silently skipping the day. Without it a weekend off means a Monday with no fresh prospects.

Run it once by hand first:

```powershell
& $script -DryRun -OpenDashboard      # nothing written
& $script -OpenDashboard              # the real thing
```

## 4. What each morning does

1. Commits any stray vault edits, then fast-forwards from `origin/main`.
2. Discovers ~200 new businesses in the day's rotation slot. Five of seven slots are Philadelphia and the collar counties.
3. Enriches the highest-priority rows with Google review data, up to the budget.
4. Grades the new arrivals and re-audits whatever went stale on its own cadence.
5. Rewrites the dashboard, the queue CSV and a dated digest, then commits and pushes.

Outputs:

| Path | What it is |
|---|---|
| `Daily-Briefs/prospect-radar.html` | The dashboard. Open this. |
| `Daily-Briefs/radar-<date>.md` | Dated digest with the top suggestions. |
| `12_Brain/state/radar/build-queue.csv` | Ranked rebuild queue, for the batch. |
| `12_Brain/state/radar/registry.json` | Every business ever seen, with grade history. |
| `_os/automation/logs/radar-<date>.log` | Full run log. |

## 5. When something looks wrong

| Symptom | Cause and fix |
|---|---|
| `enrichment: skipped — GOOGLE_PLACES_API_KEY not set` | The DPAPI file is missing or was created under a different Windows user. Re-run step 2. |
| `HTTP 400 — malformed request or invalid API key` | The key is wrong, or Places API **(New)** is not enabled. The run halts after one call, so this costs nothing. |
| Everything lands in `verify` | Tier 1 is not rendering. Re-run the Playwright check in step 1. |
| Build queue full of "domain does not resolve" | Expected — dead domains are the strongest rebuild case. Confirm one by hand (`Resolve-DnsName <domain>`) before mailing. |
| `push failed after retries` | The commit is safe locally; the next run pushes both. |
| Discovery returns 0 with an error | Overpass rate-limits. It retries mirrors; if all fail, the sweep still re-audits and republishes. |

## 6. Cost and scope of the whole thing

Only Places enrichment costs money. Discovery (OpenStreetMap/Overpass) and grading (plain HTTP plus local Chromium) are free.

The radar deliberately does **not** send anything. `rebuild` means a human may draft a brief; every outbound step stays behind the approval gate in `Pipeline Spec.md`.

## Related

- [[02_Campaigns/AI Site Builder Outreach Engine/Site Grader|Site Grader]] — rubric, thresholds, calibration history
- `/site-grade` — the on-demand version, for grading one market by hand
- [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]] — where this sits in the eight stages
