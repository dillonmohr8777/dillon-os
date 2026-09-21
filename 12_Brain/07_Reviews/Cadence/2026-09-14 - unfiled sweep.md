---
date: 2026-09-14
type: cadence-unfiled-sweep
cadence: daily
job: unfiled-sweep
---

# Unfiled sweep - 2026-09-14

**First run.** No previous report exists, so every item below is reported as
new. From the next run onward only genuinely new arrivals are listed.

Nothing was committed, staged, moved or deleted by this job.

## Untracked counts

| Repo | Branch | `git status --porcelain` untracked entries | Expanded (`-uall`) untracked files |
|---|---|---|---|
| `repos/dillon-os` | `cursor/immohrtal-standing-canary-3c2e` | 546 | 2,046 |
| `Codex/projects/client-operations` | `cursor/bar-crawl-andy-send-24e0` | 3,409 | 63,906 |

The two columns differ because `git status --porcelain` collapses a wholly
untracked directory into one entry. **3,409 is the headline number and it
matches the 3,408 found on 2026-09-14** - the estate has not been filed since.
The real file count behind it is 63,906.

Both repos also carry modified tracked files: 148 in dillon-os, 38 in
client-operations. Those are outside this job's scope but they are not clean.

## Finished deliverables sitting untracked

Untracked files under a `deliverables/` path whose shape says finished
(.pdf, .mp4, .png, .html, README/DELIVERY markdown):

- **17,774 files**
- **9.78 GB**
- **14,402 of them arrived on or after 2026-09-07** (7.08 GB)

`dillon-os` has **zero** untracked files under a `deliverables/` path. The
entire exposure is in client-operations.

## By client

| Client folder | Registry id | Status | Files | Size (MB) | Newest |
|---|---|---|---:|---:|---|
| `clients/momentum-360` | momentum-360 | active | 16,624 | 9,588.4 | 2026-09-13 |
| `clients/bigorange-marketing` | bigorange-marketing | active | 569 | 143.9 | 2026-09-04 |
| `clients/bok-law-firm` | bok-law-firm | active | 121 | 125.1 | 2026-09-14 |
| `clients/cindy-may-christmas` | cindy-may-christmas | active | 71 | 81.1 | 2026-09-05 |
| `clients/bar-crawl-usa` | bar-crawl-usa | active | 128 | 25.9 | 2026-09-10 |
| `clients/bridge-software` | bridge-software | active | 59 | 18.3 | 2026-09-03 |
| `clients/kimberly-james-bridal` | kimberly-james-bridal | active | 13 | 10.8 | 2026-09-08 |
| `clients/gt-clinic` | **none** | - | 41 | 7.8 | 2026-09-12 |
| `clients/onsite-concrete-landscape` | onsite-concrete-landscape | active | 24 | 3.9 | 2026-09-05 |
| `clients/omega-landscaping` | omega-landscaping | active | 25 | 3.1 | 2026-09-05 |
| `clients/replenish-7-eleven` | replenish-7-eleven | active | 23 | 1.3 | 2026-08-24 |
| `clients/align-hcm` | align-hcm | active | 14 | 1.0 | 2026-08-20 |
| `clients/immohrtal-marketing` | **none** | - | 5 | 0.9 | 2026-09-01 |
| `clients/deborah-mara` | **none** | - | 5 | 0.8 | 2026-09-12 |
| `clients/fagan-painting` | fagan-painting | active | 8 | 0.8 | 2026-08-24 |
| `clients/revive-systems` | revive-systems | active | 31 | 0.7 | 2026-09-11 |
| `clients/va-claims-edge` | va-claims-edge | active | 3 | 0.2 | 2026-09-05 |
| `clients/hope-wellness-center` | hope-wellness-center | active | 2 | 0.2 | 2026-08-24 |
| `clients/nkcdc` | nkcdc | active | 2 | 0.1 | 2026-08-24 |
| `clients/fresh-blends-kwik-trip` | fresh-blends-kwik-trip | active | 1 | 0.1 | 2026-08-24 |
| `clients/puttery-nyc` | **none** | - | 3 | 0.0 | 2026-09-10 |
| `clients/pritzker-law-group` | pritzker-law-group | active | 1 | 0.0 | 2026-09-10 |
| `clients/nexla` | **none** | - | 1 | 0.0 | 2026-09-09 |
| **TOTAL** | | | **17,774** | **10,014.3** | |

