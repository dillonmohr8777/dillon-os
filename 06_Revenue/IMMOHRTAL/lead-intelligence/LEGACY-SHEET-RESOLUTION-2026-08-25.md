---
note_type: legacy-sheet-resolution
status: verified_current
created: 2026-08-25
updated: 2026-08-25
owner: Codex Marketing Chief
workflow: IMMOHRTAL-DAY1
step: LEADS-01B
source_refs:
  - "[[06_Revenue/IMMOHRTAL/lead-intelligence/SOURCE-AUDIT-2026-08-25]]"
  - "[[06_Revenue/IMMOHRTAL/EVIDENCE-AND-SOURCE-RULES]]"
tags:
  - immohrtal
  - revenue
  - lead-intelligence
  - source-audit
---

# IMMOHRTAL legacy Sheet resolution

**As of:** 2026-08-25 17:42 ET
**Collection state:** read only
**External actions:** 0

## Outcome

The seven native Google Sheets that remained ownership or consent unresolved in
the earlier source audit were rechecked through current Drive metadata,
permissions, exact tab metadata, and one bounded first-row probe when a visible
tab existed.

Zero of the seven is an authorized IMMOHRTAL prospect source. No contact row,
personal identifier, message, or raw cell value was copied into this repository.
All seven remain excluded from the IMMOHRTAL lead pool.

## Resolution manifest

| Opaque source locator | Resolution | Reason |
|---|---|---|
| `google-drive-file:1KyjDvL36x3Zv8ZzPjvdUFhj_NB8z6csgq_a5JTzhRHY` | `EXCLUDED` | Third-party campaign connection data with personal contact fields; no IMMOHRTAL purpose or contact permission |
| `google-drive-file:1bGJHhOxQw2dV7YHS06OeGmg7Gufh49txXxO1ASOJGJM` | `EXCLUDED` | Aggregate email-performance statistics, not a company prospect source |
| `google-drive-file:1cK5t_prmZx7MrQdOK8da8bvXovJI_JDng768UDTSYHw` | `EXCLUDED` | Consumer appointment and health-service contact data; client and sensitive-data boundary |
| `google-drive-file:1-FPaBwZZPxFRl2zovTHMtVANQp8F3Aq44RqFWzfy-S0` | `EXCLUDED` | Consumer appointment and health-service contact data; client and sensitive-data boundary |
| `google-drive-file:1j8tpy4e0pwOr5Lr7qUSf8MQqBu9N-fUYITYowVmgEWU` | `EXCLUDED` | Historical advertising lead reporting with no IMMOHRTAL reuse authority |
| `google-drive-file:1xStd_0HqfYmBuguhck90MTJfWoMWW3Qm4x3WurOD_Ek` | `EXCLUDED` | Native-Sheet metadata returned no visible tab; no safe basis to use the file |
| `google-drive-file:1IyMO0ek3YYhZRajH0jcZM0qTYdmswUAx6l4gARbaH6s` | `EXCLUDED` | Raw name-and-email report with unresolved source rights, consent, suppression, and purpose |

## Controls and verification

- Current Google account matched the prior Gmail and Drive audit account.
- File metadata showed the authenticated user as owner for all seven sources.
  Ownership alone did not establish prospecting purpose, consent, or channel
  permission.
- Header probes were bounded to the first row of the exact metadata-derived tab.
  When the first row contained personal data rather than headers, collection
  stopped and the values were not persisted.
- No recipient, person name, email address, phone number, street address,
  personal LinkedIn path, message body, or health detail is stored here.
- No Sheet, sharing permission, Gmail item, calendar, CRM, or account setting was
  changed.

## Resulting source posture

The Drive and Sheets audit now has no unresolved legacy candidates in its
review queue. The only current IMMOHRTAL Drive source remains the 47-company
discovery-only Sheet documented in the source audit. Its weak link-writer
integrity, age, and lack of contact permission still prevent outreach use.
