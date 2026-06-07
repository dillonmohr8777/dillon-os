# Lane: intel-slack

## Goal

Capture Slack signals Dillon may have missed: DMs, @mentions, client or M360 channels.

## Tools

Use Slack MCP if connected. Search recent messages (48–72h). Prioritize:

- Unread DMs
- @dillon or display-name mentions
- Channels tied to active clients (Bar Crawl, NKCDC, M360 internal, Replenish/Fresh Blends)

## Rules

- No posting to Slack in this lane.
- Link message to client when identifiable.
- If Slack MCP unavailable, return UNAVAILABLE and suggest checking mobile Slack for Priority Stack.

## Output template

```markdown
## intel-slack

### Needs response
• Channel/DM — summary — age

### FYI (no reply required)
• ...

### MCP status
• OK | UNAVAILABLE — reason
```
