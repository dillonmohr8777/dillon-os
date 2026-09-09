# Job search — the one home

**This folder is the single home for the job search.** Not one of several. If job-search
material exists anywhere else, it is a copy, and the copy is wrong.

The search is the priority. The agency automation estate had 26 registered automations
and none of them served this; `job-search-daily` is the one that does.

## What is here

| Path | What it is |
|------|------------|
| `profile/dillon-profile.json` | The scoring contract — target titles, skills, bands, location rules, comp assumption. Edit this and the next run changes. |
| `profile/evidence.json` | Real, sourced work evidence. Every item cites the file it came from. This is what the drafts quote. |
| `profile/sources.json` | Which job boards get swept. All public, no credentials. |
| `daily/` | The dated ranked lists. One file per run. |
| `applications/<date>/` | Drafted application material, one file per role. |
| `archive/MIGRATION.md` | Where the scattered folders went and what is still on the Windows box. |

The short version also lands in `Daily-Briefs/job-search-<date>.md`, which is the folder
opened at 07:00 each morning.

## The daily run

```bash
node _os/automation/bin/job-search-daily.js                 # today
node _os/automation/bin/job-search-daily.js --date 2026-09-10 --top 8
node _os/automation/bin/job-search-daily.js --dry-run        # score without writing
```

It runs unattended every morning through `.github/workflows/job-search-daily.yml`
(05:47 America/New_York, ahead of the 07:00 brief) and commits the day's list back.

What one run does:

1. Sweeps ~34 public job sources — four aggregators (two of them remote-only) plus
   30 company boards on Greenhouse, Lever and Ashby.
2. Gates them, in this order: **remote** (hybrid and on-site fail, whatever the board's
   remote flag claims), **US-eligible**, marketing/growth function, posted inside 45 days.
3. Scores every survivor twice — **fit** against his real background, **odds** of it
   actually going anywhere — and ranks on a 55/45 blend.
4. Drops anything under a fit of 52, however good the odds.
5. Drafts tailored material for the top 8, quoting only logged evidence with source refs.
6. Writes the list, the drafts, and the morning brief.

## Remote is a hard requirement

Not a preference, not a tiebreaker. `hybrid`, `on-site`, `in-office` and
`relocation required` all fail the gate even when the board sets a remote flag on the
req — several company boards do exactly that on a "Hybrid - San Francisco" posting.
US eligibility is checked separately, so a remote-EMEA or Canada-only role is dropped too.

Two remote-only boards (Himalayas, Jobicy) carry most of the weight now, because on a
general board roughly nine rows in ten are on-site and get thrown away.

## A fit floor, because easy is not the same as right

Odds alone will float a role that is simple to get and the wrong job. A brand-designer
req at fit 58 and an account-manager req at fit 38 both reached the top fifteen on pure
odds before the floor existed. Anything under fit 52 is now dropped and logged as such.

## Fit and odds are deliberately separate

Averaging them early hides the interesting rows. A CMO seat at a hyperscaler is high fit
and near-zero odds. A marketing manager job at a 30-person agency is the reverse. Both
numbers stay visible so the tradeoff is a decision, not an accident.

Fit reads title band, skill overlap, AI-forward signal, agency/B2B context and how
clearly the posting is open to the US.
Odds start at 58 for a strong-but-unreferred applicant, then move on seniority reach,
stated years of experience, employer competition, posting freshness and hard blockers.

## The boundary

**This system drafts. It never sends.** No application is submitted, no email is sent, no
form is filled. Every row in the list is a link; clicking it is Dillon's decision. The
workflow has no credential that could apply to anything even if it tried.

## Two things worth correcting

1. **The Indeed profile is underselling.** It lists preferred titles as *Marketing
   Coordinator* and *Marketing Manager* at a $25/hour minimum — two bands below a CMO
   and agency-director seat. Any Indeed-sourced feed will inherit that. Fix at
   <https://profile.indeed.com>.
2. **The comp band in `dillon-profile.json` is an assumption**, not something Dillon
   confirmed. It is inferred from director/CMO scope in Philadelphia metro and remote US.
   Correct it there.

## Do not claim

`evidence.json` carries a `do_not_claim` list, and it is load-bearing. The short version:
no client business outcomes (his own evidence pass found none verified), no agency MRR,
no direct reports, no "$500K ad spend managed". Those either failed verification or exist
only in an archived draft.
