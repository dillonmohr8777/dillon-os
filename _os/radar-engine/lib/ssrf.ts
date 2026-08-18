'use strict';

const { assertPublicHttpUrl } = require('../../automation/lib/net');

function unwrapMappedIpv4(host) {
  const h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
  const dotted = h.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted) return dotted[1];
  const hex = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hex) return '';
  const a = parseInt(hex[1], 16);
  const b = parseInt(hex[2], 16);
  return `${(a >> 8) & 255}.${a & 255}.${(b >> 8) & 255}.${b & 255}`;
}

function assertSafeScanUrl(raw) {
  const u = assertPublicHttpUrl(raw);
  const host = u.hostname.toLowerCase();
  if (host === 'metadata.google.internal' || host.endsWith('.metadata.google.internal')) {
    throw new Error(`non-public host: ${host}`);
  }
  if (host === '169.254.169.254') throw new Error(`non-public host: ${host}`);
  const mapped = unwrapMappedIpv4(host);
  if (mapped) assertPublicHttpUrl(`https://${mapped}/`);
  return u;
}

function safePathJoin(root, ...parts) {
  const path = require('path');
  const resolved = path.resolve(root, ...parts);
  const base = path.resolve(root);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error('path traversal refused');
  }
  return resolved;
}

module.exports = { assertSafeScanUrl, safePathJoin, unwrapMappedIpv4 };
