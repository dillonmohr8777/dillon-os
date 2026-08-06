'use strict';

/**
 * Zero-dependency HTTP(S) fetch that honours proxy environment variables.
 *
 * Node's `http`/`https` modules ignore HTTPS_PROXY entirely, so any audit code
 * built on them silently fails in a sandboxed or corporate-proxied environment —
 * and a failed fetch looks exactly like a dead domain to a grader. That failure
 * mode is dangerous here: it would mark a business with a perfectly good website
 * as "broken" and mail them a redesign.
 *
 * So proxy support is not a nicety, it is a correctness requirement for the
 * grader. This module provides:
 *
 *   httpGet(url, opts)   GET with redirect following, byte cap, timing, proxy
 *   agentFor(url)        a CONNECT-tunnelling agent when a proxy is configured
 *
 * Kept dependency-free to match the rest of _os/automation and the site factory.
 */

const http = require('http');
const https = require('https');
const net = require('net');
const tls = require('tls');
const { URL } = require('url');

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_BYTES = 3_000_000;

function proxyForProtocol(protocol) {
  const pick = (...names) => {
    for (const n of names) {
      const v = process.env[n];
      if (v && String(v).trim()) return String(v).trim();
    }
    return '';
  };
  const raw = protocol === 'https:' ? pick('https_proxy', 'HTTPS_PROXY') : pick('http_proxy', 'HTTP_PROXY');
  if (!raw) return null;
  try {
    return new URL(raw.includes('://') ? raw : `http://${raw}`);
  } catch {
    return null;
  }
}

/** Hosts listed in NO_PROXY bypass the proxy. */
function bypassesProxy(hostname) {
  const raw = process.env.no_proxy || process.env.NO_PROXY || '';
  if (!raw) return false;
  const host = String(hostname).toLowerCase();
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry === '*') return true;
      const bare = entry.replace(/^\*?\./, '');
      return host === bare || host.endsWith(`.${bare}`);
    });
}

/**
 * An https.Agent that reaches origins through an HTTP proxy via CONNECT.
 * One socket per request; the volumes here (a few hundred fetches) do not
 * justify pooling complexity.
 */
class ConnectTunnelAgent extends https.Agent {
  constructor(proxyUrl, opts = {}) {
    super({ ...opts, keepAlive: false });
    this.proxyUrl = proxyUrl;
  }

  createConnection(options, callback) {
    const proxyPort = Number(this.proxyUrl.port) || (this.proxyUrl.protocol === 'https:' ? 443 : 80);
    const targetHost = options.host;
    const targetPort = Number(options.port) || 443;

    const headers = { host: `${targetHost}:${targetPort}`, connection: 'close' };
    if (this.proxyUrl.username) {
      const auth = Buffer.from(
        `${decodeURIComponent(this.proxyUrl.username)}:${decodeURIComponent(this.proxyUrl.password || '')}`
      ).toString('base64');
      headers['proxy-authorization'] = `Basic ${auth}`;
    }

    const req = http.request({
      host: this.proxyUrl.hostname,
      port: proxyPort,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
      headers,
      agent: false,
    });

    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      callback(err);
    };

    req.once('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        return fail(new Error(`proxy CONNECT returned ${res.statusCode}`));
      }
      if (settled) return socket.destroy();
      settled = true;
      const secured = tls.connect({
        socket,
        servername: options.servername || targetHost,
        rejectUnauthorized: options.rejectUnauthorized !== false,
      });
      secured.once('error', (err) => {
        // Surface TLS failures to the caller rather than crashing the process.
        secured.destroy();
        if (typeof options.onTlsError === 'function') options.onTlsError(err);
      });
      callback(null, secured);
    });
    req.once('error', fail);
    req.once('timeout', () => {
      req.destroy();
      fail(new Error('proxy CONNECT timeout'));
    });
    req.setTimeout(options.timeout || DEFAULT_TIMEOUT_MS);
    req.end();
    return undefined;
  }
}

const agentCache = new Map();

