# IMMOHRTAL agency operating layer

## Product truth

This folder is the first executable operating layer for IMMOHRTAL Marketing Solutions, a business distinct from Momentum 360 and every client account.

Its current job is narrow: turn explicitly supplied prospect records into locally reviewable website, AEO, GEO, and agent-integration opportunities plus draft-only outreach packages. It does not discover live companies, browse websites, send email, publish sites, spend money, write to a CRM, or authenticate to any service.

## Operators and boundaries

- Dillon Mohr is the human approver.
- Scout, Atlas, Forge, and Relay are makers with non-overlapping jobs.
- Proof is the checker and cannot create or rewrite a maker's output.
- Every external mutation remains unavailable in this version, even after local approval.
- Momentum 360 lists, assets, accounts, and history are out of scope and must never be used as IMMOHRTAL prospect inputs.

## Output contract

Each completed run produces:

- `run-receipt.json`: machine-readable execution evidence and hashes.
- `operator-brief.md`: a concise human review surface.
- `prospect-queue.json`: prospect states and approval gates.
- `outreach-packages.json` plus per-prospect Markdown and JSON files: drafts only.

A prospect can end in `AWAITING_APPROVAL`, `SUPPRESSED`, `DUPLICATE`, or `BLOCKED`. This version has no `SENT`, `PUBLISHED`, or `CRM_WRITTEN` state.

## Evidence standard

Input claims are treated as unverified source assertions unless an adapter later supplies dated evidence. Drafts must use hypotheses and review language, never fabricated results, rankings, traffic, revenue, or conversion claims.

