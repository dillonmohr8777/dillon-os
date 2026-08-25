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

function LogoMark({ className = '' }: { className?: string }) {
  return <img className={`brand-logo brand-logo--white${className ? ` ${className}` : ''}`} src="/brand/immohrtal-logo.png" alt="" />
}

function Navigation() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-rail">
      <a className="wordmark" href="/" aria-label="IMMOHRTAL Marketing Solutions home">
        <LogoMark />
        <span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span>
      </a>
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((value) => !value)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="site-nav" className={open ? 'is-open' : ''} aria-label="Primary navigation">
        <a href="/work/" onClick={() => setOpen(false)}>Work</a>
        <a href="/web-design-optimization/" onClick={() => setOpen(false)}>Better site</a>
        <a href="/aeo-geo/" onClick={() => setOpen(false)}>Get found</a>
        <a href="/business-agents/" onClick={() => setOpen(false)}>AI workers</a>
        <a href="/insights/" onClick={() => setOpen(false)}>Guides</a>
      </nav>
      <a className="rail-cta" href="/contact/">Let’s talk <ArrowIcon /></a>
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
        <h2>Websites should feel impossible to ignore and easy to use.</h2>
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
        <h2>When customers ask Google or AI who can help, your business should make sense.</h2>
        <p>I make your services easier to find, understand, and trust with clear pages, useful answers, real proof, and a website search tools can read. The technical names are AEO and GEO. The business goal is simple: show up with the right answer when a buyer is looking.</p>
        <a className="text-link" href="/contact/">Help people find my business <ArrowIcon /></a>
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
      <div className="visibility-chain" aria-label="How IMMOHRTAL helps a business get found" tabIndex={0}>
        <span>CLEAR BUSINESS</span><i /><span>USEFUL ANSWERS</span><i /><span>REAL PROOF</span><i /><span>EASY TO FIND</span><i /><span>MEASURED</span>
      </div>
    </section>
  )
}

function SystemWindows() {
  return (
    <section className="window-stage" aria-labelledby="window-heading">
      <div className="window-stage__copy" data-reveal>
        <h2 id="window-heading">You can see the work from the first check to launch.</h2>
        <p>Every window below represents something useful: what is wrong, what needs to change, what was built, and what still needs approval.</p>
      </div>
      <div className="window-field" aria-label="Connected website operating artifacts">
        <article className="work-window work-window--audit">
          <header><span>WEBSITE CHECK</span><em>live page review</em></header>
          <div className="audit-layout"><strong>Findability</strong><i style={{ '--value': '78%' } as CSSProperties} /><strong>Clarity</strong><i style={{ '--value': '62%' } as CSSProperties} /><strong>Conversion path</strong><i style={{ '--value': '70%' } as CSSProperties} /></div>
          <small>Illustrative interface. Scores populate only from a real audit.</small>
        </article>
        <article className="work-window work-window--entity">
          <header><span>BUSINESS MAP</span><em>fact to source</em></header>
          <div className="entity-map" aria-hidden="true"><b>BUSINESS</b><span>services</span><span>people</span><span>proof</span><span>locations</span></div>
          <small>Every important fact stays connected to its proof.</small>
        </article>
        <article className="work-window work-window--hubspot">
          <header><span>AI WORKER</span><em>prepare → check → approve</em></header>
          <code>&gt; choose the right account{`\n`}&gt; check what is there now{`\n`}&gt; prepare the change{`\n`}&gt; stop for approval</code>
          <small>Nothing important gets sent or changed without the right approval.</small>
        </article>
      </div>
    </section>
  )
}

