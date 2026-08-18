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

function messagesSinceLastUser(messages) {
  let idx = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') {
      idx = i;
      break;
    }
  }
  return idx >= 0 ? messages.slice(idx + 1) : [];
}

function rehearsalReply(userText, toolResults) {
  const t = String(userText || '').trim();
  if (toolResults.length) {
    const last = toolResults[toolResults.length - 1];
    if (last.name === 'memory_write') {
      return `Pinned. I will not forget: ${last.result.record.text}`;
    }
    if (last.name === 'memory_search' || last.name === 'kb_search') {
      const hits = last.result.hits || [];
      if (!hits.length) return 'Nothing in the knowledge base for that yet.';
      return hits.map((h) => `[${h.path || h.source}] ${String(h.snippet || h.text || '').slice(0, 280)}`).join('\n\n');
    }
    if (last.name === 'kb_read') {
      return String(last.result.content || '').slice(0, 1500);
    }
    if (last.name === 'model_list') {
      return (last.result.models || []).map((m) => `${m.id} · ${m.ready ? 'ready' : m.blocker}`).join('\n');
    }
    if (last.name === 'web_search') {
      const hits = last.result.hits || [];
      if (!hits.length) return 'Search came back empty.';
      return hits.map((h) => `${h.title}${h.url ? ` — ${h.url}` : ''}\n${h.text}`).join('\n\n');
    }
    if (last.name === 'web_fetch') {
      return last.result.content || `fetch ${last.result.status}`;
    }
    if (last.name === 'cron') {
      return JSON.stringify(last.result, null, 2);
    }
    if (last.name === 'spawn') {
      return `Spawned ${last.result.id}. It will leave a message when it finishes.`;
    }
    if (last.name === 'skill_read') {
      return last.result.body.slice(0, 1200);
    }
    if (last.name === 'list_dir' || last.name === 'read_file') {
      return JSON.stringify(last.result, null, 2).slice(0, 1500);
    }
  }
  if (/who are you|what are you/i.test(t)) {
    return 'IMMOHRTAL CLAW. PicoClaw-class personal agent. Same loop: memory, files, skills, search, cron, spawn, vault knowledge. Not a music product.';
  }
  return `Heard. ${t.slice(0, 220)}\n\nRehearsal provider is on (no remote model). Pick a live brain in Harness when keys or Ollama are on this box.`;
}

function decideRehearsalTools(userText, iteration) {
  if (iteration > 0) return [];
  const t = String(userText || '');
  if (/\b(vault|knowledge base|dillon os|what do we know|index\.md|align hcm|client roster)\b/i.test(t)) {
    return [{
      id: 'call_kb_1',
      type: 'function',
      function: { name: 'kb_search', arguments: JSON.stringify({ query: t }) },
    }];
  }
  if (/what do you (know|remember)|search memory|\brecall\b|what did i tell you/i.test(t)) {
    return [{
      id: 'call_search_1',
      type: 'function',
      function: { name: 'memory_search', arguments: JSON.stringify({ query: t }) },
    }];
  }
  if (/^(please |hey )?(remember|pin this|don't forget|dont forget)\b/i.test(t)) {
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
  if (/\b(search the web|look up|google|web search)\b/i.test(t)) {
    return [{
      id: 'call_web_1',
      type: 'function',
      function: { name: 'web_search', arguments: JSON.stringify({ query: t }) },
    }];
  }
  if (/\b(remind me|set a reminder|cron)\b/i.test(t)) {
    return [{
      id: 'call_cron_1',
      type: 'function',
      function: {
        name: 'cron',
        arguments: JSON.stringify({ action: 'add', text: t, every_minutes: 60 }),
      },
    }];
  }
  if (/\b(which models|list models|model roster)\b/i.test(t)) {
    return [{
      id: 'call_models_1',
      type: 'function',
      function: { name: 'model_list', arguments: '{}' },
    }];
  }
  return [];
}

module.exports = {
  extractJson,
  messagesSinceLastUser,
  rehearsalReply,
  decideRehearsalTools,
};
