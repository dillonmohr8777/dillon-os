'use strict';

const crypto = require('node:crypto');

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

function presentedToken(req) {
  const cookies = parseCookies(req);
  if (cookies.claw_gate) return cookies.claw_gate;
  const auth = String(req.headers.authorization || '');
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    return url.searchParams.get('gate') || '';
  } catch {
    return '';
  }
}

function tokensMatch(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function authorized(req, config) {
  if (!config.gateToken) return true;
  return tokensMatch(presentedToken(req), config.gateToken);
}

function isOpenPath(pathname) {
  if (pathname === '/api/health' || pathname === '/api/login') return true;
  if (pathname === '/manifest.webmanifest' || pathname === '/sw.js') return true;
  if (pathname === '/robots.txt') return true;
  return /\.(css|js|svg|png|webmanifest|txt|html|woff2)$/.test(pathname) || pathname === '/';
}

function cookieHeader(token, secure) {
  const parts = [
    `claw_gate=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=2592000',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

module.exports = { authorized, isOpenPath, cookieHeader, presentedToken };
