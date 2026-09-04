---
note_type: concept
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs: ["12_Brain/11_Craft/00_Index.md", "System/browser-access.policy.json"]
tags: [craft, agent-infrastructure, lessons]
---

# Earned lessons

Append-only. One lesson per entry, each with the evidence that earned it. Agents write
here; the dated operating brief is generated and must not be hand-edited.

Promote a lesson to `12_Brain/03_Concepts/` once it has shown up twice, and link it back
from [[12_Brain/11_Craft/00_Index|the craft index]].

## Promoted

- 2026-08-19 → [[12_Brain/03_Concepts/Confirm the Artifact Not the Action|Confirm the
  artifact, not the action]] — four entries below share one root: generated-file drift,
  the unasserted replace, the date-keyed output, and the heredoc escaping failure.

---

## 2026-08-18 — A brief that says LIVE is a claim, not a fact

**Lesson.** Probe every rung a brief calls live before building on it. An operating brief
is a spec written by someone who believed it; the estate is the only authority on what
answers right now.

**Evidence.** A grant listed `isolated Playwright MCP at http://localhost:8931/mcp` as
LIVE (verified 2026-08-18). It returned no response, and no `playwright` server was
registered in `.mcp.json` or `.cursor/mcp.json`. Five tools the same brief referenced by
path — `browser-access.js`, `browser-access.policy.json`, `Export-BrowserHistory.py`,
`Clone-CamofoxBrowser.py`, `Web Escalation Architecture.md` — had no git history on any
branch. Meanwhile a rung the brief was *pessimistic* about was fine: Chrome on `:9223`
answered HTTP 200 on a dedicated `claude-chrome` profile.

**How to apply.** Run `node _os/automation/bin/browser-access.js probe` first, every
time. Build on the probe, not the prose. Say which rung was down.

---

## 2026-08-18 — Verify profile isolation, not just port number

**Lesson.** "Not port 9222" is not the same as "isolated". Check the actual
`--user-data-dir` of the process holding the port before you drive it.

**Evidence.** Policy forbids Dillon's default Chrome profile because it holds live
logged-in client sessions, where a read becomes an authenticated action. Port alone
cannot prove isolation — a default-profile Chrome can be started on any port. Confirmed
by `Get-CimInstance Win32_Process` that the `:9223` listener ran
`--user-data-dir=C:\Users\dillo\claude-chrome`, and wired that check into
`browser-access.js` so a mismatched profile marks the engine **not live** rather than
merely warning.

**How to apply.** `verifyChromeProfile()` fails closed on an unverifiable profile. Never
relax it into a warning.

---

## 2026-08-18 — A long-running browser owns its profile directory

**Lesson.** A second Chrome cannot share the `--user-data-dir` a running instance
already locked. One-shot CLI invocations need their own throwaway isolated profile.

**Evidence.** `--screenshot` against `C:\Users\dillo\claude-chrome` failed while the
`:9223` instance held it; the identical command against a fresh temp dir wrote 4,079
bytes immediately. After switching to `oneShotProfile()`, the screenshot rung produced
7,148 bytes.

**How to apply.** Throwaway profile per invocation, still never the default. Clean the
temp dirs up.

---

## 2026-08-18 — An unasserted string replacement is a silent no-op

**Lesson.** Every scripted edit asserts its anchor matched, or it will appear to succeed
while changing nothing.

**Evidence.** A Python patch to `cmdScreenshot` used `.replace()` without an assert. The
anchor did not match because of backslash escaping, so the old locked-profile path
survived; the next run reproduced the identical failure and the error message was the
only clue. The `dump-dom` patch in the same script *did* assert and applied correctly.

**How to apply.** `assert old in s` before every replace, or use an editor that errors on
a missed match. This is the same class of failure as the generated-file drift already in
the standing lessons: a change you believe you made is worse than one you know you
didn't.

---

## 2026-08-18 — Name the rungs a CLI cannot drive

**Lesson.** When a ladder mixes agent tools with CLI-drivable engines, the CLI must
report the agent-only rungs as agent-only rather than omitting them.

**Evidence.** `WebFetch`, `WebSearch`, and the three Firecrawl tools are reachable only
over MCP by an agent holding them. Omitting them from `probe` would make the ladder look
three rungs shorter and push an agent toward Chrome for a job Firecrawl should do. They
now report `agent-only` with the exact tool slug to call, and `recommend` treats
`agent-only` as a usable first win.

**How to apply.** `probe` describes the whole ladder. `fetch` and `screenshot` execute
only what a CLI can. Never let the two blur.

---

## 2026-08-18 — Firecrawl stealth lives on one schema only

**Lesson.** `proxy: "stealth"` exists on `FIRECRAWL_BATCH_SCRAPE`. It is not a parameter
on `FIRECRAWL_SEARCH` or `FIRECRAWL_SCRAPE`.

