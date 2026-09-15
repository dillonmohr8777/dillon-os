# Chronos workload shadow — 2026-09-02

Decision: **retain-deterministic-baseline-primary**. Authority: **research-evidence-only**.

## Preliminary holdout

| Series | Chronos WAPE | Persistence WAPE | Trailing-7 WAPE | p10-p90 coverage |
| --- | ---: | ---: | ---: | ---: |
| work-packages-total | 93.57% | 100% | 85.71% | 57.1% |

## Next 14-day shadow band

| Series | Point total | p10 total | p50 total | p90 total |
| --- | ---: | ---: | ---: | ---: |
| work-packages-total | 14.98 | 1.34 | 14.98 | 96.92 |

Gates: single holdout baseline FAIL, quantile coverage FAIL, repeated holdouts FAIL, planner consumption FAIL.

The totals are shadow evidence about workload volume. They do not create client work, deadlines, conversion claims, approvals, or permission to reorder the plan.
