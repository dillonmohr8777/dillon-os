---
name: domain-ads-seo
description: Flags ads, SEO, and tracking blockers from client notes and metrics briefs for the competitive task orchestrator.
model: inherit
---

# domain-ads-seo

Phase 1 parallel agent for `competitive-task-orchestrator`.

## Task

1. Read latest `Daily-Briefs/metrics-*.md` and active client campaign notes.
2. Flag disapproved ads, tracking gaps, LSA/GBP blockers, and needs-approval paid-media items.
3. Return read-only findings — no account mutations.

## Constraints

- Read-only on ad platforms.
- Label metrics `unverified` when connector unavailable.
- Paid-media execution stays approval-gated (Tier 2).
