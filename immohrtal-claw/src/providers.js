'use strict';

const { rehearsalReply, decideRehearsalTools, messagesSinceLastUser, extractJson } = require('./providers-rehearsal');

function timeoutMs() {
  const n = Number.parseInt(process.env.CLAW_PROVIDER_TIMEOUT_MS || '120000', 10);
  return Number.isFinite(n) ? n : 120000;
}

function openaiTools(tools) {
  return tools || [];
}

function anthropicTools(tools) {
  return (tools || []).map((t) => ({
    name: t.function.name,
    description: t.function.description || t.function.name,
    input_schema: t.function.parameters || { type: 'object', properties: {} },
  }));
}

function geminiTools(tools) {
  return [{
    functionDeclarations: (tools || []).map((t) => ({
      name: t.function.name,
      description: t.function.description || t.function.name,
      parameters: t.function.parameters || { type: 'object', properties: {} },
    })),
  }];
}

function splitSystem(messages) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const rest = messages.filter((m) => m.role !== 'system');
  return { system, rest };
}

async function completeOpenAI({ config, messages, tools }) {
  const url = `${config.provider.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const headers = { 'content-type': 'application/json' };
  if (config.provider.apiKey) headers.authorization = `Bearer ${config.provider.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(timeoutMs()),
    body: JSON.stringify({
      model: config.provider.model,
      messages,
      tools: openaiTools(tools),
      tool_choice: 'auto',
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${config.provider.label || 'openai'} ${res.status}: ${body.slice(0, 400)}`);
  }
  const json = await res.json();
  return json.choices[0].message;
}

function toAnthropicMessages(rest) {
  const out = [];
  for (const msg of rest) {
    if (msg.role === 'tool') {
      const last = out[out.length - 1];
      const block = {
        type: 'tool_result',
        tool_use_id: msg.tool_call_id,
        content: String(msg.content || ''),
      };
      if (last && last.role === 'user' && Array.isArray(last.content)) {
        last.content.push(block);
      } else {
        out.push({ role: 'user', content: [block] });
      }
      continue;
    }
    if (msg.role === 'assistant' && msg.tool_calls) {
      const content = [];
      if (msg.content) content.push({ type: 'text', text: String(msg.content) });
      for (const call of msg.tool_calls) {
        let input = {};
        const raw = call.function?.arguments || call.arguments || '{}';
        try { input = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { input = {}; }
        content.push({
          type: 'tool_use',
          id: call.id,
          name: call.function?.name || call.name,
          input,
        });
      }
      out.push({ role: 'assistant', content });
      continue;
    }
    out.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content || ''),
    });
  }
  return out;
}

/**
 * The system block carries SOUL/AGENT/USER/front-door brief/skills and barely
 * changes between turns, so it is the one thing worth caching. This is the
 * cheap half of the fast path; streaming is the other half.
 */
function cachedSystem(system) {
  if (!system) return '';
  if (process.env.CLAW_PROMPT_CACHE === '0') return system;
  return [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }];
}

async function completeAnthropic({ config, messages, tools }) {
  const { system, rest } = splitSystem(messages);
  const url = `${config.provider.baseUrl.replace(/\/$/, '')}/v1/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(timeoutMs()),
    body: JSON.stringify({
      model: config.provider.model,
      max_tokens: Number.parseInt(process.env.CLAW_MAX_OUTPUT_TOKENS || '8192', 10),
      system: cachedSystem(system),
      tools: anthropicTools(tools),
      messages: toAnthropicMessages(rest),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`claude ${res.status}: ${body.slice(0, 400)}`);
  }
  const json = await res.json();
  const tool_calls = (json.content || [])
    .filter((b) => b.type === 'tool_use')
    .map((b) => ({
      id: b.id,
      type: 'function',
      function: { name: b.name, arguments: JSON.stringify(b.input || {}) },
    }));
  const text = (json.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  if (tool_calls.length) return { role: 'assistant', content: text || '', tool_calls };
  return { role: 'assistant', content: text };
}

function toGeminiContents(rest) {
  const contents = [];
  for (const msg of rest) {
    if (msg.role === 'tool') {
      contents.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: msg.name,
            response: (() => {
              try { return JSON.parse(msg.content); } catch { return { raw: msg.content }; }
            })(),
          },
        }],
      });
      continue;
    }
    if (msg.role === 'assistant' && msg.tool_calls) {
      contents.push({
        role: 'model',
        parts: msg.tool_calls.map((call) => {
          let args = {};
          const raw = call.function?.arguments || '{}';
          try { args = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { args = {}; }
          return { functionCall: { name: call.function?.name || call.name, args } };
        }),
      });
      continue;
    }
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(msg.content || '') }],
    });
  }
  return contents;
}

