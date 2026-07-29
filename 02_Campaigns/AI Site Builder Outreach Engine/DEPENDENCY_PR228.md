---
tags: [campaign, dependency, pr]
campaign: "[[AI Site Builder Outreach Engine]]"
depends_on_pr: 228
---

# Dependency note: PR #228

PR #228 (`cursor/automation-deep-analysis-316c`) owns automation registry, queue, frontmatter ops, site-health sentinel, and qualify scoring under `_os/automation/` and `12_Brain/`.

This factory branch (PR #226) owns `_templates/site-factory/**`, design skills, and the outreach campaign pack. **Do not copy factory files into #228 and do not move registry/queue into the factory.** Merge order: land factory gating fixes here first; #228 continues to treat #226 as a hard dependency.

Shared contract surface for cross-PR handoffs lives at `_templates/site-factory/workflow/contract.js` (`workflow_id`, `step_id`, `task`, `constraints`, `upstream_artifacts`, `budget_tokens`, `timeout_seconds`). Approval is fail-closed: automation never sets `mail_ready=ready`.
