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

---

## Tier 1 rendering (how the browser reaches the network)

Tier 1 renders a prospect's page in real Chromium to measure what markup cannot
show: computed palette, actual fonts, horizontal overflow at three viewports,
tap-target sizing, payload weight. A Tier 0 grade can prove a site is *bad*; only
a render can certify one *good*, which is why `verify` exists as a verdict.

Chromium cannot always use a CONNECT proxy. In the agent sandbox the proxy never
even logs the CONNECT — the socket is reset first — so pointing Chromium at it
produces `ERR_CONNECTION_RESET` on every navigation. Left unhandled that reads as
"site unreachable" and scores a healthy business as a dead domain.

`lib/site-audit.js` therefore has two networking modes:

| Condition | Mode | What happens |
|---|---|---|
| `HTTPS_PROXY` set | **relay** | Node fetches each subresource through the proxy and hands the bytes to Chromium via `context.route()`. Chromium never opens a socket; it only does layout. |
| no proxy (desktop) | **direct** | Chromium does its own networking — faster, and closer to what a visitor experiences. |

Override with `auditTier1(url, { relay: true|false })`.

TLS is still verified in relay mode — by Node, against the same CA bundle. The
relay does not bypass the proxy or relax certificate checking; it exists because
Node's proxy client works where Chromium's does not.

### Running a Tier 1 pass

```bash
# Re-audit everything currently blocked on a render, at Tier 1.
node _os/automation/bin/radar-refresh.js \
  --discover 0 --enrich 0 --recheck 150 --regrade verify --max-tier 1 --concurrency 6
```

`--regrade <verdict[,verdict]>` re-audits those verdicts regardless of their
recheck date, because a stored grade's schedule says nothing about whether the
code that produced it was correct. `--force` does the same for every row.

Expect roughly 4–8s per site. Chromium is at `/opt/pw-browsers` in the sandbox;
`resolveChromiumPath()` tolerates Playwright build skew. If `require('playwright')`
fails, set `NODE_PATH=/opt/node22/lib/node_modules`.

### Cookie handling

`lib/net.js` keeps a **request-scoped** cookie jar across a redirect chain. Many
small-business sites answer the first request with `302 → /` plus a `Set-Cookie`
and expect the next request to carry it. Without a jar that is an infinite
self-redirect: the redirect budget is exhausted, the body comes back empty, and a
live site is recorded as unreachable. One real example in this registry —
`andorradental.com` — went from "wouldn't serve markup" to a 497KB 200 response
once cookies were kept. Nothing persists between calls, so audits stay
independent.

---

## The daily sweep

One scheduled job keeps the radar useful: `.github/workflows/radar-daily.yml`,
06:10 UTC. It runs on GitHub's runners rather than a desktop, so it does not
depend on any particular machine being awake, and it commits the day's registry
back to the branch.

```
discover into the thinnest coverage cells
  -> re-audit whatever is past its recheck date
  -> spend a Tier 1 render budget on the rows still guessing
  -> rewrite dashboard, queue CSV and dated digest
  -> check nothing private is about to be committed
  -> commit, push, publish
```

### Why the numbers are what they are

| Budget | Default | Reasoning |
|---|---:|---|
| Discovery | **60/day** | The factory builds 25/week and 118 rebuild targets are already queued — about five months of work. Discovering 200/day would not add pipeline, it would add hoard. |
| Tier 1 renders | **80/day** | The expensive tier. Spent in `dueForRecheck` order, so it lands on never-graded rows first, then the most overdue — the biggest blind spots rather than whatever was enumerated first. |
| Re-audits | **250/day** | Cheap. Only rows actually past their per-verdict recheck date are touched, so this is a ceiling, not a target. |
| Places lookups | **60/day** | Billed per call. |

Override any of them on a manual run: `--discover`, `--render`, `--recheck`,
`--enrich`. The workflow also accepts them via **Run workflow** in the Actions
tab, plus a `regrade` input for forcing a verdict class to be re-audited.

### Coverage-driven targeting, not a rotation

Discovery used to pick its target by day-of-year — seven slots, Philadelphia
taking one. That is even in *slots* but not in *rows*: Montgomery County is
densely mapped and yields far more per query than Philadelphia does. The result
was a registry at **Montgomery 389 / Philadelphia 175**, a 2.2:1 skew away from
the priority market, with nothing in the loop to correct it.

`lib/coverage-plan.js` plans from the registry instead. It compares what each
county and vertical *holds* against what it *should* hold and spends the day on
the largest deficits, so coverage self-corrects: the thinner a cell, the more of
tomorrow it gets. Each target also carries a per-area cap, so one dense county
can never absorb the whole day again.

Target shares live in `AREA_TARGETS` and `GROUP_TARGETS`. Vertical shares are
weighted by how well a group converts, **not** by how many OSM happens to hold —
OSM under-maps suburban trades badly, and following availability would keep
over-collecting restaurants and under-collecting the contractors that close.

Inspect a plan without running anything:

