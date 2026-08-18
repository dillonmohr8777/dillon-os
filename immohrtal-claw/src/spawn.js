'use strict';

const crypto = require('node:crypto');
const { appendJsonl } = require('./jsonl');
const { SPAWNS, INBOX } = require('./paths');

const inflight = new Map();

function spawnTask({ config, task }) {
  const { runTurn } = require('./agent-loop');
  const id = `spawn_${crypto.randomBytes(4).toString('hex')}`;
  const rec = { id, task, status: 'queued', created: new Date().toISOString() };
  appendJsonl(SPAWNS, rec);
  inflight.set(id, rec);
  setImmediate(async () => {
    rec.status = 'running';
    try {
      const result = await runTurn({
        config,
        sessionId: id,
        userText: String(task),
      });
      rec.status = 'done';
      rec.content = result.content;
      rec.toolKinds = result.toolKinds;
      appendJsonl(SPAWNS, rec);
      appendJsonl(INBOX, {
        ts: new Date().toISOString(),
        spawnId: id,
        text: result.content,
      });
    } catch (err) {
      rec.status = 'failed';
      rec.error = err.message;
      appendJsonl(SPAWNS, rec);
    }
  });
  return { ok: true, id, status: rec.status };
}

function leaveMessage(text) {
  const rec = { ts: new Date().toISOString(), text: String(text || '').trim() };
  if (!rec.text) throw new Error('message is empty');
  appendJsonl(INBOX, rec);
  return rec;
}

module.exports = { spawnTask, leaveMessage, inflight };
