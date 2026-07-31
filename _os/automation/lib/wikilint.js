'use strict';

/**
 * Deterministic lint for the 12_Brain wiki layer.
 *
 * CLAUDE.md states the writing rules (one lesson per file, no duplicates, every
 * compiled page carries a `source:`, research carries `expires:`, new pages
 * update INDEX.md in the same change) and the reading rule (start at INDEX.md
 * and walk the links). Until now those were enforced only by an agent running
 * the `/wiki-lint` skill, so they drifted. This module turns them into checks a
 * test and a CI job can run.
 *
 * Policy lives in 12_Brain/registry/wiki-lint.json so the operator can retune
 * scopes and severities without editing code.
 */

const fs = require('fs');
const path = require('path');
const { REPO_ROOT, readJson, walkMarkdown } = require('./fsutil');
const { parseFrontmatter } = require('./frontmatter');

const POLICY_PATH = '12_Brain/registry/wiki-lint.json';

/** Extensions Obsidian can resolve a [[wikilink]] to. */
const LINKABLE_EXTENSIONS = ['.md', '.canvas', '.base'];

const DEFAULT_POLICY = {
  version: 1,
  index: '12_Brain/INDEX.md',
  vault_scan: { exclude_dirs: ['.git', '.obsidian', 'node_modules'] },
  untracked_by_design: { prefixes: [] },
  rules: [],
};

function loadPolicy(root = REPO_ROOT) {
  const policy = readJson(path.join(root, POLICY_PATH), null);
  return policy || { ...DEFAULT_POLICY };
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/**
 * Blank out fenced and inline code, preserving byte offsets and newlines so
 * line numbers stay accurate. Prose like "connect pages with `[[wikilinks]]`"
 * is documentation, not a link, and must not be reported as broken.
 */
function stripCode(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/^ {0,3}(```|~~~)[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm, blank)
    .replace(/`+[^`\n]*`+/g, blank);
}

function lineAt(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i += 1) {
    if (text[i] === '\n') line += 1;
  }
  return line;
}

/**
 * Extract [[wikilinks]] and ![[embeds]] with their target, alias and line.
 * Obsidian targets may carry a `#heading` or `^block` suffix and a `|alias`.
 */
function extractLinks(text) {
  const scrubbed = stripCode(text);
  const links = [];
  const re = /!?\[\[([^\][\n]+?)\]\]/g;
  let m;
  while ((m = re.exec(scrubbed)) !== null) {
    // Inside a markdown table the alias pipe must be written `\|`, so unescape
    // before splitting or the target keeps a trailing backslash and never resolves.
    const inner = m[1].replace(/\\\|/g, '|');
    const [rawTarget, ...aliasParts] = inner.split('|');
    const target = rawTarget.split('#')[0].split('^')[0].trim();
    if (!target) continue;
    links.push({
      raw: inner,
      target,
      alias: aliasParts.join('|').trim() || null,
      line: lineAt(scrubbed, m.index),
    });
  }
  return links;
}

function walkLinkable(dir, excludeAbs, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (excludeAbs.has(full)) continue;
    if (ent.isDirectory()) walkLinkable(full, excludeAbs, acc);
    else if (ent.isFile() && LINKABLE_EXTENSIONS.includes(path.extname(ent.name))) acc.push(full);
  }
  return acc;
}

/**
 * Index every linkable file in the vault, keyed both by extensionless
 * vault-relative path and by basename, because Obsidian resolves either form.
 */
function buildVaultIndex(root = REPO_ROOT, policy = loadPolicy(root)) {
  const excludeAbs = new Set(
    (policy.vault_scan?.exclude_dirs || []).map((d) => path.join(root, d)),
  );
  const files = walkLinkable(root, excludeAbs).sort();
  const byPath = new Map();
  const byBasename = new Map();
  const notes = [];

  for (const abs of files) {
    const rel = toPosix(path.relative(root, abs));
    const ext = path.extname(rel);
    const noExt = rel.slice(0, rel.length - ext.length);
    const base = path.basename(noExt);
    byPath.set(noExt.toLowerCase(), rel);
    if (!byBasename.has(base.toLowerCase())) byBasename.set(base.toLowerCase(), rel);

    if (ext === '.md') {
      const text = fs.readFileSync(abs, 'utf8');
      const { data, hasFence } = parseFrontmatter(text);
      notes.push({ rel, abs, data, hasFence, links: extractLinks(text) });
    } else {
      notes.push({ rel, abs, data: {}, hasFence: false, links: [] });
    }
  }

  return { root, files: files.map((f) => toPosix(path.relative(root, f))), byPath, byBasename, notes };
}

