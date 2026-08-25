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
})()
