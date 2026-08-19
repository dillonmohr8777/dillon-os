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
