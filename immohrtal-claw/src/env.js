'use strict';

const fs = require('node:fs');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return { loaded: false, keys: 0 };
  const text = fs.readFileSync(filePath, 'utf8');
  let keys = 0;
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) continue;
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"'))
      || (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = val;
      keys += 1;
    }
  }
  return { loaded: true, keys };
}

module.exports = { loadDotEnv };
