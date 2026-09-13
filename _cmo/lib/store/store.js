/**
 * The document store.
 *
 * Two shapes of data, deliberately kept apart:
 *
 *   COLLECTIONS are mutable documents addressed by id (artifacts, approvals,
 *   runs, prompt sets). One JSON file each, written atomically.
 *
 *   STREAMS are append-only JSONL logs (journal, ledger, evidence, events).
 *   Nothing ever rewrites a stream. That is what makes an audit defensible:
 *   you can prove what the system believed at the time, not just what it
 *   believes now.
 *
 * Everything is workspace-scoped. `store.ws(id)` hands back a scoped view and
 * there is no API that reads across workspaces without naming them, so one
 * client's data cannot leak into another client's report by accident.
 *
 * Two drivers share one interface: `fs` for real use, `memory` for tests.
 * A Postgres driver can be added behind the same interface - see
 * migrations/001_init.sql for the schema it would use.
 */

import path from 'node:path';
import {
  ensureDir, writeJson, readJson, appendJsonl, readJsonl,
  listFiles, exists, removeQuiet, safeSegment,
} from '../core/fsx.js';
import { systemClock } from '../core/clock.js';

export const COLLECTIONS = Object.freeze([
  'artifacts',    // every generated deliverable
  'approvals',    // the approval queue
  'runs',         // agent run headers
  'promptsets',   // GEO prompt sets
  'scans',        // GEO scan results
  'audits',       // SEO/technical audit snapshots
  'experiments',  // CRO / test queue
  'reports',      // composed client reports
  'connectors',   // per-workspace connector config + health
  'schedules',    // cron entries
  'singletons',   // profile, voice, guardrails, budget - one doc each
  'metrics',      // dated connector metric snapshots
]);

export const STREAMS = Object.freeze([
  'journal',   // step-level run journal (replay source)
  'ledger',    // token + USD cost accounting
  'evidence',  // immutable source receipts
  'events',    // workspace timeline
  'deadletter',// terminal job failures awaiting a human
]);

function assertCollection(name) {
  if (!COLLECTIONS.includes(name)) throw new Error(`unknown collection: ${name}`);
  return name;
}

function assertStream(name) {
  if (!STREAMS.includes(name)) throw new Error(`unknown stream: ${name}`);
  return name;
}

// ---------------------------------------------------------------------------
// Filesystem driver
// ---------------------------------------------------------------------------

function fsDriver(root) {
  const wsRoot = (wsId) => path.join(root, 'ws', safeSegment(wsId, 'workspace id'));
  const collDir = (wsId, coll) => path.join(wsRoot(wsId), assertCollection(coll));
  const docPath = (wsId, coll, id) => path.join(collDir(wsId, coll), `${safeSegment(id, 'doc id')}.json`);
  const streamPath = (wsId, name) => path.join(wsRoot(wsId), `${assertStream(name)}.jsonl`);
  const indexPath = () => path.join(root, 'workspaces.json');

  return {
    kind: 'fs',
    root,
    wsRoot,
    async readIndex() {
      return (await readJson(indexPath(), { workspaces: [] })).workspaces || [];
    },
    async writeIndex(list) {
      await writeJson(indexPath(), { workspaces: list });
    },
    async get(wsId, coll, id) {
      return readJson(docPath(wsId, coll, id), null);
    },
    async put(wsId, coll, id, doc) {
      await writeJson(docPath(wsId, coll, id), doc);
      return doc;
    },
    async del(wsId, coll, id) {
      await removeQuiet(docPath(wsId, coll, id));
    },
    async ids(wsId, coll) {
      const files = await listFiles(collDir(wsId, coll), { ext: '.json' });
      return files.map((f) => f.slice(0, -'.json'.length));
    },
    async append(wsId, name, record) {
      await appendJsonl(streamPath(wsId, name), record);
      return record;
    },
    async read(wsId, name, opts) {
      return readJsonl(streamPath(wsId, name), opts);
    },
    async ensure(wsId) {
      await ensureDir(wsRoot(wsId));
    },
    async destroy(wsId) {
      await removeQuiet(wsRoot(wsId));
    },
    async has(wsId) {
      return exists(wsRoot(wsId));
    },
  };
}

// ---------------------------------------------------------------------------
// Memory driver - same interface, nothing touches disk
// ---------------------------------------------------------------------------

function memoryDriver() {
  const docs = new Map();    // `${ws}/${coll}/${id}` -> doc
  const streams = new Map(); // `${ws}/${name}` -> [records]
  const spaces = new Set();
  let index = [];
  const key = (...parts) => parts.join('/');

  return {
    kind: 'memory',
    root: null,
    wsRoot: (wsId) => `memory://${wsId}`,
    async readIndex() { return index; },
    async writeIndex(list) { index = list; },
    async get(wsId, coll, id) {
      assertCollection(coll);
      const doc = docs.get(key(wsId, coll, safeSegment(id, 'doc id')));
      return doc ? structuredClone(doc) : null;
    },
    async put(wsId, coll, id, doc) {
      assertCollection(coll);
      docs.set(key(wsId, coll, safeSegment(id, 'doc id')), structuredClone(doc));
      spaces.add(wsId);
      return doc;
    },
    async del(wsId, coll, id) {
      docs.delete(key(wsId, assertCollection(coll), id));
    },
    async ids(wsId, coll) {
      assertCollection(coll);
      const prefix = key(wsId, coll, '');
      return [...docs.keys()].filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length)).sort();
    },
    async append(wsId, name, record) {
      const k = key(wsId, assertStream(name));
      if (!streams.has(k)) streams.set(k, []);
      streams.get(k).push(structuredClone(record));
      spaces.add(wsId);
      return record;
    },
    async read(wsId, name, { limit = null, tail = false } = {}) {
      const all = structuredClone(streams.get(key(wsId, assertStream(name))) || []);
      if (limit == null) return all;
      return tail ? all.slice(-limit) : all.slice(0, limit);
    },
    async ensure(wsId) { spaces.add(wsId); },
    async destroy(wsId) {
      spaces.delete(wsId);
      for (const k of [...docs.keys()]) if (k.startsWith(`${wsId}/`)) docs.delete(k);
      for (const k of [...streams.keys()]) if (k.startsWith(`${wsId}/`)) streams.delete(k);
    },
    async has(wsId) { return spaces.has(wsId); },
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

