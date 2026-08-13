'use strict';

const http = require('http');
const { URL } = require('url');
const { cssVariables, lockup, LOCKUP_CSS } = require('../../automation/lib/brand');
const { escapeHtml } = require('./redact.ts');
const { hmac } = require('./ids.ts');
const { validateIntake } = require('./intake.ts');
const { submitIntake, resolveProspect, funnelView, qaDecision } = require('./pipeline.ts');
const { loadConfig } = require('./config.ts');

function layout(title, body, { noindex = true } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
  <title>${escapeHtml(title)}</title>
  <style>
    ${cssVariables({ theme: 'light', followSystem: false })}
    ${LOCKUP_CSS}
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--sans); background: var(--bg); color: var(--fg); }
    main { max-width: 760px; margin: 0 auto; padding: 28px 16px 64px; }
    .card { background: var(--panel); border: 1px solid var(--rule); border-radius: 16px; padding: 22px; margin-top: 16px; }
    label { display: block; font-size: 13px; color: var(--fg-mid); margin: 12px 0 4px; }
    input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--rule-strong); border-radius: 10px; font: inherit; }
    button, .btn { background: var(--brand-fill); color: var(--on-brand); border: 0; padding: 12px 18px; border-radius: 999px; font-weight: 650; cursor: pointer; text-decoration: none; display: inline-block; }
    .err { color: var(--s-broken); }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid var(--rule); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body><main>${body}</main></body></html>`;
}

function intakeForm(cfg, errors = [], values = {}) {
  const err = errors.length ? `<p class="err">${errors.map(escapeHtml).join('<br>')}</p>` : '';
  const v = (k) => escapeHtml(values[k] || '');
  return layout('Request a marketing audit', `
    ${lockup({ subtitle: 'Free public-presence audit' })}
    <div class="card">
      <h1>Request a marketing audit</h1>
      <p>We will analyze the public website and listing signals you submit. Required consent covers this report only, not recurring marketing.</p>
      ${err}
      <form method="post" action="/intake">
        <label>Business name</label><input name="business_name" required value="${v('business_name')}">
        <label>Website</label><input name="website" required value="${v('website')}">
        <label>City / state or service area</label><input name="city_state" required value="${v('city_state')}">
        <div class="row">
          <div><label>Your name</label><input name="requester_name" required value="${v('requester_name')}"></div>
          <div><label>Role</label>
            <select name="role" required>
              <option value="">Select</option>
              ${['owner', 'manager', 'marketing', 'other'].map((r) => `<option value="${r}" ${values.role === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="row">
          <div><label>Business email</label><input name="requester_email" type="email" required value="${v('requester_email')}"></div>
          <div><label>Phone (optional)</label><input name="requester_phone" value="${v('requester_phone')}"></div>
        </div>
        <label>Primary services</label><input name="primary_services" required value="${v('primary_services')}">
        <label>Main growth goals</label><textarea name="growth_goals" required>${v('growth_goals')}</textarea>
        <label>Current marketing channels</label><input name="current_channels" required value="${v('current_channels')}">
        <label>Notes (optional)</label><textarea name="notes">${v('notes')}</textarea>
        <p><label><input type="checkbox" name="consent_analyze" ${values.consent_analyze ? 'checked' : ''}> I consent to analysis of this business's public website and listings, and to delivery of the requested report.</label></p>
        <p><label><input type="checkbox" name="consent_marketing"> Optional: you may follow up with marketing. Leave unchecked if you only want the report.</label></p>
        <p><a href="${escapeHtml(cfg.privacyUrl)}">Privacy</a> · <a href="${escapeHtml(cfg.termsUrl)}">Terms</a></p>
        <button type="submit">Submit audit request</button>
      </form>
    </div>
  `);
}

function parseForm(body) {
  const params = new URLSearchParams(body);
  const obj = {};
  for (const [k, v] of params) obj[k] = v;
  obj.consent_analyze = params.get('consent_analyze') === 'on';
  obj.consent_marketing = params.get('consent_marketing') === 'on';
  return obj;
}

function requireQa(req, cfg) {
  const url = new URL(req.url, cfg.publicOrigin);
  const token = url.searchParams.get('token') || '';
  return Boolean(cfg.qaToken) && token === cfg.qaToken;
}

