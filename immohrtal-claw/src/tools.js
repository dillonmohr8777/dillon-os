'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { WORKSPACE, NOTES } = require('./paths');
const { assertInside, listSafe } = require('./sandbox');
const { loadSkills } = require('./skills-loader');
const memory = require('./memory-store');
const { loadSession, listSessions } = require('./session-store');
const cron = require('./cron');
const net = require('./net');
const spawn = require('./spawn');
const knowledge = require('./knowledge');
const checker = require('./checker');
const models = require('./models');
const { selectModel } = require('./config');

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
        name: 'web_search',
        description: 'Search the public web (DuckDuckGo).',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'web_fetch',
        description: 'Fetch a public http(s) URL and return stripped text. Private hosts are blocked.',
        parameters: {
          type: 'object',
          properties: { url: { type: 'string' } },
          required: ['url'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'cron',
        description: 'Add, list, or cancel reminder jobs.',
        parameters: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['add', 'list', 'cancel'] },
            text: { type: 'string' },
            run_at: { type: 'string' },
            every_minutes: { type: 'integer' },
            id: { type: 'string' },
          },
          required: ['action'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'kb_search',
        description: 'Search the operator vault (BM25 + title/heading/recency boosts). Start here before guessing Dillon OS facts. Generated maps are excluded unless you ask for them.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'integer' },
            include_generated: { type: 'boolean', description: 'Include auto-generated map notes. Default false.' },
            note_type: { type: 'string', description: 'Filter by frontmatter note_type, e.g. project, decision, capture, client.' },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'kb_open',
        description: 'Open the smallest sourced excerpt of one vault note for a question, with a path:line citation. Prefer this over kb_read.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Vault-relative path from kb_search.' },
            query: { type: 'string', description: 'What you are trying to answer. Drives which section is returned.' },
            max_chars: { type: 'integer', description: 'Excerpt ceiling, 200-8000. Default 1200.' },
          },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'kb_read',
        description: 'Read a whole allowlisted vault note. Use kb_open first; this one is the big hammer. Never private/, .env, or credentials.',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'Vault-relative path such as INDEX.md or 12_Brain/00_Home.md' } },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'model_list',
        description: 'List the ten configured brains and whether each is ready on this box.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'model_select',
        description: 'Switch the live brain for the next turn. Use a catalog id.',
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
        name: 'memory_compile',
        description: 'Compile the day raw memory entries into a deduplicated tape grouped by kind. Run at the end of a working session.',
        parameters: {
          type: 'object',
          properties: { day: { type: 'string', description: 'YYYY-MM-DD. Defaults to today.' } },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'brief_write',
        description: 'Write a report into the vault Daily-Briefs/ folder. Local file only: this never sends, publishes, or deploys anything.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Bare filename such as 2026-08-18 - client pulse.md' },
            content: { type: 'string', description: 'Full markdown body, frontmatter included.' },
            overwrite: { type: 'boolean', description: 'Replace an existing brief of the same name. Default false.' },
          },
          required: ['name', 'content'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'second_opinion',
        description: 'Have a different model family check a consequential claim before you commit to it. Returns a verdict and contradictions. Says so honestly when no second family is ready.',
        parameters: {
          type: 'object',
          properties: {
            claim: { type: 'string', description: 'The exact answer or recommendation to verify.' },
            sources: { type: 'string', description: 'Paths, excerpts, or URLs the claim rests on. Uncited claims come back unsupported.' },
          },
          required: ['claim'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'spawn',
        description: 'Run a long task in a background subagent session.',
        parameters: {
          type: 'object',
          properties: { task: { type: 'string' } },
          required: ['task'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'message',
        description: 'Leave a note in the operator inbox, usually from a spawn.',
        parameters: {
          type: 'object',
          properties: { text: { type: 'string' } },
          required: ['text'],
        },
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

async function execute(name, rawArgs, config) {
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
    case 'web_search':
      return net.webSearch(args.query);
    case 'web_fetch':
      return net.webFetch(args.url);
    case 'cron':
      if (args.action === 'list') return { ok: true, jobs: cron.loadJobs() };
      if (args.action === 'cancel') return cron.cancelJob(args.id);
      if (args.action === 'add') {
        return {
          ok: true,
          job: cron.addJob({
            text: args.text,
            runAt: args.run_at,
            everyMinutes: args.every_minutes,
          }),
        };
      }
      throw new Error('unknown cron action');
    case 'kb_search':
      return {
        ok: true,
        hits: knowledge.searchKnowledge({
          query: args.query,
          limit: args.limit || 8,
          includeGenerated: Boolean(args.include_generated),
          noteType: args.note_type || '',
        }),
      };
    case 'kb_open':
      return knowledge.openKnowledge({
        path: args.path,
        query: args.query || '',
        maxChars: args.max_chars || 1200,
      });
    case 'kb_read':
      return knowledge.readKnowledge(args.path);
    case 'model_list':
      return { ok: true, ...(await models.listStatus()) };
    case 'model_select': {
      const next = selectModel(args.id, config);
      return {
        ok: true,
        id: next.modelId,
        label: next.provider.label,
        api: next.provider.api,
        model: next.provider.model,
      };
    }
    case 'memory_compile':
      return memory.compileDailyTape({ day: args.day || undefined });
    case 'brief_write':
      return knowledge.writeBrief({
        name: args.name,
        content: args.content,
        overwrite: Boolean(args.overwrite),
      });
    case 'second_opinion':
      return checker.secondOpinion({ config, claim: args.claim, sources: args.sources || '' });
    case 'spawn':
      return spawn.spawnTask({ config, task: args.task });
    case 'message':
      return { ok: true, record: spawn.leaveMessage(args.text) };
    case 'exec':
      throw new Error('exec is staged-off in this build even when flagged; shell stays approval-gated');
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

module.exports = { schemas, execute };
