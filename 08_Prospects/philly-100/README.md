# Philly 100 — graded backfill

The 100 prospects Momentum already built sites for, run back through the grader.

| File | What it is |
|---|---|
| `roster.json` | The prospect roster, rebuilt from the source PDF's link annotations by `_os/automation/bin/extract-pdf-roster.js`. Business, batch, vertical, and website only. |
| `roster-graded.json` | Full grade per prospect: SIGNAL, dimension breakdown, every check with evidence, viability, lane. |
| `roster-graded.csv` | Sheet-ready view. One row per prospect, top three gaps as columns. |

Contact emails and phone numbers are deliberately **not** in this folder. This
GitHub repo is public; the source sheet stays the system of record for contact data.

## Result, 2026-08-06, weights 1.0.0

| Lane | Count | Pitch a website? |
|---|---|---|
| Enrich — site side says go, ability to pay unknown | 53 | pending |
| Adjacent offer — site is fine, sell something else | 19 | no |
| Hands off — site is excellent | 19 | no |
| Manual review — could not read the page | 9 | unknown |

**38 of 100 built sites went to businesses that should never have received a
website pitch.**

All 25 of batch B3 (plumbing, painting, construction) have no website of their own,
only trade-directory listings. That is the "GMB without websites" pool, and it is
the only batch where the demo is the whole pitch.

## Re-running

```bash
# static pass, ~35s for 100 rows
node _os/automation/bin/grade-list.js --from 08_Prospects/philly-100/roster.json --take 25

# add the render pass to clear the manual-review rows (needs direct egress)
node _os/automation/bin/grade-list.js --from 08_Prospects/philly-100/roster.json --render
```

The 53 enrich rows need `review_count`, `rating`, and `ad_presence` added to
`roster.json` before they route to a build lane. See
`12_Brain/protocols/prospect-grading-gate.md`.
