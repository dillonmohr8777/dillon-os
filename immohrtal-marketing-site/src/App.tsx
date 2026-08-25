import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ClientParticleSequence } from './components/ClientParticleSequence'
import { agentRoles, clients, projects, type Project } from './data'

function ArrowIcon({ direction = 'right' }: { direction?: 'right' | 'left' | 'down' }) {
  const rotate = direction === 'left' ? 180 : direction === 'down' ? 90 : 0
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

function LogoMark() {
  return <img src="/brand/immohrtal-logo.png" alt="" />
}

function Navigation() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-rail">
      <a className="wordmark" href="#top" aria-label="IMMOHRTAL Marketing Solutions home">
        <LogoMark />
        <span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span>
      </a>
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((value) => !value)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="site-nav" className={open ? 'is-open' : ''} aria-label="Primary navigation">
        <a href="#work" onClick={() => setOpen(false)}>Web work</a>
        <a href="#visibility" onClick={() => setOpen(false)}>AEO / GEO</a>
        <a href="#agents" onClick={() => setOpen(false)}>Agents</a>
        <a href="#system" onClick={() => setOpen(false)}>The system</a>
      </nav>
      <a className="rail-cta" href="mailto:dillonmohr8777@gmail.com?subject=IMMOHRTAL%20website%20conversation">Open channel <ArrowIcon /></a>
    </header>
  )
}

