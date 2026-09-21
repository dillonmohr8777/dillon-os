---
status: draft
updated: 2026-09-11
source_refs:
  - 'C:/Users/dillo/.codex/CODEX-GPT6-ASTRA-GUIDANCE.md'
  - 'C:/Users/dillo/.codex/AGENTS.md'
  - 'C:/Users/dillo/.codex/config.toml (model field only)'
  - 'System/machine-context/CODEX-ASTRA-CONFIRM-RUN.log (startup header only)'
  - 'AGENTS.md'
  - '.agents/skills/automation-ops/SKILL.md'
  - '.agents/skills/client-report/SKILL.md'
  - 'C:/Users/dillo/.codex/skills/agenthub/SKILL.md'
  - 'C:/Users/dillo/.codex/skills/engineering/agenthub/SKILL.md'
---

- **Model requested / believed active:** GPT-6 Astra (`gpt-6-astra`). The local Codex configuration and this task's startup log both report that identifier; the log names provider `openai`. This confirms the locally reported selection, not independent backend identity.
- **Posture:** Confirmed. I skimmed `C:\Users\dillo\.codex\CODEX-GPT6-ASTRA-GUIDANCE.md` and am applying its short triggers, contextual reading, outcome-based completion, and real decision boundaries, with Ponytail full active.
- **Scope:** Local draft only. Completion means writing this confirmation and verifying it. The five cleanups below are proposals, not applied instructions.
- **Repository at inspection:** `C:\Users\dillo\repos\dillon-os`; working scope `System\machine-context`; branch `cursor/immohrtal-standing-canary-3c2e`; HEAD `d056b202561aba2d7bd1dadee9043b50fcb5fcb0`. Preserve the existing dirty checkout.

- **Cleanup 1: Shorten skill triggers.** In `.agents/skills/automation-ops/SKILL.md`, use “Use when running or checking a registered Dillon OS automation.” In `.agents/skills/client-report/SKILL.md`, use “Use when creating a performance report for a named client and reporting period.” Keep commands, schemas, and examples in the body.
- **Cleanup 2: Route automation context by task.** Make `automation-ops` select the relevant registered command first, then load only its applicable operator sections and references. Keep authority, client isolation, immutable evidence, and maker/checker boundaries immediately visible.
- **Cleanup 3: Slim global AGENTS without weakening gates.** Keep universal authority and safety rules in `C:\Users\dillo\.codex\AGENTS.md`; move detailed browser, Chronos, and frontend procedures into linked guides with explicit task triggers. Retain the required checks in those workflows and keep the repository's existing “read only what the task needs” approach.
- **Cleanup 4: Define completion and proportional checks.** Add an Astra-scoped completion rule to repository `AGENTS.md`: implement, run relevant checks, inspect, fix, and return evidence within the authorized scope. Distinguish a Markdown-only draft from a runtime or vault change when choosing checks; eliminate repeated permission requests for already-authorized local fixes. Preserve required security checks and substantive maker/checker review. Existing test requirements remain binding until changed.
- **Cleanup 5: Deduplicate skill discovery and preserve model lanes.** The two `agenthub/SKILL.md` files under `.codex/skills/agenthub` and `.codex/skills/engineering/agenthub` currently have identical SHA-256 hashes. Expose one canonical skill identity through the supported registration mechanism while preserving compatibility paths and installed caches. Scope Astra-specific guidance explicitly; retain Sol/Luna instructions and worker lanes.

- **Will NOT change: action gates.** No send, post, publish, deploy, spend, account mutation, or external delivery in this task. Existing standing approvals retain their exact scope; this draft neither expands nor exercises them.
- **Will NOT change: access and authentication gates.** No edits to permissions, hooks, shell guards, or access boundaries. Preserve secret protection and human-only MFA, CAPTCHA, passkey, recovery, push-approval, and new-consent gates.
- **Will NOT change: operating integrity.** Preserve exact client/account/recipient routing, Codex's sole canonical queue authority, untrusted-inbound boundaries, evidence-based completion, immutable captures, and reversible handling of consequential changes. Preserve hidden-window and protected-tab rules.
- **Will NOT change: active contracts or repository history.** This file does not activate a rule change. Leave AGENTS, skills, model configuration, unrelated files, the Git index, branches, and history unchanged; no commit, push, or PR for this draft-only request.
