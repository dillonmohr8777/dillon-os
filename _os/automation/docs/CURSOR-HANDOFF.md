# Desktop work order: clear the radar's blockers

For Cursor (or any agent on Dillon's desktop). Written 2026-08-07 by the cloud
agent that built the prospect radar (PR #262). Every task here needs something
the cloud sandbox does not have — Dillon's Google account, a billing console,
GitHub repo settings, or a machine that can hold a long-lived secret. Tasks are
ordered by value: the Places key is worth more than everything else combined.

## Ground rules — read before acting

- **`dillonmohr8777/dillon-os` is a PUBLIC repository.** Secrets go in GitHub
  Actions secrets and the DPAPI file described below. Never in a tracked file,
  a commit message, a PR body, or an echoed command.
- **`12_Brain/private/` stays untracked.** The privacy guards in
  `_os/automation/bin/radar-morning.ps1` and `.github/workflows/radar-daily.yml`
  are load-bearing. If a commit is refused, the guard is working — fix the
  cause, never the guard.
- **House rules on anything customer-facing:** no em dashes on any page, and
  generated imagery always ships with its disclosure line
  (`generatedAssets: true` in the builder). `lib/arch-build.js` hard-faults on
  both; a blocked build is the system working, not a bug to route around.

## 1. Google Places API key — do this first

**Broken today:** the `GOOGLE_PLACES_API_KEY` repo secret returns HTTP 400 on
every call. `lib/places.js` treats 400 as fatal for the run (Google answers an
invalid key with 400, not 403) and halts enrichment immediately. Result: no
ratings, no review counts, no permanently-closed detection; opportunity
confidence caps at 0.65 on all ~750 rows and the rebuild queue ranks blind to
ability-to-pay. This is the single highest-value fix on the board.

In [console.cloud.google.com](https://console.cloud.google.com), signed in as
the account that should own the billing:

1. Select or create a project (suggestion: `needmomentum-radar`).
2. **APIs & Services → Library → enable "Places API (New)"**
   (`places.googleapis.com`). The pipeline calls the v1 `places:searchText`
   endpoint — the legacy "Places API" is not sufficient. Enabling both is
   harmless.
3. **Billing:** the project must be linked to a billing account or every call
   fails. This step needs a card and possibly 2FA — that part is Dillon, not
   you. Usage stays small by design: a 7-field mask, a hard budget of 60
   lookups/day, results cached 150 days. Check the current Places (New)
   free-tier allowance while you are in the console rather than trusting
   remembered pricing.
4. **APIs & Services → Credentials → Create credentials → API key**, then edit
   the key:
   - API restrictions: restrict to **Places API (New)** only.
   - Application restrictions: **None**. The key is used from GitHub Actions
     runners (rotating IPs) and this desktop, so an IP allowlist cannot hold;
     the API restriction is the real control.
5. **Verify before installing it anywhere.** In a throwaway PowerShell window:

   ```powershell
   $k = Read-Host 'paste the new Places key'
   Invoke-RestMethod -Method Post `
     -Uri 'https://places.googleapis.com/v1/places:searchText' `
     -ContentType 'application/json' `
     -Headers @{ 'X-Goog-Api-Key' = $k
                 'X-Goog-FieldMask' = 'places.displayName,places.websiteUri,places.rating,places.userRatingCount' } `
     -Body '{"textQuery":"Andorra Family Dentistry, Philadelphia, PA","maxResultCount":3}'
   ```

   Success is a `places` array (Andorra's entry should show
   `andorradental.com`). Failure map: **400** = key invalid or malformed
   request; **403** = Places API (New) not enabled on the key's project, or the
   restriction is wrong; **429** = quota. Close the window when done so the key
   leaves the variable.
6. **Install it in both places the pipeline looks:**
   - GitHub Actions (the daily 06:10 UTC sweep):
     `gh secret set GOOGLE_PLACES_API_KEY --repo dillonmohr8777/dillon-os`
     and paste at the prompt — this overwrites the dead key. No `gh`? UI path:
     repo → Settings → Secrets and variables → Actions → update
     `GOOGLE_PLACES_API_KEY`.
   - This desktop (`radar-morning.ps1` reads a DPAPI-wrapped file, tied to this
     Windows user on this machine):

     ```powershell
     New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\Codex\Secrets" | Out-Null
     Read-Host -AsSecureString 'Places API key' | ConvertFrom-SecureString |
         Set-Content "$env:LOCALAPPDATA\Codex\Secrets\google-places-dillon-os.dpapi"
     ```

## 2. Rotate the Netlify token

The personal access token the cloud agent used this week has full account
access and appeared in agent chat transcripts. Treat every existing token as
exposed.

1. [app.netlify.com](https://app.netlify.com) → User settings → Applications →
   Personal access tokens → **revoke all existing tokens**, then create one new
   token named for the job, e.g. `dillon-os-radar-ci`.
2. `gh secret set NETLIFY_AUTH_TOKEN --repo dillonmohr8777/dillon-os` (or the
   same Settings UI path as above).
3. Rotation does not touch the deployed sites
   (`momentum-prospect-radar.netlify.app`, `momentum-showcase-top5.netlify.app`);
   it only gates future deploys.

## 3. Merge PR #262, then prove the loop end to end

Nothing scheduled runs until the branch is on `main` — the daily workflow
itself lives on the branch.

1. `gh pr ready 262 --repo dillonmohr8777/dillon-os`, review, then merge.
   Mergeable state is clean. Prefer a merge commit over squash: the 21 commit
   messages document the design decisions.
2. With tasks 1 and 2 done first, fire one validation run:
   `gh workflow run radar-daily.yml --repo dillonmohr8777/dillon-os`, then
   watch it (`gh run watch` or the Actions tab).
3. Success looks like: the job summary table renders; `enriched > 0` in
   `12_Brain/state/radar-last.json` (the workflow passes no `--enrich` flag —
   the default budget of 60 applies automatically once the key works); the
   dashboard's run-health strip goes green on enrichment; a
   `Radar sweep <date>: …` commit lands on `main`.

## 4. Run the Codex image queue — 56 briefs

`12_Brain/state/radar/image-briefs/CODEX-QUEUE.md` lists 56 zero-photo rebuild
targets; each has a JSON brief beside it specifying six slots (hero 1600×1100,
two story 1200×900, three gallery 1200×900), per-vertical scene directions, and
a logo instruction.

Hard rules, all enforced downstream by the builder:

- Photorealistic. **Absolutely no text, lettering, signage, or logos inside the
  scenes.** No human faces. No real identifiable locations. One consistent
  light temperature per prospect.
- Output goes to `12_Brain/private/generated-assets/<slug>/` — gitignored on
  purpose. The binaries never enter the public repo.
- Any page built from these must pass `generatedAssets: true` so every alt text
  reads "Illustrative concept image:" and the footer disclosure ships.
  `arch-build` refuses a flagged build without the disclosure.

## 5. Optional but valuable: a full Tier 1 pass from this machine

~557 registry rows are still graded from markup only, which means their `craft`
score is half-weight and their `strong` grades stay `unconfirmed` by design.
Desktop Chromium has direct network access and renders much faster than the
sandbox relay. After PR #262 is merged, from the repo root:

```powershell
node _os/automation/bin/radar-refresh.js --discover 0 --recheck 600 --render 600 --force --max-tier 1
.\_os\automation\bin\radar-morning.ps1 -Discover 0 -Recheck 0 -Render 0
```

The first command does the forced full pass (~30 minutes); the second commits
and pushes the results through the script's own privacy guards rather than a
hand-rolled `git add`. To make this machine the daily Tier 1 muscle instead of
a one-off, the scheduled-task registration snippet is in the ps1's docblock.

## Done when

- [ ] Verification call returns 200 with a `places` array
- [ ] `GOOGLE_PLACES_API_KEY` repo secret replaced
- [ ] DPAPI key file exists at `%LOCALAPPDATA%\Codex\Secrets\google-places-dillon-os.dpapi`
- [ ] All old Netlify tokens revoked; `NETLIFY_AUTH_TOKEN` secret replaced
- [ ] PR #262 merged to `main`
- [ ] One manual `radar-daily` run green with `enriched > 0` and the dashboard republished
- [ ] 56 briefs generated into `12_Brain/private/generated-assets/<slug>/`
- [ ] (Optional) full Tier 1 pass done: `verify` near zero, `craft` measured fleet-wide
