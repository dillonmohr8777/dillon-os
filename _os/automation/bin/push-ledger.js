#!/usr/bin/env node
/**
 * push-ledger.js — the missing half of the external watchdog.
 *
 * The Cadence driver commits locally and deliberately never pushes (see
 * driver.md, "Never git push" — that rule is about the agentic commit step,
 * avoiding a concurrent-run push race, and stays exactly as written). Nothing
 * else pushed either, so on 2026-09-17 local HEAD was a full day ahead of
 * origin/main. cadence-watchdog.js on GitHub Actions can only see what has
 * been pushed, so without this, it watches an empty mailbox forever.
 *
 * This is the only thing this script does: push existing local commits.
 * It never adds, never commits, never force-pushes, never rebases. A conflict
 * or a dirty tree is left for a human, not resolved automatically.
 *
 *   node push-ledger.js            push if ahead, otherwise no-op
 */

'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const VAULT = path.resolve(__dirname, '..', '..', '..');

function git(args) {
  return execFileSync('git', args, { cwd: VAULT, encoding: 'utf8' }).trim();
}

function main() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);

  // A dirty working tree means something is mid-edit. Pushing commits is
  // still safe (it only sends what is already committed) but a session
  // actively writing on this machine is a signal to leave well alone.
  const dirty = git(['status', '--porcelain']);
  if (dirty) {
    console.log(`push-ledger: working tree not clean, skipping (${dirty.split('\n').length} changed paths)`);
    return;
  }

  let ahead = 0;
  try {
    git(['fetch', 'origin', branch, '--quiet']);
    ahead = Number(git(['rev-list', '--count', `origin/${branch}..${branch}`]));
  } catch (e) {
    console.log(`push-ledger: could not compare to origin (${e.message.split('\n')[0]}), skipping`);
    return;
  }

  if (ahead === 0) {
    console.log('push-ledger: nothing to push');
    return;
  }

  const attempts = 3;
  for (let i = 1; i <= attempts; i++) {
    try {
      git(['push', 'origin', branch]);
      console.log(`push-ledger: pushed ${ahead} commit(s) on ${branch}`);
      return;
    } catch (e) {
      if (i === attempts) {
        // Non-fatal by design. A push failure here should not page anyone -
        // the watchdog's STALE_REPO check is what pages, and only after the
        // gap has actually gone on long enough to matter.
        console.log(`push-ledger: push failed after ${attempts} attempts: ${e.message.split('\n')[0]}`);
        return;
      }
      const backoffMs = 2000 * i;
      console.log(`push-ledger: attempt ${i} failed, retrying in ${backoffMs}ms`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoffMs); // synchronous sleep, no shell dependency
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('push-ledger FAILED:', e && e.message);
    process.exit(1);
  }
}
