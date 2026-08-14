/**
 * Print-ready 6x4 postcard HTML. QR on the right, offer on the left.
 * Address stays blank unless a runtime (gitignored) mail merge supplies it.
 * mail_ready is never implied by generating this file.
 */
'use strict';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mailPieceHtml(row) {
  const name = esc(row.business_name || row.name || 'Your business');
  const vertical = esc(row.vertical || '');
  const prospectId = esc(row.prospect_id || '');
  const qrSvg = row.qrSvg || '';
  const live = esc(row.live_site || row.qr_target_url || '');
  const address = esc(row.address || '');
  const cityLine = esc(row.city_line || '');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex,nofollow">
<title>Mail proof · ${name}</title>
<style>
  @page { size: 6in 4in; margin: 0; }
  html, body { margin: 0; background: #e8e4da; }
  .card {
    width: 6in; height: 4in; background: #f7f3ea; color: #1a1a1a;
    display: grid; grid-template-columns: 1fr 1.7in; overflow: hidden;
    font-family: "Iowan Old Style", Palatino, Georgia, serif;
  }
  .copy { padding: 0.28in 0.3in 0.24in; display: flex; flex-direction: column; }
  .kicker { font: 600 9px/1.2 ui-monospace, monospace; letter-spacing: .16em; text-transform: uppercase; color: #7a3b12; }
  h1 { font-size: 22px; line-height: 1.1; margin: 10px 0 8px; letter-spacing: -0.02em; }
  p { margin: 0 0 8px; font-size: 12px; line-height: 1.35; }
  .cta { margin-top: auto; font: 600 10px/1.3 ui-monospace, monospace; letter-spacing: .04em; text-transform: uppercase; }
  .qr {
    background: #1a1a1a; color: #f7f3ea; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 8px; padding: 0.18in;
  }
  .qr svg { width: 1.28in; height: 1.28in; background: #fff; padding: 4px; }
  .qr span { font: 600 8px/1.2 ui-monospace, monospace; letter-spacing: .12em; text-transform: uppercase; }
  .addr { font-size: 11px; color: #444; min-height: 2.4em; }
  .hold { font: 600 8px ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; color: #7a3b12; margin-top: 6px; }
  @media print { body { background: #fff; } }
</style>
</head>
<body>
<article class="card">
  <div class="copy">
    <div class="kicker">Momentum 360 · ${vertical || 'Philadelphia'} · ${prospectId}</div>
    <h1>We built ${name} a homepage.</h1>
    <p>Scan the code. If it feels like the business, book fifteen minutes. Nothing goes live until you say so.</p>
    <div class="addr">${address || 'Address held until mail approval'}${cityLine ? `<br>${cityLine}` : ''}</div>
    <div class="cta">Scan → see the site → book the call</div>
    <div class="hold">mail_ready = hold · proof only</div>
  </div>
  <div class="qr">
    ${qrSvg}
    <span>Scan me</span>
  </div>
</article>
<!-- live: ${live} -->
</body>
</html>`;
}

module.exports = { mailPieceHtml };
