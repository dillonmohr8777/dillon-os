const logEl = document.getElementById('log');
const traceEl = document.getElementById('trace');
const form = document.getElementById('composer');
const input = document.getElementById('message');
const send = document.getElementById('send');
const hint = document.getElementById('hint');
const providerEl = document.getElementById('provider');
const memoryEl = document.getElementById('memory');
const skillsEl = document.getElementById('skills');
const statusEl = document.getElementById('status');
const gate = document.getElementById('gate');
const gateForm = document.getElementById('gateForm');
const gateCode = document.getElementById('gateCode');
const gateErr = document.getElementById('gateErr');
const rail = document.getElementById('rail');
const railToggle = document.getElementById('railToggle');
const modelPick = document.getElementById('modelPick');
const modelBlocker = document.getElementById('modelBlocker');
const probeBtn = document.getElementById('probeBtn');

let modelIndex = new Map();

const sessionId = localStorage.getItem('claw-session') || `sess_${Date.now().toString(16)}`;
localStorage.setItem('claw-session', sessionId);

function addLine(kind, text, cls) {
  const li = document.createElement('li');
  const who = document.createElement('p');
  who.className = `who ${cls || ''}`.trim();
  who.textContent = kind;
  const body = document.createElement('p');
  body.className = kind === 'tool' ? 'tool' : 'body';
  body.textContent = text;
  li.append(who, body);
  logEl.append(li);
  logEl.scrollTop = logEl.scrollHeight;
  if (logEl.children.length) document.body.classList.add('has-thread');
  return body;
}

function addTrace(text) {
  const li = document.createElement('li');
  li.textContent = text;
  traceEl.prepend(li);
  while (traceEl.children.length > 12) traceEl.lastChild.remove();
}

async function loadState() {
  const res = await fetch('/api/state', { credentials: 'same-origin' });
  if (res.status === 401) {
    gate.hidden = false;
    return false;
  }
  gate.hidden = true;
  const data = await res.json();
  providerEl.textContent = `${data.provider.label || data.provider.kind} · ${data.provider.model}`;
  const mb = (data.memory.longTermBytes / (1024 * 1024)).toFixed(2);
  memoryEl.textContent = `long-term ${mb} MB / ${(data.memoryMaxBytes / (1024 ** 3)).toFixed(0)} GiB ceiling · context ${data.contextTokens} tok`;
  skillsEl.innerHTML = '';
  for (const skill of data.skills) {
    const li = document.createElement('li');
    li.textContent = `${skill.id} — ${skill.description}`;
    skillsEl.append(li);
  }
  hint.textContent = data.provider.api === 'rehearsal' || data.provider.kind === 'rehearsal'
    ? 'Rehearsal. Pick a live brain when keys or Ollama are on this box.'
    : `Live ${data.provider.label || data.provider.model}`;
  // The chrome status is the always-visible answer to "which brain is live".
  const where = data.gated ? 'gated · phone ok' : 'local';
  const brain = data.provider.label || data.provider.model;
  statusEl.textContent = `${brain} · ${where}`;
  await loadModels(data.provider.id);
  return true;
}

function showBlocker(id) {
  const model = modelIndex.get(id);
  if (!model || model.ready) {
    modelBlocker.hidden = true;
    modelBlocker.textContent = '';
    return;
  }
  modelBlocker.hidden = false;
  modelBlocker.textContent = `not ready — ${model.blocker || 'unknown blocker'}`;
}

