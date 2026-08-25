---
workflow_id: IMMOHRTAL-DAILY-20260825
step: SOURCE-ISOLATION-01
status: verified_disabled_reversible
observed_date: 2026-08-25
owner: Codex Marketing Chief
source_refs:
  - "automation/immohrtal-agency/config/source-metadata.json"
  - "automation/immohrtal-agency/config/requalification-source.json"
  - "[[06_Revenue/IMMOHRTAL/lead-intelligence/SOURCE-AUDIT-2026-08-25]]"
---

# Legacy source isolation receipt

Related: [[06_Revenue/IMMOHRTAL/lead-intelligence/SOURCE-AUDIT-2026-08-25]];
[[11_Agents/IMMOHRTAL Business Crew/daily/2026-08-25]];
[[11_Agents/IMMOHRTAL Business Crew/DAILY-OPERATING-LOOP]]

## Outcome

The Windows task `IMMOHRTAL Agency Daily` was disabled without deletion after
its configured allowlist was reconciled to the current source audit. The exact
Sheet locator used by the task is classified `franchise_webinar_excluded` and
cannot feed the IMMOHRTAL pipeline.

## Current evidence

| Check | Verified state |
|---|---|
| Task path | `\IMMOHRTAL Agency Daily` |
| Launcher | Hidden `wscript.exe` route through `Run-HiddenScheduledTask.vbs` |
| Last run | 2026-08-25 08:10 ET |
| Last result | `0` |
| Last run source | Excluded franchise/webinar allowlist |
| Action taken | Task disabled, not deleted |
| State after action | Disabled |
| Canonical live loop | Codex heartbeat active daily at 08:30 ET |
| Authorized company source | 47-company discovery-only Sheet |
| External actions during isolation | 0 |

The prior successful task result proves that the local program ran. It does not
prove that the source was permitted for IMMOHRTAL. Source authority outranks a
green execution receipt.

## Re-enable gate

Do not re-enable the 08:10 task until all of these are true:

1. The tracked metadata and live local snapshot identify the authorized
   company-requalification Sheet.
2. The adapter persists only the allowed company-level fields and excludes raw
   contact, address, and message data.
3. Conflict, duplicate, source-rights, suppression, and freshness checks fail
   closed.
4. A deterministic dry run returns only company research artifacts, records
   zero external actions, and passes independent review.
5. The 08:10 task has a distinct necessary job and does not duplicate the
   active 08:30 heartbeat.

Re-enabling is a separate deliberate action. This receipt grants no send,
booking, CRM, account, spend, or publication authority.