function BrowserFrame({ project }: { project: Project }) {
  return (
    <a className="browser-frame" href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} live site`}>
      <span className="browser-bar"><i /><i /><i /><em>{project.url.replace(/^https?:\/\//, '')}</em></span>
      <span className="browser-viewport"><img src={project.image} alt={`${project.name} website preview`} loading="lazy" /></span>
      <span className="browser-open">View live <ArrowIcon /></span>
    </a>
  )
}

function ProjectRail() {
  const railRef = useRef<HTMLDivElement>(null)
  const move = (direction: number) => railRef.current?.scrollBy({ left: direction * Math.min(window.innerWidth * 0.82, 980), behavior: 'smooth' })
  return (
    <section className="work-section" id="work">
      <div className="section-copy" data-reveal>
        <h2>Websites should feel impossible to ignore—and easy to use.</h2>
        <p>The design gets attention. The structure earns trust. The system makes the next action obvious. These are live builds and public concepts, with scope varying by engagement.</p>
        <div className="rail-controls" aria-label="Website project controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous website"><ArrowIcon direction="left" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next website"><ArrowIcon /></button>
        </div>
      </div>
      <div className="project-rail" ref={railRef} tabIndex={0} aria-label="Selected website work">
        {projects.map((project) => (
          <article className="project" key={project.name}>
            <BrowserFrame project={project} />
            <div className="project-copy">
              <p>{project.role}</p>
              <h3>{project.name}</h3>
              <span>{project.summary}</span>
              <ul aria-label={`${project.name} disciplines`}>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function VisibilityProof() {
  return (
    <section className="visibility-section" id="visibility">
      <div className="visibility-thesis" data-reveal>
        <h2>I build the page people choose—and the evidence AI can cite.</h2>
        <p>AEO and GEO are not a magic schema switch. They are the discipline of making a company understandable: clear entities, useful answers, visible expertise, technically sound pages, and proof that can survive outside your own website.</p>
        <a className="text-link" href="mailto:dillonmohr8777@gmail.com?subject=AEO%20and%20GEO%20visibility">Map my visibility gaps <ArrowIcon /></a>
      </div>
      <div className="overview-wall" data-reveal>
        <figure className="overview overview--front">
          <a href="/evidence/align-ai-overview-hr-data-integration.png" target="_blank" rel="noreferrer">
            <img src="/evidence/align-ai-overview-hr-data-integration.png" alt="Google results for HR data integration services showing an AI Overview and an Align HCM result" loading="lazy" />
          </a>
          <figcaption><strong>HR data integration services</strong><span>Captured July 2026. Search results can change.</span></figcaption>
        </figure>
        <figure className="overview overview--back">
          <a href="/evidence/align-ai-overview-data-conversion.png" target="_blank" rel="noreferrer">
            <img src="/evidence/align-ai-overview-data-conversion.png" alt="Google results for data conversion strategy showing an AI Overview and an Align HCM result" loading="lazy" />
          </a>
          <figcaption><strong>Data conversion strategy</strong><span>Captured July 2026. Search results can change.</span></figcaption>
        </figure>
      </div>
      <div className="visibility-chain" aria-label="AEO and GEO operating chain" tabIndex={0}>
        <span>ENTITY</span><i /><span>EVIDENCE</span><i /><span>STRUCTURE</span><i /><span>CITATION</span><i /><span>MEASUREMENT</span>
      </div>
    </section>
  )
}

function SystemWindows() {
  return (
    <section className="window-stage" aria-labelledby="window-heading">
      <div className="window-stage__copy" data-reveal>
        <h2 id="window-heading">The interface moves because the work does.</h2>
        <p>Research becomes a build brief. The build becomes a measured system. Each window below maps to an operating artifact, not decorative dashboard theater.</p>
      </div>
      <div className="window-field" aria-label="Connected website operating artifacts">
        <article className="work-window work-window--audit">
          <header><span>SITE AUDIT</span><em>public source scan</em></header>
          <div className="audit-layout"><strong>Findability</strong><i style={{ '--value': '78%' } as CSSProperties} /><strong>Clarity</strong><i style={{ '--value': '62%' } as CSSProperties} /><strong>Conversion path</strong><i style={{ '--value': '70%' } as CSSProperties} /></div>
          <small>Illustrative interface. Scores populate only from a real audit.</small>
        </article>
        <article className="work-window work-window--entity">
          <header><span>ENTITY MAP</span><em>claim to source</em></header>
          <div className="entity-map" aria-hidden="true"><b>BUSINESS</b><span>services</span><span>people</span><span>proof</span><span>locations</span></div>
          <small>Every important claim keeps a source path.</small>
        </article>
        <article className="work-window work-window--hubspot">
          <header><span>HUBSPOT AGENT</span><em>draft → verify → approve</em></header>
          <code>&gt; resolve portal{`\n`}&gt; inspect current state{`\n`}&gt; prepare bounded change{`\n`}&gt; hold for approval</code>
          <small>Client routing and consequential writes fail closed.</small>
        </article>
      </div>
    </section>
  )
}

function RobotFallback() {
  return (
    <svg className="bot-fallback" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <rect x="6" y="8.5" width="12" height="9.5" rx="2.2" /><circle cx="9.5" cy="13" r="1.1" /><circle cx="14.5" cy="13" r="1.1" />
      <path d="M12 4.5v4M10.8 3.3h2.4M4.5 12H6M18 12h1.5" />
    </svg>
  )
}

function AgentCrew() {
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      if (document.querySelector('script[data-robot-runtime]')) return
      const script = document.createElement('script')
      script.src = '/robot.js'
      script.defer = true
      script.dataset.robotRuntime = 'true'
      document.body.appendChild(script)
    }, { rootMargin: '300px 0px' })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="agent-section" id="agents" ref={sectionRef}>
      <canvas id="crew-stage" aria-hidden="true" />
      <div className="agent-section__copy" data-reveal>
        <h2>These are not mascots. They are the company.</h2>
        <p>Each worker has a bounded job, named inputs, a verification step, and a receipt. Dillon remains the operator and the approval authority.</p>
      </div>
      <div className="agent-roster">
        {agentRoles.map((agent, index) => (
          <article className="agent" key={agent.id}>
            <div className="bot" data-bot={index} data-acc={agent.accent}><RobotFallback /></div>
            <div className="agent-copy">
              <span>{agent.id}</span>
              <h3>{agent.name}</h3>
              <strong>{agent.role}</strong>
              <p>{agent.summary}</p>
              <small>{agent.receipt}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function OperatingSystem() {
  return (
    <section className="system-section" id="system">
      <div className="system-title" data-reveal>
        <h2>One system from first signal to finished site.</h2>
        <p>The daily infrastructure will prepare research, audits, drafts, builds, and follow-up state. Sending, spend, ambiguous routing, credentials, and unapproved publishing stay human-gated.</p>
      </div>
      <ol className="system-flow">
        <li><strong>Discover</strong><span>Find businesses with real website, search, or workflow gaps.</span></li>
        <li><strong>Diagnose</strong><span>Collect current evidence and produce a public-safe teardown.</span></li>
        <li><strong>Design</strong><span>Turn the gap into a specific web, visibility, and integration plan.</span></li>
        <li><strong>Build</strong><span>Ship the site and agents through maker-checker verification.</span></li>
        <li><strong>Operate</strong><span>Measure what is current, prepare the next action, and retain receipts.</span></li>
      </ol>
      <div className="approval-line"><span>AUTOMATED PREPARATION</span><i /><b>HUMAN AUTHORITY</b><i /><span>VERIFIED EXECUTION</span></div>
    </section>
  )
}

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.16 })
    document.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#work">Skip to website work</a>
      <Navigation />
      <main>
        <section className="particle-hero" id="top">
          <h1 className="sr-only">IMMOHRTAL Marketing Solutions builds websites, AEO and GEO visibility systems, and business agents.</h1>
          <ClientParticleSequence brands={clients} />
          <a className="hero-next" href="#work">See the work <ArrowIcon direction="down" /></a>
        </section>
        <section className="positioning-strip" aria-label="IMMOHRTAL focus" tabIndex={0}>
          <span>WEBSITES BUILT TO BE FOUND, CHOSEN, AND USED</span><i />
          <span>AEO / GEO / WEB OPTIMIZATION</span><i />
          <span>REAL AGENTS. HUMAN AUTHORITY.</span>
        </section>
        <ProjectRail />
        <VisibilityProof />
        <SystemWindows />
        <AgentCrew />
        <OperatingSystem />
        <section className="closing-section">
          <LogoMark />
          <h2>Your website should be the smartest worker in the company.</h2>
          <p>Let’s find the gap, build the system, and make the work visible.</p>
          <a className="closing-cta" href="mailto:dillonmohr8777@gmail.com?subject=IMMOHRTAL%20website%20conversation">Start the conversation <ArrowIcon /></a>
        </section>
      </main>
      <footer>
        <a className="wordmark" href="#top"><LogoMark /><span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span></a>
        <p>AI-native web optimization, AEO/GEO, and business agents. Operated by Dillon Mohr.</p>
        <a href="mailto:dillonmohr8777@gmail.com">dillonmohr8777@gmail.com</a>
      </footer>
    </>
  )
}

export default App
