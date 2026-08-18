'use strict';

const fs = require('node:fs');
const { DATA, SESSIONS, TRACES, NOTES, ENV_FILE } = require('./src/paths');
const { loadDotEnv } = require('./src/env');
const { loadConfig } = require('./src/config');
const { createServer } = require('./src/gateway');
const memory = require('./src/memory-store');

loadDotEnv(ENV_FILE);

for (const dir of [DATA, SESSIONS, TRACES, NOTES]) {
  fs.mkdirSync(dir, { recursive: true });
}
memory.bootstrap();

const config = loadConfig();
const server = createServer(config);
server.listen(config.port, config.host, () => {
  process.stdout.write(
    `IMMOHRTAL CLAW staged at http://${config.host}:${config.port}\n` +
    `provider=${config.provider.kind} model=${config.provider.model}\n` +
    'publish=blocked (local stage only)\n',
  );
});
