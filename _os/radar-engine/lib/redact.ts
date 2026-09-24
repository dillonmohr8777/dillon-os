'use strict';

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(?<!\d)(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}(?!\d)/g;
const SECRET_RE = /\b(?:password|passwd|api[_-]?key|secret[_-]?key|client_secret|authorization\s*:\s*bearer)\b\s*[:=]\s*\S+/gi;

const ALLOWED_PUBLIC_EMAILS = new Set([
  'hello@needmomentum.com',
  'noreply@needmomentum.com',
]);

function redactText(text) {
  return String(text || '')
    .replace(EMAIL_RE, (m) => (ALLOWED_PUBLIC_EMAILS.has(m.toLowerCase()) ? m : '[redacted-email]'))
    .replace(PHONE_RE, '[redacted-phone]')
    .replace(SECRET_RE, (m) => m.replace(/[:=]\s*\S+/, '=[redacted]'));
}

function containsPii(text, { allowAgencyEmail = true } = {}) {
  const s = String(text || '');
  const emails = s.match(EMAIL_RE) || [];
  const leaked = emails.filter((e) => {
    const low = e.toLowerCase();
    if (allowAgencyEmail && ALLOWED_PUBLIC_EMAILS.has(low)) return false;
    if (low.endsWith('@needmomentum.com') || low.endsWith('@momentum360.com')) return false;
    return true;
  });
  const phones = s.match(PHONE_RE) || [];
  return { leaked: leaked.length > 0 || phones.length > 0, emails: leaked, phones };
}

function sanitizeExport(row) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  for (const k of [
    'requester_name', 'requester_role', 'requester_email', 'requester_phone',
    'value', 'person_name', 'person_title', 'business_description', 'growth_goals', 'notes', 'private_fields',
    'payload_preview',
  ]) {
    if (k in out) delete out[k];
  }
  if (out.public_fields) out.public_fields = { ...out.public_fields };
  return out;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { redactText, containsPii, sanitizeExport, escapeHtml, ALLOWED_PUBLIC_EMAILS };
