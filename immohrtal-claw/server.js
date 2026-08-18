'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DATA, SESSIONS, TRACES, NOTES, ENV_FILE, WORKSPACE } = require('./src/paths');
const { loadDotEnv } = require('./src/env');

// MUST run before requiring config/models/gateway. models.js builds CATALOG at
// module scope from process.env, so loading .env after that require silently
// dropped every CLAW_*_MODEL override and OLLAMA_HOST on the floor.
loadDotEnv(ENV_FILE);

const { loadConfig } = require('./src/config');
const { createServer } = require('./src/gateway');
const memory = require('./src/memory-store');
const { runTurn } = require('./src/agent-loop');

if (process.env.CLAW_TUNNEL === '1' && !process.env.CLAW_GATE_TOKEN) {
  process.env.CLAW_GATE_TOKEN = crypto.randomBytes(18).toString('base64url');
}

for (const dir of [DATA, SESSIONS, TRACES, NOTES]) {
  fs.mkdirSync(dir, { recursive: true });
}
memory.bootstrap();

const config = loadConfig();
if (config.tunnel && !config.gateToken) {
  throw new Error('refusing to tunnel without CLAW_GATE_TOKEN');
}

const server = createServer(config);
server.listen(config.port, config.host, () => {
  process.stdout.write(
    `IMMOHRTAL CLAW at http://${config.host}:${config.port}\n` +
    `provider=${config.provider.kind} model=${config.provider.model}\n` +
    `gated=${Boolean(config.gateToken)} tunnel=${Boolean(config.tunnel)}\n` +
    'chatgpt=later\n',
  );
  if (config.gateToken) {
    fs.writeFileSync(path.join(DATA, 'gate-code.txt'), `${config.gateToken}\n`, { mode: 0o600 });
    process.stdout.write(`gate code: ${config.gateToken}\n`);
  }
});

if (config.heartbeatMs > 0) {
  const beat = async () => {
    const file = `${WORKSPACE}/HEARTBEAT.md`;
    if (!fs.existsSync(file)) return;
    const text = fs.readFileSync(file, 'utf8');
    if (!text.trim()) return;
    await runTurn({
      config,
      sessionId: 'heartbeat',
      userText: `Heartbeat check. Read HEARTBEAT.md. If nothing needs doing, reply HEARTBEAT_OK.\n\n${text}`,
    }).catch(() => {});
  };
  setInterval(beat, config.heartbeatMs);
}
