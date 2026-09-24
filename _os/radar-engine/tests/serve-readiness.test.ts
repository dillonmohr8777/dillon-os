'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const Module = require('node:module');
const path = require('node:path');
const { createStore } = require('../lib/store.ts');

describe('serve persistence gate', () => {
  it('keeps explicit memory mode for local callers but refuses serve without DATABASE_URL', async () => {
    const memory = await createStore({ databaseUrl: '' });
    assert.equal(memory.kind, 'memory');

    const result = spawnSync(process.execPath, [
      '--experimental-strip-types',
      path.join(__dirname, '..', 'bin', 'radar-v2.js'),
      'serve',
    ], {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: '', RADAR_V2_HOST: '127.0.0.1', RADAR_V2_PORT: '0' },
    });
    const output = `${result.stdout || ''}\n${result.stderr || ''}`;
    assert.notEqual(result.status, 0);
    assert.match(output, /persistent storage requires DATABASE_URL/i);
    assert.doesNotMatch(output, /"listen"/i);
  });

  it('refuses a configured store when the Postgres probe fails', async () => {
    const originalLoad = Module._load;
    let closed = false;
    Module._load = (request, parent, isMain) => {
      if (request === 'pg') {
        return {
          Pool: class {
            async query() { throw new Error('password=probe-secret ECONNREFUSED test'); }
            async end() { closed = true; }
          },
        };
      }
      return originalLoad(request, parent, isMain);
    };
    try {
      await assert.rejects(
        createStore({ databaseUrl: 'postgres://unreachable.test/radar_v2', requirePersistent: true }),
        (error) => {
          assert.equal(error.message, 'persistent storage unavailable');
          assert.doesNotMatch(error.stack, /probe-secret|unreachable\.test/);
          return true;
        }
      );
      assert.equal(closed, true);
    } finally {
      Module._load = originalLoad;
    }
  });

  it('closes the pool when hydration fails and does not fall back', async () => {
    const originalLoad = Module._load;
    let calls = 0;
    let closed = false;
    Module._load = (request, parent, isMain) => {
      if (request === 'pg') {
        return {
          Pool: class {
            async query() {
              calls += 1;
              if (calls === 1) return { rows: [] };
              throw new Error('password=hydrate-secret hydration failed');
            }
            async end() { closed = true; }
          },
        };
      }
      return originalLoad(request, parent, isMain);
    };
    try {
      await assert.rejects(
        createStore({ databaseUrl: 'postgres://hydrate.test/radar_v2' }),
        (error) => {
          assert.equal(error.message, 'persistent storage unavailable');
          assert.doesNotMatch(error.stack, /hydrate-secret|hydrate\.test/);
          return true;
        }
      );
      assert.equal(closed, true);
    } finally {
      Module._load = originalLoad;
    }
  });

  it('keeps the no-URL retain demo on intentional in-memory storage', () => {
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types',
      path.join(__dirname, '..', 'bin', 'radar-v2.js'),
      'retain',
    ], {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: '' },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /"revoked":\s*\[\]/);
    assert.match(result.stdout, /"anonymized":\s*\[\]/);
  });
});
