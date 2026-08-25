import crypto from 'node:crypto';

export function normalizeDomain(website = '') {
  try { return new URL(website).hostname.toLowerCase().replace(/^www\./, ''); }
  catch { return ''; }
}

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function prospectKey(prospect) {
  return normalizeDomain(prospect.website) || normalizeEmail(prospect.contact_email) || String(prospect.company_name || '').trim().toLowerCase();
}

export function sha256(value) {
  const payload = typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function validateSource(source, config) {
  const type = String(source?.source_type || '');
  const label = String(source?.label || '').toLowerCase();
  if (!config.policy.allowed_input_sources.includes(type)) throw new Error(`Input source type ${type || '(missing)'} is not allowed.`);
  if (config.policy.forbidden_source_labels.some((blocked) => label.includes(blocked))) {
    throw new Error('Momentum 360 sources are forbidden for the IMMOHRTAL agency lane.');
  }
  if (type === 'google_drive_discovery_reference') throw new Error('Google Drive source is metadata-only until a read-only requalification adapter exists.');
  if (source?.requalified_for_immohrtal !== true) throw new Error('Input source must be explicitly requalified_for_immohrtal=true.');
}

export function validateProspect(prospect) {
  const required = ['prospect_id', 'company_name', 'website', 'market', 'category'];
  const missing = required.filter((field) => !String(prospect[field] || '').trim());
  const domain = normalizeDomain(prospect.website);
  if (missing.length) return { ok: false, reasons: [`Missing required fields: ${missing.join(', ')}`] };
  if (!domain) return { ok: false, reasons: ['Website must be an absolute http or https URL.'] };
  if (!/^https?:\/\//i.test(prospect.website)) return { ok: false, reasons: ['Website must use http or https.'] };
  return { ok: true, reasons: [] };
}

export function suppressionDecision(prospect, suppressions) {
  if (prospect.opt_out === true || prospect.do_not_contact === true) {
    return { suppressed: true, reason: prospect.suppression_reason || 'Prospect opt-out or do-not-contact flag is set.' };
  }
  const domain = normalizeDomain(prospect.website);
  const email = normalizeEmail(prospect.contact_email);
  const company = String(prospect.company_name || '').trim().toLowerCase();
  const match = suppressions.find((entry) => {
    const value = String(entry.value || '').trim().toLowerCase();
    return (entry.type === 'domain' && value === domain) || (entry.type === 'email' && value === email) || (entry.type === 'company' && value === company);
  });
  return match ? { suppressed: true, reason: match.reason || `Suppressed by ${match.type}.` } : { suppressed: false, reason: null };
}

export function assertDraftOnly(config) {
  if (config.policy.external_actions !== false || config.policy.delivery_mode !== 'draft_only' || config.approval.adapter_handoff_enabled !== false) {
    throw new Error('Fail-closed: configuration attempts to enable an external action.');
  }
}
