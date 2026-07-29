'use strict';

/**
 * Normalize Mac's Maps / sheet prospect rows into the shared prospect schema.
 */
function fromMapsRow(row, index = 0) {
  const placeId = row.place_id || row.placeId || null;
  const website = row.website || row.Website || row.url || null;
  const name = row.business_name || row.Business || row.name || row.Name || `prospect-${index + 1}`;
  const prospect_id =
    row.prospect_id ||
    placeId ||
    (website ? `web:${website.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : `maps:${index + 1}:${name}`);

  return {
    prospect_id: String(prospect_id),
    business_name: String(name),
    source: row.source || 'maps',
    website: website ? String(website) : null,
    phone: row.phone || row.Number || null,
    email: row.email || row.Email || null,
    address: row.address || null,
    market: row.market || null,
    category: row.category || null,
    vertical: row.vertical || row.category || null,
    place_id: placeId,
    maps_url: row.maps_url || row.google_maps_url || null,
    rating: row.rating != null ? Number(row.rating) : null,
    review_count: row.review_count != null ? Number(row.review_count) : row.reviews != null ? Number(row.reviews) : null,
    ad_presence: row.ad_presence === true || row.ad_presence === 'true' || false,
    hiring_signal: null,
    harvest_path: row.harvest_path || null,
    status: 'new',
    score: null,
    score_reasons: [],
    last_touched: null,
    next_action: null,
  };
}

function fromMapsIntake(doc) {
  const rows = Array.isArray(doc) ? doc : doc.prospects || doc.rows || [];
  return rows.map((r, i) => fromMapsRow(r, i));
}

module.exports = { fromMapsRow, fromMapsIntake };
