# Queue

Append-only JSONL work items written by `_os/automation`.

Each line:

```json
{"ts":"2026-07-29T00:00:00.000Z","automation_id":"discover-qualify","action":"enqueue_build","prospect_id":"...","score":82,"payload":{}}
```

Humans (and Tier-2 systems) read this; nothing here sends outbound messages.
