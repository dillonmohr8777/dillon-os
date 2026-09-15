# Bounded Agents API multi-agent run

## Local mission control

The persistent local control surface is now in `_os/agent-swarm/`. Start it with `_os/agent-swarm/Start-Swarm.ps1`, then open http://127.0.0.1:4243. The existing Dillon OS HUD links to it. Source: `_os/agent-swarm/README.md`, `server.js`, `teams.json`, and `public/index.html`.

This adds saved mission drafts, four specialist team templates, explicit lead model selection, one active hosted mission at a time, up to three concurrent workers, continuation, cancellation requests, polling recovery, and downloadable outputs. Local files selected in the UI append text to the brief; the whole vault is not mounted or uploaded. Source text is evidence rather than execution authority.

GPT 5.5 with extra-high reasoning is the default lead for new missions. Luna remains the routine-throughput option and Astra remains selectable for an explicit escalation. Existing hosted sessions retain their original model. Provider model listing on September 13, 2026 UTC returned all three IDs. This is availability evidence, not proof that every model has completed a managed session. Per-worker model identity remains unavailable from the API.

Verified September 13, 2026 UTC: 15 control-plane checks and the existing 34 Node checks passed. A synthetic GPT 5.5 hosted engineering mission completed with three observed, completed and closed workers. Three output files were downloaded and their four Python tests passed locally. One recovered command failure is retained as a smoke-turn warning. Same-session continuation returned `FOLLOWUP_OK`; a later test turn was confirmed cancelled by the provider. Restart recovery was checked during active work. Final receipt: `C:/Users/dillo/Documents/Codex/2026-09-12/b/outputs/Agent-Swarm-Verification.json`. No test mission remains active.

The 15 minute watchdog is a best-effort cancellation request while the local server is running, not a hard dollar spending cap. No automatic client messaging, publication, local command execution, or canonical queue mutation is connected.

## Existing bounded PowerShell probe

This is a managed **Agents API** session, not a Responses API workflow. The runner defaults to `-DryRun`; it does not read an API key or make a network request until `-Live` is supplied.

## What the API currently exposes

Enable delegation at session creation with `agent.multi_agent.enabled` and `max_concurrent_subagents`. The documented setting caps concurrent workers, not the total number of workers or the nesting depth. The current SDK `Subagent` resource exposes its ID, parent agent ID, name, open/close time, and `active` or `closed` status. Its documented resource and turn resource do **not** expose a worker model or model-override control. The runner records the requested lead model and records each worker model as unavailable rather than assuming that workers used a cheaper or inherited model.

Nested delegation is therefore prompt-directed and verified after the fact. The intended topology is lead -> implementer and reviewer, then implementer -> tester: three workers total, while no more than three run at once. The API cannot enforce a depth-two or total-three constraint in the request. Do not represent this topology as executed until the receipt shows the retrieved `parent_agent_id` relationships and completed turns.

The coordinator and subagents share one hosted environment. The runner adds no MCP connections, function tools, credentials, or security grants. If `-ExportArtifacts` is explicitly selected, it downloads at most three published files under `/workspace/outputs/`, each at most 10 MiB, from an `openai_hosted` session. Artifacts are published immutable copies from completed hosted turns; self-hosted files are not available through the Artifacts API.

## Offline validation

Run this first. It verifies lifecycle classification with no API call:

```powershell
& 'C:\Users\dillo\repos\dillon-os\System\scripts\Invoke-OpenAIAgentsSession.ps1' -OfflineLifecycleTest
```

Review the exact create request without disclosing the job brief:

```powershell
& 'C:\Users\dillo\repos\dillon-os\System\scripts\Invoke-OpenAIAgentsSession.ps1' `
  -DryRun -Environment openai_hosted -MultiAgent `
  -MaxConcurrentSubagents 3 -MinimumCompletedSubagents 3 `
  -InputFile 'C:\Users\dillo\Documents\Codex\2026-09-12\create-an-image-of-2\outputs\agents-api-multiagent\job-brief.txt' `
  -Model gpt-5.5 -ReasoningEffort xhigh `
  -PollTimeoutSeconds 600 -RequestTimeoutSeconds 60
```

`InputFile` reads a local UTF-8 brief no larger than 64 KiB and sends it as the initial session input. The receipt stores its filename, byte count, and SHA-256, never the brief text.

## One bounded live run

After the dry run is accepted and `OPENAI_API_KEY` is already present in the local environment, use this one command. It creates one hosted session, performs no automatic delete, and bounds each HTTP request to 60 seconds and polling to ten minutes.

```powershell
& 'C:\Users\dillo\repos\dillon-os\System\scripts\Invoke-OpenAIAgentsSession.ps1' `
  -Live -Environment openai_hosted -MultiAgent `
  -MaxConcurrentSubagents 3 -MinimumCompletedSubagents 3 `
  -InputFile 'C:\Users\dillo\Documents\Codex\2026-09-12\create-an-image-of-2\outputs\agents-api-multiagent\job-brief.txt' `
  -Model gpt-5.5 -ReasoningEffort xhigh `
  -PollTimeoutSeconds 600 -RequestTimeoutSeconds 60 -ExportArtifacts
```

The brief must explicitly direct the lead to create the intended workers, wait for them, run the requested tests, and synthesize results. It must also request only non-secret output files in `/workspace/outputs/` when artifact export is desired. `-DeleteDisposableTestSession` remains a separate, explicit option and is not part of this command.

## Acceptance and recovery

A process exit of zero requires all of the following: a completed **main-agent** turn, retrieved session items, no failed tool items, three retrieved subagent records, at least three completed subagent turns, and no failed or cancelled worker turn. The saved receipt contains only metadata: session/turn/item IDs and statuses, coordination item types, subagent IDs/status/parent IDs, usage, artifact metadata, and hashes of downloaded exports. It does not persist request text, messages, command output, headers, or API keys.

Review the newest receipt under `System\outputs\agents-api-receipts`. Confirm: (1) `receipt_status` is `completed`; (2) `delegation.state` is `delegation_observed`; (3) the three records show the expected parent relationship; (4) each has a completed turn; (5) coordinator items include creation and wait actions; (6) the main-agent completed turn and assistant item exist; and (7) any exported artifact has a local SHA-256. A receipt of `delegation_unverified`, `subagent_failed`, `tool_failed`, `timed_out`, `failed`, `cancelled`, or `requires_action` is not a successful run. A timeout preserves the session ID and receipt for inspection.

## Sources

- [Agents API multi-agent guide](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)
- [Agents API sessions and recovery](https://developers.openai.com/api/docs/guides/agents-api/sessions)
- [Agents API files and artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files)
- [Artifact content endpoint](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/agents/subresources/sessions/subresources/artifacts/methods/content)
