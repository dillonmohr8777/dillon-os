/*
 * Align HCM first-touch, last-touch, conversion, and form reliability layer.
 * Managed from 02_FullTimeJob/AlignHCM/Watchdog/attribution.
 * Never add email addresses or other submitted values to analytics events or browser storage.
 */
(function (window, document) {
  'use strict';

  if (window.__alignAttributionLoaded) return;
  window.__alignAttributionLoaded = true;

  var PORTAL_ID = '242825734';
  var GUIDE_FORM_ID = '__ALIGN_GUIDE_FORM_ID__';
  var FOOTER_FORM_ID = 'e733d928-0f1d-4b41-853b-df1e0096f330';
  var STORAGE_FIRST = 'align_attribution_first_v1';
  var STORAGE_LAST = 'align_attribution_last_v1';
  var SESSION_TOUCH = 'align_attribution_session_touch_v1';
  var SESSION_GUIDE = 'align_guide_unlocked_v1';
  var ATTRIBUTION_PROPERTIES = [
    'align_first_landing_page',
    'align_first_referrer',
    'align_first_utm_source',
    'align_first_utm_medium',
    'align_first_utm_campaign',
    'align_first_utm_content',
    'align_first_utm_term',
    'align_first_gclid',
    'align_first_fbclid',
    'align_first_msclkid',
    'align_first_li_fat_id',
    'align_first_touch_channel',
    'align_first_social_platform',
    'align_last_landing_page',
    'align_last_referrer',
    'align_last_utm_source',
    'align_last_utm_medium',
    'align_last_utm_campaign',
    'align_last_utm_content',
    'align_last_utm_term',
    'align_last_gclid',
    'align_last_fbclid',
    'align_last_msclkid',
    'align_last_li_fat_id',
    'align_last_touch_channel',
    'align_last_social_platform',
    'align_content_slug',
    'align_content_topic',
    'align_offer_id',
    'align_cta_placement',
    'align_conversion_page',
    'align_conversion_type',
    'align_requested_url'
  ];
  var GUIDE_HOSTS = {
    'align-hcm-dayforce-buyers-guide-assets.netlify.app': true,
    'align-hcm-ukg-guide-assets.netlify.app': true,
    'align-hcm-ukg-guide-assets-2026.netlify.app': true
  };
  var FORM_NAMES = {
    '2a7dbc2e-600a-4d2b-9222-bda4cfd8d5bb': 'Blog Subscribe',
    '99353f9f-a047-4b21-b0ca-ee452f8cf6f6': 'Contact',
    'a2f5cad0-6a8b-485d-b57a-0c0b65e86936': 'Footer',
    'e733d928-0f1d-4b41-853b-df1e0096f330': 'Footer CTA - Get in Touch'
  };
  FORM_NAMES[GUIDE_FORM_ID] = 'Align Buyer Guide Download';

  var currentConversion = {};
  var guideTarget = '';
  var lastSuccessByForm = {};
  var observerScheduled = false;
  var engagementSignals = {};

  function clean(value, maxLength) {
    var result = String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
    var max = maxLength || 500;
    return result.length > max ? result.substring(0, max) : result;
  }

  function pageUrl() {
    return window.location.origin + window.location.pathname;
  }

  function safeReferrer(value) {
    if (!value) return '';
    try {
      var ref = new window.URL(value, window.location.href);
      return clean(ref.origin + ref.pathname, 500);
    } catch (error) {
      return clean(value.split('?')[0].split('#')[0], 500);
    }
  }

  function queryValue(name) {
    try {
      return clean(new window.URLSearchParams(window.location.search).get(name) || '', 255);
    } catch (error) {
      var match = new RegExp('(?:^|&)' + name + '=([^&]*)', 'i').exec(window.location.search.replace(/^\?/, ''));
      return match ? clean(decodeURIComponent(match[1].replace(/\+/g, ' ')), 255) : '';
    }
  }

  function readStorage(storage, key) {
    try {
      var value = storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStorage(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Storage can be unavailable in private browsing. Forms still work. */
    }
  }

  function captureTouch() {
    var touch = {
      landing_page: pageUrl(),
      referrer: safeReferrer(document.referrer),
      utm_source: queryValue('utm_source'),
      utm_medium: queryValue('utm_medium'),
      utm_campaign: queryValue('utm_campaign'),
      utm_content: queryValue('utm_content'),
      utm_term: queryValue('utm_term'),
      gclid: queryValue('gclid'),
      fbclid: queryValue('fbclid'),
      msclkid: queryValue('msclkid'),
      li_fat_id: queryValue('li_fat_id')
    };
    touch.social_platform = socialPlatform(touch);
    touch.channel = classifyChannel(touch);
    return touch;
  }

  function socialPlatform(touch) {
    var signal = [touch.utm_source, touch.referrer].join(' ').toLowerCase();
    if (/linkedin|lnkd\.in/.test(signal)) return 'LinkedIn';
    if (/facebook|instagram|fb\.com/.test(signal)) return 'Meta';
    if (/youtube|youtu\.be/.test(signal)) return 'YouTube';
    if (/twitter|x\.com/.test(signal)) return 'X';
    return '';
  }

  function classifyChannel(touch) {
    var source = (touch.utm_source || '').toLowerCase();
    var medium = (touch.utm_medium || '').toLowerCase();
    var referrer = (touch.referrer || '').toLowerCase();
    if (touch.gclid || /cpc|ppc|paid_search/.test(medium)) return 'Paid Search';
    if (touch.fbclid || touch.li_fat_id || ((/paid_social|social_paid|cpc/.test(medium)) && /linkedin|facebook|instagram/.test(source))) return 'Paid Social';
    if (/organic_social|social|social_media/.test(medium) || socialPlatform(touch)) return socialPlatform(touch) === 'LinkedIn' ? 'Organic Social / LinkedIn' : 'Organic Social';
    if (/google|bing|yahoo|duckduckgo|msn\./.test(referrer) || /organic_search|organic/.test(medium)) return 'Organic Search';
    if (/email/.test(medium)) return 'Email';
    if (/referral/.test(medium) || (referrer && referrer.indexOf(window.location.hostname) === -1)) return 'Referral';
    return 'Direct / Brand Demand';
  }

  function hasCampaignSignal(touch) {
    return !!(
      touch.utm_source || touch.utm_medium || touch.utm_campaign || touch.utm_content ||
      touch.utm_term || touch.gclid || touch.fbclid || touch.msclkid || touch.li_fat_id
    );
  }

  var firstTouch = readStorage(window.localStorage, STORAGE_FIRST);
  var lastTouch = readStorage(window.localStorage, STORAGE_LAST);
  var capturedTouch = captureTouch();
  if (!firstTouch) {
    firstTouch = capturedTouch;
    writeStorage(window.localStorage, STORAGE_FIRST, firstTouch);
  }
  var sessionTouchSeen = false;
  try {
    sessionTouchSeen = window.sessionStorage.getItem(SESSION_TOUCH) === '1';
  } catch (storageError) {
    sessionTouchSeen = false;
  }
  if (!lastTouch || !sessionTouchSeen || hasCampaignSignal(capturedTouch)) {
    lastTouch = capturedTouch;
    writeStorage(window.localStorage, STORAGE_LAST, lastTouch);
  }
  try {
    window.sessionStorage.setItem(SESSION_TOUCH, '1');
  } catch (sessionError) {
    /* No-op. */
  }

  function contentSlug() {
    var slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
    return clean(slug || 'home', 255);
  }

  function contentTopic() {
    var heading = document.querySelector('.blog-title-heading');
    return clean(heading ? heading.textContent : document.title, 255);
  }

  function defaultConversion() {
    var isBlogPost = /^\/blog\/.+/.test(window.location.pathname);
    return {
      offer_id: isBlogPost ? 'hcm_assessment' : 'expert_consultation',
      cta_placement: isBlogPost ? 'blog_end_form' : 'site_form',
      conversion_type: 'contact_form'
    };
  }

  function setConversion(values) {
    values = values || {};
    if (values.offer_id) currentConversion.offer_id = clean(values.offer_id, 255);
    if (values.cta_placement) currentConversion.cta_placement = clean(values.cta_placement, 255);
    if (values.conversion_type) currentConversion.conversion_type = clean(values.conversion_type, 255);
  }

  function getContext(overrides) {
    var defaults = defaultConversion();
    var context = {
      align_first_landing_page: clean(firstTouch && firstTouch.landing_page, 500),
      align_first_referrer: clean(firstTouch && firstTouch.referrer, 500),
      align_first_utm_source: clean(firstTouch && firstTouch.utm_source, 255),
      align_first_utm_medium: clean(firstTouch && firstTouch.utm_medium, 255),
      align_first_utm_campaign: clean(firstTouch && firstTouch.utm_campaign, 255),
      align_first_utm_content: clean(firstTouch && firstTouch.utm_content, 255),
      align_first_utm_term: clean(firstTouch && firstTouch.utm_term, 255),
      align_first_gclid: clean(firstTouch && firstTouch.gclid, 255),
      align_first_fbclid: clean(firstTouch && firstTouch.fbclid, 255),
      align_first_msclkid: clean(firstTouch && firstTouch.msclkid, 255),
      align_first_li_fat_id: clean(firstTouch && firstTouch.li_fat_id, 255),
      align_first_touch_channel: clean(firstTouch && firstTouch.channel, 255),
      align_first_social_platform: clean(firstTouch && firstTouch.social_platform, 255),
      align_last_landing_page: clean(lastTouch && lastTouch.landing_page, 500),
      align_last_referrer: clean(lastTouch && lastTouch.referrer, 500),
      align_last_utm_source: clean(lastTouch && lastTouch.utm_source, 255),
      align_last_utm_medium: clean(lastTouch && lastTouch.utm_medium, 255),
      align_last_utm_campaign: clean(lastTouch && lastTouch.utm_campaign, 255),
      align_last_utm_content: clean(lastTouch && lastTouch.utm_content, 255),
      align_last_utm_term: clean(lastTouch && lastTouch.utm_term, 255),
      align_last_gclid: clean(lastTouch && lastTouch.gclid, 255),
      align_last_fbclid: clean(lastTouch && lastTouch.fbclid, 255),
      align_last_msclkid: clean(lastTouch && lastTouch.msclkid, 255),
      align_last_li_fat_id: clean(lastTouch && lastTouch.li_fat_id, 255),
      align_last_touch_channel: clean(lastTouch && lastTouch.channel, 255),
      align_last_social_platform: clean(lastTouch && lastTouch.social_platform, 255),
      align_content_slug: contentSlug(),
      align_content_topic: contentTopic(),
      align_offer_id: currentConversion.offer_id || defaults.offer_id,
      align_cta_placement: currentConversion.cta_placement || defaults.cta_placement,
      align_conversion_page: pageUrl(),
      align_conversion_type: currentConversion.conversion_type || defaults.conversion_type,
      align_requested_url: document.querySelector('.error-page[data-error="404"]') ? clean(window.location.pathname, 500) : ''
    };
    overrides = overrides || {};
    Object.keys(overrides).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(context, key)) {
        context[key] = clean(overrides[key], 500);
      }
    });
    return context;
  }

  function eventParameters(parameters) {
    var result = {
      page_path: clean(window.location.pathname, 500),
      content_slug: contentSlug()
    };
    Object.keys(parameters || {}).forEach(function (key) {
      var value = parameters[key];
      if (value == null || typeof value === 'object') return;
      result[key] = typeof value === 'number' ? value : clean(value, 500);
    });
    return result;
  }

  function track(name, parameters) {
    var params = eventParameters(parameters || {});
    window.dataLayer = window.dataLayer || [];
    var dataLayerEvent = { event: 'align_' + name };
    Object.keys(params).forEach(function (key) { dataLayerEvent[key] = params[key]; });
    window.dataLayer.push(dataLayerEvent);
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  }

  function markEngagement(name, parameters) {
    if (engagementSignals[name]) return;
    engagementSignals[name] = true;
    track(name, parameters || {});
  }

  function installEngagementSignals() {
    window.setTimeout(function () {
      if (!document.hidden) markEngagement('content_engaged', { engagement_seconds: 15 });
    }, 15000);
    window.addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var depth = Math.round((window.pageYOffset / max) * 100);
      if (depth >= 50) markEngagement('scroll_depth_50', { scroll_percent: 50 });
      if (depth >= 90) markEngagement('scroll_depth_90', { scroll_percent: 90 });
    }, { passive: true });
  }

  function addNextStepPath() {
    if (document.getElementById('align-next-step-path')) return;
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var links = null;
    if (/^\/blog\/.+/.test(path)) {
      links = [
        ['/services/optimization', 'Optimize your HCM platform'],
        ['/align-hcm-smartcare', 'Explore SmartCare support'],
        ['/contact', 'Talk to an HCM expert']
      ];
    } else if (path === '/careers') {
      links = [['/about', 'How Align HCM works'], ['/blog', 'Read our HCM insights'], ['/contact', 'Contact Align HCM']];
    } else if (path === '/about') {
      links = [['/services', 'Explore our services'], ['/blog', 'Read our HCM insights'], ['/contact', 'Talk to our team']];
    } else if (path === '/partners/ukg') {
      links = [['/services/optimization', 'UKG optimization'], ['/align-hcm-smartcare', 'SmartCare support'], ['/contact', 'Discuss your UKG needs']];
    }
    if (!links) return;
    var section = document.createElement('section');
    section.id = 'align-next-step-path';
    section.className = 'align-next-step-path';
    section.setAttribute('aria-label', 'Recommended next steps');
    section.innerHTML = '<div class="align-next-step-path__inner"><p class="align-next-step-path__eyebrow">Keep exploring</p><h2>Choose your next step</h2><div class="align-next-step-path__links">' + links.map(function (link, index) {
      return '<a href="' + link[0] + '" data-align-cta data-align-offer-id="site_exploration" data-align-cta-placement="next_step_path_' + (index + 1) + '" data-align-conversion-type="internal_navigation">' + link[1] + '</a>';
    }).join('') + '</div></div>';
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else document.body.appendChild(section);
  }

  window.AlignAttribution = {
    getContext: getContext,
    track: track,
    version: '2026-07-17'
  };

  function formName(formId) {
    return FORM_NAMES[formId] || 'HubSpot form';
  }

  function markFormSuccess(formId, source) {
    var now = Date.now();
    if (lastSuccessByForm[formId] && now - lastSuccessByForm[formId] < 2500) return;
    lastSuccessByForm[formId] = now;
    var defaults = defaultConversion();
    track('form_submitted', {
      form_id: formId,
      form_name: formName(formId),
      form_source: source,
      offer_id: currentConversion.offer_id || defaults.offer_id,
      cta_placement: currentConversion.cta_placement || defaults.cta_placement,
      conversion_type: currentConversion.conversion_type || defaults.conversion_type,
      first_touch_channel: clean(firstTouch && firstTouch.channel, 255),
      last_touch_channel: clean(lastTouch && lastTouch.channel, 255)
    });
    track('generate_lead', {
      form_id: formId,
      form_name: formName(formId),
      offer_id: currentConversion.offer_id || defaults.offer_id
    });
  }

  function populateFormInstance(form) {
    if (!form || typeof form.setFieldValue !== 'function') return;
    var context = getContext();
    ATTRIBUTION_PROPERTIES.forEach(function (propertyName) {
      var value = context[propertyName];
      if (!value) return;
      try {
        form.setFieldValue('0-1/' + propertyName, [String(value)]);
      } catch (error) {
        try { form.setFieldValue('0-1/' + propertyName, String(value)); } catch (ignored) { /* Legacy form. */ }
      }
    });
  }

  function populateAllFormInstances() {
    if (!window.HubSpotFormsV4 || typeof window.HubSpotFormsV4.getForms !== 'function') return;
    try {
      window.HubSpotFormsV4.getForms().forEach(populateFormInstance);
    } catch (error) {
      /* Older embedded forms are handled through DOM inputs below. */
    }
  }

  function setInputValue(input, value) {
    if (!input || !value || input.value === value) return;
    input.value = value;
    try { input.dispatchEvent(new window.Event('change', { bubbles: true })); } catch (error) { /* IE fallback unnecessary. */ }
  }

  function fillDomFields() {
    var context = getContext();
    ATTRIBUTION_PROPERTIES.forEach(function (propertyName) {
      var value = context[propertyName];
      if (!value) return;
      Array.prototype.forEach.call(document.getElementsByName(propertyName), function (input) { setInputValue(input, value); });
      Array.prototype.forEach.call(document.getElementsByName('0-1/' + propertyName), function (input) { setInputValue(input, value); });
    });
  }

  window.addEventListener('hs-form-event:on-ready', function (event) {
    try { populateFormInstance(window.HubSpotFormsV4.getFormFromEvent(event)); } catch (error) { fillDomFields(); }
  });

  window.addEventListener('hs-form-event:on-submission:success', function (event) {
    var formId = clean(event && event.detail && event.detail.formId, 100);
    if (!formId) {
      try { formId = clean(window.HubSpotFormsV4.getFormFromEvent(event).getFormId(), 100); } catch (error) { formId = 'unknown'; }
    }
    markFormSuccess(formId, 'updated_form_editor');
  });

  window.addEventListener('hs-form-event:on-submission:failed', function (event) {
    var formId = clean(event && event.detail && event.detail.formId, 100) || 'unknown';
    track('form_error', { form_id: formId, form_name: formName(formId), error_type: 'hubspot_submission_failed' });
  });

  window.addEventListener('message', function (event) {
    var data = event && event.data;
    if (!data || data.type !== 'hsFormCallback') return;
    if (data.eventName === 'onFormReady') {
      fillDomFields();
    } else if (data.eventName === 'onFormSubmitted') {
      markFormSuccess(clean(data.id || data.formGuid || 'unknown', 100), 'legacy_form_embed');
    }
  });

  function closestElement(start, selector) {
    var element = start && start.nodeType === 1 ? start : start && start.parentElement;
    while (element) {
      var matches = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
      if (matches && matches.call(element, selector)) return element;
      element = element.parentElement;
    }
    return null;
  }

  function contextFromElement(element) {
    if (!element) return {};
    return {
      offer_id: element.getAttribute('data-align-offer-id') || '',
      cta_placement: element.getAttribute('data-align-cta-placement') || '',
      conversion_type: element.getAttribute('data-align-conversion-type') || ''
    };
  }

  function isMeetingLink(anchor) {
    if (!anchor || !anchor.href) return false;
    try {
      var url = new window.URL(anchor.href, window.location.href);
      return /(^|\.)meetings(?:-na2)?\.hubspot\.com$/i.test(url.hostname);
    } catch (error) {
      return false;
    }
  }

  function decorateMeetingLink(anchor) {
    if (!isMeetingLink(anchor)) return;
    try {
      var url = new window.URL(anchor.href, window.location.href);
      if (!url.searchParams.get('utm_source')) url.searchParams.set('utm_source', 'alignhcm.com');
      if (!url.searchParams.get('utm_medium')) url.searchParams.set('utm_medium', 'website');
      if (!url.searchParams.get('utm_campaign')) url.searchParams.set('utm_campaign', 'meeting_booking');
      if (!url.searchParams.get('utm_content')) {
        url.searchParams.set('utm_content', contentSlug() + '_' + (anchor.getAttribute('data-align-cta-placement') || 'site_link'));
      }
      anchor.href = url.toString();
      anchor.setAttribute('data-align-meeting-link', 'true');
    } catch (error) {
      /* Invalid URLs are left untouched. */
    }
  }

  function decorateMeetingLinks() {
    Array.prototype.forEach.call(document.querySelectorAll('a[href]'), decorateMeetingLink);
  }

  function isGuidePdf(anchor) {
    if (!anchor || !anchor.href) return false;
    try {
      var url = new window.URL(anchor.href, window.location.href);
      return !!GUIDE_HOSTS[url.hostname.toLowerCase()] && /\.pdf$/i.test(url.pathname);
    } catch (error) {
      return false;
    }
  }

  function isGuideUnlocked() {
    try { return window.sessionStorage.getItem(SESSION_GUIDE) === '1'; } catch (error) { return false; }
  }

  function buildGuideModal() {
    var existing = document.getElementById('align-guide-modal');
    if (existing) return existing;
    var modal = document.createElement('div');
    modal.id = 'align-guide-modal';
    modal.className = 'align-guide-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="align-guide-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="align-guide-title">' +
        '<button type="button" class="align-guide-modal__close" aria-label="Close guide form">&times;</button>' +
        '<p class="align-guide-modal__eyebrow">Free buyer guide</p>' +
        '<h2 id="align-guide-title">Send the guide to your inbox</h2>' +
        '<p class="align-guide-modal__intro">Enter your email to access the PDF. We will also keep the guide tied to the page and channel that brought you here.</p>' +
        '<form id="align-guide-form" novalidate>' +
          '<label for="align-guide-email">Email address</label>' +
          '<input id="align-guide-email" name="email" type="email" autocomplete="email" required>' +
          '<button type="submit" class="align-guide-modal__submit">Email me the guide</button>' +
          '<p class="align-form-status" role="status" aria-live="polite"></p>' +
          '<p class="align-guide-modal__privacy">By submitting, you consent to Align HCM storing and processing your information to provide the requested content. See <a href="/disclaimers-policies/">Disclaimers &amp; Policies</a>.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(modal);

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('align-modal-open');
      guideTarget = '';
    }
    modal.querySelector('.align-guide-modal__close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
    modal.querySelector('#align-guide-form').addEventListener('submit', submitGuideForm);
    return modal;
  }

  function openGuideModal(href) {
    guideTarget = href;
    setConversion({ offer_id: 'buyer_guide_pdf', cta_placement: 'blog_resource_link', conversion_type: 'guide_download' });
    var modal = buildGuideModal();
    modal.hidden = false;
    document.body.classList.add('align-modal-open');
    var email = modal.querySelector('#align-guide-email');
    var status = modal.querySelector('.align-form-status');
    status.textContent = '';
    status.removeAttribute('data-status');
    window.setTimeout(function () { email.focus(); }, 20);
    track('guide_gate_opened', { offer_id: 'buyer_guide_pdf', resource_host: new window.URL(href).hostname });
  }

  function hubspotCookie() {
    var match = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]*)/);
    return match ? match[1] : '';
  }

  function contextFields(overrides) {
    var context = getContext(overrides || {});
    var fields = [];
    ATTRIBUTION_PROPERTIES.forEach(function (name) {
      if (context[name]) fields.push({ objectTypeId: '0-1', name: name, value: String(context[name]) });
    });
    return fields;
  }

  function submitGuideForm(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var email = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.align-form-status');
    if (!email.checkValidity()) {
      status.textContent = 'Enter a valid email address to continue.';
      status.setAttribute('data-status', 'error');
      email.focus();
      track('form_error', { form_id: GUIDE_FORM_ID, form_name: formName(GUIDE_FORM_ID), error_type: 'validation' });
      return;
    }
    button.disabled = true;
    button.textContent = 'Sending...';
    status.textContent = '';
    status.removeAttribute('data-status');
    var fields = [{ objectTypeId: '0-1', name: 'email', value: clean(email.value, 255) }].concat(contextFields({
      align_offer_id: 'buyer_guide_pdf',
      align_cta_placement: 'blog_resource_gate',
      align_conversion_type: 'guide_download'
    }));
    var payload = {
      fields: fields,
      context: { hutk: hubspotCookie(), pageUri: pageUrl(), pageName: document.title },
      legalConsentOptions: { consent: { consentToProcess: true, text: 'I consent to Align HCM storing and processing my information to provide the requested content.' } }
    };
    window.fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + PORTAL_ID + '/' + GUIDE_FORM_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      try { window.sessionStorage.setItem(SESSION_GUIDE, '1'); } catch (error) { /* No-op. */ }
      markFormSuccess(GUIDE_FORM_ID, 'buyer_guide_gate');
      track('resource_downloaded', { resource_type: 'buyer_guide_pdf', offer_id: 'buyer_guide_pdf' });
      window.location.assign(guideTarget);
    }).catch(function (error) {
      button.disabled = false;
      button.textContent = 'Email me the guide';
      status.textContent = 'We could not submit the form. Please try again.';
      status.setAttribute('data-status', 'error');
      track('form_error', { form_id: GUIDE_FORM_ID, form_name: formName(GUIDE_FORM_ID), error_type: clean(error.message, 100) });
    });
  }

  function actaStatus(form) {
    var status = form.querySelector('.align-form-status');
    if (status) return status;
    status = document.createElement('p');
    status.className = 'align-form-status';
    status.setAttribute('role', 'alert');
    status.setAttribute('aria-live', 'assertive');
    var button = form.querySelector('.asbtn');
    if (button && button.parentNode) button.parentNode.insertBefore(status, button.nextSibling);
    else form.appendChild(status);
    return status;
  }

  function validateActaForm(form) {
    var valid = true;
    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (input) {
      var field = closestElement(input, '.aff');
      var fieldValid = input.checkValidity();
      if (field) field.classList.toggle('err', !fieldValid);
      if (!fieldValid) valid = false;
    });
    if (!valid) {
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
    }
    return valid;
  }

  function showActaSuccess(form) {
    form.style.display = 'none';
    var title = document.querySelector('.acta-ft');
    var subtitle = document.querySelector('.acta-fs');
    var success = document.getElementById('acta-ok');
    if (title) title.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (success) {
      success.classList.add('show');
      return;
    }
    success = document.createElement('div');
    success.className = 'align-managed-form-success';
    success.setAttribute('role', 'status');
    success.setAttribute('aria-live', 'polite');
    success.innerHTML = '<h4>We\'re on it.</h4><p>An Align HCM expert will reach out shortly to discuss your needs.</p>';
    if (form.parentNode) form.parentNode.insertBefore(success, form.nextSibling);
  }

  function submitActaForm(form) {
    var button = form.querySelector('.asbtn, button[type="submit"]');
    var status = actaStatus(form);
    var offerId = clean(form.getAttribute('data-align-offer-id') || 'expert_consultation', 100);
    var ctaPlacement = clean(form.getAttribute('data-align-cta-placement') || 'global_footer_form', 100);
    status.textContent = '';
    status.removeAttribute('data-status');
    if (!validateActaForm(form)) {
      track('form_error', { form_id: FOOTER_FORM_ID, form_name: formName(FOOTER_FORM_ID), error_type: 'validation' });
      return;
    }
    if (button) {
      button.classList.add('ld');
      button.disabled = true;
    }
    setConversion({ offer_id: offerId, cta_placement: ctaPlacement, conversion_type: 'contact_form' });
    var values = {};
    new window.FormData(form).forEach(function (value, key) { values[key] = clean(value, 2000); });
    if (values.service_interest === 'SmartCare Support') values.service_interest = 'Smartcare Support';
    var fields = [
      { objectTypeId: '0-1', name: 'firstname', value: values.name || '' },
      { objectTypeId: '0-1', name: 'email', value: values.email || '' },
      { objectTypeId: '0-1', name: 'phone', value: values.phone || '' },
      { objectTypeId: '0-1', name: 'company', value: values.company || '' },
      { objectTypeId: '0-1', name: 'service_interest', value: values.service_interest || '' },
      { objectTypeId: '0-1', name: 'message', value: values.message || '' }
    ].concat(contextFields({
      align_offer_id: offerId,
      align_cta_placement: ctaPlacement,
      align_conversion_type: 'contact_form'
    }));
    if (values.align_self_reported_source) fields.push({ objectTypeId: '0-1', name: 'align_self_reported_source', value: values.align_self_reported_source });
    var payload = {
      fields: fields,
      context: { hutk: hubspotCookie(), pageUri: pageUrl(), pageName: document.title },
      legalConsentOptions: { consent: { consentToProcess: true, text: 'I agree to the privacy policy.' } }
    };
    window.fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + PORTAL_ID + '/' + FOOTER_FORM_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      markFormSuccess(FOOTER_FORM_ID, 'custom_footer_form');
      showActaSuccess(form);
    }).catch(function (error) {
      if (button) {
        button.classList.remove('ld');
        button.disabled = false;
      }
      status.textContent = 'We could not send your request. Please try again. If the problem continues, call 888-905-4824.';
      status.setAttribute('data-status', 'error');
      track('form_error', { form_id: FOOTER_FORM_ID, form_name: formName(FOOTER_FORM_ID), error_type: clean(error.message, 100) });
    });
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || (form.id !== 'acta-form' && form.getAttribute('data-align-managed-form') !== 'true')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    submitActaForm(form);
  }, true);

  document.addEventListener('focusin', function (event) {
    var container = closestElement(event.target, '[data-align-conversion-context]');
    if (container) setConversion(contextFromElement(container));
  });

  document.addEventListener('click', function (event) {
    var anchor = closestElement(event.target, 'a[href]');
    if (!anchor || !isGuidePdf(anchor)) return;
    if (event.button && event.button !== 0) return;
    if (isGuideUnlocked()) {
      setConversion({ offer_id: 'buyer_guide_pdf', cta_placement: 'blog_resource_link', conversion_type: 'guide_download' });
      track('resource_downloaded', { resource_type: 'buyer_guide_pdf', offer_id: 'buyer_guide_pdf' });
      return;
    }
    event.preventDefault();
    openGuideModal(anchor.href);
  }, true);

  document.addEventListener('click', function (event) {
    var cta = closestElement(event.target, '[data-align-cta]');
    if (cta) {
      var ctaContext = contextFromElement(cta);
      setConversion(ctaContext);
      track('cta_clicked', {
        offer_id: ctaContext.offer_id || '',
        cta_placement: ctaContext.cta_placement || '',
        conversion_type: ctaContext.conversion_type || '',
        destination: clean(cta.getAttribute('href') || '', 500)
      });
    }
    var anchor = closestElement(event.target, 'a[href]');
    if (anchor && isMeetingLink(anchor)) {
      setConversion({ offer_id: 'meeting', cta_placement: anchor.getAttribute('data-align-cta-placement') || 'site_link', conversion_type: 'meeting_booking' });
      track('meeting_booking_started', { destination_host: new window.URL(anchor.href).hostname, cta_placement: currentConversion.cta_placement });
    }
  });

  function repairSandboxPolicyLinks() {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="242825734-hs-sites-na2-com.sandbox.hs-sites-na2.com"]'), function (anchor) {
      var url;
      try { url = new window.URL(anchor.href, window.location.href); } catch (error) { return; }
      if (url.pathname.indexOf('/disclaimers-policies') === 0) {
        anchor.href = 'https://www.alignhcm.com/disclaimers-policies/';
      } else if (url.pathname.indexOf('/accessibility-policy-and-statement') === 0) {
        anchor.href = 'https://www.alignhcm.com/accessibility-policy-and-statement';
      }
    });
  }

  function runDomEnhancements() {
    observerScheduled = false;
    fillDomFields();
    populateAllFormInstances();
    decorateMeetingLinks();
    repairSandboxPolicyLinks();
    addNextStepPath();
    var privacyLink = document.querySelector('#acta-form .aprv a');
    if (privacyLink) privacyLink.setAttribute('href', '/disclaimers-policies/');
    var managedForm = document.getElementById('acta-form');
    if (managedForm && !managedForm.querySelector('[name="align_self_reported_source"]')) {
      var wrapper = document.createElement('div');
      wrapper.className = 'aff';
      wrapper.innerHTML = '<label for="align-self-reported-source">How did you hear about Align HCM? <span>(optional)</span></label>' +
        '<select id="align-self-reported-source" name="align_self_reported_source"><option value="">Select one</option><option value="Search engine">Google or another search engine</option><option value="LinkedIn">LinkedIn</option><option value="Other social">Another social platform</option><option value="Word of mouth">Colleague or word of mouth</option><option value="Partner or referral">Partner or referral</option><option value="Event or webinar">Event or webinar</option><option value="Existing relationship">Existing relationship</option><option value="Other">Other</option></select>';
      var messageField = managedForm.querySelector('[name="message"]');
      var messageWrapper = closestElement(messageField, '.aff');
      if (messageWrapper && messageWrapper.parentNode) messageWrapper.parentNode.insertBefore(wrapper, messageWrapper);
      else {
        var submitButton = managedForm.querySelector('.asbtn, button[type="submit"]');
        if (submitButton && submitButton.parentNode) submitButton.parentNode.insertBefore(wrapper, submitButton);
        else managedForm.appendChild(wrapper);
      }
    }
  }

  function scheduleDomEnhancements() {
    if (observerScheduled) return;
    observerScheduled = true;
    window.setTimeout(runDomEnhancements, 0);
  }

  if (window.MutationObserver) {
    new window.MutationObserver(scheduleDomEnhancements).observe(document.documentElement, { childList: true, subtree: true });
  }
  runDomEnhancements();
  installEngagementSignals();
  window.setTimeout(runDomEnhancements, 1000);
  window.setTimeout(runDomEnhancements, 3000);

  if (document.querySelector('.error-page[data-error="404"]')) {
    track('page_not_found', {
      requested_path: clean(window.location.pathname, 500),
      referrer: safeReferrer(document.referrer)
    });
  }
})(window, document);
