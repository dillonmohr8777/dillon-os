'use strict';

const crypto = require('crypto');

const PREFIX = 'enc:v1:';

const SENSITIVE = {
  intake_submissions: ['requester_name', 'requester_email', 'requester_phone', 'notes'],
  contacts: ['value', 'person_name', 'person_title'],
};

function keyFromHex(hex) {
  const s = String(hex || '').trim();
  if (!s) return null;
  if (!/^[0-9a-fA-F]{64}$/.test(s)) throw new Error('RADAR_V2_FIELD_KEY must be 32-byte hex');
  return Buffer.from(s, 'hex');
}

function encryptValue(plain, key) {
  if (plain == null || plain === '') return plain;
  const s = String(plain);
  if (s.startsWith(PREFIX)) return s;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(s, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64url');
}

function decryptValue(value, key) {
  if (value == null || value === '') return value;
  const s = String(value);
  if (!s.startsWith(PREFIX)) return value;
  const buf = Buffer.from(s.slice(PREFIX.length), 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

function encryptRow(table, row, key) {
  if (!key || !row) return row;
  const fields = SENSITIVE[table];
  if (!fields) return row;
  const out = { ...row };
  for (const f of fields) {
    if (out[f]) out[f] = encryptValue(out[f], key);
  }
  return out;
}

function decryptRow(table, row, key) {
  if (!key || !row) return row;
  const fields = SENSITIVE[table];
  if (!fields) return row;
  const out = { ...row };
  for (const f of fields) {
    if (out[f]) out[f] = decryptValue(out[f], key);
  }
  return out;
}

module.exports = {
  PREFIX,
  SENSITIVE,
  keyFromHex,
  encryptValue,
  decryptValue,
  encryptRow,
  decryptRow,
};
