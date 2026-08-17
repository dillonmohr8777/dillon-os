#!/usr/bin/env node
'use strict';

/**
 * Dry-run (default) HubSpot attribution repair for Momentum 360 GMB segments.
 * Refuses to write unless --apply is set AND HUBSPOT_TOKEN is present AND
 * both named segments are found. Never prints contact emails or phones.
 */

const fs = require('fs');
const path = require('path');

const ORGANIC_NAME = 'GMB_LP_Organic';
const PMAX_NAME = 'Google P-max Suspensions';
const TOKEN_KEYS = ['HUBSPOT_TOKEN', 'HUBSPOT_ACCESS_TOKEN', 'HUBSPOT_PRIVATE_APP_TOKEN'];

const ORGANIC_FILTER = {
  filterBranchType: 'AND',
  filters: [
    {
      filterType: 'PROPERTY',
      property: 'hs_analytics_source',
      operation: {
        operationType: 'MULTISTRING',
        operator: 'IS_NONE_OF',
        values: ['PAID_SEARCH', 'PAID_SOCIAL'],
      },
    },
  ],
  filterBranches: [],
};

const PMAX_FILTER = {
  filterBranchType: 'AND',
  filters: [
    {
      filterType: 'PROPERTY',
      property: 'hs_analytics_source',
      operation: {
        operationType: 'MULTISTRING',
        operator: 'IS_ANY_OF',
        values: ['PAID_SEARCH'],
      },
    },
  ],
  filterBranches: [],
};

function token() {
  for (const key of TOKEN_KEYS) {
    if (process.env[key]) return { key, value: process.env[key] };
  }
  return null;
}

function repoRoot() {
  return path.resolve(__dirname, '..', '..', '..');
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
    size: list.additionalProperties && list.additionalProperties.hs_list_size,
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
  return hs(`/crm/v3/lists/${listId}`);
}

async function applyFilters(listId, filterBranch) {
  return hs(`/crm/v3/lists/${listId}/update-list-filters`, {
    method: 'PUT',
    body: { filterBranch },
  });
}

function writeState(report) {
  const dir = path.join(repoRoot(), '12_Brain', 'state');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'hubspot-attribution-repair.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
  return file;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const started = new Date().toISOString();
  const report = {
    automation_id: 'hubspot-attribution-repair',
    started_at: started,
    mode: apply ? 'apply' : 'dry-run',
    organic_name: ORGANIC_NAME,
    pmax_name: PMAX_NAME,
    status: 'blocked',
    token_present: Boolean(token()),
    lists: [],
    actions: [],
  };

  if (!token()) {
    report.blocker = 'HUBSPOT_TOKEN unset. Composio HubSpot must be ACTIVE or the private app token must be in the environment.';
    const state = writeState(report);
    console.log(JSON.stringify({ ...report, state }, null, 2));
    process.exit(2);
  }

  if (apply) {
    report.blocker = 'Refusing --apply until an operator passes --confirm-apply after reviewing dry-run output.';
    if (!process.argv.includes('--confirm-apply')) {
      const state = writeState(report);
      console.log(JSON.stringify({ ...report, state }, null, 2));
      process.exit(2);
    }
    delete report.blocker;
  }

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

  report.proposed = {
    [ORGANIC_NAME]: { exclude: ['PAID_SEARCH', 'PAID_SOCIAL'] },
    [PMAX_NAME]: { require: ['PAID_SEARCH'] },
  };

  if (!apply) {
    report.status = 'dry-run';
    report.actions = [
      `Would PUT filters on ${ORGANIC_NAME} (${organic.listId}) to exclude Paid Search/Social`,
      `Would PUT filters on ${PMAX_NAME} (${pmax.listId}) to require Paid Search`,
    ];
    const state = writeState(report);
    console.log(JSON.stringify({ ...report, state }, null, 2));
    process.exit(0);
  }

  await applyFilters(organic.listId, ORGANIC_FILTER);
  report.actions.push(`Applied organic exclude-paid filter to ${organic.listId}`);
  await applyFilters(pmax.listId, PMAX_FILTER);
  report.actions.push(`Applied pmax require-paid filter to ${pmax.listId}`);
  report.status = 'applied';
  const state = writeState(report);
  console.log(JSON.stringify({ ...report, state }, null, 2));
}

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
