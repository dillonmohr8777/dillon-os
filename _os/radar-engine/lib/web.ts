'use strict';

const http = require('http');
const { URL } = require('url');
const { cssVariables, LOCKUP_CSS } = require('../../automation/lib/brand');
const { escapeHtml } = require('./redact.ts');
const { hmac } = require('./ids.ts');
const { validateIntake } = require('./intake.ts');
const { submitIntake, resolveProspect, funnelView, qaDecision } = require('./pipeline.ts');
const { loadConfig } = require('./config.ts');
const { storageAdapter, reportAccessible, prospectLabel, momentumLogoDataUri } = require('./reports.ts');

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
    input[type="checkbox"] { width: auto; }
    button, .btn { background: var(--brand-fill); color: var(--on-brand); border: 0; padding: 12px 18px; border-radius: 999px; font-weight: 650; cursor: pointer; text-decoration: none; display: inline-block; }
    .err { color: var(--s-broken); }
    .field-error { margin: 4px 0 0; font-size: 13px; }
    .consent { display: flex; align-items: flex-start; gap: 8px; }
    .consent label { display: inline; margin: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid var(--rule); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body><main>${body}</main></body></html>`;
}

function intakeForm(cfg, errors = [], values = {}, fieldErrors = {}) {
  const needsCaptcha = cfg.captcha === 'turnstile';
  const captchaUnavailable = needsCaptcha && (!cfg.captchaSiteKey || !cfg.captchaSecret || !cfg.captchaExpectedHostname || process.env.RADAR_V2_CAPTCHA_LIVE !== 'true');
  const captcha = !needsCaptcha ? '' : captchaUnavailable
    ? '<p class="err" role="alert">Audit requests are temporarily unavailable. Please try again later.</p>'
    : `<p>Complete the security check before requesting your audit.</p><div class="cf-turnstile" data-sitekey="${escapeHtml(cfg.captchaSiteKey)}" data-action="${escapeHtml(cfg.captchaExpectedAction || 'intake')}" data-response-field-name="captcha_token" data-size="flexible"></div><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script><noscript><p>JavaScript is required for the security check.</p></noscript>`;
  const err = errors.length ? `<div class="err" role="alert" aria-live="assertive"><p>Please correct the following:</p><ul>${errors.map(escapeHtml).map((message) => `<li>${message}</li>`).join('')}</ul></div>` : '';
  const v = (k) => escapeHtml(values[k] || '');
  const errorAttrs = (name) => fieldErrors[name] ? ` aria-invalid="true" aria-describedby="${name}-error"` : '';
  const fieldError = (name) => fieldErrors[name] ? `<p class="err field-error" id="${name}-error">${escapeHtml(fieldErrors[name])}</p>` : '';
  return layout('Request your free audit', `
    ${cfg.staging ? '<aside class="card" role="note"><strong>Private staging: synthetic test data only.</strong><p>This is a test of the audit workflow. Do not enter customer details. Email and CRM delivery are disabled.</p></aside>' : ''}
    <img src="${momentumLogoDataUri}" alt="Momentum Digital" width="260" style="max-width:100%;height:auto;background:#fff">
    <div class="card">
      <h1>Get my free website + search visibility audit</h1>
      <p>We review publicly available signals from the website you submit. This form records an audit request and does not subscribe you to marketing.</p>
      ${err}
      <form method="post" action="/intake">
        <div class="row">
          <div><label for="name">Name</label><input id="name" name="name" autocomplete="name" required${errorAttrs('name')} value="${v('name')}">${fieldError('name')}</div>
          <div><label for="phone">Phone number</label><input id="phone" name="phone" type="tel" autocomplete="tel" required${errorAttrs('phone')} value="${v('phone')}">${fieldError('phone')}</div>
        </div>
        <label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required${errorAttrs('email')} value="${v('email')}">${fieldError('email')}
        <label for="website">Website</label><input id="website" name="website" type="url" autocomplete="url" required${errorAttrs('website')} value="${v('website')}">${fieldError('website')}
        <label for="business_description">Brief business description</label><textarea id="business_description" name="business_description" required${errorAttrs('business_description')}>${v('business_description')}</textarea>${fieldError('business_description')}
        <label for="goals">Goals</label><textarea id="goals" name="goals" required${errorAttrs('goals')}>${v('goals')}</textarea>${fieldError('goals')}
        <div class="consent"><input id="consent_analyze" type="checkbox" name="consent_analyze" required${errorAttrs('consent_analyze')} ${values.consent_analyze ? 'checked' : ''}> <label for="consent_analyze">I’m requesting a one-time public website audit and consent to receive the report by email and one review call. This does not subscribe me to marketing.</label></div>${fieldError('consent_analyze')}
        <p><a href="${escapeHtml(cfg.privacyUrl)}">Privacy notice</a> · <a href="${escapeHtml(cfg.termsUrl)}">Terms</a></p>
        ${captcha}
        <button type="submit"${captchaUnavailable ? ' disabled' : ''}>Request my audit</button>
      </form>
    </div>
  `);
}

function pct(n) {
  return `${Math.round(Number(n || 0) * 100)}%`;
}

function scoreTable(snap) {
  if (!snap) return '<p>No score snapshot.</p>';
  const rows = [
    ['Site Quality Score', snap.site_quality_score],
    ['Opportunity Score', snap.opportunity_score],
    ['Rebuild', snap.rebuild_opportunity],
    ['SEO / AEO', snap.seo_aeo_opportunity],
    ['Local', snap.local_opportunity],
    ['Paid', snap.paid_opportunity],
    ['Conversion', snap.conversion_opportunity],
    ['Market fit', snap.market_fit_score],
    ['Contactability', snap.contactability_score],
    ['Audit confidence', snap.audit_confidence],
    ['Priority', snap.priority_score],
  ];
  const why = (snap.explanations || []).map((e) => `<li><strong>${escapeHtml(e.score)}</strong>: ${escapeHtml(e.because)}</li>`).join('');
  return `
    <table>
      ${rows.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v == null ? '—' : String(v))}</td></tr>`).join('')}
    </table>
    <ul>${why}</ul>`;
}

