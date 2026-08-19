#!/usr/bin/env node
'use strict';

/** Cross-batch QA: unique collage hashes, receipts, food vs people mode. */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { familyFor, modeFor } = require('./intent');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-unslop-20260819');
const HERE = __dirname;

function loadQueue() {
  const rows = fs.readFileSync(path.join(HERE, 'queue.csv'), 'utf8').trim().split(/\n/).slice(1);
  return rows.map((line) => {
    const parts = [];
    let cur = '';
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) {
        parts.push(cur);
        cur = '';
      } else cur += ch;
    }
    parts.push(cur);
    const [id, name, slug, issue, drop] = parts;
    return { id: Number(id), name, slug, issue, drop: drop === '1' };
  });
}

function hashFile(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function main() {
  const queue = loadQueue();
  const hashes = new Map();
  const report = { ready: [], needsGen: [], blocked: [], dropped: [], collisions: [], modeMismatch: [], wordmark: [], thinLayout: [], thinCopy: [] };
  for (const row of queue) {
    if (row.drop) {
      report.dropped.push(row.slug);
      continue;
    }
    const expected = modeFor(familyFor(row.name, row.slug));
    const receiptPath = path.join(OUT, 'sites', row.slug, 'RECEIPT.json');
    if (!fs.existsSync(receiptPath)) {
      report.blocked.push({ slug: row.slug, error: 'missing receipt' });
      continue;
    }
    const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    if (receipt.mode !== expected) {
      report.modeMismatch.push({ slug: row.slug, got: receipt.mode, expected });
    }
    if (receipt.ok) {
      for (let i = 1; i <= 5; i++) {
        const f = path.join(OUT, 'sites', row.slug, 'assets', `collage-${i}.webp`);
        if (!fs.existsSync(f)) {
          report.blocked.push({ slug: row.slug, error: `missing collage-${i}` });
          continue;
        }
        const h = hashFile(f);
        if (hashes.has(h)) report.collisions.push({ hash: h, a: hashes.get(h), b: `${row.slug}/collage-${i}` });
        else hashes.set(h, `${row.slug}/collage-${i}`);
      }
      const htmlPath = path.join(OUT, 'sites', row.slug, 'index.html');
      const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
      const logoPath = path.join(OUT, 'sites', row.slug, 'assets', 'logo.png');
      const logoSvg = path.join(OUT, 'sites', row.slug, 'assets', 'logo.svg');
      const logoBytes = fs.existsSync(logoPath) ? fs.statSync(logoPath).size : 0;
      const hasLogo = logoBytes >= 2048 || (fs.existsSync(logoSvg) && fs.statSync(logoSvg).size >= 400);
      const sections = (html.match(/<section/g) || []).length;
      report.ready.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        mode: receipt.mode,
        hasLogo,
        logoBytes,
        sections,
        jsonLd: /application\/ld\+json/.test(html),
        copyWords: receipt.copyWords || 0,
      });
      if (!hasLogo) report.wordmark.push(row.slug);
      if (sections < 8) report.thinLayout.push(row.slug);
      if ((receipt.copyWords || 0) && receipt.copyWords < 250) report.thinCopy.push(row.slug);
    } else if (receipt.needsGen) report.needsGen.push({ id: row.id, slug: row.slug, name: row.name, mode: expected, prompts: receipt.prompts });
    else report.blocked.push({ slug: row.slug, error: receipt.error || 'not ok' });
  }
  const out = {
    ready: report.ready.length,
    needsGen: report.needsGen.length,
    blocked: report.blocked.length,
    dropped: report.dropped.length,
    collisions: report.collisions.length,
    modeMismatch: report.modeMismatch.length,
    logos: report.ready.filter((r) => r.hasLogo).length,
    wordmark: report.wordmark.length,
    thinLayout: report.thinLayout.length,
    thinCopy: report.thinCopy.length,
    details: report,
  };
  fs.writeFileSync(path.join(OUT, 'QA.json'), JSON.stringify(out, null, 2));
  console.log(
    JSON.stringify({
      ready: out.ready,
      needsGen: out.needsGen,
      blocked: out.blocked,
      dropped: out.dropped,
      collisions: out.collisions,
      modeMismatch: out.modeMismatch,
      logos: out.logos,
      wordmark: out.wordmark,
      thinLayout: out.thinLayout,
      thinCopy: out.thinCopy,
    })
  );
}

main();
