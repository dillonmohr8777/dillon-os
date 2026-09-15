// Prospect Radar Worker — read-only API + dashboard over D1.
//
// Routes:
//   GET /                 -> minimal HTML dashboard
//   GET /api/prospects    -> ?vertical=&min_score=  (JSON array)
//   GET /api/prospects/:slug -> JSON object or 404
//
// Bind D1 as `RADAR`. No writes, no external assets, CORS off (same-origin only,
// no Access-Control-Allow-* headers are set).

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function html(body) {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prospect Radar</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; background: #0b0d10; color: #e7e9ec; }
  header { padding: 12px 16px; border-bottom: 1px solid #23262b; position: sticky; top: 0; background: #0b0d10; }
  h1 { font-size: 16px; margin: 0 0 8px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; }
  select, button { font: inherit; padding: 6px 8px; background: #16181c; color: #e7e9ec; border: 1px solid #2c2f35; border-radius: 6px; }
  .wrap { overflow-x: auto; padding: 0 16px 24px; }
  table { border-collapse: collapse; width: 100%; min-width: 640px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #1d1f24; white-space: nowrap; }
  th { position: sticky; top: 56px; background: #0b0d10; cursor: pointer; }
  td.fault { white-space: normal; max-width: 360px; color: #b9bdc4; }
  tr:hover { background: #14161a; }
  a { color: #7fb2ff; }
  .score { font-variant-numeric: tabular-nums; font-weight: 600; }
  .empty { padding: 24px 16px; color: #999; }
</style>
</head>
<body>
<header>
  <h1>Prospect Radar</h1>
  <div class="controls">
    <select id="vertical"><option value="">All verticals</option></select>
    <button id="sortScore">Sort by score</button>
  </div>
</header>
<div class="wrap">
  <table id="tbl">
    <thead>
      <tr><th>Name</th><th>Vertical</th><th>City</th><th>Score</th><th>Worst fault</th><th>Last audit</th></tr>
    </thead>
    <tbody></tbody>
  </table>
  <div class="empty" id="empty" hidden>No prospects match.</div>
</div>
<script>
(function () {
  var rows = [];
  var sortDesc = true;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render() {
    var vertical = document.getElementById('vertical').value;
    var filtered = rows.filter(function (r) { return !vertical || r.vertical === vertical; });
    filtered.sort(function (a, b) { return sortDesc ? b.score - a.score : a.score - b.score; });
    var tbody = document.querySelector('#tbl tbody');
    tbody.innerHTML = filtered.map(function (r) {
      var url = r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>' : esc(r.name);
      return '<tr>' +
        '<td>' + url + '</td>' +
        '<td>' + esc(r.vertical) + '</td>' +
        '<td>' + esc(r.city) + '</td>' +
        '<td class="score">' + esc(r.score) + '</td>' +
        '<td class="fault">' + esc(r.worst_fault) + '</td>' +
        '<td>' + esc(r.last_audit) + '</td>' +
        '</tr>';
    }).join('');
    document.getElementById('empty').hidden = filtered.length !== 0;
  }

  function populateVerticals() {
    var select = document.getElementById('vertical');
    var seen = {};
    rows.forEach(function (r) { if (r.vertical) seen[r.vertical] = true; });
    Object.keys(seen).sort().forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      select.appendChild(opt);
    });
  }

  document.getElementById('vertical').addEventListener('change', render);
  document.getElementById('sortScore').addEventListener('click', function () {
    sortDesc = !sortDesc;
    render();
  });

  fetch('/api/prospects')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      rows = data;
      populateVerticals();
      render();
    })
    .catch(function () {
      document.getElementById('empty').hidden = false;
      document.getElementById('empty').textContent = 'Failed to load prospects.';
    });
})();
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    if (url.pathname === '/') {
      return html(DASHBOARD_HTML);
    }

    if (url.pathname === '/api/prospects') {
      const vertical = url.searchParams.get('vertical');
      const minScore = url.searchParams.get('min_score');

      let sql = 'SELECT slug, name, vertical, city, url, score, worst_fault, tracked_since, last_audit FROM prospects';
      const conditions = [];
      const params = [];

      if (vertical) {
        conditions.push('vertical = ?');
        params.push(vertical);
      }
      if (minScore !== null && minScore !== '') {
        const n = Number(minScore);
        if (Number.isFinite(n)) {
          conditions.push('score >= ?');
          params.push(n);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY score DESC LIMIT 1000';

      const stmt = params.length ? env.RADAR.prepare(sql).bind(...params) : env.RADAR.prepare(sql);
      const { results } = await stmt.all();
      return json(results || []);
    }

    const slugMatch = url.pathname.match(/^\/api\/prospects\/([^/]+)$/);
    if (slugMatch) {
      const slug = decodeURIComponent(slugMatch[1]);
      const row = await env.RADAR
        .prepare('SELECT slug, name, vertical, city, url, score, worst_fault, tracked_since, last_audit FROM prospects WHERE slug = ?')
        .bind(slug)
        .first();
      if (!row) return json({ error: 'not found' }, 404);
      return json(row);
    }

    return new Response('Not found', { status: 404 });
  },
};
