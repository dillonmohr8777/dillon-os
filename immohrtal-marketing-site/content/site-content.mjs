import { pressroom } from './pressroom-assets.mjs'

export const site = {
  origin: 'https://www.immohrtalmarketing.com',
  name: 'IMMOHRTAL Marketing Solutions',
  shortName: 'IMMOHRTAL',
  email: 'dillon@immohrtalmarketing.com',
  bookingUrl: 'https://calendar.app.google/CSD1BzHQJtCFhEdY9',
  logo: '/brand/immohrtal-logo.png',
  portrait: '/people/dillon-mohr.jpg',
  published: '2026-08-24',
  modified: '2026-08-25',
}

export const navigation = [
  { label: 'Services', href: '/services/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'Work', href: '/work/' },
  { label: 'Guides', href: '/insights/' },
  { label: 'About', href: '/about/' },
]

export const pricingCatalog = {
  search: [
    {
      id: 'technical-seo',
      name: 'Technical SEO',
      price: 700,
      href: '/technical-seo/',
      description: 'Crawl paths, rendering, canonical signals, sitemaps, internal links, schema accuracy, and release checks.',
    },
    {
      id: 'aeo',
      name: 'AEO',
      price: 700,
      href: '/aeo-geo/',
      description: 'Priority questions, direct answer structure, clear source pages, and retrievable passages for answer engines.',
    },
    {
      id: 'geo',
      name: 'GEO',
      price: 700,
      href: '/aeo-geo/',
      description: 'Entity relationships, corroborating sources, authorship, useful depth, and dated observation for generative search.',
    },
    {
      id: 'search-visibility-bundle',
      name: 'Technical SEO + AEO + GEO',
      shortName: 'Search visibility bundle',
      price: 1500,
      href: '/aeo-geo/',
      featured: true,
      description: 'Technical access, answer ready pages, and generative visibility work connected in one monthly program.',
    },
  ],
  paidMedia: [
    {
      id: 'google-ads-management',
      name: 'Google Ads management',
      price: 400,
      description: 'Focused monthly management for the Google Ads channel.',
    },
    {
      id: 'meta-ads-management',
      name: 'Meta Ads management',
      price: 400,
      description: 'Focused monthly management for the Meta Ads channel.',
    },
    {
      id: 'paid-media-bundle',
      name: 'Google + Meta Ads management',
      shortName: 'Paid media bundle',
      price: 650,
      featured: true,
      description: 'Google and Meta management connected in one monthly program.',
    },
  ],
}

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

const baseCorePages = [
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
      { label: 'Book a 30 minute growth call', href: site.bookingUrl, external: true },
      { label: 'Email Dillon instead', href: `mailto:${site.email}?subject=IMMOHRTAL%20website%20help`, secondary: true },
    ],
    sections: [
      {
        eyebrow: 'Direct contact',
        title: 'One clear channel',
        tone: 'paper',
        html: `<div class="portrait-layout">
          <img class="portrait" src="${site.portrait}" width="700" height="700" alt="Portrait of Dillon Mohr of IMMOHRTAL Marketing Solutions" loading="eager">
          <div>
            <p>If your website needs to look better, explain your offer more clearly, get found more often, or hand less busywork to your team, book a focused 30 minute call or email Dillon at <a href="mailto:${site.email}">${site.email}</a>.</p>
            <p>The booking page shows live availability and creates a Google Meet automatically. Email remains available when that is easier.</p>
            <div class="contact-channel">
              <a class="button" href="${site.bookingUrl}" target="_blank" rel="noreferrer">Book the growth call</a>
              <a class="button secondary" href="mailto:${site.email}?subject=IMMOHRTAL%20website%20help">Email Dillon instead</a>
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

export const serviceDirectory = [
  {
    key: 'webDesign',
    href: '/web-design/',
    title: 'Web design',
    plainTitle: 'Make the business impossible to confuse with anyone else',
    summary: 'Art direction, responsive page systems, interaction, accessibility, and production code built around the way customers actually decide.',
    agent: 'Forge',
  },
  {
    key: 'websiteOptimization',
    href: '/web-design-optimization/',
    title: 'Website optimization',
    plainTitle: 'Fix the friction without throwing away what already works',
    summary: 'Performance, mobile usability, content hierarchy, accessibility, conversion paths, analytics, and release quality for an existing website.',
    agent: 'Scout + Proof',
  },
  {
    key: 'technicalSeo',
    href: '/technical-seo/',
    title: 'Technical SEO',
    plainTitle: 'Give search systems a clean path through the site',
    summary: 'Crawlability, indexation signals, rendering, canonical structure, sitemaps, internal links, structured data, and measurable release checks.',
    agent: 'Scout + Atlas',
  },
  {
    key: 'aeoGeo',
    href: '/aeo-geo/',
    title: 'AEO and GEO',
    plainTitle: 'Become a useful answer wherever customers search',
    summary: 'Clear source pages, entity relationships, direct answers, supporting proof, and dated visibility measurement for Google and AI answer systems.',
    agent: 'Atlas + Proof',
  },
  {
    key: 'contentSchema',
    href: '/content-schema/',
    title: 'Content and schema systems',
    plainTitle: 'Explain the business once, then keep every page consistent',
    summary: 'Service-page architecture, entity-first content, reusable editorial templates, accurate schema, source controls, and connected internal links.',
    agent: 'Forge + Atlas',
  },
  {
    key: 'businessAgents',
    href: '/business-agents/',
    title: 'Business agents',
    plainTitle: 'Give repeated work to a bounded AI worker',
    summary: 'Research, drafting, inspection, organization, quality checks, receipts, and explicit approval gates for consequential actions.',
    agent: 'The full crew',
  },
  {
    key: 'hubspotCrm',
    href: '/hubspot-crm-agents/',
    title: 'HubSpot and CRM agents',
    plainTitle: 'Move website interest to the right person with useful context',
    summary: 'Form architecture, exact routing, lifecycle design, client isolation, governed follow-up preparation, and CRM quality control.',
    agent: 'Relay + Proof',
  },
]

const serviceLinks = {
  webDesign: {
    services: ['/web-design-optimization/', '/content-schema/', '/aeo-geo/'],
    guides: ['/insights/website-redesign-checklist-service-businesses/', '/insights/javascript-seo-react-crawlable-html/'],
  },
  websiteOptimization: {
    services: ['/web-design/', '/technical-seo/', '/aeo-geo/'],
    guides: ['/insights/website-redesign-checklist-service-businesses/', '/insights/javascript-seo-react-crawlable-html/'],
  },
  technicalSeo: {
    services: ['/web-design-optimization/', '/content-schema/', '/aeo-geo/'],
    guides: ['/insights/javascript-seo-react-crawlable-html/', '/insights/schema-markup-service-businesses/', '/insights/ai-search-crawlers-discovery-citations/'],
  },
  aeoGeo: {
    services: ['/technical-seo/', '/content-schema/', '/web-design-optimization/'],
    guides: ['/insights/aeo-vs-geo-service-businesses/', '/insights/google-ai-overviews-service-businesses/', '/insights/measure-ai-search-visibility/'],
  },
  contentSchema: {
    services: ['/technical-seo/', '/aeo-geo/', '/web-design/'],
    guides: ['/insights/entity-first-content-architecture/', '/insights/schema-markup-service-businesses/'],
  },
  businessAgents: {
    services: ['/hubspot-crm-agents/', '/content-schema/', '/web-design-optimization/'],
    guides: ['/insights/human-approval-gates-for-marketing-agents/', '/insights/hubspot-business-agents-safe-integration/'],
  },
  hubspotCrm: {
    services: ['/business-agents/', '/content-schema/', '/web-design-optimization/'],
    guides: ['/insights/hubspot-business-agents-safe-integration/', '/insights/human-approval-gates-for-marketing-agents/'],
  },
}

const pageEnhancements = {
  '/about/': {
    media: pressroom.about,
    relatedServices: ['/web-design/', '/business-agents/', '/hubspot-crm-agents/'],
  },
  '/web-design-optimization/': {
    pageKind: 'service',
    serviceKey: 'websiteOptimization',
    media: pressroom.services.websiteOptimization,
    title: 'Website Optimization for Service Businesses | IMMOHRTAL',
    description: 'Website audits and implementation for performance, mobile usability, accessibility, content clarity, conversion paths, analytics, and release quality.',
    h1: 'Keep the look. Fix what makes the website harder to use, find, or trust.',
    lede: 'Website optimization improves the experience that already exists. I inspect the live pages, identify the friction that matters, fix it in the real build, and prove the release on desktop and mobile.',
    actions: [
      { label: 'Show me the live site', href: '/contact/' },
      { label: 'See the optimization checklist', href: '/insights/website-redesign-checklist-service-businesses/', secondary: true },
    ],
    relatedServices: serviceLinks.websiteOptimization.services,
    relatedGuides: serviceLinks.websiteOptimization.guides,
    sections: [
      {
        title: 'Start with a reproducible problem',
        tone: 'paper',
        html: `<p>A vague request to make a website better usually creates random edits. A useful optimization begins with something that can be observed: a slow page, a buried service, a confusing mobile path, an inaccessible control, an unclear form, a missing source page, or analytics that cannot answer the business question.</p>
        <p>Scout reviews the live experience and records the page, viewport, behavior, and evidence. That turns feedback into a change the build can actually solve.</p>
        <div class="callout"><strong>Optimization is not a cosmetic subscription.</strong>Each change needs a reason, an implementation, and a release check.</div>`,
      },
      {
        title: 'Improve the whole path, not one isolated score',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Speed and stability</h3><p>Reduce waste in images, scripts, fonts, rendering, and layout movement while preserving the visual direction.</p></li>
          <li class="fact-card"><h3>Mobile usability</h3><p>Correct cramped controls, broken hierarchy, accidental overflow, sticky collisions, and hard-to-complete forms.</p></li>
          <li class="fact-card"><h3>Clarity and action</h3><p>Strengthen the page order, service explanation, proof placement, calls to action, and next-step language.</p></li>
          <li class="fact-card"><h3>Accessibility</h3><p>Improve semantics, focus, keyboard use, contrast, motion behavior, alternatives, and readable content structure.</p></li>
          <li class="fact-card"><h3>Findability</h3><p>Repair crawl paths, metadata, internal links, canonical signals, source pages, and visible structured information.</p></li>
          <li class="fact-card"><h3>Measurement</h3><p>Confirm that the events and forms answer useful questions instead of collecting numbers with no decision attached.</p></li>
        </ul>`,
      },
      {
        title: 'Fix, compare, and release',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Inspect the live site.</strong> Capture the current behavior, source, network, accessibility, and responsive evidence.</li>
          <li><strong>Choose the highest-value repair.</strong> Prioritize by customer impact, business importance, confidence, and implementation risk.</li>
          <li><strong>Change the real build.</strong> Work in the existing design and technical system unless the evidence supports a broader redesign.</li>
          <li><strong>Compare before and after.</strong> Re-run the same checks, inspect the page visually, and confirm that the fix did not create a new failure.</li>
          <li><strong>Verify production.</strong> Release to the mapped site, check the live response, and retain the evidence that supports completion.</li>
        </ol>`,
      },
      {
        title: 'Know when optimization has become a redesign',
        html: `<p>If the page structure, visual language, content hierarchy, and responsive system all need to change together, continued patching becomes more expensive than choosing a new direction. That is the point to move from <a href="/web-design-optimization/">optimization</a> to a focused <a href="/web-design/">web design engagement</a>.</p>
        <p>If the interface works but important pages remain hard to discover or understand, the next move may be <a href="/technical-seo/">technical SEO</a>, <a href="/content-schema/">content and schema architecture</a>, or <a href="/aeo-geo/">answer visibility work</a>.</p>`,
      },
    ],
  },
  '/aeo-geo/': {
    pageKind: 'service',
    serviceKey: 'aeoGeo',
    media: pressroom.services.aeoGeo,
    relatedServices: serviceLinks.aeoGeo.services,
    relatedGuides: serviceLinks.aeoGeo.guides,
  },
  '/business-agents/': {
    pageKind: 'service',
    serviceKey: 'businessAgents',
    media: pressroom.services.businessAgents,
    relatedServices: serviceLinks.businessAgents.services,
    relatedGuides: serviceLinks.businessAgents.guides,
  },
  '/work/': {
    media: pressroom.work,
    relatedServices: ['/web-design/', '/web-design-optimization/', '/aeo-geo/'],
  },
  '/contact/': {
    media: pressroom.contact,
    relatedServices: ['/services/', '/web-design-optimization/', '/business-agents/'],
  },
}

const newCorePages = [
  {
    path: '/services/',
    navSection: 'services',
    pageKind: 'services-hub',
    title: 'Website, Search, Content, and Business Agent Services | IMMOHRTAL',
    description: 'Explore IMMOHRTAL web design, website optimization, technical SEO, AEO and GEO, content and schema, business agent, and HubSpot services.',
    h1: 'One website system. Seven ways to make it work harder.',
    lede: 'Start with the problem the business can already feel. Then connect only the design, search, content, CRM, and AI work needed to solve it.',
    media: pressroom.servicesHub,
    actions: [
      { label: 'Show me what is not working', href: '/contact/' },
      { label: 'See the work', href: '/work/', secondary: true },
    ],
    sections: [
      {
        title: 'Choose the problem before the service label',
        tone: 'paper',
        html: 'SERVICE_DIRECTORY',
      },
      {
        title: 'Design, discovery, and handoff belong together',
        html: `<p>A website is not finished when it looks polished. Customers need to understand the offer, search systems need to discover and interpret the important pages, and the business needs to receive useful context when someone acts.</p>
        <p>That is why these services connect. <a href="/web-design/">Web design</a> creates the public experience. <a href="/technical-seo/">Technical SEO</a> gives it a clean structure. <a href="/content-schema/">Content and schema</a> make the business relationships explicit. <a href="/hubspot-crm-agents/">HubSpot and CRM agents</a> improve the handoff after interest becomes action.</p>`,
      },
      {
        title: 'The crew changes with the job',
        tone: 'blue',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Scout finds the friction</h3><p>Live-page inspection, crawl paths, source checks, mobile behavior, and evidence collection.</p></li>
          <li class="fact-card"><h3>Atlas connects the system</h3><p>Page architecture, entity relationships, service paths, lifecycle stages, and operating context.</p></li>
          <li class="fact-card"><h3>Forge builds the change</h3><p>Responsive interfaces, reusable templates, production code, structured pages, and performance repairs.</p></li>
          <li class="fact-card"><h3>Relay moves the context</h3><p>Forms, CRM routing, research packets, approvals, and exact handoffs between systems and people.</p></li>
          <li class="fact-card"><h3>Proof tries to stop the release</h3><p>Accessibility, responsive behavior, links, schema, console output, evidence, and production verification.</p></li>
        </ul>`,
      },
      {
        title: 'Start with one bounded engagement',
        html: `<p>The first engagement should answer a useful question, not create a vague retainer. That might be a live website audit, one redesigned service page, a technical crawl and internal-link repair, an answer-visibility source map, a HubSpot routing review, or one bounded AI worker.</p>
        <p><a href="/contact/">Send the live site and the problem you already see.</a> I will identify the smallest first move that can produce a real artifact and a clear next decision.</p>`,
      },
    ],
  },
  {
    path: '/pricing/',
    navSection: 'pricing',
    pageKind: 'pricing',
    title: 'Monthly Marketing Services and Pricing | IMMOHRTAL',
    description: 'See monthly pricing for Technical SEO, AEO, GEO, search visibility bundles, Google Ads management, and Meta Ads management from IMMOHRTAL.',
    h1: 'Choose the work you need. See the monthly price before we talk.',
    lede: 'Monthly pricing is published for search visibility and paid media management. Website, content, CRM, and agent projects are shaped around the real system because the scope changes with the work.',
    heroArtifact: 'PRICING_HERO',
    directionContract: {
      thesis: 'Price truth moves first. This page replaces the familiar pricing card wall with one inspectable rate ledger that keeps individual services and bundles in the same system.',
      ownWorld: 'Space Ink orbit stage, proof paper ledgers, cyan rules, Unbounded amounts, Manrope explanations, Foundry Mono monthly labels, and the existing action and radius vocabulary.',
      story: 'The visitor sees the two connected bundles, compares every approved monthly rate, understands which projects need a custom scope, and starts one focused conversation.',
      firstViewport: 'The fixed rail sits above an orbit stage. The outcome statement and contact action lead at left while two bundle rates resolve in a full width ledger below.',
      form: 'Particle Proof Ledger, a direct extension of the existing static sales page surface. No concept seed was required for this fixed scope route.',
    },
    actions: [
      { label: 'Talk through the right fit', href: '/contact/' },
      { label: 'See every service', href: '/services/', secondary: true },
    ],
    relatedServices: ['/services/', '/technical-seo/', '/aeo-geo/'],
    sections: [
      {
        title: 'Build the search system one layer at a time',
        tone: 'paper',
        html: 'PRICING_SEARCH',
      },
      {
        title: 'Manage the channels your buyers already use',
        html: 'PRICING_PAID_MEDIA',
      },
      {
        title: 'Projects that need a custom scope',
        tone: 'blue',
        html: `<div class="custom-scope-list">
          <section><h3>Web design and website optimization</h3><p>Scope follows the current site, the pages that need to change, the visual direction, the platform, and the release work.</p></section>
          <section><h3>Content and schema systems</h3><p>Scope follows the approved source material, missing pages, entity relationships, templates, internal links, and validation needs.</p></section>
          <section><h3>Business agents and CRM connections</h3><p>Scope follows the repeated job, the exact systems involved, access boundaries, approval points, and the evidence needed to verify the handoff.</p></section>
        </div>
        <div class="callout"><strong>Custom scoped</strong>No monthly price is published for these engagements. The first conversation defines one bounded scope before a proposal.</div>`,
      },
      {
        title: 'Choose the smallest plan that solves the real problem',
        html: `<ol class="steps">
          <li><strong>Bring the live website or channel.</strong> Share the current URL, the problem you can already see, and any important platform constraint.</li>
          <li><strong>Choose one lane or one connected bundle.</strong> Use an individual monthly service when the need is focused. Use a bundle when the channels or search layers need to move together.</li>
          <li><strong>Confirm the working scope.</strong> The conversation should make the target, responsibilities, and first useful output clear before work begins.</li>
        </ol>
        <p><a href="/contact/">Start with the problem you want fixed.</a></p>`,
      },
    ],
  },
  {
    path: '/web-design/',
    navSection: 'services',
    pageKind: 'service',
    serviceKey: 'webDesign',
    title: 'Distinctive Web Design for Service Businesses | IMMOHRTAL',
    description: 'Custom responsive web design with specific art direction, clear service structure, accessible interaction, production code, and a verified mobile release.',
    h1: 'Build a website no one could mistake for a template.',
    lede: 'The visual direction should make the business recognizable. The page structure should make the offer understandable. The finished build should work beautifully on the devices customers actually use.',
    media: pressroom.services.webDesign,
    relatedServices: serviceLinks.webDesign.services,
    relatedGuides: serviceLinks.webDesign.guides,
    actions: [
      { label: 'Show me the current website', href: '/contact/' },
      { label: 'See selected work', href: '/work/', secondary: true },
    ],
    sections: [
      {
        title: 'Art direction with a business job',
        tone: 'paper',
        html: `<p>A distinctive website is not a strange color palette laid over a familiar template. It needs a visual thesis that belongs to the business and reinforces what the customer should understand, remember, and do.</p>
        <p>The direction is translated through typography, composition, imagery, materials, interaction, motion, and responsive behavior. Forge turns that system into real components instead of a static concept that falls apart in production.</p>`,
      },
      {
        title: 'Every screen carries the same conviction',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Homepage</h3><p>Make the promise, proof, and next step immediately legible without flattening the personality.</p></li>
          <li class="fact-card"><h3>Service pages</h3><p>Answer the specific buying question with useful depth, connected proof, and a clear internal path.</p></li>
          <li class="fact-card"><h3>Work and evidence</h3><p>Let visitors inspect real projects, dated source material, and the decisions behind the interface.</p></li>
          <li class="fact-card"><h3>Mobile experience</h3><p>Recompose the story for touch, narrow widths, readable type, and controls that remain easy to use.</p></li>
          <li class="fact-card"><h3>Reading pages</h3><p>Give long-form guidance a calmer mode without making it feel like a different website.</p></li>
          <li class="fact-card"><h3>Contact path</h3><p>Reduce uncertainty at the moment a visitor decides whether to start a conversation.</p></li>
        </ul>`,
      },
      {
        title: 'From source material to working interface',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Resolve the audience and job.</strong> Define the customer, the decision, the proof, and the action the page needs to support.</li>
          <li><strong>Choose a committed visual world.</strong> Compare real directions, select one, and document the rules that make it coherent.</li>
          <li><strong>Build the responsive system.</strong> Create the actual page structure, components, images, states, and interactions in production code.</li>
          <li><strong>Connect the content.</strong> Add service depth, internal links, metadata, structured information, and a useful handoff path.</li>
          <li><strong>Inspect and release.</strong> Review desktop and mobile together, fix the complete finding batch, and verify the live site.</li>
        </ol>`,
      },
      {
        title: 'The launch is the start of the evidence',
        html: `<p>After release, the next questions become visible. Are customers finding the right service? Does the mobile path make sense? Can search systems reach the important pages? Does the form deliver the right context?</p>
        <p>Those answers lead naturally into <a href="/web-design-optimization/">website optimization</a>, <a href="/technical-seo/">technical SEO</a>, <a href="/aeo-geo/">answer visibility</a>, or <a href="/hubspot-crm-agents/">HubSpot and CRM routing</a>.</p>`,
      },
    ],
  },
  {
    path: '/technical-seo/',
    navSection: 'services',
    pageKind: 'service',
    serviceKey: 'technicalSeo',
    title: 'Technical SEO and Crawlability for Service Websites | IMMOHRTAL',
    description: 'Technical SEO for crawlability, rendering, indexation signals, canonical URLs, sitemaps, internal links, schema, performance, and verified releases.',
    h1: 'Give search systems a clean way through the site.',
    lede: 'Important pages need to exist in useful HTML, connect through intentional links, send consistent indexing signals, and describe the same business a visitor can see.',
    media: pressroom.services.technicalSeo,
    relatedServices: serviceLinks.technicalSeo.services,
    relatedGuides: serviceLinks.technicalSeo.guides,
    actions: [
      { label: 'Audit the live site', href: '/contact/' },
      { label: 'Read the crawlability guide', href: '/insights/javascript-seo-react-crawlable-html/', secondary: true },
    ],
    sections: [
      {
        title: 'Crawlability is a path, not a switch',
        tone: 'paper',
        html: `<p>A page can be public and still be difficult to discover, render, interpret, or prioritize. Scout follows the actual path from navigation and internal links through response codes, HTML, canonical signals, sitemaps, scripts, and robots controls.</p>
        <p>The result is a source-located issue list tied to real URLs and business importance, not a giant export of warnings with no decision attached.</p>`,
      },
      {
        title: 'Make every technical signal tell the same story',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Responses and rendering</h3><p>Important routes return useful content, load reliably, and remain understandable before optional JavaScript enhancements.</p></li>
          <li class="fact-card"><h3>Canonical structure</h3><p>URLs, redirects, canonicals, pagination, and duplicate variants point toward one intended public version.</p></li>
          <li class="fact-card"><h3>Internal links</h3><p>Services, guides, proof, people, and contact paths connect in the HTML instead of depending on search or a hidden menu.</p></li>
          <li class="fact-card"><h3>Sitemaps and controls</h3><p>Sitemaps list the real indexable routes while robots rules avoid accidental blocks and false discovery promises.</p></li>
          <li class="fact-card"><h3>Structured data</h3><p>Schema describes visible organizations, people, services, breadcrumbs, and articles without adding claims the page does not support.</p></li>
          <li class="fact-card"><h3>Release evidence</h3><p>Production checks confirm the live status, metadata, links, schema, responsive behavior, console, and crawlable content.</p></li>
        </ul>`,
      },
      {
        title: 'Repair the architecture in business order',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Inventory the pages that matter.</strong> Separate valuable public routes from duplicates, dead ends, parameters, and internal-only surfaces.</li>
          <li><strong>Trace discovery.</strong> Follow navigation, contextual links, sitemaps, redirects, and response behavior from the homepage outward.</li>
          <li><strong>Inspect the delivered content.</strong> Confirm titles, descriptions, headings, body copy, media alternatives, links, and structured information in the actual response.</li>
          <li><strong>Fix in dependency order.</strong> Resolve response and canonical problems before polishing schema or measuring answer visibility.</li>
          <li><strong>Validate production.</strong> Re-crawl the live release and retain the exact routes and checks that support completion.</li>
        </ol>`,
      },
      {
        title: 'Technical SEO creates the runway for useful answers',
        html: `<p>Technical access alone does not make a page valuable, but weak access can prevent valuable content from participating. After the crawl path is clean, <a href="/content-schema/">content and schema work</a> can clarify the business and <a href="/aeo-geo/">AEO and GEO work</a> can strengthen the source pages answer systems may use.</p>`,
      },
    ],
  },
  {
    path: '/content-schema/',
    navSection: 'services',
    pageKind: 'service',
    serviceKey: 'contentSchema',
    title: 'Content Architecture and Schema for Service Businesses | IMMOHRTAL',
    description: 'Entity-first service content, reusable page templates, internal links, source controls, and accurate schema that matches visible website claims.',
    h1: 'Make every important page explain exactly what the business is, does, and proves.',
    lede: 'A connected content system gives customers useful answers, keeps service pages consistent, and gives search and AI systems a clearer view of the real business.',
    media: pressroom.services.contentSchema,
    relatedServices: serviceLinks.contentSchema.services,
    relatedGuides: serviceLinks.contentSchema.guides,
    actions: [
      { label: 'Map the missing pages', href: '/contact/' },
      { label: 'Read the entity architecture guide', href: '/insights/entity-first-content-architecture/', secondary: true },
    ],
    sections: [
      {
        title: 'Begin with the business entities and relationships',
        tone: 'paper',
        html: `<p>Before producing more content, Atlas maps the things the business can accurately describe: the organization, people, services, locations, customers, qualifications, process, proof, questions, and source material.</p>
        <p>That map decides which pages deserve to exist, which facts should stay consistent, and where a visitor should move next. It also prevents a blog library from becoming an isolated pile of topics.</p>`,
      },
      {
        title: 'Build reusable structure without producing duplicate pages',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Service templates</h3><p>Give every offer a consistent decision path while preserving the details that make the service distinct.</p></li>
          <li class="fact-card"><h3>Evidence patterns</h3><p>Attach claims to projects, dated captures, sources, people, or implementation artifacts that a visitor can inspect.</p></li>
          <li class="fact-card"><h3>Answer blocks</h3><p>Place concise direct answers near the question while keeping the full explanation and source context available.</p></li>
          <li class="fact-card"><h3>Internal links</h3><p>Connect services to complementary services, relevant guides, public work, people, and the next useful action.</p></li>
          <li class="fact-card"><h3>Source controls</h3><p>Record where important facts came from, when evidence was captured, and which statements remain pending.</p></li>
          <li class="fact-card"><h3>Structured data</h3><p>Express the same visible truth through accurate organization, person, service, article, image, and breadcrumb markup.</p></li>
        </ul>`,
      },
      {
        title: 'Write, connect, validate, and publish',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Inventory approved facts and sources.</strong> Separate verified public information from ideas, internal context, and unsupported claims.</li>
          <li><strong>Choose the page job.</strong> Define the question, audience, decision, proof, and next link before writing.</li>
          <li><strong>Build the visible content.</strong> Use plain language, useful depth, headings, media, tables, and direct answers where they help.</li>
          <li><strong>Add accurate structure.</strong> Connect the page internally and add only the schema supported by the visible content.</li>
          <li><strong>Inspect the release.</strong> Validate HTML, links, media alternatives, schema, canonical metadata, and the production route.</li>
        </ol>`,
      },
      {
        title: 'Content earns visibility by being useful and connected',
        html: `<p>No template or schema type guarantees search inclusion or an AI citation. A strong content system creates better source material and a clearer site architecture. <a href="/technical-seo/">Technical SEO</a> keeps that material accessible, while <a href="/aeo-geo/">AEO and GEO</a> focus on the answer surfaces and the dated evidence used to measure them.</p>`,
      },
    ],
  },
  {
    path: '/hubspot-crm-agents/',
    navSection: 'services',
    pageKind: 'service',
    serviceKey: 'hubspotCrm',
    title: 'HubSpot and CRM Agents for Website Handoffs | IMMOHRTAL',
    description: 'Connect website forms, HubSpot, CRM lifecycle stages, governed research, follow-up preparation, routing, and quality control without losing human approval.',
    h1: 'Turn website interest into useful context, not another messy inbox.',
    lede: 'A strong handoff records what the person asked for, routes it to the correct place, prepares the next step, and keeps approval around consequential communication.',
    media: pressroom.services.hubspotCrm,
    relatedServices: serviceLinks.hubspotCrm.services,
    relatedGuides: serviceLinks.hubspotCrm.guides,
    actions: [
      { label: 'Show me the current handoff', href: '/contact/' },
      { label: 'Read the integration guide', href: '/insights/hubspot-business-agents-safe-integration/', secondary: true },
    ],
    sections: [
      {
        title: 'The form is only the first handoff',
        tone: 'paper',
        html: `<p>A website inquiry should arrive with enough context to make the next decision easier. That includes the exact source page, service interest, campaign context when available, consent, ownership, and the information the visitor intentionally supplied.</p>
        <p>Relay moves that packet to the correct HubSpot or CRM route. Proof checks the destination and the rules before an agent prepares any consequential follow-up.</p>`,
      },
      {
        title: 'Build the lifecycle around the real business process',
        html: `<ul class="fact-grid">
          <li class="fact-card"><h3>Forms and fields</h3><p>Collect only useful information, preserve consent, and keep the mobile experience simple enough to complete.</p></li>
          <li class="fact-card"><h3>Exact routing</h3><p>Resolve the right portal, pipeline, owner, team, client, and environment before any record or task is changed.</p></li>
          <li class="fact-card"><h3>Lifecycle stages</h3><p>Use definitions that match the way the business qualifies, follows up, serves, and closes work.</p></li>
          <li class="fact-card"><h3>Context enrichment</h3><p>Prepare bounded company, website, and source research without overwriting verified CRM truth.</p></li>
          <li class="fact-card"><h3>Follow-up preparation</h3><p>Draft the next message or task with the current thread, routing, facts, and uncertainty visible for review.</p></li>
          <li class="fact-card"><h3>Quality receipts</h3><p>Read back the destination, fields, ownership, source, approval, and resulting state before reporting completion.</p></li>
        </ul>`,
      },
      {
        title: 'Prepare autonomously. Act with the right approval.',
        tone: 'blue',
        html: `<ol class="steps">
          <li><strong>Receive the website event.</strong> Capture the submitted information and source context without inventing missing facts.</li>
          <li><strong>Resolve the destination.</strong> Select the exact CRM, portal, pipeline, owner, and client boundary.</li>
          <li><strong>Prepare the next artifact.</strong> Organize research, create a task, or draft a reply using the current record and approved sources.</li>
          <li><strong>Pause at consequential action.</strong> Sending, publishing, spend, ambiguous writes, and human-only login gates retain explicit approval.</li>
          <li><strong>Verify the resulting state.</strong> Read back the record, routing, draft, or task and preserve the evidence that proves what changed.</li>
        </ol>`,
      },
      {
        title: 'Start with one broken handoff',
        html: `<p>The first useful project might be a form that loses source context, a pipeline nobody trusts, a repeated research step, a draft process that ignores the full thread, or an agent that cannot explain what it changed.</p>
        <p>Start there. If the wider workflow needs a bounded research or quality worker, connect the handoff to the <a href="/business-agents/">business agent system</a>. If the public page is collecting the wrong information, improve the <a href="/web-design-optimization/">website experience</a> first.</p>`,
      },
    ],
  },
]

export const corePages = [
  ...baseCorePages.map((page) => ({ ...page, ...pageEnhancements[page.path] })),
  ...newCorePages,
]

export const insightsPage = {
  path: '/insights/',
  navSection: 'insights',
  title: 'AEO, GEO, Web Optimization, and Business Agent Insights | IMMOHRTAL',
  description: 'Evidence led guides to AEO, GEO, Google AI Overviews, website redesign, schema, AI crawlers, JavaScript SEO, HubSpot agents, measurement, entities, and governance.',
  eyebrow: 'IMMOHRTAL insights',
  h1: 'Plain English guides to better websites, better visibility, and useful AI workers.',
  lede: 'Ten detailed guides explain how to improve a website, help more of the right people find it, connect it to HubSpot, and use AI without giving up control. The technical terms are here when they matter, and every guide links to relevant academic research.',
  media: pressroom.guides,
}
