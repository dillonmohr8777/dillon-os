/**
 * HubSpot Agent wiring + fail-closed attribution repair CLI.
 * Run: node --test _os/test/hubspot-agent.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { getSkills } = require('../vault-state');
const { scanText } = require('../public-safety');
const repair = require('../automation/bin/hubspot-attribution-repair.js');

const VAULT = path.resolve(__dirname, '..', '..');

describe('HubSpot Agent wiring', () => {
  it('defines the lane agent, skill, project, and INDEX rows', () => {
    const agent = path.join(VAULT, '11_Agents/HubSpot Agent.md');
    const skill = path.join(VAULT, '.claude/skills/hubspot-ops/SKILL.md');
    const project = path.join(VAULT, '12_Brain/projects/HubSpot Attribution Repair.md');
    const index = fs.readFileSync(path.join(VAULT, '12_Brain/INDEX.md'), 'utf8');
    const master = fs.readFileSync(path.join(VAULT, '11_Agents/Master Agent.md'), 'utf8');
    assert.equal(fs.existsSync(agent), true);
    assert.equal(fs.existsSync(skill), true);
    assert.equal(fs.existsSync(project), true);
    assert.match(index, /HubSpot Attribution Repair/);
    assert.match(index, /HubSpot Channel Attribution/);
    assert.match(master, /HubSpot Agent/);
    const names = getSkills(VAULT).map((s) => s.name);
    assert.ok(names.includes('hubspot-ops'), 'hubspot-ops missing from Command Deck');
  });

  it('keeps tracked HubSpot wiki pages free of emails and phones', () => {
    const files = [
      '12_Brain/raw/2026-08-17 - jason-hubspot-attribution.md',
      '12_Brain/projects/HubSpot Attribution Repair.md',
      '12_Brain/concepts/HubSpot Channel Attribution.md',
      '12_Brain/entities/HubSpot.md',
      '11_Agents/HubSpot Agent.md',
    ];
    for (const rel of files) {
      const text = fs.readFileSync(path.join(VAULT, rel), 'utf8');
      const hits = scanText(text);
      assert.deepEqual(hits, [], `${rel} failed public-safety: ${hits.map((h) => h.id).join(',')}`);
    }
  });
});

describe('hubspot-attribution-repair CLI', () => {
  it('fail-closes on --dry-run when HUBSPOT_TOKEN is unset', () => {
    const bin = path.join(VAULT, '_os/automation/bin/hubspot-attribution-repair.js');
    const env = { ...process.env };
    delete env.HUBSPOT_TOKEN;
    delete env.HUBSPOT_ACCESS_TOKEN;
    delete env.HUBSPOT_PRIVATE_APP_TOKEN;
    const result = spawnSync(process.execPath, [bin, '--dry-run'], {
      env,
      encoding: 'utf8',
    });
    assert.equal(result.status, 2);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.status, 'blocked');
    assert.equal(payload.token_present, false);
    assert.match(payload.blocker, /HUBSPOT_TOKEN/);
    assert.equal(payload.organic_name, 'GMB_LP_Organic');
    assert.equal(payload.pmax_name, 'Google P-max Suspensions');
  });

  it('refuses --apply without --confirm-apply even if a token is present', () => {
    const bin = path.join(VAULT, '_os/automation/bin/hubspot-attribution-repair.js');
    const result = spawnSync(process.execPath, [bin, '--apply'], {
      env: { ...process.env, HUBSPOT_TOKEN: 'pat-test-not-real' },
      encoding: 'utf8',
    });
    assert.equal(result.status, 2);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.mode, 'apply');
    assert.match(payload.blocker, /confirm-apply/);
  });

  it('merges source excludes onto the existing organic OR tree', () => {
    const existing = {
      filterBranchType: 'OR',
      filterBranchOperator: 'OR',
      filters: [],
      filterBranches: [{ filterBranchType: 'AND', filters: [{ property: 'hs_analytics_last_url' }] }],
    };
    const tree = repair.organicTree(existing);
    assert.equal(tree.filterBranchType, 'AND');
    assert.equal(tree.filters[0].property, 'hs_analytics_source');
    assert.equal(tree.filters[0].operation.operator, 'IS_NONE_OF');
    assert.deepEqual(tree.filters[0].operation.values, repair.PAID_SOURCES);
    assert.equal(tree.filterBranches[0].filterBranchType, 'OR');
  });

  it('replaces ads CONTAINS GMB with PMax campaign terms and requires Paid Search', () => {
    const existing = {
      filterBranchType: 'OR',
      filterBranchOperator: 'OR',
      filters: [],
      filterBranches: [
        {
          filterBranchType: 'AND',
          filters: [{
            entityType: 'CAMPAIGN',
            searchTermType: 'NAME',
            searchTerms: ['GMB'],
            adNetwork: 'ADWORDS',
            operator: 'CONTAINS',
            filterType: 'ADS_SEARCH',
          }],
        },
        {
          filterBranchType: 'AND',
          filters: [{ formId: 'keep-me', filterType: 'FORM_SUBMISSION' }],
        },
      ],
    };
    const { tree, replaced } = repair.pmaxTree(existing);
    assert.equal(replaced, true);
    assert.equal(tree.filterBranchType, 'AND');
    assert.equal(tree.filters[0].operation.operator, 'IS_ANY_OF');
    assert.deepEqual(tree.filters[0].operation.values, ['PAID_SEARCH']);
    const adsOr = tree.filterBranches[0].filterBranches[0];
    assert.equal(adsOr.filterBranchType, 'OR');
    const terms = adsOr.filterBranches.flatMap((b) => b.filters.map((f) => f.searchTerms[0]));
    assert.deepEqual(terms, repair.PMAX_ADS_TERMS);
    assert.equal(tree.filterBranches[0].filterBranches[1].filters[0].formId, 'keep-me');
  });
});
