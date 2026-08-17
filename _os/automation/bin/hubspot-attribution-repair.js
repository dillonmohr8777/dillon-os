#!/usr/bin/env node
'use strict';

/**
 * Dry-run (default) HubSpot attribution repair for Momentum 360 GMB segments.
 * Verifies portal 50612503, merges source filters onto existing list trees,
 * and refuses to write unless --apply AND --confirm-apply. Never prints
 * contact emails, phones, or tokens.
 */

const fs = require('fs');
const path = require('path');

const EXPECTED_PORTAL_ID = 50612503;
const ORGANIC_NAME = 'GMB_LP_Organic';
const PMAX_NAME = 'Google P-max Suspensions';
const TOKEN_KEYS = [
  'JASON_HUBSPOT_PRIVATE_APP_TOKEN',
  'HUBSPOT_TOKEN',
  'HUBSPOT_ACCESS_TOKEN',
  'HUBSPOT_PRIVATE_APP_TOKEN',
];

const PAID_SOURCES = ['PAID_SEARCH', 'PAID_SOCIAL'];
const PMAX_ADS_TERMS = ['PMax', 'pmax', 'Max_GMB', 'max_gmb', 'Performance Max'];

function token() {
  for (const key of TOKEN_KEYS) {
    if (process.env[key]) return { key, value: process.env[key] };
  }
  return null;
}

function repoRoot() {
  return path.resolve(__dirname, '..', '..', '..');
}

function sourceFilter(operator, values, includeBlank) {
  return {
    filterType: 'PROPERTY',
    property: 'hs_analytics_source',
    operation: {
      operationType: 'MULTISTRING',
      operator,
      values,
      includeObjectsWithNoValueSet: Boolean(includeBlank),
    },
  };
}

function adsContains(term) {
  return {
    entityType: 'CAMPAIGN',
    searchTermType: 'NAME',
    searchTerms: [term],
    adNetwork: 'ADWORDS',
    operator: 'CONTAINS',
    filterType: 'ADS_SEARCH',
  };
}

function andBranch(filters, filterBranches) {
  return {
    filterBranchType: 'AND',
    filterBranchOperator: 'AND',
    filters: filters || [],
    filterBranches: filterBranches || [],
  };
}

function orBranch(filterBranches) {
  return {
    filterBranchType: 'OR',
    filterBranchOperator: 'OR',
    filters: [],
    filterBranches: filterBranches || [],
  };
}

function wrapAnd(existing, extraFilters) {
  return andBranch(extraFilters, [existing]);
}

function isBroadGmbAdsFilter(filter) {
  if (!filter || filter.filterType !== 'ADS_SEARCH') return false;
  const terms = filter.searchTerms || [];
  return terms.length === 1 && String(terms[0]).toUpperCase() === 'GMB';
}

function tightenPmaxAds(existing) {
  const clone = JSON.parse(JSON.stringify(existing));
  const branches = clone.filterBranches || [];
  const next = [];
  let replaced = false;
  for (const branch of branches) {
    const filters = branch.filters || [];
    if (filters.some(isBroadGmbAdsFilter) && filters.length === 1) {
      next.push(orBranch(PMAX_ADS_TERMS.map((term) => andBranch([adsContains(term)], []))));
      replaced = true;
    } else {
      next.push(branch);
    }
  }
  clone.filterBranches = next;
  return { tree: clone, replaced };
}

function organicTree(existing) {
  return wrapAnd(existing, [sourceFilter('IS_NONE_OF', PAID_SOURCES, true)]);
}

function pmaxTree(existing) {
  const { tree, replaced } = tightenPmaxAds(existing);
  return {
    tree: wrapAnd(tree, [sourceFilter('IS_ANY_OF', ['PAID_SEARCH'], false)]),
    replaced,
  };
}

