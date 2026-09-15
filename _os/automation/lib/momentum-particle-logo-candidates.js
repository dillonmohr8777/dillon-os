'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MIME_EXTENSIONS = Object.freeze({
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/gif': '.gif',
  'image/avif': '.avif',
});

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function rankLogoCandidates(html, pageUrl) {
  const tags = String(html).match(/<img\b[^>]*>/gi) || [];
  return tags.map((tag, index) => {
    const attributes = parseAttributes(tag);
    const source = attributes.src || attributes['data-src'] || '';
    const haystack = `${attributes.class || ''} ${attributes.id || ''} ${attributes.alt || ''} ${source}`.toLowerCase();
    let score = 0;
    const reasons = [];
    if ((attributes['data-role'] || '').toLowerCase() === 'logo') {
      score += 100;
      reasons.push('data-role=logo');
    }
    if (/\b(?:brand|site|nav)?-?logo\b/.test(haystack)) {
      score += 45;
      reasons.push('logo token');
    }
    if (/official logo/.test(haystack)) {
      score += 35;
      reasons.push('official-logo alt');
    }
    if (/\b(?:header|nav|brand)\b/.test(haystack)) {
      score += 10;
      reasons.push('brand context');
    }
    let candidateUrl = null;
    try {
      candidateUrl = source ? new URL(source, pageUrl).toString() : null;
    } catch {
      candidateUrl = null;
    }
    return { index, score, reasons, attributes, candidate_url: candidateUrl };
  })
    .filter((candidate) => candidate.candidate_url && candidate.score >= 35)
    .sort((left, right) => right.score - left.score || left.index - right.index);
}

function extensionFor(contentType, candidateUrl) {
  const normalized = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (MIME_EXTENSIONS[normalized]) return MIME_EXTENSIONS[normalized];
  try {
    const extension = path.extname(new URL(candidateUrl).pathname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif'].includes(extension)) {
      return extension === '.jpeg' ? '.jpg' : extension;
    }
  } catch {
    return '';
  }
  return '';
}

async function fetchWithTimeout(fetchImpl, url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'Dillon-OS-Logo-Candidate-Collector/1.0' },
    });
  } finally {
    clearTimeout(timer);
  }
}

function atomicWriteJson(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, target);
}

async function collectOne(record, options) {
  const pageUrl = record.current_record?.concept_url;
  const base = {
    page_id: record.page_id,
    business_id: record.business_id,
    business: record.current_record?.business,
    classification: record.classification,
    concept_url: pageUrl,
    source_fingerprint_sha256: record.source_fingerprint_sha256,
    route_slug: record.canonical_identity?.predecessor_slug,
    exact_logo_verified: false,
    registry_eligible: false,
    verification_state: 'candidate_pending_visual_verification',
  };
  if (!pageUrl) return { ...base, extraction_state: 'held_missing_concept_url' };

  try {
    const pageResponse = await fetchWithTimeout(options.fetchImpl, pageUrl, options.timeoutMs);
    if (!pageResponse.ok) {
      return { ...base, extraction_state: 'held_page_fetch', page_status: pageResponse.status };
    }
    const html = await pageResponse.text();
    if (Buffer.byteLength(html, 'utf8') > options.maxHtmlBytes) {
      return { ...base, extraction_state: 'held_page_too_large' };
    }
    const ranked = rankLogoCandidates(html, pageResponse.url || pageUrl);
    if (!ranked.length) return { ...base, extraction_state: 'held_logo_candidate_missing' };
    const selected = ranked[0];
    const logoResponse = await fetchWithTimeout(options.fetchImpl, selected.candidate_url, options.timeoutMs);
    if (!logoResponse.ok) {
      return {
        ...base,
        extraction_state: 'held_logo_fetch',
        logo_status: logoResponse.status,
        candidate_url: selected.candidate_url,
      };
    }
    const bytes = Buffer.from(await logoResponse.arrayBuffer());
    if (!bytes.length || bytes.length > options.maxLogoBytes) {
      return {
        ...base,
        extraction_state: bytes.length ? 'held_logo_too_large' : 'held_logo_empty',
        candidate_url: selected.candidate_url,
        candidate_bytes: bytes.length,
      };
    }
    const contentType = logoResponse.headers.get('content-type') || '';
    const extension = extensionFor(contentType, selected.candidate_url);
    if (!extension) {
      return { ...base, extraction_state: 'held_unsupported_logo_type', candidate_url: selected.candidate_url, content_type: contentType };
    }
    const filename = `${record.page_id}${extension}`;
    const assetPath = path.join(options.assetsDir, filename);
    fs.mkdirSync(options.assetsDir, { recursive: true });
    fs.writeFileSync(assetPath, bytes);
    return {
      ...base,
      extraction_state: 'candidate_extracted',
      candidate_url: selected.candidate_url,
      candidate_asset: options.logicalAssetPrefix ? `${options.logicalAssetPrefix}/${filename}` : assetPath,
      candidate_sha256: sha256(bytes),
      candidate_bytes: bytes.length,
      content_type: contentType.split(';')[0].trim().toLowerCase(),
      selector_evidence: selected.reasons,
      selector_score: selected.score,
      alternate_candidate_count: Math.max(0, ranked.length - 1),
    };
  } catch (error) {
    return {
      ...base,
      extraction_state: error?.name === 'AbortError' ? 'held_timeout' : 'held_fetch_error',
      error_class: error?.name || 'Error',
    };
  }
}

