import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = new URL(process.argv[2] || 'http://127.0.0.1:4178/')
const outputDir = path.resolve('.qa')
await fs.mkdir(outputDir, { recursive: true })

const routes = [
  '/',
  '/about/',
  '/web-design-optimization/',
  '/aeo-geo/',
  '/business-agents/',
  '/work/',
  '/contact/',
  '/services/',
  '/pricing/',
  '/web-design/',
  '/technical-seo/',
  '/content-schema/',
  '/hubspot-crm-agents/',
  '/insights/',
  '/insights/aeo-vs-geo-service-businesses/',
  '/insights/google-ai-overviews-service-businesses/',
  '/insights/website-redesign-checklist-service-businesses/',
  '/insights/schema-markup-service-businesses/',
  '/insights/ai-search-crawlers-discovery-citations/',
  '/insights/javascript-seo-react-crawlable-html/',
  '/insights/hubspot-business-agents-safe-integration/',
  '/insights/measure-ai-search-visibility/',
  '/insights/entity-first-content-architecture/',
  '/insights/human-approval-gates-for-marketing-agents/',
]

const articleRoutes = new Set(routes.filter((route) => route.startsWith('/insights/') && route !== '/insights/'))
const expectedNav = ['Services', 'Pricing', 'Work', 'Guides', 'About']
const serviceAssetDir = path.resolve('public', 'pressroom', 'services')
const serviceAssets = (await fs.readdir(serviceAssetDir)).filter((file) => /\.(?:avif|jpe?g|png|webp)$/i.test(file))

const sitemapResponse = await fetch(new URL('/sitemap.xml', baseUrl))
const sitemapText = await sitemapResponse.text()
const sitemapRoutes = [...sitemapText.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || '/')

const browser = await chromium.launch({ headless: true })
const routeResults = []
const referencedPressroomAssets = new Set()

