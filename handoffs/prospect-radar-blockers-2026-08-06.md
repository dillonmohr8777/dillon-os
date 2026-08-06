---
tags: [handoff, radar, blockers]
created: 2026-08-06
for: Codex on DESKTOP-4AHKEC4
branch: claude/pa-business-website-grader-5vi5hx
pr: https://github.com/dillonmohr8777/dillon-os/pull/262
---

# Prospect radar — blockers for Codex

Handoff from the Claude session that built the site grader and radar. Everything below is either something I could not verify from a cloud sandbox, or something that needs data I do not have.

**Read this first:** the single most important item is B1. The Tier 1 code path has **never successfully executed against a real web page**. Not once. Everything else is secondary to establishing whether it works.

## Where things stand

| | |
|---|---|
| Tracked prospects | 700 (Philadelphia + Montgomery, Delaware, Bucks, Chester) |
| Graded | 668 |
| **Ever rendered (Tier 1)** | **0** |
| Provisional (Tier 0 only) | 650 |
| Build queue (`rebuild`) | 118 |
| Blocked on a render (`verify`) | 144 |
| Tests | 88/88 passing on Linux and Windows |

Verdict spread: `rebuild` 118 · `verify` 144 · `polish` 333 · `nurture` 62 · `enrich` 43

---

## B1 — Tier 1 rendering is completely unproven

**Severity: blocking. Nothing else matters until this is settled.**

Chromium cannot tunnel this sandbox's CONNECT-only proxy — `ERR_CONNECTION_RESET` on every navigation, in every proxy configuration I tried. So `auditTier1()` in `_os/automation/lib/site-audit.js` has never returned a successful result. Specifically **unexecuted**:

- the whole `page.evaluate()` block that computes palette, fonts, tap targets, oversized images, min body font
- the three-viewport `horizontalOverflow` loop
- the `usesMediaQueries` stylesheet walk (this one iterates `document.styleSheets` and swallows cross-origin errors — plausible but untested)
- the screenshot path

You confirmed Chromium *launches* and renders on the desktop, which is great, but that is a different claim from "my evaluate block returns sensible data."

### What I need

```powershell
cd C:\path\to\dillon-os
git fetch origin ; git checkout claude/pa-business-website-grader-5vi5hx

# 1. Does the code path work at all, on one known-good site?
node -e "const{auditTier1}=require('./_os/automation/lib/site-audit');auditTier1('https://www.zahavrestaurant.com/',{timeoutMs:45000}).then(a=>console.log(JSON.stringify({tier:a.tier,reachable:a.reachable,fonts:a.fonts,palette:(a.palette||[]).slice(0,4),overflow:a.horizontalOverflow,mediaQueries:a.usesMediaQueries,loadMs:a.loadMs,tapTargetsOk:a.tapTargetsOk,oversized:a.oversizedImages,minFont:a.minBodyFontPx},null,2)))"

# 2. Then at volume, over the rows that are actually blocked
node _os/automation/bin/radar-refresh.js --discover 0 --recheck 150 --enrich 0 --max-tier 1
```

### What to report back

1. Does step 1 print a **non-empty `fonts` array with real family names and pixel sizes**? Empty fonts is the specific failure mode I hit — it means `page.evaluate` ran but returned nothing useful, and `craft` stays at half weight forever.
2. Do `horizontalOverflow` keys come back as three booleans (`phone`/`tablet`/`desktop`), not `{}`?
3. In step 2, how many of the 144 `verify` rows resolve, and to what?
4. Any Node or Playwright exceptions in `_os/automation/logs/`.

**Do not trust a clean exit code.** `auditTier1` deliberately swallows render failures and returns `{tier:0, tier1Failed:true}` so a failed render cannot overwrite a good Tier 0 grade. So the run will look successful while learning nothing. Check `tier_reached` on the rows, not the exit status.

---

## B2 — Every threshold is calibrated against Tier 0 only

**Severity: high. Depends on B1.**

The band boundaries in `lib/opportunity.js` — `REBUILD_CEILING = 55`, `POLISH_CEILING = 74` — were tuned against a distribution where `craft` ran at half weight and no site could be certified good. Once Tier 1 runs, `craft` goes to full weight and the distribution shifts. **The current thresholds will be wrong and the build queue will be mis-ordered.**

For context on how badly this can go: with a 60-point dimension baseline the median site landed at 76 and *nothing at all* qualified for a rebuild. Calibration is not cosmetic here.

### What I need

After a Tier 1 pass over ≥150 rows:

```powershell
node -e "const r=require('./_os/automation/lib/radar').load();const g=Object.values(r.prospects).filter(p=>p.current&&p.current.tier>=1&&p.current.sqs!=null).map(p=>p.current.sqs).sort((a,b)=>a-b);const q=x=>g[Math.floor(x*(g.length-1))];console.log('n='+g.length,'min',g[0],'p10',q(.1),'p25',q(.25),'p50',q(.5),'p75',q(.75),'p90',q(.9),'max',g[g.length-1])"
```

Send me those percentiles and I will re-anchor the thresholds. Do not adjust them by eye — the scale is only meaningful relative to the observed distribution.

---

## B3 — OpenStreetMap under-maps the vertical that converts best

**Severity: high. Independent of B1 — can be worked in parallel.**

