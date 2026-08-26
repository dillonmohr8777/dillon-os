(() => {
  if (window.location.hostname !== 'www.immohrtalmarketing.com') return

  const measurementId = 'G-25X07BBG4R'
  const schemaVersion = 'v1'

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
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

  const loader = document.createElement('script')
  loader.async = true
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.append(loader)

  const track = (name, parameters = {}) => window.gtag('event', name, {
    ...parameters,
    schema_version: schemaVersion,
  })

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
