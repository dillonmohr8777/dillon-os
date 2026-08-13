'use strict';

const fs = require('fs');
const path = require('path');

const JSONB_HINT = /\bjsonb\b/i;
const ARRAY_HINT = /TEXT\[\]|INTEGER\[\]/i;

function parseMigrationSchema(sql) {
  const tables = {};
  const re = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g;
  let m;
  while ((m = re.exec(sql))) {
    const name = m[1];
    const body = m[2];
    const columns = [];
    const jsonb = new Set();
    const arrays = new Set();
    for (const raw of body.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('--') || /^(PRIMARY|UNIQUE|CONSTRAINT|CHECK|FOREIGN)/i.test(line)) continue;
      const col = line.replace(/,$/, '').split(/\s+/)[0];
      if (!col || col.startsWith('CREATE') || col === 'UNIQUE') continue;
      columns.push(col);
      if (JSONB_HINT.test(line)) jsonb.add(col);
      if (ARRAY_HINT.test(line)) arrays.add(col);
    }
    tables[name] = { columns, jsonb, arrays };
  }
  return tables;
}

function loadMigrationSchema() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_init.sql'), 'utf8');
  return parseMigrationSchema(sql);
}

function encodeValue(tableMeta, col, value) {
  if (value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (tableMeta.jsonb.has(col)) {
    if (value == null) return {};
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return { raw: value }; }
    }
    return value;
  }
  if (tableMeta.arrays.has(col)) {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return value;
}

function encodeRow(schema, table, row) {
  const meta = schema[table];
  if (!meta) throw new Error(`unknown table ${table}`);
  const out = {};
  for (const col of meta.columns) {
    if (!(col in row) && row[col] === undefined) continue;
    const encoded = encodeValue(meta, col, row[col]);
    if (encoded !== undefined) out[col] = encoded;
  }
  return out;
}

function decodeRow(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
}

const CLAIM_JOB_SQL = `
UPDATE jobs
SET status = 'running',
    locked_at = now(),
    locked_by = $1,
    updated_at = now()
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'queued'
    AND dead_letter = false
    AND next_attempt_at <= now()
  ORDER BY next_attempt_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *`;

module.exports = {
  parseMigrationSchema,
  loadMigrationSchema,
  encodeRow,
  decodeRow,
  CLAIM_JOB_SQL,
};
