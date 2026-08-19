# Pickup — 138-site unslop

Paused: 2026-08-19T04:50Z
Resume: 2026-08-20T09:00 America/New_York

```bash
git checkout cursor/prospect-unslop-collages-56f2
node --test automation/prospect-unslop/test/intent.test.js
# After Firecrawl fills land in harvest/<slug>/photos/:
node automation/prospect-unslop/run.js
node automation/prospect-unslop/qa-batch.js
```

Needs-gen official URLs: `pickup-needs-urls.json` (91 rows).
Green receipts resume automatically unless `--fresh`.
Sheet Fixed? only after `qa-batch.js` reports the row ready.
