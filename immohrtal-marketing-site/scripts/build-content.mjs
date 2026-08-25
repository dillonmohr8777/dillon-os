import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { articles } from '../content/articles.mjs'
import { corePages, insightsPage, navigation, projects, site } from '../content/site-content.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(projectRoot, 'public')
const fontDir = path.join(publicDir, 'fonts')
const forbiddenDashPattern = /[\u2013\u2014]/u

const fontAssets = [
  ['node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2', 'Unbounded-Variable-Latin.woff2'],
  ['node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', 'Manrope-Variable-Latin.woff2'],
  ['src/fonts/IBMPlexMono-400.woff2', 'FoundryMono-400.woff2'],
  ['src/fonts/IBMPlexMono-500.woff2', 'FoundryMono-500.woff2'],
]

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const escapeXml = escapeHtml

const stripHtml = (value = '') => String(value)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const wordCount = (value = '') => {
  const plain = stripHtml(value)
  return plain ? plain.split(/\s+/).length : 0
}

const absoluteUrl = (route) => new URL(route, site.origin).toString()
const routeToFile = (route) => path.join(publicDir, route.replace(/^\/+|\/+$/g, ''), 'index.html')

const navHtml = (currentPath) => navigation.map((item) => {
  const current = currentPath === item.href || (item.href === '/insights/' && currentPath.startsWith('/insights/'))
  return `<a href="${item.href}"${current ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>`
}).join('')

const headerHtml = (currentPath) => `<header class="site-rail static-header">
  <div class="static-nav">
    <a class="wordmark brand-lockup" href="/" aria-label="IMMOHRTAL Marketing Solutions home">
      <img class="brand-logo--white" src="${site.logo}" width="600" height="160" alt="" fetchpriority="high">
      <span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span>
    </a>
    <button class="menu-button menu-toggle" type="button" aria-expanded="false" aria-controls="static-menu" data-menu-toggle>Menu</button>
    <nav class="nav-links" id="static-menu" data-menu aria-label="Primary navigation">${navHtml(currentPath)}</nav>
    <a class="rail-cta nav-action" href="/contact/">Let’s talk <span aria-hidden="true">→</span></a>
  </div>
</header>`

const arrowHtml = () => '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"></path></svg>'

const closingHtml = () => `<section class="closing-section" data-reveal>
  <img src="${site.logo}" width="600" height="160" alt="">
  <h2>Your website should make it easier for the right customer to say yes.</h2>
  <p>Show me what feels broken. I’ll help you find the right first move.</p>
  <a class="closing-cta" href="/contact/">Show me what to fix ${arrowHtml()}</a>
</section>`

const footerHtml = () => `<footer class="site-footer">
  <a class="wordmark footer-wordmark" href="/" aria-label="IMMOHRTAL Marketing Solutions home">
    <img class="brand-logo--white" src="${site.logo}" width="600" height="160" alt="">
    <span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span>
  </a>
  <p>Websites that stand out, get found, and hand less busywork to your team. Built by Dillon Mohr.</p>
  <a class="footer-action" href="/contact/">Fix my website</a>
</footer>`

const positioningStripHtml = () => `<section class="positioning-strip" aria-label="IMMOHRTAL focus" tabindex="0">
  <span>BETTER WEBSITES. EASIER TO FIND. BUILT TO WORK.</span><i></i>
  <span>GOOGLE, AI ANSWERS, AND THE PEOPLE SEARCHING</span><i></i>
  <span>AI WORKERS. HUMAN CONTROL.</span>
</section>`

const breadcrumbsFor = (page, article = false) => article
  ? [
      ['Home', '/'],
      ['Insights', '/insights/'],
      [page.title, `/insights/${page.slug}/`],
    ]
  : [
      ['Home', '/'],
      [page.h1, page.path],
    ]

const breadcrumbHtml = (crumbs) => `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([label, href], index) => `<li>${index === crumbs.length - 1 ? `<span aria-current="page">${escapeHtml(label)}</span>` : `<a href="${href}">${escapeHtml(label)}</a>`}</li>`).join('')}</ol></nav>`

const breadcrumbSchema = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, route], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: absoluteUrl(route),
  })),
})

const baseHead = ({ title, description, canonical, type = 'website', schema = [] }) => {
  const schemaGraph = Array.isArray(schema) ? schema : [schema]
  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#020711">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="application/rss+xml" title="IMMOHRTAL Insights" href="${site.origin}/feed.xml">
  <link rel="icon" type="image/png" href="${site.logo}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absoluteUrl(site.logo)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/static-site.css">
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph }).replaceAll('<', '\\u003c')}</script>
  <script src="/static-site.js" defer></script>`
}

const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': `${site.origin}/#organization`,
  name: site.name,
  alternateName: site.shortName,
  url: `${site.origin}/`,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl(site.logo),
  },
  email: site.email,
  founder: { '@id': `${site.origin}/about/#dillon-mohr` },
})

