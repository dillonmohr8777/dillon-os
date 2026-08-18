'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { SESSIONS } = require('./paths');
const { appendJsonl } = require('./jsonl');

function sessionPath(id) {
  return path.join(SESSIONS, `${id}.jsonl`);
}

function appendMessage(sessionId, message) {
  const record = {
    ts: new Date().toISOString(),
    role: message.role,
    content: message.content || '',
    tool_call_id: message.tool_call_id,
    name: message.name,
    tool_calls: message.tool_calls,
  };
  appendJsonl(sessionPath(sessionId), record);
  return record;
}

function loadSession(sessionId, limit = 80) {
  const file = sessionPath(sessionId);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const slice = lines.slice(-limit);
  const messages = [];
  for (const line of slice) {
    try {
      const rec = JSON.parse(line);
      const msg = { role: rec.role, content: rec.content || '' };
      if (rec.tool_calls) msg.tool_calls = rec.tool_calls;
      if (rec.tool_call_id) msg.tool_call_id = rec.tool_call_id;
      if (rec.name) msg.name = rec.name;
      messages.push(msg);
    } catch {
      // skip corrupt line
    }
  }
  return messages;
}

function listSessions() {
  if (!fs.existsSync(SESSIONS)) return [];
  return fs.readdirSync(SESSIONS)
    .filter((name) => name.endsWith('.jsonl'))
    .map((name) => {
      const id = name.replace(/\.jsonl$/, '');
      const file = path.join(SESSIONS, name);
      const stat = fs.statSync(file);
      return { id, bytes: stat.size, updated: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

module.exports = { appendMessage, loadSession, listSessions, sessionPath };
