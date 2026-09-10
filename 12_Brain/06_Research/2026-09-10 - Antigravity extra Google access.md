---
note_type: research
status: verified
created: 2026-09-10
updated: 2026-09-10
observed_at: 2026-09-10
expires: 2026-12-10
verification_status: verified
owner: Dillon Mohr
area: model gateway / Google account access
tags: [research, antigravity, gemini, google, orchestrator]
source_refs:
  - "[[System/daily-orchestrator]]"
  - "[[System/handoff-2026-09-10]]"
  - https://antigravity.google/docs
  - https://antigravity.google/docs/mcp
  - https://deepmind.google/models/model-cards/gemini-3-8-flash/
  - https://developers.google.com/workspace/guides/configure-mcp-servers
  - https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server
  - https://docs.cloud.google.com/mcp/supported-products
---

# Antigravity extra Google access

**Summary:** The extra Google path is a signed-in Google AI plan quota for
Gemini 3.8 Flash. It is not a new Ads, GTM, or Search Console entitlement.

## What is live on this machine, 2026-09-10

- Antigravity 2.12.2 desktop running since 09:51 ET, model set to Gemini 3.8
  Flash (High). Session title: Dillon Mohr Operating Handoff.
- Gemini CLI 0.52.0 installed. Headless `gemini -m gemini-3.8-flash` uses the
  Google account session when API-key env vars are stripped.
- `agy` CLI is not installed. Official Windows install would register
  `%LOCALAPPDATA%\agy\bin`. Not required while Gemini CLI works.
- Antigravity global MCP file exists and is empty. That is correct until Dillon
  names a Workspace or Cloud MCP identity.
- OmniRoute has no Google provider connected.
- Cursor picker Gemini 3.8 Flash is a different meter and was spend-limited
  during this session. Do not spawn it from Cursor. Monitor the desktop
  Antigravity window instead.

## Ranked extra surfaces versus Cursor plus the Ads probe

1. **Google-account Gemini 3.8 Flash quota.** Real extra. Five-hour plus weekly
   plan meter. Do not set Antigravity CLI `modelProvider` to `gemini` or the
   account session is skipped.
2. **Official Workspace remote MCP.** Gmail, Drive, Docs, Sheets, Slides,
   Calendar, Chat, People. Developer Preview plus OAuth client plus redirect
   `https://antigravity.google/oauth-callback`. Off until Dillon enrolls.
3. **Official Cloud remote MCP plus ADC.** BigQuery, Cloud Run, Quotas, and
   similar. Ads, GTM, and Search Console are not in that catalog. No ADC today.
4. **Official Ads MCP.** Read-only GAQL. Same Explorer Access as the existing
   local probe. No new rights. Do not accept Customer Data Terms. Do not revive
   Composio.
5. **3.8 Flash built-in tools.** Search grounding, Maps grounding, URL context,
   computer use preview. Model tools, not account APIs.
6. **Isolated Antigravity Chrome.** Separate cookies. Empty until someone signs
   in there. Not the persistent Chrome Google session.
7. **GTM.** No official MCP. Still waiting on Dillon's consent for Cloud project
   `150963436905`.
8. **Search Console.** No official MCP. Cursor already covers this elsewhere.

## What was configured

- Headless wrapper: `.codex/tools/Invoke-Gemini38Flash.ps1`
- Cursor MCP server: `.codex/tools/gemini-cli-control/`
- Cursor rule: `.cursor/rules/antigravity-google-access.mdc` (not always-apply)
- Hermes Cursor bridge gained a `gemini-3.8` route. That route is still Cursor
  quota, not the Google account meter.

## Do not

- Treat `GEMINI_API_KEY` or the `gemini:antigravity` session blob as the 3.8
  Flash path. Earlier canaries returned 400 / not-live.
- Fill Antigravity `mcp_config.json` without an exact identity and project.
- Sign the isolated Chrome profile into Google without an exact ask.
- Use Antigravity to send, publish, deploy, or mutate ads.
