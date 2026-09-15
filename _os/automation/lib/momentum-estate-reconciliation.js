'use strict';

const { parseCsv } = require('./direct-mail');
const { sha256, stableJson } = require('./outcome-graph');

const CLASSIFICATION_BY_STATE = Object.freeze({
  cleared_to_show: { classification: 'retain', action: 'validate_in_place' },
  hold_for_repair: { classification: 'repair', action: 'repair_then_validate' },
  do_not_pitch: { classification: 'exclude', action: 'no_build_no_pitch' },
});

function normalizeName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function canonicalUrl(value) {
  if (!String(value || '').trim()) return '';
  const url = new URL(value);
  const pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
  return `${url.protocol.toLowerCase()}//${url.hostname.toLowerCase()}${pathname}`;
}

function conceptSlug(value) {
  if (!String(value || '').trim()) return '';
  const parts = new URL(value).pathname.split('/').filter(Boolean);
  return String(parts.at(-1) || '').toLowerCase();
}

function countBy(values) {
  return values.reduce((out, value) => {
    out[value] = (out[value] || 0) + 1;
    return out;
  }, {});
}

function uniqueIndex(rows, keyFn) {
  const index = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(row);
  }
  return index;
}

function sourceFingerprint(current, predecessor) {
  return sha256(stableJson({
    current,
    predecessor: {
      slug: predecessor.slug,
      business: predecessor.business,
      currentBatch: predecessor.currentBatch,
      sourceClass: predecessor.sourceClass,
      publicationState: predecessor.publicationState,
      siteUrl: predecessor.siteUrl,
      route: predecessor.route,
      sourceLocator: normalizePath(predecessor.sourceLocator),
    },
  }));
}

