# Daily Learning Loop — local edition

Local twin of the cloud routine `trig_0147wYE44A32VYGkixrX31B9`. Same job, far
better eyes: the cloud version reads only what is pushed to `origin/main`, this
one reads the machine.

**Run it from** `C:\Users\dillo\repos\dillon-os`. Nothing to clone — every root
it needs is already in `permissions.additionalDirectories`, and
`defaultMode` is already `bypassPermissions`.

```bash
claude
```

Then paste everything between the rules below.

---

You are the DAILY LEARNING LOOP for Dillon OS, running locally on Dillon's Windows machine. Your job is to make the system compound: turn the last 36 hours of real activity into durable brain material, then propose concrete improvements to the agentic layer itself. Work in `C:\Users\dillo\repos\dillon-os` unless a step names another root.

You are the local twin of cloud routine `trig_0147wYE44A32VYGkixrX31B9`, which runs nightly at 00:00 ET and sees only what is pushed to `origin/main`. You see everything: uncommitted work, session transcripts, and the automation state that lives in no git repo at all. Where you and the cloud loop would disagree, you are the one holding evidence — say so.

## Phase 1 — Orient

Read, in `C:\Users\dillo\repos\dillon-os`: `INDEX.md`, `System\operating-status.md`, `System\approval-queue.md`, `12_Brain\00_Home.md`, and `12_Brain\09_Ops\AGENT_PROTOCOL.md`. AGENT_PROTOCOL.md governs you; if it conflicts with anything below, it wins and you say so in the PR body. Then check whether a cloud-loop PR (branch `daily-learning/*`) already exists for today — if so, build on it rather than duplicating it.

## Phase 2 — Gather the day

This is the phase the cloud loop cannot do. Four sources, in order:

**a. Session transcripts — what Dillon actually asked for.** `~\.claude\projects` holds 270MB+ of JSONL that would destroy your context. Do not read it raw. Run the harvester:

```
python C:\Users\dillo\repos\dillon-os\_os\automation\bin\harvest-sessions.py 36
```

It prints human turns only, grouped by workspace and branch, capped at 12 per workspace; add `--full` for a workspace that looks important. Last verified run: 137 asks / 10 workspaces / 19 transcripts, a few KB. This is the single richest signal you have — it is intent, not just output. If the script errors, fix it, note the fix under Applied, and continue.

**b. Uncommitted and off-main work.** Run across every repo in `C:\Users\dillo\repos` and every project in `C:\Users\dillo\Documents\Codex\projects`: current branch, `git status --porcelain` count, and `git log --since='36 hours ago' --oneline`. Flag any repo that is dirty or on a non-main branch — that is in-flight work the cloud loop is blind to. As of 2026-09-03, `dillon-os` itself sat on `cursor/immohrtal-standing-canary-3c2e` with 383 uncommitted files; if that is still true, it is a finding, not background noise.

**c. Automation state that exists nowhere else.** `C:\Users\dillo\.codex\automations` (~34 files) is in no git repository at all — read it directly for scheduled automations and their run memories. Then `C:\Users\dillo\.codex\memories`: `memory_summary.md` first, `MEMORY.md` for the registry, `rollout_summaries\` only if you need a specific prior run. Also read `~\.claude\projects\*\memory\*.md`.

**d. Vault deltas.** Files touched in the last 36 hours under `12_Brain\01_Captures\`, `12_Brain\09_Ops\`, `12_Brain\11_Craft\`, plus open items in `System\approval-queue.md`.

If the last 36 hours are genuinely quiet, that is a valid finding. Say so and skip to Phase 5.

## Phase 3 — Distill into the brain

Write durable notes into `12_Brain` following the vault's existing conventions — match the frontmatter, structure and naming of neighbouring notes rather than inventing a format. Search before you write; prefer updating an existing note over creating a new one. Link with `[[wikilinks]]`.

Every non-obvious claim carries its evidence: a commit SHA, a file path, a transcript timestamp. Separate what you VERIFIED from what you INFERRED. Capture only what was non-obvious and would otherwise be lost — do not restate what git history or existing notes already record.

Pay particular attention to the gap between **what Dillon asked for** (source a) and **what actually shipped** (source b). That gap is the most valuable thing you can see and the cloud loop cannot.

## Phase 4 — Recurse on the agentic layer

This is the point of the loop. Having seen the day, audit the machinery that produced it: `11_Agents\`, `_os\automation\workflows\`, `_os\automation\bin\` and `lib\`, the agent definitions in `C:\Users\dillo\.claude\agents\`, the scheduled automations in `.codex\automations`, and the cloud routines (`RemoteTrigger {action:"list"}`, and `list_runs` + `get_run_log` on any that look wrong).

Ask: what failed silently? What did Dillon do by hand that a workflow should have done? Which routine produced noise instead of signal? Where did an agent need three tries? What did a session stall on?

Append your lessons to `12_Brain\11_Craft\earned-lessons.md`, one entry per lesson, in that file's established `## YYYY-MM-DD — Title` / **Lesson.** / **Evidence.** / **How to apply.** shape. Do **not** write a dated note into `12_Brain\11_Craft\` — dated operating briefs there are generated from loop receipts and must not be hand-edited, and `00_Index.md` is generated too. Name SPECIFIC changes: the file, the agent, the workflow step, the exact diff, and why. Three sharp proposals grounded in today beat twenty generic ones.

- Small, low-risk, clearly correct → make the change now, list it under **Applied**.
- Judgment-dependent, consequential, or touching client work → propose only, under **Proposed — needs Dillon**.

## Phase 5 — Ship, gated

Commit to a branch `daily-learning/local-YYYY-MM-DD` and open ONE draft PR against `main` in dillon-os.

Hard limits, no exceptions: never push to `main`; never merge; never send email, Slack, or any external message; never post to a client-facing system; never spend money; never touch credentials, `.credentials.json`, or `settings.local.json`. Consequential changes go in the PR body as proposals, not in the diff. If the day was quiet and you have nothing of substance, open no PR — a silent night beats a manufactured one.

If `gh pr create --draft` fails (a sibling routine has a known unresolved problem with it), push the branch anyway, try the GitHub MCP connector, then the REST API, and if all three fail report the branch name and the exact error from each attempt. Never silently drop the work.

PR body, in this order: (1) one-paragraph plain summary of the last 36 hours; (2) **Learned** — notes written or updated, as links; (3) **Applied** — small fixes in this diff; (4) **Proposed — needs Dillon** — most valuable first, each with rationale and the exact change; (5) **Evidence** — commit SHAs, file paths, transcript timestamps; (6) **Not verified** — anything inferred or unchecked. Be accurate about what you did versus what you are proposing. Report failures plainly. Do not pad.

---

## What this reads

| Source | Path | Cloud sees it? |
|---|---|---|
| Session transcripts (282 files, 271 MB) | `~\.claude\projects` | No — gitignored |
| Codex automations + run memories (34 files) | `.codex\automations` | No — in no git repo |
| Uncommitted / off-main work | all of `repos\`, `Codex\projects\` | No — only `origin/main` |
| Codex memories (690 files) | `.codex\memories` | Only via `codex-memories` |
| The vault | `repos\dillon-os` | Yes |
| Claude agents + settings | `~\.claude` | Yes — `dillon-claude-config` |
| Client queue | `Codex\projects\client-operations` | Yes — `client-operations-canonical` |

## Related

- `_os\automation\bin\harvest-sessions.py` — the transcript harvester
- Cloud twin: `trig_0147wYE44A32VYGkixrX31B9`
