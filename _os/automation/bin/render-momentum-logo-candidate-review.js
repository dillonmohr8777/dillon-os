#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, repoPath } = require('../lib/fsutil');

function argValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function insideRepo(candidate) {
  const absolute = path.resolve(candidate);
  const root = path.resolve(REPO_ROOT);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Path escapes the Dillon OS repository: ${candidate}`);
  }
  return absolute;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function chunk(rows, size) {
  const result = [];
  for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
  return result;
}

function main() {
  const manifestPath = insideRepo(argValue('--manifest', repoPath('System', 'outcome-graph', 'web-design', 'momentum-particle-logo-candidates-2026-08-24', 'candidate-manifest.json')));
  const outputDir = insideRepo(argValue('--out-dir', path.dirname(manifestPath)));
  const perSheet = Number(argValue('--per-sheet', '40'));
  if (!Number.isInteger(perSheet) || perSheet < 1 || perSheet > 60) throw new Error('per-sheet must be from 1 to 60.');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
  const candidates = manifest.candidates
    .filter((candidate) => candidate.extraction_state === 'candidate_extracted')
    .sort((left, right) => left.business.localeCompare(right.business));
  const sheets = chunk(candidates, perSheet);
  const index = [];
  fs.mkdirSync(outputDir, { recursive: true });
  sheets.forEach((rows, sheetIndex) => {
    const number = String(sheetIndex + 1).padStart(2, '0');
    const filename = `review-${number}.html`;
    const cards = rows.map((candidate) => {
      const asset = path.basename(candidate.candidate_asset);
      return `<article>
        <div class="logo-stage"><img src="assets/${escapeHtml(asset)}" alt=""></div>
        <p>${escapeHtml(candidate.classification)} // ${escapeHtml(candidate.route_slug)}</p>
        <h2>${escapeHtml(candidate.business)}</h2>
        <small>${escapeHtml(candidate.page_id)} // ${escapeHtml(candidate.content_type)}</small>
      </article>`;
    }).join('\n');
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Momentum particle logo candidates ${number}</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:36px;background:#07101f;color:#e8f2fb;font:14px/1.4 Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:24px;border-bottom:2px solid #18c8ff;padding-bottom:16px}header h1{margin:0;font-size:28px}header p{margin:0;color:#9fb2c9}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}article{min-height:238px;padding:14px;background:#0b1729;border:1px solid #29506e}.logo-stage{height:150px;display:flex;align-items:center;justify-content:center;padding:18px;background:linear-gradient(45deg,#e8f2fb 25%,#d6e6f4 25%,#d6e6f4 50%,#e8f2fb 50%,#e8f2fb 75%,#d6e6f4 75%);background-size:24px 24px}.logo-stage img{display:block;max-width:100%;max-height:100%;object-fit:contain}article p{margin:12px 0 4px;color:#18c8ff;font-size:10px;text-transform:uppercase;letter-spacing:.12em}article h2{margin:0 0 7px;font-size:16px}article small{color:#9fb2c9;font-size:9px}
</style></head><body><header><h1>Candidate logo review // ${number}</h1><p>${rows.length} candidates // visual verification required</p></header><main class="grid">${cards}</main></body></html>`;
    fs.writeFileSync(path.join(outputDir, filename), html, 'utf8');
    index.push({ sheet: number, filename, count: rows.length, page_ids: rows.map((row) => row.page_id) });
  });
  fs.writeFileSync(path.join(outputDir, 'review-index.json'), `${JSON.stringify({
    schema_version: 1,
    state: 'visual_review_required',
    candidate_count: candidates.length,
    sheet_count: sheets.length,
    sheets: index,
  }, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ candidate_count: candidates.length, sheet_count: sheets.length, output_dir: outputDir }, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
