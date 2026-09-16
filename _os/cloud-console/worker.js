// Momentum Agent Console, cloud mirror.
//
// Read only Cloudflare Worker + D1 view of the agent roster, for when the
// desktop running _os/server.js is off (diagnosed power fault, see
// 12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis.md).
// Data is pushed here by _os/automation/bin/sync-cloud-console.js; nothing
// here ever writes back.
//
// Routes:
//   GET  /login       -> login page (public)
//   POST /api/login   -> {token} -> sets the momentum_hud cookie, rate limited
//   GET  /             -> the mirror page (auth gated)
//   GET  /api/agents  -> JSON, same shape as the local server's /api/agents
//   GET  /favicon.ico -> 204
//
// Auth mirrors _os/server.js exactly: shared secret in MOMENTUM_HUD_TOKEN
// (here a Worker secret, not an env var), cookie gated, timing safe compare,
// login rate limited. There is no POST /enabled route. This mirror cannot
// toggle anything, on purpose.

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;
// ponytail: per isolate in memory map, resets on cold start and does not
// coordinate across edge colos. Fine for a solo internal tool behind a
// shared secret; upgrade to a Durable Object if this ever needs a real
// global limiter.
const loginAttempts = new Map();

function loginRateLimited(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now - rec.windowStart > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return false;
  }
  rec.count += 1;
  return rec.count > LOGIN_MAX_ATTEMPTS;
}

const encoder = new TextEncoder();
// Cloudflare's documented safe-compare shape: never return early on a length
// mismatch (that leaks the secret's length through timing), compare the
// buffer against itself instead so the call always takes the same path.
function timingSafeEqual(a, b) {
  const aBytes = encoder.encode(String(a));
  const bBytes = encoder.encode(String(b));
  if (aBytes.byteLength !== bBytes.byteLength) return !crypto.subtle.timingSafeEqual(aBytes, aBytes);
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

function isAuthed(request, env) {
  if (!env.MOMENTUM_HUD_TOKEN) return true; // matches local: no secret set stays open
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)momentum_hud=([^;]+)/);
  return !!m && timingSafeEqual(m[1], env.MOMENTUM_HUD_TOKEN);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
