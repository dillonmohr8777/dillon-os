import { existsSync } from 'node:fs'
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { articles } from '../content/articles.mjs'
import { allPressroomAssets, pressroom } from '../content/pressroom-assets.mjs'
import { corePages, insightsPage, navigation, projects, serviceDirectory, site } from '../content/site-content.mjs'

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
const localAssetPath = (src) => path.join(publicDir, String(src).replace(/^\/+/, ''))
const assetExists = (src) => Boolean(src && existsSync(localAssetPath(src)))

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

const responsiveSource = (src, width) => src.replace(/\.webp$/u, `-${width}.webp`)

const fallbackMediaByAgent = {
  scout: pressroom.services.technicalSeo[0],
  atlas: pressroom.services.aeoGeo[1],
  forge: pressroom.services.webDesign[0],
  relay: pressroom.services.hubspotCrm[0],
  proof: pressroom.services.technicalSeo[2],
  crew: pressroom.services.businessAgents[0],
}

const resolveMedia = (media) => {
  if (!media || assetExists(media.src)) return media
  return fallbackMediaByAgent[media.agent] || pressroom.home[0]
}

const allPressroomFallbacks = () => allPressroomAssets
  .filter((media) => !assetExists(media.src))
  .map((media) => ({ requested: media.src, rendered: resolveMedia(media)?.src }))

const responsiveImageAttributes = (media) => {
  const resolved = resolveMedia(media)
  if (!resolved) return ''
  const candidates = [640, 1024]
    .map((width) => [responsiveSource(resolved.src, width), width])
    .filter(([src]) => assetExists(src))
  if (!candidates.length) return ''
  const srcset = [...candidates.map(([src, width]) => `${src} ${width}w`), `${resolved.src} ${resolved.width}w`]
  return ` srcset="${srcset.join(', ')}" sizes="(max-width: 760px) 100vw, (max-width: 1180px) 88vw, 1240px"`
}

const platformNames = {
  google: 'Google',
  hubspot: 'HubSpot',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
}

const platformProvenanceHtml = (brands = []) => brands.length
  ? `<span class="platform-provenance">Platforms shown: ${brands.map((brand) => {
      const name = platformNames[brand]
      if (!name) throw new Error(`Unknown pressroom brand: ${brand}`)
      return name
    }).join(', ')}</span>`
  : ''

const imageHtml = (media, className = 'pressroom-figure', priority = false) => {
  const resolved = resolveMedia(media)
  return resolved
  ? `<figure class="${className}" data-image-reveal data-reveal>
      <div class="pressroom-image">
        <img src="${resolved.src}"${responsiveImageAttributes(resolved)} width="${resolved.width}" height="${resolved.height}" alt="${escapeHtml(resolved.alt)}" ${priority ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">
      </div>
      <figcaption>${escapeHtml(resolved.caption)}${platformProvenanceHtml(resolved.brands)}</figcaption>
    </figure>`
  : ''
}

const particleMarkHtml = () => `<div class="particle-footer-mark" data-particle-footer data-logo-src="${site.logo}" role="img" aria-label="IMMOHRTAL logo assembled from particles">
  <canvas aria-hidden="true"></canvas>
  <img class="particle-footer-fallback brand-logo--white" src="${site.logo}" width="600" height="160" alt="">
</div>`

const closingHtml = () => `<section class="closing-section" data-reveal>
  ${particleMarkHtml()}
  <h2>Your website should make it easier for the right customer to say yes.</h2>
  <p>Show me what feels broken. I’ll help you find the right first move.</p>
  <a class="closing-cta" href="/contact/">Show me what to fix ${arrowHtml()}</a>
</section>`

