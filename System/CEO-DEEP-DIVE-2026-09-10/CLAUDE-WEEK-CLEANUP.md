# Claude Week Cleanup — 2026-09-03 → 2026-09-10

Evidence from `.claude` handoffs, plans, auto-memory, root MACHINE-INDEX / RECOVERED-ASSETS / deletion candidates, and vault System notes. Read-only synthesis.

---

## What Claude (and peers) cleaned or tightened

1. **Agent roster made load-safe (Sep 9)**  
   PR #5 on `dillon-claude-config`: seven daily agents + `_check-agents.mjs` so agents cannot silently fail to load. Handoff: `.claude\HANDOFF-2026-09-09.md`.

2. **Registry growth for missing real clients (Sep 9)**  
   Work to add `nexla`, `puttery-nyc`, `deborah-mara` (556 files of work previously invisible to roster-driven automation). Shipped toward `client-operations-canonical` PR #65; Documents\Codex canonical json still showed **24** entries tonight without those three in the parsed list — **cleanup incomplete / multi-copy lag**.

3. **Fagan Painting retired as active client (Sep 9)**  
   operating-status + approval-queue marked retired/reference-only. Registry json still listed `fagan-painting` active tonight — again, projection lag.

4. **Align HCM employment boundary**  
   Confirmed ended 2026-09-02 in operating-status / brain decisions; `02_FullTimeJob\AlignHCM` retained historical. Registry still `active` — stale.

5. **Session estate consolidation (Sep 9)**  
   Vault reviews + approval items: private remotes for Philly game trees; Fable avatar-life backup repo; Bridge PR #17 opened; design-system drift claim corrected (not vendored drift).

6. **`.last-cleanup` stamp**  
   `2026-09-10T21:01:06.280Z` under `.claude` — automated cleanup ran today (contents not dumped; stamp only).

7. **Deletion-candidate inventory (Sep 1, still actionable)**  
   `repo-deletion-candidates-2026-09-01.md` lists multi-GB clean Codex session clones safe to delete (nothing deleted yet by policy).

8. **MACHINE-INDEX (Sep 4)**  
   Named the disease: vault in ≥9 places, client-ops in ~7, archaeology labeled, recommended `lanes\` worktree layout.

9. **Worktree collision lesson (Sep 9 memory)**  
   After live data loss when another session switched branches under a writer: rule is now “own worktree, commit early, never share stash.”

10. **Empeon / job-search artifacts filed**  
    Attribution PDFs + Nack/Matt drafts under `02_FullTimeJob\Empeon\` — not “cleanup” of disk, but filing out of session cache into vault.

---

## What is still bloated / unhealthy

| Bloat | Evidence | Severity |
|---|---|---|
| **Vault worktree swarm** | `git worktree list` → **40** on `dillon-os`; MACHINE-INDEX previously 37 including Temp paths | High |
| **Vault dirty + off-main** | Branch `cursor/immohrtal-standing-canary-3c2e`; many modified files; sessions read lane state not main | High |
| **client-operations copies** | Canonical + 4–5 Codex forks + `repos\client-operations-canonical` + Claude worktree copy | High |
| **Dated Codex session clones** | ~130 folders Jul–Aug; GB-scale deletion candidates untouched | High |
| **Netlify orphan estate** | 397 sites; ~285 with no local source; duplicate dated report sites | High |
| **Approval queue age** | Dozens of Jul 12–Aug items still open beside Sep urgents; file violates its own “archive >150 lines” spirit | Med-High |
| **Home as session root** | 67 historical Claude project locks on `C:\Users\dillo` | Med |
| **CONTROL “Waiting on Dillon” Cursor spam** | Many repeated “Cursor integration” waiting blocks in CONTROL.md | Med |
| **Roster triple disagreement** | operating-status (~14 narrative) vs registry (22 “active”) vs clients folders (29) | High |
| **dillon-os-films parallel vault** | Full vault-shaped worktree for films; easy to edit wrong tree | Med |
| **Buzz extract / installer archaeology** | Jul 29 Codex session still holding buzz-source/release trees | Low-Med |
| **Power-loss risk compounding bloat** | 14 unclean shutdowns/30d → unpushed duplicates become the backup strategy | High |

---

## Themes from plans / handoffs (Sep 5–9)

Plans under `.claude\plans\` (names only; content sampled via parallel dump): activity clustered around **AI division launch**, **Momentum films**, **registry/roster**, **worktree safety**, **Empeon/job search**, **client builds (Omega, Bar Crawl, Nexla)**. Cleanup is a **side-effect of estate reviews**, not a dedicated prune sprint — deletion candidates remain unexecuted.

Auto-memory priorities (`dillon-real-priorities.md`): Momentum is **not** full-time; landing a role is the goal; live client lanes called out as Next Law + Omega + Puttery + AI division (treat as memory, re-verify against registry before acting).

---

## Clean vs dirty scorecard (CEO view)

| Area | Cleaned? | Still needs hands |
|---|---|---|
| Agent load checks | Yes | Keep `_check-agents` green |
| Naming archaeology | Documented | Execute deletes from Sep 1 list |
| Client registry completeness | Partial | Merge/reconcile Documents path; retire Align/Fagan flags |
| Worktree hygiene | Policy written | Prune to live lanes only |
| Approval queue | Fagan items checked off | Archive Jul noise; promote Sep security/ads items |
| Session start location | Warned | Enforce lanes\; ban home starts |

---

## Open questions (cleanup-specific)

1. Was PR #65 fully merged into `Documents\Codex\projects\client-operations`, or only the GitHub `client-operations-canonical` mirror?
2. Which of the 40 vault worktrees are still referenced by live agents vs dangling Temp?
3. Is `.last-cleanup` removing session junk only, or also touching plans/projects?
4. Who owns executing `repo-deletion-candidates` without breaking a Netlify-only orphan that still serves a client?
