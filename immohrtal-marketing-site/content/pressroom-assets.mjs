const image = (folder, slug, alt, caption, agent = 'crew', brands = []) => ({
  src: `/pressroom/${folder}/${slug}.webp`,
  width: 1536,
  height: 1024,
  alt,
  caption,
  agent,
  brands,
})

export const pressroom = {
  agents: {
    scout: image('agents', 'scout-canonical', 'Scout, a compact IMMOHRTAL robot, scans a website proof with two cyan optical lenses.', 'Scout checks what customers and crawlers can actually see.', 'scout'),
    atlas: image('agents', 'atlas-canonical', 'Atlas, a tall one-eyed IMMOHRTAL robot, balances connected website and business modules in an orbital system.', 'Atlas keeps pages, proof, measurement, and handoffs connected.', 'atlas'),
    forge: image('agents', 'forge-canonical', 'Forge, a broad IMMOHRTAL fabrication robot, assembles a website proof on a production bench.', 'Forge turns the approved direction into a responsive working build.', 'forge'),
    relay: image('agents', 'relay-canonical', 'Relay, a fast IMMOHRTAL integration robot, carries verified information between two website stations.', 'Relay moves the right context to the right system and person.', 'relay'),
    proof: image('agents', 'proof-canonical', 'Proof, an armored IMMOHRTAL inspection robot, studies a website through an oversized monocle.', 'Proof looks for the reason a release should not ship yet.', 'proof'),
  },
  home: [
    image('home', 'crew-opening-shift', 'The five IMMOHRTAL robot agents begin a coordinated shift around a long editorial production table.', 'Five personalities. One connected website operation.'),
    image('home', 'proof-conveyor', 'IMMOHRTAL robots move website proofs from audit through design, search preparation, integration, and review.', 'Every handoff leaves a visible artifact instead of a mystery status.'),
    image('home', 'launch-handoff', 'Forge and Proof prepare a finished website release while Relay carries the verified handoff forward.', 'A release moves only after the build and the evidence agree.'),
  ],
  servicesHub: [
    image('services', 'service-map-atlas', 'Atlas arranges seven connected service modules around an orbital website system.', 'Start with the problem. Then connect only the services that solve it.', 'atlas'),
    image('services', 'handoff-relay', 'Relay moves a sealed website proof between design, search, CRM, and review stations.', 'The site, search presence, and business handoff should work as one system.', 'relay'),
    image('services', 'audit-table-scout', 'Scout examines several website proofs on a large technical audit table.', 'A focused audit identifies the first change worth making.', 'scout'),
  ],
  services: {
    webDesign: [
      image('services', 'web-design-forge-wireframe', 'Forge assembles a distinctive website layout from large paper modules and browser frames.', 'A memorable page begins with a clear hierarchy, not decoration.', 'forge'),
      image('services', 'web-design-atlas-system', 'Atlas balances responsive website sections across desktop, tablet, and mobile proof sheets.', 'One visual system must hold together at every useful width.', 'atlas'),
      image('services', 'web-design-proof-mobile', 'Proof inspects a mobile website proof with a magnifying optic and measurement tools.', 'Mobile is reviewed as the real experience, not a smaller desktop afterthought.', 'proof'),
    ],
    websiteOptimization: [
      image('services', 'optimization-scout-audit', 'Scout scans a live website proof for slow, confusing, and inaccessible areas.', 'Optimization starts with the live experience and a reproducible finding.', 'scout'),
      image('services', 'optimization-forge-tune', 'Forge adjusts a website production press while page modules move through at higher speed.', 'Performance improvements should preserve the design and strengthen the experience.', 'forge'),
      image('services', 'optimization-proof-release', 'Proof compares before and after website proofs at a release inspection station.', 'A change is complete when the browser, measurement, and page still agree.', 'proof'),
    ],
    technicalSeo: [
      image('services', 'technical-seo-scout-crawl', 'Scout traces a crawl path across linked website pages laid out on a dark inspection floor.', 'Important pages need a clean path from discovery to useful content.', 'scout'),
      image('services', 'technical-seo-atlas-architecture', 'Atlas organizes canonical pages, internal links, and structured content into one orbital architecture.', 'Technical SEO gives the public site an understandable shape.', 'atlas'),
      image('services', 'technical-seo-proof-validation', 'Proof validates a structured website release against visible page content.', 'Markup earns trust by matching what a visitor can actually see.', 'proof'),
    ],
    aeoGeo: [
      image('services', 'aeo-geo-scout-answer', 'Scout studies an AI answer proof and traces its supporting website sources.', 'Useful answers start with clear source pages, not acronym stuffing.', 'scout', ['google']),
      image('services', 'aeo-geo-atlas-entities', 'Atlas connects services, people, proof, locations, and questions in an entity orbit.', 'A connected business story is easier for people and machines to understand.', 'atlas', ['chatgpt', 'claude', 'perplexity']),
      image('services', 'aeo-geo-proof-sources', 'Proof compares an answer card with the source pages that support it.', 'Visibility evidence is dated, sourced, and never treated as a permanent promise.', 'proof', ['google', 'chatgpt', 'claude', 'perplexity']),
    ],
    contentSchema: [
      image('services', 'content-schema-forge-template', 'Forge builds a reusable service-page template from editorial content modules.', 'Templates create consistency without turning every business into the same website.', 'forge'),
      image('services', 'content-schema-atlas-graph', 'Atlas organizes service, organization, person, location, and article information into one content graph.', 'Structure helps every page explain what it is and how it relates.', 'atlas'),
      image('services', 'content-schema-proof-claims', 'Proof checks a content proof and rejects unsupported claim fragments.', 'The strongest schema and content systems begin with accurate visible claims.', 'proof'),
    ],
    businessAgents: [
      image('services', 'business-agents-crew-briefing', 'The five IMMOHRTAL robots receive separate job briefs around an operations table.', 'An AI worker needs one bounded job before it needs more access.', 'crew', ['chatgpt', 'claude', 'perplexity']),
      image('services', 'business-agents-relay-approval', 'Relay pauses at a human approval gate while carrying a prepared work packet.', 'Automation prepares the work. Consequential action keeps an explicit approval.', 'relay'),
      image('services', 'business-agents-proof-receipt', 'Proof reviews an agent work receipt containing sources, route, status, and approval marks.', 'A useful worker can explain what it checked and what happened next.', 'proof'),
    ],
    hubspotCrm: [
      image('services', 'hubspot-relay-routing', 'Relay routes a website inquiry packet into the correct CRM pipeline station.', 'Forms should carry useful context without leaking it across clients.', 'relay', ['hubspot']),
      image('services', 'hubspot-atlas-lifecycle', 'Atlas arranges contact, company, deal, and follow-up stages into a calm lifecycle orbit.', 'CRM architecture should match the way the business actually follows through.', 'atlas', ['hubspot']),
      image('services', 'hubspot-proof-governance', 'Proof checks a CRM handoff for destination, consent, ownership, and approval.', 'The right automation also knows when to stop.', 'proof', ['hubspot']),
    ],
  },
  guides: {
    'aeo-vs-geo-service-businesses': image('guides', 'aeo-vs-geo-service-businesses', 'Atlas compares two answer-discovery paths that reconnect to the same service website.', 'AEO and GEO are overlapping disciplines, not competing magic formulas.', 'atlas', ['google', 'chatgpt', 'claude', 'perplexity']),
    'google-ai-overviews-service-businesses': image('guides', 'google-ai-overviews-service-businesses', 'Scout investigates a Google AI answer proof and its linked source pages.', 'Build source pages worth understanding before chasing an answer surface.', 'scout', ['google']),
    'website-redesign-checklist-service-businesses': image('guides', 'website-redesign-checklist-service-businesses', 'Forge arranges a website redesign checklist beside desktop and mobile proofs.', 'A redesign checklist protects the business problem from getting lost in the visuals.', 'forge'),
    'schema-markup-service-businesses': image('guides', 'schema-markup-service-businesses', 'Proof compares structured data blocks with the visible service page they describe.', 'Accurate schema repeats visible truth in a machine-readable form.', 'proof'),
    'ai-search-crawlers-discovery-citations': image('guides', 'ai-search-crawlers-discovery-citations', 'Scout follows crawler paths from discovery through source selection and citation.', 'Discovery, retrieval, understanding, and citation are different steps.', 'scout'),
    'javascript-seo-react-crawlable-html': image('guides', 'javascript-seo-react-crawlable-html', 'Forge prints complete HTML pages while a browser renderer assembles an enhanced interface beside them.', 'The useful answer should exist before the enhancement arrives.', 'forge'),
    'hubspot-business-agents-safe-integration': image('guides', 'hubspot-business-agents-safe-integration', 'Relay carries a verified form packet through a CRM and agent approval route.', 'Safe integration depends on exact routing, useful context, and bounded action.', 'relay', ['hubspot', 'chatgpt', 'claude']),
    'measure-ai-search-visibility': image('guides', 'measure-ai-search-visibility', 'Atlas and Proof review dated answer samples, citations, and source coverage without a fake ranking meter.', 'AI visibility is sampled evidence, not a universal score.', 'proof', ['google', 'chatgpt', 'claude', 'perplexity']),
    'entity-first-content-architecture': image('guides', 'entity-first-content-architecture', 'Atlas builds a connected content system around a service business entity.', 'Entity-first architecture makes relationships explicit before content volume grows.', 'atlas'),
    'human-approval-gates-for-marketing-agents': image('guides', 'human-approval-gates-for-marketing-agents', 'Proof guards a release gate while Relay waits with prepared marketing work.', 'Approval gates separate useful preparation from consequential action.', 'proof'),
  },
  about: [
    image('about', 'studio-accountability', 'The five IMMOHRTAL robots gather around one review desk with a single clearly marked human approval position.', 'One accountable studio. Five bounded workers. No mystery ownership.'),
    image('about', 'human-approval-desk', 'A human hand reviews a website proof while Scout, Relay, and Proof wait with supporting evidence.', 'AI can prepare the evidence. Dillon remains accountable for the decision.'),
  ],
  work: [
    image('work', 'website-gallery-press', 'Forge and Atlas arrange seven distinct website proofs across a large editorial gallery wall.', 'The portfolio stays varied because each business starts with a different problem.'),
    image('work', 'project-review-night', 'Scout, Relay, and Proof inspect several live website releases during a late production review.', 'A screenshot is the beginning of the review, not the end.'),
  ],
  contact: [
    image('contact', 'scout-inbox-triage', 'Scout sorts incoming website problems into clear first-step audit folders.', 'You do not need a polished brief. Start with what feels broken.', 'scout'),
    image('contact', 'relay-message-handoff', 'Relay delivers a concise website problem brief to a human review station.', 'The first useful response should make the next decision easier.', 'relay'),
  ],
}

export const allPressroomAssets = [
  ...Object.values(pressroom.agents),
  ...pressroom.home,
  ...pressroom.servicesHub,
  ...Object.values(pressroom.services).flat(),
  ...Object.values(pressroom.guides),
  ...pressroom.about,
  ...pressroom.work,
  ...pressroom.contact,
]

if (allPressroomAssets.length !== 48) {
  throw new Error(`Expected 48 Agent Pressroom images, found ${allPressroomAssets.length}`)
}
