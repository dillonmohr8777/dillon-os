'use strict';

function extractJson(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function boothReply(userText, toolResults) {
  const t = String(userText || '').trim();
  if (toolResults.length) {
    const last = toolResults[toolResults.length - 1];
    if (last.name === 'album_catalog' && last.result.tracks) {
      return `SESSION 001. Dance With The Delusional. Eleven tracks. The line is IF NOT NOW, WHEN.\n${last.result.tracks.map((n, i) => `${String(i + 1).padStart(2, '0')} ${n}`).join('\n')}`;
    }
    if (last.name === 'memory_write') {
      return `Pinned to the booth log. I will not forget: ${last.result.record.text}`;
    }
    if (last.name === 'memory_search') {
      const hits = last.result.hits || [];
      if (!hits.length) return 'Nothing in the long-term tape for that yet. Say it once and I will write it.';
      return hits.map((h) => `[${h.source}] ${h.text.slice(0, 280)}`).join('\n\n');
    }
    if (last.name === 'skill_read') {
      return last.result.body.slice(0, 1200);
    }
  }
  if (/who are you|what are you/i.test(t)) {
    return 'IMMOHRTAL CLAW. Night-booth harness. PicoClaw architecture, more memory, more tools, still local until you say publish.';
  }
  return `Heard. ${t.slice(0, 220)}\n\nI am running the booth rehearsal provider (no remote model). Point OPENAI_BASE_URL at Ollama or an OpenAI-compatible host when you want a live brain. The harness, memory, and skills are already live.`;
}

function decideBoothTools(userText, iteration) {
  if (iteration > 0) return [];
  const t = String(userText || '');
  if (/remember|pin this|don't forget|dont forget/i.test(t)) {
    return [{
      id: 'call_mem_1',
      type: 'function',
      function: {
        name: 'memory_write',
        arguments: JSON.stringify({
          text: t.replace(/^(please |hey )?(remember|pin this|don't forget|dont forget)[:\s]*/i, '').trim() || t,
          pin: true,
          kind: 'pin',
        }),
      },
    }];
  }
  if (/tracklist|album|814|delusional|immohrtal/i.test(t)) {
    return [{
      id: 'call_album_1',
      type: 'function',
      function: { name: 'album_catalog', arguments: '{}' },
    }];
  }
  if (/what do you (know|remember)|search memory|recall/i.test(t)) {
    return [{
      id: 'call_search_1',
      type: 'function',
      function: {
        name: 'memory_search',
        arguments: JSON.stringify({ query: t }),
      },
    }];
  }
  return [];
}

async function complete({ config, messages, tools }) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const toolMessages = messages.filter((m) => m.role === 'tool');
  const iteration = toolMessages.length;

  if (config.provider.kind === 'openai') {
    const url = `${config.provider.baseUrl}/chat/completions`;
    const headers = { 'content-type': 'application/json' };
    if (config.provider.apiKey) headers.authorization = `Bearer ${config.provider.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.provider.model,
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`provider ${res.status}: ${body.slice(0, 400)}`);
    }
    const json = await res.json();
    return json.choices[0].message;
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
    return { role: 'assistant', content: boothReply(lastUser?.content, results) };
  }

  const tool_calls = decideBoothTools(lastUser?.content, iteration);
  if (tool_calls.length) {
    return { role: 'assistant', content: '', tool_calls };
  }
  return { role: 'assistant', content: boothReply(lastUser?.content, []) };
}

module.exports = { complete, decideBoothTools, boothReply };
