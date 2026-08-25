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
    name: 'Align HCM — Main Experience',
    role: 'Positioning · Architecture · UX · Web operations',
    summary: 'The primary digital experience organized implementation, optimization, integrations, support, and post-launch services around real buyer decisions.',
    image: '/projects/align-live.jpg',
    url: 'https://www.alignhcm.com/',
    tags: ['HCM', 'B2B', 'Growth system'],
    featured: true,
  },
  {
    name: 'Align HCM — Public Sector',
    role: 'Vertical strategy · UX · Interactive build',
    summary: 'A focused experience translating workforce continuity, compliance, platform reality, and implementation support into a public-sector decision path.',
    image: '/projects/align-public-sector.jpg',
    url: 'https://align-hcm-public-sector-expanded.netlify.app',
    tags: ['Public sector', 'Story system', 'Interactive'],
  },
  {
    name: 'Align HCM — Industry System',
    role: 'Content system · Art direction · Motion',
    summary: 'A 24-frame visual language that made distinct operating environments feel specific while keeping one recognizable Align HCM system.',
    image: '/projects/align-industry-system.webp',
    url: 'https://www.alignhcm.com/',
    tags: ['Campaign', 'Motion', 'Sales enablement'],
  },
  {
    name: 'Align HCM — SmartCare',
    role: 'Product marketing · SEO · Conversion path',
    summary: 'A product-marketing pillar that gave continuous HCM support, optimization, platform stewardship, and post-launch confidence a clear story.',
    image: '/projects/align-live.jpg',
    url: 'https://www.alignhcm.com/align-hcm-smartcare',
    tags: ['Product story', 'SEO', 'Lifecycle'],
  },
]

export const alignSignals = [
  'Marketing strategy',
  'Website architecture',
  'SEO + AEO',
  'Thought leadership',
  'Customer proof',
  'Executive social',
  'Email nurture',
  'Event content',
  'Sales enablement',
  'HubSpot operations',
  'Attribution',
  'Competitive intelligence',
] as const

export const videos = [
  {
    title: 'Different missions. Same pressure.',
    eyebrow: 'Align HCM · 60 seconds',
    source: '/media/align-different-missions.mp4',
    poster: '/media/align-different-missions.jpg',
    summary: 'A public-sector motion piece built around the pressure shared by very different missions.',
  },
  {
    title: 'Public service cannot pause.',
    eyebrow: 'Align HCM · 60 seconds',
    source: '/media/align-public-service.mp4',
    poster: '/media/align-public-service.jpg',
    summary: 'A vertical campaign edit connecting workforce continuity to public-service reality.',
  },
  {
    title: 'Implementation starts before kickoff.',
    eyebrow: 'Align HCM · 30 seconds',
    source: '/media/align-before-kickoff.mp4',
    poster: '/media/align-before-kickoff.jpg',
    summary: 'A concise implementation story that makes preparation, alignment, and operating context visible.',
  },
] as const
