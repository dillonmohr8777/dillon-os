import { articles } from './articles.mjs'

// Govern one distinct search job for every canonical route. These targets are
// used for build validation and structured topics, not a legacy meta-keywords
// tag (which Google does not use for ranking).
const coreSearchTargets = {
  '/': { primary: 'website marketing solutions', supporting: ['website design for service businesses', 'SEO for service businesses', 'AI search visibility', 'business agents'] },
  '/about/': { primary: 'Dillon Mohr', supporting: ['IMMOHRTAL Marketing Solutions', 'website strategist', 'marketing automation'] },
  '/web-design-optimization/': { primary: 'website optimization for service businesses', supporting: ['website redesign', 'conversion optimization', 'accessible web design', 'technical website optimization'] },
  '/aeo-geo/': { primary: 'AEO and GEO services', supporting: ['answer engine optimization', 'generative engine optimization', 'AI search visibility', 'SEO for service businesses'] },
  '/business-agents/': { primary: 'business agents', supporting: ['AI agents for business', 'marketing automation agents', 'human in the loop AI', 'business process automation'] },
  '/work/': { primary: 'website design and optimization work', supporting: ['service business web design', 'website redesign portfolio', 'conversion focused websites'] },
  '/contact/': { primary: 'contact IMMOHRTAL Marketing Solutions', supporting: ['website project consultation', 'AI search project', 'marketing automation consultation'] },
  '/services/': { primary: 'website and search services', supporting: ['web design services', 'technical SEO services', 'content architecture', 'business agents'] },
  '/pricing/': { primary: 'monthly marketing services pricing', supporting: ['technical SEO pricing', 'AEO pricing', 'GEO pricing', 'Google Ads management pricing'] },
  '/web-design/': { primary: 'web design for service businesses', supporting: ['custom website design', 'distinctive web design', 'responsive website design', 'conversion focused web design'] },
  '/technical-seo/': { primary: 'technical SEO for service websites', supporting: ['website crawlability', 'indexing optimization', 'canonical tags', 'XML sitemap'] },
  '/content-schema/': { primary: 'content architecture and schema', supporting: ['schema markup services', 'structured data', 'entity based SEO', 'internal linking strategy'] },
  '/hubspot-crm-agents/': { primary: 'HubSpot CRM agents', supporting: ['HubSpot automation', 'CRM automation', 'website lead routing', 'AI CRM integration'] },
  '/insights/': { primary: 'website and AI search guides', supporting: ['technical SEO guides', 'AEO guides', 'GEO guides', 'website optimization guides'] },
}

const articleSearchTargets = Object.fromEntries(articles.map((article) => [
  `/insights/${article.slug}/`,
  { primary: article.keywords[0], supporting: article.keywords.slice(1) },
]))

export const searchTargets = Object.freeze({ ...coreSearchTargets, ...articleSearchTargets })

export const searchTopicsFor = (route) => {
  const target = searchTargets[route]
  return target ? [target.primary, ...target.supporting] : []
}
