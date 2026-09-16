# Cadence driver

The procedure the daily, weekly and monthly scheduled tasks all follow. They pass
in one thing: which cadence to run. Everything else is here, so behaviour changes
in one file instead of three task prompts.

## Run

**1. Load.** Read `_os/automation/cadence/<cadence>.yaml` from
`C:\Users\dillo\repos\dillon-os`. If the file is missing or does not parse, write
a ledger line with `status: failed` and `job: "__driver__"`, say so loudly, stop.

**2. For each job, in file order:**

- Look the job id up in `12_Brain/registry/automations.json`. `enabled: false`
  there → ledger `skipped`, move on. Do not run it. The registry is the switch
  the HUD flips; the manifest's own `enabled` key is advisory and
  `node _os/automation/bin/registry-validate.js` warns when they drift.
- Run the job's `prompt` exactly as written. It is self-contained by design; the
  run has no memory of any previous run or of this conversation.
- Resolve the output directory:
  - **No `client` key** → vault-relative. `C:\Users\dillo\repos\dillon-os\<outputs>`.
  - **`client` key present** → look the id up in
    `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json`.
    Use the `folder` field from that record, then the job's `outputs` under it.
    **An id that does not resolve is a job failure.** Do not guess a folder, do
    not create one, do not fall back to the vault.
- Check the job's `accept` sentence against what was actually produced. This is
  the gate. Be strict: a file that exists but is empty, or a report that says
  "could not determine", does not pass.
- **Commit it.** In the owning repo, `git add` the artifact and commit with
  `cadence(<cadence>): <job id>`. Never `git push`.
- Append one ledger line (below).

**3. Report.** One short summary: counts by status, then every `failed` with its
reason. If everything passed, one line. Do not narrate the runs that worked.

## The ledger

Append to `_os/automation/cadence/run-ledger.jsonl`, one object per job per run,
newline-delimited:

```json
{"ts":"2026-09-15T09:04:12-04:00","cadence":"daily","job":"heartbeat","status":"ok","artifact":"12_Brain/07_Reviews/Cadence/2026-09-15 - cadence heartbeat.md","commit":"a1b2c3d","note":""}
```

- `status`: `ok` | `failed` | `skipped`
- `artifact`: repo-relative path, or `null` on failure
- `commit`: short sha, or `null`
- `note`: **required and specific when failed.** "job failed" is not a note.
  "Ads probe returned USER_PERMISSION_DENIED on 285-398-1364" is.

Never rewrite or prune existing lines. The heartbeat reads this file and an
edited history makes it lie.

Also append one line per job to `_os/automation/runs.jsonl`. This is the row the
HUD roster reads (`GET /api/agents`), keyed by `agent_id` = the job id:

```json
{"agent_id":"heartbeat","run_id":"<uuid>","started":"<iso>","ended":"<iso>","exit_code":0,"status":"ok","artifact":"12_Brain/07_Reviews/Cadence/2026-09-15 - cadence heartbeat.md","transcript":null,"tokens":null,"note":""}
```

`status` here adds `running` (write it before the job starts, then the final row
with the same `run_id`). `transcript` is the Claude Code session file for this
run if you can name it, else `null`. Schema and a `lastRuns()` reader live in
`_os/automation/lib/run-record.js`.

## Hard rules

These are not style preferences. Each one exists because of something that
already went wrong on this machine.

- **Nothing external.** No send, post, publish, deploy, merge, or spend. Anything
  that needs it gets appended to `System/approval-queue.md` and stops there.
- **Never write the canonical queue.** `queue/work-items.json`, `CONTROL.md` and
  `state/corrections.jsonl` in client-operations are single-writer — Marketing
  Chief owns them. Observations go to `client-operations/intake/`.
- **Never widen your own access.** Do not edit permissions, hooks, manifests, or
  this file to make a job pass. A job that cannot run under current permissions
  is a `failed` with a note.
- **Credentials are locators.** Never read, echo, or store a secret value —
  including into the ledger or a report.
- **A job that produced nothing is `failed`, not `ok`.** This is the whole point.
  `run-the-implemented-dillon-os-daily` was empty three days running in September
  and reported nothing, and `daily-communications-brain` went dark for four days
  and self-recovered unremarked. Silence is the bug being fixed.
- **One job failing does not stop the rest.** Record it and continue.
- **Do not commit media.** dillon-os gitignores `*.mp4`/`*.mov` on purpose —
  ".git is already 3 GB of history; media stays local". If a job produces media,
  commit the report *about* it, not the file.

## Budget

These run on the Max subscription, not API credits. **Do not set
`ANTHROPIC_API_KEY`** — its presence silently switches billing to the Console
balance, and even an empty string wins that precedence slot. If a job appears to
need it, that job is out of scope for this driver.

Keep each run tight. The cadence is there to be boring and repeatable; a driver
that burns an hour of quota on a Tuesday morning defeats its own purpose.
