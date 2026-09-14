---
date: 2026-09-14
status: open
supersedes: nothing
note: Written at the end of the session. Everything here is UNFINISHED. Finished work is in git and in the approval queue archive, not here.
---

# Open items, 2026-09-14

Everything in this file is **not done**. Each entry says what is blocking it, who
can unblock it, and what has already been established so nobody re-derives it.

Figures were verified at time of writing. Two are already moving: the approval
queue refills continuously, and the Codex process count climbs on its own.

---

## 1. Fires tomorrow without anyone acting

### BOK Facebook scheduler publishes to a live page, Tue 2026-09-15 17:00 ET

`~/.codex/automations/bok-facebook-weekly-pdf-scheduler` is `status = "ACTIVE"`
on `RRULE:FREQ=WEEKLY;BYDAY=TU;BYHOUR=17`. Its prompt carries standing authority
to generate **original** content, spend on up to **two paid images per run**, and
schedule posts to live Facebook page `116652527977793`.

The authorization it cites is *"Dillon additionally authorized original Sunburst
content on September 12, 2026."* **Two independent agents searched the memory
bank and found zero corroboration for it.** Dillon has said BOK is his lane, and
the related queue items were archived on his instruction — but **archiving a queue
item does not pause an automation.** It still fires.

Decision: let it run, pause it, or strip the original-content clause. Nobody but
Dillon should make it.

### GT Clinic kickoff, Tue 2026-09-15 12:00-12:40 ET

The 90-day strategy PDF exists in **three variants** and nobody has picked one:

```
clients/gt-clinic/deliverables/2026-09-10-plan/
  GT-Clinic-90-Day-Growth-Strategy-2026-09-12.contract-verified.pdf
  GT-Clinic-90-Day-Growth-Strategy-2026-09-12.cover-fixed.pdf
  GT-Clinic-90-Day-Growth-Strategy-2026-09-12.final-render.pdf
```

No email drafted, no attachment staged. Contact is Ghazala Farooqui MD. GT Clinic
also still has **no registry record**, so nothing automated can see it.

---

## 2. Finished work that has not reached anyone

### Six client weekly updates sit on disk, not in Gmail

`clients/<id>/deliverables/2026-09-14-weekly-update/` for **bar-crawl-usa,
deborah-mara, kimberly-james-bridal, omega-landscaping,
onsite-concrete-landscape, pritzker-law-group**.

Dillon's decision on 2026-09-14 was *stage them as real Gmail drafts, he hits
send*. They are files, not drafts. A file on disk is not a delivery.

Missing before they can be staged: confirmed email addresses for **Deborah Mara**
and **Pritzker Law Group**. Note the sweep found Deb WAS emailed at
`marasurrealestate@gmail.com` on 09-10, which contradicts her `CLIENT.md`.

### Weekly report URLs

Nothing deployed since the 09-08 batch, under site
`0094c232-ba9e-429b-bcd0-df407b7137b5`. `report-courier` exists to own this end
to end and has never been run.

---

## 3. Client measurement, still wrong

### Onsite Concrete has nine primary conversion actions

Account `103-371-5894` carries **twelve conversion actions, at least nine marked
`primaryForGoal: true`**, including `Local actions - Directions`, `Clicks to
call`, and two Smart-campaign clicks-to-call. A directions tap counts the same as
a submitted lead. Four separate WEBPAGE actions (Web Contact Form, Submit lead
form, OnSite Form Submission, Form) overlap and almost certainly multi-count one
submission.

Separately its landing page has **no tracking at all** — no `gtag`, no `AW-` id,
no GTM container, no thank-you page, only a dataLayer push nothing consumes.

**Do not instrument the page until the account is cleaned up.** Adding a tenth
signal to a nine-primary blend makes it worse. Correct order: reduce to one
primary that means an accepted lead, retire the duplicates, then instrument.

Changing conversion settings is a live campaign change and is gated.
`launch-authority.json` is `status: draft`, `approvedBy: null`.