**Evidence.** Confirmed against the tool schemas returned by
`COMPOSIO_SEARCH_TOOLS`: `BATCH_SCRAPE` exposes `proxy` with
`basic|stealth|auto`; the `SEARCH` and `SCRAPE` input schemas have no `proxy` field.
A live `FIRECRAWL_SEARCH` returned 4 results for 5 credits, so the connector itself is
healthy — only the stealth capability is schema-bound.

**How to apply.** For Cloudflare or bot detection, go straight to
`FIRECRAWL_BATCH_SCRAPE` with `proxy: "stealth"`. Asking `SCRAPE` for stealth silently
gets you a normal fetch that fails the same way.

---

## 2026-08-19 — A date-keyed generator moves its own output at midnight

**Lesson.** Read the path the tool reports, never the path you assumed. A generator
that names files by `todayISO()` writes somewhere new the moment UTC rolls over.

**Evidence.** `agent-craft-brief.js --write` was extended to emit metrics into
frontmatter. Three consecutive runs appeared to ignore the change because the file
being inspected was hardcoded as `2026-08-18 - operating brief.md`, while the run had
already rolled to `2026-08-19` and written there. The tool had printed the correct
path in its `artifacts` field each time. A runtime probe of `frontmatter()` proved the
function was correct all along, so the conclusion "the patch did not apply" was wrong
about working code.

**How to apply.** When a CLI reports the artifact it wrote, verify that path. Two
earlier lessons here are the same failure wearing different clothes — an unasserted
replace, and generated-file drift — and the shared root is trusting an assumption
about a filename instead of the tool's own output.

---

## 2026-08-19 — Three layers of escaping is a trap, not a technique

**Lesson.** Do not script a file edit through a bash heredoc containing Python that
contains a Windows path. Use the file-editing tool.

**Evidence.** Four separate patches failed with
`SyntaxError: (unicode error) 'unicodeescape' codec can't decode bytes ... truncated
\UXXXXXXXX escape` — every one caused by `C:\Users` inside a Python string literal
inside a heredoc. Each failure printed a success line from an earlier statement in the
same script, so the patch looked applied. The W09 allowlist fix landed only once it was
done with the Edit tool, which errors when its anchor does not match.

**How to apply.** Reach for the editor first for any file change. If a script really must
do it, use forward slashes or raw strings, and assert the anchor.

---

## 2026-08-19 — An agent file is not an installed agent

**Lesson.** Writing `.claude/agents/*.md` in a repo does not make those agents
invokable. A project-level agents directory is discovered only when that repo is the
session's project root, and the registry is built at session start.

**Evidence.** Seven agents had been generated into `dillon-os/.claude/agents/` and
documented in AGENTS.md as "the operating layer". Invoking `reliability-scout` failed
with `Agent type 'reliability-scout' not found` — the session's root was
`C:\Users\dillo\.codex`, so the vault's agents were never seen. Installing the same
files to `~/.claude/agents/` fixed availability for future sessions, but the running
session's catalog still did not contain them, because it was built before the files
existed.

**How to apply.** `Build-ClaudeAgents.py` now writes both the versioned vault copy and
the user-level install. New or renamed agents need a session restart before they can be
invoked. Same family as [[12_Brain/03_Concepts/Confirm the Artifact Not the Action|confirm
the artifact, not the action]]: the file existing is not the capability working.

---

## 2026-08-18 — A zero exit code and a zero error count can still be a failed routine

**Lesson.** When a JSON contract crosses a redirected pipe on Windows, the encoding is
part of the contract. PowerShell encodes redirected stdout in the OEM code page and
best-fit-maps what it cannot represent — and U+201D best-fits to a bare ASCII `"`, which
terminates a JSON string early. The producer reports success; the consumer sees garbage.

**Evidence.** W11 and D03 died at `stage:build` three times each on 2026-08-18, gates
8/8, `next_safest_action: resolve stage:build`. Run by hand, `Test-SecondBrain.ps1 -Json`
returned exit 0 with `errorCount: 0` — a healthy vault. The failure was in the validator:
`json_with_issues` threw `Invalid object passed in, ':' or '}' expected. (940)`. Raw pipe
bytes at that offset were `20 83 3F 22`. Two bugs composed: `Get-Content -Raw` without
`-Encoding` read a BOM-less UTF-8 note in the ANSI code page, turning an em dash
(`E2 80 94`) into three characters ending in U+201D; then CP437 best-fit turned that
U+201D into `0x22`. The vault was fine and the link it complained about resolved to a file
that exists on disk (`02_Campaigns/Growth Workshop/Slack Draft — Sean.md`). Introduced by
commit `b5f66c0b`, which added a path-qualified em-dash wikilink; the next scheduled run
failed and every prior day had been 9/9.

