---
name: slack-intake
description: Read boss and client requests from Slack, classify them, and file structured task notes into the vault inbox. Run every morning before am-report, or on demand.
---

# Slack Intake

Turn what the bosses and clients ask for in Slack into structured, actionable vault tasks. Requires the Slack MCP connection (available in Cursor cloud agents and any session with Slack MCP configured). If Slack tools aren't available, stop and say so; don't fabricate messages.

## Channels to scan

Priority channels (scan every run, last 24h of messages, or since the last intake file if older):

- `#360marketing` (C06CL0R09A4) — main marketing lane, Sean's requests
- `#momentumsites` (C1CFQBC79) — website builds and site work, Mac's requests
- `#web-dev-hosting-dns` (C8NF1N3NH) — hosting, DNS, technical site issues
- `#content-media` (C01SPGA9C1F) — content and creative requests
- `#kimberly-james-bridal` (C0530MVK371) — KJB client channel (remember the CC rule in `System/writing-rules.md`)

Also run one message search for mentions of Dillon across the workspace to catch requests in channels not listed here.

## Steps

1. Read each priority channel (last 24h). Read thread replies on anything that looks like a request.
2. Classify every message that asks for something into one of:
   - **website-build** — new site, redesign, landing page. These feed `/site-factory`.
   - **ad-task** — campaign changes, budgets, creative swaps
   - **report** — performance numbers, client reporting. These feed `/client-report`.
   - **content** — blogs, social, copy
   - **question** — needs an answer from Dillon, no artifact
   - **fyi** — no action needed, skip unless it changes a client's status
3. For each actionable item, write one note to `00_Inbox/slack/YYYY-MM-DD-<slug>.md`:

```markdown
---
source: slack
channel: "#momentumsites"
requested_by: Mac Frederick
permalink: <message permalink>
type: website-build
client: "[[01_Clients/<Client>|<Client>]]"
status: new
due:
---

# <one-line summary of the ask>

**Exact ask:** <quote the message>

**Context:** <thread context, links, attachments mentioned>

**Suggested next step:** <e.g. "Run /site-factory with this brief" or "Draft reply for approval">
```

4. Match requests to existing clients in `01_Clients/` by name; link with a wikilink. Unknown business names are prospects: note them as `client: prospect — <name>`.
5. Write a run summary to `Daily-Briefs/slack-intake-YYYY-MM-DD.md`: counts by type, the top 3 most urgent asks with who asked and when, and anything ambiguous that needs Dillon's judgment.
6. De-dupe: if a note for the same permalink already exists in `00_Inbox/slack/`, skip it.

## Hard rules

- **Read and draft only.** Never post to a channel, never reply, never react. Posting is Tier 2 and needs Dillon's explicit approval per request. Drafting a reply INSIDE the vault note is fine and encouraged.
- Never mark anything done in Slack.
- Anything from `#kimberly-james-bridal`: flag the CC requirement from `System/writing-rules.md` in the note.
- Requests about Align HCM aren't Momentum 360 work; file them but tag `type: fulltime-job`.