const profileSchema = () => ({
  '@type': 'ProfilePage',
  '@id': `${site.origin}/about/#profile`,
  url: `${site.origin}/about/`,
  name: 'Dillon Mohr, founder of IMMOHRTAL Marketing Solutions',
  mainEntity: {
    '@type': 'Person',
    '@id': `${site.origin}/about/#dillon-mohr`,
    name: 'Dillon Mohr',
    image: absoluteUrl(site.portrait),
    jobTitle: 'Founder and website strategist',
    worksFor: { '@id': `${site.origin}/#organization` },
  },
})

const projectGridHtml = () => `<div class="project-rail project-grid" tabindex="0" aria-label="Selected website work">${projects.map((project) => `<article class="project project-card" data-reveal>
  <a class="browser-frame" href="${project.url}" aria-label="Open ${escapeHtml(project.name)} live website">
    <span class="browser-bar"><i></i><i></i><i></i><em>${escapeHtml(project.url.replace(/^https?:\/\//, ''))}</em></span>
    <span class="browser-viewport"><img src="${project.image}" width="960" height="540" alt="Preview of the ${escapeHtml(project.name)} website" loading="lazy"></span>
    <span class="browser-open">View live ${arrowHtml()}</span>
  </a>
  <div class="project-copy project-card__body">
    <p>${escapeHtml(project.role)}</p>
    <h3>${escapeHtml(project.name)}</h3>
    <span>${escapeHtml(project.description)}</span>
    <ul class="tag-list" aria-label="Project disciplines">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
  </div>
</article>`).join('')}</div>`

const renderActions = (actions = []) => actions.length
  ? `<div class="hero-actions">${actions.map((action) => `<a class="button${action.secondary ? ' secondary' : ''}" href="${action.href}">${escapeHtml(action.label)} ${arrowHtml()}</a>`).join('')}</div>`
  : ''

const renderSection = (section) => {
  const tone = section.tone ? ` tone-${section.tone}` : ''
  const body = section.html === 'PROJECT_GRID' ? projectGridHtml() : section.html
  return `<section class="content-section${tone}">
    <div class="section-inner">
      <header class="section-heading" data-reveal>
        <h2>${escapeHtml(section.title)}</h2>
      </header>
      <div class="prose" data-reveal>${body}</div>
    </div>
  </section>`
}

const renderCorePage = (page) => {
  const canonical = absoluteUrl(page.path)
  const crumbs = breadcrumbsFor(page)
  const schema = [breadcrumbSchema(crumbs)]
  if (page.schema === 'profile') schema.push(organizationSchema(), profileSchema())

  return `<!doctype html>
<html lang="en">
<head>
  ${baseHead({ title: page.title, description: page.description, canonical, schema })}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${headerHtml(page.path)}
  <main id="main-content">
    <header class="page-hero persuade-hero">
      <div class="hero-inner">
        ${breadcrumbHtml(crumbs)}
        <div class="hero-grid">
          <h1>${escapeHtml(page.h1)}</h1>
          <div class="hero-support"><p class="hero-lede">${escapeHtml(page.lede)}</p>${renderActions(page.actions)}</div>
        </div>
      </div>
    </header>
    ${positioningStripHtml()}
    ${page.sections.map(renderSection).join('\n')}
    ${closingHtml()}
  </main>
  ${footerHtml()}
</body>
</html>
`
}

const articleWordCount = (article) => wordCount(`${article.directAnswer} ${article.sections.map((section) => `${section.title} ${section.html}`).join(' ')}`)

const articleSchema = (article, canonical) => ({
  '@type': 'Article',
  '@id': `${canonical}#article`,
  headline: article.title,
  description: article.description,
  datePublished: site.published,
  dateModified: site.modified,
  mainEntityOfPage: canonical,
  author: {
    '@type': 'Person',
    '@id': `${site.origin}/about/#dillon-mohr`,
    name: 'Dillon Mohr',
    url: `${site.origin}/about/`,
  },
  publisher: { '@id': `${site.origin}/#organization` },
  image: absoluteUrl(site.logo),
  wordCount: articleWordCount(article),
  inLanguage: 'en-US',
})

const renderArticle = (article) => {
  const route = `/insights/${article.slug}/`
  const canonical = absoluteUrl(route)
  const crumbs = breadcrumbsFor(article, true)
  const count = articleWordCount(article)
  const readingMinutes = Math.max(1, Math.ceil(count / 210))
  const schema = [articleSchema(article, canonical), organizationSchema(), breadcrumbSchema(crumbs)]

  const toc = article.sections.map((section) => `<li><a href="#${section.id}">${escapeHtml(section.title)}</a></li>`).join('')
  const sections = article.sections.map((section) => `<section id="${section.id}">
    <h2>${escapeHtml(section.title)}</h2>
    ${section.html}
  </section>`).join('\n')
  const sources = article.sources.map((source) => `<li><a href="${source.url}">${escapeHtml(source.title)}</a> <span>(${escapeHtml(source.organization)})</span><small>${escapeHtml(source.note)}</small></li>`).join('')
  const related = article.related.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join('')

  return `<!doctype html>
<html lang="en">
<head>
  ${baseHead({ title: `${article.title} | IMMOHRTAL`, description: article.description, canonical, type: 'article', schema })}
  <meta property="article:published_time" content="${site.published}">
  <meta property="article:modified_time" content="${site.modified}">
  <meta property="article:author" content="Dillon Mohr">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${headerHtml(route)}
  <main id="main-content">
    <header class="page-hero article-page-hero">
      <div class="hero-inner">
        ${breadcrumbHtml(crumbs)}
        <div class="hero-grid article-hero-grid">
          <h1>${escapeHtml(article.title)}</h1>
          <div class="hero-support">
            <p class="hero-lede">${escapeHtml(article.description)}</p>
            <div class="hero-meta">
              <span>By <a href="/about/"><strong>Dillon Mohr</strong></a></span>
              <span><time datetime="${site.modified}">August 24, 2026</time></span>
              <span>${readingMinutes} minute read</span>
            </div>
          </div>
        </div>
      </div>
    </header>
    ${positioningStripHtml()}
    <div class="article-shell">
      <div class="article-layout">
        <aside class="article-toc" aria-label="Article contents">
          <p>In this guide</p>
          <ol>${toc}<li><a href="#sources">Primary sources</a></li></ol>
        </aside>
        <article class="article-body">
          <div class="direct-answer"><strong>Direct answer</strong>${escapeHtml(article.directAnswer)}</div>
          ${sections}
          <section id="sources">
            <h2>Primary official sources</h2>
            <p>These sources support the platform, standards, and implementation guidance in this article. Product behavior and documentation can change, so confirm the current source before a consequential implementation.</p>
            <ul class="source-list">${sources}</ul>
          </section>
          <section>
            <h2>Continue the system</h2>
            <nav class="related-links" aria-label="Related reading">${related}</nav>
          </section>
        </article>
      </div>
    </div>
    ${closingHtml()}
  </main>
  ${footerHtml()}
</body>
</html>
`
}

const renderInsightsIndex = () => {
  const page = insightsPage
  const canonical = absoluteUrl(page.path)
  const crumbs = breadcrumbsFor(page)
  const schema = [breadcrumbSchema(crumbs)]
  const cards = articles.map((article) => {
    const route = `/insights/${article.slug}/`
    return `<article class="article-row article-card" data-reveal>
      <div class="article-row__meta"><span>${escapeHtml(article.category)}</span><time datetime="${site.published}">August 24, 2026</time></div>
      <h2><a href="${route}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(article.description)}</p>
      <a class="inline-link" href="${route}" aria-label="Read ${escapeHtml(article.title)}">Read ${arrowHtml()}</a>
    </article>`
  }).join('')

  return `<!doctype html>
<html lang="en">
<head>
  ${baseHead({ title: page.title, description: page.description, canonical, schema })}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${headerHtml(page.path)}
  <main id="main-content">
    <header class="page-hero persuade-hero insights-hero">
      <div class="hero-inner">
        ${breadcrumbHtml(crumbs)}
        <div class="hero-grid"><h1>${escapeHtml(page.h1)}</h1><div class="hero-support"><p class="hero-lede">${escapeHtml(page.lede)}</p></div></div>
      </div>
    </header>
    ${positioningStripHtml()}
    <section class="insights-intro" aria-label="All insights">
      <div class="article-grid">${cards}</div>
    </section>
    ${closingHtml()}
  </main>
  ${footerHtml()}
</body>
</html>
`
}

const sitemapXml = (routes) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc><lastmod>${site.modified}</lastmod></url>`).join('\n')}
</urlset>
`

const robotsTxt = `# Crawl policy for ${site.name}
# robots.txt is public and is not an access control system.

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: *
Allow: /

Sitemap: ${site.origin}/sitemap.xml
`

const feedXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)} Insights</title>
    <link>${site.origin}/insights/</link>
    <description>Guides to web optimization, AEO, GEO, AI search visibility, CRM integration, and governed business agents.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(`${site.modified}T12:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${site.origin}/feed.xml" rel="self" type="application/rss+xml" />
${articles.map((article) => {
  const url = `${site.origin}/insights/${article.slug}/`
  return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${site.published}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(article.description)}</description>
      <author>${escapeXml(site.email)} (Dillon Mohr)</author>
    </item>`
}).join('\n')}
  </channel>
