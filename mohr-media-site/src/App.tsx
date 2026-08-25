import { lazy, Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { SpineStage } from './components/SpineStage'
import { alignSignals, projects, videos } from './data'
import { SPINE_SECTIONS, type SpineEngine } from './spine/config'

const HeroProofSequence = lazy(() => import('./components/HeroProofSequence').then((module) => ({ default: module.HeroProofSequence })))

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

    const sectionNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-section-pop]'))
    if (!('IntersectionObserver' in window) || reduced) {
      sectionNodes.forEach((node) => node.classList.add('is-section-visible'))
    }
    const sectionObserver = reduced ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-section-visible')
        sectionObserver?.unobserve(entry.target)
      })
    }, { threshold: .16, rootMargin: '0px 0px -10% 0px' })
    sectionNodes.forEach((node) => sectionObserver?.observe(node))

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
      sectionObserver?.disconnect()
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])
}

function Navigation() {
  const [open, setOpen] = useState(false)
  const links = [
    ['Align HCM', '#align'],
    ['Search proof', '#search-proof'],
    ['Live systems', '#work'],
    ['Motion', '#motion'],
    ['Proof vault', '#vault'],
  ]
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return (
    <header className="site-nav">
      <a className="nav-mark" href="#top" aria-label="IMMOHRTAL Marketing Solutions, Dillon Mohr portfolio home">
        <img className="brand-logo--chrome" src="/brand/immohrtal-logo.png" alt="" />
        <span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span>
      </a>
      <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((value) => !value)}>
        <span>{open ? 'Close' : 'Menu'}</span>
        <i /><i />
      </button>
      <nav id="primary-navigation" className={open ? 'is-open' : ''} aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-contact" href="mailto:dillonmohr8777@gmail.com?subject=Align%20HCM%20portfolio">Open channel <ArrowIcon /></a>
      </nav>
    </header>
  )
}

function SpineRail({ engineRef }: { engineRef: { current: SpineEngine | null } }) {
  const [waypoint, setWaypoint] = useState(0)
  const [percent, setPercent] = useState('000.0%')
  useEffect(() => {
    let unsubscribe: undefined | (() => void)
    const timer = window.setTimeout(() => {
      unsubscribe = engineRef.current?.onHud((hud) => {
        setWaypoint(hud.waypoint)
        setPercent(hud.pct)
      })
    }, 80)
    return () => {
      window.clearTimeout(timer)
      unsubscribe?.()
    }
  }, [engineRef])
  return (
    <nav className="spine-rail" aria-label="Page waypoints">
      {SPINE_SECTIONS.map((section, index) => (
        <button
          key={section.id}
          type="button"
          className={index === waypoint ? 'is-active' : ''}
          aria-current={index === waypoint ? 'location' : undefined}
          aria-label={`Go to ${section.label}`}
          onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
        >
          <i />
        </button>
      ))}
      <p aria-hidden="true"><span>WPT {String(waypoint).padStart(2, '0')}</span>{SPINE_SECTIONS[waypoint]?.label}<em>{percent}</em></p>
    </nav>
  )
}

