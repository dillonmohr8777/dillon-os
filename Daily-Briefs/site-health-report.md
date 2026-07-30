# Site health report

Status: **fail**
Counts: {"total":5,"pass":1,"warn":0,"fail":1,"skipped":3}

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

## Ironic Ineptocracy book site (`book-ironicineptocracy`) — skipped
- url: https://ironicineptocracy.com
- mode: dry-run-skip-live
- [ok] live_skipped: skipped in dry-run; pass --live to GET

## Mohr Media (`mohr-media`) — skipped
- url: https://themohrmedia.com
- mode: dry-run-skip-live
- [ok] live_skipped: skipped in dry-run; pass --live to GET

## IMMOHRTAL (`immohrtal`) — skipped
- url: https://immohrtal-site.netlify.app
- mode: dry-run-skip-live
- [ok] live_skipped: skipped in dry-run; pass --live to GET
