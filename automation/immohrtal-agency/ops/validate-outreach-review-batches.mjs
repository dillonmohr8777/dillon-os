import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HEADER = [
  'company', 'domain', 'public_email', 'contact_name', 'contact_role', 'city', 'state',
  'vertical', 'source_url', 'evidence_checked_utc', 'opportunity_observation', 'offer_lane',
  'subject', 'body', 'review_state', 'blocker'
];

const EXACT_OPT_OUT = 'If you would rather not hear from me, reply no thanks and I will close the loop.';
const ALLOWED_REVIEW_STATE = 'DRAFT_ONLY_DO_NOT_SEND';
const ALLOWED_BLOCKER = 'SENDER_POSTAL_SUPPRESSION_AND_EXACT_APPROVAL';
const PROHIBITED_LANGUAGE = [
  'i hope this email finds you well',
  'i wanted to reach out',
  'unlock your full potential',
  'transform your online presence',
  'cutting edge',
  'fast paced digital landscape',
  'just checking in',
  'circling back',
  'let me know if you are interested',
  'revolutionize',
  'leverage ai',
  'ai-powered',
  'seamless solution',
  'holistic solution'
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

function countWords(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function countUrls(value) {
  return (String(value || '').match(/https:\/\/[^\s)]+/g) || []).length;
}

function rootFromScript() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function validateFile(filePath, globalState) {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  const errors = [];
  if (JSON.stringify(rows[0] || []) !== JSON.stringify(HEADER)) errors.push('Header mismatch.');

  for (let index = 1; index < rows.length; index += 1) {
    const line = index + 1;
    const values = rows[index];
    if (values.length !== HEADER.length) {
      errors.push(`Line ${line}: expected ${HEADER.length} columns, received ${values.length}.`);
      continue;
    }
    const record = Object.fromEntries(HEADER.map((name, column) => [name, values[column].trim()]));
    const bodyLower = record.body.toLowerCase();
    const subjectLower = record.subject.toLowerCase();
    const email = record.public_email.toLowerCase();
    const domain = normalizeDomain(record.domain);
    const bodyWords = countWords(record.body);

    if (!record.company || !record.city || !record.vertical || !record.opportunity_observation) errors.push(`Line ${line}: required business evidence is missing.`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(`Line ${line}: invalid email.`);
    if (!/^[A-Z]{2}$/.test(record.state)) errors.push(`Line ${line}: invalid state code.`);
    if (!/^https:\/\//.test(record.source_url)) errors.push(`Line ${line}: source_url must use HTTPS.`);
    try {
      const host = normalizeDomain(new URL(record.source_url).hostname);
      if (host !== domain && !host.endsWith(`.${domain}`)) errors.push(`Line ${line}: source host does not match company domain.`);
    } catch {
      errors.push(`Line ${line}: invalid source_url.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(record.evidence_checked_utc)) errors.push(`Line ${line}: evidence_checked_utc must be an ISO UTC timestamp.`);
    if (!record.subject || record.subject.length > 60) errors.push(`Line ${line}: subject must be 1 to 60 characters.`);
    if (/^(re|fw|fwd)\s*:/i.test(record.subject)) errors.push(`Line ${line}: fake reply or forward subject is prohibited.`);
    if (bodyWords < 60 || bodyWords > 110) errors.push(`Line ${line}: body has ${bodyWords} words; expected 60 to 110.`);
    if (!record.body.includes(EXACT_OPT_OUT)) errors.push(`Line ${line}: exact opt-out sentence is missing.`);
    if (countUrls(record.body) > 1) errors.push(`Line ${line}: body contains more than one URL.`);
    if (/[\u2013\u2014]/.test(values.join(' '))) errors.push(`Line ${line}: en dash or em dash is prohibited.`);
    if (/\[[^\]]+\]/.test(record.body) || /\{\{[^}]+\}\}/.test(record.body)) errors.push(`Line ${line}: unresolved placeholder detected.`);
    for (const phrase of PROHIBITED_LANGUAGE) {
      if (bodyLower.includes(phrase)) errors.push(`Line ${line}: prohibited phrase '${phrase}'.`);
    }
    if (subjectLower.includes('quick question')) errors.push(`Line ${line}: generic subject 'quick question' is prohibited for this personalized batch.`);
    if (record.review_state !== ALLOWED_REVIEW_STATE) errors.push(`Line ${line}: review_state must remain ${ALLOWED_REVIEW_STATE}.`);
    if (record.blocker !== ALLOWED_BLOCKER) errors.push(`Line ${line}: blocker must remain ${ALLOWED_BLOCKER}.`);
    if (globalState.emails.has(email)) errors.push(`Line ${line}: duplicate recipient in ${globalState.emails.get(email)}.`);
    else globalState.emails.set(email, `${path.basename(filePath)}:${line}`);
    if (globalState.domains.has(domain)) errors.push(`Line ${line}: duplicate domain in ${globalState.domains.get(domain)}.`);
    else globalState.domains.set(domain, `${path.basename(filePath)}:${line}`);
  }

  return { file: path.basename(filePath), rows: Math.max(rows.length - 1, 0), errors };
}

const repoRoot = path.resolve(process.argv[2] || rootFromScript());
const outreachDir = path.join(repoRoot, 'immohrtal-marketing-site', 'research', 'outreach');
const files = fs.readdirSync(outreachDir)
  .filter((name) => /^DAY-1-NATIONAL-REVIEW-BATCH-[A-Z]\.csv$/i.test(name))
  .sort()
  .map((name) => path.join(outreachDir, name));

const globalState = { emails: new Map(), domains: new Map() };
const results = files.map((file) => validateFile(file, globalState));
const totalRows = results.reduce((sum, result) => sum + result.rows, 0);
const errors = results.flatMap((result) => result.errors.map((error) => `${result.file}: ${error}`));
const summary = {
  status: files.length === 2 && totalRows === 50 && errors.length === 0 ? 'passed' : 'failed',
  files_checked: files.length,
  rows_checked: totalRows,
  unique_emails: globalState.emails.size,
  unique_domains: globalState.domains.size,
  errors,
  results
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
if (summary.status !== 'passed') process.exitCode = 1;
