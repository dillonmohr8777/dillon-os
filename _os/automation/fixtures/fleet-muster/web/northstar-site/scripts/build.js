'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist');
const files = [
  'index.html',
  'styles.css',
  'script.js',
  'fonts/Barlow-Regular.ttf',
  'fonts/Barlow-Bold.ttf',
  'fonts/OFL.txt',
];

fs.mkdirSync(outDir, { recursive: true });
const artifacts = [];
for (const file of files) {
  const source = path.join(root, file);
  const target = path.join(outDir, file);
  const bytes = fs.readFileSync(source);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  artifacts.push({
    path: `dist/${file}`,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  });
}
fs.writeFileSync(path.join(outDir, 'build-manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  synthetic: true,
  externalRequests: 0,
  artifacts,
}, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ passed: true, outDir, artifacts }, null, 2));