Note: an earlier claim that Onsite shared Omega's premature-fire bug was **wrong**
and has been corrected in the architecture doc. Different defect.

### The Zapier payload is the unlock for everything else

Lead notification emails carry *"view this Zap run in Zapier"* instead of the
lead fields, so there is nothing to reconcile platform conversions against. This
one defect sits behind **all 13 broken match-back promises** (9x Omega, 2x KJB,
2x Onsite) and blocks the Fresh Blends deck.

**The Zaps are in Momentum's own Zapier account. This needs no client
permission.** Fagan Painting is the proof it works — it is the one account where
leads were ever parsed out of an email body.

This **supersedes** the Omega Ads admin access request as the path to lead data.
Dillon confirmed 2026-09-14 that the client contact does not respond; nothing may
be sequenced behind that request. The re-drafted email stays staged in Gmail
(`r4420360796608729033`) and is not the plan.

---

## 4. Security

### Rotate the Anthropic API key

A key with prefix `sk-ant-api03-` was pasted into a chat transcript as an image
on 2026-09-14 to run the Managed Agents test. It validated (HTTP 200) and was
used **in-process only** — never written to disk, env, `settings.local.json` or
any file. But it is permanently in a transcript that syncs to Dillon's phone, and
it can spend against the Console balance.

**11 cents of 429 spent.** Rotate at console.anthropic.com.

### Standing: five plaintext credentials in Slack

Unchanged from earlier in the queue. The fifth is Dillon's own WordPress admin
password, posted in `#deborah-mara` on 2026-09-11 and readable by that channel
since. Rotate, then delete the message — doing either alone leaves the problem.

---

## 5. Unpushed and unmerged

| Repo | Branch | State |
|---|---|---|
| `dillon-os` | `cursor/immohrtal-standing-canary-3c2e` | 0 unpushed, **PR #339 open** |
| `client-operations` | `cursor/bar-crawl-andy-send-24e0` | **5 unpushed**, PR #71 open |

The client-operations stack was deliberately **not** pushed. It includes
`03817ee`, a `registry/clients.json` write, and pushing makes that registry change
canonical for anyone who pulls. That is Dillon's call.

### Registries still disagree

`registry/clients.json` now holds **27** (nexla, puttery-nyc and deborah-mara were
added today). But `_os/reporting/client-registry.json` still holds **7** and is a
separate file the reporting path reads. One of them has to win.

Still absent from both: **GT Clinic** and **IMMOHRTAL**.
Still marked active but no longer a client per Dillon: **NKCDC** — the registry is
single-writer and was deliberately not edited.

---

## 6. The estate

### The untracked figure everyone has been quoting is wrong by 19x

`git status --porcelain` **collapses an untracked directory into one line**. That
is where "3,408 untracked" came from.

| Measure | Value |
|---|---|
| Porcelain lines | **3,381** |
| Actual files (`-uall`) | **63,680** |
| Total size | **~15,174 MB** |
| Media / archive files | 463 |

`client-operations` gitignores only `work/`, `tmp/`, `backups/` and browser-profile
globs. **Unlike `dillon-os` it does not ignore media.** A blanket `git add -A`
there would commit roughly 14.8 GB.

No off-device backup exists. That decision is still open and is now better
informed, not easier.

### Video: 2,733 files, 734 unique

One directory (`02_Campaigns/IMMOHRTAL/asset-studio/out/motion`) is replicated
**~56 times** and accounts for 55% of the file count.
`picking-up-my-notepad.mp4` exists 66 times. The 55% duplication is the de facto
backup, which is not a backup.

