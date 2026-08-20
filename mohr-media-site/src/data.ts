export type Project = {
  name: string
  role: string
  summary: string
  image: string
  url: string
  tags: string[]
  featured?: boolean
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
] as const

export const videos = [
  {
    title: 'Public service cannot pause.',
    eyebrow: 'Align HCM · August 2026 · 60 seconds',
    source: '/media/public-service-cannot-pause.mp4',
    poster: '/media/public-service-cannot-pause.png',
    summary: 'A fully edited public sector campaign film connecting workforce continuity to the essential services communities depend on.',
    format: 'portrait',
  },
  {
    title: 'Foundation to skyscraper.',
    eyebrow: 'Maher and Brent · August 2026',
    source: '/media/foundation-to-skyscraper.mp4',
    poster: '/media/foundation-to-skyscraper.png',
    summary: 'A clean podcast edit that turns long form executive conversation into a focused social story about building lasting HCM value.',
    format: 'landscape',
  },
  {
    title: 'Leverage the system.',
    eyebrow: 'Maher and Brent · August 2026',
    source: '/media/leverage-the-system.mp4',
    poster: '/media/leverage-the-system.png',
    summary: 'A polished social cut about moving beyond basic administration and using the full value already inside the platform.',
    format: 'landscape',
  },
] as const