async function collectMomentumParticleLogoCandidates(manifest, options = {}) {
  if (manifest?.state !== 'identity_reconciled' || !Array.isArray(manifest.records)) {
    throw new Error('A reconciled Momentum estate manifest is required.');
  }
  const outputPath = path.resolve(options.outputPath);
  const assetsDir = path.resolve(options.assetsDir || path.join(path.dirname(outputPath), 'assets'));
  const concurrency = Number(options.concurrency || 3);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 3) {
    throw new Error('Logo candidate concurrency must be an integer from 1 to 3.');
  }
  const active = manifest.records
    .filter((record) => record.classification !== 'exclude')
    .sort((left, right) => left.page_id.localeCompare(right.page_id));
  const excluded = manifest.records
    .filter((record) => record.classification === 'exclude')
    .map((record) => ({
      page_id: record.page_id,
      business_id: record.business_id,
      business: record.current_record?.business,
      classification: 'exclude',
      extraction_state: 'excluded_no_binding',
      exact_logo_verified: false,
      registry_eligible: false,
    }));
  if (active.length !== 220 || excluded.length !== 18) {
    throw new Error(`Expected 220 active and 18 excluded records; received ${active.length} and ${excluded.length}.`);
  }

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
  const collected = [];
  const collectorOptions = {
    fetchImpl,
    assetsDir,
    logicalAssetPrefix: options.logicalAssetPrefix || null,
    timeoutMs: Number(options.timeoutMs || 15000),
    maxHtmlBytes: Number(options.maxHtmlBytes || 2_000_000),
    maxLogoBytes: Number(options.maxLogoBytes || 5_000_000),
  };
  for (let index = 0; index < active.length; index += concurrency) {
    const batch = active.slice(index, index + concurrency);
    collected.push(...await Promise.all(batch.map((record) => collectOne(record, collectorOptions))));
    const checkpointRows = [...collected, ...excluded];
    atomicWriteJson(outputPath, {
      schema_version: 1,
      state: 'collecting_candidates',
      source_reconciliation_id: manifest.reconciliation_id,
      processed_active_records: collected.length,
      total_active_records: active.length,
      candidates: checkpointRows,
      authority: {
        exact_logo_verification_granted: false,
        portfolio_registry_write_authorized: false,
        deployment_authorized: false,
      },
    });
  }
  const candidates = [...collected, ...excluded].sort((left, right) => left.page_id.localeCompare(right.page_id));
  const counts = candidates.reduce((summary, candidate) => {
    summary[candidate.extraction_state] = (summary[candidate.extraction_state] || 0) + 1;
    return summary;
  }, {});
  const result = {
    schema_version: 1,
    state: 'candidates_collected_pending_independent_verification',
    source_reconciliation_id: manifest.reconciliation_id,
    counts: {
      logical_records: candidates.length,
      active_records: active.length,
      excluded_records: excluded.length,
      ...counts,
      registry_eligible: 0,
    },
    candidates,
    authority: {
      exact_logo_verification_granted: false,
      portfolio_registry_write_authorized: false,
      deployment_authorized: false,
      generated_logo_substitution_authorized: false,
      external_mutation_attempted: false,
    },
  };
  atomicWriteJson(outputPath, result);
  return result;
}

module.exports = {
  collectMomentumParticleLogoCandidates,
  extensionFor,
  parseAttributes,
  rankLogoCandidates,
};
