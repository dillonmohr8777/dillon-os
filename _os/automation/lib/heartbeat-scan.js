'use strict';

/**
 * Require-closure capability scanner for the system heartbeat.
 *
 * Facts stay attached to the module they were found in. A POST in one library
 * must not leak onto every sibling that merely shares the HTTP helper.
 * Comments are stripped so prose ("this deploys", "never POST") cannot fire.
 * HTTP verbs are classification signals, not proof of mutation: Places search
 * and Overpass both POST for a read.
 */

const fs = require('fs');
const path = require('path');

const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
  'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net',
  'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline',
  'repl', 'stream', 'string_decoder', 'timers', 'tls', 'tty', 'url', 'util',
  'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
]);

const MUTATION_PATTERNS = [
  { id: 'netlify-deploy', re: /\bdeployFiles\s*\(/ },
  { id: 'netlify-create-site', re: /\bensureSite\s*\(/ },
  { id: 'git-push', re: /\bgit\s+push\b/ },
  { id: 'calendar-send', re: /\bsendUpdates\s*[:=]/ },
  { id: 'smtp-send', re: /require\s*\(\s*['"]nodemailer['"]\s*\)|\bcreateTransport\s*\(|\bsendMail\s*\(/ },
  { id: 'slack-write', re: /\bchat\.postMessage\s*\(/ },
];

/** Named imports that actually reach the network. Others (sanitizeForGit) must not inherit a sibling POST. */
const NETWORKISH = /^(httpGet|httpPost|httpsGet|fetch|request|api|deployFiles|ensureSite|findSite|waitForDeploy|runOverpass|search|runXaiResearch|inviteViaApi|calendarFetch|writeMcpReview)$/i;

const OUTBOUND_VERB_PATTERNS = [
  { verb: 'POST', re: /method\s*:\s*['"]POST['"]/i },
  { verb: 'PUT', re: /method\s*:\s*['"]PUT['"]/i },
  { verb: 'PATCH', re: /method\s*:\s*['"]PATCH['"]/i },
  { verb: 'DELETE', re: /method\s*:\s*['"]DELETE['"]/i },
];

function posix(rel) {
  return String(rel || '').split(path.sep).join('/');
}

function isJs(file) {
  return /\.(c?js|mjs)$/i.test(file);
}

function isPs1(file) {
  return /\.ps1$/i.test(file);
}

function isYaml(file) {
  return /\.ya?ml$/i.test(file);
}

/**
 * Strip line and block comments. Strings stay so `method: 'POST'` still matches.
 * Template literals stay; interpolation is code, not prose.
 */
function stripComments(source, kind = 'js') {
  const s = String(source || '');
  let out = '';
  let i = 0;
  const n = s.length;

  const skipLine = () => {
    while (i < n && s[i] !== '\n') i += 1;
  };

  if (kind === 'ps1') {
    while (i < n) {
      const c = s[i];
      const n1 = s[i + 1];
      if (c === '<' && n1 === '#') {
        i += 2;
        while (i < n && !(s[i] === '#' && s[i + 1] === '>')) i += 1;
        i += 2;
        out += ' ';
        continue;
      }
      if (c === '#' && n1 !== '>') {
        skipLine();
        continue;
      }
      if (c === "'" || c === '"') {
        const q = c;
        out += c;
        i += 1;
        while (i < n && s[i] !== q) {
          if (s[i] === '`' && i + 1 < n) {
            out += s[i] + s[i + 1];
            i += 2;
            continue;
          }
          out += s[i];
          i += 1;
        }
        if (i < n) {
          out += s[i];
          i += 1;
        }
        continue;
      }
      out += c;
      i += 1;
    }
    return out;
  }

  while (i < n) {
    const c = s[i];
    const n1 = s[i + 1];
    if (c === '/' && n1 === '/') {
      skipLine();
      continue;
    }
    if (c === '/' && n1 === '*') {
      i += 2;
      while (i < n && !(s[i] === '*' && s[i + 1] === '/')) i += 1;
      i += 2;
      out += ' ';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const q = c;
      out += c;
      i += 1;
      while (i < n && s[i] !== q) {
        if (s[i] === '\\' && i + 1 < n) {
          out += s[i] + s[i + 1];
          i += 2;
          continue;
        }
        if (q === '`' && s[i] === '$' && s[i + 1] === '{') {
          out += '${';
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (s[i] === '{') depth += 1;
            else if (s[i] === '}') depth -= 1;
            out += s[i];
            i += 1;
          }
          continue;
        }
        out += s[i];
        i += 1;
      }
      if (i < n) {
        out += s[i];
        i += 1;
      }
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function extractRequires(source) {
  return extractRequireBindings(source).map((binding) => binding.spec);
}

function parseImportedNames(block) {
  return String(block || '')
    .split(',')
    .map((part) => {
      const token = part.split('//')[0].trim();
      if (!token) return '';
      return token.split(/\s+as\s+/)[0].split(':')[0].trim().replace(/[^\w$].*/, '');
    })
    .filter(Boolean);
}

/**
 * `const { sanitizeForGit } = require('./discovery')` must not inherit discovery's
 * Overpass POST. Namespace imports (`const radar = require('./radar')`) still
 * walk that file, which then decides each of *its* requires the same way.
 */
function extractRequireBindings(source) {
  const text = String(source || '');
  const bindings = [];
  const re = /(?:(?:const|let|var)\s+(\{[\s\S]*?\}|\w+)\s*=\s*)?require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = re.exec(text))) {
    const left = match[1];
    const spec = match[2];
    if (left && left.startsWith('{')) {
      bindings.push({ spec, names: parseImportedNames(left.slice(1, -1)), namespace: false });
    } else {
      bindings.push({ spec, names: null, namespace: true });
    }
  }
  return bindings;
}

function inheritNetworkFacts(binding) {
  if (!binding || binding.namespace || !binding.names || !binding.names.length) return true;
  return binding.names.some((name) => NETWORKISH.test(name));
}

function candidatePaths(fromFile, spec) {
  const base = path.normalize(path.join(path.dirname(fromFile), spec));
  return [
    base,
    `${base}.js`,
    `${base}.json`,
    path.join(base, 'index.js'),
  ];
}

function resolveRequire(fromFile, spec, options = {}) {
  if (!spec || NODE_BUILTINS.has(spec)) return null;
  if (spec.startsWith('node:')) return null;
  if (!spec.startsWith('.')) return null;
  const exists = options.exists || ((file) => fs.existsSync(file));
  for (const candidate of candidatePaths(fromFile, spec)) {
    if (exists(candidate)) return posix(candidate);
  }
  if (options.sources) {
    for (const candidate of candidatePaths(fromFile, spec)) {
      const key = posix(candidate);
      if (Object.prototype.hasOwnProperty.call(options.sources, key)) return key;
    }
  }
  return posix(candidatePaths(fromFile, spec)[1]);
}

function classifyModule(source, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const kind = ext === '.ps1' ? 'ps1' : 'js';
  const code = stripComments(source, kind);
  const facts = [];
  for (const pattern of MUTATION_PATTERNS) {
    if (pattern.re.test(code)) {
      facts.push({ kind: 'mutation', id: pattern.id, module: posix(filePath) });
    }
  }
  for (const pattern of OUTBOUND_VERB_PATTERNS) {
    if (pattern.re.test(code)) {
      facts.push({ kind: 'outbound-verb', verb: pattern.verb, module: posix(filePath) });
    }
  }
  return facts;
}

function readSource(filePath, options = {}) {
  const key = posix(filePath);
  if (options.sources && Object.prototype.hasOwnProperty.call(options.sources, key)) {
    return options.sources[key];
  }
  const readFile = options.readFile || ((p) => fs.readFileSync(p, 'utf8'));
  return readFile(filePath);
}

function sourceExists(filePath, options = {}) {
  const key = posix(filePath);
  if (options.sources && Object.prototype.hasOwnProperty.call(options.sources, key)) return true;
  const exists = options.exists || ((p) => fs.existsSync(p));
  return exists(filePath);
}

/**
 * Walk require() from an entry. Facts stay tagged with the module they came
 * from. The entry's capabilities are the union of those tagged facts — not a
 * pool shared across every consumer of a chokepoint helper.
 */
function scanCapabilityGraph(entryPath, options = {}) {
  const entry = posix(entryPath);
  const visited = [];
  const seen = new Set();
  const factsByModule = {};
  const queue = [entry];

  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!sourceExists(file, options)) continue;
    visited.push(file);
    let source = '';
    try {
      source = readSource(file, options);
    } catch {
      continue;
    }
    factsByModule[file] = classifyModule(source, file);
    if (!isJs(file)) continue;
    for (const binding of extractRequireBindings(source)) {
      if (!inheritNetworkFacts(binding)) continue;
      const resolved = resolveRequire(file, binding.spec, options);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }

  const facts = [];
  for (const file of visited) {
    facts.push(...(factsByModule[file] || []));
  }
  const deduped = [];
  const seenFact = new Set();
  for (const fact of facts) {
    const key = `${fact.kind}:${fact.id || fact.verb}:${fact.module}`;
    if (seenFact.has(key)) continue;
    seenFact.add(key);
    deduped.push(fact);
  }
  const mutations = deduped.filter((fact) => fact.kind === 'mutation');
  const outbound = deduped.filter((fact) => fact.kind === 'outbound-verb');
  const mutationModules = new Set(mutations.map((fact) => fact.module));
  const unclassifiedOutbound = outbound.filter((fact) => !mutationModules.has(fact.module));

  return {
    entry,
    visited,
    facts: deduped,
    facts_by_module: factsByModule,
    mutations,
    unclassified_outbound: unclassifiedOutbound,
    external_action: mutations.length > 0,
    token_blocked_signals: mutations.some((fact) => fact.id.startsWith('netlify-')),
  };
}

function scanYamlWorkflow(source, filePath) {
  const code = String(source || '').replace(/^\s*#.*$/gm, '');
  const facts = classifyModule(code, filePath);
  return {
    entry: posix(filePath),
    visited: [posix(filePath)],
    facts,
    facts_by_module: { [posix(filePath)]: facts },
    mutations: facts.filter((fact) => fact.kind === 'mutation'),
    unclassified_outbound: facts.filter((fact) => fact.kind === 'outbound-verb'),
    external_action: facts.some((fact) => fact.kind === 'mutation'),
    token_blocked_signals: facts.some((fact) => fact.id && String(fact.id).startsWith('netlify-')),
  };
}

function scanEntry(entryPath, options = {}) {
  if (isYaml(entryPath)) {
    const source = readSource(entryPath, options);
    return scanYamlWorkflow(source, entryPath);
  }
  return scanCapabilityGraph(entryPath, options);
}

module.exports = {
  NODE_BUILTINS,
  MUTATION_PATTERNS,
  stripComments,
  extractRequires,
  extractRequireBindings,
  inheritNetworkFacts,
  resolveRequire,
  classifyModule,
  scanCapabilityGraph,
  scanEntry,
};
