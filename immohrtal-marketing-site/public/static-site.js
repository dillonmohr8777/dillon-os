(() => {
  const toggle = document.querySelector('[data-menu-toggle]')
  const menu = document.querySelector('[data-menu]')

  if (toggle && menu) {
    const rail = toggle.closest('.site-rail')
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
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu()
        toggle.focus()
      }
    })

    document.addEventListener('pointerdown', (event) => {
      if (event.target instanceof Node && !rail?.contains(event.target)) closeMenu()
    })

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1180) closeMenu()
    })
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear())
  })

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const swipeHeadings = [...document.querySelectorAll('[data-swipe-heading]')]

  if (!reducedMotion) {
    swipeHeadings.forEach((heading) => {
      const label = heading.textContent.trim()
      const words = label.split(/\s+/)
      heading.setAttribute('aria-label', label)
      heading.textContent = ''
      words.forEach((word, index) => {
        const span = document.createElement('span')
        span.className = 'swipe-word'
        span.setAttribute('aria-hidden', 'true')
        span.style.setProperty('--word-index', String(index))
        span.textContent = word
        heading.append(span, document.createTextNode(index === words.length - 1 ? '' : ' '))
      })
    })
    document.documentElement.classList.add('motion-ready')
  }

  const revealNodes = [...new Set(document.querySelectorAll('[data-reveal]'))]

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

  if (!reducedMotion) {
    const retiringSections = [...document.querySelectorAll('.content-section')]
    const strip = document.querySelector('.positioning-strip')
    let scrollFrame = 0
    const updateScrollMotion = () => {
      scrollFrame = 0
      const viewportHeight = Math.max(window.innerHeight, 1)
      retiringSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const retire = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height * 0.42, viewportHeight * 0.45)))
        section.style.setProperty('--retire', retire.toFixed(3))
      })
      if (strip && window.innerWidth > 700) {
        const distance = Math.max(document.documentElement.scrollHeight - viewportHeight, 1)
        strip.style.setProperty('--page-shift', Math.min(1, window.scrollY / distance).toFixed(4))
      } else if (strip) {
        strip.style.removeProperty('--page-shift')
      }
    }
    const requestScrollMotion = () => {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(updateScrollMotion)
    }
    updateScrollMotion()
    window.addEventListener('scroll', requestScrollMotion, { passive: true })
    window.addEventListener('resize', requestScrollMotion)
  }

  const particleMarks = [...document.querySelectorAll('[data-particle-footer]')]
  if (particleMarks.length && reducedMotion) {
    particleMarks.forEach((root) => { root.dataset.particleState = 'static' })
  }
  if (particleMarks.length && !reducedMotion) {
    const initializeParticleMark = async (root) => {
      if (root.dataset.particleState) return
      root.dataset.particleState = 'loading'
      const canvas = root.querySelector('canvas')
      const imageSource = root.dataset.logoSrc
      const useFallback = () => {
        root.classList.remove('is-active', 'is-complete')
        root.dataset.particleState = 'fallback'
      }
      if (!(canvas instanceof HTMLCanvasElement) || !imageSource) {
        useFallback()
        return
      }

      try {
        const logo = new Image()
        logo.decoding = 'async'
        logo.src = imageSource
        await logo.decode()

        const width = Math.max(240, Math.round(root.clientWidth))
        const height = Math.max(166, Math.round(root.clientHeight))
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        const context = canvas.getContext('2d')
        if (!context) {
          useFallback()
          return
        }
        context.scale(dpr, dpr)

        const sampler = document.createElement('canvas')
        sampler.width = width
        sampler.height = height
        const sample = sampler.getContext('2d', { willReadFrequently: true })
        if (!sample || !logo.naturalWidth || !logo.naturalHeight) {
          useFallback()
          return
        }
        const scale = Math.min((width * .92) / logo.naturalWidth, (height * .88) / logo.naturalHeight)
        const drawWidth = logo.naturalWidth * scale
        const drawHeight = logo.naturalHeight * scale
        const offsetX = (width - drawWidth) / 2
        const offsetY = (height - drawHeight) / 2
        sample.drawImage(logo, offsetX, offsetY, drawWidth, drawHeight)
        const pixels = sample.getImageData(0, 0, width, height).data
        const targets = []
        for (let y = 0; y < height; y += 3) {
          for (let x = 0; x < width; x += 3) {
            const alpha = pixels[(y * width + x) * 4 + 3]
            if (alpha > 42) targets.push({ x, y })
          }
        }
        const stride = Math.max(1, Math.ceil(targets.length / 1150))
        const particles = targets.filter((_, index) => index % stride === 0).map((target, index) => {
          const angle = (index * 2.399963229728653) % (Math.PI * 2)
          const radius = Math.max(width, height) * (.48 + (index % 11) / 18)
          return {
            tx: target.x,
            ty: target.y,
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
            size: index % 5 === 0 ? 1.35 : .9,
            color: index % 13 === 0 ? '#58edb2' : index % 4 === 0 ? '#18c8ff' : '#f3f7fb',
          }
        })

        root.classList.add('is-active')
        root.dataset.particleState = 'active'
        const start = performance.now()
        const duration = 920
        const draw = (now) => {
          const progress = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - progress, 4)
          context.clearRect(0, 0, width, height)
          particles.forEach((particle) => {
            const x = particle.x + (particle.tx - particle.x) * eased
            const y = particle.y + (particle.ty - particle.y) * eased
            context.beginPath()
            context.fillStyle = particle.color
            context.globalAlpha = .42 + eased * .58
            context.arc(x, y, particle.size, 0, Math.PI * 2)
            context.fill()
          })
          context.globalAlpha = 1
          if (progress < 1) requestAnimationFrame(draw)
          else {
            root.classList.add('is-complete')
            root.dataset.particleState = 'complete'
          }
        }
        requestAnimationFrame(draw)
      } catch { useFallback() }
    }

    if ('IntersectionObserver' in window) {
      const particleObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          initializeParticleMark(entry.target)
          particleObserver.unobserve(entry.target)
        })
      }, { rootMargin: '240px 0px', threshold: .01 })
      particleMarks.forEach((mark) => particleObserver.observe(mark))
    } else {
      particleMarks.forEach(initializeParticleMark)
    }
  }
})()
