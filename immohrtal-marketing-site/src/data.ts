export type Project = {
  name: string
  role: string
  summary: string
  image: string
  url: string
  tags: string[]
  featured?: boolean
}

export type ClientBrand = readonly [name: string, image: string]

export type AgentRole = {
  id: string
  name: string
  role: string
  summary: string
  receipt: string
  accent: string
}

export const projects: Project[] = [
  {
    name: 'Align HCM: Public Sector',
    role: 'Strategy · UX · Design · Build',
    summary: 'A focused HCM experience translating implementation, compliance, support, and platform optimization into a public-sector decision path.',
    image: '/projects/align-public-sector.jpg',
    url: 'https://align-hcm-public-sector-expanded.netlify.app',
    tags: ['HCM', 'B2B', 'Interactive'],
    featured: true,
  },
  {
    name: 'Momentum 360',
    role: 'Creative direction · Web concept',
    summary: 'A darker, spatially driven marketing experience built to make virtual-tour work feel tangible before the visitor enters a property.',
    image: '/projects/momentum-360.png',
    url: 'https://momentum-360-redesign-dillo-20260520.netlify.app',
    tags: ['Spatial media', 'Web', '3D'],
  },
  {
    name: 'AMI Commercial Cleaning',
    role: 'UX · Design · Responsive build',
    summary: 'A commercial-services homepage with a clear service structure, interactive coverage story, proof hierarchy, and direct contact flow.',
    image: '/projects/ami.jpg',
    url: 'https://www.ami-cleaning.com',
    tags: ['Local services', 'CRO', 'Web'],
  },
  {
    name: 'Shadow Heating & Cooling',
    role: 'Growth · Content · Web operations',
    summary: 'A live local-service brand supported across web, Google Business Profile, content, and paid-media operations.',
    image: '/projects/shadow.jpg',
    url: 'https://shadow-heating.com',
    tags: ['Growth', 'Local SEO', 'Web'],
  },
  {
    name: 'Cindy May',
    role: 'Concept · Art direction · Build',
    summary: 'A warm, editorial commerce concept that turns a personal brand into a tactile, story-led digital storefront.',
    image: '/projects/cindy-may.jpg',
    url: 'https://cindy-may-warm-kitchen-homepage.netlify.app',
    tags: ['Editorial', 'Commerce', 'Brand'],
  },
  {
    name: 'Overhill Flowers',
    role: 'Concept · UX · Build',
    summary: 'A Philadelphia floral experience shaped around atmosphere, occasion, and a simple path from discovery to inquiry.',
    image: '/projects/overhill.jpg',
    url: 'https://overhill-flowers-philly-20260711.netlify.app',
    tags: ['Retail', 'Art direction', 'Web'],
  },
  {
    name: 'Graveley Roofing',
    role: 'Concept · UX · Build',
    summary: 'A service-site concept balancing homeowner clarity with spatial layouts, proof, and direct conversion paths.',
    image: '/projects/graveley.jpg',
    url: 'https://graveley-roofing-concept-20260709.netlify.app',
    tags: ['Home services', 'CRO', 'Web'],
  },
]

export const clients = [
  ['Align HCM', '/clients/align-hcm.png'],
  ['Momentum 360', '/clients/momentum-360.png'],
  ['Kimberly James Bridal', '/clients/kimberly-james.png'],
  ['BOK Law', '/clients/bok-law.png'],
  ['Fagan Painting', '/clients/fagan-painting.png'],
  ['Pro Fence & Deck', '/clients/pro-fence-deck.png'],
  ['NKCDC', '/clients/nkcdc.png'],
  ['Hope Wellness', '/clients/hope-wellness.png'],
  ['Omega Landscaping', '/clients/omega-landscaping.png'],
  ['Shadow Heating & Cooling', '/clients/shadow-hvac.png'],
  ['VA Claims Edge', '/clients/va-claims-edge.png'],
  ['Bar Crawl USA', '/clients/bar-crawl-usa.webp'],
  ['Onsite Concrete & Landscape', '/clients/onsite.png'],
  ['BigOrange Marketing', '/clients/bigorange.png'],
  ['Pritzker Law Group', '/clients/pritzker.png'],
  ['Tags 2 Go', '/clients/tags2go.png'],
  ['AMI Commercial Cleaning', '/clients/ami-cleaning.png'],
  ['Replenish at 7 Eleven', '/clients/replenish-7-eleven.png'],
  ['Revive Systems', '/clients/revive-systems.png'],
  ['Cindy May, Mrs. Christmas', '/clients/cindy-may.png'],
  ['Bridge Software', '/clients/bridge-software.svg'],
] as const satisfies readonly ClientBrand[]

export const agentRoles: AgentRole[] = [
  {
    id: 'INTEL',
    name: 'Scout',
    role: 'Website intelligence',
    summary: 'Inspects public sites, search surfaces, structure, performance, and conversion paths before a recommendation is written.',
    receipt: 'Maps to Prospect Radar, site grading, and source-located research.',
    accent: '0.431,0.878,1.0',
  },
  {
    id: 'ANSWER',
    name: 'Atlas',
    role: 'AEO / GEO architect',
    summary: 'Finds the questions, entities, evidence, schema, and content relationships answer engines can actually use.',
    receipt: 'Maps to the AEO trust gate, keyword research, entity packs, and citation scorecards.',
    accent: '0.345,0.929,0.698',
  },
  {
    id: 'BUILD',
    name: 'Forge',
    role: 'Web system builder',
    summary: 'Turns the diagnosis into an expressive, accessible site with reusable components and a conversion path that holds up.',
    receipt: 'Maps to the site factory, Impeccable design checks, and browser QA.',
    accent: '0.176,0.490,1.0',
  },
  {
    id: 'SYSTEM',
    name: 'Relay',
    role: 'CRM and agent integration',
    summary: 'Connects forms, HubSpot, routing, follow-up preparation, analytics, and operational agents without blending client data.',
    receipt: 'Maps to HubSpot agents, workflow gates, client routing, and governed communications.',
    accent: '0.361,0.851,0.780',
  },
  {
    id: 'PROOF',
    name: 'Proof',
    role: 'Independent QA',
    summary: 'Checks the build, evidence, accessibility, mobile behavior, and public claims before anything is called finished.',
    receipt: 'Maps to maker-checker review, automated tests, visual QA, and deployment receipts.',
    accent: '0.502,0.902,0.851',
  },
]
