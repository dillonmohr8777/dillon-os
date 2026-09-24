---
note_type: review
status: open
created: 2026-09-23
updated: 2026-09-23
scope: "Work that Codex sessions left unfinished, unsaved, or waiting on Dillon"
verification: "Every live-state claim below re-checked against filesystem and git on 2026-09-23"
tags: [codex-recovery, open-loops, review]
---

# Lost, unfinished, and still waiting

Curated from 3,505 Codex sessions. **Session claims were not taken at face value** — each
was re-checked against the live filesystem and git. Several had gone stale in both
directions: some "blocked" items resolved themselves later, and some "safely quarantined"
work no longer exists where it was left.

Ordered by how recoverable it still is.

---

## 1. Genuinely lost

### The motion-studio package — 22 files, gone

- **When:** 2026-08-09 04:54, `Documents\Codex\2026-08-09\push-these-to-netlify`
- **What the session said:** *"I couldn't safely deploy the new motion-studio package
  because its 22 files remain in an unavailable remote Codex checkout; this local folder
  is empty."*
- **Verified 2026-09-23:** `Documents/Codex/2026-08-09/push-these-to-netlify/` is
  **still empty — zero files.** The remote Codex checkout that held them is long gone.
- **Assessment:** unrecoverable from here. The prospect sites that *were* live
  (Germantown Dental, Udis & Conn) deployed fine; only the motion-studio work was lost.
  If it matters, it needs rebuilding, not recovering.

### 245 sessions never completed a single turn

Opened, prompted, and died before any `task_complete`. A further **998 ended mid-turn**
(more `task_started` than `task_complete`). Individually these are mostly retries of a
prompt that succeeded moments later on another thread; the CSV's `turns` vs
`turns_completed` columns let you find any specific one.

---

## 2. Work that exists but was never landed

### DeerFlow `enterprise-fleet` WIP — 57 files in a patch nobody applied

- **When:** 2026-09-21, quarantined by the `pi` thread
- **What the session said:** `deer-flow-deploy-20260920` was dirty with 17 tracked and
  10 untracked shared-workspace/invitation files — *"the unfinished code/release gap …
  should stay quarantined pending targeted tests and an ownership/merge decision."*
- **Verified 2026-09-23:**
  - `Documents/Qwen/deer-flow-deploy-20260920` **no longer exists.**
  - The work survives in `Documents/Qwen/deer-flow-WIP-BACKUP-20260921-0347/`:
    `HEAD.txt` = `bc99e707` on `codex/enterprise-fleet-20260920`,
    `tracked-changes.patch` covering **57 files**, plus 8 untracked files including
    `frontend/src/components/workspace/command-center/momentum-glyph.tsx` and two
    unit tests.
  - **The patch has never been applied.** `deer-flow` is clean on
    `recover/momentum-integrate-20260921`.
- **The ownership/merge decision the session asked for was never made.** This is the
  single largest recoverable body of unlanded work in the archive. Note that HEAD
  already carries a `feat(workspace): command center, momentum glyph, shimmer` commit,
  so **some of this may have been redone independently** — diff before applying.

### DeerFlow memory-prevention patch — staged, validated, never deployed

- **When:** 2026-09-21 19:05, thread `Fix Deer Flowes memory backend`
- **What happened:** after correcting DeerFlow's memory (it had recorded that you own
  KJB, from a test conversation), the session wrote a guardrail patch to stop the class
  of error recurring. `git apply --check --whitespace=error-all` passed, regression test
  passed. Full pytest could not run — the host Python lacks `pytest`.
- **Verified 2026-09-23, all present:**
  `Documents/Codex/2026-09-20/https-x-com-korzhov-dm-status/evidence/memory-repair-20260921/`
  → `staged-prevention.patch` (4,790 B), `test_memory_prevention.py`, `REPAIR.md`,
  `repair_memory.py`, `staged-source/`.
- **Status:** *"staged, not deployed."* **Independently confirmed** — a recursive grep
  for `test_memory_prevention` across every `.py` file in `Documents/Qwen/deer-flow`
  returns nothing, so the patch never reached the repo. Cheap to finish.
- **Worth keeping regardless:** that session derived five durable memory-extraction
  rules — ownership needs an explicit claim not a pronoun; preferences need a durability
  signal; never store assistant output as user history; later explicit correction wins;
  tag role-play vs task-state vs preference vs verified-fact. Those exist nowhere but in
  that rollout file, and are now captured in the 2026-09-21 thread notes.

### Align HCM dashboard — `pr-3` never merged, 3 files never committed

- **When:** the `align-hcm-dashboard-live-refresh` automation ran daily and failed
  repeatedly — 2026-07-24, 07-29, 07-30 (×2), 08-03 (×2) — with `blocked:validation`
  and `blocked:reauth`, each time regenerating files and then refusing to commit.
- **Verified 2026-09-23** at `Documents/Codex/2026-07-16/do-this/align-crm-dashboard-pr3`:
  - Branch `pr-3`, **not merged into `origin/main`**, 1 commit ahead
    (`9ab719b Add 2026 YTD page, lead CSV exports, ticker, and movement indicators`).
  - **3 files still dirty:** `site-health-dashboard/2026.html`, `data.js`, `index.html`
    — the automation's regenerated output, uncommitted for seven weeks.
  - Last successful data pull recorded `leads-all.csv=3225`, `leads-2026.csv=2222`,
    `contacts=4858` for HubSpot portal `242825734`.
- **Assessment:** the automation is dead and the branch is stranded. Needs a
  merge-or-abandon decision. Align HCM is also the employer relationship that ended
  (see 2026-08-20), so this may simply be closeable.

---

## 3. Sessions that died waiting on you

