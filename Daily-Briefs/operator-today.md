# Operator Brief 2026-05-25

## Coverage
• Umbrella workflow `dillon-os-operator` initialized on branch `cursor/competitive-task-workflow-3836`.
• Legacy per-routine automations should be disabled after three successful daily runs.
• Gmail/Slack MCP: verify connected on next live run.

## Urgent (act today)
• **Bar Crawl USA** — Resolve 2 disapproved ads (Halloween / Fall Cocktail Crawl). See `System/urgent-replies.md`.
• **NKCDC** — Launch blocked; Anthony unresponsive. Mac followed up 2026-04-15.
• **Hardwood Artisan** — Billing card update outstanding.

## Client pulse
• See `System/claude-memory-sync.md` for full active roster and pending deliverables (last sync 2026-04-15).
• Re-run `intel-vault-pulse` on next automation pass to refresh `last_touched` / `due` fields.

## Stalled (7+ days)
• Vault-wide: client notes lack consistent `last_touched` frontmatter; pulse cannot rank stall order until seeded.

## Sessions & Codex
• Unified operator replaces: nightly-client-pulse, gmail-to-vault-digest, vault-integrity-sync, chat-to-vault-sync, bok-law-social-content, linkedin-growth-engine, book-site-seo-sweep.
• Book agent graph available on branch `claude/agent-architecture-design-7oiAe`.

## Content shipped this run
• Workflow documentation and `.cursor/agents/` parallel lane definitions (infrastructure only).

## Tomorrow priority stack
1. Connect Gmail + Slack MCP; run first full `dillon-os-operator` pass.
2. Bar Crawl disapprovals — route to Google Ads Agent via M360 Router.
3. Add `next_action`, `due`, `last_touched` to top 5 M360 client notes.
