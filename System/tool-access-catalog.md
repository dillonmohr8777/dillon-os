# Tool and Access Catalog

## Shared operating surfaces

- GitHub account: `dillonmohr8777`; Cursor account currently has visibility to 16 repositories listed in `System/cursor-integration.md`.
- Meta Muse Spark 1.1: primary Hermes model; use through Hermes rather than copying its provider credential into Cursor.
- Cursor: use native Grok 4.5 Extra High for large-stack analysis and implementation.
- Composio MCP: authenticated application gateway. Connected services must be checked at runtime because connection state can change.
- OpenAI Developer Docs MCP: official technical documentation lookup.
- WordPress.com MCP: WordPress.com operations, subject to approval boundaries.

## Cursor MCP status (verified 2026-07-12)

| Server | Status | Notes |
|--------|--------|-------|
| `plugin-ecc-github` | ready | Tested: repo search OK |
| `plugin-ecc-context7` | ready | Tested: library resolve OK |
| `plugin-ecc-exa` | ready | Tested: web search OK |
| `user-openaiDeveloperDocs` | ready | Tested: doc search OK |
| `plugin-ecc-playwright` | ready | Not exercised this pass |
| `plugin-ecc-memory` | ready | Not exercised |
| `user-composio` | **needsAuth** | Gmail/Drive/Calendar blocked in Cursor until OAuth |
| `user-wordpress-com` | **needsAuth** | WP.com blocked until OAuth |
| `plugin-slack-slack` | **needsAuth** | Slack blocked until OAuth |

Hermes `config.yaml` has Composio MCP enabled separately; do not assume Cursor and Hermes share OAuth sessions.

## Known connector surface

The wider local Codex installation includes connectors/plugins for GitHub, Gmail, Google Calendar, Google Drive, Slack, HubSpot, Airtable, Notion, Atlassian, Cloudflare, Netlify, Vercel, Sentry, Figma, Canva, Stripe, QuickBooks, Shopify, Intercom, Linear, PostHog, Mixpanel, Calendly, Wix, Box, Outlook, Teams, SharePoint, and other specialist tools. Installation does not prove that an account is authenticated. Cursor must use the MCP tool's live connection status as the source of truth.

## Security boundary

- Credentials remain in their existing local credential stores or OAuth sessions.
- Never copy raw keys, cookies, tokens, card data, or passwords into Git, Cursor rules, chat, logs, or generated artifacts.
- Prefer read-only inventory and drafts. Require explicit approval for external or irreversible changes.

## Skills and plugins

Codex skills are mirrored as global Cursor Agent Skills from `C:\Users\dillo\.codex\skills`. Cursor-native skills remain under `C:\Users\dillo\.cursor\skills-cursor`. Plugin capabilities that depend on the Codex host are documented here but are not falsely presented as executable Cursor plugins; portable MCP and skill content is used instead.
