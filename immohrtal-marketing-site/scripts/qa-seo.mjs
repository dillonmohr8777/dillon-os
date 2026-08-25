import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { articles } from '../content/articles.mjs'
import { corePages, insightsPage, site } from '../content/site-content.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')
const expectedRoutes = ['/', ...corePages.map((page) => page.path), insightsPage.path, ...articles.map((article) => `/insights/${article.slug}/`)]
const routeSet = new Set(expectedRoutes)
const errors = []
const warnings = []
const pageReports = []

const academicHosts = [
  'aclanthology.org',
  'arxiv.org',
  'dl.acm.org',
  'doi.org',
  'frontiersin.org',
  'link.springer.com',
  'nature.com',
  'sciencedirect.com',
  'usenix.org',
]

const addError = (route, message) => errors.push(`${route}: ${message}`)
const addWarning = (route, message) => warnings.push(`${route}: ${message}`)
const routeFile = (route) => route === '/'
  ? path.join(projectRoot, 'index.html')
  : path.join(publicDir, route.replace(/^\/+|\/+$/g, ''), 'index.html')
const fileText = (file) => readFileSync(file, 'utf8')
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))?.[1]
const tagText = (html, tag) => html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''
const metaContent = (html, key, value) => {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  const match = tags.find((tag) => attr(tag, key)?.toLowerCase() === value.toLowerCase())
  return match ? attr(match, 'content') : undefined
}
const canonicalHref = (html) => {
  const tags = html.match(/<link\b[^>]*>/gi) || []
  const match = tags.find((tag) => attr(tag, 'rel')?.split(/\s+/).includes('canonical'))
  return match ? attr(match, 'href') : undefined
}
const localAssetFile = (urlPath) => path.join(publicDir, decodeURIComponent(urlPath).replace(/^\/+/, ''))
const localAssetExists = (urlPath) => existsSync(localAssetFile(urlPath))
const isAcademicHost = (hostname) => academicHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
const normalizeRoute = (pathname) => pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`

const schemaTypes = (html, route) => {
  const scripts = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || []
  const types = new Set()
  for (const script of scripts) {
    const raw = script.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim()
    try {
      const data = JSON.parse(raw)
      const nodes = data['@graph'] || [data]
      for (const node of nodes) {
        const values = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']]
        values.filter(Boolean).forEach((type) => types.add(type))
      }
    } catch (error) {
      addError(route, `invalid JSON-LD (${error.message})`)
    }
  }
  return types
}

const validateImages = (html, route) => {
  const imageTags = html.match(/<img\b[^>]*>/gi) || []
  for (const tag of imageTags) {
    const src = attr(tag, 'src')
    const altMatch = tag.match(/\salt=["']([^"']*)["']/i)
    if (!src) addError(route, 'image is missing src')
    if (!altMatch) addError(route, `image ${src || '(unknown)'} is missing alt`)
    if (!attr(tag, 'width') || !attr(tag, 'height')) addError(route, `image ${src || '(unknown)'} is missing intrinsic width or height`)
    if (src?.startsWith('/') && !localAssetExists(new URL(src, site.origin).pathname)) addError(route, `missing local image ${src}`)
    const srcset = attr(tag, 'srcset')
    if (srcset) {
      for (const candidate of srcset.split(',').map((value) => value.trim().split(/\s+/)[0]).filter(Boolean)) {
        if (candidate.startsWith('/') && !localAssetExists(new URL(candidate, site.origin).pathname)) addError(route, `missing srcset image ${candidate}`)
      }
    }
  }
  const socialImage = metaContent(html, 'property', 'og:image')
  if (!socialImage) addError(route, 'missing og:image')
  else {
    const parsed = new URL(socialImage, site.origin)
    if (parsed.origin === site.origin && !localAssetExists(parsed.pathname)) addError(route, `missing local og:image ${parsed.pathname}`)
  }
  if (!metaContent(html, 'property', 'og:image:alt')) addError(route, 'missing og:image:alt')
}

const validateLinks = (html, route, canonical) => {
  const anchorTags = html.match(/<a\b[^>]*>/gi) || []
  const ids = new Set((html.match(/\sid=["'][^"']+["']/gi) || []).map((match) => match.replace(/^\sid=["']|["']$/gi, '')))
  for (const tag of anchorTags) {
    const href = attr(tag, 'href')
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) continue
    const url = new URL(href, canonical)
    if (url.origin !== site.origin) continue
    if (url.hash && url.pathname === new URL(canonical).pathname && !ids.has(decodeURIComponent(url.hash.slice(1)))) {
      addError(route, `fragment does not exist: ${href}`)
    }
    if (/\.[a-z0-9]{2,8}$/i.test(url.pathname)) {
      if (!localAssetExists(url.pathname)) addError(route, `missing linked local file ${url.pathname}`)
      continue
    }
    const targetRoute = normalizeRoute(url.pathname)
    if (!routeSet.has(targetRoute)) addError(route, `internal link has no generated route: ${href}`)
  }
}

if (expectedRoutes.length !== 23 || routeSet.size !== 23) {
  errors.push(`route inventory must contain 23 unique pages; found ${expectedRoutes.length} total and ${routeSet.size} unique`)
}

const seenTitles = new Map()
for (const route of expectedRoutes) {
  const file = routeFile(route)
  if (!existsSync(file)) {
    addError(route, `missing HTML file ${file}`)
    continue
  }
  const html = fileText(file)
  const expectedCanonical = new URL(route, site.origin).toString()
  const canonical = canonicalHref(html)
  const title = tagText(html, 'title')
  const description = metaContent(html, 'name', 'description') || ''
  const h1Count = (html.match(/<h1\b/gi) || []).length
  const types = schemaTypes(html, route)

  if (/themohrmedia\.com|\bMohr Media\b/i.test(html)) addError(route, 'contains stale Mohr Media domain or brand text')
  if (canonical !== expectedCanonical) addError(route, `canonical is ${canonical || 'missing'}; expected ${expectedCanonical}`)
  if (metaContent(html, 'property', 'og:url') !== expectedCanonical) addError(route, 'og:url does not match canonical')
  if (metaContent(html, 'property', 'og:title') !== title) addError(route, 'og:title does not match the page title')
  if (metaContent(html, 'property', 'og:description') !== description) addWarning(route, 'og:description differs from the meta description')
  if (metaContent(html, 'name', 'twitter:title') !== title) addError(route, 'twitter:title does not match the page title')
  if (metaContent(html, 'name', 'twitter:description') !== description) addWarning(route, 'twitter:description differs from the meta description')
  if (!metaContent(html, 'name', 'robots')?.includes('index,follow')) addError(route, 'missing index,follow robots directive')
  if (!title) addError(route, 'missing title')
  if (title.length < 20 || title.length > 80) addWarning(route, `title length is ${title.length}; target range is 20 to 80`)
  if (!description) addError(route, 'missing meta description')
  if (description.length < 110 || description.length > 180) addWarning(route, `description length is ${description.length}; target range is 110 to 180`)
  if (h1Count !== 1) addError(route, `expected exactly one h1; found ${h1Count}`)
  if (seenTitles.has(title)) addError(route, `duplicates title used by ${seenTitles.get(title)}`)
  seenTitles.set(title, route)

  const requiredTypes = route === '/'
    ? ['Organization', 'WebSite']
    : route.startsWith('/insights/') && route !== '/insights/'
      ? ['Organization', 'WebSite', 'Person', 'BreadcrumbList', 'WebPage', 'Article']
      : ['Organization', 'WebSite', 'BreadcrumbList', route === '/insights/' || route === '/services/' || route === '/work/' ? 'CollectionPage' : 'WebPage']
  for (const type of requiredTypes) if (!types.has(type)) addError(route, `missing ${type} schema`)

  const corePage = corePages.find((page) => page.path === route)
  if (corePage?.pageKind === 'service' && !types.has('Service')) addError(route, 'service page is missing Service schema')
  if (corePage?.schema === 'profile' && (!types.has('ProfilePage') || !types.has('Person'))) addError(route, 'about page is missing ProfilePage or Person schema')
  const article = articles.find((item) => `/insights/${item.slug}/` === route)
  if (article?.faqs?.length && !types.has('FAQPage')) addError(route, 'visible FAQs are missing FAQPage schema')
  if (!article?.faqs?.length && types.has('FAQPage')) addError(route, 'FAQPage schema exists without visible FAQ content')
  if (article?.faqs?.length && !/\sid=["']faq["']/i.test(html)) addError(route, 'FAQPage schema exists but the visible FAQ section is missing')
  for (const source of article?.sources || []) if (!html.includes(`href="${source.url}"`)) addError(route, `academic source is not rendered as a link: ${source.url}`)

  validateImages(html, route)
  validateLinks(html, route, expectedCanonical)
  pageReports.push({ route, titleLength: title.length, descriptionLength: description.length, schemas: [...types].sort() })
}

for (const article of articles) {
  const route = `/insights/${article.slug}/`
  if ((article.related || []).length < 4) addError(route, `needs at least four descriptive internal links; found ${article.related?.length || 0}`)
  if ((article.sources || []).length < 3) addError(route, `needs at least three academic sources; found ${article.sources?.length || 0}`)
  for (const source of article.sources || []) {
    let sourceUrl
    try {
      sourceUrl = new URL(source.url)
    } catch {
      addError(route, `source URL is invalid: ${source.url}`)
      continue
    }
    if (sourceUrl.protocol !== 'https:') addError(route, `source must use HTTPS: ${source.url}`)
    if (!isAcademicHost(sourceUrl.hostname)) addError(route, `external source is not on the academic allowlist: ${source.url}`)
    if (!source.title || source.title.length < 12) addError(route, `source has weak link text: ${source.title || '(missing)'}`)
    if (!source.organization || !source.note) addError(route, `source metadata is incomplete: ${source.url}`)
  }
  for (const [href, label] of article.related || []) {
    if (!href.startsWith('/') || !routeSet.has(normalizeRoute(new URL(href, site.origin).pathname))) addError(route, `related link does not target a generated route: ${href}`)
    if (!label || label.length < 8 || /^(read more|learn more|click here)$/i.test(label.trim())) addError(route, `related link text is not descriptive: ${label || '(missing)'}`)
  }
}

const sitemap = fileText(path.join(publicDir, 'sitemap.xml'))
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const expectedUrls = expectedRoutes.map((route) => new URL(route, site.origin).toString())
if (JSON.stringify([...sitemapUrls].sort()) !== JSON.stringify([...expectedUrls].sort())) errors.push('sitemap.xml does not contain the exact 23-route canonical set')
if (/themohrmedia\.com/i.test(sitemap)) errors.push('sitemap.xml contains the stale domain')

const robots = fileText(path.join(publicDir, 'robots.txt'))
if (!robots.includes(`Sitemap: ${site.origin}/sitemap.xml`)) errors.push('robots.txt sitemap directive does not use the canonical domain')
for (const bot of ['OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Googlebot', 'Bingbot']) {
  if (!new RegExp(`User-agent: ${bot}\\s+Allow: /`, 'i').test(robots)) errors.push(`robots.txt does not explicitly allow ${bot}`)
}
if (/themohrmedia\.com/i.test(robots)) errors.push('robots.txt contains the stale domain')

const feed = fileText(path.join(publicDir, 'feed.xml'))
for (const article of articles) {
  const url = `${site.origin}/insights/${article.slug}/`
  if (!feed.includes(`<link>${url}</link>`) || !feed.includes(`<guid isPermaLink="true">${url}</guid>`)) errors.push(`feed.xml is missing ${url}`)
}
if (!feed.includes(`<atom:link href="${site.origin}/feed.xml"`)) errors.push('feed.xml self link does not use the canonical domain')
if (/themohrmedia\.com/i.test(feed)) errors.push('feed.xml contains the stale domain')

const llms = fileText(path.join(publicDir, 'llms.txt'))
for (const url of expectedUrls) if (!llms.includes(url)) errors.push(`llms.txt is missing ${url}`)
if (/themohrmedia\.com/i.test(llms)) errors.push('llms.txt contains the stale domain')

const result = {
  ok: errors.length === 0,
  canonicalOrigin: site.origin,
  routesChecked: pageReports.length,
  articlesChecked: articles.length,
  errors,
  warnings,
  pages: pageReports,
}

console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1
