---
note_type: memory
status: active
created: 2026-09-07
updated: 2026-09-07
observed_at: 2026-09-07
valid_from: 2026-09-07
tags: [memory, correction, ai-division, momentum-360, design-system, bridge]
source_refs:
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\audit\contrast.json'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\tokens\momentum.tokens.css'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\AUDIT.md'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-03-papa-style-radar-10\qa-local\radar-2026-09-05-build-report.md'
  - 'Filesystem verification 2026-09-07'
---

# Corrections from the AI division evidence pass

**Summary:** Seven claims circulating in the AI division work were checked against
the artifacts on 2026-09-07. One was materially wrong about a person's
accountability; five were wrong in detail; one could not be located at all. All
are corrected here.

## 1. Bridge — the correction that matters

**Claimed:** missed reviews on 18 August, 23 August and 1 September were Dillon's.

**Corrected:** they were **the client's slips**. The **1 September slot was
declined by Tori**. **Momentum is the fastest-moving party on Bridge.**

This is the correction to carry forward, because it changes an input to the AI
division founding-cohort selection, not just a note. Bridge remains at zero dated
client acceptances against three paid milestones, with Milestone 3 complete in an
unmerged PR — that part stands.

## 2. Design-system token names

**Claimed:** the accent splits into `--m-signal` (fills, text on dark) and
`--m-signal-ink` (text on light).

**Corrected:** there is **no `signal` token**. `tokens/momentum.tokens.css`
contains zero occurrences of the string. The actual tokens are:

| Token | Job | Ratio |
|---|---|---|
| `--m-accent` | field only | — |
| `--m-on-accent` | label on that field | 7.19:1 |
| `--m-accent-ink` | text on paper | 6.18:1 |
| `--m-accent-on-deep` | text on the deep field | 8.51:1 |
| `--m-accent-on-brand` | text on the brand field | 3.14:1, large-text-only |

## 3. Contrast pair count

**Claimed:** 29 pairs measured, 0 failures.

**Corrected:** **31 pairs, 0 failures** (`audit/contrast.json`), of which **22 are
small-text pairs**. Note that `AUDIT.md` says 31 and the generated `index.html`
says 26 — the artifacts disagree with each other. **`contrast.json` is the
authority**, because `contrast.py` reads the stylesheet itself rather than a
transcription.

## 4. Lowest passing pair

**Claimed:** lowest text pair 4.695:1.

**Corrected:** **lowest small-text pair is 4.54:1** ("nav mark if nav ever sits on
brand"). The lowest pair at any size is **3.14:1**, and it is declared
large-text-only rather than hidden.

## 5. needmomentum.com measurements

**Claimed:** 4 type families, 15 font sizes, 2 oranges, 2 blues, 10+ radii, 6 AA
failures.

**Corrected**, measured in-browser at 1440×900 (`AUDIT.md` §2.4): **5 font
families** — Roboto, Open Sans, Poppins, Hind and a bare `sans-serif`. **20
distinct border radii.** 14 distinct transition duration/easing pairs. 2 oranges
on one page (`#f58320`, `#fb8300`). No section-rhythm token; Elementor per-section
inline.

Two specific failures confirmed as stated: **primary CTA orange as text 2.58:1**,
**body copy `#888888` on `#f5f5f5` = 3.25:1** — a WordPress default nobody chose.
The count of six AA failures was not independently verified in this pass.

## 6. The "10/10 PASS" QA sheet

**Claimed:** the QA sheet for the ten radar prospect sites recorded 10/10 PASS.

**Could not be located as described.** The `10/10` on disk belongs to the
**garage-door missed-call proof-of-concept** scenario scorecard, a different
artifact. The radar QA receipt that does exist
(`radar-2026-09-05-build-report.md`, 20 sites) reports the Impeccable detector as
**DEGRADED** — "This is not a clean detector bill" in its own words — alongside a
PASS on the responsive audit.

**Do not cite a 10/10 radar QA pass** until the sheet is produced. The underlying
point stands regardless and is stronger: 37 of 120 measured pairs fail AA across
those builds, which is the finding whether or not a QA sheet claimed otherwise.

## 7. Where the skills live

**Claimed:** `.claude/skills/` already held eight skills — `client-pulse`,
`client-report`, `content-scan`, `inbox-brief`, `metrics-pull`, `plan-today`,
`vault-clean`, `week-review`.

**Corrected:** those eight live in **`dillon-os/.claude/skills/`**, which holds
**28** skills, not eight. `C:\Users\dillo\.claude\skills\` is a different
directory holding 24 unrelated entries. The five Momentum skills are in **neither**
— no `momentum-*` `SKILL.md` exists anywhere under `C:\Users\dillo\.claude`; they
resolve at the account layer.

The overlap between `client-report` and `momentum-client-report` is **real** and
recorded as an open item. **Nothing was deleted.**

## The pattern worth keeping

Six of seven corrections are small numeric or naming drift between a claim and the
artifact it describes. That drift happens in the gap between measuring something
and quoting it later from memory. The design system's own defence against exactly
this — `contrast.py` reads the stylesheet rather than a transcription of it — is
the right instinct applied to prose: **cite the artifact path, not the
recollection.**

Feeds [[12_Brain/05_Projects/2026-09-07 - Momentum AI division launch]] and
[[12_Brain/07_Reviews/2026-09-07 - AI division evidence pass]].