const footerHtml = () => `<footer class="site-footer">
  <div class="footer-intro">
    <a class="wordmark footer-wordmark" href="/" aria-label="IMMOHRTAL Marketing Solutions home">
      <img class="brand-logo--white" src="${site.logo}" width="600" height="160" alt="">
      <span><strong>IMMOHRTAL</strong><small>MARKETING SOLUTIONS</small></span>
    </a>
    <p>Websites that stand out, get found, and hand less busywork to your team. Built by Dillon Mohr.</p>
  </div>
  <nav class="footer-directory" aria-label="Services">${serviceDirectory.map((service) => `<a href="${service.href}">${escapeHtml(service.title)}</a>`).join('')}</nav>
  <nav class="footer-directory footer-directory--company" aria-label="Company">
    <a href="/work/">Work</a><a href="/insights/">Guides</a><a href="/about/">About</a><a href="/contact/">Contact</a>
  </nav>
  <a class="footer-action" href="/contact/">Fix my website ${arrowHtml()}</a>
  <p class="trademark-note">Google, HubSpot, ChatGPT, Claude, and Perplexity are trademarks of their respective owners. Their appearance identifies platforms discussed in the work and does not imply endorsement.</p>
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
  : page.pageKind === 'service'
    ? [
        ['Home', '/'],
        ['Services', '/services/'],
        [page.h1, page.path],
      ]
  : [
      ['Home', '/'],
      [page.h1, page.path],
    ]

const breadcrumbHtml = (crumbs) => `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([label, href], index) => `<li>${index === crumbs.length - 1 ? `<span aria-current="page">${escapeHtml(label)}</span>` : `<a href="${href}">${escapeHtml(label)}</a>`}</li>`).join('')}</ol></nav>`

const breadcrumbSchema = (crumbs, canonical) => ({
  '@type': 'BreadcrumbList',
  '@id': `${canonical}#breadcrumb`,
  itemListElement: crumbs.map(([name, route], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: absoluteUrl(route),
  })),
})

const baseHead = ({ title, description, canonical, image = site.logo, imageAlt = `${site.name} website`, type = 'website', schema = [] }) => {
  const schemaGraph = Array.isArray(schema) ? schema : [schema]
  const resolvedSocialMedia = typeof image === 'string' ? undefined : resolveMedia(image)
  const socialImage = typeof image === 'string' ? image : resolvedSocialMedia?.src || site.logo
  const socialImageAlt = resolvedSocialMedia?.alt || imageAlt
  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#020711">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Dillon Mohr">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="application/rss+xml" title="IMMOHRTAL Insights" href="${site.origin}/feed.xml">
  <link rel="icon" type="image/png" href="${site.logo}">
  <meta property="og:type" content="${type}">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absoluteUrl(socialImage)}">
  <meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absoluteUrl(socialImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}">
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

const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': `${site.origin}/#website`,
  url: `${site.origin}/`,
  name: site.name,
  alternateName: site.shortName,
  publisher: { '@id': `${site.origin}/#organization` },
  inLanguage: 'en-US',
})

const personSchema = () => ({
  '@type': 'Person',
  '@id': `${site.origin}/about/#dillon-mohr`,
  name: 'Dillon Mohr',
  url: `${site.origin}/about/`,
  image: absoluteUrl(site.portrait),
  jobTitle: 'Founder and website strategist',
  worksFor: { '@id': `${site.origin}/#organization` },
})

const webPageSchema = ({ canonical, title, description, crumbs, type = 'WebPage', image, mainEntity }) => {
  const schema = {
    '@type': type,
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': `${site.origin}/#website` },
    about: { '@id': `${site.origin}/#organization` },
    breadcrumb: { '@id': `${canonical}#breadcrumb` },
    inLanguage: 'en-US',
    dateModified: site.modified,
  }
  const resolvedImage = resolveMedia(image)
  if (resolvedImage) schema.primaryImageOfPage = { '@type': 'ImageObject', url: absoluteUrl(resolvedImage.src) }
  if (mainEntity) schema.mainEntity = { '@id': mainEntity }
  return schema
}

const serviceSchema = (page, canonical) => {
  const directoryEntry = serviceDirectory.find((service) => service.href === page.path)
  return {
    '@type': 'Service',
    '@id': `${canonical}#service`,
    name: directoryEntry?.title || page.h1,
    serviceType: directoryEntry?.title || page.h1,
    description: page.description,
    url: canonical,
    provider: { '@id': `${site.origin}/#organization` },
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
  }
}

