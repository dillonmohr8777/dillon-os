---
note_type: decision
status: proposed
created: 2026-09-09
updated: 2026-09-09
owner: Dillon Mohr
verification_status: verified
observed_at: 2026-09-09
tags: [decision, skills, reporting, momentum-360, match-back]
source_refs:
  - "C:/Users/dillo/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/08988047-1bb6-44cd-91f8-e75a3a573577/b0f0f864-e564-4653-bfde-c2d7e9ebfcef/skills/momentum-client-report/SKILL.md"
  - "C:/Users/dillo/repos/dillon-os/.claude/skills/client-report/SKILL.md"
  - "C:/Users/dillo/repos/dillon-os/.agents/skills/client-report/SKILL.md"
  - "C:/Users/dillo/repos/dillon-os/_os/reporting/build-report.js"
  - "[[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]"
---

# momentum-client-report supersedes client-report

**Proposed, not decided.** Neither skill has been deleted. This records the
comparison and the recommendation so the overlap stops being re-litigated.

## What each one is

`momentum-client-report` — 6,417 bytes, 79 lines, at the AppData skills-plugin
mirror. Doctrine, not mechanics. Its spine is conversion-to-named-lead
match-back answered *first*: enumerate lead-level sources, join on timestamp /
landing page / GCLID / phone, label join confidence, put the named-lead table
at the centre. It has an explicit failure branch — name what is missing, which
numbers are unverified, what the fix costs, and how long the gap has been open.

`client-report` — 2,349 bytes, 30 lines, at `.claude/skills/client-report/`
inside this vault. Mechanics, not doctrine. Parses client and period, writes a
JSON data file to `_os/reporting/data/`, renders through
`node _os/reporting/build-report.js`, logs to the client note.

Created 2026-07-02 in commit `93ffd5fe` and **never revised since** — one
commit, while its own rendering pipeline moved on in August.

## Recommendation

**`momentum-client-report` survives.** It carries the reason the reports keep
failing. `client-report` is a template-filler that will happily emit "37
conversions" with no names attached — precisely the failure the newer skill
exists to prevent, and the failure that has now been promised away thirteen
times across four accounts.

**Do not delete `client-report`.** Four things in it are load-bearing and have
no equivalent in the newer skill. Merge them into its Step 4:

1. The render path: `node _os/reporting/build-report.js _os/reporting/data/<file>.json`.
2. `"sampleData": true`, which renders a visible draft banner. A mechanical
   banner is a stronger guarantee than prose asking for honesty about join
   confidence.
3. The pointer to `System/writing-rules.md` — contractions, bullet character,
   no em dashes.
4. The Align HCM branding exception: `"agency": "Align HCM"`. Align HCM reports
   must never carry Momentum 360 branding. This rule exists nowhere else.

## Two things that block a clean merge

**The surviving skill is not editable where it lives.** It sits in a
cloud-synced mirror under `AppData/Roaming/Claude/local-agent-mode-sessions/`.
Local edits there will not persist. The merge has to happen wherever the skill
is actually authored. This is the same portability problem already queued at
[[System/approval-queue]] for all five Momentum skills.

**The real duplicate on disk is a different pair.**
`.claude/skills/client-report/SKILL.md` and
`.agents/skills/client-report/SKILL.md` differ by exactly one word —
`System/claude-memory-sync.md` against `System/Codex-memory-sync.md`. 2,349
bytes against 2,348. That divergence is a harness fork, not a design choice,
and it should be reconciled separately.

## Related

- [[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]
- [[System/approval-queue]] — skill provenance row, 2026-09-07
