#!/usr/bin/env node
'use strict';

/**
 * Find published contact routes for prospects, from their own sites only.
 *
 *   node _os/automation/bin/find-contacts.js [--limit 60] [--verdict rebuild]
 *
 * Addresses and names go to 12_Brain/private/contacts.json (gitignored). The
 * tracked registry receives booleans and counts only — never an address.
 *
 * Expect roughly a quarter of live sites to publish an email. Most small
 * businesses route contact through a form precisely so their address cannot be
 * harvested, and nothing here guesses one.
 *
 * Options
 *   --limit N       prospects to check (default 60)
 *   --verdict V     restrict to a verdict (default rebuild)
 *   --concurrency N default 5 — someone else's server is on the other end
 *   --csv           also write a mail-merge sheet to the private layer
 */

const fs = require('fs');
const radar = require('../lib/radar');
const store = require('../lib/contact-store');
const { findContacts, toRegistryFlags } = require('../lib/contacts');
const { repoPath, todayISO } = require('../lib/fsutil');

function parseArgs(argv) {
  const o = { limit: 60, verdict: 'rebuild', concurrency: 5, csv: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') o.limit = Math.max(1, parseInt(argv[++i], 10) || 60);
    else if (argv[i] === '--verdict') o.verdict = String(argv[++i] || '');
    else if (argv[i] === '--concurrency') o.concurrency = Math.max(1, parseInt(argv[++i], 10) || 5);
    else if (argv[i] === '--csv') o.csv = true;
    else if (argv[i] === '--help' || argv[i] === '-h') o.help = true;
  }
  return o;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    return;
  }
  const today = todayISO();
  const registry = radar.load();
  const cstore = store.load();

  const targets = Object.values(registry.prospects)
    .filter((p) => p.website && (!args.verdict || p.current?.verdict === args.verdict))
    .filter((p) => !cstore.contacts[p.domain] || cstore.contacts[p.domain].checked !== today)
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    .slice(0, args.limit);

  process.stderr.write(`checking ${targets.length} prospect(s) for published contacts\n`);

  const stats = { checked: 0, withEmail: 0, ownDomain: 0, withPerson: 0, withForm: 0, agency: 0 };
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const p = targets[cursor++];
      const res = await findContacts(p.website, { timeoutMs: 10000 }).catch(() => null);
      stats.checked += 1;
      if (!res) continue;
      store.put(cstore, p.domain, res, { today });
      // Flags only on the tracked row.
      registry.prospects[p.domain].contact = toRegistryFlags(res, { today });
      if (res.emails.length) stats.withEmail += 1;
      if (res.emails.some((e) => e.onOwnDomain)) stats.ownDomain += 1;
      if (res.people.length) stats.withPerson += 1;
      if (res.form) stats.withForm += 1;
      if (res.agencyDomains.length) stats.agency += 1;
      if (stats.checked % 20 === 0) process.stderr.write(`  ${stats.checked}/${targets.length}\n`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(args.concurrency, targets.length) }, worker));

  store.save(cstore);
  radar.save(registry);

  let csvPath = null;
  if (args.csv) {
    csvPath = repoPath('12_Brain/private/contacts-mailmerge.csv');
    fs.writeFileSync(csvPath, store.toCsv(cstore, registry, { onlyVerdicts: [args.verdict] }));
  }

  console.log(JSON.stringify({
    status: 'ok', date: today, ...stats,
    store: store.STORE_PATH, csv: csvPath ? '12_Brain/private/contacts-mailmerge.csv' : null,
    note: 'Addresses stay in the private layer. Nothing here is outbound-ready — a human approves every send.',
  }, null, 2));
}

main().catch((err) => { console.error(String(err.message || err)); process.exit(1); });