### Five folders do not resolve to a registry record

These have finished deliverables on disk and no `clients.json` entry, so the
control system cannot see them:

- `clients/gt-clinic` - 41 files, 7.8 MB, newest 2026-09-12
- `clients/immohrtal-marketing` - 5 files, 0.9 MB, newest 2026-09-01
- `clients/deborah-mara` - 5 files, 0.8 MB, newest 2026-09-12
- `clients/puttery-nyc` - 3 files, 0.0 MB, newest 2026-09-10
- `clients/nexla` - 1 files, 0.0 MB, newest 2026-09-09

This is the same gap the monthly `registry-reconciliation` job exists to
report. GT Clinic, Puttery and Nexla were already named on 2026-09-14;
**Deborah Mara and IMMOHRTAL Marketing are the two this sweep adds.**

### Six registry clients have no untracked deliverable at all

`ami-cleaning`, `bercos-popcorn`, `pro-fence-deck`, `shadow-heating-cooling`,
`tags-2-go`, `zen-spa-tropicana`. Either their work is already tracked or no
work has been produced. Worth a look - an active client with no output is its
own signal.

## New arrivals since 2026-09-07

**13,658 of the 14,402 recent files (4.70 GB) are one bulk export**:
`clients/momentum-360/deliverables/2026-09-08-claude-design-exports/` - almost
entirely PNG. Treated as a single arrival here rather than 13,658 lines.

The individually nameable arrivals, newest first:

