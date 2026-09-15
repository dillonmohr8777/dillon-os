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

## 2026-08-27 - A disabled agency task plus an 08:30 heartbeat is not a seven-agent crew

**Lesson.** Autonomy is a wake plus a bounded dispatcher that still stops at send. A
Disabled Windows task named after the company, an expired five-seat lease, and a daily
Codex heartbeat that does not prove persistent agents are idle, not stuck, until a loop
that actually runs is wired.

**Evidence.** `IMMOHRTAL Agency Daily` is Disabled after the franchise/webinar source
audit. The 2026-08-26 office receipt says the Codex heartbeat is ACTIVE at 08:30 ET and
also says that receipt does not prove a background runtime. The five-seat
`crew-runtime.json` lease expired at 2026-08-27T01:19:19Z. Cycle `CREW-20260827-013941994`
registered `Immohrtal-Crew` (Ready, PT2H, hidden VBS host) and ran all seven lanes with
`mail_ready=hold`. Live agency probes returned HTTP 200 on `/`, `robots.txt`, and
`sitemap.xml`. Google Ads stayed blocked on developer-token 429 until 2026-08-27T10:36:19Z.

**How to apply.** Keep the crew dispatcher on the hidden-task manifest. Wake the Cursor
private worker for MCP work. Do not re-enable `IMMOHRTAL Agency Daily` until the source
audit clears. Do not treat heartbeat configuration as proof the seven agents ran.

---

## 2026-09-02 - A learn stage that only says "receipt assembled" is silence with a checkmark

**Lesson.** A stage named `learn` that cannot emit a finding is not learning; it is a
ninth green box. Make the learn output required and two-valued: a concrete lesson, or an
explicit no-finding that names what was compared. Then the absence of lessons is itself
evidence instead of an unknown.

**Evidence.** All 26 receipts in `12_Brain/queue/claude-loop-2026-09-02.jsonl` recorded
stage 9 as `emit_receipt` / `receipt assembled`. No routine execution had ever produced a
lesson or a no-finding; every one of the 12 entries in this file was hand-written. In the
same pass, `12_Brain/state` carried five different timestamp names (`updated`,
`written_at`, `updated_utc`, `last_cycle_utc`, `recorded_at_utc`), so the `registry_state`
freshness probe fell back to file mtimes, and the dispatcher was 606 lines of PowerShell
with `C:\Users\dillo` paths baked in, so nothing about the loop ran off this box.

**How to apply.** The dispatcher is now `_os/automation/bin/claude-loop.js`;
`Invoke-ClaudeLoop.ps1` is a wrapper. Every executed routine writes `learn` into its
receipt: a failed stage or a stage whose state changed since the last checkpoint is a
lesson; an unchanged run is `no_finding` with the comparison named. The craft brief lists
lessons seen on two days as promotion candidates; writing them here stays an agent step.
Routine and automation state carries `generated_at` (`12_Brain/schemas/automation-run.json`),
and `queue-status.js` measures staleness from it. Same family as
[[12_Brain/03_Concepts/Confirm the Artifact Not the Action|confirm the artifact, not the
action]]: a stage that passes is not a stage that did anything.

---

## 2026-09-03 - A verification harness that does not cache-bust the assets it re-fetches will fail a correct build

**Lesson.** A harness that rewrites a page into an iframe re-fetches the HTML but leaves
the browser free to serve `css`/`js` from cache. After a rebuild it then measures new
markup against the previous stylesheet and reports failures that do not exist on the live
page. Before believing a harness that suddenly fails on things you did not touch, load the
page normally and compare - and make the harness bust its own first-party assets so the
question cannot recur.

**Evidence.** In the papa-style-radar-10 design pass, `verify.html` reported 5 of 41
failures on `sites/golden-sea/`: `content x 73` measured 57.5, `.wrapper` padding-top 0
instead of 100px, the header scroll swap at 385/386 instead of 485/486, and the pre-swap
mark neither hidden nor translated. A two-path probe rendering the same URL twice in one
page - once by normal `iframe.src` navigation, once through the harness's own
`document.write` rewrite - returned identical and correct values on both paths
(`padding-top=100px`, `padding-left=15px`, `opacity=0`, `transform=translate(-500px,...)`,
hero figure top 129.66). The only difference was a stale `site.css`. Re-running the
harness against a fresh URL gave `VERIFY PASS`, 0 of 41. Both harnesses now rewrite
first-party `href`s with a timestamp.

**How to apply.** Two sibling traps were found in the same pass and are worth the same
suspicion, because each one produced confident numbers that were wrong:
(1) an `object-fit: contain` image reports its *element box*, not the glyph, so a mark
measured at 1234x436 was actually painting 506x436 - compute the contained rect from
`naturalWidth`/`naturalHeight` before comparing against a minimum;
(2) a contrast sweep must skip elements that own no text node, or every `<li>` wrapping a
white `<a>` reports the body's inherited `#666` and manufactures 12 failures per page.
Harnesses at `2026-09-03-papa-style-radar-10/build/{verify.js,audit.html}`. Same family as
[[12_Brain/03_Concepts/Confirm the Artifact Not the Action|confirm the artifact, not the
action]] - a measurement is an artifact too, and it needs its own confirmation.

