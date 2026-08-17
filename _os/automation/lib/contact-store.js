'use strict';

/**
 * The private contact store.
 *
 * Email addresses and personal names live here and only here:
 * `12_Brain/private/contacts.json`, which is gitignored. The tracked registry
 * gets booleans and counts, exactly as it already does for telephone numbers.
 *
 * This separation is not decoration. This repository is public, and a previous
 * pass in this same project shipped 483 street addresses and 486 phone numbers
 * into it before review caught them. Contact data is the same class of mistake
 * with a worse blast radius, so the write path refuses rather than trusts.
 *
 * ## Suppression
 *
 * A suppression list ships with the store and is checked on every read. Once an
 * address is suppressed — they asked, they bounced, they complained — it never
 * comes back out of this module, even if a later crawl finds it on their site
 * again. Re-mailing someone who opted out is the one outreach mistake that is
 * both illegal under CAN-SPAM and unrecoverable reputationally, and a crawler
 * that keeps rediscovering an address will re-add it forever unless suppression
 * is enforced at read time rather than at write time.
 */

const fs = require('fs');
const path = require('path');
const { repoPath, ensureDir, todayISO } = require('./fsutil');

/**
 * Write via a temp file and rename.
 *
 * `writeFileSync` straight onto the destination leaves truncated JSON behind if
 * the process dies mid-write. For the suppression list that is not merely a
 * corrupt file — combined with a fail-open read it silently un-suppresses
 * everyone. Rename is atomic on the same filesystem, so a reader sees either the
 * old file or the new one, never half of one.
 */
function writeAtomic(abs, text) {
  const tmp = `${abs}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, abs);
}

/**
 * Read JSON, distinguishing "not there yet" from "corrupt".
 *
 * Absent is a legitimate first-run state and returns the fallback. A parse
 * failure is not: it means the file exists and is damaged, and treating that as
 * empty is how a suppressed address gets mailed again. Throw and let the run
 * fail loudly.
 */
function readJsonStrict(abs, fallback) {
  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') return fallback;
    throw new Error(`cannot read ${abs}: ${err.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(
      `${abs} exists but is not valid JSON (${err.message}). Refusing to continue: ` +
        'treating a damaged contact or suppression file as empty would re-contact ' +
        'people who asked not to be, and would overwrite the store with a partial one. ' +
        'Restore it from the .tmp file or a backup, then re-run.'
    );
  }
}

const STORE_PATH = '12_Brain/private/contacts.json';
const SUPPRESS_PATH = '12_Brain/private/contacts-suppressed.json';

/** Guard: this file must never be written anywhere Git can see it. */
function assertPrivatePath(abs) {
  if (!abs.includes(`${path.sep}12_Brain${path.sep}private${path.sep}`)) {
    throw new Error(
      `refusing to write contact data to ${abs} — it must live under 12_Brain/private/, ` +
        'which is gitignored. This repository is public.'
    );
  }
}

function load(file = STORE_PATH) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  const doc = readJsonStrict(abs, null);
  if (doc) {
    if (!doc.contacts) doc.contacts = {};
    return doc;
  }
  return {
      _readme:
        'Private contact store. Email addresses and names harvested from each ' +
        'business\'s own published pages. NEVER commit this file — it is gitignored ' +
        'and must stay that way. Nothing here is outbound-ready; a human approves every send.',
    updated: todayISO(),
    contacts: {},
  };
}

function save(store, file = STORE_PATH) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  assertPrivatePath(abs);
  ensureDir(path.dirname(abs));
  store.updated = todayISO();
  store.count = Object.keys(store.contacts).length;
  writeAtomic(abs, JSON.stringify(store, null, 1));
  return abs;
}

function loadSuppressed(file = SUPPRESS_PATH) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  // Fail closed. The previous version caught every error and returned an empty
  // Set, so a truncated file silently un-suppressed every address that had ever
  // bounced, complained or asked to be removed.
  const doc = readJsonStrict(abs, { emails: [] });
  return new Set((doc.emails || []).map((e) => String(e).toLowerCase().trim()));
}

/**
 * Suppress an address permanently.
 *
 * @param {string} email
 * @param {string} reason 'requested' | 'bounced' | 'complained' | free text
 */
function suppress(email, reason = 'requested', file = SUPPRESS_PATH) {
  const abs = path.isAbsolute(file) ? file : repoPath(file);
  assertPrivatePath(abs);
  ensureDir(path.dirname(abs));
  const doc = readJsonStrict(abs, {
    _readme: 'Never contact these addresses again, for any campaign.',
    emails: [],
    log: [],
  });
  if (!Array.isArray(doc.emails)) doc.emails = [];
  if (!Array.isArray(doc.log)) doc.log = [];
  const e = String(email).toLowerCase().trim();
  if (!doc.emails.includes(e)) doc.emails.push(e);
  doc.log.push({ email: e, reason, at: todayISO() });
  writeAtomic(abs, JSON.stringify(doc, null, 1));
  return abs;
}

/** Record one prospect's contacts. Suppressed addresses are dropped on the way in as well. */
function put(store, domain, result, { today = todayISO() } = {}) {
  const suppressed = loadSuppressed();
  store.contacts[domain] = {
    checked: today,
    emails: (result.emails || []).filter((e) => !suppressed.has(e.email)),
    people: result.people || [],
    form: result.form || null,
    agency_domains: result.agencyDomains || [],
  };
  return store.contacts[domain];
}

/**
 * Read one prospect's contacts, with suppression applied at read time.
 *
 * Enforced here rather than only at write time because the crawler will keep
 * rediscovering an address that is still published on the business's site.
 */
function get(store, domain) {
  const row = store.contacts?.[domain];
  if (!row) return null;
  const suppressed = loadSuppressed();
  return { ...row, emails: (row.emails || []).filter((e) => !suppressed.has(e.email)) };
}

/**
 * Export a mail-merge sheet. Human-approved sends only.
 *
 * Written to the private layer like everything else here, and every row carries
 * the source URL so any address can be traced back to the page that published it.
 */
function toCsv(store, registry, { onlyVerdicts = null } = {}) {
  const suppressed = loadSuppressed();
  const rows = [['business', 'domain', 'city', 'county', 'verdict', 'priority', 'email', 'on_own_domain', 'named_contact', 'form_url', 'source']];
  for (const [domain, c] of Object.entries(store.contacts || {})) {
    const p = registry.prospects?.[domain];
    if (!p) continue;
    if (onlyVerdicts && !onlyVerdicts.includes(p.current?.verdict)) continue;
    const emails = (c.emails || []).filter((e) => !suppressed.has(e.email));
    if (!emails.length && !c.form) continue;
    const person = (c.people || [])[0]?.name || '';
    const primary = emails[0];
    rows.push([
      p.business_name || domain, domain, p.city || '', p.area || '',
      p.current?.verdict || '', p.priority_score ?? '',
      primary?.email || '', primary?.onOwnDomain ? 'yes' : 'no',
      person, c.form || '', primary?.source || '',
    ]);
  }
  return rows
    .map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(','))
    .join('\n');
}

module.exports = { load, save, put, get, suppress, loadSuppressed, toCsv, STORE_PATH, SUPPRESS_PATH };
