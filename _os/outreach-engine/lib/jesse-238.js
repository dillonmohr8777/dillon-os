/**
 * Public-safe loader for the 238 Jesse call sheet.
 * Phones, emails, and street addresses never enter this snapshot.
 */
'use strict';

const path = require('path');
const { repoPath, readJson, slugify } = require('../../automation/lib/fsutil');

const FIXTURE = '_os/automation/fixtures/prospects/jesse-238-call-ready.json';
const SPREADSHEET_ID = '1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo';
const HUB = 'https://momentum-prospect-radar-next20-2026-08-11.netlify.app';

function loadJesse238(file) {
  const doc = readJson(file || repoPath(FIXTURE));
  if (!doc || !Array.isArray(doc.prospects)) throw new Error('jesse-238 fixture missing prospects[]');
  return {
    spreadsheet_id: doc._spreadsheet_id || SPREADSHEET_ID,
    source: doc._source,
    count: doc.prospects.length,
    hub: HUB,
    prospects: doc.prospects.map((p, i) => normalize(p, i)),
  };
}

function normalize(p, index) {
  const n = Number(p.n) || index + 1;
  const name = p.business_name || p.name || `prospect-${n}`;
  const slug = p.slug || slugify(name);
  return {
    prospect_id: p.prospect_id || `J238-${String(n).padStart(3, '0')}`,
    n,
    batch: p.batch || '',
    business_name: name,
    vertical: p.vertical || '',
    live_site: p.live_site || '',
    slug,
    hub_host: p.hub_host || '',
    outreach_readiness: p.outreach_readiness || '',
    qa_status: p.qa_status || '',
    call_priority: p.call_priority || '',
    call_result: p.call_result || '',
    follow_up: p.follow_up || '',
    has_email: !!p.has_email,
    source: p.source || 'jesse-238-call-ready-2026-08-13',
    built: p.built !== false,
    qa_ready: /pass/i.test(p.qa_status || '') ? 'ready' : 'hold',
    mail_ready: 'hold',
    address: '',
    phone: '',
    email: '',
  };
}

function summarize(pack) {
  const verts = {};
  const batches = {};
  let email = 0;
  for (const p of pack.prospects) {
    verts[p.vertical] = (verts[p.vertical] || 0) + 1;
    batches[p.batch] = (batches[p.batch] || 0) + 1;
    if (p.has_email) email += 1;
  }
  return {
    count: pack.prospects.length,
    with_email: email,
    phone_or_form_only: pack.prospects.length - email,
    verticals: verts,
    batches,
    hub: pack.hub,
    spreadsheet_id: pack.spreadsheet_id,
  };
}

module.exports = { FIXTURE, SPREADSHEET_ID, HUB, loadJesse238, normalize, summarize };