```bash
node -e "
const radar=require('./_os/automation/lib/radar');
const {planDiscovery,describePlan}=require('./_os/automation/lib/coverage-plan');
const p=planDiscovery(radar.load());
console.log(describePlan(p));
console.table(p.areaDeficits.map(({name,have,want,deficit})=>({name,have,want,deficit})));
"
```

### The registry has a ceiling, and the job respects it

The dashboard embeds every row, and the generator throws rather than shipping a
page too large to open. Measured: **~549 bytes per row** after interning, so the
1.5MB guard lands near **2,560 rows**.

So discovery ramps down between a soft cap (2,000) and a hard cap (2,400), and
stops entirely above it — the day's budget goes to rendering and re-auditing
instead, because past that size another unaudited row is worth less than a
rendered one. A linear ramp rather than a cliff: there is no reason the last row
under a threshold and the first row over it should be treated differently.

| Registry size | Discovery budget |
|---:|---:|
| ≤ 2,000 | 60 |
| 2,100 | 45 |
| 2,200 | 30 |
| 2,300 | 15 |
| ≥ 2,400 | 0 |

To raise the ceiling, trim `projectRows()` or start excluding closed prospects —
do not just raise the caps.

### Secrets the workflow expects

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Effect if missing |
|---|---|
| `NETLIFY_AUTH_TOKEN` | The publish step is skipped. The sweep still runs and still commits; the dashboard on disk is current, the hosted one is not. |
| `GOOGLE_PLACES_API_KEY` | Enrichment does nothing, so ability-to-pay signals stay absent and `opportunity_confidence` stays low. **This is the highest-value one to set.** |

Publishing is a separate step with `continue-on-error`, so a Netlify outage
cannot cost a sweep's worth of grading.

### The privacy guard

The registry and queue CSV are tracked in a **public** repository.
`discovery.sanitizeForGit` strips contact detail on every write path, and the
workflow re-checks the tracked outputs for phone, street, coordinate and OSM-id
fields before committing. A regression in that function fails the run rather than
quietly publishing several hundred phone numbers.

### Running it on the desktop instead

`_os/automation/bin/radar-morning.ps1` does the same thing locally. On a machine
with no proxy, Chromium does its own networking and Tier 1 is faster — see the
Tier 1 section above.

### When it breaks

The dashboard's run-health strip turns red and prints the error verbatim; the
Actions run summary carries the same numbers. The failure that stayed invisible
before the strip existed was Places returning HTTP 400 on an invalid key for
days, silently enriching nothing.

### A limit worth knowing about

The planner can ask for rows that do not exist. On the first plan-driven sweep
Philadelphia was allotted 23 and returned **10**: Overpass had 120 raw matches
for those three verticals, but almost all were chains, had no website, or were
already tracked. The deficit therefore persists and Philadelphia gets asked
again tomorrow, yielding little again.

Nothing breaks — the run just under-delivers quietly — but it means the
Philadelphia target may be **unreachable with OpenStreetMap alone**. That is the
same gap as "OSM under-maps suburban trades", seen from the other side. A second
discovery source is what fixes it; until then, treat a persistently unmet
Philadelphia deficit as evidence of source coverage, not of a planner bug.

---

## The deliverable is a homepage concept, not a site

This was modelled wrong at first and it mattered, so it is written down.

What gets built for a `rebuild` prospect is **one page** — a homepage concept
assembled from their own copy and imagery, good enough that the rebuild sells
itself. The full site is the engagement that follows if they say yes. The live
batch URL says so plainly: `philly-25-homepage-concepts-batch-3`.

The generator was always right — `arch-build` emits a single `html`. The wrong
part was everywhere else: the offer read "Tier-A demo site", and more
importantly the **imagery requirement was sized for a whole site**.

### What that error cost

The arch homepage has **four image slots** plus a logo. Reported against that
real number, the queue looks completely different:

| | Before the fix | After |
|---|---:|---:|
| Rebuild targets with enough imagery | reported as ~none | **28 of 106 (26%)** |
| Partial (1–3 slots) | — | 22 (21%) |
| Nothing usable | — | 56 (53%) |
| Have a logo | — | 39 (37%) |

Two separate mistakes were compounding:

1. **The need was sized for a full site**, so nothing ever looked sufficient.
2. **`harvest-lite` only read `<img src>`.** Lazy-loading themes park a spacer
   GIF there and put the real photograph in `data-src`, `data-lazy-src` or
   `srcset`. Andorra Family Dentistry went from **0 usable images to 8** at
   1920×1037 on that fix alone, and one of its three "candidates" had been the
   literal string `{href}` — an unsubstituted template placeholder.

`harvest-lite` now reads the lazy attributes first (when a theme sets both, `src`
is the placeholder and the lazy attribute is the content), takes the widest
entry from `srcset`, reads `<source>` inside `<picture>`, picks up CSS
`background-image` URLs, and discards anything containing a template placeholder.

### Buildability is now a field, not an afternoon

`lib/imagery.js` checks each rebuild target and stores the result on the row, so
the dashboard can answer "which 25 do I build this week" as a filter:

- A **Buildable now** queue and a headline stat, counted from the rows.
- A gold `READY` badge on any row whose imagery is already in hand.
- The drawer states it exactly: *"enough for a homepage — 8 usable, logo found"*.

