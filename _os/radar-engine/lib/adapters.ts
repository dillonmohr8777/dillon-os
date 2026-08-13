'use strict';

const { outboundBlocked } = require('./config.ts');
const { redactText } = require('./redact.ts');
const { hmac } = require('./ids.ts');

function captchaAdapter(cfg) {
  const mode = cfg.captcha || 'off';
  return {
    mode,
    async verify(token, ip) {
      if (mode === 'off') return { ok: true, state: 'skipped' };
      if (mode === 'dry-run') {
        return { ok: Boolean(token), state: token ? 'dry-run-accepted' : 'missing' };
      }
      return { ok: false, state: 'provider-not-configured' };
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
      if (gate.blocked) {
        return { written: false, dryRun: true, liveWrite: false, reason: gate.reason, preview };
      }
      return { written: false, dryRun: true, liveWrite: false, reason: 'live CRM write requires a separate approval', preview };
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
  crmAdapter,
  bookingAdapter,
};
