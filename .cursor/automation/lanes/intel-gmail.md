# Lane: intel-gmail

## Goal

Surface unread and unanswered client email threads that need Dillon's attention today.

## Tools

Use Gmail MCP if connected (`gmail_search_messages`, read thread metadata). Search patterns:

- `is:unread newer_than:3d`
- Client domains from `01_Clients/*/contact-info.md` and `overview.md` (`contact_email` frontmatter)
- Names: Andy (Bar Crawl), Anthony (NKCDC), John Belaska (Omega), Mike Ross (CCA), Mac/Sean/Melissa (M360 leadership per `System/m360-leadership-notes.md`)

## Rules

- Note thread age in hours.
- Flag if Dillon is direct recipient vs CC-only.
- Do not draft sends; list only.
- Apply `System/writing-rules.md` awareness for client-specific CC rules when noting KJB threads.

## Output template

```markdown
## intel-gmail

### Immediate (reply today)
• Client — subject snippet — age — owner (Dillon vs monitor)

### This week
• ...

### MCP status
• OK | UNAVAILABLE — reason
```
