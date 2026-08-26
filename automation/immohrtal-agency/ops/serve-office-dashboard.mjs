import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildOfficeSnapshot,
  renderOfficeDashboard
} from './lib/office-report.mjs';

export const OFFICE_DASHBOARD_HOST = '127.0.0.1';
export const DEFAULT_OFFICE_DASHBOARD_PORT = 4318;

const modulePath = fileURLToPath(import.meta.url);
const moduleDirectory = path.dirname(modulePath);
const defaultRepoRoot = path.resolve(moduleDirectory, '..', '..', '..');
const fontRoot = path.join(defaultRepoRoot, 'immohrtal-marketing-site', 'public', 'fonts');

const APPROVED_FONTS = new Map([
  ['/fonts/FoundryMono-400.woff2', path.join(fontRoot, 'FoundryMono-400.woff2')],
  ['/fonts/FoundryMono-500.woff2', path.join(fontRoot, 'FoundryMono-500.woff2')],
  ['/fonts/Manrope-Variable-Latin.woff2', path.join(fontRoot, 'Manrope-Variable-Latin.woff2')],
  ['/fonts/Unbounded-Variable-Latin.woff2', path.join(fontRoot, 'Unbounded-Variable-Latin.woff2')]
]);

const BASE_HEADERS = Object.freeze({
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Pragma': 'no-cache',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
});

function parsePort(value, { allowEphemeral = false } = {}) {
  const port = Number(value);
  const minimum = allowEphemeral ? 0 : 1;
  if (!Number.isInteger(port) || port < minimum || port > 65_535) {
    throw new Error(`Port must be an integer from ${minimum} through 65535.`);
  }
  return port;
}

function send(response, statusCode, body, contentType, requestMethod = 'GET', extraHeaders = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8');
  response.writeHead(statusCode, {
    ...BASE_HEADERS,
    'Content-Type': contentType,
    'Content-Length': payload.byteLength,
    ...extraHeaders
  });
  response.end(requestMethod === 'HEAD' ? undefined : payload);
}

function sendJson(response, statusCode, value, requestMethod = 'GET', extraHeaders = {}) {
  send(
    response,
    statusCode,
    `${JSON.stringify(value)}\n`,
    'application/json; charset=utf-8',
    requestMethod,
    extraHeaders
  );
}

function buildCurrentSnapshot(repoRoot) {
  return buildOfficeSnapshot({
    repoRoot,
    mode: 'both',
    asOf: new Date().toISOString()
  });
}

export function createOfficeDashboardServer(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || defaultRepoRoot);
  const approvedFonts = new Map(
    [...APPROVED_FONTS.keys()].map((route) => [
      route,
      path.join(repoRoot, 'immohrtal-marketing-site', 'public', 'fonts', path.basename(route))
    ])
  );

  const server = http.createServer((request, response) => {
    const method = request.method || 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      sendJson(
        response,
        405,
        { status: 'method_not_allowed' },
        method,
        { Allow: 'GET, HEAD' }
      );
      return;
    }

    let pathname;
    try {
      pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname;
    } catch {
      sendJson(response, 400, { status: 'bad_request' }, method);
      return;
    }

    try {
      if (pathname === '/health') {
        sendJson(response, 200, {
          status: 'ok',
          service: 'immohrtal-office-dashboard',
          served_at: new Date().toISOString()
        }, method);
        return;
      }

      if (pathname === '/api/state') {
        const servedAt = new Date().toISOString();
        sendJson(response, 200, {
          served_at: servedAt,
          snapshot: buildCurrentSnapshot(repoRoot)
        }, method);
        return;
      }

      if (pathname === '/') {
        const snapshot = buildCurrentSnapshot(repoRoot);
        const html = renderOfficeDashboard(snapshot, {
          liveEndpoint: '/api/state',
          fontBase: '/fonts'
        });
        send(response, 200, html, 'text/html; charset=utf-8', method);
        return;
      }

      const fontPath = approvedFonts.get(pathname);
      if (fontPath) {
        send(response, 200, fs.readFileSync(fontPath), 'font/woff2', method);
        return;
      }

      sendJson(response, 404, { status: 'not_found' }, method);
    } catch (error) {
      sendJson(response, 500, {
        status: 'error',
        message: 'The local office view could not be rendered.'
      }, method);
      server.emit('officeError', error);
    }
  });

  server.on('clientError', (_error, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  });

  return server;
}

export async function startOfficeDashboardServer(options = {}) {
  const port = parsePort(options.port ?? DEFAULT_OFFICE_DASHBOARD_PORT, { allowEphemeral: true });
  const server = createOfficeDashboardServer(options);
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, OFFICE_DASHBOARD_HOST);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    await new Promise((resolve) => server.close(resolve));
    throw new Error('The local office server did not expose a TCP address.');
  }
  return {
    server,
    host: OFFICE_DASHBOARD_HOST,
    port: address.port,
    url: `http://${OFFICE_DASHBOARD_HOST}:${address.port}`
  };
}

export function parseOfficeDashboardCli(argv) {
  let port = DEFAULT_OFFICE_DASHBOARD_PORT;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--port') {
      if (index + 1 >= argv.length) throw new Error('--port requires a value.');
      port = parsePort(argv[index + 1]);
      index += 1;
      continue;
    }
    if (argument.startsWith('--port=')) {
      port = parsePort(argument.slice('--port='.length));
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return { port };
}

async function main() {
  const options = parseOfficeDashboardCli(process.argv.slice(2));
  const started = await startOfficeDashboardServer(options);
  process.stdout.write(`${started.url}\n`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
