import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AmbientParticleSpine, ParticleLogo, ProspectSequence } from './components/ParticleLogo'
import { clients, projects, videos } from './data'

function ArrowIcon({ direction = 'up' }: { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const rotation = direction === 'down' ? 90 : direction === 'left' ? 225 : direction === 'right' ? 45 : 0
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function useExperienceMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onScroll = () => {
      const max = root.scrollHeight - window.innerHeight
      root.style.setProperty('--scroll-progress', String(max > 0 ? window.scrollY / max : 0))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!('IntersectionObserver' in window) || reduced) {
      reveals.forEach((node) => node.classList.add('is-visible'))
    }
    const observer = reduced ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer?.unobserve(entry.target)
      })
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' })
    reveals.forEach((node) => observer?.observe(node))

    const tiltNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'))
    const fine = window.matchMedia('(pointer:fine)').matches && !reduced
    const cleanups: Array<() => void> = []
    if (fine) {
      tiltNodes.forEach((node) => {
        const move = (event: PointerEvent) => {
          const rect = node.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width - .5
          const y = (event.clientY - rect.top) / rect.height - .5
          node.style.setProperty('--rx', `${-y * 6}deg`)
          node.style.setProperty('--ry', `${x * 8}deg`)
          node.style.setProperty('--gx', `${(x + .5) * 100}%`)
          node.style.setProperty('--gy', `${(y + .5) * 100}%`)
        }
        const leave = () => {
          node.style.setProperty('--rx', '0deg')
          node.style.setProperty('--ry', '0deg')
        }
        node.addEventListener('pointermove', move)
        node.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          node.removeEventListener('pointermove', move)
          node.removeEventListener('pointerleave', leave)
        })
      })
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])
}

function Navigation() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const links = [
    { label: 'Align HCM', href: '#align' },
    { label: 'Live work', href: '#work' },
    { label: 'Motion', href: '#motion' },
    { label: 'Documents', href: '#vault' },
    { label: 'Contact', href: '#contact' },
  ]
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('pointerdown', closeOutside)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('pointerdown', closeOutside)
    }
  }, [open])
  return (
    <header className={`site-header${open ? ' site-header--open' : ''}`} ref={headerRef}>
      <a className="brand-lockup" href="#top" aria-label="Immortal Marketing Solutions home">
        <span className="brand-lockup__vertical" aria-hidden="true">DILLON</span>
        <img src="/brand/immohrtal-logo.png" alt="" />
        <span className="brand-lockup__type"><strong>IMMORTAL</strong><small>Marketing Solutions</small></span>
      </a>
      <button ref={toggleRef} className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" /></svg>
        )}
      </button>
      <nav id="primary-navigation" className={open ? 'is-open' : ''} aria-label="Primary navigation">
        {links.map(({ label, href }) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <a className="header-cta" href="mailto:hello@themohrmedia.com?subject=Portfolio%20inquiry">Open channel <ArrowIcon /></a>
    </header>
  )
}