Across the entire Philadelphia metro, OSM yielded **365 medical but only 167 home-services** businesses with a website tag. Per `Market Roster.md`, home services is the best-converting vertical and the one the shipped Philly batch barely touched. OSM only holds what somebody bothered to map, and nobody maps the HVAC contractor in a Bucks County industrial park.

### Options, best first

1. **Google Places by vertical × area.** The key is already wired (`lib/places.js`) and `places:searchText` can be queried as `"HVAC contractor, Doylestown PA"` rather than by business name. Costs money per call, so it needs the same budget/cache discipline as enrichment. This is the option I would take.
2. **Jesse's Maps sheet** from `#ghl-leads-apollo`. Free and already exists, but I have never seen its actual columns. If you can get me a de-identified sample of 20 rows I will write the importer — it merges into the radar by domain, so it composes with OSM rather than replacing it.
3. Both. They overlap on domain, and the registry dedupes.

**Decision needed from Dillon,** not from me: option 1 costs money per discovery, option 2 depends on data I cannot see.

---

## B4 — Nothing tells the grader what actually closed

**Severity: medium, but compounding. Blocks Stage 8 "Learn" entirely.**

Thresholds are calibrated against *site quality*, which is a proxy. The real target is revenue. Right now a batch can drop, close three deals, and the grader learns nothing — so it cannot discover that (say) veterinary practices convert at triple the rate of insurance agents, or that a score of 45 closes better than a score of 20 because a truly dead business has no budget either.

### What I need

Per batch, in `02_Campaigns/AI Site Builder Outreach Engine/batches/<batch-id>/results.md`: pieces mailed, QR scans, calls booked, closes, revenue — sliced by market, vertical, and site-quality band. Even 25 rows of real outcomes would let me test whether the ranking predicts anything.

Until then, treat the build-queue *order* as a hypothesis. The `rebuild`/`skip` split is well-evidenced; the ranking within `rebuild` is not.

---

## B5 — Secrets I do not have

| Secret | Blocks | Notes |
|---|---|---|
| `GOOGLE_PLACES_API_KEY` | Ability-to-pay data; `opportunity_confidence` stuck at 0.65 | Dillon is getting one. Setup in `_os/automation/docs/RADAR-SETUP.md`. Needs **Places API (New)** enabled — the legacy Places API answers 403. |
| Netlify deploy token | Stage 7 activate, pre-existing gap in `Pipeline Spec.md` | Not mine, flagging for completeness. |

When the Places key lands, **start at `--enrich 20` for a week and read the real bill** before going to 60/day. I deliberately did not hard-code a price estimate anywhere; Places pricing changes and I would rather Dillon see the actual number.

---

## B6 — Nobody has checked the grades against human judgment

**Severity: medium. This is the one I most want a second opinion on.**

I verified *mechanics*: dead domains against DNS (three confirmed NXDOMAIN), missing-viewport findings against live HTML with a control site that has the tag. What nobody has verified is whether **a score of 35 actually looks like a 35 to a person.**

That matters because the whole rubric is my judgment call about what makes a small-business website bad. The weights (mobile 22, foundation 20, craft 18, performance 16, content 14, discoverability 10) are reasoned but not validated.

### What I need

Open 15–20 rows from `12_Brain/state/radar/build-queue.csv` spread across the range, and for each record a 1–5 taste score: *would a redesign pitch land here?* Feed them back via the `taste_score` field — Tier 2 consumes it (`applyTaste` in `lib/site-audit.js`) and it is the only thing that can tell me the rubric is wrong.

If human judgment and the score disagree systematically in one direction, the weights need to move, and I would rather find that out on 20 rows than after 100 builds.

---

## Fixed since your review — no action needed

All three of your PR #262 findings are resolved on the branch:

1. `EHOSTUNREACH`/`ENETUNREACH` no longer classified as dead domains. Only `ENOTFOUND` and `ECONNREFUSED` are authoritative; unrecognised errors default to inconclusive.
2. PII purged. `sanitizeForGit()` strips street, phone, lat, lon and OSM ids on every write path, including on registry *save* so an older row cannot leak. Branch was squashed and force-pushed, so it is out of the branch history — though commit `91a045d` may stay reachable by SHA on GitHub until GC.
3. `queued_build` now requires a provable `hard_fault` (dead domain, missing viewport, no HTTPS, broken TLS, framesets, table layout, 4xx/5xx, placeholder copy). Soft-signal rebuilds stay `graded` pending a render.

Also, **your 57/57 and my 54/57 are both now 88/88.** The three failures were hardcoded Windows separators in test expectations: `insideRepo('..\\outside')` is real traversal on Windows but just an odd filename on Linux, so the test passed there and failed here — and the traversal guard was never actually exercised on Linux. Switched to `path.join` plus forward-slash and absolute-path cases. The guard itself was always correct.

---

## What is not blocked

So you know where the solid ground is: Tier 0 grading, OSM discovery with chain filtering, the radar registry with grade history and recheck scheduling, the verdict router, the dashboard, and the daily sweep all work and are tested. The system is usable today at Tier 0 — it just cannot certify a site as *good*, which is why `verify` exists rather than a guess.

## Reference

- `02_Campaigns/AI Site Builder Outreach Engine/Site Grader.md` — rubric, thresholds, full calibration history including the seven bugs the 500-row run found
- `_os/automation/docs/RADAR-SETUP.md` — desktop setup, cost guards, troubleshooting
- `.claude/skills/site-grade/SKILL.md` — the on-demand path
- PR #262