function AlignSignalTicker() {
  const items = useMemo(() => [...alignSignals, ...alignSignals], [])
  return (
    <section className="client-signal" aria-labelledby="client-signal-title">
      <div className="client-signal__meta">
        <p id="client-signal-title">Align HCM // operating range</p>
        <span>Strategy through proof.</span>
      </div>
      <div className="client-ticker">
        <div className="client-ticker__track">
          {items.map((signal, index) => (
            <figure key={`${signal}-${index}`} aria-hidden={index >= alignSignals.length}>
              <span>{signal}</span>
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
    <section className="work-section" id="work" data-section-pop data-chapter="LIVE SYSTEMS">
      <div className="section-heading" data-reveal>
        <p>02 // Align HCM live systems</p>
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
    <section className="motion-section" id="motion" data-section-pop data-chapter="MOTION">
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
        <div className="video-shell" id="video-panel" role="tabpanel" aria-labelledby={`video-tab-${active}`} data-tilt>
          <video key={video.source} controls playsInline preload="metadata" poster={video.poster} aria-describedby="video-summary">
            <source src={video.source} type="video/mp4" />
            Your browser does not support embedded video. <a href={video.source}>Open the MP4 directly.</a>
          </video>
          <span aria-hidden="true">Align HCM // motion study</span>
        </div>
      </div>
    </section>
  )
}

function DocumentVault() {
  const documents = [
    {
      code: 'LIVE',
      title: 'Align HCM live experience',
      note: 'The public site where service architecture, product stories, insights, and conversion paths come together.',
      file: 'https://www.alignhcm.com/',
    },
    {
      code: 'PUB',
      title: 'Align HCM public sector',
      note: 'A focused vertical experience connecting workforce continuity, implementation pressure, and HCM outcomes.',
      file: 'https://align-hcm-public-sector-expanded.netlify.app',
    },
    {
      code: 'CODE',
      title: 'Align HCM public repository',
      note: 'Public-safe source and artifacts showing how the marketing system was structured and shipped.',
      file: 'https://github.com/dillonmohr8777/align-hcm-public-content',
    },
    {
      code: 'READ',
      title: 'Align HCM insights library',
      note: 'Long-form education built around implementation, optimization, support, integrations, and buyer readiness.',
      file: 'https://www.alignhcm.com/blog',
    },
  ]
  return (
    <section className="vault-section" id="vault" data-section-pop data-chapter="PROOF">
      <div className="section-heading section-heading--light" data-reveal>
        <p>04 // Public proof vault</p>
        <h2>Open the<br /><em>receipts.</em></h2>
        <span>Only public-safe Align HCM work appears here. No confidential CRM records, internal reports, or private client material.</span>
      </div>
      <div className="document-grid">
        {documents.map((document) => (
          <a href={document.file} target="_blank" rel="noreferrer" key={document.code} className="document-card" data-reveal data-tilt>
            <span>{document.code}</span>
            <div>
              <p>Public Align HCM proof</p>
              <h3>{document.title}</h3>
              <em>{document.note}</em>
            </div>
            <strong>Open proof <ArrowIcon /></strong>
          </a>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  useExperienceMotion()
  const engineRef = useRef<SpineEngine | null>(null)
  return (
    <div className="site-shell">
      <a className="skip-link" href="#align">Skip to featured work</a>
      <SpineStage engineRef={engineRef} />
      <div className="scroll-progress" aria-hidden="true"><i /></div>
      <Navigation />
      <SpineRail engineRef={engineRef} />

      <main>
        <section className="hero-section" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Dillon Mohr // Align HCM marketing systems</p>
            <h1><span>I built the</span><strong>signal.</strong><span>And the system</span><em>behind Align HCM.</em></h1>
            <p className="hero-intro">Strategy, website architecture, search and AI visibility, thought leadership, customer proof, sales enablement, HubSpot, attribution, and motion, connected into one hands-on marketing operation.</p>
            <div className="hero-actions">
              <a className="button button--primary" href="#align">Enter the work <ArrowIcon direction="down" /></a>
              <a className="button button--glass" href="mailto:dillonmohr8777@gmail.com?subject=Align%20HCM%20portfolio">Open a channel <ArrowIcon /></a>
            </div>
          </div>
          <div className="hero-logo-stage">
            <Suspense fallback={(
              <div className="hero-proof-sequence hero-proof-sequence--reduced hero-proof-sequence--pending" role="img" aria-label="I did this for Align HCM. I can do it for you.">
                <p>I did this for</p>
                <img src="/clients/align-hcm.png" alt="Align HCM" />
              </div>
            )}>
              <HeroProofSequence />
            </Suspense>
            <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
            <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
          </div>
          <div className="hero-status" aria-hidden="true">
            <span>Strategy</span><i /><span>Creative</span><i /><span>Web systems</span><i /><span>Growth operations</span>
          </div>
        </section>

        <AlignSignalTicker />

        <section className="operator-section" data-section-pop data-chapter="STRATEGY">
          <div className="operator-manifesto" data-reveal>
            <p>One flagship body of work.</p>
            <h2>Set the strategy.<br />Execute the system.<br /><em>Prove what moved.</em></h2>
          </div>
          <div className="operator-copy" data-reveal>
            <span>Selected past work for Align HCM.</span>
            <p>I worked across the full marketing path: positioning, writing, website architecture, search, executive and sales content, customer proof, video, event support, HubSpot operations, attribution, and competitive intelligence. This public-safe portfolio reflects my direct contribution and collaborative delivery.</p>
            <a href="https://github.com/dillonmohr8777/align-hcm-public-content" target="_blank" rel="noreferrer">Inspect Align HCM public work <ArrowIcon /></a>
          </div>
        </section>

        <section className="align-section" id="align" data-section-pop data-chapter="ALIGN">
          <div className="align-sticky">
            <div className="align-heading" data-reveal>
              <p>01 // Flagship body of work</p>
              <img src="/clients/align-hcm.png" alt="Align HCM" />
              <h2>One brand.<br /><em>An entire operating surface.</em></h2>
              <p>Strategy, website architecture, search and AI visibility, thought leadership, customer proof, executive content, sales enablement, HubSpot operations, attribution, competitive intelligence, and motion, built as one connected marketing system.</p>
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

          <div className="search-proof" id="search-proof" data-reveal>
            <div className="search-proof__light" aria-hidden="true" />
            <div className="search-proof__intro">
              <p>Google AI Overviews // organic discovery</p>
              <h3>Search became a living proof surface.</h3>
              <span>I connected keyword intelligence, content architecture, technical SEO, buyer-intent writing, and AEO/GEO monitoring into an operating system that could be reviewed, prioritized, and improved.</span>
            </div>
            <div className="search-proof__metrics" aria-label="Verified Align HCM search and content snapshots">
              <article>
                <strong>436</strong>
                <span>Tracked U.S. organic ranking positions<em>Verified Semrush snapshot // Aug 12, 2026</em></span>
              </article>
              <article>
                <strong>6</strong>
                <span>Google AI Overview cited pages<em>Verified Semrush snapshot // Aug 25, 2026</em></span>
              </article>
              <article>
                <strong>85</strong>
                <span>Total AI-search cited pages<em>Verified Semrush snapshot // Aug 25, 2026</em></span>
              </article>
              <article>
                <strong>107</strong>
                <span>Posts in the HubSpot content library<em>Verified portal inventory // Aug 25, 2026</em></span>
              </article>
            </div>
            <p className="search-proof__note">Snapshot evidence, not a causal performance claim. Search and AI-result visibility varies by query, location, account, and time.</p>
          </div>

          <div className="align-proof-grid">
            <article data-reveal data-tilt>
              <span>Marketing strategy // Hands-on execution</span>
              <h3>Set the plan. Then build every moving part.</h3>
              <p>Connected positioning, quarterly priorities, channel plans, production systems, stakeholder feedback, and weekly execution instead of handing strategy off downstream.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Website // Service architecture</span>
              <h3>Turn complex HCM services into a decision path.</h3>
              <p>Reframed implementation, optimization, support, compliance, integrations, and post-launch needs around the questions high-intent buyers actually ask.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Thought leadership // Content engine</span>
              <h3>Build an expert voice at production scale.</h3>
              <p>Produced long-form articles, weekly social systems, executive-ready points of view, and search-led topic clusters grounded in real implementation questions.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Customer proof // Case-study engine</span>
              <h3>Turn delivery stories into sales-ready evidence.</h3>
              <p>Built customer-proof workflows spanning reference recruitment, interview direction, written stories, social carousels, one-pagers, and short-form video assets.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Lifecycle // Sales enablement</span>
              <h3>Carry one idea through every buying moment.</h3>
              <p>Extended core narratives across LinkedIn, email nurture, webinar and event content, landing pages, follow-up assets, and sales one-pagers.</p>
            </article>
            <article data-reveal data-tilt>
              <span>Public sector // Vertical marketing</span>
              <h3>Make regulated operators feel understood.</h3>
              <p>Connected workforce continuity, compliance pressure, platform reality, and implementation outcomes across distinct public-service environments.</p>
            </article>
            <article data-reveal data-tilt>
              <span>SmartCare // Product marketing</span>
              <h3>Give support after launch a product language.</h3>
              <p>Built a content and conversion pillar around continuous HCM support, optimization, platform stewardship, and measurable operating confidence.</p>
            </article>
            <article data-reveal data-tilt>
              <span>HubSpot // Revenue intelligence</span>
              <h3>Connect content, leads, deals, and decisions.</h3>
              <p>Built defensible attribution logic, lead-intelligence dashboards, source QA, competitive monitoring, and executive reporting without overstating what the CRM could prove.</p>
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

        <section className="contact-section" id="contact" data-section-pop data-chapter="OPEN">
          <div className="contact-signal" aria-hidden="true">
            <img className="brand-logo--chrome" src="/brand/immohrtal-logo.png" alt="" />
            <i /><i /><i />
          </div>
          <div className="contact-copy" data-reveal>
            <p>05 // Open channel</p>
            <h2>Built for the<br /><em>head-of-marketing seat.</em></h2>
            <span>If the role needs strategy, writing, customer proof, vertical marketing, systems thinking, and someone willing to execute the work directly, that is the conversation.</span>
            <a className="contact-email" href="mailto:dillonmohr8777@gmail.com?subject=Align%20HCM%20portfolio">dillonmohr8777@gmail.com <ArrowIcon /></a>
          </div>
          <footer>
            <p>Dillon Mohr // Pittsburgh, Pennsylvania</p>
            <nav aria-label="Footer links">
              <a href="https://www.alignhcm.com/" target="_blank" rel="noreferrer">Align HCM</a>
              <a href="https://github.com/dillonmohr8777/align-hcm-public-content" target="_blank" rel="noreferrer">Public work</a>
              <a href="#top">Back to signal</a>
            </nav>
            <span>© 2026 Dillon Mohr // Selected Align HCM work</span>
          </footer>
        </section>
      </main>
    </div>
  )
}