/**
 * Resolve one link target.
 *   ok      — a real file in the vault
 *   private — inside a gitignored-by-design prefix, so it resolves on the
 *             operator's desktop but can never resolve in Git
 *   broken  — nothing matches
 */
function resolveLink(target, index, policy = loadPolicy(index.root)) {
  const cleaned = target.replace(/^\.\//, '').replace(/\/$/, '');
  const key = cleaned.toLowerCase();
  const withoutExt = key.replace(/\.(md|canvas|base)$/, '');

  const exact = index.byPath.get(withoutExt);
  if (exact) return { status: 'ok', to: exact };

  if (withoutExt.includes('/')) {
    // A target containing a slash is a path, so match it as one — by suffix, the
    // way Obsidian accepts a shortest-unique partial path. Falling back to the
    // bare basename here would resolve a stale `folder/README` link to some
    // unrelated README and hide the breakage.
    for (const [indexed, rel] of index.byPath) {
      if (indexed.endsWith(`/${withoutExt}`)) return { status: 'ok', to: rel };
    }
  } else {
    const base = index.byBasename.get(withoutExt);
    if (base) return { status: 'ok', to: base };
  }

  for (const prefix of policy.untracked_by_design?.prefixes || []) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      return { status: 'private', to: cleaned };
    }
  }
  return { status: 'broken', to: null };
}

function inScope(rel, scope = [], exclude = []) {
  const hit = scope.some((s) => (s.endsWith('/') ? rel.startsWith(s) : rel === s || rel.startsWith(`${s}/`)));
  if (!hit) return false;
  return !exclude.some((e) => (e.endsWith('/') ? rel.startsWith(e) : rel.endsWith(e)));
}

function hasValue(v) {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== '';
}

/**
 * Pages an agent can actually find by starting at INDEX.md and walking links,
 * which is the reading rule in CLAUDE.md. The walk crosses out of 12_Brain on
 * purpose — INDEX links to 01_Clients/Client Index, and a brain page reached
 * through a client page is still reachable.
 */
function reachableFromIndex(index, policy = loadPolicy(index.root)) {
  const start = policy.index || DEFAULT_POLICY.index;
  const byRel = new Map(index.notes.map((n) => [n.rel, n]));
  const seen = new Set();
  const queue = [];
  if (byRel.has(start)) {
    seen.add(start);
    queue.push(start);
  }
  while (queue.length) {
    const current = byRel.get(queue.shift());
    if (!current) continue;
    for (const link of current.links) {
      const resolved = resolveLink(link.target, index, policy);
      if (resolved.status !== 'ok' || seen.has(resolved.to)) continue;
      seen.add(resolved.to);
      queue.push(resolved.to);
    }
  }
  return seen;
}

function inboundCounts(index, policy = loadPolicy(index.root)) {
  const counts = new Map(index.files.map((f) => [f, 0]));
  for (const note of index.notes) {
    for (const link of note.links) {
      const resolved = resolveLink(link.target, index, policy);
      if (resolved.status !== 'ok' || resolved.to === note.rel) continue;
      counts.set(resolved.to, (counts.get(resolved.to) || 0) + 1);
    }
  }
  return counts;
}

