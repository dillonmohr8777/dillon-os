# Pickup — 138-site unslop

Finished: 2026-08-19 (pickup, not the Thursday 9 AM block)

```bash
git checkout cursor/prospect-unslop-collages-56f2
node --test automation/prospect-unslop/test/intent.test.js
node automation/prospect-unslop/qa-batch.js
```

QA: 136 ready, 0 needsGen, 2 dropped, 0 collisions, 0 mode mismatches.
Sheet `Fixed?` written for QA-green rows only. Duplicates `#23` and `#42` stay blank.
Do not deploy. Do not send mail.
