'use strict';

const { buildSuppressSets } = require('../../automation/lib/clients');
const { normalizeDomain, normalizeEmail, normalizePhone, normalizeName, isInternalDomain } = require('./normalize.ts');

const AGENCY_DOMAINS = new Set([
  'askmagnify.com', 'prosites.com', 'officite.com', 'sesamecommunications.com',
  'patientpop.com', 'officite.com', 'modento.com',
]);

function suppressionHit(reason, detail) {
  return { suppressed: true, reason, detail };
}

function checkSuppression({ store, prospect, campaign, intake, now = new Date() }) {
  const domain = normalizeDomain(prospect.website || prospect.domain);
  const email = normalizeEmail(intake?.requester_email || prospect.email);
  const phone = normalizePhone(intake?.requester_phone || prospect.phone);
  const name = normalizeName(prospect.business_name);

  const rows = store.all('suppressions').filter((s) => !s.expires_at || new Date(s.expires_at) > now);
  const match = (kind, value) => rows.find((s) => s.kind === kind && s.value_normalized === value);

  if (domain && match('domain', domain)) {
    return suppressionHit('suppressed domain', match('domain', domain).reason);
  }
  if (email && match('email', email)) {
    return suppressionHit('suppressed email / opt-out', match('email', email).reason);
  }
  if (phone && match('phone', phone)) {
    return suppressionHit('suppressed phone', match('phone', phone).reason);
  }
  if (name && match('name', name)) {
    return suppressionHit('suppressed business name', match('name', name).reason);
  }

  let clients = { suppressIds: new Set(), suppressDomains: new Set() };
  try {
    clients = buildSuppressSets();
  } catch {
    clients = { suppressIds: new Set(), suppressDomains: new Set() };
  }
  if (domain && clients.suppressDomains.has(domain)) {
    return suppressionHit('current Momentum client', domain);
  }
  if (name && clients.suppressIds.has(name)) {
    return suppressionHit('current Momentum client', name);
  }

  if (domain && isInternalDomain(domain)) {
    return suppressionHit('internal / agency domain', domain);
  }
  if (domain && AGENCY_DOMAINS.has(domain)) {
    return suppressionHit('agency domain', domain);
  }

  const excluded = campaign?.excluded_verticals || [];
  if (prospect.vertical && excluded.includes(String(prospect.vertical).toLowerCase())) {
    return suppressionHit('vertical excluded by campaign', prospect.vertical);
  }
  if (prospect.chain && campaign?.suppression_policy?.exclude_chains !== false) {
    return suppressionHit('chain / franchise excluded by campaign', prospect.business_name);
  }
  if (prospect.closed) {
    return suppressionHit('closed business', prospect.business_name);
  }

  const existing = store.find('prospects', (p) => p.id !== prospect.id && p.domain && p.domain === domain);
  if (existing.length) {
    const live = existing.find((p) => !['lost', 'suppressed', 'expired'].includes(p.lifecycle));
    if (live) return suppressionHit('duplicate domain already in pipeline', live.id);
  }

  const priorOutreach = store.find('approvals', (a) => a.prospect_id === prospect.id && a.kind === 'outreach' && a.decision === 'approved');
  if (priorOutreach.length && campaign?.suppression_policy?.block_previous_outreach !== false) {
    return suppressionHit('previous outreach', priorOutreach[0].id);
  }

  const freshnessDays = campaign?.suppression_policy?.report_freshness_days ?? 90;
  const cutoff = new Date(now.getTime() - freshnessDays * 86400000);
  const recentReports = store.find('reports', (r) => r.prospect_id === prospect.id && new Date(r.created_at) > cutoff && !r.revoked_at);
  if (recentReports.length) {
    return suppressionHit('existing report within freshness window', recentReports[0].id);
  }

  return { suppressed: false, reason: '', detail: '' };
}

function addSuppression(store, { kind, value, reason, channel = '*', source = 'manual' }) {
  return store.insert('suppressions', {
    kind,
    value_normalized: value,
    reason,
    channel,
    source,
  });
}

module.exports = { checkSuppression, addSuppression, AGENCY_DOMAINS };
