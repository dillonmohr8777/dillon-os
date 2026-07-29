# Verification evidence — 2026-07-29

Branch: `cursor/automation-deep-analysis-316c`
Contract: `00_Inbox/Automation Deep Analysis 2026-07-29.md`

Dependency: PR #226 / `12_Brain/DEPENDENCY_PR226.md` (inspect only; not merged)

## Tests

```text
node --test _os/automation/tests/*.test.js
# tests 10
# pass 10
# fail 0
```

## CLI dry-runs / runs

### Frontmatter validate (fixtures)
- incomplete: 1 / 2 (Fixture Client Two missing fence)

### Frontmatter repair + re-validate (live vault `01_Clients`)
- repaired 25 notes with safe defaults (`due=none`, `next_action=TBD`, `last_touched=today` when missing)
- after: **37/37 complete**

### Site health (`--dry-run`)
- fixture-healthy: **pass**
- fixture-broken-form: **fail** (missing viewport + form endpoint marked missing — deterministic)
- live properties: **skipped** (no `--live`)

### Qualify — Maps intake fixture
```json
{"total":3,"queued_build":1,"scored":1,"suppressed":1}
```
- `maps:place-weak-site` enqueue_build score **87**
- `barcrawlusa.com` **suppressed** (existing client)

### Qualify — Indeed adapter fixture
```json
{"total":2,"queued_build":1,"scored":1,"suppressed":0}
```
- `indeed:ind-1001` (Digital Marketing Manager @ Harbor HVAC) enqueue_build score **77**

### Queue sample
```json
{"action":"enqueue_build","prospect_id":"maps:place-weak-site","score":87,"source":"maps"}
{"action":"enqueue_build","prospect_id":"indeed:ind-1001","score":77,"source":"indeed"}
```

## Gates not crossed (by design)

| Gate | Status |
|---|---|
| Obsidian Sync / CLI on DESKTOP-4AHKEC4 | pending human |
| Netlify deploy token | pending secret |
| Mail vendor (PostGrid vs StackAdapt) | pending decision |
| Outreach send / public deploy / client account mutation | hard-blocked |
| Live Indeed scrape | not implemented (import adapter only) |
| Merge of PR #226 | dependency — no path collision with this PR's new files |

## Artifacts in repo

- `12_Brain/**`
- `_os/automation/**`
- `08_Prospects/*` (fixture-scored notes)
- `Daily-Briefs/frontmatter-report.md`
- `Daily-Briefs/site-health-report.md`
- `12_Brain/state/*.json`
- `12_Brain/queue/discover-qualify-2026-07-29.jsonl`