A working render pipeline exists at
`Documents\Codex\2026-09-12\analyze-whstx-next\films\concepts\` — five ordered
stages, SHA256 fingerprinting with real caching, an `assert(check.ok)` gate. It is
**trapped in a dated session folder** and hardcodes both the HyperFrames CLI path
and a Chrome path. Extracting it is the highest-value move for that lane.

### Artboards: 317 files, ~160 unique

Same pattern, every heavy folder duplicated between `projects/client-operations`
and `worktrees/client-ops-build-20260909`.

---

## 7. Claude Design

`/design-login` has been run and **DesignSync works** — `list_projects` returns
`Momentum Design System` (`09b3bbc0-a8f7-4acc-88ae-8a47648d75a4`).

**Do not run a blind sync.** The hosted tokens and the local tokens are two
different brand systems:

| | Hosted | Local `tokens.json` v1.0.0 |
|---|---|---|
| Ground | `#fff` | `#FBF8F4` warm paper |
| Accent | **gold `#efb928`** | **signal orange `#E27113`** |
| Brand | `#1766ab` | `#155E86` + lift `#3897CC` |

The **local set is the audited one** — 29 contrast pairs measured, 0 failures,
`color-mix()` banned, `--accent` split into `--m-signal` / `--m-signal-ink`. The
hosted set carries none of that work and its comments say "exact source hexes",
suggesting it was captured from a live site rather than from the corrected tokens.

A sync in the wrong direction silently reintroduces contrast failures the audit
already caught. When `/design-sync` shows its plan, **check whether `tokens/` is
in the write list.**

Recommendation: push the audited local tokens up. It will visibly change every
hosted card from gold to orange, so confirm that is wanted.

Also: `uploads/` duplicates much of `assets/` in that project, plus four
HyperFrames `.mp4` renders and a whole `Momentum-Design-System-Source/` copy.

---

## 8. Codex

### The leak has a partial fix only

`config.toml` backed up to `config.toml.bak-20260914-preleak-fix`.

**Fixed:** `[mcp_servers.node_repl]` had a `# disabled 2026-09-14` comment but the
`enabled = false` directive was **never added**. Added it.
**Revert** by deleting that line if the in-app browser or computer use breaks —
its env block carries `BROWSER_USE_*` and `SKY_CUA_NATIVE_PIPE` variables, so it
may host more than the JS repl. Not proven either way.

**Still open, and it is the real multiplier.** Twelve MCP servers remain enabled,
and both `[agents]` and `[features.multi_agent_v2]` set
`max_concurrent_threads_per_session = 6`. **Twelve times six is seventy-two
processes before any child spawns**, and `google-ads-mcp` and `analytics-mcp` each
spawn their own python.

Dropping concurrency 6 → 3 roughly halves it and is a real reduction in parallel
agent capability. Dillon's call.

**Watch the right number.** `node_repl` is *not* the alarm — it reads 0 while the
leak continues. Use total process count; healthy is ~380-420 here, and past ~700
the app is heading for a stall even while Windows reports everything Responding.

### Workmate is still stopped

Rollout `2026-09-14T11-47-19-01a0a099-f620-7d42-ace7-45ce43d72941`, 7.1 MB, 826
records. It stopped at 12:42 because the app leaked itself to a halt, not because
the work finished.

