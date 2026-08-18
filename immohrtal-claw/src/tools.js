'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { WORKSPACE, NOTES } = require('./paths');
const { assertInside, listSafe } = require('./sandbox');
const { loadSkills } = require('./skills-loader');
const memory = require('./memory-store');
const { loadSession, listSessions } = require('./session-store');

const ALBUM = {
  artist: 'IMMOHRTAL',
  album: 'Dance With The Delusional',
  session: 'SESSION 001',
  line: 'IF NOT NOW, WHEN.',
  tracks: [
    'No Way Out',
    'Picking Up My Notepad',
    '814 Blood (ft. King Keev)',
    'My Mothers Baby',
    'Roll the Dice',
    'My Own Way',
    'Headstone (Interlude)',
    'Grade A Love',
    'On My Way (ft. King Keev)',
    'Waitlist',
    'Dance with the Delusional (ft. Ted Moon)',
  ],
};

function parseArgs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  return JSON.parse(raw);
}

function resolveArea(args) {
  const root = args.area === 'notes' ? NOTES : WORKSPACE;
  return assertInside(root, args.path);
}

function schemas(config) {
  const list = [
    {
      type: 'function',
      function: {
        name: 'list_dir',
        description: 'List files in the workspace (sandboxed).',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'Relative path' } },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'read_file',
        description: 'Read a workspace file.',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string' } },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'write_file',
        description: 'Write a file inside the workspace or data/notes.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
            area: { type: 'string', enum: ['workspace', 'notes'] },
          },
          required: ['path', 'content'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'append_file',
        description: 'Append text to a workspace or notes file. Creates the file if missing.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
            area: { type: 'string', enum: ['workspace', 'notes'] },
          },
          required: ['path', 'content'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'edit_file',
        description: 'Replace one exact string in a workspace file.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            old_string: { type: 'string' },
            new_string: { type: 'string' },
            area: { type: 'string', enum: ['workspace', 'notes'] },
          },
          required: ['path', 'old_string', 'new_string'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'memory_search',
        description: 'Search compiled memory, daily notes, and long-term disk memory.',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' }, limit: { type: 'integer' } },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'memory_write',
        description: 'Append a durable memory. Pin to compile it into MEMORY.md.',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            kind: { type: 'string' },
            pin: { type: 'boolean' },
          },
          required: ['text'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'skill_list',
        description: 'List installed SKILL.md modules.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'skill_read',
        description: 'Read a skill body by id.',
        parameters: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'session_recall',
        description: 'Recall recent turns from a session id, or list sessions.',
        parameters: {
          type: 'object',
          properties: { session_id: { type: 'string' } },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'memory_stats',
        description: 'Return long-term disk usage versus the configured ceiling.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'album_catalog',
        description: 'Return the IMMOHRTAL album bible: title, tracks, campaign line.',
        parameters: { type: 'object', properties: {} },
      },
    },
  ];
  if (config.allowExec) {
    list.push({
      type: 'function',
      function: {
        name: 'exec',
        description: 'Run a sandboxed command. Disabled unless CLAW_ALLOW_EXEC=1.',
        parameters: {
          type: 'object',
          properties: { command: { type: 'string' } },
          required: ['command'],
        },
      },
    });
  }
  return list;
}

function execute(name, rawArgs, config) {
  const args = parseArgs(rawArgs);
  switch (name) {
    case 'list_dir':
      return { ok: true, entries: listSafe(WORKSPACE, args.path || '.') };
    case 'read_file': {
      const file = assertInside(WORKSPACE, args.path);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        throw new Error('file not found');
      }
      const text = fs.readFileSync(file, 'utf8');
      return { ok: true, path: args.path, bytes: text.length, content: text.slice(0, 80_000) };
    }
    case 'write_file': {
      const file = resolveArea(args);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, args.content, 'utf8');
      return { ok: true, path: args.path, bytes: Buffer.byteLength(args.content) };
    }
    case 'append_file': {
      const file = resolveArea(args);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.appendFileSync(file, args.content, 'utf8');
      return { ok: true, path: args.path, bytes: Buffer.byteLength(args.content) };
    }
    case 'edit_file': {
      const file = resolveArea(args);
      if (!fs.existsSync(file)) throw new Error('file not found');
      const current = fs.readFileSync(file, 'utf8');
      if (!current.includes(args.old_string)) {
        throw new Error('old_string not found');
      }
      const next = current.replace(args.old_string, args.new_string);
      fs.writeFileSync(file, next, 'utf8');
      return { ok: true, path: args.path };
    }
    case 'memory_search':
      return {
        ok: true,
        hits: memory.searchMemory({
          query: args.query,
          scanBytes: config.searchScanBytes,
          limit: args.limit || 8,
        }),
      };
    case 'memory_write':
      return {
        ok: true,
        record: memory.writeMemory({
          text: args.text,
          kind: args.kind || 'note',
          pin: Boolean(args.pin),
          maxBytes: config.memoryMaxBytes,
        }),
      };
    case 'skill_list':
      return {
        ok: true,
        skills: loadSkills().map((s) => ({ id: s.id, name: s.name, description: s.description })),
      };
    case 'skill_read': {
      const skill = loadSkills().find((s) => s.id === args.id);
      if (!skill) throw new Error(`unknown skill: ${args.id}`);
      return { ok: true, id: skill.id, body: skill.body };
    }
    case 'session_recall':
      if (!args.session_id) return { ok: true, sessions: listSessions() };
      return { ok: true, messages: loadSession(args.session_id, 20) };
    case 'memory_stats':
      return { ok: true, ...memory.stats(), ceilingBytes: config.memoryMaxBytes };
    case 'album_catalog':
      return { ok: true, ...ALBUM };
    case 'exec':
      throw new Error('exec is staged-off in this build even when flagged; shell stays approval-gated');
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

module.exports = { schemas, execute, ALBUM };
