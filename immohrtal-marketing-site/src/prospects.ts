export type Prospect = {
  slug: string
  name: string
  logo: string
  seed: number
  segment: 'services' | 'platform'
}

export const prospects: Prospect[] = [
  { slug: 'hrchitect', name: 'HRchitect', logo: '/clients/hrchitect.svg', seed: 571707413, segment: 'services' },
  { slug: 'sability', name: 'Sability', logo: '/prospects/sability.webp', seed: 73124119, segment: 'services' },
  { slug: 'mosaic-consulting-group', name: 'Mosaic Consulting Group', logo: '/prospects/mosaic.png', seed: 10492837, segment: 'services' },
  { slug: 'hr-path', name: 'HR Path', logo: '/prospects/hr-path.png', seed: 90811423, segment: 'services' },
  { slug: 'covalence-consulting', name: 'Covalence Consulting', logo: '/prospects/covalence.png', seed: 3894217, segment: 'services' },
  { slug: 'clearcourse-consulting', name: 'ClearCourse Consulting', logo: '/prospects/clearcourse.png', seed: 81834491, segment: 'services' },
  { slug: 'authentic-consulting', name: 'Authentic Consulting Group', logo: '/prospects/authentic.png', seed: 12370111, segment: 'services' },
  { slug: 'hcm-unlocked', name: 'HCM Unlocked', logo: '/prospects/hcm-unlocked.png', seed: 71811409, segment: 'services' },
  { slug: 'onesource-virtual', name: 'OneSource Virtual', logo: '/prospects/onesource-virtual.svg', seed: 66104093, segment: 'services' },
  { slug: 'surety-systems', name: 'Surety Systems', logo: '/prospects/surety-systems.png', seed: 22083763, segment: 'services' },
  { slug: 'ukg', name: 'UKG', logo: '/prospects/ukg.png', seed: 48225583, segment: 'platform' },
  { slug: 'dayforce', name: 'Dayforce', logo: '/prospects/dayforce.png', seed: 99517331, segment: 'platform' },
  { slug: 'workday', name: 'Workday', logo: '/prospects/workday.svg', seed: 20153371, segment: 'platform' },
  { slug: 'paylocity', name: 'Paylocity', logo: '/prospects/paylocity.png', seed: 64835149, segment: 'platform' },
  { slug: 'hibob', name: 'HiBob', logo: '/prospects/hibob.svg', seed: 35521723, segment: 'platform' },
  { slug: 'adp', name: 'ADP', logo: '/prospects/adp.svg', seed: 74010517, segment: 'platform' },
]

export const defaultProspect = prospects[0]

export function getProspectFromPath(pathname: string) {
  const deploymentSlug = import.meta.env.VITE_PROSPECT_SLUG?.trim().toLowerCase()
  if (deploymentSlug === 'general') return null
  if (deploymentSlug) return prospects.find((prospect) => prospect.slug === deploymentSlug) ?? null

  const routeSlug = pathname.match(/^\/for\/([^/?#]+)/)?.[1]?.toLowerCase()
  return prospects.find((prospect) => prospect.slug === routeSlug) ?? null
}
