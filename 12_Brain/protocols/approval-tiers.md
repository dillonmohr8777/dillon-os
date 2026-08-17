# Approval & safety protocol

Mirrors `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`.

| Tier | Allowed | Examples in this layer |
|---|---|---|
| 0 | Read, analyze, draft, QA, build artifacts, append vault/queue/state | Grok ingest, experiment proposals, maker/checker evidence, MCP Inspector tools/list, AEO gate, frontmatter validation, site-health dry-run, qualify scoring |
| 1 | Reversible vault writes after one batch approval | frontmatter repair writes, prospect note drafts already written as Tier 0 drafts |
| 2 | Outbound / irreversible | email send, Slack post, public deploy, mail merge, spending, credential use |

## Hard blocks in `_os/automation`

- No SMTP, no Slack write APIs, no Indeed live scrape, no Netlify/Vercel deploy calls
- `--live` on site-health only does GET (and optional marked canary POST when explicitly requested)
- Qualify never sets status past `scored` / `queued_build` / `suppressed` without a human flipping mail_ready downstream in #226 CSVs
- Grok/browser research may be read and captured, but it may never like, reply, repost, send, connect, install, or authorize
- Maker/checker runs require distinct identities; a human gate is required by default
- MCP candidates with any pending check remain sandbox-only; failed checks or critical permissions are rejected
- A failing AEO/trust gate blocks website deployment