async function completeGoogle({ config, messages, tools }) {
  const { system, rest } = splitSystem(messages);
  const url = `${config.provider.baseUrl.replace(/\/$/, '')}/models/${encodeURIComponent(config.provider.model)}:generateContent?key=${encodeURIComponent(config.provider.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(timeoutMs()),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: toGeminiContents(rest),
      tools: geminiTools(tools),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`gemini ${res.status}: ${body.slice(0, 400)}`);
  }
  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const calls = parts.filter((p) => p.functionCall).map((p, i) => ({
    id: `gemini_${i}`,
    type: 'function',
    function: {
      name: p.functionCall.name,
      arguments: JSON.stringify(p.functionCall.args || p.functionCall.arguments || {}),
    },
  }));
  const text = parts.filter((p) => p.text).map((p) => p.text).join('\n');
  if (calls.length) return { role: 'assistant', content: text || '', tool_calls: calls };
  return { role: 'assistant', content: text };
}

async function completeLive({ config, messages, tools }) {
  const api = config.provider.api;
  if (api === 'anthropic') return completeAnthropic({ config, messages, tools });
  if (api === 'google') return completeGoogle({ config, messages, tools });
  return completeOpenAI({ config, messages, tools });
}

/* ---------------------------------------------------------------------------
 * Streaming. Same assistant-message shape as the blocking calls, so the agent
 * loop and tool handling do not care which path produced it.
 * ------------------------------------------------------------------------ */

async function* sseLines(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl = buf.indexOf('\n');
    while (nl >= 0) {
      yield buf.slice(0, nl).replace(/\r$/, '');
      buf = buf.slice(nl + 1);
      nl = buf.indexOf('\n');
    }
  }
  if (buf.trim()) yield buf.trim();
}

function dataPayload(line) {
  if (!line.startsWith('data:')) return null;
  const raw = line.slice(5).trim();
  if (!raw || raw === '[DONE]') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function failIfBad(res, label) {
  if (res.ok) return;
  const body = await res.text();
  throw new Error(`${label} ${res.status}: ${body.slice(0, 400)}`);
}

function finish(content, tool_calls) {
  if (tool_calls.length) return { role: 'assistant', content, tool_calls };
  return { role: 'assistant', content };
}

async function streamOpenAI({ config, messages, tools, onDelta }) {
  const url = `${config.provider.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const headers = { 'content-type': 'application/json' };
  if (config.provider.apiKey) headers.authorization = `Bearer ${config.provider.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(timeoutMs()),
    body: JSON.stringify({
      model: config.provider.model,
      messages,
      tools: openaiTools(tools),
      tool_choice: 'auto',
      temperature: 0.3,
      stream: true,
    }),
  });
  await failIfBad(res, config.provider.label || 'openai');

  let content = '';
  const partial = new Map();
  for await (const line of sseLines(res)) {
    const json = dataPayload(line);
    const delta = json && json.choices && json.choices[0] && json.choices[0].delta;
    if (!delta) continue;
    if (delta.content) {
      content += delta.content;
      onDelta(delta.content);
    }
    for (const tc of delta.tool_calls || []) {
      const idx = tc.index == null ? 0 : tc.index;
      const cur = partial.get(idx) || { id: '', name: '', args: '' };
      if (tc.id) cur.id = tc.id;
      if (tc.function && tc.function.name) cur.name += tc.function.name;
      if (tc.function && tc.function.arguments) cur.args += tc.function.arguments;
      partial.set(idx, cur);
    }
  }
  const tool_calls = [...partial.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([idx, c]) => ({
      id: c.id || `call_${idx}`,
      type: 'function',
      function: { name: c.name, arguments: c.args || '{}' },
    }));
  return finish(content, tool_calls);
}

async function streamAnthropic({ config, messages, tools, onDelta }) {
  const { system, rest } = splitSystem(messages);
  const url = `${config.provider.baseUrl.replace(/\/$/, '')}/v1/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(timeoutMs()),
    body: JSON.stringify({
      model: config.provider.model,
      max_tokens: Number.parseInt(process.env.CLAW_MAX_OUTPUT_TOKENS || '8192', 10),
      system: cachedSystem(system),
      tools: anthropicTools(tools),
      messages: toAnthropicMessages(rest),
      stream: true,
    }),
  });
  await failIfBad(res, 'claude');

  let content = '';
  const blocks = new Map();
  for await (const line of sseLines(res)) {
    const json = dataPayload(line);
    if (!json) continue;
    if (json.type === 'content_block_start' && json.content_block) {
      blocks.set(json.index, {
        type: json.content_block.type,
        id: json.content_block.id,
        name: json.content_block.name,
        json: '',
      });
      continue;
    }
    if (json.type === 'content_block_delta' && json.delta) {
      if (json.delta.type === 'text_delta' && json.delta.text) {
        content += json.delta.text;
        onDelta(json.delta.text);
      } else if (json.delta.type === 'input_json_delta') {
        const b = blocks.get(json.index);
        if (b) b.json += json.delta.partial_json || '';
      }
    }
  }
  const tool_calls = [...blocks.values()]
    .filter((b) => b.type === 'tool_use')
    .map((b) => ({
      id: b.id,
      type: 'function',
      function: { name: b.name, arguments: b.json || '{}' },
    }));
  return finish(content, tool_calls);
}

