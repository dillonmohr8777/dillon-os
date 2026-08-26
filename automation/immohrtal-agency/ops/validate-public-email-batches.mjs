import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_HEADER = [
  'company',
  'domain',
  'public_email',
  'contact_name',
  'contact_role',
  'city',
  'state',
  'vertical',
  'source_url',
  'email_type',
  'evidence_status',
  'notes'
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('CSV ended inside a quoted field.');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function normalizeDomain(value) {
  return String(value || '').trim().toLowerCase().replace(/^www\./, '');
}

function sourceMatchesDomain(sourceUrl, domain) {
  const host = normalizeDomain(new URL(sourceUrl).hostname);
  const normalizedDomain = normalizeDomain(domain);
  return host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);
}

function defaultRepoRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), '..', '..', '..');
}

function validateFile(filePath, globalState) {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  const errors = [];
  const states = new Set();

  if (rows.length === 0) return { file: filePath, row_count: 0, states: [], errors: ['File is empty.'] };

  const header = rows[0];
  if (JSON.stringify(header) !== JSON.stringify(EXPECTED_HEADER)) {
    errors.push(`Header mismatch. Expected ${EXPECTED_HEADER.join(',')}.`);
  }

  for (let index = 1; index < rows.length; index += 1) {
    const values = rows[index];
    const line = index + 1;
    if (values.length !== EXPECTED_HEADER.length) {
      errors.push(`Line ${line}: expected ${EXPECTED_HEADER.length} columns, received ${values.length}.`);
      continue;
    }

    const record = Object.fromEntries(EXPECTED_HEADER.map((key, column) => [key, values[column].trim()]));
    const email = record.public_email.toLowerCase();
    const domain = normalizeDomain(record.domain);

    if (!record.company) errors.push(`Line ${line}: company is required.`);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) errors.push(`Line ${line}: invalid domain ${record.domain}.`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(`Line ${line}: invalid public email ${record.public_email}.`);
    if (!record.city) errors.push(`Line ${line}: city is required.`);
    if (!/^[A-Z]{2}$/.test(record.state)) errors.push(`Line ${line}: state must be a two-letter uppercase code.`);
    if (record.evidence_status !== 'VERIFIED') errors.push(`Line ${line}: evidence_status must be VERIFIED.`);
    if (!['generic_business', 'named_business'].includes(record.email_type)) errors.push(`Line ${line}: unsupported email_type ${record.email_type}.`);
    if (!record.notes) errors.push(`Line ${line}: evidence notes are required.`);
    if (/[\u2013\u2014]/.test(values.join(' '))) errors.push(`Line ${line}: en dash or em dash is prohibited.`);

    try {
      const source = new URL(record.source_url);
      if (source.protocol !== 'https:') errors.push(`Line ${line}: source_url must use HTTPS.`);
      if (!sourceMatchesDomain(record.source_url, domain)) errors.push(`Line ${line}: source host does not match the company domain.`);
    } catch {
      errors.push(`Line ${line}: invalid source_url ${record.source_url}.`);
    }

    if (globalState.emails.has(email)) {
      errors.push(`Line ${line}: duplicate public email also appears in ${globalState.emails.get(email)}.`);
    } else {
      globalState.emails.set(email, `${path.basename(filePath)}:${line}`);
    }

    if (globalState.domains.has(domain)) {
      errors.push(`Line ${line}: duplicate company domain also appears in ${globalState.domains.get(domain)}.`);
    } else {
      globalState.domains.set(domain, `${path.basename(filePath)}:${line}`);
    }
    states.add(record.state);
  }

  return {
    file: path.relative(defaultRepoRoot(), filePath).replaceAll('\\', '/'),
    row_count: Math.max(0, rows.length - 1),
    states: [...states].sort(),
    errors
  };
}

const repoRoot = path.resolve(process.argv[2] || defaultRepoRoot());
const batchDir = path.join(repoRoot, '06_Revenue', 'IMMOHRTAL', 'lead-intelligence', 'public-email-batches');

if (!fs.existsSync(batchDir)) {
  process.stderr.write(`Batch directory not found: ${batchDir}\n`);
  process.exit(2);
}

const files = fs.readdirSync(batchDir)
  .filter((name) => name.toLowerCase().endsWith('.csv'))
  .sort()
  .map((name) => path.join(batchDir, name));

const globalState = { emails: new Map(), domains: new Map() };
const results = files.map((filePath) => validateFile(filePath, globalState));
const summary = {
  status: results.every((result) => result.errors.length === 0) ? 'passed' : 'failed',
  files_checked: results.length,
  rows_checked: results.reduce((sum, result) => sum + result.row_count, 0),
  states_covered: [...new Set(results.flatMap((result) => result.states))].sort(),
  results
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
if (summary.status !== 'passed') process.exitCode = 1;