function buildMomentumEstate({ currentSnapshotText, predecessorCsvText, aliasDecisionText }) {
  const current = JSON.parse(String(currentSnapshotText).replace(/^\uFEFF/, ''));
  const aliases = JSON.parse(String(aliasDecisionText).replace(/^\uFEFF/, ''));
  const predecessor = parseCsv(predecessorCsvText);

  if (current?.schema_version !== 1 || !Array.isArray(current.rows)) {
    throw new Error('Current 238-row snapshot is invalid.');
  }
  if (current.rows.length !== 238) {
    throw new Error(`Expected 238 current rows; received ${current.rows.length}.`);
  }
  if (predecessor.length !== 245) {
    throw new Error(`Expected 245 predecessor rows; received ${predecessor.length}.`);
  }
  if (aliases?.schema_version !== 1 || !Array.isArray(aliases.aliases)) {
    throw new Error('Identity alias decision file is invalid.');
  }

  const bySlug = uniqueIndex(predecessor, (row) => String(row.slug || '').toLowerCase());
  const byName = uniqueIndex(predecessor, (row) => normalizeName(row.business));
  const aliasMap = new Map(
    aliases.aliases.map((row) => [row.normalized_current_name, row.predecessor_slug])
  );
  if (bySlug.size !== 245) throw new Error('Predecessor slugs are not unique.');

  const unresolved = [];
  const records = current.rows.map((row) => {
    const normalizedBusiness = normalizeName(row.business);
    const urlSlug = conceptSlug(row.concept_url);
    let match = null;
    let matchMethod = null;

    if (urlSlug && bySlug.get(urlSlug)?.length === 1) {
      [match] = bySlug.get(urlSlug);
      matchMethod = 'concept_url_slug';
    } else if (byName.get(normalizedBusiness)?.length === 1) {
      [match] = byName.get(normalizedBusiness);
      matchMethod = 'exact_normalized_name';
    } else if (aliasMap.has(normalizedBusiness)) {
      const aliasSlug = aliasMap.get(normalizedBusiness);
      if (bySlug.get(aliasSlug)?.length === 1) {
        [match] = bySlug.get(aliasSlug);
        matchMethod = 'bounded_alias_decision';
      }
    }

    if (!match) {
      unresolved.push({ business: row.business, state: row.state, source_row: row.source_row });
      return null;
    }

    const classification = CLASSIFICATION_BY_STATE[row.state];
    if (!classification) throw new Error(`Unsupported current state: ${row.state}`);
    const identityLocator = row.concept_url
      ? `current_url|${canonicalUrl(row.concept_url)}`
      : [
          'predecessor',
          match.slug,
          normalizePath(match.sourceLocator),
          normalizePath(match.route),
        ].join('|');
    const fingerprint = sourceFingerprint(row, match);

    return {
      page_id: `m360-page-${sha256(identityLocator).slice(0, 16)}`,
      business_id: `m360-business-${match.slug}`,
      current_record: {
        state: row.state,
        source_row: row.source_row,
        business: row.business,
        concept_url: row.concept_url || null,
      },
      canonical_identity: {
        predecessor_slug: match.slug,
        predecessor_business: match.business,
        match_method: matchMethod,
      },
      classification: classification.classification,
      next_action: classification.action,
      build_eligible_now: classification.classification === 'retain',
      pitch_eligible_now: classification.classification === 'retain',
      source_locator: row.concept_url || normalizePath(match.sourceLocator),
      predecessor_route: match.route || null,
      predecessor_publication_state: match.publicationState || null,
      source_fingerprint_sha256: fingerprint,
      collision_key: `m360-page-${sha256(identityLocator).slice(0, 16)}|m360-business-${match.slug}|${fingerprint}`,
    };
  });

  if (unresolved.length) {
    throw new Error(`Unresolved current identities: ${JSON.stringify(unresolved)}`);
  }

  const pageIds = records.map((row) => row.page_id);
  const businessIds = records.map((row) => row.business_id);
  if (new Set(pageIds).size !== 238) throw new Error('Stable page IDs are not unique.');
  if (new Set(businessIds).size !== 236) {
    throw new Error(`Expected 236 distinct businesses; resolved ${new Set(businessIds).size}.`);
  }

  const duplicateBusinesses = [...uniqueIndex(records, (row) => row.business_id).entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([businessId, rows]) => ({
      business_id: businessId,
      predecessor_slug: rows[0].canonical_identity.predecessor_slug,
      page_count: rows.length,
      pages: rows.map((row) => ({
        page_id: row.page_id,
        state: row.current_record.state,
        business: row.current_record.business,
        concept_url: row.current_record.concept_url,
      })),
    }))
    .sort((a, b) => a.business_id.localeCompare(b.business_id));
  const matchedSlugs = new Set(records.map((row) => row.canonical_identity.predecessor_slug));
  const predecessorOnly = predecessor
    .filter((row) => !matchedSlugs.has(row.slug))
    .map((row) => ({
      slug: row.slug,
      business: row.business,
      source_class: row.sourceClass,
      publication_state: row.publicationState,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const classificationCounts = countBy(records.map((row) => row.classification));
  const matchMethodCounts = countBy(records.map((row) => row.canonical_identity.match_method));

  return {
    schema_version: 1,
    reconciliation_id: 'momentum-current-238-to-predecessor-245-2026-08-24',
    reconciled_at: current.captured_at,
    state: 'identity_reconciled',
    explanation: 'The current source has 238 page records and 236 businesses because Johnny\'s Pizza and THR Insurance each have two live page versions in different states.',
    source_manifest: {
      current_snapshot_sha256: sha256(Buffer.from(currentSnapshotText)),
      predecessor_inventory_sha256: sha256(Buffer.from(predecessorCsvText)),
      alias_decisions_sha256: sha256(Buffer.from(aliasDecisionText)),
    },
    counts: {
      current_page_records: records.length,
      distinct_businesses: new Set(businessIds).size,
      stable_page_ids: new Set(pageIds).size,
      predecessor_slugs: predecessor.length,
      predecessor_slugs_in_current_projection: matchedSlugs.size,
      predecessor_only_slugs: predecessorOnly.length,
      classifications: classificationCounts,
      match_methods: matchMethodCounts,
    },
    duplicate_businesses: duplicateBusinesses,
    predecessor_only: predecessorOnly,
    records,
    authority: {
      identity_reconciliation_complete: true,
      canonical_queue_write_authorized: false,
      site_mutation_authorized: false,
      deployment_authorized: false,
      external_contact_authorized: false,
    },
  };
}

module.exports = {
  buildMomentumEstate,
  canonicalUrl,
  conceptSlug,
  normalizeName,
};
