'use strict';

/**
 * A local HTTP proxy that Chromium can actually talk to.
 *
 * The problem this solves: in a sandbox whose only egress is a CONNECT-only
 * upstream proxy, Node's own requests work fine (lib/net.js tunnels through it),
 * but Chromium answers `ERR_CONNECTION_RESET` on every navigation no matter how
 * `--proxy-server` is configured. Without a browser there is no Tier 1 audit, no
 * screenshot, and no visual QA — which is the single biggest gap in the whole
 * grader.
 *
 * The fix is a shim rather than a workaround. This listens on loopback, speaks
 * plain HTTP/1.1 proxy protocol to Chromium, and for every request opens its own
 * tunnel to the upstream proxy using the same CONNECT dance that is already
 * proven to work from Node. Chromium talks to something simple and local; the
 * awkward hop is handled by code we control.
 *
 *   Chromium --CONNECT--> this bridge --CONNECT--> upstream proxy --> internet
 *
 * Everything is loopback-only and dies with the process. It grants no access the
 * process did not already have; it just makes the existing egress reachable from
 * a browser.
 */

const http = require('http');
const net = require('net');
const { URL } = require('url');

function upstreamProxy() {
  const raw =
    process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY || '';
  if (!raw) return null;
  try {
    return new URL(raw.includes('://') ? raw : `http://${raw}`);
  } catch {
    return null;
  }
}

/** Open a CONNECT tunnel through the upstream proxy to host:port. */
function openTunnel(proxy, host, port, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: proxy.hostname,
      port: Number(proxy.port) || 80,
      method: 'CONNECT',
      path: `${host}:${port}`,
      headers: { host: `${host}:${port}` },
      agent: false,
      timeout: timeoutMs,
    });

    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    req.once('connect', (res, socket) => {
      if (settled) return socket.destroy();
      if (res.statusCode !== 200) {
        socket.destroy();
        return fail(new Error(`upstream CONNECT ${host}:${port} -> ${res.statusCode}`));
      }
      settled = true;
      resolve(socket);
    });
    req.once('error', fail);
    req.once('timeout', () => {
      req.destroy();
      fail(new Error(`upstream CONNECT timeout for ${host}:${port}`));
    });
    req.end();
  });
}

/**
 * Start the bridge.
 *
 * @param {object} [opts] { port, host, timeoutMs, onError }
 * @returns {Promise<{port:number, url:string, close:()=>Promise<void>, stats:object}>}
 *          Resolves once listening. `url` is what to hand `--proxy-server`.
 */
function startProxyBridge(opts = {}) {
  const proxy = opts.upstream || upstreamProxy();
  const timeoutMs = opts.timeoutMs || 20000;
  const stats = { connect: 0, plain: 0, failed: 0, lastError: null };

  return new Promise((resolve, reject) => {
    const server = http.createServer();

    // Plain HTTP through a proxy uses absolute-form request URIs rather than
    // CONNECT. Browsers do issue these (favicons, OCSP, http:// sites), so the
    // bridge has to handle them or those requests hang.
    server.on('request', async (req, res) => {
      stats.plain += 1;
      let target;
      try {
        target = new URL(req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`);
      } catch {
        res.writeHead(400).end('bad request URI');
        return;
      }
      try {
        const socket = proxy
          ? await openTunnel(proxy, target.hostname, Number(target.port) || 80, timeoutMs)
          : net.connect(Number(target.port) || 80, target.hostname);

        const headers = Object.entries(req.headers)
          .filter(([k]) => !/^proxy-/i.test(k))
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}\r\n`)
          .join('');
        socket.write(`${req.method} ${target.pathname}${target.search} HTTP/1.1\r\n${headers}\r\n`);
        req.pipe(socket);
        socket.pipe(res.socket);
        socket.on('error', () => res.socket?.destroy());
      } catch (err) {
        stats.failed += 1;
        stats.lastError = String(err.message || err);
        if (!res.headersSent) res.writeHead(502).end('bridge upstream failed');
      }
    });

    // The path that matters: HTTPS.
    server.on('connect', async (req, clientSocket, head) => {
      stats.connect += 1;
      const [host, portRaw] = String(req.url).split(':');
      const port = Number(portRaw) || 443;

      // Only loopback clients. The bridge must never become an open relay.
      const remote = clientSocket.remoteAddress || '';
      if (!/^(::ffff:)?127\.|^::1$/.test(remote)) {
        clientSocket.destroy();
        return;
      }

      try {
        const upstreamSocket = proxy
          ? await openTunnel(proxy, host, port, timeoutMs)
          : net.connect(port, host);

        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        if (head && head.length) upstreamSocket.write(head);

        // Pipe both ways and make sure one side dying takes the other with it,
        // otherwise a hung render leaks sockets for the life of the process.
        upstreamSocket.pipe(clientSocket);
        clientSocket.pipe(upstreamSocket);
        // Tear down on error or on a genuine end, but not on the first 'close'
        // of either half — piping emits close on normal completion, and killing
        // the peer there severs live TLS sessions mid-handshake, which Chromium
        // reports as ERR_CONNECTION_CLOSED.
        const kill = () => {
          if (!upstreamSocket.destroyed) upstreamSocket.destroy();
          if (!clientSocket.destroyed) clientSocket.destroy();
        };
        upstreamSocket.on('error', kill);
        clientSocket.on('error', kill);
        upstreamSocket.on('end', () => clientSocket.end());
        clientSocket.on('end', () => upstreamSocket.end());
      } catch (err) {
        stats.failed += 1;
        stats.lastError = String(err.message || err);
        // A 502 lets Chromium report a proxy error rather than hanging.
        try {
          clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        } catch {
          /* client already gone */
        }
        clientSocket.destroy();
        if (typeof opts.onError === 'function') opts.onError(err, `${host}:${port}`);
      }
    });

    server.on('error', reject);
    server.listen(opts.port || 0, opts.host || '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        port,
        url: `http://127.0.0.1:${port}`,
        upstream: proxy ? proxy.href : null,
        stats,
        close: () =>
          new Promise((done) => {
            server.close(() => done());
            server.closeAllConnections?.();
          }),
      });
    });
  });
}

module.exports = { startProxyBridge, upstreamProxy };
