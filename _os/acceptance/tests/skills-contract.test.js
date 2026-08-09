const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { requiredFiles, verifyReceipt } = require('../verify-run.js');

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
      assert.ok(skill.reviewCommands.length > 0, `${skill.id} needs an independent review command`);
      const makerCommands = new Set(skill.commands.map((command) => JSON.stringify(command)));
      for (const reviewCommand of skill.reviewCommands) {
        assert.equal(makerCommands.has(JSON.stringify(reviewCommand)), false, `${skill.id} review must be distinct`);
      }
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

  it('maps the production skills and contract fleet muster while brain-compile awaits layout reconciliation', () => {
    const ids = new Set(registry.skills.map((skill) => skill.id));
    for (const id of [
      'site-batch',
      'site-factory',
      'vault-compile',
      'am-report',
      'client-report',
      'agent-fleet',
      'fleet-muster',
    ]) {
      assert.ok(ids.has(id), `missing ${id}`);
    }
    assert.equal(ids.has('brain-compile'), false);
  });

  it('independent receipt review recomputes hashes and fails on tampering', () => {
    const skill = registry.skills.find((entry) => entry.id === 'fleet-muster');
    const receipt = {
      schemaVersion: 1,
      skillId: skill.id,
      contractFailures: [],
      commands: skill.commands.map((command) => ({
        command: command.join(' '),
        status: 0,
        error: null,
      })),
      evidence: requiredFiles(skill).map((relativePath) => {
        const bytes = fs.readFileSync(path.join(repoRoot, relativePath));
        return {
          path: relativePath,
          bytes: bytes.length,
          sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        };
      }),
    };
    assert.deepEqual(verifyReceipt(skill, receipt), []);
    const tampered = {
      ...receipt,
      evidence: receipt.evidence.map((item, index) => (
        index === 0 ? { ...item, sha256: '0'.repeat(64) } : item
      )),
    };
    assert.ok(verifyReceipt(skill, tampered).some((failure) => failure.startsWith('review evidence hash mismatch:')));
    assert.ok(verifyReceipt(skill, { ...receipt, commands: [] }).includes('maker command receipt count mismatch'));
  });
});
