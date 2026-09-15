---
note_type: concept
status: active
created: 2026-08-19
updated: 2026-09-15
source_refs:
  - "12_Brain/11_Craft/earned-lessons.md"
  - "12_Brain/11_Craft/00_Index.md"
  - "[[12_Brain/01_Captures/2026-09-14 - Align Search Console and GA4 direct snapshot, gap table, and the Google access answer]]"
tags: [concept, agent-infrastructure, craft, promoted]
---

# Confirm the artifact, not the action

**One lesson: a change you believe you made is more dangerous than one you know you
didn't.** Verify by reading the artifact the tool actually produced, never by trusting
that the edit ran.

Promoted from [[12_Brain/11_Craft/earned-lessons|earned-lessons]] on 2026-08-19 after
the same root cause produced four distinct failures in two days. Each looked like a
different bug. All four were one belief.

## The four faces of it

| Failure | What was believed | What was true |
|---|---|---|
| Generated-file drift | A hand edit to `paid-media-analyst.md` carried verified connector state | The next generator run silently reverted it |
| Unasserted replace | A Python `.replace()` patched `cmdScreenshot` | The anchor never matched; the old code ran and reproduced the identical error |
| Date-keyed output | Three runs "ignored" a frontmatter change | The generator had rolled to a new day and written to a different file; the tool printed the correct path each time |
| Heredoc escaping | Four bash-heredoc patches applied | `\U` in `C:\Users` raised a Python unicode error and the file was never touched |

In every case the *reported* action succeeded. In every case the artifact was unchanged
or elsewhere. Three of the four then cost a full debug cycle chasing working code.

## The fifth face: the cross-session handoff

Added 2026-09-15, after the same root cause crossed a session boundary twice.

| Failure | What was believed | What was true |
|---|---|---|
| Cited files | A daily-learning note named seven deliverables | None of the seven were in the repo (PR #388, 2026-09-09) |
| Claimed export | A cloud session produced a compressed Align export, a SHA-256, a ledger script and a gap table | None existed on any branch of three repos or in the Codex folders, after two exhaustive searches (2026-09-14 capture, §C) |

The first four faces are a session failing to confirm its *own* artifact. This one is a
session trusting *another* session's summary. It is worse, because the receiving agent
has no memory of the work and no reason to doubt the claim — and because an unstaged
file looks identical to a committed one from inside the session that wrote it.

**The rule extends cleanly:** a handoff is complete when the receiving side can open the
file at a named path on a named ref. Not when the sending side says it wrote it.

- **Sending:** end with paths *and* the ref, then read them back from that ref — never
  from the working tree, which happily holds files that were never staged.
- **Receiving:** verify before reconstructing. If the artifact is genuinely gone,
  re-derive from source and cross-check against the prior summary rather than inheriting
  it. The 2026-09-14 session did exactly this and it paid: all seven of the cloud
  session's figures reproduced exactly from the direct pull, which converted an
  unverifiable summary into a sourced one.

## What to do instead

1. **Assert the anchor.** Any scripted string replacement asserts its target matched
   (`assert old in s`), or prefer an editor that errors on a missed match. A silent
   no-op is the worst possible outcome because it looks like success.
2. **Read the path the tool reported.** Not the path you assumed. Generators that name
   output by date move under you at midnight; their JSON already tells you where they
   wrote.
3. **Fix the generator, then prove it reproduces.** For anything generated, edit the
   generator and confirm it regenerates the committed output byte-for-byte before
   trusting the next run.
4. **Probe the artifact, not the source.** When behaviour disagrees with code you just
   read, execute the thing and print what it returns. A runtime probe of
   `frontmatter()` ended a false diagnosis in one call.
5. **Avoid the escaping minefield entirely.** Windows paths inside Python string
   literals inside a bash heredoc is three layers of escaping; use the file-editing
   tool instead of scripting the edit.

## Why this belongs in the brain, not just the craft log

Every automation in this estate that writes a file is exposed to this: the frontmatter
filler, both agent generators, the operating-team builder, the craft brief, the maps
refresher. The gates and circuit breakers catch *failed* runs. They cannot catch a run
that reported success while changing nothing — that failure mode is invisible to
`G8_circuit_breaker` and shows up only as a routine that mysteriously never improves.

**Corollary for reviewing agent work:** "I updated X" is not evidence. The diff is. Ask
for the artifact.
