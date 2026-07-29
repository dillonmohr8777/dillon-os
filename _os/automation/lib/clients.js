'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath, walkMarkdown } = require('./fsutil');
const { parseFrontmatter } = require('./frontmatter');

/**
 * Build suppress sets from 01_Clients so qualify never queues existing clients.
 */
function buildSuppressSets(clientsRoot = repoPath('01_Clients')) {
  const ids = new Set();
  const domains = new Set();
  const files = walkMarkdown(clientsRoot);
  for (const file of files) {
    const base = path.basename(file, '.md');
    if (base === 'Client Index' || base === 'm360-master-contacts') continue;
    const text = fs.readFileSync(file, 'utf8');
    const { data } = parseFrontmatter(text);
    if (data.website) {
      const d = String(data.website)
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');
      if (d) domains.add(d);
    }
    if (data.client) ids.add(String(data.client).toLowerCase());
    ids.add(base.toLowerCase());
  }
  return { suppressIds: ids, suppressDomains: domains };
}

function isClientOverview(file, clientsRoot) {
  const base = path.basename(file);
  if (base === 'Client Index.md' || base === 'm360-master-contacts.md') return false;
  // Prefer overview.md inside client folders
  if (base === 'overview.md') return true;
  // Top-level notes directly under the clients root (01_Clients/Name.md or fixtures)
  const parent = path.dirname(file);
  if (path.resolve(parent) === path.resolve(clientsRoot) && base.endsWith('.md')) return true;
  return false;
}

function listClientNotes(clientsRoot = repoPath('01_Clients')) {
  return walkMarkdown(clientsRoot).filter((f) => isClientOverview(f, clientsRoot));
}

module.exports = {
  buildSuppressSets,
  listClientNotes,
  isClientOverview,
};
