'use strict';

const { lookup } = require('node:dns/promises');
const net = require('node:net');

function isPrivateHost(hostname, ip) {
  const host = String(hostname || '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    return true;
  }
  if (net.isIP(host)) {
    return isPrivateIp(host);
  }
  return ip ? isPrivateIp(ip) : false;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map((n) => Number(n));
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  const v6 = String(ip).toLowerCase();
  return v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

async function assertPublicHttpUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('invalid url');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('only http(s) urls are allowed');
  }
  if (url.username || url.password) throw new Error('url credentials are not allowed');
  if (isPrivateHost(url.hostname, net.isIP(url.hostname) ? url.hostname : '')) {
    throw new Error('url points at a private host');
  }
  const looked = await lookup(url.hostname, { all: true });
  for (const rec of looked) {
    if (isPrivateIp(rec.address)) {
      throw new Error('url points at a private host');
    }
  }
  return url;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function webSearch(query) {
  const q = String(query || '').trim();
  if (!q) throw new Error('query is empty');
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, { headers: { 'user-agent': 'immohrtal-claw/0.2' } });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  const json = await res.json();
  const related = Array.isArray(json.RelatedTopics) ? json.RelatedTopics : [];
  const hits = [];
  if (json.AbstractText) {
    hits.push({ title: json.Heading || q, text: json.AbstractText, url: json.AbstractURL || '' });
  }
  for (const item of related) {
    if (item.Text) hits.push({ title: item.Text.slice(0, 80), text: item.Text, url: item.FirstURL || '' });
    if (hits.length >= 6) break;
  }
  return { ok: true, query: q, hits };
}

async function webFetch(rawUrl) {
  const url = await assertPublicHttpUrl(rawUrl);
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'immohrtal-claw/0.2' },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const sliced = buf.subarray(0, 200_000).toString('utf8');
    return {
      ok: res.ok,
      status: res.status,
      url: url.toString(),
      content: stripHtml(sliced).slice(0, 12_000),
    };
  } finally {
    clearTimeout(t);
  }
}

module.exports = { webSearch, webFetch, assertPublicHttpUrl, isPrivateIp };