function ClientTicker() {
  const items = useMemo(() => [...clients, ...clients], [])
  return (
    <section className="client-signal" aria-labelledby="client-signal-title">
      <div className="client-signal__meta">
        <p id="client-signal-title">Selected client and partner work</p>
        <span>Scope varied by engagement.</span>
      </div>
      <div className="client-ticker">
        <div className="client-ticker__track">
          {items.map(([name, image], index) => (
            <figure key={`${name}-${index}`} aria-hidden={index >= clients.length}>
              <img src={image} alt={index < clients.length ? name : ''} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrowserFrame({ image, name, url, featured = false }: { image: string; name: string; url: string; featured?: boolean }) {
  return (
    <a className={`browser-frame${featured ? ' browser-frame--featured' : ''}`} href={url} target="_blank" rel="noreferrer" data-tilt aria-label={`Open ${name} live site in a new tab`}>
      <span className="browser-frame__bar" aria-hidden="true"><i /><i /><i /><em>{new URL(url).hostname}</em></span>
      <img src={image} alt={`${name} website preview`} loading="lazy" />
      <span className="browser-frame__open">Live site <ArrowIcon /></span>
    </a>
  )
}

function ProjectRail() {
  const rail = useRef<HTMLDivElement>(null)
  const move = (direction: number) => rail.current?.scrollBy({ left: direction * Math.min(window.innerWidth * .78, 980), behavior: 'smooth' })
  return (
    <section className="work-section" id="work">
      <div className="section-heading" data-reveal>
        <p>02 // Selected web systems</p>
        <h2>Built to be<br /><em>opened.</em></h2>
        <div className="rail-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous projects"><ArrowIcon direction="left" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next projects"><ArrowIcon direction="right" /></button>
        </div>
      </div>
      <div className="project-rail" ref={rail}>
        {projects.map((project, index) => (
          <article className="project-card" key={project.name} data-reveal>
            <BrowserFrame image={project.image} name={project.name} url={project.url} featured={project.featured} />
            <div className="project-card__copy">
              <span>{String(index + 1).padStart(2, '0')} // {project.role}</span>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
              <ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function VideoTheater() {
  const [active, setActive] = useState(0)
  const video = videos[active]
  const changeTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % videos.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + videos.length) % videos.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = videos.length - 1
    else return
    event.preventDefault()
    setActive(next)
    window.requestAnimationFrame(() => document.getElementById(`video-tab-${next}`)?.focus())
  }
  return (
    <section className="motion-section" id="motion">
      <div className="motion-stage" data-reveal>
        <div className="motion-stage__copy">
          <p>03 // Edited motion</p>
          <h2>Make the idea<br /><em>move.</em></h2>
          <span>{video.eyebrow}</span>
          <h3>{video.title}</h3>
          <p id="video-summary">{video.summary}</p>
          <div className="motion-tabs" role="tablist" aria-label="Select a video">
            {videos.map((item, index) => (
              <button
                id={`video-tab-${index}`}
                key={item.title}
                type="button"
                role="tab"
                aria-controls="video-panel"
                aria-selected={active === index}
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => changeTab(event, index)}
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        <div className={`video-shell video-shell--${video.format}`} id="video-panel" role="tabpanel" aria-labelledby={`video-tab-${active}`} data-tilt>
          <video key={video.source} controls playsInline preload="metadata" poster={video.poster} aria-describedby="video-summary">
            <source src={video.source} type="video/mp4" />
            Your browser does not support embedded video. <a href={video.source}>Open the MP4 directly.</a>
          </video>
        </div>
      </div>
    </section>
  )
}

function DocumentVault() {
  const documents = [
    {
      code: 'ATS',
      title: 'Dillon Mohr: ATS Résumé',
      note: 'Selectable, searchable, and structured for recruiting systems.',
      file: '/downloads/Dillon-Mohr-ATS-Resume.pdf',
    },
    {
      code: 'VIS',
      title: 'Dillon Mohr: Visual Résumé',
      note: 'The designed edition for hiring managers, partners, and collaborators.',
      file: '/downloads/Dillon-Mohr-Visual-Resume.pdf',
    },
  ]
  return (
    <section className="vault-section" id="vault">
      <div className="section-heading section-heading--light" data-reveal>
        <p>04 // Document vault</p>
        <h2>Take the<br /><em>receipts.</em></h2>
        <span>Approved public documents only. Additional case-study PDFs can drop into this system without changing the experience.</span>
      </div>
      <div className="document-grid">
        {documents.map((document) => (
          <a href={document.file} download key={document.code} className="document-card" data-reveal data-tilt>
            <span>{document.code}</span>
            <div>
              <p>Portable document // PDF</p>
              <h3>{document.title}</h3>
              <em>{document.note}</em>
            </div>
            <strong>Download <ArrowIcon direction="down" /></strong>
          </a>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  useExperienceMotion()
  return (
    <div className="site-shell">
      <a className="skip-link" href="#align">Skip to featured work</a>
      <AmbientParticleSpine />
      <div className="scroll-progress" aria-hidden="true"><i /></div>
      <Navigation />

      <main>
        <section className="prospect-sequence" id="top" aria-label="Align HCM proof transformed into an HRchitect possibility">
          <p className="prospect-sequence__eyebrow">Dillon Mohr // HCM growth systems</p>
          <ProspectSequence />
          <a className="prospect-sequence__continue" href="#portfolio">See the system <ArrowIcon direction="down" /></a>
          <div className="hero-status" aria-hidden="true">
            <span>Build the signal</span><i /><span>Show the work</span><i /><span>Prove the system</span><i /><span>Make it immortal</span><i />
          </div>
        </section>

        <section className="hero-section" id="portfolio">
          <div className="hero-copy">
            <p className="eyebrow">Dillon Mohr // marketing systems operator</p>
            <h1><span>I build the signal.</span><span>I build the system.</span></h1>
            <p className="hero-intro">Positioning, web, content, motion, paid media, CRM, analytics, and AI assisted production, connected into work people can see, use, and act on.</p>
            <div className="hero-actions">
              <a className="button button--primary" href="#align">Enter the work <ArrowIcon direction="down" /></a>
              <a className="button button--glass" href="mailto:hello@themohrmedia.com?subject=Portfolio%20inquiry">Open a channel <ArrowIcon /></a>
            </div>
          </div>
          <div className="hero-logo-stage">
            <ParticleLogo />
          </div>
        </section>

        <ClientTicker />

        <section className="operator-section">
          <div className="operator-manifesto" data-reveal>
            <p>One operator.</p>
            <h2>Strategy that can ship.<br />Design that can prove it.<br /><em>Systems that keep moving.</em></h2>
          </div>
          <div className="operator-copy" data-reveal>
            <span>Not a stack of disconnected services.</span>
            <p>I work across the entire path, from what a brand needs to say, to the page that says it, the campaign that finds the right person, the system that captures the response, and the reporting that tells us what happened.</p>
            <a href="https://github.com/dillonmohr8777" target="_blank" rel="noreferrer">Inspect public GitHub work <ArrowIcon /></a>
          </div>
        </section>

        <section className="align-section" id="align">
          <div className="align-sticky">
            <div className="align-heading" data-reveal>
              <p>01 // Flagship body of work</p>
              <img src="/clients/align-hcm.png" alt="Align HCM" />
              <h2>One brand.<br /><em>An entire operating surface.</em></h2>
              <p>Strategy, repositioning, service architecture, public sector experiences, SmartCare product storytelling, SEO, paid media, executive content, sales enablement, and motion, built as a connected body of work.</p>
              <div className="align-links">
                <a className="button button--dark" href="https://www.alignhcm.com/" target="_blank" rel="noreferrer">Live Align HCM <ArrowIcon /></a>
                <a className="button button--line" href="https://github.com/dillonmohr8777/align-hcm-public-content" target="_blank" rel="noreferrer">Public repository <ArrowIcon /></a>
              </div>
            </div>
            <div className="align-browser" data-reveal>
              <BrowserFrame image="/projects/align-live.jpg" name="Align HCM" url="https://www.alignhcm.com/" featured />
              <span className="align-browser__badge">Live experience</span>
            </div>
          </div>

          <div className="align-proof-grid">
            <article data-reveal data-tilt>
              <span>Positioning // Architecture</span>
              <h3>Turn complex HCM services into a decision path.</h3>
              <p>Reframed the live site around high-intent implementation, optimization, support, compliance, integration, and post-launch needs.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Public sector // Experience</span>
              <h3>Make each mission feel understood.</h3>
              <p>Designed an industry-solutions system connecting operational pressure, platform reality, and implementation outcomes across public-service environments.</p>
            </article>
            <article data-reveal data-tilt>
              <span>SmartCare // Product story</span>
              <h3>Give support after launch a product language.</h3>
              <p>Built a content and product-marketing pillar around continuous HCM support, platform stewardship, and measurable operating confidence.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Campaign system // Motion</span>
              <h3>Carry the same idea into every channel.</h3>
              <p>Directed and produced cross-channel work spanning search, LinkedIn, email, thought leadership, one-pagers, case studies, and HTML motion.</p>
            </article>
          </div>

          <div className="industry-wall" data-reveal>
            <div>
              <p>Industry solutions // visual system</p>
              <h3>Twenty-four frames. One recognizable language.</h3>
              <span>Animated and static story cards translated diverse public-sector missions into a coherent visual system.</span>
            </div>
            <img src="/projects/align-industry-system.webp" alt="Contact sheet showing Align HCM public-sector industry solution graphics" loading="lazy" />
          </div>
        </section>

        <ProjectRail />
        <VideoTheater />
        <DocumentVault />

        <section className="contact-section" id="contact">
          <div className="contact-signal" aria-hidden="true">
            <img src="/brand/immohrtal-logo.png" alt="" />
            <i /><i /><i />
          </div>
          <div className="contact-copy" data-reveal>
            <p>05 // Open channel</p>
            <h2>Bring me the<br /><em>hard one.</em></h2>
            <span>If the work needs strategy, taste, systems thinking, and someone willing to build it, that is the conversation.</span>
            <a className="contact-email" href="mailto:hello@themohrmedia.com?subject=Let%27s%20build%20something">hello@themohrmedia.com <ArrowIcon /></a>
          </div>
          <footer>
            <p>Dillon Mohr // Pittsburgh, Pennsylvania</p>
            <nav aria-label="Footer links">
              <a href="https://github.com/dillonmohr8777" target="_blank" rel="noreferrer">GitHub</a>
              <a href="/downloads/Dillon-Mohr-ATS-Resume.pdf" download>Résumé</a>
              <a href="#top">Back to signal</a>
            </nav>
            <span>© 2026 Immortal Marketing Solutions</span>
          </footer>
        </section>
      </main>
    </div>
  )
}
