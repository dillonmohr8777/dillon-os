import fs from 'node:fs';
import path from 'node:path';

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value);
      value = '';
    } else value += char;
  }
  if (quoted) throw new Error('Malformed CSV: unmatched quote.');
  values.push(value);
  return values;
}

function csvValue(value) {
  const clean = String(value ?? '').trim();
  if (/^(true|false)$/i.test(clean)) return clean.toLowerCase() === 'true';
  return clean;
}

export function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV must contain a header and at least one row.');
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) throw new Error(`CSV row ${index + 2} has ${values.length} columns; expected ${headers.length}.`);
    const row = Object.fromEntries(headers.map((header, column) => [header, csvValue(values[column])]));
    row.allowed_channels = String(row.allowed_channels || '').split('|').filter(Boolean);
    row.observations = String(row.observations || '').split('|').filter(Boolean);
    return row;
  });
}

export function loadInput(inputPath) {
  const absolute = path.resolve(inputPath);
  const extension = path.extname(absolute).toLowerCase();
  const raw = fs.readFileSync(absolute, 'utf8');
  if (extension === '.json') {
    const document = JSON.parse(raw);
    if (!Array.isArray(document.prospects)) throw new Error('JSON input must have a prospects array.');
    return { source: document.source || { source_type: 'local_json' }, prospects: document.prospects, input_path: absolute };
  }
  if (extension === '.csv') {
    return {
      source: { source_id: path.basename(absolute), source_type: 'local_csv', label: 'local CSV input', requalified_for_immohrtal: true },
      prospects: parseCsv(raw),
      input_path: absolute
    };
  }
  throw new Error('Input adapter supports only .json and .csv files.');
}

export function loadSuppressions(suppressionPath) {
  if (!suppressionPath) return [];
  const document = JSON.parse(fs.readFileSync(path.resolve(suppressionPath), 'utf8'));
  if (!Array.isArray(document.entries)) throw new Error('Suppression input must have an entries array.');
  return document.entries;
}

