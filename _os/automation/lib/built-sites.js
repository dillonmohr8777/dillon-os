'use strict';

/**
 * The sites Momentum 360 has already built.
 *
 * ## Why this exists
 *
 * The radar had no idea what it had already built. `philly-100-completed.json`
 * was written on 2026-08-05 and never updated, so the 138 builds that followed
 * — W31, W33, W34, the next20 lane, the cinematic batches, the 47 next15
 * concepts — were invisible to it. Worse, the exclusion it did carry only
 * applied at *discovery* time: it stopped a completed business being added to
 * the registry, but did nothing about the rows already sitting there.
 *
 * The measured result on 2026-08-18: 104 businesses we had already built a site
 * for were still sitting in the registry as live rebuild targets, and 9 of the
 * 15 top suggestions in that morning's brief were businesses whose new homepage
 * was already live. The radar was recommending work that was already done.
 *
 * With this module wired in, that sweep reconciles 104 rows to `built`, the
 * queued_build count drops from 181 to 82, and the already-built count in the
 * top 15 goes to zero.
 *
 * `radar.priorityScore` has always docked 40 points for `lifecycle === 'built'`
 * (lib/radar.js). Nothing ever set it — `setLifecycle` is exported and never
 * called, and the only lifecycle writer in the sweep moves rows between `new`,
 * `graded` and `queued_build`. So the de-rank was unreachable code. This module
 * supplies the missing input; `reconcile()` is what finally sets the flag.
 *
 * ## Privacy
 *
 * The source sheet carries verified phones, emails and street addresses. None
 * of that is in the tracked JSON — only a `has_public_email` boolean — because
 * this file feeds the published dashboard. Keep it that way.
 */

const path = require('path');
const { readJson, repoPath } = require('./fsutil');

const BUILT_FILE = '_os/automation/fixtures/prospects/momentum-built-sites.json';
/** The frozen predecessor. Still read so a stale checkout degrades rather than breaks. */
const LEGACY_FILE = '_os/automation/fixtures/prospects/philly-100-completed.json';

/** Directory listings are not a business's own site, so they are never a domain we own knowledge of. */
const DIRECTORY_HOSTS = new Set([
  'bbb.org', 'yellowpages.com', 'loc8nearme.com', 'waze.com', 'mapquest.com',
  'yelp.com', 'facebook.com', 'google.com', 'maps.google.com', 'nextdoor.com',
  'angi.com', 'houzz.com', 'tripadvisor.com', 'manta.com', 'chamberofcommerce.com',
]);

/**
 * Normalize a business name for matching.
 *
 * Needed because a build and its registry row often disagree on the exact
 * string: "Lee's Hoagie House of Horsham" against "Lee's Hoagie House",
 * "Golden Eagle Jewelers" against "Golden Eagle Jewelry". Legal suffixes and
 * punctuation carry no signal, so they come out.
 */
function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(inc|llc|ltd|co|corp|the|pc|pa|dds|dmd|md|company|associates|assoc)\b/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeDomain(value) {
  if (!value) return '';
  const s = String(value).trim().toLowerCase();
  const m = s.match(/^(?:https?:\/\/)?(?:www\.)?([^/?#\s]+)/);
  const host = m ? m[1] : s.replace(/^www\./, '');
  return DIRECTORY_HOSTS.has(host) ? '' : host;
}

/**
 * Load the built-site record. Returns `{ rows, domains, byDomain, counts }`.
 * `domains` holds only real first-party domains — a business whose only known
 * source was a directory listing contributes no domain, because excluding
 * `bbb.org` would exclude every business that shares that listing.
 */
function load({ root = null } = {}) {
  const resolve = (rel) => (root ? path.join(root, rel) : repoPath(rel));
  const doc = readJson(resolve(BUILT_FILE), null) || readJson(resolve(LEGACY_FILE), null);
  const rows = (doc && doc.prospects) || [];

  const domains = new Set();
  const byDomain = new Map();
  const byName = new Map();
  for (const r of rows) {
    const d = normalizeDomain(r.domain || r.website);
    if (d) {
      domains.add(d);
      // First row wins: the canonical build for a domain is the earliest, and
      // duplicate_of rows are the later re-builds by another lane.
      if (!byDomain.has(d)) byDomain.set(d, r);
    }
    // Name is indexed for every row, domain or not. 127 of the 238 builds have
    // no domain in the registry — most of the original 100 came from the
    // completed-100 PDF rather than from OpenStreetMap discovery — so a
    // domain-only match would let discovery re-add them the day OSM surfaces
    // one of them for the first time.
    const n = normalizeName(r.business_name);
    if (n && !byName.has(n)) byName.set(n, r);
  }

  return {
    rows,
    domains,
    byDomain,
    byName,
    counts: (doc && doc._counts) || { pages: rows.length },
    stale: !readJson(resolve(BUILT_FILE), null),
  };
}

/**
 * Mark every registry row we have already built as `lifecycle: 'built'`.
 *
 * This is the fix for the queue pollution. It runs before discovery and before
 * grading so that the day's ranking, brief and build queue all see the flag.
 *
 * `client` and `excluded` outrank `built` and are left alone — a business that
 * became a client must keep reading as a client. Everything else moves, because
 * a built row is a built row regardless of what the last audit thought of their
 * old site.
 *
 * Returns `{ marked, alreadyBuilt, unmatched }`.
 */
function reconcile(registry, built, { today = null } = {}) {
  let marked = 0;
  let alreadyBuilt = 0;
  const seen = new Set();

  for (const [domain, p] of Object.entries(registry.prospects || {})) {
    const d = normalizeDomain(domain);
    let row = d && built.domains.has(d) ? built.byDomain.get(d) : null;
    // Fall back to the business name. The build record and the registry
    // frequently disagree on domain: the call sheet verified a phone against a
    // directory page, so the build carries no first-party domain at all.
    if (!row) row = built.byName.get(normalizeName(p.business_name));
    if (!row) continue;
    if (d) seen.add(d);

    if (p.lifecycle === 'client' || p.lifecycle === 'excluded') continue;
    if (p.lifecycle === 'built' || p.lifecycle === 'mailed') { alreadyBuilt += 1; continue; }

    p.lifecycle = 'built';
    if (row && row.live_url) p.built_url = row.live_url;
    if (row && row.batch) p.built_batch = row.batch;
    if (row && row.qa_state) p.built_qa = row.qa_state;
    if (row && row.fix_reason) p.built_fix_reason = row.fix_reason;
    if (today) p.built_marked_on = today;
    // The row keeps its grade and its verdict — that history is still true and
    // still useful. What changes is that priorityScore now docks it 40 points,
    // so it stops out-ranking businesses we have not built for yet.
    p.next_action = row && row.qa_state === 'passed'
      ? 'Already built and design-verified — this is an outreach target, not a build target'
      : 'Already built; the concept needs a QA pass before it can be shown';
    marked += 1;
  }

  return { marked, alreadyBuilt, unmatched: [...built.domains].filter((d) => !seen.has(d)) };
}

module.exports = { load, reconcile, normalizeDomain, normalizeName, BUILT_FILE, LEGACY_FILE, DIRECTORY_HOSTS };
