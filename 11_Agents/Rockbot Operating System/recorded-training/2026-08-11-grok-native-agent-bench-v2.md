# Grok Native Agent Bench v2 Proposal

Status: installed locally for bounded canary use; canonical workflow adoption remains subject to Codex verification.

## Decision

Use Grok Build's native one-level subagents, custom agent definitions, hooks, MCP inheritance filters, workflows, and worktree isolation. Do not add a LangChain supervisor around Grok. Codex acting as Marketing Chief remains the orchestrator, final verifier, and only canonical queue writer.

Official basis:

- https://docs.x.ai/build/features/subagents
- https://docs.x.ai/build/features/project-rules
- https://docs.x.ai/build/features/permissions
- https://docs.x.ai/build/features/hooks
- https://docs.x.ai/build/features/mcp-servers
- https://docs.x.ai/build/features/worktrees
- https://x.ai/news/workflows

## Installed bench

The user-level definitions live under `C:\Users\dillo\.grok\agents`:

1. Client Context Router
2. Grok Research Scout
3. Communications Intake Analyst
4. Paid Media Auditor
5. Reporting and Analytics Analyst
6. Web and Product Builder
7. Design and Art Direction Critic
8. Brand Voice and Content Studio
9. SEO, AEO, and GEO Strategist
10. CRO Experiment Planner
11. CRM and Revenue Operations Analyst
12. Automation Reliability Scout
13. Knowledge and Obsidian Curator
14. Independent QA and Release Critic
15. Delivery Evidence Auditor

Concurrency is capped at three specialists. The bench is flat: specialists do not recursively delegate. Writers use isolated worktrees. Evaluator revision loops stop after two passes.

## Access posture verified 2026-08-11

| Surface | Current posture | Agent use |
| --- | --- | --- |
| Local repositories | Available; preserve dirty worktrees | Exact repo only; writers in worktrees |
| Agent vault | Sync and tests passing | Read-only shared context |
| Obsidian Dillon OS | Local vault available | Read-only except redacted proposals under `00_Inbox\Agent-Proposals\Grok` |
| OmniRoute | Healthy MCP handshake | Named inheritance for bounded read-only analysts |
| Gmail | Message-read capability registered for Dillon Operations, but last verification is stale | Canary required before evidence use; no send or provider draft |
| Slack | Session and account metadata only; message-read is not registered | No communication reads until capability is explicitly verified |
| Google Ads | Read capabilities vary by client and several records lack a current verification timestamp | Resolve exact client and canary read-only access |
| Meta Ads | No allowed data capabilities recorded | No access claim |
| Composio | Unsafe plaintext compatibility route removed; OAuth route needs authentication and the exposed key needs provider rotation | No agent inheritance until rotation and OAuth canary pass |
| External delivery | Blocked by rules and PreToolUse hook | Local preview and Codex approval only |

## Handoff contract

Every specialist returns:

- status: complete, partial, blocked, or drafted;
- exact client, account, source locator, and freshness;
- output paths and checks run;
- uncertainty and missing access;
- one proposed next action.

No specialist may claim that local build success proves deployment, delivery, provider mutation, queue advancement, or user acknowledgment.

## Rollout

1. Canary read-only roles against one bounded task each.
2. Canary the Web and Product Builder in a disposable worktree.
3. Run the Independent QA and Release Critic on the same artifact without edit access.
4. Reconnect Composio through OAuth only after provider key rotation.
5. Add a saved Grok workflow only after authentication and the first three canaries pass.

## Acceptance gates

- `grok inspect --json` discovers all 15 user agents and the global safety hook.
- Benign local builds pass the hook; external sends, pushes, deployments, secret reads, and screen recording are denied.
- No raw credentials appear in config, prompts, logs, or evidence.
- Connector claims match current Access Broker capabilities and live readback.
- Codex independently reconciles artifacts before any canonical or external action.
