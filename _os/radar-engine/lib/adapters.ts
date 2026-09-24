'use strict';

const fs = require('fs');
const path = require('path');
const { outboundBlocked } = require('./config.ts');
const { redactText } = require('./redact.ts');
const { hmac } = require('./ids.ts');
const { enrichProspect } = require('../../automation/lib/places');
const { safePathJoin } = require('./ssrf.ts');

function captchaAdapter(cfg = {}, options = {}) {
  const mode = cfg.captcha || 'off';
  const fetchImpl = options.fetchImpl || global.fetch;
  const expectedHostname = options.expectedHostname ?? cfg.captchaExpectedHostname;
  const expectedAction = options.expectedAction ?? cfg.captchaExpectedAction;
  return {
    mode,
    async verify(token, ip) {
      if (mode === 'off') return { ok: true, state: 'skipped' };
      if (mode === 'dry-run') {
        return { ok: Boolean(token), state: token ? 'dry-run-accepted' : 'missing' };
      }
      if (mode === 'turnstile') {
        if (!cfg.captchaSecret) return { ok: false, state: 'provider-not-configured' };
        if (!token) return { ok: false, state: 'missing' };
        if (process.env.RADAR_V2_CAPTCHA_LIVE !== 'true') {
          return { ok: false, state: 'live-verify-disabled' };
        }
        if (!expectedHostname) return { ok: false, state: 'hostname-not-configured' };
        if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
          return { ok: false, state: 'invalid-token' };
        }
        if (typeof fetchImpl !== 'function') return { ok: false, state: 'provider-error' };

        const body = new URLSearchParams({ secret: cfg.captchaSecret, response: token });
        if (typeof ip === 'string' && ip) body.set('remoteip', ip);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);
        try {
          const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            redirect: 'error',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            signal: controller.signal,
          });
          if (controller.signal.aborted) return { ok: false, state: 'timeout' };
          if (!response || response.ok !== true) return { ok: false, state: 'provider-error' };

          const result = await response.json();
          if (controller.signal.aborted) return { ok: false, state: 'timeout' };
          if (!result || typeof result !== 'object' || Array.isArray(result)) {
            return { ok: false, state: 'provider-error' };
          }
          if (result.success !== true) return { ok: false, state: 'provider-rejected' };
          if (expectedHostname && result.hostname !== expectedHostname) {
            return { ok: false, state: 'hostname-mismatch' };
          }
          if (expectedAction && result.action !== expectedAction) {
            return { ok: false, state: 'action-mismatch' };
          }
          return { ok: true, state: 'verified' };
        } catch {
          return { ok: false, state: controller.signal.aborted ? 'timeout' : 'provider-error' };
        } finally {
          clearTimeout(timeout);
        }
      }
      return { ok: false, state: 'provider-not-configured' };
    },
  };
}

function placesAdapter(cfg) {
  return {
    name: 'places',
    async lookup(prospect, opts = {}) {
      const key = cfg.placesApiKey || process.env.GOOGLE_PLACES_API_KEY || '';
      if (!key) return { status: 'skipped', reason: 'no GOOGLE_PLACES_API_KEY set' };
      if (process.env.RADAR_V2_PLACES_LIVE !== 'true') {
        return { status: 'skipped', reason: 'Places live lookup disabled until RADAR_V2_PLACES_LIVE=true' };
      }
      return enrichProspect(prospect, { apiKey: key, fetchImpl: opts.fetchImpl });
    },
  };
}

function enrichmentAdapter() {
  return {
    name: 'enrichment',
    async enrich() {
      return { status: 'not-configured', contacts: [], note: 'third-party enrichment is an interface only' };
    },
  };
}

function emailVerifyAdapter() {
  return {
    name: 'email-verify',
    async verify(email) {
      return { email, result: 'unverified', note: 'verification provider not configured' };
    },
  };
}

function emailDeliveryAdapter(cfg) {
  return {
    name: 'email-delivery',
    async send(message) {
      const gate = outboundBlocked(cfg, 'email');
      if (gate.blocked) return { sent: false, dryRun: true, reason: gate.reason };
      return { sent: false, dryRun: true, reason: 'live email provider not configured' };
    },
  };
}

function slackAdapter(cfg) {
  return {
    name: 'slack',
    async notify(message) {
      const gate = outboundBlocked(cfg, 'slack');
      if (gate.blocked) return { sent: false, dryRun: true, reason: gate.reason };
      return { sent: false, dryRun: true, reason: 'live Slack provider not configured' };
    },
  };
}

function crmAdapter(cfg) {
  return {
    name: 'crm-dry-run',
    async handoff(payload) {
      const gate = outboundBlocked(cfg, 'crm');
      const preview = JSON.parse(redactText(JSON.stringify(payload)));
      const rel = `crm-previews/${Date.now()}-${Math.random().toString(16).slice(2)}.json`;
      const abs = safePathJoin(cfg.storageDir, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, JSON.stringify({ dryRun: true, liveWrite: false, preview }, null, 2));
      if (gate.blocked) {
        return { written: false, dryRun: true, liveWrite: false, reason: gate.reason, preview, previewRef: abs };
      }
      return { written: false, dryRun: true, liveWrite: false, reason: 'live CRM write requires a separate approval', preview, previewRef: abs };
    },
  };
}

function bookingAdapter(cfg) {
  return {
    name: 'booking',
    verifySignature(rawBody, header) {
      if (!cfg.webhookSecret) return false;
      const expected = hmac(cfg.webhookSecret, rawBody);
      return header && header.replace(/^sha256=/i, '') === expected;
    },
    async createLink({ origin, token, campaignId, prospectId, reportId, variant }) {
      const u = new URL('/book', origin);
      u.searchParams.set('c', campaignId);
      u.searchParams.set('p', prospectId);
      u.searchParams.set('r', reportId);
      u.searchParams.set('v', variant || 'default');
      u.searchParams.set('t', token);
      return u.toString();
    },
  };
}

function createAdapters(cfg) {
  return {
    captcha: captchaAdapter(cfg),
    places: placesAdapter(cfg),
    enrichment: enrichmentAdapter(),
    emailVerify: emailVerifyAdapter(),
    email: emailDeliveryAdapter(cfg),
    slack: slackAdapter(cfg),
    crm: crmAdapter(cfg),
    booking: bookingAdapter(cfg),
  };
}

module.exports = {
  createAdapters,
  captchaAdapter,
  placesAdapter,
  crmAdapter,
  bookingAdapter,
};