### The DeerFlow prompt that was never delivered

- **When:** 2026-09-21 19:11, `Documents\Codex\2026-09-21\for-the-deer-flow-terminal-hi`
- **What happened:** you asked for a prompt to be injected into the running
  *"Fix Deer Flowes memory backend"* terminal. The session resolved the right target
  (`01a0c55a-ffe9-70a2-b024-7ac7250eb85d`) but both the app handoff and
  `codex exec resume` were refused — `already has an active writer`. It correctly
  declined to force it, and ended: *"Once that terminal finishes or releases the lock,
  tell me **retry** — you won't need to paste the prompt again."*
- **You never said retry.** The session sat 215 minutes and closed.
- **Verified 2026-09-23:** `CHECKPOINT.md` is still 508 bytes, unchanged since Sep 21
  15:20, still reading *"Delivery: not completed; no prompt was added to the target
  thread. Next safe action: retry the same handoff."*
- **Mitigating:** the target thread did its own work anyway — it completed the memory
  repair described above, so the failed injection cost less than it looks. And the
  prompt's actual payload (four Claude profiles for `.codex/config.toml`) **did** land:
  `config.toml` now carries 4 Claude profiles and the backup
  `config.toml.bak-claude-profiles-20260921` (40,476 B) exists.

### Other waiting-on-user endings (14 total)

| When | Waiting on | Live status 2026-09-23 |
|---|---|---|
| 2026-07-23 | Meta passkey approval for a **$145.45 Fagan Painting charge** — *"has not submitted yet"* | **Resolved 2026-09-24 — the charge was never submitted.** See below |
| 2026-09-01 | IRS/ID.me password + MFA; session parked at the login screen awaiting *"Show it"* | Never completed in-session. Correctly refused to handle the credential itself |
| 2026-09-20 | Windows **UAC prompt** to finish the Tailscale install for private DeerFlow mobile access | **Resolved** — Tailscale is installed (`tailscale.exe`, `tailscaled.exe`, `tailscale-ipn.exe` present) |
| 2026-07-11 | PNC Care Center callback on the disabled ad account | Superseded by later Fagan work |
| 2026-07-22 | A VA Claims Vercel team admin to add `dillonmohr8777` or redeploy `14bcdba` | Stale; VA Claims does not appear in September threads |

### The $145.45 Fagan charge — settled, and the account needs attention

Checked directly in Meta Business Suite on **2026-09-24**, read-only, via the in-app
browser (which holds a live Meta session). Ad account **`1399331594100332` "Dillon Mohr"**
— the only ad account on this login, and the one the July sessions were working in.

**Payment activity, Jul 22–24 2026, complete list:**

| Date | Amount | Method | Status |
|---|---|---|---|
| Jul 24 | $25.42 | Visa ···· 0507 | **Failed** |
| Jul 24 | $16.95 | Visa ···· 0507 | Paid |
| Jul 24 | $9.69 | Visa ···· 0507 | Paid |
| Jul 23 | $7.73 | Visa ···· 0507 | **Failed** |
| Jul 23 | $61.80 | Visa ···· 0507 | **Failed** |

**There is no $145.45 transaction.** The session's *"The $145.45 charge has not submitted
yet"* was accurate, and it never went through afterwards either. Nothing to reconcile,
nothing double-charged. Close it.

**But two things surfaced that are worth more than the original question:**

1. **The ad account is disabled right now.** Meta's banner: *"We noticed some unusual
   activity, so we've disabled your ad account. Take action to run ads again."* A second
   banner reports *"Permissions needed — to change payment settings contact an account
   admin."*
2. **Outstanding balance: `$1,406.24`.** Late July shows why — two large failed charges
   on Visa ···· 0507 (**$898.98** on Jul 30, **$879.63** on Jul 29), alongside roughly
   twenty refunds on a *different* card, Visa ···· 7195, all dated Jul 29.

That is a stuck card plus an unpaid balance plus a disabled account, and it has been
sitting since July. It is the same failure the 2026-07-11 session was originally called
in to fix (*"quickly fix the disabled account bc of payment … for fagan painting"*),
which means **that problem was never actually resolved — it recurred or never cleared.**

I did not touch **Pay now**, change any payment method, or contact support. Paying the
balance and re-enabling the account are your calls to make.

---

## 4. Flags that resolved themselves

Worth recording, because the flag is still on the thread note and would otherwise
mislead you:

- **DeerFlow mode-resolution fix** (2026-09-20) ended *"No commit or push performed"*
  after 1,774 frontend tests, 159 backend tests and 5 Chromium flows passed.
  **It landed.** `frontend/src/core/settings/local.ts:25-31` now carries the
  `supportsThinking` logic, and the tree is clean.
- **Sol's fleet build** (2026-09-19) hit the Codex usage limit leaving *"only empty
  fleet directories … no verified agent configs"*. `deer-flow/fleet/` now holds
  **19 files** across 8 agent directories plus `evals/LIVE-EVAL-RUNBOOK.md`.
- **AI division deck** — the thread you were most worried about closed clean:
  *"Disposition: ship."* The DeerFlow slide claiming "4 services" was independently
  re-verified on 2026-09-22 23:09 EDT and corrected: 4 containers is true for canonical
  `deer-flow` only, not host-wide — a separate 4-container rehearsal project and 2
  unmanaged test containers were also running.

---

## 5. Standing pattern worth fixing

**285 sessions closed with something explicitly unverified, and 218 with something built
but unpublished.** That is the dominant failure mode in this archive — not crashes and
not lost files, but completed work whose last mile was never walked. The sessions were
consistently honest about it; the reports simply had nowhere to land.

That is what this folder is for. Read `THREADS.md` top-down when you want the backlog.
