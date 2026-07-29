'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { repoPath } = require('./fsutil');

/**
 * Deterministic site-health checks.
 * Fixture mode is the default path for CI / dry-run.
 * --live enables GET requests; --canary enables marked POSTs only.
 */

function readFixtureHtml(relOrAbs) {
  const file = path.isAbsolute(relOrAbs) ? relOrAbs : repoPath(relOrAbs);
  return fs.readFileSync(file, 'utf8');
}

function analyzeHtml(html, property) {
  const checks = [];
  const lower = html.toLowerCase();

  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  checks.push({
    id: 'viewport',
    ok: hasViewport,
    detail: hasViewport ? 'viewport meta present' : 'missing viewport meta',
  });

  const hasGa = /gtag\(|google-analytics|G-[A-Z0-9]+|googletagmanager/i.test(html);
  const hasMetaPixel = /fbq\(|facebook\.net\/en_us\/fbevents/i.test(html);
  checks.push({
    id: 'tracking_hints',
    ok: hasGa || hasMetaPixel,
    detail: hasGa || hasMetaPixel ? `tracking hints: ga=${hasGa} meta=${hasMetaPixel}` : 'no GA4/Meta pixel hints',
    severity: 'warn',
  });

  if (property.form_endpoint) {
    const endpoint = property.form_endpoint;
    const mentions = html.includes(endpoint) || lower.includes(endpoint.toLowerCase());
    // Broken fixture intentionally points at a dead endpoint marker
    const markedDead = /data-endpoint-status=["']missing["']/i.test(html) || /ENDPOINT_MISSING/i.test(html);
    const ok = mentions && !markedDead;
    checks.push({
      id: 'form_endpoint',
      ok,
      detail: markedDead
        ? `form endpoint marked missing: ${endpoint}`
        : mentions
          ? `form endpoint referenced: ${endpoint}`
          : `form endpoint not found in markup: ${endpoint}`,
      severity: 'critical',
    });
  }

  const criticalFail = checks.some((c) => c.ok === false && c.severity === 'critical');
  const anyFail = checks.some((c) => c.ok === false);
  return {
    ok: !criticalFail,
    status: criticalFail ? 'fail' : anyFail ? 'warn' : 'pass',
    checks,
  };
}

function httpGet(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs, headers: { 'User-Agent': 'dillon-os-site-health/1.0' } }, (res) => {
      let body = '';
      res.on('data', (c) => {
        if (body.length < 200000) body += c;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          body,
          error: null,
        });
      });
    });
    req.on('error', (err) => resolve({ ok: false, statusCode: 0, body: '', error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, statusCode: 0, body: '', error: 'timeout' });
    });
  });
}

async function checkProperty(property, { live = false, canary = false } = {}) {
  const result = {
    id: property.id,
    name: property.name,
    url: property.url,
    priority: property.priority || 'medium',
    mode: 'fixture',
    ok: true,
    status: 'pass',
    checks: [],
  };

  if (property.fixture || String(property.url || '').startsWith('fixture://')) {
    result.mode = 'fixture';
    const html = readFixtureHtml(property.fixture);
    const analyzed = analyzeHtml(html, property);
    result.checks = analyzed.checks;
    result.ok = analyzed.ok;
    result.status = analyzed.status;
    return result;
  }

  if (!live) {
    result.mode = 'dry-run-skip-live';
    result.checks.push({
      id: 'live_skipped',
      ok: true,
      detail: 'live HTTP skipped (pass --live to enable GET checks)',
      severity: 'info',
    });
    result.status = 'skipped';
    return result;
  }

  result.mode = 'live';
  const get = await httpGet(property.url);
  result.checks.push({
    id: 'http_ok',
    ok: get.ok,
    detail: get.ok ? `HTTP ${get.statusCode}` : `HTTP fail ${get.statusCode || ''} ${get.error || ''}`.trim(),
    severity: 'critical',
  });
  if (get.body) {
    const analyzed = analyzeHtml(get.body, property);
    result.checks.push(...analyzed.checks);
  }

  if (canary && property.canary_allowed && property.form_endpoint) {
    result.checks.push({
      id: 'canary_post',
      ok: false,
      detail: 'canary POST not executed in this build without explicit endpoint contract; blocked by safety policy',
      severity: 'info',
    });
  }

  const criticalFail = result.checks.some((c) => c.ok === false && c.severity === 'critical');
  const anyFail = result.checks.some((c) => c.ok === false && c.severity !== 'info');
  result.ok = !criticalFail;
  result.status = criticalFail ? 'fail' : anyFail ? 'warn' : 'pass';
  return result;
}

async function runSentinel(properties, opts = {}) {
  const results = [];
  for (const p of properties) {
    results.push(await checkProperty(p, opts));
  }
  const failed = results.filter((r) => r.status === 'fail');
  const warned = results.filter((r) => r.status === 'warn');
  return {
    ok: failed.length === 0,
    status: failed.length ? 'fail' : warned.length ? 'warn' : 'pass',
    counts: {
      total: results.length,
      pass: results.filter((r) => r.status === 'pass').length,
      warn: warned.length,
      fail: failed.length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    },
    results,
  };
}

function renderReport(run) {
  const lines = [];
  lines.push('# Site health report');
  lines.push('');
  lines.push(`Status: **${run.status}**`);
  lines.push(`Counts: ${JSON.stringify(run.counts)}`);
  lines.push('');
  for (const r of run.results) {
    lines.push(`## ${r.name} (\`${r.id}\`) — ${r.status}`);
    lines.push(`- url: ${r.url}`);
    lines.push(`- mode: ${r.mode}`);
    for (const c of r.checks) {
      lines.push(`- [${c.ok ? 'ok' : 'FAIL'}] ${c.id}: ${c.detail}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

module.exports = {
  analyzeHtml,
  checkProperty,
  runSentinel,
  renderReport,
};