function asISODate(value) {
  const text = String(value || '').trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function isPastDate(value, today) {
  const date = asISODate(value);
  return date ? date < today : false;
}

/** Whole days from `today` until `value`; negative once past, null if unparseable. */
function daysUntil(value, today) {
  const date = asISODate(value);
  if (!date) return null;
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

/**
 * Run every rule in the policy. `today` is injected so expiry checks are
 * deterministic in tests.
 */
function lint({ root = REPO_ROOT, policy = null, today = new Date().toISOString().slice(0, 10) } = {}) {
  const activePolicy = policy || loadPolicy(root);
  const index = buildVaultIndex(root, activePolicy);
  const findings = [];
  const rules = new Map((activePolicy.rules || []).map((r) => [r.id, r]));
  const add = (rule, file, detail, extra = {}) => {
    findings.push({
      rule: rule.id,
      severity: rule.severity || 'error',
      file,
      detail,
      ...extra,
    });
  };

  const mdNotes = index.notes.filter((n) => n.rel.endsWith('.md'));

  const rivalRule = rules.get('no-rival-brain');
  if (rivalRule) {
    for (const forbidden of rivalRule.forbidden_paths || []) {
      if (fs.existsSync(path.join(root, forbidden))) {
        add(rivalRule, forbidden, `competing brain tree ${forbidden}/ exists — 12_Brain/ is canonical`);
      }
    }
  }

  const fmRule = rules.get('frontmatter-present');
  if (fmRule) {
    for (const note of mdNotes) {
      if (!inScope(note.rel, fmRule.scope, fmRule.exclude)) continue;
      if (!note.hasFence) add(fmRule, note.rel, 'no YAML frontmatter fence');
    }
  }

  const sourceRule = rules.get('source-present');
  if (sourceRule) {
    const keys = sourceRule.any_of || ['source'];
    for (const note of mdNotes) {
      if (!inScope(note.rel, sourceRule.scope, sourceRule.exclude)) continue;
      if (!keys.some((k) => hasValue(note.data[k]))) {
        add(sourceRule, note.rel, `missing provenance (${keys.join(' or ')}) — page is untrusted`);
      }
    }
  }

  const expiresRule = rules.get('expires-present');
  if (expiresRule) {
    for (const note of mdNotes) {
      if (!inScope(note.rel, expiresRule.scope, expiresRule.exclude)) continue;
      for (const key of expiresRule.requires || []) {
        if (!hasValue(note.data[key])) add(expiresRule, note.rel, `research page missing ${key}:`);
      }
    }
  }

  const freshRule = rules.get('expires-fresh');
  if (freshRule) {
    for (const note of mdNotes) {
      if (!inScope(note.rel, freshRule.scope, freshRule.exclude)) continue;
      if (hasValue(note.data.expires) && isPastDate(note.data.expires, today)) {
        add(freshRule, note.rel, `expired ${note.data.expires} — needs re-verification`, {
          expires: String(note.data.expires),
        });
      }
    }
  }

  // Warn before the date passes, so a weekly sweep can re-verify on schedule
  // instead of discovering staleness only after a page has gone stale.
  const soonRule = rules.get('expires-soon');
  if (soonRule) {
    const horizon = Number(soonRule.horizon_days ?? 14);
    for (const note of mdNotes) {
      if (!inScope(note.rel, soonRule.scope, soonRule.exclude)) continue;
      if (!hasValue(note.data.expires)) continue;
      const days = daysUntil(note.data.expires, today);
      if (days === null || days < 0 || days > horizon) continue;
      add(soonRule, note.rel, `expires in ${days} day${days === 1 ? '' : 's'} on ${note.data.expires}`, {
        expires: String(note.data.expires),
        daysUntil: days,
      });
    }
  }

  const linkRule = rules.get('link-resolves');
  if (linkRule) {
    for (const note of mdNotes) {
      if (!inScope(note.rel, linkRule.scope, linkRule.exclude)) continue;
      for (const link of note.links) {
        const resolved = resolveLink(link.target, index, activePolicy);
        if (resolved.status === 'broken') {
          add(linkRule, note.rel, `broken wikilink [[${link.raw}]]`, {
            line: link.line,
            target: link.target,
          });
        }
      }
    }
  }

  const reachRule = rules.get('index-reachable');
  let reachable = null;
  if (reachRule) {
    reachable = reachableFromIndex(index, activePolicy);
    for (const note of mdNotes) {
      if (!inScope(note.rel, reachRule.scope, reachRule.exclude)) continue;
      if (!reachable.has(note.rel)) {
        add(reachRule, note.rel, `no link trail from ${activePolicy.index} reaches this page`);
      }
    }
  }

  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity !== 'error');
  return {
    today,
    status: errors.length ? 'fail' : warnings.length ? 'warn' : 'ok',
    counts: {
      scanned: mdNotes.length,
      linkable: index.files.length,
      errors: errors.length,
      warnings: warnings.length,
      reachable: reachable ? reachable.size : null,
    },
    findings,
    index,
  };
}

/** Group findings by rule id for reporting. */
function groupByRule(findings) {
  const groups = new Map();
  for (const f of findings) {
    if (!groups.has(f.rule)) groups.set(f.rule, []);
    groups.get(f.rule).push(f);
  }
  return groups;
}

module.exports = {
  POLICY_PATH,
  LINKABLE_EXTENSIONS,
  loadPolicy,
  stripCode,
  extractLinks,
  buildVaultIndex,
  resolveLink,
  reachableFromIndex,
  inboundCounts,
  isPastDate,
  daysUntil,
  lint,
  groupByRule,
};
