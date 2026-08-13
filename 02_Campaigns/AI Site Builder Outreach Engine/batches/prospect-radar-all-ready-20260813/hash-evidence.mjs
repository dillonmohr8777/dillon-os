import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const releaseRoot = path.resolve(process.argv[2] || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-all-245-20260813');
const output = path.join(releaseRoot, 'EVIDENCE-HASHES.json');
const fixed = [
  'ALL-BUSINESSES-MANIFEST.json',
  'CALL-READY-CONTACTS.json',
  'CONTACT-SOURCE-VALIDATION.json',
  'FULL-QA.json',
  'IMPECCABLE-DETECT.json',
  'JESSE-CALL-SHEET.csv',
  'LIVE-READBACK.json',
];
const screenshotsRoot = path.join(releaseRoot, 'QA-SCREENSHOTS');
const screenshots = fs.existsSync(screenshotsRoot)
  ? fs.readdirSync(screenshotsRoot).filter(file => /\.(?:png|jpe?g|webp)$/i.test(file)).sort().map(file => `QA-SCREENSHOTS/${file}`)
  : [];
const relativePaths = [...fixed, ...screenshots];
const missing = relativePaths.filter(relativePath => !fs.existsSync(path.join(releaseRoot, relativePath)));
if (missing.length) throw new Error(`Evidence files missing: ${missing.join(', ')}`);

const records = relativePaths.map(relativePath => {
  const bytes = fs.readFileSync(path.join(releaseRoot, relativePath));
  return {
    relativePath,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
});
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  algorithm: 'sha256',
  records,
};
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const reportBytes = fs.readFileSync(output);
console.log(JSON.stringify({
  output,
  files: records.length,
  missing: missing.length,
  sha256: crypto.createHash('sha256').update(reportBytes).digest('hex'),
}, null, 2));
