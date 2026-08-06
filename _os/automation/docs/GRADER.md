# Website grader — operator guide

Grades a prospect's existing website 0–100 and sorts a list into outreach lanes.
A high score means **do not pitch them a website**.

Concept: `12_Brain/concepts/Website SIGNAL Score.md`.
Gate rules: `12_Brain/protocols/prospect-grading-gate.md`.

## Commands

```bash
# One site, human-readable
node _os/automation/bin/grade-site.js https://example.com --name "Example HVAC" --vertical hvac

# One site with the money axis filled in
node _os/automation/bin/grade-site.js https://example.com --name "Example HVAC" \
  --vertical hvac --reviews 180 --rating 4.7 --ads

# A whole list, split into lanes, top 25 ranked
node _os/automation/bin/grade-list.js --from 08_Prospects/philly-100/roster.json --take 25

# Allow the render pass (real Chromium) on the rows the static pass could not decide
node _os/automation/bin/grade-list.js --from roster.json --render

# Verify the weights still agree with human judgment
node _os/automation/bin/grade-calibrate.js          # offline fixtures, CI safe
node _os/automation/bin/grade-calibrate.js --live   # also hit the real anchor URLs
```

Exit codes: `grade-site.js` returns 0 when the prospect is outreach eligible and 3
when it is not, so a shell pipeline can branch. `grade-calibrate.js` returns 4 when
the anchors disagree with the grader.

## Input

JSON array, `{ "prospects": [...] }`, or a CSV with matching column names. Only
`business_name` and `website` are required, but the more of the money axis you
supply the fewer rows land in `enrich`.

| Field | Type | Why it matters |
|---|---|---|
| `business_name` | string | Confirms a candidate domain actually belongs to them |
| `website` | string or null | Null is meaningful: no site is the strongest signal |
| `candidate_urls` | string[] | Unconfirmed URLs; the grader verifies by on-page name match |
| `evidence_urls` | string[] | Directory or social listings, used to classify a no-site prospect |
| `vertical` | string | Fit against a Momentum industry page |
| `review_count` | number | Ability to pay and demand proxy. **Omit rather than send 0.** |
| `rating` | number | Quality proxy |
| `ad_presence` | boolean | Already buying marketing |
| `multi_location` | boolean | Higher ticket |
| `has_phone` / `public_email_count` | boolean / number | Reachable at all |

Missing is not zero. A row with no `review_count` is treated as unenriched and
routes to `enrich`, not to `park`.

## Output

- `<input>-graded.json` — every check with its evidence, per prospect
- `<input>-graded.csv` — sheet-ready, top three gaps as columns
- `12_Brain/state/site-grader.json` — run summary with the outreach queue and the
  explicit do-not-pitch list
- `12_Brain/queue/site-grader-<date>.jsonl` — one row per outreach-eligible prospect
- `_os/automation/state/grader-cache.json` — fingerprints for `--resume`

## The four passes

Each pass runs only when the cheaper one could not decide.

| Pass | Cost | Runs when |
|---|---|---|
| 0 resolve | 1 request | Always. Classifies the URL: live, no site, social only, directory only, builder stub, bot wall, client-rendered, dead. |
| 1 static | 1–3 requests | The URL resolved to a readable page. Produces the 100-point grade. |
| 2 render | headless browser | Bot wall, client-rendered page, confidence under 70%, or a score in the 40–70 decision band. Requires `--render`. |
| 3 eyes | agent or human | Score within 5 points of a lane boundary. Advisory, capped at ±10. |

Escalations are recorded per prospect with the reason, so a run log proves each
expensive pass was earned.

## Reading a result

```
  SIGNAL      82 / 100   Excellent   (confidence 100%)
             Do not pitch a website. They already have one.

  S  Structure    ████████████████░░░░░░  13/18
  I  Impression   ████████████████████░░  20/22
  ...
  Biggest gaps (these are the outreach hooks)
    −   4  Phone number is a tel: link: phone is text only, not tappable
```

The gap list is the deliverable, not the number. It is ordered by points lost, so
the first line is what outreach leads with — and on an `adjacent` prospect it is
what to sell instead of a website.

## Tuning

1. Edit points, tiers, or band thresholds in `_os/automation/lib/grader/weights.json`.
2. Bump `version` in that file.
3. Run `node _os/automation/bin/grade-calibrate.js`. Offline anchors must hit their
   exact band; the gate is 100% because they are fixtures and there is no excuse
   for drift.
4. If an anchor now fails, decide which is wrong — the weights or the anchor — and
   record the reasoning in `12_Brain/registry/grader-calibration.json`.

Two guards will fight sloppy tuning on purpose:

- **Craft gate.** 42 points are table stakes, 58 are craft. Clearing only the stakes
  caps the score out of the upper bands.
- **Obsolescence ceiling.** Missing viewport, table layout, marquee, dead tech, or a
  placeholder page caps the score outright: one tell caps at 64, two at 44, three
  at 24.

## Environment

Zero npm dependencies for passes 0 and 1. Pass 2 needs Playwright:

```bash
npm i --no-save playwright
# The environment may already ship a browser; the grader finds whatever chromium
# is under PLAYWRIGHT_BROWSERS_PATH rather than downloading a second copy.
npx playwright install chromium --with-deps   # only if none is present
```

Pass 2 also honours `HTTPS_PROXY` / `NO_PROXY`. In the Claude Code web sandbox
Chromium cannot reach public sites through the egress proxy (its CA is not in
Chromium's store), so `--render` fails navigation there and those rows stay in
`manual`. Run `--render` from a machine with direct egress.

## Boundaries

- Read-only GETs of public homepages, identified user agent, 6 concurrent max,
  3MB response cap, 15s timeout.
- A bot wall routes to `manual`. The grader does not spoof a browser to get past
  one.
- No contact data is written to this repo. It is public.
- The grader sorts a list. It does not deploy, mail, or send.
