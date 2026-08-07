# Site health report

Status: **fail**
Counts: {"total":5,"pass":2,"warn":1,"fail":2,"skipped":0}

## Ironic Ineptocracy book site (`book-ironicineptocracy`) — fail
- url: https://ironicineptocracy.com
- mode: live
- [ok] http_ok: HTTP 200
- [ok] viewport: viewport meta present
- [ok] tracking_hints: tracking hints: ga=true meta=false
- [FAIL] form_endpoint: form endpoint not found in markup: /api/dossier-leads

## Mohr Media (`mohr-media`) — pass
- url: https://themohrmedia.com
- mode: live
- [ok] http_ok: HTTP 200
- [ok] viewport: viewport meta present
- [ok] tracking_hints: tracking hints: ga=true meta=false

## IMMOHRTAL (`immohrtal`) — warn
- url: https://immohrtal-site.netlify.app
- mode: live
- [ok] http_ok: HTTP 200
- [ok] viewport: viewport meta present
- [FAIL] tracking_hints: no GA4/Meta pixel hints
- [ok] form_endpoint: form endpoint referenced: /

## Fixture healthy site (`fixture-healthy`) — pass
- url: fixture://healthy
- mode: fixture
- [ok] viewport: viewport meta present
- [ok] tracking_hints: tracking hints: ga=true meta=false

## Fixture broken form (`fixture-broken-form`) — fail
- url: fixture://broken-form
- mode: fixture
- [FAIL] viewport: missing viewport meta
- [FAIL] tracking_hints: no GA4/Meta pixel hints
- [FAIL] form_endpoint: form endpoint marked missing: /api/dossier-leads
