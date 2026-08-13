'use strict';

const { normalizeEmail, normalizePhone, normalizeWebsite, collapse } = require('./normalize.ts');

const ROLES = ['owner', 'manager', 'marketing', 'other'];

function validateIntake(body, { requireCaptcha = false } = {}) {
  const errors = [];
  const business_name = collapse(body.business_name);
  const website = collapse(body.website);
  const city_state = collapse(body.city_state);
  const requester_name = collapse(body.requester_name);
  const role = String(body.role || '').toLowerCase();
  const requester_email = normalizeEmail(body.requester_email);
  const requester_phone = body.requester_phone ? normalizePhone(body.requester_phone) : '';
  const primary_services = collapse(body.primary_services);
  const growth_goals = collapse(body.growth_goals);
  const current_channels = collapse(body.current_channels);
  const notes = collapse(body.notes);
  const consent_analyze = body.consent_analyze === true || body.consent_analyze === 'on';
  const consent_marketing = body.consent_marketing === true || body.consent_marketing === 'on';

  if (business_name.length < 2) errors.push('business name is required');
  if (!website || !normalizeWebsite(website)) errors.push('a public website URL is required');
  if (city_state.length < 2) errors.push('city/state or service area is required');
  if (requester_name.length < 2) errors.push('requester name is required');
  if (!ROLES.includes(role)) errors.push('role is required');
  if (!requester_email) errors.push('a valid business email is required');
  if (body.requester_phone && !requester_phone) errors.push('phone must be a valid number if provided');
  if (primary_services.length < 2) errors.push('primary services are required');
  if (growth_goals.length < 2) errors.push('growth goals are required');
  if (current_channels.length < 2) errors.push('current marketing channels are required');
  if (!consent_analyze) {
    errors.push('consent to analyze the submitted business public presence is required');
  }
  if (requireCaptcha && !body.captcha_token) errors.push('captcha is required');

  return {
    ok: errors.length === 0,
    errors,
    value: {
      business_name,
      website: normalizeWebsite(website),
      city_state,
      requester_name,
      role,
      requester_email,
      requester_phone,
      primary_services,
      growth_goals,
      current_channels,
      notes,
      consent_analyze,
      consent_marketing: consent_marketing === true,
    },
  };
}

async function verifyCaptcha(adapter, token, ip) {
  if (!adapter || adapter.mode === 'off') return { ok: true, state: 'skipped' };
  return adapter.verify(token, ip);
}

module.exports = { validateIntake, verifyCaptcha, ROLES };
