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

const browser = await chromium.launch({ headless: true })
const routeResults = []

for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: route === '/' ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`))
  const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(route === '/' ? 900 : 100)
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    articleSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].some((script) => script.textContent?.includes('"Article"')),
  }))
  const accessibility = await new AxeBuilder({ page }).analyze()
  const violations = accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length }))
  routeResults.push({ route, status: response?.status(), ...result, errors, violations })
  if (route === '/contact/') await page.screenshot({ path: path.join(outputDir, 'contact-320.png'), fullPage: true })
  await context.close()
}

const visualContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const visualPage = await visualContext.newPage()
const visualErrors = []
visualPage.on('pageerror', (error) => visualErrors.push(error.message))
visualPage.on('console', (message) => { if (message.type() === 'error') visualErrors.push(message.text()) })
await visualPage.goto(baseUrl.toString(), { waitUntil: 'domcontentloaded' })
await visualPage.locator('.client-particle-sequence__controls button:not([disabled])').first().waitFor({ state: 'visible', timeout: 30_000 })
await visualPage.waitForTimeout(700)
await visualPage.screenshot({ path: path.join(outputDir, 'brand-particles-desktop.png') })
await visualPage.locator('#agents').scrollIntoViewIfNeeded()
await visualPage.waitForTimeout(1_100)
await visualPage.locator('.agent-section').screenshot({ path: path.join(outputDir, 'robot-personalities-desktop.png') })
const robotState = await visualPage.evaluate(() => ({
  glActive: document.documentElement.classList.contains('crew-gl'),
  canvasCount: document.querySelectorAll('#crew-stage').length,
  robotSlots: document.querySelectorAll('[data-bot]').length,
  names: [...document.querySelectorAll('.agent h3')].map((node) => node.textContent?.trim()),
}))
await visualContext.close()
await browser.close()

const failures = routeResults.filter((result) => result.status !== 200 || !result.title || !result.h1 || result.scrollWidth > result.viewport || result.errors.length || result.violations.length)
const articleSchemaCount = routeResults.filter((result) => result.articleSchema).length
const report = { routes: routeResults.length, failures, articleSchemaCount, robotState, visualErrors }
await fs.writeFile(path.join(outputDir, 'qa-site-results.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))

if (failures.length || articleSchemaCount !== 10 || visualErrors.length || !robotState.glActive || robotState.canvasCount !== 1 || robotState.robotSlots !== 5) {
  process.exitCode = 1
}
