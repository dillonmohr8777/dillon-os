/**
 * Gatekeep landing: QR target between the mail piece and the sales call.
 * Never auto-books. Form posts to the local HUD /api/outreach/book.
 */
'use strict';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gatekeepHtml(row) {
  const name = esc(row.business_name || row.name || 'your business');
  const prospectId = esc(row.prospect_id || '');
  const batchId = esc(row.batch_id || '');
  const live = esc(row.live_site || '#');
  const vertical = esc(row.vertical || '');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Built for ${name}</title>
<style>
  :root { --bg:#0b0d12; --ink:#f2f5fb; --muted:#9aa5b8; --accent:#b6f36d; --line:#ffffff22; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 "Space Grotesk", system-ui, sans-serif; }
  .wrap { width:min(720px, calc(100% - 32px)); margin: 48px auto 80px; }
  .k { font:600 11px/1 ui-monospace,monospace; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); }
  h1 { font-size: clamp(2rem, 6vw, 3.4rem); line-height:1.05; letter-spacing:-.03em; margin:14px 0 12px; }
  p { color:var(--muted); max-width: 42ch; }
  .row { display:flex; flex-wrap:wrap; gap:12px; margin: 28px 0; }
  a.btn, button {
    min-height:48px; padding:0 18px; border-radius:12px; border:1px solid var(--line);
    background:transparent; color:var(--ink); font:600 13px/1 ui-monospace,monospace;
    letter-spacing:.04em; text-transform:uppercase; text-decoration:none; display:inline-flex; align-items:center; cursor:pointer;
  }
  a.primary, button[type=submit] { background:var(--accent); color:#111; border-color:var(--accent); }
  form { display:grid; gap:10px; margin-top:12px; padding:18px; border:1px solid var(--line); border-radius:16px; }
  input, textarea {
    min-height:44px; padding:10px 12px; border-radius:10px; border:1px solid var(--line);
    background:#ffffff0a; color:var(--ink); font:15px/1.4 system-ui,sans-serif;
  }
  .ok { color:var(--accent); display:none; }
  footer { margin-top:40px; color:var(--muted); font-size:12px; }
</style>
</head>
<body>
<main class="wrap">
  <div class="k">${vertical || 'Philadelphia'} · ${prospectId}</div>
  <h1>We built this for ${name}.</h1>
  <p>This page is the gate in front of the sales call. Look at the homepage. If it feels right, book fifteen minutes. Nothing is live, mailed, or billed from this page.</p>
  <div class="row">
    <a class="btn primary" href="${live}">Open the homepage</a>
    <a class="btn" href="#book">Book the call</a>
  </div>
  <form id="book" method="post" action="/api/outreach/book">
    <input type="hidden" name="prospect_id" value="${prospectId}">
    <input type="hidden" name="batch_id" value="${batchId}">
    <input type="hidden" name="business_name" value="${name}">
    <label>Your name<input name="name" required autocomplete="name"></label>
    <label>Best number or email<input name="callback" required></label>
    <label>Anything we should know<textarea name="note" rows="3"></textarea></label>
    <button type="submit">Request the 15-minute call</button>
    <p class="ok" id="ok">Got it. A human will confirm — this form does not auto-send outreach.</p>
  </form>
  <footer>Private staging. Batch ${batchId}. Scan tracked. Call not booked until a person confirms.</footer>
</main>
<script>
const form=document.getElementById('book');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(form).entries());
  try {
    const r = await fetch(form.action, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('hold');
    document.getElementById('ok').style.display='block';
    form.querySelector('button').disabled = true;
  } catch {
    document.getElementById('ok').textContent = 'Could not reach the local HUD. Leave the tab open and tell Dillon the prospect id ${prospectId}.';
    document.getElementById('ok').style.display='block';
  }
});
</script>
</body>
</html>`;
}

function trackedUrl(base, slug, batchId, prospectId) {
  const root = String(base || '').replace(/\/$/, '');
  const q = `utm_source=directmail&utm_medium=qr&utm_campaign=${encodeURIComponent(batchId)}&utm_content=${encodeURIComponent(prospectId)}`;
  if (!root) return '';
  return `${root}/gate/${slug}/?${q}`;
}

function fallbackUrl(liveSite, batchId, prospectId) {
  if (!liveSite) return '';
  const join = liveSite.includes('?') ? '&' : '?';
  return `${liveSite}${join}utm_source=directmail&utm_medium=qr&utm_campaign=${encodeURIComponent(batchId)}&utm_content=${encodeURIComponent(prospectId)}`;
}

module.exports = { gatekeepHtml, trackedUrl, fallbackUrl };