function html(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
function safeParse(text) { try { return JSON.parse(text || '[]'); } catch { return []; } }

async function getAgents(env) {
  const { results } = await env.CONSOLE.prepare(
    `SELECT a.id, a.name, a.lane, a.function, a.audience, a.cadence, a.enabled, a.lifecycle, a.kind, a.outputs,
            r.run_id, r.started, r.ended, r.exit_code, r.status AS run_status, r.artifact, r.note
     FROM agents a LEFT JOIN runs r ON r.agent_id = a.id`
  ).all();
  const agents = results.map((row) => ({
    id: row.id,
    name: row.name,
    lane: row.lane,
    cadence: row.cadence,
    enabled: !!row.enabled,
    lifecycle: row.lifecycle,
    audience: row.audience || 'internal',
    function: row.function || 'unassigned',
    kind: row.kind || null,
    outputs: safeParse(row.outputs),
    last: row.run_id
      ? { run_id: row.run_id, started: row.started, ended: row.ended, exit_code: row.exit_code, status: row.run_status, artifact: row.artifact, note: row.note }
      : null,
  }));
  // Same ordering as the local server's agentsPayload(): running first, then enabled, then name.
  agents.sort((x, y) => {
    const xr = x.last && x.last.status === 'running';
    const yr = y.last && y.last.status === 'running';
    if (xr !== yr) return xr ? -1 : 1;
    if (x.enabled !== y.enabled) return x.enabled ? -1 : 1;
    return x.name.localeCompare(y.name);
  });
  return agents;
}

async function getSyncedAt(env) {
  const row = await env.CONSOLE.prepare('SELECT value FROM sync_meta WHERE key = ?').bind('last_synced_at').first();
  return row ? row.value : null;
}

const LOGIN_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Momentum Agent Console Mirror</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito+Sans:wght@400;700;800&display=swap');
  :root { --night:#0E1417; --paper:#FBF8F4; --gold:#E27113; --blue:#3897CC; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--night); color:var(--paper); font-family:'Nunito Sans',sans-serif; }
  form { width:min(360px,90vw); padding:2rem; border:1px solid #1A2226; background:#111A1E; border-radius:16px; }
  h1 { font-family:'Archivo Black',sans-serif; font-size:1.4rem; margin:0 0 .25rem; }
  p { color:#8A9296; font-size:.9rem; margin:0 0 1.5rem; }
  input { width:100%; padding:.75rem; border-radius:8px; border:1px solid #1A2226; background:var(--night);
    color:var(--paper); font-size:1rem; margin-bottom:1rem; }
  button { width:100%; padding:.75rem; border-radius:8px; border:none; background:var(--gold);
    color:#14181B; font-weight:800; font-size:1rem; cursor:pointer; }
  button:active { transform: translateY(1px); }
  #err { color:#e2544a; font-size:.85rem; min-height:1.2em; margin-top:.75rem; }
</style>
</head>
<body>
<form id="f">
  <h1>Momentum Agent Console Mirror</h1>
  <p>Enter the access token to view the last known agent roster.</p>
  <input id="tok" type="password" autocomplete="off" placeholder="Access token" autofocus>
  <button type="submit">Enter</button>
  <div id="err"></div>
</form>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = document.getElementById('tok').value;
  const err = document.getElementById('err');
  err.textContent = '';
  const r = await fetch('/api/login', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ token }) });
  if (r.ok) { location.href = '/'; } else { err.textContent = 'Wrong token.'; }
});
</script>
</body>
</html>`;

// Tokens copied from _os/public/index.html, hosted Claude Design project
// "Momentum Design System" 09b3bbc0-a8f7-4acc-88ae-8a47648d75a4 (v3 blue /
// white / gold). Literal values only, same as the local console.
function pageHtml(syncedAtIso) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Momentum Agent Console Mirror</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito+Sans:wght@400;700;800&display=swap">
<style>
  :root {
    --night:#03172e; --navy:#072d53; --blue:#1766ab; --gold:#efb928;
    --paper:#ffffff; --pale:#f0f5f9; --ink:#102d49; --muted:#52677c;
    --line:#d5e0e9; --paper-dim:#d5e4f1; --gold-hover:#ffcf54; --line-dark:rgb(255 255 255 / 14%);
    --display:"Archivo Black", sans-serif; --body:"Nunito Sans", sans-serif;
    --size-title:1.6rem; --size-label:14px; --size-note:13px; --size-micro:12px;
    --leading-control:1.5; --tracking-display:-.025em; --tracking-meta:.08em;
    --weight-body:400; --weight-nav:800; --weight-strong:900;
    --space-compact:8px; --space-control:12px; --space-detail:20px; --space-inset:24px; --space-panel:28px;
    --wrap-max:1440px; --wrap-gutter:clamp(16px, 4vw, 96px);
    --radius-control:8px; --radius-surface:14px; --radius-pill:24px;
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--pale); color:var(--ink); font-family:var(--body); font-size:var(--size-label);
    font-weight:var(--weight-body); line-height:var(--leading-control); -webkit-font-smoothing:antialiased; }
  #app { max-width:var(--wrap-max); margin:0 auto; }
  header { background:var(--night); color:var(--paper-dim); padding:var(--space-inset) var(--wrap-gutter); }
  .wm-1 { display:block; font-family:var(--display); font-weight:var(--weight-strong);
    font-size:clamp(1.9rem, 3.2vw, 2.7rem); line-height:1.05; letter-spacing:var(--tracking-display); color:var(--paper); }
  .wm-2 { display:block; margin-top:6px; font-size:var(--size-label); font-weight:var(--weight-nav);
    letter-spacing:.22em; text-transform:uppercase; color:var(--gold); }
  .band-foot { display:flex; flex-wrap:wrap; align-items:center; gap:var(--space-detail);
    margin-top:var(--space-detail); padding-top:var(--space-control); border-top:1px solid var(--line-dark);
    font-size:var(--size-micro); letter-spacing:var(--tracking-meta); text-transform:uppercase; color:var(--paper-dim); }
  .band-foot b { color:var(--paper); font-weight:var(--weight-nav); }
  .band-foot .synced { color:var(--gold); }
  main { padding:var(--space-panel) var(--wrap-gutter) var(--space-inset); display:grid; gap:var(--space-panel); }
  .notice { background:var(--paper); border:1px solid var(--line); border-left:4px solid var(--gold);
    border-radius:var(--radius-control); padding:var(--space-control) var(--space-detail);
    color:var(--muted); font-size:var(--size-note); }
  .notice b { color:var(--ink); }
  .panel-head { display:flex; align-items:baseline; gap:var(--space-control); margin-bottom:var(--space-control); }
  .panel-head h2 { font-family:var(--display); font-size:var(--size-title); color:var(--ink);
    letter-spacing:var(--tracking-display); margin-right:auto; }
  .roster { background:var(--paper); border:1px solid var(--line); border-radius:var(--radius-surface);
    padding:var(--space-panel); box-shadow:inset 0 -3px 0 var(--gold); }
  .roster-count { background:var(--navy); color:var(--paper); border-radius:var(--radius-pill);
    padding:5px 14px; font-size:var(--size-micro); font-weight:var(--weight-nav);
    letter-spacing:var(--tracking-meta); text-transform:uppercase; white-space:nowrap; }
  .agents-table { width:100%; border-collapse:collapse; }
  .agents-table th { text-align:left; color:var(--muted); font-size:var(--size-micro); font-weight:var(--weight-nav);
    letter-spacing:var(--tracking-meta); text-transform:uppercase;
    padding:0 var(--space-control) var(--space-compact); border-bottom:2px solid var(--ink); }
  .agents-table td { padding:11px var(--space-control); border-bottom:1px solid var(--line);
    color:var(--ink); font-size:var(--size-label); vertical-align:middle; }
  .agents-table td.c-cad, .agents-table td.c-last, .agents-table td.c-exit, .agents-table td.c-art, .agents-table td.c-en { color:var(--muted); }
  .agents-table .c-name { font-weight:var(--weight-nav); max-width:300px; }
  .agents-table .c-name, .agents-table .c-art, .agents-table .c-cad { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .agents-table .c-exit { text-align:right; font-variant-numeric:tabular-nums; }
  .agents-table tbody tr.off .c-name { color:var(--muted); font-weight:var(--weight-body); }
  .grp th { padding-top:var(--space-inset); border-bottom:1px solid var(--line); color:var(--ink); font-size:var(--size-note); }
  .grp th span { color:var(--muted); font-weight:var(--weight-body); letter-spacing:0; text-transform:none; margin-left:var(--space-compact); }
  .grp.split-row th { color:var(--muted); border-bottom:2px solid var(--line); padding-top:var(--space-panel); }
  .sub-tag { display:inline-block; margin-left:var(--space-compact); padding:1px 7px; border:1px solid var(--line);
    border-radius:var(--radius-pill); font-size:11px; font-weight:var(--weight-nav); letter-spacing:var(--tracking-meta);
    text-transform:uppercase; color:var(--muted); }
  .status-pill { display:inline-block; font-size:11px; font-weight:var(--weight-nav); letter-spacing:var(--tracking-meta);
    text-transform:uppercase; border-radius:var(--radius-pill); padding:3px 11px; white-space:nowrap;
    background:var(--paper); color:var(--muted); border:1px solid var(--line); }
  .status-pill::before { margin-right:6px; }
  .status-pill.ok { background:var(--pale); color:var(--ink); border-color:var(--line); }
  .status-pill.ok::before { content:"\\2713"; }
  .status-pill.failed { background:var(--night); color:var(--gold); border-color:var(--night); }
  .status-pill.failed::before { content:"\\0021"; }
  .status-pill.running { background:var(--gold); color:var(--night); border-color:var(--gold); }
  .status-pill.running::before { content:"\\25B6"; }
  .status-pill.skipped::before, .status-pill.never::before { content:"\\00B7"; }
  .roster-foot { display:flex; align-items:center; gap:var(--space-detail); flex-wrap:wrap;
    margin-top:var(--space-detail); padding-top:var(--space-detail); border-top:1px solid var(--line); }
  .roster-foot label { display:inline-flex; align-items:center; gap:6px; cursor:pointer; color:var(--muted); font-size:var(--size-micro); }
  .roster-foot .note { color:var(--muted); font-size:var(--size-micro); }
  footer { display:flex; flex-wrap:wrap; gap:var(--space-detail); justify-content:space-between;
    padding:var(--space-detail) var(--wrap-gutter) var(--space-panel); color:var(--muted); font-size:var(--size-micro);
    letter-spacing:var(--tracking-meta); text-transform:uppercase; border-top:1px solid var(--line); }
  @media (max-width: 760px) {
    .agents-table .c-cad, .agents-table .c-exit, .agents-table .c-art { display:none; }
    .agents-table th, .agents-table td { padding-left:0; padding-right:6px; }
    .agents-table .c-name { white-space:normal; max-width:none; overflow:visible; }
    .roster { padding:var(--space-control); }
    main { padding-top:var(--space-detail); }
  }
</style>
</head>
<body>
<div id="app">
  <header>
    <div class="wm-1">Momentum</div>
    <div class="wm-2">Agent Console Mirror</div>
    <div class="band-foot">
      <span>Read only cloud copy</span>
      <span>Last synced <b class="synced" id="synced" data-iso="${syncedAtIso || ''}">${syncedAtIso ? 'just now' : 'never'}</b></span>
    </div>
  </header>
  <main>
    <div class="notice"><b>This is a mirror.</b> It shows the roster as of the last sync, not live state. Toggle agents from the local console when the machine is up.</div>
    <section class="roster">
      <div class="panel-head"><h2>Agents</h2><span class="roster-count" id="agents-count">&hellip;</span></div>
      <table class="agents-table">
        <thead><tr>
          <th class="c-name">Agent</th><th class="c-cad">Cadence</th><th class="c-last">Last run</th>
          <th class="c-exit">Exit</th><th class="c-status">Status</th><th class="c-en">Enabled</th><th class="c-art">Artifact</th>
        </tr></thead>
        <tbody id="agents-body"></tbody>
      </table>
      <div class="roster-foot">
        <label><input type="checkbox" id="show-internal"><span id="show-internal-lbl">Show internal</span></label>
        <span class="note" id="internal-note"></span>
      </div>
    </section>
  </main>
  <footer>
    <span>Momentum Agent Console Mirror &middot; Cloudflare Worker + D1</span>
    <span id="foot-count"></span>
  </footer>
</div>
<script>
const $ = (id) => document.getElementById(id);

function agoStr(iso) {
  if (!iso) return null;
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}
function tickSynced() {
  const el = $('synced');
  const iso = el.dataset.iso;
  el.textContent = iso ? agoStr(iso) + ' ago' : 'never';
}
setInterval(tickSynced, 15000); tickSynced();

function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const FUNCTION_ORDER = ['command', 'client comms', 'client reporting', 'client sites', 'paid media',
  'lead gen', 'content', 'growth', 'revenue', 'research', 'agent ops', 'job search'];
const fnRank = (f) => { const i = FUNCTION_ORDER.indexOf(f); return i < 0 ? FUNCTION_ORDER.length : i; };
function isRunning(a) { return !!(a.last && a.last.status === 'running'); }

function groupRows(list) {
  const groups = new Map();
  for (const a of list) {
    const key = a.function || 'unassigned';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }
  return [...groups.entries()]
    .sort((x, y) => fnRank(x[0]) - fnRank(y[0]) || x[0].localeCompare(y[0]))
    .map(([name, rows]) => {
      rows.sort((x, y) => {
        if (isRunning(x) !== isRunning(y)) return isRunning(x) ? -1 : 1;
        if (x.enabled !== y.enabled) return x.enabled ? -1 : 1;
        return x.name.localeCompare(y.name);
      });
      return { name, rows };
    });
}

function agentRow(a) {
  const sub = a.kind === 'subagent';
  const last = a.last;
  const status = last ? last.status : 'never';
  const when = last ? agoStr(last.ended || last.started) : null;
  const cadence = sub ? 'on demand' : (a.cadence || 'not scheduled');
  const exit = last && last.exit_code != null ? last.exit_code : '';
  const artifact = last && last.artifact ? esc(last.artifact) : '';
  return '<tr class="' + (status === 'running' ? 'running' : '') + ' ' + (a.enabled ? '' : 'off') + '">' +
    '<td class="c-name" title="' + esc(a.name) + '">' + esc(a.name) + (sub ? '<span class="sub-tag">in session</span>' : '') + '</td>' +
    '<td class="c-cad" title="' + esc(cadence) + '">' + esc(cadence) + '</td>' +
    '<td class="c-last">' + (when || 'never ran') + '</td>' +
    '<td class="c-exit">' + exit + '</td>' +
    '<td class="c-status"><span class="status-pill ' + status + '">' + (status === 'never' ? 'never ran' : esc(status)) + '</span></td>' +
    '<td class="c-en">' + (a.enabled ? 'on' : 'off') + '</td>' +
    '<td class="c-art" title="' + artifact + '">' + artifact + '</td>' +
    '</tr>';
}
function groupHead(g) {
  const on = g.rows.filter((r) => r.enabled).length;
  return '<tr class="grp"><th colspan="7" scope="colgroup">' + esc(g.name) + '<span>' + on + ' on / ' + g.rows.length + '</span></th></tr>';
}

let agentsState = [];
let showInternal = false;
try { showInternal = localStorage.getItem('mac.show-internal') === '1'; } catch {}

function renderAgents() {
  const momentum = agentsState.filter((a) => a.audience === 'momentum');
  const rest = agentsState.filter((a) => a.audience !== 'momentum');
  $('agents-count').textContent = momentum.filter((a) => a.enabled).length + ' on / ' + momentum.length + ' momentum';
  $('foot-count').textContent = agentsState.length + ' agents total';
  let out = groupRows(momentum).map((g) => groupHead(g) + g.rows.map(agentRow).join('')).join('');
  if (!out) out = '<tr><td colspan="7">no momentum agents synced yet</td></tr>';
  if (showInternal && rest.length) {
    out += '<tr class="grp split-row"><th colspan="7" scope="colgroup">internal and personal<span>' + rest.length + ' agents</span></th></tr>';
    out += groupRows(rest).map((g) => groupHead(g) + g.rows.map(agentRow).join('')).join('');
  }
  $('agents-body').innerHTML = out;
  $('internal-note').textContent = showInternal ? rest.length + ' internal and personal agents shown' : rest.length + ' internal and personal agents hidden';
}

$('show-internal').checked = showInternal;
$('show-internal').onchange = (e) => {
  showInternal = e.target.checked;
  try { localStorage.setItem('mac.show-internal', showInternal ? '1' : '0'); } catch {}
  renderAgents();
};

async function syncAgents() {
  try {
    agentsState = (await (await fetch('/api/agents')).json()).agents || [];
    renderAgents();
  } catch { /* keep last known table, next poll retries */ }
}
setInterval(syncAgents, 60000); syncAgents();
</script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (p === '/login' && request.method === 'GET') return html(LOGIN_HTML);

    if (p === '/api/login' && request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      if (loginRateLimited(ip)) return json({ error: 'too many attempts, wait a few minutes' }, 429);
      let parsed;
      try { parsed = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
      if (!env.MOMENTUM_HUD_TOKEN || !timingSafeEqual(String(parsed.token || ''), env.MOMENTUM_HUD_TOKEN)) {
        return json({ error: 'wrong token' }, 401);
      }
      loginAttempts.delete(ip);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'set-cookie': `momentum_hud=${env.MOMENTUM_HUD_TOKEN}; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000; Path=/`,
        },
      });
    }

    if (!isAuthed(request, env)) {
      if (p.startsWith('/api/')) return json({ error: 'login required' }, 401);
      return Response.redirect(url.origin + '/login', 302);
    }

    if (p === '/favicon.ico') return new Response(null, { status: 204 });

    if (p === '/' || p === '/index.html') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      const syncedAt = await getSyncedAt(env);
      return html(pageHtml(syncedAt));
    }

    if (p === '/api/agents' && request.method === 'GET') {
      return json({ agents: await getAgents(env) });
    }

    return json({ error: 'not found' }, 404);
  },
};
