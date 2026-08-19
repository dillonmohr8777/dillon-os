#!/usr/bin/env node
'use strict';

/**
 * Teach the radar what we have already built.
 *
 * The gap this closes: 238 pages were built for 236 businesses over three weeks
 * and not one registry row knew. Every one still read `queued_build`, the
 * priority score still ranked them as needing a build, and two businesses were
 * built twice by two different lanes because nothing recorded the first pass.
 *
 * Usage
 *   node bin/record-builds.js --csv <path-to-built-sites.csv> [--dry-run]
 *   node bin/record-builds.js --json <path-to-manifest.json> [--dry-run]
 *
 * The CSV is the site-inventory export (client-operations-canonical
 * reports/<date>-site-inventory/built-sites.csv). It is read **in place and never
 * copied**: it carries phone numbers and email addresses, and this repository is
 * public. Only the build facts — url, batch, QA state, showable — reach the
 * registry.
 *
 * Columns used, all optional except a way to identify the business:
 *   Business | Their site | Our concept | Batch | Show? | QA state | Fix reason
 *
 * A row is matched to a registry key by their own domain first (the only stable
 * identifier) and by normalised business name second.
 */

const fs = require('fs');
const path = require('path');
const radar = require('../lib/radar');
const { normalizeDomain } = require('../lib/discovery');
const { todayISO } = require('../lib/fsutil');

function parseArgs(argv) {
  const o = { csv: '', json: '', dryRun: false, date: todayISO(), help: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--csv') o.csv = String(argv[++i] || '');
    else if (a === '--json') o.json = String(argv[++i] || '');
    else if (a === '--date') o.date = String(argv[++i] || o.date);
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

/** Minimal RFC4180-ish reader: the inventory has quoted commas in names. */
function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => String(c).trim() !== ''))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function slug(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-(llc|inc|pc|co|ltd)$/, '');
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || (!args.csv && !args.json)) {
    process.stdout.write(
      'usage: record-builds.js --csv <built-sites.csv> [--dry-run]\n' +
      '       record-builds.js --json <manifest.json> [--dry-run]\n\n' +
      'Marks registry rows as built so the radar stops re-queueing pages that exist.\n'
    );
    process.exit(args.help ? 0 : 1);
  }

  const src = args.csv || args.json;
  if (!fs.existsSync(src)) {
    process.stderr.write(`no such file: ${src}\n`);
    process.exit(1);
  }

  let records;
  if (args.csv) {
    records = readCsv(src).map((r) => ({
      business: r.Business || r.business || '',
      their_site: r['Their site'] || r.their_site || '',
      url: r['Our concept'] || r.url || '',
      batch: r.Batch || r.batch || '',
      showable: /^(yes|y|true)$/i.test(r['Show?'] || r.showable || ''),
      qa_state: r['QA state'] || r.qa_state || '',
      note: r['Fix reason'] || r.note || '',
    }));
  } else {
    const doc = JSON.parse(fs.readFileSync(src, 'utf8'));
    records = Array.isArray(doc) ? doc : (doc.builds || doc.sites || []);
  }

  const registry = radar.load();
  const rows = Object.values(registry.prospects);
  // Name index for rows whose own URL was never captured in the inventory.
  const byName = new Map();
  for (const p of rows) {
    const k = slug(p.business_name);
    if (k && !byName.has(k)) byName.set(k, p.domain);
  }

  const stats = { recorded: 0, showable: 0, held: 0, unmatched: 0, already: 0 };
  const unmatched = [];

  for (const rec of records) {
    let key = '';
    const dom = rec.their_site ? normalizeDomain(rec.their_site) : '';
    if (dom && registry.prospects[dom]) key = dom;
    if (!key) {
      const guess = byName.get(slug(rec.business));
      if (guess) key = guess;
    }
    if (!key) {
      stats.unmatched += 1;
      unmatched.push(rec.business || rec.their_site || '(unnamed)');
      continue;
    }
    const before = registry.prospects[key].build ? 1 : 0;
    radar.recordBuild(registry, key, {
      url: rec.url,
      batch: rec.batch,
      date: args.date,
      showable: rec.showable,
      qa_state: rec.qa_state,
      note: rec.note,
    });
    if (before) stats.already += 1;
    stats.recorded += 1;
    if (rec.showable) stats.showable += 1;
    else stats.held += 1;
  }

  process.stdout.write(
    `${records.length} build record(s) read from ${path.basename(src)}\n` +
    `  matched and recorded : ${stats.recorded}\n` +
    `    cleared to show    : ${stats.showable}\n` +
    `    held (not cleared) : ${stats.held}\n` +
    `  already had a build  : ${stats.already}\n` +
    `  no registry row      : ${stats.unmatched}\n`
  );
  if (unmatched.length) {
    process.stdout.write(
      '\nNot in the registry — these were built without ever being graded:\n' +
      unmatched.slice(0, 40).map((n) => `  - ${n}`).join('\n') +
      (unmatched.length > 40 ? `\n  ... and ${unmatched.length - 40} more\n` : '\n')
    );
  }

  if (args.dryRun) {
    process.stdout.write('\ndry run: registry not written\n');
    return;
  }
  radar.save(registry);
  process.stdout.write(`\nregistry updated: ${radar.REGISTRY_PATH}\n`);
}

if (require.main === module) main();
module.exports = { readCsv, slug };