Checks are budgeted at `--imagery 60` per day and cached for 45 days, so the
whole rebuild queue is covered within a couple of sweeps.

`imagesReady` in `arch-build` also changed: it required *one* asset, which let a
build report success with three of four slots empty. It now requires every slot
filled, because each unfilled slot renders as a broken-image icon and a homepage
concept with a column of those is worse than no pitch.

**Still true:** 53% of rebuild targets own no usable photographs, and that is a
real constraint — those sites are poor partly *because* nobody ever put decent
photography on them. Nothing here substitutes another business's images. That
group needs generation, a photographer, or the prospect's own files.

---

## Contact discovery

`bin/find-contacts.js` reads what each business has **published on its own site**
for the purpose of being contacted. It runs in the daily sweep at 60/day.

### What the yield actually is

Measured, not promised:

| | Share of live sites |
|---|---:|
| Published an email address | **~10–26%** |
| Offered a contact form | ~21% |
| Named a person with a title or credential | ~21% |

The spread is because the top of the rebuild queue is thick with dead domains —
which is *why* they rank there. Most small businesses route contact through a
form specifically so their address cannot be harvested.

**There is no honest way to get to full email coverage of a local-business list
by scraping.** Anyone offering it is either guessing addresses from patterns or
reselling a purchased database. If broad coverage matters, buy it from a provider
(Apollo, Hunter, Clearbit) and feed it in — that is a purchase decision, not an
engineering one.

### What it will not do

- **No guessed addresses.** No `firstname@domain` permutation. Guessed addresses
  bounce, and bounces are what destroy a sending domain's reputation — one
  campaign to invented addresses can cost more deliverability than the campaign
  was worth.
- **No third-party scraping.** No LinkedIn, no aggregators. Only the business's
  own pages.
- **No private individuals.** A named practitioner on a practice's team page is a
  business contact; two capitalised words in a sentence are not. The matcher
  requires a credential or an explicit title, because a looser earlier version
  produced entries like "Meet Dr" and "What Parents".

### The agency signal

One prospect's published contact address was on a marketing agency's domain.
That is not a contact route — it is a **reason not to pitch**: there is an
incumbent, and a cold redesign pitch walks straight into them. Those addresses
are excluded from the contact list and surfaced as their own `agency` flag on the
row and as a filter.

### Where it lives

| Data | Location | Tracked? |
|---|---|---|
| Email addresses, names, form URLs | `12_Brain/private/contacts.json` | **No** — gitignored |
| Mail-merge sheet | `12_Brain/private/contacts-mailmerge.csv` | **No** |
| Suppression list | `12_Brain/private/contacts-suppressed.json` | **No** |
| Booleans and counts | the registry | Yes |

`lib/contact-store.js` refuses to write anywhere outside `12_Brain/private/`, and
the workflow's privacy guard now fails the run if an email address appears in a
tracked file. The dashboard shows *whether* a route exists, never the address.

### Suppression

```js
require('./_os/automation/lib/contact-store').suppress('someone@example.com', 'requested');
```

Suppression is enforced on **read**, not only on write, because the crawler will
keep rediscovering an address that is still published on the business's site.
Once suppressed, it never comes back out of the store.

### Before any of this becomes a send

US B2B cold email is governed by CAN-SPAM: accurate headers and subject, a
physical postal address, and a working opt-out honoured promptly. Nothing in this
pipeline sends anything — the store is a research artifact and the CSV is a
human-approved mail-merge input. The documented offer is direct mail plus a QR
code, where the phone and address in Mac's sheet are the channel anyway.

---

## Today's change feed

The dashboard opens with **what moved since the last sweep**, because a page of
totals makes a sweep that found six warm leads look identical to one that found
none.

Three groups, ordered by how much they change what you do:

1. **Verdict changed** — the event that alters the action. A flip *into* rebuild
   is a new build target; a flip *out* is one fewer.
2. **Score moved** — 8+ points either way. The early warning: a site that just
   got worse is a warmer call, and one that got better should leave the queue
   before someone pitches a redesign to a business that just bought one.
3. **Newly found** — today's discoveries.

Computed in `radar.summarize()` from grade history that was already being
stored, so it costs nothing extra to produce.

---

## Two house rules, enforced in the pipeline

Both from the operator, 2026-08-07. Both are code, not memos.

**No photos, no build.** A rebuild target whose imagery check came back with
zero usable photographs is held out of `build-queue.csv` (the sweep logs how
many). It stays a rebuild target in the registry, because their site is still
bad; it just cannot consume a build slot until it has photographs, since a
homepage concept with broken-image slots pitches nothing. Rows that were never
checked stay in the queue: absence of a check is not evidence of absence of
photos. Today this holds 56 of 124 rebuild rows out and leaves 68 workable.

**No em dashes on any customer-facing page.** `arch-build` strips them from
template prose at generation (a comma reads correctly in every position the
template used them) and treats one surviving in visible text as a hard fault, so
compliance never depends on a copywriter remembering. The showcase transformer
applies the same rule and refuses to emit a page that still carries one.
