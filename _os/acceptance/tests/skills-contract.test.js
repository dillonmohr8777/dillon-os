const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, '_os/acceptance/registry.json'), 'utf8'));

describe('production skill acceptance registry', () => {
  it('has one unique executable mapping for every registered skill', () => {
    assert.equal(registry.schemaVersion, 1);
    const ids = registry.skills.map((skill) => skill.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const skill of registry.skills) {
      assert.ok(fs.existsSync(path.join(repoRoot, skill.skillPath)), skill.skillPath);
      assert.ok(skill.fixtures.length > 0, `${skill.id} needs fixtures`);
      assert.ok(skill.commands.length > 0, `${skill.id} needs an executable command`);
      assert.equal(skill.independentReview, true, `${skill.id} needs independent review`);
      assert.ok(skill.timeoutSeconds > 0, `${skill.id} needs a timeout`);
      assert.ok(Number.isInteger(skill.retryLimit) && skill.retryLimit >= 0);
    }
  });

  it('keeps production skill paths and fixtures present', () => {
    for (const skill of registry.skills) {
      for (const relativePath of [skill.skillPath, ...skill.fixtures, ...skill.expectedFiles]) {
        assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${skill.id}: ${relativePath}`);
      }
    }
  });

  it('maps the initial five production skills while brain-compile awaits layout reconciliation', () => {
    const ids = new Set(registry.skills.map((skill) => skill.id));
    for (const id of ['site-batch', 'site-factory', 'vault-compile', 'am-report', 'client-report']) {
      assert.ok(ids.has(id), `missing ${id}`);
    }
    assert.equal(ids.has('brain-compile'), false);
  });
});
