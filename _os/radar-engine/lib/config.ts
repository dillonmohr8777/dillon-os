'use strict';

const path = require('path');

function envBool(name, fallback = false) {
  const v = process.env[name];
  if (v == null || v === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(v));
}

function envInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) ? n : fallback;
}

function loadConfig(overrides = {}) {
  const repoRoot = path.resolve(__dirname, '../../..');
  const storageDir =
    process.env.RADAR_V2_STORAGE_DIR ||
    path.join(repoRoot, '12_Brain', 'private', 'radar-engine');
  const cfg = {
    repoRoot,
    databaseUrl: process.env.DATABASE_URL || '',
    host: process.env.RADAR_V2_HOST || '127.0.0.1',
    port: envInt('RADAR_V2_PORT', 4343),
    publicOrigin: process.env.RADAR_V2_PUBLIC_ORIGIN || 'http://127.0.0.1:4343',
    qaToken: process.env.RADAR_V2_QA_TOKEN || '',
    webhookSecret: process.env.RADAR_V2_WEBHOOK_SECRET || '',
    fieldKey: process.env.RADAR_V2_FIELD_KEY || '',
    killSwitch: envBool('RADAR_V2_KILL_SWITCH', true),
    enableReportDelivery: envBool('RADAR_V2_ENABLE_REPORT_DELIVERY', false),
    enableCrm: envBool('RADAR_V2_ENABLE_CRM', false),
    enableOutreach: envBool('RADAR_V2_ENABLE_OUTREACH', false),
    enableEmail: envBool('RADAR_V2_ENABLE_EMAIL', false),
    enableSlack: envBool('RADAR_V2_ENABLE_SLACK', false),
    autoApprove: envBool('RADAR_V2_AUTO_APPROVE', false),
    mandatoryQaCount: envInt('RADAR_V2_MANDATORY_QA_COUNT', 25),
    captcha: process.env.RADAR_V2_CAPTCHA || 'off',
    captchaSecret: process.env.RADAR_V2_CAPTCHA_SECRET || '',
    storage: process.env.RADAR_V2_STORAGE || 'fs',
    storageDir,
    s3Bucket: process.env.RADAR_V2_S3_BUCKET || '',
    s3Region: process.env.RADAR_V2_S3_REGION || '',
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
    brandName: process.env.MOMENTUM_BRAND_NAME || 'NeedMomentum',
    contactName: process.env.MOMENTUM_CONTACT_NAME || 'NeedMomentum',
    contactEmail: process.env.MOMENTUM_CONTACT_EMAIL || 'hello@needmomentum.com',
    contactUrl: process.env.MOMENTUM_CONTACT_URL || 'https://needmomentum.com',
    bookingUrl: process.env.MOMENTUM_BOOKING_URL || 'https://needmomentum.com/book',
    privacyUrl: process.env.MOMENTUM_PRIVACY_URL || '/privacy',
    termsUrl: process.env.MOMENTUM_TERMS_URL || '/terms',
    retentionDays: envInt('RADAR_V2_RETENTION_DAYS', 365),
    reportTtlDays: envInt('RADAR_V2_REPORT_TTL_DAYS', 90),
    scoreVersion: process.env.RADAR_V2_SCORE_VERSION || 'radar-v2.0.0',
    scannerVersion: 'radar-wrap-1.0.0',
    liveScan: envBool('RADAR_V2_LIVE_SCAN', false),
    ...overrides,
  };
  return cfg;
}

function outboundBlocked(cfg, capability) {
  if (cfg.killSwitch) return { blocked: true, reason: 'global kill switch is on' };
  if (capability === 'report' && !cfg.enableReportDelivery) {
    return { blocked: true, reason: 'report delivery disabled' };
  }
  if (capability === 'crm' && !cfg.enableCrm) {
    return { blocked: true, reason: 'CRM writes disabled' };
  }
  if (capability === 'outreach' && !cfg.enableOutreach) {
    return { blocked: true, reason: 'outreach disabled' };
  }
  if (capability === 'email' && !cfg.enableEmail) {
    return { blocked: true, reason: 'email delivery disabled' };
  }
  if (capability === 'slack' && !cfg.enableSlack) {
    return { blocked: true, reason: 'Slack notifications disabled' };
  }
  return { blocked: false, reason: '' };
}

module.exports = { loadConfig, outboundBlocked, envBool, envInt };
