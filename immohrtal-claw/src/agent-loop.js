'use strict';

const crypto = require('node:crypto');
const { buildSystemPrompt } = require('./context-builder');
const { schemas, execute } = require('./tools');
const { complete } = require('./providers');
const session = require('./session-store');
const traces = require('./traces');
const memory = require('./memory-store');

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

async function runTurn({ config, sessionId, userText, onEvent }) {
  const turnId = newId('turn');
  const emit = (type, payload) => {
    traces.emit(turnId, { type, ...payload });
    if (onEvent) onEvent({ type, turnId, ...payload });
  };

  emit('turn.start', { sessionId, userText });
  session.appendMessage(sessionId, { role: 'user', content: userText });

  const built = buildSystemPrompt(config);
  const tools = schemas(config);
  const history = session.loadSession(sessionId, 40);
  const messages = [
    { role: 'system', content: built.prompt },
    ...history,
  ];

  let final = '';
  let iterations = 0;
  const toolKinds = [];

  for (let i = 0; i < config.maxToolIters; i += 1) {
    iterations = i + 1;
    emit('llm.start', { iteration: iterations, provider: config.provider.kind });
    const assistant = await complete({ config, messages, tools });
    messages.push(assistant);

    if (assistant.tool_calls && assistant.tool_calls.length) {
      session.appendMessage(sessionId, {
        role: 'assistant',
        content: assistant.content || '',
        tool_calls: assistant.tool_calls,
      });
      for (const call of assistant.tool_calls) {
        const name = call.function?.name || call.name;
        const args = call.function?.arguments || call.arguments || '{}';
        emit('tool.start', { name, arguments: args });
        let result;
        try {
          result = await execute(name, args, config);
        } catch (err) {
          result = { ok: false, error: err.message };
        }
        toolKinds.push(name);
        const content = JSON.stringify(result);
        emit('tool.end', { name, ok: result.ok !== false, preview: content.slice(0, 500) });
        const toolMsg = {
          role: 'tool',
          tool_call_id: call.id || newId('tc'),
          name,
          content,
        };
        messages.push(toolMsg);
        session.appendMessage(sessionId, toolMsg);
      }
      continue;
    }

    final = assistant.content || '';
    session.appendMessage(sessionId, { role: 'assistant', content: final });
    break;
  }

  if (!final) {
    final = 'The harness hit the tool-iteration ceiling. Tighten the ask.';
    session.appendMessage(sessionId, { role: 'assistant', content: final });
  }

  emit('turn.end', {
    sessionId,
    iterations,
    toolKinds,
    contentLen: final.length,
    memory: memory.stats(),
  });

  return {
    turnId,
    sessionId,
    content: final,
    iterations,
    toolKinds,
    provider: config.provider.kind,
    memory: memory.stats(),
  };
}

module.exports = { runTurn, newId };
