'use strict';

const fs = require('fs');
const path = require('path');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  const nonEmpty = rows.filter((values) => values.some((value) => String(value).trim()));
  if (!nonEmpty.length) return [];
  const headers = nonEmpty[0].map((value) => String(value).trim());
  return nonEmpty.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] == null ? '' : values[index]]))
  );
}

function rowsFromDocument(doc) {
  if (Array.isArray(doc)) return doc;
  if (doc && Array.isArray(doc.prospects)) return doc.prospects;
  if (doc && Array.isArray(doc.rows)) return doc.rows;
  return [];
}

function readRows(file) {
  const text = fs.readFileSync(file, 'utf8');
  return path.extname(file).toLowerCase() === '.csv'
    ? parseCsv(text)
    : rowsFromDocument(JSON.parse(text));
}

function first(row, names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim() !== '') return row[name];
  }
  return null;
}

function numberOrNull(value) {
  if (value == null || String(value).trim() === '') return null;
  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
}

function booleanValue(value) {
  return value === true || /^(true|yes|1)$/i.test(String(value || '').trim());
}

function normalizeDomain(value) {
  if (!value) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return String(value)
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim();
  }
}

function normalizeProspect(row, index = 0) {
  const placeId = first(row, ['place_id', 'placeId', 'Place ID', 'google_place_id']);
  const website = first(row, ['website', 'Website', 'Website/other', 'url', 'site_url']);
  const business = first(row, ['business_name', 'Business', 'business', 'Name', 'name']);
  const category = first(row, ['category', 'Category', 'vertical', 'Vertical']);
  const market = first(row, ['market', 'Market', 'city', 'City']);
  const address = first(row, ['address', 'Address', 'formatted_address']);
  const phone = first(row, ['phone', 'Phone', 'Number', 'number']);
  const mapsUrl = first(row, ['maps_url', 'google_maps_url', 'Google Maps URL', 'map_url']);
  const domain = normalizeDomain(website);
  const prospectId = first(row, ['prospect_id', 'Prospect ID']) ||
    (placeId ? `maps:${placeId}` : domain ? `web:${domain}` : `import:${index + 1}`);

  return {
    prospect_id: String(prospectId),
    business_name: business ? String(business).trim() : '',
    source: String(first(row, ['source', 'Source']) || 'maps-import'),
    category: category ? String(category).trim() : '',
    vertical: String(first(row, ['vertical', 'Vertical']) || category || '').trim(),
    market: market ? String(market).trim() : '',
    address: address ? String(address).trim() : '',
    phone: phone ? String(phone).trim() : '',
    website: website ? String(website).trim() : '',
    domain,
    maps_url: mapsUrl ? String(mapsUrl).trim() : '',
    place_id: placeId ? String(placeId).trim() : '',
    review_count: numberOrNull(first(row, ['review_count', 'reviews', 'Reviews', 'Review Count'])),
    rating: numberOrNull(first(row, ['rating', 'Rating'])),
    ad_presence: booleanValue(first(row, ['ad_presence', 'ads', 'Ad Presence'])),
    harvest_path: first(row, ['harvest_path']) || null,
    socials: first(row, ['socials']) || null,
  };
}

const REQUIRED_DISCOVERY_FIELDS = [
  'business_name',
  'category',
  'market',
  'address',
  'phone',
  'website',
  'maps_url',
  'place_id',
  'review_count',
  'rating',
];

function missingDiscoveryFields(prospect) {
  return REQUIRED_DISCOVERY_FIELDS.filter((field) => {
    const value = prospect[field];
    return value == null || String(value).trim() === '';
  });
}

function completeness(prospect) {
  return REQUIRED_DISCOVERY_FIELDS.length - missingDiscoveryFields(prospect).length;
}

function dedupeProspects(prospects) {
  const accepted = [];
  const duplicateRows = [];
  const keyToIndex = new Map();
  prospects.forEach((prospect) => {
    const keys = [
      prospect.place_id && `place:${prospect.place_id.toLowerCase()}`,
      prospect.domain && `domain:${prospect.domain}`,
    ].filter(Boolean);
    const priorIndex = keys.map((key) => keyToIndex.get(key)).find((index) => index != null);
    if (priorIndex == null) {
      const index = accepted.push(prospect) - 1;
      keys.forEach((key) => keyToIndex.set(key, index));
      return;
    }
    const prior = accepted[priorIndex];
    const keepIncoming = completeness(prospect) > completeness(prior);
    if (keepIncoming) {
      accepted[priorIndex] = prospect;
      keys.forEach((key) => keyToIndex.set(key, priorIndex));
      duplicateRows.push({ kept: prospect.prospect_id, dropped: prior.prospect_id, reason: 'more complete row' });
    } else {
      duplicateRows.push({ kept: prior.prospect_id, dropped: prospect.prospect_id, reason: 'duplicate identity' });
    }
  });
  return { prospects: accepted, duplicateRows };
}

function addSuppressionRows(rows, ids, domains, mailedOnly = false) {
  rows.forEach((row) => {
    if (mailedOnly && !first(row, ['mailed_on', 'mailedOn', 'sent_on'])) return;
    const id = first(row, ['prospect_id', 'Prospect ID']);
    const website = first(row, ['website', 'Website', 'source_url']);
    if (id) ids.add(String(id).toLowerCase());
    const domain = normalizeDomain(website);
    if (domain) domains.add(domain);
  });
}

function loadSuppressionFiles(files = []) {
  const ids = new Set();
  const domains = new Set();
  files.filter(Boolean).forEach((file) => addSuppressionRows(readRows(file), ids, domains));
  return { ids, domains };
}

function loadMailedSuppressions(batchesRoot) {
  const ids = new Set();
  const domains = new Set();
  if (!batchesRoot || !fs.existsSync(batchesRoot)) return { ids, domains };
  const stack = [batchesRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name === 'prospects.csv') {
        addSuppressionRows(readRows(full), ids, domains, true);
      }
    }
  }
  return { ids, domains };
}

module.exports = {
  REQUIRED_DISCOVERY_FIELDS,
  parseCsv,
  readRows,
  normalizeDomain,
  normalizeProspect,
  missingDiscoveryFields,
  dedupeProspects,
  loadSuppressionFiles,
  loadMailedSuppressions,
};