function RobotFallback({ index, name }: { index: number; name: string }) {
  const common = {
    className: 'bot-fallback',
    viewBox: '0 0 180 210',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    role: 'img',
    'aria-label': `${name} robot illustration`,
  }

  if (index === 0) return (
    <svg {...common}>
      <path d="M55 67 39 40M125 67l16-27M34 35l11 8M146 35l-11 8" />
      <path d="M44 69h92v48H44zM56 117h68v66H56z" />
      <path className="bot-fallback__glow" d="M55 84h70M74 143h32" />
      <path d="M56 128 32 157M124 128l24 29M69 183v18M111 183v18" />
    </svg>
  )
  if (index === 1) return (
    <svg {...common}>
      <ellipse cx="90" cy="62" rx="60" ry="22" />
      <path d="M55 54h70v49H55zM49 103h82v78H49z" />
      <path className="bot-fallback__glow" d="M69 75h42M73 132h34" />
      <path d="M49 119 25 157M131 119l24 38M68 181v20M112 181v20" />
    </svg>
  )
  if (index === 2) return (
    <svg {...common}>
      <path d="M48 62h84v47H48zM36 109h108v72H36z" />
      <path className="bot-fallback__glow" d="M62 79h56M70 139h40" />
      <path d="m36 119-26 29 18 18 23-33M144 119l14 25M157 91v76M143 91h28M58 181v20M122 181v20" />
    </svg>
  )
  if (index === 3) return (
    <svg {...common}>
      <path d="M61 58h58v45H61zM54 103h72v78H54zM54 119 27 154M126 119l18-48M144 71l15-20" />
      <path d="m54 109-26-25 7 31-22 12M126 109l26-25-7 31 22 12" />
      <path className="bot-fallback__glow" d="M70 76h40M73 137h34M151 41h14M155 29h10" />
      <path d="M72 181v20M108 181v20" />
    </svg>
  )
  return (
    <svg {...common}>
      <path d="M51 62h78v48H51zM48 110h84v71H48z" />
      <circle cx="108" cy="82" r="17" />
      <path className="bot-fallback__glow" d="M101 82h14M68 82h20M71 140h38" />
      <path d="M48 120 18 139v34l30 22 30-22v-34zM28 158l11 10 20-24M132 120l25 35M70 181v20M110 181v20" />
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
        <h2>Meet the crew behind the work.</h2>
        <p>They research, plan, build, connect, and check. Each AI worker has a clear job, leaves evidence behind, and stops when Dillon’s approval is required.</p>
      </div>
      <div className="agent-roster">
        {agentRoles.map((agent, index) => (
          <article className="agent" key={agent.id}>
            <div className="bot" data-bot={index} data-acc={agent.accent}><RobotFallback index={index} name={agent.name} /></div>
            <div className="agent-copy">
              <span>{agent.id}</span>
              <h3>{agent.name}</h3>
              <strong>{agent.role}</strong>
              <p className="agent-temperament"><b>{agent.temperament}</b><span>{agent.signature}</span></p>
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
        <h2>From a website problem to a finished fix.</h2>
        <p>The system can find opportunities, check websites, prepare plans, build approved work, and organize the next step. Dillon keeps control over anything that gets sent, published, purchased, or changed.</p>
      </div>
      <ol className="system-flow">
        <li><strong>Find</strong><span>Spot businesses with a website or workflow that is holding them back.</span></li>
        <li><strong>Check</strong><span>Review the live site and show exactly where the problem is.</span></li>
        <li><strong>Plan</strong><span>Turn the findings into a focused website and visibility plan.</span></li>
        <li><strong>Build</strong><span>Create the approved site and test it before launch.</span></li>
        <li><strong>Improve</strong><span>Watch what changes, keep what works, and prepare the next useful step.</span></li>
      </ol>
      <div className="approval-line"><span>AI PREPARES THE WORK</span><i /><b>DILLON APPROVES</b><i /><span>THE RESULT IS CHECKED</span></div>
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
          <h1 className="sr-only">IMMOHRTAL builds memorable websites, helps businesses get found in Google and AI answers, and creates useful AI workers.</h1>
          <ClientParticleSequence brands={clients} />
          <a className="hero-next" href="#work">See the work <ArrowIcon direction="down" /></a>
        </section>
        <section className="positioning-strip" aria-label="IMMOHRTAL focus" tabIndex={0}>
          <span>BETTER WEBSITES. EASIER TO FIND. BUILT TO WORK.</span><i />
          <span>GOOGLE, AI ANSWERS, AND THE PEOPLE SEARCHING</span><i />
          <span>AI WORKERS. HUMAN CONTROL.</span>
        </section>
        <ProjectRail />
        <VisibilityProof />
        <SystemWindows />
        <AgentCrew />
        <OperatingSystem />
        <section className="closing-section">
          <LogoMark className="closing-logo" />
          <h2>Your website should make it easier for the right customer to say yes.</h2>
          <p>Show me what feels broken. I’ll help you find the right first move.</p>
          <a className="closing-cta" href="/contact/">Show me what to fix <ArrowIcon /></a>
        </section>
      </main>
      <footer>
        <a className="wordmark footer-wordmark" href="/"><LogoMark /><span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span></a>
        <p>Websites that stand out, get found, and hand less busywork to your team. Built by Dillon Mohr.</p>
        <a href="/contact/">Fix my website</a>
      </footer>
    </>
  )
}

export default App
