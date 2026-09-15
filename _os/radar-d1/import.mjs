#!/usr/bin/env node
// Prospect Radar D1 importer.
//
// Reads 12_Brain/state/radar/build-queue.csv and emits batched
// `INSERT OR REPLACE` SQL files for the `prospects` table. No network calls —
// this only writes .sql files to disk. Load them with:
//   npx wrangler d1 execute dillon-radar --remote --file=./out/prospects-0001.sql
//
// Usage: node import.mjs [csvPath] [outDir] [batchSize]

import fs from 'node:fs';
import path from 'node:path';

const csvPath = process.argv[2] || path.join(process.cwd(), '12_Brain/state/radar/build-queue.csv');
const outDir = process.argv[3] || path.join(process.cwd(), '_os/radar-d1/out');
const batchSize = Number(process.argv[4] || 200);

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'unknown';
}

function sqlString(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(Math.trunc(n)) : '0';
}

function main() {
  const raw = fs.readFileSync(csvPath, 'utf8').replace(/\r\n/g, '\n');
  const lines = raw.split('\n').filter((l) => l.length > 0);
  if (lines.length === 0) {
    console.error('CSV is empty');
    process.exit(1);
  }
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const idx = (name) => header.indexOf(name);

  const iScore = idx('priority_score');
  const iName = idx('business_name');
  const iUrl = idx('website');
  const iVertical = idx('vertical');
  const iCity = idx('city');
  const iGraded = idx('last_graded');
  const iFault = idx('worst_fault');

  const rows = lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const name = cols[iName] || '';
    return {
      slug: slugify(name),
      name,
      vertical: cols[iVertical] || '',
      city: cols[iCity] || '',
      url: cols[iUrl] || '',
      score: cols[iScore] || 0,
      worst_fault: cols[iFault] || '',
      tracked_since: cols[iGraded] || '',
      last_audit: cols[iGraded] || '',
    };
  });

  fs.mkdirSync(outDir, { recursive: true });

  let batchIndex = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    batchIndex += 1;
    const statements = batch.map((r) => (
      `INSERT OR REPLACE INTO prospects (slug, name, vertical, city, url, score, worst_fault, tracked_since, last_audit) VALUES (` +
      `${sqlString(r.slug)}, ${sqlString(r.name)}, ${sqlString(r.vertical)}, ${sqlString(r.city)}, ${sqlString(r.url)}, ` +
      `${sqlInt(r.score)}, ${sqlString(r.worst_fault)}, ${sqlString(r.tracked_since)}, ${sqlString(r.last_audit)});`
    ));
    const filePath = path.join(outDir, `prospects-${String(batchIndex).padStart(4, '0')}.sql`);
    fs.writeFileSync(filePath, statements.join('\n') + '\n', 'utf8');
    console.log(`wrote ${filePath} (${batch.length} rows)`);
  }

  console.log(`done: ${rows.length} rows in ${batchIndex} file(s)`);
}

main();
