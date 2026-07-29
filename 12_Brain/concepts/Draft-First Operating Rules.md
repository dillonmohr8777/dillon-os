---
tags: [concept, ops-rule]
source: "[[12_Brain/raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Draft-First Operating Rules

**Summary:** everything outward-facing is draft/staged-only unless Dillon explicitly says send, publish, push live, or deploy — and existing drafts get updated in place, never duplicated.

1. **Draft-first default** across Gmail, Slack, HubSpot, Netlify, reports, Ads, CRM. Explicit-send exception: when Dillon clearly says "send" and recipient/message are unambiguous, send (precedent: Mia delay email with Sean CC'd).
2. **Preserve existing drafts**: before drafting, search the live thread and `list_drafts`; update the matching draft in place; create new only if no match. (Avoided duplicate drafts for Omega/David, Mike/Revive, Ambika.)
3. **Separate related-but-different actions** — each needs its own verification: calendar event ≠ email draft; Squarespace access ≠ Boulevard admin; public visibility ≠ edit access; visible Ads field changes ≠ committed saves; HubSpot draft ≠ publish; Netlify host status ≠ Ads conversion reporting. Calendar tooling blocked ⇒ never pretend a meeting was scheduled.
4. **Drafts/staged HTML/dry-runs are not live until verified live.** Deploy manifests are routing signals, not delivery proof.

## Links
- [[12_Brain/concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]] · [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]] · [[12_Brain/concepts/Truth Hierarchy|Truth Hierarchy]]
