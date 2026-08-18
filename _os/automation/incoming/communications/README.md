# Daily communication run envelopes

The scheduled read-only Gmail and Slack collector writes one curated JSON run
envelope here, validates it against
`12_Brain/schemas/daily-communication-run.json`, and then runs:

```powershell
node _os/automation/bin/communication-ingest.js --from <run.json>
```

Envelopes contain verified summaries, source locators, route decisions, and
next safe actions. They must never contain raw message bodies, credentials,
tokens, cookies, one-time codes, recovery material, payment-card data, or an
external-send instruction.
