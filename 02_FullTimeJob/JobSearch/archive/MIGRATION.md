# Consolidation record — 2026-09-09

## What was asked

Ten-plus dated job-search folders under `C:\Users\dillo\Documents\Codex` pulled into one
home, without creating an eleventh folder.

## What was actually reachable

This work ran in a Linux container. It sees GitHub clones, not the Windows disk. Of the
named folders, **none are in any repository**:

| Named folder | Found? |
|---|---|
| `02_FullTimeJob` (five copies) | No — Windows only |
| `job-search-2026-08-20` | No — Windows only |
| `full-time-job-search-sol-advisor-2026-08-20` | No — Windows only |
| `dillon-momentum-resume` | No — Windows only |
| `find-another-100-web-design-jobs` | No — Windows only |
| `Dillon-64GB-Job-Prep` worker | No — no such worker in any repo |
| `cursor/job-search-daily-50` branch | No — not on any of the ten repos |

Searched: all ten cloned repositories, every branch on each, and GitHub code search across
the account. `Documents\Codex` is not mirrored to GitHub, which is why the trail ends there.

So the folders themselves could not be moved from here. What *was* done instead is the part
that makes moving them safe and obvious.

## The home

`02_FullTimeJob/JobSearch/` — inside the numbered working folder that already means
"full-time job matters". Not an eleventh folder: `02_FullTimeJob/` existed, holding
`AlignHCM/` (the job he has). `JobSearch/` sits beside it (the job he wants).

## What was reused, not rebuilt

- `_os/automation/lib/fsutil.js` — the existing repo-path and JSON helpers.
- The registry pattern in `12_Brain/registry/automations.json` — the new run is entry 27.
- `.github/workflows/radar-daily.yml` — the daily-sweep-and-commit shape was copied
  directly, including its push-retry loop and `if: always()` commit step.
- `Daily-Briefs/` — the existing 07:00 surface, rather than a new notification path.

## What was deliberately NOT reused

`_os/automation/lib/indeed-api.js` and `bin/indeed-pipeline.js` look like a job-search
pipeline and are not one. They query Indeed's Partner API with `employer_access` scope to
find *companies that are hiring* as a prospecting signal, and feed `qualify.js` to score
them as marketing leads. They also need `INDEED_ACCESS_TOKEN` or `INDEED_CLIENT_ID`/`SECRET`,
which are not configured. Wiring the job search to that would have inherited a credential
requirement and broken the unattended run on day one.

The Indeed **connector** was used once, interactively, to read the real resume that seeded
`profile/dillon-profile.json` and `profile/evidence.json`. It is not in the daily path.

## When the Windows box is next available

The ten folders can be collapsed in one pass, because nothing here depends on their contents:

1. From `C:\Users\dillo\repos\dillon-os`, pull this branch.
2. For each scattered folder, move anything worth keeping into
   `02_FullTimeJob\JobSearch\archive\<original-folder-name>\`.
3. Anything that is a resume, cover letter, or target-company list: fold the *claims* into
   `profile\evidence.json` with a `source_ref`, then archive the original. The evidence
   file is what the drafts read; a PDF sitting in a folder is invisible to the run.
4. Delete the emptied folders. Five copies of `02_FullTimeJob` is four too many, and the
   vault rule is that a wrong page is worse than no page.
5. Re-run `node _os/automation/bin/job-search-daily.js` to confirm the richer evidence
   changes the drafts.

Nothing above is required for the daily run to work. It already works.
