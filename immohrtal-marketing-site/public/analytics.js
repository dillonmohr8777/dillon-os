(() => {
  const isProduction = window.location.hostname === 'www.immohrtalmarketing.com'
  const measurementId = 'G-25X07BBG4R'
  const schemaVersion = 'v1'
  const consentKey = 'immohrtal_analytics_consent'
  let storedConsent = null

  try {
    storedConsent = window.localStorage.getItem(consentKey)
  } catch {
    // Storage can be unavailable in hardened browser modes. The denied default remains active.
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: storedConsent === 'granted' ? 'granted' : 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  })
  window.gtag('set', 'ads_data_redaction', true)
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: true,
  })

  if (isProduction) {
    const loader = document.createElement('script')
    loader.async = true
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.append(loader)
  }

  const track = (name, parameters = {}) => window.gtag('event', name, {
    ...parameters,
    schema_version: schemaVersion,
  })

  const saveConsent = (value) => {
    storedConsent = value
    try {
      window.localStorage.setItem(consentKey, value)
    } catch {
      // The current page can still honor the choice even when storage is unavailable.
    }
    window.gtag('consent', 'update', { analytics_storage: value })
  }

  const renderConsentControl = () => {
    if (document.querySelector('[data-analytics-consent]')) return

    const control = document.createElement('section')
    control.className = 'analytics-consent'
    control.dataset.analyticsConsent = storedConsent ? 'closed' : 'open'
    control.setAttribute('aria-label', 'Analytics choices')
    control.innerHTML = `
      <button class="analytics-consent__manage" type="button" aria-expanded="${storedConsent ? 'false' : 'true'}">Analytics choices</button>
      <div class="analytics-consent__panel" ${storedConsent ? 'hidden' : ''}>
        <div>
          <strong>Help improve this site.</strong>
          <p>Allow privacy-conscious Google Analytics to measure visits and useful actions. Advertising signals, personalization, and personal form data stay off.</p>
        </div>
        <div class="analytics-consent__actions">
          <button type="button" data-consent-choice="granted">Allow analytics</button>
          <button type="button" data-consent-choice="denied">Continue without</button>
        </div>
      </div>`

    const manage = control.querySelector('.analytics-consent__manage')
    const panel = control.querySelector('.analytics-consent__panel')
    const setPanelOpen = (open) => {
      panel.hidden = !open
      manage.setAttribute('aria-expanded', String(open))
      control.dataset.analyticsConsent = open ? 'open' : 'closed'
      if (open) control.querySelector('[data-consent-choice="granted"]')?.focus()
    }

    manage.addEventListener('click', () => setPanelOpen(panel.hidden))
    control.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-consent-choice]')?.dataset.consentChoice
      if (!choice) return
      saveConsent(choice)
      setPanelOpen(false)
    })
    document.body.append(control)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderConsentControl, { once: true })
  else renderConsentControl()

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]')
    if (!link) return
    const href = link.getAttribute('href') || ''
    const linkText = (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)

    if (/^mailto:/i.test(href)) {
      track('email_clicked', { link_text: linkText, source: window.location.pathname })
      return
    }

    try {
      const target = new URL(link.href, window.location.href)
      if (target.hostname === 'calendar.app.google') {
        track('booking_started', { link_text: linkText, source: window.location.pathname })
      }
    } catch {
      // Ignore malformed links. The site QA reports broken internal URLs separately.
    }
  })

  if (/^\/insights\/[^/]+\/$/.test(window.location.pathname)) {
    const startedAt = Date.now()
    let reachedHalf = false
    let sent = false

    const maybeTrackEngagement = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      reachedHalf = reachedHalf || window.scrollY / scrollable >= 0.5
      if (!sent && reachedHalf && Date.now() - startedAt >= 30000) {
        sent = true
        track('article_engaged', {
          content_group: 'insights',
          content_name: document.querySelector('h1')?.textContent?.trim().slice(0, 100) || document.title.slice(0, 100),
          engagement_threshold: '30s_50pct',
        })
        window.removeEventListener('scroll', maybeTrackEngagement)
      }
    }

    window.addEventListener('scroll', maybeTrackEngagement, { passive: true })
    window.setInterval(maybeTrackEngagement, 5000)
  }
})()
