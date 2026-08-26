# IMMOHRTAL website analytics

## Production properties

- Google Analytics 4 property: `IMMOHRTAL Marketing Solutions Website`
- Web stream: `IMMOHRTAL Production Website`
- Measurement ID: `G-25X07BBG4R`
- Vercel Web Analytics: enabled as the first-party pageview source

## Event contract

| Event | Trigger | Parameters | GA4 key event |
| --- | --- | --- | --- |
| `page_view` | GA4 configuration on each page | Standard GA4 page fields | No |
| `booking_started` | Click to the Google Calendar booking destination | `link_text`, `source`, `schema_version` | No; this is intent, not a completed appointment |
| `email_clicked` | Click on an email link | `link_text`, `source`, `schema_version` | No; this is intent, not a completed lead |
| `article_engaged` | An insight visitor remains for 30 seconds and reaches 50 percent scroll depth | `content_name`, `content_group`, `engagement_threshold`, `schema_version` | No |

Enhanced Measurement owns ordinary scrolls and outbound clicks. The custom implementation does not duplicate those names. No email address, form value, user ID, or other personal data is sent as an event parameter.

## Privacy defaults

The production tag defaults advertising, personalization, functionality, and analytics storage to denied. Google signals and ad personalization are disabled, and ads data redaction is enabled. A visitor can explicitly allow analytics through the on-page analytics control and reverse that choice later. Vercel Web Analytics remains the cookie-free first-party traffic baseline.

## Reporting interpretation

`booking_started` and `email_clicked` are micro-conversions. They must not be reported as appointments, leads, or revenue. A completed-lead or completed-appointment key event requires a verified completion signal from the destination system before it is added.
