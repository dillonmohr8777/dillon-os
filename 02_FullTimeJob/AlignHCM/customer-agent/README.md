---
employer: Align HCM
project: HubSpot Customer Agent
portal: "242825734"
status: launch hold
evidence_date: 2026-07-28
baseline_date: 2026-07-23
work_item: wi-20260723-0005
tags: [fulltime, align-hcm, hubspot, customer-agent, ai-agent]
---

# Align HCM Customer Agent

The HubSpot Customer Agent for alignhcm.com. Website-facing, grounded in public Align content,
hands off to a human when a request needs advice, scoping, pricing, or account support.

**Status: LAUNCH HOLD.** No live channel is attached and none should be until the correction rounds
pass and activation is separately approved.

## Where it stands — July 28, 2026

Retrieval is fixed. Attribution is not.

| | July 23 baseline | July 28 |
|---|---|---|
| Public retrieval | 0 of 5 probes grounded in the live page | Real alignhcm.com content reached most answers |
| Source links | Zero expected links returned | Citation block mostly right; **inline prose links often invented** |
| Connected sources | 71 (24 web + 47 blog) | 118 (54 web + 63 blog + 1 private file) |
| Safety probes | 3/3 pass | 3/3 pass |
| Live channels | 0 | 0 |

Two blockers, both fixable with a guidelines publish and no source deletes:

1. **Fabricated URLs in answer prose** — `url-*.com` placeholder domains and an invented
   `alignhcm.com/start` path. Real page, real answer, fake link.
2. **Data-conversion overclaim** — "can migrate *all*… nothing is lost." Align does not make a
   completeness promise.

Also open: `/case-studies` and the GTAA UKG study are public but unattached; seven sandbox
`hs-sites` pages leaked into citations; a private SmartCare Pricing Calculator is attached with
citations off; the avatar is still HubSpot's default; the portal carries a past-due banner.

## The three documents

| PDF | Pages | What it is |
|---|---|---|
| [[Align-HCM-Customer-Agent-Readiness-Report-2026-07-28.pdf\|Readiness Report]] | 12 | The evidence. Delta vs July 23, identity, capability boundary, 10 knowledge + 5 safety probes, source health, handoff, 13 launch gates, path to ready. |
| [[Align-HCM-Customer-Agent-Knowledge-Core-2026-07-28.pdf\|Knowledge Core]] | 10 | What the agent is allowed to say. Ten service lines, SmartCare's four levels, platforms, eight grounded answers, the answer boundaries, and the three hard rules added July 28. |
| [[Align-HCM-Customer-Agent-Correction-Package-2026-07-28.pdf\|Correction Package]] | 6 | What to change in the portal. Guardrail text to paste, attach/detach tables, Round A/B/C retest pack, operator checklist, activation gate. |

## If the boss wants to see it

Internal HubSpot tester or preview only. Say up front that **inline prose links are unreliable and
the Sources citation block is the trustworthy one**. Safe to demo: SmartCare, training, Workday, the
guarantee refusal, the injection refusal. Do not demo data conversion or the off-track
implementation question until the URL fix lands. Do not enable website chat.

## Avatar candidates

Neither is uploaded to HubSpot. Both need brand approval first.

| | File |
|---|---|
| Primary — character-first | `assets/align-customer-agent-robot-hubspot-1024.png` |
| Alternate — mark-first | `assets/align-customer-agent-monogram-hubspot-1024.png` |

## Next actions

1. Publish the URL guardrail and the data-conversion guardrail. Guidelines only, no deletes.
2. Retest Round A: K6, K8, K9, then K1, K3, K7, S1, S3. Pass bar is zero fabricated URLs.
3. Repair the source set — attach the two case-study pages, detach the sandbox pages, quarantine
   the private pricing calculator, decide on the blog corpus.
4. Retest Round B with an exact-URL bar.
5. Brand-approve and upload the avatar.
6. Run the deferred handoff probes (K10, S4, S5) only on the explicit phrase
   `approve disposable handoff ticket test` — they create a real Help Desk ticket.
7. Resolve the past-due banner, then seek separate activation approval.

## Supersedes

This folder is the same location the earlier design passes targeted, so these three files replace
them rather than sitting beside them:

| Pass | Date | What it was |
|---|---|---|
| v1 | 2026-07-23 | First designed package — readiness report (10 pp) + knowledge core (9 pp), in `readiness-report/` and `knowledge-core/` subfolders. |
| v2 | 2026-07-24 | Design revision of the same July 23 evidence, with an HTML `source/` tree. |
| **v3 — this one** | **2026-07-28** | **New evidence pass.** Same design language, current findings, plus the correction package as a third document. |

v1 and v2 both carry the July 23 verdict — "safe by design, cannot retrieve." That verdict is out of
date: retrieval now works. If either is still open in a PR, read it as a historical baseline only.
The designed July 23 PDFs are archived in `client-operations-canonical` at
`clients/align-hcm/deliverables/output/pdf/archive/`.

## Canonical source

These PDFs are built from the evidence files in `client-operations-canonical`:

- `clients/align-hcm/deliverables/2026-07-28-hubspot-customer-agent-readiness-update.md`
- `clients/align-hcm/deliverables/2026-07-28-hubspot-customer-agent-correction-package.md`
- `clients/align-hcm/deliverables/2026-07-23-hubspot-customer-agent-configuration.md`
- Builder: `clients/align-hcm/deliverables/output/pdf/build-customer-agent-pdfs.py`

Edit the markdown there and rebuild; do not hand-edit the PDFs. The July 23 designed baselines are
archived at `clients/align-hcm/deliverables/output/pdf/archive/`.

## Links

- [[Align HCM]]
- [[overview]]
- [[smartcare-notes]]
