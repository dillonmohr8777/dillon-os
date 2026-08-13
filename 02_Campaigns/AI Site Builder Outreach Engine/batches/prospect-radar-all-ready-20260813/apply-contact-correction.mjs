import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const releaseRoot = path.resolve(process.argv[2] || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-all-245-20260813');
const slug = process.argv[3] || 'wja-landscaping';
const policy = JSON.parse(fs.readFileSync(path.join(scriptRoot, 'contact-policy.json'), 'utf8'));
const override = policy.overrides[slug];
if (!override?.phone) throw new Error(`No phone override configured for ${slug}`);

const digits = value => String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const formatPhone = value => {
  const number = digits(value);
  if (number.length !== 10) throw new Error(`Invalid corrected phone for ${slug}: ${value}`);
  return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
};
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const manifestFile = path.join(releaseRoot, 'ALL-BUSINESSES-MANIFEST.json');
const contactsFile = path.join(releaseRoot, 'CALL-READY-CONTACTS.json');
const manifest = readJson(manifestFile);
const contacts = readJson(contactsFile);
const manifestRecord = manifest.records.find(record => record.slug === slug);
const contactRecord = contacts.records.find(record => record.slug === slug);
if (!manifestRecord || !contactRecord) throw new Error(`Release records missing for ${slug}`);

const oldPhone = contactRecord.phone;
const oldDigits = digits(oldPhone);
const newPhone = formatPhone(override.phone);
const newDigits = digits(newPhone);
const rewritePhone = value => String(value)
  .replaceAll(`+1${oldDigits}`, `+1${newDigits}`)
  .replaceAll(oldPhone, newPhone)
  .replaceAll(`${oldDigits.slice(0, 3)}-${oldDigits.slice(3, 6)}-${oldDigits.slice(6)}`, `${newDigits.slice(0, 3)}-${newDigits.slice(3, 6)}-${newDigits.slice(6)}`)
  .replaceAll(oldDigits, newDigits);

for (const record of [manifestRecord, contactRecord]) {
  record.phone = newPhone;
  record.phoneDigits = newDigits;
  record.sourceUrl = override.sourceUrl || record.sourceUrl;
  record.address = override.address || record.address;
  record.verification = override.verification || record.verification;
  record.verifiedAt = policy.verifiedAt;
}
writeJson(manifestFile, manifest);
writeJson(contactsFile, contacts);

const sourceSite = path.join(manifestRecord.copiedFrom, 'index.html');
const releaseSite = path.join(releaseRoot, 'dist', 'sites', slug, 'index.html');
const hub = path.join(releaseRoot, 'dist', 'index.html');
for (const file of [sourceSite, releaseSite, hub]) {
  if (!fs.existsSync(file)) throw new Error(`Required HTML is missing: ${file}`);
  fs.writeFileSync(file, rewritePhone(fs.readFileSync(file, 'utf8')), 'utf8');
}

const callSheet = path.join(releaseRoot, 'JESSE-CALL-SHEET.csv');
const sheetLines = rewritePhone(fs.readFileSync(callSheet, 'utf8')).split(/\r?\n/);
const sheetRowIndex = sheetLines.findIndex(line => line.includes(`"${contactRecord.business.replaceAll('"', '""')}"`));
if (sheetRowIndex < 0) throw new Error(`Call sheet row missing for ${slug}`);
const sheetCells = [...sheetLines[sheetRowIndex].matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replaceAll('""', '"'));
if (sheetCells.length !== 13) throw new Error(`Unexpected call sheet column count for ${slug}: ${sheetCells.length}`);
sheetCells[2] = newPhone;
sheetCells[3] = override.sourceUrl || sheetCells[3];
sheetCells[4] = policy.verifiedAt;
sheetCells[5] = override.address || sheetCells[5];
sheetLines[sheetRowIndex] = sheetCells.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',');
fs.writeFileSync(callSheet, sheetLines.join('\n'), 'utf8');

console.log(JSON.stringify({
  slug,
  oldPhone,
  newPhone,
  sourceUrl: override.sourceUrl,
  updated: [manifestFile, contactsFile, sourceSite, releaseSite, hub, callSheet],
}, null, 2));