---

## 2026-09-03 — A resize harness must wait on the frame agreeing about its own width

**Lesson.** A multi-viewport iframe harness that settles on a fixed timer reports the
*previous* combination's layout. The only trustworthy settle is a chain of real signals:
the frame's own `load`, two `requestAnimationFrame`s, `document.fonts.ready`, and then an
assertion that `iframe.contentWindow.innerWidth` equals the width you asked for. If that
assertion never holds, record the combination as an error - never as a number.

**Evidence.** `2026-09-03-papa-style-radar-10/build/audit.html` slept 250ms + 900ms after
`iframe.onload` and then measured. It reported nine `768` rows byte-identical to their
`375` values, and once attributed 24 broken images to `sangillo` while the frame still held
hub content. Replacing the timers with load + rAF + fonts + an `innerWidth === w` gate made
the sweep honest: 33 of 33 combinations returned distinct, correct numbers, and the same
sweep run against the deployed URL reproduced them exactly.

**How to apply.** Two traps ride along with this one, both found in the same pass:
(1) **race every `requestAnimationFrame` against a timeout.** The Claude browser pane
throttles rAF in a frame it is not painting, and this harness's iframe lives at
`left:-99999px` - an un-raced `rAF` hung the whole sweep on the first of 33 combinations
with no error. `new Promise(r => { win.requestAnimationFrame(r); setTimeout(r, 80); })`.
(2) **a harness bar written for the old design silently becomes a lie.** The hero-mark
minimum was `width >= 0.78 * viewport`, written when marks were full-bleed. Once every
mark was capped at 1.4x its native pixels that bar was unreachable by construction, so it
failed correct pages. When the design rule changes, the ruler changes with it - and the
new bar belongs in the harness as *two* checks, not one: big enough to read, and not
upscaled past what the file has.

Sibling of the stale-cache entry above; both are the same root, that a measurement is an
artifact and needs its own confirmation before it is allowed to fail a build.

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

---

## A visual-regression bar must break where the stylesheet breaks

**Date.** 2026-09-03
**Run.** Momentum 360 prospect radar, 10 previews + hub — fix pass and expansion
(`clients/momentum-360/deliverables/2026-09-03-papa-style-radar-10/`).

**What happened.** Widening the mobile audit from three viewports (375 / 768 /
1440) to seven (360 / 375 / 393 / 412 / 430 / 768 / 1440) produced 12 `smallMarks`
failures across 77 combinations. They were not real. The harness bar was
`hero: w => (w <= 420 ? 260 : 380)`, but the stylesheet switches to the phone hero
at `@media (max-width: 900px)`, where the slot is `88vw` rather than a fixed box.
So the same page FAILED at 430 with a 346px mark and PASSED at 412 with a 330px
mark: the mark got bigger and the bar got harder. The tell is unmistakable —
a metric that degrades as the measured thing improves is measuring the wrong
thing. Fixed by pinning the bar to the real breakpoint and to the slot it is cut
from: `w => (w <= 900 ? Math.min(260, Math.round(w * 0.68)) : 380)`. All 77
combinations then passed with no page change.

**How to apply.** When a harness asserts a rendered dimension, its thresholds are
part of the layout contract and must cite the same breakpoints and the same units
as the CSS. A constant px bar applied across a `vw`-sized slot encodes a viewport
the author happened to test at. Two cheap guards: (1) before believing a
threshold failure, check whether an adjacent passing viewport has a *worse*
measurement — if it does, the bar is the bug; (2) re-check the failure at that
exact viewport visually before editing either the page or the bar. Both were
needed here, and the second is what made it safe to change the bar rather than
the page.

**Second lesson from the same run — calibrate constants, do not guess them.**
The header caption is sized by `calc(100cqw / (var(--cap-ch) * K))`, where `K` is
the script face's cap advance per character. `K = 0.285` was an estimate and every
caption wrapped to two lines. Rather than tune by eye, the harness was made to
report the *measured* advance per page (`rects.reduce(...) / (chars * fontSize)`),
which came back 0.309–0.385 across the eleven taglines; `K = 0.39` then put every
tagline on one line except the genuine outlier. Any layout formula with a
typographic constant in it should emit that constant from the harness so the next
run reads it instead of re-deriving it. Keep the wrap enabled underneath as the
failure mode, so a wrong constant costs a second line rather than a collision.

---

## 2026-09-05 — Source-proof dedupe must outrank the eligibility snapshot

**Lesson.** A snapshot that says a prospect is logo-ready and has no prior batch
match is only a candidate hint. Reconcile it against live Google Sheets, the 238
business manifest, the built registry, and `12_Brain/state/radar/image-briefs`
before treating the row as source-ready.