function createServer({ store, adapters, campaign, cfg }) {
  const config = cfg || loadConfig();
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, config.publicOrigin);
      if (req.method === 'GET' && url.pathname === '/health') {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, killSwitch: config.killSwitch }));
      }
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/intake')) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(intakeForm(config));
      }
      if (req.method === 'GET' && url.pathname === '/privacy') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(layout('Privacy', `<div class="card"><h1>Privacy</h1><p>Placeholder. Public-presence analysis is used to produce the requested report. Marketing follow-up is optional and off by default.</p></div>`));
      }
      if (req.method === 'GET' && url.pathname === '/terms') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(layout('Terms', `<div class="card"><h1>Terms</h1><p>Placeholder. This is a public-presence audit, not a ranking or spend guarantee.</p></div>`));
      }
      if (req.method === 'POST' && url.pathname === '/intake') {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = parseForm(Buffer.concat(chunks).toString('utf8'));
        const ip = String(req.socket.remoteAddress || '');
        const result = await submitIntake(store, adapters, config, campaign, body, { ip });
        if (!result.ok) {
          res.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
          return res.end(intakeForm(config, result.errors, body));
        }
        res.writeHead(303, { location: `/status/${result.submission.status_token}` });
        return res.end();
      }
      if (req.method === 'GET' && url.pathname.startsWith('/status/')) {
        const tok = url.pathname.slice('/status/'.length);
        const sub = store.findOne('intake_submissions', (s) => s.status_token === tok);
        if (!sub) {
          res.writeHead(404); return res.end('not found');
        }
        const prospect = sub.prospect_id ? store.get('prospects', sub.prospect_id) : null;
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(layout('Audit status', `
          <div class="card">
            <h1>Request received</h1>
            <p>We will analyze the public presence of ${escapeHtml(sub.business_name)}.</p>
            <p>Status: ${escapeHtml(prospect ? prospect.lifecycle : 'received')}</p>
            <p>Marketing follow-up consent: ${sub.consent_marketing ? 'yes' : 'no (report only)'}</p>
          </div>`));
      }
      if (req.method === 'GET' && url.pathname.startsWith('/r/')) {
        const tok = url.pathname.slice('/r/'.length);
        const report = store.findOne('reports', (r) => r.access_token === tok);
        if (!report || report.revoked_at || (report.expires_at && new Date(report.expires_at) < new Date())) {
          res.writeHead(404); return res.end('not found');
        }
        const version = store.get('report_versions', report.current_version_id);
        await store.emitEvent({ actor: 'prospect', type: 'report.viewed', prospectId: report.prospect_id, reason: 'report viewed', payload: { report_id: report.id } });
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' });
        return res.end(version ? require('fs').readFileSync(version.html_ref, 'utf8') : 'missing');
      }
      if (req.method === 'GET' && url.pathname.startsWith('/cta/')) {
        const tok = url.pathname.slice('/cta/'.length);
        const report = store.findOne('reports', (r) => r.access_token === tok);
        if (!report) { res.writeHead(404); return res.end('not found'); }
        await store.emitEvent({ actor: 'prospect', type: 'cta.clicked', prospectId: report.prospect_id, reason: 'cta clicked', payload: { report_id: report.id } });
        res.writeHead(302, { location: config.bookingUrl });
        return res.end();
      }
      if (url.pathname.startsWith('/qa')) {
        if (!requireQa(req, config)) {
          res.writeHead(401); return res.end('QA token required');
        }
        if (req.method === 'GET' && url.pathname === '/qa') {
          const queue = store.find('prospects', (p) => p.lifecycle === 'qa_pending');
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
          return res.end(layout('QA queue', `
            <div class="card"><h1>QA queue</h1>
            <table><tr><th>Business</th><th>Offer</th><th></th></tr>
            ${queue.map((p) => `<tr><td>${escapeHtml(p.business_name)}</td><td>${escapeHtml(p.selected_offer || '')}</td><td><a href="/qa/${p.id}?token=${escapeHtml(config.qaToken)}">review</a></td></tr>`).join('')}
            </table></div>`));
        }
        const m = url.pathname.match(/^\/qa\/([^/]+)(?:\/(approve|reject|rescan))?$/);
        if (m && req.method === 'GET') {
          const p = store.get('prospects', m[1]);
          const snap = store.findOne('score_snapshots', (s) => s.prospect_id === p.id);
          const report = store.findOne('reports', (r) => r.prospect_id === p.id);
          const version = report ? store.get('report_versions', report.current_version_id) : null;
          const evidence = version ? version.manifest.evidence : [];
          const findings = version ? version.manifest.findings : [];
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
          return res.end(layout('QA review', `
            <div class="card">
              <h1>${escapeHtml(p.business_name)}</h1>
              <p>Lifecycle ${escapeHtml(p.lifecycle)} · offer ${escapeHtml(p.selected_offer || '')} · suppression ${escapeHtml(p.suppression_reason || 'none')}</p>
              <pre>${escapeHtml(JSON.stringify(snap ? {
                site_quality_score: snap.site_quality_score,
                rebuild_opportunity: snap.rebuild_opportunity,
                seo_aeo_opportunity: snap.seo_aeo_opportunity,
                local_opportunity: snap.local_opportunity,
                paid_opportunity: snap.paid_opportunity,
                conversion_opportunity: snap.conversion_opportunity,
                market_fit_score: snap.market_fit_score,
                contactability_score: snap.contactability_score,
                audit_confidence: snap.audit_confidence,
                priority_score: snap.priority_score,
                explanations: snap.explanations,
              } : {}, null, 2))}</pre>
              <p><a class="btn" href="/r/${report ? report.access_token : ''}">Open report</a></p>
              <h2>Findings / evidence</h2>
              ${findings.map((f) => `<p><strong>${escapeHtml(f.claim)}</strong><br>${escapeHtml((f.evidence_ids || []).join(', '))}</p>`).join('')}
              <h2>Evidence</h2>
              ${evidence.map((e) => `<p><code>${escapeHtml(e.id)}</code> ${escapeHtml(e.metric)}</p>`).join('')}
              <form method="post" action="/qa/${p.id}/approve?token=${escapeHtml(config.qaToken)}"><button>Approve</button></form>
              <form method="post" action="/qa/${p.id}/reject?token=${escapeHtml(config.qaToken)}"><label>Rejection reason</label><input name="reason" required><button>Reject</button></form>
              <form method="post" action="/qa/${p.id}/rescan?token=${escapeHtml(config.qaToken)}"><label>Rescan reason</label><input name="reason" required><button>Request rescan</button></form>
            </div>`));
        }
        if (m && req.method === 'POST') {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const body = parseForm(Buffer.concat(chunks).toString('utf8'));
          const p = store.get('prospects', m[1]);
          const report = store.findOne('reports', (r) => r.prospect_id === p.id);
          const decision = m[2] === 'approve' ? 'approve' : m[2] === 'rescan' ? 'rescan' : 'reject';
          await qaDecision(store, config, p, report, { actor: 'qa.reviewer', decision, reason: body.reason || 'approved from QA UI' });
          res.writeHead(303, { location: `/qa?token=${config.qaToken}` });
          return res.end();
        }
      }
      if (req.method === 'GET' && url.pathname === '/funnel') {
        if (!requireQa(req, config)) { res.writeHead(401); return res.end('QA token required'); }
        const view = funnelView(store);
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(layout('Funnel', `
          <div class="card">
            <h1>Funnel</h1>
            <pre>${escapeHtml(JSON.stringify(view, null, 2))}</pre>
          </div>`));
      }
      if (req.method === 'POST' && url.pathname === '/webhooks/booking') {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString('utf8');
        const sig = req.headers['x-radar-signature'] || '';
        const ok = config.webhookSecret && hmac(config.webhookSecret, raw) === String(sig).replace(/^sha256=/i, '');
        if (!ok) { res.writeHead(401); return res.end('bad signature'); }
        const payload = JSON.parse(raw);
        await store.emitEvent({ actor: 'booking-webhook', type: payload.type || 'booking.completed', prospectId: payload.prospect_id, reason: 'signed webhook', payload });
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      }
      res.writeHead(404); res.end('not found');
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end('error');
      console.error(String(err && err.message || err));
    }
  });
  return server;
}

module.exports = { createServer, intakeForm, layout };