function compareBy(field, dir) {
  const sign = dir === 'desc' ? -1 : 1;
  return (a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return av < bv ? -sign : sign;
  };
}

export function createStore({ root = null, driver = null, clock = systemClock() } = {}) {
  const impl = driver === 'memory' || (!root && driver !== 'fs')
    ? memoryDriver()
    : fsDriver(root);

  async function listWorkspaces() {
    const index = await impl.readIndex();
    return index.slice().sort(compareBy('id', 'asc'));
  }

  async function getWorkspace(wsId) {
    const index = await impl.readIndex();
    return index.find((w) => w.id === wsId) || null;
  }

  async function upsertWorkspace(ws) {
    if (!ws?.id) throw new Error('workspace requires an id');
    safeSegment(ws.id, 'workspace id');
    const index = await impl.readIndex();
    const at = index.findIndex((w) => w.id === ws.id);
    const merged = at === -1
      ? { createdAt: clock.iso(), ...ws, updatedAt: clock.iso() }
      : { ...index[at], ...ws, updatedAt: clock.iso() };
    if (at === -1) index.push(merged);
    else index[at] = merged;
    await impl.writeIndex(index);
    await impl.ensure(ws.id);
    return merged;
  }

  async function deleteWorkspace(wsId) {
    const index = await impl.readIndex();
    await impl.writeIndex(index.filter((w) => w.id !== wsId));
    await impl.destroy(wsId);
  }

  /** A workspace-scoped view. Every read and write below is fenced to `wsId`. */
  function ws(wsId) {
    safeSegment(wsId, 'workspace id');
    return {
      id: wsId,

      async get(coll, id) { return impl.get(wsId, coll, id); },

      async put(coll, id, doc) {
        const now = clock.iso();
        const prior = await impl.get(wsId, coll, id);
        const next = {
          ...doc,
          id,
          workspaceId: wsId,
          createdAt: prior?.createdAt || doc.createdAt || now,
          updatedAt: now,
        };
        return impl.put(wsId, coll, id, next);
      },

      /** Shallow merge onto an existing doc. Throws if it does not exist. */
      async patch(coll, id, changes) {
        const prior = await impl.get(wsId, coll, id);
        if (!prior) throw new Error(`${coll}/${id} not found in ${wsId}`);
        return impl.put(wsId, coll, id, { ...prior, ...changes, id, workspaceId: wsId, updatedAt: clock.iso() });
      },

      async delete(coll, id) { return impl.del(wsId, coll, id); },

      /**
       * List documents in a collection.
       * `where` may be a predicate function or a shallow equality object.
       */
      async list(coll, { where = null, sort = 'updatedAt', order = 'desc', limit = null, offset = 0 } = {}) {
        const ids = await impl.ids(wsId, coll);
        const docs = [];
        for (const id of ids) {
          const doc = await impl.get(wsId, coll, id);
          if (doc) docs.push(doc);
        }
        let out = docs;
        if (typeof where === 'function') out = out.filter(where);
        else if (where && typeof where === 'object') {
          out = out.filter((d) => Object.entries(where).every(([k, v]) => (Array.isArray(v) ? v.includes(d?.[k]) : d?.[k] === v)));
        }
        if (sort) out.sort(compareBy(sort, order));
        out = out.slice(offset);
        return limit == null ? out : out.slice(0, limit);
      },

      async count(coll, where = null) {
        return (await ws(wsId).list(coll, { where, sort: null })).length;
      },

      // Singletons: profile, voice, guardrails, budget, brand
      async getSingleton(name, fallback = null) {
        return (await impl.get(wsId, 'singletons', name)) ?? fallback;
      },
      async putSingleton(name, doc) {
        return ws(wsId).put('singletons', name, doc);
      },

      // Append-only streams
      async append(stream, record) {
        return impl.append(wsId, stream, { ts: clock.iso(), ...record });
      },
      async read(stream, opts) { return impl.read(wsId, stream, opts); },

      async tail(stream, limit = 50) { return impl.read(wsId, stream, { limit, tail: true }); },

      paths: { root: impl.wsRoot(wsId) },
    };
  }

  return {
    driver: impl.kind,
    root: impl.root,
    clock,
    listWorkspaces,
    getWorkspace,
    upsertWorkspace,
    deleteWorkspace,
    hasWorkspace: (wsId) => impl.has(wsId),
    ws,
  };
}