/** Returns an agent appropriate for `url`, or undefined when no proxy applies. */
function agentFor(url) {
  const u = url instanceof URL ? url : new URL(String(url));
  if (bypassesProxy(u.hostname)) return undefined;
  const proxy = proxyForProtocol(u.protocol);
  if (!proxy) return undefined;

  const key = `${u.protocol}|${proxy.href}`;
  if (!agentCache.has(key)) {
    agentCache.set(
      key,
      u.protocol === 'https:'
        ? new ConnectTunnelAgent(proxy)
        : new http.Agent({ keepAlive: false })
    );
  }
  return agentCache.get(key);
}

/** True when an http:// request must be sent in absolute-form to the proxy. */
function needsAbsoluteForm(u) {
  return u.protocol === 'http:' && !bypassesProxy(u.hostname) && !!proxyForProtocol('http:');
}

/**
 * Public http(s) hosts only. Blocks loopback, link-local and RFC1918 ranges so
 * a candidate list can never turn the grader into an internal port scanner.
 */
function assertPublicHttpUrl(raw) {
  const u = new URL(String(raw));
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error(`unsupported protocol: ${u.protocol}`);
  }
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const blocked =
    host === 'localhost' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^0\./.test(host) ||
    /^f[cd][0-9a-f]{2}:/i.test(host) ||
    /^fe80:/i.test(host);
  if (blocked) throw new Error(`non-public host: ${host}`);
  return u;
}

/**
 * Proxy-aware GET.
 *
 * @returns {Promise<{ok:boolean, error?:string, finalUrl?:string, status?:number,
 *                    headers?:object, body?:string, bytes?:number,
 *                    responseMs?:number, totalMs?:number, hops:Array}>}
 */
function httpGet(rawUrl, opts = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRedirects = 5,
    maxBytes = DEFAULT_MAX_BYTES,
    headers: extraHeaders = {},
    method = 'GET',
    body = null,
    userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/124.0 Safari/537.36 MomentumSiteGrader/1.0 (+prospect site audit)',
  } = opts;
  const payload = body == null ? null : Buffer.from(String(body), 'utf8');

  return new Promise((resolve) => {
    const started = Date.now();
    const hops = [];

    const go = (urlStr, depth) => {
      let u;
      try {
        u = assertPublicHttpUrl(urlStr);
      } catch (err) {
        return resolve({ ok: false, error: err.message, hops, responseMs: Date.now() - started });
      }

      const lib = u.protocol === 'https:' ? https : http;
      const agent = agentFor(u);
      const reqOpts = {
        method,
        headers: {
          host: u.host,
          'user-agent': userAgent,
          accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          'accept-encoding': 'identity',
          ...(payload
            ? {
                'content-type': extraHeaders['content-type'] || 'application/x-www-form-urlencoded',
                'content-length': String(payload.length),
              }
            : {}),
          ...extraHeaders,
        },
        timeout: timeoutMs,
      };
      if (agent) reqOpts.agent = agent;

      let req;
      if (needsAbsoluteForm(u)) {
        // Plain HTTP through a proxy: absolute-form request URI, proxy host/port.
        const proxy = proxyForProtocol('http:');
        req = lib.request(
          {
            ...reqOpts,
            host: proxy.hostname,
            port: Number(proxy.port) || 80,
            path: u.href,
            agent: false,
          },
          onResponse
        );
      } else {
        req = lib.request(u, reqOpts, onResponse);
      }

      function onResponse(res) {
        const status = res.statusCode || 0;
        hops.push({ url: u.href, status });
        const loc = res.headers.location;
        if (status >= 300 && status < 400 && loc && depth < maxRedirects) {
          res.resume();
          let next;
          try {
            next = new URL(loc, u).href;
          } catch {
            return resolve({ ok: false, error: `bad redirect target: ${loc}`, hops, status });
          }
          return go(next, depth + 1);
        }

        const responseMs = Date.now() - started;
        const chunks = [];
        let bytes = 0;
        res.on('data', (c) => {
          bytes += c.length;
          if (bytes <= maxBytes) chunks.push(c);
          else {
            res.destroy();
          }
        });
        res.on('end', () =>
          resolve({
            ok: true,
            finalUrl: u.href,
            status,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
            bytes,
            responseMs,
            totalMs: Date.now() - started,
            hops,
          })
        );
        res.on('close', () => {
          // destroyed by the byte cap: still a usable partial body
          if (bytes > maxBytes) {
            resolve({
              ok: true,
              finalUrl: u.href,
              status,
              headers: res.headers,
              body: Buffer.concat(chunks).toString('utf8'),
              bytes,
              truncated: true,
              responseMs,
              totalMs: Date.now() - started,
              hops,
            });
          }
        });
        res.on('error', (err) => resolve({ ok: false, error: err.message, status, hops, responseMs }));
      }

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: `timeout after ${timeoutMs}ms`, hops, responseMs: Date.now() - started });
      });
      req.on('error', (err) =>
        resolve({
          ok: false,
          error: err.code || err.message || 'request failed',
          hops,
          responseMs: Date.now() - started,
        })
      );
      if (payload) req.write(payload);
      req.end();
    };

    go(rawUrl, 0);
  });
}