async function streamGoogle({ config, messages, tools, onDelta }) {
  const { system, rest } = splitSystem(messages);
  const base = config.provider.baseUrl.replace(/\/$/, '');
  const url = `${base}/models/${encodeURIComponent(config.provider.model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(config.provider.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(timeoutMs()),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: toGeminiContents(rest),
      tools: geminiTools(tools),
    }),
  });
  await failIfBad(res, 'gemini');

  let content = '';
  const calls = [];
  for await (const line of sseLines(res)) {
    const json = dataPayload(line);
    const parts = json && json.candidates && json.candidates[0]
      && json.candidates[0].content && json.candidates[0].content.parts;
    for (const p of parts || []) {
      if (p.text) {
        content += p.text;
        onDelta(p.text);
      }
      if (p.functionCall) calls.push(p.functionCall);
    }
  }
  const tool_calls = calls.map((c, i) => ({
    id: `gemini_${i}`,
    type: 'function',
    function: { name: c.name, arguments: JSON.stringify(c.args || c.arguments || {}) },
  }));
  return finish(content, tool_calls);
}

async function streamLive({ config, messages, tools, onDelta }) {
  const api = config.provider.api;
  if (api === 'anthropic') return streamAnthropic({ config, messages, tools, onDelta });
  if (api === 'google') return streamGoogle({ config, messages, tools, onDelta });
  return streamOpenAI({ config, messages, tools, onDelta });
}

async function complete({ config, messages, tools, onDelta }) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const sinceUser = messagesSinceLastUser(messages);
  const toolMessages = sinceUser.filter((m) => m.role === 'tool');
  const iteration = toolMessages.length;
  // Rehearsal replies are instant, but they still emit one delta so the UI
  // renders through exactly the same path as a live brain.
  const sink = typeof onDelta === 'function' ? onDelta : null;

  if (config.provider.api && config.provider.api !== 'rehearsal' && config.provider.baseUrl) {
    if (sink) return streamLive({ config, messages, tools, onDelta: sink });
    return completeLive({ config, messages, tools });
  }

  const parsed = extractJson(lastUser?.content);
  if (parsed && parsed.tool_calls) {
    return { role: 'assistant', content: '', tool_calls: parsed.tool_calls };
  }

  const emit = (text) => {
    if (sink && text) sink(text);
    return text;
  };

  if (toolMessages.length) {
    const results = toolMessages.map((m) => ({
      name: m.name,
      result: extractJson(m.content) || { raw: m.content },
    }));
    return { role: 'assistant', content: emit(rehearsalReply(lastUser?.content, results)) };
  }

  const tool_calls = decideRehearsalTools(lastUser?.content, iteration);
  if (tool_calls.length) {
    return { role: 'assistant', content: '', tool_calls };
  }
  return { role: 'assistant', content: emit(rehearsalReply(lastUser?.content, [])) };
}

module.exports = { complete, streamLive };
