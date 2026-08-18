#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { httpGet } = require('../lib/net');
const { logoUrls } = require('./haoqi-craft-batch');

const DEAD = /godaddy|sedoparking|parkingcrew|hugedomains|this domain|buy this domain|website coming soon|just a moment|attention required|wp engine|site not found|oops! that page|page not found|account suspended|default web site page/i;
const FRANCHISE = /the little gym|better homes and gardens|novacare|urgentvet|sterling optical|stretchlab|v's barbershop|fit4mom/i;

async function probe(row) {
  const urls = [
    row.website,
    `https://${row.domain}/`,
    `http://${row.domain}/`,
    `https://www.${row.domain}/`,
  ].filter((u, i, a) => u && a.indexOf(u) === i);
  let last = { domain: row.domain, name: row.name, word: row.word, status: 'dead', reason: 'no response' };
  for (const url of urls) {
    try {
      const res = await httpGet(url, { timeoutMs: 12000, maxBytes: 1_200_000 });
      const html = String(res.body || '');
      const host = String(res.finalUrl || url);
      if (!res.ok && res.status >= 400) {
        last = { ...last, status: 'http', reason: `HTTP ${res.status}`, url: host };
        continue;
      }
      if (DEAD.test(html) || DEAD.test(host)) {
        last = { ...last, status: 'parked', reason: 'parking or challenge', url: host };
        continue;
      }
      if (FRANCHISE.test(html) && FRANCHISE.test(row.name + row.domain)) {
        last = { ...last, status: 'franchise', reason: 'franchise microsite', url: host };
        continue;
      }
      const logos = logoUrls(html, host);
      const title = ((html.match(/<title[^>]*>([^<]+)/i) || [])[1] || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      return {
        domain: row.domain,
        name: row.name,
        word: row.word,
        slug: row.slug,
        vertical: row.vertical,
        city: row.city,
        status: 'live',
        url: host,
        title,
        logos: logos.slice(0, 4).map((l) => l.src),
        logoCount: logos.length,
        bytes: html.length,
      };
    } catch (err) {
      last = { ...last, status: 'dead', reason: String(err.message || err).slice(0, 80) };
    }
  }
  return last;
}

async function main() {
  const { picked } = JSON.parse(fs.readFileSync('/tmp/haoqi-unused.json', 'utf8'));
  const skip = new Set([
    'germantowndental.us',
    'udisandconnorthodontics.com',
    'leeshoagieshorsham.com',
    'kehansautoservice.com',
    'thelittlegym.com',
    'bhgre.com',
    'novacare.com',
    'crozerhealth.org',
    'urgentvet.com',
    'sterlingoptical.com',
    'stretchlab.com',
    'vbarbershop.com',
    'manayunkiphonerepair.com',
    'boilerrepairfinder.com',
  ]);
  const rows = picked.filter((r) => !skip.has(r.domain));
  const out = [];
  for (let i = 0; i < rows.length; i += 8) {
    const chunk = rows.slice(i, i + 8);
    const got = await Promise.all(chunk.map(probe));
    out.push(...got);
    for (const r of got) {
      process.stderr.write(`${r.status.padEnd(10)} ${r.domain} ${r.reason || r.title || ''} logos=${r.logoCount || 0}\n`);
    }
  }
  fs.writeFileSync('/tmp/haoqi-probe.json', JSON.stringify(out, null, 2));
  const live = out.filter((r) => r.status === 'live');
  process.stdout.write(JSON.stringify({ probed: out.length, live: live.length, liveRows: live }, null, 2) + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
