# Chronos workload shadow — 2026-09-02

Decision: **retain-deterministic-baseline-primary**. Authority: **research-evidence-only**. Horizon 7 days, 4 rolling origins.

## Rolling-origin holdouts (portfolio total)

| Origin cutoff | Context | Zero share | Chronos MAE | Best baseline | Baseline MAE | Croston-SBA MAE | Seasonal-7 MAE | Chronos p10-p90 cov. | Weekday band cov. | Verdict |
| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 2026-08-26 | 83 | 14.3% | 3.0431 | trailing_28_day_mean | 2.4694 | 2.4774 | 3.1429 | 42.9% | 57.1% | baseline wins |
| 2026-08-19 | 76 | 14.3% | 3.2868 | day_of_week_mean | 2.8584 | 3.0734 | 3.4286 | 57.1% | 57.1% | baseline wins |
| 2026-08-12 | 69 | 42.9% | 0.6622 | zero | 0.7143 | 1.866 | 3.7143 | 57.1% | 85.7% | Chronos wins |
| 2026-08-05 | 62 | 28.6% | 3.1508 | persistence | 3.1429 | 3.4794 | 3.4286 | 57.1% | 71.4% | baseline wins |

Aggregate: Chronos won 1 of 4 scored origins (0 rejected). Mean MAE Chronos 2.5357 vs best baseline 2.2962. Mean p10-p90 coverage 53.6% against the free weekday band's 67.8%.

## Forward shadow band

| Series | Horizon | Point total | p10 total | p50 total | p90 total |
| --- | ---: | ---: | ---: | ---: | ---: |
| work-packages-total | 14 | 14.98 | 1.34 | 14.98 | 96.92 |

Gates: all origins valid PASS; repeated holdouts beat best baseline FAIL; repeated-holdout calibration FAIL; repeated holdouts overall FAIL; planner consumption FAIL.

Software never sets planner_consumption. A human promotion decision must be recorded separately, and only after repeated holdouts pass.

The totals are shadow evidence about workload volume. They do not create client work, deadlines, conversion claims, approvals, or permission to reorder the plan.
