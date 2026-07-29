/**
 * Shared validation for site-factory inputs.
 * Rejects path traversal, non-public URLs, and hostile slugs before any path join.
 */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MiB per image
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);
const ALLOWED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']);

function assertSafeSlug(slug) {
  const s = String(slug ?? '');
  if (!s) throw new Error('slug is required');
  if (s.includes('..') || s.includes('/') || s.includes('\\') || s.includes('\0')) {
    throw new Error(`slug rejects path traversal: ${JSON.stringify(s)}`);
  }
  if (!SLUG_RE.test(s)) {
    throw new Error(`slug must match ${SLUG_RE}: ${JSON.stringify(s)}`);
  }
  return s;
}

/**
 * Only public http(s) URLs. Rejects file:, data:, javascript:, and localhost/private hosts.
 */
function assertPublicHttpUrl(raw, label = 'url') {
  let u;
  try {
    u = new URL(String(raw ?? ''));
  } catch {
    throw new Error(`${label} is not a valid URL: ${JSON.stringify(raw)}`);
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error(`${label} must be http(s), got ${u.protocol}`);
  }
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host === 'metadata.google.internal'
  ) {
    throw new Error(`${label} rejects private/non-public host: ${host}`);
  }
  return u.toString();
}

function assertSafeImageContentType(contentType, label = 'image') {
  const base = String(contentType || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (!base) return null;
  if (!ALLOWED_IMAGE_TYPES.has(base)) {
    throw new Error(`${label} content-type not allowed: ${base}`);
  }
  return base;
}

function assertSafeImageExt(ext) {
  const e = String(ext || '')
    .toLowerCase()
    .replace(/^\./, '');
  if (!ALLOWED_IMAGE_EXTS.has(e)) {
    throw new Error(`image extension not allowed: ${e}`);
  }
  return e === 'jpeg' ? 'jpg' : e;
}

function assertImageByteLimit(byteLength, limit = MAX_IMAGE_BYTES) {
  const n = Number(byteLength) || 0;
  if (n > limit) throw new Error(`image exceeds ${limit} byte cap (${n} bytes)`);
  if (n < 8000) throw new Error(`image too small to keep (${n} bytes)`);
  return n;
}

module.exports = {
  SLUG_RE,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTS,
  assertSafeSlug,
  assertPublicHttpUrl,
  assertSafeImageContentType,
  assertSafeImageExt,
  assertImageByteLimit,
};
