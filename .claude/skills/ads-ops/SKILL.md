---
name: ads-ops
description: The every-2-days ads analysis cycle — reads the Ads Ops specs and freshest exports, runs research + per-account analysis + tracking checks (ultracode fan-out when available), and writes the Action Packet to Daily-Briefs/ads-ops/. The local Chrome session applies it.
---

# Ads Ops — analysis cycle

Produce this cycle's **Action Packet**. Dillon has granted full autonomy
(`raw/2026-07-04 - full-autonomy-directive.md`); guardrails in
`02_Campaigns/Ads Ops/Ads Ops Hub.md` are law.

## Inputs
1. Every spec page in `02_Campaigns/Ads Ops/` (skip none).
2. Freshest `raw/ads-exports/` (if stale >4 days, note it — analysis degrades).
3. The previous Action Packet in `Daily-Briefs/ads-ops/` (grade what was
   applied: done / skipped / broke something).
4. Best-practices cache: `concepts/` pages tagged `ads-research` with unexpired
   `expires:` — if expired or missing, run a research pass (fan out across
   Google + Meta 2026 practitioner sources, skeptic-verify, land as dated
   concept pages with 30-day expiry).

## The work (fan out when multi-agent is available; sequential otherwise)
Per account: what changed since last cycle → what's underperforming vs its
spec's KPIs → exact change instructions (campaign / ad set / change / expected
effect). Respect brand rules absolutely. Page-side tracking checks (curl the
LPs: tags present, forms live, no 404s) run every cycle from remote.

## Output: `Daily-Briefs/ads-ops/action-packet-YYYY-MM-DD.md`
1. **Apply list** — per client, ranked by impact: exact changes for the Chrome
   session, each with a verify step.
2. **Flags** — tracking failures, policy risks, spec contradictions, Zap
   health.
3. **Blocked** — items waiting on access/intake (chase list).
4. **Last cycle scorecard** — what got applied and what it did to the numbers.

Commit and push. Keep client-facing numbers within evidence boundaries; no
lead PII in the packet.