const faqSchema = (faqs, canonical) => ({
  '@type': 'FAQPage',
  '@id': `${canonical}#faq`,
  url: `${canonical}#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

const profileSchema = () => ({
  '@type': 'ProfilePage',
  '@id': `${site.origin}/about/#profile`,
  url: `${site.origin}/about/`,
  name: 'Dillon Mohr, founder of IMMOHRTAL Marketing Solutions',
  mainEntity: { '@id': `${site.origin}/about/#dillon-mohr` },
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

const serviceDirectoryHtml = () => `<div class="service-directory">${serviceDirectory.map((service, index) => `<a class="service-row" href="${service.href}" data-reveal>
  <span class="service-row__index">${String(index + 1).padStart(2, '0')}</span>
  <span class="service-row__title"><strong>${escapeHtml(service.plainTitle)}</strong><small>${escapeHtml(service.title)}</small></span>
  <span class="service-row__summary">${escapeHtml(service.summary)}</span>
  <span class="service-row__agent">${escapeHtml(service.agent)}</span>
  ${arrowHtml()}
</a>`).join('')}</div>`

const routeLabel = (route) => {
  const service = serviceDirectory.find((item) => item.href === route)
  if (service) return { title: service.title, description: service.plainTitle }
  if (route === '/work/') return { title: 'Selected work', description: 'Inspect the public website experiences behind the system.' }
  if (route === '/contact/') return { title: 'Start a conversation', description: 'Show me the live page or repeated task that needs attention.' }
  if (route === '/services/') return { title: 'All services', description: 'Choose the problem before the service label.' }
  return { title: route.replaceAll('/', ' ').trim(), description: 'Continue through the IMMOHRTAL system.' }
}

const relatedSystemHtml = (page) => {
  const routes = [...new Set([...(page.relatedServices || []), '/work/', '/contact/'])]
  if (!routes.length && !page.relatedGuides?.length) return ''
  return `<section class="system-links" aria-labelledby="system-links-heading">
    <div class="system-links__inner">
      <header><h2 id="system-links-heading">Keep moving through the system.</h2><p>Every useful next step is linked in the page, not hidden behind a search box.</p></header>
      <div class="system-links__rows">${routes.map((route) => {
        const label = routeLabel(route)
        return `<a href="${route}"><span><strong>${escapeHtml(label.title)}</strong><small>${escapeHtml(label.description)}</small></span>${arrowHtml()}</a>`
      }).join('')}</div>
      ${page.relatedGuides?.length ? `<nav class="system-links__guides" aria-label="Related guides"><strong>Related guides</strong>${page.relatedGuides.map((route) => {
        const article = articles.find((item) => `/insights/${item.slug}/` === route)
        return `<a href="${route}">${escapeHtml(article?.title || route)}</a>`
      }).join('')}</nav>` : ''}
    </div>
  </section>`
}

const renderSection = (section, index, page) => {
  const tone = section.tone ? ` tone-${section.tone}` : ''
  const body = section.html === 'PROJECT_GRID'
    ? projectGridHtml()
    : section.html === 'SERVICE_DIRECTORY'
      ? serviceDirectoryHtml()
      : section.html
  const media = page.media?.[index + 1]
  const direction = index % 2 ? ' story-layout--reverse' : ''
  return `<section class="content-section${tone}">
    <div class="section-inner">
      <header class="section-heading" data-reveal>
        <h2 data-swipe-heading data-reveal>${escapeHtml(section.title)}</h2>
      </header>
      <div class="section-story${media ? direction : ''}">
        <div class="prose" data-reveal>${body}</div>
        ${imageHtml(media, 'pressroom-figure section-media')}
      </div>
    </div>
  </section>`
}

const renderCorePage = (page) => {
  const canonical = absoluteUrl(page.path)
  const crumbs = breadcrumbsFor(page)
  const schema = [
    organizationSchema(),
    websiteSchema(),
    breadcrumbSchema(crumbs, canonical),
    webPageSchema({
      canonical,
      title: page.title,
      description: page.description,
      crumbs,
      type: page.pageKind === 'services-hub' || page.path === '/work/' ? ['WebPage', 'CollectionPage'] : 'WebPage',
      image: page.media?.[0],
    }),
  ]
  if (page.pageKind === 'service') schema.push(serviceSchema(page, canonical))
  if (page.schema === 'profile') schema.push(profileSchema(), personSchema())
  if (page.faqs?.length) schema.push(faqSchema(page.faqs, canonical))

  return `<!doctype html>
<html lang="en">
<head>
  ${baseHead({ title: page.title, description: page.description, canonical, image: page.media?.[0], imageAlt: page.media?.[0]?.alt || page.h1, schema })}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${headerHtml(page.path)}
  <main id="main-content">
    <header class="page-hero persuade-hero">
      <div class="hero-inner">
        ${breadcrumbHtml(crumbs)}
        <div class="hero-grid">
          <h1 data-swipe-heading data-reveal>${escapeHtml(page.h1)}</h1>
          <div class="hero-support"><p class="hero-lede">${escapeHtml(page.lede)}</p>${renderActions(page.actions)}</div>
          ${imageHtml(page.media?.[0], 'pressroom-figure hero-media', true)}
        </div>
      </div>
    </header>
    ${positioningStripHtml()}
    ${page.sections.map((section, index) => renderSection(section, index, page)).join('\n')}
    ${page.faqs?.length ? `<section class="content-section tone-paper" id="faq"><div class="section-inner"><header class="section-heading"><h2>Frequently asked questions</h2></header><div class="prose faq-list">${page.faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div></div></section>` : ''}
    ${relatedSystemHtml(page)}
    ${closingHtml()}
  </main>
  ${footerHtml()}
</body>
</html>
`
}

const articleWordCount = (article) => wordCount(`${article.directAnswer} ${article.sections.map((section) => `${section.title} ${section.html}`).join(' ')} ${(article.faqs || []).map((faq) => `${faq.question} ${faq.answer}`).join(' ')}`)

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
  image: {
    '@type': 'ImageObject',
    url: absoluteUrl(resolveMedia(pressroom.guides[article.slug])?.src || site.logo),
  },
  wordCount: articleWordCount(article),
  articleSection: article.category,
  keywords: (article.keywords || []).join(', '),
  about: (article.keywords || []).map((keyword) => ({ '@type': 'Thing', name: keyword })),
  citation: article.sources.map((source) => source.url),
  isAccessibleForFree: true,
  isPartOf: { '@id': `${site.origin}/#website` },
  inLanguage: 'en-US',
})

const renderArticle = (article) => {
  const route = `/insights/${article.slug}/`
  const canonical = absoluteUrl(route)
  const crumbs = breadcrumbsFor(article, true)
  const count = articleWordCount(article)
  const readingMinutes = Math.max(1, Math.ceil(count / 210))
  const cover = resolveMedia(pressroom.guides[article.slug])
  const schema = [
    organizationSchema(),
    websiteSchema(),
    personSchema(),
    breadcrumbSchema(crumbs, canonical),
    webPageSchema({ canonical, title: article.title, description: article.description, crumbs, type: 'WebPage', image: cover, mainEntity: `${canonical}#article` }),
    articleSchema(article, canonical),
  ]
  if (article.faqs?.length) schema.push(faqSchema(article.faqs, canonical))

  const toc = article.sections.map((section) => `<li><a href="#${section.id}">${escapeHtml(section.title)}</a></li>`).join('')
  const sections = article.sections.map((section) => `<section id="${section.id}">
    <h2>${escapeHtml(section.title)}</h2>
    ${section.html}
  </section>`).join('\n')
  const sources = article.sources.map((source) => `<li><a href="${source.url}" rel="cite external">${escapeHtml(source.title)}</a> <span>(${escapeHtml(source.organization)})</span><small>${escapeHtml(source.note)}</small></li>`).join('')
  const related = article.related.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join('')
  const faqHtml = article.faqs?.length
    ? `<section id="faq"><h2>Frequently asked questions</h2><div class="faq-list">${article.faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div></section>`
    : ''

  return `<!doctype html>
<html lang="en">
<head>
  ${baseHead({ title: `${article.title} | IMMOHRTAL`, description: article.description, canonical, image: cover, imageAlt: cover?.alt || article.title, type: 'article', schema })}
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
          <h1 data-swipe-heading data-reveal>${escapeHtml(article.title)}</h1>
          <div class="hero-support">
            <p class="hero-lede">${escapeHtml(article.description)}</p>
            <div class="hero-meta">
              <span>By <a href="/about/"><strong>Dillon Mohr</strong></a></span>
              <span><time datetime="${site.modified}">August 25, 2026</time></span>
              <span>${readingMinutes} minute read</span>
            </div>
          </div>
          ${imageHtml(cover, 'pressroom-figure hero-media article-cover', true)}
        </div>
      </div>
    </header>
    ${positioningStripHtml()}
    <div class="article-shell">
      <div class="article-layout">
        <aside class="article-toc" aria-label="Article contents">
          <p>In this guide</p>
          <ol>${toc}${article.faqs?.length ? '<li><a href="#faq">Frequently asked questions</a></li>' : ''}<li><a href="#sources">Academic sources</a></li></ol>
        </aside>
        <article class="article-body">
          <div class="direct-answer"><strong>Direct answer</strong>${escapeHtml(article.directAnswer)}</div>
          ${sections}
          ${faqHtml}
          <section id="sources">
            <h2>Academic sources</h2>
            <p>These peer reviewed papers, conference proceedings, and scholarly preprints support the research and implementation guidance in this article. Each link points to the publication or an academic repository.</p>
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
  const schema = [
    organizationSchema(),
    websiteSchema(),
    breadcrumbSchema(crumbs, canonical),
    webPageSchema({ canonical, title: page.title, description: page.description, crumbs, type: ['WebPage', 'CollectionPage'] }),
  ]
  const cards = articles.map((article) => {
    const route = `/insights/${article.slug}/`
    const cover = resolveMedia(pressroom.guides[article.slug])
    return `<article class="article-row article-card" data-reveal>
      <a class="article-row__image" href="${route}" tabindex="-1" aria-hidden="true"><img src="${cover.src}"${responsiveImageAttributes(cover)} width="${cover.width}" height="${cover.height}" alt="" loading="lazy" decoding="async"></a>
      <div class="article-row__meta"><span>${escapeHtml(article.category)}</span><time datetime="${site.modified}">August 25, 2026</time></div>
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
        <div class="hero-grid"><h1 data-swipe-heading data-reveal>${escapeHtml(page.h1)}</h1><div class="hero-support"><p class="hero-lede">${escapeHtml(page.lede)}</p></div></div>
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

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: *
Allow: /

Sitemap: ${site.origin}/sitemap.xml
`

const feedXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
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
      <dc:creator>Dillon Mohr</dc:creator>
      <category>${escapeXml(article.category)}</category>
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

## Discovery files
- XML sitemap: ${site.origin}/sitemap.xml
- RSS feed: ${site.origin}/feed.xml
- Crawl policy: ${site.origin}/robots.txt
`

const writeRoute = async (route, html) => {
  const outputFile = routeToFile(route)
  await mkdir(path.dirname(outputFile), { recursive: true })
  const normalizedHtml = html.replace(/[ \t]+$/gm, '')
  if (forbiddenDashPattern.test(normalizedHtml)) throw new Error(`Forbidden dash character found in ${route}`)
  await writeFile(outputFile, normalizedHtml, 'utf8')
}

const cleanGeneratedRoutes = async () => {
  const directories = [...new Set([...corePages.map((page) => page.path), insightsPage.path]
    .map((route) => route.replace(/^\/+|\/+$/g, '').split('/')[0])
    .filter(Boolean))]
  await Promise.all(directories.map((directory) => rm(path.join(publicDir, directory), { recursive: true, force: true })))
}

const build = async () => {
  if (articles.length !== 10) throw new Error(`Expected 10 articles, found ${articles.length}`)
  if (corePages.length !== 11) throw new Error(`Expected 11 core pages, found ${corePages.length}`)

  const malformedArticles = articles.filter((article) => !article.title || !article.description || !article.directAnswer || !article.sources?.length || !article.related?.length)
  if (malformedArticles.length) throw new Error(`Articles missing required content fields: ${malformedArticles.map((article) => article.slug).join(', ')}`)
  const malformedFaqs = articles.filter((article) => article.faqs?.some((faq) => !faq.question?.trim() || !faq.answer?.trim()))
  if (malformedFaqs.length) throw new Error(`Articles contain incomplete FAQs: ${malformedFaqs.map((article) => article.slug).join(', ')}`)

  const articleCounts = articles.map((article) => ({ slug: article.slug, words: articleWordCount(article) }))
  const thinArticles = articleCounts.filter((article) => article.words < 850)
  if (thinArticles.length) throw new Error(`Articles below 850 words: ${thinArticles.map((article) => `${article.slug} (${article.words})`).join(', ')}`)

  const sourceText = `${JSON.stringify(corePages)} ${JSON.stringify(articles)} ${JSON.stringify(insightsPage)}`
  if (forbiddenDashPattern.test(sourceText)) throw new Error('Forbidden em dash or en dash found in content source')

  const articleRoutes = articles.map((article) => `/insights/${article.slug}/`)
  const generatedRoutes = [...corePages.map((page) => page.path), insightsPage.path, ...articleRoutes]
  const allRoutes = ['/', ...generatedRoutes]
  if (generatedRoutes.length !== 22 || allRoutes.length !== 23) {
    throw new Error(`Expected 22 generated routes and 23 total pages, found ${generatedRoutes.length} and ${allRoutes.length}`)
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
    mediaFallbacks: allPressroomFallbacks(),
    discoveryFiles: rootFiles.map(([filename]) => filename),
  }
  console.log(JSON.stringify(report, null, 2))
}

await build()
