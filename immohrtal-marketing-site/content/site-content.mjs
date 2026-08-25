export const site = {
  origin: 'https://themohrmedia.com',
  name: 'IMMOHRTAL Marketing Solutions',
  shortName: 'IMMOHRTAL',
  email: 'dillonmohr8777@gmail.com',
  logo: '/brand/immohrtal-logo.png',
  portrait: '/people/dillon-mohr.jpg',
  published: '2026-08-24',
  modified: '2026-08-24',
}

export const navigation = [
  { label: 'Work', href: '/work/' },
  { label: 'Better website', href: '/web-design-optimization/' },
  { label: 'Get found', href: '/aeo-geo/' },
  { label: 'AI workers', href: '/business-agents/' },
  { label: 'Guides', href: '/insights/' },
]

export const projects = [
  {
    name: 'Align HCM: Public Sector',
    role: 'Strategy, UX, design, and build',
    description: 'A focused HCM experience that organizes implementation, compliance, support, and platform optimization into a public sector decision path.',
    image: '/projects/align-public-sector.jpg',
    url: 'https://align-hcm-public-sector-expanded.netlify.app',
    tags: ['HCM', 'B2B', 'Interactive'],
  },
  {
    name: 'Momentum 360',
    role: 'Creative direction and web concept',
    description: 'A darker, spatially driven marketing experience designed to make virtual tour work feel tangible before the visitor enters a property.',
    image: '/projects/momentum-360.png',
    url: 'https://momentum-360-redesign-dillo-20260520.netlify.app',
    tags: ['Spatial media', 'Web', '3D'],
  },
  {
    name: 'AMI Commercial Cleaning',
    role: 'UX, design, and responsive build',
    description: 'A commercial services homepage with clear service structure, an interactive coverage story, a proof hierarchy, and a direct contact path.',
    image: '/projects/ami.jpg',
    url: 'https://www.ami-cleaning.com',
    tags: ['Local services', 'Conversion', 'Web'],
  },
  {
    name: 'Shadow Heating and Cooling',
    role: 'Growth, content, and web operations',
    description: 'A live local service brand supported across its website, Google Business Profile, content, and paid media operations.',
    image: '/projects/shadow.jpg',
    url: 'https://shadow-heating.com',
    tags: ['Growth', 'Local SEO', 'Web'],
  },
  {
    name: 'Cindy May',
    role: 'Concept, art direction, and build',
    description: 'A warm editorial commerce concept that turns a personal brand into a tactile, story led digital storefront.',
    image: '/projects/cindy-may.jpg',
    url: 'https://cindy-may-warm-kitchen-homepage.netlify.app',
    tags: ['Editorial', 'Commerce', 'Brand'],
  },
  {
    name: 'Overhill Flowers',
    role: 'Concept, UX, and build',
    description: 'A Philadelphia floral experience shaped around atmosphere, occasion, and a simple path from discovery to inquiry.',
    image: '/projects/overhill.jpg',
    url: 'https://overhill-flowers-philly-20260711.netlify.app',
    tags: ['Retail', 'Art direction', 'Web'],
  },
  {
    name: 'Graveley Roofing',
    role: 'Concept, UX, and build',
    description: 'A service site concept that balances homeowner clarity with spatial layouts, visible proof, and direct conversion paths.',
    image: '/projects/graveley.jpg',
    url: 'https://graveley-roofing-concept-20260709.netlify.app',
    tags: ['Home services', 'Conversion', 'Web'],
  },
]

