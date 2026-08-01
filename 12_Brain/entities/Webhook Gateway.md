---
tags: [entity, infrastructure, webhook]
created: 2026-08-01
status: active
source: [[12_Brain/entities/Hermes]]
---

# Webhook Gateway

An authenticated local webhook receiver runs on port 8644 behind a temporary Cloudflare tunnel.

## Status

**Active** — gateway running, tunnel established, signed webhooks enabled.

## Configuration

### Local Gateway
- **Port:** 8644
- **Host:** 127.0.0.1
- **Process:** Running in tmux session `webhook-gateway`
- **Server:** `_os/webhook-gateway.js`

### Public access
- **Tunnel Type:** Cloudflare Quick Tunnel (temporary, no auth required)
- **Process:** Running in tmux session `cloudflare-tunnel`
- **Uptime:** No guarantee (quick tunnel for development/testing)

Quick-tunnel URLs change after restart. Read the current URL from the tunnel
session; for production, migrate to an authenticated named tunnel.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check — returns `{"status":"healthy","timestamp":"..."}` |
| `/webhook/{event-type}` | POST | Authenticated JSON receiver |

## Authentication

### Webhook Secret
- **Location:** `12_Brain/private/webhook-secret.txt` (gitignored)
- **Format:** 64-character hex string (256-bit)
- **Usage:** Required HMAC-SHA256 signature verification

### Signature Verification
Send webhooks with signature in header:
```
X-Webhook-Signature: sha256=<hmac_hex>
```
Or:
```
X-Hub-Signature-256: sha256=<hmac_hex>
```

HMAC is computed over the exact raw request body:
`HMAC-SHA256(webhook_secret, request_body)`.

## Logging

- **File:** `12_Brain/state/webhook-log.json`
- **Format:** JSON array of events
- **Retention:** Last 100 webhooks
- **Data stored:** Timestamp, event type, body
- **Excluded:** Request and signature headers
- **Git:** Runtime log is ignored because payloads may contain private data

## Operations

### Check status
```bash
# Health check
curl "$PUBLIC_BASE_URL/health"

# View logs
jq . 12_Brain/state/webhook-log.json
```

### Restart gateway
```bash
tmux -f /exec-daemon/tmux.portal.conf kill-session -t webhook-gateway
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s webhook-gateway -c "$PWD"
tmux -f /exec-daemon/tmux.portal.conf send-keys -t webhook-gateway:0.0 'node _os/webhook-gateway.js' C-m
```

### Restart tunnel
```bash
tmux -f /exec-daemon/tmux.portal.conf kill-session -t cloudflare-tunnel
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s cloudflare-tunnel -c "$PWD"
tmux -f /exec-daemon/tmux.portal.conf send-keys -t cloudflare-tunnel:0.0 'cloudflared tunnel --url http://localhost:8644' C-m
```

### View live logs
```bash
# Gateway logs
tmux -f /exec-daemon/tmux.portal.conf attach -t webhook-gateway

# Tunnel logs
tmux -f /exec-daemon/tmux.portal.conf attach -t cloudflare-tunnel
```

## Migration to Production

When ready for production:

1. Create a Cloudflare account
2. Install cloudflared with authentication: `cloudflared tunnel login`
3. Create a named tunnel: `cloudflared tunnel create webhook-gateway`
4. Configure DNS routing via Cloudflare dashboard
5. Update tunnel command to use named tunnel
6. Set up tunnel as a system service

See: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps

## Related

- [[Hermes]] — Previous webhook implementation (now orphaned)
- [[D.I.L.L.O.N. OS]] — Main OS dashboard (port 4242)

