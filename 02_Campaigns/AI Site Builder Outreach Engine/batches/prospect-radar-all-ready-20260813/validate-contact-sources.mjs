import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const releaseRoot = path.resolve(process.argv[2] || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-all-245-20260813');
const contacts = JSON.parse(fs.readFileSync(path.join(releaseRoot, 'CALL-READY-CONTACTS.json'), 'utf8')).records;
const adjudications = JSON.parse(fs.readFileSync(path.join(scriptRoot, 'contact-source-adjudications.json'), 'utf8')).records;
const targets = contacts.filter(record => /source revalidation required/i.test(record.verification || '') || adjudications[record.slug]);
const digits = value => String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

async function check(record) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const adjudication = adjudications[record.slug];
  let direct = {};
  try {
    const response = await fetch(record.sourceUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Momentum360ContactQA/1.0)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    const body = await response.text();
    const phone = digits(record.phone);
    const compact = body.replace(/\D/g, '');
    const match = compact.includes(phone) || compact.includes(`1${phone}`);
    direct = {
      slug: record.slug,
      business: record.business,
      phone: record.phone,
      sourceUrl: record.sourceUrl,
      finalUrl: response.url,
      status: response.status,
      contentType: response.headers.get('content-type') || '',
      bytes: Buffer.byteLength(body),
      phoneMatch: match,
      directPass: response.ok && match,
    };
  } catch (error) {
    direct = {
      slug: record.slug,
      business: record.business,
      phone: record.phone,
      sourceUrl: record.sourceUrl,
      status: 0,
      phoneMatch: false,
      directPass: false,
      error: error.name === 'AbortError' ? 'timeout' : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
  const adjudicated = Boolean(
    adjudication
    && digits(adjudication.phone) === digits(record.phone)
    && /^https?:\/\//i.test(adjudication.evidenceUrl || '')
  );
  return {
    ...direct,
    pass: direct.directPass || adjudicated,
    verificationMode: direct.directPass ? 'direct-source-fetch' : adjudicated ? 'indexed-source-adjudication' : 'unverified',
    evidenceUrl: adjudicated ? adjudication.evidenceUrl : direct.finalUrl || record.sourceUrl,
    evidenceType: adjudicated ? adjudication.evidenceType : 'direct source fetch',
    evidenceNote: adjudicated ? adjudication.note : '',
    checkedAt: new Date().toISOString(),
  };
}

const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: Math.min(8, targets.length) }, async () => {
  while (cursor < targets.length) {
    const index = cursor++;
    results[index] = await check(targets[index]);
  }
}));

const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  summary: {
    targets: results.length,
    passes: results.filter(result => result.pass).length,
    failures: results.filter(result => !result.pass).length,
  },
  failures: results.filter(result => !result.pass),
  results,
};
fs.writeFileSync(path.join(releaseRoot, 'CONTACT-SOURCE-VALIDATION.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
if (report.summary.failures) console.log(JSON.stringify(report.failures, null, 2));
process.exitCode = report.summary.failures ? 1 : 0;