async function hs(pathname, { method = 'GET', body } = {}) {
  const auth = token();
  if (!auth) {
    const err = new Error('missing_token');
    err.code = 'missing_token';
    throw err;
  }
  const res = await fetch(`https://api.hubapi.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${auth.value}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 500) }; }
  if (!res.ok) {
    const err = new Error(`hubspot_${res.status}`);
    err.code = 'hubspot_http';
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function summarizeList(list) {
  if (!list) return null;
  return {
    listId: list.listId || list.listIdInteger || list.id,
    name: list.name,
    processingType: list.processingType,
    objectTypeId: list.objectTypeId,
    size: list.size || (list.additionalProperties && list.additionalProperties.hs_list_size) || null,
    processingStatus: list.processingStatus || null,
  };
}

async function searchLists(query) {
  const data = await hs('/crm/v3/lists/search', {
    method: 'POST',
    body: { query, count: 100, processingTypes: ['DYNAMIC', 'SNAPSHOT', 'MANUAL'] },
  });
  return (data.lists || []).map(summarizeList);
}

async function getList(listId) {
  const data = await hs(`/crm/v3/lists/${listId}?includeFilters=true`);
  return data.list || data;
}

async function applyFilters(listId, filterBranch) {
  return hs(`/crm/v3/lists/${listId}/update-list-filters`, {
    method: 'PUT',
    body: { filterBranch },
  });
}

async function verifyPortal() {
  const account = await hs('/account-info/v3/details');
  const portalId = Number(account.portalId);
  if (portalId !== EXPECTED_PORTAL_ID) {
    const err = new Error(`unexpected_portal_${portalId}`);
    err.code = 'wrong_portal';
    err.portalId = portalId;
    throw err;
  }
  return account;
}

function writeState(report) {
  const dir = path.join(repoRoot(), '12_Brain', 'state');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'hubspot-attribution-repair.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
  return file;
}

async function membershipIds(listId) {
  const ids = [];
  let after;
  do {
    const qs = after ? `?limit=250&after=${encodeURIComponent(after)}` : '?limit=250';
    const data = await hs(`/crm/v3/lists/${listId}/memberships${qs}`);
    const recs = data.results || data.memberships || [];
    for (const row of recs) {
      ids.push(String(row.recordId || row.id || row));
    }
    after = data.paging && data.paging.next && data.paging.next.after;
  } while (after);
  return ids;
}

function overlapReport(organicIds, pmaxIds) {
  const organic = new Set(organicIds);
  const pmax = new Set(pmaxIds);
  let overlap = 0;
  for (const id of organic) if (pmax.has(id)) overlap += 1;
  return {
    organic: organic.size,
    pmax: pmax.size,
    overlap,
    organic_only: organic.size - overlap,
    pmax_only: pmax.size - overlap,
  };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const started = new Date().toISOString();
  const report = {
    automation_id: 'hubspot-attribution-repair',
    started_at: started,
    mode: apply ? 'apply' : 'dry-run',
    portal_id: EXPECTED_PORTAL_ID,
    organic_name: ORGANIC_NAME,
    pmax_name: PMAX_NAME,
    status: 'blocked',
    token_present: Boolean(token()),
    token_env_key: token() ? token().key : null,
    lists: [],
    actions: [],
  };

  if (!token()) {
    report.blocker = 'HUBSPOT_TOKEN unset. Set JASON_HUBSPOT_PRIVATE_APP_TOKEN or HUBSPOT_TOKEN in the environment.';
    const state = writeState(report);
    console.log(JSON.stringify({ ...report, state }, null, 2));
    process.exit(2);
  }

  if (apply && !process.argv.includes('--confirm-apply')) {
    report.blocker = 'Refusing --apply until an operator passes --confirm-apply after reviewing dry-run output.';
    const state = writeState(report);
    console.log(JSON.stringify({ ...report, state }, null, 2));
    process.exit(2);
  }

  const account = await verifyPortal();
  report.portal_verified = true;
  report.ui_domain = account.uiDomain || null;

  const lists = await searchLists('GMB');
  const extra = await searchLists('P-max');
  const byName = new Map();
  for (const row of [...lists, ...extra]) {
    if (row && row.name) byName.set(row.name, row);
  }
  report.lists = [...byName.values()];

  const organic = byName.get(ORGANIC_NAME);
  const pmax = byName.get(PMAX_NAME);
  report.organic = organic || null;
  report.pmax = pmax || null;

  if (!organic || !pmax) {
    report.status = 'blocked';
    report.blocker = 'Named segments not found. Refusing to guess list IDs.';
    const state = writeState(report);
    console.log(JSON.stringify({ ...report, state }, null, 2));
    process.exit(2);
  }

  const organicFull = await getList(organic.listId);
  const pmaxFull = await getList(pmax.listId);
  const organicExisting = organicFull.filterBranch;
  const pmaxExisting = pmaxFull.filterBranch;
  const pmaxBuilt = pmaxTree(pmaxExisting);
  const proposedOrganic = organicTree(organicExisting);
  const proposedPmax = pmaxBuilt.tree;

  report.before = {
    organic_size: organicFull.size,
    pmax_size: pmaxFull.size,
    membership: overlapReport(
      await membershipIds(organic.listId),
      await membershipIds(pmax.listId),
    ),
    pmax_ads_search_tightened: pmaxBuilt.replaced,
  };
  report.proposed = {
    [ORGANIC_NAME]: {
      listId: organic.listId,
      keep_existing_url_and_form_tree: true,
      add: { hs_analytics_source: { exclude: PAID_SOURCES } },
    },
    [PMAX_NAME]: {
      listId: pmax.listId,
      keep_home_google_form_branch: true,
      replace_ads_contains_gmb: pmaxBuilt.replaced,
      ads_contains: PMAX_ADS_TERMS,
      add: { hs_analytics_source: { require: ['PAID_SEARCH'] } },
    },
  };

  if (!apply) {
    report.status = 'dry-run';
    report.actions = [
      `Would PUT merged filters on ${ORGANIC_NAME} (${organic.listId}) to exclude Paid Search/Social`,
      `Would PUT merged filters on ${PMAX_NAME} (${pmax.listId}) to require Paid Search and PMax campaign names`,
    ];
    const state = writeState(report);
    console.log(JSON.stringify({ ...report, state }, null, 2));
    process.exit(0);
  }

  await applyFilters(organic.listId, proposedOrganic);
  report.actions.push(`Applied organic exclude-paid merge to ${organic.listId}`);
  await applyFilters(pmax.listId, proposedPmax);
  report.actions.push(`Applied pmax paid+PMax-name merge to ${pmax.listId}`);

  const organicAfter = await getList(organic.listId);
  const pmaxAfter = await getList(pmax.listId);
  report.after = {
    organic_size: organicAfter.size,
    pmax_size: pmaxAfter.size,
    organic_processing: organicAfter.processingStatus,
    pmax_processing: pmaxAfter.processingStatus,
    membership: overlapReport(
      await membershipIds(organic.listId),
      await membershipIds(pmax.listId),
    ),
  };
  report.status = 'applied';
  const state = writeState(report);
  console.log(JSON.stringify({ ...report, state }, null, 2));
}

if (require.main === module) {
  main().catch((err) => {
    const report = {
      automation_id: 'hubspot-attribution-repair',
      status: 'error',
      code: err.code || 'unknown',
      message: err.message,
      http_status: err.status || null,
    };
    try { writeState(report); } catch { /* ignore */ }
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  });
}

module.exports = {
  EXPECTED_PORTAL_ID,
  ORGANIC_NAME,
  PMAX_NAME,
  TOKEN_KEYS,
  PAID_SOURCES,
  PMAX_ADS_TERMS,
  organicTree,
  pmaxTree,
  isBroadGmbAdsFilter,
};
