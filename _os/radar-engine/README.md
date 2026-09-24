# Prospect Radar V2

Evidence-backed free SEO, AI/AEO, and marketing audit engine for Momentum 360.
This extends the existing radar. It does not replace OSM discovery, Places
enrichment, Tier 0/1 audits, Site Quality Score, or Opportunity Score.

## What it wraps

| Existing module | Role |
|---|---|
| `_os/automation/lib/site-audit.js` | Tier 0/1 evidence |
| `_os/automation/lib/site-grader.js` | Site Quality Score + hard faults |
| `_os/automation/lib/opportunity.js` | Opportunity Score + v1 routing |
| `_os/automation/lib/radar.js` | Priority / geo weight |
| `_os/automation/lib/contacts.js` | Own-site contact discovery |
| `_os/automation/lib/contact-store.js` | Private contact separation |
| `_os/automation/lib/places.js` | Listing identity (when a key exists) |
| `_os/automation/lib/net.js` | SSRF / public-URL guard |
| `_os/automation/lib/brand.js` | NeedMomentum tokens |
| `_os/automation/lib/aeo-trust.js` | Schema / robots helpers |
| `_os/automation/lib/clients.js` | Current-client suppression |

## Local run

Private synthetic staging sets `RADAR_V2_STAGING=true` to label the intake form and health response. Keep all delivery flags off. Every parsed POST body is limited to 64 KiB, including chunked requests; oversized requests receive HTTP 413 before processing.

```bash
# Optional Postgres
docker compose -f _os/radar-engine/docker-compose.yml up -d
export DATABASE_URL=postgres://radar:radar@127.0.0.1:5433/radar_v2
node --experimental-strip-types _os/radar-engine/bin/radar-v2.js migrate

# In-memory vertical slice (no Postgres required)
node --experimental-strip-types _os/radar-engine/bin/radar-v2.js slice --fixture cedar-ridge-hvac

# Tests
node --experimental-strip-types --test _os/radar-engine/tests/*.test.ts

# Existing radar suite (regression)
node --test _os/automation/tests/site-grader.test.js _os/automation/tests/automation.test.js
```

Copy `_os/radar-engine/.env.example` to a gitignored `.env`. All write/send
flags default off. The kill switch defaults on.

Postgres writes are typed (JSONB objects, text arrays) and job claiming uses
`FOR UPDATE SKIP LOCKED`. `createStore` hydrates from Postgres on boot. Tests
and the default slice still run in memory when `DATABASE_URL` is unset.
Playwright is optional for PDF/screenshots:

```bash
cd _os/radar-engine && npm install --no-save playwright@1.56.1
NODE_PATH=_os/radar-engine/node_modules node --experimental-strip-types _os/radar-engine/bin/capture-ui.js
```

## Privacy

Submissions, contacts, approvals, and bookings belong in PostgreSQL, never in
tracked JSON. Report binaries in `12_Brain/private/radar-engine/` are gitignored.
Fixture output uses fictional businesses only.

Set `RADAR_V2_FIELD_KEY` to 32-byte hex to encrypt intake and contact columns
at rest (AES-256-GCM, `enc:v1:` prefix). An invalid key fails closed. Empty
means plaintext in Postgres (tests and local memory store).

```bash
node --experimental-strip-types _os/radar-engine/bin/radar-v2.js retain
```

Retention revokes expired report URLs and anonymizes intake/contact rows older
than `RADAR_V2_RETENTION_DAYS`. Live outbound flags stay off.