</rss>
`

const llmsTxt = () => `# ${site.name}

This is a supplemental discovery summary for systems that choose to read it. The canonical HTML pages and XML sitemap remain the source of truth. This file does not claim special treatment or improved visibility in Google Search.

## Canonical site
${site.origin}/

## Core pages
${corePages.map((page) => `- ${page.h1}: ${absoluteUrl(page.path)}`).join('\n')}
- ${insightsPage.h1}: ${absoluteUrl(insightsPage.path)}

## Guides
${articles.map((article) => `- ${article.title}: ${site.origin}/insights/${article.slug}/`).join('\n')}

## Contact
Email: ${site.email}
`

const writeRoute = async (route, html) => {
  const outputFile = routeToFile(route)
  await mkdir(path.dirname(outputFile), { recursive: true })
  if (forbiddenDashPattern.test(html)) throw new Error(`Forbidden dash character found in ${route}`)
  await writeFile(outputFile, html, 'utf8')
}

const cleanGeneratedRoutes = async () => {
  const directories = ['about', 'web-design-optimization', 'aeo-geo', 'business-agents', 'work', 'contact', 'insights']
  await Promise.all(directories.map((directory) => rm(path.join(publicDir, directory), { recursive: true, force: true })))
}

const build = async () => {
  if (articles.length !== 10) throw new Error(`Expected 10 articles, found ${articles.length}`)
  if (corePages.length !== 6) throw new Error(`Expected 6 core pages, found ${corePages.length}`)

  const articleCounts = articles.map((article) => ({ slug: article.slug, words: articleWordCount(article) }))
  const thinArticles = articleCounts.filter((article) => article.words < 850)
  if (thinArticles.length) throw new Error(`Articles below 850 words: ${thinArticles.map((article) => `${article.slug} (${article.words})`).join(', ')}`)

  const sourceText = `${JSON.stringify(corePages)} ${JSON.stringify(articles)} ${JSON.stringify(insightsPage)}`
  if (forbiddenDashPattern.test(sourceText)) throw new Error('Forbidden em dash or en dash found in content source')

  const articleRoutes = articles.map((article) => `/insights/${article.slug}/`)
  const generatedRoutes = [...corePages.map((page) => page.path), insightsPage.path, ...articleRoutes]
  const allRoutes = ['/', ...generatedRoutes]
  if (generatedRoutes.length !== 17 || allRoutes.length !== 18) {
    throw new Error(`Expected 17 generated routes and 18 total pages, found ${generatedRoutes.length} and ${allRoutes.length}`)
  }
  if (new Set(allRoutes).size !== allRoutes.length) throw new Error('Duplicate canonical route detected')

  await mkdir(fontDir, { recursive: true })
  for (const [source, destination] of fontAssets) {
    await copyFile(path.join(projectRoot, source), path.join(fontDir, destination))
  }

  await cleanGeneratedRoutes()
  for (const page of corePages) await writeRoute(page.path, renderCorePage(page))
  await writeRoute(insightsPage.path, renderInsightsIndex())
  for (const article of articles) await writeRoute(`/insights/${article.slug}/`, renderArticle(article))

  const rootFiles = [
    ['sitemap.xml', sitemapXml(allRoutes)],
    ['robots.txt', robotsTxt],
    ['feed.xml', feedXml()],
    ['llms.txt', llmsTxt()],
  ]
  for (const [filename, contents] of rootFiles) {
    if (forbiddenDashPattern.test(contents)) throw new Error(`Forbidden dash character found in ${filename}`)
    await writeFile(path.join(publicDir, filename), contents, 'utf8')
  }

  const coreWordCounts = corePages.map((page) => ({
    route: page.path,
    words: wordCount(`${page.h1} ${page.lede} ${page.sections.map((section) => `${section.title} ${section.html === 'PROJECT_GRID' ? projectGridHtml() : section.html}`).join(' ')}`),
  }))
  const report = {
    totalPages: allRoutes.length,
    generatedStaticPages: generatedRoutes.length,
    corePages: coreWordCounts,
    articles: articleCounts,
    articleWords: articleCounts.reduce((sum, article) => sum + article.words, 0),
    discoveryFiles: rootFiles.map(([filename]) => filename),
  }
  console.log(JSON.stringify(report, null, 2))
}

await build()
