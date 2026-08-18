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
      system,
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

async function complete({ config, messages, tools }) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const sinceUser = messagesSinceLastUser(messages);
  const toolMessages = sinceUser.filter((m) => m.role === 'tool');
  const iteration = toolMessages.length;

  if (config.provider.api && config.provider.api !== 'rehearsal' && config.provider.baseUrl) {
    return completeLive({ config, messages, tools });
  }

  const parsed = extractJson(lastUser?.content);
  if (parsed && parsed.tool_calls) {
    return { role: 'assistant', content: '', tool_calls: parsed.tool_calls };
  }

  if (toolMessages.length) {
    const results = toolMessages.map((m) => ({
      name: m.name,
      result: extractJson(m.content) || { raw: m.content },
    }));
    return { role: 'assistant', content: rehearsalReply(lastUser?.content, results) };
  }

  const tool_calls = decideRehearsalTools(lastUser?.content, iteration);
  if (tool_calls.length) {
    return { role: 'assistant', content: '', tool_calls };
  }
  return { role: 'assistant', content: rehearsalReply(lastUser?.content, []) };
}

module.exports = { complete };