**Evidence.** In the 2026-09-05 primary-reference proof run,
`clients/momentum-360/deliverables/2026-09-05-primary-reference-proof-20/sources/eligible-candidates.json`
marked 16 logo-ready entries as having no prior batch match, but the live Sheet
readback in `sources/sheet-dedupe.json` (checked 2026-09-05T15:52:02Z) contained
prior records for all 16. Filesystem checks also found prior paths that the index
did not expose: Dirt Work Solutions in the 2026-08-13 build and Sprinkles
Icecream in the `dillon-os` radar-next15 build.

**How to apply.** Treat `eligible-candidates.json` as discovery only. Require a
current multi-source dedupe pass and record each checked source and timestamp in
the handoff before promotion.

---

## 2026-09-05 — Read nested built registries before selecting fresh rows

**Lesson.** `automation/radar-daily/built-registry.json` stores build entries under
the nested `.built` object. A top-level property scan can falsely report an empty
registry and misclassify already-built prospects as fresh.

**Evidence.** The source-proof run initially missed `advanced-air-services-llc`,
`casey-williams-dmd`, `f-m-berkheimer-inc`, and `nolt-s-auto-parts-2` until the
`.built` object was inspected; each is recorded there as `seed-first-20` built on
2026-09-02/03.

**How to apply.** Any duplicate check against this registry must explicitly read
`.built.PSObject.Properties` (or the equivalent nested JSON object) and include
the inspected path in its receipt.

---

## 2026-09-10 — Never call `emulate_media("print")` before `page.pdf()` in Playwright

**Lesson.** `page.pdf()` already renders the print stylesheet. Calling
`page.emulate_media(media="print")` first collapses the layout, and the resulting
PDF is a silent stub: it writes successfully, it opens, and it is wrong.

**Evidence.** Building the Bar Crawl USA weekly report PDF from
`weekly-report-dashboard/reports/bar-crawl-usa/index.html`, the version with
`emulate_media("print")` produced a 17,903 byte file with `/Count 1`, one embedded
font and zero images. Removing that single line, with identical `format="A4"`,
`print_background=True`, `prefer_css_page_size=True`, produced 1,368,769 bytes,
`/Count 8`, six fonts and two images. Three option variants were compared in the
same run and all three produced 8 pages once the media emulation was dropped. The
page itself was fine both times: `document.body.innerText` measured 8,493
characters under print media.

**How to apply.** Assert on the generated PDF, not on the fact that it was
generated. A byte-size floor plus a `/Count` page-count check catches this class of
failure; "the file exists" does not. The same applies to any headless render step
that can succeed while producing empty output.

---

## 2026-09-10 — Ship a client's compliance rule as a runnable gate, not a review note

**Lesson.** When a client carries a documented policy incident, encode the rule as
an executable check inside the build folder and prove the check fires before
trusting its PASS. A prose reminder in a brief protects only the run that reads it.

**Evidence.** Bar Crawl USA had two Google Ads disapprovals on 2026-04-14/15 over
alcohol language, yet the weekly email that was actually sent on 2026-09-08
(`clients/bar-crawl-usa/deliverables/2026-09-08-weekly-report-2026-09-01-to-2026-09-08/approved-weekly-email.html`)
contains "Fall Cocktail Crawl". A word-boundary scan now lives at
`weekly-report-dashboard/build/compliance_barcrawl.py`; run with no arguments it
self-checks that it flags that exact string and does not flag clean brand copy,
then exits 0. It reported zero banned terms across the 2026-09-10 report page and
both email bodies.

**How to apply.** Run the gate against the already-shipped artifact first. A gate
that has never failed on real copy is not yet evidence of anything.

---

## 2026-09-10 — Diff competitor sitemaps before you spend a SERP budget

**Lesson.** When the research question is "does this competitor own a *content
type* at all" (comparison pages, case studies, programmatic state pages), read
their sitemaps and pattern-match the URLs. It is free, exact, and complete, where
SERP sampling is metered, rate-limited, and only ever a sample.

**Evidence.** An Empeon keyword/content-gap audit needed the competitive picture
across eight domains. The metered rungs failed first: `WebSearch` hit a
session-wide cap (200/200 calls, exhausted by earlier work in the same session),
Firecrawl `FIRECRAWL_SEARCH` returned HTTP 429 on batches larger than about two
concurrent calls, and the `Claude_Browser` pane refused every `navigate` because
tab-3 was pinned to a local file preview, with no `tabs_create` tool exposed to
reopen it. One `curl` pass over eight sitemap indexes produced the whole answer in
a single call: Empeon 176 indexable URLs with 0 comparison/alternatives pages,
against Netchex 2,123 URLs with 90, and HHAeXchange 641 URLs with 58 programmatic
state pages. That table was the strongest exhibit in the deliverable and cost
nothing.

**How to apply.** Climb *down* the web-access ladder, not up, when the question is
about inventory rather than ranking. Reserve the metered rungs for the questions
only a live SERP can answer, such as who actually ranks. Also worth knowing: a
`curl` status probe can return 403 from Cloudflare while the same URL fetched with
`-L` and a browser user-agent returns 200 — check the status with the same request
shape you used for the body, or you will report a site as broken when it is not.
