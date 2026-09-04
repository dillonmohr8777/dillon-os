#!/usr/bin/env node
'use strict';

/**
 * Download Firecrawl-extracted image URLs into harvest/<slug>/photos.
 * Input: JSON array of { url, images: string[] } or Firecrawl batch data[].
 */

const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const HARVEST = path.join(HERE, 'harvest');
const needs = require('./pickup-needs-urls.json');

const byHost = new Map();
for (const row of needs) {
  try {
    const host = new URL(row.url).hostname.replace(/^www\./, '');
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(row);
  } catch {
    /* skip */
  }
}

function slugForPageUrl(pageUrl) {
  try {
    const host = new URL(pageUrl).hostname.replace(/^www\./, '');
    const rows = byHost.get(host) || [];
    if (rows.length === 1) return rows[0].slug;
    const exact = rows.find((r) => r.url.replace(/\/$/, '') === String(pageUrl).replace(/\/$/, ''));
    return (exact || rows[0] || {}).slug;
  } catch {
    return '';
  }
}

function extractImages(md, html) {
  const urls = new Set();
  const blob = `${md || ''}\n${html || ''}`;
  for (const m of blob.matchAll(/https?:\/\/[^\s)"']+\.(?:jpe?g|png|webp)(?:\?[^\s)"']*)?/gi)) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (/(logo|icon|sprite|favicon|pixel|1x1|badge|button|placeholder)/i.test(u)) continue;
    urls.add(u);
  }
  for (const m of blob.matchAll(/!\[[^\]]*]\((https?:[^)]+)\)/g)) urls.add(m[1]);
  return [...urls];
}

async function download(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 DillonOS-unslop' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) return null;
  return buf;
}

function extOf(url, buf) {
  if (buf && buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf && buf[0] === 0x89) return 'png';
  if (buf && buf.toString('ascii', 0, 4) === 'RIFF') return 'webp';
  const m = String(url).match(/\.(jpe?g|png|webp)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('usage: ingest-firecrawl.js <batch.json>');
    process.exit(2);
  }
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const pages = Array.isArray(raw) ? raw : raw.data || raw.results || [];
  const summary = [];
  for (const page of pages) {
    const pageUrl = page.metadata?.sourceURL || page.url || page.sourceURL || '';
    const slug = page.slug || slugForPageUrl(pageUrl);
    if (!slug) continue;
    const images = page.images || extractImages(page.markdown || page.md, page.html);
    const dir = path.join(HARVEST, slug, 'photos');
    fs.mkdirSync(dir, { recursive: true });
    let saved = 0;
    let idx = fs.readdirSync(dir).filter((f) => /^src-\d+\./.test(f)).length;
    for (const imgUrl of images.slice(0, 12)) {
      try {
        const buf = await download(imgUrl);
        if (!buf) continue;
        const ext = extOf(imgUrl, buf);
        fs.writeFileSync(path.join(dir, `src-${idx}.${ext}`), buf);
        idx += 1;
        saved += 1;
        if (saved >= 8) break;
      } catch {
        /* skip */
      }
    }
    summary.push({ slug, pageUrl, candidates: images.length, saved });
  }
  console.log(JSON.stringify({ pages: summary.length, saved: summary.filter((s) => s.saved).length, summary }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
