'use strict';
// One-off: rebuild the Philly-100 prospect roster out of the source PDF's link
// annotations. Each prospect block starts with its netlify demo URL, then tel:,
// then any http(s) evidence/official URLs, then mailto:s.
//
// Emails are used here only to match a business to its own domain. They are NOT
// written to the output: this repo is public and contact data stays out of it.
const fs = require('fs');

const data = fs.readFileSync(process.argv[2]).toString('latin1');
const uris = [];
const re = /\/URI\s*\(([\s\S]*?)\)/g;
let m;
while ((m = re.exec(data)) !== null) uris.push(m[1]);

const HUB = /netlify\.app/i;
const BATCH_OF = {
  'philly-site-builder-hub-0711': 'B1',
  'philly-25-homepage-concepts-batch-2': 'B2',
  'philly-25-homepage-concepts-batch-3': 'B3',
  'philly-25-redesigns-batch-4': 'B4',
};
const VERTICAL_OF = {
  B1: 'restaurant',
  B2: 'medical',
  B3: 'home-services',
  B4: 'home-services',
};
const FREEMAIL = /^(gmail|yahoo|aol|comcast|hotmail|outlook|msn|verizon|mail|icloud|me|live|att|sbcglobal)\./i;
const DIRECTORY =
  /visitphilly|restaurantji|roastersmap|fishtowndistrict|yelp\.|facebook|instagram|linktr|psaphcc|dc21\.org|bac-1\.org|ampdphilly|eclipse\.phila\.gov|phdcphila|netherprovidence|phila\.gov|google\.|mapquest|bbb\.org|angi\.|thumbtack|houzz|manta\.com|chamberofcommerce/i;
const STOPWORDS = new Set(['inc', 'llc', 'co', 'company', 'corp', 'the', 'and', 'of', 's', 'philly', 'philadelphia', 'pa']);

const blocks = [];
let cur = null;
for (const u of uris) {
  if (HUB.test(u)) {
    const p = u.replace(/^https?:\/\/[^/]+/, '').replace(/^\/sites\//, '/').replace(/^\/|\/$/g, '');
    if (!p) continue; // bare hub root = batch header row
    const host = u.match(/^https?:\/\/([^/.]+)/)[1];
    cur = { slug: p, batch: BATCH_OF[host] || host, demo: u, tel: null, links: [], emails: [] };
    blocks.push(cur);
    continue;
  }
  if (!cur) continue;
  if (/^tel:/i.test(u)) { cur.tel = cur.tel || u.slice(4); continue; }
  if (/^mailto:/i.test(u)) { if (!cur.emails.includes(u.slice(7))) cur.emails.push(u.slice(7)); continue; }
  if (/^https?:/i.test(u) && !cur.links.includes(u)) cur.links.push(u);
}

// The PDF repeats each prospect across its contact tabs; fold the repeats.
const bySlug = new Map();
for (const b of blocks) {
  const prev = bySlug.get(b.slug);
  if (!prev) { bySlug.set(b.slug, b); continue; }
  for (const l of b.links) if (!prev.links.includes(l)) prev.links.push(l);
  for (const e of b.emails) if (!prev.emails.includes(e)) prev.emails.push(e);
  prev.tel = prev.tel || b.tel;
}

const host = (u) => u.replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '').replace(/^www\./i, '').toLowerCase();
const flat = (s) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
const tokensOf = (slug) => slug.split('-').filter((t) => t.length > 2 && !STOPWORDS.has(t));

// Layered ownership test. Extraction is best-effort on purpose: anything it
// cannot prove stays a candidate for the grader's resolve pass to confirm by
// on-page name match, rather than being silently dropped.
function ownsDomain(slug, url, emails) {
  const h = host(url);
  if (DIRECTORY.test(h)) return false;
  const fd = flat(h.replace(/\.[a-z.]+$/, ''));
  if (fd.length < 4) return false;
  const fs_ = flat(slug);
  if (fd.includes(fs_) || fs_.includes(fd)) return true;
  const toks = tokensOf(slug);
  if (toks.some((t) => t.length >= 5 && fd.includes(flat(t)))) return true;
  for (const e of emails) {
    const ed = (e.split('@')[1] || '').replace(/^www\./i, '').toLowerCase();
    if (ed && !FREEMAIL.test(ed) && ed === h) return true;
  }
  const initials = slug.split('-').filter((w) => !STOPWORDS.has(w)).map((w) => w[0]).join('');
  if (initials.length >= 4 && fd.includes(initials)) return true;
  if (initials.length >= 3 && fd.startsWith(initials)) return true;
  if (toks.some((t) => fd.includes(flat(t)))) return true;
  return false;
}

