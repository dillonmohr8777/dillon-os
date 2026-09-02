---
note_type: decision
status: active
created: 2026-09-02
updated: 2026-09-02
owner: Dillon Mohr
decision: "Use a deterministic evidence router to predict work-package type and required deliverables. Use Chronos-2 only as a shadow numeric workload challenger until dataset-specific baseline, calibration, repetition, and human-promotion gates pass."
verification_status: verified
review_on: 2026-09-16
source_refs:
  - "user://2026-09-02/predictive-work-planner-scope"
  - "[[12_Brain/03_Concepts/Predictive Work Planner]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist]]"
  - "[[12_Brain/02_Entities/Chronos-2]]"
  - "Daily-Briefs/predicted-work-2026-09-02.md"
  - "12_Brain/state/work-predictor/chronos-2026-09-02-total-v1/workload-forecast-receipt.json"
  - "_os/automation/config/work-package-profiles.json"
  - "_os/automation/bin/predict-work.js"
  - "_os/automation/bin/forecast-workload.js"
tags:
  - brain
  - decision
  - forecasting
  - workflow
  - planning
  - chronos
---

# Separate deliverable prediction from workload forecasting

## Decision

The predictive workflow has two different jobs and two different evaluators:

1. **Predict the work package and preparation contract with evidence.** The
   router classifies canonical queue items and dated deliverable history into
   Dillon-specific packages: websites, branded reports, the BOK weekly
   three-topic designed kit, prototypes, data integrations, repository and
   environment configuration, content, media, workflow automation, outreach,
   paid media, communication handoffs, and research briefs.
2. **Predict only numeric workload volume with Chronos-2.** Chronos receives a
   de-identified daily portfolio count and known day-of-week covariates. It does
   not decide the client, deliverable, deadline, priority, or authority.
3. **Keep sparse per-type series out of Chronos.** A category becomes eligible
   only after at least 24 nonzero days and 32 observed packages. Until then,
   exact queue evidence, verified recurrence, and transparent cadence rules
   remain primary.
4. **Keep the daily plan deterministic.** A Chronos band may be displayed as a
   shadow capacity warning. It cannot reorder the plan until repeated holdouts
   beat simple baselines, p10-p90 calibration passes, the exact experiment is
   reviewed, and Dillon promotes the lane.
5. **Predicted preparation is not requested work.** It may assemble local
   briefs, source manifests, asset lists, schemas, repository maps, and QA
   plans. It cannot create a deadline, mutate the canonical queue, send,
   publish, spend, or change an account.
6. **Every candidate is labeled.** `claim_type` is always `prediction`; only a
   canonical queue row is `confirmed_request`, and only its recorded `dueAt`
   is `confirmed_deadline`. The brief prints this as a Kind column.
7. **Calibrate against what actually landed.** Pattern-tier confidence is
   multiplied by a bounded hindcast hit rate once a tier has three judged
   predictions, and every calibrated number keeps its raw value, sample, hit
   rate, and multiplier beside it.
8. **Compare Chronos to stronger deterministic methods, repeatedly.** The
   evaluator runs rolling-origin holdouts against persistence, trailing means,
   zero, seasonal-naive-7, day-of-week mean, and Croston-SBA, keeps invalid
   output as rejected evidence, and never sets `planner_consumption` itself.
9. **Say where the evidence came from.** The prediction records the
   client-operations checkout's branch, head, and dirty-file count, and
   degrades to no predicted preparation when canonical sources are missing.

## Evidence from the first live run

The 2026-09-02 router scanned 118 dated work packages from 2026-06-05 through
2026-09-02 plus 17 open canonical queue items. Status-specific freshness rules
kept stale backlog rows from crowding the predicted stack.

The first brief surfaced:

- BOK's next owner-verified weekly three-topic designed content kit around
  2026-09-08;
- an early-week branded report batch preparation watch across 13 routes;
- recurring Momentum outreach and website-production workload;
- a later content/SEO package watch; and
- Puttery's reservation-data integration only when its contract, credential,
  access, privacy, and test-booking gates clear.

The first multiseries Chronos attempt was rejected because sparse category
quantiles crossed. The raw failed evidence was retained under
`12_Brain/state/work-predictor/chronos-2026-09-02-sparse-rejected/`.

The total-workload retry produced a 14-day point total of 14.98 packages with
a p10-p90 aggregate range of 1.34 to 96.92. On the last-14-day holdout,
Chronos WAPE was 93.57%, persistence was 100%, the trailing-seven-day mean was
85.71%, and empirical p10-p90 coverage was 57.1%. It therefore failed both
the best-baseline and calibration gates. The deterministic baseline remains
primary.

## Evidence from the rolling-origin rerun

The same day, four rolling seven-day origins (cutoffs 2026-08-05 through
2026-08-26) were scored against persistence, trailing 7- and 28-day means,
zero, seasonal-naive-7, day-of-week mean, and Croston-SBA. Chronos beat the
best baseline on one origin of four; mean MAE was 2.54 versus 2.30 for the
best baseline, and mean p10-p90 coverage was 53.6% where a free same-weekday
band reached 67.8%. All origins were valid. Every repeated-holdout gate stayed
closed, so the deterministic planner remains primary.

The rerun also read the local client-operations checkout on branch
`cursor/bigorange-aeo-geo-seo-991e` with 633 modified files, 18 ahead and 18
behind `origin/main`; the brief now says so in its first paragraph. Hindcast
calibration judged 14 historical-cadence predictions across four past origins
and all 14 landed, so that tier's multiplier is 1.0; the owner-verified BOK
recurrence has no closed window yet and is shown unadjusted.

## Why

Work-package identity is categorical, source-bound, and operational. For
example, a BOK packet requires an exact source PDF, three expected topics and
generated backgrounds, branded template renders, and legal/geographic QA. A
single numeric time-series model cannot infer that contract safely.

Workload volume is numeric and may eventually benefit from a specialist
forecast. Keeping the layers separate allows each to improve against the
right evidence without turning a model guess into a client commitment.

## Reversal and review

Disable the Chronos workload stage without disabling the deterministic work
router. Keep the generated receipts for comparison. Review after at least
three comparable holdouts and after the work-category series meet their
density gates.
