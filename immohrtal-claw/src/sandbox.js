'use strict';

const path = require('node:path');
const fs = require('node:fs');

function assertInside(root, target) {
  if (target && path.isAbsolute(target)) {
    throw new Error(`path escapes workspace: ${target}`);
  }
  const resolvedRoot = fs.realpathSync(root);
  const abs = path.resolve(resolvedRoot, target || '.');
  let resolved;
  try {
    resolved = fs.existsSync(abs) ? fs.realpathSync(abs) : abs;
  } catch {
    resolved = abs;
  }
  const rel = path.relative(resolvedRoot, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`path escapes workspace: ${target}`);
  }
  return resolved;
}

function listSafe(root, rel = '.') {
  const dir = assertInside(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    type: entry.isDirectory() ? 'dir' : 'file',
  }));
}

module.exports = { assertInside, listSafe };
