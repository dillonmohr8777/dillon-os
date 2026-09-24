'use strict';

const { normalizeEmail, normalizePhone, normalizeWebsite, collapse } = require('./normalize.ts');
const { assertSafeScanUrl } = require('./ssrf.ts');

const ROLES = ['owner', 'manager', 'marketing', 'other'];

function validateIntake(body, { requireCaptcha = false } = {}) {
  const errors = [];
  const fieldErrors = {};
  const addError = (field, message) => {
    errors.push(message);
    fieldErrors[field] = message;
  };
  const isLegacy = !['name', 'phone', 'email', 'business_description', 'description', 'goals']
    .some((field) => body[field] !== undefined);
  const business_name = collapse(body.business_name) || null;
  const website = collapse(body.website);
  const city_state = collapse(body.city_state);
  const requester_name = collapse(body.name !== undefined ? body.name : body.requester_name);
  const role = String(body.role || '').toLowerCase();
  const requester_email = normalizeEmail(body.email !== undefined ? body.email : body.requester_email);
  const phone = body.phone !== undefined ? body.phone : body.requester_phone;
  const requester_phone = phone ? normalizePhone(phone) : '';
  const primary_services = collapse(body.primary_services);
  const growth_goals = collapse(body.goals !== undefined ? body.goals : body.growth_goals);
  const business_description = collapse(body.business_description !== undefined ? body.business_description : body.description);
  const current_channels = collapse(body.current_channels);
  const notes = collapse(body.notes);
  const consent_analyze = body.consent_analyze === true || body.consent_analyze === 'on';
  const consent_marketing = body.consent_marketing === true || body.consent_marketing === 'on';

  const normalizedWebsite = normalizeWebsite(website);
  let isPublicWebsite = false;
  try {
    assertSafeScanUrl(normalizedWebsite);
    isPublicWebsite = true;
  } catch {}
  if (!isPublicWebsite) addError('website', 'Enter a public website URL.');
  if (requester_name.length < 2) addError(isLegacy ? 'requester_name' : 'name', isLegacy ? 'requester name is required' : 'Enter your name (at least 2 characters).');
  if (!requester_email) addError(isLegacy ? 'requester_email' : 'email', isLegacy ? 'a valid business email is required' : 'Enter a valid email address.');
  if (isLegacy) {
    if (!business_name || business_name.length < 2) addError('business_name', 'business name is required');
    if (city_state.length < 2) addError('city_state', 'city/state or service area is required');
    if (!ROLES.includes(role)) addError('role', 'role is required');
    if (phone && !requester_phone) addError('requester_phone', 'phone must be a valid number if provided');
    if (primary_services.length < 2) addError('primary_services', 'primary services are required');
    if (growth_goals.length < 2) addError('growth_goals', 'growth goals are required');
    if (current_channels.length < 2) addError('current_channels', 'current marketing channels are required');
  } else {
    if (!phone || !requester_phone) addError('phone', 'Enter a valid phone number.');
    if (business_description.length < 2) addError('business_description', 'Briefly describe your business (at least 2 characters).');
    if (growth_goals.length < 2) addError('goals', 'Enter the goals you want this audit to support.');
  }
  if (!consent_analyze) addError('consent_analyze', 'Consent to the one-time audit request and follow-up is required.');
  if (requireCaptcha && !body.captcha_token) addError('captcha_token', 'captcha is required');

  return {
    ok: errors.length === 0,
    errors,
    fieldErrors,
    value: {
      business_name,
      website: normalizedWebsite,
      city_state: isLegacy ? city_state : null,
      requester_name,
      role: isLegacy ? role : null,
      requester_email,
      requester_phone,
      primary_services: isLegacy ? primary_services : null,
      business_description: isLegacy ? (business_description || null) : business_description,
      growth_goals,
      current_channels: isLegacy ? current_channels : null,
      notes: isLegacy ? notes : null,
      consent_analyze,
      consent_review_call: !isLegacy && consent_analyze,
      consent_marketing: isLegacy && consent_marketing,
    },
  };
}

async function verifyCaptcha(adapter, token, ip) {
  if (!adapter || adapter.mode === 'off') return { ok: true, state: 'skipped' };
  return adapter.verify(token, ip);
}

module.exports = { validateIntake, verifyCaptcha, ROLES };