const NAME_OVERRIDES = {
  'genos-steaks': "Geno's Steaks",
  'pats-king-steaks': "Pat's King of Steaks",
  'dibruno-bros': 'Di Bruno Bros. Italian Market',
  'termini-bros': 'Termini Bros.',
  'isgro-pastries': 'Isgro Pastries',
  'johns-roast-pork': "John's Roast Pork",
  'franklin-fountain': 'Franklin Fountain',
  zahav: 'Zahav',
  'standard-tap': 'Standard Tap',
  'la-colombe-rittenhouse': 'La Colombe Coffee Roasters, Rittenhouse Square',
  'frankford-hall': 'Frankford Hall',
  'johnny-brendas': "Johnny Brenda's",
  suraya: 'Suraya',
  'reanimator-coffee': 'ReAnimator Coffee',
  'victor-cafe': 'Victor Cafe',
  'morris-arboretum': 'Morris Arboretum',
  'eastern-state': 'Eastern State Penitentiary',
  'magic-gardens': "Philadelphia's Magic Gardens",
  'bartram-garden': "Bartram's Garden",
  'reading-terminal': 'Reading Terminal Market',
  'fantes-kitchen-shop': "Fante's Kitchen Shop",
  'philadelphia-record-exchange': 'Philadelphia Record Exchange',
  'moms-organic-market': "MOM's Organic Market, Center City",
  'good-dog-bar': 'Good Dog Bar',
  'square-1682': 'Square 1682',
};
const SUFFIX = { llc: 'LLC', inc: 'Inc.', dmd: 'DMD', pa: 'PA', 'e-and-e': 'E & E' };
function displayName(slug) {
  if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
  return slug
    .split('-')
    .map((w) => SUFFIX[w] || (/^\d+$/.test(w) ? w : w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
    .replace(/\bAnd\b/g, 'and');
}

const out = [];
for (const b of bySlug.values()) {
  const own = [];
  const other = [];
  for (const l of b.links) (ownsDomain(b.slug, l, b.emails) ? own : other).push(l);
  // Grade the homepage, not whichever deep page the sheet happened to cite.
  const origin = own.length ? own[0].match(/^https?:\/\/[^/]+/)[0] + '/' : null;
  out.push({
    prospect_id: `PHL-${b.batch}-${b.slug}`,
    business_name: displayName(b.slug),
    slug: b.slug,
    batch: b.batch,
    vertical: VERTICAL_OF[b.batch] || '',
    market: 'philadelphia',
    website: origin,
    cited_url: own[0] || null,
    candidate_urls: origin ? [] : other.filter((l) => !DIRECTORY.test(host(l))),
    evidence_urls: other.filter((l) => DIRECTORY.test(host(l))),
    prior_demo: b.demo,
    has_phone: Boolean(b.tel),
    public_email_count: b.emails.length,
  });
}

out.sort((a, b) => (a.batch === b.batch ? a.slug.localeCompare(b.slug) : a.batch.localeCompare(b.batch)));
fs.writeFileSync(process.argv[3], JSON.stringify({ source: 'Momentum 360 — 100 Completed Prospect Websites + Verified Contacts (2026-08-05)', extracted: '2026-08-06', count: out.length, prospects: out }, null, 2) + '\n');

console.log(`prospects: ${out.length}`);
for (const batch of ['B1', 'B2', 'B3', 'B4']) {
  const rows = out.filter((p) => p.batch === batch);
  const none = rows.filter((p) => !p.website);
  console.log(`  ${batch}: ${rows.length} rows, ${none.length} with no own domain`);
}
console.log('\nno own domain found:');
for (const p of out.filter((x) => !x.website)) {
  console.log(`  ${p.batch} ${p.slug}${p.candidate_urls.length ? '  candidates=' + p.candidate_urls.join(',') : ''}${p.evidence_urls.length ? '  evidence=' + p.evidence_urls.length : ''}`);
}