| Date | Size | File | Client |
|---|---:|---|---|
| 2026-09-14 | 2.3 MB | `clients/bok-law-firm/deliverables/2026-09-14-facebook-proof/BOK-Facebook-Content-Proof-2026-09-14.pdf` | BOK Law Firm |
| 2026-09-13 | 0.0 MB | `clients/momentum-360/deliverables/2026-09-12-dedicated-agents/basic-plan-upload-kits/Melissa-Rigby-Delivery.md` | Momentum 360 |
| 2026-09-13 | 0.0 MB | `clients/momentum-360/deliverables/2026-09-12-dedicated-agents/lead-agent/README.md` | Momentum 360 |
| 2026-09-13 | 0.0 MB | `clients/momentum-360/deliverables/2026-09-12-dedicated-agents/runner-repair/README.md` | Momentum 360 |
| 2026-09-13 | 0.0 MB | `clients/momentum-360/deliverables/2026-09-12-dedicated-agents/org-modes/run/owner-packets/melissa-rigby-delivery.md` | Momentum 360 |
| 2026-09-13 | 0.0 MB | `clients/momentum-360/deliverables/2026-09-12-dedicated-agents/org-modes/README.md` | Momentum 360 |
| 2026-09-13 | 0.0 MB | `clients/momentum-360/deliverables/2026-09-12-dedicated-agents/slack-receiver/README.md` | Momentum 360 |
| 2026-09-12 | 0.1 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/website-audit-2026-09-12/GT-CLINIC-WEBSITE-KEYWORD-AUDIT-2026-09-12.pdf` | **unregistered** |
| 2026-09-12 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/website-audit-2026-09-12/GT-CLINIC-WEBSITE-KEYWORD-AUDIT-2026-09-12.html` | **unregistered** |
| 2026-09-12 | 3.3 MB | `clients/bok-law-firm/deliverables/2026-09-12-sunburst-social/BOK-Law-Social-Review-2026-09-12.pdf` | BOK Law Firm |
| 2026-09-12 | 0.0 MB | `clients/bok-law-firm/deliverables/2026-09-12-sunburst-social/DELIVERY.md` | BOK Law Firm |
| 2026-09-12 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/README.md` | **unregistered** |
| 2026-09-12 | 0.3 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/GT-Clinic-90-Day-Growth-Strategy-2026-09-12.pdf` | **unregistered** |
| 2026-09-12 | 0.3 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/GT-Clinic-90-Day-Growth-Strategy-2026-09-12.cover-fixed.pdf` | **unregistered** |
| 2026-09-12 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/GT-Clinic-90-Day-Growth-Strategy-2026-09-12.html` | **unregistered** |
| 2026-09-12 | 0.3 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/GT-Clinic-90-Day-Growth-Strategy-2026-09-12.contract-verified.pdf` | **unregistered** |
| 2026-09-12 | 0.3 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/GT-Clinic-90-Day-Growth-Strategy-2026-09-12.final-render.pdf` | **unregistered** |
| 2026-09-12 | 0.0 MB | `clients/deborah-mara/deliverables/2026-09-12-answer-pages-draft/README.md` | **unregistered** |
| 2026-09-10 | 0.4 MB | `clients/deborah-mara/deliverables/2026-09-10-aeo-pack/Deborah-Mara-AEO-Plan-2026-09-09.pdf` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/deborah-mara/deliverables/2026-09-10-aeo-pack/Deborah-Mara-ChatGPT-Ads-Section-2026-09-10.pdf` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/pritzker-law-group/deliverables/2026-09-10-team-ai-brief/Pritzker-Law-Group-Team-AI-Operating-Brief-2026-09-10.pdf` | Pritzker Law Group |
| 2026-09-10 | 0.4 MB | `clients/deborah-mara/deliverables/Deborah-Mara-AEO-Plan-2026-09-09.pdf` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/deborah-mara/deliverables/Deborah-Mara-ChatGPT-Ads-Section-2026-09-10.pdf` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/puttery-nyc/deliverables/2026-09-10-access-update/access-why-email.html` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/assets/gmail-live-signature.html` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/2026-09-10-plan-email/README.md` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/2026-09-10-plan-email/gt-email-2026-09-10.html` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/gt-clinic/deliverables/2026-09-10-plan/plan-front-end.html` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/puttery-nyc/deliverables/2026-09-10-access-update/granola-ask-email.html` | **unregistered** |
| 2026-09-10 | 0.0 MB | `clients/puttery-nyc/deliverables/2026-09-10-access-update/sig-tmp.html` | **unregistered** |
| 2026-09-10 | 54.3 MB | `clients/momentum-360/deliverables/2026-09-10-paper-craft-anatomy-of-a-lead-rebuild/momentum-360-anatomy-of-a-lead-rebuild-2026-09-10.mp4` | Momentum 360 |
| 2026-09-10 | 1.3 MB | `clients/bar-crawl-usa/deliverables/2026-09-10-andy-report/bar-crawl-usa-report-2026-09-08-to-2026-09-10.pdf` | Bar Crawl USA |
| 2026-09-10 | 5.8 MB | `clients/momentum-360/deliverables/2026-09-10-paper-craft-anatomy-series/momentum-360-anatomy-of-a-lead-vertical-2026-09-10.mp4` | Momentum 360 |
| 2026-09-10 | 15.1 MB | `clients/momentum-360/deliverables/2026-09-10-paper-craft-anatomy-series/momentum-360-anatomy-of-a-search-term-2026-09-10.mp4` | Momentum 360 |
| 2026-09-10 | 15.2 MB | `clients/momentum-360/deliverables/2026-09-10-paper-craft-anatomy-series/momentum-360-anatomy-of-a-lead-2026-09-10.mp4` | Momentum 360 |
| 2026-09-09 | 17.9 MB | `clients/momentum-360/deliverables/2026-09-09-paper-craft-brand-film/momentum-360-built-not-templated-2026-09-09.mp4` | Momentum 360 |
| 2026-09-09 | 0.0 MB | `clients/nexla/deliverables/2026-09-09-search-campaign-build/README.md` | **unregistered** |
| 2026-09-08 | 4.9 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/design-integration/references/2-higgsfield-f628dba4-c5c0-4188-a1f1-078aefd7097b.mp4` | Momentum 360 |
| 2026-09-08 | 7.1 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/design-integration/references/1-higgsfield-fb393c2f-6ca9-4ff4-8263-e812e95707bb.mp4` | Momentum 360 |
| 2026-09-08 | 1.4 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/claude-design-system-source/hf_20260831_185018_3cdee811-e983-4990-af95-0433476f3365-reference-720p.mp4` | Momentum 360 |
| 2026-09-08 | 0.7 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/claude-design-system-source/hf_20260831_184909_a6eae300-70ce-4682-8e0f-8b70a99a753c-reference-720p.mp4` | Momentum 360 |
| 2026-09-08 | 2.8 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/three-distinct-films/renders/momentum-momo-studio.mp4` | Momentum 360 |
| 2026-09-08 | 2.8 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/netlify-site/videos/momentum-momo-studio.mp4` | Momentum 360 |
| 2026-09-08 | 3.4 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/three-distinct-films/renders/momentum-signal-system.mp4` | Momentum 360 |
| 2026-09-08 | 3.4 MB | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/netlify-site/videos/momentum-signal-system.mp4` | Momentum 360 |
| ... | | *197 further markdown/html arrivals not listed* | |

### Image-only directories that also arrived

| Newest | Size | PNGs | Directory |
|---|---:|---:|---|
| 2026-09-12 | 1.5 MB | 1 | `clients/gt-clinic/deliverables/2026-09-10-plan` |
| 2026-09-12 | 6.4 MB | 6 | `clients/bok-law-firm/deliverables/2026-09-12-sunburst-social` |
| 2026-09-12 | 4.9 MB | 27 | `clients/gt-clinic/deliverables/2026-09-10-plan/renders-2026-09-12` |
| 2026-09-11 | 0.2 MB | 3 | `clients/revive-systems/deliverables/2026-09-11-lsa-daily` |
| 2026-09-11 | 0.0 MB | 3 | `clients/revive-systems/deliverables/2026-09-11-lsa-daily/screenshots` |
| 2026-09-10 | 0.3 MB | 23 | `clients/revive-systems/deliverables/2026-09-10-lsa-tonight/screenshots` |
| 2026-09-08 | 10.1 MB | 4 | `clients/kimberly-james-bridal/deliverables/2026-09-08-lead-reconciliation/gmail-sep3` |
| 2026-09-08 | 15.0 MB | 64 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/evidence` |
| 2026-09-08 | 6.2 MB | 1 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/motion-rebuild` |
| 2026-09-08 | 1.8 MB | 16 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/claude-handoff/build/preview` |
| 2026-09-08 | 0.1 MB | 2 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/claude-handoff/build/assets` |
| 2026-09-08 | 21.3 MB | 17 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/assets` |
| 2026-09-08 | 21.3 MB | 17 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/netlify-site/assets` |
| 2026-09-08 | 5.9 MB | 6 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/references` |
| 2026-09-08 | 2.5 MB | 38 | `clients/momentum-360/deliverables/2026-09-08-claude-design-ebooks/out` |
| 2026-09-08 | 2.7 MB | 7 | `clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v2/evidence` |
| 2026-09-08 | 0.1 MB | 2 | `clients/momentum-360/deliverables/2026-09-08-claude-design-ebooks/canvas-v2` |
| 2026-09-08 | 3.4 MB | 87 | `clients/momentum-360/deliverables/2026-09-07-launch-delivery/qa` |
| 2026-09-08 | 0.1 MB | 2 | `clients/momentum-360/deliverables/2026-09-08-claude-design-ebooks/canvas` |
| 2026-09-07 | 0.9 MB | 7 | `clients/momentum-360/deliverables/2026-09-07-launch-delivery/library/02_Artwork` |

## What this does not do

It does not commit. 10 GB of media into a repo whose `.git` is already 3 GB
is the wrong reflex, and the backup destination is still an open question -
see the 2026-09-14 approval-queue entry "NAME A BACKUP DESTINATION". This
job keeps the number visible until a human decides where the copy goes.
