'use strict';

/**
 * Indeed hiring-signal adapter.
 *
 * Live Indeed scraping is intentionally NOT implemented here (ToS / credential gate).
 * This adapter normalizes an imported signals file into the shared prospect schema
 * so hiring signals feed the SAME qualify → site-factory path as Maps rows.
 */

function domainFromCompany(company, website) {
  if (website) return website;
  return null;
}

function fromIndeedSignal(row, index = 0) {
  const jobId = row.job_id || row.jobId || row.id || `idx-${index + 1}`;
  const company = row.company || row.business_name || row.employer || `company-${index + 1}`;
  const website = domainFromCompany(company, row.website || row.company_website || null);
  const role = row.role || row.title || row.job_title || 'marketing role';

  return {
    prospect_id: `indeed:${jobId}`,
    business_name: String(company),
    source: 'indeed',
    website: website ? String(website) : null,
    phone: row.phone || null,
    email: row.email || null,
    address: row.location || row.address || null,
    market: row.market || row.location || null,
    category: row.category || null,
    vertical: row.vertical || guessVertical(role, row.category),
    place_id: null,
    maps_url: null,
    rating: row.rating != null ? Number(row.rating) : null,
    review_count: row.review_count != null ? Number(row.review_count) : null,
    ad_presence: row.ad_presence === true,
    hiring_signal: {
      role: String(role),
      salary_band: row.salary_band || row.salary || null,
      posted_at: row.posted_at || row.date || null,
      job_url: row.job_url || row.url || null,
      source: 'indeed',
    },
    harvest_path: row.harvest_path || null,
    status: 'new',
    score: null,
    score_reasons: [],
    last_touched: null,
    next_action: null,
  };
}

function guessVertical(role, category) {
  if (category) return String(category).toLowerCase().replace(/\s+/g, '-');
  // Role alone is not a vertical; leave null so scorer gives partial credit only if set
  return null;
}

function fromIndeedIntake(doc) {
  const rows = Array.isArray(doc) ? doc : doc.signals || doc.jobs || doc.prospects || [];
  return rows.map((r, i) => fromIndeedSignal(r, i));
}

module.exports = { fromIndeedSignal, fromIndeedIntake };
