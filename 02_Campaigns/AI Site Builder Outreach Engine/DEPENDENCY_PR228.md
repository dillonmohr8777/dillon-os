---
tags: [campaign, dependency, pr]
campaign: "[[AI Site Builder Outreach Engine]]"
depends_on_pr: 228
status: resolved
resolved: 2026-07-30
merge_commit: a2d99ad
---

# Dependency note: PR #228

PR #228 (`cursor/automation-deep-analysis-316c`) owns automation registry, queue,
frontmatter ops, site-health sentinel, and qualify scoring under `_os/automation/`
and `12_Brain/`.

PR #226 owned `_templates/site-factory/**`, design skills, and the outreach
campaign pack. It is now merged at `a2d99ad`, and the non-colliding factory paths
are installed in this vault. The historical ownership boundary remains useful:
registry and queue stay under `_os/automation/` and `12_Brain/`; factory code
stays under `_templates/site-factory/`.

Shared contract surface for cross-PR handoffs lives at `_templates/site-factory/workflow/contract.js` (`workflow_id`, `step_id`, `task`, `constraints`, `upstream_artifacts`, `budget_tokens`, `timeout_seconds`). Approval is fail-closed: automation never sets `mail_ready=ready`.