for (const route of routes) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    reducedMotion: route === '/' ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`))

  const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => { await document.fonts.ready })
  await page.waitForTimeout(route === '/' ? 650 : 120)

  const result = await page.evaluate(() => {
    const mainHeading = document.querySelector('.section-copy h2') || document.querySelector('.page-hero h1') || document.querySelector('h1') || document.body
    const articleBody = document.querySelector('.article-body')
    const articleLinks = [...(articleBody?.querySelectorAll('a[href]') || [])].map((anchor) => anchor.getAttribute('href') || '')
    const bodyText = document.body.innerText
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      h1Count: document.querySelectorAll('h1').length,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      articleSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].some((script) => script.textContent?.includes('"Article"')),
      bodyFont: getComputedStyle(document.body).fontFamily,
      displayFont: getComputedStyle(mainHeading).fontFamily,
      hasHeader: Boolean(document.querySelector('.site-rail')),
      hasClosingSection: Boolean(document.querySelector('.closing-section')),
      hasFooter: Boolean(document.querySelector('.site-footer')),
      navLabels: [...document.querySelectorAll('.site-rail nav a')].map((node) => node.textContent?.trim()),
      footerServiceLinks: document.querySelectorAll('.footer-directory[aria-label="Services"] a').length,
      footerCompanyLinks: document.querySelectorAll('.footer-directory[aria-label="Company"] a').length,
      brandLeak: /MOHR MEDIA|themohrmedia\.com/i.test(bodyText),
      internalArticleLinks: articleLinks.filter((href) => href.startsWith('/')).length,
      externalArticleLinks: articleLinks.filter((href) => /^https?:\/\//i.test(href)).length,
      pressroomSources: [...document.querySelectorAll('img[src^="/pressroom/"]')].map((image) => image.getAttribute('src')),
      noIndex: document.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase().includes('noindex') || false,
    }
  })

  result.pressroomSources.filter(Boolean).forEach((source) => referencedPressroomAssets.add(source))
  const accessibility = await new AxeBuilder({ page }).analyze()
  const violations = accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length }))
  routeResults.push({ route, status: response?.status(), ...result, errors, violations })
  if (route === '/contact/') await page.screenshot({ path: path.join(outputDir, 'contact-320.png'), fullPage: true })
  await context.close()
}

const responsiveCases = [
  { name: 'home-390', route: '/', width: 390, height: 844, reducedMotion: 'no-preference' },
  { name: 'services-430', route: '/services/', width: 430, height: 900, reducedMotion: 'no-preference' },
  { name: 'article-768-reduced', route: '/insights/entity-first-content-architecture/', width: 768, height: 900, reducedMotion: 'reduce' },
]
const responsiveResults = []

for (const testCase of responsiveCases) {
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    reducedMotion: testCase.reducedMotion,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(new URL(testCase.route, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => { await document.fonts.ready })

  const particleStateBeforeScroll = await page.locator('[data-particle-footer]').count()
    ? await page.locator('[data-particle-footer]').first().getAttribute('data-particle-state')
    : null
  const toggle = page.locator('[data-menu-toggle], .menu-button').first()
  await toggle.click()
  const menuOpened = await toggle.getAttribute('aria-expanded') === 'true'
  await page.keyboard.press('Escape')
  const menuClosed = await toggle.getAttribute('aria-expanded') === 'false'
  const focusReturned = await toggle.evaluate((node) => node === document.activeElement)

  await page.keyboard.press('Tab')
  const visibleFocus = await page.evaluate(() => {
    const active = document.activeElement
    if (!(active instanceof HTMLElement)) return false
    const style = getComputedStyle(active)
    return style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) >= 2
  })

  await page.evaluate(async () => {
    const step = Math.max(420, Math.round(window.innerHeight * .72))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 24))
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await page.waitForTimeout(testCase.reducedMotion === 'reduce' ? 80 : 1_150)
  if (testCase.route !== '/' && testCase.reducedMotion !== 'reduce') {
    await page.waitForFunction(() => ['complete', 'fallback'].includes(document.querySelector('[data-particle-footer]')?.getAttribute('data-particle-state') || ''), null, { timeout: 5_000 })
  }

  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    swipeWords: document.querySelectorAll('[data-swipe-heading] .swipe-word').length,
    imageChapters: document.querySelectorAll('.pressroom-figure').length,
    footerParticleState: document.querySelector('[data-particle-footer]')?.getAttribute('data-particle-state') || null,
    retiredSection: Number.parseFloat(getComputedStyle(document.querySelector('.content-section') || document.body).getPropertyValue('--retire')) || 0,
    serviceSequence: document.querySelectorAll('.service-particle-sequence').length,
  }))
  await page.screenshot({ path: path.join(outputDir, `${testCase.name}.png`), fullPage: true })
  responsiveResults.push({ ...testCase, particleStateBeforeScroll, menuOpened, menuClosed, focusReturned, visibleFocus, errors, ...metrics })
  await context.close()
}

const visualContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const visualPage = await visualContext.newPage()
const visualErrors = []
visualPage.on('pageerror', (error) => visualErrors.push(error.message))
visualPage.on('console', (message) => { if (message.type() === 'error') visualErrors.push(message.text()) })
await visualPage.goto(baseUrl.toString(), { waitUntil: 'domcontentloaded' })
await visualPage.locator('.client-particle-sequence__controls button:not([disabled])').first().waitFor({ state: 'visible', timeout: 30_000 })
await visualPage.waitForTimeout(500)
await visualPage.screenshot({ path: path.join(outputDir, 'brand-particles-desktop.png') })
await visualPage.locator('.service-signal-section').scrollIntoViewIfNeeded()
await visualPage.locator('.service-particle-sequence').waitFor({ state: 'visible', timeout: 15_000 })
await visualPage.locator('#agents').scrollIntoViewIfNeeded()
await visualPage.waitForTimeout(1_100)
await visualPage.locator('.agent-section').screenshot({ path: path.join(outputDir, 'robot-personalities-desktop.png') })
const robotState = await visualPage.evaluate(() => ({
  glActive: document.documentElement.classList.contains('crew-gl'),
  canvasCount: document.querySelectorAll('#crew-stage').length,
  robotSlots: document.querySelectorAll('[data-bot]').length,
  names: [...document.querySelectorAll('.agent h3')].map((node) => node.textContent?.trim()),
  serviceCanvasCount: document.querySelectorAll('.service-particle-sequence canvas').length,
  jsTransferBytes: performance.getEntriesByType('resource')
    .filter((entry) => entry.name.includes('/assets/') && entry.name.endsWith('.js'))
    .reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
}))
await visualContext.close()
await browser.close()

const noGlBrowser = await chromium.launch({ headless: true, args: ['--disable-webgl', '--disable-gpu'] })
const noGlContext = await noGlBrowser.newContext({ viewport: { width: 390, height: 844 } })
const noGlPage = await noGlContext.newPage()
await noGlPage.goto(baseUrl.toString(), { waitUntil: 'domcontentloaded' })
await noGlPage.waitForTimeout(400)
const noWebGlFallback = await noGlPage.locator('.client-particle-sequence--reduced').count() > 0
await noGlContext.close()
await noGlBrowser.close()

const missingPressroomAssets = []
for (const source of referencedPressroomAssets) {
  try {
    await fs.access(path.resolve('public', source.replace(/^\/+/, '')))
  } catch {
    missingPressroomAssets.push(source)
  }
}

const failures = routeResults.filter((result) => {
  const isArticle = articleRoutes.has(result.route)
  const wrongFonts = !result.bodyFont.includes('Manrope Variable') || !result.displayFont.includes('Unbounded Variable')
  const wrongNavigation = JSON.stringify(result.navLabels) !== JSON.stringify(expectedNav)
  return result.status !== 200
    || !result.title
    || !result.description
    || !result.h1
    || result.h1Count !== 1
    || !result.canonical
    || result.scrollWidth > result.viewport
    || result.errors.length
    || result.violations.length
    || !result.hasHeader
    || !result.hasClosingSection
    || !result.hasFooter
    || wrongFonts
    || wrongNavigation
    || result.footerServiceLinks !== 7
    || result.footerCompanyLinks !== 5
    || result.brandLeak
    || result.noIndex
    || (isArticle && (!result.articleSchema || result.internalArticleLinks < 3 || result.externalArticleLinks < 1))
})

const responsiveFailures = responsiveResults.filter((result) => {
  const reducedMismatch = result.reducedMotion === 'reduce'
    ? result.swipeWords !== 0 || result.footerParticleState !== 'static'
    : result.route !== '/' && (result.swipeWords === 0 || !['complete', 'fallback'].includes(result.footerParticleState))
  return result.scrollWidth > result.viewport
    || result.errors.length
    || !result.menuOpened
    || !result.menuClosed
    || !result.focusReturned
    || !result.visibleFocus
    || (result.route !== '/' && result.imageChapters === 0)
    || reducedMismatch
})

const articleSchemaCount = routeResults.filter((result) => result.articleSchema).length
const sitemapMismatch = sitemapResponse.status !== 200
  || JSON.stringify(sitemapRoutes) !== JSON.stringify(routes)
const report = {
  routes: routeResults.length,
  failures,
  articleSchemaCount,
  sitemap: { status: sitemapResponse.status, routes: sitemapRoutes.length, mismatch: sitemapMismatch },
  serviceAssets: serviceAssets.length,
  missingPressroomAssets,
  responsiveResults,
  responsiveFailures,
  robotState,
  noWebGlFallback,
  visualErrors,
}
await fs.writeFile(path.join(outputDir, 'qa-site-results.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))

if (
  failures.length
  || routes.length !== 24
  || articleSchemaCount !== 10
  || sitemapMismatch
  || serviceAssets.length !== 24
  || missingPressroomAssets.length
  || responsiveFailures.length
  || visualErrors.length
  || !robotState.glActive
  || robotState.canvasCount !== 1
  || robotState.robotSlots !== 5
  || robotState.serviceCanvasCount !== 1
  || !noWebGlFallback
) {
  process.exitCode = 1
}