A prepared session folder and prompt are ready and unused at
`Documents\Codex\2026-09-14\codex-full-access\`.

Unresolved before more gets built: `momentum-slack-agent` (commit `483dc7f`)
expects a classic Socket Mode bot; Workmate (`A0C2K8ZU6AU`) is on Slack's newer
Agent experience surface, which delivers a different event shape. **Decide which
surface wins before a third runtime exists.**

---

## 9. The agent layer itself

### Scheduled but never fired

`Cadence-daily`, `Cadence-weekly` and `Cadence-monthly` all exist in Task
Scheduler and report `LastRunTime 11/30/1999` — **never run**. Only
`Cadence-sweep-heartbeat` has actually fired. A task that exists and has never run
is a failure wearing a green light.

`report-pairing-check`, the job whose entire purpose is measuring generated
against sent, was due Monday and produced no ledger row.

### Fourteen-plus agents now, with real overlap

Six loop-owners were built this session (`closer`, `conversion-truth`,
`report-courier`, `creative-foundry`, `auditor`, `scout`) plus `design-canvas`.
A concurrent session deployed **eight more** under `dillon-*` (builder,
client-operations, critic, growth, intelligence, mission-director, reliability,
revenue).

Overlaps: `dillon-revenue` / `conversion-truth`, `dillon-critic` / `auditor`,
`dillon-reliability` / `auditor`. Nobody has reconciled them, and two agents with
contradictory instructions is the failure mode this architecture exists to
prevent.

The seventeen original advisors have **not** been retired — the architecture doc
proposes it, and proposing is not doing.

### The queue refills as fast as it drains

127 → 108 by the closer's pass (first time it has ever gone down), then **115**
within the hour as three concurrent sessions committed five new items. A one-off
drain is the finite closer all over again. It has to be recurring.

### MASTER-ORCHESTRATOR rewrite, undecided

Measured **+79 / −498** against HEAD. The rewrite **deletes about 500 lines** of
the tracked operating contract rather than adding to it, and would bless a model
routing ladder, an Astra video exception and a three-worker cap as what every
session loads. HEAD still holds the pre-rewrite version, so revert is one
`git checkout`.

### Four dead automations

All four verified PAUSED: both Align HCM ones (employer ended 2026-09-02), the
workshop intake (event was 2026-07-21, every run found zero registrations), and
an expired monitor. `~/.codex/automations` has **no version control**, so deleting
them is irreversible and therefore not an internal action.

---

## 10. Smaller, still open

- **Managed Agents: built end to end, 2026-09-14 evening.** Full inventory and
  runbook in `System/managed-agents-inventory.md`. Two real agents
  (`momentum-url-sentinel`, `momentum-analyst`), two environments, one daily
  deployment verified by a manual run (ALL CLEAR, 14 targets, 5 real tool calls,
  6c) and then **paused** because recurring spend is Dillon's call. Total spend
  today 17c of 429. Still Dillon's: unpause the deployment (~$1.80/month), rotate
  the key, optionally archive the smoke-test agent. Phase 3 (Omega search terms
  through the analyst) still waits on Codex exporting the data.
- **Cline Desktop** installed and healthy (v0.0.27, signed by Cline Bot Inc.) but
  `userId: null` — not signed in. Telemetry is on by default. Its workspace root
  defaulted to `Documents\Codex\weekend-review`.
- **Dana Palko invite** — 3:00 PM slot verified free. Needs "Dana only, or plus
  Jayashree".
- **`.claude/CLAUDE.md` line 70** still says the design system is "Not a Git
  repository". It is one. Left uncommitted because that file currently carries
  another session's in-flight 55-line edit to a globally loaded contract.
- **`momentum-radar-daily-12`** has no `status` field at all, so it cannot be
  scheduled. It builds twelve homepages a day when it runs.

---

## Checkpoint, 2026-09-14 evening (Fable 5.1 continuation)

Done since the morning list: Omega tracking fix deployed and re-verified live by
the cloud sentinel; registry 24 → 27; `portfolio-priorities.json` repaired to
match (my own break, from that merge); ten client drafts rewritten with the real
signature and pushed to Gmail; GT Clinic kickoff email staged (attach the PDF);
Managed Agents built and paused; business ledger delivery logic fixed
(8 → 12 delivered, and it now says what it measures).

In flight, background agents: Capsule & Tonic + four unmapped accounts
reconciliation (proposals only, registry untouched); GSC/GTM/Meta/Semrush
coverage matrix and Semrush run verification.

Dropped on instruction: Replenish end-date verification (Dillon: "ignore
replenish"). The agent was stopped before it pulled anything.

**Correction, evening:** sandbox outputs DO surface via
`GET /v1/files?scope_id=<session>` (both beta headers). Earlier notes saying
otherwise were wrong. The fleet's collector is built on this.
