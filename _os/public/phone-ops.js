/**
 * Phone operator helpers for D.I.L.L.O.N. OS.
 * Isomorphic: Node tests + the HUD script tag.
 * No tokens live in this file. Writes never send mail or launch skills.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PhoneOps = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const REPO = 'dillonmohr8777/dillon-os';
  const BRANCH = 'main';
  const TOKEN_KEY = 'dillonOs.githubToken';
  const LINKS = {
    sheet: 'https://docs.google.com/spreadsheets/d/1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo',
    hub: 'https://momentum-prospect-radar-next20-2026-08-11.netlify.app/',
    github: 'https://github.com/dillonmohr8777/dillon-os',
    clients: 'https://github.com/dillonmohr8777/dillon-os/blob/main/01_Clients/Client%20Index.md',
    dashboard: 'https://github.com/dillonmohr8777/dillon-os/blob/main/Dashboard.md',
    slack: 'https://app.slack.com/client',
    tokenHelp: 'https://github.com/settings/personal-access-tokens/new',
  };

  function slugify(text) {
    const s = String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    return s || 'note';
  }

  function escapeRe(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function isoDay(at) {
    const d = at instanceof Date ? at : new Date(at || Date.now());
    return d.toISOString().slice(0, 10);
  }

  function inboxPath(text, at) {
    return `00_Inbox/phone/${isoDay(at)}-${slugify(text)}.md`;
  }

  function inboxNote(text, at) {
    const captured = (at instanceof Date ? at : new Date(at || Date.now())).toISOString();
    const body = String(text || '').trim();
    const title = body.split('\n')[0].slice(0, 80) || 'Phone capture';
    return [
      '---',
      'tags: [inbox, phone]',
      `captured: ${captured}`,
      'source: dillon-os-phone',
      '---',
      '',
      `# ${title}`,
      '',
      body,
      '',
      'Captured from the phone HUD. This GitHub repo is public — no phones, emails, or street addresses.',
      '',
    ].join('\n');
  }

  function toggleDirective(markdown, text, done) {
    const needle = String(text || '').trim();
    if (!needle) throw new Error('empty directive');
    const re = new RegExp(`^(\\s*[-*] \\[)[ xX](\\]\\s+${escapeRe(needle)})\\s*$`, 'm');
    if (!re.test(markdown)) throw new Error('directive not found');
    return markdown.replace(re, `$1${done ? 'x' : ' '}$2`);
  }

  function addDirective(markdown, text) {
    const line = `- [ ] ${String(text || '').trim()}`;
    if (!String(text || '').trim()) throw new Error('empty directive');
    if (/^##\s+Today\s*$/m.test(markdown)) {
      return markdown.replace(/^(##\s+Today\s*\n)/m, `$1${line}\n`);
    }
    return `${markdown.replace(/\s*$/, '')}\n\n## Today\n${line}\n`;
  }

  function queueLine(skill, at) {
    const name = String(skill || '').trim().replace(/[^a-z0-9._-]/gi, '');
    if (!name) throw new Error('empty skill');
    return JSON.stringify({
      ts: (at instanceof Date ? at : new Date(at || Date.now())).toISOString(),
      automation_id: 'phone-hud',
      action: 'queue_skill',
      skill: name,
      payload: { source: 'phone' },
    });
  }

  function appendQueue(existing, skill, at) {
    const prev = existing ? String(existing).replace(/\s*$/, '') : '';
    const line = queueLine(skill, at);
    return prev ? `${prev}\n${line}\n` : `${line}\n`;
  }

  function blobUrl(rel, branch) {
    const clean = String(rel || '').replace(/^\/+/, '');
    return `https://github.com/${REPO}/blob/${branch || BRANCH}/${clean.split('/').map(encodeURIComponent).join('/')}`;
  }

  function toBase64(str) {
    if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf8').toString('base64');
    return btoa(unescape(encodeURIComponent(str)));
  }

  function fromBase64(str) {
    const compact = String(str || '').replace(/\n/g, '');
    if (typeof Buffer !== 'undefined') return Buffer.from(compact, 'base64').toString('utf8');
    return decodeURIComponent(escape(atob(compact)));
  }

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; }
    catch { return ''; }
  }

  function setToken(token) {
    const t = String(token || '').trim();
    if (!t) {
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      return '';
    }
    localStorage.setItem(TOKEN_KEY, t);
    return t;
  }

  function githubHeaders(token) {
    const h = { accept: 'application/vnd.github+json' };
    if (token) h.authorization = `Bearer ${token}`;
    return h;
  }

  async function githubGet(rel, opts) {
    const repo = (opts && opts.repo) || REPO;
    const branch = (opts && opts.branch) || BRANCH;
    const token = opts && opts.token;
    const fetchFn = (opts && opts.fetch) || fetch;
    const url = `https://api.github.com/repos/${repo}/contents/${rel}?ref=${encodeURIComponent(branch)}`;
    const res = await fetchFn(url, { headers: githubHeaders(token) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`github get ${rel} failed (${res.status})`);
    const data = await res.json();
    return { sha: data.sha, content: fromBase64(data.content || ''), path: data.path };
  }

  async function githubPut(rel, content, message, opts) {
    const repo = (opts && opts.repo) || REPO;
    const branch = (opts && opts.branch) || BRANCH;
    const token = opts && opts.token;
    if (!token) throw new Error('unlock vault writes first');
    const fetchFn = (opts && opts.fetch) || fetch;
    const url = `https://api.github.com/repos/${repo}/contents/${rel}`;
    const body = {
      message,
      content: toBase64(content),
      branch,
    };
    if (opts && opts.sha) body.sha = opts.sha;
    const res = await fetchFn(url, {
      method: 'PUT',
      headers: { ...githubHeaders(token), 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).message || ''; } catch { /* ignore */ }
      throw new Error(`github put ${rel} failed (${res.status}) ${detail}`.trim());
    }
    return res.json();
  }

  return {
    REPO,
    BRANCH,
    TOKEN_KEY,
    LINKS,
    slugify,
    inboxPath,
    inboxNote,
    toggleDirective,
    addDirective,
    queueLine,
    appendQueue,
    blobUrl,
    toBase64,
    fromBase64,
    getToken,
    setToken,
    githubGet,
    githubPut,
  };
});
