# HubSpot Agent — token route

Codex-independent HubSpot blog publisher for the Align HCM / GEO content system.
Talks straight to the HubSpot CMS Blog Posts v3 API with a Private App token, so
publishing and scheduling work from anywhere — no ChatGPT/Codex connector needed.

## Why this exists

The Claude HubSpot **connector** (OAuth) covers CRM, analytics, and landing pages,
but its tool surface does **not** include blog-post publishing or scheduling —
`BLOG_POST` write is `NOT_AVAILABLE`. That is the core job of the content agent, so
that one capability runs through this token-route script instead.

Division of labor:
- **Connector (Claude, live):** contacts, companies, deals, tickets, tasks, notes,
  campaign + content analytics, landing-page create/edit/publish.
- **This script (token):** blog post create / schedule / publish.

## One-time setup

1. In HubSpot: **Settings → Integrations → Private Apps → Create a private app**.
2. Name it e.g. `dillon-hubspot-agent`. Under **Scopes**, enable **`content`**
   (Content Operations — manage blog posts, landing pages, website pages).
3. Create the app and copy the access token (`pat-na2-...`).
4. Provide the token as an environment variable — **never commit it, never paste
   it into a chat**:
   - Local: `cp .env.example .env` and fill in the value, or `export` it.
   - Claude Code web / CI: add `HUBSPOT_PRIVATE_APP_TOKEN` as an environment
     **secret** on the environment, not in the repo.

## Verify

```bash
python3 hubspot_agent.py whoami        # confirms the token + shows the portal
python3 hubspot_agent.py list-blogs    # find the contentGroupId (blog id)
python3 hubspot_agent.py list-authors  # find the blogAuthorId
```

## Publish flow (every write is dry-run by default)

```bash
# 1. Draft a post from a content JSON file (see content/example-post.json)
python3 hubspot_agent.py create-post --file content/my-post.json          # dry run
python3 hubspot_agent.py create-post --file content/my-post.json --confirm # execute

# 2. Schedule an existing draft for a future date
python3 hubspot_agent.py schedule-post --id 123 --publish-date 2026-07-25T13:00:00Z --confirm

# 3. Or schedule a whole batch (skips entries missing id/date)
python3 hubspot_agent.py schedule-batch --file schedule.json --confirm

# 4. Publish immediately
python3 hubspot_agent.py publish-post --id 123 --confirm
```

Without `--confirm`, the script prints the exact request it *would* send and stops.
This enforces the operating rule: **draft first, Dillon approves the send.**

## Operating rules

The content strategy and scheduling discipline live in
[`GEO_OPERATING_SYSTEM.md`](./GEO_OPERATING_SYSTEM.md). Read it before scheduling:
only schedule posts whose content **and assets** are complete; leave
missing-asset posts unscheduled.

## Notes / limits

- Requires Node/Python only for `python3` — no pip installs (uses stdlib urllib).
- Social-media scheduling is **not** included: HubSpot's social API depends on
  Marketing Hub tier and is separate from the CMS blog API. Add it as a follow-up
  once the tier/scope is confirmed.
- Rate limit: private apps allow 100 requests / 10s — batch jobs stay well under.
