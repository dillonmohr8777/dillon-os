'use strict';

const { URL } = require('url');

function collapse(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeName(value) {
  return collapse(value)
    .toLowerCase()
    .replace(/[&.,'"()]/g, ' ')
    .replace(/\b(llc|inc|ltd|co|corp|company|pc|pllc)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDomain(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  if (!s) return '';
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return String(raw)
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim();
  }
}

function normalizeWebsite(raw) {
  const domain = normalizeDomain(raw);
  if (!domain) return '';
  const s = String(raw).trim();
  const proto = /^http:/i.test(s) ? 'http' : 'https';
  return `${proto}://${domain}`;
}

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length >= 8) return `+${digits}`;
  return '';
}

function normalizeEmail(raw) {
  const e = String(raw || '').toLowerCase().trim();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(e)) return '';
  return e;
}

function normalizeAddress(raw) {
  return collapse(raw)
    .toLowerCase()
    .replace(/\b(street|st\.|avenue|ave\.|road|rd\.|drive|dr\.|boulevard|blvd\.|suite|ste\.|unit)\b/g, (m) => {
      const map = {
        street: 'st', 'st.': 'st', avenue: 'ave', 'ave.': 'ave', road: 'rd', 'rd.': 'rd',
        drive: 'dr', 'dr.': 'dr', boulevard: 'blvd', 'blvd.': 'blvd', suite: 'ste', 'ste.': 'ste', unit: 'unit',
      };
      return map[m.toLowerCase()] || m;
    })
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function emailDomain(email) {
  const e = normalizeEmail(email);
  return e ? e.split('@')[1] : '';
}

const INTERNAL_DOMAINS = new Set([
  'needmomentum.com',
  'momentum360.com',
  'momentum3d.com',
  'dillonmohr.com',
]);

function isInternalDomain(domain) {
  const d = normalizeDomain(domain);
  return INTERNAL_DOMAINS.has(d);
}

module.exports = {
  collapse,
  normalizeName,
  normalizeDomain,
  normalizeWebsite,
  normalizePhone,
  normalizeEmail,
  normalizeAddress,
  emailDomain,
  isInternalDomain,
  INTERNAL_DOMAINS,
};
