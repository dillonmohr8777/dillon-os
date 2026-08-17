'use strict';

const { assertPublicHttpUrl } = require('../../automation/lib/net');

function assertSafeScanUrl(raw) {
  const u = assertPublicHttpUrl(raw);
  const host = u.hostname.toLowerCase();
  if (host === 'metadata.google.internal' || host.endsWith('.metadata.google.internal')) {
    throw new Error(`non-public host: ${host}`);
  }
  if (host === '169.254.169.254') throw new Error(`non-public host: ${host}`);
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

module.exports = { assertSafeScanUrl, safePathJoin };
