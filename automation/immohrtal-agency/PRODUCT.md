# IMMOHRTAL agency operating layer

## Product truth

This folder is the first executable operating layer for IMMOHRTAL Marketing Solutions, a business distinct from Momentum 360 and every client account.

Its current job is narrow: turn the verified Drive allowlist into locally reviewable website, AEO, GEO, and agent-integration opportunities plus draft-only outreach packages. It live-checks each referenced concept before drafting. It does not send email, publish sites, spend money, or write to a CRM.

## Operators and boundaries

- Dillon Mohr is the human approver.
- Scout, Atlas, Forge, and Relay are makers with non-overlapping jobs.
- Proof is the checker and cannot create or rewrite a maker's output.
- Every external delivery remains unavailable in this version, even after local approval.
- Only the exact IMMOHRTAL Drive allowlist may enter this lane. HOLD and DO NOT PITCH sheets are hard suppression sources.

## Output contract

Each completed run produces:

- `run-receipt.json`: machine-readable execution evidence and hashes.
- `operator-brief.md`: a concise human review surface.
- `prospect-queue.json`: prospect states and approval gates.
- `outreach-packages.json` plus per-prospect Markdown and JSON files: drafts only.
- `gmail-draft-manifest.json`: exact Gmail-ready recipient, subject, body, and fingerprint records. It is not a sender.

A prospect can end in `AWAITING_APPROVAL`, `SUPPRESSED`, `DUPLICATE`, or `BLOCKED`. This version has no `SENT`, `PUBLISHED`, or `CRM_WRITTEN` state.

## Evidence standard

Input claims are treated as source assertions. Scout adds a dated HTTP receipt for the referenced concept, while analytics and outcomes remain unknown. Drafts use hypotheses and review language, never fabricated results, rankings, traffic, revenue, or conversion claims.
