# Grok run envelopes

The daily collector writes one JSON file per completed Grok automation run here
before calling `grok-ingest.js`.

- Follow `12_Brain/schemas/grok-run.json`.
- Never include passwords, tokens, cookies, one-time codes, private messages, or raw
  personal identifiers.
- Preserve source URLs and coverage exactly; do not infer missing evidence.
- Successfully ingested files may remain as an audit trail because ingestion is
  content-hash idempotent.