async function loadModels(selectedId, probe) {
  const res = await fetch(probe ? '/api/models?probe=1' : '/api/models', { credentials: 'same-origin' });
  if (!res.ok) return;
  const data = await res.json();
  const selected = selectedId || data.selected;
  modelIndex = new Map(data.models.map((m) => [m.id, m]));
  modelPick.innerHTML = '';
  const rehearsal = document.createElement('option');
  rehearsal.value = 'rehearsal';
  rehearsal.textContent = 'Rehearsal (no remote model)';
  if (selected === 'rehearsal') rehearsal.selected = true;
  modelPick.append(rehearsal);
  const groups = { local: 'Local open-weight', cloud: 'Cloud' };
  for (const group of ['local', 'cloud']) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = groups[group];
    for (const model of data.models.filter((m) => m.group === group)) {
      const opt = document.createElement('option');
      opt.value = model.id;
      // Readiness has to be legible in the closed picker, not just on hover.
      const mark = model.ready ? '● ready' : '○ not ready';
      opt.textContent = `${mark} · ${model.label}`;
      opt.title = model.ready ? model.why || '' : model.blocker || '';
      opt.dataset.ready = model.ready ? '1' : '0';
      if (model.id === selected) opt.selected = true;
      optgroup.append(opt);
    }
    modelPick.append(optgroup);
  }
  modelPick.dataset.ready = modelIndex.get(selected)?.ready === false ? '0' : '1';
  showBlocker(selected);
}

async function transmit(message) {
  send.disabled = true;
  addLine('you', message, 'user');
  const res = await fetch('/api/chat', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, stream: true }),
  });
  if (res.status === 401) {
    gate.hidden = false;
    send.disabled = false;
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let final = '';
  // One bubble per LLM iteration. Tokens land in it as they arrive.
  let liveEl = null;
  let liveText = '';
  let streamedAny = false;

  const closeLive = () => {
    if (liveEl && !liveText.trim()) liveEl.parentElement.remove();
    if (liveEl) liveEl.classList.remove('streaming');
    liveEl = null;
    liveText = '';
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() || '';
    for (const part of parts) {
      const event = (part.match(/^event: (.+)$/m) || [])[1];
      const dataLine = (part.match(/^data: (.+)$/m) || [])[1];
      if (!event || !dataLine) continue;
      const data = JSON.parse(dataLine);
      if (event === 'llm.start') closeLive();
      if (event === 'llm.delta') {
        if (!liveEl) {
          liveEl = addLine('claw', '');
          liveEl.classList.add('streaming');
        }
        liveText += data.text;
        streamedAny = true;
        liveEl.textContent = liveText;
        logEl.scrollTop = logEl.scrollHeight;
      }
      if (event === 'tool.start') addTrace(`${data.name} start`);
      if (event === 'tool.end') {
        addTrace(`${data.name} ${data.ok ? 'ok' : 'fail'}`);
        addLine('tool', `${data.name} → ${data.preview || ''}`.slice(0, 240));
      }
      if (event === 'done') {
        final = data.content;
        statusEl.textContent = `${data.label || data.provider} · ${data.iterations} iter`;
      }
    }
  }
  // The done payload is authoritative; only repaint if streaming fell short.
  if (final && liveEl && liveText.trim()) {
    liveEl.textContent = final;
    liveEl.classList.remove('streaming');
  } else {
    closeLive();
    if (final && !streamedAny) addLine('claw', final);
  }
  await loadState();
  send.disabled = false;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  transmit(message).catch((err) => {
    addLine('claw', err.message);
    send.disabled = false;
  });
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

gateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  gateErr.textContent = '';
  const res = await fetch('/api/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: gateCode.value.trim() }),
  });
  if (!res.ok) {
    gateErr.textContent = 'Bad gate code.';
    return;
  }
  gateCode.value = '';
  await loadState();
});

railToggle.addEventListener('click', () => {
  rail.classList.toggle('open');
});

modelPick.addEventListener('change', async () => {
  const id = modelPick.value;
  showBlocker(id);
  const res = await fetch('/api/model', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    addLine('claw', `Could not switch brains. ${err.error || ''}`.trim());
    return;
  }
  await loadState();
});

probeBtn.addEventListener('click', async () => {
  probeBtn.disabled = true;
  const was = probeBtn.textContent;
  probeBtn.textContent = 'Probing…';
  try {
    await loadModels(modelPick.value, true);
  } finally {
    probeBtn.textContent = was;
    probeBtn.disabled = false;
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

loadState().catch((err) => {
  providerEl.textContent = err.message;
});
