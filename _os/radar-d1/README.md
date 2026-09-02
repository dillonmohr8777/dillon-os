# Prospect Radar D1 backend

Read-only Cloudflare Worker + D1 API and dashboard for the Prospect Radar.

## Files

- `schema.sql` — `prospects`, `audits`, `builds` tables + indexes.
- `import.mjs` — CSV -> batched `INSERT OR REPLACE` SQL files (no network).
- `worker.js` — Worker: `/`, `/api/prospects`, `/api/prospects/:slug`.
- `wrangler.toml` — binds D1 as `RADAR`; `database_id` set to `dillon-radar`.

## Deploy steps (approval-gated — do not run without sign-off)

```bash
cd _os/radar-d1
npx wrangler d1 execute dillon-radar --remote --file=./schema.sql
node import.mjs ../../12_Brain/state/radar/build-queue.csv ./out
for f in ./out/*.sql; do
  npx wrangler d1 execute dillon-radar --remote --file="$f"
done
npx wrangler deploy
```

## Notes

- The D1 database `dillon-radar` and schema already exist and are seeded
  with the first 50 prospects (see `System/approval-queue.md`).
- `wrangler deploy` of the Worker is approval-gated. Do not deploy without
  explicit sign-off — see the approval queue entry.
- Re-running `import.mjs` + the load loop is idempotent (`INSERT OR REPLACE`
  keyed on `slug`).
