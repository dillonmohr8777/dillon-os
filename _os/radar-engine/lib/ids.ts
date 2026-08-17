'use strict';

const crypto = require('crypto');

const PREFIX = {
  campaign: 'cmp',
  prospect: 'pro',
  source: 'src',
  identity: 'idn',
  suppression: 'sup',
  intake: 'int',
  audit: 'aud',
  evidence: 'evd',
  score: 'sco',
  report: 'rpt',
  reportVersion: 'rpv',
  contact: 'con',
  contactSource: 'cso',
  draft: 'drf',
  approval: 'apr',
  handoff: 'hnd',
  booking: 'bkg',
  outcome: 'out',
  event: 'evt',
  job: 'job',
  rate: 'rte',
};

function id(kind) {
  const prefix = PREFIX[kind] || 'id';
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

function token(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function hmac(secret, payload) {
  return crypto.createHmac('sha256', String(secret)).update(String(payload)).digest('hex');
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(iso, days) {
  const d = iso ? new Date(iso) : new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

module.exports = { PREFIX, id, token, sha256, hmac, nowIso, addDays };
