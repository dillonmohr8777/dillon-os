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
  providerEl.textContent = `${data.provider.kind} · ${data.provider.model}`;
  const mb = (data.memory.longTermBytes / (1024 * 1024)).toFixed(2);
  memoryEl.textContent = `long-term ${mb} MB / ${(data.memoryMaxBytes / (1024 ** 3)).toFixed(0)} GiB ceiling · context ${data.contextTokens} tok`;
  skillsEl.innerHTML = '';
  for (const skill of data.skills) {
    const li = document.createElement('li');
    li.textContent = `${skill.id} — ${skill.description}`;
    skillsEl.append(li);
  }
  hint.textContent = data.provider.kind === 'rehearsal'
    ? 'Rehearsal provider. Point a live model at it when you want a bigger brain.'
    : `Live provider ${data.provider.model}`;
  statusEl.textContent = data.gated ? 'gated · phone ok' : 'local';
  return true;
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
      if (event === 'tool.start') addTrace(`${data.name} start`);
      if (event === 'tool.end') {
        addTrace(`${data.name} ${data.ok ? 'ok' : 'fail'}`);
        addLine('tool', `${data.name} → ${data.preview || ''}`.slice(0, 240));
      }
      if (event === 'done') {
        final = data.content;
        statusEl.textContent = `${data.provider} · ${data.iterations} iter`;
      }
    }
  }
  if (final) addLine('claw', final);
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

loadState().catch((err) => {
  providerEl.textContent = err.message;
});
