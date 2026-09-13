# Align HCM Customer Agent handoff

Updated: 2026-07-23  
Purpose: make the Customer Agent design and readiness package available to Claude through `dillonmohr8777/dillon-os`.

## Current decision

**HOLD Ben Harrison access and customer-channel activation.** (Unchanged — this is a human approval, not an agent action.)

The agent passed the general vendor-agnostic test. A stricter named-provider test still repeated the provider name and described its relationship to Align. That response was not negative, but it did not satisfy the final partner-safety rule.

Access is ready only after the revised rules in [customer-agent-guardrails.md](customer-agent-guardrails.md) are applied and every named-partner regression passes.

### What changed 2026-07-23 (correction cycle 2)

The revised rules are now **applied in version control** and the regression is now **authored as a runnable suite** — in `dillonmohr8777/claude-skills-repo`, branch `claude/jason-hubspot-agent-k35h72` (draft PR; supersedes PR #17):

- `skills/alignhcm-customer-agent/references/brand-partner-safety.md` — the named-company rule (Case A/B/C) that fixes both the partner-safety over-share **and** the Workday false-negative (a platform Align publicly supports).
- `skills/alignhcm-customer-agent/references/acceptance-tests.md` — the 22-prompt suite incl. the **12-test partner-safety gate**, with a scorecard.
- `skills/alignhcm-customer-agent/references/customer-facing-deployment.md` — launch-readiness gates + the ordered path to activation.
- `skills/alignhcm-customer-agent/assets/customer-facing-guidelines.txt` — the same 2,306-char corrected payload, byte-identical to [customer-agent-final-guidelines.txt](customer-agent-final-guidelines.txt).

**Still open (owner in parentheses):** apply the payload in HubSpot + re-run the partner-safety gate to 12/12 (HubSpot UI); repair the knowledge source set / sync so the 5 public-knowledge answers return exact links (HubSpot UI — blocked on HubSpot's source-removal error); consolidate the greeting; approve + upload the Align avatar; run the end-to-end handoff-ticket test; then **separate activation approval** before attaching the live channel.

## Deliverables

- [Readiness report PDF](customer-agent-readiness-report.pdf)
- [Editable readiness report](index.html)
- [Readiness report preview](preview.png)
- [Knowledge-core PDF](align-hcm-customer-agent-knowledge-core.pdf)
- [Editable knowledge core](align-hcm-customer-agent-knowledge-core.html)
- [Knowledge-core preview](knowledge-core-preview.png)
- [Agent-image comparison](agent-image-preview.png)
- [Final guardrail and Ben-access gate](customer-agent-guardrails.md)
- [HubSpot-ready final guidelines](customer-agent-final-guidelines.txt)
- Applied guardrails + runnable acceptance suite: `claude-skills-repo/skills/alignhcm-customer-agent/` (branch `claude/jason-hubspot-agent-k35h72`)
- [Cycle-2 status note](STATUS-2026-07-23.md)

## Verified state

- Agent: Align HCM Customer Agent
- Knowledge: 104 sources reported synced (the 2026-07-23 readiness test observed 71 = 24 website + 47 blog; reconcile to the approved scope before launch)
- Customer-facing channel: not activated
- General competitor prompt: passed without naming or criticizing another company
- Named-provider prompt: failed the stricter no-classification requirement
- Corrected HubSpot guideline payload: built and validated at 2,306 characters
- Partner-safety rule + 12-test gate: authored and applied in version control (cycle 2); not yet re-run against the live tester
- Public-knowledge answers (SmartCare / Workday / implementation / training / UKG case study): still failing retrieval in the live tester; expected public sources re-verified live 2026-07-23
- Ben access: not granted

## Source note

The report is a design and evidence artifact, not an activation certificate. The editable HTML is included so Claude can revise the report in the same visual system without rebuilding it.