**How to apply.** Fix it in the child, not the parent. Four parent-side variants were
tested — `$psi.StandardOutputEncoding`, and setting `[Console]::OutputEncoding` before
`Process.Start`, in both combinations — and all four still failed to parse, because the
character is destroyed in the child's encoder before the bytes reach the pipe. Every
script whose stdout is parsed needs `[Console]::OutputEncoding` set to UTF-8 in its own
preamble, and every read of vault content needs an explicit `-Encoding UTF8`. Corollary:
a build command that exits 0 is not a passing build command — read the `validate` rule too.

---

## 2026-08-19 — Trailing-window reliability has no memory of repair

**Lesson.** A reliability score computed over a trailing window is a prompt to read
receipts, never a verdict. It cannot distinguish "still broken" from "fixed days ago".

**Evidence.** D16 and W04 each showed 0.78 in the 7-day craft brief and were named as
unreliable. Both had failed exactly twice, four minutes apart, on 2026-08-13, and had
completed 9/9 every day since; `team_validate` passed by hand at exit 0. Their scores
stay depressed until 2026-08-20 purely because the window still contains 08-13. Separately
W11 read 0.60 against D03's 0.70 on an identical root cause — the entire gap was one
older unrelated incident, and W11's denominator was inflated 7x because it is a weekly
routine that was still keying dedupe daily until the cadence fix landed on 08-18.

**How to apply.** Treat the brief's `unreliable` list as a queue to investigate, not a
list of broken things. Read `last_completed` and the failure timestamps before concluding
anything is currently failing.
---

## 2026-09-03 — A routine whose only output is an unmerged PR has no output

**Lesson.** Generating a file into a branch nobody merges is indistinguishable from
not generating it. Before adding a routine that writes a brief, name the surface a
human actually reads and make the routine land there — or accept that its findings
are write-only.

**Evidence.** `cursor/competitive-task-consolidation` opened 13 pull requests
between 2026-08-21 (#333) and 2026-09-03 (#360), one per day, +16,843/-509 lines,
none merged. Each regenerates `System/slack-action-queue.md`, a file that
**does not exist on `origin/main`** — `git show origin/main:System/slack-action-queue.md`
returns `fatal: path ... does not exist`. PR #360 describes that file as holding an
"M360 Slack quartet (~5 weeks unanswered)". Thirteen days of a client-facing
escalation were computed correctly and discarded on the branch. The wider estate
tells the same story: 127 open PRs, 116 draft, 22 older than 30 days, oldest 37.

The tell was available the whole time and was itself unread: `11_Craft/00_Index.md`
reported **0 concrete lessons and 9 no-findings over 14 days** while the backlog
tripled. A learn stage reading a source that cannot carry the evidence reports
health, not health.

**How to apply.** For any routine that emits a file, assert the destination exists
on the branch a human reads before trusting the routine — `git show <base>:<path>`
is the whole check. If the routine cannot merge on its own, it must write somewhere
unmerged work still surfaces (the approval queue, a brief on `main`), not only into
its own branch. And when a learn stage returns `no_finding` repeatedly while
observable state moves, treat the empty result as a broken probe, not a clean bill —
the same failure mode as *a fail-closed probe pointed at a source nothing writes*,
one rung up.

---

## 2026-09-03 — Harvest the transcript with the filesystem's rules, not the data's

**Lesson.** Code that walks a real session store fails on the filesystem long before
it fails on the JSON. Budget for path limits, console encoding, and records the
harness wrote to itself — all three break at 2am, none appear in a small test.

**Evidence.** Building `_os/automation/bin/harvest-sessions.py` against
`~\.claude\projects` (282 files, 271 MB, 180 touched in 36h) hit three failures in
sequence, each fatal and each invisible until run against the full tree:
`FileNotFoundError [WinError 3]` from `os.path.getmtime` on the long
`C--Users-dillo-Documents-Codex-2026-08-09-client-prospect-radar-...` paths, needing
the `\?\` prefix; `UnicodeEncodeError: 'charmap' codec` on a `\u276f` in a prompt,
because Python's stdout defaults to cp1252 on this machine; and a harvest polluted
by `<task-notification>`, `<bash-input>`, `<bash-stdout>` and `<scheduled-task>`
records, which are the harness talking, not Dillon. Filtered and fixed, the same
tree yields 147 human turns across 10 workspaces in a few KB.

**How to apply.** Three defaults for anything reading this estate's own logs:
wrap every path in `\?\` on Windows and let `getmtime`/`open` fail soft per file
with a counter, not an exception; force
`io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')`;
and filter harness-authored records by prefix before counting anything as user
intent. Then check the totals against a known day — a harvester that silently
returns fewer asks than the day contained is worse than one that crashes.