export const corePages = [
  {
    path: '/about/',
    navSection: 'about',
    title: 'About Dillon Mohr and IMMOHRTAL Marketing Solutions',
    description: 'Meet Dillon Mohr and learn how IMMOHRTAL builds memorable websites, helps businesses get found, and creates useful AI workers.',
    eyebrow: 'Built by Dillon Mohr',
    h1: 'One person accountable for the website and the work behind it.',
    lede: 'Dillon designs the website, improves how people find it, and connects it to the tools that keep the business moving. You always know who is responsible and why a change is being made.',
    actions: [
      { label: 'See the work', href: '/work/' },
      { label: 'Tell me what is not working', href: '/contact/', secondary: true },
    ],
    schema: 'profile',
    sections: [
      {
        eyebrow: 'The person behind the system',
        title: 'A hands on studio, not a mystery box',
        tone: 'paper',
        html: `<div class="portrait-layout">
          <img class="portrait" src="${site.portrait}" width="700" height="700" alt="Portrait of Dillon Mohr, founder of IMMOHRTAL Marketing Solutions" loading="eager">
          <div>
            <p>Dillon designs and builds websites, writes the pages people need, and connects the finished experience to search, HubSpot, and useful AI workers. The goal is not to add an AI label to ordinary agency work. The goal is to make the business easier to understand, trust, and contact.</p>
            <p>The process starts with what a customer actually sees: what the business offers, why it is credible, what feels confusing, and what happens after someone reaches out. Design, content, search visibility, measurement, and follow-up are treated as one connected experience.</p>
            <div class="callout"><strong>What accountability means here</strong>Every recommendation points back to a real page, a source, a browser test, or a clearly labeled idea to test. No mystery numbers. No made-up proof.</div>
          </div>
        </div>`,
      },
      {
        eyebrow: 'The operating thesis',
        title: 'A website is the first impression, the explanation, and the handoff',
        html: `<p>A polished homepage can earn attention, but attention alone does not make a site perform. The information needs a clear hierarchy. Key pages need crawlable HTML. Claims need support. Structured data needs to match what people can actually see. Forms and analytics need to deliver reliable context to the right place.</p>
        <p>That is why IMMOHRTAL centers its work around three connected layers:</p>
        <ul class="fact-grid">
          <li class="fact-card"><h3>First impression</h3><p>Art direction, motion, responsive design, and accessibility that make the business feel specific and trustworthy.</p></li>
          <li class="fact-card"><h3>Clear explanation</h3><p>Plain language, useful pages, supporting proof, and links that help people and search tools understand the business.</p></li>
          <li class="fact-card"><h3>Clean handoff</h3><p>Forms, HubSpot routing, analytics, AI workers, and approval steps that move the right information to the right place.</p></li>
          <li class="fact-card"><h3>Proof it works</h3><p>Browser checks, source records, mobile testing, and live release receipts instead of vague completion claims.</p></li>
        </ul>`,
      },
      {
        eyebrow: 'How the work moves',
        title: 'Check, choose, build, connect, prove',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Check what is happening now.</strong> Review the live site, the mobile experience, what customers can find, where they get stuck, and which tools receive their information.</li>
          <li><strong>Choose one focused direction.</strong> Define who the site is for, what it needs them to understand, what proof matters, and what a useful result looks like.</li>
          <li><strong>Build the public experience.</strong> Create memorable pages with clear language, strong structure, useful proof, and responsive behavior.</li>
          <li><strong>Connect the handoff.</strong> Route forms, HubSpot context, analytics, research, and review steps without mixing client data or giving away unnecessary access.</li>
          <li><strong>Prove it before calling it finished.</strong> Check mobile layouts, keyboard use, reduced motion, search access, links, builds, and the live website.</li>
        </ol>`,
      },
      {
        eyebrow: 'AI needs boundaries',
        title: 'Let AI handle the busywork, not the final say',
        html: `<p>AI workers can research, inspect websites, organize proof, draft content, check a build, and prepare the next step. Important actions still need the right approval. That includes sending outreach, publishing outside an approved website, changing ad spend, choosing an unclear account, or crossing a login challenge.</p>
        <p>A useful worker should be able to explain what it checked, which client it served, what evidence it used, and where a person approved the work. If it cannot, it is not ready to act for a business.</p>
        <p>Meet the <a href="/business-agents/">AI worker crew</a>, read how <a href="/insights/human-approval-gates-for-marketing-agents/">approval keeps automation safe</a>, or <a href="/contact/">show me the repeated task you want off your plate</a>.</p>`,
      },
    ],
  },
  {
    path: '/web-design-optimization/',
    navSection: 'services',
    title: 'Website Design and Optimization for Service Businesses | IMMOHRTAL',
    description: 'Expressive website redesign, technical optimization, conversion structure, semantic HTML, accessibility, performance, and measurement for service businesses.',
    eyebrow: 'A better website',
    h1: 'Get a website people remember, trust, and know how to use.',
    lede: 'I redesign and improve service business websites so the offer is clear, the mobile experience works, the next step is obvious, and Google and AI tools can understand the pages.',
    actions: [
      { label: 'See websites I built', href: '/work/' },
      { label: 'Help me improve my site', href: '/contact/', secondary: true },
    ],
    sections: [
      {
        eyebrow: 'What gets better',
        title: 'More than a prettier homepage',
        tone: 'paper',
        html: `<p>Website optimization is the coordinated improvement of design, content, technical delivery, accessibility, discoverability, and conversion flow. A page can be visually beautiful and still hide its main service behind vague copy. It can score well in one lab test and still frustrate real mobile visitors. It can contain extensive information while giving search systems no clear relationship between the company, its services, its locations, and its evidence.</p>
        <p>The work starts by deciding what each page is for. A service page should answer a real buying question, state who the service fits, explain the process, show appropriate proof, address constraints, and offer a clear next step. The interface then supports that job with hierarchy, interaction, and responsive behavior.</p>
        <div class="callout"><strong>The practical standard</strong>A visitor should understand what the business does, why the offer is credible, and what to do next without decoding generic agency language.</div>`,
      },
      {
        eyebrow: 'The build system',
        title: 'Six connected layers',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Positioning and page architecture</h3><p>Define the audience, offer, proof order, page jobs, and internal paths before decoration hardens the wrong structure.</p></li>
          <li class="fact-card"><h3>Art direction and interaction</h3><p>Create a recognizable visual world with typography, layout, materials, motion, and imagery that belong to the business.</p></li>
          <li class="fact-card"><h3>Semantic content</h3><p>Use clear headings, descriptive links, readable sections, tables, lists, source references, and real HTML that can be retrieved without guesswork.</p></li>
          <li class="fact-card"><h3>Technical quality</h3><p>Address responsive layout, image delivery, loading behavior, metadata, canonicals, redirects, sitemaps, and runtime errors.</p></li>
          <li class="fact-card"><h3>Accessibility</h3><p>Support keyboard navigation, visible focus, contrast, descriptive alternatives, reduced motion, and touch targets that work on narrow screens.</p></li>
          <li class="fact-card"><h3>Measurement and operations</h3><p>Connect useful events, contact context, CRM routing, review routines, and reporting definitions before interpreting outcomes.</p></li>
        </ul>`,
      },
      {
        eyebrow: 'Typical engagement sequence',
        title: 'From live site audit to verified release',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Inspect the live experience.</strong> Capture desktop and mobile behavior, crawlable content, information structure, key templates, forms, links, and visible technical problems.</li>
          <li><strong>Map demand and decisions.</strong> Identify the questions prospects ask, the services and entities they need to understand, and the evidence required to move forward.</li>
          <li><strong>Set the visual thesis.</strong> Select a design direction that expresses the business through a coherent palette, type system, layout grammar, imagery, and motion behavior.</li>
          <li><strong>Build durable templates.</strong> Create reusable page patterns for services, locations, proof, articles, and conversion moments while keeping each page specific.</li>
          <li><strong>Connect search and answer readiness.</strong> Add metadata, canonical signals, structured data where accurate, contextual internal links, and source backed content.</li>
          <li><strong>Run bounded quality checks.</strong> Test the actual build, keyboard path, mobile overflow, reduced motion, console, structured outputs, and live routes.</li>
        </ol>`,
      },
      {
        eyebrow: 'What can be delivered',
        title: 'A focused system shaped to the site',
        html: `<p>The exact deliverables depend on what already exists and what the business needs next. A redesign may include a new homepage, service architecture, about and contact experience, case study templates, an insights library, a design system, analytics events, CRM handoff, migration support, and a technical release checklist.</p>
        <p>An optimization engagement may keep the visual foundation and focus on weak templates, thin service content, confusing navigation, Core Web Vitals, accessibility, crawl controls, duplicate URLs, internal links, schema accuracy, or form routing. The audit should determine the work. A fixed package should not force every website into the same answer.</p>
        <h3>Good fit</h3>
        <ul>
          <li>An established service business with a dated or generic site.</li>
          <li>A marketing team that has content but lacks a coherent information architecture.</li>
          <li>A business that needs its website, CRM, and follow up process to share cleaner context.</li>
          <li>A founder who wants expressive design without sacrificing accessibility or crawlability.</li>
        </ul>
        <p>Use the <a href="/insights/website-redesign-checklist-service-businesses/">website redesign checklist</a> to assess the current state, then <a href="/contact/">start with the pages that matter most</a>.</p>`,
      },
    ],
  },
  {
    path: '/aeo-geo/',
    navSection: 'services',
    title: 'AEO and GEO Services for AI Search Visibility | IMMOHRTAL',
    description: 'AEO and GEO strategy for service businesses using crawlable content, entities, evidence, internal architecture, structured data, and measurable search visibility.',
    eyebrow: 'Get found in Google and AI answers',
    h1: 'Help the right customers find you wherever they search.',
    lede: 'Your business should be easy to understand when someone asks Google, ChatGPT, Perplexity, or another search tool for help. I fix the pages, proof, and technical setup that help those tools explain what you do and send people to the right place. This work is often called AEO and GEO.',
    actions: [
      { label: 'See how getting found works', href: '/insights/aeo-vs-geo-service-businesses/' },
      { label: 'Find what is hiding my business', href: '/contact/', secondary: true },
    ],
    sections: [
      {
        eyebrow: 'Without the alphabet soup',
        title: 'AEO and GEO both help your business become a useful answer',
        tone: 'paper',
        html: `<p><strong>Answer engine optimization</strong> improves the clarity and retrievability of information used in direct answers. It emphasizes explicit questions, concise answer passages, entity relationships, source support, and technical access.</p>
        <p><strong>Generative engine optimization</strong> considers how generative search and assistant systems discover, interpret, combine, and cite information across a wider response. It emphasizes corroboration, reputation, useful depth, authorship, and consistent facts across the web.</p>
        <p>Neither discipline replaces technical SEO, useful content, or a strong website. Google states that the same foundational SEO practices remain relevant to AI features. The implementation therefore begins with public pages that can be crawled, indexed, understood, and trusted on their own terms.</p>
        <div class="callout"><strong>No magic file</strong>There is no single tag, schema type, or content format that guarantees inclusion in an AI generated answer. The defensible work improves access, meaning, evidence, and usefulness.</div>`,
      },
      {
        eyebrow: 'What helps you get found',
        title: 'Five things every important page needs',
        html: `<ol class="steps">
          <li><strong>Can systems access it?</strong> The page needs stable URLs, useful status codes, crawl permissions, internal links, and meaningful content in retrievable HTML.</li>
          <li><strong>Can systems identify the subject?</strong> The organization, service, location, person, and supporting concepts need clear names and relationships.</li>
          <li><strong>Can the page satisfy a real question?</strong> The content should answer the query directly, then provide enough detail for a reader to evaluate context and limits.</li>
          <li><strong>Can the claims be checked?</strong> Sources, dates, authorship, visible evidence, and consistent facts make verification possible. Unsupported certainty weakens the page.</li>
          <li><strong>Can performance be evaluated honestly?</strong> Search visibility, qualified visits, assisted conversions, and CRM outcomes need defined measurement without invented rank claims.</li>
        </ol>`,
      },
      {
        eyebrow: 'The work behind the result',
        title: 'Build the right pages before publishing more',
        tone: 'blue',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Question and intent map</h3><p>Connect priority buyer questions to the page that can answer each one completely.</p></li>
          <li class="fact-card"><h3>Entity model</h3><p>Define the business, services, people, locations, credentials, products, and relationships that deserve consistent treatment.</p></li>
          <li class="fact-card"><h3>Evidence plan</h3><p>Identify the sources, examples, process details, dates, and proof required to support important statements.</p></li>
          <li class="fact-card"><h3>Page and passage design</h3><p>Use direct summaries, descriptive headings, tables, steps, lists, and plain language without forcing every page into a rigid template.</p></li>
          <li class="fact-card"><h3>Technical signals</h3><p>Align canonicals, sitemaps, robots controls, metadata, structured data, links, and static rendering with the visible page.</p></li>
          <li class="fact-card"><h3>Observation loop</h3><p>Track queries, landing pages, AI feature traffic where available, citations, crawl behavior, and business outcomes over time.</p></li>
        </ul>`,
      },
      {
        eyebrow: 'What the work cannot promise',
        title: 'Visibility is earned and changes over time',
        html: `<p>Search and answer systems decide what to crawl, index, rank, synthesize, and cite. Their interfaces and reporting change. A screenshot can document what appeared at a point in time, but it cannot promise permanent placement. A sitemap submission is a discovery hint, not an indexing guarantee.</p>
        <p>IMMOHRTAL therefore avoids guaranteed AI Overview placement, universal citation scores, and made up traffic forecasts. The work focuses on what can be improved and verified: public access, semantic clarity, content usefulness, evidence quality, consistent entities, internal relationships, page experience, and measurement definitions.</p>
        <p>Go deeper with <a href="/insights/google-ai-overviews-service-businesses/">the AI Overviews guide</a>, <a href="/insights/schema-markup-service-businesses/">the schema guide</a>, and <a href="/insights/measure-ai-search-visibility/">the visibility measurement framework</a>.</p>`,
      },
    ],
  },
  {
    path: '/business-agents/',
    navSection: 'services',
    title: 'Business Agents for Websites, CRM, and Marketing Operations | IMMOHRTAL',
    description: 'Governed AI agents for website intelligence, AEO and GEO research, web production, HubSpot routing, quality assurance, and bounded marketing operations.',
    eyebrow: 'AI workers for the busywork',
    h1: 'Give the busywork to AI without giving up control.',
    lede: 'I build AI workers that research, organize, draft, check, and prepare updates while you keep approval over anything that gets sent, published, purchased, or changed.',
    actions: [
      { label: 'Show me what to automate', href: '/contact/' },
      { label: 'See how approval works', href: '/insights/human-approval-gates-for-marketing-agents/', secondary: true },
    ],
    sections: [
      {
        eyebrow: 'The public crew',
        title: 'Five AI workers with five clear jobs',
        tone: 'paper',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Scout: finds the problem</h3><p>Checks the live website and shows what is confusing, hidden, slow, or getting in the customer’s way.</p></li>
          <li class="fact-card"><h3>Atlas: makes the business easier to find</h3><p>Turns customer questions into clear pages, useful answers, and proof that search and AI tools can understand.</p></li>
          <li class="fact-card"><h3>Forge: builds the website</h3><p>Turns an approved plan into accessible pages, reusable pieces, and a site that works on real screens.</p></li>
          <li class="fact-card"><h3>Relay: connects the handoff</h3><p>Moves form details into HubSpot, analytics, follow-up drafts, and the right person’s hands without mixing clients.</p></li>
          <li class="fact-card"><h3>Proof: checks everything</h3><p>Tests the build, mobile experience, accessibility, public claims, and live release before anything is called finished.</p></li>
        </ul>
        <p>These names make the operating model easier to understand. They do not imply that every worker is continuously online or authorized to act without review.</p>`,
      },
      {
        eyebrow: 'Rules before access',
        title: 'Every AI worker needs a job description',
        html: `<p>A clever prompt is not enough. A useful AI worker needs a written job: what starts the work, which client it serves, what it may read or change, what proof it must return, when it must stop, and who reviews the result.</p>
        <ol class="steps">
          <li><strong>Trigger.</strong> State what starts the job and which event, schedule, or human request is authoritative.</li>
          <li><strong>Scope.</strong> Name the client, account, repository, website, date range, and systems the worker may inspect or change.</li>
          <li><strong>Sources.</strong> Prefer current primary evidence and record where each material fact came from.</li>
          <li><strong>Output contract.</strong> Define the artifact, fields, status labels, and verification evidence the next worker or person needs.</li>
          <li><strong>Gates.</strong> Stop on ambiguity, missing access, authentication challenges, unsupported claims, destructive operations, and consequential external actions.</li>
          <li><strong>Receipt.</strong> Return what changed, what remained draft or blocked, and how the result was checked.</li>
        </ol>`,
      },
      {
        eyebrow: 'From website to HubSpot',
        title: 'Move better information to the right person',
        tone: 'blue',
        html: `<p>A website form can be the beginning of a useful operating flow when the fields, consent, routing, and CRM model are designed together. The goal is not to trigger the largest possible workflow. It is to collect appropriate context, identify the right record, apply explicit enrollment criteria, notify the right owner, and preserve a reviewable history.</p>
        <p>HubSpot workflows, webhooks, and form events can support this architecture. Implementation still needs exact portal routing, deduplication rules, field definitions, permission boundaries, retry behavior, and failure monitoring. The agent layer should never guess which client portal or contact record is intended.</p>
        <div class="callout"><strong>Useful default</strong>Research, classification, summarization, and draft preparation can often run automatically. Sending, publishing, spending, deleting, changing access, and acting across an ambiguous account should require explicit authority.</div>`,
      },
      {
        eyebrow: 'A practical first build',
        title: 'Start with one repeated task',
        html: `<p>The strongest first agent is usually a repetitive, evidence rich job with a clear output and a low cost of review. Examples include a daily website health check, a prospect site audit that produces a draft brief, a content refresh monitor, a HubSpot record enrichment queue, or a prepublication quality gate.</p>
        <p>Choose one workflow, establish baseline time and error patterns, build the contract, run it in read only or draft mode, inspect the receipts, and expand authority only after the evidence supports it. This sequence produces operating knowledge. Launching a large roster before the contracts and routing exist produces uncertainty at scale.</p>
        <p>Read <a href="/insights/hubspot-business-agents-safe-integration/">the HubSpot integration guide</a> and <a href="/insights/human-approval-gates-for-marketing-agents/">the approval gate framework</a>, then <a href="/contact/">bring one workflow to map</a>.</p>`,
      },
    ],
  },
  {
    path: '/work/',
    navSection: 'work',
    title: 'Selected Website Design and Optimization Work | IMMOHRTAL',
    description: 'Selected live websites and concepts across HCM, local services, spatial media, commerce, retail, and home services, with project roles and direct links.',
    eyebrow: 'Selected web work',
    h1: 'Websites that make each business impossible to confuse with anyone else.',
    lede: 'Every project starts with a different customer, a different decision, and a different reason to care. Open the live work below to see how each experience looks, moves, and guides the next step.',
    actions: [
      { label: 'Improve my website', href: '/contact/' },
      { label: 'See how the work gets built', href: '/web-design-optimization/', secondary: true },
    ],
    sections: [
      {
        eyebrow: 'Live work and concepts',
        title: 'Seven public experiences',
        tone: 'paper',
        html: 'PROJECT_GRID',
      },
      {
        eyebrow: 'How to inspect the work',
        title: 'Look past the screenshot',
        html: `<p>A still image can show art direction, but it cannot show whether a menu works by keyboard, how the hierarchy adapts on mobile, whether motion respects user preferences, or where the contact path leads. Open the live projects and examine the full experience.</p>
        <p>The roles listed above come from the current public portfolio data. Some projects are live operating sites and others are clearly described as concepts. The page does not add unsupported performance figures, invent client testimonials, or imply a broader scope than the record supports.</p>
        <div class="callout"><strong>What carries forward</strong>Strong web work needs a recognizable look, readable content, dependable mobile behavior, useful structure, and a clear next action. Getting found, connecting HubSpot, and adding AI workers build on that foundation. They do not replace it.</div>`,
      },
      {
        eyebrow: 'Your next version',
        title: 'Start with the page that carries the most weight',
        tone: 'blue',
        html: `<p>A full redesign is not always the first move. Sometimes the highest value starting point is a homepage narrative, a core service template, a location architecture, a contact flow, a technical cleanup, or a focused answer engine content system.</p>
        <p>Send the current site, the business goal, and the page that feels most limiting. The first conversation can separate immediate fixes from structural work and identify what evidence is still missing.</p>
        <p><a class="button" href="/contact/">Show me what needs work</a></p>`,
      },
    ],
  },
  {
    path: '/contact/',
    navSection: 'contact',
    title: 'Contact IMMOHRTAL Marketing Solutions | Website and AI Search Projects',
    description: 'Contact Dillon Mohr about website redesign, web optimization, AEO and GEO, HubSpot integration, or a bounded business agent workflow.',
    eyebrow: 'Tell me what needs to work better',
    h1: 'Show me what is not working. I’ll help find the right first move.',
    lede: 'Send the current website, tell me where people get stuck, and explain what you need the site or your team to do better. You do not need to know the technical term for the problem.',
    actions: [
      { label: 'Tell Dillon what is not working', href: `mailto:${site.email}?subject=IMMOHRTAL%20website%20help` },
      { label: 'See Dillon’s work', href: '/work/', secondary: true },
    ],
    sections: [
      {
        eyebrow: 'Direct contact',
        title: 'One clear channel',
        tone: 'paper',
        html: `<div class="portrait-layout">
          <img class="portrait" src="${site.portrait}" width="700" height="700" alt="Portrait of Dillon Mohr of IMMOHRTAL Marketing Solutions" loading="eager">
          <div>
            <p>If your website needs to look better, explain your offer more clearly, get found more often, or hand less busywork to your team, email Dillon at <a href="mailto:${site.email}">${site.email}</a>.</p>
            <p>The email link opens your own mail app. You see and control exactly what gets sent.</p>
            <div class="contact-channel">
              <a class="button" href="mailto:${site.email}?subject=IMMOHRTAL%20website%20help">Tell Dillon what needs work</a>
              <a class="button secondary" href="/about/">About the studio</a>
            </div>
          </div>
        </div>`,
      },
      {
        eyebrow: 'A useful first message',
        title: 'Five details that create momentum',
        html: `<ol class="steps">
          <li><strong>Current website.</strong> Include the live URL and any staging link that is safe to share.</li>
          <li><strong>Primary business goal.</strong> Name the service, audience, market, or workflow the project needs to support.</li>
          <li><strong>Known constraint.</strong> Mention timing, platform, internal approvals, migration limits, accessibility requirements, or CRM dependencies.</li>
          <li><strong>What feels wrong now.</strong> Describe the weak page, confusing path, technical problem, visibility gap, or repeated manual task.</li>
          <li><strong>Evidence already available.</strong> Share analytics definitions, Search Console access, brand files, customer questions, source documents, or existing process notes when appropriate.</li>
        </ol>`,
      },
      {
        eyebrow: 'Where to begin',
        title: 'Start with the problem you already see',
        tone: 'blue',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>The website needs a redesign</h3><p>It feels generic, dated, disconnected, or difficult to use on a phone.</p></li>
          <li class="fact-card"><h3>The website needs fixing</h3><p>The look can stay, but the pages are slow, confusing, hard to find, inaccessible, or weak at turning interest into contact.</p></li>
          <li class="fact-card"><h3>The business needs to get found</h3><p>Google and AI tools do not clearly understand the services, proof, people, or pages they should show.</p></li>
          <li class="fact-card"><h3>The busywork needs an AI worker</h3><p>A repeated research, content, HubSpot, or quality task is taking time that your team needs elsewhere.</p></li>
        </ul>`,
      },
      {
        eyebrow: 'Before you write',
        title: 'Use the guides to sharpen the brief',
        html: `<p>If the project is still taking shape, start with the <a href="/insights/website-redesign-checklist-service-businesses/">website redesign checklist</a>, the guide to <a href="/insights/aeo-vs-geo-service-businesses/">AEO and GEO</a>, or the framework for <a href="/insights/human-approval-gates-for-marketing-agents/">agent approval gates</a>.</p>
        <p>The goal is not to arrive with every answer. It is to make the current state, intended outcome, and important constraints visible enough to choose the right first move.</p>`,
      },
    ],
  },
]

export const insightsPage = {
  path: '/insights/',
  navSection: 'insights',
  title: 'AEO, GEO, Web Optimization, and Business Agent Insights | IMMOHRTAL',
  description: 'Evidence led guides to AEO, GEO, Google AI Overviews, website redesign, schema, AI crawlers, JavaScript SEO, HubSpot agents, measurement, entities, and governance.',
  eyebrow: 'IMMOHRTAL insights',
  h1: 'Plain English guides to better websites, better visibility, and useful AI workers.',
  lede: 'Ten detailed guides explain how to improve a website, help more of the right people find it, connect it to HubSpot, and use AI without giving up control. The technical terms are here when they matter, and every guide links to primary official sources.',
}
