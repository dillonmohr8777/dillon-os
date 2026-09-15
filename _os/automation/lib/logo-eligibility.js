'use strict';

// One fail-closed contract for registry, dashboard, CSV and the Python selector.
const LOGO_TTL_DAYS = 45;
// Two ways a logo earns `verified`, and the audit trail always says which.
//
// `visual_review` is a person looking at the mark. `automated_pixel_audit` is
// lib/logo-audit.js decoding the bitmap and counting transparent pixels; it is
// admissible only alongside the measurements it claims to have taken, which is
// why it carries extra required evidence below rather than fewer checks.
//
// Before this existed the only supply of verified logos was a hand review. One
// ran on 2026-09-05, produced exactly 20 rows, and the same day's build consumed
// all 20 — after which the active pool was 0 and the daily builder failed with
// exit code 1 every morning while the sweep re-fetched 60 logos a day and
// verified none of them.
const VALIDATION_METHODS = new Set(['visual_review', 'automated_pixel_audit']);
const SOCIAL_HOSTS = new Set(['facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'pinterest.com']);
const text = value => String(value ?? '').trim();
const exactFlag = value => value === true || value === 'exact';
function webUrl(value) {
  try {
    const u = new URL(text(value));
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u : null;
  } catch { return null; }
}
function hostOf(value) {
  return (webUrl(/^https?:\/\//i.test(text(value)) ? value : `https://${text(value)}`)?.hostname || '').toLowerCase().replace(/^www\./, '');
}
function sameSite(source, official) {
  const a = hostOf(source), b = hostOf(official);
  // Never guess a registrable domain: foo.github.io and bar.github.io differ.
  return !!a && !!b && (a === b || a.endsWith(`.${b}`));
}
function isSocialUrl(value) {
  const u = webUrl(value);
  return !!u && [...SOCIAL_HOSTS].some(h => sameSite(u.href, `https://${h}`)) && u.pathname.replace(/\//g, '').length > 1;
}
const hold = (reason, status = 'pending') => ({ eligible: false, status, reason });
function assessLogoEligibility(prospect = {}, { now = Date.now() } = {}) {
  const e = prospect.logo_eligibility || prospect.logo_provenance || prospect.imagery?.logo_eligibility || prospect.imagery?.logo_provenance;
  if (!e || typeof e !== 'object') return hold('logo_provenance_missing');
  if (e.status !== 'verified') return hold(e.reason || 'logo_verification_pending', e.status === 'rejected' ? 'rejected' : 'pending');
  if (!exactFlag(e.identity_match)) return hold('business_identity_unverified');
  if (!exactFlag(e.exact_match)) return hold('exact_logo_match_unverified');
  if (e.logo_role !== 'business_logo' || !VALIDATION_METHODS.has(e.validation_method) || !text(e.validated_by)) return hold('logo_visual_validation_missing');
  if (e.validation_method === 'automated_pixel_audit') {
    // An automated pass must show its working. These are the numbers
    // lib/logo-audit.js measured; absent or implausible values hold the row
    // rather than inheriting the trust a human review would have carried.
    const ratio = Number(e.transparent_ratio);
    const content = Number(e.content_ratio);
    if (!Number.isFinite(ratio) || ratio < 0.02) return hold('logo_transparency_unmeasured');
    if (!Number.isFinite(content) || content < 0.02) return hold('logo_content_unmeasured');
    if (!text(e.transformation)) return hold('logo_transformation_unrecorded');
    // Background removal rewrites bytes, so the delivered asset can no longer be
    // the source hash. It must still name the source it came from.
    if (e.background_removed === true && !/^[a-f0-9]{64}$/i.test(text(e.output_sha256))) return hold('logo_output_hash_missing');
  }
  const asset = webUrl(e.source_url), page = webUrl(e.source_page);
  if (!asset || !page) return hold('logo_source_url_invalid', 'rejected');
  if (/favicon|(?:^|[\/_-])(?:placeholder|spacer|tracking|pixel|facebook|instagram|twitter|linkedin|yelp|paypal)[-_.\/]/i.test(asset.pathname)) return hold('logo_is_icon_or_platform_asset', 'rejected');
  if (e.fetch_status !== 200 || e.usable !== true || !/^[a-f0-9]{64}$/i.test(text(e.source_sha256)) || !(e.bytes >= 24)) return hold('logo_fetch_unverified');
  if (!['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(e.image_format) || !(e.width >= 64 && e.height >= 16)) return hold('logo_not_usable');
  if (e.transparent !== true) return hold('logo_transparency_unverified');
  if (e.clarity_reviewed !== true || !Number.isFinite(e.display_width) || !Number.isFinite(e.display_height) || e.display_width <= 0 || e.display_height <= 0) return hold('logo_clarity_unverified');
  if (e.image_format !== 'svg' && (e.width < 2 * e.display_width || e.height < 2 * e.display_height)) return hold('logo_resolution_insufficient');
  const age = Number(now) - Date.parse(e.fetched_at);
  if (!Number.isFinite(age) || age < -300000 || age >= LOGO_TTL_DAYS * 86400000) return hold('logo_fetch_stale');
  const official = prospect.website || prospect.official_url || prospect.officialUrl;
  if (e.source_kind === 'official_site') {
    if (!webUrl(official) || !sameSite(page.href, official)) return hold('logo_source_not_official_site', 'rejected');
  } else if (e.source_kind === 'official_social') {
    if (!isSocialUrl(e.profile_url) || !exactFlag(e.account_match)) return hold('official_social_account_unverified');
    if (!exactFlag(e.linked_from_official_site) || !webUrl(official) || !sameSite(page.href, official)) return hold('official_social_link_unverified');
  } else return hold('logo_source_kind_unverified', 'rejected');
  // Allowlisted projection: never publish arbitrary review notes or local paths.
  const result = { eligible: true, status: 'verified', reason: `${e.source_kind}_exact` };
  for (const key of ['source_kind', 'source_url', 'source_page', 'source_sha256', 'fetched_at', 'fetch_status', 'bytes', 'image_format', 'width', 'height', 'usable', 'transparent', 'clarity_reviewed', 'display_width', 'display_height', 'logo_role', 'validation_method', 'validated_by', 'identity_match', 'exact_match', 'profile_url', 'account_match', 'linked_from_official_site', 'transformation', 'background_removed', 'transparent_ratio', 'content_ratio', 'edge_transparent_ratio', 'output_sha256', 'output_bytes']) {
    if (e[key] !== undefined) result[key] = e[key];
  }
  return result;
}
function applyLogoEligibility(row, evidence, { today = '' } = {}) {
  const decision = assessLogoEligibility({ ...row, logo_eligibility: evidence });
  row.logo_history = Array.isArray(row.logo_history) ? row.logo_history : [];
  if (row.logo_eligibility && !row.logo_history.length) {
    row.logo_history.push({ date: row.logo_checked || row.logo_eligibility.fetched_at || '', ...row.logo_eligibility });
  }
  row.logo_eligibility = { ...evidence, ...decision };
  row.logo_status = decision.status;
  row.logo_hold_reason = decision.eligible ? '' : decision.reason;
  row.logo_history.push({ date: today || new Date().toISOString(), ...row.logo_eligibility });
  if (today) row.logo_checked = today;
  return decision;
}
function businessKey(name) {
  return text(name).toLowerCase().replace(/^the\s+/, '').replace(/&/g, 'and').replace(/\b(llc|inc|ltd|corporation|corp|co)\b\.?/g, '').replace(/[^a-z0-9]/g, '');
}
function prospectKeys(p) {
  const name = p.business_name || p.name || p.n;
  const slug = text(p.slug) || text(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return [hostOf(p.website || p.w || p.domain || p.d), businessKey(name), slug].map((key, i) => key ? `${i}:${key}` : '');
}
function dedupeDecisions(prospects, { priorBuilds } = {}) {
  if (priorBuilds === undefined) {
    const history = require('../fixtures/prospects/prior-build-index.json');
    if (history.schema !== 1 || !Array.isArray(history.entries) || !history.entries.length) throw new Error('Verified prior-build index unavailable');
    priorBuilds = history.entries;
  }
  const seen = new Set();
  const builtKeys = new Set(priorBuilds.flatMap(prospectKeys).filter(Boolean));
  return prospects.map(p => {
    let decision = assessLogoEligibility(p);
    if (p.lifecycle === 'client' || p.lifecycle === 'excluded') decision = hold('lifecycle_excluded', 'rejected');
    const keys = prospectKeys(p).filter(Boolean);
    if (['built', 'mailed'].includes(p.lifecycle) || keys.some(k => builtKeys.has(k))) decision = hold('previous_homepage_exists', 'rejected');
    if (decision.eligible && keys.some(k => seen.has(k))) decision = hold('duplicate_business_or_slug', 'rejected');
    if (decision.eligible) keys.forEach(k => seen.add(k));
    return decision;
  });
}
module.exports = { LOGO_TTL_DAYS, VALIDATION_METHODS, SOCIAL_HOSTS, assessLogoEligibility, applyLogoEligibility, exactFlag, hostOf, sameSite, isSocialUrl, prospectKeys, dedupeDecisions };

// The external selector calls the same validator rather than duplicating it.
if (require.main === module) {
  const rows = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  process.stdout.write(JSON.stringify(rows.map(p => assessLogoEligibility(p))));
}