function funnelPage(view) {
  const stages = Object.entries(view.byStage || {});
  const conv = view.conversion || {};
  const segs = view.segments || {};
  return layout('Funnel', `
    <div class="card">
      <h1>Funnel</h1>
      <p>Revenue ${escapeHtml(String(view.revenue || 0))} · expected ${escapeHtml(String(view.expected_revenue || 0))} · median ${escapeHtml(String(Math.round((view.median_minutes || 0) * 100) / 100))} min</p>
      <h2>Conversion</h2>
      <table>
        <tr><th>Intake to scan</th><td>${pct(conv.intake_to_scan)}</td></tr>
        <tr><th>QA approval</th><td>${pct(conv.qa_approval_rate)}</td></tr>
        <tr><th>QA rejection</th><td>${pct(conv.qa_rejection_rate)}</td></tr>
        <tr><th>Booking</th><td>${pct(conv.booking_rate)}</td></tr>
        <tr><th>Win</th><td>${pct(conv.win_rate)}</td></tr>
      </table>
      <h2>Lifecycle</h2>
      <table>${stages.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>
      <h2>Events</h2>
      <table>${Object.entries(view.counts || {}).map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>
      <h2>Segments</h2>
      <p>Campaign, vertical, geography, and offer counts. Cost and API usage stay zero until a paid provider is enabled.</p>
      <table>
        ${['campaign', 'vertical', 'geography', 'offer'].map((key) => {
          const inner = Object.entries(segs[key] || {}).map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`).join(', ');
          return `<tr><th>${escapeHtml(key)}</th><td>${inner || '—'}</td></tr>`;
        }).join('')}
      </table>
      <p class="note">QA unsupported-claim rejection rate: ${pct(view.unsupported_claim_rejection_rate)} · false-route corrections: ${escapeHtml(String(view.false_route_corrections || 0))}</p>
    </div>`);
}

function parseForm(body) {
  const params = new URLSearchParams(body);
  const obj = {};
  for (const [k, v] of params) obj[k] = v;
  obj.consent_analyze = params.get('consent_analyze') === 'on';
  obj.consent_marketing = params.get('consent_marketing') === 'on';
  return obj;
}

async function readBody(req) {
  const limit = 64 * 1024;
  const tooLarge = () => Object.assign(new Error('Request body too large'), { statusCode: 413 });
  if (Number(req.headers['content-length']) > limit) throw tooLarge();
  let bytes = 0;
  const chunks = [];
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > limit) throw tooLarge();
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function requireQa(req, cfg) {
  const url = new URL(req.url, cfg.publicOrigin);
  const token = url.searchParams.get('token') || '';
  return Boolean(cfg.qaToken) && token === cfg.qaToken;
}

function reportReleased(store, report) {
  if (!reportAccessible(report)) return false;
  const prospect = store.get('prospects', report.prospect_id);
  return Boolean(prospect && [
    'report_approved', 'enrichment_pending', 'outreach_ready', 'outreach_approved', 'handed_off',
    'contacted', 'engaged', 'booked', 'qualified', 'proposal', 'won', 'lost', 'nurture',
  ].includes(prospect.lifecycle));
}

function createServer({ store, adapters, campaign, cfg }) {
  const config = cfg || loadConfig();
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, config.publicOrigin);
      if (req.method === 'GET' && url.pathname === '/health') {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, killSwitch: config.killSwitch, staging: config.staging }));
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
        const body = parseForm(await readBody(req));
        const ip = String(req.socket.remoteAddress || '');
        const result = await submitIntake(store, adapters, config, campaign, body, { ip });
        if (!result.ok) {
          res.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
          return res.end(intakeForm(config, result.errors, body, result.fieldErrors || {}));
        }
        res.writeHead(303, { location: `/status/${result.submission.status_token}` });
        return res.end();
      }
      if (req.method === 'GET' && url.pathname.startsWith('/status/')) {
        const tok = url.pathname.slice('/status/'.length);
        const sub = store.findOne('intake_submissions', (s) => s.status_token === tok);
        const statusHeaders = {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'referrer-policy': 'no-referrer',
          'x-robots-tag': 'noindex, nofollow',
        };
        if (!sub) {
          res.writeHead(404, statusHeaders); return res.end('not found');
        }
        const sourceSubmission = sub.duplicate_of ? store.get('intake_submissions', sub.duplicate_of) || sub : sub;
        const job = store.findOne('jobs', (row) => row.type === 'intake.audit' && row.payload?.submission_id === sourceSubmission.id);
        const prospect = (sub.prospect_id && store.get('prospects', sub.prospect_id)) ||
          (sourceSubmission.prospect_id && store.get('prospects', sourceSubmission.prospect_id));
        const report = prospect && store.findOne('reports', (row) => row.prospect_id === prospect.id);
        const released = report && reportReleased(store, report);
        let progress;
        if (sub.duplicate_of) {
          progress = '<p>This request matches an earlier request. A second audit was not started.</p>';
        } else if (released) {
          progress = `<p>Your public website audit is ready: <a href="/r/${escapeHtml(report.access_token)}">view the report</a>.</p>`;
        } else if (report) {
          progress = '<p>The public website scan and draft report are complete. The report is awaiting human quality review. Nothing has been emailed.</p>';
        } else if (job?.status === 'dead_letter') {
          progress = '<p>The scan could not be completed after retries. No report has been generated or emailed.</p>';
        } else if (job?.status === 'running') {
          progress = '<p>Your public website scan is in progress.</p>';
        } else if (job?.status === 'succeeded' && prospect?.lifecycle === 'suppressed') {
          progress = '<p>The request was received, but the site was not eligible for this audit. No scan or report was created.</p>';
        } else {
          progress = '<p>Your audit is queued. The report has not been generated or emailed yet.</p>';
        }
        res.writeHead(200, statusHeaders);
        return res.end(layout('Audit request received', `
          <div class="card">
            <h1>Request received</h1>
            <p>Your audit request for <strong>${escapeHtml(sub.website)}</strong> has been saved.</p>
            ${progress}
          </div>`));
      }
      if (req.method === 'GET' && url.pathname.startsWith('/r/')) {
        const tok = url.pathname.slice('/r/'.length);
        const report = store.findOne('reports', (r) => r.access_token === tok);
        if (!reportReleased(store, report)) {
          res.writeHead(404); return res.end('not found');
        }
        const version = store.get('report_versions', report.current_version_id);
        await store.emitEvent({ actor: 'prospect', type: 'report.viewed', prospectId: report.prospect_id, reason: 'report viewed', payload: { report_id: report.id } });
        const storage = storageAdapter(config);
        const html = version ? await storage.get(version.html_ref) : Buffer.from('missing');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' });
        return res.end(html);
      }
      if (req.method === 'GET' && url.pathname.startsWith('/cta/')) {
        const tok = url.pathname.slice('/cta/'.length);
        const report = store.findOne('reports', (r) => r.access_token === tok);
        if (!reportReleased(store, report)) { res.writeHead(404); return res.end('not found'); }
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
            <table><tr><th>Website</th><th>Offer</th><th></th></tr>
            ${queue.map((p) => `<tr><td>${escapeHtml(prospectLabel(p))}</td><td>${escapeHtml(p.selected_offer || '')}</td><td><a href="/qa/${p.id}?token=${escapeHtml(config.qaToken)}">review</a></td></tr>`).join('')}
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
              <h1>${escapeHtml(prospectLabel(p))}</h1>
              <p>Lifecycle ${escapeHtml(p.lifecycle)} · offer ${escapeHtml(p.selected_offer || '')} · suppression ${escapeHtml(p.suppression_reason || 'none')}</p>
              ${scoreTable(snap)}
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
          const body = parseForm(await readBody(req));
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
        return res.end(funnelPage(view));
      }
      if (req.method === 'POST' && url.pathname === '/webhooks/booking') {
        const raw = await readBody(req);
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
      if (err.statusCode === 413) {
        res.writeHead(413, { 'content-type': 'text/plain', connection: 'close' });
        req.resume();
        return res.end('Request body too large');
      }
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end('error');
      console.error(String(err && err.message || err));
    }
  });
  return server;
}

module.exports = { createServer, intakeForm, layout, funnelPage, scoreTable, reportReleased };