/**
 * Classify why a fetch failed. This distinction decides whether a prospect goes
 * into a mail-merge as "your website is down".
 *
 * The 2026-08-06 calibration run flagged 52 of 500 sites as dead domains. Only
 * 18 were: 22 were the local proxy returning 502, the rest timeouts and transient
 * DNS. Treating our own infrastructure noise as their outage would have put ~34
 * businesses with working websites at the top of the build queue.
 *
 *   'dead'         authoritative: the host does not exist or refuses connections
 *   'broken_tls'   the site exists but browsers block it (expired/invalid cert)
 *   'inconclusive' our side failed, or the network flaked — proves nothing
 */
function classifyFetchError(error) {
  const e = String(error || '').toUpperCase();
  if (!e) return 'inconclusive';

  // DNS has no record, or the host actively refused us. Authoritative — both
  // require an answer from the other side.
  //
  // EHOSTUNREACH and ENETUNREACH deliberately do NOT belong here, though they
  // read like they should: they are routing failures on *our* side of the wire,
  // so they say nothing about whether the business has a website. Classifying
  // them as dead was the same mistake as trusting a proxy 502.
  if (/ENOTFOUND|NXDOMAIN|ECONNREFUSED/.test(e)) return 'dead';

  // The server answered but TLS is broken, so a real visitor hits a full-page
  // browser warning. That is a genuine, gradeable fault.
  if (/CERT_HAS_EXPIRED|ERR_TLS_CERT_ALTNAME_INVALID|UNABLE_TO_VERIFY_LEAF_SIGNATURE|SELF_SIGNED_CERT|DEPTH_ZERO_SELF_SIGNED|CERT_NOT_YET_VALID|ERR_SSL|EPROTO|WRONG_VERSION_NUMBER|UNSUPPORTED_PROTOCOL/.test(e)) {
    return 'broken_tls';
  }

  // Our proxy, our routing, our timeout, or a transient resolver hiccup.
  // Never their fault, and never grounds for telling a business its site is down.
  if (/PROXY|EAI_AGAIN|ETIMEDOUT|TIMEOUT|ECONNRESET|EPIPE|ESOCKETTIMEDOUT|EHOSTUNREACH|ENETUNREACH|ENETDOWN|EADDRNOTAVAIL|UNABLE_TO_GET_ISSUER_CERT_LOCALLY|ERR_TLS/.test(e)) {
    return 'inconclusive';
  }
  // Anything unrecognised is inconclusive by default: the cost of wrongly
  // claiming a live site is dead is far higher than re-auditing one row.
  return 'inconclusive';
}

module.exports = {
  httpGet,
  agentFor,
  assertPublicHttpUrl,
  bypassesProxy,
  proxyForProtocol,
  classifyFetchError,
  ConnectTunnelAgent,
};
