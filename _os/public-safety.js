/**
 * Public-safety scanner for tracked 12_Brain content.
 * This GitHub repository is PUBLIC — fail on credential-shaped values,
 * direct emails, phone numbers, Bitwarden locators, and known private
 * absolute path prefixes unless an explicit safe fixture allowlist applies.
 */
const fs = require('node:fs');
const path = require('node:path');

const BRAIN_DIR = '12_Brain';

/** Relative paths under the vault that may contain fixture-only matches. */
const SAFE_FIXTURE_ALLOWLIST = new Set([
  // Scanner unit fixtures only — never real vault notes.
  '_os/test/fixtures/public-safety-allowlisted.md',
]);

const RULES = [
  {
    id: 'email',
    description: 'direct email address',
    // Exclude obvious docs placeholders like user@example.com via allowlist files only.
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    id: 'phone',
    description: 'phone number',
    re: /(?<!\d)(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}(?!\d)/g,
  },
  {
    id: 'bitwarden_locator',
    description: 'Bitwarden locator / vault item reference',
    // Locators only — policy docs may mention the product name "Bitwarden".
    re: /(?:bw:\/\/|bitwarden:\/\/|\bvault item\b|\bbw item\b|\bbwitem=)/gi,
  },
  {
    id: 'private_abs_win',
    description: 'Windows user absolute path',
    re: /[A-Za-z]:\\Users\\/g,
  },
  {
    id: 'private_abs_unix',
    description: 'Unix home absolute path',
    re: /\/(?:Users|home)\/[A-Za-z0-9._-]+\//g,
  },
  {
    id: 'credential_shaped',
    description: 'credential-shaped assignment',
    re: /\b(?:password|passwd|api[_-]?key|secret[_-]?key|client_secret|authorization\s*:\s*bearer)\b\s*[:=]/gi,
  },
  {
    id: 'google_ads_cid',
    description: 'Google Ads customer ID shape',
    re: /\b\d{3}-\d{3}-\d{4}\b/g,
  },
];

function listBrainFiles(vaultRoot) {
  const root = path.join(vaultRoot, BRAIN_DIR);
  const out = [];
  if (!fs.existsSync(root)) return out;
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === 'private' && path.basename(dir) === BRAIN_DIR) {
        // Only the tracked private README is scanned if present via walk of README separately.
        const readme = path.join(dir, ent.name, 'README.md');
        if (fs.existsSync(readme)) out.push(readme);
        continue;
      }
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && /\.(md|base|canvas|mdc|json)$/i.test(ent.name)) out.push(full);
    }
  };
  walk(root);
  return out;
}

/**
 * Scan text; return array of { id, description, count } without echoing matched values.
 */
function scanText(text, { ignoreRules = [] } = {}) {
  const ignore = new Set(ignoreRules);
  const hits = [];
  for (const rule of RULES) {
    if (ignore.has(rule.id)) continue;
    const re = new RegExp(rule.re.source, rule.re.flags);
    const matches = text.match(re);
    if (matches && matches.length) {
      hits.push({ id: rule.id, description: rule.description, count: matches.length });
    }
  }
  return hits;
}

/**
 * Replace every rule match with a rule-named marker.
 *
 * For tool output that gets embedded into tracked 12_Brain notes: an MCP Inspector
 * probe relays npm warnings and local paths that would otherwise fail the scan.
 */
function redactText(text) {
  let out = String(text ?? '');
  for (const rule of RULES) {
    const re = new RegExp(rule.re.source, rule.re.flags);
    out = out.replace(re, `[redacted:${rule.id}]`);
  }
  return out;
}

function scanVault(vaultRoot) {
  const findings = [];
  for (const full of listBrainFiles(vaultRoot)) {
    const rel = path.relative(vaultRoot, full).split(path.sep).join('/');
    if (SAFE_FIXTURE_ALLOWLIST.has(rel)) continue;
    let text;
    try { text = fs.readFileSync(full, 'utf8'); } catch { continue; }
    const hits = scanText(text);
    if (hits.length) findings.push({ file: rel, hits });
  }
  return findings;
}

function assertPublicSafe(vaultRoot) {
  const findings = scanVault(vaultRoot);
  return {
    ok: findings.length === 0,
    findings,
    scannedFiles: listBrainFiles(vaultRoot).length,
  };
}

module.exports = {
  BRAIN_DIR,
  SAFE_FIXTURE_ALLOWLIST,
  RULES,
  listBrainFiles,
  scanText,
  redactText,
  scanVault,
  assertPublicSafe,
};
