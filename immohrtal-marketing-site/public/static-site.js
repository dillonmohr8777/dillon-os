(() => {
  const toggle = document.querySelector('[data-menu-toggle]')
  const menu = document.querySelector('[data-menu]')

  if (toggle && menu) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false')
      menu.classList.remove('is-open')
      document.body.classList.remove('menu-open')
    }

    toggle.addEventListener('click', () => {
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true'
      toggle.setAttribute('aria-expanded', String(willOpen))
      menu.classList.toggle('is-open', willOpen)
      document.body.classList.toggle('menu-open', willOpen)
    })

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu()
        toggle.focus()
      }
    })

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) closeMenu()
    })
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear())
  })

  const revealNodes = [...document.querySelectorAll('[data-reveal]')]
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (revealNodes.length && !reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

    requestAnimationFrame(() => revealNodes.forEach((node) => observer.observe(node)))
  }
})()
